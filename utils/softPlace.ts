// Late Circle — Soft Place data builder
// Builds the data object consumed by app/cycle/SoftPlace.tsx
// All copy for V1.4 paywall / push / monthly-care is saved as comments below,
// so when you turn on payment later, no copy-writing work remains.

import { localDateKey } from './analytics';

export interface SoftPlaceData {
  girlName: string;
  lastPeriodDate: string;
  today: string;
  daysLate: number;
  lastMonthDaysLate: number | null;      // null if no prior cycle data
  lastMonthCameOnDay: number | null;     // null if no prior cycle data
  foodSuccesses: number;
  walkSuccesses: number;
  sleepSuccesses: number;
  calmSuccesses: number;
  totalSuccesses: number;
  foodDates: string[];                   // formatted dates for display
  walkDates: string[];
  sleepDates: string[];
  calmDates: string[];
  reason: string | null;                 // from localStorage, typed by her
  futureLine: string | null;             // from localStorage, saved by her
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

// Local-safe day diff, mirrors the helper in oviLetter.ts
function isWithinLastNDays(dateKey: string, n: number): boolean {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return false;
  const [y, m, d] = parts;
  const keyLocal = new Date(y, m - 1, d);
  const nowLocal = new Date();
  nowLocal.setHours(0, 0, 0, 0);
  const diffDays = (nowLocal.getTime() - keyLocal.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= n;
}

// Format an ISO-ish date key ("2026-11-07") for display in the letter.
// Uses "7 Nov" for compactness.
export function formatShortDate(iso: string): string {
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return iso;
  const [y, m, d] = parts;
  const local = new Date(y, m - 1, d);
  return local.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatLongDate(iso: string): string {
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return iso;
  const [y, m, d] = parts;
  const local = new Date(y, m - 1, d);
  return local.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Compute how late she was LAST month — for the "you survived last month" line.
// Only returns a value if there are 2+ entries in lateCircleHistory.
function computeLastMonthPattern(
  history: string[],
  lastPeriodDate: string
): { daysLate: number | null; cameOnDay: number | null } {
  if (history.length < 1 || !lastPeriodDate) {
    return { daysLate: null, cameOnDay: null };
  }
  // history = [prevPeriodDate, lastPeriodDate] sorted oldest first
  const sorted = [...history].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const lastIdx = sorted.findIndex(d => d === lastPeriodDate);
  if (lastIdx <= 0) return { daysLate: null, cameOnDay: null };

  const prevCycleStart = new Date(sorted[lastIdx - 1]);
  const currentCycleStart = new Date(lastPeriodDate);
  const cycleLengthDays = Math.round(
    (currentCycleStart.getTime() - prevCycleStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  // If prior cycle was longer than typical (35d default), that means last month she was late.
  // This is a rough estimate — we can't know last month's average precisely without her full history.
  // Use 35 as the baseline.
  const lastMonthDaysLate = Math.max(0, cycleLengthDays - 35);
  return { daysLate: lastMonthDaysLate, cameOnDay: cycleLengthDays };
}

export function buildSoftPlaceData(
  phaseId: string,
  lastPeriodDate: string,
  currentDay: number,
  averageCycle: number,
  dailyHistory: Record<string, any>,
  history: string[],
  reason: string | null,
  futureLine: string | null
): SoftPlaceData {
  const today = localDateKey();
  const daysLate = Math.max(0, currentDay - averageCycle);

  const last60Keys = Object.keys(dailyHistory).filter(k => isWithinLastNDays(k, 60));

  // Per-circle successes + the specific dates, for the "you ate on [dates]" copy
  const foodKeys = last60Keys.filter(k => dailyHistory[k]?.food);
  const walkKeys = last60Keys.filter(k => dailyHistory[k]?.walk);
  const sleepKeys = last60Keys.filter(k => dailyHistory[k]?.sleep);
  const calmKeys = last60Keys.filter(k => dailyHistory[k]?.calm);

  const foodSuccesses = foodKeys.length;
  const walkSuccesses = walkKeys.length;
  const sleepSuccesses = sleepKeys.length;
  const calmSuccesses = calmKeys.length;
  const totalSuccesses = foodSuccesses + walkSuccesses + sleepSuccesses + calmSuccesses;

  const { daysLate: lastMonthDaysLate, cameOnDay: lastMonthCameOnDay } =
    computeLastMonthPattern(history, lastPeriodDate);

  return {
    girlName: getHerGirlName(phaseId),
    lastPeriodDate,
    today,
    daysLate,
    lastMonthDaysLate,
    lastMonthCameOnDay,
    foodSuccesses,
    walkSuccesses,
    sleepSuccesses,
    calmSuccesses,
    totalSuccesses,
    foodDates: foodKeys.sort().map(formatShortDate),
    walkDates: walkKeys.sort().map(formatShortDate),
    sleepDates: sleepKeys.sort().map(formatShortDate),
    calmDates: calmKeys.sort().map(formatShortDate),
    reason,
    futureLine,
  };
}

export function getStarsData(data: SoftPlaceData) {
  return {
    food: { successes: data.foodSuccesses },
    walk: { successes: data.walkSuccesses },
    sleep: { successes: data.sleepSuccesses },
    calm: { successes: data.calmSuccesses },
  };
}

// ---------- V1.4 DEFERRED COPY — do not delete ----------
// When you turn on payment, push, monthly care, uncomment and wire.
//
// TEASER LOCK (V1.4):
//   "I wrote everything for you, Fine Girl.
//    Your full Soft Place is waiting inside.
//    What you tried. What worked. What to do tonight so you can sleep.
//    And one line from last month's you, for this month's you.
//
//    But I cannot show you the rest until you open it.
//    Only yours. No one else will see it."
//   Button: "Open My Soft Place - N500"
//   Sub-copy: "One time. No subscription. Just tonight."
//   Timer line: "If you don't open now, it will go tonight at 11:59pm. Ovi will still stay with you."
//
// CLOSE CONFIRMATION POP-UP (V1.4):
//   "Are you sure, Fine Girl?
//    You are X days late and you have been strong. Don't go and cry alone tonight. Come and rest small."
//   [ Yes, Open My Soft Place - N500 ] [ No, I Will Come Back ]
//
// VOICE PLAYBACK (V1.4):
//   "Fine Girl, this is Ovi. Come and rest.
//    I have your Soft Place here. You are X days late, and I know your heart is beating fast.
//    But look, last month you were also late, and you came out of it. You are still here. You are still fine.
//    You tried X times this month. X times you chose yourself. Don't forget that.
//    Tonight, drink water, eat warm food, and sleep. I will be here tomorrow morning when you wake up.
//    You are safe here. You are soft here. You are loved here. Come and rest."
//
// MONTHLY CARE UPSELL (V1.4):
//   "This Soft Place will stay till tonight 11:59pm.
//    If you want me to keep it forever, and make a new one every month, join Monthly Care."
//   [ Keep My Soft Place - Monthly Care N1,500 ] [ Just Tonight is Okay ]
//
// PUSH MESSAGES (V1.4 — fires when push is set up):
//   Day -2 (2 days before expected period):
//     "Fine Girl, I am here. Your period is supposed to come in 2 days. I will wait with you, no matter what happens. Your Soft Place is waiting."
//   Day 1 late:
//     "Fine Girl, you are 1 day late. Don't panic. Remember your line: [saved line]. Your new Soft Place With Ovi is ready. Come and rest."
//   Day 3 late:
//     "Fine Girl, I am still here. You are 3 days late. You don't have to wait alone tonight. Your Soft Place is still waiting for you."
//   Day 7 late:
//     "Fine Girl, come and rest. You are 7 days late. I know you are tired of thinking. Your Soft Place With Ovi is ready. Let me carry it for you tonight."
//   After payment next month:
//     "Welcome back home, Fine Girl. Your new Soft Place is ready. Come and rest. You did not start from zero. I remembered you."