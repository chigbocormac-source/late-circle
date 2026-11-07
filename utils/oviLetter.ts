import { localDateKey } from './analytics';

export interface LetterData {
  girlName: string;
  lastPeriodDate: string;
  today: string;
  daysLate: number;
  foodSuccesses: number;
  walkSuccesses: number;
  sleepSuccesses: number;
  calmSuccesses: number;
  totalSuccesses: number;
}

export interface StarsData {
  food: { successes: number };
  walk: { successes: number };
  sleep: { successes: number };
  calm: { successes: number };
}

const GIRL_NAMES: Record<string, string> = {
  rest: 'Rest Girl',
  fresh: 'Fresh Girl',
  fine: 'Fine Girl',
  chop: 'Chop Girl',
  ready: 'Ready Girl',
};

export function getHerGirlName(phaseId: string): string {
  return GIRL_NAMES[phaseId] || 'Fine Girl';
}

// Local-safe day-diff: returns true if a YYYY-MM-DD key is within the last N days,
// inclusive of today. Never uses UTC parsing.
function isWithinLastNDays(dateKey: string, n: number): boolean {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return false;
  const [y, m, d] = parts;
  const keyLocal = new Date(y, m - 1, d);        // local midnight of that day
  const nowLocal = new Date();
  nowLocal.setHours(0, 0, 0, 0);                 // local midnight today
  const diffDays = (nowLocal.getTime() - keyLocal.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= n;
}

export function buildLetterData(
  phaseId: string,
  lastPeriodDate: string,
  currentDay: number,
  averageCycle: number,
  dailyHistory: Record<string, any>,
  symptoms: string[]  // kept for signature compatibility, not used
): LetterData {
  const today = localDateKey();  // local, not UTC
  const daysLate = Math.max(0, currentDay - averageCycle);

  const last60Keys = Object.keys(dailyHistory).filter(k => isWithinLastNDays(k, 60));

  const foodSuccesses = last60Keys.filter(k => dailyHistory[k]?.food).length;
  const walkSuccesses = last60Keys.filter(k => dailyHistory[k]?.walk).length;
  const sleepSuccesses = last60Keys.filter(k => dailyHistory[k]?.sleep).length;
  const calmSuccesses = last60Keys.filter(k => dailyHistory[k]?.calm).length;
  const totalSuccesses = foodSuccesses + walkSuccesses + sleepSuccesses + calmSuccesses;

  return {
    girlName: getHerGirlName(phaseId),
    lastPeriodDate,
    today,
    daysLate,
    foodSuccesses,
    walkSuccesses,
    sleepSuccesses,
    calmSuccesses,
    totalSuccesses,
  };
}

export function buildStarsData(dailyHistory: Record<string, any>): StarsData {
  const last60Keys = Object.keys(dailyHistory).filter(k => isWithinLastNDays(k, 60));

  return {
    food: { successes: last60Keys.filter(k => dailyHistory[k]?.food).length },
    walk: { successes: last60Keys.filter(k => dailyHistory[k]?.walk).length },
    sleep: { successes: last60Keys.filter(k => dailyHistory[k]?.sleep).length },
    calm: { successes: last60Keys.filter(k => dailyHistory[k]?.calm).length },
  };
}

export function formatDate(iso: string): string {
  // Parse as LOCAL midnight, not UTC. Avoids the day-shift bug for any device
  // set to a negative-offset timezone, and doesn't drift on DST transitions.
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return iso;
  const [y, m, d] = parts;
  const local = new Date(y, m - 1, d);
  return local.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function buildLetterText(data: LetterData): string {
  const lines: string[] = [];

  if (data.foodSuccesses > 0) lines.push(`Food: You closed it ${data.foodSuccesses} ${data.foodSuccesses === 1 ? 'time' : 'times'}. That's ${data.foodSuccesses} real meals on time.`);
  if (data.walkSuccesses > 0) lines.push(`Walk: You closed it ${data.walkSuccesses} ${data.walkSuccesses === 1 ? 'time' : 'times'}. That's ${data.walkSuccesses} times you moved your body.`);
  if (data.sleepSuccesses > 0) lines.push(`Sleep: You closed it ${data.sleepSuccesses} ${data.sleepSuccesses === 1 ? 'time' : 'times'}. That's ${data.sleepSuccesses} nights your body rested.`);
  if (data.calmSuccesses > 0) lines.push(`Calm: You closed it ${data.calmSuccesses} ${data.calmSuccesses === 1 ? 'time' : 'times'}. That's ${data.calmSuccesses} moments your mind got quiet.`);

  const winsBlock = lines.length > 0
    ? lines.join('\n\n')
    : "You opened the app this month. That is where it starts. Tomorrow, let's close one circle.";

  return `Dear ${data.girlName},

Hey, it's Ovi. I know you are waiting for your period. Let's look at what you actually did this month, because I think you have forgotten.

Your last period started on ${formatDate(data.lastPeriodDate)}. Today is ${formatDate(data.today)}. You are ${data.daysLate} ${data.daysLate === 1 ? 'day' : 'days'} late.

Here is what you closed:

${winsBlock}

So when you say "I did nothing," Ovi is here to say: no, look. You showed up ${data.totalSuccesses} ${data.totalSuccesses === 1 ? 'time' : 'times'} for yourself while you were scared. That is trying.

You are not lazy. You are not broken. You are a girl who tried ${data.totalSuccesses} ${data.totalSuccesses === 1 ? 'time' : 'times'} while she was scared. I am proud of you.

Tonight, let's try for one more good sleep. Just one. I will stay.

Love,
Ovi`;
}

export function buildStarsPageText(data: LetterData): string {
  return `You tried. Look at all these stars. That is you, trying in the dark. ${data.totalSuccesses} ${data.totalSuccesses === 1 ? 'star' : 'stars'}. Every one counts.`;
}