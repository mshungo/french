/* ============================================================
   並べかえのタイル（文法練習・会話練習で共通）
   ・タップ：下の語 → 文の最後に入れる／文の中の語 → 下にもどす
   ・ドラッグ：文の中で並べかえ。下の語を文の好きな位置に入れることもできる
   ・全部ならべても自動では採点しない。「解答」を押したときだけ採点する
   ・「意味」：語の下に日本語の意味を小さく出す（内容語だけ。冠詞・代名詞・前置詞・疑問詞・否定・数・固有名詞は出さない）
     同じ語の形ちがい（habite / habitent、cadeau / cadeaus など）には同じ意味を出すので、形の正誤のヒントにはならない
   使い方：NLTiles.draw(q,{tray,bank,ctl,locked:()=>bool,onCheck:()=>void})
     q.tiles=[{w,id}] / q.words=正解の語の並び / q.picked=文に入れた語 / q.end=文末の記号
   ============================================================ */
(function(){
"use strict";
var GLOSS={"a":"持つ・ある（avoir）","accord":"同意","addition":"お会計","adore":"大好きだ（adorer）","adorent":"大好きだ（adorer）","adresse":"住所","agace":"いらいらさせる","ai":"持つ・ある（avoir）","aide":"手伝う（aider）","aider":"手伝う（aider）","aime":"好きだ（aimer）","aimez":"好きだ（aimer）","aller":"行く（aller）","allez":"行く（aller）","allons":"行く（aller）","amie":"友だち","amusez":"楽しむ（s'amuser）","amusons":"楽しむ（s'amuser）","ans":"年・〜歳","appartement":"アパルトマン","appelez":"名前が〜だ（s'appeler）","arrange":"都合がいい（arranger）","arrive":"着く（arriver）","as":"持つ・ある（avoir）","attendez":"待つ（attendre）","attendons":"待つ（attendre）","attends":"待つ（attendre）","aujourd'hui":"今日","aussi":"〜もまた","avais":"持つ・ある（avoir）","avoir":"持つ・ある（avoir）","baguette":"バゲット","beaucoup":"とても・たくさん","bien":"よく・うまく","biscuits":"ビスケット","bizarre":"変な","bon":"よい・おいしい","bonne":"よい・おいしい","boulangerie":"パン屋","bout":"端・終わり","bouteille":"びん","brosse":"みがく（se brosser）","bus":"バス","buses":"バス","c'est":"〜だ・いる（être）","cadeau":"プレゼント","cadeaus":"プレゼント","cadeaux":"プレゼント","café":"カフェ・コーヒー","carte":"地図・カード","cerf":"シカ","cerfs":"シカ","chambre":"部屋","chance":"運","chaud":"暑い・熱い","cher":"親愛な・高い","cherche":"さがす（chercher）","cherches":"さがす（chercher）","chien":"犬","chocolat":"チョコレート","choisir":"選ぶ（choisir）","choisis":"選ぶ（choisir）","choisit":"選ぶ（choisir）","cinéma":"映画館","classe":"クラス","commence":"始まる（commencer）","complexe":"複雑な","comprend":"わかる（comprendre）","comprends":"わかる（comprendre）","compris":"わかる（comprendre）","connais":"知っている（connaître）","connaissez":"知っている（connaître）","conseillez":"すすめる（conseiller）","content":"うれしい・満足な","contente":"うれしい・満足な","continuez":"続ける（continuer）","cool":"かっこいい","couche":"寝る（se coucher）","couchent":"寝る（se coucher）","coucher":"寝る（se coucher）","courage":"勇気・がんばれ","courant":"状況（au courant）","courir":"走る（courir）","cours":"授業","coûte":"値段が〜だ（coûter）","coûtent":"値段が〜だ（coûter）","cuisine":"料理","côté":"側","d'accord":"同意","d'arriver":"来る（venir）","d'ouvrir":"開ける（ouvrir）","demain":"明日","demande":"たずねる・頼む（demander）","demander":"たずねる・頼む（demander）","demi":"半","dents":"歯","dessert":"デザート","dictionnaires":"辞書","digne":"ふさわしい","dimanche":"日曜日","dirais":"言う（dire）","dirait":"言う（dire）","dire":"言う（dire）","dis":"言う（dire）","dit":"言う（dire）","dois":"〜しなければならない（devoir）","doit":"〜しなければならない（devoir）","domage":"残念","dommage":"残念","donne":"あげる（donner）","donner":"あげる（donner）","droit":"まっすぐ・右","droite":"まっすぐ・右","déjeuner":"昼食","délicieuses":"おいしい","délicieux":"おいしい","dépend":"〜しだいだ（dépendre）","dépende":"〜しだいだ（dépendre）","dépêche":"急ぐ（se dépêcher）","dérange":"じゃまする（déranger）","déranger":"じゃまする（déranger）","désolée":"ごめんなさい","emporter":"持ち帰り","ensemble":"いっしょに","envie":"うらやむ・〜したい","envoyer":"送る（envoyer）","es":"〜だ・いる（être）","essayer":"ためす（essayer）","est":"〜だ・いる（être）","excusez":"すみません（excuser）","facile":"簡単な","faire":"する・作る（faire）","fais":"する・作る（faire）","fait":"する・作る（faire）","famille":"家族","fatigué":"疲れた","faut":"〜しなければならない（il faut）","fenêtre":"窓","festival":"祭り","festivals":"祭り","festivaux":"祭り","fier":"誇りに思う","film":"映画","fière":"誇りに思う","formule":"セットメニュー","fort":"大きな声で・強く","français":"フランス語・フランスの","frigo":"冷蔵庫","froid":"寒い・冷たい","fromage":"チーズ","frère":"兄弟","frères":"兄弟","fumer":"タバコを吸う（fumer）","fête":"パーティー","gare":"駅","gauche":"左","gentil":"親切な","gentille":"親切な","grandes":"大きい","grands":"大きい","gâteau":"ケーキ","gâteaux":"ケーキ","génial":"すごい","habite":"住む（habiter）","habitent":"住む（habiter）","habitez":"住む（habiter）","heure":"時間・〜時","heures":"時間・〜時","homme":"男性・人","honte":"恥ずかしい","hôtel":"ホテル","ici":"ここ","impressionnant":"すごい","incroyable":"信じられない","inquiet":"心配な","inquiétez":"心配する（s'inquiéter）","intéressant":"おもしろい","invite":"招く（inviter）","invitée":"招く（inviter）","j'ai":"持つ・ある（avoir）","j'habite":"住む（habiter）","japon":"日本","japonais":"日本・日本の","japonaise":"日本・日本の","jeu":"ゲーム","jeus":"ゲーム","jeux":"ゲーム","joli":"きれいな","jolie":"きれいな","jour-là":"日","jours":"日","jupe":"スカート","jusqu'au":"〜まで","jusqu'à":"〜まで","juste":"ちょうど","l'achetons":"買う（acheter）","l'addition":"お会計","l'air":"様子","l'année":"年・〜歳","l'avais":"持つ・ある（avoir）","l'eau":"水","l'envie":"うらやむ・〜したい","l'envoie":"送る（envoyer）","l'essayer":"ためす（essayer）","l'université":"大学","laisse":"放っておく（laisser）","laissez":"放っておく（laisser）","lait":"牛乳","lave":"洗う（se laver）","levez":"起きる（se lever）","libre":"自由な・ひまな","livre":"本","lève":"起きる（se lever）","lèves":"起きる（se lever）","m'agace":"いらいらさせる","m'aider":"手伝う（aider）","m'avoir":"持つ・ある（avoir）","m'est":"〜だ・いる（être）","m'étonnerait":"驚かせる（étonner）","magnifique":"すばらしい","maison":"家","mange":"食べる（manger）","mangent":"食べる（manger）","mangeons":"食べる（manger）","manges":"食べる（manger）","manteau":"コート","marier":"結婚する（se marier）","matin":"朝","matins":"朝","merci":"ありがとう","met":"置く・着る（mettre）","mets":"置く・着る（mettre）","midi":"正午","mieux":"よりよく","mignon":"かわいい","minutes":"分","miso":"みそ","moins":"少なく","montre":"見せる（montrer）","montres":"見せる（montrer）","mur":"かべ","musique":"音楽","musée":"美術館","mémoire":"記憶","même":"同じ","n'a":"持つ・ある（avoir）","n'ai":"持つ・ある（avoir）","n'aie":"持つ・ある（avoir）","n'aime":"好きだ（aimer）","n'est":"〜だ・いる（être）","n'habite":"住む（habiter）","natto":"納豆","noir":"黒い","noire":"黒い","nouveau":"新しい","nouvel":"新しい","nouvelle":"新しい","opinion":"意見","oui":"はい","ouvrez":"開ける（ouvrir）","ouvrir":"開ける（ouvrir）","paie":"払う（payer）","paient":"払う（payer）","pain":"パン","parapluie":"傘","parc":"公園","parents":"両親","parle":"話す（parler）","parlent":"話す（parler）","parler":"話す（parler）","parles":"話す（parler）","parlez":"話す（parler）","parlons":"話す（parler）","part":"出発する（partir）","partage":"分かちあう（partager）","partons":"出発する（partir）","partout":"どこでも","payer":"払う（payer）","peine":"苦労","pense":"思う・考える（penser）","penses":"思う・考える（penser）","permets":"ゆるす（permettre）","permettez":"ゆるす（permettre）","petite":"小さい","peu":"少し","peur":"こわさ","peut":"〜できる（pouvoir）","peux":"〜できる（pouvoir）","photo":"写真","photos":"写真","place":"広場・その場","plaisir":"喜び","plaisirs":"喜び","plaît":"（どうぞ）お願いします","pleure":"泣く（pleurer）","pleurer":"泣く（pleurer）","pleut":"雨が降る（pleuvoir）","pluie":"雨","pommes":"りんご","pont":"橋","portable":"スマホ","porte":"着ている（porter）","possible":"可能な","poste":"郵便局","pourrait":"〜できる（pouvoir）","pouvez":"〜できる（pouvoir）","pratique":"便利な","prendre":"取る（prendre）","prends":"取る（prendre）","prenez":"取る（prendre）","prie":"どうぞ（prier）","pris":"予定がある","prise":"予定がある","problème":"問題","prochaine":"次の","professeur":"先生","promène":"散歩する（se promener）","promènent":"散歩する（se promener）","près":"近くに","présenter":"紹介する（présenter）","prête":"貸す（prêter）","prêter":"貸す（prêter）","quart":"15分","regarder":"見る（regarder）","rentrer":"帰る（rentrer）","reposes":"休む（se reposer）","reposez":"休む（se reposer）","rester":"とどまる（rester）","retard":"遅れ","rire":"笑う（rire）","rit":"笑う（rire）","riz":"米","robe":"ワンピース","rue":"通り","réfléchir":"よく考える（réfléchir）","réfléchis":"よく考える（réfléchir）","répéter":"くり返す（répéter）","répétez":"くり返す（répéter）","réservation":"予約","résidence":"寮","réveille":"起こす・起きる（réveiller）","réveilles":"起こす・起きる（réveiller）","rêve":"夢","s'amuse":"楽しむ（s'amuser）","s'amusons":"楽しむ（s'amuser）","s'écrivent":"書く（écrire）","sais":"知っている（savoir）","samedi":"土曜日","savez":"知っている（savoir）","savoir":"知っている（savoir）","semaine":"週","semblant":"ふり","semble":"〜のように思える（sembler）","serai":"〜だ・いる（être）","service":"頼みごと","soin":"気づかい","soir":"夜","soirs":"夜","sois":"〜だ・いる（être）","sont":"〜だ・いる（être）","sortez":"出かける（sortir）","sortir":"出かける（sortir）","sortons":"出かける（sortir）","soupe":"スープ","souvenir":"思い出","souvent":"よく・しばしば","souviens":"覚えている（se souvenir）","soyez":"〜だ・いる（être）","stylo":"ペン","sucre":"砂糖","suffis":"十分だ（suffire）","suffit":"十分だ（suffire）","suis":"〜だ・いる（être）","super":"すごくいい","séparément":"別々に","sérieuse":"まじめな","sérieux":"まじめな","sœur":"姉妹","t'arrange":"都合がいい（arranger）","t'as":"持つ・ある（avoir）","t'envie":"うらやむ・〜したい","t'es":"〜だ・いる（être）","t'inquiète":"心配する（s'inquiéter）","t'invite":"招く（inviter）","table":"テーブル","tard":"遅く","tarte":"タルト","tartes":"タルト","temple":"寺","temples":"寺","temps":"時間・天気","thé":"お茶","tombe":"落ちる（tomber）","tomber":"落ちる（tomber）","tombé":"落ちる（tomber）","toujours":"いつも・まだ","tournez":"曲がる（tourner）","tout":"まっすぐ","travaille":"働く（travailler）","travailles":"働く（travailler）","traversez":"渡る（traverser）","triste":"悲しい","tristesse":"悲しみ","trouve":"見つける・思う（trouver）","trouver":"見つける・思う（trouver）","trouves":"見つける・思う（trouver）","très":"とても","téléphone":"電話する（téléphoner）","téléphoner":"電話する（téléphoner）","télévision":"テレビ","tôt":"早く","université":"大学","va":"行く（aller）","vais":"行く（aller）","vas":"行く（aller）","vaut":"価値がある（valoir）","vaux":"価値がある（valoir）","vend":"売る（vendre）","vendent":"売る（vendre）","vendredi":"金曜日","venez":"来る（venir）","venir":"来る（venir）","venons":"来る（venir）","vert":"緑の","verte":"緑の","veut":"欲しい・〜したい（vouloir）","veux":"欲しい・〜したい（vouloir）","vidéo":"動画","vieil":"古い","vieille":"古い","viennent":"来る（venir）","viens":"来る（venir）","vient":"来る（venir）","vieux":"古い","visage":"顔","visiter":"訪れる（visiter）","vite":"すばやく","voici":"ここに〜がある","voilà":"そこに〜がある","voir":"見る・会う（voir）","vois":"見る・会う（voir）","voiture":"車","volontier":"喜んで","volontiers":"喜んで","vont":"行く（aller）","voudrais":"欲しい・〜したい（vouloir）","vrai":"本当の","vraiment":"本当に","vélo":"自転車","week-end":"週末","yens":"円","écris":"書く（écrire）","écrit":"書く（écrire）","égal":"どうでもいい","étonnerait":"驚かせる（étonner）","étudiant":"学生","étudiante":"学生","étudiantes":"学生","étudiants":"学生","étudiez":"勉強する（étudier）","étudions":"勉強する（étudier）","été":"夏","êtes":"〜だ・いる（être）","œufs":"卵"};
function key(w){return String(w).toLowerCase().replace(/[,.!?;:]+$/,"").replace(/’/g,"'");}
function gloss(w){return GLOSS[key(w)]||"";}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
var GK="nlGloss";
function glossOn(){try{return localStorage.getItem(GK)!=="0";}catch(e){return true;}}
function setGloss(v){try{localStorage.setItem(GK,v?"1":"0");}catch(e){}}

var css=
".tile{touch-action:none;-webkit-user-select:none;user-select:none;display:inline-flex;flex-direction:column;align-items:center;line-height:1.15;}"+
".tile .tg{display:none;font-family:'Noto Sans JP',sans-serif;font-size:10px;font-weight:500;color:var(--ink-soft);margin-top:2px;white-space:nowrap;letter-spacing:0;}"+
".gl-on .tile .tg{display:block;}"+
".tile.ghost{opacity:.28;}"+
".tile-fly{position:fixed;z-index:2000;pointer-events:none;transform:translate(-50%,-60%) scale(1.06);box-shadow:0 12px 24px -10px rgba(90,60,70,.55);background:#fff!important;border-color:var(--accent)!important;}"+
".tray .ins{display:inline-block;width:3px;align-self:stretch;min-height:34px;border-radius:2px;background:var(--accent-ink);animation:insBlink .8s ease-in-out infinite;}"+
"@keyframes insBlink{50%{opacity:.35}}"+
".tray.drop{background:var(--accent-wash);}"+
".build-ctl{flex-wrap:wrap;align-items:center;}"+
".build-go{font-family:'Noto Sans JP',sans-serif;min-width:120px;padding:9px 18px;border-radius:12px;border:none;background:var(--accent-ink);color:#fff;font-size:14px;font-weight:700;cursor:pointer;}"+
".build-go:disabled{background:var(--rule);color:var(--ink-soft);cursor:default;}"+
".gl-btn.on{background:var(--accent-ink);color:#fff;}";
var st=document.createElement("style");st.textContent=css;(document.head||document.documentElement).appendChild(st);

function tileHTML(t){var g=gloss(t.w);return '<button class="tile" type="button" data-id="'+t.id+'"><span class="tw">'+esc(t.w)+'</span>'+(g?'<small class="tg">'+esc(g)+'</small>':'<small class="tg">&nbsp;</small>')+'</button>';}

function draw(q,o){
  var tray=o.tray,bank=o.bank,used={};
  q.picked=q.picked||[];
  q.picked.forEach(function(t){used[t.id]=1;});
  tray.innerHTML=q.picked.map(tileHTML).join("")+(q.picked.length?'<span class="end">'+esc(q.end||"")+'</span>':'<span class="tray-ph">ここに並びます</span>');
  bank.innerHTML=q.tiles.filter(function(t){return !used[t.id];}).map(tileHTML).join("");
  var box=tray.parentNode;box.classList.toggle("gl-on",glossOn());
  ctl(q,o);
  [].forEach.call(tray.querySelectorAll(".tile"),function(el){bind(el,"tray",q,o);});
  [].forEach.call(bank.querySelectorAll(".tile"),function(el){bind(el,"bank",q,o);});
}
/* 解答ボタン・意味ボタン（ページの「1つ戻す・やり直す」の横に足す） */
function ctl(q,o){
  var c=o.ctl;if(!c)return;
  var go=c.querySelector(".build-go"),gb=c.querySelector(".gl-btn");
  if(!gb){gb=document.createElement("button");gb.type="button";gb.className="mini gl-btn";gb.textContent="意味";gb.title="語の意味を表示";c.insertBefore(gb,c.firstChild);
    gb.onclick=function(){setGloss(!glossOn());o.tray.parentNode.classList.toggle("gl-on",glossOn());gb.classList.toggle("on",glossOn());};}
  gb.classList.toggle("on",glossOn());
  if(!go){go=document.createElement("button");go.type="button";go.className="build-go";c.appendChild(go);
    go.onclick=function(){if(o.locked()||q.picked.length!==q.words.length)return;go.disabled=true;o.onCheck();};}
  var n=q.words.length,k=q.picked.length;
  go.disabled=k!==n||o.locked();
  go.textContent=k<n?"あと "+(n-k)+" 語":k>n?(k-n)+" 語多い":"解答";
}
var drag=null;
function bind(el,from,q,o){
  el.addEventListener("pointerdown",function(e){
    if(o.locked()||(e.button!=null&&e.button!==0))return;
    drag={el:el,id:+el.dataset.id,from:from,x:e.clientX,y:e.clientY,on:false,q:q,o:o,pid:e.pointerId};
    try{el.setPointerCapture(e.pointerId);}catch(er){}
  });
  el.addEventListener("pointermove",function(e){
    if(!drag||drag.el!==el)return;
    if(!drag.on){if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)<8)return;start(e);}
    move(e);
  });
  el.addEventListener("pointerup",function(e){
    if(!drag||drag.el!==el)return;
    var d=drag;drag=null;el._noClick=true;setTimeout(function(){el._noClick=false;},0);
    if(!d.on){tap(d);return;}
    drop(d,e);
  });
  el.addEventListener("pointercancel",function(){if(drag&&drag.el===el){cleanup(drag);drag=null;draw(q,o);}});
  el.addEventListener("click",function(e){if(el._noClick)return;if(e.detail===0&&!o.locked())tap({id:+el.dataset.id,from:from,q:q,o:o});});   // キーボード操作
}
function find(q,id){for(var i=0;i<q.tiles.length;i++)if(q.tiles[i].id===id)return q.tiles[i];return null;}
function tap(d){
  var q=d.q,o=d.o;if(o.locked())return;
  if(d.from==="tray")q.picked=q.picked.filter(function(t){return t.id!==d.id;});
  else q.picked.push(find(q,d.id));
  draw(q,o);
}
function start(e){
  var d=drag;d.on=true;
  var f=d.el.cloneNode(true);f.classList.add("tile-fly");f.style.width=d.el.offsetWidth+"px";document.body.appendChild(f);d.fly=f;
  d.el.classList.add("ghost");
}
function overTray(d,x,y){var r=d.o.tray.getBoundingClientRect();return x>=r.left-16&&x<=r.right+16&&y>=r.top-24&&y<=r.bottom+24;}
/* 指の位置から、文の中のどこに入るか（何番目の前か）を決める */
function insIndex(d,x,y){
  var els=[].filter.call(d.o.tray.querySelectorAll(".tile"),function(t){return t!==d.el;});
  for(var i=0;i<els.length;i++){var r=els[i].getBoundingClientRect();
    if(y<r.top-4)return i;
    if(y<=r.bottom+4&&x<r.left+r.width/2)return i;}
  return els.length;
}
function move(e){
  var d=drag,x=e.clientX,y=e.clientY;
  d.fly.style.left=x+"px";d.fly.style.top=y+"px";
  var tr=d.o.tray,old=tr.querySelector(".ins");if(old)old.remove();
  var on=overTray(d,x,y);tr.classList.toggle("drop",on);
  if(on){var i=insIndex(d,x,y),els=[].filter.call(tr.querySelectorAll(".tile"),function(t){return t!==d.el;});
    var mk=document.createElement("span");mk.className="ins";
    if(i<els.length)tr.insertBefore(mk,els[i]);else{var end=tr.querySelector(".end,.tray-ph");tr.insertBefore(mk,end);}}
  d.idx=on?insIndex(d,x,y):-1;
}
function cleanup(d){if(d.fly)d.fly.remove();var m=d.o.tray.querySelector(".ins");if(m)m.remove();d.o.tray.classList.remove("drop");if(d.el)d.el.classList.remove("ghost");}
function drop(d,e){
  cleanup(d);
  var q=d.q,o=d.o,t=find(q,d.id);if(o.locked())return draw(q,o);
  var on=overTray(d,e.clientX,e.clientY);
  var rest=q.picked.filter(function(p){return p.id!==d.id;});
  if(on){var i=insIndex(d,e.clientX,e.clientY);rest.splice(Math.min(i,rest.length),0,t);q.picked=rest;}
  else if(d.from==="tray")q.picked=rest;   // 文の外に出したら、下にもどす
  draw(q,o);
}
window.NLTiles={draw:draw,gloss:gloss};
})();
