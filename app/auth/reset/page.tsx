'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase';

export default function Reset() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleReset() {
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) { setError(updateError.message); return; }
    router.push('/today');
  }

  return (
    <main className="min-h-screen bg-[#FFF0F3] px-6 pt-16 pb-10 flex flex-col items-center">
      <h1 className="text-3xl font-serif text-[#4A2C35] italic mb-2">Set a new password.</h1>
      <p className="text-sm text-[#4A2C35]/60 mb-8">Pick something you will remember.</p>

      {!ready ? (
        <p className="text-sm text-[#4A2C35]/60">Checking your link…</p>
      ) : (
        <div className="w-full max-w-sm space-y-3">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-[#4A2C35]/10 p-3 rounded-xl text-sm focus:outline-none focus:border-[#FF8FA3]"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full bg-white border border-[#4A2C35]/10 p-3 rounded-xl text-sm focus:outline-none focus:border-[#FF8FA3]"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-[#4A2C35] text-white py-3.5 rounded-full font-bold active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save new password'}
          </button>
        </div>
      )}
    </main>
  );
}