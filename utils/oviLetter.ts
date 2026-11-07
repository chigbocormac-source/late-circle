// Late Circle — Ovi Letter generator
// Pulls real data, produces the Letter, Stars, and Future Letter

export interface LetterData {
  girlName: string;
  lastPeriodDate: string;
  today: string;
  daysLate: number;
  lastMonthDaysLate: number;
  lastMonthCycleLength: number;
  foodAttempts: number;
  foodSuccesses: number;
  walkAttempts: number;
  walkSuccesses: number;
  sleepAttempts: number;
  sleepSuccesses: number;
  calmAttempts: number;
  calmSuccesses: number;
  faceLogs: number;
  acneOnLateSleepNights: boolean;
}

export interface StarsData {
  food: { attempts: number; successes: number };
  walk: { attempts: number; successes: number };
  sleep: { attempts: number; successes: number };
  calm: { attempts: number; successes: number };
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

export function buildLetterData(
  phaseId: string,
  lastPeriodDate: string,
  currentDay: number,
  averageCycle: number,
  dailyHistory: Record<string, any>,
  symptoms: string[]
): LetterData {
  const today = new Date().toISOString().split('T')[0];
  const daysLate = Math.max(0, currentDay - averageCycle);

  // Count attempts and successes over last 30 days
  const last30Keys = Object.keys(dailyHistory)
    .filter(k => {
      const d = new Date(k);
      const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    });

  let foodAttempts = 0, foodSuccesses = 0;
  let walkAttempts = 0, walkSuccesses = 0;
  let sleepAttempts = 0, sleepSuccesses = 0;
  let calmAttempts = 0, calmSuccesses = 0;

  last30Keys.forEach(k => {
    const d = dailyHistory[k];
    if (!d) return;
    foodAttempts++;
    if (d.food) foodSuccesses++;
    walkAttempts++;
    if (d.walk) walkSuccesses++;
    sleepAttempts++;
    if (d.sleep) sleepSuccesses++;
    calmAttempts++;
    if (d.calm) calmSuccesses++;
  });

  const lastMonthData = last30Keys.length > 0 ? dailyHistory[last30Keys[0]] : null;
  const lastMonthDaysLate = lastMonthData ? 0 : 0;
  const lastMonthCycleLength = averageCycle;

  return {
    girlName: getHerGirlName(phaseId),
    lastPeriodDate,
    today,
    daysLate,
    lastMonthDaysLate,
    lastMonthCycleLength,
    foodAttempts,
    foodSuccesses,
    walkAttempts,
    walkSuccesses,
    sleepAttempts,
    sleepSuccesses,
    calmAttempts,
    calmSuccesses,
    faceLogs: symptoms.length,
    acneOnLateSleepNights: symptoms.includes('acne'),
  };
}

export function buildStarsData(
  dailyHistory: Record<string, any>
): StarsData {
  const last30Keys = Object.keys(dailyHistory)
    .filter(k => {
      const d = new Date(k);
      const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    });

  let foodAttempts = 0, foodSuccesses = 0;
  let walkAttempts = 0, walkSuccesses = 0;
  let sleepAttempts = 0, sleepSuccesses = 0;
  let calmAttempts = 0, calmSuccesses = 0;

  last30Keys.forEach(k => {
    const d = dailyHistory[k];
    if (!d) return;
    foodAttempts++;
    if (d.food) foodSuccesses++;
    walkAttempts++;
    if (d.walk) walkSuccesses++;
    sleepAttempts++;
    if (d.sleep) sleepSuccesses++;
    calmAttempts++;
    if (d.calm) calmSuccesses++;
  });

  return {
    food: { attempts: foodAttempts, successes: foodSuccesses },
    walk: { attempts: walkAttempts, successes: walkSuccesses },
    sleep: { attempts: sleepAttempts, successes: sleepSuccesses },
    calm: { attempts: calmAttempts, successes: calmSuccesses },
  };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
}

export function buildLetterText(data: LetterData): string {
  const totalAttempts =
    data.foodAttempts + data.walkAttempts + data.sleepAttempts + data.calmAttempts;

  const foodLine =
    data.foodAttempts > 0
      ? `You tried to eat a balanced plate before 9pm on ${data.foodAttempts} ${data.foodAttempts === 1 ? 'day' : 'days'}. You made it ${data.foodSuccesses} ${data.foodSuccesses === 1 ? 'time' : 'times'}.`
      : '';

  const walkLine =
    data.walkAttempts > 0
      ? `You tried to walk or move for 20 minutes on ${data.walkAttempts} ${data.walkAttempts === 1 ? 'day' : 'days'}. You made it ${data.walkSuccesses} ${data.walkSuccesses === 1 ? 'time' : 'times'}.`
      : '';

  const sleepLine =
    data.sleepAttempts > 0
      ? `You tried to be in bed by 10:30pm on ${data.sleepAttempts} ${data.sleepAttempts === 1 ? 'night' : 'nights'}. You made it ${data.sleepSuccesses} ${data.sleepSuccesses === 1 ? 'time' : 'times'}.`
      : '';

  const calmLine =
    data.calmAttempts > 0
      ? `You tried to calm yourself on ${data.calmAttempts} ${data.calmAttempts === 1 ? 'night' : 'nights'}. You made it ${data.calmSuccesses} ${data.calmSuccesses === 1 ? 'time' : 'times'}.`
      : '';

  return `Dear ${data.girlName},

Hey, it's Ovi. I know you are waiting for your period. Let's look at how hard you actually tried this month, because I think you have forgotten.

Your last period started on ${formatDate(data.lastPeriodDate)}. Today is ${formatDate(data.today)}. You are ${data.daysLate} ${data.daysLate === 1 ? 'day' : 'days'} late.

Look at how you tried:

${foodLine}

${walkLine}

${sleepLine}

${calmLine}

So when you say "I did nothing," Ovi is here to say: no, look. You showed up ${totalAttempts} times for yourself while you were scared. That is trying.

You are not lazy. You are not broken. You are a girl who tried ${totalAttempts} times while she was scared. I am proud of you.

Tonight, let's try for one more good sleep. Just one. I will stay.

Love,
Ovi`;
}

export function buildStarsPageText(data: LetterData): string {
  const totalBright =
    data.foodSuccesses + data.walkSuccesses + data.sleepSuccesses + data.calmSuccesses;
  const totalSoft =
    data.foodAttempts + data.walkAttempts + data.sleepAttempts + data.calmAttempts - totalBright;

  return `You tried. Look at all these stars. That is you, trying in the dark. ${totalBright} bright, ${totalSoft} soft. Both count.`;
}