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
      user = { id: c.id, name: (c.nm === 2 || c.practice) ? (c.name || c.id) : c.id, pw: c.pw || "", practice: !!c.practice };   // 旧版で端末に残った名前は使わない
    if (user && !user.practice && c.nm !== 2) {   // 旧版の控え（本名が入っているかもしれない）は、その場で書きかえる
      var rec0 = JSON.stringify({ id: user.id, name: user.name, pw: user.pw, practice: false, nm: 2 });
      if (lsGet(LOGIN_KEY)) lsSet(LOGIN_KEY, rec0); else ssSet(LOGIN_KEY, rec0);
    }
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
  /* その日はじめて解き終えたら「nl:firststudy」を知らせる（継続カード・小さなお祝い用） */
  function markToday() {
    var t = todayJST(), had = days().indexOf(t) >= 0, out = mergeDays([t]);
    if (!had) setTimeout(function () { try { window.dispatchEvent(new CustomEvent("nl:firststudy", { detail: chain() })); } catch (e) {} }, 400);
    return out;
  }
  /* 継続：1日あいてもつながる（2日あくと切れる）。n＝つながっている学習日の数
     gap … 最後に学習した日が 0＝今日 / 1＝きのう / 2＝おととい（今日がラストチャンス） */
  function chain() {
    var set = {}; days().forEach(function (d) { set[d] = 1; });
    var t = todayJST(), cur = null, gap = -1;
    for (var g = 0; g <= 2; g++) if (set[addDays(t, -g)]) { cur = addDays(t, -g); gap = g; break; }
    var n = 0;
    while (cur) { n++; cur = set[addDays(cur, -1)] ? addDays(cur, -1) : set[addDays(cur, -2)] ? addDays(cur, -2) : null; }
    return { n: n, gap: gap, doneToday: gap === 0, risk: gap === 2 };
  }
  function streakHTML() {
    var c = chain(), tip = ' title="1日あいてもつながります（2日あくとリセット）"';
    if (!c.n) return '<span' + tip + '>継続 0日</span>';
    return '<span' + tip + '>継続 ' + c.n + '日</span> ' + (c.doneToday ? '<small>今日済</small>' :
      c.risk ? '<small style="color:#c0662b;font-weight:600">今日がラスト！</small>' : '<small>今日はまだ</small>');
  }
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
        if (res.ok) { q.shift(); setPending(q); if (!q.length) { setCached(res.stats); markSynced(); } else await sleep(5500); }
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
    return flush().then(function (st) { if (st === "ok") backup(); return st; });   // 結果を送れたら、進み具合も控えておく
  }

  /* ---- 進み具合（問題ごとの習得・バッジなど）のバックアップ ----
     端末に保存している記録を、変わったものだけサーバー（シート「進み具合」）に控える。
     ログインしたとき、端末にない・端末より進んでいる控えがあれば戻す（自分の控えだけ）。 */
  var PROG_KEYS = ["conjQuizStats_v4", "talkQuiz_v1", "gramQuiz_L1_v1", "gramQuiz_L2_v1", "gramQuiz_L3_v1",
    "gramQuiz_L4_v1", "gramQuiz_L5_v1", "gramQuiz_L6_v1", "verbQuiz_v1", "conjQuizDays", "nlWelcome_v1", "nlStamp_v1"];
  function hashStr(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return s.length + ":" + h.toString(36); }
  function bkKey(k) { return "conjQuizBk_" + k + "_" + user.id; }
  var backingUp = false;
  async function backup() {
    if (!online() || backingUp) return "skip";
    var items = [];
    PROG_KEYS.forEach(function (k) {
      var v = lsGet(k + "_" + user.id);
      if (v && v.length < 45000 && lsGet(bkKey(k)) !== hashStr(v)) items.push({ k: k, d: v });
    });
    if (!items.length) return "ok";
    backingUp = true;
    try {
      var res = await call(user, "saveprog", { items: items });
      if (res.ok) items.forEach(function (it) { lsSet(bkKey(it.k), hashStr(it.d)); });
      return res.ok ? "ok" : (res.error || "error");
    } catch (e) { return "error"; } finally { backingUp = false; }
  }
  function score(v) { try { var o = JSON.parse(v); return Array.isArray(o) ? o.length : (Number(o.answered) || 0) * 1000 + (Number(o.tries) || 0); } catch (e) { return -1; } }
  /* 文法練習にあった動詞の活用の問題を「動詞活用 › 教科書の動詞」（verbs.html）へ移したので、
     その問題の記録（問題ごとの点数・項目バッジ）を gramQuiz_Lx から verbQuiz へ移す。問題IDは同じ。
     この端末で一度済めば印を残す。バックアップから古い記録が戻ったときは、もう一度だけ行う */
  var VMOVE = { 2: [18, 61, { er: "er", ea: "ea" }], 3: [28, 41, { ir: "ir" }], 4: [0, 23, { verb: "v4" }], 5: [0, 20, { verb: "v5" }], 6: [0, 25, { verb: "v6" }] };
  function migrateVerbs(force) {
    var w = who(), flag = "nlVMig1_" + w;
    if (!force && lsGet(flag)) return;
    var vk = "verbQuiz_v1_" + w, v = jget(vk, null), changed = false;
    Object.keys(VMOVE).forEach(function (n) {
      var gk = "gramQuiz_L" + n + "_v1_" + w, g = jget(gk, null), r = VMOVE[n], moved = 0;
      if (!g) return;
      Object.keys(g.it || {}).forEach(function (k) {
        var m = /^(\d+)-(\d+)$/.exec(k);
        if (!m || m[1] !== n || +m[2] < r[0] || +m[2] > r[1]) return;
        v = v || { tries: 0, answered: 0, correct: 0, best: null, it: {}, mode: "choice", timeMs: 0 };
        v.it = v.it || {};
        if (!v.it[k]) v.it[k] = g.it[k];
        delete g.it[k]; moved++;
      });
      Object.keys(r[2]).forEach(function (sk) {
        if (!g.badges || !g.badges["s:" + sk]) return;
        v = v || { tries: 0, answered: 0, correct: 0, best: null, it: {}, mode: "choice", timeMs: 0 };
        v.badges = v.badges || {};
        if (!v.badges["s:" + r[2][sk]]) v.badges["s:" + r[2][sk]] = g.badges["s:" + sk];
        delete g.badges["s:" + sk]; moved++;
      });
      if (moved) { delete g.sum; lsSet(gk, JSON.stringify(g)); changed = true; }
    });
    if (changed && v) lsSet(vk, JSON.stringify(v));
    lsSet(flag, "1");
  }

  function restore(prog) {
    var n = 0;
    Object.keys(prog || {}).forEach(function (k) {
      if (PROG_KEYS.indexOf(k) < 0) return;
      var key = k + "_" + user.id, local = lsGet(key), srv = prog[k];
      if (k === "conjQuizDays") { try { mergeDays(JSON.parse(srv)); } catch (e) {} return; }
      if (k === "nlStamp_v1") {   // ログインスタンプは、端末とサーバーの両方を合わせる
        try {
          var a = JSON.parse(srv) || {}, b = JSON.parse(local || "null") || {}, u2 = function (x, y) { var o = {}; (x || []).concat(y || []).forEach(function (d) { o[d] = 1; }); return Object.keys(o).sort(); };
          var m = { d: u2(a.d, b.d).slice(-400), m: u2(a.m, b.m).slice(-100) }, js = JSON.stringify(m);
          if (js !== local) { lsSet(key, js); if (js === srv) lsSet(bkKey(k), hashStr(srv)); }
        } catch (e) {}
        return;
      }
      if (!local || score(srv) > score(local)) { lsSet(key, srv); lsSet(bkKey(k), hashStr(srv)); n++; }
    });
    return n;
  }

  /* 開いたときの再同期。戻り値: "ok" | "auth" | "error" | "skip" */
  /* ページを開くたびにサーバーへ問い合わせないよう、90秒以内に同期したばかりなら省く（このタブの中だけ） */
  var SYNC_GAP = 90000;
  function syncKey() { return "nlSyncAt_" + (user ? user.id : ""); }
  function markSynced() { ssSet(syncKey(), String(Date.now())); }
  async function refresh() {
    if (!online()) return "skip";
    if (getPending().length) return flush();
    if (Date.now() - Number(ssGet(syncKey()) || 0) < SYNC_GAP) return "skip";
    try {
      var res = await call(user, "sync");
      if (res.ok) { setCached(res.stats); updName(res); markSynced(); return "ok"; }
      if (res.error === "auth") return "auth";
      return "error";
    } catch (e) { return "error"; }
  }

  /* 問題の報告（練習用IDからも送れる）。戻り値: "ok" | "rate" | "auth" | "error" | "noauth" */
  async function feedback(fb) {
    if (!SYNC_ON) return "noauth";
    try {
      var res = await call(user || { id: "", pw: "" }, "feedback", { feedback: fb });   // ログイン前はIDなしで送る
      if (res.ok) return "ok";
      return res.error === "rate" ? "rate" : (res.error === "auth" || res.error === "locked") ? "auth" : "error";
    } catch (e) { return "error"; }
  }

  /* ---- ログイン／ログアウト ---- */
  /* 本人の学習記録（サーバーにある分）。戻り値: {ok, history:[{t,app,sec,score,total,dur}]} */
  async function history() {
    if (user && user.practice) return { ok: false, error: "practice" };
    if (!online()) return { ok: false, error: "noauth" };
    var r;
    try { r = await call(user, "history"); } catch (e) { return { ok: false, error: "network" }; }
    if (r && r.ok) updName(r);   // 学習記録を開いたときも、表示名（ニックネーム）を最新にする
    if (r && r.ok) lsSet("nlHist_" + user.id, JSON.stringify({ at: Date.now(), history: r.history || [], agg: r.agg || null }));
    return r;
  }
  /* 前回読み込んだ学習記録（すぐ表示するため）。なければ null */
  function cachedHistory() {
    if (!user || user.practice) return null;
    try { return JSON.parse(lsGet("nlHist_" + user.id) || "null"); } catch (e) { return null; }
  }

  /* ニックネームを自分で決める。戻り値 "ok" | "rate" | "bad" | "error" */
  async function setNick(nick) {
    if (!online()) return "error";
    try {
      var res = await call(user, "setnick", { nick: String(nick || "").slice(0, 20) });
      if (res.ok) { updName(res); return "ok"; }
      return res.error === "rate" ? "rate" : res.error === "bad_request" ? "bad" : "error";
    } catch (e) { return "error"; }
  }
  /* パスワードを変える（サーバーにはハッシュだけが残る）。変えたら、この端末の控えも新しいパスワードにする */
  async function setPw(cur, np) {
    if (!online()) return "error";
    cur = normPw(cur); np = normPw(np);
    if (np.length < 4) return "short";
    try {
      var res = await call({ id: user.id, pw: cur }, "setpw", { newpw: np });
      if (res.ok) { user.pw = np; keep(user, !!lsGet(LOGIN_KEY)); return "ok"; }
      return res.error === "auth" ? "auth" : res.error === "rate" ? "rate" : res.error === "locked" ? "locked" : res.error === "bad_request" ? "short" : "error";
    } catch (e) { return "error"; }
  }
  /* サーバーが返す表示名（ニックネーム。なければID）で、端末の控えを更新する */
  function updName(res) {
    if (!user || user.practice || !res || !res.user) return;
    var nm = res.user.name || user.id;
    if (nm === user.name) return;
    user.name = nm;
    keep(user, !ssGet(LOGIN_KEY));
  }
  function keep(u, remember) {
    var rec = JSON.stringify({ id: u.id, name: u.name, pw: u.pw, practice: u.practice, nm: 2 });
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
    try { res = await call({ id: id, pw: pw }, "sync", { prog: true }, 35000); }   // サーバーが眠っていると最初の応答に時間がかかるので長めに待つ
    catch (e) { return { ok: false, error: (e && e.name === "AbortError") ? "timeout" : "network", id: id, detail: String(e && e.message || e) }; }
    if (!res.ok) return { ok: false, id: id, version: res.version || "旧版",
      error: (res.error === "locked" || res.error === "rate" || res.error === "auth" || res.error === "nopass") ? res.error : "server",
      detail: (res.error || "") + (res.message ? ": " + res.message : "") };
    user = { id: id, name: (res.user && res.user.name) || id, pw: pw, practice: false };
    keep(user, remember);
    setCached(res.stats); markSynced();
    var restored = 0; try { restored = restore(res.prog); } catch (e) {}
    try { migrateVerbs(true); } catch (e) {}
    if (getPending().length) flush().then(function (st) { if (st === "ok") backup(); });   // 未送信の結果は裏で送る（ログインは待たせない）
    else backup();
    return { ok: true, user: user, restored: restored };
  }
  function logout() { if (user && user.practice) clearPractice(); if (user) lsDel("nlHist_" + user.id); user = null; lsDel(LOGIN_KEY); ssDel(LOGIN_KEY); }

  /* 教材ページの入口：ログインが必要な設定で未ログインなら、メニューへ戻す */
  function requireLogin() {
    if (SYNC_ON && !user) { location.replace("index.html"); return false; }
    return true;
  }

  /* ---- 表示の設定（この端末だけ）：解いているときの時間を隠す／書体をゴシックにする ---- */
  var PREF_KEY = "nlPrefs";
  var prefCache = null;   // 毎回 localStorage を読まないよう、メモリに持っておく
  function prefs() { if (!prefCache) prefCache = jget(PREF_KEY, {}) || {}; return prefCache; }
  function setPref(k, v) { var p = prefs(); p[k] = v; lsSet(PREF_KEY, JSON.stringify(p)); applyPrefs(); }
  var SANS = '-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Noto Sans JP",Meiryo,sans-serif';
  function eachRule(list, fn) {
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (r.style) fn(r);
      if (r.cssRules) { try { eachRule(r.cssRules, fn); } catch (e) {} }
    }
  }
  /* 欧文の書体は CSS 変数 --serif で指定している（ふだんは Times New Roman 系、ゴシックのときは下の SANS）。
     書体ごとに字の大きさの見え方がちがうので、--serif を使う規則の文字サイズだけ少し整える（元に戻せるよう控えておく） */
  var SCALE = { serif: 0.94, gothic: 0.86 };
  function applyFont(mode) {
    var k = SCALE[mode] || 1;
    for (var i = 0; i < document.styleSheets.length; i++) {
      var rules; try { rules = document.styleSheets[i].cssRules; } catch (e) { continue; }   // 別のサイトの CSS は読めないので飛ばす
      if (!rules) continue;
      eachRule(rules, function (r) {
        var st = r.style;
        if (!r.__nlFont) {
          if (!/--serif/.test(st.fontFamily || "")) return;
          r.__nlFont = { fs: st.fontSize, fi: st.fontStyle };
        }
        var o = r.__nlFont, m = /^([\d.]+)px$/.exec(o.fs || "");
        st.fontSize = m ? Math.round(parseFloat(m[1]) * k * 10) / 10 + "px" : o.fs;
        st.fontStyle = (mode === "gothic" && o.fi === "italic") ? "normal" : o.fi;
      });
    }
  }
  function applyPrefs() {
    var p = prefs(), h = document.documentElement;
    h.classList.toggle("nl-notimer", !!p.hideTimer);
    h.classList.toggle("nl-gothic", p.font === "gothic");
    if (document.readyState !== "loading") applyFont(p.font === "gothic" ? "gothic" : "serif");
  }
  (function () {
    var css = document.createElement("style");
    css.textContent = ':root{--serif:"Times New Roman",Tinos,"Noto Serif",Georgia,serif;}' +
      'html.nl-gothic{--serif:' + SANS + ';}' +
      '.live-timer,#dlgTimer{cursor:pointer;-webkit-user-select:none;user-select:none;}' +
      'html.nl-notimer .live-timer,html.nl-notimer #dlgTimer{font-size:0!important;}' +
      'html.nl-notimer .live-timer::after,html.nl-notimer #dlgTimer::after{content:"⏱";font-size:17px;font-style:normal;opacity:.4;}';
    (document.head || document.documentElement).appendChild(css);
    applyPrefs();
    document.addEventListener("DOMContentLoaded", function () { applyPrefs(); });
    window.addEventListener("load", function () { applyPrefs(); });
    /* あとから足される CSS（バッジ・対話練習など）にも当てる。見張るのは <head> の直下だけ（問題の描きかえには反応しない） */
    var fontTimer = 0;
    function watchHead() {
      try {
        new MutationObserver(function () {
          if (fontTimer) return;
          fontTimer = setTimeout(function () { fontTimer = 0; applyFont(prefs().font === "gothic" ? "gothic" : "serif"); }, 30);
        }).observe(document.head, { childList: true });
      } catch (e) {}
    }
    if (document.head) watchHead(); else document.addEventListener("DOMContentLoaded", watchHead);
    /* 解いている画面の時間表示は、タップで隠す／出す */
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest && e.target.closest(".live-timer,#dlgTimer");
      if (t) setPref("hideTimer", !prefs().hideTimer);
    });
    window.addEventListener("load", function () {
      Array.prototype.forEach.call(document.querySelectorAll(".live-timer,#dlgTimer"), function (t) { t.title = "タップで時間をかくす／表示する"; });
    });
  })();

  try { migrateVerbs(false); } catch (e) {}   // 教科書の動詞の記録の引っ越し（一度だけ）

  window.Quiz = {
    prefs: prefs, setPref: setPref,
    SYNC_ON: SYNC_ON, APPS: APPS,
    user: function () { return user; },
    isPractice: function () { return !!(user && user.practice); },
    todayJST: todayJST, days: days, markToday: markToday, streak: streak, chain: chain, streakHTML: streakHTML,
    cached: cached, onStats: onStats,
    pendingCount: function () { return getPending().length; },
    submit: submit, flush: flush, refresh: refresh, history: history, cachedHistory: cachedHistory, feedback: feedback, backup: backup, setNick: setNick, setPw: setPw,
    login: login, logout: logout, requireLogin: requireLogin
  };
})();
