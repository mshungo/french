/* 達成バッジ（文法練習・会話練習・メニューで共通）
   Badge.seal({kind, on, pct, color, label, size, title}) … バッジ1個のSVG
     kind: "sec"（項目をすべて習得）/ "clear"（累計解答でクリア）/ "medal"（全問習得の勲章）
   Badge.shelf({title, items:[…seal opts…], big:[…]}) … バッジを並べた棚
   Badge.celebrate([{kind, color, name, sub}]) … 獲得したときのお祝い表示 */
(function () {
  "use strict";
  var n = 0;
  var DEER =
    '<path d="M11.5 9.5C9.6 7.3 9.2 5.1 10 2.8M10.2 5.9 7.4 4.6M12.6 9.2c-.6-1.8-.1-3.4 1-4.6"/>' +
    '<path d="M20.5 9.5c1.9-2.2 2.3-4.4 1.5-6.7M21.8 5.9l2.8-1.3M19.4 9.2c.6-1.8.1-3.4-1-4.6"/>' +
    '<path d="M11.4 11.6 6.6 10.4c.9 1.9 2.6 3 4.9 3.1"/><path d="M20.6 11.6l4.8-1.2c-.9 1.9-2.6 3-4.9 3.1"/>' +
    '<path d="M11.3 11.2c.3-1.4 2.2-2.1 4.7-2.1s4.4.7 4.7 2.1l-1.1 8.2c-.5 3.6-1.9 6.4-3.6 6.4s-3.1-2.8-3.6-6.4z"/>' +
    '<circle cx="13.9" cy="14.8" r=".8" fill="currentColor" stroke="none"/><circle cx="18.1" cy="14.8" r=".8" fill="currentColor" stroke="none"/>' +
    '<path d="M15 24.3h2"/>';
  var STAR = '<path d="M24 12.6l2.9 6.2 6.7.8-5 4.6 1.3 6.6L24 27.5l-5.9 3.3 1.3-6.6-5-4.6 6.7-.8z"/>';

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  // ぎざぎざの縁（ロゼット）
  function rosette(cx, cy, r1, r2, k) {
    var p = [];
    for (var i = 0; i < k * 2; i++) {
      var a = Math.PI * i / k - Math.PI / 2, r = i % 2 ? r2 : r1;
      p.push((cx + r * Math.cos(a)).toFixed(2) + "," + (cy + r * Math.sin(a)).toFixed(2));
    }
    return "M" + p.join("L") + "Z";
  }
  // 月桂樹の葉（勲章用）：下から左右の上へ、円に沿って並べる
  function laurel(cx, cy, R, side) {
    var h = "";
    for (var i = 0; i < 7; i++) {
      var deg = side < 0 ? 112 + i * 17 : 68 - i * 17, a = deg * Math.PI / 180;
      var x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      h += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="2.2" ry="4.4" transform="rotate(' + (deg + (side < 0 ? 18 : -18)) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
    }
    return h;
  }

  function seal(o) {
    o = o || {};
    var id = "bg" + (++n), kind = o.kind || "sec", on = !!o.on, size = o.size || 40;
    var col = o.color || "#c0a06a", medal = kind === "medal";
    var vb = medal ? "-6 -4 60 66" : "0 0 48 58";
    var s = '<svg class="bdg-svg" width="' + size + '" height="' + Math.round(size * (medal ? 66 / 60 : 58 / 48)) +
      '" viewBox="' + vb + '" aria-hidden="true">';
    if (on) {
      var g1 = kind === "clear" ? ["#f4f1ee", "#b9b2ae"] : ["#f8dc86", "#c48d27"];
      var g2 = kind === "clear" ? ["#ffffff", "#ddd6d1"] : ["#fff6cf", "#ebc25e"];
      var ink = kind === "clear" ? "#7c726f" : "#8a5a10";
      s += '<defs><linearGradient id="' + id + 'a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + g1[0] + '"/><stop offset="1" stop-color="' + g1[1] + '"/></linearGradient>' +
        '<radialGradient id="' + id + 'b" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="' + g2[0] + '"/><stop offset="1" stop-color="' + g2[1] + '"/></radialGradient>' +
        '<clipPath id="' + id + 'c"><circle cx="24" cy="22" r="14.5"/></clipPath></defs>';
      if (medal) s += '<g fill="#8db79b" stroke="#6c9a7f" stroke-width=".5">' + laurel(24, 22, 25, -1) + laurel(24, 22, 25, 1) + '</g>';
      var rib = medal ? "#c25b5b" : kind === "clear" ? "#b48aa8" : col;
      s += '<path d="M17 31 10.5 55l6.3-3.6L20.2 57 26 34z" fill="' + rib + '"/><path d="M31 31l6.5 24-6.3-3.6L27.8 57 22 34z" fill="' + rib + '"/>' +
        '<path d="M17 31 10.5 55l6.3-3.6L20.2 57 26 34z" fill="#000" opacity=".12"/>' +
        '<path d="' + rosette(24, 22, 20, 18, 18) + '" fill="url(#' + id + 'a)" stroke="' + ink + '" stroke-opacity=".35" stroke-width=".6" stroke-linejoin="round"/>' +
        '<circle cx="24" cy="22" r="14.5" fill="url(#' + id + 'b)" stroke="' + ink + '" stroke-opacity=".55" stroke-width=".8"/>' +
        '<circle cx="24" cy="22" r="12.4" fill="none" stroke="' + ink + '" stroke-opacity=".35" stroke-width=".6" stroke-dasharray=".7 1.7"/>';
      if (kind === "clear") s += '<g fill="' + ink + '" opacity=".85">' + STAR + '</g>';
      else s += '<g transform="translate(12.5 11.6) scale(.72)" fill="none" stroke="' + ink + '" color="' + ink + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + DEER + '</g>';
      s += '<g clip-path="url(#' + id + 'c)"><ellipse class="bdg-shine" cx="17" cy="12" rx="13" ry="5" fill="#fff" opacity=".42" transform="rotate(-35 17 12)"/></g>';
    } else {
      var pct = Math.max(0, Math.min(1, o.pct || 0)), C = 2 * Math.PI * 17;
      s += '<path d="' + rosette(24, 22, 20, 18, 18) + '" fill="#f6f1ec" stroke="#ddd2c8" stroke-width=".8" stroke-dasharray="1.6 1.6" stroke-linejoin="round"/>' +
        '<circle cx="24" cy="22" r="17" fill="none" stroke="#ebe3dc" stroke-width="2.6"/>' +
        (pct > 0 ? '<circle cx="24" cy="22" r="17" fill="none" stroke="' + (kind === "sec" ? col : kind === "clear" ? "#b48aa8" : "#c0a06a") +
          '" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="' + (C * pct).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 24 22)"/>' : '') +
        '<circle cx="24" cy="22" r="13" fill="#fff"/>' +
        '<text x="24" y="' + (o.label && String(o.label).length > 2 ? 25 : 26.5) + '" text-anchor="middle" font-family="Times New Roman,Tinos,Georgia,serif" font-weight="600" font-size="' +
        (o.label && String(o.label).length > 2 ? 9 : 13) + '" fill="#b6acb1">' + esc(o.label == null ? "" : o.label) + '</text>';
    }
    return s + "</svg>";
  }

  function shelf(o) {
    var items = o.items || [], big = o.big || [];
    var got = items.filter(function (x) { return x.on; }).length;
    var cell = function (x, sz) {
      return '<div class="bdg-cell' + (x.on ? " on" : "") + (x.fresh ? " fresh" : "") + '" title="' + esc(x.title || "") + '">' +
        seal({ kind: x.kind, on: x.on, pct: x.pct, color: x.color, label: x.label, size: sz }) +
        '<span class="bdg-cap">' + esc(x.cap || "") + '</span></div>';
    };
    return '<div class="bdg-shelf">' +
      '<div class="bdg-head"><span class="bdg-t">' + esc(o.title || "バッジ") + '</span><span class="bdg-n"><b>' + got + '</b> / ' + items.length + '</span></div>' +
      '<div class="bdg-row">' + items.map(function (x) { return cell(x, 40); }).join("") + '</div>' +
      (big.length ? '<div class="bdg-bigrow">' + big.map(function (x) {
        return '<div class="bdg-chip' + (x.on ? " on" : "") + (x.fresh ? " fresh" : "") + '">' +
          seal({ kind: x.kind, on: x.on, pct: x.pct, color: x.color, label: "", size: x.kind === "medal" ? 40 : 34 }) +
          '<span class="bdg-chip-tx"><b>' + esc(x.cap || "") + '</b><small>' + esc(x.status || "") + '</small></span></div>';
      }).join("") + '</div>' : "") +
      '</div>';
  }

  /* ---- 獲得のお祝い ---- */
  var queue = [], showing = false;
  function celebrate(list) {
    (list || []).forEach(function (x) { queue.push(x); });
    if (!showing) next();
  }
  function next() {
    var x = queue.shift();
    if (!x) { showing = false; return; }
    showing = true;
    var ov = document.createElement("div");
    ov.className = "bdg-ov";
    var sparks = "";
    for (var i = 0; i < 14; i++) {
      var a = i / 14 * 2 * Math.PI, d = 74 + (i % 3) * 16;
      sparks += '<i style="--dx:' + (Math.cos(a) * d).toFixed(0) + 'px;--dy:' + (Math.sin(a) * d).toFixed(0) + 'px;--dl:' + (i % 4) * 40 + 'ms;' +
        'background:' + ["#f2c94c", "#e8a0b4", "#8db79b", "#92a6cf"][i % 4] + '"></i>';
    }
    var head = x.kind === "medal" ? "勲章を獲得しました" : x.kind === "clear" ? "クリア！" : "バッジを獲得しました";
    ov.innerHTML = '<div class="bdg-card" role="dialog" aria-live="polite">' +
      '<div class="bdg-burst">' + sparks + '<div class="bdg-big">' + seal({ kind: x.kind || "sec", on: true, color: x.color, size: 104 }) + '</div></div>' +
      '<div class="bdg-kick">' + head + '</div>' +
      '<div class="bdg-name">' + esc(x.name || "") + '</div>' +
      (x.sub ? '<div class="bdg-sub">' + esc(x.sub) + '</div>' : "") +
      '<button class="bdg-ok">やったね</button></div>';
    document.body.appendChild(ov);
    try { if (typeof window.playFanfare === "function") window.playFanfare(); } catch (e) {}
    var close = function () {
      ov.classList.add("out");
      setTimeout(function () { ov.remove(); next(); }, 220);
    };
    ov.querySelector(".bdg-ok").onclick = close;
    ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
  }

  /* ---- スタイル ---- */
  var css =
    '.bdg-shelf{margin:14px 0 0;padding:14px 16px 12px;border:1px solid #efe3d2;border-radius:18px;' +
    'background:linear-gradient(180deg,#fffaf0,#fdf7f2);}' +
    '.bdg-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px;}' +
    '.bdg-t{font-size:11.5px;letter-spacing:2px;color:#9a7b45;font-weight:500;}' +
    '.bdg-n{font-family:var(--serif);font-size:15px;color:#b6acb1;}' +
    '.bdg-n b{font-size:20px;color:#9a7b45;font-weight:600;}' +
    '.bdg-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(44px,1fr));align-items:end;justify-items:center;gap:8px 4px;}' +
    '.bdg-cell{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:44px;}' +
    '.bdg-cell .bdg-svg{display:block;transition:transform .2s;}' +
    '.bdg-cell.on .bdg-svg{filter:drop-shadow(0 3px 4px rgba(150,100,20,.22));}' +
    '.bdg-cell.on:hover .bdg-svg{transform:translateY(-2px) rotate(-4deg);}' +
    '.bdg-cell.fresh .bdg-svg{animation:bdgPop .7s cubic-bezier(.2,1.6,.4,1) both;}' +
    '.bdg-cap{font-size:9.5px;color:#b6acb1;letter-spacing:.5px;white-space:nowrap;}' +
    '.bdg-cell.on .bdg-cap{color:#9a7b45;font-weight:500;}' +
    '.bdg-bigrow{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;padding-top:10px;border-top:1px dashed #efe3d2;}' +
    '.bdg-chip{display:flex;align-items:center;gap:8px;min-width:0;}' +
    '.bdg-chip .bdg-svg{flex:none;display:block;}' +
    '.bdg-chip.on .bdg-svg{filter:drop-shadow(0 3px 4px rgba(150,100,20,.22));}' +
    '.bdg-chip.fresh .bdg-svg{animation:bdgPop .7s cubic-bezier(.2,1.6,.4,1) both;}' +
    '.bdg-chip-tx{display:flex;flex-direction:column;min-width:0;line-height:1.35;}' +
    '.bdg-chip-tx b{font-size:12px;font-weight:500;color:#b6acb1;letter-spacing:1px;}' +
    '.bdg-chip.on .bdg-chip-tx b{color:#9a7b45;}' +
    '.bdg-chip-tx small{font-size:10.5px;color:#b6acb1;white-space:nowrap;}' +
    '.bdg-shine{animation:bdgShine 3.6s ease-in-out infinite;}' +
    '@keyframes bdgShine{0%,70%{transform:translate(-18px,8px) rotate(-35deg);opacity:0}80%{opacity:.5}100%{transform:translate(22px,-6px) rotate(-35deg);opacity:0}}' +
    '@keyframes bdgPop{0%{transform:scale(.2) rotate(-25deg);opacity:0}100%{transform:none;opacity:1}}' +
    /* 項目ボタンの「習得済み」 */
    '.start-btn.mastered{border-color:#e2c27a;background:linear-gradient(100deg,#fff 40%,#fff8e6);}' +
    '.start-btn.mastered .sb-prog{flex-direction:row;align-items:center;gap:6px;color:#9a7b45;font-weight:500;}' +
    '.start-btn.mastered .sb-prog .bdg-svg{margin:-6px 0 -8px;filter:drop-shadow(0 2px 3px rgba(150,100,20,.25));}' +
    '.sb-done{display:flex;flex-direction:column;align-items:flex-end;line-height:1.3;}' +
    '.sb-done small{font-family:var(--serif);font-style:italic;font-size:12px;letter-spacing:1px;color:#c0a06a;font-weight:500;}' +
    /* お祝い */
    '.bdg-ov{position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;' +
    'background:rgba(60,45,50,.38);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:bdgFade .25s both;}' +
    '.bdg-ov.out{animation:bdgFade .2s reverse both;}' +
    '@keyframes bdgFade{from{opacity:0}to{opacity:1}}' +
    '.bdg-card{width:min(320px,100%);background:#fffdf8;border-radius:26px;padding:26px 22px 22px;text-align:center;' +
    'box-shadow:0 30px 60px -20px rgba(80,50,30,.45);border:1px solid #f0e2c6;animation:bdgCard .5s cubic-bezier(.2,1.4,.4,1) both;}' +
    '@keyframes bdgCard{from{transform:translateY(24px) scale(.9);opacity:0}to{transform:none;opacity:1}}' +
    '.bdg-burst{position:relative;height:136px;display:flex;align-items:center;justify-content:center;}' +
    '.bdg-burst:before{content:"";position:absolute;width:150px;height:150px;border-radius:50%;' +
    'background:radial-gradient(circle,rgba(255,226,140,.55),rgba(255,226,140,0) 68%);animation:bdgGlow 2.4s ease-in-out infinite;}' +
    '@keyframes bdgGlow{0%,100%{transform:scale(.9);opacity:.8}50%{transform:scale(1.08);opacity:1}}' +
    '.bdg-big{position:relative;animation:bdgPop .8s .1s cubic-bezier(.2,1.6,.4,1) both;filter:drop-shadow(0 8px 10px rgba(150,100,20,.3));}' +
    '.bdg-burst i{position:absolute;left:50%;top:50%;width:7px;height:7px;margin:-3.5px;border-radius:2px;transform:rotate(45deg);opacity:0;' +
    'animation:bdgSpark .9s var(--dl) ease-out both;}' +
    '@keyframes bdgSpark{0%{opacity:1;transform:translate(0,0) rotate(45deg) scale(.4)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(225deg) scale(1)}}' +
    '.bdg-kick{margin-top:10px;font-size:11.5px;letter-spacing:3px;color:#c0a06a;font-weight:500;}' +
    '.bdg-name{margin-top:6px;font-size:19px;font-weight:700;color:#4a4048;line-height:1.4;}' +
    '.bdg-sub{margin-top:6px;font-size:12px;color:#8c8088;line-height:1.7;}' +
    '.bdg-ok{margin-top:18px;padding:11px 34px;border:none;border-radius:24px;cursor:pointer;font:inherit;font-size:14px;letter-spacing:2px;color:#fff;' +
    'background:linear-gradient(135deg,#d9ad55,#b8862f);box-shadow:0 8px 16px -8px rgba(150,100,20,.6);}' +
    '.bdg-ok:focus-visible{outline:2px solid #b8862f;outline-offset:3px;}' +
    '.bdg-mini{display:inline-flex;align-items:center;gap:3px;vertical-align:-3px;}' +
    '@media(prefers-reduced-motion:reduce){.bdg-shine,.bdg-burst i,.bdg-burst:before,.bdg-big,.bdg-card,.bdg-cell.fresh .bdg-svg,.bdg-chip.fresh .bdg-svg{animation:none!important;}}';
  function addCss() {
    if (document.getElementById("bdg-css")) return;
    var st = document.createElement("style"); st.id = "bdg-css"; st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }
  addCss();

  window.Badge = { seal: seal, shelf: shelf, celebrate: celebrate };
})();
