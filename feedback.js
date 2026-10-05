/* 問題の報告コーナー（各ページの一番下）。common.js のあとに読み込む。
   ログイン中だけ表示し、種類をタップ →（ひとこと）→ 送る、で先生のスプレッドシート「フィードバック」に1行追加される。
   そのとき画面に出ていた問題の文も自動で添える。 */
(function () {
  "use strict";
  var KINDS = ["答えがおかしい", "選択肢がおかしい", "訳・解説がおかしい", "音声・表示の不具合", "その他"];
  var Q = window.Quiz;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function visible(el) { return !!(el && el.offsetParent !== null && !el.classList.contains("hidden")); }

  /* いま画面に出ている問題（または結果）の文字を拾う */
  function screenText() {
    var ids = ["quizScreen", "resultScreen"], el = null;
    for (var i = 0; i < ids.length; i++) { var e = document.getElementById(ids[i]); if (visible(e)) { el = e; break; } }
    if (!el) return "";
    var t = (el.innerText || el.textContent || "").replace(/[ \t]+/g, " ").split("\n").map(function (x) { return x.trim(); })
      .filter(function (x) { return x && !/^[←→×]$/.test(x) && !/^\d+(\.\d+)?秒$/.test(x) && !/^\d+ \/ \d+$/.test(x) && !/^(解答|次へ.*|答えを見る|結果を見る)$/.test(x); })
      .join("\n");
    return (ids[i] === "resultScreen" ? "[結果画面] " : "") + t.slice(0, 780);
  }
  function device() {
    var ua = navigator.userAgent;
    var os = /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "Mac" : "その他";
    var br = /Edg\//.test(ua) ? "Edge" : /CriOS|Chrome\//.test(ua) ? "Chrome" : /FxiOS|Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "その他";
    return os + " / " + br + " / " + window.innerWidth + "px";
  }

  var css =
    '.nlfb{margin:30px 0 0;}' +
    '.nlfb-open{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px 14px;border:1px dashed rgba(60,40,40,.22);' +
    'border-radius:16px;background:rgba(255,255,255,.55);color:#8c8088;font:inherit;font-size:12.5px;cursor:pointer;letter-spacing:.5px;}' +
    '.nlfb-open:hover{border-color:#b48aa8;color:#8f667f;}' +
    '.nlfb-open svg{flex:none;}' +
    '.nlfb-box{padding:16px 16px 14px;border:1px solid #efe6dd;border-radius:18px;background:#fffdfb;box-shadow:0 10px 26px -20px rgba(90,60,70,.5);}' +
    '.nlfb-h{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;}' +
    '.nlfb-t{font-size:13.5px;font-weight:500;color:#4a4048;}' +
    '.nlfb-x{border:none;background:none;color:#b6acb1;font-size:20px;line-height:1;cursor:pointer;padding:2px 6px;}' +
    '.nlfb-sub{font-size:11.5px;color:#8c8088;line-height:1.6;margin-bottom:10px;}' +
    '.nlfb-kinds{display:flex;flex-wrap:wrap;gap:7px;}' +
    '.nlfb-k{padding:9px 13px;border:1px solid #e6dad2;border-radius:20px;background:#fff;color:#4a4048;font:inherit;font-size:13px;cursor:pointer;}' +
    '.nlfb-k[aria-pressed="true"]{border-color:#8f667f;background:#8f667f;color:#fff;}' +
    '.nlfb-ctx{margin-top:10px;font-size:11px;color:#8c8088;background:#f8f3ef;border-radius:10px;padding:7px 10px;max-height:4.6em;overflow:hidden;line-height:1.55;white-space:pre-line;}' +
    '.nlfb-ctx b{color:#9a7b45;font-weight:500;}' +
    '.nlfb-txt{display:block;width:100%;box-sizing:border-box;margin-top:10px;padding:10px 12px;border:1px solid rgba(60,40,40,.18);border-radius:12px;' +
    'font:inherit;font-size:16px;line-height:1.5;color:#4a4048;background:#fff;resize:vertical;min-height:62px;}' +
    '.nlfb-send{display:block;width:100%;margin-top:10px;padding:12px;border:none;border-radius:12px;background:#8f667f;color:#fff;font:inherit;font-size:14.5px;letter-spacing:2px;cursor:pointer;}' +
    '.nlfb-send:disabled{opacity:.45;cursor:default;}' +
    '.nlfb-msg{margin-top:8px;font-size:12px;text-align:center;min-height:1.2em;}' +
    '.nlfb-msg.ng{color:#a2453f;}' +
    '.nlfb-done{text-align:center;padding:16px 10px;border:1px solid #e3eee6;border-radius:18px;background:#f5faf6;color:#5d8a6c;font-size:13px;line-height:1.7;}' +
    '.nlfb-done button{margin-top:6px;border:none;background:none;color:#8c8088;font:inherit;font-size:12px;text-decoration:underline;cursor:pointer;}';

  var ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 5h16v11H9l-4 3.5V16H4z"/><path d="M12 8.5v3.2"/><circle cx="12" cy="13.7" r=".6" fill="currentColor"/></svg>';

  var root, kind = "", ctxText = "";

  function closed() {
    root.innerHTML = '<button class="nlfb-open" type="button">' + ICON + '問題や表示がおかしいときは、ここから先生に知らせる</button>';
    root.querySelector(".nlfb-open").onclick = openBox;
  }
  function openBox() {
    kind = ""; ctxText = screenText();
    root.innerHTML = '<div class="nlfb-box">' +
      '<div class="nlfb-h"><span class="nlfb-t">先生に知らせる</span><button class="nlfb-x" type="button" aria-label="閉じる">×</button></div>' +
      '<div class="nlfb-sub">どれに近いかタップして送ってください。ひとことは書かなくても大丈夫です。</div>' +
      '<div class="nlfb-kinds">' + KINDS.map(function (k) { return '<button class="nlfb-k" type="button" aria-pressed="false">' + esc(k) + '</button>'; }).join("") + '</div>' +
      (ctxText ? '<div class="nlfb-ctx"><b>いまの画面も添えて送ります：</b>\n' + esc(ctxText.slice(0, 160)) + (ctxText.length > 160 ? "…" : "") + '</div>' : '') +
      '<textarea class="nlfb-txt" maxlength="500" rows="2" placeholder="ひとこと（例：正解が２つあると思う）"></textarea>' +
      '<button class="nlfb-send" type="button" disabled>送る</button><div class="nlfb-msg"></div></div>';
    var btns = root.querySelectorAll(".nlfb-k"), send = root.querySelector(".nlfb-send"), txt = root.querySelector(".nlfb-txt");
    function upd() { send.disabled = !(kind || txt.value.trim()); }
    Array.prototype.forEach.call(btns, function (b) {
      b.onclick = function () {
        var on = b.getAttribute("aria-pressed") !== "true";
        Array.prototype.forEach.call(btns, function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", on ? "true" : "false"); kind = on ? b.textContent : ""; upd();
      };
    });
    txt.oninput = upd;
    root.querySelector(".nlfb-x").onclick = closed;
    send.onclick = function () { doSend(send, txt); };
  }
  async function doSend(send, txt) {
    var msg = root.querySelector(".nlfb-msg");
    send.disabled = true; msg.className = "nlfb-msg"; msg.textContent = "送信中…";
    var page = (document.title || "").replace(/\s*—\s*Naralingo$/, "") + "（" + (location.pathname.split("/").pop() || "index.html") + "）";
    var st = await Q.feedback({ kind: kind || "その他", text: txt.value.trim(), context: ctxText, page: page, device: device() });
    if (st === "ok") {
      root.innerHTML = '<div class="nlfb-done">送りました。ありがとう！ 先生が確認します。<br><button type="button">もうひとつ送る</button></div>';
      root.querySelector(".nlfb-done button").onclick = openBox;
      return;
    }
    msg.className = "nlfb-msg ng";
    msg.textContent = st === "rate" ? "短い時間に送りすぎています。しばらくしてから送ってください。" :
      st === "auth" ? "ログインし直してから送ってください。" : "送れませんでした。通信を確かめて、もう一度押してください。";
    send.disabled = false;
  }

  function mount() {
    if (!Q || !Q.SYNC_ON || !Q.user() || document.getElementById("fbCorner")) return;
    var wrap = document.querySelector(".wrap"); if (!wrap) return;
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    root = document.createElement("div"); root.className = "nlfb"; root.id = "fbCorner";
    wrap.appendChild(root); closed();
  }
  window.Feedback = { mount: mount };
  if (document.readyState === "complete") setTimeout(mount, 0);
  else window.addEventListener("load", function () { setTimeout(mount, 0); });
})();
