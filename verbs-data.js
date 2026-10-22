/* 動詞活用ページの「いろいろな動詞」の問題（もとは文法練習の各 Leçon にあった問題）。
   verbs.html（grammar.js で出題）と conjugation.html（項目の一覧・達成率・活用のポイント）の両方が読み込む。
   問題IDは文法練習のときと同じ（FROM で番号をそろえる）。それまでの記録は common.js が gramQuiz から verbQuiz へ移す。 */
window.LESSON={no:"V",label:"いろいろな動詞",eyebrow:"Conjugaison",title:"いろいろな動詞",
  sub:"",
  lead:"",
  memoTitle:"活用のポイント",store:"verbQuiz_v1",back:"conjugation.html",backText:"← 動詞活用",home:"conjugation.html",secPrefix:"V-",fbName:"動詞活用（いろいろな動詞）",group:"いろいろな動詞",
  crest:'<svg width="30" height="30" aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 9.5C9.6 7.3 9.2 5.1 10 2.8M10.2 5.9 7.4 4.6M12.6 9.2c-.6-1.8-.1-3.4 1-4.6"/><path d="M20.5 9.5c1.9-2.2 2.3-4.4 1.5-6.7M21.8 5.9l2.8-1.3M19.4 9.2c.6-1.8.1-3.4-1-4.6"/><path d="M11.4 11.6 6.6 10.4c.9 1.9 2.6 3 4.9 3.1"/><path d="M20.6 11.6l4.8-1.2c-.9 1.9-2.6 3-4.9 3.1"/><path d="M11.3 11.2c.3-1.4 2.2-2.1 4.7-2.1s4.4.7 4.7 2.1l-1.1 8.2c-.5 3.6-1.9 6.4-3.6 6.4s-3.1-2.8-3.6-6.4z"/><circle cx="13.9" cy="14.8" r=".7" fill="currentColor" stroke="none"/><circle cx="18.1" cy="14.8" r=".7" fill="currentColor" stroke="none"/><path d="M15 24.3h2"/></svg>',
  sections:[
  {k:"er",t:"-er動詞",d:"parler・habiter など",c:"#d6a96f",ci:"#b88a4f",cw:"#faf2e7",
   memo:'<p>語幹（-er を取った部分）＋語尾 <span class="fr">-e, -es, -e, -ons, -ez, -ent</span></p>'+
   '<table><tr><td class="fr">je parle</td><td class="fr">nous parlons</td></tr><tr><td class="fr">tu parles</td><td class="fr">vous parlez</td></tr><tr><td class="fr">il / elle parle</td><td class="fr">ils / elles parlent</td></tr></table>'+
   '<p>-e, -es, -ent は発音しない（parle, parles, parlent は同じ発音）。母音で始まる動詞の前で je → <span class="fr">j\'</span>。</p>'+
   '<p>発展：<span class="fr">manger → nous mangeons</span>、<span class="fr">commencer → nous commençons</span>（発音を保つためのつづりの変化）</p>'},
  {k:"ea",t:"être と avoir",d:"avoir faim などの言い方も",c:"#8db79b",ci:"#6c9a7f",cw:"#eef5f0",
   memo:'<table><tr><th colspan="2">être（～である、いる）</th><th colspan="2">avoir（持つ）</th></tr>'+
   '<tr><td class="fr">je suis</td><td class="fr">nous sommes</td><td class="fr">j\'ai</td><td class="fr">nous avons</td></tr>'+
   '<tr><td class="fr">tu es</td><td class="fr">vous êtes</td><td class="fr">tu as</td><td class="fr">vous avez</td></tr>'+
   '<tr><td class="fr">il est</td><td class="fr">ils sont</td><td class="fr">il a</td><td class="fr">ils ont</td></tr></table>'+
   '<p>年齢は avoir：<span class="fr">J\'ai vingt ans.</span>（× Je suis vingt ans）。職業・国籍は無冠詞：<span class="fr">Elle est médecin.</span></p>'+
   '<p>avoir faim / soif / sommeil / chaud / froid、avoir peur de ～、avoir besoin de ～、avoir mal à ～</p>'},
  {k:"ir",t:"-ir動詞",d:"finir・choisir など",c:"#92a6cf",ci:"#7186b4",cw:"#eef1f8",
   memo:'<p>語幹＋語尾 <span class="fr">-is, -is, -it, -issons, -issez, -issent</span></p>'+
   '<table><tr><td class="fr">je finis</td><td class="fr">nous finissons</td></tr><tr><td class="fr">tu finis</td><td class="fr">vous finissez</td></tr><tr><td class="fr">il / elle finit</td><td class="fr">ils / elles finissent</td></tr></table>'+
   '<p>同じ活用：choisir, réussir, grandir, grossir, maigrir, obéir, réfléchir, bâtir</p>'},
  {k:"v4",t:"aller・venir・tenir",d:"",c:"#cf8aa0",ci:"#b16880",cw:"#faeef2",
   memo:'<table><tr><td class="fr">je vais</td><td class="fr">nous allons</td></tr><tr><td class="fr">tu vas</td><td class="fr">vous allez</td></tr><tr><td class="fr">il / elle va</td><td class="fr">ils / elles vont</td></tr></table>'+
   '<table><tr><td class="fr">je viens</td><td class="fr">nous venons</td></tr><tr><td class="fr">tu viens</td><td class="fr">vous venez</td></tr><tr><td class="fr">il / elle vient</td><td class="fr">ils / elles viennent</td></tr></table>'+
   '<p>tenir（つかむ、持つ）も venir と同じ型：<span class="fr">je tiens, nous tenons, ils tiennent</span></p>'+
   '<p>同じ型の動詞：devenir（～になる）、revenir（戻る）、obtenir（手に入れる）</p>'},
  {k:"v5",t:"faire・partir・sortir",d:"",c:"#b48aa8",ci:"#8f667f",cw:"#f6eef3",
   memo:'<table><tr><td class="fr">je fais</td><td class="fr">nous faisons</td></tr><tr><td class="fr">tu fais</td><td class="fr">vous faites</td></tr><tr><td class="fr">il / elle fait</td><td class="fr">ils / elles font</td></tr></table>'+
   '<p>faisons の発音に注意：［フゾン］</p>'+
   '<table><tr><td class="fr">je pars</td><td class="fr">nous partons</td></tr><tr><td class="fr">tu pars</td><td class="fr">vous partez</td></tr><tr><td class="fr">il / elle part</td><td class="fr">ils / elles partent</td></tr></table>'+
   '<p>sortir も同じ型：<span class="fr">je sors, il sort, nous sortons, ils sortent</span></p>'},
  {k:"v6",t:"lire・dire・écrire・attendre・mettre",d:"",c:"#6fb0ad",ci:"#4c8e8b",cw:"#ebf5f4",
   memo:'<p><span class="fr">lire</span>：lis, lis, lit, lisons, lisez, lisent</p>'+
   '<p><span class="fr">dire</span>：dis, dis, dit, disons, <b>dites</b>, disent</p>'+
   '<p><span class="fr">écrire</span>：écris, écris, écrit, écrivons, écrivez, écrivent</p>'+
   '<p><span class="fr">attendre</span>：attends, attends, <b>attend</b>, attendons, attendez, attendent（3人称単数は d で終わる）</p>'+
   '<p><span class="fr">mettre</span>：mets, mets, met, mettons, mettez, mettent</p>'+
   '<p>attendre と同じ型：entendre（聞く）、répondre（答える）、perdre（失う）、rendre（返す）、vendre（売る）、descendre（降りる）。mettre と同じ型：permettre、promettre。</p>'},
  {k:"v7",t:"prendre・connaître・vivre・pouvoir・devoir・vouloir",d:"",c:"#c99b6a",ci:"#a57a48",cw:"#f9f1e8",
   memo:'<p><span class="fr">prendre</span>：prends, prends, prend, prenons, prenez, <b>prennent</b>（apprendre, comprendre も同じ型）</p>'+
   '<p><span class="fr">connaître</span>：connais, connais, <b>connaît</b>, connaissons, connaissez, connaissent</p>'+
   '<p><span class="fr">vivre</span>：vis, vis, vit, vivons, vivez, vivent</p>'+
   '<p><span class="fr">pouvoir</span>：peux, peux, peut, pouvons, pouvez, <b>peuvent</b></p>'+
   '<p><span class="fr">devoir</span>：dois, dois, doit, devons, devez, <b>doivent</b></p>'+
   '<p><span class="fr">vouloir</span>：veux, veux, veut, voulons, voulez, <b>veulent</b></p>'+
   '<p>pouvoir・devoir・vouloir は、うしろに不定詞を置いて「～できる・～しなければならない・～したい」。</p>'},
  {k:"pc",t:"複合過去",d:"avoir / être ＋過去分詞",c:"#9b8fc4",ci:"#7a6ea6",cw:"#f1eff8",
   memo:'<p>助動詞（avoir または être）の現在形＋過去分詞。</p>'+
   '<table><tr><td class="fr">j\'ai chanté</td><td class="fr">nous avons chanté</td></tr><tr><td class="fr">tu as chanté</td><td class="fr">vous avez chanté</td></tr><tr><td class="fr">il / elle a chanté</td><td class="fr">ils / elles ont chanté</td></tr></table>'+
   '<table><tr><td class="fr">je suis allé(e)</td><td class="fr">nous sommes allé(e)s</td></tr><tr><td class="fr">tu es allé(e)</td><td class="fr">vous êtes allé(e)(s)</td></tr><tr><td class="fr">il est allé / elle est allée</td><td class="fr">ils sont allés / elles sont allées</td></tr></table>'+
   '<p>être をとるのは代名動詞と、aller, venir, partir, arriver, sortir, entrer, monter, descendre, naître, mourir, revenir, rentrer, retourner, rester, tomber, devenir。être のときは過去分詞が主語の性数に一致する。</p>'+
   '<p>代名動詞：<span class="fr">je me suis levé(e), elle s\'est levée, ils se sont levés</span></p>'},
  {k:"imp",t:"半過去",d:"-ais, -ais, -ait, -ions, -iez, -aient",c:"#7fa7c9",ci:"#5c86aa",cw:"#edf3f8",
   memo:'<p>語幹＝現在形の nous の形から -ons をとったもの＋語尾 <span class="fr">-ais, -ais, -ait, -ions, -iez, -aient</span></p>'+
   '<table><tr><td class="fr">je parlais</td><td class="fr">nous parlions</td></tr><tr><td class="fr">tu parlais</td><td class="fr">vous parliez</td></tr><tr><td class="fr">il / elle parlait</td><td class="fr">ils / elles parlaient</td></tr></table>'+
   '<p><span class="fr">avoir（nous avons）→ j\'avais　finir（nous finissons）→ je finissais　faire（nous faisons）→ je faisais</span></p>'+
   '<p>例外は être：<span class="fr">j\'étais, tu étais, il était, nous étions, vous étiez, ils étaient</span></p>'+
   '<p>manger → je mangeais（nous mangions）、commencer → je commençais（nous commencions）：a・o の前だけ e・ç が入る。</p>'+
   '<p>pleuvoir → il pleuvait、falloir → il fallait。用法：過去の状態・進行中のこと、過去の習慣「～していた」。</p>'}
]};

/* ---------- Leçon 2：-er動詞 ---------- */
FROM(2,18);
W("er","Tu ___ japonais ?（parler）","parles","tu → -es。",{ja:"きみは日本語を話すの？"});
W("er","Nous ___ à Nara.（habiter）","habitons","nous → -ons。",{ja:"私たちは奈良に住んでいる。"});
W("er","Elles ___ bien.（chanter）","chantent","ils / elles → -ent（発音しない）。",{ja:"彼女たちは歌がうまい。"});
W("er","Vous ___ le thé ?（aimer）","aimez","vous → -ez。",{ja:"お茶はお好きですか？"});
W("er","Je ___ le samedi.（travailler）","travaille","je → -e。",{ja:"私は毎週土曜日に働いている。"});
W("er","J'___ de la musique.（écouter）","écoute","母音で始まる動詞なので je → j'。語尾は -e。",{ja:"私は音楽を聴く。"});
W("er","Il ___ la télévision.（regarder）","regarde","il → -e。",{ja:"彼はテレビを見ている。"});
W("er","Les enfants ___ dans le jardin.（jouer）","jouent","主語が複数の名詞 → ils と同じ -ent。",{ja:"子どもたちは庭で遊んでいる。"});
W("er","Mes parents ___ à Kobe.（habiter）","habitent","mes parents ＝ ils → -ent。",{ja:"私の両親は神戸に住んでいる。"});
W("er","Vous ___ le français.（étudier）","étudiez","vous → -ez。",{ja:"あなたはフランス語を勉強している。"});
W("er","Nous ___ un appartement.（chercher）","cherchons","nous → -ons。",{ja:"私たちはアパートを探している。"});
W("er","Marie ___ des fleurs à sa mère.（donner）","donne","Marie ＝ elle → -e。",{ja:"マリーはお母さんに花をあげる。"});
W("er","Tu ___ demain ?（arriver）","arrives","tu → -es。",{ja:"きみは明日着くの？"});
W("er","On ___ ?（danser）","danse","on は3人称単数扱い → -e。",{ja:"踊ろうか？"});
C("er","Ils ___ français.（parler）","parlent",["parlent","parlont","parles","parlez"],"ils → -ent。× parlont（-ont は avoir や être の形と混同しやすい）。",{ja:"彼らはフランス語を話す。"});
C("er","Nous ___ souvent.（marcher）","marchons",["marchons","marchez","marchent","marchonts"],"nous → -ons。",{ja:"私たちはよく歩く。"});
C("er","___ aime le chocolat.","J'",["J'","Je"],"aimer は母音で始まる → j'。",{ja:"私はチョコレートが好きだ。"});
C("er","___ travaille ici.","Je",["Je","J'"],"travailler は子音で始まる → je のまま。",{ja:"私はここで働いている。"});
C("er","___ habite à Osaka.","J'",["J'","Je"],"無音の h で始まる動詞の前でも j'。",{ja:"私は大阪に住んでいる。"});
W("er","Nous ___ ensemble.（manger）","mangeons","発展：manger は nous のとき mangeons（g の音を保つため e を入れる）。",{ja:"私たちはいっしょに食べる。"});
W("er","Nous ___ à neuf heures.（commencer）","commençons","発展：commencer は nous のとき commençons（c を［s］で読むため ç）。",{ja:"私たちは9時に始める。"});

/* ---------- Leçon 2：être と avoir ---------- */
FROM(2,39);
W("ea","Je ___ étudiante.（être）","suis","être：je suis。職業・身分は無冠詞。",{ja:"私は学生です（女性）。"});
W("ea","Vous ___ japonais ?（être）","êtes","être：vous êtes（ê に注意）。",{ja:"あなたは日本人ですか？"});
W("ea","Nous ___ dans le train.（être）","sommes","être：nous sommes。",{ja:"私たちは電車の中にいる。"});
W("ea","Ils ___ en retard.（être）","sont","être：ils sont。",{ja:"彼らは遅刻している。"});
W("ea","Tu ___ là ?（être）","es","être：tu es。",{ja:"そこにいるの？"});
W("ea","Elle ___ médecin.（être）","est","être：elle est。職業は無冠詞（× Elle est une médecin）。",{ja:"彼女は医者だ。"});
W("ea","J'___ vingt ans.（avoir）","ai","avoir：j'ai。年齢は avoir で言う。",{ja:"私は20歳です。"});
W("ea","Tu ___ un stylo ?（avoir）","as","avoir：tu as。",{ja:"ペン持ってる？"});
W("ea","Nous ___ cours demain.（avoir）","avons","avoir：nous avons。",{ja:"私たちは明日授業がある。"});
W("ea","Ils ___ deux chiens.（avoir）","ont","avoir：ils ont（sont と混同しないこと）。",{ja:"彼らは犬を2匹飼っている。"});
W("ea","Vous ___ des frères ?（avoir）","avez","avoir：vous avez。",{ja:"ご兄弟はいますか？"});
W("ea","Elle ___ une voiture.（avoir）","a","avoir：elle a（à ではない）。",{ja:"彼女は車を持っている。"});
C("ea","J'___ dix-neuf ans.","ai",["ai","suis"],"年齢は avoir。× Je suis dix-neuf ans。",{ja:"私は19歳です。"});
C("ea","Ils ___ étudiants.","sont",["sont","ont"],"「～である」は être。",{ja:"彼らは学生です。"});
C("ea","Elles ___ trois enfants.","ont",["ont","sont"],"「持っている」は avoir。",{ja:"彼女たちには子どもが3人いる。"});
const IDI=["faim","soif","sommeil","peur","besoin","mal","froid","chaud"];
C("ea","Midi ! J'ai ___.","faim",IDI,"avoir faim「おなかがすいている」。",{ja:"お昼だ！おなかがすいた。"});
C("ea","Tu as ___ ? Voici de l'eau.","soif",IDI,"avoir soif「のどがかわく」。",{ja:"のどかわいた？はい、お水。"});
C("ea","Il est minuit. Tu as ___ ?","sommeil",IDI,"avoir sommeil「眠い」。",{ja:"もう夜中だ。眠い？"});
C("ea","Elle a ___ des araignées.","peur",IDI,"avoir peur de ～「～がこわい」。de + les → des。",{ja:"彼女はクモがこわい。"});
C("ea","J'ai ___ de ton aide.","besoin",IDI,"avoir besoin de ～「～が必要だ」。",{ja:"きみの助けが必要だ。"});
C("ea","J'ai ___ à la tête.","mal",IDI,"avoir mal à ～「～が痛い」。",{ja:"頭が痛い。"});
C("ea","Il neige. J'ai ___.","froid",IDI,"avoir froid「寒い」。",{ja:"雪だ。寒い。"});
C("ea","Il fait 35 degrés ! On a ___.","chaud",IDI,"avoir chaud「暑い」。",{ja:"35度だ！暑いね。"});

/* ---------- Leçon 3：-ir動詞 ---------- */
FROM(3,28);
W("ir","Je ___ à cinq heures.（finir）","finis","je → -is。",{ja:"私は5時に終わる。"});
W("ir","Tu ___ ce gâteau ?（choisir）","choisis","tu → -is。",{ja:"このケーキにするの？"});
W("ir","Il ___ ses devoirs.（finir）","finit","il → -it。",{ja:"彼は宿題を終える。"});
W("ir","Nous ___ un cadeau pour Léa.（choisir）","choisissons","nous → -issons。",{ja:"私たちはレアへのプレゼントを選ぶ。"});
W("ir","Vous ___ trop.（réfléchir）","réfléchissez","vous → -issez。",{ja:"あなたは考えすぎです。"});
W("ir","Ils ___ vite.（grandir）","grandissent","ils → -issent。",{ja:"彼らはすぐ大きくなる。"});
W("ir","Elle ___ toujours.（réussir）","réussit","elle → -it。",{ja:"彼女はいつも成功する。"});
W("ir","Les élèves ___ au professeur.（obéir）","obéissent","主語が複数名詞 → -issent。obéir à ～「～に従う」。",{ja:"生徒たちは先生の言うことを聞く。"});
W("ir","On ___ tard aujourd'hui.（finir）","finit","on は3人称単数扱い → -it。",{ja:"今日は（私たちは）終わるのが遅い。"});
W("ir","Je ___ en hiver.（grossir）","grossis","je → -is。",{ja:"私は冬に太る。"});
W("ir","Nous ___ le repas.（finir）","finissons","nous → -issons。",{ja:"私たちは食事を終える。"});
C("ir","Vous ___ ce livre ?（choisir）","choisissez",["choisissez","choisez","choisisez"],"vous → -issez（s は2つ）。",{ja:"この本にしますか？"});
C("ir","Elles ___ le travail.（finir）","finissent",["finissent","finent","finisent"],"elles → -issent。",{ja:"彼女たちは仕事を終える。"});
C("ir","Il ___ beaucoup.（maigrir）","maigrit",["maigrit","maigris","maigre"],"il → -it。",{ja:"彼はずいぶんやせてきている。"});

/* ---------- Leçon 4：aller・venir・tenir ---------- */
FROM(4,0);
W("v4","Je ___ à la bibliothèque.（aller）","vais","aller：je vais。",{ja:"私は図書館に行く。"});
W("v4","Tu ___ au cinéma ce soir ?（aller）","vas","aller：tu vas。",{ja:"今夜映画に行くの？"});
W("v4","Il ___ à Kyoto en train.（aller）","va","aller：il va。",{ja:"彼は電車で京都に行く。"});
W("v4","Nous ___ chez Marie.（aller）","allons","aller：nous allons。",{ja:"私たちはマリーの家に行く。"});
W("v4","Comment ___-vous ?（aller）","allez","aller：vous allez。Comment allez-vous ?「お元気ですか」。",{ja:"お元気ですか？"});
W("v4","Ils ___ à l'université à pied.（aller）","vont","aller：ils vont。",{ja:"彼らは歩いて大学に行く。"});
W("v4","Je ___ du Japon.（venir）","viens","venir：je viens。venir de ～「～から来る、～の出身だ」。",{ja:"私は日本から来ました。"});
W("v4","Tu ___ avec nous ?（venir）","viens","venir：tu viens。",{ja:"いっしょに来る？"});
W("v4","Elle ___ de Lyon.（venir）","vient","venir：elle vient。",{ja:"彼女はリヨンの出身だ。"});
W("v4","Nous ___ à la fête samedi.（venir）","venons","venir：nous venons。",{ja:"私たちは土曜日のパーティーに行きます。"});
W("v4","D'où ___-vous ?（venir）","venez","venir：vous venez。d'où ＝ de＋où。",{ja:"どちらのご出身ですか？"});
W("v4","Ils ___ ce soir.（venir）","viennent","venir：ils viennent（n を重ねる）。",{ja:"彼らは今夜来る。"});
W("v4","Elle ___ un parapluie à la main.（tenir）","tient","tenir は venir と同じ型：elle tient。",{ja:"彼女は手に傘を持っている。"});
W("v4","Les enfants ___ la main de leur mère.（tenir）","tiennent","tenir：ils tiennent（n を重ねる）。",{ja:"子どもたちは母親と手をつないでいる。"});
W("v4","Il ___ médecin.（devenir）","devient","devenir は venir と同じ型：il devient。",{ja:"彼は医者になる。"});
W("v4","Nous ___ demain.（revenir）","revenons","revenir は venir と同じ型：nous revenons。",{ja:"私たちは明日戻ります。"});
W("v4","Vous ___ votre diplôme en mars ?（obtenir）","obtenez","obtenir は venir と同じ型：vous obtenez。",{ja:"3月に卒業証書を取るのですか？"});
C("v4","Vous ___ à Paris ?（aller）","allez",["allez","allons","vont"],"vous → allez。",{ja:"パリに行くのですか？"});
C("v4","Elles ___ de Nara.（venir）","viennent",["viennent","venent","vient"],"ils / elles → viennent（n を重ねる）。",{ja:"彼女たちは奈良の出身だ。"});
C("v4","Nous ___ un petit café.（tenir）","tenons",["tenons","tienons","tenez"],"nous / vous の語幹は ten-（tenons, tenez）。tenir un café「カフェを経営する」。",{ja:"私たちは小さなカフェを営んでいる。"});
C("v4","Tu ___ souvent ici ?（venir）","viens",["viens","vient","venes"],"tu → viens。",{ja:"よくここに来るの？"});
C("v4","Je ___ bien, merci.（aller）","vais",["vais","va","allons"],"je → vais。aller bien「元気だ」。",{ja:"元気です、ありがとう。"});
B("v4","今年、彼らはフランスに行く。","Cette année, ils vont en France.",["va","au"],"aller：ils vont。France は女性名詞なので en France。");
B("v4","どちらのご出身ですか？","D'où venez-vous ?",["viens","Où"],"venir de ～「～の出身だ」。de＋où → d'où。");

/* ---------- Leçon 5：faire・partir・sortir ---------- */
FROM(5,0);
W("v5","Je ___ du tennis.（faire）","fais","faire：je fais。faire du ＋スポーツ「～をする」。",{ja:"私はテニスをする。"});
W("v5","Tu ___ la cuisine ce soir ?（faire）","fais","faire：tu fais。",{ja:"今夜はきみが料理するの？"});
W("v5","Nous ___ une promenade.（faire）","faisons","faire：nous faisons（発音は［フゾン］）。",{ja:"私たちは散歩する。"});
W("v5","Qu'est-ce que vous ___ ?（faire）","faites","faire：vous faites（-ez ではない）。",{ja:"何をしているのですか？"});
W("v5","Ils ___ leurs devoirs.（faire）","font","faire：ils font。",{ja:"彼らは宿題をする。"});
W("v5","Je ___ demain pour Paris.（partir）","pars","partir：je pars。partir pour ～「～に向けて出発する」。",{ja:"私は明日パリに出発する。"});
W("v5","Le train ___ à dix heures.（partir）","part","partir：il part。",{ja:"列車は10時に出発する。"});
W("v5","Nous ___ en vacances en août.（partir）","partons","partir：nous partons。",{ja:"私たちは8月に休暇に出かける。"});
W("v5","Vous ___ quand ?（partir）","partez","partir：vous partez。",{ja:"いつ出発しますか？"});
W("v5","Elles ___ tôt le matin.（partir）","partent","partir：elles partent。",{ja:"彼女たちは朝早く出発する。"});
W("v5","Tu ___ ce soir ?（sortir）","sors","sortir：tu sors。",{ja:"今夜出かけるの？"});
W("v5","Elle ___ avec ses amis.（sortir）","sort","sortir：elle sort。",{ja:"彼女は友だちと出かける。"});
W("v5","Nous ___ du cinéma à neuf heures.（sortir）","sortons","sortir：nous sortons。sortir de ～「～から出る」。",{ja:"私たちは9時に映画館を出る。"});
W("v5","Ils ___ souvent le samedi.（sortir）","sortent","sortir：ils sortent。",{ja:"彼らは土曜日によく出かける。"});
C("v5","Vous ___ du sport ?（faire）","faites",["faites","faisez","faisons"],"vous → faites。",{ja:"スポーツをしますか？"});
C("v5","Ils ___ la vaisselle.（faire）","font",["font","faisent","fait"],"ils → font。",{ja:"彼らは皿洗いをする。"});
C("v5","Il ___ froid aujourd'hui.（faire）","fait",["fait","fais","font"],"天候の il fait（非人称）。",{ja:"今日は寒い。"});
C("v5","Tu ___ à quelle heure ?（partir）","pars",["pars","partes","part"],"tu → pars。",{ja:"何時に出発するの？"});
C("v5","Elle ___ du bureau à six heures.（sortir）","sort",["sort","sors","sortent"],"elle → sort。",{ja:"彼女は6時に会社を出る。"});
B("v5","週末は何をするの？","Qu'est-ce que tu fais ce week-end ?",["fait","qui"],"faire：tu fais。「何を」→ qu'est-ce que。");
B("v5","私たちは明日の朝出発する。","Nous partons demain matin.",["partez","sortons"],"partir：nous partons。");

/* ---------- Leçon 6：lire・dire・écrire・attendre・mettre ---------- */
FROM(6,0);
W("v6","Je ___ le journal le matin.（lire）","lis","lire：je lis。",{ja:"私は朝、新聞を読む。"});
W("v6","Elle ___ un roman.（lire）","lit","lire：elle lit。",{ja:"彼女は小説を読んでいる。"});
W("v6","Nous ___ un texte en français.（lire）","lisons","lire：nous lisons。",{ja:"私たちはフランス語の文章を読む。"});
W("v6","Ils ___ des mangas.（lire）","lisent","lire：ils lisent。",{ja:"彼らはマンガを読む。"});
W("v6","Qu'est-ce que tu ___ ?（dire）","dis","dire：tu dis。",{ja:"何て言ったの？（何を言っているの？）"});
W("v6","Il ___ bonjour à tout le monde.（dire）","dit","dire：il dit。",{ja:"彼はみんなにあいさつをする。"});
W("v6","Vous ___ la vérité ?（dire）","dites","dire：vous dites（-ez ではない）。",{ja:"本当のことを言っていますか？"});
W("v6","Ils ___ que c'est facile.（dire）","disent","dire：ils disent。",{ja:"彼らはそれは簡単だと言う。"});
W("v6","J'___ une lettre à ma grand-mère.（écrire）","écris","écrire：j'écris。",{ja:"私は祖母に手紙を書く。"});
W("v6","Nous ___ un mail au professeur.（écrire）","écrivons","écrire：nous écrivons（v が入る）。",{ja:"私たちは先生にメールを書く。"});
W("v6","Elles ___ des poèmes.（écrire）","écrivent","écrire：elles écrivent。",{ja:"彼女たちは詩を書く。"});
W("v6","J'___ le bus.（attendre）","attends","attendre：j'attends。",{ja:"私はバスを待っている。"});
W("v6","Elle ___ son ami devant la gare.（attendre）","attend","attendre：elle attend（d で終わる）。",{ja:"彼女は駅の前で友だちを待っている。"});
W("v6","Vous ___ quelqu'un ?（attendre）","attendez","attendre：vous attendez。",{ja:"だれかを待っているのですか？"});
W("v6","Je ___ du sucre dans mon café.（mettre）","mets","mettre：je mets。",{ja:"私はコーヒーに砂糖を入れる。"});
W("v6","Il ___ son manteau.（mettre）","met","mettre：il met。",{ja:"彼はコートを着る。"});
W("v6","Nous ___ la table.（mettre）","mettons","mettre：nous mettons。mettre la table「食卓の準備をする」。",{ja:"私たちは食卓の準備をする。"});
W("v6","Ils ___ une heure pour venir.（mettre）","mettent","mettre：ils mettent。mettre＋時間「（時間）をかける」。",{ja:"彼らは来るのに1時間かかる。"});
C("v6","Qu'est-ce que vous ___ ?（dire）","dites",["dites","disez","disons"],"vous → dites。",{ja:"何とおっしゃいましたか？"});
C("v6","Tu ___ à ma question ?（répondre）","réponds",["réponds","répond","répondes"],"répondre は attendre と同じ型：tu réponds。",{ja:"私の質問に答えてくれる？"});
C("v6","Il ___ souvent ses clés.（perdre）","perd",["perd","perds","perde"],"perdre は attendre と同じ型：il perd。",{ja:"彼はよく鍵をなくす。"});
C("v6","On ___ des fruits au marché.（vendre）","vend",["vend","vends","vent"],"vendre：on vend（d で終わる）。",{ja:"市場では果物を売っている。"});
C("v6","Nous ___ du train à Nara.（descendre）","descendons",["descendons","descendez","descends"],"descendre：nous descendons。",{ja:"私たちは奈良で電車を降りる。"});
C("v6","Elles ___ des lettres.（écrire）","écrivent",["écrivent","écrient","écrisent"],"écrire の複数形は v が入る。",{ja:"彼女たちは手紙を書く。"});
C("v6","Il ___ de venir demain.（promettre）","promet",["promet","promets","promette"],"promettre は mettre と同じ型：il promet。",{ja:"彼は明日来ると約束する。"});
B("v6","私は駅の前で友だちを待っている。","J'attends mon ami devant la gare.",["attend","à"],"attendre：j'attends。attendre は直接目的補語をとる（à は不要）。");

/* ---------- Leçon 7：prendre・connaître・vivre・pouvoir・devoir・vouloir（新しく追加。番号は V7-） ---------- */
FROM("V7",0);
W("v7","Je ___ le train de huit heures.（prendre）","prends","prendre：je prends。",{ja:"私は8時の電車に乗る。"});
W("v7","Qu'est-ce que vous ___ ?（prendre）","prenez","prendre：vous prenez。",{ja:"何になさいますか？"});
W("v7","Il ___ un café.（prendre）","prend","prendre：il prend（d で終わる）。",{ja:"彼はコーヒーを飲む。"});
W("v7","Nous ___ le japonais.（apprendre）","apprenons","apprendre は prendre と同じ型：nous apprenons。",{ja:"私たちは日本語を習っている。"});
W("v7","Ils ___ le métro.（prendre）","prennent","prendre：ils prennent（n を重ねる）。",{ja:"彼らは地下鉄に乗る。"});
W("v7","Tu ___ ?（comprendre）","comprends","comprendre：tu comprends。",{ja:"わかる？"});
W("v7","Je ___ sa fille.（connaître）","connais","connaître：je connais。",{ja:"私は彼の娘を知っている。"});
W("v7","Elle ___ bien Nara.（connaître）","connaît","connaître：elle connaît（î に注意）。",{ja:"彼女は奈良をよく知っている。"});
W("v7","Vous ___ cette chanson ?（connaître）","connaissez","connaître：vous connaissez。",{ja:"この歌を知っていますか？"});
W("v7","Mon oncle ___ en Italie.（vivre）","vit","vivre：il vit。",{ja:"おじはイタリアで暮らしている。"});
W("v7","Nous ___ à la campagne.（vivre）","vivons","vivre：nous vivons。",{ja:"私たちは田舎で暮らしている。"});
W("v7","Je ne ___ pas venir.（pouvoir）","peux","pouvoir：je peux。",{ja:"私は来られない。"});
W("v7","Ils ne ___ pas rester longtemps.（pouvoir）","peuvent","pouvoir：ils peuvent。",{ja:"彼らは長くはいられない。"});
W("v7","Tu ___ partir maintenant.（devoir）","dois","devoir：tu dois。",{ja:"きみはもう出発しなければならない。"});
W("v7","Vous ___ vous lever tôt.（devoir）","devez","devoir：vous devez。",{ja:"あなたは早く起きなければならない。"});
W("v7","Elle ___ écrire cette lettre ce soir.（devoir）","doit","devoir：elle doit。",{ja:"彼女は今夜この手紙を書かなければならない。"});
W("v7","Il ___ vivre tout seul.（vouloir）","veut","vouloir：il veut。",{ja:"彼はひとりで暮らしたがっている。"});
W("v7","Nous ___ aller à la mer.（vouloir）","voulons","vouloir：nous voulons。",{ja:"私たちは海に行きたい。"});
C("v7","Elles ___ le bus.（prendre）","prennent",["prennent","prenent","prendent"],"prendre：ils / elles prennent（n を重ねる）。",{ja:"彼女たちはバスに乗る。"});
C("v7","Nous ___ Hugo.（connaître）","connaissons",["connaissons","connaîtons","connons"],"connaître：nous connaissons。",{ja:"私たちはユゴーを知っている。"});
C("v7","Ils ___ venir demain.（pouvoir）","peuvent",["peuvent","pouvent","peut"],"pouvoir：ils peuvent。",{ja:"彼らは明日来られる。"});
C("v7","Ils ___ partir.（devoir）","doivent",["doivent","devent","doit"],"devoir：ils doivent。",{ja:"彼らは出発しなければならない。"});
C("v7","Elles ___ apprendre le français.（vouloir）","veulent",["veulent","voulent","veut"],"vouloir：ils / elles veulent。",{ja:"彼女たちはフランス語を習いたい。"});
C("v7","Mes cousins ___ à Lyon.（vivre）","vivent",["vivent","vient","vivont"],"vivre：ils vivent（vient は venir の形）。",{ja:"いとこたちはリヨンで暮らしている。"});
B("v7","レアとゆいは京都行きの電車に乗る。","Léa et Yui prennent le train pour Kyoto.",["prenent","prend"],"prendre：ils / elles prennent。");
B("v7","ゆいはユゴーのお母さんを知っている。","Yui connaît la mère de Hugo.",["connais","sait"],"connaître：elle connaît。");

/* ---------- 複合過去（新しく追加。番号は PC-） ---------- */
FROM("PC",0);
W("pc","J'___ une chanson.（chanter）","ai chanté","avoir＋過去分詞：j'ai chanté。",{ja:"私は歌を1曲歌った。"});
W("pc","Tu ___ tes devoirs ?（finir）","as fini","tu as fini。",{ja:"宿題は終わった？"});
W("pc","Il ___ le bus.（prendre）","a pris","prendre → pris：il a pris。",{ja:"彼はバスに乗った。"});
W("pc","Nous ___ une promenade.（faire）","avons fait","faire → fait：nous avons fait。",{ja:"私たちは散歩した。"});
W("pc","Vous ___ à Léa ?（écrire）","avez écrit","écrire → écrit：vous avez écrit。",{ja:"レアに手紙を書きましたか？"});
W("pc","Ils ___ deux ans à Paris.（vivre）","ont vécu","vivre → vécu：ils ont vécu。",{ja:"彼らはパリで2年暮らした。"});
W("pc","J'___ de la chance.（avoir）","ai eu","avoir → eu：j'ai eu。",{ja:"私は運がよかった。"});
W("pc","Il ___ malade.（être）","a été","être の複合過去は avoir＋été：il a été。",{ja:"彼は病気だった。"});
W("pc","Elle ___ partir tôt.（devoir）","a dû","devoir → dû：elle a dû。",{ja:"彼女は早く出発しなければならなかった。"});
W("pc","Ils ___ venir.（pouvoir・否定文で）","n'ont pas pu","否定文は ne ～ pas で助動詞をはさむ：ils n'ont pas pu。pouvoir → pu。",{ja:"彼らは来られなかった。"});
W("pc","Je ___ au cinéma.（aller）",["suis allé","suis allée"],"aller は être：je suis allé(e)。",{ja:"私は映画に行った。"});
W("pc","Elle ___ avec sa mère.（venir）","est venue","venir は être。elle → venue。",{ja:"彼女はお母さんと来た。"});
W("pc","Nous ___ à huit heures.（partir）",["sommes partis","sommes parties"],"partir は être。nous → partis（女性だけなら parties）。",{ja:"私たちは8時に出発した。"});
W("pc","Ils ___ en retard.（arriver）","sont arrivés","arriver は être。ils → arrivés。",{ja:"彼らは遅れて着いた。"});
W("pc","Elles ___ hier soir.（sortir）","sont sorties","sortir は être。elles → sorties。",{ja:"彼女たちは昨夜出かけた。"});
W("pc","Tu ___ à la maison ?（rester）",["es resté","es restée"],"rester は être：tu es resté(e)。",{ja:"家にいたの？"});
W("pc","Je ___ à six heures.（se lever）",["me suis levé","me suis levée"],"代名動詞は être：je me suis levé(e)。",{ja:"私は6時に起きた。"});
W("pc","Elle ___ tard.（se coucher）","s'est couchée","elle s'est couchée。",{ja:"彼女は遅く寝た。"});
W("pc","Ils ___ dans le parc.（se promener）","se sont promenés","ils se sont promenés。",{ja:"彼らは公園を散歩した。"});
C("pc","Elle ___ partie à midi.","est",["est","a"],"partir は être。",{ja:"彼女は正午に出発した。"});
C("pc","Ils ___ pris le train.","ont",["ont","sont"],"prendre は avoir。",{ja:"彼らは電車に乗った。"});
C("pc","Nous sommes ___ à Nara.（arriver・男性複数）","arrivés",["arrivés","arrivé","arrivées"],"être のとき過去分詞は主語に一致：男性複数 → arrivés。",{ja:"私たちは奈良に着いた。"});
C("pc","Léa a ___ un gâteau.（faire）","fait",["fait","faite","faisé"],"avoir のときは主語に一致しない：a fait。",{ja:"レアはケーキを作った。"});
C("pc","Vous avez ___ ?（comprendre）","compris",["compris","comprendu","comprit"],"comprendre → compris（prendre と同じ型）。",{ja:"わかりましたか？"});
B("pc","ユゴーは昨日リヨンに帰った。","Hugo est rentré à Lyon hier.",["a","rentrée"],"rentrer は être：est rentré。");
B("pc","私たちはいっしょに夕食を食べた。","Nous avons dîné ensemble.",["sommes","dînés"],"dîner は avoir：avons dîné。");

/* ---------- 半過去（新しく追加。番号は IM-） ---------- */
FROM("IM",0);
W("imp","Je ___ avec Sophie.（parler）","parlais","nous parlons → parl-＋-ais：je parlais。",{ja:"私はソフィーと話していた。"});
W("imp","Tu ___ à quelle heure ?（finir）","finissais","nous finissons → finiss-＋-ais：tu finissais。",{ja:"きみは何時に終わっていたの？"});
W("imp","Il ___ beau.（faire）","faisait","nous faisons → fais-＋-ait：il faisait（発音は［フゼ］）。",{ja:"天気がよかった。"});
W("imp","Nous ___ un chien.（avoir）","avions","nous avons → av-＋-ions：nous avions。",{ja:"私たちは犬を飼っていた。"});
W("imp","Vous ___ à Kyoto ?（être）","étiez","être は例外の語幹 ét-：vous étiez。",{ja:"あなたは京都にいたのですか？"});
W("imp","Elle ___ dans la cuisine.（être）","était","être：elle était。",{ja:"彼女は台所にいた。"});
W("imp","Ils ___ souvent au parc.（aller）","allaient","nous allons → all-＋-aient：ils allaient。",{ja:"彼らはよく公園に行っていた。"});
W("imp","Elle ___ le bus tous les matins.（prendre）","prenait","nous prenons → pren-＋-ait：elle prenait。",{ja:"彼女は毎朝バスに乗っていた。"});
W("imp","Nous ___ des romans.（lire）","lisions","nous lisons → lis-＋-ions：nous lisions。",{ja:"私たちは小説を読んでいた。"});
W("imp","Ils ne ___ pas venir.（pouvoir）","pouvaient","nous pouvons → pouv-＋-aient：ils pouvaient。",{ja:"彼らは来られなかった（来られない状態だった）。"});
W("imp","Je ___ devenir médecin.（vouloir）","voulais","nous voulons → voul-＋-ais：je voulais。",{ja:"私は医者になりたかった。"});
W("imp","Il ___ beaucoup.（pleuvoir）","pleuvait","pleuvoir → il pleuvait。",{ja:"雨がたくさん降っていた。"});
W("imp","Il ___ partir.（falloir）","fallait","falloir → il fallait。",{ja:"出発しなければならなかった。"});
W("imp","Je ___ trop.（manger）","mangeais","nous mangeons → mange-＋-ais：je mangeais（a の前で g の音を保つため e が残る）。",{ja:"私は食べすぎていた。"});
W("imp","Nous ___ du riz.（manger）","mangions","-ions の前では e は不要：nous mangions。",{ja:"私たちはお米を食べていた。"});
W("imp","Le cours ___ à neuf heures.（commencer）","commençait","a の前で c → ç：il commençait。",{ja:"授業は9時に始まっていた。"});
W("imp","Tu ___ des lettres à ta grand-mère.（écrire）","écrivais","nous écrivons → écriv-＋-ais：tu écrivais。",{ja:"きみはおばあさんに手紙を書いていた。"});
W("imp","Elle ___ chaque dimanche.（venir）","venait","nous venons → ven-＋-ait：elle venait。",{ja:"彼女は毎週日曜日に来ていた。"});
W("imp","J'___ à Lyon.（habiter）","habitais","j'habitais（母音の前で je → j'）。",{ja:"私はリヨンに住んでいた。"});
C("imp","Ils ___ toujours la vérité.（dire）","disaient",["disaient","dissaient","disent"],"nous disons → dis-＋-aient：ils disaient。",{ja:"彼らはいつも本当のことを言っていた。"});
C("imp","Je ___ bien Léa.（connaître）","connaissais",["connaissais","connaîtais","connais"],"nous connaissons → connaiss-＋-ais：je connaissais。",{ja:"私はレアをよく知っていた。"});
C("imp","Nous ___ le soir.（sortir）","sortions",["sortions","sortaions","sortons"],"nous sortons → sort-＋-ions：nous sortions。",{ja:"私たちは夜に出かけていた。"});
C("imp","Vous ___ fatigués.（être）","étiez",["étiez","êtiez","étaiez"],"être の半過去：vous étiez。",{ja:"あなたたちは疲れていた。"});
C("imp","Elles ___ deux enfants.（avoir）","avaient",["avaient","avait","avaiont"],"ils / elles → -aient：elles avaient。",{ja:"彼女たちには子どもが2人いた。"});
B("imp","子どものころ、レアは毎週日曜日におばあさんの家に行っていた。","Quand elle était petite, Léa allait chez sa grand-mère chaque dimanche.",["allée","va"],"過去の習慣は半過去：allait。");
B("imp","電話が鳴ったとき、ゆいは台所にいた。","Yui était dans la cuisine quand le téléphone a sonné.",["est","sonnait"],"そのとき続いていた状態は半過去（était）、起きた出来事は複合過去（a sonné）。");
