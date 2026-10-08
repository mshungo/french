/* Naralingo  継続カード・ログインボーナス
   Streak.card()        … 継続カード（直近14日のスタンプ）の HTML
   Streak.loginBonus()  … その日はじめてメニューを開いたときのスタンプ演出（1日1回）
   学習ページでは、その日はじめて解き終えたとき（nl:firststudy）に小さな知らせを出し、
   継続日数が節目に届いたらお祝いする。
   記録：nlStamp_v1_<ID> = { d:[開いた日], m:[お祝い済みの節目] }（進み具合のバックアップで別の端末にも伝わる） */
(function () {
  "use strict";
  var Q = window.Quiz;
  if (!Q) return;

  var MILES = [3, 5, 7, 10, 14, 21, 30, 40, 50, 60, 75, 100];
  var WD = "日月火水木金土";
  var WORDS = [
    ["Bon courage !", "がんばって！"],
    ["Petit à petit, l'oiseau fait son nid.", "少しずつ、鳥は巣を作る（ちりも積もれば山となる）"],
    ["C'est parti !", "さあ、始めよう！"],
    ["Pas à pas.", "一歩ずつ。"],
    ["Bonne journée !", "よい一日を！"],
    ["Je peux le faire.", "わたしにはできる。"],
    ["Rien n'est impossible.", "不可能なことは何もない。"],
    ["Chaque jour compte.", "一日一日が大切。"],
    ["Vouloir, c'est pouvoir.", "意志あるところに道は開ける。"],
    ["C'est en forgeant qu'on devient forgeron.", "鍛冶をしてこそ鍛冶屋になる（習うより慣れろ）"],
    ["Qui ne tente rien n'a rien.", "何もしなければ、何も得られない。"],
    ["On y va !", "さあ、行こう！"],
    ["Bravo !", "おみごと！"],
    ["À demain !", "また明日！"],
    ["Il n'est jamais trop tard.", "遅すぎることはない。"],
    ["Prends ton temps.", "ゆっくりでいいよ。"],
    ["Je fais de mon mieux.", "ベストを尽くしています。"],
    ["Tu progresses !", "上達してるよ！"],
    ["C'est génial !", "最高！"],
    ["Avec plaisir.", "よろこんで。"],
    ["Pourquoi pas ?", "いいんじゃない？"],
    ["Mieux vaut tard que jamais.", "遅れても、やらないよりはまし。"],
    ["L'appétit vient en mangeant.", "食べているうちに食欲がわく（始めるとやる気が出る）"],
    ["Il faut battre le fer pendant qu'il est chaud.", "鉄は熱いうちに打て。"],
    ["Les petits ruisseaux font les grandes rivières.", "小さな流れが大河になる（ちりも積もれば山となる）"],
    ["Après la pluie, le beau temps.", "雨のあとは晴れ（悪いことのあとには良いことがある）"],
    ["Bonne chance !", "幸運を！"],
    ["Tout est possible.", "なんだってできる。"],
    ["Je continue !", "続けるぞ！"],
    ["Ça avance !", "進んでる！"]
  ];
  var DEER = '<path d="M11.5 9.5C9.6 7.3 9.2 5.1 10 2.8M10.2 5.9 7.4 4.6M12.6 9.2c-.6-1.8-.1-3.4 1-4.6"/><path d="M20.5 9.5c1.9-2.2 2.3-4.4 1.5-6.7M21.8 5.9l2.8-1.3M19.4 9.2c.6-1.8.1-3.4-1-4.6"/>' +
    '<path d="M11.3 11.2c.3-1.4 2.2-2.1 4.7-2.1s4.4.7 4.7 2.1l-1.1 8.2c-.5 3.6-1.9 6.4-3.6 6.4s-3.1-2.8-3.6-6.4z"/>' +
    '<circle cx="13.9" cy="14.8" r=".8" fill="currentColor" stroke="none"/><circle cx="18.1" cy="14.8" r=".8" fill="currentColor" stroke="none"/>';
  function deer(size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + DEER + '</svg>';
  }
  var FLAME = '<svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3c1 5.2 7.5 8.2 7.5 15.4A7.5 7.5 0 0 1 8.5 18.4c0-3.4 1.7-5.6 3.4-7.2.2 2.4 1.2 3.9 2.6 4.6C14.2 11 14.9 6.8 16 3z" fill="currentColor"/>' +
    '<path d="M16 16.5c.6 2.4 3.4 3.5 3.4 6.4a3.4 3.4 0 0 1-6.8 0c0-1.6.9-2.6 1.7-3.3.2 1 .6 1.6 1.2 1.9-.3-2 .1-3.6.5-5z" fill="#fff6dc"/></svg>';

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function addDays(str, k) { var t = new Date(str + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() + k); return t.toISOString().slice(0, 10); }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function key() { var u = Q.user(); return "nlStamp_v1_" + (u ? u.id : "guest"); }
  function load() {
    try { var o = JSON.parse(localStorage.getItem(key())); if (o && Array.isArray(o.d)) return { d: o.d, m: Array.isArray(o.m) ? o.m : [] }; } catch (e) {}
    return { d: [], m: [] };
  }
  function save(o) { try { localStorage.setItem(key(), JSON.stringify({ d: o.d.slice(-400), m: o.m.slice(-100) })); } catch (e) {} }
  /* スタンプ＝メニューを開いた日 と 学習した日 を合わせた日数 */
  function stampSet() {
    var o = {}; load().d.concat(Q.days()).forEach(function (d) { o[d] = 1; }); return o;
  }
  function nextMile(n) {
    for (var i = 0; i < MILES.length; i++) if (MILES[i] > n) return { to: MILES[i], from: i ? MILES[i - 1] : 0 };
    var t = (Math.floor(n / 50) + 1) * 50; return { to: t, from: t - 50 };
  }
  function isMile(n) { return MILES.indexOf(n) >= 0 || (n > 100 && n % 50 === 0); }
  function message(c, everStudied) {
    if (c.doneToday) return { t: "今日の学習スタンプ、ゲット！", w: false };
    if (c.risk) return { t: "今日がラストチャンス！ 1回解けば、継続 " + (c.n + 1) + "日。", w: true };
    if (c.n) return { t: "今日1回解くと、継続 " + (c.n + 1) + "日になります。", w: false };
    return { t: everStudied ? "1回解けば、今日から継続スタート。" : "1回解くと、学習スタンプがたまっていきます。", w: false };
  }

  /* ---- 継続カード ---- */
  function card() {
    css();
    var c = Q.chain(), study = {}, t = Q.todayJST(), st = stampSet();
    Q.days().forEach(function (d) { study[d] = 1; });
    var cells = "";
    for (var i = 13; i >= 0; i--) {
      var d = addDays(t, -i), wd = new Date(d + "T00:00:00Z").getUTCDay();
      var cls = study[d] ? "on" : st[d] ? "lg" : "";
      if (!i) cls += " today";
      cells += '<div class="stk-c ' + cls + '" title="' + d + (study[d] ? "　学習した日" : st[d] ? "　ログインした日" : "") + '">' +
        '<i>' + (study[d] || st[d] ? deer(18) : "") + '</i><small>' + Number(d.slice(8)) + '<b class="w' + wd + '">' + WD.charAt(wd) + '</b></small></div>';
    }
    var nm = nextMile(c.n), pct = Math.round((c.n - nm.from) / (nm.to - nm.from) * 100), msg = message(c, Q.days().length > 0);
    var total = Object.keys(st).length;
    return '<div class="stk' + (c.doneToday ? " done" : "") + '">' +
      '<div class="stk-top"><div class="stk-fl' + (c.n ? (c.doneToday ? " hot" : " warm") : "") + '">' + FLAME + '</div>' +
      '<div class="stk-num"><b>' + c.n + '</b><span>日<br>継続</span></div>' +
      '<div class="stk-msg' + (msg.w ? " warn" : "") + '">' + esc(msg.t) + '<small>1日あいてもつながります（2日あくとリセット）</small></div></div>' +
      '<div class="stk-days">' + cells + '</div>' +
      '<div class="stk-foot"><span class="stk-tot">' + deer(14) + 'スタンプ 通算 <b>' + total + '</b>個</span>' +
      '<span class="stk-nx">次の目標「継続 ' + nm.to + '日」まであと ' + (nm.to - c.n) + '日<span class="stk-bar"><i style="width:' + pct + '%"></i></span></span></div>' +
      '</div>';
  }
  function mount(el) { if (el) el.innerHTML = card(); }

  /* ---- ログインボーナス（その日はじめてメニューを開いたとき） ---- */
  function loginBonus() {
    var u = Q.user(); if (!u) return;
    var o = load(), t = Q.todayJST();
    if (o.d.indexOf(t) >= 0) return;
    var before = Object.keys(stampSet()).length, hadToday = Q.days().indexOf(t) >= 0;
    o.d.push(t); save(o);
    if (hadToday) return;                       // 今日はもう学習スタンプがある（別の画面から始めた）
    var n = before + 1;
    waitFree(function () { bonusPop(n); });
  }
  function waitFree(fn) {   // 「はじめての案内」などが開いていれば、閉じてから出す
    var k = 0, iv = setInterval(function () {
      if (!document.getElementById("welcome") && !document.querySelector(".bdg-ov,.stk-ov")) { clearInterval(iv); fn(); }
      else if (++k > 1200) clearInterval(iv);
    }, 500);
  }
  function sparks(nn) {
    var s = "";
    for (var i = 0; i < nn; i++) {
      var a = i / nn * 2 * Math.PI, d = 70 + (i % 3) * 18;
      s += '<i style="--dx:' + (Math.cos(a) * d).toFixed(0) + 'px;--dy:' + (Math.sin(a) * d).toFixed(0) + 'px;--dl:' + (i % 4) * 50 + 'ms;' +
        'background:' + ["#f2c94c", "#e8a0b4", "#8db79b", "#92a6cf"][i % 4] + '"></i>';
    }
    return s;
  }
  function overlay(html, btn, onClose) {
    css();
    var ov = document.createElement("div");
    ov.className = "stk-ov";
    ov.innerHTML = '<div class="stk-box" role="dialog" aria-live="polite">' + html + '<button type="button" class="stk-ok">' + esc(btn) + '</button></div>';
    document.body.appendChild(ov);
    var close = function () { ov.classList.add("out"); setTimeout(function () { ov.remove(); if (onClose) onClose(); }, 200); };
    ov.querySelector(".stk-ok").onclick = close;
    ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
    try { ov.querySelector(".stk-ok").focus(); } catch (e) {}
  }
  function bonusPop(n) {
    var c = Q.chain(), msg = message(c, Q.days().length > 0), slot = (n - 1) % 10 + 1, sheet = "";
    for (var i = 1; i <= 10; i++) sheet += '<i class="' + (i < slot ? "on" : i === slot ? "on new" : "") + '">' + (i <= slot ? deer(16) : i) + '</i>';
    var w = WORDS[hash(Q.todayJST()) % WORDS.length];
    overlay(
      '<div class="stk-kick">ログインボーナス</div>' +
      '<div class="stk-burst">' + sparks(12) + '<div class="stk-big">' + deer(58) + '<span>' + esc(Q.todayJST().slice(5).replace("-", "/")) + '</span></div></div>' +
      '<div class="stk-h">今日のスタンプ　通算 <b>' + n + '</b> 個目</div>' +
      '<div class="stk-sheet">' + sheet + '</div>' +
      (slot === 10 ? '<div class="stk-comp">スタンプカード ' + (n / 10) + '枚目、コンプリート！</div>' : '<div class="stk-sub">あと ' + (10 - slot) + '個でカードがいっぱいに</div>') +
      '<div class="stk-pmsg' + (msg.w ? " warn" : "") + '">' + esc(msg.t) + '</div>' +
      '<div class="stk-word"><small>今日のひとこと</small><b lang="fr">' + esc(w[0]) + '</b><span>' + esc(w[1]) + '</span></div>',
      "よし、やろう");
  }

  /* ---- 学習ページ：その日はじめて解き終えたとき ---- */
  function toast(html) {
    css();
    var el = document.createElement("div");
    el.className = "stk-toast";
    el.innerHTML = html;
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add("out"); setTimeout(function () { el.remove(); }, 300); }, 3800);
  }
  window.addEventListener("nl:firststudy", function (e) {
    var c = (e && e.detail) || Q.chain();
    var o = load(), t = Q.todayJST();
    if (o.d.indexOf(t) < 0) { o.d.push(t); }
    var mile = isMile(c.n) && o.m.indexOf("c" + c.n) < 0;
    if (mile) o.m.push("c" + c.n);
    save(o);
    var hd = document.getElementById("streak"); if (hd) hd.innerHTML = Q.streakHTML();   // 見出しの「継続 N日」も更新
    var sc = document.getElementById("stkCard"); if (sc) mount(sc);
    if (mile) {
      waitFree(function () {
        overlay('<div class="stk-kick">継続ボーナス</div>' +
          '<div class="stk-burst">' + sparks(16) + '<div class="stk-big gold">' + FLAME + '<span>' + c.n + '日</span></div></div>' +
          '<div class="stk-h">継続 <b>' + c.n + '</b>日 達成！</div>' +
          '<div class="stk-pmsg">' + esc(c.n >= 30 ? "ここまで続けられる人は、ほんのひとにぎり。Magnifique !" : c.n >= 10 ? "もう習慣になってきたね。Bravo !" : "いい流れ！ このまま続けよう。") + '</div>' +
          '<div class="stk-sub">次の目標：継続 ' + nextMile(c.n).to + '日</div>', "やったね");
        try { if (typeof window.playFanfare === "function") window.playFanfare(); } catch (er) {}
      });
    } else {
      toast('<span class="stk-ti">' + deer(20) + '</span><span><b>今日の学習スタンプ ゲット！</b><small>継続 ' + c.n + '日' + (c.n > 1 ? "　この調子！" : "　ここからスタート") + '</small></span>');
    }
  });

  /* ---- スタイル ---- */
  var done = false;
  function css() {
    if (done) return; done = true;
    var st = document.createElement("style");
    st.textContent =
      '.stk{margin:14px 0 4px;padding:14px 14px 12px;border-radius:18px;background:linear-gradient(160deg,#fff8ec,#fdf1f4);border:1px solid #f0dfcf;}' +
      '.stk-top{display:flex;align-items:center;gap:10px;}' +
      '.stk-fl{flex:none;color:#d9cfc9;}.stk-fl.warm{color:#e7a35a;}.stk-fl.hot{color:#e2683a;animation:stkFl 1.6s ease-in-out infinite;}' +
      '@keyframes stkFl{0%,100%{transform:scale(1)}50%{transform:scale(1.1) rotate(-3deg)}}' +
      '.stk-num{display:flex;align-items:center;gap:4px;flex:none;}' +
      '.stk-num b{font-family:var(--serif);font-size:34px;line-height:1;color:#7a4f3a;font-weight:600;}' +
      '.stk-num span{font-size:10.5px;line-height:1.25;color:var(--ink-soft);}' +
      '.stk-msg{flex:1;min-width:0;font-size:12.5px;font-weight:500;color:var(--ink);line-height:1.5;}' +
      '.stk-msg small{display:block;font-size:10.5px;font-weight:400;color:var(--ink-faint);}' +
      '.stk-msg.warn{color:#b8542a;}' +
      '.stk-days{display:grid;grid-template-columns:repeat(7,1fr);gap:6px 4px;margin-top:12px;}' +
      '.stk-c{display:flex;flex-direction:column;align-items:center;gap:2px;}' +
      '.stk-c i{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1.5px dashed #e3d4cb;color:#d6c3b8;background:#fffdfb;}' +
      '.stk-c.lg i{border:1.5px solid #e8d6c4;color:#c9a98e;background:#fff8ef;}' +
      '.stk-c.on i{border:none;color:#fff;background:radial-gradient(circle at 35% 30%,#f6cf6b,#d99a2b);box-shadow:0 2px 6px -2px rgba(200,140,40,.6);}' +
      '.stk-c.today i{outline:2px solid var(--accent);outline-offset:2px;}' +
      '.stk-c.today:not(.on) i{animation:stkPulse 1.8s ease-in-out infinite;}' +
      '@keyframes stkPulse{0%,100%{outline-color:rgba(180,138,168,.9)}50%{outline-color:rgba(180,138,168,.2)}}' +
      '.stk-c small{font-size:9.5px;color:var(--ink-soft);line-height:1.2;white-space:nowrap;}' +
      '.stk-c small b{font-weight:400;margin-left:1px;}.stk-c small b.w0{color:#c0605a;}.stk-c small b.w6{color:#5b74b5;}' +
      '.stk-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px;font-size:11px;color:var(--ink-soft);}' +
      '.stk-tot{display:flex;align-items:center;gap:4px;color:#a0784f;}.stk-tot b{font-size:13px;}' +
      '.stk-nx{display:flex;align-items:center;gap:6px;}' +
      '.stk-bar{display:inline-block;width:64px;height:6px;border-radius:3px;background:#f0e3d8;overflow:hidden;}' +
      '.stk-bar i{display:block;height:100%;background:linear-gradient(90deg,#e7a35a,#e2683a);border-radius:3px;}' +
      '.stk-ov{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(74,64,72,.38);animation:stkFade .2s both;}' +
      '.stk-ov.out{animation:stkFade .2s reverse both;}' +
      '@keyframes stkFade{from{opacity:0}to{opacity:1}}' +
      '.stk-box{width:min(330px,100%);background:#fffdf8;border-radius:26px;padding:22px 20px 20px;text-align:center;box-shadow:0 30px 70px -20px rgba(80,50,60,.45);animation:stkCard .35s cubic-bezier(.2,1.4,.4,1) both;}' +
      '@keyframes stkCard{from{transform:translateY(24px) scale(.9);opacity:0}to{transform:none;opacity:1}}' +
      '.stk-kick{font-size:11px;letter-spacing:3px;color:var(--gold);font-weight:600;}' +
      '.stk-burst{position:relative;height:118px;display:flex;align-items:center;justify-content:center;}' +
      '.stk-burst>i{position:absolute;left:50%;top:50%;width:7px;height:7px;border-radius:50%;opacity:0;animation:stkSpark .9s ease-out var(--dl) both;}' +
      '@keyframes stkSpark{0%{transform:translate(-50%,-50%);opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy)));opacity:0}}' +
      '.stk-big{width:96px;height:96px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;' +
      'background:radial-gradient(circle at 35% 30%,#f6cf6b,#d99a2b);border:4px double #fff4d6;box-shadow:0 8px 20px -6px rgba(200,140,40,.7);transform:rotate(-8deg);animation:stkStamp .5s cubic-bezier(.3,1.6,.5,1) .15s both;}' +
      '.stk-big span{font-size:11px;font-weight:600;letter-spacing:1px;margin-top:-2px;}' +
      '.stk-big.gold{background:radial-gradient(circle at 35% 30%,#ffb37a,#e2683a);}' +
      '.stk-big.gold span{font-size:15px;}' +
      '@keyframes stkStamp{0%{transform:scale(2.2) rotate(-25deg);opacity:0}60%{transform:scale(.92) rotate(-8deg);opacity:1}100%{transform:rotate(-8deg)}}' +
      '.stk-h{font-size:14px;color:var(--ink);margin-top:2px;}.stk-h b{font-family:var(--serif);font-size:24px;color:#7a4f3a;margin:0 2px;}' +
      '.stk-sheet{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;justify-items:center;margin:12px auto 4px;max-width:230px;padding:10px;border-radius:14px;background:#fbf3e8;border:1px dashed #e6d2bc;}' +
      '.stk-sheet i{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:11px;color:#cdb9a6;border:1.5px dashed #e3d0bd;background:#fffdf9;}' +
      '.stk-sheet i.on{border:none;color:#fff;background:radial-gradient(circle at 35% 30%,#f6cf6b,#d99a2b);}' +
      '.stk-sheet i.new{animation:stkStamp .5s cubic-bezier(.3,1.6,.5,1) .55s both;}' +
      '.stk-sub{font-size:11px;color:var(--ink-faint);}' +
      '.stk-comp{font-size:13px;font-weight:600;color:#c0662b;}' +
      '.stk-pmsg{font-size:12.5px;margin-top:10px;color:var(--ink);line-height:1.6;}.stk-pmsg.warn{color:#b8542a;font-weight:600;}' +
      '.stk-word{margin-top:12px;padding:10px 12px;border-radius:14px;background:var(--accent-wash);display:flex;flex-direction:column;gap:2px;}' +
      '.stk-word small{font-size:10px;letter-spacing:2px;color:var(--accent-ink);}' +
      '.stk-word b{font-family:var(--serif);font-size:17px;font-weight:600;color:var(--ink);}' +
      '.stk-word span{font-size:11.5px;color:var(--ink-soft);}' +
      '.stk-ok{margin-top:14px;border:none;border-radius:999px;padding:10px 26px;font:inherit;font-size:14px;font-weight:600;color:#fff;background:var(--accent);cursor:pointer;}' +
      '.stk-toast{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:1000;display:flex;align-items:center;gap:10px;padding:10px 16px 10px 10px;border-radius:999px;' +
      'background:#fffdf8;border:1px solid #f0dfcf;box-shadow:0 12px 30px -10px rgba(80,50,60,.4);animation:stkIn .4s cubic-bezier(.2,1.4,.4,1) both;max-width:calc(100% - 24px);}' +
      '.stk-toast.out{animation:stkIn .3s reverse both;}' +
      '@keyframes stkIn{from{transform:translate(-50%,-30px);opacity:0}to{transform:translate(-50%,0);opacity:1}}' +
      '.stk-ti{flex:none;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;background:radial-gradient(circle at 35% 30%,#f6cf6b,#d99a2b);}' +
      '.stk-toast b{display:block;font-size:13px;color:var(--ink);white-space:nowrap;}.stk-toast small{display:block;font-size:11px;color:var(--ink-soft);}';
    document.head.appendChild(st);
  }

  window.Streak = { card: card, mount: mount, loginBonus: loginBonus };
})();
