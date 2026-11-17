'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    setLoading(true);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    if (data.session?.user) {
      localStorage.setItem('lateCircleUserId', data.session.user.id);
      localStorage.setItem('lateCircleOnboarded', 'true');
      router.push('/today');
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF0F3] px-6 pt-16 pb-10 flex flex-col items-center">
      <h1 className="text-3xl font-serif text-[#4A2C35] italic mb-2">Welcome back.</h1>
      <p className="text-sm text-[#4A2C35]/60 mb-8">Ovi kept your place.</p>

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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
          className="w-full bg-white border border-[#4A2C35]/10 p-3 rounded-xl text-sm focus:outline-none focus:border-[#FF8FA3]"
        />

        {error && <p className="text-xs text-red-600 leading-relaxed">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#4A2C35] text-white py-3.5 rounded-full font-bold active:scale-95 disabled:opacity-50"
        >
          {loading ? 'One moment…' : 'Log in'}
        </button>

        <button
          onClick={() => router.push('/auth/signup')}
          className="w-full text-sm text-[#4A2C35]/60 py-2"
        >
          I am new here →
        </button>

        <button
          onClick={() => router.push('/auth/forgot')}
          className="w-full text-xs text-[#4A2C35]/40 py-2"
        >
          Forgot password?
        </button>
      </div>
    </main>
  );
}