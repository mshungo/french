/* ============================================================
   文法練習エンジン（各 Leçon のページが読み込む）
   各ページでは、このファイルのあとに LESSON（課の情報）と問題を書く。
     C(セクション, 問題文, 正解, [選択肢], 解説, {ja, cw:false})   選択（記述式モードでは書いて答える）
     W(セクション, 問題文, 正解 or [別解...], 解説, {ja})          書いて答える
     T(セクション, 指示, 元の文, 正解 or [別解...], 解説)          文の書きかえ
     B(セクション, 日本語, 正解の文, [まぎらわしい札], 解説)        並べかえ（仏作文）
   問題文の ___ が空欄になる。
   ============================================================ */
(function(){
"use strict";
const ITEMS=[];
function add(o){o.id=(window.LESSON?window.LESSON.no:0)+"-"+ITEMS.length;ITEMS.push(o);}
function arr(a){return Array.isArray(a)?a:[a];}
window.C=function(sec,q,a,o,ex,x){add(Object.assign({t:"c",sec,q,a:[a],o,ex},x||{}));};
window.W=function(sec,q,a,ex,x){add(Object.assign({t:"w",sec,q,a:arr(a),ex},x||{}));};
window.T=function(sec,inst,src,a,ex,x){add(Object.assign({t:"t",sec,inst,src,a:arr(a),ex},x||{}));};
window.B=function(sec,ja,a,extra,ex,x){add(Object.assign({t:"b",sec,ja,a:[a],extra:extra||[],ex},x||{}));};

const ROUND=10;
const CLEAR_ANS=300;      // 累計解答数がこれに達したら「クリア」（約1時間の練習の目安）
const FAST_MS=5000;       // 記述で5秒以内に正解したら、その場で「習得」
const $=id=>document.getElementById(id);
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}

/* ---------- 照合 ---------- */
function nz(s,keepAcc){
  s=String(s||"").replace(/[’ʼ`´]/g,"'").replace(/ /g," ")
    .replace(/\s*-\s*/g,"-").replace(/\s*'\s*/g,"'")
    .replace(/\s+([?!:;,.])/g,"$1").replace(/\s+/g," ").trim()
    .replace(/[.!?]+$/,"").trim().toLowerCase();
  if(!keepAcc)s=s.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/œ/g,"oe");
  return s;
}
/* 戻り値：2=完全一致、1=アクセント記号だけ違う、0=不正解 */
function judge(input,answers){
  if(answers.some(a=>nz(input,true)===nz(a,true)))return 2;
  if(answers.some(a=>nz(input)===nz(a)))return 1;
  return 0;
}

/* ---------- 並べかえの札 ---------- */
const PRON=/^(.+?)(-t-(?:il|elle|on)|-(?:vous|tu|moi|toi|on|je|il|elle|ils|elles|nous))$/i;
function tiles(s,cap){
  let t=s.trim(),end="";
  const m=t.match(/\s*([.!?]+)$/);if(m){end=m[1];t=t.slice(0,m.index);}
  const words=[];
  t.split(/\s+/).filter(Boolean).forEach((w,i)=>{
    if(i===0&&!cap)w=w.charAt(0).toLowerCase()+w.slice(1);
    const p=w.match(PRON);
    if(p&&!/^est-ce$/i.test(w)){words.push(p[1]);words.push(p[2]);}else words.push(w);
  });
  return {words,end};
}
function joinTiles(ws){
  const s=ws.join(" ").replace(/ -/g,"-");
  return s.charAt(0).toUpperCase()+s.slice(1);
}

/* ---------- 記録 ---------- */
let L,store,KEY,WHO;
function load(){
  try{const r=JSON.parse(localStorage.getItem(KEY));if(r&&typeof r.tries==="number"){r.it=r.it||{};return r;}}catch(e){}
  return {tries:0,answered:0,correct:0,best:null,it:{},mode:"choice",timeMs:0};
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}}
function st(it){const s=store.it[it.id]||{c:0,w:0,last:null};if(s.run==null)s.run=(s.last===1?Math.min(s.c,1):0);return s;}
/* 習得：2回連続正解、または記述で5秒以内に正解（苦手が付いていない問題のみ） */
function mastered(it){const s=st(it);return !s.wk&&(s.run>=2||s.m===true);}
/* 苦手：間違えたら付き、2回連続で正解するまで消えない */
function weak(it){return !!st(it).wk;}
function fmtDur(ms){const m=Math.round((ms||0)/60000);if(m<60)return m+"分";return Math.floor(m/60)+"時間"+(m%60?(m%60)+"分":"");}
function pctMastered(){return ITEMS.length?Math.round(ITEMS.filter(mastered).length/ITEMS.length*100):0;}
/* ---------- バッジ ----------
   項目（セクション）の問題をすべて習得 → 項目バッジ ／ 累計300問 → クリア ／ 全問習得 → 勲章
   一度もらったバッジは、あとで苦手が付いても消えない */
let fresh={};
function badgeTargets(){
  const out=L.sections.map(s=>{const list=itemsOf(s.k);return {key:"s:"+s.k,kind:"sec",color:s.c,name:s.t,
    done:list.length>0&&list.every(mastered),sub:"この項目の "+list.length+" 問をすべて習得しました"};});
  out.push({key:"clear",kind:"clear",name:"Leçon "+L.no+" クリア",done:store.answered>=CLEAR_ANS,sub:"累計 "+CLEAR_ANS+" 問の練習を達成しました"});
  out.push({key:"medal",kind:"medal",name:"Leçon "+L.no+" 勲章",done:ITEMS.length>0&&ITEMS.every(mastered),sub:"全 "+ITEMS.length+" 問を習得しました"});
  return out;
}
/* まだ持っていないバッジのうち、条件を満たしたものを付与して返す */
function awardBadges(){
  store.badges=store.badges||{};
  const got=badgeTargets().filter(b=>b.done&&!store.badges[b.key]);
  got.forEach(b=>{store.badges[b.key]=Date.now();fresh[b.key]=1;});
  if(got.length)save();
  return got;
}
function renderShelf(){
  const B=store.badges||{},T=badgeTargets(),ans=store.answered;
  const items=L.sections.map((s,i)=>{const list=itemsOf(s.k),m=list.filter(mastered).length;
    return {kind:"sec",on:!!B["s:"+s.k],fresh:!!fresh["s:"+s.k],color:s.c,pct:list.length?m/list.length:0,label:i+1,cap:String(i+1),title:s.t};});
  const m=ITEMS.filter(mastered).length;
  const big=[
    {kind:"clear",on:!!B.clear,fresh:!!fresh.clear,pct:Math.min(1,ans/CLEAR_ANS),cap:"クリア",
     status:B.clear?"累計"+CLEAR_ANS+"問 達成":"あと "+Math.max(0,CLEAR_ANS-ans)+" 問"},
    {kind:"medal",on:!!B.medal,fresh:!!fresh.medal,pct:ITEMS.length?m/ITEMS.length:0,cap:"勲章",
     status:B.medal?"全問習得":"習得 "+m+" / "+ITEMS.length+" 問"}];
  fresh={};
  return window.Badge?Badge.shelf({title:"項目バッジ",items,big}):"";
}

function itemsOf(sec){
  if(sec==="mix")return ITEMS.slice();
  if(sec==="weak")return ITEMS.filter(weak);
  return ITEMS.filter(it=>it.sec===sec);
}

/* ---------- 画面の組み立て ---------- */
function shell(){
  const secBtns=L.sections.map((s,i)=>
    '<button class="start-btn" data-sec="'+s.k+'" style="--vc:'+s.c+';--vcw:'+s.cw+'"><i class="wk">'+(i+1)+'</i>'+
    '<span class="sb-name">'+esc(s.t)+'<span class="sb-desc">'+esc(s.d||"")+'</span></span>'+
    '<span class="sb-prog" data-prog="'+s.k+'"></span></button>').join("");
  const memos=L.sections.filter(s=>s.memo).map(s=>
    '<details class="memo"><summary>'+esc(s.t)+'</summary><div class="memo-body">'+s.memo+'</div></details>').join("");
  return ''+
'<div class="wrap">'+
'  <div class="crown"><div class="crest"><svg width="30" height="30" aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7.5c-1.2 5.5-1.3 11.4.8 15.6 2 4 10.4 4 12.4 0 2.1-4.2 2-10.1.8-15.6-3.1 2-10.9 2-14 0z"/><circle cx="12.8" cy="14.6" r="2.7"/><circle cx="19.2" cy="14.6" r="2.7"/><circle cx="12.8" cy="14.6" r=".8" fill="currentColor" stroke="none"/><circle cx="19.2" cy="14.6" r=".8" fill="currentColor" stroke="none"/><path d="M15.2 18.2l.8 1.5.8-1.5"/><path d="M12 23.2c1.3.8 2.7.8 4 0 1.3.8 2.7.8 4 0"/></svg></div><div class="eyebrow">Naralingo · Leçon '+L.no+'</div><h1>'+esc(L.title)+'</h1>'+
'    <span class="verbs">'+esc(L.sub||"")+'</span></div>'+
'  <div class="panel" id="homeScreen">'+
'    <div class="acct"><div class="row"><a class="link" href="grammar.html">← Leçon 一覧</a><div class="streak" id="streak"></div></div></div>'+
'    <p class="hello">Leçon '+L.no+' の練習<small>'+esc(L.lead||"")+'</small></p>'+
'    <div class="stat-grid">'+
'      <div class="stat"><div class="n" id="hTries">0</div><div class="l">挑戦回数</div></div>'+
'      <div class="stat acc"><div class="n" id="hAcc">—</div><div class="l">通算正答率</div></div>'+
'      <div class="stat"><div class="n" id="hMaster">0</div><div class="l">習得率</div></div>'+
'      <div class="stat"><div class="n" id="hTime">0分</div><div class="l">勉強時間</div></div>'+
'    </div>'+
'    <div id="goal"></div>'+
'    <div class="mode-row"><span class="mode-label">出題形式</span><div class="mode-toggle">'+
'      <button class="mode-btn" data-mode="choice">選択式</button><button class="mode-btn" data-mode="write">記述式</button></div></div>'+
'    <div class="guide"><b>選択式</b>は選択肢から選び、<b>記述式</b>は同じ問題を自分で書いて答えます。書きかえ・並べかえの問題はどちらでも出ます。<br>2回続けて正解すると「習得」（記述で<b>5秒以内</b>に正解なら一発で習得）。間違えた問題は「苦手」になり、2回続けて正解するまで残ります。<br>累計'+CLEAR_ANS+'問（約1時間）で<b>クリア</b>、全問習得で<b>勲章</b>。</div>'+
'    <div class="section-label">項目を選択</div>'+
'    <div class="sections">'+secBtns+'</div>'+
'    <div class="extra-row">'+
'      <button class="start-btn summary" id="mixBtn"><i>★</i><span class="sb-name">総まとめ<span class="sb-desc" id="mixProg"></span></span></button>'+
'      <button class="start-btn weak" id="weakBtn"><i>!</i><span class="sb-name">苦手を復習<span class="sb-desc" id="weakCount">なし</span></span></button>'+
'    </div>'+
(memos?'    <div class="section-label">文法のポイント</div><div class="memos">'+memos+'</div>':'')+
'    <button class="mini-reset" id="resetBtn">記録をリセット</button>'+
'  </div>'+
'  <div class="panel hidden" id="quizScreen">'+
'    <div class="topbar"><button class="back" id="backBtn" aria-label="ホームに戻る">←</button>'+
'      <div class="live-timer" id="liveTimer">0.0秒</div><div class="qcount" id="qcount">1 / 10</div></div>'+
'    <div class="hearts" id="hearts" style="justify-content:center;margin-bottom:14px;"></div>'+
'    <div class="round-label" id="roundLabel"></div>'+
'    <div class="bar"><div class="fill" id="fill"></div></div>'+
'    <div class="chiprow"><span class="verb-chip" id="qType"></span></div>'+
'    <div class="qtext" style="margin:10px 0 0" id="qSec"></div>'+
'    <div id="stage"></div>'+
'    <div class="fb" id="fb"></div>'+
'    <div class="after hidden" id="after"></div>'+
'    <div class="hint" id="hintLine"></div>'+
'  </div>'+
'  <div class="panel hidden result" id="resultScreen">'+
'    <div class="face" id="rFace">◎</div><h2>結果</h2>'+
'    <div class="ring" id="rScore">0<small> / 10</small></div>'+
'    <div><span class="pct-pill" id="rPct">0%</span></div>'+
'    <div class="msg" id="rMsg"></div><div class="rtime" id="rTime"></div><div class="mastery" id="rMastery"></div>'+
'    <div class="review" id="review"></div>'+
'    <button class="play again" id="againBtn">もう一度</button>'+
'    <button class="home-link" id="toHomeBtn">ホームにもどる</button>'+
'  </div>'+
'</div>';
}

/* ---------- 状態 ---------- */
let questions=[],idx=0,roundCorrect=0,locked=false,curSec="mix",curMode="choice";
let roundStart=0,timerHandle=null,autoNext=null;
let homeScreen,quizScreen,resultScreen;
function show(el){[homeScreen,quizScreen,resultScreen].forEach(s=>s.classList.add("hidden"));el.classList.remove("hidden");try{window.scrollTo(0,0);}catch(e){}}
function secInfo(k){return L.sections.find(s=>s.k===k)||{t:k==="mix"?"総まとめ":"苦手を復習",c:"#c0a06a",ci:"#9a7b45",cw:"#f8f1e4"};}
function setAccent(k){
  const s=k?secInfo(k):null,b=document.body.style;
  if(!s){b.removeProperty("--accent");b.removeProperty("--accent-ink");b.removeProperty("--accent-wash");return;}
  b.setProperty("--accent",s.c);b.setProperty("--accent-ink",s.ci||s.c);b.setProperty("--accent-wash",s.cw);
}
function fmtTime(ms){const s=ms/1000,m=Math.floor(s/60);return m>0?(m+"分"+(s-m*60).toFixed(0)+"秒"):(s.toFixed(1)+"秒");}

function renderHome(){
  $("hTries").textContent=store.tries;
  $("hAcc").textContent=store.answered?Math.round(store.correct/store.answered*100)+"%":"—";
  const m=ITEMS.filter(mastered).length;
  $("hMaster").innerHTML=pctMastered()+'<small>%</small>';
  $("hTime").textContent=fmtDur(store.timeMs);
  const B=store.badges||{};
  L.sections.forEach(s=>{
    const list=itemsOf(s.k),mm=list.filter(mastered).length,done=!!B["s:"+s.k];
    const el=document.querySelector('[data-prog="'+s.k+'"]');if(!el)return;
    el.parentNode.classList.toggle("mastered",done);
    el.innerHTML=done&&window.Badge?
      Badge.seal({kind:"sec",on:true,color:s.c,size:30})+'<span class="sb-done">習得 '+mm+'/'+list.length+'<small>Maîtrise</small></span>':
      '<span>習得 '+mm+'/'+list.length+'</span><span class="pbar"><span style="width:'+(list.length?Math.round(mm/list.length*100):0)+'%"></span></span>';
  });
  $("goal").innerHTML=renderShelf();
  $("mixProg").textContent="全"+ITEMS.length+"問から出題";
  const wk=itemsOf("weak").length;
  $("weakCount").textContent=wk?wk+"問":"なし";$("weakBtn").disabled=wk<1;
  document.querySelectorAll(".mode-btn[data-mode]").forEach(b=>b.classList.toggle("on",b.dataset.mode===curMode));
  const sEl=$("streak");
  if(sEl&&window.Quiz){const r=Quiz.streak();sEl.innerHTML='連続 '+r.n+'日'+(r.doneToday?' <small>今日済</small>':(r.n>0?' <small>今日はまだ</small>':''));}
}

/* ---------- 出題 ---------- */
/* 出題の順番
   1) 苦手（1ラウンド3問まで。「苦手を復習」では全部）
   2) まだ一度も解いていない問題 ← まずは一通り解くことを優先
   3) 1回だけ解いた問題（習得していないもの）
   4) 2回以上解いた問題・習得した問題（5秒以内に正解など）は「しばらくお休み」。他がなくなったら古い順に出す
   直近15分以内に出た問題は、ほかに出すものがある限り出さない。 */
const REST_MS=15*60*1000;
function attempts(it){const s=st(it);return (s.c||0)+(s.w||0);}
function buildRound(sec){
  const now=Date.now(),pool=itemsOf(sec),used=new Set(),out=[];
  const recent=it=>{const t=st(it).t;return t&&now-t<REST_MS;};
  const older=(a,b)=>(st(a).t||0)-(st(b).t||0);
  function take(list,max){for(const it of list){if(out.length>=ROUND||max<=0)break;if(used.has(it.id))continue;used.add(it.id);out.push(it);max--;}}
  const wk=shuffle(pool.filter(it=>weak(it)&&!recent(it)));
  take(wk,sec==="weak"?ROUND:3);
  take(shuffle(pool.filter(it=>attempts(it)===0)),ROUND);
  take(pool.filter(it=>attempts(it)===1&&!mastered(it)&&!weak(it)&&!recent(it)).sort(older),ROUND);
  take(pool.filter(it=>!recent(it)).sort(older),ROUND);           // お休み中の問題（古い順）
  take(pool.slice().sort(older),ROUND);                            // それでも足りなければ直近の問題も
  return shuffle(out.map(makeQ));
}
function makeQ(it){
  const q={it,ok:null};
  if(it.t==="c")q.kind=(curMode==="write"&&it.cw!==false)?"w":"c";
  else q.kind=it.t;
  if(q.kind==="c")q.options=shuffle(it.o.slice());
  if(q.kind==="b"){
    const m=tiles(it.a[0],it.cap);q.words=m.words;q.end=m.end;
    q.tiles=shuffle(m.words.concat(it.extra).map((w,i)=>({w,id:i})));
    if(q.tiles.length>1&&q.tiles.map(t=>t.w).join(" ")===m.words.join(" "))q.tiles.reverse();
  }
  return q;
}
const KIND_LABEL={c:"選んで答える",w:"書いて答える",t:"書きかえ",b:"並べかえ（仏作文）"};

function startRound(sec){
  curSec=sec;setAccent(sec);
  if(typeof ensureAudio==="function"){ensureAudio();if(actx&&actx.state==="suspended")actx.resume();playStart();}
  questions=buildRound(sec);if(!questions.length)return;
  idx=0;roundCorrect=0;
  $("roundLabel").textContent=secInfo(sec).t+" ／ "+(curMode==="choice"?"選択式":"記述式");
  show(quizScreen);
  roundStart=performance.now();clearInterval(timerHandle);
  timerHandle=setInterval(()=>{$("liveTimer").textContent=fmtTime(performance.now()-roundStart);},200);
  render();
}
function promptHTML(q,filled){
  const it=q.it;
  const blank=filled!=null?'<span class="blank filled">'+esc(filled)+'</span>':'<span class="blank">　</span>';
  return esc(it.q).replace("___",blank);
}
function render(){
  clearTimeout(autoNext);
  const q=questions[idx],it=q.it;q.t0=performance.now();locked=false;
  const N=questions.length;
  $("qcount").textContent=(idx+1)+" / "+N;
  $("fill").style.width=(idx/N*100)+"%";
  let dots="";for(let i=0;i<N;i++)dots+='<span class="pdot '+(i<idx?(questions[i].ok?"d-ok":"d-no"):(i===idx?"d-now":"d-todo"))+'"></span>';
  $("hearts").innerHTML=dots;
  $("qType").textContent=KIND_LABEL[q.kind];
  $("qSec").textContent=secInfo(it.sec).t+(mastered(it)?"　（習得済み）":"");
  $("fb").className="fb";$("fb").textContent="";
  const a=$("after");a.classList.add("hidden");a.innerHTML="";
  const stg=$("stage"),hint=$("hintLine");
  const ja=it.ja?'<div class="jp-hint">'+esc(it.ja)+'</div>':'';
  if(q.kind==="c"){
    const long=q.options.some(o=>o.length>14);
    stg.innerHTML='<div class="prompt gq">'+promptHTML(q)+'</div>'+ja+'<div class="opts'+(long?' long':'')+'" id="opts"></div>';
    const box=$("opts");
    q.options.forEach((opt,i)=>{
      const b=document.createElement("button");b.className="opt";b.dataset.val=opt;
      b.innerHTML=(long?'<span class="k">'+(i+1)+'</span>':'')+esc(opt);
      b.onclick=()=>{if(locked)return;
        document.querySelectorAll("#opts .opt").forEach(x=>{x.disabled=true;
          if(x.dataset.val===it.a[0])x.classList.add("correct");else if(x===b)x.classList.add("wrong");else x.classList.add("dim");});
        grade(opt===it.a[0]?2:0,opt);};
      box.appendChild(b);
    });
    hint.textContent="1〜"+q.options.length+"キー または クリック";
  }else if(q.kind==="w"){
    stg.innerHTML='<div class="prompt gq">'+promptHTML(q)+'</div>'+ja+
      '<div class="write-box"><input type="text" id="writeInput" class="write-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="空欄に入る語">'+
      '<button class="write-btn" id="writeBtn">解答</button></div>';
    bindWrite(q);hint.textContent="空欄に入る語を入力して Enter";
  }else if(q.kind==="t"){
    stg.innerHTML='<div class="inst">'+esc(it.inst)+'</div><div class="src">'+esc(it.src)+'</div>'+ja+
      '<div class="write-box col"><textarea id="writeInput" class="write-input long" rows="2" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="文全体を書く"></textarea>'+
      '<button class="write-btn" id="writeBtn">解答</button></div>';
    bindWrite(q);hint.textContent="文全体を入力して Enter（文末の . ? は省略可）";
  }else if(q.kind==="b"){
    stg.innerHTML='<div class="prompt-ja">'+esc(it.ja)+'</div><div class="qtext">単語を並べてフランス語の文にしよう</div>'+
      '<div class="tray" id="tray"></div><div class="bank" id="bank"></div>'+
      '<div class="build-ctl"><button class="mini" id="undoBtn">1つ戻す</button><button class="mini" id="clearBtn">やり直す</button></div>';
    q.picked=[];drawTiles(q);
    $("undoBtn").onclick=()=>{if(locked)return;q.picked.pop();drawTiles(q);};
    $("clearBtn").onclick=()=>{if(locked)return;q.picked=[];drawTiles(q);};
    hint.textContent="タップした順に並びます"+(it.extra.length?"（使わない札が混ざっています）":"");
  }
}
function bindWrite(q){
  const inp=$("writeInput");
  $("writeBtn").onclick=()=>checkWrite(q);
  inp.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();e.stopPropagation();if(!locked)checkWrite(q);}});
  setTimeout(()=>inp.focus(),30);
}
function checkWrite(q){
  if(locked)return;
  const inp=$("writeInput"),val=inp.value;
  if(!val.trim()){inp.focus();return;}
  const r=judge(val,q.it.a);
  inp.disabled=true;$("writeBtn").disabled=true;inp.classList.add(r?"ok":"no");
  grade(r,val.trim());
}
function drawTiles(q){
  const tray=$("tray"),bank=$("bank"),used=new Set(q.picked.map(t=>t.id));
  tray.innerHTML=q.picked.map(t=>'<button class="tile" data-id="'+t.id+'">'+esc(t.w)+'</button>').join("")+
    (q.picked.length?'<span class="end">'+esc(q.end)+'</span>':'<span class="tray-ph">ここに並びます</span>');
  bank.innerHTML=q.tiles.filter(t=>!used.has(t.id)).map(t=>'<button class="tile" data-id="'+t.id+'">'+esc(t.w)+'</button>').join("");
  tray.querySelectorAll(".tile").forEach(b=>b.onclick=()=>{if(locked)return;q.picked=q.picked.filter(t=>t.id!==+b.dataset.id);drawTiles(q);});
  bank.querySelectorAll(".tile").forEach(b=>b.onclick=()=>{if(locked)return;q.picked.push(q.tiles.find(t=>t.id===+b.dataset.id));drawTiles(q);
    if(q.picked.length===q.words.length)checkBuild(q);});
}
function checkBuild(q){
  const got=q.picked.map(t=>t.w).join(" "),want=q.words.join(" ");
  const ok=got.toLowerCase()===want.toLowerCase();
  $("tray").classList.add(ok?"ok":"no");
  grade(ok?2:0,joinTiles(q.picked.map(t=>t.w))+(q.end?(/[?!]/.test(q.end)?" ":"")+q.end:""));
}

/* ---------- 採点・解説 ---------- */
function grade(r,chosen){
  const q=questions[idx];if(q.ok!==null)return;
  locked=true;q.rt=performance.now()-q.t0;
  q.ok=r>0;q.accent=(r===1);q.chosen=chosen;
  const s=st(q.it);
  q.fast=false;s.t=Date.now();
  if(q.ok){
    s.c++;s.last=1;s.run=(s.run||0)+1;roundCorrect++;
    if(s.wk&&s.run>=2)s.wk=false;                       // 苦手は2回連続正解で解除
    if(!s.wk&&(q.kind==="w"||q.kind==="t")&&q.rt<=FAST_MS){if(!s.m)q.fast=true;s.m=true;}  // 記述で5秒以内 → 即習得
  }else{s.w++;s.last=0;s.run=0;s.wk=true;s.m=false;}
  store.it[q.it.id]=s;save();
  const fb=$("fb");
  if(q.ok){fb.className="fb show ok";fb.textContent=pick(["Bien !","Très bien !","Parfait !","Exact !","Bravo !"]);if(typeof playCorrect==="function")playCorrect();}
  else{fb.className="fb show no";fb.textContent=pick(["Pas tout à fait…","Presque !","Attention…"]);if(typeof playWrong==="function")playWrong();}
  showAfter(q);
}
function answerLine(q){
  const it=q.it;
  if(it.t==="c"||it.t==="w")return promptHTML(q,it.a[0]);
  return esc(it.a[0]);
}
function showAfter(q){
  const it=q.it,a=$("after");a.classList.remove("hidden");
  let extra="";
  if(q.fast)extra+='<div class="heard fast">5秒以内に正解 → 習得！</div>';
  else if(q.ok&&weak(it))extra+='<div class="heard">苦手を解除するには、もう1回続けて正解しよう</div>';
  if(q.accent)extra+='<div class="heard">正解。ただしつづりは <b>'+esc(it.a[0])+'</b>（アクセント記号に注意）</div>';
  if(!q.ok&&q.chosen!=null)extra+='<div class="heard">あなたの答え：<s>'+esc(q.chosen)+'</s></div>';
  const alts=it.a.slice(1);
  if(alts.length&&(it.t==="t"||it.t==="w"))extra+='<div class="ans-alt">別解：'+alts.map(esc).join(" ／ ")+'</div>';
  a.innerHTML='<div class="ans-fr">'+answerLine(q)+'</div>'+(it.ja&&it.t!=="b"?'':'')+extra+
    (it.ex?'<div class="ex"><span class="ex-h">ポイント</span>'+esc(it.ex)+'</div>':'')+
    '<div class="btns"><button class="next-btn" id="nextBtn">'+(idx+1<questions.length?"次へ →":"結果を見る")+'</button></div>';
  $("nextBtn").onclick=next;
  $("hintLine").textContent="Enter で次へ";
  if(q.ok&&!q.accent)autoNext=setTimeout(next,1500);
}
function next(){
  clearTimeout(autoNext);
  const q=questions[idx];if(!q||q.ok===null)return;
  idx++;if(idx<questions.length)render();else finishRound();
}
function finishRound(){
  clearInterval(timerHandle);
  const N=questions.length,time=performance.now()-roundStart;
  const wasClear=store.answered>=CLEAR_ANS,wasAll=ITEMS.every(mastered)&&false;
  store.tries++;store.answered+=N;store.correct+=roundCorrect;
  store.timeMs=(store.timeMs||0)+Math.min(time,N*90000);   // 放置した時間は数えすぎないよう1問90秒まで
  if(store.best===null||roundCorrect>store.best)store.best=roundCorrect;
  save();if(window.Quiz)Quiz.markToday();
  const pct=Math.round(roundCorrect/N*100);
  $("rScore").innerHTML=roundCorrect+'<small> / '+N+'</small>';
  $("rPct").textContent=pct+"%";
  $("rFace").textContent=pct===100?"◎":pct>=80?"○":pct>=50?"△":"✕";
  $("rMsg").textContent=pct===100?"Parfait ! 全問正解です。":pct>=80?"よくできました。":pct>=50?"あと少し。下のポイントを確認しよう。":"ポイントを読んでから、もう一度挑戦しよう。";
  $("rTime").innerHTML='所要時間 '+fmtTime(time);
  const list=itemsOf(curSec==="weak"?"mix":curSec);
  let mt=(curSec==="mix"||curSec==="weak"?"Leçon "+L.no+" 全体":"この項目")+"の習得："+list.filter(mastered).length+" / "+list.length+"　／　通算 "+fmtDur(store.timeMs);
  if(!wasClear&&store.answered>=CLEAR_ANS)mt+="　★ Leçon "+L.no+" クリア！";
  const newB=awardBadges();
  $("rMastery").textContent=mt;
  const miss=questions.filter(q=>!q.ok);
  let h='<div class="ttl">'+(miss.length?"間違えた問題":"全問正解")+'</div>';
  miss.forEach(q=>{
    h+='<div class="rrow"><span class="mk no">✕</span><span class="rtx">'+
      (q.it.t==="t"?'<span class="rja">'+esc(q.it.inst)+'：'+esc(q.it.src)+'</span>':q.it.t==="b"?'<span class="rja">'+esc(q.it.ja)+'</span>':'')+
      '<span class="rfr">'+answerLine(q)+'</span>'+
      (q.it.ex?'<span class="rja">'+esc(q.it.ex)+'</span>':'')+'</span></div>';
  });
  $("review").innerHTML=h;
  show(resultScreen);
  if(roundCorrect===N&&typeof playFanfare==="function")setTimeout(playFanfare,280);
  if(newB.length&&window.Badge)setTimeout(()=>Badge.celebrate(newB),roundCorrect===N?1900:500);
  if(window.Quiz)Quiz.submit("grammar",{section:"L"+L.no+"-"+curSec,mode:curMode,durMs:Math.round(time),score:roundCorrect,total:N,timeAttack:false,timeMs:null,
    misses:miss.map(q=>({full:q.it.t==="b"?q.it.ja:(q.it.q||q.it.src||""),verb:"L"+L.no,chosen:q.chosen||"",answer:q.it.a[0]}))});
}
/* 問題の報告用：このラウンドで出た問題（新しい順）。feedback.js が使う */
window.FB_QUESTIONS=function(){
  if(!L||!questions.length)return [];
  const out=[],n=Math.min(questions.length,idx+1);
  for(let i=n-1;i>=0;i--){
    const q=questions[i],it=q.it,body=it.t==="t"?it.inst+"："+it.src:it.t==="b"?it.ja:(it.q||"");
    out.push({label:(i+1)+". "+body,
      detail:"文法練習 Leçon "+L.no+"／"+secInfo(it.sec).t+"／ラウンドの第"+(i+1)+"問（問題ID "+it.id+"）\n問題："+body+(it.ja&&it.t!=="b"?"（"+it.ja+"）":"")+
        "\n正解："+it.a.join(" / ")+"\n自分の答え："+(q.ok==null?"（まだ答えていない）":(q.chosen||"")+(q.ok?"　○":"　✕"))});
  }
  return out;
};
function goHome(){clearInterval(timerHandle);clearTimeout(autoNext);setAccent(null);renderHome();show(homeScreen);}

/* ---------- 起動 ---------- */
function init(){
  if(window.Quiz){if(!Quiz.requireLogin())return;Quiz.refresh();}
  L=window.LESSON;
  WHO=(window.Quiz&&Quiz.user())?Quiz.user().id:"guest";
  KEY="gramQuiz_L"+L.no+"_v1_"+WHO;
  store=load();curMode=store.mode||"choice";
  if(!store.badges){store.badges={};awardBadges();fresh={};}   // この版より前に達成していた分は、お祝いなしで付ける
  const app=document.getElementById("app");app.innerHTML=shell();
  homeScreen=$("homeScreen");quizScreen=$("quizScreen");resultScreen=$("resultScreen");
  document.querySelectorAll(".sections .start-btn").forEach(b=>b.onclick=()=>startRound(b.dataset.sec));
  $("mixBtn").onclick=()=>startRound("mix");
  $("weakBtn").onclick=()=>startRound("weak");
  document.querySelectorAll(".mode-btn[data-mode]").forEach(b=>b.onclick=()=>{curMode=b.dataset.mode;store.mode=curMode;save();renderHome();});
  $("againBtn").onclick=()=>{if(curSec==="weak"&&!itemsOf("weak").length){goHome();return;}startRound(curSec);};
  $("backBtn").onclick=goHome;$("toHomeBtn").onclick=goHome;
  let armed=0;
  $("resetBtn").onclick=()=>{
    const b=$("resetBtn");
    if(Date.now()-armed<4000){armed=0;b.textContent="記録をリセット";
      store={tries:0,answered:0,correct:0,best:null,it:{},mode:curMode,badges:{}};save();renderHome();return;}
    armed=Date.now();b.textContent="もう一度押すとリセットします";
    setTimeout(()=>{if(armed&&Date.now()-armed>=4000){armed=0;b.textContent="記録をリセット";}},4100);
  };
  document.addEventListener("keydown",e=>{
    if(quizScreen.classList.contains("hidden"))return;
    const q=questions[idx];if(!q)return;
    if(q.ok!==null){if(e.key==="Enter"){e.preventDefault();next();}return;}
    if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;
    if(q.kind==="c"&&/^[1-9]$/.test(e.key)){const b=document.querySelectorAll("#opts .opt")[+e.key-1];if(b&&!b.disabled)b.click();}
  });
  renderHome();show(homeScreen);
}
window.GRAMMAR={ITEMS,judge,nz,tiles,init,get questions(){return questions;},get idx(){return idx;}};
document.addEventListener("DOMContentLoaded",init);
})();
