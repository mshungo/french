/* ===== 対話練習（フランス語IIA「会話フレーズ一覧」①〜⑲） =====
   conversation.html の本体スクリプトのあとに読み込む（speak / recognize / micUI / bindMic / nrm / lev / esc / $ / show / store / save などを使う）。

   ・カミーユ（女声＝女性、男声＝男性）と声で会話する。相手のセリフは録音（audio/talk/）で流れる。
   ・答える側（①〜⑭／⑮〜⑲）と、たずねる側（インタビュー）の4本。
   ・採点は「型」で行う。決まった言い方の部分だけを照合し、名前・地名・誕生日など自分のことに変える部分（スロット）は自由。
     ただし、月・数・前置詞など、形が決まっているスロットは中身も確かめる。
   ・型の書き方： (語) は言わなくてもよい語、A|B はどちらでもよい語、{種類} はスロット。
*/
(function () {
  "use strict";

  /* ---------- 台本 ---------- */
  const CLOSE = ["(Merci,) à bientôt {opt}.", "(Merci,) au revoir {opt}.", "(Merci,) salut {opt}.", "Merci {opt}."];
  const CAVA = ["(Oui,) ça va (bien), (merci). Et toi ?", "Pas mal, (merci). Et toi ?"];
  const DLG = [
    { k: "d1", role: "answer", t: "はじめまして", d: "①〜⑭ 自己紹介の質問に答える", c: "#cf8aa0", ci: "#b16880", cw: "#faeef2",
      turns: [
        { n: "①", p: "Bonjour !", pj: "こんにちは！", task: "あいさつを返そう", ex: "Bonjour !", tp: ["Bonjour {opt}.", "Salut {opt}."] },
        { n: "②", p: "Je m'appelle Camille. Comment tu t'appelles ?", pj: "私はカミーユ。お名前は？", task: "名前を言おう", ex: "Je m'appelle Sakura.", tp: ["(Moi,) je m'appelle {name}."] },
        { n: "③", p: { f: "Enchantée ! Ça va ?", m: "Enchanté ! Ça va ?" }, pj: "はじめまして！元気？", task: "「元気だよ、ありがとう。君は？」と返そう", ex: "Oui, ça va bien, merci. Et toi ?", tp: CAVA },
        { n: "④", p: "Moi, ça va, merci ! D'où viens-tu ?", pj: "私は元気だよ、ありがとう！どこから来たの？", task: "出身地を言おう", ex: "Je viens de Nara.", tp: ["(Moi,) je viens de {place}."] },
        { n: "⑤", p: "Ah bon ? Moi, je viens de Lyon. C'est quoi, la spécialité là-bas ?", pj: "へえ、そうなの？私はリヨンから来たよ。そこの名物は何？", task: "出身地の名物を言おう", ex: "La spécialité, c'est les kakis.", tp: ["(La spécialité,) c'est {x}."] },
        { n: "⑥", p: "C'est génial ! À Lyon, la spécialité, c'est la quenelle. Et là-bas, il y a quelque chose à voir ?", pj: "すごいね！リヨンの名物はクネル（魚のすり身料理）だよ。そこには見るところある？", task: "見どころを言おう", ex: "Oui, il y a des cerfs.", tp: ["(Oui,) il y a {x}.", "(Oui,) à {place}, il y a {x}."] },
        { n: "⑦", p: "Super ! C'est quand ton anniversaire ?", pj: "いいね！誕生日はいつ？", task: "誕生日を言おう", ex: "Mon anniversaire, c'est le 5 mars.", tp: ["(Mon anniversaire,) c'est le {day} {month}."] },
        { n: "⑧", p: "Moi, c'est le 14 juillet ! Tu as quel âge ?", pj: "私は7月14日（フランスの革命記念日）！何歳？", task: "年齢を言おう", ex: "J'ai 19 ans.", tp: ["(Moi,) j'ai {num} ans."] },
        { n: "⑨", p: "Moi, j'ai vingt ans. Qu'est-ce que tu aimes ?", pj: "私は20歳。何が好き？", task: "好きなものを言おう（嫌いなものも言えたら◎）", ex: "J'aime les chats. Je n'aime pas les insectes.", tp: ["(Moi,) j'aime {x}.", "(Moi,) j'aime {x}. (Mais) je n'aime pas {y}."] },
        { n: "⑩", p: "Ah bon ? Moi, j'aime la musique. Tu es japonaise ?", pj: "へえ、そうなの？私は音楽が好き。日本人？", task: "「はい」か「いいえ」で答えよう", ex: "Oui, je suis japonaise.", tp: ["Oui, je suis japonaise.", "Non, je ne suis pas japonaise."] },
        { n: "⑪", p: { f: "Moi, je suis française. Quel est ton caractère ?", m: "Moi, je suis français. Quel est ton caractère ?" }, pj: "私はフランス人。どんな性格？", task: "自分の性格を言おう", ex: "Je suis curieuse.", tp: ["(Moi,) je suis {adj}."] },
        { n: "⑫", p: { f: "Moi, je suis bavarde ! Et moi, je suis comment ?", m: "Moi, je suis bavard ! Et moi, je suis comment ?" }, pj: "私はおしゃべり！じゃあ、私はどんな人だと思う？", task: "「君は…だと思う」と、相手の性格を言おう", ex: { f: "Je pense que tu es gentille.", m: "Je pense que tu es gentil." }, tp: ["Je pense que tu es {adj}."] },
        { n: "⑬", p: "Merci, c'est gentil ! Tu as des frères et sœurs ?", pj: "ありがとう、うれしい！兄弟姉妹はいる？", task: "兄弟姉妹がいるか答えよう（いなければペットでもOK）", ex: "Oui, j'ai une sœur.", tp: ["Oui, j'ai {x}.", "Non, mais j'ai {x}.", { t: "Non, je n'ai pas de frères et sœurs.", tag: "none" }] },
        { n: "⑬", p: "Quel est son caractère ?", pj: "その人（その子）はどんな性格？", task: "その人（ペット）の性格を言おう", ex: "Elle est tranquille.", tp: ["Il|Elle est {adj}."], skipIf: "none" },
        { n: "⑭", p: "Je vois ! À quoi t'intéresses-tu ?", pj: "なるほど！何に興味がある？", task: "興味があることを言おう", ex: "Je m'intéresse à la littérature.", tp: ["(Moi,) je m'intéresse {prep} {x}."] },
        { n: "", p: "Moi, je m'intéresse au Japon ! Merci, c'était super. À bientôt !", pj: "私は日本に興味があるんだ！ありがとう、楽しかった。またね！", task: "あいさつして終わろう", ex: "À bientôt !", tp: CLOSE }
      ],
      quiz: [
        { q: "カミーユの出身地は？", a: "リヨン", o: ["パリ", "マルセイユ"] },
        { q: "カミーユの誕生日は？", a: "7月14日", o: ["3月5日", "12月25日"] },
        { q: "カミーユは何歳？", a: "20歳", o: ["19歳", "22歳"] },
        { q: "カミーユの好きなものは？", a: "音楽", o: ["猫", "映画"] },
        { q: "カミーユの性格は？（本人いわく）", a: "おしゃべり", o: ["内気", "まじめ"] }
      ], quizN: 3 },

    { k: "d2", role: "answer", t: "週末と夏休み", d: "⑮〜⑲ 時刻・予定・休みの話に答える", c: "#8db79b", ci: "#6c9a7f", cw: "#eef5f0",
      turns: [
        { n: "③", p: "Salut ! Ça va ?", pj: "やあ！元気？", task: "「元気だよ、ありがとう。君は？」と返そう", ex: "Oui, ça va bien, merci. Et toi ?", tp: CAVA },
        { n: "⑮", p: "Moi, ça va ! Quelle heure est-il ?", pj: "私は元気！いま何時？", task: "時刻を言おう（いまの時刻でも、好きな時刻でもOK）", ex: "Il est neuf heures et demie.", tp: ["Il est {num} heure|heures {opt}.", "Il est midi|minuit {opt}."] },
        { n: "⑯", p: "Merci ! Qu'est-ce que tu vas faire ce week-end ?", pj: "ありがとう！今週末、何をするの？", task: "週末の予定を言おう（Je vais ＋ 動詞）", ex: "Je vais travailler au café.", tp: ["(Ce week-end,) je vais {long}."] },
        { n: "⑰", p: "Ah bon ? Moi, je vais aller au cinéma. Où es-tu allée pendant les vacances ?", pj: "へえ、そうなの？私は映画館に行くよ。夏休みはどこへ行ったの？", task: "夏休みに行った場所を言おう", ex: "Je suis allée à Kyoto.", tp: ["(Pendant les vacances,) je suis allée {prep} {place}."] },
        { n: "⑱", p: "C'est génial ! Qu'est-ce que tu as fait ?", pj: "すごいね！何をしたの？", task: "そこで何をしたか言おう（J'ai ＋ 過去分詞）", ex: "J'ai visité un temple.", tp: ["J'ai {long}."] },
        { n: "⑲", p: "Ah, super ! C'était comment ?", pj: "わあ、いいね！どうだった？", task: "どうだったか言おう", ex: "C'était super !", tp: ["C'était {adj}."] },
        { n: "", p: { f: "Génial ! Moi, je suis allée à Paris. C'était super ! Bon, à bientôt !", m: "Génial ! Moi, je suis allé à Paris. C'était super ! Bon, à bientôt !" }, pj: "いいね！私はパリに行ったよ。最高だった！じゃあ、またね！", task: "あいさつして終わろう", ex: "À bientôt !", tp: CLOSE }
      ],
      quiz: [
        { q: "カミーユの週末の予定は？", a: "映画館に行く", o: ["カフェで働く", "京都に行く"] },
        { q: "カミーユが夏休みに行った場所は？", a: "パリ", o: ["リヨン", "京都"] },
        { q: "その旅行はどうだった？", a: "最高だった", o: ["つまらなかった", "疲れた"] }
      ], quizN: 3 },

    { k: "d3", role: "ask", t: "インタビュー①〜⑭", d: "カミーユに質問して、答えを聞き取る", c: "#92a6cf", ci: "#7186b4", cw: "#eef1f8",
      intro: { p: "Bonjour ! Vas-y, pose-moi des questions !", pj: "こんにちは！さあ、私に質問してね！" },
      turns: [
        { n: "①", task: "あいさつしよう", ex: "Bonjour !", tp: ["Bonjour {opt}.", "Salut {opt}."], ans: "Bonjour !", aj: "あいさつを返した", noQuiz: true },
        { n: "②", task: "名前をたずねよう", ex: "Comment tu t'appelles ?", tp: ["Comment tu t'appelles ?", "Comment t'appelles-tu ?", "Tu t'appelles comment ?"], ans: "Je m'appelle Camille.", aj: "名前はカミーユ" },
        { n: "③", task: "「元気？」とたずねよう", ex: "Ça va ?", tp: ["(Et toi,) ça va ?", "Tu vas bien ?"], ans: "Oui, ça va bien, merci !", aj: "元気だと答えた", noQuiz: true },
        { n: "④", task: "どこから来たのかたずねよう", ex: "D'où viens-tu ?", tp: ["D'où viens-tu ?", "Tu viens d'où ?", "D'où tu viens ?"], ans: "Je viens de Lyon.", aj: "リヨン出身" },
        { n: "⑤", task: "その町の名物をたずねよう", ex: "C'est quoi, la spécialité là-bas ?", tp: ["C'est quoi, la spécialité (là-bas) ?", "Quelle est la spécialité (là-bas) ?"], ans: "La spécialité, c'est la quenelle.", aj: "名物はクネル" },
        { n: "⑥", task: "「リヨンには見るところある？」とたずねよう", ex: "À Lyon, il y a quelque chose à voir ?", tp: ["(À Lyon,) il y a quelque chose à voir {opt} ?", "Qu'est-ce qu'il y a à voir {opt} ?"], ans: "Oui, il y a la basilique de Fourvière.", aj: "大きな教会（フルヴィエールのバジリカ聖堂）がある" },
        { n: "⑦", task: "誕生日をたずねよう", ex: "C'est quand ton anniversaire ?", tp: ["C'est quand, ton anniversaire ?", "Ton anniversaire, c'est quand ?", "Quand est ton anniversaire ?"], ans: "Mon anniversaire, c'est le 14 juillet.", aj: "誕生日は7月14日" },
        { n: "⑧", task: "年齢をたずねよう", ex: "Tu as quel âge ?", tp: ["Tu as quel âge ?", "Quel âge as-tu ?"], ans: "J'ai vingt ans.", aj: "20歳" },
        { n: "⑨", task: "何が好きかたずねよう", ex: "Qu'est-ce que tu aimes ?", tp: ["Qu'est-ce que tu aimes {opt} ?", "Tu aimes quoi ?"], ans: "J'aime la musique. Je n'aime pas les insectes.", aj: "音楽が好きで、虫はきらい" },
        { n: "⑩", task: "「フランス人？」とたずねよう", ex: { f: "Tu es française ?", m: "Tu es français ?" }, tp: ["Tu es française ?", "Est-ce que tu es française ?", "Tu es français ?", "Est-ce que tu es français ?"], ans: { f: "Oui, je suis française.", m: "Oui, je suis français." }, aj: "フランス人だ" },
        { n: "⑪", task: "どんな性格かたずねよう", ex: "Quel est ton caractère ?", tp: ["Quel est ton caractère ?", "Tu es comment ?"], ans: { f: "Je suis bavarde.", m: "Je suis bavard." }, aj: "おしゃべりな性格" },
        { n: "⑫", task: "「君は優しいと思う」と言おう", ex: { f: "Je pense que tu es gentille.", m: "Je pense que tu es gentil." }, tp: ["Je pense que tu es gentille.", "Je pense que tu es gentil."], ans: "Merci, c'est gentil !", aj: "ありがとう、と喜んだ", noQuiz: true },
        { n: "⑬", task: "兄弟姉妹がいるかたずねよう", ex: "Tu as des frères et sœurs ?", tp: ["(Est-ce que) tu as des frères et sœurs ?"], ans: "Oui, j'ai un frère.", aj: "兄か弟が一人いる" },
        { n: "⑬", task: "その人の性格をたずねよう", ex: "Quel est son caractère ?", tp: ["Quel est son caractère ?", "Il est comment ?"], ans: "Il est très sérieux.", aj: "その人はとてもまじめ" },
        { n: "⑭", task: "何に興味があるかたずねよう", ex: "À quoi t'intéresses-tu ?", tp: ["À quoi t'intéresses-tu ?", "Tu t'intéresses à quoi ?"], ans: "Je m'intéresse au Japon.", aj: "日本に興味がある" }
      ] },

    { k: "d4", role: "ask", t: "インタビュー⑮〜⑲", d: "時刻・予定・休みのことを質問する", c: "#d6a96f", ci: "#b88a4f", cw: "#faf2e7",
      intro: { p: "Salut ! Pose-moi des questions sur mes vacances !", pj: "やあ！休みのことを質問してね！" },
      turns: [
        { n: "③", task: "「元気？」とたずねよう", ex: "Ça va ?", tp: ["(Salut,) ça va ?", "(Salut,) tu vas bien ?"], ans: "Oui, ça va bien, merci !", aj: "元気だと答えた", noQuiz: true },
        { n: "⑮", task: "いま何時かたずねよう", ex: "Quelle heure est-il ?", tp: ["Quelle heure est-il ?", "Il est quelle heure ?"], ans: "Il est trois heures.", aj: "3時" },
        { n: "⑯", task: "今週末の予定をたずねよう", ex: "Qu'est-ce que tu vas faire ce week-end ?", tp: ["Qu'est-ce que tu vas faire ce week-end ?", "Tu vas faire quoi ce week-end ?"], ans: "Je vais aller au cinéma.", aj: "映画館に行く" },
        { n: "⑰", task: "夏休みにどこへ行ったかたずねよう", ex: { f: "Où es-tu allée pendant les vacances ?", m: "Où es-tu allé pendant les vacances ?" }, tp: ["Où es-tu allée pendant les vacances ?", "Tu es allée où pendant les vacances ?"], ans: { f: "Je suis allée à Paris.", m: "Je suis allé à Paris." }, aj: "パリに行った" },
        { n: "⑱", task: "何をしたのかたずねよう", ex: "Qu'est-ce que tu as fait ?", tp: ["Qu'est-ce que tu as fait {opt} ?", "Tu as fait quoi {opt} ?"], ans: "J'ai visité le musée du Louvre.", aj: "ルーヴル美術館を見に行った" },
        { n: "⑲", task: "どうだったかたずねよう", ex: "C'était comment ?", tp: ["C'était comment ?"], ans: "C'était génial !", aj: "最高だった" }
      ] }
  ];
  window.DLG_DATA = DLG;   // 音声の生成とテストで使う

  /* ---------- 照合 ---------- */
  const MONTHS = "janvier fevrier mars avril mai juin juillet aout septembre octobre novembre decembre".split(" ");
  const NUMW = new Set("un une deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize vingt trente quarante cinquante soixante cent et".split(" "));
  const PREP = new Set(["a", "au", "aux", "en", "chez"]);
  const SLOT = {   // 種類: [最少語数, 最多語数, 中身の確かめ, 表示名]
    name: [1, 5, null, "名前"], place: [1, 5, null, "地名"], x: [1, 6, null, "自由"], y: [1, 6, null, "自由"], long: [1, 9, null, "自由"],
    adj: [1, 3, null, "形容詞"], opt: [0, 4, null, ""],
    num: [1, 3, w => w.every(x => /^\d+$/.test(x) || NUMW.has(x)), "数"],
    day: [1, 2, w => w.every(x => /^\d+(er)?$/.test(x) || x === "premier" || NUMW.has(x)), "日"],
    month: [1, 1, w => MONTHS.indexOf(w[0]) >= 0, "月"],
    prep: [1, 1, w => PREP.has(w[0]), "à / au / en…"]
  };
  const SLOT_MSG = { num: "数（数字）がうまく聞き取れなかった", day: "日にち（数字）がうまく聞き取れなかった",
    month: "月の名前（janvier〜décembre）がうまく聞き取れなかった", prep: "à / au / aux / en などがうまく聞き取れなかった" };
  const HOMO = [["es", "est", "et", "ai"], ["a", "as", "ah"], ["va", "vas"], ["quel", "quelle", "quels", "quelles"], ["son", "sont"], ["ce", "se"], ["tu", "t"]];

  /* 文 → 照合用の語の列（小文字・アクセントなし・エリジオンをほどく・9h30 → 9 heures 30） */
  function words(s) {
    let t = String(s || "").replace(/(\d+)\s*h\s*(\d*)/gi, "$1 heures $2");
    t = nrm(t).replace(/\bqu'/g, "que ").replace(/\b([jmtldnsc])'/g, "$1e ").replace(/'/g, " ");
    return t.split(/\s+/).filter(Boolean);
  }
  /* 聞き取った文を、元の語（表示用）と照合用の語の対応つきで分ける */
  function tokenize(s) {
    const orig = String(s || "").replace(/(\d+)\s*h\s*(\d*)/gi, "$1h$2").split(/\s+/).filter(Boolean);
    const A = [], src = [];
    orig.forEach((o, i) => words(o).forEach(w => { A.push(w); src.push(i); }));
    return { orig, A, src };
  }
  function eqW(a, b) {
    if (a === b) return true;
    if (a.length > 3 && b.length > 3) {
      if (a + "e" === b || b + "e" === a || a + "s" === b || b + "s" === a || a + "es" === b || b + "es" === a) return true;
      if (lev([...a], [...b], (p, q) => p === q) <= 1) return true;
    }
    return HOMO.some(g => g.indexOf(a) >= 0 && g.indexOf(b) >= 0);
  }
  /* 型を解析：[{k:"w",alts:[語],opt,surf} | {k:"slot",kind}] */
  const parsed = {};
  function parseTp(raw) {
    if (parsed[raw]) return parsed[raw];
    const toks = [];
    let inP = false;
    raw.split(/\s+/).filter(Boolean).forEach(rt => {
      let s = rt, open = false, close = false;
      if (s.charAt(0) === "(") { open = true; s = s.slice(1); }
      const m = s.match(/\)[.,!?]*$/); if (m) { close = true; s = s.slice(0, m.index) + s.slice(m.index + 1); }
      if (open) inP = true;
      const opt = inP;
      if (close) inP = false;
      const sm = s.match(/^\{(\w+)\}([.,!?]*)$/);
      if (sm) { toks.push({ k: "slot", kind: sm[1] }); return; }
      const surf = s.replace(/[.,!?]+$/, "");
      if (!surf) return;
      if (surf.indexOf("|") >= 0) { toks.push({ k: "w", alts: surf.split("|").map(x => words(x).join(" ")), opt, surf }); return; }
      words(surf).forEach(w => toks.push({ k: "w", alts: [w], opt, surf }));
    });
    return (parsed[raw] = toks);
  }
  /* ( ) のまとまりは「全部言う」か「全部言わない」かのどちらか。組み合わせごとの型に広げる（最大 2^4 通り） */
  const expanded = {};
  function expandTp(raw) {
    if (expanded[raw]) return expanded[raw];
    const groups = raw.match(/\([^()]*\)/g) || [];
    let out = [raw];
    groups.slice(0, 4).forEach(g => {
      const next = [];
      out.forEach(r => { next.push(r.replace(g, g.slice(1, -1))); next.push(r.replace(g, "")); });
      out = next;
    });
    return (expanded[raw] = out.map(r => r.replace(/\s+/g, " ").replace(/^\s*[,.]\s*/, "").trim()));
  }
  const INS = 0.5, BAD = 9;
  /* 1つの型と、聞き取った語の列を照合。cost が小さいほど良い。path で語ごとの判定を返す */
  function matchTp(tp, A) {
    const T = parseTp(tp), n = T.length, m = A.length, INF = 1e9;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(INF));
    const bk = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(null));
    dp[0][0] = 0;
    const relax = (i, j, v, b) => { if (v < dp[i][j]) { dp[i][j] = v; bk[i][j] = b; } };
    for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) {
      const c = dp[i][j]; if (c >= INF) continue;
      if (j < m) relax(i, j + 1, c + INS, { t: "ins", i, j });
      if (i === n) continue;
      const tk = T[i];
      if (tk.k === "w") {
        if (j < m) { const ok = tk.alts.some(a => eqW(A[j], a)); relax(i + 1, j + 1, c + (ok ? 0 : 1), { t: ok ? "ok" : "sub", i, j }); }
        relax(i + 1, j, c + (tk.opt ? 0 : 1), { t: "del", i, j });
      } else {
        const sp = SLOT[tk.kind] || SLOT.x;
        for (let k = sp[0]; k <= sp[1] && j + k <= m; k++) {
          const seg = A.slice(j, j + k), good = !sp[2] || sp[2](seg);
          relax(i + 1, j + k, c + (good ? 0 : BAD), { t: good ? "slot" : "badslot", i, j, k });
        }
      }
    }
    const path = []; let i = n, j = m;
    while (i > 0 || j > 0) { const b = bk[i][j]; if (!b) break; path.unshift(b); i = b.i; j = b.j; }
    const fixed = T.filter(t => t.k === "w" && !t.opt).length;
    return { cost: dp[n][m], fixed, path, T };
  }
  function allowed(fixed) { return fixed < 5 ? 0.5 : fixed * 0.25; }   // 短い文は1語ちがいでも✕、長い文は4語に1つまで
  /* 候補（音声認識の上位いくつか）× 型 の中で一番よいもの */
  function judge(alts, tps) {
    let best = null;
    alts.forEach(said => {
      const tk = tokenize(said), A = tk.A;
      tps.forEach(tp => {
        const raw0 = typeof tp === "string" ? tp : tp.t, tag = typeof tp === "string" ? "" : tp.tag;
        expandTp(raw0).forEach(raw => {
          const r = matchTp(raw, A);
          const score = r.cost / Math.max(1, allowed(r.fixed));
          if (!best || score < best.score) best = Object.assign(r, { score, said, A, raw: raw0, tag, orig: tk.orig, src: tk.src });
        });
      });
    });
    best.ok = best.cost <= allowed(best.fixed) + 1e-9;
    best.badSlot = best.path.filter(b => b.t === "badslot").map(b => best.T[b.i].kind)[0] || "";
    return best;
  }
  /* 聞き取った文を、決まった部分（○/✕）・自由な部分・余分な語に色分けして返す */
  function heardHTML(r) {
    const cls = new Array(r.A.length).fill("ex");
    const miss = [];
    r.path.forEach(b => {
      if (b.t === "ok") cls[b.j] = "ok";
      else if (b.t === "sub") cls[b.j] = "ng";
      else if (b.t === "slot") for (let q = 0; q < b.k; q++) cls[b.j + q] = "sl";
      else if (b.t === "badslot") for (let q = 0; q < b.k; q++) cls[b.j + q] = "ng";
      if ((b.t === "del" && !r.T[b.i].opt) || b.t === "sub") { const s = r.T[b.i].surf; if (s && miss[miss.length - 1] !== s) miss.push(s); }
    });
    const rank = { ng: 3, sl: 2, ok: 1, ex: 0 }, oc = r.orig.map(() => null);
    cls.forEach((c, q) => { const o = r.src[q]; if (oc[o] == null || rank[c] > rank[oc[o]]) oc[o] = c; });
    let h = '<span class="dh">' + r.orig.map((w, q) => '<span class="w-' + (oc[q] || "ex") + '">' + esc(w) + '</span>').join(" ") + '</span>';
    return { html: h, miss };
  }
  /* 型の見本（決まった部分はそのまま、自由な部分は札で示す） */
  function patternHTML(raw) {
    let inP = false;
    return raw.split(/\s+/).filter(Boolean).map(rt => {
      let s = rt, open = false, close = false;
      if (s.charAt(0) === "(") { open = true; s = s.slice(1); }
      const m = s.match(/\)[.,!?]*$/); if (m) { close = true; s = s.slice(0, m.index) + s.slice(m.index + 1); }
      if (open) inP = true; const opt = inP; if (close) inP = false;
      const sm = s.match(/^\{(\w+)\}([.,!?]*)$/);
      if (sm) { const lb = (SLOT[sm[1]] || SLOT.x)[3]; return lb ? '<span class="pt-slot">' + esc(lb) + '</span>' + esc(sm[2] || "") : esc(sm[2] || ""); }
      return '<span class="' + (opt ? "pt-opt" : "pt-fix") + '">' + esc(s.replace(/\|/g, " / ")) + '</span>';
    }).join(" ").replace(/\s+([.,!?])/g, "$1");
  }
  window.DLG_MATCH = { words, judge, matchTp, parseTp, patternHTML, heardHTML };

  /* ---------- 画面 ---------- */
  const css = `
  #dlgScreen .hidden,#dlgList .hidden{display:none!important;}
  .dlg-guide{font-size:12.5px;line-height:1.75;color:var(--ink-soft);background:#fff;border:1px dashed var(--rule);border-radius:14px;padding:10px 14px;margin:0 0 12px;}
  .dlg-guide b{color:var(--ink);font-weight:500;}
  .dlg-card .sb-desc{white-space:normal;}
  .dlg-card .dlg-role{display:inline-block;margin-left:6px;padding:1px 8px;border-radius:10px;font-size:10.5px;font-style:normal;background:var(--vcw);color:var(--ink-soft);vertical-align:2px;}
  #dlgScreen .dlg-title{text-align:center;font-size:13px;color:var(--ink-soft);margin:-4px 0 10px;}
  .dlg-log{display:flex;flex-direction:column;gap:10px;margin:6px 0 14px;}
  .bub{max-width:88%;padding:10px 13px;border-radius:16px;font-size:15px;line-height:1.55;position:relative;}
  .bub.p{align-self:flex-start;background:#fff;border:1px solid var(--card-edge);border-bottom-left-radius:5px;}
  .bub.s{align-self:flex-end;background:var(--accent-wash);border:1px solid transparent;border-bottom-right-radius:5px;}
  .bub .who{display:block;font-size:10.5px;letter-spacing:1px;color:var(--ink-faint);margin-bottom:2px;}
  .bub .fr{font-family:var(--serif);font-size:19px;font-weight:600;color:var(--ink);}
  .bub .ja{display:block;font-size:12px;color:var(--ink-soft);margin-top:2px;}
  .bub .veil{display:inline-flex;gap:6px;align-items:center;color:var(--ink-soft);font-size:13px;}
  .bub .bb{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;}
  .bub .bb button{border:1px solid var(--rule);background:#fff;border-radius:14px;padding:3px 10px;font:inherit;font-size:11.5px;color:var(--accent-ink);cursor:pointer;}
  .bub .mk{position:absolute;top:-8px;right:-6px;width:22px;height:22px;border-radius:50%;color:#fff;font-size:12px;display:flex;align-items:center;justify-content:center;}
  .bub .mk.ok{background:var(--good);} .bub .mk.ng{background:var(--bad);}
  .dh{font-size:15px;line-height:1.7;}
  .dh .w-ok{color:var(--good-ink);font-weight:500;}
  .dh .w-sl{color:#5a77a8;border-bottom:2px dotted #8ea6cf;}
  .dh .w-ng{color:var(--bad-ink);font-weight:600;text-decoration:underline wavy rgba(177,106,102,.6);}
  .dh .w-ex{color:var(--ink-faint);}
  .dlg-ctl{border:1px solid var(--card-edge);border-radius:18px;background:#fff;padding:14px 14px 12px;text-align:center;}
  .dlg-task{font-size:14.5px;font-weight:500;color:var(--ink);margin-bottom:4px;}
  .dlg-task .nm{display:inline-block;min-width:22px;margin-right:6px;color:var(--accent-ink);}
  .dlg-pat{font-family:var(--serif);font-size:18px;color:var(--ink);margin:6px 0 2px;line-height:1.6;}
  .pt-fix{color:var(--ink);font-weight:600;} .pt-opt{color:var(--ink-faint);}
  .pt-slot{display:inline-block;font-family:"Noto Sans JP";font-size:11.5px;font-weight:500;color:#5a77a8;background:#eef3fb;border:1px dashed #9db3d8;border-radius:8px;padding:0 8px;margin:0 2px;vertical-align:2px;}
  .dlg-legend{font-size:11px;color:var(--ink-soft);margin:2px 0 10px;}
  .dlg-legend .pt-slot{font-size:10.5px;}
  .dlg-ctl .mic{margin:8px 0 4px;}
  .dlg-tools{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:10px;}
  .dlg-msg{font-size:12.5px;margin-top:8px;min-height:1.2em;line-height:1.6;}
  .dlg-msg.ng{color:var(--bad-ink);} .dlg-msg.ok{color:var(--good-ink);}
  .dlg-ex{margin-top:10px;padding:10px 12px;border-radius:12px;background:var(--accent-wash);text-align:left;font-size:12.5px;line-height:1.7;}
  .dlg-ex .fr{font-family:var(--serif);font-size:19px;font-weight:600;color:var(--ink);}
  .dlg-q .opts{margin-top:8px;}
  .dlg-q .opt{font-family:"Noto Sans JP";font-size:14.5px;font-weight:500;padding:12px 14px;}
  .dlg-switch{display:flex;justify-content:flex-end;gap:6px;margin:-4px 0 6px;}
  .dlg-end .rrow .rtx .rja{white-space:normal;}
  `;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const scr = document.createElement("div");
  scr.className = "panel hidden"; scr.id = "dlgScreen";
  scr.innerHTML = '<div class="topbar"><button class="back" id="dlgBack" aria-label="ホームに戻る">←</button>' +
    '<div class="live-timer" id="dlgTimer">0.0秒</div><div class="qcount" id="dlgCount"></div></div>' +
    '<div class="dlg-title" id="dlgTitle"></div><div class="bar"><div class="fill" id="dlgFill"></div></div>' +
    '<div class="dlg-switch"><button class="mini" id="dlgTextBtn"></button></div>' +
    '<div class="dlg-log" id="dlgLog"></div><div id="dlgCtl"></div><div class="dlg-end hidden" id="dlgEnd"></div>';
  document.querySelector(".wrap").appendChild(scr);

  /* ホームに入口を足す */
  const home = document.getElementById("homeScreen");
  const anchor = home.querySelector(".section-label");   // 「セクションを選択」の上に置く
  const block = document.createElement("div");
  block.innerHTML = '<div class="section-label">対話</div>' +
    '<div class="sections" id="dlgList"></div>';
  home.insertBefore(block, anchor);

  const G = x => (x && typeof x === "object" && !Array.isArray(x)) ? (x[store.voice === "m" ? "m" : "f"] || x.f) : x;
  function dstore() { store.dlg = store.dlg || {}; return store.dlg; }

  function renderDlgList() {
    const ds = dstore();
    $("dlgList").innerHTML = DLG.map(d => {
      const r = ds[d.k] || {};
      return '<button class="start-btn dlg-card" data-dlg="' + d.k + '" style="--vc:' + d.c + ';--vcw:' + d.cw + '"><i class="wk">' + (d.role === "ask" ? "Q" : "A") + '</i>' +
        '<span class="sb-name">' + esc(d.t) + '<em class="dlg-role">' + (d.role === "ask" ? "たずねる" : "答える") + '</em><span class="sb-desc">' + esc(d.d) + '</span></span>' +
        '<span class="sb-prog"><span>' + (r.tries ? "最高 " + r.best + "/" + r.total : "まだ") + '</span>' +
        (r.tries ? '<span class="pbar"><span style="width:' + Math.round(r.best / r.total * 100) + '%"></span></span>' : '') + '</span></button>';
    }).join("");
    document.querySelectorAll("#dlgList .start-btn").forEach(b => b.onclick = () => startDlg(b.dataset.dlg));
  }
  const _renderHome = renderHome;
  renderHome = function () { _renderHome(); renderDlgList(); };
  const _show = show;
  show = function (el) { scr.classList.add("hidden"); _show(el); };
  function showDlg() { [homeScreen, quizScreen, resultScreen].forEach(s => s.classList.add("hidden")); scr.classList.remove("hidden"); window.scrollTo(0, 0); }

  /* ---------- 進行 ---------- */
  let D = null, steps = [], si = 0, t0 = 0, tick = null, lastTag = "", busy = false;
  function startDlg(k) {
    D = DLG.find(x => x.k === k); if (!D) return;
    ensureAudio(); if (actx && actx.state === "suspended") actx.resume(); playStart();
    setAccent(null);
    const s = document.body.style; s.setProperty("--accent", D.c); s.setProperty("--accent-ink", D.ci); s.setProperty("--accent-wash", D.cw);
    steps = D.turns.map(t => ({ t, tries: 0, ok: null, heard: "", lq: null }));
    si = 0; lastTag = ""; busy = false;
    $("dlgLog").innerHTML = ""; $("dlgEnd").classList.add("hidden"); $("dlgEnd").innerHTML = ""; $("dlgCtl").classList.remove("hidden");
    $("dlgTitle").textContent = D.t + "（" + (D.role === "ask" ? "たずねる" : "答える") + "）";
    updText();
    showDlg();
    t0 = performance.now(); clearInterval(tick);
    tick = setInterval(() => { $("dlgTimer").textContent = fmtTime(performance.now() - t0); }, 200);
    if (D.intro) partnerSay(D.intro.p, D.intro.pj, () => turn());
    else turn();
  }
  function progress() {
    const tot = steps.filter(x => !x.skip).length, done = steps.slice(0, si).filter(x => !x.skip).length;
    $("dlgCount").textContent = Math.min(done + 1, tot) + " / " + tot;
    $("dlgFill").style.width = Math.round(done / tot * 100) + "%";
  }
  function showText() { return !!store.dlgText; }
  function updText() { $("dlgTextBtn").textContent = showText() ? "相手の文字をいつもかくす" : "相手の文字をいつも表示する"; }
  $("dlgTextBtn").onclick = () => { store.dlgText = !store.dlgText; save(); updText();
    document.querySelectorAll("#dlgLog .bub.p").forEach(b => b.classList.toggle("open", showText())); refreshVeils(); };
  function refreshVeils() {
    document.querySelectorAll("#dlgLog .bub.p").forEach(b => {
      const open = b.classList.contains("open");
      b.querySelector(".fr").classList.toggle("hidden", !open); b.querySelector(".ja").classList.toggle("hidden", !open);
      b.querySelector(".veil").classList.toggle("hidden", open);
      const tb = b.querySelector("[data-a=txt]"); if (tb) tb.textContent = open ? "文字をかくす" : "文字を見る";
    });
  }
  function scrollEnd() { setTimeout(() => { const c = $("dlgCtl"); (c.classList.contains("hidden") ? $("dlgEnd") : c).scrollIntoView({ block: "end", behavior: "smooth" }); }, 30); }
  /* 相手のセリフ（吹き出し＋音声） */
  function partnerSay(fr, ja, cb) {
    fr = G(fr);
    const b = document.createElement("div"); b.className = "bub p" + (showText() ? " open" : "");
    b.innerHTML = '<span class="who">Camille</span><span class="veil">🔊 聞き取ってみよう</span><span class="fr">' + esc(fr) + '</span><span class="ja">' + esc(ja || "") + '</span>' +
      '<span class="bb"><button type="button" data-a="re" aria-label="もう一度聞く" title="もう一度聞く">' + NLI.svg("speaker", 16) + '</button><button type="button" data-a="slow" aria-label="ゆっくり" title="ゆっくり">' + NLI.svg("slow", 16) + '</button><button type="button" data-a="txt"></button></span>';
    $("dlgLog").appendChild(b);
    b.querySelector("[data-a=re]").onclick = () => speak(fr);
    b.querySelector("[data-a=slow]").onclick = () => speak(fr, true);
    b.querySelector("[data-a=txt]").onclick = () => { b.classList.toggle("open"); refreshVeils(); };
    refreshVeils(); scrollEnd();
    speak(fr, false, cb, 250);
    return b;
  }
  function studentBub(r, okMark) {
    const b = document.createElement("div"); b.className = "bub s";
    const h = r ? heardHTML(r).html : '<span class="dh">' + esc("（パス）") + '</span>';
    b.innerHTML = '<span class="who">あなた</span>' + h + (okMark != null ? '<span class="mk ' + (okMark ? "ok" : "ng") + '">' + (okMark ? "✓" : "✕") + '</span>' : "");
    $("dlgLog").appendChild(b); scrollEnd();
    return b;
  }
  function cur() { return steps[si]; }
  function turn() {
    while (si < steps.length && steps[si].t.skipIf && steps[si].t.skipIf === lastTag) { steps[si].skip = true; si++; }
    if (si >= steps.length) { endTalk(); return; }
    progress();
    const s = cur(), t = s.t;
    if (D.role === "answer") partnerSay(t.p, t.pj, null);
    drawCtl();
  }
  function drawCtl() {
    const s = cur(), t = s.t;
    const tp0 = typeof t.tp[0] === "string" ? t.tp[0] : t.tp[0].t;
    const labels = [];
    parseTp(tp0).forEach(x => { if (x.k === "slot") { const lb = (SLOT[x.kind] || SLOT.x)[3]; if (lb && labels.indexOf(lb) < 0) labels.push(lb); } });
    $("dlgCtl").innerHTML =
      '<div class="dlg-task">' + (t.n ? '<span class="nm">' + esc(t.n) + '</span>' : '') + esc(t.task) + '</div>' +
      (labels.length ? '<div class="dlg-legend" title="自分のことに変えてよい部分（採点しない）">' + labels.map(l => '<span class="pt-slot">' + esc(l) + '</span>').join(" ") + ' ＝ 自由</div>'
        : '') +
      '<div class="dlg-pat hidden" id="dlgPat">' + patternHTML(tp0) + '</div>' +
      (SR ? micUI("dlgMic", "押して話す") : '<div class="dlg-msg">このブラウザは音声認識に対応していないため、声に出したあと「答えを見る」で自分で判定します。</div>') +
      '<div class="dlg-msg" id="dlgMsg"></div><div id="dlgExBox"></div>' +
      '<div class="dlg-tools">' + (SR ? '' : '<button class="mini" id="dlgSelf">答えを見る</button>') +
      '<button class="mini" id="dlgPatBtn">型を見る</button><button class="mini" id="dlgHint">答え方の例</button><button class="mini" id="dlgPass">パス（Je passe.）</button></div>';
    if (SR) bindMic($("dlgMic"), onSaid);
    else $("dlgSelf").onclick = selfJudge;
    $("dlgHint").onclick = () => { showPat(); showEx(); };
    $("dlgPatBtn").onclick = showPat;
    $("dlgPass").onclick = () => { if (busy) return; studentBub(null, false); finishTurn(false, "（パス）"); };
    scrollEnd();
  }
  function showPat() { const e = $("dlgPat"); if (e) e.classList.remove("hidden"); const b = $("dlgPatBtn"); if (b) b.remove(); }
  function showEx() {
    const t = cur().t, ex = G(t.ex);
    $("dlgExBox").innerHTML = '<div class="dlg-ex"><span class="fr">' + esc(ex) + '</span>' +
      '<div class="bb" style="margin-top:6px"><button class="mini ic-only" id="exPlay" aria-label="お手本を聞く" title="お手本を聞く">' + NLI.svg("speaker", 17) + '</button><button class="mini ic-only" id="exSlow" aria-label="ゆっくり" title="ゆっくり">' + NLI.svg("slow", 17) + '</button></div></div>';
    $("exPlay").onclick = () => speak(ex); $("exSlow").onclick = () => speak(ex, true);
  }
  function onSaid(alts) {
    if (busy) return;
    const s = cur(), t = s.t, msg = $("dlgMsg");
    const joined = alts.map(a => words(a).join(" "));
    if (D.role === "answer" && joined.some(a => /\brepeter\b/.test(a))) {   // 「Vous pouvez répéter ?」→ ゆっくりもう一度
      msg.className = "dlg-msg ok"; msg.textContent = "Bien sûr !";
      speak(G(t.p), true); return;
    }
    if (joined.some(a => /\bje passe\b/.test(a))) { studentBub(null, false); finishTurn(false, "Je passe."); return; }
    const r = judge(alts, t.tp);
    s.tries++; s.heard = r.said;
    if (r.ok) {
      studentBub(r, true); lastTag = r.tag || "";
      msg.className = "dlg-msg ok"; msg.textContent = pick(["Très bien !", "Parfait !", "Bravo !", "Super !"]);
      playCorrect();
      finishTurn(true, r.said);
      return;
    }
    studentBub(r, false); playWrong();
    const hm = heardHTML(r);
    let why = r.badSlot && SLOT_MSG[r.badSlot] ? SLOT_MSG[r.badSlot] : "決まった言い方の部分が少しちがうみたい";
    if (hm.miss.length && !r.badSlot) why += "（" + hm.miss.slice(0, 3).join("、") + " が聞き取れなかった）";
    showPat();
    if (s.tries < 2) {
      msg.className = "dlg-msg ng"; msg.textContent = why;
      return;
    }
    msg.className = "dlg-msg ng"; msg.textContent = why;
    showEx();
    const box = $("dlgExBox");
    box.insertAdjacentHTML("beforeend", '<div class="dlg-tools"><button class="mini" id="dlgFix">今のは言えていた（正解にする）</button><button class="next-btn" id="dlgNext" aria-label="次へ">' + NLI.svg("next", 28) + '</button></div>');
    const mic = $("dlgMic"); if (mic) mic.classList.add("hidden");
    busy = true;
    $("dlgFix").onclick = () => { busy = false; const ms = document.querySelectorAll("#dlgLog .bub.s .mk"); const mk = ms[ms.length - 1]; if (mk) { mk.className = "mk ok"; mk.textContent = "✓"; } lastTag = r.tag || ""; finishTurn(true, r.said, true); };
    $("dlgNext").onclick = () => { busy = false; lastTag = r.tag || ""; finishTurn(false, r.said, true); };
    speak(G(t.ex), false, null, 600);
  }
  function selfJudge() {
    const t = cur().t; showPat(); showEx();
    const tl = document.querySelector("#dlgCtl > .dlg-tools"); if (tl) tl.remove();
    $("dlgExBox").insertAdjacentHTML("beforeend", '<div class="selfchk" style="margin-top:10px"><button class="opt" id="sOk">言えた</button><button class="opt" id="sNg">言えなかった</button></div>');
    speak(G(t.ex));
    $("sOk").onclick = () => { const b = document.createElement("div"); b.className = "bub s"; b.innerHTML = '<span class="who">あなた</span><span class="dh">（自己判定）</span><span class="mk ok">✓</span>'; $("dlgLog").appendChild(b); finishTurn(true, "（自己判定）"); };
    $("sNg").onclick = () => { const b = document.createElement("div"); b.className = "bub s"; b.innerHTML = '<span class="who">あなた</span><span class="dh">（自己判定）</span><span class="mk ng">✕</span>'; $("dlgLog").appendChild(b); finishTurn(false, "（自己判定）"); };
  }
  /* 正解なら自動で次へ（設定で「自分で押す」にできる）。間違えたときは「次へ」を押すまで進まない */
  function autoOn() { return false; }   // 対話（会話練習）は、設定の速さに関係なく、いつも「次へ」を押して進む
  function proceed(ok, go, delay, host) {
    if (ok && autoOn()) { setTimeout(go, window.Quiz && Quiz.nextDelay ? Quiz.nextDelay(delay) : delay); return; }
    const h = host || $("dlgCtl");
    h.insertAdjacentHTML("beforeend", '<div class="nx-wrap"><button class="next-btn" id="dlgGo" aria-label="次へ">' + NLI.svg("next", 28) + '</button></div>');
    const b = $("dlgGo"); b.onclick = () => { b.disabled = true; go(); };
    scrollEnd();
  }
  function finishTurn(ok, heard, manual) {
    const s = cur(); if (s.ok !== null) return;
    s.ok = ok; s.heard = heard || s.heard;
    busy = true;
    const go = () => { busy = false; si++; turn(); };
    if (D.role === "ask") {   // 相手が答える → 聞き取りの確認
      $("dlgCtl").innerHTML = '<div class="dlg-msg">カミーユが答えます…</div>';
      partnerSay(s.t.ans, s.t.aj, () => {
        if (s.t.noQuiz) { setTimeout(go, 500); return; }   // 聞き取りの確認がないときは、そのまま続ける
        listenQ(s, go);
      });
      return;
    }
    if (manual) { go(); return; }
    proceed(ok, go, 900);
  }
  function listenQ(s, go) {
    const pool = D.turns.filter(t => !t.noQuiz && t !== s.t).map(t => t.aj);
    const opts = shuffle([s.t.aj].concat(shuffle(pool).slice(0, 2)));
    $("dlgCtl").innerHTML = '<div class="dlg-q"><div class="dlg-task">カミーユは何と答えた？</div><div class="opts" id="lqOpts">' +
      opts.map((o, i) => '<button class="opt" data-i="' + i + '">' + esc(o) + '</button>').join("") + '</div>' +
      '<div class="dlg-tools"><button class="mini ic-only" id="lqRe" aria-label="もう一度聞く" title="もう一度聞く">' + NLI.svg("speaker", 17) + '</button><button class="mini ic-only" id="lqSlow" aria-label="ゆっくり" title="ゆっくり">' + NLI.svg("slow", 17) + '</button></div></div>';
    $("lqRe").onclick = () => speak(G(s.t.ans)); $("lqSlow").onclick = () => speak(G(s.t.ans), true);
    $("lqOpts").querySelectorAll(".opt").forEach(b => b.onclick = () => {
      const ok = opts[+b.dataset.i] === s.t.aj; s.lq = ok;
      $("lqOpts").querySelectorAll(".opt").forEach(x => { x.disabled = true; if (opts[+x.dataset.i] === s.t.aj) x.classList.add("correct"); else if (x === b) x.classList.add("wrong"); else x.classList.add("dim"); });
      if (ok) playCorrect(); else playWrong();
      const last = document.querySelectorAll("#dlgLog .bub.p"); const lb = last[last.length - 1];
      if (lb && !lb.classList.contains("open")) { lb.classList.add("open"); refreshVeils(); }
      proceed(ok, go, 900, document.querySelector("#dlgCtl .dlg-q"));
    });
    scrollEnd();
  }
  /* 会話のあと：聞き取りクイズ（答える側の対話のみ） */
  let quizItems = [], qi = 0;
  function endTalk() {
    $("dlgFill").style.width = "100%";
    if (D.role === "answer" && D.quiz) {
      quizItems = shuffle(D.quiz.slice()).slice(0, D.quizN || 3).map(q => ({ q, ok: null })); qi = 0;
      quizStep(); return;
    }
    finishDlg();
  }
  function quizStep() {
    if (qi >= quizItems.length) { finishDlg(); return; }
    const it = quizItems[qi], opts = shuffle([it.q.a].concat(it.q.o));
    $("dlgCount").textContent = "聞き取り " + (qi + 1) + " / " + quizItems.length;
    $("dlgCtl").innerHTML = '<div class="dlg-q"><div class="dlg-msg">聞き取りクイズ</div>' +
      '<div class="dlg-task">' + esc(it.q.q) + '</div><div class="opts" id="cqOpts">' +
      opts.map((o, i) => '<button class="opt" data-i="' + i + '">' + esc(o) + '</button>').join("") + '</div></div>';
    $("cqOpts").querySelectorAll(".opt").forEach(b => b.onclick = () => {
      const ok = opts[+b.dataset.i] === it.q.a; it.ok = ok;
      $("cqOpts").querySelectorAll(".opt").forEach(x => { x.disabled = true; if (opts[+x.dataset.i] === it.q.a) x.classList.add("correct"); else if (x === b) x.classList.add("wrong"); else x.classList.add("dim"); });
      if (ok) playCorrect(); else playWrong();
      proceed(ok, () => { qi++; quizStep(); }, 800, document.querySelector("#dlgCtl .dlg-q"));
    });
    scrollEnd();
  }
  function finishDlg() {
    clearInterval(tick); stopSpeak(); try { rec && rec.abort(); } catch (e) {}
    const time = performance.now() - t0;
    const live = steps.filter(x => !x.skip);
    let score = 0, total = 0;
    live.forEach(x => { total++; if (x.ok) score++; if (D.role === "ask" && !x.t.noQuiz) { total++; if (x.lq) score++; } });
    quizItems.forEach(x => { if (D.role === "answer") { total++; if (x.ok) score++; } });
    const ds = dstore(), r = ds[D.k] || { tries: 0, best: 0, total };
    r.tries++; r.total = total; if (score > r.best || r.tries === 1) r.best = Math.max(score, r.best || 0); r.last = score;
    ds[D.k] = r;
    store.timeMs = (store.timeMs || 0) + Math.max(60000, Math.min(time, total * 90000));   // 1回は最低1分
    save(); if (Q) Q.markToday();
    const pct = Math.round(score / total * 100);
    let h = '<div class="result" style="padding-top:6px"><div class="face">' + (pct >= 80 ? "◎" : pct >= 50 ? "△" : "✕") + '</div>' +
      '<div class="ring">' + score + '<small> / ' + total + '</small></div><div><span class="pct-pill">' + pct + '%</span></div>' +
      '<div class="msg">' + (pct === 100 ? "最後まで会話できた！" : pct >= 80 ? "クリア！" : pct >= 50 ? "あと少し！" : "もう一回やってみよう") + '</div>' +
      '<div class="rtime"><span class="nl-badge">' + NLI.svg("clock", 15) + fmtTime(time) + '</span></div>' +
      '<button class="play again" id="dlgAgain" aria-label="もう一度この会話" title="もう一度この会話">' + NLI.svg("again", 26) + '<span class="btn-t">もう一度この会話</span></button><button class="home-link ic wide" id="dlgHome" aria-label="もどる" title="もどる">' + NLI.svg("back", 22) + '<span class="btn-t">もどる</span></button>' +
      '<div class="review">';
    live.forEach((x, i) => {
      h += '<div class="rrow"><span class="mk ' + (x.ok ? "ok" : "no") + '">' + (x.ok ? "○" : "✕") + '</span><span class="rtx"><span class="rfr">' + esc(G(x.t.ex)) + '</span>' +
        '<span class="rja">' + esc((x.t.n ? x.t.n + " " : "") + x.t.task) + (x.heard ? '　／ あなた：«' + esc(x.heard) + '»' : '') +
        (D.role === "ask" && !x.t.noQuiz ? '　／ 聞き取り ' + (x.lq ? "○" : "✕") : '') + '</span></span>' +
        '<button class="round-btn" data-i="' + i + '" aria-label="音声">▶</button></div>';
    });
    if (quizItems.length) h += '<div class="rrow"><span class="mk ' + (quizItems.every(x => x.ok) ? "ok" : "no") + '">' + quizItems.filter(x => x.ok).length + '</span><span class="rtx"><span class="rja">聞き取りクイズ ' + quizItems.filter(x => x.ok).length + ' / ' + quizItems.length + '</span></span></div>';
    h += '</div></div>';
    $("dlgCtl").classList.add("hidden");
    const end = $("dlgEnd"); end.innerHTML = h; end.classList.remove("hidden");
    end.querySelectorAll(".round-btn").forEach(b => b.onclick = () => speak(G(live[+b.dataset.i].t.ex)));
    $("dlgAgain").onclick = () => startDlg(D.k);
    $("dlgHome").onclick = exitDlg;
    scrollEnd();
    if (pct >= 80) setTimeout(playFanfare, 280);
    if (Q) Q.submit("talk", { section: "対話・" + D.t, mode: "対話", durMs: Math.round(time), score, total, timeAttack: false, timeMs: null,
      misses: live.filter(x => !x.ok).map(x => ({ full: G(x.t.ex), verb: "対話" + (x.t.n || ""), chosen: x.heard || "", answer: G(x.t.ex) })) });
  }
  function exitDlg() { clearInterval(tick); stopSpeak(); try { rec && rec.abort(); } catch (e) {} busy = false; setAccent(null); renderHome(); show(homeScreen); }
  $("dlgBack").onclick = exitDlg;

  /* 問題の報告（feedback.js）：対話中は、いまの会話のやりとりを渡す */
  const _fbq = window.FB_QUESTIONS;
  window.FB_QUESTIONS = function () {
    if (scr.classList.contains("hidden") || !D) return _fbq ? _fbq() : [];
    const out = [];
    for (let i = Math.min(si, steps.length - 1); i >= 0; i--) {
      const x = steps[i]; if (x.skip) continue;
      out.push({ label: (x.t.n || "") + " " + x.t.task, detail: "会話練習／対話「" + D.t + "」" + (x.t.n || "") + " " + x.t.task +
        (x.t.p ? "\n相手：" + G(x.t.p) : "") + "\nお手本：" + G(x.t.ex) + "\n型：" + x.t.tp.map(t => typeof t === "string" ? t : t.t).join(" ／ ") +
        "\n聞き取られた文：" + (x.heard || "（まだ）") + (x.ok == null ? "" : x.ok ? "　○" : "　✕") });
    }
    return out;
  };

  renderDlgList();
})();
