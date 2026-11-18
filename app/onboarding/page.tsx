'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [herName, setHerName] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [prevPeriodDate, setPrevPeriodDate] = useState('');
  const [periodDuration, setPeriodDuration] = useState('');
  const [cycleType, setCycleType] = useState('');

  const [todayStr, setTodayStr] = useState('');

  useEffect(() => {
  setTodayStr(new Date().toISOString().split('T')[0]);
}, []);
  const datesValid = !!lastPeriodDate && lastPeriodDate <= todayStr && (!prevPeriodDate || prevPeriodDate < lastPeriodDate) && !!cycleType;

  const getStory = () => {
    let average = 35;
    let isReal = false;
    let realDiff = 0;

    if (lastPeriodDate && prevPeriodDate) {
      const last = new Date(lastPeriodDate + 'T00:00:00');
      const prev = new Date(prevPeriodDate + 'T00:00:00');
      realDiff = Math.round((last.getTime() - prev.getTime()) / 86400000);
      if (realDiff >= 21 && realDiff <= 60) {
        average = realDiff;
        isReal = true;
      }
    } else if (cycleType === 'Monthly') average = 28;
    else if (cycleType === 'Often Late') average = 38;
    else if (cycleType === 'Very Irregular') average = 45;

    const last = lastPeriodDate ? new Date(lastPeriodDate + 'T00:00:00') : new Date();
    const start = new Date(last);
    start.setDate(last.getDate() + average - 3);
    const end = new Date(last);
    end.setDate(last.getDate() + average + 3);
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    return { average, isReal, realDiff, window: `${fmt(start)} - ${fmt(end)}` };
  };

  const handleFinish = () => {
    localStorage.setItem('lateCircleOnboarded', 'true');
    localStorage.setItem('lateCircleName', herName.trim());
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

  const name = herName.trim();

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-12 px-6 font-sans pb-8">

      <div className="w-full max-w-sm flex gap-1.5 mb-8">
        {[0, 1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#4A2C35]' : 'bg-[#4A2C35]/10'}`} />
        ))}
      </div>

      {/* 1 - WELCOME TO LATE CIRCLE - FIXED */}
      {step === 0 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up">
          <p className="text-[13px] font-bold tracking-[0.2em] uppercase text-[#4A2C35] mb-1">Late Circle</p>
          <p className="text-[13px] text-[#4A2C35]/60 mb-6">A little space to understand your body 💚</p>

          <h1 className="text-[28px] font-bold leading-[1.15] mb-5 px-2">
            Is your period taking longer than expected?
          </h1>

          <div className="w-full mb-5">
            <p className="text-[15px] text-[#4A2C35]/70 leading-relaxed">“Why is my period late?”</p>
            <p className="text-[15px] text-[#4A2C35]/70 leading-relaxed">“When will it come?”</p>
            <p className="text-[15px] text-[#4A2C35]/70 leading-relaxed">“Is everything okay?”</p>
          </div>

          <h2 className="text-[18px] font-bold leading-tight mb-2 px-2">You don&apos;t have to figure it all out alone.</h2>
          <p className="text-[14px] text-[#4A2C35]/60 leading-relaxed px-2 mb-6">
            Late Circle helps you understand your cycle and build small everyday habits that support your wellbeing.
          </p>

          <div className="w-full bg-white rounded-2xl p-4 flex gap-3 items-start text-left mb-5 shadow-sm">
            <div className="w-11 h-11 shrink-0 rounded-full bg-linear-to-tr from-[#FF8FA3] to-[#9CAF88] flex items-center justify-center text-white font-bold text-lg">O</div>
            <div>
              <p className="text-[14px] font-bold mb-1">Meet Ovi</p>
              <p className="text-[13px] text-[#4A2C35]/70 leading-relaxed">I&apos;m Ovi. You can talk to me about your period, your worries and the things you don&apos;t understand. No shouting. No judgement.</p>
            </div>
          </div>

          <div className="w-full text-left mb-2">
            <label className="text-[13px] font-bold text-[#4A2C35] mb-2 block">What should Ovi call you?</label>
            <input
              value={herName}
              onChange={(e) => setHerName(e.target.value)}
              placeholder="Your name"
              maxLength={20}
              className="w-full bg-white p-4 rounded-2xl text-[15px] font-medium placeholder:text-[#4A2C35]/35 focus:outline-none focus:border-[#4A2C35]/20 shadow-sm"
            />
            <p className="text-[11px] text-[#4A2C35]/50 mt-2 text-center">🔒 Your information is handled according to our privacy policy.</p>
          </div>

          <button onClick={() => setStep(1)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full text-[16px] font-bold mt-auto active:scale-[0.98] shadow-lg">
            Yes, That&apos;s Me →
          </button>
          <p className="text-[10px] text-[#4A2C35]/40 text-center mt-4 leading-relaxed px-4">
            Late Circle is a daily wellbeing companion, not a medical diagnosis or treatment.
          </p>
        </div>
      )}

      {/* 2 - LET'S KNOW YOUR PATTERN */}
      {step === 1 && (
        <div className="flex flex-col flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4">
          <h1 className="text-[26px] font-bold leading-tight mb-2 text-center">Let&apos;s know your pattern{name ? `, ${name}` : ''}.</h1>
          <p className="text-[#4A2C35]/50 text-xs mb-6 text-center">This stays on your phone only. 🔒</p>

          <div className="flex flex-col gap-6 w-full mb-8">
            <div>
              <label className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-2 block">When did your last period start?</label>
              <input type="date" max={todayStr} value={lastPeriodDate} onChange={(e) => setLastPeriodDate(e.target.value)} className="w-full bg-white p-4 rounded-2xl text-center text-[16px] shadow-sm focus:outline-none" />
              <p className="text-[10px] text-[#4A2C35]/40 mt-1.5 text-center">Don&apos;t remember exact? Pick closest week.</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-2 block">And the one before that? (Optional)</label>
              <input type="date" max={todayStr} value={prevPeriodDate} onChange={(e) => setPrevPeriodDate(e.target.value)} className="w-full bg-white p-4 rounded-2xl text-center text-[16px] shadow-sm focus:outline-none" />
              {prevPeriodDate && lastPeriodDate && prevPeriodDate >= lastPeriodDate && (
                <p className="text-[11px] text-[#8A2C3E] mt-1.5 text-center font-bold">The one before should be earlier than the last one.</p>
              )}
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

            <div>
              <label className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-2 block">How many days does it last? (Optional)</label>
              <div className="flex gap-2">
                {['3 days', '4 days', '5 days', '6+ days'].map(d => (
                  <button key={d} onClick={() => setPeriodDuration(d)} className={`flex-1 py-3.5 rounded-2xl border text-[13px] font-bold transition-all ${periodDuration === d ? 'border-[#4A2C35] bg-white text-[#4A2C35] shadow-sm' : 'border-white bg-white/70 text-[#4A2C35]/50'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full mt-auto">
            <button onClick={() => setStep(0)} className="flex-1 border border-white bg-white/80 py-4 rounded-full font-bold text-[#4A2C35]/60 active:scale-[0.98]">Back</button>
            <button onClick={() => setStep(2)} disabled={!datesValid} className={`flex-2 py-4 rounded-full font-bold transition-all ${datesValid ? 'bg-[#4A2C35] text-white shadow-lg active:scale-[0.98]' : 'bg-[#4A2C35]/15 text-[#4A2C35]/30'}`}>
              See my story →
            </button>
          </div>
        </div>
      )}

      {/* 3 - YOUR CYCLE STORY */}
      {step === 2 && (() => {
        const s = getStory();
        return (
          <div className="flex flex-col items-center flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4">
            <h1 className="text-[26px] font-bold leading-tight mb-2 text-center">Your cycle story{name ? `, ${name}` : ''}</h1>
            <p className="text-[#4A2C35]/60 text-center mb-6 px-4 text-[13px]">Your body is talking. Let&apos;s listen. 💜</p>

            <div className="w-full bg-white rounded-[20px] p-5 shadow-sm mb-4">
              <p className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-3">What you told me</p>
              <div className="flex justify-between items-center pb-4 border-b border-[#4A2C35]/5 mb-4">
                <div>
                  <p className="text-[13px] text-[#4A2C35]/60">Last: {lastPeriodDate ? new Date(lastPeriodDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}</p>
                  {prevPeriodDate && <p className="text-[13px] text-[#4A2C35]/60">Before: {new Date(prevPeriodDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>}
                  <p className="text-[13px] text-[#4A2C35]/60">Pattern: {cycleType}</p>
                </div>
                {s.isReal && <p className="text-[13px] font-bold bg-[#FFF0F3] px-3 py-1 rounded-full">= {s.realDiff} days</p>}
              </div>

              {s.isReal ? (
                <div>
                  <p className="text-[11px] font-bold text-[#9CAF88] uppercase tracking-widest mb-1">✓ From your real history</p>
                  <p className="text-[15px] font-bold mb-1">Your last gap was {s.realDiff} days.</p>
                  <p className="text-[12px] text-[#4A2C35]/60 leading-relaxed">That is your real number. We will learn more as you log more periods.</p>
                </div>
              ) : (
                <div>
                  <p className="text-[11px] font-bold text-[#8A2C3E] uppercase tracking-widest mb-1">~ Estimate for now</p>
                  <p className="text-[15px] font-bold mb-1">We are starting with ~{s.average} days.</p>
                  <p className="text-[12px] text-[#4A2C35]/60 leading-relaxed">We don&apos;t have your real numbers yet. This is a starting point, not a promise. After 2-3 real cycles, Ovi will learn YOUR pattern.</p>
                </div>
              )}
            </div>

            <div className="w-full bg-[#FFF0F3] rounded-[20px] p-5 mb-4 text-center">
              <p className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-1">Possible next window</p>
              <p className="text-[18px] font-bold mb-1">{s.window}</p>
              <p className="text-[11px] text-[#4A2C35]/60 leading-relaxed">This is a guide, not a promise. Your body may come earlier or later. That is normal.</p>
            </div>

            <div className="bg-white p-4 rounded-xl mb-4 text-[12px] text-[#4A2C35]/70 leading-relaxed text-center w-full">
              A normal cycle is 21 to 35 days. If yours is often 40, 45, or 50 days, it just means your body is working a little harder. It is not a curse, and it is not your fault.
            </div>

            <button onClick={() => setStep(3)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold shadow-lg mt-auto active:scale-[0.98]">
              Meet Ovi →
            </button>
          </div>
        );
      })()}

      {/* 4 - MEET OVI */}
      {step === 3 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up justify-center">
          <div className="w-16 h-16 rounded-full bg-linear-to-tr from-[#FF8FA3] to-[#9CAF88] animate-orb-breathe mb-6 flex items-center justify-center text-white text-2xl font-bold">O</div>
          <h1 className="text-[26px] font-bold leading-tight mb-4">Meet Ovi{name ? `, ${name}` : ''}</h1>
          <p className="text-[14px] text-[#4A2C35]/70 leading-relaxed mb-4 px-2">
            Ovi is here to help you understand your body — in simple words, not big medical words.
          </p>
          <div className="w-full flex flex-col gap-3 mb-6 text-left">
            <div className="bg-white p-4 rounded-2xl shadow-sm"><p className="text-[14px] font-bold mb-1">💬 Ask her anything</p><p className="text-[12px] text-[#4A2C35]/60">“Why is my stomach paining me?” “Am I pregnant?” “Is discharge normal?” She will answer gently.</p></div>
            <div className="bg-white p-4 rounded-2xl shadow-sm"><p className="text-[14px] font-bold mb-1">🌙 She checks in on you</p><p className="text-[12px] text-[#4A2C35]/60">One small check a day. Not to judge you. To hold you.</p></div>
            <div className="bg-white p-4 rounded-2xl shadow-sm"><p className="text-[14px] font-bold mb-1">🩺 If you ever need a doctor</p><p className="text-[12px] text-[#4A2C35]/60">She will make your Doctor Report, tell you what to say, and translate what he says after. You will never walk in alone.</p></div>
          </div>
          <p className="text-[11px] text-[#4A2C35]/50 leading-relaxed mb-6 px-2">Ovi is not a doctor. She does not diagnose you. She helps you understand, and helps you talk to a doctor when you are ready.</p>
          <button onClick={() => setStep(4)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold shadow-lg mt-auto active:scale-[0.98]">
            How does it work? →
          </button>
        </div>
      )}

      {/* 5 - HOW LATE CIRCLE WORKS */}
      {step === 4 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4">
          <h1 className="text-[26px] font-bold leading-tight mb-2">How Late Circle works</h1>
          <p className="text-[13px] text-[#4A2C35]/60 mb-6 px-4">Small care, every day. Not perfect. Just gentle.</p>

          <div className="w-full flex flex-col gap-3 mb-6 text-left">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-1"><span className="text-xl">🍲</span><p className="text-[14px] font-bold">Food</p></div>
              <p className="text-[12px] text-[#4A2C35]/60 pl-8">One balanced plate. Carbs + protein + veggies. Last meal before 9pm.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-1"><span className="text-xl">👟</span><p className="text-[14px] font-bold">Walk</p></div>
              <p className="text-[12px] text-[#4A2C35]/60 pl-8">Don&apos;t sit all day. 20 minutes total. Slow still counts.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-1"><span className="text-xl">🌙</span><p className="text-[14px] font-bold">Sleep</p></div>
              <p className="text-[12px] text-[#4A2C35]/60 pl-8">Sleep is when your body makes period hormones. Same time every night. Phone away 30 mins before.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-1"><span className="text-xl">🧠</span><p className="text-[14px] font-bold">Calm</p></div>
              <p className="text-[12px] text-[#4A2C35]/60 pl-8">Stress makes your body hold on. Write it or breathe it. 90 seconds is enough.</p>
            </div>
          </div>

          <div className="bg-[#4A2C35]/5 rounded-2xl p-4 mb-4 w-full text-center">
            <p className="text-[13px] font-bold text-[#4A2C35]">You don&apos;t need 4 to win. Close 2 to win today.</p>
            <p className="text-[11px] text-[#4A2C35]/60 mt-1">Your body learns from what you do every day, not what you do once.</p>
          </div>

          <div className="w-full text-center mb-6">
            <p className="text-[11px] text-[#4A2C35]/50 leading-relaxed">These are gentle habits to care for your body. They do not promise your period will return on a certain day — they help you take care of yourself while you wait.</p>
          </div>

          <button onClick={() => setStep(5)} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold shadow-lg mt-auto active:scale-[0.98]">
            I understand →
          </button>
        </div>
      )}

      {/* 6 - YOUR FIRST DAY */}
      {step === 5 && (
        <div className="flex flex-col items-center text-center flex-1 w-full max-w-sm animate-slide-up overflow-y-auto pb-4 justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-white">
            <span className="text-2xl">🌙</span>
          </div>
          <h1 className="text-[24px] font-bold leading-tight mb-2">Your first day{name ? `, ${name}` : ''}</h1>
          <p className="text-[13px] text-[#4A2C35]/60 mb-8 px-4 leading-relaxed">
            You will miss a day. Everyone misses a day.<br />
            Ovi will not shout at you.<br />
            Yesterday is gone. Today is new.
          </p>

          <div className="bg-white rounded-2xl p-5 w-full text-left mb-4 shadow-sm">
            <p className="text-[14px] font-bold mb-2">Start small today.</p>
            <p className="text-[13px] text-[#4A2C35]/70 leading-relaxed">Pick one little thing for today, girl. That's enough. Come back tomorrow. We'll take it one day at a time. 💚</p>
          </div>

          <div className="bg-[#D1DCC6] rounded-2xl p-4 w-full text-left mb-8">
            <p className="text-[13px] font-bold mb-1">You never need to make up for yesterday.</p>
            <p className="text-[12px] text-[#4A2C35]/70 leading-relaxed">Return whenever you want. Ovi will be here. No guilt. No catching up.</p>
          </div>

          <button onClick={handleFinish} className="w-full bg-[#4A2C35] text-white py-4 rounded-full text-[16px] font-bold shadow-lg active:scale-[0.98]">
            Start My Day 1
          </button>
        </div>
      )}

    </main>
  );
}