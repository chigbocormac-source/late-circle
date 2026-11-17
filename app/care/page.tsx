'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { localDateKey } from '../../utils/analytics';
import AccountCard from '../components/AccountCard';

function CareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [showSoftPlace, setShowSoftPlace] = useState(false);
  const [futureLine, setFutureLine] = useState('');
  const [savedLine, setSavedLine] = useState<string | null>(null);
  const [fearInput, setFearInput] = useState('');
  const [savedFear, setSavedFear] = useState<string | null>(null);
  
  // Real data states
  const [lateDays, setLateDays] = useState(0);
  const [expectedDate, setExpectedDate] = useState('');
  const [todayDate, setTodayDate] = useState('');
  const [totalChecks, setTotalChecks] = useState(0);
  const [checkDates, setCheckDates] = useState<string[]>([]);
  const [stressTags, setStressTags] = useState<string[]>([]);
  const [cycleCount, setCycleCount] = useState(1);
  const [recentCycles, setRecentCycles] = useState<number[]>([]);
  const [averageCycle, setAverageCycle] = useState(31);

  useEffect(() => {
    if (searchParams.get('open') === 'softplace') {
      setShowSoftPlace(true);
    }
    
    const saved = localStorage.getItem('lateCircleFutureLine');
    if (saved) setSavedLine(saved);
    const savedF = localStorage.getItem('lateCircleFear');
    if (savedF) setSavedFear(savedF);

    const lastPeriod = localStorage.getItem('lateCircleLastPeriod');
    const savedHistory = JSON.parse(localStorage.getItem('lateCircleHistory') || '[]');
    const savedYouPlace = JSON.parse(localStorage.getItem('lateCircleYouPlace') || 'null');
    
    if (savedYouPlace?.stress) setStressTags(savedYouPlace.stress);

    // Cycle count = history length + 1
    const count = savedHistory.length + 1;
    setCycleCount(count);

    // Calculate average cycle length
    let avg = 31;
    if (savedHistory.length >= 2) {
      const all = [...savedHistory, lastPeriod].filter(Boolean).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
      const lengths: number[] = [];
      for (let i = 1; i < all.length; i++) {
        const diff = Math.round((new Date(all[i]).getTime() - new Date(all[i-1]).getTime()) / (1000 * 60 * 60 * 24));
        if (diff > 20 && diff < 60) lengths.push(diff);
      }
      if (lengths.length > 0) {
        avg = Math.round(lengths.reduce((a,b) => a+b, 0) / lengths.length);
        setRecentCycles(lengths.slice(-3));
      }
    }
    setAverageCycle(avg);

    if (lastPeriod) {
      const last = new Date(lastPeriod);
      const today = new Date();
      today.setHours(0,0,0,0);
      last.setHours(0,0,0,0);
      const diffTime = today.getTime() - last.getTime();
      const currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const late = currentDay - avg;
      
      setLateDays(late);
      setTodayDate(today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
      
      const expected = new Date(last);
      expected.setDate(last.getDate() + avg);
      setExpectedDate(expected.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
    }

    const dailyHistory = JSON.parse(localStorage.getItem('lateCircleDailyHistory') || '{}');
    let checkCount = 0;
    const dates: string[] = [];
    
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = localDateKey(d);
      if (dailyHistory[dateStr] && dailyHistory[dateStr].count > 0) {
        checkCount++;
        dates.push(i === 0 ? 'today' : i === 1 ? 'yesterday' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
      }
    }
    setTotalChecks(checkCount);
    setCheckDates(dates);
  }, [searchParams]);

  const handleSaveFutureLine = () => {
    if (!futureLine.trim()) return;
    localStorage.setItem('lateCircleFutureLine', futureLine);
    setSavedLine(futureLine);
  };

  const handleSaveFear = () => {
    if (!fearInput.trim()) return;
    localStorage.setItem('lateCircleFear', fearInput);
    setSavedFear(fearInput);
  };

  const handleDeleteFear = () => {
    localStorage.removeItem('lateCircleFear');
    setSavedFear(null);
  };

  const handleDeleteFutureLine = () => {
    localStorage.removeItem('lateCircleFutureLine');
    setSavedLine(null);
  };

  const isLate = lateDays > 0;

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-12 px-6 pb-32 font-sans relative overflow-hidden">
      
      {!showSoftPlace && (
        <div className="w-full max-w-sm flex flex-col items-center animate-fade-in">
          <h1 className="text-2xl font-serif text-[#4A2C35] mb-2 tracking-[0.2em]">YOUR CARE</h1>
          <p className="text-[#4A2C35]/50 text-xs mb-8">Rest, build, and understand.</p>

          <div className="w-full flex flex-col gap-4">
            {isLate ? (
              <button onClick={() => setShowSoftPlace(true)} className="bg-white border border-[#4A2C35]/5 p-6 rounded-3xl shadow-sm text-left active:scale-95 transition-transform">
                <div className="w-12 h-12 rounded-full bg-[#FFB3C1]/20 flex items-center justify-center mb-4">
                  <span className="text-2xl">🤍</span>
                </div>
                <h2 className="text-lg font-bold text-[#4A2C35] mb-1">Soft Place</h2>
                <p className="text-xs text-[#4A2C35]/60 leading-relaxed">For when you are panicking. Come and rest inside Ovi's words for tonight.</p>
              </button>
            ) : (
              <div className="bg-white/50 border border-[#4A2C35]/5 p-6 rounded-3xl text-left opacity-70">
                <div className="w-12 h-12 rounded-full bg-[#9CAF88]/20 flex items-center justify-center mb-4">
                  <span className="text-2xl">🌙</span>
                </div>
                <h2 className="text-lg font-bold text-[#4A2C35] mb-1">Soft Place is resting.</h2>
                <p className="text-xs text-[#4A2C35]/60 leading-relaxed">It will open for you if your period is late. For now, Ovi is with you on the Today page.</p>
              </div>
            )}

            <button onClick={() => router.push('/care/you-place')} className="bg-white border border-[#4A2C35]/5 p-6 rounded-3xl shadow-sm text-left active:scale-95 transition-transform">
              <div className="w-12 h-12 rounded-full bg-[#9CAF88]/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <h2 className="text-lg font-bold text-[#4A2C35] mb-1">You Place</h2>
              <p className="text-xs text-[#4A2C35]/60 leading-relaxed">Build your story small small. When you are ready, generate your Doctor PDF.</p>
            </button>

            <AccountCard />

            <div className="w-full text-center mt-2 mb-6">
              <p className="text-[10px] text-[#4A2C35]/40 leading-relaxed px-2 mb-3">
                By using Late Circle, you agree to our
              </p>
              <div className="flex justify-center items-center gap-3">
                <a href="/privacy" className="px-4 py-2 rounded-full bg-white border border-[#4A2C35]/10 text-[10px] font-bold text-[#4A2C35]/60 active:scale-95 transition-transform">
                  Privacy Policy
                </a>
                <a href="/terms" className="px-4 py-2 rounded-full bg-white border border-[#4A2C35]/10 text-[10px] font-bold text-[#4A2C35]/60 active:scale-95 transition-transform">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSoftPlace && isLate && (
        <div className="w-full max-w-sm flex flex-col animate-fade-in pb-12">
          <button onClick={() => setShowSoftPlace(false)} className="text-[#4A2C35]/50 text-sm font-medium active:opacity-50 mb-6 self-start">← Back</button>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#4A2C35] mb-2">Welcome home, Love.</h1>
            <p className="text-xs text-[#4A2C35]/60">This Soft Place is only yours. No one else will see it.</p>
          </div>

          <div className="bg-white border border-[#4A2C35]/5 rounded-3xl p-6 shadow-sm mb-6">
            <h2 className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-4">Your Story</h2>
            
            <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
              My girl, I see you.
            </p>
            
            {/* MONTH 1: FIRST TIME */}
            {cycleCount === 1 && (
              <>
                <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
                  You were supposed to see your period on <strong>{expectedDate}</strong>. Today is {todayDate}. That is <strong>{lateDays} days late</strong>.
                </p>
                <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
                  This is the first time you have been late since you started tracking with me. That can feel scary, because you don't know what your body does yet.
                </p>
                <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
                  A late period does not automatically tell us why. It could be stress, travel, illness, or something else. We don't know yet. If pregnancy is possible, you can take a pregnancy test. We can also keep looking at your cycle history together.
                </p>
              </>
            )}

            {/* MONTH 2: THE PATTERN */}
            {cycleCount === 2 && (
              <>
                <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
                  Today is {todayDate}. That is <strong>{lateDays} days late</strong>. Last month you were also late, and it came.
                </p>
                <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
                  Last month was difficult too. Your period eventually came, and I remember that. This month is another experience, and we don't have to assume it will follow exactly the same pattern.
                </p>
                <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
                  Your body has done this before. It waited, and then it came. We will wait together again, small small.
                </p>
              </>
            )}

            {/* MONTH 3+: THE COMPANION */}
            {cycleCount >= 3 && (
              <>
                <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
                  I know your body now. Your last 3 cycles were <strong>{recentCycles.join(', ')} days</strong>. That means your period usually comes every <strong>{averageCycle} days</strong>.
                </p>
                <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
                  Today, you are <strong>{lateDays} days past your average</strong>. That is different from your usual pattern.
                </p>
                <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
                  I am not saying something is wrong. Bodies change. But because I know your pattern, I can tell you that this month is not following it. That is useful for your doctor to know.
                </p>
              </>
            )}

            {/* STRESS TAGS */}
            {stressTags.length > 0 && (
              <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
                You told me this month you had <strong>{stressTags.join(', ')}</strong>. That is a lot to have going on. I am not saying that is why your period is late, but I remember you were carrying a lot this month.
              </p>
            )}

            {/* SAVED FEAR */}
            {savedFear && (
              <div className="bg-[#FFF0F3] rounded-xl p-4 mb-4 border border-[#FFB3C1]/20">
                <p className="text-xs text-[#4A2C35]/60 mb-1">You told me before:</p>
                <p className="text-sm text-[#4A2C35] italic mb-2">"{savedFear}"</p>
                <p className="text-xs text-[#4A2C35]/70">I can see that this has been weighing on you. Thank you for trusting this space with it.</p>
              </div>
            )}

            <p className="text-sm text-[#4A2C35] leading-relaxed mb-4 font-bold">
              You are not careless. You are not dirty. You are not a bad girl. You are a girl who is waiting, and waiting is hard.
            </p>

            {/* TONIGHT */}
            <div className="bg-[#FFF0F3] rounded-xl p-4 mt-6">
              <h3 className="text-[10px] font-bold text-[#8A2C3E] uppercase tracking-widest mb-2">Tonight, do only this:</h3>
              <ul className="text-xs text-[#4A2C35] space-y-2 mb-4">
                <li>1. Drink one full bottle of water, slowly.</li>
                <li>2. Eat something warm. Don't stay empty.</li>
                <li>3. Put your phone down by 10pm. I will stay with you.</li>
              </ul>
              <p className="text-[10px] text-[#8A2C3E] leading-relaxed">
                If you have severe pain, heavy bleeding that soaks more than 2 pads in 1 hour, fever, or fainting, please go to a hospital or talk to a doctor or nurse quickly. Don't wait alone. Your safety is more important than anything here.
              </p>
            </div>
          </div>

          {/* CHECK-INS */}
          <div className="bg-white border border-[#4A2C35]/5 rounded-3xl p-6 shadow-sm mb-6">
            <h2 className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-4">Your Check-Ins This Month</h2>
            {totalChecks > 0 ? (
              <>
                <p className="text-sm text-[#4A2C35] mb-4">You checked in on <strong>{totalChecks} days</strong> this month. I saved your records.</p>
                <p className="text-xs text-[#4A2C35]/70 mb-4">You showed up on {checkDates.join(', ')}.</p>
                <p className="text-xs font-bold text-[#4A2C35] mt-4">You are not lazy. You are a girl who kept going while scared. Put your stars on your chest. You earned them.</p>
              </>
            ) : (
              <p className="text-sm text-[#4A2C35]/70">You haven't checked in yet this month. That's okay. Tonight we start.</p>
            )}
          </div>

          {/* FEAR BOX */}
          <div className="bg-white border border-[#4A2C35]/5 rounded-3xl p-6 shadow-sm mb-6">
            <h2 className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-4">What is scaring you tonight?</h2>
            {!savedFear ? (
              <>
                <p className="text-xs text-[#4A2C35]/60 mb-2">If you want to tell me what you are scared of, I will keep it here for you. Only you will see it.</p>
                <textarea value={fearInput} onChange={(e) => setFearInput(e.target.value)} placeholder="I am scared that..." className="w-full h-20 bg-[#FFF0F3] text-[#4A2C35] p-3 rounded-lg border border-[#4A2C35]/10 focus:outline-none focus:border-[#FF8FA3] resize-none text-sm mb-2" />
                <button onClick={handleSaveFear} className="w-full bg-[#FFB3C1] text-[#8A2C3E] py-2 rounded-lg font-bold text-xs active:scale-95">Save what I said</button>
              </>
            ) : (
              <>
                <p className="text-sm text-[#4A2C35] italic mb-2">"{savedFear}"</p>
                <button onClick={handleDeleteFear} className="text-[10px] text-[#8A2C3E]/50 underline">Delete this</button>
              </>
            )}
          </div>

          {/* FUTURE LINE */}
          <div className="bg-white border border-[#4A2C35]/5 rounded-3xl p-6 shadow-sm mb-6">
            <h2 className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-4">For Future You</h2>
            {!savedLine ? (
              <>
                <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">Love, if next month you are waiting again, what do you want to tell yourself? Write one line. I will keep it for you.</p>
                <textarea value={futureLine} onChange={(e) => setFutureLine(e.target.value)} placeholder="Write to future you..." className="w-full h-24 bg-[#FFF0F3] text-[#4A2C35] p-4 rounded-xl border border-[#4A2C35]/10 focus:outline-none focus:border-[#FF8FA3] resize-none text-sm mb-3" />
                <button onClick={handleSaveFutureLine} className="w-full bg-[#9CAF88] text-white py-3 rounded-full font-bold active:scale-95 text-sm">Save My Line In My Soft Place</button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-sm text-[#4A2C35] italic mb-2">"{savedLine}"</p>
                <p className="text-[10px] text-[#9CAF88] font-bold mb-2">Saved. I will bring this back to you next month.</p>
                <button onClick={handleDeleteFutureLine} className="text-[10px] text-[#8A2C3E]/50 underline">Delete this</button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function CarePage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#FFF0F3]" />}>
      <CareContent />
    </Suspense>
  );
}