import { localDateKey } from './analytics';

export type CheckType = 'food' | 'walk' | 'sleep' | 'calm';

export function getCheckInPrompt(checkType: CheckType) {
  switch (checkType) {
    case 'sleep':
      return {
        question: 'Did you sleep before 10:30 last night?',
        why: 'Sleep is your medicine today, love. Your body is rebuilding blood. That\'s why I asked.',
        chips: ['✅ Yes, I slept well', '🤍 I tried a little', 'Not today, but I\'m here'],
      };
    case 'walk':
      return {
        question: 'Did you move your body today?',
        why: 'Walking today helps your energy come back. It helps your next period come easier.',
        chips: ['✅ Yes, I moved', '🤍 I tried a little', 'Not today, but I\'m here'],
      };
    case 'calm':
      return {
        question: 'Did you take 90 seconds of calm today?',
        why: 'Calm is your medicine today. When you are stressed, your period hides. Calm tells your body it\'s safe.',
        chips: ['✅ Yes, I did', '🤍 Do it with me now', 'Not today, but I\'m here'],
      };
    case 'food':
    default:
      return {
        question: 'Did you eat one real meal today?',
        why: 'Food is your medicine today, love. Not just snacks. Your body is hungry for protein.',
        chips: ['✅ Yes, I ate', '🤍 I tried a little', 'Not today, but I\'m here'],
      };
  }
}

// Has she already checked in today? (same key Today page uses)
export function hasCheckedInToday(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('lateCircleData');
  const date = localStorage.getItem('lateCircleDataDate');
  if (!stored || date !== localDateKey()) return false;
  try {
    const parsed = JSON.parse(stored);
    return Object.values(parsed).some(Boolean);
  } catch {
    return false;
  }
}

// Save the check from inside chat — mirrors saveState() in today/page
export function saveChatCheck(checkType: CheckType) {
  if (typeof window === 'undefined') return;
  const today = localDateKey();
  const stored = localStorage.getItem('lateCircleData');
  const current = stored ? JSON.parse(stored) : { food: false, walk: false, sleep: false, calm: false };
  const newState = { ...current, [checkType]: true };

  localStorage.setItem('lateCircleData', JSON.stringify(newState));
  localStorage.setItem('lateCircleDataDate', today);

  const history = JSON.parse(localStorage.getItem('lateCircleDailyHistory') || '{}');
  history[today] = {
    count: Object.values(newState).some(Boolean) ? 1 : 0,
    food: newState.food,
    walk: newState.walk,
    sleep: newState.sleep,
    calm: newState.calm,
  };
  const keys = Object.keys(history).sort();
  if (keys.length > 60) delete history[keys[0]];
  localStorage.setItem('lateCircleDailyHistory', JSON.stringify(history));
}