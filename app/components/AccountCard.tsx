'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';
import { logout } from '../../utils/identity';

export default function AccountCard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
      setLoaded(true);
    });
  }, []);

  async function handleLogout() {
    await logout();
    setEmail(null);
    router.push('/auth/login');
  }

  async function handleDeleteAll() {
    setDeleting(true);

    try {
      // 1. Delete all Supabase rows for this user
      const userId = localStorage.getItem('lateCircleUserId');
      if (userId) {
        await supabase.from('daily_logs').delete().eq('user_id', userId);
        await supabase.from('cycles').delete().eq('user_id', userId);
        await supabase.from('period_days').delete().eq('user_id', userId);
        await supabase.from('you_place').delete().eq('user_id', userId);
        await supabase.from('profiles').delete().eq('id', userId);
      }

      // 2. Sign out of any active session
      await supabase.auth.signOut();

      // 3. Clear all local storage keys
      if (typeof window !== 'undefined') {
        const keysToRemove = [
          'lateCircleUserId',
          'lateCircleOnboarded',
          'lateCircleLastPeriod',
          'lateCirclePrevPeriod',
          'lateCircleType',
          'lateCircleLastPhase',
          'lateCircleData',
          'lateCircleDataDate',
          'lateCircleDailyHistory',
          'lateCircleHistory',
          'lateCircleTags',
          'lateCircleLastFoodLog',
          'lateCircleFutureLine',
          'lateCircleFear',
          'lateCircleYouPlace',
          'lateCircleLastClaimDate',
          'lateCircleNightClosed',
          'lateCircleNightCheckDone',
          'lateCircleLastBleedDate',
          'lateCirclePromised7Days',
          'lateCircleCommitDate',
          'lateCirclePushAsked',
        ];
        keysToRemove.forEach((k) => localStorage.removeItem(k));

        // 4. Clear the cookie
        document.cookie = 'lateCircleUserId=; Max-Age=0; path=/';
      }

      // 5. Send her to onboarding — she starts fresh
      router.push('/onboarding');
    } catch (e) {
      console.error('[AccountCard] delete all failed:', e);
      setDeleting(false);
    }
  }

  if (!loaded) return null;

  // Shared delete section — shown in both states
  const DeleteSection = (
    <>
      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full bg-[#FFF0F3] text-[#8A2C3E]/70 border border-[#8A2C3E]/10 py-2.5 rounded-xl text-xs font-bold mt-3 active:scale-95 transition-transform"
        >
          Delete everything
        </button>
      ) : (
        <div className="mt-4 p-4 bg-[#FFF0F3] border border-[#FF8FA3]/30 rounded-2xl">
          <p className="text-xs font-bold text-[#8A2C3E] mb-1">Delete everything?</p>
          <p className="text-[11px] text-[#4A2C35]/70 leading-relaxed mb-3">
            This removes your history from this phone and from our servers. You can start fresh. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteAll}
              disabled={deleting}
              className="flex-1 bg-[#8A2C3E] text-white py-2 rounded-xl text-xs font-bold active:scale-95 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              className="flex-1 bg-white text-[#4A2C35]/60 border border-[#4A2C35]/10 py-2 rounded-xl text-xs font-bold active:scale-95 disabled:opacity-50"
            >
              Keep my data
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (email) {
    return (
      <div className="bg-white border border-[#4A2C35]/5 p-6 rounded-3xl shadow-sm text-left">
        <div className="w-12 h-12 rounded-full bg-[#9CAF88]/20 flex items-center justify-center mb-4">
          <span className="text-2xl">☁️</span>
        </div>
        <h2 className="text-lg font-bold text-[#4A2C35] mb-1">Your account</h2>
        <p className="text-xs text-[#4A2C35]/60 mb-3 break-all">{email}</p>
        <p className="text-xs text-[#4A2C35]/60 leading-relaxed mb-4">
          Your history syncs across phones. If you lose this phone, your data comes back when you log in.
        </p>
        <button
          onClick={handleLogout}
          className="w-full bg-[#FFF0F3] text-[#4A2C35]/60 border border-[#4A2C35]/10 py-2.5 rounded-xl text-xs font-bold active:scale-95"
        >
          Log out
        </button>
        {DeleteSection}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#4A2C35]/5 p-6 rounded-3xl shadow-sm text-left">
      <div className="w-12 h-12 rounded-full bg-[#FFB3C1]/20 flex items-center justify-center mb-4">
        <span className="text-2xl">📱</span>
      </div>
      <h2 className="text-lg font-bold text-[#4A2C35] mb-1">Where your data lives</h2>
      <p className="text-xs text-[#4A2C35]/60 leading-relaxed mb-4">
        Right now, it stays on this phone. Only you can see it. If you change phones, you start fresh on the new one.
      </p>
      <button
        onClick={() => router.push('/auth/signup')}
        className="w-full bg-[#4A2C35] text-white py-2.5 rounded-xl text-xs font-bold active:scale-95"
      >
        Create account to save across phones
      </button>
      <button
        onClick={() => router.push('/auth/login')}
        className="w-full text-[#4A2C35]/50 py-2 text-xs font-medium mt-1"
      >
        I already have an account
      </button>
      {DeleteSection}
    </div>
  );
}