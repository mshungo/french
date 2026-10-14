/* ============================================================
   単語フラッシュカードの単語（vocab.html が読み込む。しくみは vocab.js）
   V(単元, 品詞, 見出し語, 意味, 例文, 例文の訳, テーマ, {追加})
     品詞：nm 男性名詞 / nf 女性名詞 / nmf 男女同形の名詞 / nmp・nfp 複数で使う名詞
           v 動詞 / a 形容詞 / adv 副詞など / q 疑問詞 / ex 表現 / num 数
     見出し語：名詞は定冠詞つき（le livre / l'hôtel / les parents）
     例文の [ ] がその単語（画面で色がつく）
     テーマ：同じテーマの新しい語を、1回の練習でつづけて出さないための印
     追加：f＝女性形（形容詞・人を表す名詞） pl＝不規則な複数形 alt＝ほかに正解にする答え
           mf＝男性形の前に母音がくるときの形（bel, nouvel, vieil）
   単語IDは「単元-その単元での通し番号」。記録はIDで残るので、
   あとから単語を足すときは、必ずその単元のいちばん最後に足す（途中に入れたり消したりしない）。
   ============================================================ */
window.VOCAB_UNITS=[
  {k:"L1",t:"Leçon 1",sub:"身のまわりのもの・食べもの・場所",c:"#cf8aa0",ci:"#b16880",cw:"#faeef2"},
  {k:"L2",t:"Leçon 2",sub:"-er 動詞・家族・持ちもの",c:"#d6a96f",ci:"#b88a4f",cw:"#faf2e7"},
  {k:"L3",t:"Leçon 3",sub:"形容詞・色・服・否定のことば",c:"#8db79b",ci:"#6c9a7f",cw:"#eef5f0"},
  {k:"L4",t:"Leçon 4",sub:"行く・来る・疑問詞・時間",c:"#92a6cf",ci:"#7186b4",cw:"#eef1f8"},
  {k:"L5",t:"Leçon 5",sub:"あげる・貸す・天気・季節",c:"#b48aa8",ci:"#8f667f",cw:"#f6eef3"},
  {k:"L6",t:"Leçon 6",sub:"一日の動作・からだ・道案内",c:"#c0a06a",ci:"#9a7b45",cw:"#f8f1e4"},
  {k:"N",t:"数",sub:"0〜1000",c:"#9aa3ad",ci:"#6f7881",cw:"#f1f3f5"}
];

/* ---------- Leçon 1 ---------- */
V("L1","nm","le livre","本","Il y a un [livre] sur la table.","テーブルの上に本が1冊ある。","thing");
V("L1","nm","le café","コーヒー；カフェ","Un [café], s'il vous plaît.","コーヒーを1杯お願いします。","drink");
V("L1","nf","la gare","駅","Il y a un café devant la [gare].","駅の前にカフェがある。","place");
V("L1","nm","le cerf","シカ（雄ジカ）","Il y a beaucoup de [cerfs] à Nara.","奈良にはシカがたくさんいる。","animal");
V("L1","nf","la clé","鍵","Voilà la [clé] de la chambre.","はい、部屋の鍵です。","thing",{alt:["la clef"]});
V("L1","nm","le pain","パン","Léa mange du [pain] le matin.","レアは朝、パンを食べる。","food");
V("L1","nmf","l'étudiant","学生","Yui est [étudiante] à Nara.","ゆいは奈良の大学生だ。","person",{f:"étudiante"});
V("L1","nm","le parc","公園","Il y a des cerfs dans le [parc].","公園にはシカがいる。","place");
V("L1","nm","le sac","かばん","C'est le [sac] de Léa.","これはレアのかばんだ。","thing");
V("L1","nf","l'eau","水","Il y a de l'[eau] dans la bouteille.","びんに水が入っている。","drink");
V("L1","nm","le frère","兄弟（兄・弟）","Hugo est le [frère] de Léa.","ユゴーはレアの兄だ。","family");
V("L1","nf","la voiture","車","Il y a une [voiture] devant la maison.","家の前に車が1台とまっている。","vehicle");
V("L1","nm","le fromage","チーズ","La France, c'est le pays du [fromage].","フランスはチーズの国だ。","food");
V("L1","nm","l'hôtel","ホテル","L'[hôtel] est près du parc.","ホテルは公園の近くにある。","place");
V("L1","nf","la table","テーブル","Le chat est sous la [table].","猫はテーブルの下にいる。","thing");
V("L1","nm","le thé","お茶；紅茶","Yui boit du [thé] vert.","ゆいは緑茶を飲む。","drink");
V("L1","nf","la sœur","姉妹（姉・妹）","Léa est la petite [sœur] de Hugo.","レアはユゴーの妹だ。","family");
V("L1","nm","le musée","美術館；博物館","C'est le [musée] d'Orsay.","これがオルセー美術館だ。","place");
V("L1","nm","le chat","猫","Il y a un [chat] dans le jardin.","庭に猫が1匹いる。","animal");
V("L1","nm","le gâteau","ケーキ；お菓子","Voici un [gâteau] au chocolat.","はい、チョコレートケーキです。","food",{pl:"gâteaux"});
V("L1","nm","le vélo","自転車","C'est le [vélo] de Hugo.","これはユゴーの自転車だ。","vehicle");
V("L1","nf","la chambre","部屋；寝室","La [chambre] de Léa est petite.","レアの部屋は小さい。","place");
V("L1","nmf","l'ami","友だち","Yui est une [amie] de Léa.","ゆいはレアの友だちだ。","person",{f:"amie"});
V("L1","nm","le lait","牛乳","Hugo boit du [lait] le matin.","ユゴーは朝、牛乳を飲む。","drink");
V("L1","nf","la fleur","花","Léa aime les [fleurs].","レアは花が好きだ。","nature");
V("L1","nm","le stylo","ペン","Il y a deux [stylos] dans le sac.","かばんにペンが2本ある。","thing");
V("L1","nf","l'école","学校","L'[école] est près de la gare.","学校は駅の近くにある。","place");
V("L1","nm","le riz","米；ごはん","Au Japon, on mange du [riz].","日本ではごはんを食べる。","food");
V("L1","nmf","l'enfant","子ども","Il y a des [enfants] dans le parc.","公園に子どもたちがいる。","person");
V("L1","nf","la photo","写真","Voici une [photo] de Nara.","これは奈良の写真です。","thing");
V("L1","nm","le jardin","庭","Il y a des fleurs dans le [jardin].","庭に花が咲いている。","place");
V("L1","nf","la pomme","りんご","Il y a des [pommes] sur la table.","テーブルの上にりんごがある。","food");
V("L1","nm","le bus","バス","Voilà le [bus] pour Nara !","ほら、奈良行きのバスだ！","vehicle");
V("L1","nf","l'université","大学","Léa étudie à l'[université] de Nara.","レアは奈良の大学で勉強している。","place");
V("L1","nm","le dictionnaire","辞書","C'est le [dictionnaire] de Yui.","これはゆいの辞書だ。","thing");
V("L1","nm","le professeur","先生；教師","Madame Martin est [professeur] de français.","マルタン先生はフランス語の先生だ。","person",{alt:["la professeure","une professeure"]});
V("L1","nm","l'arbre","木","Il y a un grand [arbre] dans le parc.","公園に大きな木がある。","nature");
V("L1","nf","la maison","家","C'est la [maison] de Madame Martin.","これはマルタン先生の家だ。","place");
V("L1","nm","le poisson","魚","Yui aime le [poisson].","ゆいは魚が好きだ。","food");
V("L1","nf","la chaise","いす","Il y a trois [chaises] dans la salle.","部屋にいすが3つある。","thing");
V("L1","nm","le temple","寺","C'est un [temple] très célèbre.","これはとても有名なお寺だ。","place");
V("L1","nf","la fenêtre","窓","Le chat est devant la [fenêtre].","猫は窓の前にいる。","thing");
V("L1","nm","le chocolat","チョコレート","Léa adore le [chocolat].","レアはチョコレートが大好きだ。","food");
V("L1","nm","l'argent","お金","Il y a de l'[argent] dans le sac.","かばんにお金が入っている。","thing");
V("L1","nf","la porte","ドア；扉","Voilà la [porte] de la classe.","あれが教室のドアだ。","thing");

/* ---------- Leçon 2 ---------- */
V("L2","v","habiter","住む","Léa [habite] à Nara.","レアは奈良に住んでいる。","verb");
V("L2","nm","le père","父","Mon [père] travaille à Lyon.","私の父はリヨンで働いている。","family");
V("L2","v","parler","話す","Madame Martin [parle] japonais.","マルタン先生は日本語を話す。","verb");
V("L2","nm","l'ordinateur","パソコン；コンピューター","C'est l'[ordinateur] de Hugo.","これはユゴーのパソコンだ。","thing");
V("L2","adv","ensemble","いっしょに","Léa et Yui étudient [ensemble].","レアとゆいはいっしょに勉強する。","adv");
V("L2","nf","la mère","母","Ma [mère] aime les fleurs.","私の母は花が好きだ。","family");
V("L2","v","travailler","働く；勉強する","Hugo [travaille] à Lyon.","ユゴーはリヨンで働いている。","verb");
V("L2","nm","le passeport","パスポート","Voici mon [passeport].","これが私のパスポートです。","thing");
V("L2","v","aimer","好きだ；愛する","Yui [aime] les cerfs.","ゆいはシカが好きだ。","verb");
V("L2","nmp","les parents","両親","Mes [parents] habitent à Lyon.","私の両親はリヨンに住んでいる。","family");
V("L2","nf","la semaine","週","Cette [semaine], Léa travaille beaucoup.","今週、レアはたくさん勉強する。","time");
V("L2","v","manger","食べる","Nous [mangeons] ensemble à midi.","私たちはお昼にいっしょに食べる。","verb");
V("L2","nm","le médecin","医者","Le père de Yui est [médecin].","ゆいの父は医者だ。","person");
V("L2","adv","beaucoup","たくさん；とても","Hugo mange [beaucoup].","ユゴーはたくさん食べる。","adv");
V("L2","v","chanter","歌う","Yui [chante] bien.","ゆいは歌がうまい。","verb");
V("L2","nm","l'oncle","おじ","Mon [oncle] habite à Paris.","私のおじはパリに住んでいる。","family");
V("L2","nf","la valise","スーツケース","Léa cherche sa [valise].","レアはスーツケースを探している。","thing");
V("L2","v","étudier","勉強する","Nous [étudions] le français.","私たちはフランス語を勉強している。","verb");
V("L2","nf","l'année","年；1年間","Cette [année], Yui étudie le français.","今年、ゆいはフランス語を勉強している。","time");
V("L2","nf","la tante","おば","Ma [tante] est médecin.","私のおばは医者だ。","family");
V("L2","v","écouter","聞く","Hugo [écoute] la radio.","ユゴーはラジオを聞く。","verb");
V("L2","nfp","les chaussures","靴","Ces [chaussures] sont belles.","この靴はすてきだ。","clothes",{alt:["la chaussure","une chaussure"]});
V("L2","nm","l'homme","男性；人間","Cet [homme] est professeur.","この男性は先生だ。","person");
V("L2","adv","bien","上手に；よく","Yui parle [bien] français.","ゆいはフランス語を上手に話す。","adv");
V("L2","v","regarder","見る","Léa et Yui [regardent] un film.","レアとゆいは映画を見る。","verb");
V("L2","nf","la famille","家族","La [famille] de Léa habite à Lyon.","レアの家族はリヨンに住んでいる。","family");
V("L2","nm","le sport","スポーツ","Hugo aime le [sport].","ユゴーはスポーツが好きだ。","leisure");
V("L2","v","arriver","着く；到着する","Le train [arrive] à Nara.","電車が奈良に着く。","verb");
V("L2","nf","la femme","女性；妻","Cette [femme] est la mère de Yui.","この女性はゆいの母だ。","person");
V("L2","nf","l'adresse","住所","Voici mon [adresse] à Nara.","これが私の奈良の住所です。","thing");
V("L2","v","chercher","探す","Yui [cherche] sa clé.","ゆいは鍵を探している。","verb");
V("L2","nf","la musique","音楽","Yui écoute de la [musique].","ゆいは音楽を聞いている。","leisure");
V("L2","nm","le garçon","男の子","Ce [garçon] est le frère de Yui.","この男の子はゆいの弟だ。","person");
V("L2","v","acheter","買う","Léa [achète] des fleurs.","レアは花を買う。","verb");
V("L2","nfp","les vacances","休暇；バカンス","Hugo passe ses [vacances] à Nara.","ユゴーは休暇を奈良で過ごす。","time");
V("L2","nf","la fille","女の子；娘","Cette [fille] est japonaise.","この女の子は日本人だ。","person");
V("L2","nm","le cinéma","映画館；映画","Léa aime le [cinéma] français.","レアはフランス映画が好きだ。","leisure");
V("L2","v","dîner","夕食をとる","Ce soir, nous [dînons] ensemble.","今晩、私たちはいっしょに夕食をとる。","verb");
V("L2","nm","le matin","朝；午前","Le [matin], Léa étudie le japonais.","レアは朝、日本語を勉強する。","time");
V("L2","nmf","le voisin","隣人；近所の人","Nos [voisins] sont gentils.","うちの近所の人たちは親切だ。","person",{f:"voisine"});
V("L2","v","adorer","大好きだ","Léa [adore] le natto !","レアは納豆が大好き！","verb");
V("L2","nm","le soir","晩；夕方","Ce [soir], Léa dîne avec Yui.","今晩、レアはゆいと夕食をとる。","time");

/* ---------- Leçon 3 ---------- */
V("L3","a","grand","大きい；背が高い","Hugo est [grand].","ユゴーは背が高い。","size",{f:"grande"});
V("L3","nf","la robe","ワンピース；ドレス","Cette [robe] est jolie.","このワンピースはすてきだ。","clothes");
V("L3","adv","jamais","（ne とともに）決して～ない","Léa ne mange [jamais] de riz le matin.","レアは朝、決してごはんを食べない。","neg");
V("L3","a","rouge","赤い","Yui a un sac [rouge].","ゆいは赤いかばんを持っている。","color");
V("L3","nm","l'appartement","アパルトマン；マンションの部屋","L'[appartement] de Hugo est grand.","ユゴーのアパルトマンは広い。","place");
V("L3","a","petit","小さい；背が低い","La chambre de Léa est [petite].","レアの部屋は小さい。","size",{f:"petite"});
V("L3","a","bon","おいしい；よい","Ce gâteau est très [bon] !","このケーキはとてもおいしい！","quality",{f:"bonne"});
V("L3","nm","le chien","犬","Ce n'est pas un cerf, c'est un [chien] !","あれはシカじゃない、犬だよ！","animal");
V("L3","adv","aujourd'hui","今日","[Aujourd'hui], Yui n'a pas de cours.","今日、ゆいは授業がない。","time");
V("L3","a","japonais","日本の；日本人の","Yui est [japonaise].","ゆいは日本人だ。","nation",{f:"japonaise"});
V("L3","nf","la jupe","スカート","Yui porte une [jupe] noire.","ゆいは黒いスカートをはいている。","clothes");
V("L3","a","beau","美しい；すてきな","Nara est une [belle] ville.","奈良は美しい町だ。","quality",{f:"belle",mf:"bel"});
V("L3","a","noir","黒い","Hugo a un chat [noir].","ユゴーは黒猫を飼っている。","color",{f:"noire"});
V("L3","adv","rien","（ne とともに）何も～ない","Hugo ne mange [rien] le matin.","ユゴーは朝、何も食べない。","neg");
V("L3","nm","le restaurant","レストラン","Il y a un bon [restaurant] près de la gare.","駅の近くにおいしいレストランがある。","place");
V("L3","a","heureux","幸せな","Léa est [heureuse] à Nara.","レアは奈良で幸せに暮らしている。","feeling",{f:"heureuse"});
V("L3","nf","la chemise","シャツ","Hugo porte une [chemise] blanche.","ユゴーは白いシャツを着ている。","clothes");
V("L3","a","nouveau","新しい","Léa a un [nouveau] vélo.","レアは新しい自転車を持っている。","quality",{f:"nouvelle",mf:"nouvel"});
V("L3","a","blanc","白い","Il y a des fleurs [blanches] dans le jardin.","庭に白い花が咲いている。","color",{f:"blanche"});
V("L3","nf","la cuisine","料理；台所","Léa aime la [cuisine] japonaise.","レアは日本料理が好きだ。","food");
V("L3","a","difficile","難しい","Cet exercice est [difficile].","この練習問題は難しい。","quality");
V("L3","adv","demain","明日","[Demain], Léa a un cours de japonais.","明日、レアは日本語の授業がある。","time");
V("L3","a","vieux","古い；年をとった","Hugo habite dans un [vieil] appartement.","ユゴーは古いアパルトマンに住んでいる。","quality",{f:"vieille",mf:"vieil"});
V("L3","nm","le cours","授業","Le [cours] de français est intéressant.","フランス語の授業はおもしろい。","school");
V("L3","a","gentil","親切な；やさしい","Madame Martin est très [gentille].","マルタン先生はとても親切だ。","feeling",{f:"gentille"});
V("L3","a","vert","緑の","Léa porte une jupe [verte].","レアは緑のスカートをはいている。","color",{f:"verte"});
V("L3","adv","personne","（ne とともに）誰も～ない","Il n'y a [personne] dans la salle.","部屋には誰もいない。","neg");
V("L3","nf","l'histoire","話；物語；歴史","C'est une longue [histoire].","それは長い話なんだ。","school");
V("L3","a","intéressant","おもしろい；興味深い","Ce livre est [intéressant].","この本はおもしろい。","quality",{f:"intéressante"});
V("L3","a","joli","きれいな；かわいい","Yui porte une [jolie] jupe.","ゆいはきれいなスカートをはいている。","quality",{f:"jolie"});
V("L3","nf","la langue","言語；舌","Le japonais est une [langue] difficile.","日本語は難しい言語だ。","school");
V("L3","a","bleu","青い","Léa porte une robe [bleue].","レアは青いワンピースを着ている。","color",{f:"bleue"});
V("L3","nm","le portable","携帯電話；スマホ","Hugo cherche son [portable].","ユゴーはスマホを探している。","thing");
V("L3","a","fatigué","疲れた","Hugo est [fatigué] ce soir.","ユゴーは今晩、疲れている。","feeling",{f:"fatiguée"});
V("L3","a","long","長い","Les cheveux de Léa sont [longs].","レアの髪は長い。","size",{f:"longue"});
V("L3","adv","ici","ここに；ここで","Madame Martin habite [ici].","マルタン先生はここに住んでいる。","place");
V("L3","a","cher","（値段が）高い；親愛な","Ces chaussures sont [chères].","この靴は高い。","quality",{f:"chère"});
V("L3","a","français","フランスの；フランス人の","Léa est [française].","レアはフランス人だ。","nation",{f:"française"});
V("L3","a","content","うれしい；満足した","Léa est [contente] de sa chambre.","レアは自分の部屋に満足している。","feeling",{f:"contente"});
V("L3","a","jaune","黄色い","Le bus est [jaune].","そのバスは黄色い。","color");
V("L3","a","délicieux","とてもおいしい","Les tartes de ce café sont [délicieuses].","このカフェのタルトはとてもおいしい。","quality",{f:"délicieuse"});
V("L3","ex","avoir faim","おなかがすいている","Hugo [a faim] !","ユゴーはおなかがすいている！","feeling",{alt:["j'ai faim"]});
V("L3","a","sérieux","まじめな","Yui est une étudiante [sérieuse].","ゆいはまじめな学生だ。","feeling",{f:"sérieuse"});

/* ---------- Leçon 4 ---------- */
V("L4","v","aller","行く","Ce soir, Yui [va] au cinéma.","今晩、ゆいは映画館に行く。","move");
V("L4","q","quand","いつ","[Quand] est-ce que Hugo vient à Nara ?","ユゴーはいつ奈良に来るの？","q");
V("L4","nf","l'heure","時間；～時","Quelle [heure] est-il ?","何時ですか？","time");
V("L4","v","venir","来る","Hugo [vient] à Nara demain.","ユゴーは明日、奈良に来る。","move");
V("L4","nm","le train","電車；列車","Le [train] pour Kyoto part à midi.","京都行きの電車は正午に出る。","vehicle");
V("L4","a","malade","病気の；具合が悪い","Yui est [malade] aujourd'hui.","ゆいは今日、具合が悪い。","feeling");
V("L4","q","où","どこに；どこで","[Où] habites-tu ?","どこに住んでいるの？","q");
V("L4","v","choisir","選ぶ","Léa [choisit] un cadeau pour Hugo.","レアはユゴーへのプレゼントを選ぶ。","verb");
V("L4","nm","midi","正午；お昼","Léa et Yui déjeunent à [midi].","レアとゆいは12時にお昼ごはんを食べる。","time",{noArt:true});
V("L4","nm","le cadeau","プレゼント；贈りもの","C'est un [cadeau] pour toi !","これ、きみへのプレゼントだよ！","thing",{pl:"cadeaux"});
V("L4","v","partir","出発する","Le train [part] à neuf heures.","電車は9時に出発する。","move");
V("L4","q","pourquoi","なぜ","[Pourquoi] est-ce que tu es triste ?","どうして悲しいの？","q");
V("L4","nmp","les devoirs","宿題","Yui finit ses [devoirs].","ゆいは宿題を終える。","school");
V("L4","v","sortir","出かける；外に出る","Ce soir, Yui ne va pas [sortir].","今晩、ゆいは出かけないつもりだ。","move");
V("L4","a","triste","悲しい","Pourquoi es-tu [triste] ?","どうして悲しいの？","feeling");
V("L4","nm","le week-end","週末","Ce [week-end], Léa va à Kyoto.","今週末、レアは京都に行く。","time");
V("L4","q","combien","いくら；どれだけ","[Combien] coûte ce sac ?","このかばんはいくらですか？","q");
V("L4","v","finir","終える；終わる","Le cours [finit] à midi.","授業は正午に終わる。","verb");
V("L4","nf","la couleur","色","Quelle est ta [couleur] préférée ?","きみの好きな色は何？","thing");
V("L4","v","rentrer","帰る；帰宅する","Hugo [rentre] à Lyon dimanche.","ユゴーは日曜日にリヨンへ帰る。","move");
V("L4","nm","le nom","名前","Quel est votre [nom] ?","あなたのお名前は？","person");
V("L4","q","comment","どのように；どう","[Comment] allez-vous ?","お元気ですか？","q");
V("L4","v","visiter","（場所を）訪れる；見物する","Nous allons [visiter] un temple.","私たちはお寺を見物するつもりだ。","verb");
V("L4","nfp","les courses","買いもの","Léa fait les [courses] le samedi.","レアは毎週土曜日に買いものをする。","leisure");
V("L4","a","occupé","忙しい；ふさがっている","Madame Martin est très [occupée].","マルタン先生はとても忙しい。","feeling",{f:"occupée"});
V("L4","nm","l'âge","年齢","Quel [âge] as-tu ?","きみは何歳？","person");
V("L4","v","faire","する；作る","Qu'est-ce que tu [fais] ce soir ?","今晩は何をするの？","verb");
V("L4","nf","la fête","パーティー；祭り","Yui choisit une robe pour la [fête].","ゆいはパーティーに着ていくワンピースを選ぶ。","leisure");
V("L4","q","qui","誰","[Qui] est-ce ?","あれは誰？","q");
V("L4","v","commencer","始める；始まる","Le cours [commence] à neuf heures.","授業は9時に始まる。","verb");
V("L4","nm","le roman","小説","Léa lit un [roman] français.","レアはフランスの小説を読んでいる。","school");
V("L4","v","voir","見る；会う","Léa va [voir] Hugo à Lyon.","レアはリヨンへユゴーに会いに行く。","verb");
V("L4","nf","la télé","テレビ","Hugo regarde la [télé] le soir.","ユゴーは夜、テレビを見る。","leisure");
V("L4","nm","minuit","午前0時；真夜中","Hugo rentre à [minuit].","ユゴーは夜中の12時に帰ってくる。","time",{noArt:true});
V("L4","v","déjeuner","昼食をとる","On [déjeune] ensemble ?","いっしょにお昼を食べない？","verb");
V("L4","nm","le dessert","デザート","Qu'est-ce que tu prends comme [dessert] ?","デザートは何にする？","food");
V("L4","nm","le travail","仕事；勉強","Hugo finit son [travail] à six heures.","ユゴーは6時に仕事を終える。","school",{pl:"travaux"});
V("L4","a","absent","欠席の；不在の","Yui est [absente] aujourd'hui.","ゆいは今日、欠席だ。","feeling",{f:"absente"});

/* ---------- Leçon 5 ---------- */
V("L5","v","donner","あげる；与える","Léa [donne] un cadeau à Yui.","レアはゆいにプレゼントをあげる。","give");
V("L5","ex","il pleut","雨が降っている","[Il pleut] aujourd'hui.","今日は雨が降っている。","weather");
V("L5","nm","le parapluie","傘","Prends ton [parapluie] !","傘を持っていきなさい！","thing");
V("L5","adv","toujours","いつも；まだ","Léa est [toujours] gentille.","レアはいつもやさしい。","adv");
V("L5","v","téléphoner","電話する","Yui [téléphone] à sa mère.","ゆいはお母さんに電話する。","give");
V("L5","nm","l'hiver","冬","En [hiver], il fait froid à Nara.","冬、奈良は寒い。","season");
V("L5","ex","il fait beau","天気がいい","[Il fait beau] aujourd'hui !","今日はいい天気だ！","weather");
V("L5","v","prêter","貸す","Tu me [prêtes] ton stylo ?","ペンを貸してくれる？","give");
V("L5","nm","le temps","天気；時間","Quel [temps] fait-il à Lyon ?","リヨンはどんな天気？","weather");
V("L5","adv","souvent","よく；しばしば","Hugo téléphone [souvent] à Léa.","ユゴーはよくレアに電話する。","adv");
V("L5","v","envoyer","送る","Léa [envoie] une photo à Hugo.","レアはユゴーに写真を送る。","give");
V("L5","nm","l'été","夏","En [été], il fait chaud à Kyoto.","夏、京都は暑い。","season");
V("L5","ex","il fait froid","寒い","[Il fait froid] ce matin.","けさは寒い。","weather");
V("L5","v","montrer","見せる","Yui [montre] ses photos à Léa.","ゆいはレアに写真を見せる。","give");
V("L5","nmf","le chanteur","歌手","C'est une [chanteuse] française.","彼女はフランスの歌手だ。","person",{f:"chanteuse"});
V("L5","v","attendre","待つ","Léa [attend] le bus.","レアはバスを待っている。","verb");
V("L5","ex","il neige","雪が降っている","[Il neige] à Lyon.","リヨンでは雪が降っている。","weather");
V("L5","a","facile","簡単な","Il est [facile] de parler avec Léa.","レアとは話しやすい。","quality");
V("L5","v","inviter","招待する；誘う","Léa [invite] Yui au café.","レアはゆいをカフェに誘う。","give");
V("L5","nm","le printemps","春","Au [printemps], il y a des fleurs partout.","春には、あちこちに花が咲く。","season");
V("L5","ex","il fait chaud","暑い","[Il fait chaud] à Nara en été.","夏の奈良は暑い。","weather");
V("L5","v","offrir","贈る；プレゼントする","Hugo [offre] des fleurs à sa mère.","ユゴーはお母さんに花を贈る。","give");
V("L5","ex","il faut","～しなければならない；～が必要だ","[Il faut] partir tout de suite.","すぐに出発しなければならない。","imp");
V("L5","nm","le match","試合","Hugo regarde un [match] de foot.","ユゴーはサッカーの試合を見ている。","leisure");
V("L5","v","trouver","見つける；～だと思う","Tu [trouves] ce livre intéressant ?","この本、おもしろいと思う？","verb");
V("L5","nm","l'automne","秋","En [automne], Kyoto est très beau.","秋の京都はとても美しい。","season");
V("L5","v","penser","考える；思う","Léa [pense] souvent à sa famille.","レアはよく家族のことを考える。","verb");
V("L5","nf","la région","地方；地域","Le Kansai est une belle [région].","関西は美しい地方だ。","place");
V("L5","v","rester","とどまる；いる","Il pleut, il vaut mieux [rester] ici.","雨だから、ここにいたほうがいい。","verb");
V("L5","nf","la lettre","手紙；文字","Léa écrit une [lettre] à sa mère.","レアはお母さんに手紙を書く。","thing");
V("L5","adv","tout de suite","すぐに","Je viens [tout de suite] !","すぐ行くよ！","adv");
V("L5","v","ressembler","（à ～に）似ている","Léa [ressemble] à sa mère.","レアはお母さんに似ている。","verb");
V("L5","ex","avoir peur","怖い；恐れている","Yui [a peur] des cerfs !","ゆいはシカが怖い！","feeling",{alt:["j'ai peur"]});
V("L5","v","présenter","紹介する","Léa [présente] Yui à Hugo.","レアはゆいをユゴーに紹介する。","give");
V("L5","nm","le téléphone","電話","Hugo est au [téléphone].","ユゴーは電話中だ。","thing");

/* ---------- Leçon 6 ---------- */
V("L6","v","se lever","起きる；立ち上がる","Léa [se lève] à sept heures.","レアは7時に起きる。","day");
V("L6","adv","tôt","早く","Yui se couche [tôt].","ゆいは早く寝る。","adv");
V("L6","nf","la main","手","Lave-toi les [mains] !","手を洗いなさい！","body");
V("L6","v","se coucher","寝る；横になる","Hugo [se couche] tard.","ユゴーは遅く寝る。","day");
V("L6","adv","à droite","右に","Tournez [à droite] devant la gare.","駅の前で右に曲がってください。","way");
V("L6","nm","le manteau","コート","Il fait froid, mets ton [manteau] !","寒いから、コートを着なさい！","clothes",{pl:"manteaux"});
V("L6","v","s'appeler","～という名前である","Je [m'appelle] Yui.","私の名前はゆいです。","day");
V("L6","adv","tard","遅く","Le dimanche, Léa se lève [tard].","日曜日、レアは遅く起きる。","adv");
V("L6","v","se dépêcher","急ぐ","[Dépêche-toi], le bus arrive !","急いで、バスが来るよ！","day");
V("L6","nm","le visage","顔","Hugo se lave le [visage].","ユゴーは顔を洗う。","body");
V("L6","v","se reposer","休む","[Reposez-vous] un peu.","少し休んでください。","day");
V("L6","adv","vite","速く；急いで","Léa parle très [vite].","レアはとても早口だ。","adv");
V("L6","v","tourner","曲がる；回す","[Tournez] à gauche, s'il vous plaît.","左に曲がってください。","way");
V("L6","nfp","les dents","歯","Yui se brosse les [dents].","ゆいは歯をみがく。","body",{alt:["la dent","une dent"]});
V("L6","v","se promener","散歩する","Léa et Yui [se promènent] dans le parc.","レアとゆいは公園を散歩する。","day");
V("L6","adv","maintenant","今","Partons [maintenant] !","さあ、今すぐ出発しよう！","adv");
V("L6","v","s'habiller","服を着る","Yui [s'habille] vite.","ゆいはさっと服を着る。","day");
V("L6","adv","à gauche","左に","La gare est [à gauche].","駅は左側にある。","way");
V("L6","nm","le miroir","鏡","Léa se regarde dans le [miroir].","レアは鏡を見る。","thing");
V("L6","v","se souvenir","（de ～を）覚えている","Tu [te souviens] de Hugo ?","ユゴーのこと覚えてる？","day");
V("L6","adv","lentement","ゆっくり","Parlez [lentement], s'il vous plaît.","ゆっくり話してください。","adv");
V("L6","v","vendre","売る","On [vend] des biscuits pour les cerfs partout.","シカせんべいはどこでも売っている。","verb");
V("L6","nm","le sel","塩","Passe-moi le [sel], s'il te plaît.","塩を取ってくれる？","food");
V("L6","v","se réveiller","目を覚ます","Léa [se réveille] à six heures.","レアは6時に目を覚ます。","day");
V("L6","v","écrire","書く","Hugo [écrit] souvent à Léa.","ユゴーはよくレアに手紙を書く。","verb");
V("L6","nm","le repas","食事","Le [repas] est prêt !","ごはんができたよ！","food");
V("L6","v","se laver","（自分の体を）洗う","Hugo [se lave] les mains.","ユゴーは手を洗う。","day");
V("L6","v","entrer","入る","[Entrez], s'il vous plaît.","どうぞお入りください。","way");
V("L6","adv","partout","いたるところに","Il y a des cerfs [partout] à Nara.","奈良にはどこにでもシカがいる。","adv");
V("L6","v","se marier","結婚する","Ils vont [se marier] l'année prochaine.","彼らは来年結婚する予定だ。","day");
V("L6","v","s'amuser","楽しむ；遊ぶ","[Amusons-nous] bien ce soir !","今晩は大いに楽しもう！","day");
V("L6","v","passer","渡す；過ごす；通る","Le bus [passe] devant l'école.","バスは学校の前を通る。","verb");

/* ---------- 数 ---------- */
V("N","num","zéro","0","Il fait [zéro] degré à Lyon.","リヨンは0度だ。","n1");
V("N","num","un","1","Il y a [un] chat dans le jardin.","庭に猫が1匹いる。","n1",{alt:["une"]});
V("N","num","deux","2","Il y a [deux] stylos dans le sac.","かばんにペンが2本ある。","n1");
V("N","num","trois","3","Il y a [trois] chaises dans la salle.","部屋にいすが3つある。","n1");
V("N","num","quatre","4","Léa a [quatre] cousins.","レアにはいとこが4人いる。","n1");
V("N","num","cinq","5","Le cours finit à [cinq] heures.","授業は5時に終わる。","n1");
V("N","num","six","6","Le train part à [six] heures.","電車は6時に出る。","n1");
V("N","num","sept","7","Léa se lève à [sept] heures.","レアは7時に起きる。","n1");
V("N","num","huit","8","Hugo dîne à [huit] heures.","ユゴーは8時に夕食をとる。","n1");
V("N","num","neuf","9","Le cours commence à [neuf] heures.","授業は9時に始まる。","n1");
V("N","num","dix","10","Il y a [dix] étudiants dans la classe.","クラスには学生が10人いる。","n1");
V("N","num","onze","11","Hugo arrive à [onze] heures.","ユゴーは11時に着く。","n2");
V("N","num","douze","12","Il y a [douze] mois dans une année.","1年は12か月だ。","n2");
V("N","num","treize","13","Il y a [treize] cerfs devant le temple.","お寺の前にシカが13頭いる。","n2");
V("N","num","quatorze","14","Le [quatorze] juillet, c'est la fête nationale.","7月14日は革命記念日（フランスの祝日）だ。","n2");
V("N","num","quinze","15","Le cours commence à neuf heures [quinze].","授業は9時15分に始まる。","n2");
V("N","num","seize","16","Le cours finit à [seize] heures.","授業は16時に終わる。","n2");
V("N","num","dix-sept","17","Léa a [dix-sept] livres japonais.","レアは日本語の本を17冊持っている。","n2");
V("N","num","dix-huit","18","On dîne à [dix-huit] heures ?","18時に夕食にする？","n2");
V("N","num","dix-neuf","19","Yui a [dix-neuf] ans.","ゆいは19歳だ。","n2");
V("N","num","vingt","20","Léa a [vingt] ans.","レアは20歳だ。","n2");
V("N","num","vingt et un","21","Hugo a [vingt et un] ans.","ユゴーは21歳だ。","n3");
V("N","num","trente","30","Il y a [trente] jours en novembre.","11月は30日ある。","n3");
V("N","num","quarante","40","Il y a [quarante] étudiants dans la salle.","教室には学生が40人いる。","n3");
V("N","num","cinquante","50","Ce manteau coûte [cinquante] euros.","このコートは50ユーロする。","n3");
V("N","num","soixante","60","Il y a [soixante] minutes dans une heure.","1時間は60分だ。","n3");
V("N","num","soixante-dix","70","Mon grand-père a [soixante-dix] ans.","私の祖父は70歳だ。","n4");
V("N","num","soixante et onze","71","Ma grand-mère a [soixante et onze] ans.","私の祖母は71歳だ。","n4");
V("N","num","quatre-vingts","80","Ce sac coûte [quatre-vingts] euros.","このかばんは80ユーロする。","n4");
V("N","num","quatre-vingt-un","81","Il y a [quatre-vingt-un] cerfs dans le parc.","公園にシカが81頭いる。","n4");
V("N","num","quatre-vingt-dix","90","Le train part dans [quatre-vingt-dix] minutes.","電車は90分後に出る。","n4");
V("N","num","cent","100","Ce vélo coûte [cent] euros.","この自転車は100ユーロする。","n4");
V("N","num","deux cents","200","Les biscuits pour les cerfs coûtent [deux cents] yens.","シカせんべいは200円だ。","n4");
V("N","num","mille","1000","Ce billet d'avion coûte [mille] euros.","この航空券は1000ユーロする。","n4");
