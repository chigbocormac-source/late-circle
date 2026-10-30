'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleType, setCycleType] = useState('');

  const handleFinish = () => {
    // Save data to localStorage so the dashboard can read it
    localStorage.setItem('lateCircleOnboarded', 'true');
    localStorage.setItem('lateCircleLastPeriod', lastPeriodDate);
    localStorage.setItem('lateCircleType', cycleType);
    
    // Move to the dashboard
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-[#0F0F10] text-[#E8E0D5] flex flex-col items-center pt-12 px-6 font-sans relative">
      
      {/* PROGRESS BAR */}
      <div className="w-full max-w-sm flex gap-2 mb-12">
        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-[#9CAF88]' : 'bg-[#E8E0D5]/20'}`}></div>
        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-[#9CAF88]' : 'bg-[#E8E0D5]/20'}`}></div>
        <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-[#9CAF88]' : 'bg-[#E8E0D5]/20'}`}></div>
      </div>

      {/* SCREEN 1: WELCOME */}
      {step === 1 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up">
          <div className="w-24 h-24 bg-[#9CAF88]/20 rounded-full flex items-center justify-center mb-6 mt-10">
            <span className="text-4xl">🌿</span>
          </div>
          <h1 className="text-3xl font-serif text-[#9CAF88] mb-4">Hi, I'm Ovi.</h1>
          <p className="text-[#E8E0D5]/70 text-sm mb-12 leading-relaxed px-4">
            I will manage you. Let's get your cycle in order first. No pressure, just 4 small daily habits.
          </p>
          <button 
            onClick={() => setStep(2)} 
            className="w-full bg-[#9CAF88] text-[#0F0F10] py-4 rounded-full text-lg font-bold active:scale-95 transition-transform mt-auto"
          >
            Start
          </button>
        </div>
      )}

      {/* SCREEN 2: LAST PERIOD */}
      {step === 2 && (
        <div className="flex flex-col items-center flex-1 w-full max-w-sm animate-slide-up">
          <h1 className="text-2xl font-serif text-[#E8E0D5] mb-2 text-center">When did your last period start?</h1>
          <p className="text-[#E8E0D5]/50 text-xs mb-10 text-center">This helps Ovi calculate your cycle day.</p>
          
          <input 
            type="date" 
            value={lastPeriodDate}
            onChange={(e) => setLastPeriodDate(e.target.value)}
            className="w-full bg-[#1A1A1C] border border-[#E8E0D5]/20 text-[#E8E0D5] p-4 rounded-xl mb-6 focus:outline-none focus:border-[#9CAF88] text-center text-lg scheme-dark"
          />

          <div className="flex gap-4 w-full mt-auto">
            <button onClick={() => setStep(1)} className="flex-1 border border-[#E8E0D5]/20 py-4 rounded-full font-bold opacity-70">Back</button>
            <button 
              onClick={() => setStep(3)} 
              disabled={!lastPeriodDate}
              className={`flex-1 py-4 rounded-full font-bold transition-all ${lastPeriodDate ? 'bg-[#9CAF88] text-[#0F0F10]' : 'bg-[#9CAF88]/30 text-[#0F0F10]/50 cursor-not-allowed'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: CYCLE TYPE */}
      {step === 3 && (
        <div className="flex flex-col items-center flex-1 w-full max-w-sm animate-slide-up">
          <h1 className="text-2xl font-serif text-[#E8E0D5] mb-2 text-center">How is your cycle?</h1>
          <p className="text-[#E8E0D5]/50 text-xs mb-8 text-center">Ovi needs to know how to track you.</p>
          
          <div className="flex flex-col gap-3 w-full mb-8">
            <button 
              onClick={() => setCycleType('Regular')}
              className={`w-full py-4 rounded-xl border text-left px-4 transition-all ${cycleType === 'Regular' ? 'border-[#9CAF88] bg-[#9CAF88]/10' : 'border-[#E8E0D5]/20'}`}
            >
              <span className="font-bold block text-lg">Regular</span>
              <span className="text-xs text-[#E8E0D5]/60">Comes every 21-35 days</span>
            </button>
            <button 
              onClick={() => setCycleType('Late / Irregular')}
              className={`w-full py-4 rounded-xl border text-left px-4 transition-all ${cycleType === 'Late / Irregular' ? 'border-[#9CAF88] bg-[#9CAF88]/10' : 'border-[#E8E0D5]/20'}`}
            >
              <span className="font-bold block text-lg">Late / Irregular</span>
              <span className="text-xs text-[#E8E0D5]/60">Comes every 35-60 days or unpredictable</span>
            </button>
          </div>

          <div className="flex gap-4 w-full mt-auto">
            <button onClick={() => setStep(2)} className="flex-1 border border-[#E8E0D5]/20 py-4 rounded-full font-bold opacity-70">Back</button>
            <button 
              onClick={handleFinish} 
              disabled={!cycleType}
              className={`flex-1 py-4 rounded-full font-bold transition-all ${cycleType ? 'bg-[#9CAF88] text-[#0F0F10]' : 'bg-[#9CAF88]/30 text-[#0F0F10]/50 cursor-not-allowed'}`}
            >
              Start my 4 circles
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
<p className="text-[10px] text-[#E8E0D5]/40 text-center mt-8 px-4">
  Late Circle provides wellness information to help you understand lifestyle patterns. It does not diagnose, treat, or prevent any disease. If you have severe pain or miss your period for over 90 days, please see a doctor.
</p>