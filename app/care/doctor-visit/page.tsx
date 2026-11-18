'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorVisit() {
  const router = useRouter();
  const [step, setStep] = useState<'pep' | 'scared' | 'script' | 'ready'>('pep');

  return (
    <main className="min-h-screen bg-[#F1EBFF] text-[#4A2C35] font-sans pb-40 px-6 pt-12 flex flex-col items-center">
      <button onClick={() => router.push('/care')} className="self-start text-[#4A2C35]/50 text-sm mb-6">← Back</button>

      {step === 'pep' && (
        <div className="w-full max-w-sm animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-[#FFF0F3] flex items-center justify-center mb-4 text-2xl">💜</div>
          <h1 className="text-2xl font-bold leading-snug mb-4">Before you go, remember 3 things:</h1>
          <div className="space-y-3 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-bold mb-1">1. You are not broken.</p>
              <p className="text-[13px] text-[#4A2C35]/70 leading-relaxed">You are a girl whose body is asking for attention. That&apos;s normal.</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-bold mb-1">2. You don&apos;t have to be brave.</p>
              <p className="text-[13px] text-[#4A2C35]/70 leading-relaxed">If you feel shy, just say: &apos;Doctor, I tracked everything in my app. Can you please look?&apos; That&apos;s it. You don&apos;t need big English.</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-bold mb-1">3. You deserve to be heard.</p>
              <p className="text-[13px] text-[#4A2C35]/70 leading-relaxed">If he rushes you, show him the RED FLAGS box. Say: &apos;Please, can you check this part?&apos;</p>
            </div>
          </div>
          <p className="text-center text-sm text-[#4A2C35]/70 mb-6 italic">I am in your pocket. I am going with you. I am so proud of you for going.</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => setStep('scared')} className="w-full bg-[#FFF0F3] border border-[#4A2C35]/10 text-[#4A2C35] py-4 rounded-full font-bold text-sm active:scale-95">I&apos;m scared, stay with me 🤍</button>
            <button onClick={() => router.push('/care/doctor-pdf')} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold text-sm active:scale-95 shadow-lg">I&apos;m ready, let&apos;s go →</button>
          </div>
        </div>
      )}

      {step === 'scared' && (
        <div className="w-full max-w-sm animate-fade-in text-center">
          <div className="w-16 h-16 rounded-full bg-[#9CAF88]/20 flex items-center justify-center mx-auto mb-4 text-3xl">🧠</div>
          <h1 className="text-2xl font-bold mb-3">Okay, I&apos;m staying.</h1>
          <p className="text-sm text-[#4A2C35]/70 leading-relaxed mb-6 px-2">
            Breathe with me. In... 2... 3... 4... Out... 2... 3... 4...
            <br /><br />
            You are not going to be judged. You are going to be helped. And after today, you will know more about yourself than you did yesterday.
            <br /><br />
            Do you want me to tell you exactly what to say when you enter?
          </p>
          <button onClick={() => setStep('script')} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold text-sm active:scale-95 shadow-lg mb-2">Yes, tell me what to say</button>
          <button onClick={() => setStep('pep')} className="w-full text-[#4A2C35]/40 text-xs py-2">Back</button>
        </div>
      )}

      {step === 'script' && (
        <div className="w-full max-w-sm animate-fade-in text-center">
          <h1 className="text-2xl font-bold mb-4">Say this, word for word:</h1>
          <div className="bg-white rounded-3xl p-6 shadow-sm text-left mb-6">
            <p className="text-[15px] leading-relaxed italic">
              &quot;Good morning Doctor. My period is late. I tracked my cycles for months. This is my report. I am worried, please help me understand.&quot;
            </p>
          </div>
          <p className="text-sm text-[#4A2C35]/70 mb-6">That&apos;s all. You don&apos;t need to say more. Let him read.</p>
          <button onClick={() => router.push('/care/doctor-pdf')} className="w-full bg-[#FF8FA3] text-white py-4 rounded-full font-bold text-sm active:scale-95 shadow-lg">Show My Doctor Report →</button>
        </div>
      )}
    </main>
  );
}