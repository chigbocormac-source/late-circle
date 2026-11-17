'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase';
import { migrateAnonymousData } from '../../../utils/identity';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!ageConfirmed) {
      setError('Please confirm you are 18 or older, or have a parent/guardian with you.');
      return;
    }

    setLoading(true);

    const oldAnonymousId = localStorage.getItem('lateCircleUserId');

    const { data, error: signupError } = await supabase.auth.signUp({ email, password });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (data.session?.user) {
      if (oldAnonymousId && oldAnonymousId !== data.session.user.id) {
        await migrateAnonymousData(oldAnonymousId, data.session.user.id);
      }
      localStorage.setItem('lateCircleUserId', data.session.user.id);
      localStorage.setItem('lateCircleOnboarded', 'true');
      setLoading(false);
      router.push('/today');
      return;
    }

    setLoading(false);
    setError('Check your email to confirm your account, then come back and log in.');
  }

  return (
    <main className="min-h-screen bg-[#FFF0F3] px-6 pt-16 pb-10 flex flex-col items-center">
      <h1 className="text-3xl font-serif text-[#4A2C35] italic mb-2">Create your account.</h1>
      <p className="text-sm text-[#4A2C35]/60 mb-8 text-center max-w-xs">
        This saves your history so you can find it again if you change phones. Ovi will keep everything safe.
      </p>

      <div className="w-full max-w-sm space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white border border-[#4A2C35]/10 p-3 rounded-xl text-sm focus:outline-none focus:border-[#FF8FA3]"
        />
        <input
          type="password"
          placeholder="Password (at least 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-white border border-[#4A2C35]/10 p-3 rounded-xl text-sm focus:outline-none focus:border-[#FF8FA3]"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full bg-white border border-[#4A2C35]/10 p-3 rounded-xl text-sm focus:outline-none focus:border-[#FF8FA3]"
        />

        <label className="flex items-start gap-2 text-xs text-[#4A2C35]/70 leading-relaxed">
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            className="mt-0.5 accent-[#FF8FA3]"
          />
          <span>I am 18 or older, or I have a parent or guardian with me.</span>
        </label>

        {error && <p className="text-xs text-red-600 leading-relaxed">{error}</p>}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-[#4A2C35] text-white py-3.5 rounded-full font-bold active:scale-95 disabled:opacity-50"
        >
          {loading ? 'One moment…' : 'Create account'}
        </button>

        <button
          onClick={() => router.push('/auth/login')}
          className="w-full text-sm text-[#4A2C35]/60 py-2"
        >
          I already have an account →
        </button>

        <button
          onClick={() => router.push('/today')}
          className="w-full text-xs text-[#4A2C35]/40 py-2"
        >
          Skip for now (stay on this phone only)
        </button>
      </div>
    </main>
  );
}