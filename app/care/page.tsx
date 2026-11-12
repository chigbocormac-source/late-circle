'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { localDateKey } from '../../utils/analytics';

export default function CarePage() {
  const router = useRouter();
  
  // State for Soft Place
  const [showSoftPlace, setShowSoftPlace] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [futureLine, setFutureLine] = useState('');
  const [savedLine, setSavedLine] = useState<string | null>(null);
  const [fearInput, setFearInput] = useState('');
  const [savedFear, setSavedFear] = useState<string | null>(null);
  
  // REAL DATA (In the real app, you will pull these from localStorage/cycleEngine)
  const lateDays = 9; 
  const longestCycle = 45;
  const currentDay = 47;
  const expectedDate = "3 November";
  const todayDate = "12 November";
  const lastMonthLateDays = 5;
  
  // REAL STARS (In the real app, you count these from dailyHistory)
  const stars = {
    total: 8,
    food: { count: 3, dates: "9 Nov, 10 Nov, 12 Nov" },
    walk: { count: 2, dates: "9 Nov, 12 Nov" },
    sleep: { count: 1, dates: "10 Nov" },
    calm: { count: 2, dates: "10 Nov, 11 Nov" }
  };

  useEffect(() => {
    const saved = localStorage.getItem('lateCircleFutureLine');
    if (saved) setSavedLine(saved);
    const savedF = localStorage.getItem('lateCircleFear');
    if (savedF) setSavedFear(savedF);
  }, []);

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

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-12 px-6 pb-32 font-sans relative overflow-hidden">
      
      {/* CARE TAB HOME */}
      {!showSoftPlace && (
        <div className="w-full max-w-sm flex flex-col items-center animate-fade-in">
          <h1 className="text-2xl font-serif text-[#4A2C35] mb-2 tracking-[0.2em]">YOUR CARE</h1>
          <p className="text-[#4A2C35]/50 text-xs mb-8">Rest, build, and understand.</p>

          <div className="w-full flex flex-col gap-4">
            
            {/* Soft Place Card */}
            <button 
              onClick={() => setShowSoftPlace(true)}
              className="bg-white border border-[#4A2C35]/5 p-6 rounded-3xl shadow-sm text-left active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-[#FFB3C1]/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🤍</span>
              </div>
              <h2 className="text-lg font-bold text-[#4A2C35] mb-1">Soft Place</h2>
              <p className="text-xs text-[#4A2C35]/60 leading-relaxed">
                For when you are panicking. Come and rest inside Ovi's words for tonight.
              </p>
            </button>

            {/* You Place Card */}
            <button 
              onClick={() => router.push('/care/you-place')} 
              className="bg-white border border-[#4A2C35]/5 p-6 rounded-3xl shadow-sm text-left active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-[#9CAF88]/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <h2 className="text-lg font-bold text-[#4A2C35] mb-1">You Place</h2>
              <p className="text-xs text-[#4A2C35]/60 leading-relaxed">
                Build your story small small. When you are ready, generate your Doctor PDF.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* SOFT PLACE TEASER (The Paywall) */}
      {showSoftPlace && !isUnlocked && (
        <div className="w-full max-w-sm flex flex-col items-center animate-slide-up relative pb-12">
          <button 
            onClick={() => setShowSoftPlace(false)} 
            className="absolute top-0 left-0 text-[#4A2C35]/50 text-sm font-medium active:opacity-50"
          >
            ← Back
          </button>

          <div className="mt-12 mb-6 text-center">
            <h1 className="text-2xl font-bold text-[#4A2C35] mb-2">Fine Girl, come and rest. 💜</h1>
            <p className="text-sm text-[#8A2C3E] font-bold">Your Soft Place with Ovi is ready.</p>
          </div>

          <div className="w-full flex flex-col gap-4">
            
            {/* The Truth & Stars */}
            <div className="bg-white border border-[#4A2C35]/5 rounded-3xl p-6 shadow-sm">
              <p className="text-sm text-[#4A2C35]/80 leading-relaxed mb-4">
                My girl, you're <strong>{lateDays} days late</strong>.
              </p>
              <p className="text-sm text-[#4A2C35]/80 leading-relaxed mb-4">
                Last month, your period came {lastMonthLateDays} days after you expected it. This month, we're still waiting.
              </p>

              <div className="flex gap-1.5 mb-3">
                {[...Array(8)].map((_, i) => (
                  <span key={i} className="text-[#FFB3C1] text-lg">⭐</span>
                ))}
              </div>
              
              <h3 className="text-sm font-bold text-[#4A2C35] mb-1">Your 8 Stars This Month</h3>
              <p className="text-xs text-[#4A2C35]/70 mb-4 leading-relaxed">
                You tried 8 times across your four circles. I saved your records.
              </p>

              <p className="text-sm text-[#4A2C35]/90 italic border-l-2 border-[#FFB3C1] pl-4 leading-relaxed">
                "Fine girl, I've saved your month for you. Come and have a look. 💜"
              </p>
            </div>

            {/* What's Inside */}
            <div className="bg-white border border-[#4A2C35]/5 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#4A2C35] mb-4">I wrote everything for you.</h3>
              <p className="text-xs text-[#4A2C35]/60 mb-4">Inside your Soft Place:</p>
              
              <ul className="text-sm text-[#4A2C35]/80 space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-[#FFB3C1]">●</span>
                  <span><strong>Your Story:</strong> Your cycle history and what happened this month.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFB3C1]">●</span>
                  <span><strong>Your 8 Stars:</strong> What you recorded across Food, Walk, Sleep and Calm.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFB3C1]">●</span>
                  <span><strong>Your Personal Note:</strong> A private space to write how you're feeling.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFB3C1]">●</span>
                  <span><strong>For Future You:</strong> Save a message you can read next month.</span>
                </li>
              </ul>
            </div>

            {/* The Lock */}
            <div className="w-full bg-[#4A2C35] p-6 rounded-3xl shadow-lg text-center">
              <h3 className="text-lg font-bold text-white mb-2">Open My Soft Place — ₦500</h3>
              <p className="text-[11px] text-white/70 mb-5">One-time payment. No subscription.</p>
              
              <button 
                onClick={() => setShowPayment(true)}
                className="w-full bg-white text-[#4A2C35] py-4 rounded-full font-bold shadow-md active:scale-95 text-sm mb-3"
              >
                Open My Soft Place — ₦500
              </button>
              
              <p className="text-[10px] text-white/50 leading-relaxed">
                You can continue using Late Circle without purchasing.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* PAYMENT CONFIRMATION MODAL */}
      {showPayment && (
        <div className="fixed inset-0 bg-[#4A2C35]/40 backdrop-blur-sm z-200 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] text-center">
            <h3 className="text-xl font-bold text-[#4A2C35] mb-3">Are you sure, Fine Girl?</h3>
            <p className="text-sm text-[#4A2C35]/70 mb-6 leading-relaxed">
              You are {lateDays} days late and you have been strong. Don't go and cry alone tonight. Come and rest small.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setShowPayment(false);
                  setIsUnlocked(true);
                }} 
                className="w-full bg-[#FF8FA3] text-white py-3.5 rounded-full font-bold shadow-lg active:scale-95 text-sm"
              >
                Yes, Open My Soft Place - N500
              </button>
              <button 
                onClick={() => setShowPayment(false)} 
                className="w-full bg-white border border-[#4A2C35]/15 text-[#4A2C35]/60 py-3.5 rounded-full font-bold active:scale-95 text-sm"
              >
                No, I Will Come Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL SOFT PLACE (Unlocked) */}
      {isUnlocked && (
        <div className="w-full max-w-sm flex flex-col animate-fade-in pb-12">
          <button 
            onClick={() => { setIsUnlocked(false); setShowSoftPlace(false); }} 
            className="text-[#4A2C35]/50 text-sm font-medium active:opacity-50 mb-6 self-start"
          >
            ← Close
          </button>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#4A2C35] mb-2">Welcome home, Fine Girl.</h1>
            <p className="text-xs text-[#4A2C35]/60">This Soft Place is only yours. No one else will see it.</p>
          </div>

          {/* PAGE 1: YOUR STORY */}
          <div className="bg-white border border-[#4A2C35]/5 rounded-3xl p-6 shadow-sm mb-6">
            <h2 className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-4">Your Story</h2>
            <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
              My Girl, this is what I saw this month. You were supposed to see your period on <strong>{expectedDate}</strong>.
            </p>
            <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
              Today is {todayDate}. That is {lateDays} days late. Last month you were {lastMonthLateDays} days late, and it came. You survived that month. You will survive this one too.
            </p>
            
            {/* The Fear Box */}
            <div className="bg-[#FFF0F3] rounded-xl p-4 mb-4">
              <p className="text-xs text-[#4A2C35]/70 mb-2">If you want to tell me what you are scared of, I will keep it here for you. Only you will see it.</p>
              {!savedFear ? (
                <>
                  <textarea
                    value={fearInput}
                    onChange={(e) => setFearInput(e.target.value)}
                    placeholder="I am scared that..."
                    className="w-full h-20 bg-white text-[#4A2C35] p-3 rounded-lg border border-[#4A2C35]/10 focus:outline-none focus:border-[#FF8FA3] resize-none text-sm mb-2"
                  />
                  <button onClick={handleSaveFear} className="w-full bg-[#FFB3C1] text-[#8A2C3E] py-2 rounded-lg font-bold text-xs active:scale-95">
                    Save what I said
                  </button>
                </>
              ) : (
                <p className="text-sm text-[#4A2C35] italic">"{savedFear}"</p>
              )}
            </div>

            <p className="text-sm text-[#4A2C35] leading-relaxed mb-4 font-bold">
              You are not careless. You are not dirty. You are not a bad girl. You are a girl who is waiting, and waiting is hard.
            </p>

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
              <p className="text-[9px] text-[#4A2C35]/40 mt-2">
                This Soft Place is for comfort and tracking, not for medical diagnosis.
              </p>
            </div>
          </div>

          {/* PAGE 2: YOUR STARS */}
          <div className="bg-white border border-[#4A2C35]/5 rounded-3xl p-6 shadow-sm mb-6">
            <h2 className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-4">Your {stars.total} Stars This Month</h2>
            <p className="text-sm text-[#4A2C35] mb-4">Look how hard you tried, Fine Girl. You did not do nothing.</p>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-[#4A2C35] mb-1">🧡 Food — {stars.food.count} stars</p>
                <p className="text-xs text-[#4A2C35]/70">You ate on {stars.food.dates}. You remembered to eat even when you were scared. That is strength.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#4A2C35] mb-1">💚 Walk — {stars.walk.count} stars</p>
                <p className="text-xs text-[#4A2C35]/70">You walked on {stars.walk.dates}, even if it was small walk around compound.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#4A2C35] mb-1">💜 Sleep — {stars.sleep.count} stars</p>
                <p className="text-xs text-[#4A2C35]/70">You slept on {stars.sleep.dates}. Even when worry woke you, you tried again.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#4A2C35] mb-1">💙 Calm — {stars.calm.count} stars</p>
                <p className="text-xs text-[#4A2C35]/70">You chose calm on {stars.calm.dates}. I am proud of you.</p>
              </div>
            </div>
            
            <p className="text-xs font-bold text-[#4A2C35] mt-6">
              Total: {stars.total} stars. You are not lazy. You are a girl who kept going while scared. Put your stars on your chest. You earned them.
            </p>
          </div>

          {/* PAGE 3: THE FUTURE LINE */}
          <div className="bg-white border border-[#4A2C35]/5 rounded-3xl p-6 shadow-sm mb-6">
            <h2 className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-4">For Future You</h2>
            {!savedLine ? (
              <>
                <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
                  Fine Girl, if next month you are waiting again, what do you want to tell yourself? Write one line. I will keep it for you.
                </p>
                <textarea
                  value={futureLine}
                  onChange={(e) => setFutureLine(e.target.value)}
                  placeholder="Write to future you..."
                  className="w-full h-24 bg-[#FFF0F3] text-[#4A2C35] p-4 rounded-xl border border-[#4A2C35]/10 focus:outline-none focus:border-[#FF8FA3] resize-none text-sm mb-3"
                />
                <button 
                  onClick={handleSaveFutureLine}
                  className="w-full bg-[#9CAF88] text-white py-3 rounded-full font-bold active:scale-95 text-sm"
                >
                  Save My Line In My Soft Place
                </button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-sm text-[#4A2C35] italic mb-2">"{savedLine}"</p>
                <p className="text-[10px] text-[#9CAF88] font-bold">Saved. I will bring this back to you next month.</p>
              </div>
            )}
          </div>

          {/* MONTHLY CARE UPSELL */}
          <div className="bg-[#4A2C35] text-white rounded-3xl p-6 shadow-lg text-center mt-4">
            <h3 className="text-lg font-bold mb-2">Keep this feeling forever?</h3>
            <p className="text-xs text-white/70 mb-6">Get a new Soft Place every month, built just for you.</p>
            <button className="w-full bg-white text-[#4A2C35] py-3.5 rounded-full font-bold active:scale-95 text-sm">
              Keep My Soft Place - N1,500/mo
            </button>
            <button 
              onClick={() => { setIsUnlocked(false); setShowSoftPlace(false); }} 
              className="w-full text-white/50 py-3 text-xs underline mt-2"
            >
              Just Tonight is Okay
            </button>
          </div>
        </div>
      )}
    </main>
  );
}