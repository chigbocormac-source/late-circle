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
  const [symptoms, setSymptoms] = useState<string[]>([]);

  const toggleSymptom = (s: string) => {
    if (symptoms.includes(s)) {
      setSymptoms(symptoms.filter(x => x !== s));
    } else {
      setSymptoms([...symptoms, s]);
    }
  };

  const calculatePrediction = () => {
    let averageCycle = 35; 
    let cycleText = "35 days girl";
    let realDiffDays = 0;

    if (lastPeriodDate && prevPeriodDate) {
      const [ly, lm, ld] = lastPeriodDate.split('-').map(Number);
      const [py, pm, pd] = prevPeriodDate.split('-').map(Number);
      const last = new Date(Date.UTC(ly, lm - 1, ld));
      const prev = new Date(Date.UTC(py, pm - 1, pd));
      const diffTime = Math.abs(last.getTime() - prev.getTime());
      realDiffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (realDiffDays >= 25 && realDiffDays <= 45) {
        averageCycle = realDiffDays;
        cycleText = `${realDiffDays} days girl`;
      } else {
        cycleText = "35 days girl (using average)";
      }
    }

    const last = lastPeriodDate ? new Date(lastPeriodDate) : new Date();
    const nextStart = new Date(last);
    nextStart.setDate(last.getDate() + averageCycle - 2);
    const nextEnd = new Date(last);
    nextEnd.setDate(last.getDate() + averageCycle + 2);

    const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    return {
      cycleText,
      nextRange: `${formatDate(nextStart)} - ${formatDate(nextEnd)}`,
      averageCycle,
      realDiffDays,
      isIrregular: realDiffDays > 35
    };
  };

  const handleFinish = () => {
    localStorage.setItem('lateCircleOnboarded', 'true');
    localStorage.setItem('lateCircleLastPeriod', lastPeriodDate);
    localStorage.setItem('lateCirclePrevPeriod', prevPeriodDate);
    localStorage.setItem('lateCircleDuration', periodDuration);
    localStorage.setItem('lateCircleType', cycleType);
    localStorage.setItem('lateCircleSymptoms', JSON.stringify(symptoms));
    
    localStorage.setItem('lateCirclePromised7Days', 'true');
    localStorage.setItem('lateCircleCommitDate', new Date().toISOString());

    const history = JSON.parse(localStorage.getItem('lateCircleHistory') || '[]');
    if (prevPeriodDate) history.push(prevPeriodDate);
    if (lastPeriodDate) history.push(lastPeriodDate);
    localStorage.setItem('lateCircleHistory', JSON.stringify(history));

    router.push('/today');
  };

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-12 px-6 font-sans pb-8">
      
      {/* PROGRESS BAR (10 steps) */}
      <div className="w-full max-w-sm flex gap-1.5 mb-8">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#4A2C35] shadow-[0_2px_8px_rgba(74,44,53,0.2)]' : 'bg-[#4A2C35]/10'}`}></div>
        ))}
      </div>

      {/* SCREEN 0: HOOK */}
      {step === 0 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8 mt-8 shadow-[0_20px_40px_-12px_rgba(74,44,53,0.12),0_8px_16px_-8px_rgba(255,182,193,0.3),inset_0_1px_0_0_rgba(255,255,255,1)] border border-white">
            <span className="text-3xl">🌙</span>
          </div>
          <h1 className="text-[28px] font-bold leading-[1.15] mb-4 px-2">
            Your period is late. You are not broken.
          </h1>
          <p className="text-[#4A2C35]/60 text-[15px] leading-relaxed px-2 mb-12">
            Welcome to Late Circle. Whether your period is late right now, or you just want to keep your cycle balanced, you're in the right place.
            <br/><br/>
            Built specifically for the Nigerian woman. No foreign diets, no gym bills. Just your everyday food, normal walks, and real rest. No scary predictions. Just 4 small things a day.
          </p>
          <button onClick={() => setStep(1)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full text-[16px] font-bold mt-auto active:scale-[0.98] shadow-[0_16px_32px_-8px_rgba(74,44,53,0.35),0_6px_16px_-6px_rgba(74,44,53,0.2)] transition-all duration-300">
            Show me how to stay balanced →
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
            I won't give you 10 rules or foreign diets. I manage 4 circles daily: Food, Walk, Sleep, Calm.
            <br/><br/>
            You close them every day. Small wins, every day.
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
          <p className="text-[#4A2C35]/50 text-xs mb-6 text-center">This stays on your phone only. 🔒 So I can learn your real pattern.</p>
          
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
                  <button key={d} onClick={() => setPeriodDuration(d)} className={`flex-1 py-3.5 rounded-2xl border text-[13px] font-bold transition-all duration-200 ${periodDuration === d ? 'border-[#4A2C35] bg-white text-[#4A2C35] shadow-[0_8px_20px_-8px_rgba(74,44,53,0.15),0_3px_8px_-2px_rgba(74,44,53,0.08),inset_0_1px_0_0_rgba(255,255,255,1)] scale-[1.02]' : 'border-white bg-white/70 text-[#4A2C35]/50 shadow-[0_4px_12px_-4px_rgba(74,44,53,0.05)]'}`}>
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
                  <button key={opt.id} onClick={() => setCycleType(opt.id)} className={`w-full py-3.5 rounded-2xl border text-left px-4 transition-all duration-200 flex justify-between items-center ${cycleType === opt.id ? 'border-[#4A2C35] bg-white shadow-[0_8px_20px_-8px_rgba(74,44,53,0.15),0_3px_8px_-2px_rgba(74,44,53,0.08)]' : 'border-white bg-white/70 shadow-[0_4px_12px_-4px_rgba(74,44,53,0.05)]'}`}>
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
            <button onClick={() => setStep(1)} className="flex-1 border border-white bg-white/80 py-4 rounded-full font-bold text-[#4A2C35]/60 active:scale-[0.98] shadow-[0_8px_20px_-10px_rgba(74,44,53,0.1)]">Back</button>
            <button onClick={() => setStep(3)} disabled={!lastPeriodDate || !periodDuration || !cycleType} className={`flex-2 py-4 rounded-full font-bold transition-all ${lastPeriodDate && periodDuration && cycleType ? 'bg-[#4A2C35] text-white shadow-[0_16px_32px_-8px_rgba(74,44,53,0.35)] active:scale-[0.98]' : 'bg-[#4A2C35]/15 text-[#4A2C35]/30'}`}>
              Know my pattern →
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: HONEST REVEAL */}
      {step === 3 && (() => {
        const prediction = calculatePrediction();
        return (
          <div className="flex flex-col items-center flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4">
            <h1 className="text-[26px] font-bold leading-tight mb-2 text-center">
              {prevPeriodDate ? `You are a ${prediction.cycleText}.` : `Your last cycle was ${prediction.averageCycle} days.`} Your body is talking. Let's listen. 💜
            </h1>

            <div className="w-full bg-white rounded-[20px] p-5 border border-white shadow-[0_24px_48px_-16px_rgba(74,44,53,0.12),0_12px_24px_-12px_rgba(255,182,193,0.2)] mb-6 mt-4">
              <p className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-3">Your last pattern</p>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#4A2C35]/5">
                <div>
                  <p className="text-[13px] text-[#4A2C35]/60">Last: {lastPeriodDate ? new Date(lastPeriodDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}</p>
                  {prevPeriodDate && <p className="text-[13px] text-[#4A2C35]/60">Before: {new Date(prevPeriodDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>}
                </div>
                {prevPeriodDate && <p className="text-[13px] font-bold text-[#4A2C35] bg-[#FFF0F3] px-3 py-1 rounded-full">= {prediction.realDiffDays} days</p>}
              </div>
{prediction.realDiffDays > 35 ? (
  <p className="text-[12px] text-[#4A2C35]/60 mb-3">That's longer than the 21-35 day range. Let's track it.</p>
) : (
  <p className="text-[12px] text-[#4A2C35]/60 mb-3">That's within the normal 21-35 day range. Let's keep it steady.</p>
)}
              <p className="text-[16px] font-bold text-[#4A2C35] mb-1">Next window: {prediction.nextRange}</p>
              <p className="text-[12px] text-[#4A2C35]/50 mb-1">
  Keep pad handy from {prediction.nextRange.split(' - ')[0]}. 
  {prediction.realDiffDays > 35 
    ? " Your pattern is irregular, so this is a window, not a promise." 
    : " This is your normal window."}
</p>
            </div>

            <button onClick={() => setStep(4)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold shadow-[0_16px_32px_-8px_rgba(74,44,53,0.35)] mt-auto active:scale-[0.98] transition-all">
              Keep going →
            </button>
          </div>
        );
      })()}

      {/* SCREEN 4: SYMPTOMS */}
      {step === 4 && (
        <div className="flex flex-col flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4">
          <h1 className="text-[24px] font-bold leading-tight mb-2 text-center">What have you noticed lately?</h1>
          <p className="text-[13px] text-[#4A2C35]/60 text-center mb-6 px-4">
            Tick anything you have noticed. We will just track them together. This is not a diagnosis.
          </p>
          
          <div className="flex flex-col gap-2 w-full mb-8">
            {['Period often late or missing', 'Pimples that don\'t go away easily', 'Hair on chin, chest, or stomach', 'Hair on head feeling thinner', 'Cravings for sweet / starchy food', 'Weight gain around belly', 'Dark patches on neck or underarm', 'Feeling tired or stressed often'].map(s => (
              <button key={s} onClick={() => toggleSymptom(s)} className={`p-3.5 rounded-xl text-left border text-[13px] font-medium transition-all ${symptoms.includes(s) ? 'border-[#4A2C35] bg-white text-[#4A2C35] shadow-sm' : 'border-white bg-white/70 text-[#4A2C35]/60'}`}>
                {s}
              </button>
            ))}
            <button onClick={() => setSymptoms([])} className={`p-3.5 rounded-xl text-left border text-[13px] font-medium transition-all ${symptoms.length === 0 ? 'border-[#4A2C35] bg-white text-[#4A2C35] shadow-sm' : 'border-white bg-white/70 text-[#4A2C35]/60'}`}>
              None of these / Prefer not to say
            </button>
          </div>

          <div className="flex gap-3 w-full mt-auto">
            <button onClick={() => setStep(3)} className="flex-1 border border-white bg-white/80 py-4 rounded-full font-bold text-[#4A2C35]/60 active:scale-[0.98]">Back</button>
            <button onClick={() => setStep(5)} className="flex-2 py-4 rounded-full font-bold bg-[#4A2C35] text-white shadow-[0_16px_32px_-8px_rgba(74,44,53,0.35)] active:scale-[0.98]">
              Save and Continue →
            </button>
          </div>
          <p className="text-[10px] text-[#4A2C35]/40 mt-3 text-center">Only you see this. This is not a diagnosis.</p>
        </div>
      )}

      {/* SCREEN 5: 4 CIRCLES */}
      {step === 5 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up">
          <h1 className="text-[26px] font-bold leading-tight mb-2">The 4 Circles</h1>
          <p className="text-[14px] text-[#4A2C35]/60 leading-relaxed mb-8 px-2">
            Hormones respond to daily life. Every day you work on 4 small wins: Food, Calm, Walk, Sleep.
          </p>

          <div className="w-full flex flex-col gap-3 mb-8">
            <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3"><span className="text-2xl w-10 h-10 bg-[#FFF0F3] rounded-full flex items-center justify-center">🍲</span><p className="text-[14px] font-bold">Food</p></div>
            <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3"><span className="text-2xl w-10 h-10 bg-[#9CAF88]/15 rounded-full flex items-center justify-center">🧠</span><p className="text-[14px] font-bold">Calm</p></div>
            <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3"><span className="text-2xl w-10 h-10 bg-[#E8F0E0] rounded-full flex items-center justify-center">👟</span><p className="text-[14px] font-bold">Walk</p></div>
            <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3"><span className="text-2xl w-10 h-10 bg-[#EDE8FF] rounded-full flex items-center justify-center">🌙</span><p className="text-[14px] font-bold">Sleep</p></div>
          </div>

          <div className="bg-[#4A2C35]/5 rounded-2xl p-4 mb-8 w-full">
            <p className="text-[13px] font-bold text-[#4A2C35]">Close 2 = win today. Close 4 = full win.</p>
            <p className="text-[11px] text-[#4A2C35]/60 mt-1">You don't need to be perfect. Small, consistent wins support your cycle.</p>
          </div>

          <button onClick={() => setStep(6)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold shadow-[0_16px_32px_-8px_rgba(74,44,53,0.35)] mt-auto active:scale-[0.98] transition-all">
            I understand →
          </button>
        </div>
      )}

      {/* SCREEN 6: 5 GIRLS */}
      {step === 6 && (
        <div className="flex flex-col flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4">
          <h1 className="text-[26px] font-bold leading-tight mb-2 text-center">5 Girls in 1 Body</h1>
          <p className="text-[13px] text-[#4A2C35]/60 text-center mb-6 px-4">
            Your body is not one mood. You are:
          </p>

          <div className="flex flex-col gap-2 w-full mb-8">
            <div className="bg-white p-3.5 rounded-xl border border-[#4A2C35]/5 flex justify-between items-center">
              <span className="text-[13px] font-bold">🌙 Rest Girl (Days 1-4)</span>
              <span className="text-[11px] text-[#4A2C35]/50">Bleeding, rest</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#4A2C35]/5 flex justify-between items-center">
              <span className="text-[13px] font-bold">🌱 Fresh Girl (Days 5-12)</span>
              <span className="text-[11px] text-[#4A2C35]/50">Light, active</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#4A2C35]/5 flex justify-between items-center">
              <span className="text-[13px] font-bold">✨ Fine Girl (Days 13-23)</span>
              <span className="text-[11px] text-[#4A2C35]/50">Confident, glowing</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#4A2C35]/5 flex justify-between items-center">
              <span className="text-[13px] font-bold">🍚 Chop Girl (Days 24-30)</span>
              <span className="text-[11px] text-[#4A2C35]/50">Hungry, cravings</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#4A2C35]/5 flex justify-between items-center">
              <span className="text-[13px] font-bold">💜 Ready Girl (Days 31-40+)</span>
              <span className="text-[11px] text-[#4A2C35]/50">Waiting, preparing</span>
            </div>
          </div>

          <p className="text-[13px] text-[#4A2C35] font-bold text-center mb-8">
            Know which girl you are, and you will stop fighting yourself.
          </p>

          <button onClick={() => setStep(7)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold shadow-[0_16px_32px_-8px_rgba(74,44,53,0.35)] mt-auto active:scale-[0.98] transition-all">
            I understand →
          </button>
        </div>
      )}

      {/* SCREEN 7: NIGERIAN FOOD + DOCTOR */}
      {step === 7 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up">
          <h1 className="text-[26px] font-bold leading-tight mb-6">Nigerian Food, Real Life</h1>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm mb-6 w-full text-left">
            <p className="text-[14px] font-bold text-[#4A2C35] mb-2">No foreign diet.</p>
            <p className="text-[13px] text-[#4A2C35]/60 leading-relaxed">
              We use what you actually eat. Indomie + egg. Eba. Rice and stew. We know NEPA, stress, school, work, and lack of sleep affect your period.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm mb-8 w-full text-left">
            <p className="text-[14px] font-bold text-[#4A2C35] mb-2">A history for your doctor.</p>
            <p className="text-[13px] text-[#4A2C35]/60 leading-relaxed">
              Late Circle is not a doctor. But it gives you a clear record of your cycle, your symptoms, and your 4 circles. Show it to your doctor, pharmacist, or nurse.
            </p>
          </div>

          <button onClick={() => setStep(8)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold shadow-[0_16px_32px_-8px_rgba(74,44,53,0.35)] mt-auto active:scale-[0.98] transition-all">
            I understand →
          </button>
        </div>
      )}

      {/* SCREEN 8: HONEST TRUTH */}
      {step === 8 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up justify-center">
          <h1 className="text-[26px] font-bold leading-tight mb-4">The Honest Truth</h1>
          
          <p className="text-[14px] text-[#4A2C35]/70 leading-relaxed mb-5 px-2">
            A normal cycle is 21 to 35 days. If yours is often 40, 45, or 50 days, it just means your body is working a little harder. It is not a curse, and it is not your fault.
          </p>
          <p className="text-[14px] text-[#4A2C35]/70 leading-relaxed mb-5 px-2">
            It might be stress, hormones, or PCOS. Whatever it is, you don't have to figure it out alone.
          </p>
          <p className="text-[14px] text-[#4A2C35]/70 leading-relaxed mb-8 px-2">
            Late Circle won't cure PCOS. But it will help you track your pattern, manage your daily habits, and give you a clear record to show a doctor when you are ready.
          </p>
          
          <p className="text-[15px] text-[#4A2C35] font-bold px-2 mb-8">
            You are not broken. Your body is talking. Let's listen together. 💜
          </p>

          <button onClick={() => setStep(9)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold shadow-[0_16px_32px_-8px_rgba(74,44,53,0.35)] mt-auto active:scale-[0.98] transition-all">
            I understand →
          </button>
          <p className="text-[9px] text-[#4A2C35]/30 mt-4 px-2">Lifestyle tracking only. Not a medical diagnosis. If your period is 90+ days late, please see a doctor.</p>
        </div>
      )}

      {/* SCREEN 9: 7-DAY PROMISE (FINAL CTA) */}
      {step === 9 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 mt-4 shadow-sm border border-white">
            <span className="text-2xl">🌙</span>
          </div>
          
          <h1 className="text-[24px] font-bold leading-tight mb-2">Your first 7 days</h1>
          <p className="text-[13px] text-[#4A2C35]/50 mb-6 px-4">
            Late Circle is daily. But the first 7 days teach your body the rhythm.
          </p>

          <div className="bg-white rounded-2xl p-5 w-full text-left mb-6 shadow-[0_8px_30px_rgba(74,44,53,0.06)]">
            <p className="text-[13px] text-[#4A2C35]/70 leading-relaxed mb-4">
              In 7 days of closing 2 circles a day, many girls feel less bloating at night, more energy after food, and easier sleep.
            </p>
            <p className="text-[13px] text-[#4A2C35] font-bold">
              Close 2 = win today. Close 4 = full win.
            </p>
          </div>

          <button onClick={handleFinish} className="w-full bg-[#4A2C35] text-white py-4 rounded-full text-[16px] font-bold shadow-[0_16px_32px_-8px_rgba(74,44,53,0.35)] active:scale-[0.98] transition-all">
            Yes, I will show up for 7 days 💚
          </button>
          <p className="text-[10px] text-[#4A2C35]/40 mt-4 text-center px-4">
            Your promise to yourself. Not to us. Day 1 starts today.
          </p>
        </div>
      )}

    </main>
  );
}