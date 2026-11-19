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
  {k:"v8",t:"savoir・voir・recevoir・boire",d:"Leçon 8",c:"#b79a6e",ci:"#94784c",cw:"#f8f2e8",
   memo:'<table><tr><th>savoir</th><th>voir</th><th>recevoir</th><th>boire</th></tr>'+
   '<tr><td class="fr">je sais</td><td class="fr">je vois</td><td class="fr">je reçois</td><td class="fr">je bois</td></tr>'+
   '<tr><td class="fr">tu sais</td><td class="fr">tu vois</td><td class="fr">tu reçois</td><td class="fr">tu bois</td></tr>'+
   '<tr><td class="fr">il sait</td><td class="fr">il voit</td><td class="fr">il reçoit</td><td class="fr">il boit</td></tr>'+
   '<tr><td class="fr">nous savons</td><td class="fr">nous voyons</td><td class="fr">nous recevons</td><td class="fr">nous buvons</td></tr>'+
   '<tr><td class="fr">vous savez</td><td class="fr">vous voyez</td><td class="fr">vous recevez</td><td class="fr">vous buvez</td></tr>'+
   '<tr><td class="fr">ils savent</td><td class="fr">ils voient</td><td class="fr">ils reçoivent</td><td class="fr">ils boivent</td></tr></table>'+
   '<p>過去分詞：<span class="fr">su, vu, reçu, bu</span></p>'+
   '<p>recevoir は a・o・u の前で c → ç：<span class="fr">je reçois / nous recevons</span>。voir は nous・vous で i → y：<span class="fr">nous voyons</span>。boire は nous・vous で語幹が buv-。</p>'+
   '<p>同じ型：<span class="fr">revoir（再会する）、apercevoir（見える）</span></p>'},
  {k:"v9",t:"dormir・sentir・ouvrir・conduire",d:"Leçon 9（p.54）",c:"#8aa77a",ci:"#68875a",cw:"#f0f5ec",
   memo:'<table><tr><td class="fr">je dors</td><td class="fr">nous dormons</td></tr><tr><td class="fr">tu dors</td><td class="fr">vous dormez</td></tr><tr><td class="fr">il / elle dort</td><td class="fr">ils / elles dorment</td></tr></table>'+
   '<p><span class="fr">dormir</span> と <span class="fr">sentir</span> は partir・sortir と同じ型：単数は m・t を落として -s, -s, -t、複数で m・t がもどる。<span class="fr">sentir</span>：sens, sens, sent, sentons, sentez, sentent。同じ型：<span class="fr">servir（仕える、出す）</span></p>'+
   '<table><tr><td class="fr">j\'ouvre</td><td class="fr">nous ouvrons</td></tr><tr><td class="fr">tu ouvres</td><td class="fr">vous ouvrez</td></tr><tr><td class="fr">il / elle ouvre</td><td class="fr">ils / elles ouvrent</td></tr></table>'+
   '<p><span class="fr">ouvrir</span> は -ir で終わるのに、<b>-er 動詞と同じ語尾</b>（-e, -es, -e, -ons, -ez, -ent）。同じ型：<span class="fr">couvrir（覆う）、découvrir（発見する）、offrir（贈る）、souffrir（苦しむ）</span></p>'+
   '<table><tr><td class="fr">je conduis</td><td class="fr">nous conduisons</td></tr><tr><td class="fr">tu conduis</td><td class="fr">vous conduisez</td></tr><tr><td class="fr">il / elle conduit</td><td class="fr">ils / elles conduisent</td></tr></table>'+
   '<p><span class="fr">conduire</span>：複数で s が入る（lire と同じ型）。同じ型：<span class="fr">construire（建てる）、introduire（紹介する、導入する）、produire（生産する）、traduire（翻訳する）</span></p>'+
   '<p>過去分詞：<span class="fr">dormir → dormi, sentir → senti, ouvrir → ouvert, conduire → conduit</span></p>'},
  {k:"v10",t:"peindre・disparaître・plaire・croire",d:"Leçon 10（p.60）",c:"#c48f7a",ci:"#a36e59",cw:"#f9efea",
   memo:'<table><tr><th>peindre</th><th>disparaître</th><th>plaire</th><th>croire</th></tr>'+
   '<tr><td class="fr">je peins</td><td class="fr">je disparais</td><td class="fr">je plais</td><td class="fr">je crois</td></tr>'+
   '<tr><td class="fr">tu peins</td><td class="fr">tu disparais</td><td class="fr">tu plais</td><td class="fr">tu crois</td></tr>'+
   '<tr><td class="fr">il peint</td><td class="fr">il disparaît</td><td class="fr">il plaît</td><td class="fr">il croit</td></tr>'+
   '<tr><td class="fr">nous peignons</td><td class="fr">nous disparaissons</td><td class="fr">nous plaisons</td><td class="fr">nous croyons</td></tr>'+
   '<tr><td class="fr">vous peignez</td><td class="fr">vous disparaissez</td><td class="fr">vous plaisez</td><td class="fr">vous croyez</td></tr>'+
   '<tr><td class="fr">ils peignent</td><td class="fr">ils disparaissent</td><td class="fr">ils plaisent</td><td class="fr">ils croient</td></tr></table>'+
   '<p>過去分詞：<span class="fr">peint, disparu, plu, cru</span></p>'+
   '<p>peindre は複数で <b>-gn-</b>。同じ型：<span class="fr">craindre（恐れる）、atteindre（達する）、rejoindre（合流する）</span></p>'+
   '<p>disparaître は複数で <b>-ss-</b>、il の形は t の前の i に ^。同じ型：<span class="fr">connaître、paraître（～に見える）、apparaître（現れる）、reconnaître（見分ける）</span></p>'+
   '<p>plaire à ～「～の気に入る」：<span class="fr">Ce film me plaît.</span>（この映画が私の気に入る＝私はこの映画が好き）</p>'+
   '<p>croire は nous・vous で i → y（voir と同じ）。</p>'},
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
   '<p>pleuvoir → il pleuvait、falloir → il fallait。用法：過去の状態・進行中のこと、過去の習慣「～していた」。</p>'},
  {k:"pq",t:"大過去",d:"助動詞の半過去＋過去分詞",c:"#b48aa8",ci:"#8f667f",cw:"#f6eef3",
   memo:'<p>助動詞（avoir / être）の<b>半過去</b>＋過去分詞。avoir か être かの選び方と、過去分詞の一致は複合過去と同じ。</p>'+
   '<table><tr><td class="fr">j\'avais fini</td><td class="fr">nous avions fini</td></tr><tr><td class="fr">tu avais fini</td><td class="fr">vous aviez fini</td></tr><tr><td class="fr">il avait fini</td><td class="fr">ils avaient fini</td></tr></table>'+
   '<table><tr><td class="fr">j\'étais parti(e)</td><td class="fr">nous étions parti(e)s</td></tr><tr><td class="fr">tu étais parti(e)</td><td class="fr">vous étiez parti(e)(s)</td></tr><tr><td class="fr">il était parti / elle était partie</td><td class="fr">ils étaient partis / elles étaient parties</td></tr></table>'+
   '<p>代名動詞：<span class="fr">je m\'étais levé(e), elle s\'était levée, ils s\'étaient levés</span></p>'+
   '<p>否定：<span class="fr">je n\'avais pas fini</span>（助動詞を ne ～ pas ではさむ）</p>'},
  {k:"fs",t:"単純未来",d:"不定詞＋-ai, -as, -a, -ons, -ez, -ont（Leçon 10）",c:"#6fb0ad",ci:"#4c8e8b",cw:"#ebf5f4",
   memo:'<p>不定詞（-re で終わる動詞は e をとる）＋語尾 <span class="fr">-ai, -as, -a, -ons, -ez, -ont</span></p>'+
   '<table><tr><td class="fr">je parlerai</td><td class="fr">nous parlerons</td></tr><tr><td class="fr">tu parleras</td><td class="fr">vous parlerez</td></tr><tr><td class="fr">il / elle parlera</td><td class="fr">ils / elles parleront</td></tr></table>'+
   '<p><span class="fr">finir → je finirai　prendre → je prendrai　dire → je dirai</span></p>'+
   '<table><tr><td class="fr">avoir → j\'aurai</td><td class="fr">être → je serai</td><td class="fr">aller → j\'irai</td></tr>'+
   '<tr><td class="fr">faire → je ferai</td><td class="fr">venir → je viendrai</td><td class="fr">tenir → je tiendrai</td></tr>'+
   '<tr><td class="fr">voir → je verrai</td><td class="fr">savoir → je saurai</td><td class="fr">pouvoir → je pourrai</td></tr>'+
   '<tr><td class="fr">vouloir → je voudrai</td><td class="fr">devoir → je devrai</td><td class="fr">recevoir → je recevrai</td></tr>'+
   '<tr><td class="fr">envoyer → j\'enverrai</td><td class="fr">falloir → il faudra</td><td class="fr">pleuvoir → il pleuvra</td></tr></table>'+
   '<p>つづりに注意：<span class="fr">acheter → j\'achèterai　appeler → j\'appellerai　se lever → je me lèverai</span></p>'},
  {k:"fa",t:"前未来",d:"助動詞の単純未来＋過去分詞（Leçon 10）",c:"#c99b6a",ci:"#a57a48",cw:"#f9f1e8",
   memo:'<p>助動詞（avoir / être）の<b>単純未来</b>＋過去分詞。avoir か être かの選び方と、過去分詞の一致は複合過去と同じ。</p>'+
   '<table><tr><td class="fr">j\'aurai fini</td><td class="fr">nous aurons fini</td></tr><tr><td class="fr">tu auras fini</td><td class="fr">vous aurez fini</td></tr><tr><td class="fr">il aura fini</td><td class="fr">ils auront fini</td></tr></table>'+
   '<table><tr><td class="fr">je serai parti(e)</td><td class="fr">nous serons parti(e)s</td></tr><tr><td class="fr">tu seras parti(e)</td><td class="fr">vous serez parti(e)(s)</td></tr><tr><td class="fr">il sera parti / elle sera partie</td><td class="fr">ils seront partis / elles seront parties</td></tr></table>'+
   '<p>代名動詞：<span class="fr">je me serai levé(e), ils se seront levés</span></p>'}
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

/* ---------- Leçon 9：dormir・sentir・ouvrir・conduire（新しく追加。番号は V9-） ---------- */
FROM("V9",0);
W("v9","Je ___ huit heures par nuit.（dormir）","dors","dormir：je dors（m が落ちる）。",{ja:"私は毎晩8時間眠る。"});
W("v9","Tu ___ bien ?（dormir）","dors","dormir：tu dors。",{ja:"よく眠れてる？"});
W("v9","Le bébé ___ dans sa chambre.（dormir）","dort","dormir：il dort（t で終わる）。",{ja:"赤ちゃんは部屋で眠っている。"});
W("v9","Nous ___ peu pendant les examens.（dormir）","dormons","dormir：nous dormons（複数では m がもどる）。",{ja:"試験の間、私たちはあまり眠らない。"});
W("v9","Vous ___ tard le dimanche ?（dormir）","dormez","dormir：vous dormez。",{ja:"日曜日は遅くまで寝ていますか？"});
W("v9","Les cerfs ___ dans le parc.（dormir）","dorment","dormir：ils dorment。",{ja:"シカたちは公園で眠っている。"});
W("v9","Je ___ une bonne odeur.（sentir）","sens","sentir：je sens（t が落ちる）。",{ja:"いいにおいがする。"});
W("v9","Tu ___ le vent ?（sentir）","sens","sentir：tu sens。",{ja:"風を感じる？"});
W("v9","Ce gâteau ___ bon !（sentir）","sent","sentir：il sent。sentir bon で「いいにおいがする」。",{ja:"このケーキ、いいにおい！"});
W("v9","Nous ___ le printemps arriver.（sentir）","sentons","sentir：nous sentons。",{ja:"私たちは春が来るのを感じる。"});
C("v9","Comment vous ___-vous aujourd'hui ?（se sentir）","sentez",["sentez","sentes","sentons"],"se sentir：vous vous sentez。倒置で sentez-vous。",{ja:"今日の気分はいかがですか？"});
W("v9","Elles ___ la fatigue.（sentir）","sentent","sentir：elles sentent。",{ja:"彼女たちは疲れを感じている。"});
W("v9","J'___ la fenêtre.（ouvrir）","ouvre","ouvrir：j'ouvre（-er 動詞と同じ語尾 -e）。",{ja:"私は窓を開ける。"});
W("v9","Tu ___ la porte, s'il te plaît ?（ouvrir）","ouvres","ouvrir：tu ouvres。",{ja:"ドアを開けてくれる？"});
W("v9","La boulangerie ___ à sept heures.（ouvrir）","ouvre","ouvrir：elle ouvre。",{ja:"パン屋は7時に開く。"});
W("v9","Nous ___ nos livres à la page 54.（ouvrir）","ouvrons","ouvrir：nous ouvrons。",{ja:"私たちは教科書の54ページを開く。"});
W("v9","Vous ___ le cadeau ?（ouvrir）","ouvrez","ouvrir：vous ouvrez。",{ja:"プレゼントを開けますか？"});
W("v9","Les magasins ___ à dix heures.（ouvrir）","ouvrent","ouvrir：ils ouvrent。",{ja:"お店は10時に開く。"});
W("v9","Je ne ___ pas.（conduire）","conduis","conduire：je conduis。",{ja:"私は運転しない。"});
W("v9","Tu ___ trop vite !（conduire）","conduis","conduire：tu conduis。",{ja:"きみ、運転が速すぎるよ！"});
W("v9","Hugo ___ la voiture de son père.（conduire）","conduit","conduire：il conduit（t で終わる）。",{ja:"ユゴーは父親の車を運転する。"});
W("v9","Nous ___ prudemment.（conduire）","conduisons","conduire：nous conduisons（複数では s が入る）。",{ja:"私たちは慎重に運転する。"});
W("v9","Vous ___ depuis longtemps ?（conduire）","conduisez","conduire：vous conduisez。",{ja:"運転歴は長いのですか？"});
W("v9","Mes parents ___ une petite voiture.（conduire）","conduisent","conduire：ils conduisent。",{ja:"両親は小さな車を運転している。"});
C("v9","Ils ___ bien.（dormir）","dorment",["dorment","dorent","dormont"],"dormir：ils dorment。複数では m がもどる。",{ja:"彼らはよく眠る。"});
C("v9","Elle ___ toute la nuit.（dormir）","dort",["dort","dors","dorme"],"dormir：il / elle dort（t で終わる）。",{ja:"彼女は一晩じゅう眠る。"});
C("v9","Ça ___ le café !（sentir）","sent",["sent","sens","sente"],"sentir：il sent。",{ja:"コーヒーのにおいがする！"});
C("v9","Il ___ la fenêtre.（ouvrir）","ouvre",["ouvre","ouvrent","ouvert"],"ouvrir：il ouvre（-er 動詞と同じ語尾）。ouvert は過去分詞。",{ja:"彼は窓を開ける。"});
C("v9","Elles ___ la porte.（ouvrir）","ouvrent",["ouvrent","ouvrissent","ouvront"],"ouvrir：elles ouvrent。",{ja:"彼女たちはドアを開ける。"});
C("v9","Nous ___ la voiture.（conduire）","conduisons",["conduisons","conduions","conduirons"],"conduire：nous conduisons（s が入る）。",{ja:"私たちが車を運転する。"});
C("v9","Ils ___ un bus.（conduire）","conduisent",["conduisent","conduient","conduisont"],"conduire：ils conduisent。",{ja:"彼らはバスを運転する。"});
C("v9","Le serveur ___ le café.（servir）","sert",["sert","servent","sers"],"servir は dormir・sentir と同じ型：il sert。",{ja:"ウエーターがコーヒーを出す。"});
C("v9","Léa ___ des fleurs à sa mère.（offrir）","offre",["offre","offrent","offert"],"offrir は ouvrir と同じ型：elle offre。",{ja:"レアは母親に花を贈る。"});
C("v9","Ils ___ une maison.（construire）","construisent",["construisent","construient","construisont"],"construire は conduire と同じ型：ils construisent。",{ja:"彼らは家を建てる。"});
C("v9","Je ___ ce texte en japonais.（traduire）","traduis",["traduis","traduit","traduisons"],"traduire は conduire と同じ型：je traduis。",{ja:"私はこの文章を日本語に訳す。"});
C("v9","ouvrir の過去分詞は？","ouvert",["ouvert","ouvri","ouvru"],"ouvrir → ouvert（couvrir → couvert, offrir → offert）。",{cw:false});
W("v9","Hier, j'ai bien ___.（dormir）","dormi","dormir の過去分詞：dormi。",{ja:"昨日はよく眠れた。"});
W("v9","Hugo a ___ jusqu'à Kyoto.（conduire）","conduit","conduire の過去分詞：conduit。",{ja:"ユゴーは京都まで運転した。"});
T("v9","主語を nous に","Je dors bien.",["Nous dormons bien."],"dormir：nous dormons。",{extra:["dorons","dormmons"]});
T("v9","主語を ils に","Il ouvre la fenêtre.",["Ils ouvrent la fenêtre."],"ouvrir：ils ouvrent。",{extra:["ouvrissent","ouvre"]});
T("v9","主語を vous に","Tu conduis bien.",["Vous conduisez bien."],"conduire：vous conduisez。",{extra:["conduiez","conduis"]});
B("v9","ゆいは毎朝窓を開ける。","Yui ouvre la fenêtre tous les matins.",["ouvrent","ouvert"],"ouvrir：elle ouvre。");
B("v9","レアとユゴーは車を運転しない。","Léa et Hugo ne conduisent pas.",["conduient","conduit"],"conduire：ils conduisent。");
B("v9","私は気分がいい。","Je me sens bien.",["sent","sente"],"se sentir：je me sens。");
/* ---------- Leçon 9 の動詞：ほかの時制（番号は V9- の続き） ---------- */
C("v9","Hier, Yui ___ dix heures.（dormir・複合過去）","a dormi",["a dormi","est dormie","a dormu"],"dormir は avoir。過去分詞は dormi。",{ja:"昨日、ゆいは10時間眠った。"});
C("v9","Nous ___ toutes les fenêtres.（ouvrir・複合過去）","avons ouvert",["avons ouvert","avons ouvri","sommes ouverts"],"ouvrir の過去分詞は ouvert。",{ja:"私たちは窓を全部開けた。"});
C("v9","J'___ un livre à Léa.（offrir・複合過去）","ai offert",["ai offert","ai offri","ai offrit"],"offrir は ouvrir と同じ型：過去分詞 offert。",{ja:"私はレアに本を贈った。"});
C("v9","Ils ___ une maison l'année dernière.（construire・複合過去）","ont construit",["ont construit","ont construi","ont construisé"],"construire は conduire と同じ型：過去分詞 construit。",{ja:"彼らは去年、家を建てた。"});
C("v9","Je n'ai rien ___.（sentir・複合過去）","senti",["senti","sentu","sens"],"sentir の過去分詞は senti。",{ja:"私は何も感じなかった。"});
C("v9","Le bébé ___ quand je suis rentrée.（dormir・半過去）","dormait",["dormait","dorait","dormissait"],"nous dormons → dorm-＋-ait：il dormait。",{ja:"私が帰ったとき、赤ちゃんは眠っていた。"});
C("v9","Hugo ___ quand j'ai téléphoné.（conduire・半過去）","conduisait",["conduisait","conduait","conduirait"],"nous conduisons → conduis-＋-ait：il conduisait。",{ja:"私が電話したとき、ユゴーは運転していた。"});
C("v9","En été, vous ___ les fenêtres le matin.（ouvrir・半過去）","ouvriez",["ouvriez","ouvraient","ouvrissiez"],"nous ouvrons → ouvr-＋-iez：vous ouvriez。",{ja:"夏、あなたたちは朝、窓を開けていた。"});

/* ---------- Leçon 8：savoir・voir・recevoir・boire（番号は V8-） ---------- */
FROM("V8",0);
W("v8","Je ne ___ pas nager.（savoir）","sais","savoir：je sais。",{ja:"私は泳げない。"});
W("v8","Tu ___ où est mon portable ?（savoir）","sais","savoir：tu sais。",{ja:"私のスマホがどこにあるか知ってる？"});
W("v8","Hugo ___ faire la cuisine.（savoir）","sait","savoir：il sait。",{ja:"ユゴーは料理ができる。"});
W("v8","Nous ne ___ pas où il habite.（savoir）","savons","savoir：nous savons。",{ja:"私たちは彼がどこに住んでいるか知らない。"});
W("v8","Vous ___ conduire ?（savoir）","savez","savoir：vous savez。",{ja:"運転できますか？"});
W("v8","Ils ___ que Léa est malade.（savoir）","savent","savoir：ils savent。",{ja:"彼らはレアが病気だと知っている。"});
W("v8","Je ___ souvent Hugo à la bibliothèque.（voir）","vois","voir：je vois。",{ja:"私は図書館でよくユゴーを見かける。"});
W("v8","Tu ___ ce bâtiment blanc ?（voir）","vois","voir：tu vois。",{ja:"あの白い建物が見える？"});
W("v8","On ___ bien la mer d'ici.（voir）","voit","voir：on voit。",{ja:"ここから海がよく見える。"});
W("v8","Nous ___ nos grands-parents le dimanche.（voir）","voyons","voir：nous voyons（i → y）。",{ja:"私たちは日曜日に祖父母に会う。"});
W("v8","Vous ___ cette rue ?（voir）","voyez","voir：vous voyez（i → y）。",{ja:"あの通りが見えますか？"});
W("v8","Elles ___ un film ce soir.（voir）","voient","voir：elles voient。",{ja:"彼女たちは今晩、映画を見る。"});
W("v8","Je ___ beaucoup de messages.（recevoir）","reçois","recevoir：je reçois（o の前で ç）。",{ja:"私はたくさんメッセージを受け取る。"});
W("v8","Tu ___ des lettres de Yui ?（recevoir）","reçois","recevoir：tu reçois。",{ja:"ゆいから手紙が来る？"});
W("v8","Léa ___ ses amis chez elle.（recevoir）","reçoit","recevoir：elle reçoit。",{ja:"レアは友だちを家に迎える。"});
W("v8","Nous ___ un colis chaque mois.（recevoir）","recevons","recevoir：nous recevons（e の前は c）。",{ja:"私たちは毎月小包を受け取る。"});
W("v8","Vous ___ beaucoup d'invités ?（recevoir）","recevez","recevoir：vous recevez。",{ja:"お客さんをたくさん迎えるのですか？"});
W("v8","Ils ___ le journal chaque matin.（recevoir）","reçoivent","recevoir：ils reçoivent。",{ja:"彼らは毎朝新聞を受け取る。"});
W("v8","Je ___ du café le matin.（boire）","bois","boire：je bois。",{ja:"私は朝、コーヒーを飲む。"});
W("v8","Tu ___ du thé ou du café ?（boire）","bois","boire：tu bois。",{ja:"紅茶を飲む？ コーヒーを飲む？"});
W("v8","Le chat ___ du lait.（boire）","boit","boire：il boit。",{ja:"猫は牛乳を飲む。"});
W("v8","Nous ___ de l'eau.（boire）","buvons","boire：nous buvons（語幹 buv-）。",{ja:"私たちは水を飲む。"});
W("v8","Vous ___ du thé vert ?（boire）","buvez","boire：vous buvez。",{ja:"緑茶を飲みますか？"});
W("v8","Les enfants ___ du jus d'orange.（boire）","boivent","boire：ils boivent（語幹 boiv-）。",{ja:"子どもたちはオレンジジュースを飲む。"});
C("v8","Nous ___ la tour Eiffel.（voir）","voyons",["voyons","voions","voirons"],"voir：nous voyons。",{ja:"エッフェル塔が見える。"});
C("v8","Ils ___ un cadeau.（recevoir）","reçoivent",["reçoivent","recevent","reçoient"],"recevoir：ils reçoivent。",{ja:"彼らはプレゼントを受け取る。"});
C("v8","Vous ___ trop de café.（boire）","buvez",["buvez","boivez","boiez"],"boire：vous buvez。",{ja:"コーヒーを飲みすぎですよ。"});
C("v8","Ils ne ___ pas la réponse.（savoir）","savent",["savent","saient","savont"],"savoir：ils savent。",{ja:"彼らは答えを知らない。"});
C("v8","J'ai ___ un mail de Hugo.（recevoir）","reçu",["reçu","recevé","reçoit"],"recevoir の過去分詞：reçu。",{ja:"ユゴーからメールを受け取った。"});
C("v8","Tu as ___ ce film ?（voir）","vu",["vu","voi","voyé"],"voir の過去分詞：vu。",{ja:"この映画、見た？"});
C("v8","Nous avons ___ du thé.（boire）","bu",["bu","buvu","boi"],"boire の過去分詞：bu。",{ja:"私たちはお茶を飲んだ。"});
C("v8","Je n'ai pas ___ répondre.（savoir）","su",["su","savu","sait"],"savoir の過去分詞：su。",{ja:"私は答えられなかった。"});
T("v8","主語を nous に","Je bois du thé.",["Nous buvons du thé."],"boire：nous buvons。",{extra:["boivons","boit"]});
T("v8","主語を ils に","Il reçoit une lettre.",["Ils reçoivent une lettre."],"recevoir：ils reçoivent。",{extra:["recevent","reçoit"]});
T("v8","主語を vous に","Tu vois la mer ?",["Vous voyez la mer ?"],"voir：vous voyez。",{extra:["voiez","vois"]});
B("v8","私たちは日曜日に祖父母に会う。","Nous voyons nos grands-parents le dimanche.",["voions","voient"],"voir：nous voyons。");
B("v8","彼らはレアが病気だと知っている。","Ils savent que Léa est malade.",["sait","savons"],"savoir：ils savent。");

/* ---------- 大過去（番号は PQ-） ---------- */
FROM("PQ",0);
W("pq","J'___ mes devoirs.（finir・大過去）","avais fini","avoir の半過去＋過去分詞：j'avais fini。",{ja:"私は宿題を終えていた。"});
W("pq","Tu ___ ce livre ?（lire・大過去）","avais lu","tu avais lu。",{ja:"きみはこの本を読んでいたの？"});
W("pq","Hugo ___ son parapluie.（oublier・大過去）","avait oublié","il avait oublié。",{ja:"ユゴーは傘を忘れていた。"});
W("pq","Nous ___ le dîner.（préparer・大過去）","avions préparé","nous avions préparé。",{ja:"私たちは夕食を用意してあった。"});
W("pq","Vous ___ la nouvelle ?（apprendre・大過去）","aviez appris","vous aviez appris。",{ja:"あなたはその知らせを聞いていたのですか？"});
W("pq","Ils ___ un taxi.（prendre・大過去）","avaient pris","ils avaient pris。",{ja:"彼らはタクシーに乗っていた。"});
W("pq","Léa ___ avant midi.（partir・大過去）","était partie","partir は être。Léa（女性）→ partie。",{ja:"レアは正午前に出発していた。"});
W("pq","Hugo ___ à Nara la veille.（arriver・大過去）","était arrivé","arriver は être。Hugo（男性）→ arrivé。",{ja:"ユゴーは前の日に奈良に着いていた。"});
W("pq","Nous ___ très tôt.（sortir・大過去）",["étions sortis","étions sorties"],"sortir は être。nous → sortis（全員女性なら sorties）。",{ja:"私たちはとても早く出かけていた。"});
W("pq","Elles ___ au Japon l'année précédente.（venir・大過去）","étaient venues","venir は être。elles → venues。",{ja:"彼女たちは前の年に日本に来ていた。"});
W("pq","Yui ___ tôt ce matin-là.（se lever・大過去）","s'était levée","代名動詞は être。Yui（女性）→ levée。",{ja:"ゆいはその朝、早く起きていた。"});
W("pq","Ils ___ à dix heures.（se coucher・大過去）","s'étaient couchés","ils s'étaient couchés。",{ja:"彼らは10時に寝ていた。"});
W("pq","Je ___ mon travail.（ne pas finir・大過去）","n'avais pas fini","ne ＋ avais ＋ pas ＋ 過去分詞。",{ja:"私は仕事を終えていなかった。"});
C("pq","Elle n'était pas encore ___.（arriver・大過去）","arrivée",["arrivée","arrivé","arriver"],"être のとき過去分詞は主語に一致：elle → arrivée。",{ja:"彼女はまだ着いていなかった。"});
C("pq","Nous ___ déjà mangé.（大過去の助動詞）","avions",["avions","étions","avons"],"manger は avoir：nous avions mangé。",{ja:"私たちはもう食べ終えていた。"});
C("pq","Elle ___ déjà sortie.（大過去の助動詞）","était",["était","avait","est"],"sortir は être：elle était sortie。",{ja:"彼女はもう出かけていた。"});
C("pq","Ils s'___ déjà rencontrés.（大過去の助動詞）","étaient",["étaient","avaient","sont"],"代名動詞は être：ils s'étaient rencontrés。",{ja:"彼らはもう知り合っていた。"});
C("pq","Elles étaient ___ à Kyoto.（aller）","allées",["allées","allé","allés"],"être：主語 elles（女性複数）→ allées。",{ja:"彼女たちは京都に行っていた。"});
C("pq","Yui avait ___ ses clés.（perdre）","perdu",["perdu","perdue","perdus"],"avoir のとき、過去分詞は主語に一致しない → perdu。",{ja:"ゆいは鍵をなくしていた。"});
T("pq","大過去に","J'ai vu ce film.",["J'avais vu ce film."],"ai → avais。",{extra:["étais","vue"]});
T("pq","大過去に","Elle est rentrée tard.",["Elle était rentrée tard."],"est → était。",{extra:["avait","rentré"]});
T("pq","大過去に","Nous nous sommes promenés.",["Nous nous étions promenés."],"sommes → étions。",{extra:["avions","promené"]});
B("pq","ユゴーは傘を忘れていた。","Hugo avait oublié son parapluie.",["était","oubliée"],"oublier は avoir：avait oublié。");
B("pq","レアはもう出発していた。","Léa était déjà partie.",["avait","parti"],"partir は être。déjà は過去分詞の直前。Léa（女性）→ partie。");

/* ---------- Leçon 10：peindre・disparaître・plaire・croire（番号は V10-） ---------- */
FROM("V10",0);
W("v10","Je ___ le mur de ma chambre en bleu.（peindre）","peins","peindre：je peins（d が落ちる）。",{ja:"私は部屋の壁を青く塗る。"});
W("v10","Tu ___ souvent des paysages ?（peindre）","peins","peindre：tu peins。",{ja:"よく風景を描くの？"});
W("v10","Ma grand-mère ___ des fleurs.（peindre）","peint","peindre：elle peint。",{ja:"祖母は花の絵を描く。"});
W("v10","Nous ___ la cuisine ce week-end.（peindre）","peignons","peindre：nous peignons（複数は -gn-）。",{ja:"私たちは今週末、キッチンを塗る。"});
W("v10","Vous ___ à l'huile ?（peindre）","peignez","peindre：vous peignez。",{ja:"油絵を描くのですか？"});
W("v10","Les enfants ___ des œufs pour Pâques.（peindre）","peignent","peindre：ils peignent。",{ja:"子どもたちは復活祭の卵に色を塗る。"});
W("v10","Je ne ___ pas les gros chiens.（craindre）","crains","craindre は peindre と同じ型：je crains。",{ja:"私は大きな犬はこわくない。"});
W("v10","Hugo ___ le froid.（craindre）","craint","craindre：il craint。",{ja:"ユゴーは寒さに弱い。"});
W("v10","Nous ___ un peu l'examen.（craindre）","craignons","craindre：nous craignons。",{ja:"私たちは試験が少し心配だ。"});
W("v10","Je te ___ au café à midi.（rejoindre）","rejoins","rejoindre も peindre と同じ型：je rejoins。",{ja:"お昼にカフェで合流するね。"});
W("v10","Ils nous ___ à la gare.（rejoindre）","rejoignent","rejoindre：ils rejoignent。",{ja:"彼らは駅で私たちと合流する。"});
C("v10","Ce train ___ 300 kilomètres à l'heure.（atteindre）","atteint",["atteint","atteind","atteignent"],"atteindre：il atteint。",{ja:"この列車は時速300キロに達する。"});
W("v10","Je ___ toujours quand il faut faire la vaisselle.（disparaître）","disparais","disparaître：je disparais。",{ja:"私は皿洗いの時間になるといつも姿を消す。"});
W("v10","Tu ___ souvent le week-end !（disparaître）","disparais","disparaître：tu disparais。",{ja:"きみは週末よくいなくなるね！"});
W("v10","Le soleil ___ derrière les nuages.（disparaître）",["disparaît","disparait"],"disparaître：il disparaît（t の前の i に ^）。",{ja:"太陽が雲の後ろに隠れる。"});
W("v10","Les oiseaux ___ en hiver.（disparaître）","disparaissent","disparaître：ils disparaissent（複数は -ss-）。",{ja:"冬になると鳥たちはいなくなる。"});
W("v10","Vous ___ toujours au bon moment !（disparaître）","disparaissez","disparaître：vous disparaissez。",{ja:"あなたはいつもちょうどいいときに消えますね！"});
W("v10","Elle ___ fatiguée aujourd'hui.（paraître）",["paraît","parait"],"paraître は disparaître と同じ型：elle paraît。",{ja:"彼女は今日、疲れているように見える。"});
W("v10","Ces fruits ___ très frais.（paraître）","paraissent","paraître：ils paraissent。",{ja:"この果物はとても新鮮に見える。"});
W("v10","Tu me ___ ?（reconnaître）","reconnais","reconnaître も同じ型：tu reconnais。",{ja:"私のことわかる？"});
W("v10","Nous ___ cette chanson.（reconnaître）","reconnaissons","reconnaître：nous reconnaissons。",{ja:"私たちはこの歌に聞き覚えがある。"});
C("v10","Une étoile ___ dans le ciel.（apparaître）","apparaît",["apparaît","apparaissent","apparais"],"apparaître も同じ型：elle apparaît。",{ja:"空に星がひとつ現れる。",a:["apparaît","apparait"]});
W("v10","Ce film me ___ beaucoup.（plaire）",["plaît","plait"],"plaire à ～「～の気に入る」。il plaît（t の前の i に ^）。",{ja:"この映画、とても気に入っている。"});
W("v10","Ces chaussures te ___ ?（plaire）","plaisent","主語は ces chaussures：ils plaisent。",{ja:"この靴、気に入った？"});
W("v10","Je ne ___ pas à son chat.（plaire）","plais","plaire：je plais。",{ja:"私は彼の猫に好かれていない。"});
W("v10","Tu ___ beaucoup à Léa.（plaire）","plais","plaire：tu plais。",{ja:"レアはきみのことをすごく気に入ってるよ。"});
W("v10","Vous ___ beaucoup à mes parents.（plaire）","plaisez","plaire：vous plaisez。",{ja:"私の両親はあなたのことをとても気に入っています。"});
W("v10","Je ___ que tu as raison.（croire）","crois","croire：je crois。",{ja:"きみが正しいと思う。"});
W("v10","Tu ___ cette histoire ?（croire）","crois","croire：tu crois。",{ja:"その話を信じる？"});
W("v10","Yui ___ aux fantômes.（croire）","croit","croire à ～「～の存在を信じる」。elle croit。",{ja:"ゆいはおばけを信じている。"});
W("v10","Nous ___ en toi.（croire）","croyons","croire：nous croyons（i → y）。",{ja:"私たちはきみを信じている。"});
W("v10","Vous ___ qu'il va neiger ?（croire）","croyez","croire：vous croyez（i → y）。",{ja:"雪が降ると思いますか？"});
W("v10","Ils ne me ___ pas.（croire）","croient","croire：ils croient（ここは y にならない）。",{ja:"彼らは私の言うことを信じない。"});
C("v10","Nous ___ la porte en vert.（peindre・複合過去）","avons peint",["avons peint","avons peindu","sommes peints"],"過去分詞は peint：nous avons peint。",{ja:"私たちはドアを緑に塗った。"});
C("v10","Mon chat ___ depuis hier.（disparaître・複合過去）","a disparu",["a disparu","est disparu","a disparaît"],"過去分詞は disparu。助動詞は avoir。",{ja:"うちの猫が昨日からいなくなった。"});
C("v10","Ce restaurant m'___ beaucoup.（plaire・複合過去）","a plu",["a plu","a plaît","est plu"],"過去分詞は plu。",{ja:"このレストランはとても気に入った。"});
C("v10","Personne ne m'___ .（croire・複合過去）","a cru",["a cru","a croit","est cru"],"過去分詞は cru。",{ja:"誰も私を信じなかった。"});
C("v10","Elle ___ sa sœur dans la foule.（reconnaître・複合過去）","a reconnu",["a reconnu","a reconnaît","est reconnue"],"過去分詞は reconnu。",{ja:"彼女は人ごみの中で姉を見つけた。"});

/* ---------- 単純未来（番号は FS-） ---------- */
FROM("FS",0);
W("fs","Je ___ à ma mère ce soir.（parler）","parlerai","je → 不定詞＋-ai：je parlerai。",{ja:"今晩、母と話すつもり。"});
W("fs","Tu ___ à Léa demain ?（parler）","parleras","tu → -as：tu parleras。",{ja:"明日レアと話す？"});
W("fs","Hugo ___ de son voyage.（parler）","parlera","il → -a：il parlera。",{ja:"ユゴーは旅行の話をするだろう。"});
W("fs","Nous ___ français en France.（parler）","parlerons","nous → -ons：nous parlerons。",{ja:"フランスではフランス語を話そう。"});
W("fs","Vous ___ au directeur ?（parler）","parlerez","vous → -ez：vous parlerez。",{ja:"部長と話しますか？"});
W("fs","Ils ___ de ce problème lundi.（parler）","parleront","ils → -ont：ils parleront。",{ja:"彼らは月曜日にその問題について話すだろう。"});
W("fs","Je ___ ce livre ce week-end.（finir）","finirai","-ir 動詞：不定詞＋-ai：je finirai。",{ja:"週末にこの本を読み終えるつもり。"});
W("fs","Nous ___ avant six heures.（finir）","finirons","nous finirons。",{ja:"私たちは6時前に終えるだろう。"});
W("fs","Les cours ___ en juillet.（finir）","finiront","ils finiront。",{ja:"授業は7月に終わる。"});
W("fs","Tu ___ le bus ou le métro ?（prendre）","prendras","-re の動詞は e をとる：prendr-as。",{ja:"バスに乗る？それとも地下鉄？"});
W("fs","Vous ___ un café ?（prendre）","prendrez","vous prendrez。",{ja:"コーヒーにしますか？"});
W("fs","Je te ___ la vérité.（dire）","dirai","dire → dir-ai。",{ja:"きみに本当のことを言うよ。"});
W("fs","J'___ le temps demain.（avoir）","aurai","avoir の語幹は aur-：j'aurai。",{ja:"明日は時間があるだろう。"});
W("fs","Ils ___ beaucoup de travail.（avoir）","auront","ils auront。",{ja:"彼らは仕事がたくさんあるだろう。"});
W("fs","Je ___ chez moi ce soir.（être）","serai","être の語幹は ser-：je serai。",{ja:"今晩は家にいるよ。"});
W("fs","Tu ___ libre samedi ?（être）","seras","tu seras。",{ja:"土曜日はひま？"});
W("fs","Nous ___ en retard.（être）","serons","nous serons。",{ja:"私たちは遅れるだろう。"});
W("fs","J'___ à Kyoto en avril.（aller）","irai","aller の語幹は ir-：j'irai。",{ja:"4月に京都に行くつもり。"});
W("fs","Elle ___ chez le dentiste demain.（aller）","ira","elle ira。",{ja:"彼女は明日歯医者に行く。"});
W("fs","Vous ___ à la fête ?（aller）","irez","vous irez。",{ja:"パーティーに行きますか？"});
W("fs","Je ___ la cuisine ce soir.（faire）","ferai","faire の語幹は fer-：je ferai。",{ja:"今晩は私が料理するよ。"});
W("fs","Ils ___ du ski en février.（faire）","feront","ils feront。",{ja:"彼らは2月にスキーをするだろう。"});
W("fs","Tu ___ avec nous ?（venir）","viendras","venir の語幹は viendr-：tu viendras。",{ja:"いっしょに来る？"});
W("fs","Nous ___ te voir dimanche.（venir）","viendrons","nous viendrons。",{ja:"日曜日にきみに会いに行くよ。"});
W("fs","Je ___ ma promesse.（tenir）","tiendrai","tenir の語幹は tiendr-：je tiendrai。",{ja:"約束は守るよ。"});
W("fs","Je ___ ce film la semaine prochaine.（voir）","verrai","voir の語幹は verr-：je verrai。",{ja:"来週その映画を見るつもり。"});
W("fs","On ___ bien !（voir）","verra","on verra「そのうちわかるさ」。",{ja:"まあ、様子を見よう！"});
W("fs","Je ___ t'aider demain.（pouvoir）","pourrai","pouvoir の語幹は pourr-（r が2つ）。",{ja:"明日なら手伝えるよ。"});
W("fs","Elles ___ sûrement venir.（vouloir）","voudront","vouloir の語幹は voudr-：elles voudront。",{ja:"彼女たちはきっと来たがるだろう。"});
W("fs","Tu ___ travailler plus.（devoir）","devras","devoir の語幹は devr-：tu devras。",{ja:"きみはもっと勉強しなければならないだろう。"});
W("fs","Vous ___ la réponse demain.（savoir）","saurez","savoir の語幹は saur-：vous saurez。",{ja:"明日答えがわかりますよ。"});
W("fs","Il ___ ta lettre lundi.（recevoir）","recevra","recevoir の語幹は recevr-：il recevra。",{ja:"彼は月曜日にきみの手紙を受け取るだろう。"});
W("fs","J'___ les photos ce soir.（envoyer）","enverrai","envoyer の語幹は enverr-：j'enverrai。",{ja:"今晩写真を送るね。"});
W("fs","Il ___ partir tôt.（falloir）","faudra","falloir：il faudra。",{ja:"早く出発しなければならないだろう。"});
W("fs","Il ___ demain matin.（pleuvoir）","pleuvra","pleuvoir：il pleuvra。",{ja:"明日の朝は雨が降るだろう。"});
W("fs","Nous ___ du pain en rentrant.（acheter）","achèterons","acheter：è が入る：nous achèterons。",{ja:"帰りにパンを買おう。"});
W("fs","Tu m'___ ce soir ?（appeler）","appelleras","appeler：l を重ねる：tu appelleras。",{ja:"今晩電話してくれる？"});
W("fs","Je me ___ tôt demain.（lever）","lèverai","se lever：è が入る：je me lèverai。",{ja:"明日は早く起きるつもり。"});

/* ---------- 前未来（番号は FA-） ---------- */
FROM("FA",0);
C("fa","J'___ mes devoirs avant le dîner.（finir・前未来）","aurai fini",["aurai fini","serai fini","avais fini"],"avoir の単純未来＋過去分詞：j'aurai fini。",{ja:"夕食までに宿題を終えているだろう。"});
C("fa","Tu ___ ce roman avant les vacances ?（lire・前未来）","auras lu",["auras lu","auras lisé","seras lu"],"lire の過去分詞は lu：tu auras lu。",{ja:"休みまでにこの小説を読み終えてる？"});
C("fa","Hugo ___ son train.（prendre・前未来）","aura pris",["aura pris","aura prendu","sera pris"],"prendre の過去分詞は pris。",{ja:"ユゴーは電車に乗っているだろう。"});
C("fa","Nous ___ la maison avant l'hiver.（vendre・前未来）","aurons vendu",["aurons vendu","aurons vendé","serons vendus"],"vendre の過去分詞は vendu。",{ja:"冬までに家を売っているだろう。"});
C("fa","Vous ___ ce film avant samedi ?（voir・前未来）","aurez vu",["aurez vu","aurez voyé","serez vu"],"voir の過去分詞は vu。",{ja:"土曜日までにその映画を見ていますか？"});
C("fa","Ils ___ leur travail à midi.（faire・前未来）","auront fait",["auront fait","seront faits","auront faire"],"faire の過去分詞は fait。",{ja:"彼らはお昼には仕事を終えているだろう。"});
C("fa","Je ___ à la gare avant huit heures.（arriver・前未来）","serai arrivé",["serai arrivé","aurai arrivé","suis arrivé"],"arriver は être：je serai arrivé(e)。",{ja:"8時前には駅に着いているだろう。",a:["serai arrivé","serai arrivée"]});
C("fa","Elle ___ quand tu rentreras.（partir・前未来）","sera partie",["sera partie","sera parti","aura parti"],"partir は être。主語 elle → partie。",{ja:"きみが帰ってくるころには、彼女は出発しているだろう。"});
C("fa","Nous ___ avant minuit.（rentrer・前未来）","serons rentrés",["serons rentrés","aurons rentré","serons rentré"],"rentrer は être。主語 nous（男性複数）→ rentrés。",{ja:"私たちは夜12時までに帰っているだろう。"});
C("fa","Les invités ___ à sept heures.（venir・前未来）","seront venus",["seront venus","auront venu","seront venu"],"venir は être。過去分詞 venu を主語に一致 → venus。",{ja:"お客さんたちは7時には来ているだろう。"});
C("fa","Je me ___ avant ton arrivée.（habiller・前未来）","serai habillé",["serai habillé","aurai habillé","suis habillé"],"代名動詞は être：je me serai habillé(e)。",{ja:"きみが来る前に着替えておくよ。",a:["serai habillé","serai habillée"]});
C("fa","Ils se ___ à Paris.（rencontrer・前未来）","seront rencontrés",["seront rencontrés","auront rencontré","seront rencontré"],"代名動詞は être。主語 ils → rencontrés。",{ja:"彼らはパリで出会っているだろう。"});
T("fa","前未来に","Je mangerai.",["J'aurai mangé."],"助動詞 avoir の単純未来（aurai）＋過去分詞。",{extra:["serai","mangerai"]});
T("fa","前未来に","Elles sortiront.",["Elles seront sorties."],"sortir は être。elles → sorties。",{extra:["auront","sorti"]});
T("fa","前未来に","Tu écriras la lettre.",["Tu auras écrit la lettre."],"écrire の過去分詞は écrit。",{extra:["seras","écriras"]});
B("fa","明日には、彼は答えを受け取っているだろう。","Il aura reçu la réponse demain.",["sera","recevra"],"recevoir の過去分詞は reçu。");
