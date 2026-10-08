/* 成果カード（学習記録ページ）。端末の進み具合とサーバーの集計から、円グラフ入りの画像（1080×1350）を描く。
   右上にニックネーム・ID・作成日時を入れる。本名は入れない（サーバーから届くのはニックネームだけ）。 */
(function () {
  "use strict";
  const W = 1080, H = 1350;
  const C = { bg1: "#f8f1ea", bg2: "#f1e4ea", card: "#fffdfb", edge: "#efe3da", ink: "#4a4048", soft: "#8c8088", faint: "#b6acb1",
    gold: "#c0a06a", conj: "#c97f9b", gram: "#6f9d80", talk: "#7d92c4", track: "#efe6df" };
  const BRAND = '"Cormorant Garamond", serif', SERIF = '"Times New Roman", Tinos, Georgia, serif', SANS = '"Noto Sans JP", "Hiragino Sans", sans-serif';
  const DEER = ["M11.5 9.5C9.6 7.3 9.2 5.1 10 2.8M10.2 5.9 7.4 4.6M12.6 9.2c-.6-1.8-.1-3.4 1-4.6", "M20.5 9.5c1.9-2.2 2.3-4.4 1.5-6.7M21.8 5.9l2.8-1.3M19.4 9.2c.6-1.8.1-3.4-1-4.6",
    "M11.4 11.6 6.6 10.4c.9 1.9 2.6 3 4.9 3.1", "M20.6 11.6l4.8-1.2c-.9 1.9-2.6 3-4.9 3.1",
    "M11.3 11.2c.3-1.4 2.2-2.1 4.7-2.1s4.4.7 4.7 2.1l-1.1 8.2c-.5 3.6-1.9 6.4-3.6 6.4s-3.1-2.8-3.6-6.4z", "M15 24.3h2"];

  function rr(x, y, w, h, r) { const p = new Path2D(); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p; }
  function panel(ctx, x, y, w, h, r) { ctx.fillStyle = C.card; ctx.fill(rr(x, y, w, h, r)); ctx.strokeStyle = C.edge; ctx.lineWidth = 2; ctx.stroke(rr(x, y, w, h, r)); }
  function deer(ctx, x, y, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.lineCap = "round"; ctx.lineJoin = "round";
    DEER.forEach(d => ctx.stroke(new Path2D(d)));
    ctx.fillStyle = col; [[13.9, 14.8], [18.1, 14.8]].forEach(([cx, cy]) => { ctx.beginPath(); ctx.arc(cx, cy, .8, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  }
  function text(ctx, s, x, y, font, col, align) { ctx.font = font; ctx.fillStyle = col; ctx.textAlign = align || "left"; ctx.textBaseline = "alphabetic"; ctx.fillText(s, x, y); }
  /* 幅に収まるまで文字を小さくして書く */
  function fit(ctx, str, x, y, weight, size, maxW, col, align, fam) {
    let f = size; const F = () => weight + " " + f + "px " + (fam || SANS); ctx.font = F();
    while (ctx.measureText(str).width > maxW && f > 12) { f--; ctx.font = F(); }
    ctx.fillStyle = col; ctx.textAlign = align || "right"; ctx.textBaseline = "alphabetic"; ctx.fillText(str, x, y);
  }
  function fade(hex, a) { const n = parseInt(hex.slice(1), 16); return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")"; }
  /* ドーナツ：parts = [{v:0〜1, c:色}] を順に重ねる */
  function donut(ctx, cx, cy, r, th, parts) {
    ctx.lineCap = "butt"; ctx.lineWidth = th;
    ctx.strokeStyle = C.track; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    let a0 = -Math.PI / 2;
    parts.forEach(p => {
      const v = Math.max(0, Math.min(1, p.v)); if (v <= 0) return;
      ctx.strokeStyle = p.c; ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + Math.PI * 2 * v); ctx.stroke();
      a0 += Math.PI * 2 * v;
    });
  }
  /* 横の帯：parts = [{v, c}] */
  function bar(ctx, x, y, w, h, parts) {
    ctx.fillStyle = C.track; ctx.fill(rr(x, y, w, h, h / 2));
    ctx.save(); ctx.clip(rr(x, y, w, h, h / 2));
    let x0 = x; parts.forEach(p => { const ww = w * Math.max(0, Math.min(1, p.v)); ctx.fillStyle = p.c; ctx.fillRect(x0, y, ww, h); x0 += ww; });
    ctx.restore();
  }
  function fmtMin(sec) { const m = Math.round((sec || 0) / 60); return m < 60 ? m + "分" : Math.floor(m / 60) + "時間" + (m % 60 ? (m % 60) + "分" : ""); }

  /* s = { id, nick, stamp, durSec, days, streak, acc,
          gram:[{no,n,tried,m,ch,once,pct}], talk:{n,m,mid,low,seen}, dlg:[{t,best,total}],
          conj:{acc,rounds,ranks:{être,aller,avoir,faire,mix}}, badges } */
  function draw(s) {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, C.bg1); g.addColorStop(1, C.bg2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(192,160,106,.08)"; ctx.beginPath(); ctx.arc(990, 110, 210, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(180,138,168,.08)"; ctx.beginPath(); ctx.arc(60, 1300, 240, 0, Math.PI * 2); ctx.fill();

    // ---- 見出し（ロゴの下に余白をとって副題） ----
    deer(ctx, 66, 40, 3.2, C.gold);
    text(ctx, "Naralingo", 178, 112, "italic 600 76px " + BRAND, "#5a4e57");
    text(ctx, "MES PROGRÈS · 学習のきろく", 182, 170, "500 23px " + SANS, C.gold);
    // 右上：ニックネーム・ID・作成日時
    fit(ctx, s.nick || "ニックネーム未登録", W - 64, 92, 700, 36, 400, s.nick ? C.ink : C.faint);
    fit(ctx, "ID  " + s.id, W - 64, 134, 500, 25, 400, C.soft);
    fit(ctx, "作成 " + s.stamp, W - 64, 170, 400, 22, 400, C.soft);

    // ---- 数字の4枚 ----
    const tiles = [[fmtMin(s.durSec), "学習時間"], [s.days + "日", "学習した日"], [s.streak + "日", "継続"], [s.acc == null ? "—" : s.acc + "%", "通算正答率"]];
    tiles.forEach((t, i) => {
      const x = 52 + i * 248, y = 206;
      panel(ctx, x, y, 232, 122, 24);
      fit(ctx, t[0], x + 116, y + 68, 700, 44, 210, C.ink, "center");
      text(ctx, t[1], x + 116, y + 104, "400 21px " + SANS, C.soft, "center");
    });

    // ---- 達成度：3つの円 ----
    panel(ctx, 40, 350, W - 80, 430, 32);
    text(ctx, "達成度", 76, 398, "700 26px " + SANS, C.ink);
    const gN = s.gram.reduce((a, x) => a + x.n, 0) || 1;
    const gM = s.gram.reduce((a, x) => a + x.m, 0), gC = s.gram.reduce((a, x) => a + x.ch, 0), gT = s.gram.reduce((a, x) => a + x.tried, 0);
    const gP = s.gram.reduce((a, x) => a + (x.pts != null ? x.pts : x.m * 4 + x.ch * 2), 0);
    const gPct = Math.floor(gP / (gN * 4) * 100);
    const T = s.talk, D = s.conj;
    const rings = [
      { x: 205, c: C.conj, name: "動詞活用", big: D.acc == null ? "—" : D.acc + "%", sub: "正答率",
        parts: [{ v: (D.acc || 0) / 100, c: C.conj }], l1: (D.rounds || 0) + " ラウンド", l2: "" },
      { x: 540, c: C.gram, name: "文法練習", big: gPct + "%", sub: "達成率",
        parts: [{ v: gM / gN, c: C.gram }, { v: Math.max(0, gPct / 100 - gM / gN), c: fade(C.gram, .45) }], l1: "挑戦 " + gT + " / " + gN + " 問", l2: "習得 " + gM + " 問" },
      { x: 875, c: C.talk, name: "会話フレーズ", big: (T.pct != null ? T.pct : T.m) + "%", sub: "達成率",
        parts: [{ v: T.m / 100, c: C.talk }, { v: Math.max(0, (T.pct || 0) / 100 - T.m / 100), c: fade(C.talk, .45) }], l1: "挑戦 " + T.seen + " / 100", l2: "習得 " + T.m + "・練習中 " + (T.mid + T.low) }
    ];
    rings.forEach(r => {
      donut(ctx, r.x, 548, 104, 28, r.parts);
      fit(ctx, r.big, r.x, 562, 700, 54, 150, C.ink, "center");
      text(ctx, r.sub, r.x, 598, "400 19px " + SANS, C.soft, "center");
      ctx.fillStyle = r.c; ctx.beginPath(); ctx.arc(r.x - text.w(ctx, r.name) / 2 - 16, 700, 8, 0, Math.PI * 2); ctx.fill();
      text(ctx, r.name, r.x + 6, 709, "700 26px " + SANS, C.ink, "center");
      text(ctx, r.l1, r.x, 742, "400 20px " + SANS, C.soft, "center");
      if (r.l2) text(ctx, r.l2, r.x, 768, "400 18px " + SANS, C.faint, "center");
    });
    // 動詞活用の円の下：ランク
    const rk = ["être", "aller", "avoir", "faire"].map(v => D.ranks[v] || "—").join(" ");
    text(ctx, "ランク " + rk, 205, 768, "400 18px " + SANS, C.faint, "center");

    // ---- 文法：Leçon ごと ----
    panel(ctx, 40, 800, W - 80, 300, 32);
    text(ctx, "文法練習　Leçon ごと", 76, 846, "700 24px " + SANS, C.ink);
    [[C.gram, "習得"], [fade(C.gram, .45), "もう少し"], [fade(C.gram, .2), "1点"]].forEach((l, i) => {
      const x = 560 + i * 150; ctx.fillStyle = l[0]; ctx.fillRect(x, 830, 22, 14); text(ctx, l[1], x + 28, 845, "400 17px " + SANS, C.soft);
    });
    s.gram.forEach((l, i) => {
      const y = 868 + i * 36;
      text(ctx, "Leçon " + l.no, 76, y + 17, "italic 400 24px " + SERIF, C.soft);
      bar(ctx, 196, y + 2, 640, 18, [{ v: l.m / l.n, c: C.gram }, { v: l.ch / l.n, c: fade(C.gram, .45) }, { v: (l.once || 0) / l.n, c: fade(C.gram, .2) }]);
      text(ctx, l.pct + "%", 920, y + 18, "700 20px " + SANS, C.ink, "right");
      text(ctx, l.tried ? l.tried + "/" + l.n : "まだ", 1012, y + 18, "400 16px " + SANS, C.faint, "right");
    });

    // ---- 下の段：対話・ランク・バッジ ----
    panel(ctx, 40, 1120, 520, 196, 28);
    text(ctx, "対話（最高点）", 72, 1160, "700 22px " + SANS, C.ink);
    (s.dlg || []).forEach((d, i) => {
      const x = 72 + (i % 2) * 244, y = 1196 + Math.floor(i / 2) * 56;
      fit(ctx, d.t, x, y, 400, 18, 150, C.soft, "left");
      const v = d.best == null ? "まだ" : d.best + " / " + d.total;
      text(ctx, v, x + 228, y, (d.best == null ? "400 18px " : "700 22px ") + SANS, d.best == null ? C.faint : C.ink, "right");
      bar(ctx, x, y + 12, 228, 8, [{ v: d.best == null ? 0 : d.best / d.total, c: C.talk }]);
    });
    panel(ctx, 580, 1120, 460, 196, 28);
    text(ctx, "動詞活用ランク", 612, 1160, "700 22px " + SANS, C.ink);
    text(ctx, "記述式・全問正解", 1010, 1160, "400 16px " + SANS, C.faint, "right");
    ["être", "aller", "avoir", "faire", "mix"].forEach((v, i) => {
      const x = 640 + i * 82;
      text(ctx, v === "mix" ? "総合" : v, x, 1200, (v === "mix" ? "400 17px " + SANS : "italic 400 21px " + SERIF), C.soft, "center");
      const r = D.ranks[v];
      text(ctx, r || "—", x, 1240, "700 28px " + SERIF, r ? C.conj : C.faint, "center");
    });
    for (let i = 0; i < Math.min(6, Math.max(1, s.badges)); i++) {
      const bx = 626 + i * 22; ctx.fillStyle = s.badges ? (i % 2 ? "#d9b877" : C.gold) : C.track;
      ctx.beginPath(); ctx.arc(bx, 1284, 15, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.stroke();
    }
    text(ctx, "バッジ " + s.badges + " 個", 1010, 1292, "700 22px " + SANS, C.ink, "right");
    return cv;
  }
  text.w = function (ctx, s) { ctx.font = "700 26px " + SANS; return ctx.measureText(s).width; };
  /* 描く前に、使う字形のフォントを読み込んでおく */
  function ready(sample) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('italic 600 76px "Cormorant Garamond"', "Naralingo"),
      document.fonts.load('italic 400 24px Tinos', "Leçon être aller avoir faire"),
      document.fonts.load('700 28px Tinos', "SSS ABC"),
      document.fonts.load('400 20px "Noto Sans JP"', sample),
      document.fonts.load('700 26px "Noto Sans JP"', sample)
    ]).catch(() => {}).then(() => new Promise(r => setTimeout(r, 50)));
  }
  window.NLCard = { draw, ready };
})();
