var activeUser="";
function profileKey(s){return "ft_"+activeUser+"_"+s;}
function load(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function getAllUsers(){return load("ft_users",[]);}
function addUser(n){var u=getAllUsers();if(u.indexOf(n)<0)u.push(n);save("ft_users",u);}
function switchUser(name){
  activeUser=name.trim().toLowerCase().replace(/[^a-z0-9]/g,"_");
  save("ft_active_user",activeUser);save("ft_active_display",name.trim());
  loadUserData();updateXPBar();renderBadges();
  document.getElementById("profile-name-display").textContent=name.trim();
  document.getElementById("profile-modal").style.display="none";}
function loadUserData(){
  history=load(profileKey("history"),[]);xpTotal=load(profileKey("xp"),0);
  earned=load(profileKey("badges"),[]);streak=load(profileKey("streak"),0);
  lastDate=load(profileKey("lastDate"),null);}
function saveHistory(){save(profileKey("history"),history);}
function saveXP(){save(profileKey("xp"),xpTotal);}
function saveBadges(){save(profileKey("badges"),earned);}
function saveStreak(){save(profileKey("streak"),streak);save(profileKey("lastDate"),lastDate);}
var XP_VAL={run:50,strength:30};
var LEVELS=[0,100,250,450,700,1000,1400,1900,2500,3200,4000];
var BADGES=[
  {id:"first_run", e:"Run",  name:"First Mile",    desc:"Complete your first HIIT run.",         check:function(h){return h.filter(function(x){return x.type==="run";}).length>=1;}},
  {id:"first_str", e:"Lift", name:"Iron Will",     desc:"Complete your first strength workout.",  check:function(h){return h.filter(function(x){return x.type==="strength";}).length>=1;}},
  {id:"streak_3",  e:"Fire", name:"On Fire",       desc:"Work out 3 days in a row.",              check:function(h,s){return s>=3;}},
  {id:"streak_7",  e:"Bolt", name:"Week Warrior",  desc:"Work out 7 days in a row.",              check:function(h,s){return s>=7;}},
  {id:"streak_14", e:"Star", name:"Unstoppable",   desc:"Work out 14 days in a row.",             check:function(h,s){return s>=14;}},
  {id:"runs_5",    e:"Shoe", name:"Road Runner",   desc:"Complete 5 HIIT sessions.",              check:function(h){return h.filter(function(x){return x.type==="run";}).length>=5;}},
  {id:"runs_10",   e:"Med",  name:"Mile Chaser",   desc:"Complete 10 HIIT sessions.",             check:function(h){return h.filter(function(x){return x.type==="run";}).length>=10;}},
  {id:"runs_25",   e:"Gold", name:"Speed Demon",   desc:"Complete 25 HIIT sessions.",             check:function(h){return h.filter(function(x){return x.type==="run";}).length>=25;}},
  {id:"str_5",     e:"Gym",  name:"Body Builder",  desc:"Complete 5 strength workouts.",          check:function(h){return h.filter(function(x){return x.type==="strength";}).length>=5;}},
  {id:"str_10",    e:"Arm",  name:"Iron Body",     desc:"Complete 10 strength workouts.",         check:function(h){return h.filter(function(x){return x.type==="strength";}).length>=10;}},
  {id:"total_20",  e:"Dart", name:"Committed",     desc:"Log 20 total workouts.",                 check:function(h){return h.length>=20;}},
  {id:"total_50",  e:"Crown",name:"Legend",        desc:"Log 50 total workouts.",                 check:function(h){return h.length>=50;}},
  {id:"advanced",  e:"Bolt", name:"Advanced Mode", desc:"Complete an Advanced HIIT session.",     check:function(h){return h.filter(function(x){return x.type==="run"&&x.program==="advanced";}).length>=1;}},
  {id:"early",     e:"Sun",  name:"Early Bird",    desc:"Log a workout before 8am.",              check:function(h){return h.some(function(x){return new Date(x.date).getHours()<8;});}},
  {id:"custom",    e:"Goal", name:"Goal Setter",   desc:"Create a custom training program.",      check:function(h){return h.some(function(x){return x.program==="custom";});}},
];
var PROGRAMS={
  beginner:    {label:"Beginner",    desc:"Short runs with longer recovery to build your aerobic base.",warmup:120,cooldown:120,runTime:30, walkTime:90, rounds:8},
  intermediate:{label:"Intermediate",desc:"Balanced run/walk ratio to push your endurance threshold.", warmup:90, cooldown:90, runTime:60, walkTime:90, rounds:8},
  advanced:    {label:"Advanced",    desc:"Equal sprint and walk intervals for serious speed gains.",   warmup:60, cooldown:60, runTime:60, walkTime:60, rounds:10},
  custom:      {label:"Custom Goal", desc:"Your personalized plan based on your target mile time.",     warmup:90, cooldown:90, runTime:45, walkTime:75, rounds:8},
};
var EXERCISES={
  core:{label:"Core",icon:"[Core]",desc:"A strong core protects your lower back and powers every movement.",list:[
    {name:"Plank",            sets:"3x30-60s",  desc:"Forearm plank, body straight. Squeeze abs, glutes, quads.",                         tip:"Do not let hips sag or pike. Breathe steadily.",            yt:"plank exercise proper form"},
    {name:"Dead Bug",         sets:"3x10/side", desc:"On back, arms up, knees at 90. Lower opposite arm and leg, keep lower back flat.",  tip:"Lower back stays pressed into the floor the whole time.",   yt:"dead bug core exercise tutorial"},
    {name:"Bicycle Crunches", sets:"3x20",      desc:"Hands behind head, bring elbow to opposite knee in a pedaling motion.",             tip:"Slow and controlled, do not yank your neck.",               yt:"bicycle crunches proper form"},
    {name:"Hollow Body Hold", sets:"3x20-40s",  desc:"On back, arms overhead, legs extended slightly off floor. Hold the shape.",         tip:"Too hard? Bend knees or keep arms at your sides.",          yt:"hollow body hold gymnastics tutorial"},
    {name:"Mountain Climbers",sets:"3x30s",     desc:"High plank. Drive knees to chest alternately as fast as possible.",                 tip:"Keep hips level, do not let them rise.",                    yt:"mountain climbers exercise tutorial"},
    {name:"Russian Twists",   sets:"3x20",      desc:"Feet off floor, lean back slightly, rotate torso side to side.",                   tip:"Chest up, spine long, do not round forward.",               yt:"russian twists bodyweight tutorial"},
  ]},
  arms:{label:"Arms",icon:"[Arms]",desc:"Chest, shoulders, triceps, and biceps using only bodyweight.",list:[
    {name:"Push-Ups",             sets:"3x10-20", desc:"Hands shoulder-width, lower chest to floor, elbows at 45 degrees, press back up.",   tip:"Core and glutes tight the whole time.",                     yt:"push up perfect form tutorial"},
    {name:"Diamond Push-Ups",     sets:"3x8-15",  desc:"Thumbs and index fingers form a diamond under chest. Heavy tricep focus.",           tip:"Harder than regular push-ups, drop to knees if needed.",    yt:"diamond push up triceps tutorial"},
    {name:"Wide Push-Ups",        sets:"3x10-15", desc:"Hands wider than shoulder-width. More chest and front delt activation.",             tip:"3 seconds down, 1 second up for max chest work.",           yt:"wide grip push up chest workout"},
    {name:"Pike Push-Ups",        sets:"3x8-12",  desc:"Downward-dog position, lower head toward floor, press back up. Targets shoulders.",  tip:"More vertical torso equals more shoulder activation.",      yt:"pike push up shoulder workout tutorial"},
    {name:"Tricep Dips",          sets:"3x10-15", desc:"Hands on chair edge, lower by bending elbows to 90 degrees, press back up.",         tip:"Keep back close to chair, elbows point back not out.",      yt:"tricep dips chair bodyweight tutorial"},
    {name:"Isometric Bicep Curl", sets:"3x20s",   desc:"Grip doorframe palm-up at hip height. Drive hand up hard against frame and hold.",   tip:"No movement needed, pure tension builds strength.",         yt:"isometric bicep curl no equipment"},
  ]},
  legs:{label:"Legs",icon:"[Legs]",desc:"Your biggest muscle group. Training legs boosts hormones and powers your runs.",list:[
    {name:"Bodyweight Squats",     sets:"3x15-25", desc:"Feet shoulder-width, push hips back and down, chest up, drive through heels.",       tip:"Go as deep as mobility allows. Depth builds muscle.",        yt:"bodyweight squat perfect form tutorial"},
    {name:"Reverse Lunges",        sets:"3x10/leg",desc:"Step back, drop rear knee toward floor, front knee over ankle, return.",              tip:"Easier on knees than forward lunges.",                       yt:"reverse lunge bodyweight proper form"},
    {name:"Glute Bridges",         sets:"3x20",    desc:"On back knees bent, drive hips up squeezing glutes until body is straight.",          tip:"Squeeze and hold 2 seconds at the top each rep.",            yt:"glute bridge exercise tutorial"},
    {name:"Jump Squats",           sets:"3x10",    desc:"Lower into squat then explode upward. Land softly bending knees.",                    tip:"Land quietly, soft landing means muscles not joints.",       yt:"jump squat plyometric tutorial"},
    {name:"Wall Sit",              sets:"3x30-60s",desc:"Back flat on wall, thighs parallel to floor, knees at 90 degrees. Hold.",             tip:"Back flat on wall, do not rest hands on knees.",             yt:"wall sit exercise tutorial"},
    {name:"Single-Leg Calf Raises",sets:"3x15/leg",desc:"Stand on one foot, rise onto toes as high as possible, lower slowly.",               tip:"Full range, all the way up and all the way down.",           yt:"single leg calf raise tutorial"},
  ]},
  fullbody:{label:"Full Body",icon:"[Full]",desc:"Hit everything in one session. Great for 3x per week.",list:[
    {name:"Burpees",          sets:"3x8-12",  desc:"Drop to push-up, do a push-up, jump feet to hands, explode into a jump overhead.",     tip:"Scale by removing the jump or push-up. Pace yourself.",      yt:"burpee exercise proper form tutorial"},
    {name:"Push-Ups",         sets:"3x10-20", desc:"Lower chest to floor, elbows at 45 degrees, press back up. Core rigid throughout.",    tip:"Body like a plank. Engage core the entire time.",            yt:"push up perfect form tutorial"},
    {name:"Bodyweight Squats",sets:"3x15",    desc:"Hip-width stance, sit back and down, chest up, drive through heels to stand.",         tip:"Arms out front for balance. Aim for thighs parallel.",       yt:"bodyweight squat perfect form tutorial"},
    {name:"Plank",            sets:"3x30-45s",desc:"Forearm plank, elbows under shoulders. Brace core like you are about to be hit.",      tip:"Breathe steadily. Do not hold your breath.",                 yt:"plank exercise proper form tutorial"},
    {name:"Glute Bridges",    sets:"3x20",    desc:"On back, knees bent. Push hips to ceiling squeezing glutes, lower slowly.",            tip:"Hold the top for 2 seconds per rep.",                        yt:"glute bridge exercise tutorial"},
    {name:"Superman Hold",    sets:"3x12",    desc:"Face down, lift arms, chest, and legs simultaneously. Hold 2 seconds at top.",         tip:"Targets entire posterior chain.",                            yt:"superman exercise lower back tutorial"},
  ]},
};
var history=[],xpTotal=0,earned=[],streak=0,lastDate=null;
var curProgram="beginner",curFocus="core",timerState="idle";
var intervalId=null,schedule=[],schedIdx=0,secsLeft=0,totalSecs=0,phaseDur=0,phaseEndTime=null;
function calcCustomProgram(pace,level){
  var r,w,n,wu,cd;
  if(pace>=12){r=20;w=100;n=8;wu=120;cd=120;}
  else if(pace>=10){r=30;w=90;n=8;wu=120;cd=120;}
  else if(pace>=8){r=45;w=75;n=8;wu=90;cd=90;}
  else if(pace>=7){r=60;w=60;n=9;wu=90;cd=90;}
  else{r=60;w=45;n=10;wu=60;cd=60;}
  if(level==="intermediate"){r=Math.round(r*1.3);w=Math.round(w*0.85);}
  if(level==="advanced"){r=Math.round(r*1.6);w=Math.round(w*0.7);}
  PROGRAMS.custom.runTime=r;PROGRAMS.custom.walkTime=w;PROGRAMS.custom.rounds=n;
  PROGRAMS.custom.warmup=wu;PROGRAMS.custom.cooldown=cd;
  var tot=Math.round((wu+cd+n*(r+w))/60);
  PROGRAMS.custom.desc="Target: "+pace+" min mile. Run "+r+"s / Walk "+w+"s x "+n+" rounds (~"+tot+" min).";
}
function saveTimerState(){
  if(timerState==="running"&&phaseEndTime){
    save("ft_timer",{timerState:timerState,schedIdx:schedIdx,phaseEndTime:phaseEndTime,totalSecs:totalSecs,curProgram:curProgram,phaseDur:phaseDur});
  }else{save("ft_timer",null);}
}
function restoreTimerState(){
  var ts=load("ft_timer",null);
  if(!ts||!ts.phaseEndTime)return false;
  var now=Date.now();
  curProgram=ts.curProgram;totalSecs=ts.totalSecs;phaseDur=ts.phaseDur;schedIdx=ts.schedIdx;
  buildSchedule();renderLog();
  var remaining=Math.round((ts.phaseEndTime-now)/1000);
  if(remaining<=0){
    var over=Math.abs(remaining);
    while(over>0&&schedIdx<schedule.length){over-=schedule[schedIdx].duration;schedIdx++;}
    if(schedIdx>=schedule.length){save("ft_timer",null);return false;}
    secsLeft=Math.abs(over);
  }else{secsLeft=remaining;}
  phaseDur=schedule[schedIdx]?schedule[schedIdx].duration:phaseDur;
  phaseEndTime=Date.now()+(secsLeft*1000);
  timerState="running";
  updateDisplay(schedule[schedIdx]);highlightLog();tick();
  document.getElementById("start-btn").disabled=true;
  document.getElementById("pause-btn").disabled=false;
  if(remaining<=0)say("Welcome back! "+schedule[schedIdx].label);
  return true;
}
document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="hidden")saveTimerState();
  if(document.visibilityState==="visible"){
    var ts=load("ft_timer",null);
    if(ts&&ts.timerState==="running"){clearInterval(intervalId);restoreTimerState();}
  }
});
document.querySelectorAll(".tab-btn").forEach(function(btn){
  btn.addEventListener("click",function(){
    document.querySelectorAll(".tab-btn").forEach(function(b){b.classList.remove("active");});
    document.querySelectorAll(".tab-content").forEach(function(c){c.classList.remove("active");});
    btn.classList.add("active");document.getElementById("tab-"+btn.dataset.tab).classList.add("active");
    if(btn.dataset.tab==="history")renderHistory();
    if(btn.dataset.tab==="badges")renderBadges();
  });
});
function getLevel(xp){for(var i=LEVELS.length-1;i>=0;i--){if(xp>=LEVELS[i])return i+1;}return 1;}
function getLevelProg(xp){var lvl=getLevel(xp),cur=LEVELS[lvl-1]||0,nxt=LEVELS[lvl]||LEVELS[LEVELS.length-1];return{pct:Math.min(100,Math.round(((xp-cur)/(nxt-cur))*100)),xpIn:xp-cur,xpTo:nxt-cur};}
function addXP(amt,reason){var ol=getLevel(xpTotal);xpTotal+=amt;saveXP();var nl=getLevel(xpTotal);updateXPBar();showToast("xp","+"+amt+" XP - "+reason);if(nl>ol)setTimeout(function(){showToast("badge","Level Up! You are now Level "+nl+"!");},600);}
function updateXPBar(){var lvl=getLevel(xpTotal),p=getLevelProg(xpTotal),disp=load("ft_active_display","");document.getElementById("level-badge").textContent="Lvl "+lvl;document.getElementById("xp-label").textContent=p.xpIn+" / "+p.xpTo+" XP";document.getElementById("xp-fill").style.width=p.pct+"%";document.getElementById("streak-badge").textContent="Streak: "+streak;if(disp)document.getElementById("profile-name-display").textContent=disp;}
function updateStreak(){var today=new Date().toDateString();if(lastDate===today)return;var yest=new Date(Date.now()-86400000).toDateString();streak=(lastDate===yest)?streak+1:1;lastDate=today;saveStreak();updateXPBar();if(streak===3)addXP(25,"3-day streak!");if(streak===7)addXP(50,"7-day streak!");if(streak===14)addXP(100,"14-day streak!");if(streak>1)showToast("streak","Streak: "+streak+" days! Keep it up!");}
function checkBadges(){BADGES.forEach(function(b){if(earned.indexOf(b.id)>=0)return;if(b.check(history,streak)){earned.push(b.id);saveBadges();setTimeout(function(){showBadgeModal(b);},900);}});}
function showBadgeModal(b){document.getElementById("modal-emoji").textContent=b.e;document.getElementById("modal-title").textContent=b.name;document.getElementById("modal-desc").textContent=b.desc;document.getElementById("badge-modal").style.display="flex";}
function closeBadgeModal(){document.getElementById("badge-modal").style.display="none";}
function showToast(type,msg){var c=document.getElementById("toast-container");var t=document.createElement("div");t.className="toast "+type;t.textContent=msg;c.appendChild(t);setTimeout(function(){t.style.animation="slideOut .3s ease forwards";setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},300);},3000);}
function logWorkout(type,details){var entry=Object.assign({id:Date.now(),date:new Date().toISOString(),type:type},details);history.unshift(entry);saveHistory();updateStreak();addXP(type==="run"?XP_VAL.run:XP_VAL.strength,type==="run"?"HIIT run complete!":"Strength workout logged!");checkBadges();renderBadges();}
document.querySelectorAll(".program-btn").forEach(function(btn){btn.addEventListener("click",function(){document.querySelectorAll(".program-btn").forEach(function(b){b.classList.remove("active");});btn.classList.add("active");curProgram=btn.dataset.program;document.getElementById("custom-goal-panel").style.display=(curProgram==="custom")?"block":"none";if(timerState!=="idle")resetTimer();renderProgramInfo();buildSchedule();renderLog();});});
document.getElementById("calc-custom-btn").addEventListener("click",function(){var mins=parseFloat(document.getElementById("goal-mile-time").value),lvl=document.getElementById("goal-level").value;if(!mins||mins<5||mins>20){showToast("xp","Enter a mile time between 5 and 20 minutes.");return;}calcCustomProgram(mins,lvl);if(timerState!=="idle")resetTimer();renderProgramInfo();buildSchedule();renderLog();document.getElementById("custom-goal-panel").style.display="none";showToast("badge","Custom program created! Run "+PROGRAMS.custom.runTime+"s / Walk "+PROGRAMS.custom.walkTime+"s");});
function buildSchedule(){var p=PROGRAMS[curProgram];schedule=[];schedule.push({type:"warmup",label:"Warm-Up Walk",duration:p.warmup});for(var i=0;i<p.rounds;i++){schedule.push({type:"run",label:"RUN!",duration:p.runTime});schedule.push({type:"walk",label:"Walk / Recover",duration:p.walkTime});}schedule.push({type:"cooldown",label:"Cool-Down Walk",duration:p.cooldown});totalSecs=schedule.reduce(function(s,x){return s+x.duration;},0);document.getElementById("total-rounds").textContent=p.rounds;}
document.getElementById("start-btn").addEventListener("click",startTimer);
document.getElementById("pause-btn").addEventListener("click",pauseTimer);
document.getElementById("reset-btn").addEventListener("click",resetTimer);
function startTimer(){if(timerState==="idle"){schedIdx=0;beginPhase();}else if(timerState==="paused"){timerState="running";phaseEndTime=Date.now()+(secsLeft*1000);tick();}document.getElementById("start-btn").disabled=true;document.getElementById("pause-btn").disabled=false;hideBanner();}
function pauseTimer(){if(timerState!=="running")return;timerState="paused";clearInterval(intervalId);save("ft_timer",null);document.getElementById("start-btn").disabled=false;document.getElementById("start-btn").textContent="Resume";document.getElementById("pause-btn").disabled=true;}
function resetTimer(){clearInterval(intervalId);timerState="idle";schedIdx=0;secsLeft=0;phaseEndTime=null;save("ft_timer",null);document.getElementById("start-btn").disabled=false;document.getElementById("start-btn").textContent="Start";document.getElementById("pause-btn").disabled=true;document.getElementById("timer-display").textContent="--:--";document.getElementById("interval-label").textContent="Press Start";document.getElementById("current-round").textContent="0";var b=document.getElementById("phase-badge");b.textContent="Ready";b.className="phase-badge";var r=document.getElementById("ring-progress");r.style.strokeDashoffset="0";r.className="ring-progress";document.getElementById("progress-fill").style.width="0%";document.getElementById("progress-pct").textContent="0%";renderLog();hideBanner();}
function beginPhase(){if(schedIdx>=schedule.length){finishWorkout();return;}var ph=schedule[schedIdx];secsLeft=ph.duration;phaseDur=ph.duration;phaseEndTime=Date.now()+(secsLeft*1000);timerState="running";updateDisplay(ph);speakPhase(ph);highlightLog();tick();}
function tick(){clearInterval(intervalId);intervalId=setInterval(function(){secsLeft=Math.max(0,Math.round((phaseEndTime-Date.now())/1000));document.getElementById("timer-display").textContent=fmt(secsLeft);document.getElementById("ring-progress").style.strokeDashoffset=339.3*(1-secsLeft/phaseDur);var elapsed=schedule.slice(0,schedIdx).reduce(function(s,x){return s+x.duration;},0)+(phaseDur-secsLeft);var pct=Math.min(100,Math.round((elapsed/totalSecs)*100));document.getElementById("progress-fill").style.width=pct+"%";document.getElementById("progress-pct").textContent=pct+"%";if(secsLeft<=0){clearInterval(intervalId);schedIdx++;if(timerState==="running")beginPhase();}},500);}
function updateDisplay(ph){document.getElementById("timer-display").textContent=fmt(secsLeft);document.getElementById("interval-label").textContent=ph.label;var b=document.getElementById("phase-badge");b.textContent=ph.label;b.className="phase-badge "+ph.type;var r=document.getElementById("ring-progress");r.className="ring-progress "+ph.type;r.style.strokeDashoffset="0";if(ph.type==="run"){var n=schedule.slice(0,schedIdx+1).filter(function(s){return s.type==="run";}).length;document.getElementById("current-round").textContent=n;}}
function highlightLog(){document.querySelectorAll(".log-item").forEach(function(el,i){el.classList.remove("active-log","done-log");if(i<schedIdx)el.classList.add("done-log");if(i===schedIdx){el.classList.add("active-log");el.scrollIntoView({behavior:"smooth",block:"nearest"});}});}
function finishWorkout(){timerState="idle";save("ft_timer",null);document.getElementById("timer-display").textContent="Done!";document.getElementById("interval-label").textContent="Complete!";document.getElementById("start-btn").disabled=true;document.getElementById("pause-btn").disabled=true;var b=document.getElementById("phase-badge");b.textContent="Done!";b.className="phase-badge walk";document.getElementById("progress-fill").style.width="100%";document.getElementById("progress-pct").textContent="100%";document.querySelectorAll(".log-item").forEach(function(el){el.classList.add("done-log");});showBanner();logWorkout("run",{program:curProgram,rounds:PROGRAMS[curProgram].rounds});say("Workout complete! Amazing job. Rest up and come back stronger.");}
function showBanner(){var b=document.getElementById("completion-banner");if(!b){b=document.createElement("div");b.id="completion-banner";b.className="completion-banner";b.innerHTML="<h3>Workout Complete!</h3><p>Great work! Rest 1-2 days before your next HIIT session.</p>";document.getElementById("tab-running").querySelector(".card").appendChild(b);}b.classList.add("show");}
function hideBanner(){var b=document.getElementById("completion-banner");if(b)b.classList.remove("show");}
function speakPhase(ph){var msgs={"warmup":"Warm up. Start walking.","run":"Run! Push hard!","walk":"Walk. Recover.","cooldown":"Cool down. Nice work."};say(msgs[ph.type]||ph.label);}
function say(text){if(!window.speechSynthesis)return;window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(text);u.rate=1.0;u.pitch=1.0;u.volume=1.0;window.speechSynthesis.speak(u);}
document.querySelectorAll(".focus-btn").forEach(function(btn){btn.addEventListener("click",function(){document.querySelectorAll(".focus-btn").forEach(function(b){b.classList.remove("active");});btn.classList.add("active");curFocus=btn.dataset.focus;renderExercises();});});
document.getElementById("log-workout-btn").addEventListener("click",function(){logWorkout("strength",{focus:curFocus});var btn=document.getElementById("log-workout-btn");btn.textContent="Logged!";btn.style.background="#51cf66";setTimeout(function(){btn.textContent="Log This Workout";btn.style.background="";},2500);});
