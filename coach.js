/* 鹿コーチのひとこと（学習記録ページ）。
   「あれをやれ」と指図するのではなく、声かけ ＋ 勉強のコツ（記録に合わせて動詞・文法・会話から選ぶ）＋ フランスのことわざ・名言・表現・こぼれ話。
   話題は日替わり。「ほかの話も聞く」で次の話題に進む。 */
(function () {
  "use strict";

  const TIPS = {
    conj: [
      "-er 動詞は、je parle／tu parles／il parle／ils parlent が全部同じ発音。変わるのはつづりだけだから、耳で覚えて、目でつづりを確かめるのがコツだよ。",
      "être・avoir・aller・faire は形がばらばらだけど、いちばんよく使う動詞たち。je suis, tu es, il est… とリズムに乗せて唱えると、口が先に覚えてくれるよ。",
      "nous の形は -ons で終わることが多い（nous avons, nous allons）。例外は nous sommes（être）。nous faisons は「フゾン」と読むのも、ちょっとしたひっかけポイント。",
      "vous の形はふつう -ez。でも vous êtes・vous faites・vous dites の3つだけは -tes で終わる、特別な形なんだ。",
      "ils の形は、ils sont・ils ont・ils vont・ils font と「-ont」がそろう4兄弟。まとめて覚えると忘れにくいよ。",
      "活用は、文ごと覚えると強い。« Je vais à Nara. » « J'ai un chat. » みたいに自分のことで短い文を作ると、そのまま会話でも使えるよ。",
      "j'ai・j'aime・j'habite のように、母音や無音の h で始まる動詞の前では je が j' になる（エリジオン）。書き取りで落としやすいところだから、ここだけ意識するだけでも点数が変わるよ。"
    ],
    grammar: [
      "名詞は冠詞とセットで覚えるのがおすすめ。« livre » より « un livre »。男性か女性かが、いっしょに頭に入るよ。",
      "形容詞の女性形は、基本は -e を足すだけ（petit → petite）。-eux → -euse（curieux → curieuse）、-if → -ive（actif → active）のパターンを知っておくと楽になるよ。",
      "否定は ne … pas で動詞をはさむ。会話では ne が落ちて « Je sais pas. » と言うことも多いけれど、書くときは ne を忘れずにね。",
      "疑問文の作り方は3つ。語尾を上げる（Tu viens ?）／Est-ce que をつける／主語と動詞を入れかえる（Viens-tu ?）。会話でいちばんよく使うのは、語尾を上げるやり方。",
      "近い未来は aller ＋ 動詞の原形（Je vais partir.）、ついさっきのことは venir de ＋ 原形（Je viens de manger.）。「行く」と「来る」が、時間の矢印になっているんだ。",
      "à ＋ le は au、à ＋ les は aux、de ＋ le は du、de ＋ les は des にまとまる（縮約）。au Japon の au も、じつはこれ。",
      "目的語の代名詞（le, la, lui…）は動詞の前に置く。Je le vois.（それが見える）。英語とは順番がちがうけれど、日本語の「それを・見る」と同じ順番なんだ。声に出して慣れるのがいちばんの近道。",
      "記述式は「見てわかる」を「自分で書ける」に変える練習。少し時間がかかっても、自分の手で書いた答えは記憶に残りやすいよ。"
    ],
    talk: [
      "会話は完璧じゃなくて大丈夫。« Vous pouvez répéter ? »（もう一度言ってもらえますか？）が言えれば、会話はちゃんと続けられるよ。",
      "« Et toi ? » をつけると、質問が相手に返って会話が続く。« Ça va, merci. Et toi ? » だけで、立派な会話なんだ。",
      "相づちの « Ah bon ? »（へえ、そうなの？）や « C'est génial ! »（すごいね！）が言えると、ぐっと自然に聞こえるよ。",
      "聞き取りは、全部わからなくて当たり前。知っている単語を2つ3つ拾えたら、それで十分なスタートだよ。",
      "お手本の音声に、少し遅れて重ねるように声を出す「シャドーイング」は、発音とリズムをいっしょに鍛えられる練習法。",
      "フランス語は単語どうしがつながって聞こえる（リエゾン）。vous avez は「ヴザヴェ」。つながりに慣れると、聞き取りがぐっと楽になるよ。"
    ],
    general: [
      "一度にまとめて勉強するより、日をあけて何回か復習したほうが記憶に残りやすい（分散学習と呼ばれる方法）。1日10分でも、何日か続けるのが近道。",
      "眠っている間に、その日に覚えたことが整理されると言われているよ。寝る前の5分の復習は、とてもお得な時間。",
      "やる気は、始めてから出てくることが多いんだって。« L'appétit vient en mangeant. »（食欲は食べているうちに湧いてくる）ということわざもあるよ。",
      "間違えた問題は「伸びしろ」。一度まちがえて正しい答えを見た問題は、はじめから当たった問題よりよく覚えていることも多いんだ。",
      "声に出すと、目・口・耳を全部使うから覚えやすい。電車の中なら、口の中でつぶやくだけでも効果があるよ。",
      "時間を計ると集中できる人もいれば、焦ってしまう人もいる。解いている画面の時間表示はタップでかくせるから、自分に合うほうでどうぞ。",
      "「自分のこと」で文を作ると覚えやすい。好きな食べもの、出身地、週末の予定……習った文を、自分バージョンに書きかえてみると楽しいよ。"
    ]
  };

  /* ことわざ・名言・表現・こぼれ話（内容は一般に知られているものだけ） */
  const STORIES = [
    { t: "ことわざ", fr: "Petit à petit, l'oiseau fait son nid.", ja: "少しずつ、鳥は巣を作る。", n: "コツコツ続ければ、大きなことができるという意味。" },
    { t: "ことわざ", fr: "Paris ne s'est pas fait en un jour.", ja: "パリは一日にして成らず。", n: "日本では「ローマは一日にして成らず」が有名だけど、フランス語にはパリ版もあるんだ。" },
    { t: "ことわざ", fr: "C'est en forgeant qu'on devient forgeron.", ja: "鉄を打つことで、鍛冶屋になる。", n: "日本語の「習うより慣れろ」に近いね。" },
    { t: "ことわざ", fr: "Les petits ruisseaux font les grandes rivières.", ja: "小さな小川が、大きな川になる。", n: "「塵も積もれば山となる」。1日1ラウンドも、こうやって大きくなっていくよ。" },
    { t: "ことわざ", fr: "La nuit porte conseil.", ja: "夜は助言を運んでくる。", n: "迷ったら、一晩寝てから考えよう、という意味。" },
    { t: "ことわざ", fr: "Une hirondelle ne fait pas le printemps.", ja: "ツバメ一羽で、春にはならない。", n: "一度の結果だけで決めつけない、ということ。点数がふるわない日にも思い出してね。" },
    { t: "ことわざ", fr: "Après la pluie, le beau temps.", ja: "雨のあとは、晴れ。", n: "つらいことのあとには、いいことが来るよ。" },
    { t: "ことわざ", fr: "Vouloir, c'est pouvoir.", ja: "望むことは、できること。", n: "「意志あるところに道あり」。" },
    { t: "ことわざ", fr: "Mieux vaut tard que jamais.", ja: "遅くても、しないよりはまし。", n: "久しぶりの日にぴったりの言葉。" },
    { t: "ことわざ", fr: "Qui ne risque rien n'a rien.", ja: "何も賭けない人は、何も得られない。", n: "記述式にはじめて挑戦するときに、そっと思い出してみて。" },
    { t: "ことわざ", fr: "Ce n'est pas la mer à boire.", ja: "海を飲み干すほどのことじゃない。", n: "「たいしたことないよ、だいじょうぶ」という励まし。" },
    { t: "ことわざ", fr: "Il faut tourner sept fois sa langue dans sa bouche avant de parler.", ja: "話す前に、舌を口の中で7回まわせ。", n: "よく考えてから話そう、という意味。" },
    { t: "ことわざ", fr: "Tout vient à point à qui sait attendre.", ja: "待つことを知る人には、すべてがちょうどよく訪れる。", n: "「待てば海路の日和あり」。" },
    { t: "ことわざ", fr: "Rien ne sert de courir ; il faut partir à point.", ja: "走っても意味はない。ちょうどいいときに出発することだ。", n: "ラ・フォンテーヌの寓話「ウサギとカメ」の一節。" },
    { t: "名言", fr: "Je pense, donc je suis.", ja: "われ思う、ゆえにわれあり。", n: "デカルト『方法序説』（1637年）の有名な言葉。je suis は être の活用だね。" },
    { t: "名言", fr: "On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux.", ja: "心で見なくちゃ、よく見えない。大切なものは目に見えない。", n: "サン＝テグジュペリ『星の王子さま』（1943年）で、キツネが王子さまに教える言葉。" },
    { t: "名言", fr: "Il faut cultiver notre jardin.", ja: "わたしたちの畑を耕さなければならない。", n: "ヴォルテール『カンディード』（1759年）の最後の一文。目の前のことをこつこつと、という読み方もあるよ。" },
    { t: "名言", fr: "L'homme n'est qu'un roseau, le plus faible de la nature ; mais c'est un roseau pensant.", ja: "人間は自然のなかでいちばん弱い一本の葦にすぎない。だが、それは考える葦である。", n: "パスカル『パンセ』の言葉。" },
    { t: "名言", fr: "Impossible n'est pas français.", ja: "「不可能」はフランス語ではない。", n: "ナポレオンの言葉として知られているよ。" },
    { t: "フランス語の表現", fr: "Il pleut des cordes.", ja: "ロープが降っている。", n: "「どしゃ降り」のこと。雨がロープみたいに太く見える、というイメージ。" },
    { t: "フランス語の表現", fr: "Être dans la lune.", ja: "月の中にいる。", n: "「ぼんやりしている」という意味。授業中は気をつけて？" },
    { t: "フランス語の表現", fr: "Coûter les yeux de la tête.", ja: "頭の目玉ほどの値段がする。", n: "「ものすごく高い」という意味。" },
    { t: "フランス語の表現", fr: "Poser un lapin à quelqu'un.", ja: "だれかにウサギを置く。", n: "「約束をすっぽかす」という意味。なぜウサギなのかは、はっきりしないんだって。" },
    { t: "フランス語の表現", fr: "Avoir un chat dans la gorge.", ja: "のどに猫がいる。", n: "「声がかすれる」という意味。発音練習のしすぎに注意？" },
    { t: "フランスのこぼれ話", n: "70 は soixante-dix（60＋10）、80 は quatre-vingts（4×20）、90 は quatre-vingt-dix（4×20＋10）。ベルギーやスイスでは、70 を septante、90 を nonante と言うよ。" },
    { t: "フランスのこぼれ話", n: "7月14日はフランスの「革命記念日」（le 14 Juillet）。1789年のバスティーユ襲撃にちなむ祝日で、パリでは軍事パレードや花火があるんだ。" },
    { t: "フランスのこぼれ話", n: "フランスでは、お店に入るとき « Bonjour ! » とあいさつするのが大切なマナー。言わないと、ちょっと失礼に思われることもあるよ。" },
    { t: "フランスのこぼれ話", n: "頬を寄せるあいさつ « la bise » の回数は、地域によってちがう。2回が多いけれど、3回や4回の地域もあるんだ。" },
    { t: "フランスのこぼれ話", n: "バゲットを作る職人の技と文化は、2022年にユネスコの無形文化遺産に登録されたよ。" },
    { t: "フランスのこぼれ話", n: "エッフェル塔は、1889年のパリ万国博覧会のために建てられた。建てる前には「醜い」と反対する芸術家たちもいたんだって。" },
    { t: "フランスのこぼれ話", n: "フランス語を話す人は、世界に3億人以上いるとされているよ（フランス語圏国際機関 OIF の推計）。アフリカにも話す人がたくさんいるんだ。" },
    { t: "フランスのこぼれ話", n: "日本語になったフランス語：アンケート（enquête）、アトリエ（atelier）、クレヨン（crayon）、シュークリーム（chou à la crème）、デジャヴ（déjà-vu）。意外と身近でしょう？" },
    { t: "フランスのこぼれ話", n: "1635年にできたアカデミー・フランセーズは、フランス語の辞書を作り続けている機関。会員は40人で、「不滅の人々（les Immortels）」と呼ばれているよ。" },
    { t: "フランスのこぼれ話", n: "太陽は le soleil（男性名詞）、月は la lune（女性名詞）。ドイツ語では逆で、太陽が女性、月が男性なんだ。名詞の性は言語によってさまざま。" },
    { t: "フランスのこぼれ話", n: "フランスの学校の成績は、20点満点がふつう。10点が合格ライン、16点以上ならとても優秀。20点はめったに出ないんだって。" },
    { t: "フランスのこぼれ話", n: "« Bon appétit ! » は「めしあがれ」。食事の前に、みんなで言い合うことが多いよ。" }
  ];

  /* 先生がスプレッドシート「鹿コーチ」で書いたセリフ（ログイン画面が受け取って端末に置いてある）。
     あれば、その種類はシートの内容に置きかえる。なければ、このファイルの内容を使う */
  function sheetData() {
    try { const c = JSON.parse(localStorage.getItem("nlCoach") || "null"); return c && c.d ? c.d : null; } catch (e) { return null; }
  }
  function useSheet() {
    const d = sheetData(); if (!d) return;
    ["general", "conj", "grammar", "talk"].forEach(k => {
      const a = (d.tips || {})[k];
      if (Array.isArray(a) && a.length) TIPS[k] = a.filter(x => typeof x === "string" && x);
    });
    if (Array.isArray(d.stories) && d.stories.length) {
      const st = d.stories.filter(x => x && (x.n || x.fr)).map(x => ({ t: String(x.t || "フランスのこぼれ話"), fr: x.fr || "", ja: x.ja || "", n: x.n || "" }));
      if (st.length) { STORIES.length = 0; st.forEach(x => STORIES.push(x)); }
    }
  }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* d = {rounds, dur, days:{}, hours:[], byApp:{conj:{n,q,c}}, q, c, id, today, streak:{n,doneToday}} */
  function greet(d) {
    const st = d.streak || { n: 0 }, keys = Object.keys(d.days || {}).sort(), last = keys[keys.length - 1] || "";
    const gap = last ? Math.round((new Date(d.today + "T00:00:00Z") - new Date(last + "T00:00:00Z")) / 86400000) : null;
    if (!d.rounds) return "はじめまして、鹿コーチです。ここでは勉強のコツや、フランスの小さなお話をしていくね。気が向いたときに、のぞいてみて。";
    if (st.n >= 3) return "連続 " + st.n + " 日！ 毎日すこしずつ、がいちばん強いんだ。" + (st.doneToday ? "今日もおつかれさま。" : "");
    if (gap !== null && gap >= 4) return "おかえりなさい。" + gap + " 日ぶりだね。また会えてうれしいよ。";
    if (st.doneToday) return "今日もおつかれさま。コツコツの跡が、ちゃんと記録に残っているよ。";
    return "これまでに合計 " + fmtMin(d.dur) + "、" + d.rounds + " ラウンド。積み重ねは、ちゃんと力になっているよ。";
  }
  function fmtMin(sec) { const m = Math.round((sec || 0) / 60); return m < 60 ? m + "分" : Math.floor(m / 60) + "時間" + (m % 60 ? (m % 60) + "分" : ""); }

  /* コツの候補：正答率が低めの教材があればその教材のコツ、なければ全部から */
  function tipPool(d) {
    let weak = null;
    ["conj", "grammar", "talk"].forEach(k => { const a = (d.byApp || {})[k]; if (a && a.n >= 2 && a.q) { const p = a.c / a.q; if (p < 0.7 && (!weak || p < weak.p)) weak = { k, p }; } });
    if (weak) return TIPS[weak.k].concat(TIPS.general.slice(0, 2));
    return TIPS.general.concat(TIPS.conj, TIPS.grammar, TIPS.talk);
  }
  function lateNight(d) {
    const h = d.hours || []; if (!h.length) return false;
    const peak = h.indexOf(Math.max.apply(null, h));
    return h[peak] > 0 && (peak >= 23 || peak < 4);
  }

  let turn = 0;
  function pickFor(d) {
    const seed = hash((d.today || "") + "|" + (d.id || "")) + turn * 7919;
    const tips = tipPool(d);
    let tip = tips[seed % tips.length];
    if (turn === 0 && lateNight(d)) tip = "夜ふかしさんかな？ 眠い頭より、少し早い時間のほうが覚えやすいとも言われているよ。";
    const story = STORIES[(seed >>> 3) % STORIES.length];
    return { tip, story };
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function storyHTML(s) {
    return '<div class="dc-story"><span class="dc-lb">' + esc(s.t) + '</span>' +
      (s.fr ? '<span class="dc-fr">« ' + esc(s.fr) + ' »</span><span class="dc-ja">' + esc(s.ja) + '</span>' : '') +
      '<span class="dc-n">' + esc(s.n) + '</span></div>';
  }
  function bodyHTML(d) {
    const p = pickFor(d);
    return (turn === 0 ? '<p>' + esc(greet(d)) + '</p>' : '') +
      '<div class="dc-tip"><span class="dc-lb">勉強のコツ</span>' + esc(p.tip) + '</div>' + storyHTML(p.story);
  }
  const CSS = '.deer-bub .dc-lb{display:inline-block;font-size:10.5px;letter-spacing:1px;color:#fff;background:#c0a06a;border-radius:9px;padding:0 8px;margin:0 6px 3px 0;vertical-align:1px;}' +
    '.deer-bub .dc-tip{margin-top:8px;}' +
    '.deer-bub .dc-story{margin-top:9px;padding:9px 11px;border-radius:12px;background:#fff;border:1px dashed #efe0c2;}' +
    '.deer-bub .dc-story .dc-lb{background:#b48aa8;}' +
    '.deer-bub .dc-fr{display:block;font-family:var(--serif);font-size:17px;font-weight:600;line-height:1.4;color:var(--ink);margin:2px 0 1px;}' +
    '.deer-bub .dc-ja{display:block;font-size:12.5px;color:var(--ink);}' +
    '.deer-bub .dc-n{display:block;font-size:12px;color:var(--ink-soft);margin-top:2px;}' +
    '.deer-bub .dc-more{margin-top:8px;border:none;background:none;color:#b08a3e;font:inherit;font-size:12px;text-decoration:underline;cursor:pointer;padding:0;}';
  let cssDone = false;
  function mount(el, d) {
    if (!cssDone) { const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s); cssDone = true; useSheet(); }
    turn = 0;
    const box = el.querySelector(".dc-body");
    const draw = () => {
      box.innerHTML = bodyHTML(d) + '<button type="button" class="dc-more">ほかの話も聞く</button>';
      box.querySelector(".dc-more").onclick = () => { turn++; draw(); };
    };
    draw();
  }
  window.Coach = { mount, STORIES, TIPS, pickStory: seed => STORIES[seed % STORIES.length] };
})();
