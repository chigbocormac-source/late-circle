export type PhaseId = 'rest' | 'fresh' | 'fine' | 'chop' | 'ready';

export function getCyclePhase(day: number, average: number = 35) {
  // Guard against corrupt inputs
  const safeDay = Math.max(1, day || 1);
  const safeAvg = Math.max(21, average || 35);

  // Percentage of the cycle we're in (0..100)
  const pct = (safeDay / safeAvg) * 100;

  // Phase boundaries:
  if (pct <= 15) return { id: 'rest' as PhaseId,  name: 'Rest Girl',  emoji: '🌙', color: '#9CAF88', focus: ['sleep'] };
  if (pct <= 35) return { id: 'fresh' as PhaseId, name: 'Fresh Girl', emoji: '🌱', color: '#9CAF88', focus: ['walk'] };
  if (pct <= 60) return { id: 'fine' as PhaseId,  name: 'Fine Girl',  emoji: '✨', color: '#D4AF37', focus: ['food'] };
  if (pct <= 80) return { id: 'chop' as PhaseId,  name: 'Chop Girl',  emoji: '🍚', color: '#FF8FA3', focus: ['food'] };
  return              { id: 'ready' as PhaseId, name: 'Ready Girl', emoji: '💜', color: '#8A2C3E', focus: ['calm'] };
}

// Note: The text below is for the 5 Girls Explainer Modal.
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

// THE NEW GOOD MORNING SCRIPT (Shows once when she enters a new phase)
export function getPhaseWelcome(
  girl: PhaseId,
  cycleDay: number,
  daysUntilNext: number
): string {
  switch (girl) {
    case 'rest':
      return `Love, good morning. You are in your Period Phase today - Day ${cycleDay}. Your body is cleaning. Rest today, don't stress yourself. Drink water. If cramp is too much, put warm water on your belle. I'm here.`;
    case 'fresh':
      return `Love, good morning. You are in your Growing Phase today - Day ${cycleDay}. Your energy is coming back. This is a good time to do your work, exercise, and eat well. Your body is preparing a new egg.`;
    case 'fine':
      return `Love, good morning. You are in your Ovulation Phase today - Day ${cycleDay}. This is your sensitive time. If you don't want pregnancy, be careful today. If you are trying for baby, this is your best time. You may feel hot or see clear discharge. That's normal.`;
    case 'chop':
      return `Love, good morning. You are in your Cravings Phase today - Day ${cycleDay}. Your body is slowing down and preparing for your period. You might feel hungrier than usual. That's your body asking for fuel, not greed. Eat well today.`;
    case 'ready':
      return `Love, good morning. You are in your Waiting Phase today - Day ${cycleDay}. If you are feeling moody or your breast is paining you, it's not you. It's this phase. Be soft with yourself. Your period will come in about ${daysUntilNext} days.`;
    default:
      return `Love, good morning.`;
  }
}

// THE DAILY GREETING (Shows every day)
export function getMorningGreeting(
  girl: PhaseId,
  yesterdayCount: number | null
): string {
  if (yesterdayCount === null) {
    const welcomes: Record<PhaseId, string> = {
      rest: "Sleep is your medicine today.",
      fresh: "Move a little today.",
      fine: "Fuel your glow today.",
      chop: "Eat well today.",
      ready: "Breathe today.",
    };
    return welcomes[girl];
  }

  if (yesterdayCount >= 2) {
    const showedUp: Record<PhaseId, string> = {
      rest: "You closed 2 yesterday even while bleeding. That is strong. Rest again today.",
      fresh: "You showed up yesterday. Let's do it again today. Move a little.",
      fine: "You showed up yesterday. Your glow is working. Fuel it again today.",
      chop: "You ate well yesterday. That is discipline. Eat well again today.",
      ready: "You slept early yesterday. Your body thanked you. Breathe again today.",
    };
    return showedUp[girl];
  } else {
    const tryAgain: Record<PhaseId, string> = {
      rest: "Yesterday is gone. Today is new. Sleep today.",
      fresh: "Yesterday is gone. Today is new. Move a little today.",
      fine: "Yesterday is gone. Today is new. Your glow is still here. Fuel it today.",
      chop: "Yesterday is gone. Today is new. Eat well today.",
      ready: "Yesterday is gone. Today is new. Just breathe today.",
    };
    return tryAgain[girl];
  }
}

export function getRealCycleLength(
  lastPeriodDate: string | null,
  prevPeriodDate: string | null,
  cycleType: string | null
): number {
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

  if (cycleType === 'Monthly') return 28;
  if (cycleType === 'Often Late') return 38;
  if (cycleType === 'Very Irregular') return 45;

  return 35;
}

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