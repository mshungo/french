/* 成果カード（学習記録ページ）。端末の記録とサーバーの集計から、円グラフ入りの画像（1080×1350）を描く。
   名前もIDも描かない（画像を人に見せても、だれのものか分からないように）。 */
(function () {
  "use strict";
  const W = 1080, H = 1350;
  const C = { bg1: "#f8f1ea", bg2: "#f1e4ea", card: "#fffdfb", edge: "#efe3da", ink: "#4a4048", soft: "#8c8088", faint: "#b6acb1",
    gold: "#c0a06a", conj: "#c97f9b", gram: "#6f9d80", talk: "#7d92c4", track: "#efe6df" };
  const SERIF = '"Cormorant Garamond", serif', SANS = '"Noto Sans JP", "Hiragino Sans", sans-serif';
  const DEER = ["M11.5 9.5C9.6 7.3 9.2 5.1 10 2.8M10.2 5.9 7.4 4.6M12.6 9.2c-.6-1.8-.1-3.4 1-4.6", "M20.5 9.5c1.9-2.2 2.3-4.4 1.5-6.7M21.8 5.9l2.8-1.3M19.4 9.2c.6-1.8.1-3.4-1-4.6",
    "M11.4 11.6 6.6 10.4c.9 1.9 2.6 3 4.9 3.1", "M20.6 11.6l4.8-1.2c-.9 1.9-2.6 3-4.9 3.1",
    "M11.3 11.2c.3-1.4 2.2-2.1 4.7-2.1s4.4.7 4.7 2.1l-1.1 8.2c-.5 3.6-1.9 6.4-3.6 6.4s-3.1-2.8-3.6-6.4z", "M15 24.3h2"];

  function rr(x, y, w, h, r) { const p = new Path2D(); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p; }
  function deer(ctx, x, y, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.lineCap = "round"; ctx.lineJoin = "round";
    DEER.forEach(d => ctx.stroke(new Path2D(d)));
    ctx.fillStyle = col; [[13.9, 14.8], [18.1, 14.8]].forEach(([cx, cy]) => { ctx.beginPath(); ctx.arc(cx, cy, .8, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  }
  function text(ctx, s, x, y, font, col, align) { ctx.font = font; ctx.fillStyle = col; ctx.textAlign = align || "left"; ctx.textBaseline = "alphabetic"; ctx.fillText(s, x, y); }
  /* ドーナツ：parts = [{v:0〜1, c:色}]（重ねて描く） */
  function donut(ctx, cx, cy, r, th, parts) {
    ctx.lineCap = "butt"; ctx.lineWidth = th;
    ctx.strokeStyle = C.track; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    let a0 = -Math.PI / 2;
    parts.forEach(p => {
      const v = Math.max(0, Math.min(1, p.v)); if (v <= 0) return;
      ctx.strokeStyle = p.c; ctx.lineCap = "butt"; ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + Math.PI * 2 * v - (v < 1 ? 0.0001 : 0)); ctx.stroke();
      a0 += Math.PI * 2 * v;
    });
  }
  function fade(hex, a) { const n = parseInt(hex.slice(1), 16); return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")"; }

  /* s = { date, durSec, days, streak, acc, rounds, gram:[{no,n,m,ch}], talk:{m,n,dlg:{best,total}|null}, conj:{acc, ranks:{être:"S",…}}, badges, quote:{fr,ja} } */
  function draw(s) {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, C.bg1); g.addColorStop(1, C.bg2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // 飾りの円
    ctx.fillStyle = "rgba(192,160,106,.08)"; ctx.beginPath(); ctx.arc(980, 120, 220, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(180,138,168,.08)"; ctx.beginPath(); ctx.arc(60, 1290, 260, 0, Math.PI * 2); ctx.fill();

    // 見出し
    deer(ctx, 74, 54, 3.4, C.gold);
    text(ctx, "Naralingo", 190, 128, "italic 600 84px " + SERIF, "#5a4e57");
    text(ctx, "MES PROGRÈS · 学習のきろく", 194, 172, "500 24px " + SANS, C.gold);
    text(ctx, s.date, W - 70, 172, "500 26px " + SANS, C.soft, "right");

    // 数字の4枚
    const tiles = [[fmtMin(s.durSec), "学習時間"], [s.days + "日", "学習した日"], [s.streak + "日", "連続"], [s.acc == null ? "—" : s.acc + "%", "通算正答率"]];
    tiles.forEach((t, i) => {
      const x = 60 + i * 245, y = 214;
      ctx.fillStyle = C.card; ctx.fill(rr(x, y, 225, 132, 26)); ctx.strokeStyle = C.edge; ctx.lineWidth = 2; ctx.stroke(rr(x, y, 225, 132, 26));
      text(ctx, t[0], x + 112, y + 72, "700 " + (t[0].length > 6 ? 32 : t[0].length > 4 ? 40 : 46) + "px " + SANS, C.ink, "center");
      text(ctx, t[1], x + 112, y + 110, "400 22px " + SANS, C.soft, "center");
    });

    // ドーナツ3つ
    const gN = s.gram.reduce((a, x) => a + x.n, 0) || 1, gM = s.gram.reduce((a, x) => a + x.m, 0), gC = s.gram.reduce((a, x) => a + x.ch, 0);
    const gPct = Math.floor((gM + gC * 0.5) / gN * 100);
    const tPct = s.talk.n ? Math.floor(s.talk.m / s.talk.n * 100) : 0;
    const rings = [
      { x: 205, c: C.conj, t: "動詞活用", big: s.conj.acc == null ? "—" : s.conj.acc + "%", sub: "正答率", parts: [{ v: (s.conj.acc || 0) / 100, c: C.conj }] },
      { x: 540, c: C.gram, t: "文法練習", big: gPct + "%", sub: "達成率", parts: [{ v: gM / gN, c: C.gram }, { v: gC * 0.5 / gN, c: fade(C.gram, .4) }] },
      { x: 875, c: C.talk, t: "会話練習", big: s.talk.m + "", sub: "/ " + s.talk.n + " フレーズ", parts: [{ v: tPct / 100, c: C.talk }] }
    ];
    ctx.fillStyle = C.card; ctx.fill(rr(40, 380, W - 80, 380, 34)); ctx.strokeStyle = C.edge; ctx.lineWidth = 2; ctx.stroke(rr(40, 380, W - 80, 380, 34));
    rings.forEach(r => {
      donut(ctx, r.x, 548, 112, 30, r.parts);
      text(ctx, r.big, r.x, 562, "700 " + (r.big.length > 4 ? 46 : 56) + "px " + SANS, C.ink, "center");
      text(ctx, r.sub, r.x, 600, "400 20px " + SANS, C.soft, "center");
      ctx.fillStyle = r.c; ctx.beginPath(); ctx.arc(r.x - 70, 716, 8, 0, Math.PI * 2); ctx.fill();
      text(ctx, r.t, r.x - 54, 725, "500 28px " + SANS, C.ink);
    });

    // 文法：Leçon ごとの帯（濃い＝記述で習得、薄い＝選択でできた）
    ctx.fillStyle = C.card; ctx.fill(rr(40, 790, W - 80, 330, 34)); ctx.strokeStyle = C.edge; ctx.lineWidth = 2; ctx.stroke(rr(40, 790, W - 80, 330, 34));
    text(ctx, "文法練習　Leçon ごとの達成", 80, 846, "500 26px " + SANS, C.ink);
    ctx.fillStyle = C.gram; ctx.fillRect(660, 828, 26, 14); text(ctx, "記述で習得", 694, 843, "400 19px " + SANS, C.soft);
    ctx.fillStyle = fade(C.gram, .4); ctx.fillRect(820, 828, 26, 14); text(ctx, "選択でできた", 854, 843, "400 19px " + SANS, C.soft);
    s.gram.forEach((l, i) => {
      const y = 884 + i * 38, x0 = 210, bw = 680;
      text(ctx, "Leçon " + l.no, 80, y + 17, "italic 600 27px " + SERIF, C.soft);
      ctx.fillStyle = C.track; ctx.fill(rr(x0, y, bw, 20, 10));
      const wm = bw * l.m / l.n, wc = bw * l.ch / l.n;
      ctx.save(); ctx.clip(rr(x0, y, bw, 20, 10));
      ctx.fillStyle = C.gram; ctx.fillRect(x0, y, wm, 20);
      ctx.fillStyle = fade(C.gram, .4); ctx.fillRect(x0 + wm, y, wc, 20);
      ctx.restore();
      text(ctx, Math.floor((l.m + l.ch * 0.5) / l.n * 100) + "%", 1000, y + 18, "500 22px " + SANS, C.ink, "right");
    });

    // 下の段：バッジ・ランク・対話
    ctx.fillStyle = C.card; ctx.fill(rr(40, 1146, 500, 120, 30)); ctx.strokeStyle = C.edge; ctx.stroke(rr(40, 1146, 500, 120, 30));
    for (let i = 0; i < Math.min(5, Math.max(1, s.badges)); i++) {
      const bx = 96 + i * 30; ctx.fillStyle = s.badges ? (i % 2 ? "#d9b877" : C.gold) : C.track;
      ctx.beginPath(); ctx.arc(bx, 1206, 24, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
    }
    text(ctx, "バッジ", 260, 1196, "400 22px " + SANS, C.soft);
    text(ctx, s.badges + " 個", 260, 1238, "700 38px " + SANS, C.ink);
    ctx.fillStyle = C.card; ctx.fill(rr(560, 1146, 480, 120, 30)); ctx.strokeStyle = C.edge; ctx.lineWidth = 2; ctx.stroke(rr(560, 1146, 480, 120, 30));
    text(ctx, "動詞活用ランク（記述式）", 590, 1186, "400 20px " + SANS, C.soft);
    ["être", "aller", "avoir", "faire"].forEach((v, i) => {
      const x = 600 + i * 108, rk = s.conj.ranks[v] || "—";
      text(ctx, v, x + 40, 1214, "italic 600 24px " + SERIF, C.soft, "center");
      text(ctx, rk, x + 40, 1250, "700 30px " + SERIF, rk === "—" ? C.faint : C.conj, "center");
    });

    // ことば
    if (s.quote) {
      text(ctx, "« " + s.quote.fr + " »", W / 2, 1304, "italic 600 " + (s.quote.fr.length > 44 ? 26 : 32) + "px " + SERIF, "#6a5c66", "center");
      text(ctx, s.quote.ja, W / 2, 1336, "400 19px " + SANS, C.soft, "center");
    }
    return cv;
  }
  function fmtMin(sec) { const m = Math.round((sec || 0) / 60); return m < 60 ? m + "分" : Math.floor(m / 60) + "時間" + (m % 60 ? (m % 60) + "分" : ""); }
  /* 描く前に、使う字形のフォントを読み込んでおく */
  function ready(sample) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('italic 600 84px "Cormorant Garamond"', "Naralingo Leçon être aller avoir faire SSS"),
      document.fonts.load('600 40px "Cormorant Garamond"', "SSS ABC"),
      document.fonts.load('400 22px "Noto Sans JP"', sample),
      document.fonts.load('500 26px "Noto Sans JP"', sample),
      document.fonts.load('700 46px "Noto Sans JP"', sample)
    ]).catch(() => {}).then(() => new Promise(r => setTimeout(r, 50)));
  }
  window.NLCard = { draw, ready };
})();
