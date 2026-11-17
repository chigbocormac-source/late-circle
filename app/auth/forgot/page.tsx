'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase';

export default function Forgot() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setError('');
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setLoading(false);
    if (resetError) { setError(resetError.message); return; }
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-[#FFF0F3] px-6 pt-16 pb-10 flex flex-col items-center">
      <h1 className="text-3xl font-serif text-[#4A2C35] italic mb-2">Reset your password.</h1>
      <p className="text-sm text-[#4A2C35]/60 mb-8 text-center max-w-xs">
        Enter your email and we will send you a link to set a new password.
      </p>

      {sent ? (
        <div className="w-full max-w-sm bg-white rounded-2xl p-5 text-center">
          <p className="text-sm text-[#4A2C35] font-bold mb-2">Check your email.</p>
          <p className="text-xs text-[#4A2C35]/60 leading-relaxed mb-4">
            If an account exists for {email}, a reset link is on its way. It may take a minute. Check your spam folder if you don't see it.
          </p>
          <button onClick={() => router.push('/auth/login')} className="w-full bg-[#4A2C35] text-white py-3 rounded-full font-bold text-sm">
            Back to log in
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-[#4A2C35]/10 p-3 rounded-xl text-sm focus:outline-none focus:border-[#FF8FA3]"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-[#4A2C35] text-white py-3.5 rounded-full font-bold active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
          <button onClick={() => router.push('/auth/login')} className="w-full text-xs text-[#4A2C35]/40 py-2">
            Back to log in
          </button>
        </div>
      )}
    </main>
  );
}