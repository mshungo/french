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
  /* 文法練習にあった動詞の活用の問題を「動詞活用」の「いろいろな動詞」（verbs-data.js）へ移したので、
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
    /* 進み具合の控え（大きいデータ）は、この端末にまだ記録がないときか、前に受け取ってから1日たったときだけもらう */
    var needProg = !PROG_KEYS.some(function (k) { return lsGet(k + "_" + id); }) || Date.now() - Number(lsGet("nlProgAt_" + id) || 0) > 86400000;
    try { res = await call({ id: id, pw: pw }, "sync", { prog: needProg }, 35000); }   // サーバーが眠っていると最初の応答に時間がかかるので長めに待つ
    catch (e) { return { ok: false, error: (e && e.name === "AbortError") ? "timeout" : "network", id: id, detail: String(e && e.message || e) }; }
    if (!res.ok) return { ok: false, id: id, version: res.version || "旧版",
      error: (res.error === "locked" || res.error === "rate" || res.error === "auth" || res.error === "nopass") ? res.error : "server",
      detail: (res.error || "") + (res.message ? ": " + res.message : "") };
    user = { id: id, name: (res.user && res.user.name) || id, pw: pw, practice: false };
    keep(user, remember);
    setCached(res.stats); markSynced();
    var restored = 0; try { if (res.prog) { restored = restore(res.prog); lsSet("nlProgAt_" + id, String(Date.now())); } } catch (e) {}
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

  try { migrateVerbs(false); } catch (e) {}   // いろいろな動詞の記録の引っ越し（一度だけ）

  function nextSpeed() { var p = prefs(); return p.nextSpeed || "manual"; }   // はじめは「押す」（自動では進まない）
  /* アイコン（文字のかわりに使う）。NLI.svg("home", 22) で SVG の文字列 */
  var ICON = {clock:"<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/>",pencil:"<path d=\"M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3z\"/><path d=\"M14.5 7.5l3 3\"/>",bolt:"<path d=\"M13 2.5 5 13.5h6l-1 8 8-11h-6z\" fill=\"currentColor\"/>",star:"<path d=\"M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z\" fill=\"currentColor\"/>",x:"<path d=\"M7 7l10 10M17 7 7 17\"/>",home:"<path d=\"M3.5 11 12 4l8.5 7\"/><path d=\"M5.5 9.5V20h4.5v-5.5h4V20h4.5V9.5\"/>",back:"<path d=\"M15 5l-7 7 7 7\"/>",next:"<path d=\"M5 12h13\"/><path d=\"M13 6l6 6-6 6\"/>",flag:"<path d=\"M6 21V4\"/><path d=\"M6 4.5h10.5l-2.2 4 2.2 4H6\"/>",again:"<path d=\"M4.5 12a7.5 7.5 0 1 0 2.2-5.3\"/><path d=\"M4.5 4.5v4.5H9\"/>",speaker:"<path d=\"M4 9.5h3.5L12 6v12l-4.5-3.5H4z\"/><path d=\"M15.5 9.5a3.5 3.5 0 0 1 0 5\"/><path d=\"M18 7.5a6.5 6.5 0 0 1 0 9\"/>",slow:"<path d=\"M3 18.5h12.5a4 4 0 0 0 4-4V12\"/><circle cx=\"10\" cy=\"12.5\" r=\"5\"/><path d=\"M10 12.5a1.6 1.6 0 1 1 1.6-1.6\"/><path d=\"M19.5 12 18 7.5M19.5 12l2.5-3.5\"/>",undo:"<path d=\"M9 7 4.5 11.5 9 16\"/><path d=\"M4.5 11.5H15a4.5 4.5 0 0 1 0 9h-2\"/>",clear:"<path d=\"M6 6l12 12M18 6 6 18\"/>",help:"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9.6 9.3a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2 1-1.2 1.9\"/><circle cx=\"12\" cy=\"16.8\" r=\".6\" fill=\"currentColor\"/>",logout:"<path d=\"M14 4h4.5a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H14\"/><path d=\"M10 8l-4 4 4 4\"/><path d=\"M6 12h10\"/>"};
  window.NLI = {
    /* 達成ポイントの点（1問4点）。gained＝今回ふえた点の数（光らせる） */
    dots: function (pt, max, gained) {
      max = max || 4; var h = '<span class="pt-dots" role="img" aria-label="' + pt + ' / ' + max + '">';
      for (var i = 0; i < max; i++) h += '<i class="' + (i < pt ? "on" : "") + (i < pt && i >= pt - (gained || 0) ? " new" : "") + '" style="animation-delay:' + (i * 90) + 'ms"></i>';
      return h + '</span>';
    },
    /* 次の問題を横からすべりこませる */
    slide: function (el) { if (!el) return; el.classList.remove("nl-slide"); void el.offsetWidth; el.classList.add("nl-slide"); },
    svg: function (k, sz) { sz = sz || 22; return '<svg class="nli" width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[k] || "") + '</svg>'; } };
  (function () {
    var css = document.createElement("style");
    css.textContent = '.ic-nav{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;border:1px solid var(--rule,#ece1da);background:#fdfaf8;color:var(--ink-soft,#8c8088);text-decoration:none;cursor:pointer;padding:0;transition:color .15s,border-color .15s,transform .15s;}' +
      '.ic-nav:hover{color:var(--accent-ink,#8f667f);border-color:var(--accent,#b48aa8);transform:translateY(-1px);}' +
      '.home-link.ic{display:flex;align-items:center;justify-content:center;width:46px;height:46px;margin:16px auto 0;border-radius:50%;border:1px solid var(--rule,#ece1da);background:#fdfaf8;color:var(--ink-soft,#8c8088);padding:0;}' +
      '.next-btn .nli{display:block;margin:0 auto;width:28px;height:28px;}' +
      '.play.again .nli{width:26px;height:26px;vertical-align:middle;}' +
      '.mini .nli,.bb .nli{width:17px;height:17px;vertical-align:-4px;}' +
      'button.ic-only{line-height:1;}' +
      '.btn-t{font-size:14.5px;font-weight:600;letter-spacing:.5px;}.btn-t b{font-family:var(--serif);font-size:17px;}' +
      '.play.again,.play.retry,.play.nd-go{display:flex;align-items:center;justify-content:center;gap:8px;}' +
      '.hidden{display:none!important;}' +
      '.review{margin-bottom:22px;}.play.retry{margin-top:6px;}' +
      /* 問題の進み具合のバー：太く、伸びるときに弾んで、先の星が光る */
      '#quizScreen .bar,#dlgScreen .bar{height:14px;border-radius:999px;background:#f1e7df;overflow:visible;position:relative;margin:4px 6px 28px;box-shadow:inset 0 1px 2px rgba(120,80,60,.14);}' +
      '#quizScreen .bar .fill,#dlgScreen .bar .fill{position:relative;height:100%;min-width:14px;border-radius:999px;' +
      'background:linear-gradient(90deg,#f2b36b,#e9788f 55%,#b77fb6);transition:width .75s cubic-bezier(.34,1.56,.64,1);box-shadow:0 3px 10px -3px rgba(226,104,140,.65);}' +
      '#quizScreen .bar .fill::before,#dlgScreen .bar .fill::before{content:"";position:absolute;inset:0;border-radius:inherit;' +
      'background:repeating-linear-gradient(45deg,rgba(255,255,255,.28) 0 7px,transparent 7px 14px);background-size:20px 20px;animation:nlStripe 1s linear infinite;}' +
      '@keyframes nlStripe{to{background-position:20px 0}}' +
      '#quizScreen .bar .fill::after,#dlgScreen .bar .fill::after{content:"";position:absolute;right:-9px;top:50%;width:22px;height:22px;margin-top:-11px;border-radius:50%;' +
      'background:radial-gradient(circle at 35% 30%,#fff7d6,#f2c94c 60%,#d99a2b);box-shadow:0 0 0 3px #fff,0 3px 8px rgba(200,140,40,.5);}' +
      '.bar .fill.nl-bump::after{animation:nlTip .6s cubic-bezier(.3,1.8,.5,1);}' +
      '@keyframes nlTip{0%{transform:scale(1)}40%{transform:scale(1.55) rotate(25deg)}100%{transform:scale(1)}}' +
      '.nl-spk{position:absolute;top:50%;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;pointer-events:none;animation:nlSpk .7s ease-out forwards;}' +
      '@keyframes nlSpk{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.4)}}' +
      '.home-link.ic.wide{text-decoration:none;width:auto;height:42px;padding:0 18px 0 12px;border-radius:999px;gap:4px;}.home-link.ic.wide .btn-t{font-size:13px;font-weight:500;}' +
      '.pt-dots{display:inline-flex;gap:6px;vertical-align:middle;}.pt-dots i{width:11px;height:11px;border-radius:50%;background:#ece2da;display:block;}' +
      '.pt-dots i.on{background:var(--accent-ink,#8f667f);}.pt-dots i.new{animation:nlPt .55s cubic-bezier(.3,1.6,.5,1) both;}' +
      '@keyframes nlPt{0%{transform:scale(.2);background:#f2c94c}60%{transform:scale(1.35);background:#f2c94c}100%{transform:none}}' +
      '.nl-slide{animation:nlSlide .28s cubic-bezier(.2,.8,.3,1) both;}' +
      '@keyframes nlSlide{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:none}}' +
      '.nl-pop{animation:nlPop .55s cubic-bezier(.3,1.6,.5,1) both;}' +
      '@keyframes nlPop{from{opacity:0;transform:scale(.4) rotate(-12deg)}to{opacity:1;transform:none}}' +
      '.nl-badge{display:inline-flex;align-items:center;gap:6px;justify-content:center;}' +
      '.nl-badge .nli{flex:none;}' +
      '.fx-bolt{color:#e2a33a;}.fx-pencil{color:var(--accent-ink,#8f667f);}' +
      '@media(prefers-reduced-motion:reduce){.nl-slide,.nl-pop,.pt-dots i.new,.bar .fill::before,.bar .fill.nl-bump::after,.nl-spk{animation:none!important;}}';
    (document.head || document.documentElement).appendChild(css);
  })();

  /* サーバーの「目覚まし」：ログイン画面でIDを入れ始めたら、軽い問い合わせを先に送っておく
     （Apps Script はしばらく使われないと眠り、最初の1回が遅い。ログインを押すまでに起こしておく） */
  function warmUp() {
    if (!SYNC_ON || !CFG.SCRIPT_URL || !window.fetch) return;
    if (Date.now() - Number(ssGet("nlWarm") || 0) < 120000) return;
    ssSet("nlWarm", String(Date.now()));
    try { fetch(CFG.SCRIPT_URL + (CFG.SCRIPT_URL.indexOf("?") < 0 ? "?" : "&") + "n=1").catch(function () {}); } catch (e) {}
  }

  /* 進み具合のバーが伸びたら、先の星をはずませて、火花を散らす（100% のときは多め） */
  (function () {
    if (!window.MutationObserver) return;
    var last = new WeakMap(), COLS = ["#f2c94c", "#e9788f", "#8db79b", "#92a6cf", "#fff"];
    function burst(fill, n) {
      var bar = fill.parentNode; if (!bar) return;
      var x = fill.offsetWidth;
      for (var i = 0; i < n; i++) {
        var sp = document.createElement("i"), a = Math.random() * Math.PI * 2, d = 14 + Math.random() * (n > 8 ? 34 : 20);
        sp.className = "nl-spk"; sp.style.left = x + "px"; sp.style.background = COLS[i % COLS.length];
        sp.style.setProperty("--dx", (Math.cos(a) * d).toFixed(0) + "px"); sp.style.setProperty("--dy", (Math.sin(a) * d).toFixed(0) + "px");
        bar.appendChild(sp); setTimeout(function (e) { return function () { e.remove(); }; }(sp), 750);
      }
    }
    function watch() {
      new MutationObserver(function (ms) {
        ms.forEach(function (m) {
          var f = m.target;
          if (!f.classList || !f.classList.contains("fill") || !f.parentNode || !f.parentNode.classList.contains("bar")) return;
          var w = parseFloat(f.style.width) || 0, pw = last.has(f) ? last.get(f) : 0;
          last.set(f, w);
          if (w <= pw) return;
          f.classList.remove("nl-bump"); void f.offsetWidth; f.classList.add("nl-bump");
          setTimeout(function () { burst(f, w >= 100 ? 14 : 6); }, 380);   // 伸びきるころに火花
        });
      }).observe(document.body, { attributes: true, attributeFilter: ["style"], subtree: true });
    }
    if (document.body) watch(); else document.addEventListener("DOMContentLoaded", watch);
  })();

  window.Quiz = {
    prefs: prefs, setPref: setPref,
    autoNext: function () { return nextSpeed() !== "manual"; },   // 正解したら自動で次の問題へ（設定で「自分で押す」にできる）
    nextDelay: function (base) { return Math.round(base * ({ fast: 0.55, slow: 1.6 }[nextSpeed()] || 1)); },   // 自動で進むまでの時間（設定で速さを変えられる）
    SYNC_ON: SYNC_ON, APPS: APPS,
    user: function () { return user; },
    isPractice: function () { return !!(user && user.practice); },
    todayJST: todayJST, days: days, markToday: markToday, streak: streak, chain: chain, streakHTML: streakHTML,
    cached: cached, onStats: onStats,
    pendingCount: function () { return getPending().length; },
    submit: submit, flush: flush, refresh: refresh, history: history, cachedHistory: cachedHistory, feedback: feedback, backup: backup, setNick: setNick, setPw: setPw,
    login: login, logout: logout, requireLogin: requireLogin, warmUp: warmUp
  };
})();
