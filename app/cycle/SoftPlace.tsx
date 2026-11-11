'use client';

import { useState, useEffect } from 'react';
import { SoftPlaceData, formatLongDate } from '../../utils/softPlace';

interface Props {
  data: SoftPlaceData;
  onClose: () => void;
}

export default function SoftPlace({ data, onClose }: Props) {
  const [reasonInput, setReasonInput] = useState('');
  const [reasonSaved, setReasonSaved] = useState<string | null>(data.reason);
  const [futureLineInput, setFutureLineInput] = useState('');
  const [futureLineSaved, setFutureLineSaved] = useState<string | null>(data.futureLine);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  useEffect(() => {
    // Load existing reason if saved
    const existingReason = localStorage.getItem('lateCircleSoftPlaceReason');
    if (existingReason) setReasonSaved(existingReason);
    const existingFuture = localStorage.getItem('lateCircleFutureLine');
    if (existingFuture) setFutureLineSaved(existingFuture);
  }, []);

  const handleSaveReason = () => {
    if (!reasonInput.trim()) return;
    localStorage.setItem('lateCircleSoftPlaceReason', reasonInput.trim());
    setReasonSaved(reasonInput.trim());
    setReasonInput('');
  };

  const handleSaveFutureLine = () => {
    if (!futureLineInput.trim()) return;
    localStorage.setItem('lateCircleFutureLine', futureLineInput.trim());
    setFutureLineSaved(futureLineInput.trim());
    setFutureLineInput('');
  };

  const handleCloseAttempt = () => {
    setShowCloseConfirm(true);
  };

  return (
    <div className="fixed inset-0 bg-[#FFF0F3] z-100 flex flex-col overflow-y-auto">
      <div className="max-w-sm mx-auto w-full px-6 pt-10 pb-32">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-1">Your Soft Place with Ovi</p>
            <h1 className="text-2xl font-serif text-[#4A2C35] leading-tight">Welcome home, fine girl.</h1>
          </div>
          <button
            onClick={handleCloseAttempt}
            className="w-8 h-8 rounded-full bg-white border border-[#4A2C35]/10 flex items-center justify-center text-[#4A2C35]/60 font-bold active:scale-95 shrink-0"
          >
            ✕
          </button>
        </div>
        <p className="text-[13px] text-[#4A2C35]/60 leading-relaxed mb-10">
          This Soft Place is only yours. No one else will see it. Lock your phone if you want. Breathe.
        </p>

        {/* ============================== */}
        {/* PAGE 1: YOUR STORY */}
        {/* ============================== */}
        <section className="mb-12">
          <h2 className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-4">Page 1 — Your Story</h2>

          <div className="bg-white rounded-3xl p-6 border border-[#4A2C35]/5 shadow-[0_16px_32px_-12px_rgba(74,44,53,0.08)] mb-6">
            <p className="text-sm font-bold text-[#4A2C35] mb-3">My girl, this is what I saw this month.</p>
            <p className="text-[13px] text-[#4A2C35]/80 leading-relaxed mb-2">
              You were supposed to see your period on {formatLongDate(data.lastPeriodDate)}.
            </p>
            <p className="text-[13px] text-[#4A2C35]/80 leading-relaxed mb-4">
              Today is {formatLongDate(data.today)}. That is <span className="font-bold text-[#4A2C35]">{data.daysLate} {data.daysLate === 1 ? 'day' : 'days'}</span> late.
            </p>
            {data.lastMonthDaysLate !== null && data.lastMonthCameOnDay !== null && data.lastMonthDaysLate > 0 && (
              <p className="text-[13px] text-[#4A2C35]/70 leading-relaxed mb-4 italic">
                Last month you were {data.lastMonthDaysLate} days late, and it came on day {data.lastMonthCameOnDay}. You survived that month. You will survive this one too.
              </p>
            )}
          </div>

          {/* REASON INPUT / DISPLAY */}
          <div className="bg-white rounded-3xl p-6 border border-[#9CAF88]/20 shadow-[0_16px_32px_-12px_rgba(74,44,53,0.08)] mb-6">
            {reasonSaved ? (
              <>
                <p className="text-[11px] font-bold text-[#9CAF88] uppercase tracking-widest mb-2">You told me</p>
                <p className="text-[13px] text-[#4A2C35] leading-relaxed mb-3 italic">"{reasonSaved}"</p>
                <p className="text-[13px] text-[#4A2C35]/70 leading-relaxed">I heard you. I did not forget.</p>
              </>
            ) : (
              <>
                <p className="text-[13px] text-[#4A2C35] leading-relaxed mb-3">
                  If you want to tell me what you are scared of, I will keep it here for you. Only you will see it.
                </p>
                <textarea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="I am scared that..."
                  className="w-full bg-[#FFF0F3] border border-[#4A2C35]/10 text-[#4A2C35] p-3 rounded-xl mb-3 text-[13px] focus:outline-none focus:border-[#9CAF88] resize-none"
                  rows={2}
                />
                <button
                  onClick={handleSaveReason}
                  disabled={!reasonInput.trim()}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                    reasonInput.trim()
                      ? 'bg-[#9CAF88] text-white active:scale-[0.98]'
                      : 'bg-[#9CAF88]/30 text-white/60'
                  }`}
                >
                  Save what I said
                </button>
              </>
            )}
          </div>

          {/* YOU ARE NOT... */}
          <div className="bg-[#FFF0F3] border border-[#4A2C35]/5 rounded-3xl p-6 mb-6">
            <p className="text-[13px] text-[#4A2C35] leading-relaxed mb-2">You are not careless. You are not dirty. You are not a bad girl.</p>
            <p className="text-[13px] text-[#4A2C35] leading-relaxed font-bold">You are a girl who is waiting, and waiting is hard.</p>
          </div>

          {/* TONIGHT CHECKLIST */}
          <div className="bg-white rounded-3xl p-6 border border-[#4A2C35]/5 shadow-[0_16px_32px_-12px_rgba(74,44,53,0.08)] mb-6">
            <p className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-3">Tonight, do only this, no more</p>
            <ol className="text-[13px] text-[#4A2C35]/80 leading-relaxed space-y-2 list-none">
              <li>1. Drink one full bottle of water, slowly.</li>
              <li>2. Eat something warm — rice, soup, anything. Don't stay empty.</li>
              <li>3. Put your phone down by 10pm. I will stay with you.</li>
            </ol>
          </div>

          {/* MEDICAL DISCLAIMER */}
          <div className="bg-[#FFB3C1]/15 border border-[#FFB3C1]/30 rounded-2xl p-4">
            <p className="text-[11px] text-[#8A2C3E] leading-relaxed">
              If you have severe pain, heavy bleeding that soaks more than 2 pads in 1 hour, fever, or fainting, please go to a hospital or talk to a doctor or nurse quickly. Don't wait alone. Your safety is more important than anything here.
            </p>
            <p className="text-[10px] text-[#8A2C3E]/70 leading-relaxed mt-2">
              This Soft Place is for comfort and tracking, not for medical diagnosis.
            </p>
          </div>
        </section>

        {/* ============================== */}
        {/* PAGE 2: YOUR STARS */}
        {/* ============================== */}
        <section className="mb-12">
          <h2 className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-4">Page 2 — Your {data.totalSuccesses} Stars</h2>

          <div className="bg-linear-to-br from-[#2A1F23] to-[#4A2C35] rounded-3xl p-6 text-white shadow-[0_16px_32px_-12px_rgba(74,44,53,0.3)] mb-4">
            <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2">Look how hard you tried, fine girl.</p>
            <p className="text-lg font-bold mb-4 text-white">Your {data.totalSuccesses} Stars This Month</p>
            <p className="text-[13px] text-white/80 leading-relaxed mb-6">
              You did not do nothing. You tried {data.totalSuccesses} {data.totalSuccesses === 1 ? 'time' : 'times'}. Let me show you.
            </p>

            {/* FOOD */}
            {data.foodSuccesses > 0 && (
              <div className="mb-5 border-b border-white/10 pb-5">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-lg">🧡</span>
                  <span className="text-sm font-bold text-white">Food — {data.foodSuccesses} {data.foodSuccesses === 1 ? 'star' : 'stars'}</span>
                </div>
                <p className="text-[12px] text-white/70 leading-relaxed">
                  You ate on {data.foodDates.join(', ')}. You remembered to eat even when you were scared. That is strength.
                </p>
              </div>
            )}

            {/* WALK */}
            {data.walkSuccesses > 0 && (
              <div className="mb-5 border-b border-white/10 pb-5">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-lg">💚</span>
                  <span className="text-sm font-bold text-white">Walk — {data.walkSuccesses} {data.walkSuccesses === 1 ? 'star' : 'stars'}</span>
                </div>
                <p className="text-[12px] text-white/70 leading-relaxed">
                  You walked on {data.walkDates.join(', ')}, even if it was small walk around compound. Your body moved, your mind rested small.
                </p>
              </div>
            )}

            {/* SLEEP */}
            {data.sleepSuccesses > 0 && (
              <div className="mb-5 border-b border-white/10 pb-5">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-lg">💜</span>
                  <span className="text-sm font-bold text-white">Sleep — {data.sleepSuccesses} {data.sleepSuccesses === 1 ? 'star' : 'stars'}</span>
                </div>
                <p className="text-[12px] text-white/70 leading-relaxed">
                  You slept on {data.sleepDates.join(', ')}. Even when worry woke you, you tried again.
                </p>
              </div>
            )}

            {/* CALM */}
            {data.calmSuccesses > 0 && (
              <div className="mb-5">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-lg">💙</span>
                  <span className="text-sm font-bold text-white">Calm — {data.calmSuccesses} {data.calmSuccesses === 1 ? 'star' : 'stars'}</span>
                </div>
                <p className="text-[12px] text-white/70 leading-relaxed">
                  You did breathing, prayer, and you talked to Ovi on {data.calmDates.join(', ')}. You chose calm instead of panic. I am proud of you.
                </p>
              </div>
            )}

            <p className="text-[13px] text-white leading-relaxed mt-6 pt-4 border-t border-white/10">
              Total: <span className="font-bold">{data.totalSuccesses} stars</span>. You are not lazy. You are a girl who kept going while scared. Put your stars on your chest. You earned them.
            </p>
          </div>
        </section>

        {/* ============================== */}
        {/* PAGE 3: FUTURE LINE */}
        {/* ============================== */}
        <section className="mb-12">
          <h2 className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-4">Page 3 — For Future You</h2>

          <div className="bg-white rounded-3xl p-6 border border-[#9CAF88]/20 shadow-[0_16px_32px_-12px_rgba(74,44,53,0.08)]">
            {futureLineSaved ? (
              <>
                <p className="text-[11px] font-bold text-[#9CAF88] uppercase tracking-widest mb-2">You told me</p>
                <p className="text-[13px] text-[#4A2C35] leading-relaxed italic mb-3">"{futureLineSaved}"</p>
                <p className="text-[13px] text-[#4A2C35]/70 leading-relaxed">
                  Saved. Next month, I will bring this line back to you. You will not start from zero again.
                </p>
              </>
            ) : (
              <>
                <p className="text-[13px] text-[#4A2C35] leading-relaxed mb-3 font-bold">
                  Fine girl, if next month you are waiting again, what do you want to tell yourself?
                </p>
                <p className="text-[12px] text-[#4A2C35]/60 leading-relaxed mb-3">Write one line. I will keep it for you.</p>
                <textarea
                  value={futureLineInput}
                  onChange={(e) => setFutureLineInput(e.target.value)}
                  placeholder="Write to future you..."
                  className="w-full bg-[#FFF0F3] border border-[#4A2C35]/10 text-[#4A2C35] p-3 rounded-xl mb-3 text-[13px] focus:outline-none focus:border-[#9CAF88] resize-none"
                  rows={2}
                />
                <button
                  onClick={handleSaveFutureLine}
                  disabled={!futureLineInput.trim()}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                    futureLineInput.trim()
                      ? 'bg-[#9CAF88] text-white active:scale-[0.98]'
                      : 'bg-[#9CAF88]/30 text-white/60'
                  }`}
                >
                  Save My Line In My Soft Place
                </button>
              </>
            )}
          </div>
        </section>

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="w-full bg-[#4A2C35] text-white py-4 rounded-full text-[15px] font-bold active:scale-[0.98] shadow-[0_16px_32px_-8px_rgba(74,44,53,0.35)]"
        >
          Close, fine girl. I will be here.
        </button>

      </div>

      {/* ============================== */}
      {/* CLOSE CONFIRMATION (V1.3 — softer, no ₦500) */}
      {/* V1.4 will restore the ₦500 button and "Yes, Open My Soft Place - N500" */}
      {/* ============================== */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-[#4A2C35]/30 backdrop-blur-sm z-110 flex items-center justify-center p-6 animate-fade-in" onClick={() => setShowCloseConfirm(false)}>
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-[#FFF0F3] flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💜</span>
            </div>
            <p className="text-base font-bold text-[#4A2C35] mb-2">Are you sure, fine girl?</p>
            <p className="text-[13px] text-[#4A2C35]/70 leading-relaxed mb-6">
              You are {data.daysLate} {data.daysLate === 1 ? 'day' : 'days'} late and you have been strong. Don't go and cry alone tonight. Come and rest small.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="w-full py-3 rounded-full bg-[#9CAF88] text-white font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(156,175,136,0.3)]"
              >
                Stay a little longer
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-full border border-[#4A2C35]/15 text-[#4A2C35]/60 font-medium active:scale-95"
              >
                No, I will come back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}