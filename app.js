// ============================================================
// STORAGE HELPERS
// ============================================================
const STORAGE_KEYS = { history:'ft_history', xp:'ft_xp', badges:'ft_badges', streak:'ft_streak', lastWorkout:'ft_last' };
function loadData(key, def) { try { const v=localStorage.getItem(key); return v?JSON.parse(v):def; } catch{ return def; } }
function saveData(key, val) { try { localStorage.setItem(key,JSON.stringify(val)); } catch{} }

// ============================================================
// BADGE & LEVEL DATA
// ============================================================
const XP_REWARDS = { run_complete:50, strength_complete:30 };
const LEVEL_THRESHOLDS = [0,100,250,450,700,1000,1400,1900,2500,3200,4000];

const ALL_BADGES = [
  { id:'first_run',    emoji:'🏃', name:'First Mile',    desc:'Complete your first HIIT run session.',     check:(h)=>h.filter(x=>x.type==='run').length>=1 },
  { id:'first_str',   emoji:'💪', name:'Iron Will',      desc:'Complete your first strength workout.',      check:(h)=>h.filter(x=>x.type==='strength').length>=1 },
  { id:'streak_3',    emoji:'🔥', name:'On Fire',        desc:'Work out 3 days in a row.',                  check:(_,s)=>s>=3 },
  { id:'streak_7',    emoji:'⚡', name:'Week Warrior',   desc:'Work out 7 days in a row.',                  check:(_,s)=>s>=7 },
  { id:'streak_14',   emoji:'🌟', name:'Unstoppable',    desc:'Work out 14 days in a row.',                 check:(_,s)=>s>=14 },
  { id:'runs_5',      emoji:'👟', name:'Road Runner',    desc:'Complete 5 HIIT run sessions.',              check:(h)=>h.filter(x=>x.type==='run').length>=5 },
  { id:'runs_10',     emoji:'🏅', name:'Mile Chaser',    desc:'Complete 10 HIIT run sessions.',             check:(h)=>h.filter(x=>x.type==='run').length>=10 },
  { id:'runs_25',     emoji:'🥇', name:'Speed Demon',    desc:'Complete 25 HIIT run sessions.',             check:(h)=>h.filter(x=>x.type==='run').length>=25 },
  { id:'strength_5',  emoji:'🏋️', name:'Body Builder',  desc:'Complete 5 strength workouts.',              check:(h)=>h.filter(x=>x.type==='strength').length>=5 },
  { id:'strength_10', emoji:'��', name:'Iron Body',      desc:'Complete 10 strength workouts.',             check:(h)=>h.filter(x=>x.type==='strength').length>=10 },
  { id:'workouts_20', emoji:'🎯', name:'Committed',      desc:'Log 20 total workouts.',                     check:(h)=>h.length>=20 },
  { id:'workouts_50', emoji:'👑', name:'Legend',         desc:'Log 50 total workouts. You are a machine.', check:(h)=>h.length>=50 },
  { id:'adv_run',     emoji:'🚀', name:'Advanced Mode',  desc:'Complete an Advanced HIIT session.',         check:(h)=>h.filter(x=>x.type==='run'&&x.program==='advanced').length>=1 },
  { id:'morning',     emoji:'🌅', name:'Early Bird',     desc:'Log a workout before 8am.',                  check:(h)=>h.some(x=>{const d=new Date(x.date);return d.getHours()<8;}) },
];

// ============================================================
// STATE
// ============================================================
let history         = loadData(STORAGE_KEYS.history, []);
let xpTotal         = loadData(STORAGE_KEYS.xp, 0);
let earnedBadges    = loadData(STORAGE_KEYS.badges, []);
let streak          = loadData(STORAGE_KEYS.streak, 0);
let lastWorkoutDate = loadData(STORAGE_KEYS.lastWorkout, null);

let currentProgram       = 'beginner';
let currentFocus         = 'core';
let timerState           = 'idle';
let intervalId           = null;
let schedule             = [];
let scheduleIndex        = 0;
let secondsLeft          = 0;
let totalSeconds         = 0;
let currentPhaseDuration = 0;

// ============================================================
// PROGRAMS
// ============================================================
const PROGRAMS = {
  beginner:     { label:'Beginner',     desc:'Build your base. Short runs, longer recovery.',            warmup:120, cooldown:120, runTime:30,  walkTime:90, rounds:8  },
  intermediate: { label:'Intermediate', desc:'Balanced intervals. Pushes your endurance threshold.',     warmup:90,  cooldown:90,  runTime:60,  walkTime:90, rounds:8  },
  advanced:     { label:'Advanced',     desc:'Equal sprint/walk with longer bursts. Serious speed work.',warmup:60,  cooldown:60,  runTime:60,  walkTime:60, rounds:10 },
};

// ============================================================
// EXERCISES
// ============================================================
const EXERCISES = {
  core: {
    label:'Core', emoji:'🔥',
    desc:'A strong core protects your lower back and powers every movement. 3x per week.',
    exercises:[
      { name:'Plank',              sets:'3 x 30-60 sec',   desc:'Forearm plank, body straight head to heels. Squeeze abs, glutes, quads.',                                          tip:'Don\'t let hips sag or pike. Breathe steadily.',                                    ytQuery:'plank exercise proper form' },
      { name:'Dead Bug',           sets:'3 x 10 reps/side',desc:'Back flat, arms up, knees at 90. Lower opposite arm and leg slowly, keeping lower back pressed down.',             tip:'Lower back must stay on the floor the entire time.',                                ytQuery:'dead bug exercise beginner tutorial' },
      { name:'Bicycle Crunches',   sets:'3 x 20 reps',     desc:'Hands behind head, bring elbow to opposite knee in a pedaling motion. Keep lower back flat.',                     tip:'Slow and controlled — don\'t yank your neck.',                                     ytQuery:'bicycle crunches proper form' },
      { name:'Hollow Body Hold',   sets:'3 x 20-40 sec',   desc:'Back flat, arms overhead and legs extended and lifted. Hold the banana shape.',                                   tip:'Too hard? Bend knees or keep arms at your sides.',                                  ytQuery:'hollow body hold gymnastics tutorial' },
      { name:'Mountain Climbers',  sets:'3 x 30 sec',      desc:'High plank. Drive knees to chest alternately as fast as possible, hips level.',                                   tip:'Don\'t let hips rise — keep it core, not hip flexors.',                             ytQuery:'mountain climbers exercise tutorial' },
      { name:'Russian Twists',     sets:'3 x 20 reps',     desc:'Knees bent, feet off floor, lean back slightly. Rotate torso side to side, touching floor beside hips.',          tip:'Chest up, spine long — don\'t round forward.',                                     ytQuery:'russian twists bodyweight tutorial' },
    ]
  },
  arms: {
    label:'Arms', emoji:'💪',
    desc:'Chest, shoulders, triceps, and biceps — no equipment. Consistency beats weight when starting out.',
    exercises:[
      { name:'Push-Ups',            sets:'3 x 10-20 reps', desc:'High plank, hands shoulder-width. Lower chest to floor with elbows at 45°, push back up.',                        tip:'Keep core and glutes tight. No sagging hips.',                                     ytQuery:'push up perfect form tutorial' },
      { name:'Diamond Push-Ups',    sets:'3 x 8-15 reps',  desc:'Thumbs and index fingers form a diamond under chest. Push-ups from this position. Heavy tricep focus.',           tip:'Harder than standard — drop to knees if needed.',                                  ytQuery:'diamond push up triceps tutorial' },
      { name:'Wide Push-Ups',       sets:'3 x 10-15 reps', desc:'Hands wider than shoulder-width. Lower slowly, press back up. More chest and front delt activation.',             tip:'3 seconds down, 1 second up for max chest work.',                                  ytQuery:'wide grip push up chest workout' },
      { name:'Pike Push-Ups',       sets:'3 x 8-12 reps',  desc:'Downward-dog position. Bend elbows lowering head toward floor, press back up. Targets shoulders.',               tip:'More vertical torso = more shoulder activation.',                                  ytQuery:'pike push up shoulder workout tutorial' },
      { name:'Tricep Dips',         sets:'3 x 10-15 reps', desc:'Sit on edge of chair, slide off, lower by bending elbows to 90°, press back up.',                               tip:'Keep back close to chair, elbows pointing back.',                                  ytQuery:'tricep dips chair bodyweight tutorial' },
      { name:'Isometric Bicep Curl',sets:'3 x 20 sec/side',desc:'In a doorframe, grip at hip height palm up. Drive hand up hard against frame. Hold the contraction.',            tip:'No movement — pure tension. Surprisingly effective.',                               ytQuery:'isometric bicep curl no equipment' },
    ]
  },
  legs: {
    label:'Legs', emoji:'🦵',
    desc:'Your biggest muscle group. Training legs boosts hormones, burns max calories, and builds run power. 2-3x/week.',
    exercises:[
      { name:'Bodyweight Squats',     sets:'3 x 15-25 reps', desc:'Feet shoulder-width, toes slightly out. Push hips back and down, chest up, knees over toes. Drive through heels.', tip:'Go as deep as mobility allows. Depth builds muscle.',                               ytQuery:'bodyweight squat perfect form tutorial' },
      { name:'Reverse Lunges',        sets:'3 x 10 reps/leg', desc:'Step one foot back, drop rear knee toward floor, front knee over ankle. Drive off front foot to return.',         tip:'Easier on knees than forward lunges — great starting point.',                       ytQuery:'reverse lunge bodyweight proper form' },
      { name:'Glute Bridges',         sets:'3 x 20 reps',     desc:'Back flat, knees bent, feet hip-width. Drive through heels to lift hips until body is straight knee to shoulder.', tip:'Squeeze and hold top for 2 seconds each rep.',                                    ytQuery:'glute bridge exercise tutorial' },
      { name:'Jump Squats',           sets:'3 x 10 reps',     desc:'Lower into squat then explode upward. Land softly bending knees, drop straight into next rep.',                   tip:'Land quietly — soft landing = muscles working, not joints.',                       ytQuery:'jump squat plyometric tutorial' },
      { name:'Wall Sit',              sets:'3 x 30-60 sec',   desc:'Back flat on wall, slide down until thighs are parallel to floor. Hold.',                                         tip:'Back flat on wall, don\'t rest hands on knees.',                                   ytQuery:'wall sit exercise tutorial' },
      { name:'Single-Leg Calf Raise', sets:'3 x 15 reps/leg', desc:'Stand on one foot, rise to toes as high as possible, hold a second, lower slowly.',                              tip:'Full range — all the way up and all the way down.',                                ytQuery:'single leg calf raise tutorial' },
    ]
  },
  fullbody: {
    label:'Full Body', emoji:'⚡',
    desc:'Hit everything in one session. Most efficient for building muscle and burning fat. Great 3x/week routine.',
    exercises:[
      { name:'Burpees',         sets:'3 x 8-12 reps',  desc:'Drop to push-up position, do a push-up, jump feet to hands, explode up into a jump with arms overhead.',             tip:'Scale by removing the jump or push-up. Pace yourself.',                            ytQuery:'burpee exercise proper form tutorial' },
      { name:'Push-Ups',        sets:'3 x 10-20 reps', desc:'Standard push-ups. Lower chest to floor with elbows at 45°, press back up. Core rigid throughout.',                 tip:'Body like a plank. Engage core the entire time.',                                  ytQuery:'push up perfect form tutorial' },
      { name:'Bodyweight Squat',sets:'3 x 15 reps',    desc:'Hip-width stance, toes slightly out. Sit back and down, chest up, knees out. Drive through heels to stand.',         tip:'Arms out front for balance. Aim for thighs parallel.',                             ytQuery:'bodyweight squat perfect form tutorial' },
      { name:'Plank',           sets:'3 x 30-45 sec',  desc:'Forearm plank — elbows under shoulders, body straight. Brace core like you are about to be punched.',               tip:'Breathe steadily. Don\'t hold your breath.',                                       ytQuery:'plank exercise proper form tutorial' },
      { name:'Glute Bridges',   sets:'3 x 20 reps',    desc:'Back flat, knees bent. Push hips to ceiling squeezing glutes, lower slowly.',                                        tip:'Hold the top for 2 seconds per rep.',                                              ytQuery:'glute bridge exercise tutorial' },
      { name:'Superman Hold',   sets:'3 x 12 reps',    desc:'Face down, arms overhead. Lift arms, chest, and legs off the floor simultaneously. Hold 2 seconds, lower.',          tip:'Targets entire posterior chain — lower back, glutes, upper back.',                  ytQuery:'superman exercise lower back tutorial' },
    ]
  },
};

// ============================================================
// PROGRAMS & EXERCISES DATA
// ============================================================
const PROGRAMS = {
  beginner:     { label:'Beginner',     desc:'Short runs with longer recovery walks to build your aerobic base.', warmup:120, cooldown:120, runTime:30,  walkTime:90, rounds:8  },
  intermediate: { label:'Intermediate', desc:'Balanced run/walk ratio. Pushes your lactate threshold.',           warmup:90,  cooldown:90,  runTime:60,  walkTime:90, rounds:8  },
  advanced:     { label:'Advanced',     desc:'Sprint intervals with equal run/walk for serious speed gains.',      warmup:60,  cooldown:60,  runTime:60,  walkTime:60, rounds:10 },
};

const EXERCISES = {
  core: {
    label:'Core', emoji:'🔥',
    desc:'A strong core improves posture, protects your lower back, and transfers power to every movement.',
    list:[
      { name:'Plank',             sets:'3x30-60s',    desc:'Forearm plank, body in a straight line. Squeeze abs, glutes, and quads.',                                tip:'Don\'t let hips sag or pike up. Breathe steadily.',                    yt:'plank exercise proper form tutorial' },
      { name:'Dead Bug',          sets:'3x10/side',   desc:'On back, arms up, knees at 90. Lower opposite arm and leg slowly, pressing lower back down.',            tip:'Keep lower back pressed firmly into the floor the whole time.',       yt:'dead bug exercise beginner tutorial' },
      { name:'Bicycle Crunches',  sets:'3x20',        desc:'Hands behind head. Bring elbow to opposite knee in a pedaling motion, lower back flat.',                 tip:'Move slow and controlled — don\'t yank your neck.',                   yt:'bicycle crunches proper form' },
      { name:'Hollow Body Hold',  sets:'3x20-40s',    desc:'On back, press lower back down, extend arms and legs slightly off floor. Hold the hollow shape.',        tip:'If too hard, bend knees or keep arms by sides.',                      yt:'hollow body hold tutorial gymnastics' },
      { name:'Mountain Climbers', sets:'3x30s',       desc:'High plank. Drive knees to chest alternately as fast as possible while keeping hips level.',             tip:'Don\'t let hips rise — keep it core, not hip flexors.',               yt:'mountain climbers exercise tutorial' },
      { name:'Russian Twists',    sets:'3x20',        desc:'Sit, knees bent, feet off floor. Lean back slightly and rotate torso side to side touching the floor.',  tip:'Keep chest up and spine long — don\'t round forward.',                yt:'russian twists bodyweight tutorial' },
    ]
  },
  arms: {
    label:'Arms', emoji:'💪',
    desc:'Chest, shoulders, triceps, and biceps using only bodyweight. Consistency beats heavy weights when starting out.',
    list:[
      { name:'Push-Ups',                  sets:'3x10-20',  desc:'High plank, hands shoulder-width. Lower chest to floor, elbows at 45 degrees, push back up.',           tip:'Core and glutes tight the whole time.',                                yt:'push up perfect form tutorial' },
      { name:'Diamond Push-Ups',          sets:'3x8-15',   desc:'Thumbs and index fingers form a diamond under your chest. Push-ups from this position hits triceps hard.', tip:'Drop to knees if needed — these are harder than regular push-ups.',   yt:'diamond push up triceps tutorial' },
      { name:'Wide Push-Ups',             sets:'3x10-15',  desc:'Hands wider than shoulder-width. Shifts more work to chest and front deltoids.',                          tip:'Go 3 seconds down, 1 second up for more chest activation.',            yt:'wide grip push up chest workout' },
      { name:'Pike Push-Ups',             sets:'3x8-12',   desc:'Downward-dog position, hips high. Lower top of head toward floor then press back up. Hits shoulders.',    tip:'More vertical torso = more shoulder activation.',                     yt:'pike push up shoulder workout tutorial' },
      { name:'Tricep Dips (Chair)',        sets:'3x10-15',  desc:'Hands grip chair edge. Slide off and lower by bending elbows to 90 degrees, then press back up.',        tip:'Keep back close to chair, elbows pointing back not flaring out.',     yt:'tricep dips chair bodyweight tutorial' },
      { name:'Isometric Bicep Curl',       sets:'3x20-30s', desc:'Grip doorframe at hip height, palm up. Drive hand up against frame and hold. Pure bicep tension.',       tip:'No movement needed — isometric tension builds strength effectively.',  yt:'isometric bicep curl no equipment' },
    ]
  },
  legs: {
    label:'Legs', emoji:'🦵',
    desc:'Legs are your biggest muscle group. Training them boosts testosterone, burns the most calories, and powers your runs.',
    list:[
      { name:'Bodyweight Squats',       sets:'3x15-25',  desc:'Feet shoulder-width, toes slightly out. Hips back and down, chest up, drive through heels to stand.',     tip:'Go as deep as mobility allows. Depth builds more muscle.',             yt:'bodyweight squat perfect form tutorial' },
      { name:'Reverse Lunges',          sets:'3x10/leg', desc:'Step one foot back, drop rear knee toward floor. Front knee stays over ankle. Push off front foot.',       tip:'Easier on knees than forward lunges — great for beginners.',           yt:'reverse lunge bodyweight proper form' },
      { name:'Glute Bridges',           sets:'3x20',     desc:'On back, knees bent, feet flat. Drive through heels and squeeze glutes, lifting hips until body is straight.', tip:'Squeeze and hold 2 seconds at the top each rep.',                 yt:'glute bridge exercise tutorial' },
      { name:'Jump Squats',             sets:'3x10',     desc:'Lower into squat then explode upward as high as possible. Land softly bending knees to absorb impact.',    tip:'Land quietly — soft landing means muscles are working, not joints.',   yt:'jump squat plyometric tutorial' },
      { name:'Wall Sit',                sets:'3x30-60s', desc:'Back flat against wall, slide down until thighs are parallel to floor and knees at 90 degrees. Hold.',     tip:'Back flat on wall, don\'t rest hands on knees.',                      yt:'wall sit exercise benefits tutorial' },
      { name:'Single-Leg Calf Raises',  sets:'3x15/leg', desc:'Stand on one foot, rise onto toes as high as possible, hold a second, lower slowly.',                      tip:'Full range — all the way up and down. Slow beats fast here.',          yt:'single leg calf raise tutorial' },
    ]
  },
  fullbody: {
    label:'Full Body', emoji:'⚡',
    desc:'The most efficient way to build muscle and burn fat. Hit everything in one session — great for 3x per week.',
    list:[
      { name:'Burpees',         sets:'3x8-12',  desc:'Drop to push-up position, do a push-up, jump feet to hands, then explode into a jump arms overhead.',        tip:'Scale by removing the jump or push-up. Pace yourself.',               yt:'burpee exercise proper form tutorial' },
      { name:'Push-Ups',        sets:'3x10-20', desc:'Standard push-ups. Lower chest to floor, elbows at 45 degrees, press back up.',                              tip:'Keep body rigid like a plank. Engage core throughout.',               yt:'push up perfect form tutorial' },
      { name:'Bodyweight Squats',sets:'3x15',   desc:'Hip-width stance, sit back and down, chest up, knees out. Drive through heels to stand.',                    tip:'Arms out front for balance. Aim for thighs parallel to floor.',       yt:'bodyweight squat perfect form tutorial' },
      { name:'Plank',           sets:'3x30-45s',desc:'Forearm plank, elbows under shoulders, body straight. Brace core like you are about to be hit.',             tip:'Focus on steady breathing. Don\'t hold your breath.',                 yt:'plank exercise proper form tutorial' },
      { name:'Glute Bridges',   sets:'3x20',    desc:'On back, knees bent. Push hips to ceiling squeezing glutes, then lower slowly.',                             tip:'Hold the top 2 seconds per rep.',                                     yt:'glute bridge exercise tutorial' },
      { name:'Superman Hold',   sets:'3x12',    desc:'Face down, arms overhead. Lift arms, chest, and legs simultaneously. Hold 2 seconds at top.',                tip:'Targets entire posterior chain — lower back, glutes, upper back.',    yt:'superman exercise lower back tutorial' },
    ]
  },
};

// ============================================================
// PROGRAM & EXERCISE DATA
// ============================================================
const PROGRAMS = {
  beginner:     { label:'Beginner',     desc:'Short runs with longer recovery walks to build your aerobic base.', warmup:120, cooldown:120, runTime:30,  walkTime:90, rounds:8  },
  intermediate: { label:'Intermediate', desc:'Balanced run/walk ratio to push your lactate threshold.',           warmup:90,  cooldown:90,  runTime:60,  walkTime:90, rounds:8  },
  advanced:     { label:'Advanced',     desc:'Sprint intervals with equal rest for serious speed gains.',          warmup:60,  cooldown:60,  runTime:60,  walkTime:60, rounds:10 },
};

const EXERCISES = {
  core: {
    label:'Core', emoji:'🔥', desc:'A strong core protects your lower back and powers every movement. Aim 3x/week.',
    list:[
      { name:'Plank',             sets:'3 x 30-60 sec',   desc:'Forearm plank, straight line head to heels. Squeeze abs, glutes, and quads.',             tip:'Don\'t let hips sag or pike. Breathe steadily.',                               yt:'plank exercise proper form tutorial' },
      { name:'Dead Bug',          sets:'3 x 10 reps/side',desc:'On back, arms up, knees 90°. Lower opposite arm and leg, keep lower back flat.',           tip:'Lower back stays pressed into the floor the entire time.',                     yt:'dead bug core exercise tutorial' },
      { name:'Bicycle Crunches',  sets:'3 x 20 reps',     desc:'Hands behind head, pedal knees to opposite elbows. Keep lower back flat.',                 tip:'Move slow and controlled - don\'t yank your neck.',                           yt:'bicycle crunches proper form' },
      { name:'Hollow Body Hold',  sets:'3 x 20-40 sec',   desc:'On back, arms overhead, legs extended slightly off floor. Hold the banana shape.',         tip:'If too hard, bend your knees or keep arms by sides.',                         yt:'hollow body hold tutorial' },
      { name:'Mountain Climbers', sets:'3 x 30 sec',       desc:'High plank, drive knees to chest alternately as fast as possible.',                        tip:'Keep hips level - don\'t let them rise.',                                    yt:'mountain climbers exercise tutorial' },
      { name:'Russian Twists',    sets:'3 x 20 reps',     desc:'Sit leaning back slightly, feet off floor, rotate torso side to side.',                    tip:'Keep chest up and spine long - don\'t round forward.',                       yt:'russian twists bodyweight tutorial' },
    ]
  },
  arms: {
    label:'Arms', emoji:'💪', desc:'Hits chest, shoulders, triceps, and biceps. No weights needed.',
    list:[
      { name:'Push-Ups',              sets:'3 x 10-20 reps', desc:'Hands shoulder-width, lower chest to floor, elbows at 45°, press back up.',              tip:'Core and glutes tight the whole time. No sagging.',                           yt:'push up perfect form tutorial' },
      { name:'Diamond Push-Ups',      sets:'3 x 8-15 reps',  desc:'Thumbs and index fingers form a diamond under chest. Heavily targets triceps.',           tip:'Harder than regular push-ups - drop to knees if needed.',                    yt:'diamond push up triceps tutorial' },
      { name:'Wide Push-Ups',         sets:'3 x 10-15 reps', desc:'Hands wider than shoulder-width. Shifts work to chest and front deltoids.',               tip:'3 seconds down, 1 second up for more chest activation.',                     yt:'wide grip push up chest workout' },
      { name:'Pike Push-Ups',         sets:'3 x 8-12 reps',  desc:'Downward-dog position, lower top of head toward floor. Targets shoulders.',               tip:'More vertical torso = more shoulder activation.',                            yt:'pike push up shoulder workout tutorial' },
      { name:'Tricep Dips',           sets:'3 x 10-15 reps', desc:'Hands on chair edge, lower yourself bending elbows to 90°, press back up.',               tip:'Keep back close to chair, elbows point back not out.',                       yt:'tricep dips chair bodyweight tutorial' },
      { name:'Isometric Bicep Curl',  sets:'3 x 20 sec/side',desc:'Grip a doorframe palm-up at hip height. Drive up hard and hold. Pure isometric tension.',  tip:'No movement needed - sustained tension builds strength.',                    yt:'isometric bicep curl no equipment' },
    ]
  },
  legs: {
    label:'Legs', emoji:'🦵', desc:'Biggest muscle group. Training legs boosts hormones, burns calories, and improves running power.',
    list:[
      { name:'Bodyweight Squats',       sets:'3 x 15-25 reps',  desc:'Feet shoulder-width, push hips back and down, chest up, knees over toes.',              tip:'Go as deep as mobility allows. Depth builds more muscle.',                    yt:'bodyweight squat perfect form tutorial' },
      { name:'Reverse Lunges',          sets:'3 x 10 reps/leg', desc:'Step back, drop rear knee toward floor, front knee over ankle, return.',                 tip:'Easier on knees than forward lunges - great for beginners.',                 yt:'reverse lunge bodyweight proper form' },
      { name:'Glute Bridges',           sets:'3 x 20 reps',     desc:'On back, knees bent, drive hips up squeezing glutes, straight line knees to shoulders.', tip:'Squeeze and hold 2 seconds at top each rep.',                               yt:'glute bridge exercise tutorial' },
      { name:'Jump Squats',             sets:'3 x 10 reps',     desc:'Squat then explode up as high as you can. Land softly bending knees.',                   tip:'Land quietly - soft landing means you\'re using muscles not joints.',        yt:'jump squat plyometric tutorial' },
      { name:'Wall Sit',                sets:'3 x 30-60 sec',   desc:'Back flat on wall, thighs parallel to floor, knees at 90°. Hold for time.',              tip:'Back flat on wall, don\'t rest hands on knees.',                            yt:'wall sit exercise benefits tutorial' },
      { name:'Single-Leg Calf Raises',  sets:'3 x 15 reps/leg', desc:'Stand on one foot, rise onto toes as high as possible, lower slowly.',                   tip:'Full range - all the way up and all the way down.',                          yt:'single leg calf raise tutorial' },
    ]
  },
  fullbody: {
    label:'Full Body', emoji:'⚡', desc:'Most efficient way to build muscle and burn fat. Great for 3x/week.',
    list:[
      { name:'Burpees',          sets:'3 x 8-12 reps', desc:'Drop to push-up, do a push-up, jump feet to hands, explode into a jump overhead.',              tip:'Scale by removing the jump or push-up. Pace yourself.',                      yt:'burpee exercise proper form tutorial' },
      { name:'Push-Ups',         sets:'3 x 10-20 reps',desc:'Standard push-ups. Lower chest to floor, elbows at 45°, press back up.',                       tip:'Body rigid like a plank. Core engaged throughout.',                          yt:'push up perfect form tutorial' },
      { name:'Bodyweight Squats',sets:'3 x 15 reps',   desc:'Hip-width stance, sit back and down, chest up, drive through heels.',                           tip:'Arms out front for balance. Thighs parallel to floor.',                      yt:'bodyweight squat perfect form tutorial' },
      { name:'Plank',            sets:'3 x 30-45 sec', desc:'Forearm plank, body straight, brace core like you\'re about to be punched.',                    tip:'Breathe steadily. Don\'t hold your breath.',                                yt:'plank exercise proper form tutorial' },
      { name:'Glute Bridges',    sets:'3 x 20 reps',   desc:'On back, knees bent, push hips to ceiling squeezing glutes, lower slowly.',                     tip:'Hold top for 2 seconds per rep.',                                            yt:'glute bridge exercise tutorial' },
      { name:'Superman Hold',    sets:'3 x 12 reps',   desc:'Face down, lift arms, chest, and legs simultaneously. Hold 2 seconds at top.',                   tip:'Targets your entire posterior chain - back, glutes, upper back.',            yt:'superman exercise lower back tutorial' },
    ]
  }
};

// ============================================================
// TAB SWITCHING
// ============================================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'history') renderHistory();
    if (btn.dataset.tab === 'badges')  renderBadges();
  });
});

// ============================================================
// XP & LEVELS
// ============================================================
function getLevel(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) { if (xp >= LEVEL_THRESHOLDS[i]) return i + 1; }
  return 1;
}
function getLevelProgress(xp) {
  const lvl = getLevel(xp);
  const cur = LEVEL_THRESHOLDS[lvl - 1] || 0;
  const next = LEVEL_THRESHOLDS[lvl] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return { pct: Math.min(100, Math.round(((xp - cur) / (next - cur)) * 100)), xpInLevel: xp - cur, xpToNext: next - cur };
}
function addXP(amount, reason) {
  const oldLevel = getLevel(xpTotal);
  xpTotal += amount;
  saveData(STORAGE_KEYS.xp, xpTotal);
  const newLevel = getLevel(xpTotal);
  updateXPBar();
  showToast('xp', `+${amount} XP — ${reason}`);
  if (newLevel > oldLevel) {
    setTimeout(() => showToast('badge', `🎉 Level Up! You are now Level ${newLevel}!`), 600);
  }
}
function updateXPBar() {
  const lvl = getLevel(xpTotal);
  const prog = getLevelProgress(xpTotal);
  document.getElementById('level-badge').textContent = `Lvl ${lvl}`;
  document.getElementById('xp-label').textContent = `${prog.xpInLevel} / ${prog.xpToNext} XP`;
  document.getElementById('xp-fill').style.width = prog.pct + '%';
  document.getElementById('streak-badge').textContent = `🔥 ${streak}`;
}

// ============================================================
// STREAK
// ============================================================
function updateStreak() {
  const today = new Date().toDateString();
  if (lastWorkoutDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  streak = (lastWorkoutDate === yesterday) ? streak + 1 : 1;
  lastWorkoutDate = today;
  saveData(STORAGE_KEYS.streak, streak);
  saveData(STORAGE_KEYS.lastWorkout, lastWorkoutDate);
  updateXPBar();
  if (streak === 3)  { addXP(25, '3-day streak!');  }
  if (streak === 7)  { addXP(50, '7-day streak!');  }
  if (streak === 14) { addXP(100, '14-day streak!'); }
  if (streak > 1) showToast('streak', `🔥 ${streak} day streak! Keep it up!`);
}

// ============================================================
// BADGES
// ============================================================
function checkBadges() {
  ALL_BADGES.forEach(badge => {
    if (earnedBadges.includes(badge.id)) return;
    if (badge.check(history, streak)) {
      earnedBadges.push(badge.id);
      saveData(STORAGE_KEYS.badges, earnedBadges);
      setTimeout(() => showBadgeModal(badge), 800);
    }
  });
}
function showBadgeModal(badge) {
  document.getElementById('modal-emoji').textContent = badge.emoji;
  document.getElementById('modal-title').textContent = badge.name;
  document.getElementById('modal-desc').textContent = badge.desc;
  document.getElementById('badge-modal').style.display = 'flex';
}
function closeBadgeModal() { document.getElementById('badge-modal').style.display = 'none'; }

// ============================================================
// TOAST
// ============================================================
function showToast(type, msg) {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => { t.style.animation = 'slideOut .3s ease forwards'; setTimeout(() => t.remove(), 300); }, 3000);
}

// ============================================================
// LOG WORKOUT
// ============================================================
function logWorkout(type, details) {
  const entry = { id: Date.now(), date: new Date().toISOString(), type, ...details };
  history.unshift(entry);
  saveData(STORAGE_KEYS.history, history);
  updateStreak();
  const xpAmt = type === 'run' ? XP_REWARDS.run_complete : XP_REWARDS.strength_complete;
  addXP(xpAmt, type === 'run' ? 'HIIT run complete!' : 'Strength workout complete!');
  checkBadges();
  renderBadges();
}

// ============================================================
// RUNNING — PROGRAM SELECTOR
// ============================================================
document.querySelectorAll('.program-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.program-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentProgram = btn.dataset.program;
    if (timerState !== 'idle') resetTimer();
    renderProgramInfo();
    buildSchedule();
    renderLog();
  });
});

function renderProgramInfo() {
  const p = PROGRAMS[currentProgram];
  const totalMin = Math.round((p.warmup + p.cooldown + p.rounds * (p.runTime + p.walkTime)) / 60);
  document.getElementById('program-info').innerHTML = `
    <strong>${p.label}</strong> — ${p.desc}
    <div class="info-grid">
      <div class="info-item"><div class="val">${p.runTime}s</div><div class="lbl">Run</div></div>
      <div class="info-item"><div class="val">${p.walkTime}s</div><div class="lbl">Walk</div></div>
      <div class="info-item"><div class="val">~${totalMin}m</div><div class="lbl">Total</div></div>
    </div>`;
}

function buildSchedule() {
  const p = PROGRAMS[currentProgram];
  schedule = [];
  schedule.push({ type:'warmup',   label:'Warm-Up Walk',     duration: p.warmup });
  for (let i = 0; i < p.rounds; i++) {
    schedule.push({ type:'run',    label:'RUN!',              duration: p.runTime });
    schedule.push({ type:'walk',   label:'Walk / Recover',    duration: p.walkTime });
  }
  schedule.push({ type:'cooldown', label:'Cool-Down Walk',    duration: p.cooldown });
  totalSeconds = schedule.reduce((s, item) => s + item.duration, 0);
  document.getElementById('total-rounds').textContent = p.rounds;
}

function renderLog() {
  document.getElementById('log-list').innerHTML = schedule.map((item, i) => `
    <div class="log-item" id="log-${i}">
      <div class="log-dot ${item.type}"></div>
      <div class="log-name">${item.label}</div>
      <div class="log-duration">${formatTime(item.duration)}</div>
    </div>`).join('');
}

// ============================================================
// TIMER CONTROLS
// ============================================================
document.getElementById('start-btn').addEventListener('click', startTimer);
document.getElementById('pause-btn').addEventListener('click', pauseTimer);
document.getElementById('reset-btn').addEventListener('click', resetTimer);

function startTimer() {
  if (timerState === 'idle') { scheduleIndex = 0; beginPhase(); }
  else if (timerState === 'paused') { timerState = 'running'; runTick(); }
  document.getElementById('start-btn').disabled = true;
  document.getElementById('pause-btn').disabled = false;
  hideBanner();
}

function pauseTimer() {
  if (timerState !== 'running') return;
  timerState = 'paused';
  clearInterval(intervalId);
  document.getElementById('start-btn').disabled = false;
  document.getElementById('start-btn').textContent = '▶ Resume';
  document.getElementById('pause-btn').disabled = true;
}

function resetTimer() {
  clearInterval(intervalId);
  timerState = 'idle';
  scheduleIndex = 0;
  secondsLeft = 0;
  document.getElementById('start-btn').disabled = false;
  document.getElementById('start-btn').textContent = '▶ Start';
  document.getElementById('pause-btn').disabled = true;
  document.getElementById('timer-display').textContent = '--:--';
  document.getElementById('interval-label').textContent = 'Press Start';
  document.getElementById('current-round').textContent = '0';
  const badge = document.getElementById('phase-badge');
  badge.textContent = 'Ready'; badge.className = 'phase-badge';
  const ring = document.getElementById('ring-progress');
  ring.style.strokeDashoffset = '0'; ring.className = 'ring-progress';
  document.getElementById('progress-fill').style.width = '0%';
  document.getElementById('progress-pct').textContent = '0%';
  renderLog(); hideBanner();
}

function beginPhase() {
  if (scheduleIndex >= schedule.length) { finishWorkout(); return; }
  const phase = schedule[scheduleIndex];
  secondsLeft = phase.duration; currentPhaseDuration = phase.duration;
  timerState = 'running';
  updateDisplay(phase); announce(phase); highlightLog(); runTick();
}

function runTick() {
  clearInterval(intervalId);
  intervalId = setInterval(() => {
    secondsLeft--;
    document.getElementById('timer-display').textContent = formatTime(secondsLeft);
    const circ = 339.3;
    document.getElementById('ring-progress').style.strokeDashoffset = circ * (1 - secondsLeft / currentPhaseDuration);
    const elapsed = schedule.slice(0, scheduleIndex).reduce((s, x) => s + x.duration, 0) + (currentPhaseDuration - secondsLeft);
    const pct = Math.min(100, Math.round((elapsed / totalSeconds) * 100));
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-pct').textContent = pct + '%';
    if (secondsLeft <= 0) { clearInterval(intervalId); scheduleIndex++; if (timerState === 'running') beginPhase(); }
  }, 1000);
}

function updateDisplay(phase) {
  document.getElementById('timer-display').textContent = formatTime(secondsLeft);
  document.getElementById('interval-label').textContent = phase.label;
  const badge = document.getElementById('phase-badge');
  badge.textContent = phase.label; badge.className = 'phase-badge ' + phase.type;
  const ring = document.getElementById('ring-progress');
  ring.className = 'ring-progress ' + phase.type; ring.style.strokeDashoffset = '0';
  if (phase.type === 'run') {
    const runCount = schedule.slice(0, scheduleIndex + 1).filter(s => s.type === 'run').length;
    document.getElementById('current-round').textContent = runCount;
  }
}

function highlightLog() {
  document.querySelectorAll('.log-item').forEach((el, i) => {
    el.classList.remove('active-log', 'done-log');
    if (i < scheduleIndex) el.classList.add('done-log');
    if (i === scheduleIndex) { el.classList.add('active-log'); el.scrollIntoView({ behavior:'smooth', block:'nearest' }); }
  });
}

function finishWorkout() {
  timerState = 'idle';
  document.getElementById('timer-display').textContent = '✓';
  document.getElementById('interval-label').textContent = 'Complete!';
  document.getElementById('start-btn').disabled = true;
  document.getElementById('pause-btn').disabled = true;
  const badge = document.getElementById('phase-badge');
  badge.textContent = 'Done!'; badge.className = 'phase-badge walk';
  document.getElementById('progress-fill').style.width = '100%';
  document.getElementById('progress-pct').textContent = '100%';
  document.querySelectorAll('.log-item').forEach(el => el.classList.add('done-log'));
  showBanner();
  logWorkout('run', { program: currentProgram, rounds: PROGRAMS[currentProgram].rounds });
  speak('Workout complete! Amazing job. Rest up and come back stronger.');
}

function showBanner() {
  let b = document.getElementById('completion-banner');
  if (!b) {
    b = document.createElement('div');
    b.id = 'completion-banner';
    b.className = 'completion-banner';
    b.innerHTML = '<h3>🎉 Workout Complete!</h3><p>Great work! Rest 1–2 days before your next HIIT session.</p>';
    document.getElementById('tab-running').querySelector('.card').appendChild(b);
  }
  b.classList.add('show');
}
function hideBanner() { const b = document.getElementById('completion-banner'); if (b) b.classList.remove('show'); }

// ============================================================
// SPEECH
// ============================================================
function announce(phase) {
  const msgs = { warmup:'Warm up. Start walking.', run:'Run! Push hard!', walk:'Walk. Recover.', cooldown:'Cool down. Nice work.' };
  speak(msgs[phase.type] || phase.label);
}
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.0; u.pitch = 1.0; u.volume = 1.0;
  window.speechSynthesis.speak(u);
}

// ============================================================
// BODYWEIGHT
// ============================================================
document.querySelectorAll('.focus-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.focus-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFocus = btn.dataset.focus;
    renderExercises();
  });
});

document.getElementById('log-workout-btn').addEventListener('click', () => {
  logWorkout('strength', { focus: currentFocus });
  const btn = document.getElementById('log-workout-btn');
  btn.textContent = '✓ Logged!';
  btn.style.background = 'var(--walk)';
  setTimeout(() => { btn.textContent = '✓ Log This Workout'; btn.style.background = ''; }, 2500);
});

function renderExercises() {
  const data = EXERCISES[currentFocus];
  document.getElementById('workout-header').innerHTML = `<h3>${data.emoji} ${data.label} Workout</h3><p>${data.desc}</p>`;
  document.getElementById('exercise-grid').innerHTML = data.list.map(ex => `
    <div class="exercise-card">
      <div class="ex-header"><div class="ex-title">${ex.name}</div><div class="ex-sets">${ex.sets}</div></div>
      <div class="ex-desc">${ex.desc}</div>
      <div class="ex-tips"><strong>💡 Tip:</strong> ${ex.tip}</div>
      <a class="ex-video-btn" href="https://www.youtube.com/results?search_query=${encodeURIComponent(ex.yt)}" target="_blank" rel="noopener noreferrer">▶ Watch on YouTube</a>
    </div>`).join('');
}

// ============================================================
// HISTORY
// ============================================================
function renderHistory() {
  const totalRuns = history.filter(x => x.type === 'run').length;
  const totalStr  = history.filter(x => x.type === 'strength').length;
  document.getElementById('stats-row').innerHTML = `
    <div class="stat-card"><div class="stat-val">${history.length}</div><div class="stat-lbl">Total Workouts</div></div>
    <div class="stat-card"><div class="stat-val">${totalRuns}</div><div class="stat-lbl">HIIT Runs</div></div>
    <div class="stat-card"><div class="stat-val">${streak}</div><div class="stat-lbl">Day Streak 🔥</div></div>`;
  renderCalendar();
  if (history.length === 0) {
    document.getElementById('history-list').innerHTML = '<div class="empty-state">No workouts yet. Complete your first session to start tracking!</div>';
    return;
  }
  document.getElementById('history-list').innerHTML = history.map(entry => {
    const d = new Date(entry.date);
    const dateStr = d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' });
    const icon = entry.type === 'run' ? '🏃' : (entry.focus ? { core:'🔥', arms:'💪', legs:'🦵', fullbody:'⚡' }[entry.focus] || '🏋️' : '🏋️');
    const title = entry.type === 'run' ? `HIIT Run — ${PROGRAMS[entry.program]?.label || entry.program}` : `Strength — ${entry.focus ? EXERCISES[entry.focus]?.label : 'Workout'}`;
    const xpEarned = entry.type === 'run' ? XP_REWARDS.run_complete : XP_REWARDS.strength_complete;
    return `<div class="history-item">
      <div class="history-icon">${icon}</div>
      <div class="history-info"><div class="history-title">${title}</div><div class="history-meta">${dateStr} at ${timeStr}</div></div>
      <div class="history-xp">+${xpEarned} XP</div>
    </div>`;
  }).join('');
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const today = new Date();
  const days = [];
  for (let i = 41; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    days.push(d);
  }
  const workoutDays = {};
  history.forEach(entry => {
    const key = new Date(entry.date).toDateString();
    if (!workoutDays[key]) workoutDays[key] = new Set();
    workoutDays[key].add(entry.type);
  });
  grid.innerHTML = days.map(d => {
    const key = d.toDateString();
    const types = workoutDays[key];
    const isToday = key === today.toDateString();
    let cls = 'cal-day';
    if (isToday) cls += ' today';
    if (types) {
      const hasRun = types.has('run'), hasStr = types.has('strength');
      if (hasRun && hasStr) cls += ' has-both';
      else if (hasRun) cls += ' has-run';
      else if (hasStr) cls += ' has-strength';
    }
    return `<div class="${cls}" title="${key}">${d.getDate()}</div>`;
  }).join('');
}

// ============================================================
// BADGES RENDER
// ============================================================
function renderBadges() {
  document.getElementById('badge-grid').innerHTML = ALL_BADGES.map(badge => {
    const earned = earnedBadges.includes(badge.id);
    const entry = earned ? history.find(h => {
      if (badge.id === 'first_run') return h.type === 'run';
      if (badge.id === 'first_str') return h.type === 'strength';
      return false;
    }) : null;
    const dateStr = entry ? new Date(entry.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '';
    return `<div class="badge-card ${earned ? 'earned' : 'locked'}">
      <div class="badge-emoji">${badge.emoji}</div>
      <div class="badge-info">
        <div class="badge-name">${badge.name}</div>
        <div class="badge-desc">${badge.desc}</div>
        ${earned && dateStr ? `<div class="badge-earned-date">Earned ${dateStr}</div>` : ''}
        ${!earned ? '<div class="badge-desc" style="margin-top:4px;color:var(--muted)">🔒 Locked</div>' : ''}
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// HELPERS
// ============================================================
function formatTime(s) {
  return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
}

// ============================================================
// INIT
// ============================================================
renderProgramInfo();
buildSchedule();
renderLog();
renderExercises();
updateXPBar();
renderBadges();
