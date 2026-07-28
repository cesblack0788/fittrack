// FitTrack
// ── PROFILE / MULTI-USER ─────────────────────────────────────
let activeUser = '';

function profileKey(suffix){ return 'ft_' + activeUser + '_' + suffix; }

function load(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}

function getAllUsers(){
  const users=load('ft_users',[]);
  return users;
}
function addUser(name){
  const users=getAllUsers();
  if(!users.includes(name)) users.push(name);
  save('ft_users', users);
}
function switchUser(name){
  activeUser = name.trim().toLowerCase().replace(/[^a-z0-9]/g,'_');
  save('ft_active_user', activeUser);
  save('ft_active_display', name.trim());
  loadUserData();
  updateXPBar();
  renderBadges();
  document.getElementById('profile-name-display').textContent = name.trim();
  document.getElementById('profile-modal').style.display = 'none';
}
function loadUserData(){
  history   = load(profileKey('history'),  []);
  xpTotal   = load(profileKey('xp'),       0);
  earned    = load(profileKey('badges'),   []);
  streak    = load(profileKey('streak'),   0);
  lastDate  = load(profileKey('lastDate'), null);
}
function saveHistory(){ save(profileKey('history'),  history); }
function saveXP()     { save(profileKey('xp'),       xpTotal); }
function saveBadges() { save(profileKey('badges'),   earned);  }
function saveStreak() { save(profileKey('streak'),   streak); save(profileKey('lastDate'), lastDate); }

// ── CONSTANTS ─────────────────────────────────────────────────
const XP_VAL={run:50,strength:30};
const LEVELS=[0,100,250,450,700,1000,1400,1900,2500,3200,4000];

const BADGES=[
  {id:'first_run', emoji:'🏃',name:'First Mile',   desc:'Complete your first HIIT run.',         check:(h)=>h.filter(x=>x.type==='run').length>=1},
  {id:'first_str', emoji:'💪',name:'Iron Will',    desc:'Complete your first strength workout.',  check:(h)=>h.filter(x=>x.type==='strength').length>=1},
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
  {id:'custom',    emoji:'🎨',name:'Goal Setter',  desc:'Create a custom training program.',      check:(h)=>h.some(x=>x.program==='custom')},
];const PROGRAMS={
  beginner:    {label:'Beginner',    desc:'Short runs with longer recovery to build your aerobic base.',warmup:120,cooldown:120,runTime:30, walkTime:90,rounds:8},
  intermediate:{label:'Intermediate',desc:'Balanced run/walk ratio to push your endurance threshold.', warmup:90, cooldown:90, runTime:60, walkTime:90,rounds:8},
  advanced:    {label:'Advanced',    desc:'Equal sprint and walk intervals for serious speed gains.',   warmup:60, cooldown:60, runTime:60, walkTime:60,rounds:10},
  custom:      {label:'Custom Goal', desc:'Your personalized plan based on your target mile time.',     warmup:90, cooldown:90, runTime:45, walkTime:75,rounds:8},
};
const EXERCISES={
  core:{label:'Core',emoji:'🔥',desc:'A strong core protects your lower back and powers every movement.',
    list:[
      {name:'Plank',            sets:'3x30-60s',  desc:'Forearm plank, body straight. Squeeze abs, glutes, quads.',                        tip:'Do not let hips sag or pike. Breathe steadily.',           yt:'plank exercise proper form'},
      {name:'Dead Bug',         sets:'3x10/side', desc:'On back, arms up, knees at 90. Lower opposite arm and leg, keep lower back flat.', tip:'Lower back stays pressed into the floor the whole time.',  yt:'dead bug core exercise tutorial'},
      {name:'Bicycle Crunches', sets:'3x20',      desc:'Hands behind head, bring elbow to opposite knee in a pedaling motion.',            tip:'Slow and controlled, do not yank your neck.',              yt:'bicycle crunches proper form'},
      {name:'Hollow Body Hold', sets:'3x20-40s',  desc:'On back, arms overhead, legs extended slightly off floor. Hold the shape.',        tip:'Too hard? Bend knees or keep arms at your sides.',         yt:'hollow body hold gymnastics tutorial'},
      {name:'Mountain Climbers',sets:'3x30s',     desc:'High plank. Drive knees to chest alternately as fast as possible.',                tip:'Keep hips level, do not let them rise.',                   yt:'mountain climbers exercise tutorial'},
      {name:'Russian Twists',   sets:'3x20',      desc:'Feet off floor, lean back slightly, rotate torso side to side.',                   tip:'Chest up, spine long, do not round forward.',              yt:'russian twists bodyweight tutorial'},
    ]},
  arms:{label:'Arms',emoji:'💪',desc:'Chest, shoulders, triceps, and biceps using only bodyweight.',
    list:[
      {name:'Push-Ups',             sets:'3x10-20', desc:'Hands shoulder-width, lower chest to floor, elbows at 45 degrees, press back up.',    tip:'Core and glutes tight the whole time.',                    yt:'push up perfect form tutorial'},
      {name:'Diamond Push-Ups',     sets:'3x8-15',  desc:'Thumbs and index fingers form a diamond under chest. Heavy tricep focus.',             tip:'Harder than regular push-ups, drop to knees if needed.',   yt:'diamond push up triceps tutorial'},
      {name:'Wide Push-Ups',        sets:'3x10-15', desc:'Hands wider than shoulder-width. More chest and front delt activation.',               tip:'3 seconds down, 1 second up for max chest work.',          yt:'wide grip push up chest workout'},
      {name:'Pike Push-Ups',        sets:'3x8-12',  desc:'Downward-dog position, lower head toward floor, press back up. Targets shoulders.',    tip:'More vertical torso equals more shoulder activation.',     yt:'pike push up shoulder workout tutorial'},
      {name:'Tricep Dips',          sets:'3x10-15', desc:'Hands on chair edge, lower by bending elbows to 90 degrees, press back up.',           tip:'Keep back close to chair, elbows point back not out.',     yt:'tricep dips chair bodyweight tutorial'},
      {name:'Isometric Bicep Curl', sets:'3x20s',   desc:'Grip doorframe palm-up at hip height. Drive hand up hard against frame and hold.',     tip:'No movement needed, pure tension builds strength.',        yt:'isometric bicep curl no equipment'},
    ]},
  legs:{label:'Legs',emoji:'🦵',desc:'Your biggest muscle group. Training legs boosts hormones and powers your runs.',
    list:[
      {name:'Bodyweight Squats',     sets:'3x15-25', desc:'Feet shoulder-width, push hips back and down, chest up, drive through heels.',        tip:'Go as deep as mobility allows. Depth builds muscle.',      yt:'bodyweight squat perfect form tutorial'},
      {name:'Reverse Lunges',        sets:'3x10/leg',desc:'Step back, drop rear knee toward floor, front knee over ankle, return.',               tip:'Easier on knees than forward lunges.',                     yt:'reverse lunge bodyweight proper form'},
      {name:'Glute Bridges',         sets:'3x20',    desc:'On back knees bent, drive hips up squeezing glutes until body is straight.',           tip:'Squeeze and hold 2 seconds at the top each rep.',          yt:'glute bridge exercise tutorial'},
      {name:'Jump Squats',           sets:'3x10',    desc:'Lower into squat then explode upward. Land softly bending knees.',                     tip:'Land quietly, soft landing means muscles not joints.',     yt:'jump squat plyometric tutorial'},
      {name:'Wall Sit',              sets:'3x30-60s',desc:'Back flat on wall, thighs parallel to floor, knees at 90 degrees. Hold.',              tip:'Back flat on wall, do not rest hands on knees.',           yt:'wall sit exercise tutorial'},
      {name:'Single-Leg Calf Raises',sets:'3x15/leg',desc:'Stand on one foot, rise onto toes as high as possible, lower slowly.',                tip:'Full range, all the way up and all the way down.',         yt:'single leg calf raise tutorial'},
    ]},
  fullbody:{label:'Full Body',emoji:'⚡',desc:'Hit everything in one session. Great for 3x per week.',
    list:[
      {name:'Burpees',          sets:'3x8-12',  desc:'Drop to push-up, do a push-up, jump feet to hands, explode into a jump overhead.',     tip:'Scale by removing the jump or push-up. Pace yourself.',    yt:'burpee exercise proper form tutorial'},
      {name:'Push-Ups',         sets:'3x10-20', desc:'Lower chest to floor, elbows at 45 degrees, press back up. Core rigid throughout.',    tip:'Body like a plank. Engage core the entire time.',          yt:'push up perfect form tutorial'},
      {name:'Bodyweight Squats',sets:'3x15',    desc:'Hip-width stance, sit back and down, chest up, drive through heels to stand.',         tip:'Arms out front for balance. Aim for thighs parallel.',     yt:'bodyweight squat perfect form tutorial'},
      {name:'Plank',            sets:'3x30-45s',desc:'Forearm plank, elbows under shoulders. Brace core like you are about to be hit.',      tip:'Breathe steadily. Do not hold your breath.',               yt:'plank exercise proper form tutorial'},
      {name:'Glute Bridges',    sets:'3x20',    desc:'On back, knees bent. Push hips to ceiling squeezing glutes, lower slowly.',            tip:'Hold the top for 2 seconds per rep.',                      yt:'glute bridge exercise tutorial'},
      {name:'Superman Hold',    sets:'3x12',    desc:'Face down, lift arms, chest, and legs simultaneously. Hold 2 seconds at top.',         tip:'Targets entire posterior chain.',                          yt:'superman exercise lower back tutorial'},
    ]},
};// ── STATE ─────────────────────────────────────────────────────
let history=[], xpTotal=0, earned=[], streak=0, lastDate=null;
let curProgram='beginner', curFocus='core', timerState='idle';
let intervalId=null, schedule=[], schedIdx=0, secsLeft=0, totalSecs=0, phaseDur=0;
let phaseEndTime=null;

// ── CUSTOM GOAL CALCULATOR ────────────────────────────────────
function calcCustomProgram(targetMinutes, currentLevel){
  // targetMinutes = desired mile time in minutes (e.g. 10)
  // currentLevel = 'beginner'|'intermediate'|'advanced'
  var pace = targetMinutes;
  var runTime, walkTime, rounds, warmup, cooldown;
  if(pace >= 12){
    runTime=20; walkTime=100; rounds=8; warmup=120; cooldown=120;
  } else if(pace >= 10){
    runTime=30; walkTime=90;  rounds=8; warmup=120; cooldown=120;
  } else if(pace >= 8){
    runTime=45; walkTime=75;  rounds=8; warmup=90;  cooldown=90;
  } else if(pace >= 7){
    runTime=60; walkTime=60;  rounds=9; warmup:90, cooldown:90,
  } else {
    runTime=60; walkTime=45;  rounds=10; warmup=60; cooldown=60;
  }
  if(currentLevel==='intermediate'){ runTime=Math.round(runTime*1.3); walkTime=Math.round(walkTime*0.85); }
  if(currentLevel==='advanced'){     runTime=Math.round(runTime*1.6); walkTime=Math.round(walkTime*0.7);  }
  PROGRAMS.custom.runTime=runTime;
  PROGRAMS.custom.walkTime=walkTime;
  PROGRAMS.custom.rounds=rounds;
  PROGRAMS.custom.warmup=warmup;
  PROGRAMS.custom.cooldown=cooldown;
  var totalMins=Math.round((warmup+cooldown+rounds*(runTime+walkTime))/60);
  PROGRAMS.custom.desc='Target: '+pace+' min mile. Run '+runTime+'s / Walk '+walkTime+'s x '+rounds+' rounds (~'+totalMins+' min total).';
}

// ── BACKGROUND TIMER ─────────────────────────────────────────
function saveTimerState(){
  if(timerState==='running' && phaseEndTime){
    save('ft_timer',{
      timerState:timerState, schedIdx:schedIdx,
      phaseEndTime:phaseEndTime, totalSecs:totalSecs,
      curProgram:curProgram, phaseDur:phaseDur
    });
  } else {
    save('ft_timer', null);
  }
}
function restoreTimerState(){
  var ts=load('ft_timer',null);
  if(!ts || !ts.phaseEndTime) return false;
  var now=Date.now();
  var remaining=Math.round((ts.phaseEndTime-now)/1000);
  if(remaining<=0){
    // Phase(s) may have passed while away - fast-forward
    var elapsed=Math.round((now-ts.phaseEndTime)/1000)*-1;
    schedIdx=ts.schedIdx;
    curProgram=ts.curProgram;
    buildSchedule();
    // Skip through phases that finished while away
    var offset=remaining;
    while(offset<=0 && schedIdx<schedule.length){
      offset+=schedule[schedIdx].duration;
      if(offset<=0) schedIdx++;
    }
    if(schedIdx>=schedule.length){ save('ft_timer',null); return false; }
    secsLeft=offset; phaseDur=schedule[schedIdx].duration; totalSecs=ts.totalSecs;
    timerState='running'; phaseEndTime=Date.now()+(secsLeft*1000);
    updateDisplay(schedule[schedIdx]);
    highlightLog();
    say('Welcome back! '+schedule[schedIdx].label);
    tick();
    document.getElementById('start-btn').disabled=true;
    document.getElementById('pause-btn').disabled=false;
    return true;
  }
  secsLeft=remaining; phaseDur=ts.phaseDur; totalSecs=ts.totalSecs;
  schedIdx=ts.schedIdx; curProgram=ts.curProgram;
  buildSchedule(); renderLog();
  timerState='running'; phaseEndTime=ts.phaseEndTime;
  updateDisplay(schedule[schedIdx]);
  highlightLog();
  tick();
  document.getElementById('start-btn').disabled=true;
  document.getElementById('pause-btn').disabled=false;
  return true;
}
document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='hidden') saveTimerState();
  if(document.visibilityState==='visible'){
    var ts=load('ft_timer',null);
    if(ts && ts.timerState==='running'){
      clearInterval(intervalId);
      restoreTimerState();
    }
  }
});// ── TABS ──────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active');});
    document.querySelectorAll('.tab-content').forEach(function(c){c.classList.remove('active');});
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
    if(btn.dataset.tab==='history') renderHistory();
    if(btn.dataset.tab==='badges')  renderBadges();
  });
});
// ── XP & LEVEL ────────────────────────────────────────────────
function getLevel(xp){for(var i=LEVELS.length-1;i>=0;i--){if(xp>=LEVELS[i])return i+1;}return 1;}
function getLevelProg(xp){
  var lvl=getLevel(xp),cur=LEVELS[lvl-1]||0,nxt=LEVELS[lvl]||LEVELS[LEVELS.length-1];
  return{pct:Math.min(100,Math.round(((xp-cur)/(nxt-cur))*100)),xpIn:xp-cur,xpTo:nxt-cur};
}
function addXP(amt,reason){
  var oldLvl=getLevel(xpTotal); xpTotal+=amt; saveXP();
  var newLvl=getLevel(xpTotal); updateXPBar(); showToast('xp','+'+amt+' XP - '+reason);
  if(newLvl>oldLvl) setTimeout(function(){showToast('badge','Level Up! You are now Level '+newLvl+'!');},600);
}
function updateXPBar(){
  var lvl=getLevel(xpTotal),p=getLevelProg(xpTotal);
  var display=load('ft_active_display','');
  document.getElementById('level-badge').textContent='Lvl '+lvl;
  document.getElementById('xp-label').textContent=p.xpIn+' / '+p.xpTo+' XP';
  document.getElementById('xp-fill').style.width=p.pct+'%';
  document.getElementById('streak-badge').textContent='🔥 '+streak;
  if(display) document.getElementById('profile-name-display').textContent=display;
}
// ── STREAK ────────────────────────────────────────────────────
function updateStreak(){
  var today=new Date().toDateString();
  if(lastDate===today) return;
  var yest=new Date(Date.now()-86400000).toDateString();
  streak=(lastDate===yest)?streak+1:1; lastDate=today; saveStreak(); updateXPBar();
  if(streak===3)  addXP(25,'3-day streak!');
  if(streak===7)  addXP(50,'7-day streak!');
  if(streak===14) addXP(100,'14-day streak!');
  if(streak>1) showToast('streak','🔥 '+streak+' day streak! Keep it up!');
}
// ── BADGES ────────────────────────────────────────────────────
function checkBadges(){
  BADGES.forEach(function(b){
    if(earned.includes(b.id)) return;
    if(b.check(history,streak)){ earned.push(b.id); saveBadges(); setTimeout(function(){showBadgeModal(b);},900); }
  });
}
function showBadgeModal(b){
  document.getElementById('modal-emoji').textContent=b.emoji;
  document.getElementById('modal-title').textContent=b.name;
  document.getElementById('modal-desc').textContent=b.desc;
  document.getElementById('badge-modal').style.display='flex';
}
function closeBadgeModal(){document.getElementById('badge-modal').style.display='none';}
// ── TOAST ─────────────────────────────────────────────────────
function showToast(type,msg){
  var c=document.getElementById('toast-container');
  var t=document.createElement('div'); t.className='toast '+type; t.textContent=msg; c.appendChild(t);
  setTimeout(function(){t.style.animation='slideOut .3s ease forwards';setTimeout(function(){t.remove();},300);},3000);
}
// ── LOG WORKOUT ───────────────────────────────────────────────
function logWorkout(type,details){
  var entry=Object.assign({id:Date.now(),date:new Date().toISOString(),type:type},details);
  history.unshift(entry); saveHistory(); updateStreak();
  addXP(type==='run'?XP_VAL.run:XP_VAL.strength,type==='run'?'HIIT run complete!':'Strength workout logged!');
  checkBadges(); renderBadges();
}// ── PROGRAM SELECTOR ─────────────────────────────────────────
document.querySelectorAll('.program-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    document.querySelectorAll('.program-btn').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active'); curProgram=btn.dataset.program;
    if(curProgram==='custom') document.getElementById('custom-goal-panel').style.display='block';
    else document.getElementById('custom-goal-panel').style.display='none';
    if(timerState!=='idle') resetTimer();
    renderProgramInfo(); buildSchedule(); renderLog();
  });
});
document.getElementById('calc-custom-btn').addEventListener('click',function(){
  var mins=parseFloat(document.getElementById('goal-mile-time').value);
  var lvl=document.getElementById('goal-level').value;
  if(!mins||mins<5||mins>20){showToast('xp','Enter a mile time between 5 and 20 minutes.');return;}
  calcCustomProgram(mins,lvl);
  if(timerState!=='idle') resetTimer();
  renderProgramInfo(); buildSchedule(); renderLog();
  document.getElementById('custom-goal-panel').style.display='none';
  showToast('badge','Custom program created! Run '+PROGRAMS.custom.runTime+'s / Walk '+PROGRAMS.custom.walkTime+'s');
});
function renderProgramInfo(){
  var p=PROGRAMS[curProgram];
  var mins=Math.round((p.warmup+p.cooldown+p.rounds*(p.runTime+p.walkTime))/60);
  document.getElementById('program-info').innerHTML='<strong>'+p.label+'</strong> - '+p.desc+
    '<div class="info-grid">'+
    '<div class="info-item"><div class="val">'+p.runTime+'s</div><div class="lbl">Run</div></div>'+
    '<div class="info-item"><div class="val">'+p.walkTime+'s</div><div class="lbl">Walk</div></div>'+
    '<div class="info-item"><div class="val">~'+mins+'m</div><div class="lbl">Total</div></div>'+
    '</div>';
}
function buildSchedule(){
  var p=PROGRAMS[curProgram]; schedule=[];
  schedule.push({type:'warmup',label:'Warm-Up Walk',duration:p.warmup});
  for(var i=0;i<p.rounds;i++){
    schedule.push({type:'run',label:'RUN!',duration:p.runTime});
    schedule.push({type:'walk',label:'Walk / Recover',duration:p.walkTime});
  }
  schedule.push({type:'cooldown',label:'Cool-Down Walk',duration:p.cooldown});
  totalSecs=schedule.reduce(function(s,x){return s+x.duration;},0);
  document.getElementById('total-rounds').textContent=p.rounds;
}
function renderLog(){
  document.getElementById('log-list').innerHTML=schedule.map(function(item,i){
    return '<div class="log-item" id="log-'+i+'">'+
      '<div class="log-dot '+item.type+'"></div>'+
      '<div class="log-name">'+item.label+'</div>'+
      '<div class="log-duration">'+fmt(item.duration)+'</div></div>';
  }).join('');
}
// ── TIMER CONTROLS ────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click',startTimer);
document.getElementById('pause-btn').addEventListener('click',pauseTimer);
document.getElementById('reset-btn').addEventListener('click',resetTimer);
function startTimer(){
  if(timerState==='idle'){schedIdx=0;beginPhase();}
  else if(timerState==='paused'){timerState='running';phaseEndTime=Date.now()+(secsLeft*1000);tick();}
  document.getElementById('start-btn').disabled=true;
  document.getElementById('pause-btn').disabled=false;
  hideBanner();
}
function pauseTimer(){
  if(timerState!=='running') return;
  timerState='paused'; clearInterval(intervalId); save('ft_timer',null);
  document.getElementById('start-btn').disabled=false;
  document.getElementById('start-btn').textContent='Resume';
  document.getElementById('pause-btn').disabled=true;
}
function resetTimer(){
  clearInterval(intervalId); timerState='idle'; schedIdx=0; secsLeft=0; phaseEndTime=null; save('ft_timer',null);
  document.getElementById('start-btn').disabled=false;
  document.getElementById('start-btn').textContent='Start';
  document.getElementById('pause-btn').disabled=true;
  document.getElementById('timer-display').textContent='--:--';
  document.getElementById('interval-label').textContent='Press Start';
  document.getElementById('current-round').textContent='0';
  var b=document.getElementById('phase-badge'); b.textContent='Ready'; b.className='phase-badge';
  var r=document.getElementById('ring-progress'); r.style.strokeDashoffset='0'; r.className='ring-progress';
  document.getElementById('progress-fill').style.width='0%';
  document.getElementById('progress-pct').textContent='0%';
  renderLog(); hideBanner();
}
function beginPhase(){
  if(schedIdx>=schedule.length){finishWorkout();return;}
  var ph=schedule[schedIdx]; secsLeft=ph.duration; phaseDur=ph.duration;
  phaseEndTime=Date.now()+(secsLeft*1000);
  timerState='running'; updateDisplay(ph); speak(ph); highlightLog(); tick();
}
function tick(){
  clearInterval(intervalId);
  intervalId=setInterval(function(){
    secsLeft=Math.max(0,Math.round((phaseEndTime-Date.now())/1000));
    document.getElementById('timer-display').textContent=fmt(secsLeft);
    document.getElementById('ring-progress').style.strokeDashoffset=339.3*(1-secsLeft/phaseDur);
    var elapsed=schedule.slice(0,schedIdx).reduce(function(s,x){return s+x.duration;},0)+(phaseDur-secsLeft);
    var pct=Math.min(100,Math.round((elapsed/totalSecs)*100));
    document.getElementById('progress-fill').style.width=pct+'%';
    document.getElementById('progress-pct').textContent=pct+'%';
    if(secsLeft<=0){clearInterval(intervalId);schedIdx++;if(timerState==='running')beginPhase();}
  },500);
}function updateDisplay(ph){
  document.getElementById('timer-display').textContent=fmt(secsLeft);
  document.getElementById('interval-label').textContent=ph.label;
  var b=document.getElementById('phase-badge'); b.textContent=ph.label; b.className='phase-badge '+ph.type;
  var r=document.getElementById('ring-progress'); r.className='ring-progress '+ph.type; r.style.strokeDashoffset='0';
  if(ph.type==='run'){
    var n=schedule.slice(0,schedIdx+1).filter(function(s){return s.type==='run';}).length;
    document.getElementById('current-round').textContent=n;
  }
}
function highlightLog(){
  document.querySelectorAll('.log-item').forEach(function(el,i){
    el.classList.remove('active-log','done-log');
    if(i<schedIdx) el.classList.add('done-log');
    if(i===schedIdx){el.classList.add('active-log');el.scrollIntoView({behavior:'smooth',block:'nearest'});}
  });
}
function finishWorkout(){
  timerState='idle'; save('ft_timer',null);
  document.getElementById('timer-display').textContent='Done!';
  document.getElementById('interval-label').textContent='Complete!';
  document.getElementById('start-btn').disabled=true;
  document.getElementById('pause-btn').disabled=true;
  var b=document.getElementById('phase-badge'); b.textContent='Done!'; b.className='phase-badge walk';
  document.getElementById('progress-fill').style.width='100%';
  document.getElementById('progress-pct').textContent='100%';
  document.querySelectorAll('.log-item').forEach(function(el){el.classList.add('done-log');});
  showBanner(); logWorkout('run',{program:curProgram,rounds:PROGRAMS[curProgram].rounds});
  say('Workout complete! Amazing job. Rest up and come back stronger.');
}
function showBanner(){
  var b=document.getElementById('completion-banner');
  if(!b){b=document.createElement('div');b.id='completion-banner';b.className='completion-banner';
    b.innerHTML='<h3>Workout Complete!</h3><p>Great work! Rest 1-2 days before your next HIIT session.</p>';
    document.getElementById('tab-running').querySelector('.card').appendChild(b);}
  b.classList.add('show');
}
function hideBanner(){var b=document.getElementById('completion-banner');if(b)b.classList.remove('show');}
function speak(ph){
  var msgs={warmup:'Warm up. Start walking.',run:'Run! Push hard!',walk:'Walk. Recover.',cooldown:'Cool down. Nice work.'};
  say(msgs[ph.type]||ph.label);
}
function say(text){
  if(!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(text); u.rate=1.0; u.pitch=1.0; u.volume=1.0;
  window.speechSynthesis.speak(u);
}
// ── BODYWEIGHT ────────────────────────────────────────────────
document.querySelectorAll('.focus-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    document.querySelectorAll('.focus-btn').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active'); curFocus=btn.dataset.focus; renderExercises();
  });
});
document.getElementById('log-workout-btn').addEventListener('click',function(){
  logWorkout('strength',{focus:curFocus});
  var btn=document.getElementById('log-workout-btn');
  btn.textContent='Logged!'; btn.style.background='#51cf66';
  setTimeout(function(){btn.textContent='Log This Workout';btn.style.background='';},2500);
});
function renderExercises(){
  var d=EXERCISES[curFocus];
  document.getElementById('workout-header').innerHTML='<h3>'+d.emoji+' '+d.label+' Workout</h3><p>'+d.desc+'</p>';
  document.getElementById('exercise-grid').innerHTML=d.list.map(function(ex){
    return '<div class="exercise-card">'+
      '<div class="ex-header"><div class="ex-title">'+ex.name+'</div><div class="ex-sets">'+ex.sets+'</div></div>'+
      '<div class="ex-desc">'+ex.desc+'</div>'+
      '<div class="ex-tips"><strong>Tip:</strong> '+ex.tip+'</div>'+
      '<a class="ex-video-btn" href="https://www.youtube.com/results?search_query='+encodeURIComponent(ex.yt)+'" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>'+
      '</div>';
  }).join('');
}// ── HISTORY ───────────────────────────────────────────────────
function renderHistory(){
  var runs=history.filter(function(x){return x.type==='run';}).length;
  var strs=history.filter(function(x){return x.type==='strength';}).length;
  document.getElementById('stats-row').innerHTML=
    '<div class="stat-card"><div class="stat-val">'+history.length+'</div><div class="stat-lbl">Total Workouts</div></div>'+
    '<div class="stat-card"><div class="stat-val">'+runs+'</div><div class="stat-lbl">HIIT Runs</div></div>'+
    '<div class="stat-card"><div class="stat-val">'+streak+'</div><div class="stat-lbl">Day Streak</div></div>';
  renderCalendar();
  if(history.length===0){
    document.getElementById('history-list').innerHTML='<div class="empty-state">No workouts yet. Complete a session to start tracking!</div>';
    return;
  }
  var icons={core:'🔥',arms:'💪',legs:'🦵',fullbody:'⚡'};
  document.getElementById('history-list').innerHTML=history.map(function(e){
    var d=new Date(e.date);
    var ds=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    var ts=d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
    var icon=e.type==='run'?'🏃':(icons[e.focus]||'🏋');
    var pLabel=e.program&&PROGRAMS[e.program]?PROGRAMS[e.program].label:e.program||'';
    var title=e.type==='run'?('HIIT Run - '+pLabel):('Strength - '+(EXERCISES[e.focus]?EXERCISES[e.focus].label:e.focus||'Workout'));
    var xpv=e.type==='run'?XP_VAL.run:XP_VAL.strength;
    return '<div class="history-item">'+
      '<div class="history-icon">'+icon+'</div>'+
      '<div class="history-info"><div class="history-title">'+title+'</div><div class="history-meta">'+ds+' at '+ts+'</div></div>'+
      '<div class="history-xp">+'+xpv+' XP</div></div>';
  }).join('');
}
function renderCalendar(){
  var grid=document.getElementById('calendar-grid');
  var today=new Date(); var days=[];
  for(var i=41;i>=0;i--){var d=new Date(today);d.setDate(today.getDate()-i);days.push(d);}
  var wd={};
  history.forEach(function(e){var k=new Date(e.date).toDateString();if(!wd[k])wd[k]=[];wd[k].push(e.type);});
  grid.innerHTML=days.map(function(d){
    var k=d.toDateString(); var types=wd[k]||[]; var isT=k===today.toDateString();
    var cls='cal-day'+(isT?' today':'');
    var r=types.indexOf('run')>=0, s=types.indexOf('strength')>=0;
    if(r&&s) cls+=' has-both'; else if(r) cls+=' has-run'; else if(s) cls+=' has-strength';
    return '<div class="'+cls+'" title="'+k+'">'+d.getDate()+'</div>';
  }).join('');
}
// ── BADGES ────────────────────────────────────────────────────
function renderBadges(){
  document.getElementById('badge-grid').innerHTML=BADGES.map(function(b){
    var isE=earned.includes(b.id);
    return '<div class="badge-card '+(isE?'earned':'locked')+'">'+
      '<div class="badge-emoji">'+b.emoji+'</div>'+
      '<div class="badge-info"><div class="badge-name">'+b.name+'</div>'+
      '<div class="badge-desc">'+b.desc+'</div>'+
      (!isE?'<div class="badge-desc" style="margin-top:4px;color:var(--muted)">Locked</div>':'')+
      '</div></div>';
  }).join('');
}
// ── PROFILE UI ────────────────────────────────────────────────
document.getElementById('profile-name-display').addEventListener('click',function(){
  document.getElementById('profile-modal').style.display='flex';
  renderUserList();
});
function renderUserList(){
  var users=getAllUsers();
  var active=load('ft_active_display','');
  var html=users.map(function(u){
    return '<button class="user-btn'+(u===active?' active-user':'')+'" onclick="switchUser(\''+u.replace(/'/g,'')+'\')" >'+u+'</button>';
  }).join('');
  document.getElementById('user-list').innerHTML=html||'<p style="color:var(--muted);font-size:.85rem">No profiles yet.</p>';
}
document.getElementById('create-user-btn').addEventListener('click',function(){
  var n=document.getElementById('new-user-input').value.trim();
  if(!n){showToast('xp','Enter a name first.');return;}
  addUser(n); switchUser(n);
  document.getElementById('new-user-input').value='';
});
document.getElementById('close-profile-btn').addEventListener('click',function(){
  document.getElementById('profile-modal').style.display='none';
});
// ── HELPERS ───────────────────────────────────────────────────
function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
// ── INIT ──────────────────────────────────────────────────────
(function init(){
  var savedUser=load('ft_active_user','');
  var savedDisplay=load('ft_active_display','');
  if(savedUser){
    activeUser=savedUser; loadUserData();
    document.getElementById('profile-name-display').textContent=savedDisplay||savedUser;
  } else {
    document.getElementById('profile-modal').style.display='flex';
    renderUserList();
  }
  renderProgramInfo(); buildSchedule(); renderLog(); renderExercises(); updateXPBar(); renderBadges();
  restoreTimerState();
})();
