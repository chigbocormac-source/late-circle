export type PhaseId = 'rest' | 'fresh' | 'fine' | 'chop' | 'ready';

export function getCyclePhase(day: number, average: number = 35) {
  // Guard against corrupt inputs
  const safeDay = Math.max(1, day || 1);
  const safeAvg = Math.max(21, average || 35);

  // Percentage of the cycle we're in (0..100)
  const pct = (safeDay / safeAvg) * 100;

  // Phase boundaries per V1.2 spec:
  //   Rest:  First 15%
  //   Fresh: 15% – 35%
  //   Fine:  35% – 60%
  //   Chop:  60% – 80%
  //   Ready: Last 20% (i.e. 80% – 100%+)
  if (pct <= 15) return { id: 'rest' as PhaseId,  name: 'Rest Girl',  emoji: '🌙', color: '#9CAF88', focus: ['sleep', 'calm'] };
  if (pct <= 35) return { id: 'fresh' as PhaseId, name: 'Fresh Girl', emoji: '🌱', color: '#9CAF88', focus: ['walk', 'food'] };
  if (pct <= 60) return { id: 'fine' as PhaseId,  name: 'Fine Girl',  emoji: '✨', color: '#D4AF37', focus: ['food', 'walk', 'sleep', 'calm'] };
  if (pct <= 80) return { id: 'chop' as PhaseId,  name: 'Chop Girl',  emoji: '🍚', color: '#FF8FA3', focus: ['food', 'calm'] };
  return              { id: 'ready' as PhaseId, name: 'Ready Girl', emoji: '💜', color: '#8A2C3E', focus: ['sleep', 'calm'] };
}

export const oviWelcome: Record<PhaseId, string> = {
  rest: "You are in your Rest days. Your body is resting from bleeding. That is why you feel tired. Sleep well and take 90 seconds of Calm today.",
  fresh: "You are in your Fresh days. Bleeding has finished and your energy is coming back. It is a good time to start again.",
  fine: "You are in your Fine days. You feel fine, glowing and confident. Use this energy to do more today.",
  chop: "You are in your Chop days. You want to eat everything and feel more emotional. It is your pattern, not you.",
  ready: "You are in your Ready days. Your period is close and your body is slowing down. Put a pad in your bag today."
};

// Note: The text below is for the 5 Girls Explainer Modal.
// We will use this in the next file we update.
export const oviGists: Record<PhaseId, Record<string, string>> = {
  rest: {
    food: "No appetite? It's normal. Keep small plate. Indomie? Add 2 eggs and cabbage.",
    walk: "If you feel like moving, a slow walk to the junction is enough. If not, rest. It is okay.",
    sleep: "Body is tired. In bed by 10:30pm. Warm water and early sleep.",
    calm: "Close your eyes for 90 seconds. Breathe in, out. Tell yourself, this will pass."
  },
  fresh: {
    food: "Appetite is back. Keep your food, add protein and vegetables. Rice? Add fish and carrot.",
    walk: "Strength is coming back. Walk 20 minutes or dance to 3 songs.",
    sleep: "Sleep early tonight so this energy stays. Don't scroll till late.",
    calm: "Head is clearer now. Do 90 seconds calm to keep the week smooth."
  },
  fine: {
    food: "Fine girl week. Keep what you like, add protein and veg so it shows on your skin.",
    walk: "You have energy. Use it. Walk, take a picture. You are glowing.",
    sleep: "Sleep early to keep this glow. Don't spoil it with late scrolling.",
    calm: "Even fine girls need small pause. 90 seconds to keep your mind clear."
  },
  chop: {
    food: "You want to eat plenty today. Make your plate smaller. Add enough protein or veggies if you can. Just don't overeat, so you don't feel heavy later.",
    walk: "Eaten plenty? Walk 20 minutes after food. It helps digestion and your belly.",
    sleep: "If you eat late and sleep late, your belly will bloat tomorrow. Close food before 9pm.",
    calm: "Want to snap at someone? Take 90 seconds. Breathe in, out. You will not regret it."
  },
  ready: {
    food: "Bloat is gas, not fat. Keep eba/rice small. Add plenty soup and vegetables. Close food before 9pm.",
    walk: "Tired and want to sit? Even small movement counts. Sweep, climb stairs.",
    sleep: "Small things making you cry? Sleep before 10:30pm. Early sleep helps your skin calm down.",
    calm: "Want ice cream or petting today? It's hormones. Do 90 secs calm. Tell your person you need a soft hug."
  }
};

export function getMorningGreeting(
  girl: PhaseId,
  yesterdayCount: number | null
): string {
  // Day 1: no memory yet
  if (yesterdayCount === null) {
    const welcomes: Record<PhaseId, string> = {
      rest: "Rest Girl is here. Rest today. Sleep and Calm.",
      fresh: "Fresh Girl is here. Start with Walk and Food today.",
      fine: "Fine Girl is here. Try for all 4 today if you can.",
      chop: "Chop Girl is here. Eat a balanced plate. Then do your calm.",
      ready: "Ready Girl is here. Slow down today. Sleep early.",
    };
    return welcomes[girl];
  }

  // Binary memory: 2+ = "You showed up", 0-1 = "Yesterday is gone"
  if (yesterdayCount >= 2) {
    const showedUp: Record<PhaseId, string> = {
      rest: "You closed 2 yesterday even while bleeding. That is strong. Rest again today.",
      fresh: "You showed up yesterday. Let's do it again today. Walk and Food.",
      fine: "You showed up yesterday. Your glow is working. Let's go again today.",
      chop: "You ate well yesterday. That is discipline. Let's do it again today.",
      ready: "You slept early yesterday. Your body thanked you. Slow down again today.",
    };
    return showedUp[girl];
  } else {
    const tryAgain: Record<PhaseId, string> = {
      rest: "Yesterday is gone. Today is new. Rest today. Sleep and Calm.",
      fresh: "Yesterday is gone. Today is new. Start fresh today. Walk and Food.",
      fine: "Yesterday is gone. Today is new. Your glow is still here. Let's start today.",
      chop: "Yesterday is gone. Today is new. Eat well today. Food and Calm.",
      ready: "Yesterday is gone. Today is new. Slow down today. Sleep and Calm.",
    };
    return tryAgain[girl];
  }
}

// ============================================================
// getRealCycleLength — NEW (V1.3.1)
// Reads her real cycle from onboarding data, not the fake [32, 35, 38] array.
// Priority:
//   1. Diff between lastPeriodDate and prevPeriodDate (real numbers)
//   2. Her cycleType answer (Monthly → 28, Often Late → 38, Very Irregular → 45)
//   3. Fallback to 35
// ============================================================
export function getRealCycleLength(
  lastPeriodDate: string | null,
  prevPeriodDate: string | null,
  cycleType: string | null
): number {
  // 1. Real diff from two dates
  if (lastPeriodDate && prevPeriodDate) {
    const [ly, lm, ld] = lastPeriodDate.split('-').map(Number);
    const [py, pm, pd] = prevPeriodDate.split('-').map(Number);
    if (![ly, lm, ld, py, pm, pd].some(Number.isNaN)) {
      const last = new Date(Date.UTC(ly, lm - 1, ld));
      const prev = new Date(Date.UTC(py, pm - 1, pd));
      const diffDays = Math.round(Math.abs(last.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 20 && diffDays <= 60) return diffDays;
    }
  }

  // 2. Estimate from cycleType
  if (cycleType === 'Monthly') return 28;
  if (cycleType === 'Often Late') return 38;
  if (cycleType === 'Very Irregular') return 45;

  // 3. Fallback
  return 35;
}
// Calculates the day she is actually late, using her longest known cycle.
export function getLateBoundary(
  history: string[],
  lastPeriodDate: string,
  cycleType: string | null
): { average: number; longest: number; isLate: boolean; daysLate: number } {
  let average = 35;
  let longest = 35;

  if (history.length >= 1 && lastPeriodDate) {
    const allDates = [...history, lastPeriodDate].sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
    const diffs: number[] = [];
    for(let i=1; i<allDates.length; i++){
      const d1 = new Date(allDates[i-1]);
      const d2 = new Date(allDates[i]);
      const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      if(diff > 20 && diff < 60) diffs.push(diff);
    }
    if(diffs.length > 0){
      average = Math.round(diffs.reduce((a,b)=>a+b,0) / diffs.length);
      longest = Math.max(...diffs);
    }
  } else if (cycleType) {
    if (cycleType === 'Monthly') { average = 28; longest = 30; }
    else if (cycleType === 'Often Late') { average = 38; longest = 42; }
    else if (cycleType === 'Very Irregular') { average = 45; longest = 55; }
  }

  const last = new Date(lastPeriodDate);
  const today = new Date();
  today.setHours(0,0,0,0);
  last.setHours(0,0,0,0);
  const currentDay = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const daysLate = currentDay - longest;
  const isLate = daysLate > 0;

  return { average, longest, isLate, daysLate: isLate ? daysLate : 0 };
}