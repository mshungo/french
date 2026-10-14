/* ============================================================
   単語カード（vocab.html）。単語は vocab-data.js。
   しくみ
   ・間隔反復：単語ごとに「箱」1〜6。正解するたびに次の復習までの間をのばす
       箱1→翌日 / 箱2→3日後 / 箱3→1週間後 / 箱4→2週間後 / 箱5→1か月後 / 箱6＝定着（2か月後にたしかめ）
     忘れかけたころにもう一度思い出すと、記憶が長もちする（エビングハウスの忘却曲線・分散学習）。
     まだ復習の日が来ていない単語は、正解しても箱は上がらない（間をあけることに意味があるので）。
   ・思い出す練習：答えを見る前に、まず自分で思い出す（テスト効果）
   ・受容から産出へ：箱1 意味を選ぶ・聞いて選ぶ → 箱2 フランス語を選ぶ → 箱3から 書いて答える・聞いて書く
   ・その場で覚えなおす：まちがえた単語は箱1にもどり、3枚ほどあとにもう一度出る。正解するまで練習は終わらない
   ・新しい単語は1回5語まで（1日25語まで）。同じテーマ（色・家族など）の新しい語はつづけて出さない（似た語どうしの混同を避ける）
   ============================================================ */
(function(){
"use strict";
const WORDS=[],SEQ={};
window.V=function(u,p,fr,ja,ex,exj,tag,x){const n=SEQ[u]||0;SEQ[u]=n+1;WORDS.push(Object.assign({id:u+"-"+n,u,p,fr,ja,ex,exj,tag},x||{}));};
const INT=[0,1,3,7,14,30,60];          // 箱ごとの、次の復習までの日数
const BOX_L=["","翌日","3日後","1週間後","2週間後","1か月後","定着"];
const NEW_PER=5,NEW_DAY=25,ROUND=10;
const $=id=>document.getElementById(id);
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function today(){return Math.floor((Date.now()+9*3600e3)/864e5);}   // 日本時間の日の番号

/* ---------- 単語の形 ---------- */
const VOW=/^[aeiouyhàâæéèêëîïôœûùü]/i;
const isN=w=>/^n/.test(w.p);
function stemOf(w){return w.fr.replace(/^(le |la |les |l')/,"");}
function defArt(g,s){return g==="p"?"les ":VOW.test(s)?"l'":g==="m"?"le ":"la ";}
function indArt(g){return g==="p"?"des ":g==="m"?"un ":"une ";}
/* 名詞の形：[{s:語, g:m|f|p}] */
function nForms(w){
  const s=stemOf(w);
  if(w.p==="nmp"||w.p==="nfp")return [{s,g:"p"}];
  if(w.p==="nmf")return w.f?[{s,g:"m"},{s:w.f,g:"f"}]:[{s,g:"m"},{s,g:"f"}];
  return [{s,g:w.p==="nm"?"m":"f"}];
}
function gOf(w){return w.p==="nm"?"m":w.p==="nf"?"f":w.p==="nmf"?"mf":w.p==="nmp"?"mp":w.p==="nfp"?"fp":"";}
/* 画面に出す見出し（l'hôtel・le voisin / la voisine・grand, grande） */
function head(w){
  if(isN(w)){if(w.noArt)return stemOf(w);if(w.p==="nmf"&&w.f)return w.fr+" / "+defArt("f",w.f)+w.f;return w.fr;}
  if(w.p==="a"&&w.f)return w.fr+", "+w.f;
  return w.fr;
}
/* 選択肢・音声で使う短い形：l' のときは un/une で性がわかるようにする */
function shortForm(w,forceInd){
  if(!isN(w)||w.noArt)return w.fr;
  const f=nForms(w)[0];
  if(forceInd||(f.g!=="p"&&VOW.test(f.s)))return indArt(f.g)+f.s;
  return defArt(f.g,f.s)+f.s;
}
const POS_L={nm:"名詞",nf:"名詞",nmf:"名詞",nmp:"名詞",nfp:"名詞",v:"動詞",a:"形容詞",adv:"副詞など",q:"疑問詞",ex:"表現",num:"数"};
function gChip(w){
  if(!isN(w)||w.noArt&&w.p==="nm")return w.noArt?'<span class="vg g-m">男</span>':"";
  const g=gOf(w);
  return g==="m"?'<span class="vg g-m">男</span>':g==="f"?'<span class="vg g-f">女</span>':g==="mf"?'<span class="vg g-m">男</span><span class="vg g-f">女</span>':
    '<span class="vg g-'+g[0]+'">'+(g[0]==="m"?"男":"女")+'・複数</span>';
}
function grp(w){return isN(w)?"n":w.p==="ex"||w.p==="adv"||w.p==="q"?"o":w.p;}

/* ---------- 照合 ---------- */
function nz(s,keepAcc,num){
  s=String(s||"").replace(/[’ʼ`´]/g,"'").replace(/\s*'\s*/g,"'").replace(/[.!?,;:]+/g," ").replace(/\s*-\s*/g,"-").replace(/\s+/g," ").trim().toLowerCase();
  if(num)s=s.replace(/-/g," ").replace(/\bet\b/g,"et");
  if(!keepAcc)s=s.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/œ/g,"oe").replace(/æ/g,"ae");
  return s;
}
function answers(w){
  let a=[];
  if(isN(w)){
    if(w.noArt)a=[stemOf(w)];
    else nForms(w).forEach(f=>{a.push(defArt(f.g,f.s)+f.s,indArt(f.g)+f.s);});
  }else if(w.p==="a"){a=[w.fr];if(w.f)a.push(w.f);if(w.mf)a.push(w.mf);}
  else a=[w.fr];
  return a.concat(w.alt||[]);
}
/* 戻り値 {r:2 完全 / 1 アクセントだけ違う / 0 不正解, why:"art"（冠詞がない）|"gender"（性がちがう）} */
function judgeW(input,w){
  const num=w.p==="num",A=answers(w);
  if(A.some(a=>nz(a,true,num)===nz(input,true,num)))return {r:2};
  if(A.some(a=>nz(a,false,num)===nz(input,false,num)))return {r:1};
  if(isN(w)&&!w.noArt){
    const x=nz(input);
    const fs=nForms(w);
    if(fs.some(f=>nz(f.s)===x))return {r:0,why:"art"};
    if(fs.length===1&&fs[0].g!=="p"){
      const o=fs[0].g==="m"?"f":"m",s=fs[0].s;
      if([defArt(o,s)+s,indArt(o)+s].some(v=>nz(v)===x))return {r:0,why:"gender"};
    }
  }
  return {r:0};
}

/* ---------- 記録 ---------- */
let store,KEY,WHO;
function load(){
  let s=null;try{s=JSON.parse(localStorage.getItem(KEY));}catch(e){}
  s=s||{};
  return Object.assign({tries:0,answered:0,correct:0,timeMs:0,best:null,it:{},nd:{d:0,n:0},au:1,badges:{}},s);
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}}
function st(w){return store.it[w.id]||null;}   // {l:箱, d:次の復習の日, w:まちがえた回数, t:最後に練習した日}
function lv(w){const s=st(w);return s?s.l:0;}
function isDue(w,d){const s=st(w);return !!s&&s.l>=1&&s.d<=d;}
function newToday(){const d=today();return store.nd.d===d?store.nd.n:0;}
function inScope(w,sc){return sc==="today"||sc==="weak"||sc==="extra"?true:w.u===sc;}
function unitOf(k){return VOCAB_UNITS.find(u=>u.k===k)||{k,t:k,c:"#c0a06a",ci:"#9a7b45",cw:"#f8f1e4"};}
function weakList(){return WORDS.filter(w=>{const s=st(w);return s&&s.w>=2&&s.l<5;}).sort((a,b)=>st(b).w-st(a).w);}
function counts(sc){
  const d=today(),L=WORDS.filter(w=>inScope(w,sc));
  return {n:L.length,due:L.filter(w=>isDue(w,d)).length,fresh:L.filter(w=>!st(w)).length,
    tom:L.filter(w=>{const s=st(w);return s&&s.l>=1&&s.d===d+1;}).length,
    done:L.filter(w=>lv(w)>=6).length,learn:L.filter(w=>lv(w)>=1).length,firm:L.filter(w=>lv(w)>=4).length};
}
function pctOf(list){return list.length?Math.floor(list.reduce((a,w)=>a+Math.min(6,lv(w)),0)/(list.length*6)*100):0;}
/* 学習記録ページ（成果カード）用 */
function saveSum(){
  const by=[0,0,0,0,0,0,0];WORDS.forEach(w=>by[lv(w)]++);
  store.sum={n:WORDS.length,by,p:pctOf(WORDS),due:counts("today").due};save();
}

/* ---------- 出題の組み立て ---------- */
let queue=[],pos=0,done=0,sess=null,cur=null,locked=false,autoNext=null,scope="today",t0=0;
/* 新しい単語を選ぶ：単元の順に、同じテーマの語がつづかないように */
function pickNew(sc,max){
  const out=[],tags=new Set();
  const pool=WORDS.filter(w=>!st(w)&&inScope(w,sc));
  const units=sc==="today"?VOCAB_UNITS.map(u=>u.k).filter(k=>pool.some(w=>w.u===k)):[sc];
  const first=pool.filter(w=>w.u===units[0]);   // 「今日のカード」では、まだ新しい語が残っているいちばん前の単元から
  for(const w of first){if(out.length>=max)break;if(!tags.has(w.tag)){out.push(w);tags.add(w.tag);}}
  for(const w of first){if(out.length>=max)break;if(out.indexOf(w)<0)out.push(w);}
  return out;
}
function buildSession(sc){
  const d=today();
  let due=[],fresh=[],extra=[];
  if(sc==="weak"){
    extra=weakList().slice(0,ROUND);
  }else{
    due=WORDS.filter(w=>inScope(w,sc)&&isDue(w,d)).sort((a,b)=>st(a).d-st(b).d||st(a).l-st(b).l).slice(0,15);
    if(sc!=="extra"){
      const room=Math.min(NEW_PER,Math.max(0,ROUND-due.length),Math.max(0,NEW_DAY-newToday()));
      fresh=pickNew(sc,room);
    }
    /* 復習も新しい語もないとき・少ないとき：前倒しの練習（箱は上がらない）で6語まで */
    if(due.length+fresh.length<6){
      const cand=WORDS.filter(w=>inScope(w,sc)&&st(w)&&st(w).l>=1&&!isDue(w,d)&&st(w).t!==d)
        .sort((a,b)=>st(a).l-st(b).l||st(a).d-st(b).d);
      extra=cand.slice(0,(sc==="extra"?ROUND:6)-due.length-fresh.length);
    }
  }
  const items=shuffle(due.map(w=>task(w,"due")).concat(extra.map(w=>task(w,isDue(w,d)?"due":"extra"))));
  /* 新しい語の「出会い」カードを、復習のあいだに均等に置く。思い出すテストは、出会いの3枚あとに入る */
  const n=fresh.length;
  fresh.forEach((w,i)=>{const at=Math.round((i+1)*items.length/(n+1))+i;items.splice(Math.min(at,items.length),0,task(w,"intro"));});
  return items;
}
function task(w,kind,fmt){return {w,kind,fmt:fmt||fmtFor(w,kind),rep:0};}
function hasAudio(){return !!window.fetch;}
function fmtFor(w,kind){
  if(kind==="intro")return "intro";
  if(kind==="test")return "fj";
  const l=lv(w);
  if(l<=1)return hasAudio()&&Math.random()<.4?"lj":"fj";
  if(l===2)return "jf";
  if(l>=4&&hasAudio()&&Math.random()<.35&&w.p!=="num")return "dw";
  return "w";
}

/* ---------- 選択肢 ---------- */
function jaOpts(w){
  const g=grp(w),seen=new Set([w.ja]),out=[w.ja];
  const same=shuffle(WORDS.filter(o=>o!==w&&grp(o)===g&&o.tag===w.tag&&o.u===w.u));
  const unit=shuffle(WORDS.filter(o=>o!==w&&grp(o)===g&&o.u===w.u));
  const all=shuffle(WORDS.filter(o=>o!==w&&grp(o)===g));
  [same.slice(0,1),unit,all].forEach(L=>L.forEach(o=>{if(out.length<4&&!seen.has(o.ja)){seen.add(o.ja);out.push(o.ja);}}));
  return shuffle(out);
}
function frOpts(w){
  const g=grp(w),ok=shortForm(w),out=[ok],seen=new Set([nz(ok)]);
  const vowelN=isN(w)&&!w.noArt&&nForms(w)[0].g!=="p"&&VOW.test(nForms(w)[0].s);
  const add=x=>{if(out.length<4&&x&&!seen.has(nz(x))){seen.add(nz(x));out.push(x);}};
  if(isN(w)&&!w.noArt&&w.p!=="nmf"){
    const f=nForms(w)[0];
    if(f.g!=="p"){const o=f.g==="m"?"f":"m";add(vowelN?indArt(o)+f.s:defArt(o,f.s)+f.s);}
  }
  if(w.p==="num"){
    const i=WORDS.indexOf(w);[i+1,i-1,i+2,i-2].forEach(k=>{const o=WORDS[k];if(o&&o.p==="num")add(o.fr);});
  }
  const like=o=>{const a=nz(stemOf(o)),b=nz(stemOf(w));return (a[0]===b[0]?2:0)+(Math.abs(a.length-b.length)<=2?1:0)+(o.u===w.u?1:0)+Math.random()*1.5;};
  WORDS.filter(o=>o!==w&&grp(o)===g&&o.ja!==w.ja).sort((a,b)=>like(b)-like(a)).slice(0,8)
    .forEach(o=>add(vowelN&&isN(o)&&!o.noArt?shortForm(o,true):shortForm(o)));
  return shuffle(out);
}

/* ---------- 音声（audio/vocab/ の録音。単語＝ID.mp3、例文＝IDx.mp3） ---------- */
const bufs={};let srcNode=null,playTok=0;
function aFile(w,ex){return "audio/vocab/"+w.id+(ex?"x":"")+".mp3";}
/* 鳴らせたら true、録音が読みこめなかったら false を返す */
function play(w,ex,delay){
  const tok=++playTok,f=aFile(w,ex);
  try{if(srcNode)srcNode.stop();}catch(e){}
  return new Promise(done=>setTimeout(()=>{
    if(tok!==playTok)return done(true);
    if(typeof actx!=="undefined"&&actx&&window.fetch){
      if(!bufs[f])bufs[f]=fetch(f).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer();}).then(ab=>new Promise((res,rej)=>actx.decodeAudioData(ab,res,rej)));
      bufs[f].then(b=>{if(tok!==playTok)return done(true);if(actx.state==="suspended")actx.resume();
        const s=actx.createBufferSource();s.buffer=b;s.connect(actx.destination);srcNode=s;s.start(actx.currentTime+.02);done(true);}).catch(()=>{delete bufs[f];done(false);});
    }else{try{const a=new Audio(f);a.onerror=()=>done(false);a.play().then(()=>done(true),()=>done(false));}catch(e){done(false);}}
  },delay||0));
}
/* 自動再生が止められている端末でも、最初にどこかを押したら音が出るように */
document.addEventListener("pointerdown",()=>{try{if(typeof actx!=="undefined"&&actx&&actx.state==="suspended")actx.resume();}catch(e){}},true);
function audioReady(){return typeof actx!=="undefined"&&actx&&actx.state==="running";}
function preload(w){if(typeof actx==="undefined"||!actx||!window.fetch)return;[0,1].forEach(x=>{const f=aFile(w,x);if(!bufs[f])bufs[f]=fetch(f).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer();}).then(ab=>new Promise((res,rej)=>actx.decodeAudioData(ab,res,rej)));bufs[f].catch(()=>{delete bufs[f];});});}
function spk(cls,id,ex,label){return '<button class="spk '+cls+'" data-w="'+id+'" data-x="'+(ex?1:0)+'" aria-label="'+(label||"音声")+'" title="'+(label||"音声")+'">'+NLI.svg("speaker",cls==="big"?34:18)+'</button>';}
document.addEventListener("click",e=>{
  const b=e.target.closest&&e.target.closest(".spk");if(!b)return;
  const w=WORDS.find(x=>x.id===b.dataset.w);if(!w)return;
  if(typeof ensureAudio==="function")ensureAudio();
  play(w,b.dataset.x==="1");b.classList.remove("ring");void b.offsetWidth;b.classList.add("ring");
});

/* ---------- 画面 ---------- */
const CARD_IC='<svg width="30" height="30" aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="9" width="17" height="20" rx="2.5" transform="rotate(-8 13.5 19)"/><rect x="10" y="4" width="17" height="20" rx="2.5"/><path d="M14.5 11.5h8M14.5 15.5h5.5"/><path d="M22.6 19.2l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z" fill="currentColor" stroke="none"/></svg>';
function shell(){
  const units=VOCAB_UNITS.map(u=>'<button class="start-btn vu" data-u="'+u.k+'" style="--vc:'+u.c+';--vcw:'+u.cw+'"><i class="wk">'+esc(u.k==="N"?"#":u.k.slice(1))+'</i>'+
    '<span class="sb-name">'+esc(u.t)+'<span class="sb-desc">'+esc(u.sub)+'</span><span class="gm" data-gm="'+u.k+'"></span></span>'+
    '<span class="sb-prog" data-prog="'+u.k+'"></span></button>').join("");
  return ''+
'<div class="wrap">'+
'  <div class="crown"><div class="crest">'+CARD_IC+'</div><div class="eyebrow">Naralingo · Vocabulaire</div><h1>単語カード</h1><span class="verbs">mots · révision espacée</span></div>'+
'  <div class="panel" id="homeScreen">'+
'    <div class="acct"><div class="row"><a class="ic-nav" href="index.html" aria-label="メニュー" title="メニュー">'+NLI.svg("back",20)+'</a><div class="streak" id="streak"></div></div></div>'+
'    <div class="stat-grid">'+
'      <div class="stat"><div class="n" id="hLearn">0</div><div class="l">学習した語</div></div>'+
'      <div class="stat acc"><div class="n" id="hDone">0</div><div class="l">定着</div></div>'+
'      <div class="stat"><div class="n" id="hPct">0</div><div class="l">達成率</div></div>'+
'      <div class="stat"><div class="n" id="hTime">0分</div><div class="l">勉強時間</div></div>'+
'    </div>'+
'    <button class="vtoday" id="todayBtn"><span class="vt-ic">'+CARD_IC+'</span><span class="vt-tx"><b>今日のカード</b><span id="todayInfo"></span></span>'+NLI.svg("next",24)+'</button>'+
'    <div class="vt-sub" id="todaySub"></div>'+
'    <div class="boxes" id="boxes"></div>'+
'    <div class="sections vunits">'+units+'</div>'+
'    <div class="extra-row">'+
'      <button class="start-btn weak" id="weakBtn"><i>!</i><span class="sb-name">苦手<span class="sb-desc" id="weakCount"></span></span></button>'+
'      <button class="start-btn summary" id="extraBtn"><i>'+NLI.svg("again",16)+'</i><span class="sb-name">前倒しで練習<span class="sb-desc">箱は上がりません</span></span></button>'+
'    </div>'+
'    <div id="goal"></div>'+
'    <div class="section-label">このカードのしくみ</div><div class="memos">'+
'      <details class="memo"><summary>忘れかけたころに、もう一度</summary><div class="memo-body">'+
'        <p>人は覚えたことを、1日後にはかなり忘れてしまいます（エビングハウスの忘却曲線）。でも、忘れかけたころに思い出しなおすと、次はもっと長く覚えていられます。</p>'+
'        <p>そこで単語ごとに<b>箱</b>を用意しました。正解するたびに箱が1つ上がり、次の復習までの間が <b>翌日 → 3日後 → 1週間後 → 2週間後 → 1か月後</b> とのびていきます。箱6まで来たら<b>定着</b>です。</p>'+
'        <p>まちがえた単語は箱1（翌日）にもどります。まだ復習の日が来ていない単語は、正解しても箱は上がりません。間をあけることに意味があるからです。</p></div></details>'+
'      <details class="memo"><summary>見るより、思い出す</summary><div class="memo-body">'+
'        <p>答えを見て「わかった」と思うより、答えを見る前に自分で思い出そうとするほうが、記憶に残ります（テスト効果）。まちがえても大丈夫。思い出そうとした分だけ、正しい答えが頭に入りやすくなります。</p>'+
'        <p>まちがえた単語は、3枚ほどあとにもう一度出ます。正解できるまで、その回の練習は終わりません。</p></div></details>'+
'      <details class="memo"><summary>わかる → 言える・書ける</summary><div class="memo-body">'+
'        <p>意味がわかること（受容）と、自分で言える・書けること（産出）は別の力です。箱1では意味を選び、箱2ではフランス語を選び、箱3からは書いて答えます。耳で聞いて書く問題もあります。</p>'+
'        <p>名詞は<b>冠詞といっしょに</b>覚えましょう（le livre、la clé）。l\' がつく語は un / une で性をたしかめます。例文の中で覚えると、使い方もいっしょに身につきます。</p></div></details>'+
'    </div>'+
'  </div>'+
'  <div class="panel hidden" id="quizScreen">'+
'    <div class="topbar"><button class="back" id="backBtn" aria-label="ホームに戻る">←</button>'+
'      <button class="au-tg" id="auBtn" aria-label="自動で読み上げ" title="自動で読み上げ"></button><div class="qcount" id="qcount"></div></div>'+
'    <div class="bar"><div class="fill" id="fill"></div></div>'+
'    <div class="chiprow"><span class="verb-chip" id="qType"></span></div>'+
'    <div class="vcard" id="vcard"></div>'+
'    <div id="stage"></div>'+
'    <div class="fb" id="fb"></div>'+
'    <div class="after hidden" id="after"></div>'+
'  </div>'+
'  <div class="panel hidden result" id="resultScreen">'+
'    <div class="face" id="rFace">◎</div>'+
'    <div class="ring" id="rScore">0<small> / 10</small></div>'+
'    <div><span class="pct-pill" id="rPct">0%</span></div>'+
'    <div class="msg" id="rMsg"></div><div class="vmove" id="rMove"></div>'+
'    <button class="play again" id="againBtn" aria-label="つづける" title="つづける">'+NLI.svg("next",26)+'<span class="btn-t" id="againT">つづける</span></button>'+
'    <button class="home-link ic wide" id="toHomeBtn" aria-label="もどる" title="もどる">'+NLI.svg("back",22)+'<span class="btn-t">もどる</span></button>'+
'    <div class="review" id="review"></div>'+
'  </div>'+
'</div>';
}
let homeScreen,quizScreen,resultScreen;
function show(el){[homeScreen,quizScreen,resultScreen].forEach(s=>s.classList.add("hidden"));el.classList.remove("hidden");try{window.scrollTo(0,0);}catch(e){}}
function setAccent(k){
  const b=document.body.style,u=k&&k!=="today"&&k!=="weak"&&k!=="extra"?unitOf(k):null;
  if(!u){b.removeProperty("--accent");b.removeProperty("--accent-ink");b.removeProperty("--accent-wash");return;}
  b.setProperty("--accent",u.c);b.setProperty("--accent-ink",u.ci);b.setProperty("--accent-wash",u.cw);
}
function fmtDur(ms){const m=Math.round((ms||0)/60000);return m<60?m+"分":Math.floor(m/60)+"時間"+(m%60?m%60+"分":"");}
function inDays(n){return n<=0?"今日":n===1?"明日":n<7?n+"日後":n<14?"1週間後":n<30?"2週間後":n<60?"1か月後":"2か月後";}
/* 箱ごとの単語の数（積み上げの帯） */
function meterHTML(list){
  const N=list.length||1,by=[0,0,0,0,0,0,0];list.forEach(w=>by[lv(w)]++);
  let h='<span class="vbar" role="img" aria-label="達成 '+pctOf(list)+'%">';
  for(let l=6;l>=1;l--)if(by[l])h+='<span class="vb b'+l+'" style="width:'+(by[l]/N*100)+'%"></span>';
  return h+'</span><span class="gm-v'+(pctOf(list)>=100?' full':'')+'">'+pctOf(list)+'<small>%</small></span>';
}
function boxesHTML(){
  const by=[0,0,0,0,0,0,0];WORDS.forEach(w=>by[lv(w)]++);
  const mx=Math.max(1,...by.slice(1));
  let h='<div class="bx-h"><span>記憶の箱</span><small>正解するたびに右の箱へ</small></div><div class="bx-row">';
  for(let l=1;l<=6;l++)h+='<div class="bx b'+l+'"><div class="bx-col"><span class="bx-fill" style="height:'+Math.round(by[l]/mx*100)+'%"></span></div><b>'+by[l]+'</b><span>'+(l===6?"定着":"箱"+l)+'</span><small>'+(l===6?"":BOX_L[l])+'</small></div>';
  return h+'</div><div class="bx-new">まだ出会っていない語 <b>'+by[0]+'</b></div>';
}
/* バッジ：単元の単語がすべて箱4以上（2週間たっても思い出せた）→ 単元バッジ ／ 全部定着 → 勲章 */
let fresh={};
function badgeTargets(){
  const out=VOCAB_UNITS.map(u=>{const L=WORDS.filter(w=>w.u===u.k);return {key:"u:"+u.k,kind:"sec",color:u.c,name:u.t,done:L.length&&L.every(w=>lv(w)>=4)};});
  out.push({key:"medal",kind:"medal",name:"全単語 定着",done:WORDS.every(w=>lv(w)>=6)});
  return out;
}
function awardBadges(){const got=badgeTargets().filter(b=>b.done&&!store.badges[b.key]);got.forEach(b=>{store.badges[b.key]=Date.now();fresh[b.key]=1;});if(got.length)save();return got;}
function renderShelf(){
  if(!window.Badge)return "";
  const B=store.badges||{};
  const items=VOCAB_UNITS.map(u=>{const L=WORDS.filter(w=>w.u===u.k);return {kind:"sec",on:!!B["u:"+u.k],fresh:!!fresh["u:"+u.k],color:u.c,pct:L.filter(w=>lv(w)>=4).length/L.length,label:u.k==="N"?"#":u.k.slice(1),cap:u.k==="N"?"数":u.k.slice(1),title:u.t};});
  const m=WORDS.filter(w=>lv(w)>=6).length;
  const big=[{kind:"medal",on:!!B.medal,fresh:!!fresh.medal,pct:m/WORDS.length,cap:"勲章",status:B.medal?"全単語 定着":"定着 "+m+" / "+WORDS.length}];
  fresh={};
  return Badge.shelf({title:"単元バッジ（すべて箱4以上）",items,big});
}
function renderHome(){
  const c=counts("today");
  $("hLearn").textContent=c.learn;$("hDone").textContent=c.done;
  $("hPct").innerHTML=pctOf(WORDS)+'<small>%</small>';$("hTime").textContent=fmtDur(store.timeMs);
  const nNew=Math.min(NEW_PER,Math.max(0,ROUND-c.due),Math.max(0,NEW_DAY-newToday()),c.fresh);
  $("todayInfo").innerHTML=c.due||nNew?('復習 <b>'+c.due+'</b>　新しい語 <b>'+nNew+'</b>'):'今日の分はおしまい';
  $("todayBtn").classList.toggle("quiet",!c.due&&!nNew);
  $("todaySub").innerHTML=(c.tom?'明日の復習 '+c.tom+'語':'')+(newToday()>=NEW_DAY?'　新しい語は1日'+NEW_DAY+'語まで（また明日）':'');
  $("boxes").innerHTML=boxesHTML();
  VOCAB_UNITS.forEach(u=>{
    const L=WORDS.filter(w=>w.u===u.k),k=counts(u.k);
    const el=document.querySelector('[data-prog="'+u.k+'"]');if(!el)return;
    el.innerHTML=(k.due?'<span class="vdue" title="今日の復習">'+k.due+'</span>':'')+'<span>'+k.firm+'/'+L.length+'</span>';
    el.parentNode.classList.toggle("mastered",!!(store.badges||{})["u:"+u.k]);
    const g=document.querySelector('[data-gm="'+u.k+'"]');if(g)g.innerHTML=meterHTML(L);
  });
  const wk=weakList().length;$("weakCount").textContent=wk?wk:"";$("weakBtn").disabled=!wk;
  $("extraBtn").disabled=!WORDS.some(w=>lv(w)>=1);
  $("goal").innerHTML=renderShelf();
  saveSum();
  const s=$("streak");if(s&&window.Quiz)s.innerHTML=Quiz.streakHTML();
}

/* ---------- 練習 ---------- */
function startSession(sc){
  scope=sc;setAccent(sc);
  if(typeof ensureAudio==="function"){ensureAudio();if(actx&&actx.state==="suspended")actx.resume();playStart();}
  queue=buildSession(sc);
  if(!queue.length){renderHome();return;}
  pos=0;done=0;t0=performance.now();
  sess={first:{},order:[],moved:{},newN:0};
  queue.slice(0,3).forEach(t=>preload(t.w));
  show(quizScreen);render();
}
const FMT_L={intro:"新しい単語",fj:"意味を選ぶ",lj:"聞いて意味を選ぶ",jf:"フランス語を選ぶ",w:"書いて答える",dw:"聞いて書く"};
function auIcon(){$("auBtn").innerHTML=NLI.svg("speaker",18);$("auBtn").classList.toggle("off",!store.au);}
function render(){
  clearTimeout(autoNext);locked=false;
  cur=queue[pos];
  if((cur.fmt==="lj"||cur.fmt==="dw")&&!audioReady())cur.fmt=cur.fmt==="lj"?"fj":"w";   // 音が出せない状態なら、聞く問題は文字の問題に
  const w=cur.w,f=cur.fmt;cur.t0=performance.now();
  const total=done+queue.length-pos;
  $("qcount").textContent=(done+1)+" / "+total;
  $("fill").style.width=(done/total*100)+"%";
  $("qType").textContent=(cur.rep?"もう一度　":"")+FMT_L[f];
  $("fb").className="fb";$("fb").textContent="";
  const a=$("after");a.classList.add("hidden");a.innerHTML="";
  const card=$("vcard"),stg=$("stage");
  card.className="vcard"+(f==="intro"?" vback intro":"");
  NLI.slide(card);
  if(queue[pos+1])preload(queue[pos+1].w);
  if(f==="intro"){
    card.innerHTML='<span class="vc-new">NEW</span>'+backHTML(w);
    stg.innerHTML='<div class="btns nx"><button class="next-btn" id="nextBtn" aria-label="覚えた" title="覚えた">'+NLI.svg("next",28)+'</button></div>';
    $("nextBtn").onclick=()=>{if(locked)return;locked=true;introDone();};
    if(store.au)play(w,false,250);
    return;
  }
  const posL=POS_L[w.p]||"";
  if(f==="fj"){card.innerHTML='<div class="vc-pos">'+posL+'</div><div class="vc-big fr">'+esc(head(w))+'</div>'+spk("sm",w.id,0,"もう一度聞く");if(store.au)play(w,false,200);}
  else if(f==="lj"||f==="dw"){card.innerHTML='<div class="vc-pos">'+(f==="lj"?"聞いて、意味を選ぼう":"聞こえたとおりに書こう")+'</div>'+spk("big",w.id,0,"聞く");
    const me=cur;play(w,false,250).then(ok=>{if(!ok&&cur===me&&me.ok==null){me.fmt=f==="lj"?"fj":"w";render();}});}   // 録音が読みこめないときは、文字で出す
  else{card.innerHTML='<div class="vc-pos">'+posL+(w.p==="num"?'':'')+'</div><div class="vc-big ja">'+esc(w.ja)+'</div>'+
    (f==="w"?'<div class="vc-hint">'+writeHint(w)+'</div>':'');}
  if(f==="fj"||f==="lj"){
    cur.opts=jaOpts(w);optsHTML(cur.opts,o=>o===w.ja,true);
  }else if(f==="jf"){
    const ok=shortForm(w);cur.opts=frOpts(w);optsHTML(cur.opts,o=>nz(o)===nz(ok),false);
  }else{
    stg.innerHTML='<div class="write-box"><input type="text" id="writeInput" class="write-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="フランス語で">'+
      '<button class="write-btn" id="writeBtn">解答</button></div><div class="hint" id="hintLine"></div>';
    const inp=$("writeInput");
    $("writeBtn").onclick=()=>checkWrite();
    inp.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.isComposing){e.preventDefault();e.stopPropagation();if(!locked)checkWrite();}});
    setTimeout(()=>{try{inp.focus({preventScroll:true});}catch(e){}},40);
  }
}
function writeHint(w){
  if(isN(w)&&!w.noArt)return "冠詞（le / la / un / une）もつけて";
  if(w.p==="a")return "男性形で（女性形でもOK）";
  if(w.p==="v"&&/^(se |s')/.test(w.fr))return "代名動詞の不定詞で（se …）";
  if(w.p==="v")return "不定詞（原形）で";
  if(w.p==="num")return "つづりで";
  return "";
}
function optsHTML(opts,isOk,ja){
  const long=opts.some(o=>o.length>12);
  $("stage").innerHTML='<div class="opts'+(long?' long':'')+(ja?' ja':'')+'" id="opts"></div>';
  const box=$("opts");
  opts.forEach((o,i)=>{
    const b=document.createElement("button");b.className="opt";b.dataset.i=i;
    b.innerHTML=(long?'<span class="k">'+(i+1)+'</span>':'')+esc(o);
    b.onclick=()=>{if(locked)return;
      box.querySelectorAll(".opt").forEach(x=>{x.disabled=true;const v=opts[+x.dataset.i];
        if(isOk(v))x.classList.add("correct");else if(x===b)x.classList.add("wrong");else x.classList.add("dim");});
      grade(isOk(o)?2:0,o);};
    box.appendChild(b);
  });
}
function checkWrite(){
  if(locked)return;
  const inp=$("writeInput"),val=inp.value;if(!val.trim()){inp.focus();return;}
  const j=judgeW(val,cur.w);
  if(!j.r&&j.why==="art"&&!cur.artAsked){   // 冠詞がないだけなら、もう一度書いてもらう（まちがいにはしない）
    cur.artAsked=true;$("hintLine").innerHTML='<span class="art-ask">'+NLI.svg("pencil",15)+' 冠詞もつけて書いてみよう（例：le / la / l\' / un / une）</span>';
    inp.classList.remove("shake");void inp.offsetWidth;inp.classList.add("shake");inp.focus();return;
  }
  inp.disabled=true;$("writeBtn").disabled=true;inp.classList.add(j.r?"ok":"no");
  cur.why=j.why;grade(j.r,val.trim());
}
function introDone(){
  const w=cur.w;sess.order.push(w);
  /* 出会ったら、3枚あとで思い出すテスト */
  queue.splice(Math.min(pos+3,queue.length),0,task(w,"test"));
  done++;pos++;next0();
}
/* 採点。箱の動き：
   ・はじめての単語：出会いのあとのテストで正解 → 箱1（翌日に復習）
   ・復習の日が来た単語：1回目で正解 → 箱を1つ上げ、次の復習日を先へ
   ・まちがえた → 箱1へ（翌日に復習）。この回のうちに、3枚あとでもう一度
   ・前倒し・苦手の練習で正解：箱はそのまま（まちがえたら箱1へ） */
function grade(r,chosen){
  if(locked)return;locked=true;
  const w=cur.w,d=today(),ok=r>0,firstTry=!(w.id in sess.first);
  cur.ok=ok;cur.chosen=chosen;cur.accent=r===1;
  const s=store.it[w.id]||{l:0,d:d,w:0,t:0};
  const before=s.l;
  if(firstTry){sess.first[w.id]=ok;if(sess.order.indexOf(w)<0)sess.order.push(w);}
  if(ok){
    if(cur.kind==="test"&&before===0){s.l=1;s.d=d+INT[1];if(store.nd.d!==d)store.nd={d,n:0};store.nd.n++;sess.newN++;}
    else if(cur.kind==="due"&&firstTry){s.l=Math.min(6,s.l+1);s.d=d+INT[s.l];}
  }else{
    s.l=1;s.d=d+INT[1];s.w=(s.w||0)+1;
    if(cur.kind==="test"&&before===0){if(store.nd.d!==d)store.nd={d,n:0};store.nd.n++;sess.newN++;}
    /* その場で覚えなおし：3枚あとにもう一度（同じ回のうちに4回まで） */
    if(cur.rep<4){const t=task(w,"re",cur.fmt==="dw"?"w":cur.fmt==="lj"?"fj":cur.fmt);t.rep=cur.rep+1;queue.splice(Math.min(pos+4,queue.length),0,t);}
  }
  s.t=d;store.it[w.id]=s;
  if(firstTry)sess.moved[w.id]={from:before,to:s.l,ok};
  else if(sess.moved[w.id])sess.moved[w.id].to=s.l;
  save();
  const fb=$("fb");
  if(ok){fb.className="fb show ok";fb.textContent=pick(["Bien !","Très bien !","Parfait !","Exact !","Bravo !"]);if(typeof playCorrect==="function")playCorrect();}
  else{fb.className="fb show no";fb.textContent=cur.why==="gender"?"性がちがう…":pick(["Pas tout à fait…","Presque !","Attention…"]);if(typeof playWrong==="function")playWrong();}
  setTimeout(()=>flip(s,before),cur.fmt==="w"||cur.fmt==="dw"?60:380);
}
/* カードを裏返して、答え・性・例文・次の復習日を見せる */
function backHTML(w,showLv,s,before){
  const extra=[];
  if(w.pl)extra.push('複数 <span class="fr">'+esc(w.pl)+'</span>');
  if(w.mf)extra.push('母音の前の男性形 <span class="fr">'+esc(w.mf)+'</span>');
  if(isN(w)&&!w.noArt&&nForms(w)[0].g!=="p"&&VOW.test(nForms(w)[0].s))extra.push('<span class="fr">'+esc(nForms(w).map(f=>indArt(f.g)+f.s).join(" / "))+'</span>');
  const ex=esc(w.ex).replace(/\[([^\]]+)\]/g,'<mark>$1</mark>');
  return '<div class="vc-head">'+gChip(w)+'<span class="vc-fr">'+esc(head(w))+'</span>'+spk("sm",w.id,0,"単語を聞く")+'</div>'+
    '<div class="vc-ja2">'+esc(w.ja)+'<span class="vc-p">'+esc(POS_L[w.p]||"")+'</span></div>'+
    (extra.length?'<div class="vc-extra">'+extra.join("　")+'</div>':'')+
    '<div class="vc-ex">'+spk("sm",w.id,1,"例文を聞く")+'<div><div class="fr">'+ex+'</div><div class="vc-exj">'+esc(w.exj)+'</div></div></div>'+
    (showLv?lvHTML(s,before):'');
}
function lvHTML(s,before){
  const up=s.l>before,dn=s.l<before&&before>0;
  return '<div class="vc-lv'+(up?' up':dn?' dn':'')+'"><span class="lvb">'+[1,2,3,4,5,6].map(i=>'<i class="'+(i<=s.l?"on":"")+(up&&i===s.l?" new":"")+'"></i>').join("")+'</span>'+
    '<span class="lvt">'+(s.l>=6?"定着！":"箱"+s.l)+'　次の復習：'+inDays(s.d-today())+'</span></div>';
}
function flip(s,before){
  const w=cur.w,card=$("vcard");
  card.classList.add("flip-out");
  setTimeout(()=>{
    card.className="vcard vback flip-in";
    card.innerHTML=backHTML(w,true,s,before);
    let h="";
    if(cur.accent)h+='<div class="heard nl-badge">アクセント記号に注意：<b class="fr">'+esc(nearest(w,cur.chosen))+'</b></div>';
    if(!cur.ok&&cur.chosen!=null)h+='<div class="heard nl-badge"><span style="color:var(--bad-ink)">'+NLI.svg("x",15)+'</span><s>'+esc(cur.chosen)+'</s>'+(cur.why==="gender"?'<span class="why">'+(nForms(w)[0].g==="m"?"男性名詞":"女性名詞")+'</span>':'')+'</div>';
    if(!cur.ok)h+='<div class="again-note">'+NLI.svg("again",15)+' このあと、もう一度出ます</div>';
    if(!cur.ok&&(cur.fmt==="w"||cur.fmt==="dw"))h+='<div class="retype"><span class="rt-l">'+NLI.svg("pencil",15)+'正しい形を書いて覚えよう</span><input type="text" id="rtIn" class="write-input rt-in" autocomplete="off" autocapitalize="off" spellcheck="false"><span class="rt-ok" id="rtOk"></span></div>';
    const last=pos+1>=queue.length;
    h+='<div class="btns nx"><button class="next-btn" id="nextBtn" aria-label="'+(last?"結果を見る":"次へ")+'">'+NLI.svg(last?"flag":"next",28)+'</button></div>';
    const a=$("after");a.innerHTML=h;a.classList.remove("hidden");
    $("stage").innerHTML="";
    $("nextBtn").onclick=nextCard;
    if(store.au&&cur.fmt!=="fj")play(w,false,320);
    const rt=$("rtIn");
    if(rt){setTimeout(()=>{try{rt.focus({preventScroll:true});}catch(e){}},80);
      rt.addEventListener("keydown",e=>{if(e.key!=="Enter"||e.isComposing)return;e.preventDefault();e.stopPropagation();
        if(judgeW(rt.value,w).r>0){rt.classList.add("ok");rt.disabled=true;$("rtOk").innerHTML=NLI.svg("star",18);$("rtOk").classList.add("on");
          if(typeof playCorrect==="function")try{playCorrect();}catch(er){}
          setTimeout(()=>{const b=$("nextBtn");if(b)b.focus();},250);}
        else{rt.classList.remove("shake");void rt.offsetWidth;rt.classList.add("shake");}});}
    if(cur.ok&&!cur.accent&&window.Quiz&&Quiz.autoNext&&Quiz.autoNext())autoNext=setTimeout(nextCard,Quiz.nextDelay?Quiz.nextDelay(2200):2200);   // 例文を読む・聞く時間を少し長めに
  },170);
}
function nearest(w,input){const A=answers(w);return A.find(a=>nz(a)===nz(input))||A[0];}
function nextCard(){clearTimeout(autoNext);if(!cur||cur.ok==null)return;done++;pos++;next0();}
function next0(){if(pos<queue.length)render();else finish();}

/* ---------- 結果 ---------- */
function finish(){
  const time=performance.now()-t0,d=today();
  const ids=Object.keys(sess.first),N=ids.length,C=ids.filter(k=>sess.first[k]).length;
  if(N){
    store.tries++;store.answered+=N;store.correct+=C;
    store.timeMs=(store.timeMs||0)+Math.max(60000,Math.min(time,N*90000));
    if(store.best===null||C>store.best)store.best=C;
    save();if(window.Quiz)Quiz.markToday();
  }
  const pct=N?Math.round(C/N*100):100;
  $("rScore").innerHTML=C+'<small> / '+N+'</small>';$("rPct").textContent=pct+"%";
  $("rFace").textContent=pct>=80?"◎":pct>=50?"△":"✕";$("rFace").classList.remove("nl-pop");void $("rFace").offsetWidth;$("rFace").classList.add("nl-pop");
  $("rMsg").textContent=(pct===100?"全問正解！":pct>=80?"クリア！":pct>=50?"あと少し！":"よく思い出そうとしたね")+(N&&C<N?"　まちがえた語も、最後は正解するまで練習しました":"");
  const M=Object.values(sess.moved),up=M.filter(m=>m.ok&&m.from>0&&m.to>m.from).length,nw=sess.newN,back=M.filter(m=>!m.ok).length;
  const c=counts("today");
  $("rMove").innerHTML=
    (nw?'<span class="mv nw">'+NLI.svg("star",14)+' 新しい語 <b>'+nw+'</b></span>':'')+
    (up?'<span class="mv up">↑ 箱が上がった <b>'+up+'</b></span>':'')+
    (back?'<span class="mv dn">'+NLI.svg("again",14)+' 明日もう一度 <b>'+back+'</b></span>':'')+
    '<div class="mv-next">'+(c.due?'まだ今日の復習が <b>'+c.due+'</b> 語あります':c.tom?'明日の復習は <b>'+c.tom+'</b> 語。忘れかけたころに、また会いましょう':'')+'</div>';
  $("againT").textContent=c.due?"つづけて復習":"もう一度";
  /* 今回の単語（まちがえた語を先に）：次の復習日つき */
  const order=sess.order.slice().sort((a,b)=>(sess.first[a.id]?1:0)-(sess.first[b.id]?1:0));
  let h='<div class="ttl">今回の単語</div>';
  order.forEach(w=>{const ok=sess.first[w.id],s=st(w);
    h+='<div class="rrow'+(ok?' okrow':'')+'"><span class="mk '+(ok?'ok':'no')+'">'+(ok?'○':'✕')+'</span><span class="rtx">'+
      '<span class="rfr">'+gChip(w)+esc(head(w))+' '+spk("sm",w.id,0,"聞く")+'</span><span class="rja">'+esc(w.ja)+'</span>'+
      '<span class="rex">'+esc(w.ex.replace(/[\[\]]/g,""))+'　'+esc(w.exj)+'</span>'+
      (s?'<span class="rnext">'+(s.l>=6?'定着':'箱'+s.l)+'・次の復習 '+inDays(s.d-d)+'</span>':'')+'</span></div>';});
  $("review").innerHTML=h;
  const newB=awardBadges();
  show(resultScreen);
  if(pct>=80&&N&&typeof playFanfare==="function")setTimeout(playFanfare,280);
  if(newB.length&&window.Badge)setTimeout(()=>Badge.celebrate(newB),pct>=80?1900:500);
  if(N&&window.Quiz)Quiz.submit("vocab",{section:"W-"+scope,mode:"srs",durMs:Math.round(time),score:C,total:Math.min(N,50),timeAttack:false,timeMs:null,
    misses:order.filter(w=>!sess.first[w.id]).map(w=>({full:w.ja,verb:w.u,chosen:"",answer:head(w)}))});
}
/* 問題の報告用（feedback.js） */
window.FB_QUESTIONS=function(){
  if(!queue.length)return [];
  const out=[],seen=new Set();
  for(let i=Math.min(pos,queue.length-1);i>=0&&out.length<12;i--){const w=queue[i].w;if(seen.has(w.id))continue;seen.add(w.id);
    out.push({label:head(w)+"（"+w.ja+"）",detail:"単語カード／"+unitOf(w.u).t+"（単語ID "+w.id+"）\n見出し："+head(w)+"\n意味："+w.ja+"\n例文："+w.ex.replace(/[\[\]]/g,"")+"／"+w.exj});}
  return out;
};
function goHome(){clearTimeout(autoNext);playTok++;setAccent(null);renderHome();show(homeScreen);}

/* ---------- 起動 ---------- */
function init(){
  if(window.Quiz){if(!Quiz.requireLogin())return;Quiz.refresh();}
  WHO=(window.Quiz&&Quiz.user())?Quiz.user().id:"guest";
  KEY="vocabQuiz_v1_"+WHO;store=load();
  if(!store.badges||!store.bInit){store.badges=store.badges||{};awardBadges();fresh={};store.bInit=1;save();}
  $("app").innerHTML=shell();
  homeScreen=$("homeScreen");quizScreen=$("quizScreen");resultScreen=$("resultScreen");
  $("todayBtn").onclick=()=>startSession("today");
  document.querySelectorAll(".vunits .start-btn").forEach(b=>b.onclick=()=>startSession(b.dataset.u));
  $("weakBtn").onclick=()=>startSession("weak");$("extraBtn").onclick=()=>startSession("extra");
  $("againBtn").onclick=()=>startSession(counts("today").due&&scope!=="weak"?"today":scope);
  $("backBtn").onclick=goHome;$("toHomeBtn").onclick=goHome;
  $("auBtn").onclick=()=>{store.au=store.au?0:1;save();auIcon();};auIcon();
  document.addEventListener("keydown",e=>{
    if(quizScreen.classList.contains("hidden")||!cur)return;
    if(cur.fmt==="intro"){if(e.key==="Enter"&&!locked){e.preventDefault();locked=true;introDone();}return;}
    if(cur.ok!=null){if(e.key==="Enter"){e.preventDefault();nextCard();}return;}
    if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;
    if(/^[1-4]$/.test(e.key)){const b=document.querySelectorAll("#opts .opt")[+e.key-1];if(b&&!b.disabled)b.click();}
  });
  const hm=/^#(today|weak|extra|L[1-6]|N)$/.exec(location.hash||"");
  renderHome();
  if(hm){try{history.replaceState(null,"",location.pathname+location.search);}catch(e){}startSession(hm[1]);return;}
  show(homeScreen);
}
window.VOCAB={WORDS,judgeW,answers,head,shortForm,frOpts,jaOpts,buildSession,today,get queue(){return queue;},get pos(){return pos;},get cur(){return cur;},get store(){return store;}};
document.addEventListener("DOMContentLoaded",init);
})();
