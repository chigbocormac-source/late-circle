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
    if (lastPeriodDate) {
      const newHistory = [...history, lastPeriodDate];
      setHistory(newHistory);
      localStorage.setItem('lateCircleHistory', JSON.stringify(newHistory));
    }
    setLastPeriodDate(today);
    localStorage.setItem('lateCircleLastPeriod', today);
    router.push('/');
  };

  const cyclePercent = (currentDay / average) * 100;
  const ringRadius = 100;
  const circleCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circleCircumference - (Math.min(cyclePercent, 100) / 100) * circleCircumference;

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-12 px-6 pb-32 font-sans relative">
      
      <button onClick={() => router.push('/')} className="absolute top-6 left-6 text-[#4A2C35]/50 text-sm font-medium active:opacity-50">← Today</button>
      <h1 className="text-2xl font-serif text-[#4A2C35] mb-2 tracking-[0.2em]">YOUR CYCLE</h1>

      <div className="flex flex-col items-center mb-6 w-full max-w-sm">
        {lateDays > 0 ? (
          <div className="bg-[#FFB3C1]/40 border border-[#FF8FA3]/30 px-4 py-1.5 rounded-full">
            <p className="text-[#8A2C3E] text-xs font-bold">🚨 {lateDays} Days Late</p>
          </div>
        ) : (
          <div className="bg-[#9CAF88]/15 border border-[#9CAF88]/20 px-4 py-1.5 rounded-full">
            <p className="text-[#5A7350] text-xs font-bold">⚠️ Period close. Tags loading...</p>
          </div>
        )}
      </div>

      <div className="relative mb-6" style={{ width: '240px', height: '240px' }}>
        <svg className="absolute inset-0 transform -rotate-90" width="240" height="240" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r={ringRadius} fill="transparent" stroke="rgba(74, 44, 53, 0.08)" strokeWidth="12" />
          <circle cx="120" cy="120" r={ringRadius} fill="transparent" stroke={lateDays > 0 ? "#FF8FA3" : "#9CAF88"} strokeWidth="12" strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="flex items-baseline justify-center gap-1 leading-none">
            <span className={`text-6xl font-bold tracking-tighter ${lateDays > 0 ? 'text-[#FF8FA3]' : 'text-[#4A2C35]'}`}>{currentDay}</span>
            <span className="text-2xl text-[#4A2C35]/30 font-medium">/ {average}</span>
          </div>
          <span className="text-xs text-[#4A2C35]/50 mt-2 font-bold tracking-widest uppercase">days</span>
        </div>
      </div>

      <p className="text-[#4A2C35]/60 text-sm mb-8 text-center px-4 leading-relaxed">
        {lateDays > 0 ? `You're ${lateDays} days late. Take a deep breath. It's okay.` : `Right on time. Keep up the good work, Ada.`}
      </p>

      {/* TAGS */}
      <div className="w-full max-w-sm mb-6">
        <h2 className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-3 text-center">How are you feeling today?</h2>
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {['bloat', 'acne', 'emotional', 'cravings', 'waist pain'].map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)} className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${selectedTags.includes(tag) ? 'bg-[#4A2C35] text-white border-[#4A2C35] shadow-sm' : 'bg-white text-[#4A2C35]/70 border-[#4A2C35]/10 hover:border-[#FF8FA3]/40'}`}>
              {tag}
            </button>
          ))}
        </div>
        {tagMessage && (
          <div className="bg-white border border-[#FFB3C1]/30 p-4 rounded-2xl text-[13px] text-[#4A2C35]/80 w-full animate-slide-up shadow-[0_4px_20px_rgba(74,44,53,0.06)] leading-relaxed">{tagMessage}</div>
        )}
      </div>

      <button onClick={() => setShowConfirm(true)} className="w-full max-w-sm bg-[#4A2C35] text-white py-4 rounded-full text-[15px] font-bold shadow-[0_4px_20px_rgba(74,44,53,0.15)] active:scale-95 transition-transform mb-10">
        My period started today 🌸
      </button>

      <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 rounded-3xl6 shadow-[0_8px_30px_rgba(74,44,53,0.06)]">
        <h2 className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-4">Recent Cycles</h2>
        {history.length === 0 ? (
          <p className="text-sm text-[#4A2C35]/40 text-center py-4">No history yet. Your first cycle is being tracked now.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.slice().reverse().map((date, index) => (
              <div key={index} className="flex justify-between items-center border-b border-[#4A2C35]/5 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-[#4A2C35]/80 font-medium">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="text-[10px] bg-[#FFF0F3] text-[#FF8FA3] px-2.5 py-1 rounded-full font-bold">Logged</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] text-[#4A2C35]/30 mt-6 text-center leading-relaxed">This history is saved on your device. Show it to your doctor if you're concerned.</p>
      </div>

      {/* CUSTOM CONFIRMATION MODAL - BLUSH PINK */}
      {showConfirm && (
        <div className="fixed inset-0 bg-[#4A2C35]/20 backdrop-blur-sm z-100 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white border border-[#4A2C35]/5 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFF0F3] flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌸</span>
            </div>
            <h3 className="text-xl font-bold text-[#4A2C35] mb-2">Did your period start?</h3>
            <p className="text-sm text-[#4A2C35]/60 mb-6 leading-relaxed">
              This will save to your history and reset your cycle to Day 1.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="flex-1 py-3 rounded-full border border-[#4A2C35]/10 text-[#4A2C35]/60 font-medium active:scale-95 transition-transform bg-[#FFF0F3]/50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowConfirm(false);
                  handlePeriodStart();
                }} 
                className="flex-1 py-3 rounded-full bg-[#4A2C35] text-white font-bold active:scale-95 transition-transform shadow-[0_4px_15px_rgba(74,44,53,0.2)]"
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