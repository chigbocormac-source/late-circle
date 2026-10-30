'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CyclePage() {
  const router = useRouter();
  const [lastPeriodDate, setLastPeriodDate] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagMessage, setTagMessage] = useState<string | null>(null);
  
  // NEW: State for the custom modal
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const savedDate = localStorage.getItem('lateCircleLastPeriod');
    if (savedDate) setLastPeriodDate(savedDate);
    
    const savedHistory = localStorage.getItem('lateCircleHistory');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedTags = localStorage.getItem('lateCircleTags');
    if (savedTags) setSelectedTags(JSON.parse(savedTags));
    
    setIsLoaded(true);
  }, []);

  let currentDay = 1;
  let average = 35;
  let lateDays = 0;
  
  if (lastPeriodDate) {
    const last = new Date(lastPeriodDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - last.getTime());
    currentDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    lateDays = currentDay - average;
  }

  const toggleTag = (tag: string) => {
    if (tag === 'bloat') setTagMessage("Bloat is not fat. It's gas from late eating. Close Food Green (before 9pm) and walk 20 mins today. Tomorrow morning, your belly will be flat.");
    else if (tag === 'waist pain') setTagMessage("Lying down makes cramps worse. Walk today = blood flow = cramp -40% tomorrow.");
    else if (tag === 'acne') setTagMessage("Sleep before 10:30pm tonight. Less stress hormone = fewer patches tomorrow.");
    else if (tag === 'emotional') setTagMessage("Small thing will make you angry or cry today. Do 90 seconds of Calm. Tell your brain: 'I am safe.'");
    else if (tag === 'cravings') setTagMessage("Cravings are high because your body wants quick energy. Eat protein + veg first, then small sweet.");
    else setTagMessage(null);

    let newTags;
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter(t => t !== tag);
      setTagMessage(null);
    } else {
      newTags = [...selectedTags, tag];
    }
    setSelectedTags(newTags);
    localStorage.setItem('lateCircleTags', JSON.stringify(newTags));
  };

  const handlePeriodStart = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Save the old date to history before overwriting
    if (lastPeriodDate) {
      const newHistory = [...history, lastPeriodDate];
      setHistory(newHistory);
      localStorage.setItem('lateCircleHistory', JSON.stringify(newHistory));
    }
    
    // Set new date
    setLastPeriodDate(today);
    localStorage.setItem('lateCircleLastPeriod', today);
    
    // Go back to home screen to see the reset
    router.push('/');
  };

  const cyclePercent = (currentDay / average) * 100;
  const ringRadius = 100;
  const circleCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circleCircumference - (Math.min(cyclePercent, 100) / 100) * circleCircumference;

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[#0F0F10] text-[#E8E0D5] flex flex-col items-center pt-12 px-6 pb-32 font-sans relative">
      
      <button onClick={() => router.push('/')} className="absolute top-6 left-6 text-[#E8E0D5]/50 text-sm active:opacity-50">← Today</button>
      <h1 className="text-2xl font-serif text-[#9CAF88] mb-2 tracking-[0.2em]">YOUR CYCLE</h1>

      <div className="flex flex-col items-center mb-6 w-full max-w-sm">
        {lateDays > 0 ? (
          <p className="text-[#C97363] text-xs font-medium mb-2 flex items-center gap-1 opacity-80">🚨 {lateDays} Days Late</p>
        ) : (
          <p className="text-[#9CAF88] text-xs font-medium mb-2 flex items-center gap-1 opacity-80">⚠️ Period close. Tags loading...</p>
        )}
      </div>

      <div className="relative mb-6" style={{ width: '240px', height: '240px' }}>
        <svg className="absolute inset-0 transform -rotate-90" width="240" height="240" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r={ringRadius} fill="transparent" stroke="rgba(232, 224, 213, 0.1)" strokeWidth="12" />
          <circle cx="120" cy="120" r={ringRadius} fill="transparent" stroke={lateDays > 0 ? "#C97363" : "#9CAF88"} strokeWidth="12" strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="flex items-baseline justify-center gap-1 leading-none">
            <span className={`text-6xl font-bold tracking-tighter ${lateDays > 0 ? 'text-[#C97363]' : ''}`}>{currentDay}</span>
            <span className="text-2xl text-[#E8E0D5]/50 font-medium">/ {average}</span>
          </div>
          <span className="text-xs text-[#E8E0D5]/70 mt-2 font-bold tracking-widest uppercase">days</span>
        </div>
      </div>

      <p className="text-[#E8E0D5]/70 text-sm mb-8 text-center px-4">
        {lateDays > 0 ? `You're ${lateDays} days late. Take a deep breath. It's okay.` : `Right on time. Keep up the good work, Ada.`}
      </p>

      {/* TAGS */}
      <div className="w-full max-w-sm mb-6">
        <h2 className="text-xs font-bold text-[#E8E0D5]/50 uppercase tracking-wider mb-3 text-center">How are you feeling today?</h2>
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {['bloat', 'acne', 'emotional', 'cravings', 'waist pain'].map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedTags.includes(tag) ? 'bg-[#9CAF88] text-[#0F0F10] border-[#9CAF88]' : 'bg-transparent text-[#E8E0D5]/70 border-[#E8E0D5]/20 hover:border-[#9CAF88]'}`}>
              {tag}
            </button>
          ))}
        </div>
        {tagMessage && (
          <div className="bg-[#1A1A1C] border border-[#9CAF88]/30 p-3 rounded-xl text-xs text-[#E8E0D5]/90 w-full animate-slide-up">{tagMessage}</div>
        )}
      </div>

      <button onClick={() => setShowConfirm(true)} className="w-full max-w-sm bg-[#9CAF88] text-[#0F0F10] py-4 rounded-full text-lg font-bold shadow-[0_0_20px_rgba(156,175,136,0.2)] active:scale-95 transition-transform mb-10">
        My period started today 🌸
      </button>

      <div className="w-full max-w-sm bg-[#1A1A1C] border border-[#E8E0D5]/10 rounded-3xl p-6">
        <h2 className="text-sm font-bold text-[#E8E0D5]/50 uppercase tracking-wider mb-4">Recent Cycles</h2>
        {history.length === 0 ? (
          <p className="text-sm text-[#E8E0D5]/50 text-center py-4">No history yet. Your first cycle is being tracked now.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.slice().reverse().map((date, index) => (
              <div key={index} className="flex justify-between items-center border-b border-[#E8E0D5]/10 pb-2 last:border-0">
                <span className="text-sm text-[#E8E0D5]/80">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="text-xs text-[#9CAF88]">Logged</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] text-[#E8E0D5]/40 mt-6 text-center">This history is saved on your device. Show it to your doctor if you're concerned.</p>
      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-100 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-[#1A1A1C] border border-[#E8E0D5]/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-[#9CAF88]/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌸</span>
            </div>
            <h3 className="text-xl font-bold text-[#E8E0D5] mb-2">Did your period start?</h3>
            <p className="text-sm text-[#E8E0D5]/70 mb-6">
              This will save to your history and reset your cycle to Day 1.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="flex-1 py-3 rounded-full border border-[#E8E0D5]/20 text-[#E8E0D5]/70 font-medium active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowConfirm(false);
                  handlePeriodStart();
                }} 
                className="flex-1 py-3 rounded-full bg-[#9CAF88] text-[#0F0F10] font-bold active:scale-95 transition-transform"
              >
                Yes, reset
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}