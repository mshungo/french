/* 共通部品：学生ID＋パスワードでログイン／結果送信／連続日数。index.html と各教材ページが読み込む。 */
(function () {
  "use strict";
  var CFG = window.QUIZ_CONFIG || {};
  var SYNC_ON = !!CFG.SCRIPT_URL;
  var LOGIN_KEY = "conjQuizLogin";
  var RE_ID = /^[A-Z0-9_-]{3,20}$/;
  function normId(s) { return String(s == null ? "" : s).normalize("NFKC").replace(/\s+/g, "").toUpperCase(); }
  function normPw(s) { return String(s == null ? "" : s).normalize("NFKC").replace(/\s+/g, "").toLowerCase(); }
  /* 練習用ID：サーバーには送らず、端末にも残さない（ID・パスワードはログイン画面に書いてあるもの）。
     各教材が localStorage に書く「…_NARAF26」の記録は、すべて sessionStorage（そのタブだけ・閉じると消える）に回す。
     ログインし直すたび、ログアウトするたびにも消す。 */
  /* パスワードは授業で口頭で伝えるので、ここには書かずハッシュ値（SHA-256）だけを置く */
  var PRACTICE = { id: "NARAF26", pwHash: "b89dd8c6b09a3846760cae7d53a579c8975ee62620421bc18317830cda64c44f", name: "練習用" };
  async function sha256(s) {
    var b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return Array.prototype.map.call(new Uint8Array(b), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
  }
  var PRAC_RE = /_NARAF26$/;
  (function () {
    try {
      var P = Storage.prototype, g = P.getItem, s = P.setItem, r = P.removeItem;
      var L = window.localStorage, S = window.sessionStorage;
      var to = function (st, k) { return (st === L && PRAC_RE.test(String(k))) ? S : st; };
      P.getItem = function (k) { return g.call(to(this, k), k); };
      P.setItem = function (k, v) { return s.call(to(this, k), k, v); };
      P.removeItem = function (k) { return r.call(to(this, k), k); };
      for (var i = L.length - 1; i >= 0; i--) { var k = L.key(i); if (PRAC_RE.test(k)) r.call(L, k); }   // 以前の版で端末に残った分
    } catch (e) {}
  })();
  function clearPractice() {
    try {
      var S = window.sessionStorage;
      for (var i = S.length - 1; i >= 0; i--) { var k = S.key(i); if (PRAC_RE.test(k)) S.removeItem(k); }
    } catch (e) {}
  }
  var APPS = ["conj", "grammar", "talk"];
  var user = null;
  var flushing = false;
  var listeners = [];

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function jget(k, d) { try { var v = JSON.parse(lsGet(k)); return v == null ? d : v; } catch (e) { return d; } }

  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function ssDel(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  /* ログイン情報：「この端末に記憶」なら localStorage、そうでなければ sessionStorage（ブラウザを閉じると消える） */
  try {
    var c = JSON.parse(lsGet(LOGIN_KEY) || ssGet(LOGIN_KEY));
    if (c && RE_ID.test(c.id) && (c.practice ? c.id === PRACTICE.id : (c.pw || !SYNC_ON)))   // パスワードのない古いログイン情報は無効
      user = { id: c.id, name: c.name || c.id, pw: c.pw || "", practice: !!c.practice };
  } catch (e) {}

  function who() { return user ? user.id : "guest"; }
  function online() { return SYNC_ON && !!user && !user.practice; }   // サーバーとやりとりするか

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
  // 旧版サーバー（教材別でない集計）の応答も受け付ける
  function fixStats(st) {
    if (!st) return st;
    if (!st.apps) st = { days: st.days || [], apps: { conj: st } };
    return st;
  }
  function setCached(stats) {
    stats = fixStats(stats);
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
  function call(cred, action, extra, ms) {
    var ctl = new AbortController(); var tm = setTimeout(function () { ctl.abort(); }, ms || 20000);
    var body = { action: action, id: cred.id, pw: cred.pw }; for (var k in (extra || {})) body[k] = extra[k];
    return fetch(CFG.SCRIPT_URL, { method: "POST", signal: ctl.signal, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); })
      .then(function (j) { clearTimeout(tm); return j; }, function (e) { clearTimeout(tm); throw e; });
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  /* 未送信を順に送る。戻り値: "ok" | "auth" | "rate" | "error" | "skip"
     サーバー側で「5秒に1回」の送信制限があるので、2件以上たまっていたら間をあけて送る */
  async function flush() {
    if (!online() || flushing) return "skip";
    flushing = true; var status = "ok";
    try {
      var q = getPending();
      while (q.length) {
        var res = await call(user, "submit", { result: q[0] });
        if (res.ok) { q.shift(); setPending(q); if (!q.length) setCached(res.stats); else await sleep(5500); }
        else if (res.error === "auth" || res.error === "locked") { status = "auth"; break; }
        else if (res.error === "rate") { status = "rate"; break; }
        else if (res.error === "bad_request") { q.shift(); setPending(q); }
        else { status = "error"; break; }
      }
    } catch (e) { status = "error"; }
    flushing = false; return status;
  }

  function submit(app, result) {
    if (user && user.practice) return Promise.resolve("practice");
    if (!online()) return Promise.resolve("noauth");
    result.app = app; result.rid = newRid();
    var q = getPending(); q.push(result); setPending(q);
    return flush();
  }

  /* 開いたときの再同期。戻り値: "ok" | "auth" | "error" | "skip" */
  async function refresh() {
    if (!online()) return "skip";
    if (getPending().length) return flush();
    try {
      var res = await call(user, "sync");
      if (res.ok) { setCached(res.stats); return "ok"; }
      if (res.error === "auth") return "auth";
      return "error";
    } catch (e) { return "error"; }
  }

  /* 問題の報告（練習用IDからも送れる）。戻り値: "ok" | "rate" | "auth" | "error" | "noauth" */
  async function feedback(fb) {
    if (!SYNC_ON || !user) return "noauth";
    try {
      var res = await call(user, "feedback", { feedback: fb });
      if (res.ok) return "ok";
      return res.error === "rate" ? "rate" : (res.error === "auth" || res.error === "locked") ? "auth" : "error";
    } catch (e) { return "error"; }
  }

  /* ---- ログイン／ログアウト ---- */
  /* 本人の学習記録（サーバーにある分）。戻り値: {ok, history:[{t,app,sec,score,total,dur}]} */
  async function history() {
    if (user && user.practice) return { ok: false, error: "practice" };
    if (!online()) return { ok: false, error: "noauth" };
    try { return await call(user, "history"); } catch (e) { return { ok: false, error: "network" }; }
  }

  function keep(u, remember) {
    var rec = JSON.stringify(u);
    if (remember === false) { ssSet(LOGIN_KEY, rec); lsDel(LOGIN_KEY); }
    else { lsSet(LOGIN_KEY, rec); ssDel(LOGIN_KEY); }
  }
  async function login(raw, rawPw, remember) {
    var id = normId(raw), pw = normPw(rawPw);
    if (!RE_ID.test(id)) return { ok: false, error: "format", id: id };
    if (!pw) return { ok: false, error: "nopw", id: id };
    if (id === PRACTICE.id) {
      var h = ""; try { h = await sha256("naralingo:" + pw); } catch (e) {}
      if (h !== PRACTICE.pwHash) return { ok: false, error: "auth", id: id };
      clearPractice();
      user = { id: id, name: PRACTICE.name, pw: pw, practice: true };   // pw はフィードバック送信にだけ使う（sessionStorage のみ）
      keep(user, false);   // 練習用はブラウザを閉じたら終わり
      return { ok: true, user: user };
    }
    var res;
    try { res = await call({ id: id, pw: pw }, "sync", null, 35000); }   // サーバーが眠っていると最初の応答に時間がかかるので長めに待つ
    catch (e) { return { ok: false, error: (e && e.name === "AbortError") ? "timeout" : "network", id: id, detail: String(e && e.message || e) }; }
    if (!res.ok) return { ok: false, id: id, version: res.version || "旧版",
      error: (res.error === "locked" || res.error === "rate" || res.error === "auth" || res.error === "nopass") ? res.error : "server",
      detail: (res.error || "") + (res.message ? ": " + res.message : "") };
    user = { id: id, name: (res.user && res.user.name) || id, pw: pw, practice: false };
    keep(user, remember);
    setCached(res.stats);
    if (getPending().length) flush();   // 未送信の結果は裏で送る（ログインは待たせない）
    return { ok: true, user: user };
  }
  function logout() { if (user && user.practice) clearPractice(); user = null; lsDel(LOGIN_KEY); ssDel(LOGIN_KEY); }

  /* 教材ページの入口：ログインが必要な設定で未ログインなら、メニューへ戻す */
  function requireLogin() {
    if (SYNC_ON && !user) { location.replace("index.html"); return false; }
    return true;
  }

  window.Quiz = {
    SYNC_ON: SYNC_ON, APPS: APPS,
    user: function () { return user; },
    isPractice: function () { return !!(user && user.practice); },
    todayJST: todayJST, days: days, markToday: markToday, streak: streak,
    cached: cached, onStats: onStats,
    pendingCount: function () { return getPending().length; },
    submit: submit, flush: flush, refresh: refresh, history: history, feedback: feedback,
    login: login, logout: logout, requireLogin: requireLogin
  };
})();
