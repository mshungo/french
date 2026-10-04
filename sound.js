/* ===== sound ===== */
let actx=null;
function ensureAudio(){if(!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}}
function tone(f,start,dur,type,vol){
  const o=actx.createOscillator(),g=actx.createGain();
  o.type=type;o.frequency.value=f;
  g.gain.setValueAtTime(0,start);
  g.gain.linearRampToValueAtTime(vol,start+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001,start+dur);
  o.connect(g).connect(actx.destination);o.start(start);o.stop(start+dur+0.02);
}
function playCorrect(){ // 上昇する短い和音
  if(!actx)return;const t=actx.currentTime;
  [659.25,783.99,987.77,1318.51].forEach((f,i)=>tone(f,t+i*0.07,0.26,"triangle",0.2));
}
function playWrong(){
  if(!actx)return;const t=actx.currentTime;
  tone(330,t,0.16,"sine",0.14);tone(247,t+0.12,0.2,"sine",0.14);
}
function playStart(){if(!actx)return;const t=actx.currentTime;tone(523.25,t,0.12,"triangle",0.15);tone(784,t+0.09,0.16,"triangle",0.15);}
function playFanfare(){ // 全問正解クリア用の短いファンファーレ
  if(!actx)return;const t=actx.currentTime;
  // 旋律: ソ ソ ソ ド↑ — ド↑ ソ ド↑(伸ばし)
  const mel=[
    [783.99,0.00,0.14],[783.99,0.15,0.14],[783.99,0.30,0.14],[1046.50,0.45,0.30],
    [1046.50,0.82,0.16],[783.99,1.00,0.16],[1046.50,1.18,0.55]
  ];
  mel.forEach(([f,d,dur])=>{
    tone(f,t+d,dur,"triangle",0.2);
    tone(f/2,t+d,dur,"sine",0.07); // 1oct下を薄く重ねて厚みを出す
  });
  // 最後に明るい和音（ド・ミ・ソ・ド）
  const ch=t+1.18;
  [523.25,659.25,783.99,1046.50].forEach((f,i)=>tone(f,ch+i*0.02,0.7,"triangle",0.13));
}


