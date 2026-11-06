// Late Circle — Local event log
// Ring buffer, last 200 events, no backend

export type EventType =
  | 'circle_closed'
  | 'app_opened'
  | 'girl_explainer_opened'
  | 'food_search_used'
  | 'share_completed';

interface Event {
  type: EventType;
  ts: number;
  [key: string]: any;
}

const KEY = 'lateCircleEvents';
const MAX_EVENTS = 200;

// Guards for StrictMode / fast re-mounts.
// If two mounts happen within this window, only the first fires `app_opened`.
const APP_OPEN_DEDUPE_MS = 5000;
const LAST_APP_OPEN_KEY = 'lateCircleLastAppOpenLog';
const HAS_OPENED_KEY = 'lateCircleHasOpenedBefore';

export function logEvent(type: EventType, data: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    const events: Event[] = raw ? JSON.parse(raw) : [];
    events.push({ type, ts: Date.now(), ...data });
    localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {}
}

export function getEvents(): Event[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearEvents() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
    // Also reset the session flags so the next trackAppOpened logs is_first_open: true
    localStorage.removeItem(HAS_OPENED_KEY);
    localStorage.removeItem(LAST_APP_OPEN_KEY);
  } catch {}
}

export function trackAppOpened(currentDay: number) {
  if (typeof window === 'undefined') return;
  try {
    const now = Date.now();

    // Dedupe: StrictMode double-invokes useEffect in dev, and some devices
    // remount fast. Ignore any app_opened within 5s of the last one.
    const lastRaw = localStorage.getItem(LAST_APP_OPEN_KEY);
    if (lastRaw) {
      const last = parseInt(lastRaw, 10);
      if (!Number.isNaN(last) && now - last < APP_OPEN_DEDUPE_MS) {
        return;
      }
    }
    localStorage.setItem(LAST_APP_OPEN_KEY, String(now));

    const hasOpenedBefore = localStorage.getItem(HAS_OPENED_KEY) === 'true';
    logEvent('app_opened', {
      day: currentDay,
      is_first_open: !hasOpenedBefore,
      is_return: hasOpenedBefore,
    });

    if (!hasOpenedBefore) {
      localStorage.setItem(HAS_OPENED_KEY, 'true');
    }
  } catch {}
}