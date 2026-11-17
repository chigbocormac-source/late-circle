import { supabase } from '../app/supabase';

const USER_ID_KEY = 'lateCircleUserId';
const ONBOARDED_KEY = 'lateCircleOnboarded';
const COOKIE_NAME = 'lateCircleUserId';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function readCookieUserId(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookieUserId(userId: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(userId)}; Max-Age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

export async function ensureIdentity(): Promise<{
  userId: string;
  onboarded: boolean;
  isLoggedIn: boolean;
  wasRestored: boolean;
}> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const authId = session.user.id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authId)
        .maybeSingle();

      if (!profile) {
        await supabase.from('profiles').insert([{ id: authId, name: 'Fine Girl' }]);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_ID_KEY, authId);
        localStorage.setItem(ONBOARDED_KEY, 'true');
      }
      writeCookieUserId(authId);

      return { userId: authId, onboarded: true, isLoggedIn: true, wasRestored: false };
    }
  } catch (e) {
    console.error('[identity] session check failed:', e);
  }

  let userId = typeof window !== 'undefined' ? localStorage.getItem(USER_ID_KEY) : null;
  let onboarded = typeof window !== 'undefined' ? localStorage.getItem(ONBOARDED_KEY) : null;
  let wasRestored = false;

  if (!userId) {
    const cookieUserId = readCookieUserId();
    if (cookieUserId) userId = cookieUserId;
  }

  if (userId && onboarded !== 'true') {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        localStorage.setItem(USER_ID_KEY, userId);
        localStorage.setItem(ONBOARDED_KEY, 'true');
        onboarded = 'true';
        wasRestored = true;
      }
    } catch (e) {
      console.error('[identity] profile lookup failed:', e);
    }
  }

  if (!userId) {
    userId = crypto.randomUUID();
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_ID_KEY, userId);
    }
    try {
      await supabase.from('profiles').insert([{ id: userId, name: 'Fine Girl' }]);
    } catch (e) {
      console.error('[identity] profile insert failed:', e);
    }
  }

  writeCookieUserId(userId);

  return {
    userId,
    onboarded: onboarded === 'true',
    isLoggedIn: false,
    wasRestored,
  };
}

export function markOnboarded(userId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_ID_KEY, userId);
    localStorage.setItem(ONBOARDED_KEY, 'true');
  }
  writeCookieUserId(userId);
}

export async function migrateAnonymousData(fromUserId: string, toUserId: string) {
  if (!fromUserId || !toUserId || fromUserId === toUserId) return;

  const tables = ['daily_logs', 'cycles', 'period_days', 'you_place'] as const;
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .update({ user_id: toUserId })
        .eq('user_id', fromUserId);
      if (error) console.error(`[identity] migrate ${table} failed:`, error.message);
    } catch (e) {
      console.error(`[identity] migrate ${table} threw:`, e);
    }
  }

  try {
    await supabase.from('profiles').update({ id: toUserId }).eq('id', fromUserId);
    await supabase.from('profiles').delete().eq('id', fromUserId);
  } catch (e) {
    console.error('[identity] profiles migrate failed:', e);
  }
}

export async function logout() {
  await supabase.auth.signOut();
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(ONBOARDED_KEY);
  }
  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; path=/`;
  }
}