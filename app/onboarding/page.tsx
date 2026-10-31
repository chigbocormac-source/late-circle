'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [prevPeriodDate, setPrevPeriodDate] = useState('');
  const [periodDuration, setPeriodDuration] = useState('');
  const [cycleType, setCycleType] = useState('');

  const calculatePrediction = () => {
    let averageCycle = 35; 
    let cycleText = "35 days girl";
    let realDiffDays = 0; // For the card display

    if (lastPeriodDate && prevPeriodDate) {
      const last = new Date(lastPeriodDate);
      const prev = new Date(prevPeriodDate);
      last.setUTCHours(0,0,0,0);
      prev.setUTCHours(0,0,0,0);
      
      const diffTime = Math.abs(last.getTime() - prev.getTime());
      realDiffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (realDiffDays >= 25 && realDiffDays <= 45) {
        averageCycle = realDiffDays;
        cycleText = `${realDiffDays} days girl`;
      } else {
        cycleText = "35 days girl (using average)";
      }
    }

    const last = new Date(lastPeriodDate || new Date());
    const nextStart = new Date(last);
    nextStart.setDate(last.getDate() + averageCycle - 2);
    const nextEnd = new Date(last);
    nextEnd.setDate(last.getDate() + averageCycle + 2);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    return {
      cycleText,
      nextRange: `${formatDate(nextStart)} - ${formatDate(nextEnd)}`,
      averageCycle,
      realDiffDays,
    };
  };

  const handleFinish = () => {
    localStorage.setItem('lateCircleOnboarded', 'true');
    localStorage.setItem('lateCircleLastPeriod', lastPeriodDate);
    localStorage.setItem('lateCirclePrevPeriod', prevPeriodDate);
    localStorage.setItem('lateCircleDuration', periodDuration);
    localStorage.setItem('lateCircleType', cycleType);

    // Save to history array so Wins page can show it
    const history = JSON.parse(localStorage.getItem('lateCircleHistory') || '[]');
    if (prevPeriodDate) history.push(prevPeriodDate);
    if (lastPeriodDate) history.push(lastPeriodDate);
    localStorage.setItem('lateCircleHistory', JSON.stringify(history));

    router.push('/today'); // Changed from '/'
  };

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-12 px-6 font-sans pb-8">
      
      {/* PROGRESS BAR */}
      <div className="w-full max-w-sm flex gap-2 mb-10">
        <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 0 ? 'bg-[#4A2C35] shadow-[0_2px_8px_rgba(74,44,53,0.2)]' : 'bg-[#4A2C35]/10'}`}></div>
        <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-[#4A2C35] shadow-[0_2px_8px_rgba(74,44,53,0.2)]' : 'bg-[#4A2C35]/10'}`}></div>
        <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-[#4A2C35] shadow-[0_2px_8px_rgba(74,44,53,0.2)]' : 'bg-[#4A2C35]/10'}`}></div>
        <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-[#4A2C35] shadow-[0_2px_8px_rgba(74,44,53,0.2)]' : 'bg-[#4A2C35]/10'}`}></div>
      </div>

      {/* SCREEN 0: HOOK */}
      {step === 0 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8 mt-8 shadow-[0_20px_40px_-12px_rgba(74,44,53,0.12),0_8px_16px_-8px_rgba(255,182,193,0.3),inset_0_1px_0_0_rgba(255,255,255,1)] border border-white">
            <span className="text-3xl">🌙</span>
          </div>
          <h1 className="text-[28px] font-bold leading-[1.15] mb-4 px-2">Your period is late. You are not broken.</h1>
          <p className="text-[#4A2C35]/60 text-[15px] leading-relaxed px-2 mb-12">
            For many Nigerian girls, a late period is linked to daily habits. Eating late, sitting all day, and poor sleep can affect your cycle. You are not alone, and it is not your fault.
          </p>
          <button onClick={() => setStep(1)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full text-[16px] font-bold mt-auto active:scale-[0.98] shadow-[0_16px_32px_-8px_rgba(74,44,53,0.35),0_6px_16px_-6px_rgba(74,44,53,0.2)] hover:shadow-[0_20px_40px_-10px_rgba(74,44,53,0.4)] transition-all duration-300">
            Show me how to balance my body →
          </button>
          <p className="text-[9px] text-[#4A2C35]/30 text-center mt-6 tracking-wide">Not a medical diagnosis. Lifestyle tracking only.</p>
        </div>
      )}

      {/* SCREEN 1: MEET OVI */}
      {step === 1 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up">
          <div className="w-20 h-20 bg-[#E8F0E0] rounded-full flex items-center justify-center mb-8 mt-8 shadow-[0_20px_40px_-12px_rgba(156,175,136,0.25),0_8px_16px_-8px_rgba(156,175,136,0.2),inset_0_1px_0_0_rgba(255,255,255,0.8)] border border-white/60">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-[28px] font-bold leading-[1.15] mb-4">Hi, I'm Ovi. I will know your pattern.</h1>
          <p className="text-[#4A2C35]/60 text-[15px] leading-relaxed px-2 mb-12">
            I won't give you 10 rules or foreign diets. I manage 4 circles daily: Food, Walk, Sleep, Calm. Close them, and your body feels normal again.
          </p>
          <button onClick={() => setStep(2)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full text-[16px] font-bold mt-auto active:scale-[0.98] shadow-[0_16px_32px_-8px_rgba(74,44,53,0.35),0_6px_16px_-6px_rgba(74,44,53,0.2)] transition-all">
            Okay Ovi, let's start →
          </button>
        </div>
      )}

      {/* SCREEN 2: DATA COLLECTION */}
      {step === 2 && (
        <div className="flex flex-col flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4">
          <h1 className="text-[26px] font-bold leading-tight mb-2 text-center">Let's know your pattern.</h1>
          <p className="text-[#4A2C35]/50 text-xs mb-6 text-center">This stays on your phone only. 🔒 So I can predict honestly, not like Flo.</p>
          
          <div className="flex flex-col gap-6 w-full mb-8">
            <div>
              <label className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-2 block">When did your last period start?</label>
              <input type="date" value={lastPeriodDate} onChange={(e) => setLastPeriodDate(e.target.value)} className="w-full bg-white border border-transparent text-[#4A2C35] p-4 rounded-2xl focus:outline-none focus:border-[#4A2C35]/20 focus:ring-4 focus:ring-[#FFB6C1]/20 text-center text-[16px] shadow-[0_8px_24px_-8px_rgba(74,44,53,0.08),0_2px_8px_-2px_rgba(74,44,53,0.04),inset_0_1px_0_0_rgba(255,255,255,1)] transition-all" />
              <p className="text-[10px] text-[#4A2C35]/40 mt-1.5 text-center">Don't remember exact? Pick closest week.</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-2 block">And the one before that? (Optional)</label>
              <input type="date" value={prevPeriodDate} onChange={(e) => setPrevPeriodDate(e.target.value)} className="w-full bg-white border border-transparent text-[#4A2C35] p-4 rounded-2xl focus:outline-none focus:border-[#4A2C35]/20 focus:ring-4 focus:ring-[#FFB6C1]/20 text-center text-[16px] shadow-[0_8px_24px_-8px_rgba(74,44,53,0.08),0_2px_8px_-2px_rgba(74,44,53,0.04),inset_0_1px_0_0_rgba(255,255,255,1)] transition-all" />
              <p className="text-[10px] text-[#4A2C35]/40 mt-1.5 text-center">If you give 2 dates, I can calculate your real cycle.</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-2 block">How many days does it last?</label>
              <div className="flex gap-2">
                {['3 days', '4 days', '5 days', '6+ days'].map(d => (
                  <button key={d} onClick={() => setPeriodDuration(d)} className={`flex-1 py-3.5 rounded-2xl border text-[13px] font-bold transition-all duration-200 ${periodDuration === d ? 'border-[#4A2C35] bg-white text-[#4A2C35] shadow-[0_8px_20px_-8px_rgba(74,44,53,0.15),0_3px_8px_-2px_rgba(74,44,53,0.08),inset_0_1px_0_0_rgba(255,255,255,1)] scale-[1.02]' : 'border-white bg-white/70 text-[#4A2C35]/50 shadow-[0_4px_12px_-4px_rgba(74,44,53,0.05)] hover:shadow-[0_6px_16px_-6px_rgba(74,44,53,0.08)]'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-2 block">How often does it come?</label>
              <div className="flex flex-col gap-2.5">
                {[
                  { id: 'Monthly', label: 'Monthly', sub: 'Comes almost every month' },
                  { id: 'Often Late', label: 'Often Late', sub: 'Comes, but always late' },
                  { id: 'Very Irregular', label: 'Very Irregular', sub: 'Sometimes skips months' },
                ].map(opt => (
                  <button key={opt.id} onClick={() => setCycleType(opt.id)} className={`w-full py-3.5 rounded-2xl border text-left px-4 transition-all duration-200 flex justify-between items-center ${cycleType === opt.id ? 'border-[#4A2C35] bg-white shadow-[0_8px_20px_-8px_rgba(74,44,53,0.15),0_3px_8px_-2px_rgba(74,44,53,0.08)]' : 'border-white bg-white/70 shadow-[0_4px_12px_-4px_rgba(74,44,53,0.05)] hover:shadow-[0_6px_16px_-6px_rgba(74,44,53,0.08)]'}`}>
                    <div>
                      <span className="font-bold text-[14px] block">{opt.label}</span>
                      <span className="text-[11px] text-[#4A2C35]/50">{opt.sub}</span>
                    </div>
                    {cycleType === opt.id && <span className="w-6 h-6 bg-[#4A2C35] text-white rounded-full flex items-center justify-center text-[10px] shadow-[0_2px_6px_rgba(74,44,53,0.2)]">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full mt-auto">
            <button onClick={() => setStep(1)} className="flex-1 border border-white bg-white/80 py-4 rounded-full font-bold text-[#4A2C35]/60 active:scale-[0.98] transition-transform shadow-[0_8px_20px_-10px_rgba(74,44,53,0.1),0_2px_6px_-2px_rgba(74,44,53,0.05)]">Back</button>
            <button 
              onClick={() => setStep(3)} 
              disabled={!lastPeriodDate || !periodDuration || !cycleType}
              className={`flex-2 py-4 rounded-full font-bold transition-all duration-300 ${lastPeriodDate && periodDuration && cycleType ? 'bg-[#4A2C35] text-white shadow-[0_16px_32px_-8px_rgba(74,44,53,0.35),0_6px_16px_-6px_rgba(74,44,53,0.2)] active:scale-[0.98]' : 'bg-[#4A2C35]/15 text-[#4A2C35]/30 shadow-none'}`}
            >
              Know my pattern →
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: PREDICTION REVEAL */}
      {step === 3 && (() => {
        const prediction = calculatePrediction();
        return (
          <div className="flex flex-col items-center flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4">
            
            <h1 className="text-[26px] font-bold leading-tight mb-2 text-center">
              You are {prediction.cycleText}. That is your normal, not late. 💜
              </h1>

            <div className="w-full bg-white rounded-[20px] p-5 border border-white shadow-[0_24px_48px_-16px_rgba(74,44,53,0.12),0_12px_24px_-12px_rgba(255,182,193,0.2),0_2px_8px_-2px_rgba(74,44,53,0.04),inset_0_1px_0_0_rgba(255,255,255,1)] mb-6 mt-4">
              <p className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-3">Your last pattern</p>
              
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#4A2C35]/5">
                <div>
                  <p className="text-[13px] text-[#4A2C35]/60">Last: {lastPeriodDate ? new Date(lastPeriodDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}</p>
                  {prevPeriodDate && <p className="text-[13px] text-[#4A2C35]/60">Before: {new Date(prevPeriodDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>}
                </div>
                {prevPeriodDate && <p className="text-[13px] font-bold text-[#4A2C35] bg-[#FFF0F3] px-3 py-1 rounded-full">= {prediction.realDiffDays} days</p>}
              </div>

              <p className="text-[16px] font-bold text-[#4A2C35] mb-1">Next: {prediction.nextRange}</p>
              <p className="text-[12px] text-[#4A2C35]/50 mb-1">Keep pad handy from {prediction.nextRange.split(' - ')[0]}</p>
              <p className="text-[11px] text-[#4A2C35]/40 leading-relaxed mt-3 italic">Why a range, not an exact date? Eating late and sleeping after 12am can shift it by 2 days.</p>
            </div>

            <div className="w-full mb-6">
              <p className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-3 text-center">How you stay normal</p>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white p-3.5 rounded-2xl border border-white shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08),0_2px_6px_-2px_rgba(255,182,193,0.15),inset_0_1px_0_0_rgba(255,255,255,1)] flex items-center gap-2.5"><span className="text-sm w-7 h-7 bg-[#FFF0F3] rounded-full flex items-center justify-center">🍲</span><p className="text-[11px] font-semibold leading-tight">Last food before 9pm</p></div>
                <div className="bg-white p-3.5 rounded-2xl border border-white shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08),0_2px_6px_-2px_rgba(255,182,193,0.15),inset_0_1px_0_0_rgba(255,255,255,1)] flex items-center gap-2.5"><span className="text-sm w-7 h-7 bg-[#E8F0E0] rounded-full flex items-center justify-center">👟</span><p className="text-[11px] font-semibold leading-tight">20 mins, no gym</p></div>
                <div className="bg-white p-3.5 rounded-2xl border border-white shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08),0_2px_6px_-2px_rgba(255,182,193,0.15),inset_0_1px_0_0_rgba(255,255,255,1)] flex items-center gap-2.5"><span className="text-sm w-7 h-7 bg-[#FFF0F3] rounded-full flex items-center justify-center">🌙</span><p className="text-[11px] font-semibold leading-tight">In bed by 10:30pm</p></div>
                <div className="bg-white p-3.5 rounded-2xl border border-white shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08),0_2px_6px_-2px_rgba(255,182,193,0.15),inset_0_1px_0_0_rgba(255,255,255,1)] flex items-center gap-2.5"><span className="text-sm w-7 h-7 bg-[#EDE8FF] rounded-full flex items-center justify-center">🧠</span><p className="text-[11px] font-semibold leading-tight">90 secs of quiet</p></div>
              </div>
            </div>

            <p className="text-[#4A2C35]/60 text-[13px] leading-relaxed text-center px-4 mb-2">
              Close them daily. I will track your progress and notice your patterns. No need to be perfect. Close what you can.
            </p>
            <p className="text-[#4A2C35] text-[13px] font-bold text-center mb-8">I am not a doctor, I am your manager.</p>

            <button onClick={handleFinish} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold shadow-[0_16px_32px_-8px_rgba(74,44,53,0.35),0_6px_16px_-6px_rgba(74,44,53,0.2)] hover:shadow-[0_20px_40px_-10px_rgba(74,44,53,0.4)] mt-auto active:scale-[0.98] transition-all duration-300">
              Start my 4 circles →
            </button>
            <p className="text-[9px] text-[#4A2C35]/30 text-center mt-6 px-4 leading-relaxed">
              Late Circle is a lifestyle tracker, not a medical diagnosis. Your data stays on your phone. If you miss your period for over 90 days, please see a doctor.
            </p>
          </div>
        );
      })()}
    </main>
  );
}