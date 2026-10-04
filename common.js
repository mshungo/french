/* 共通部品：学生IDログイン／結果送信／連続日数。index.html と各教材ページが読み込む。 */
(function () {
  "use strict";
  var CFG = window.QUIZ_CONFIG || {};
  var SYNC_ON = !!CFG.SCRIPT_URL;
  var LOGIN_KEY = "conjQuizLogin";
  var RE_ID = /^[A-Z0-9]{6}$/;
  var APPS = ["conj", "grammar", "talk"];
  var user = null;
  var flushing = false;
  var listeners = [];

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function jget(k, d) { try { var v = JSON.parse(lsGet(k)); return v == null ? d : v; } catch (e) { return d; } }

  try {
    var c = JSON.parse(lsGet(LOGIN_KEY));
    if (c && RE_ID.test(c.id)) user = { id: c.id, name: c.name || c.id };
  } catch (e) {}

  function who() { return user ? user.id : "guest"; }

  /* ---- 日付・連続日数（日本時間） ---- */
  function todayJST() { return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }); }
  function addDays(str, k) {
    var t = new Date(str + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() + k);
    return t.toISOString().slice(0, 10);
  }
  function days() { return jget("conjQuizDays_" + who(), []); }
  function mergeDays(list) {
    var set = {}; days().concat(list || []).forEach(function (d) { set[d] = 1; });
    var out = Object.keys(set).sort().slice(-400);
    lsSet("conjQuizDays_" + who(), JSON.stringify(out));
    return out;
  }
  function markToday() { return mergeDays([todayJST()]); }
  function streak() {
    var set = {}; days().forEach(function (d) { set[d] = 1; });
    var cur = todayJST(), doneToday = !!set[cur];
    if (!doneToday) cur = addDays(cur, -1);
    var n = 0; while (set[cur]) { n++; cur = addDays(cur, -1); }
    return { n: n, doneToday: doneToday };
  }

  /* ---- サーバー記録のキャッシュ ---- */
  function cached() { return user ? jget("conjQuizServer_" + user.id, null) : null; }
  function setCached(stats) {
    if (!user || !stats) return;
    lsSet("conjQuizServer_" + user.id, JSON.stringify(stats));
    mergeDays(stats.days);
    listeners.forEach(function (f) { try { f(stats); } catch (e) {} });
  }
  function onStats(f) { listeners.push(f); }

  /* ---- 未送信キュー（端末に保管。通信できなくても失われない） ---- */
  function pendKey() { return "conjQuizPending_" + who(); }
  function getPending() { return jget(pendKey(), []); }
  function setPending(q) { lsSet(pendKey(), JSON.stringify(q)); }
  function newRid() {
    var a = new Uint8Array(12); (window.crypto || window.msCrypto).getRandomValues(a);
    return Array.prototype.map.call(a, function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
  }

  /* ---- サーバー呼び出し ---- */
  function call(id, action, extra) {
    var ctl = new AbortController(); var tm = setTimeout(function () { ctl.abort(); }, 20000);
    var body = { action: action, id: id }; for (var k in (extra || {})) body[k] = extra[k];
    return fetch(CFG.SCRIPT_URL, { method: "POST", signal: ctl.signal, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); })
      .then(function (j) { clearTimeout(tm); return j; }, function (e) { clearTimeout(tm); throw e; });
  }

  /* 未送信を順に送る。戻り値: "ok" | "auth" | "error" | "skip" */
  async function flush() {
    if (!SYNC_ON || !user || flushing) return "skip";
    flushing = true; var status = "ok";
    try {
      var q = getPending();
      while (q.length) {
        var res = await call(user.id, "submit", { result: q[0] });
        if (res.ok) { q.shift(); setPending(q); if (!q.length) setCached(res.stats); }
        else if (res.error === "auth" || res.error === "locked") { status = "auth"; break; }
        else if (res.error === "bad_request") { q.shift(); setPending(q); }
        else { status = "error"; break; }
      }
    } catch (e) { status = "error"; }
    flushing = false; return status;
  }

  function submit(app, result) {
    if (!SYNC_ON || !user) return Promise.resolve("noauth");
    result.app = app; result.rid = newRid();
    var q = getPending(); q.push(result); setPending(q);
    return flush();
  }

  /* 開いたときの再同期。戻り値: "ok" | "auth" | "error" | "skip" */
  async function refresh() {
    if (!SYNC_ON || !user) return "skip";
    if (getPending().length) return flush();
    try {
      var res = await call(user.id, "sync");
      if (res.ok) { setCached(res.stats); return "ok"; }
      if (res.error === "auth") return "auth";
      return "error";
    } catch (e) { return "error"; }
  }

  /* ---- ログイン／ログアウト ---- */
  async function login(raw) {
    var id = String(raw || "").trim().toUpperCase();
    if (!RE_ID.test(id)) return { ok: false, error: "format" };
    var res;
    try { res = await call(id, "sync"); } catch (e) { return { ok: false, error: "network" }; }
    if (!res.ok) return { ok: false, error: res.error === "locked" ? "locked" : (res.error === "auth" ? "auth" : "server"), detail: res.error };
    if (!res.stats || !res.stats.apps) return { ok: false, error: "server", detail: "old_version" };
    user = { id: id, name: (res.user && res.user.name) || id };
    lsSet(LOGIN_KEY, JSON.stringify(user));
    setCached(res.stats);
    if (getPending().length) await flush();
    return { ok: true, user: user };
  }
  function logout() { user = null; lsDel(LOGIN_KEY); }

  /* 教材ページの入口：ログインが必要な設定で未ログインなら、メニューへ戻す */
  function requireLogin() {
    if (SYNC_ON && !user) { location.replace("index.html"); return false; }
    return true;
  }

  window.Quiz = {
    SYNC_ON: SYNC_ON, APPS: APPS,
    user: function () { return user; },
    todayJST: todayJST, days: days, markToday: markToday, streak: streak,
    cached: cached, onStats: onStats,
    pendingCount: function () { return getPending().length; },
    submit: submit, flush: flush, refresh: refresh,
    login: login, logout: logout, requireLogin: requireLogin
  };
})();
