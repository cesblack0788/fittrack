// FitTrack App

const KEYS={history:'ft_h',xp:'ft_x',badges:'ft_b',streak:'ft_s',lastDate:'ft_l'};
function load(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
const XP_VAL={run:50,strength:30};
const LEVELS=[0,100,250,450,700,1000,1400,1900,2500,3200,4000];
const BADGES=[
  {id:'first_run', emoji:'🏃',name:'First Mile',   desc:'Complete your first HIIT run.',         check:(h)=>h.filter(x=>x.type==='run').length>=1},
  {id:'first_str', emoji:'��',name:'Iron Will',    desc:'Complete your first strength workout.',  check:(h)=>h.filter(x=>x.type==='strength').length>=1},
  {id:'streak_3',  emoji:'🔥',name:'On Fire',      desc:'Work out 3 days in a row.',              check:(_,s)=>s>=3},
  {id:'streak_7',  emoji:'⚡',name:'Week Warrior', desc:'Work out 7 days in a row.',              check:(_,s)=>s>=7},
  {id:'streak_14', emoji:'🌟',name:'Unstoppable',  desc:'Work out 14 days in a row.',             check:(_,s)=>s>=14},
  {id:'runs_5',    emoji:'👟',name:'Road Runner',  desc:'Complete 5 HIIT sessions.',              check:(h)=>h.filter(x=>x.type==='run').length>=5},
  {id:'runs_10',   emoji:'🏅',name:'Mile Chaser',  desc:'Complete 10 HIIT sessions.',             check:(h)=>h.filter(x=>x.type==='run').length>=10},
  {id:'runs_25',   emoji:'🥇',name:'Speed Demon',  desc:'Complete 25 HIIT sessions.',             check:(h)=>h.filter(x=>x.type==='run').length>=25},
  {id:'str_5',     emoji:'🏋',name:'Body Builder', desc:'Complete 5 strength workouts.',          check:(h)=>h.filter(x=>x.type==='strength').length>=5},
  {id:'str_10',    emoji:'💥',name:'Iron Body',    desc:'Complete 10 strength workouts.',         check:(h)=>h.filter(x=>x.type==='strength').length>=10},
  {id:'total_20',  emoji:'🎯',name:'Committed',    desc:'Log 20 total workouts.',                 check:(h)=>h.length>=20},
  {id:'total_50',  emoji:'👑',name:'Legend',       desc:'Log 50 total workouts.',                 check:(h)=>h.length>=50},
  {id:'advanced',  emoji:'🚀',name:'Advanced Mode',desc:'Complete an Advanced HIIT session.',     check:(h)=>h.filter(x=>x.type==='run'&&x.program==='advanced').length>=1},
  {id:'early',     emoji:'🌅',name:'Early Bird',   desc:'Log a workout before 8am.',              check:(h)=>h.some(x=>new Date(x.date).getHours()<8)},
];
const PROGRAMS={
  beginner:    {label:'Beginner',    desc:'Short runs with longer recovery to build your aerobic base.',warmup:120,cooldown:120,runTime:30, walkTime:90,rounds:8},
  intermediate:{label:'Intermediate',desc:'Balanced run/walk ratio to push your endurance threshold.', warmup:90, cooldown:90, runTime:60, walkTime:90,rounds:8},
  advanced:    {label:'Advanced',    desc:'Equal sprint and walk intervals for serious speed gains.',   warmup:60, cooldown:60, runTime:60, walkTime:60,rounds:10},
};
const EXERCISES={
  core:{label:'Core',emoji:'🔥',desc:'A strong core protects your lower back and powers every movement.',
    list:[
      {name:'Plank',            sets:'3x30-60s',   desc:'Forearm plank, body straight. Squeeze abs, glutes, quads.',                          tip:'Do not let hips sag or pike. Breathe steadily.',              yt:'plank exercise proper form'},
      {name:'Dead Bug',         sets:'3x10/side',  desc:'On back, arms up, knees at 90. Lower opposite arm and leg, keep lower back flat.',    tip:'Lower back stays pressed into the floor the whole time.',     yt:'dead bug core exercise tutorial'},
      {name:'Bicycle Crunches', sets:'3x20',       desc:'Hands behind head, bring elbow to opposite knee in a pedaling motion.',              tip:'Slow and controlled, do not yank your neck.',                 yt:'bicycle crunches proper form'},
      {name:'Hollow Body Hold', sets:'3x20-40s',   desc:'On back, arms overhead, legs extended slightly off floor. Hold the shape.',          tip:'Too hard? Bend knees or keep arms at your sides.',            yt:'hollow body hold gymnastics tutorial'},
      {name:'Mountain Climbers',sets:'3x30s',      desc:'High plank. Drive knees to chest alternately as fast as possible.',                  tip:'Keep hips level, do not let them rise.',                      yt:'mountain climbers exercise tutorial'},
      {name:'Russian Twists',   sets:'3x20',       desc:'Feet off floor, lean back slightly, rotate torso side to side touching the floor.',  tip:'Chest up, spine long, do not round forward.',                 yt:'russian twists bodyweight tutorial'},
    ]},
  arms:{label:'Arms',emoji:'💪',desc:'Chest, shoulders, triceps, and biceps using only bodyweight.',
    list:[
      {name:'Push-Ups',              sets:'3x10-20', desc:'Hands shoulder-width, lower chest to floor, elbows at 45 degrees, press back up.',       tip:'Core and glutes tight the whole time.',                       yt:'push up perfect form tutorial'},
      {name:'Diamond Push-Ups',      sets:'3x8-15',  desc:'Thumbs and index fingers form a diamond under chest. Heavy tricep focus.',                tip:'Harder than regular push-ups, drop to knees if needed.',      yt:'diamond push up triceps tutorial'},
      {name:'Wide Push-Ups',         sets:'3x10-15', desc:'Hands wider than shoulder-width. More chest and front delt activation.',                  tip:'3 seconds down, 1 second up for max chest work.',             yt:'wide grip push up chest workout'},
      {name:'Pike Push-Ups',         sets:'3x8-12',  desc:'Downward-dog position, lower head toward floor, press back up. Targets shoulders.',       tip:'More vertical torso equals more shoulder activation.',        yt:'pike push up shoulder workout tutorial'},
      {name:'Tricep Dips',           sets:'3x10-15', desc:'Hands on chair edge, lower by bending elbows to 90 degrees, press back up.',              tip:'Keep back close to chair, elbows point back not flaring out.',yt:'tricep dips chair bodyweight tutorial'},
      {name:'Isometric Bicep Curl',  sets:'3x20s',   desc:'Grip doorframe palm-up at hip height. Drive hand up hard against frame and hold.',        tip:'No movement needed, pure tension builds strength.',           yt:'isometric bicep curl no equipment'},
    ]},
  legs:{label:'Legs',emoji:'🦵',desc:'Your biggest muscle group. Training legs boosts hormones and powers your runs.',
    list:[
      {name:'Bodyweight Squats',      sets:'3x15-25', desc:'Feet shoulder-width, push hips back and down, chest up, drive through heels.',           tip:'Go as deep as mobility allows. Depth builds muscle.',         yt:'bodyweight squat perfect form tutorial'},
      {name:'Reverse Lunges',         sets:'3x10/leg',desc:'Step back, drop rear knee toward floor, front knee over ankle, return.',                  tip:'Easier on knees than forward lunges, great for beginners.',   yt:'reverse lunge bodyweight proper form'},
      {name:'Glute Bridges',          sets:'3x20',    desc:'On back knees bent, drive hips up squeezing glutes until body is straight.',              tip:'Squeeze and hold 2 seconds at the top each rep.',             yt:'glute bridge exercise tutorial'},
      {name:'Jump Squats',            sets:'3x10',    desc:'Lower into squat then explode upward. Land softly bending knees.',                        tip:'Land quietly, soft landing means muscles not joints.',        yt:'jump squat plyometric tutorial'},
      {name:'Wall Sit',               sets:'3x30-60s',desc:'Back flat on wall, thighs parallel to floor, knees at 90 degrees. Hold.',                 tip:'Back flat on wall, do not rest hands on knees.',              yt:'wall sit exercise tutorial'},
      {name:'Single-Leg Calf Raises', sets:'3x15/leg',desc:'Stand on one foot, rise onto toes as high as possible, lower slowly.',                   tip:'Full range, all the way up and all the way down.',            yt:'single leg calf raise tutorial'},
    ]},
  fullbody:{label:'Full Body',emoji:'⚡',desc:'Hit everything in one session. Great for 3x per week.',
    list:[
      {name:'Burpees',          sets:'3x8-12', desc:'Drop to push-up, do a push-up, jump feet to hands, explode into a jump with arms overhead.',  tip:'Scale by removing the jump or push-up. Pace yourself.',       yt:'burpee exercise proper form tutorial'},
      {name:'Push-Ups',         sets:'3x10-20',desc:'Lower chest to floor, elbows at 45 degrees, press back up. Core rigid throughout.',           tip:'Body like a plank. Engage core the entire time.',             yt:'push up perfect form tutorial'},
      {name:'Bodyweight Squats',sets:'3x15',   desc:'Hip-width stance, sit back and down, chest up, drive through heels to stand.',                tip:'Arms out front for balance. Aim for thighs parallel.',        yt:'bodyweight squat perfect form tutorial'},
      {name:'Plank',            sets:'3x30-45s',desc:'Forearm plank, elbows under shoulders. Brace core like you are about to be hit.',            tip:'Breathe steadily. Do not hold your breath.',                  yt:'plank exercise proper form tutorial'},
      {name:'Glute Bridges',    sets:'3x20',   desc:'On back, knees bent. Push hips to ceiling squeezing glutes, lower slowly.',                   tip:'Hold the top for 2 seconds per rep.',                         yt:'glute bridge exercise tutorial'},
      {name:'Superman Hold',    sets:'3x12',   desc:'Face down, lift arms, chest, and legs simultaneously. Hold 2 seconds at top.',                tip:'Targets entire posterior chain, back, glutes, upper back.',   yt:'superman exercise lower back tutorial'},
    ]},
};
let history=load(KEYS.history,[]);
let xpTotal=load(KEYS.xp,0);
let earned=load(KEYS.badges,[]);
let streak=load(KEYS.streak,0);
let lastDate=load(KEYS.lastDate,null);
let curProgram='beginner',curFocus='core',timerState='idle';
let intervalId=null,schedule=[],schedIdx=0,secsLeft=0,totalSecs=0,phaseDur=0;

document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
    if(btn.dataset.tab==='history') renderHistory();
    if(btn.dataset.tab==='badges')  renderBadges();
  });
});

function getLevel(xp){for(let i=LEVELS.length-1;i>=0;i--){if(xp>=LEVELS[i])return i+1;}return 1;}
function getLevelProg(xp){
  const lvl=getLevel(xp);
  const cur=LEVELS[lvl-1]||0;
  const nxt=LEVELS[lvl]||LEVELS[LEVELS.length-1];
  return{pct:Math.min(100,Math.round(((xp-cur)/(nxt-cur))*100)),xpIn:xp-cur,xpTo:nxt-cur};
}
function addXP(amt,reason){
  const oldLvl=getLevel(xpTotal);
  xpTotal+=amt; save(KEYS.xp,xpTotal);
  const newLvl=getLevel(xpTotal);
  updateXPBar();
  showToast('xp','+'+amt+' XP - '+reason);
  if(newLvl>oldLvl) setTimeout(()=>showToast('badge','Level Up! You are now Level '+newLvl+'!'),600);
}
function updateXPBar(){
  const lvl=getLevel(xpTotal);
  const p=getLevelProg(xpTotal);
  document.getElementById('level-badge').textContent='Lvl '+lvl;
  document.getElementById('xp-label').textContent=p.xpIn+' / '+p.xpTo+' XP';
  document.getElementById('xp-fill').style.width=p.pct+'%';
  document.getElementById('streak-badge').textContent='🔥 '+streak;
}
function updateStreak(){
  const today=new Date().toDateString();
  if(lastDate===today) return;
  const yest=new Date(Date.now()-86400000).toDateString();
  streak=(lastDate===yest)?streak+1:1;
  lastDate=today;
  save(KEYS.streak,streak); save(KEYS.lastDate,lastDate);
  updateXPBar();
  if(streak===3)  addXP(25,'3-day streak!');
  if(streak===7)  addXP(50,'7-day streak!');
  if(streak===14) addXP(100,'14-day streak!');
  if(streak>1) showToast('streak','🔥 '+streak+' day streak! Keep it up!');
}
function checkBadges(){
  BADGES.forEach(b=>{
    if(earned.includes(b.id)) return;
    if(b.check(history,streak)){
      earned.push(b.id); save(KEYS.badges,earned);
      setTimeout(()=>showBadgeModal(b),900);
    }
  });
}
function showBadgeModal(b){
  document.getElementById('modal-emoji').textContent=b.emoji;
  document.getElementById('modal-title').textContent=b.name;
  document.getElementById('modal-desc').textContent=b.desc;
  document.getElementById('badge-modal').style.display='flex';
}
function closeBadgeModal(){document.getElementById('badge-modal').style.display='none';}
function showToast(type,msg){
  const c=document.getElementById('toast-container');
  const t=document.createElement('div');
  t.className='toast '+type; t.textContent=msg; c.appendChild(t);
  setTimeout(()=>{t.style.animation='slideOut .3s ease forwards';setTimeout(()=>t.remove(),300);},3000);
}
function logWorkout(type,details){
  const entry={id:Date.now(),date:new Date().toISOString(),type,...details};
  history.unshift(entry); save(KEYS.history,history);
  updateStreak();
  addXP(type==='run'?XP_VAL.run:XP_VAL.strength,type==='run'?'HIIT run complete!':'Strength workout logged!');
  checkBadges(); renderBadges();
}
document.querySelectorAll('.program-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.program-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); curProgram=btn.dataset.program;
    if(timerState!=='idle') resetTimer();
    renderProgramInfo(); buildSchedule(); renderLog();
  });
});
function renderProgramInfo(){
  const p=PROGRAMS[curProgram];
  const mins=Math.round((p.warmup+p.cooldown+p.rounds*(p.runTime+p.walkTime))/60);
  document.getElementById('program-info').innerHTML='<strong>'+p.label+'</strong> - '+p.desc+
    '<div class="info-grid">'+
    '<div class="info-item"><div class="val">'+p.runTime+'s</div><div class="lbl">Run</div></div>'+
    '<div class="info-item"><div class="val">'+p.walkTime+'s</div><div class="lbl">Walk</div></div>'+
    '<div class="info-item"><div class="val">~'+mins+'m</div><div class="lbl">Total</div></div>'+
    '</div>';
}
function buildSchedule(){
  const p=PROGRAMS[curProgram]; schedule=[];
  schedule.push({type:'warmup',label:'Warm-Up Walk',duration:p.warmup});
  for(let i=0;i<p.rounds;i++){
    schedule.push({type:'run',label:'RUN!',duration:p.runTime});
    schedule.push({type:'walk',label:'Walk / Recover',duration:p.walkTime});
  }
  schedule.push({type:'cooldown',label:'Cool-Down Walk',duration:p.cooldown});
  totalSecs=schedule.reduce((s,x)=>s+x.duration,0);
  document.getElementById('total-rounds').textContent=p.rounds;
}
function renderLog(){
  document.getElementById('log-list').innerHTML=schedule.map((item,i)=>
    '<div class="log-item" id="log-'+i+'">'+
    '<div class="log-dot '+item.type+'"></div>'+
    '<div class="log-name">'+item.label+'</div>'+
    '<div class="log-duration">'+fmt(item.duration)+'</div>'+
    '</div>').join('');
}
document.getElementById('start-btn').addEventListener('click',startTimer);
document.getElementById('pause-btn').addEventListener('click',pauseTimer);
document.getElementById('reset-btn').addEventListener('click',resetTimer);
function startTimer(){
  if(timerState==='idle'){schedIdx=0;beginPhase();}
  else if(timerState==='paused'){timerState='running';tick();}
  document.getElementById('start-btn').disabled=true;
  document.getElementById('pause-btn').disabled=false;
  hideBanner();
}
function pauseTimer(){
  if(timerState!=='running') return;
  timerState='paused'; clearInterval(intervalId);
  document.getElementById('start-btn').disabled=false;
  document.getElementById('start-btn').textContent='Resume';
  document.getElementById('pause-btn').disabled=true;
}
function resetTimer(){
  clearInterval(intervalId); timerState='idle'; schedIdx=0; secsLeft=0;
  document.getElementById('start-btn').disabled=false;
  document.getElementById('start-btn').textContent='Start';
  document.getElementById('pause-btn').disabled=true;
  document.getElementById('timer-display').textContent='--:--';
  document.getElementById('interval-label').textContent='Press Start';
  document.getElementById('current-round').textContent='0';
  const b=document.getElementById('phase-badge'); b.textContent='Ready'; b.className='phase-badge';
  const r=document.getElementById('ring-progress'); r.style.strokeDashoffset='0'; r.className='ring-progress';
  document.getElementById('progress-fill').style.width='0%';
  document.getElementById('progress-pct').textContent='0%';
  renderLog(); hideBanner();
}
function beginPhase(){
  if(schedIdx>=schedule.length){finishWorkout();return;}
  const ph=schedule[schedIdx]; secsLeft=ph.duration; phaseDur=ph.duration;
  timerState='running'; updateDisplay(ph); speak(ph); highlightLog(); tick();
}
function tick(){
  clearInterval(intervalId);
  intervalId=setInterval(()=>{
    secsLeft--;
    document.getElementById('timer-display').textContent=fmt(secsLeft);
    document.getElementById('ring-progress').style.strokeDashoffset=339.3*(1-secsLeft/phaseDur);
    const elapsed=schedule.slice(0,schedIdx).reduce((s,x)=>s+x.duration,0)+(phaseDur-secsLeft);
    const pct=Math.min(100,Math.round((elapsed/totalSecs)*100));
    document.getElementById('progress-fill').style.width=pct+'%';
    document.getElementById('progress-pct').textContent=pct+'%';
    if(secsLeft<=0){clearInterval(intervalId);schedIdx++;if(timerState==='running')beginPhase();}
  },1000);
}
function updateDisplay(ph){
  document.getElementById('timer-display').textContent=fmt(secsLeft);
  document.getElementById('interval-label').textContent=ph.label;
  const b=document.getElementById('phase-badge'); b.textContent=ph.label; b.className='phase-badge '+ph.type;
  const r=document.getElementById('ring-progress'); r.className='ring-progress '+ph.type; r.style.strokeDashoffset='0';
  if(ph.type==='run'){
    const n=schedule.slice(0,schedIdx+1).filter(s=>s.type==='run').length;
    document.getElementById('current-round').textContent=n;
  }
}
function highlightLog(){
  document.querySelectorAll('.log-item').forEach((el,i)=>{
    el.classList.remove('active-log','done-log');
    if(i<schedIdx) el.classList.add('done-log');
    if(i===schedIdx){el.classList.add('active-log');el.scrollIntoView({behavior:'smooth',block:'nearest'});}
  });
}
function finishWorkout(){
  timerState='idle';
  document.getElementById('timer-display').textContent='Done!';
  document.getElementById('interval-label').textContent='Complete!';
  document.getElementById('start-btn').disabled=true;
  document.getElementById('pause-btn').disabled=true;
  const b=document.getElementById('phase-badge'); b.textContent='Done!'; b.className='phase-badge walk';
  document.getElementById('progress-fill').style.width='100%';
  document.getElementById('progress-pct').textContent='100%';
  document.querySelectorAll('.log-item').forEach(el=>el.classList.add('done-log'));
  showBanner(); logWorkout('run',{program:curProgram,rounds:PROGRAMS[curProgram].rounds});
  say('Workout complete! Amazing job. Rest up and come back stronger.');
}
function showBanner(){
  let b=document.getElementById('completion-banner');
  if(!b){b=document.createElement('div');b.id='completion-banner';b.className='completion-banner';
    b.innerHTML='<h3>Workout Complete!</h3><p>Great work! Rest 1-2 days before your next HIIT session.</p>';
    document.getElementById('tab-running').querySelector('.card').appendChild(b);}
  b.classList.add('show');
}
function hideBanner(){const b=document.getElementById('completion-banner');if(b)b.classList.remove('show');}
function speak(ph){
  const msgs={warmup:'Warm up. Start walking.',run:'Run! Push hard!',walk:'Walk. Recover.',cooldown:'Cool down. Nice work.'};
  say(msgs[ph.type]||ph.label);
}
function say(text){
  if(!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.rate=1.0; u.pitch=1.0; u.volume=1.0;
  window.speechSynthesis.speak(u);
}
document.querySelectorAll('.focus-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.focus-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); curFocus=btn.dataset.focus; renderExercises();
  });
});
document.getElementById('log-workout-btn').addEventListener('click',()=>{
  logWorkout('strength',{focus:curFocus});
  const btn=document.getElementById('log-workout-btn');
  btn.textContent='Logged!'; btn.style.background='#51cf66';
  setTimeout(()=>{btn.textContent='Log This Workout';btn.style.background='';},2500);
});
function renderExercises(){
  const d=EXERCISES[curFocus];
  document.getElementById('workout-header').innerHTML='<h3>'+d.emoji+' '+d.label+' Workout</h3><p>'+d.desc+'</p>';
  document.getElementById('exercise-grid').innerHTML=d.list.map(ex=>
    '<div class="exercise-card">'+
    '<div class="ex-header"><div class="ex-title">'+ex.name+'</div><div class="ex-sets">'+ex.sets+'</div></div>'+
    '<div class="ex-desc">'+ex.desc+'</div>'+
    '<div class="ex-tips"><strong>Tip:</strong> '+ex.tip+'</div>'+
    '<a class="ex-video-btn" href="https://www.youtube.com/results?search_query='+encodeURIComponent(ex.yt)+'" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>'+
    '</div>').join('');
}
function renderHistory(){
  const runs=history.filter(x=>x.type==='run').length;
  const strs=history.filter(x=>x.type==='strength').length;
  document.getElementById('stats-row').innerHTML=
    '<div class="stat-card"><div class="stat-val">'+history.length+'</div><div class="stat-lbl">Total Workouts</div></div>'+
    '<div class="stat-card"><div class="stat-val">'+runs+'</div><div class="stat-lbl">HIIT Runs</div></div>'+
    '<div class="stat-card"><div class="stat-val">'+streak+'</div><div class="stat-lbl">Day Streak</div></div>';
  renderCalendar();
  if(history.length===0){
    document.getElementById('history-list').innerHTML='<div class="empty-state">No workouts yet. Complete a session to start tracking!</div>';
    return;
  }
  const icons={core:'🔥',arms:'💪',legs:'🦵',fullbody:'⚡'};
  document.getElementById('history-list').innerHTML=history.map(e=>{
    const d=new Date(e.date);
    const ds=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    const ts=d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
    const icon=e.type==='run'?'🏃':(icons[e.focus]||'🏋');
    const title=e.type==='run'?('HIIT Run - '+(PROGRAMS[e.program]?PROGRAMS[e.program].label:e.program)):('Strength - '+(EXERCISES[e.focus]?EXERCISES[e.focus].label:e.focus||'Workout'));
    const xpv=e.type==='run'?XP_VAL.run:XP_VAL.strength;
    return '<div class="history-item"><div class="history-icon">'+icon+'</div>'+
      '<div class="history-info"><div class="history-title">'+title+'</div><div class="history-meta">'+ds+' at '+ts+'</div></div>'+
      '<div class="history-xp">+'+xpv+' XP</div></div>';
  }).join('');
}
function renderCalendar(){
  const grid=document.getElementById('calendar-grid');
  const today=new Date(); const days=[];
  for(let i=41;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);days.push(d);}
  const wd={};
  history.forEach(e=>{const k=new Date(e.date).toDateString();if(!wd[k])wd[k]=new Set();wd[k].add(e.type);});
  grid.innerHTML=days.map(d=>{
    const k=d.toDateString(); const types=wd[k]; const isT=k===today.toDateString();
    let cls='cal-day'+(isT?' today':'');
    if(types){const r=types.has('run'),s=types.has('strength');cls+=(r&&s)?' has-both':r?' has-run':' has-strength';}
    return '<div class="'+cls+'" title="'+k+'">'+d.getDate()+'</div>';
  }).join('');
}
function renderBadges(){
  document.getElementById('badge-grid').innerHTML=BADGES.map(b=>{
    const isEarned=earned.includes(b.id);
    return '<div class="badge-card '+(isEarned?'earned':'locked')+'">'+
      '<div class="badge-emoji">'+b.emoji+'</div>'+
      '<div class="badge-info"><div class="badge-name">'+b.name+'</div>'+
      '<div class="badge-desc">'+b.desc+'</div>'+
      (isEarned?'':'<div class="badge-desc" style="margin-top:4px;color:var(--muted)">Locked</div>')+
      '</div></div>';
  }).join('');
}
function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}

// INIT
renderProgramInfo(); buildSchedule(); renderLog(); renderExercises(); updateXPBar(); renderBadges();
