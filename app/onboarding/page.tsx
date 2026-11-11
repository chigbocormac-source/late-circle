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
    let realDiffDays = 0;
    let estimated = true;

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
        estimated = false;
      } else {
        cycleText = "35 days girl (using average)";
      }
    } else if (cycleType === 'Monthly') {
      averageCycle = 28;
      cycleText = "28 days girl (estimate)";
    } else if (cycleType === 'Often Late') {
      averageCycle = 38;
      cycleText = "38 days girl (estimate)";
    } else if (cycleType === 'Very Irregular') {
      averageCycle = 45;
      cycleText = "45 days girl (estimate)";
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
      isIrregular: realDiffDays > 35,
      estimated,
    };
  };

  const handleFinish = () => {
    localStorage.setItem('lateCircleOnboarded', 'true');
    localStorage.setItem('lateCircleLastPeriod', lastPeriodDate);
    localStorage.setItem('lateCirclePrevPeriod', prevPeriodDate);
    localStorage.setItem('lateCircleDuration', periodDuration);
    localStorage.setItem('lateCircleType', cycleType);
    
    localStorage.setItem('lateCirclePromised7Days', 'true');
    localStorage.setItem('lateCircleCommitDate', new Date().toISOString());

    const freshHistory: string[] = [];
    if (prevPeriodDate) freshHistory.push(prevPeriodDate);
    if (lastPeriodDate) freshHistory.push(lastPeriodDate);
    localStorage.setItem('lateCircleHistory', JSON.stringify(freshHistory));

    localStorage.removeItem('lateCircleData');
    localStorage.removeItem('lateCircleDailyHistory');
    localStorage.removeItem('lateCircleLastPhase');
    localStorage.removeItem('lateCircleLastFoodLog');
    localStorage.removeItem('lateCircleSoftPlaceOpenedDate');
    localStorage.removeItem('lateCircleSoftPlaceReason');
    localStorage.removeItem('lateCircleFutureLine');

    router.push('/today');
  };

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-12 px-6 font-sans pb-8">
      
      {/* PROGRESS BAR (7 steps) */}
      <div className="w-full max-w-sm flex gap-1.5 mb-8">
        {[0, 1, 2, 3, 4, 5, 6].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#4A2C35] shadow-[0_2px_8px_rgba(74,44,53,0.2)]' : 'bg-[#4A2C35]/10'}`}></div>
        ))}
      </div>

      {/* SCREEN 0: HER FEAR */}
      {step === 0 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8 mt-8 shadow-[0_20px_40px_-12px_rgba(74,44,53,0.12)] border border-white">
            <span className="text-3xl">🌙</span>
          </div>
          <h1 className="text-[28px] font-bold leading-[1.15] mb-4 px-2">
            Ovi Knows What You Are Thinking
          </h1>
          <p className="text-[#4A2C35]/70 text-[15px] leading-relaxed px-2 mb-10">
            "Am I pregnant?"<br/>
            "Am I broken?"<br/>
            "Why is mine late and everyone else is seeing theirs?"<br/><br/>
            You are not broken. You are not alone.<br/>
            Your period is late because your body is stressed.<br/>
            Not because you did something bad.
          </p>
          <button onClick={() => setStep(1)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full text-[16px] font-bold mt-auto active:scale-[0.98] shadow-lg">
            Yes, That Is Me →
          </button>
          <p className="text-[10px] text-[#4A2C35]/40 text-center mt-6 tracking-wide max-w-75 leading-relaxed">
            Not a medical diagnosis. Lifestyle tracking only.
          </p>
        </div>
      )}

      {/* SCREEN 1: DATES */}
      {step === 1 && (
        <div className="flex flex-col flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4">
          <h1 className="text-[26px] font-bold leading-tight mb-2 text-center">Let's know your pattern.</h1>
          <p className="text-[#4A2C35]/50 text-xs mb-6 text-center">This stays on your phone only. 🔒</p>
          
          <div className="flex flex-col gap-6 w-full mb-8">
            <div>
              <label className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-2 block">When did your last period start?</label>
              <input type="date" value={lastPeriodDate} onChange={(e) => setLastPeriodDate(e.target.value)} className="w-full bg-white border border-transparent text-[#4A2C35] p-4 rounded-2xl focus:outline-none focus:border-[#4A2C35]/20 text-center text-[16px] shadow-sm" />
              <p className="text-[10px] text-[#4A2C35]/40 mt-1.5 text-center">Don't remember exact? Pick closest week.</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-2 block">And the one before that? (Optional)</label>
              <input type="date" value={prevPeriodDate} onChange={(e) => setPrevPeriodDate(e.target.value)} className="w-full bg-white border border-transparent text-[#4A2C35] p-4 rounded-2xl focus:outline-none focus:border-[#4A2C35]/20 text-center text-[16px] shadow-sm" />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-2 block">How many days does it last?</label>
              <div className="flex gap-2">
                {['3 days', '4 days', '5 days', '6+ days'].map(d => (
                  <button key={d} onClick={() => setPeriodDuration(d)} className={`flex-1 py-3.5 rounded-2xl border text-[13px] font-bold transition-all ${periodDuration === d ? 'border-[#4A2C35] bg-white text-[#4A2C35] scale-[1.02] shadow-sm' : 'border-white bg-white/70 text-[#4A2C35]/50'}`}>
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
                  <button key={opt.id} onClick={() => setCycleType(opt.id)} className={`w-full py-3.5 rounded-2xl border text-left px-4 transition-all flex justify-between items-center ${cycleType === opt.id ? 'border-[#4A2C35] bg-white shadow-sm' : 'border-white bg-white/70'}`}>
                    <div>
                      <span className="font-bold text-[14px] block">{opt.label}</span>
                      <span className="text-[11px] text-[#4A2C35]/50">{opt.sub}</span>
                    </div>
                    {cycleType === opt.id && <span className="w-6 h-6 bg-[#4A2C35] text-white rounded-full flex items-center justify-center text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full mt-auto">
            <button onClick={() => setStep(0)} className="flex-1 border border-white bg-white/80 py-4 rounded-full font-bold text-[#4A2C35]/60 active:scale-[0.98]">Back</button>
            <button onClick={() => setStep(2)} disabled={!lastPeriodDate || !periodDuration || !cycleType} className={`flex-2 py-4 rounded-full font-bold transition-all ${lastPeriodDate && periodDuration && cycleType ? 'bg-[#4A2C35] text-white shadow-lg active:scale-[0.98]' : 'bg-[#4A2C35]/15 text-[#4A2C35]/30'}`}>
              Know my pattern →
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: PREDICTION */}
      {step === 2 && (() => {
        const prediction = calculatePrediction();
        return (
          <div className="flex flex-col items-center flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4">
            <h1 className="text-[26px] font-bold leading-tight mb-2 text-center">
              {prevPeriodDate 
                ? `You are a ${prediction.cycleText}.`
                : `Let's learn your pattern together.`}
            </h1>
            <p className="text-[#4A2C35]/60 text-center mb-6 px-4">Your body is talking. Let's listen. 💜</p>

            <div className="w-full bg-white rounded-[20px] p-5 border border-white shadow-sm mb-6 mt-4">
              <p className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-3">Your last pattern</p>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#4A2C35]/5">
                <div>
                  <p className="text-[13px] text-[#4A2C35]/60">Last: {lastPeriodDate ? new Date(lastPeriodDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}</p>
                  {prevPeriodDate && <p className="text-[13px] text-[#4A2C35]/60">Before: {new Date(prevPeriodDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>}
                </div>
                {prevPeriodDate && <p className="text-[13px] font-bold text-[#4A2C35] bg-[#FFF0F3] px-3 py-1 rounded-full">= {prediction.realDiffDays} days</p>}
              </div>
              
              <p className="text-[12px] text-[#4A2C35]/60 mb-3">
                {prediction.realDiffDays > 35 
                  ? "That's longer than the 21-35 day range. Let's track it." 
                  : prediction.estimated 
                  ? "We don't have your real numbers yet. This is a starting point." 
                  : "That's within the normal range. Let's keep it steady."}
              </p>
              
              <p className="text-[16px] font-bold text-[#4A2C35] mb-1">Next window: {prediction.nextRange}</p>
              <p className="text-[12px] text-[#4A2C35]/50 mb-1">Keep pad handy from {prediction.nextRange.split(' - ')[0]}.</p>
            </div>

            {/* HONEST TRUTH MERGED HERE */}
            <div className="bg-[#FFF0F3] p-4 rounded-xl mb-4 text-[12px] text-[#4A2C35]/70 leading-relaxed text-center">
              A normal cycle is 21 to 35 days. If yours is often 40, 45, or 50 days, it just means your body is working a little harder. It is not a curse, and it is not your fault.
            </div>

            <button onClick={() => setStep(3)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold shadow-lg mt-auto active:scale-[0.98]">
              Keep going →
            </button>
          </div>
        );
      })()}

      {/* SCREEN 3: WHY DAILY? */}
      {step === 3 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up justify-center">
          <h1 className="text-[26px] font-bold leading-tight mb-4">Why 4 Circles? Why Every Day?</h1>
          
          <p className="text-[14px] text-[#4A2C35]/70 leading-relaxed mb-4 px-2">
            Your period is late because your body is stressed.<br/>
            Not because you are broken.<br/>
            Your body thinks it is not safe to let go.
          </p>
          <p className="text-[14px] text-[#4A2C35] font-bold leading-relaxed mb-6 px-2">
            The 4 circles tell your body: It is safe now.
          </p>
          <p className="text-[14px] text-[#4A2C35]/70 leading-relaxed mb-6 px-2">
            But your body does not believe it after 1 day.<br/>
            It needs to hear it <span className="font-bold text-[#4A2C35]">every day</span>.<br/>
            Your hormones need many days of the same safe message to start working again.
          </p>
          
          <button onClick={() => setStep(4)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold shadow-lg mt-auto active:scale-[0.98]">
            How do I tell it I am safe?
          </button>
        </div>
      )}

      {/* SCREEN 4: THE 4 CIRCLES */}
      {step === 4 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4">
          <h1 className="text-[26px] font-bold leading-tight mb-6">The 4 Circles</h1>
          
          <div className="w-full flex flex-col gap-3 mb-6 text-left">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-1"><span className="text-xl">🍲</span><p className="text-[14px] font-bold">Food</p></div>
              <p className="text-[12px] text-[#4A2C35]/60 pl-8">One balanced plate tells your body it is safe. Carbs + protein + veggies. Last meal before 9pm.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-1"><span className="text-xl">👟</span><p className="text-[14px] font-bold">Walk</p></div>
              <p className="text-[12px] text-[#4A2C35]/60 pl-8">Don't sit all day. Move to move blood. 20 minutes total. Slow still counts.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-1"><span className="text-xl">🌙</span><p className="text-[14px] font-bold">Sleep</p></div>
              <p className="text-[12px] text-[#4A2C35]/60 pl-8">Sleep is when your body makes period hormones. Same time every night. Dark room. Phone away 30 mins before.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-1"><span className="text-xl">🧠</span><p className="text-[14px] font-bold">Calm</p></div>
              <p className="text-[12px] text-[#4A2C35]/60 pl-8">Stress blocks your period. Stop overthinking. Write it or breathe it. 90 seconds is enough to lower stress.</p>
            </div>
          </div>

          <div className="bg-[#4A2C35]/5 rounded-2xl p-4 mb-4 w-full text-center">
            <p className="text-[13px] font-bold text-[#4A2C35]">You don't need 4 circles to be perfect. Close 2 to win today.</p>
            <p className="text-[11px] text-[#4A2C35]/60 mt-1">But close 2 every day. Your body learns from what you do every day, not what you do once.</p>
          </div>
          
          <div className="w-full text-center mb-6">
             <p className="text-[11px] text-[#4A2C35]/50 leading-relaxed">Late Circle is not a doctor. But it gives you a clear record to show your doctor when you are ready.</p>
          </div>

          <button onClick={() => setStep(5)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold shadow-lg mt-auto active:scale-[0.98]">
            I understand →
          </button>
        </div>
      )}

      {/* SCREEN 5: 5 GIRLS */}
      {step === 5 && (
        <div className="flex flex-col flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4">
          <h1 className="text-[26px] font-bold leading-tight mb-2 text-center">5 Girls in 1 Body</h1>
          <p className="text-[13px] text-[#4A2C35]/60 text-center mb-6 px-4">
            Your body is not one mood. They run on percentages, so every cycle length is seen correctly.
          </p>

          <div className="flex flex-col gap-2 w-full mb-8">
            <div className="bg-white p-3.5 rounded-xl border border-[#4A2C35]/5 flex justify-between items-center">
              <span className="text-[13px] font-bold">🌙 Rest Girl</span>
              <span className="text-[11px] text-[#4A2C35]/50">First 15% • bleeding, rest</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#4A2C35]/5 flex justify-between items-center">
              <span className="text-[13px] font-bold">🌱 Fresh Girl</span>
              <span className="text-[11px] text-[#4A2C35]/50">15% – 35% • light, active</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#4A2C35]/5 flex justify-between items-center">
              <span className="text-[13px] font-bold">✨ Fine Girl</span>
              <span className="text-[11px] text-[#4A2C35]/50">35% – 60% • confident, glowing</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#4A2C35]/5 flex justify-between items-center">
              <span className="text-[13px] font-bold">🍚 Chop Girl</span>
              <span className="text-[11px] text-[#4A2C35]/50">60% – 80% • hungry, cravings</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#4A2C35]/5 flex justify-between items-center">
              <span className="text-[13px] font-bold">💜 Ready Girl</span>
              <span className="text-[11px] text-[#4A2C35]/50">Last 20% • waiting, preparing</span>
            </div>
          </div>

          <button onClick={() => setStep(6)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold shadow-lg mt-auto active:scale-[0.98]">
            I understand →
          </button>
        </div>
      )}

      {/* SCREEN 6: THE PROMISE (FINAL) */}
      {step === 6 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4 justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-white">
            <span className="text-2xl">🌙</span>
          </div>
          
          <h1 className="text-[24px] font-bold leading-tight mb-2">Your first 7 days</h1>
          <p className="text-[13px] text-[#4A2C35]/60 mb-8 px-4 leading-relaxed">
            You will miss a day. Everyone misses a day.<br/>
            Ovi will not shout at you.<br/>
            Yesterday is gone. Today is new.
          </p>

          <div className="bg-white rounded-2xl p-5 w-full text-left mb-8 shadow-sm">
            <p className="text-[14px] text-[#4A2C35] font-bold mb-2">
              Start Day 1 today.
            </p>
            <p className="text-[13px] text-[#4A2C35]/70 leading-relaxed">
              Close 2 today. Just 2. That still tells your body you are trying. Come back tomorrow. That is what matters.
            </p>
          </div>

          <button onClick={handleFinish} className="w-full bg-[#4A2C35] text-white py-4 rounded-full text-[16px] font-bold shadow-lg active:scale-[0.98]">
            Start My Day 1
          </button>
        </div>
      )}

    </main>
  );
}