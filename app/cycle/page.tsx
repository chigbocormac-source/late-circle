'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCyclePhase } from '../../utils/cycleEngine';

export default function CyclePage() {
  const router = useRouter();
  const [lastPeriodDate, setLastPeriodDate] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagMessage, setTagMessage] = useState<string | null>(null);
  
  // Modal states
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedGirl, setSelectedGirl] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // today as state, not computed inline to avoid Next.js hydration errors
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    const savedDate = localStorage.getItem('lateCircleLastPeriod');
    if (savedDate) setLastPeriodDate(savedDate);
    const savedHistory = localStorage.getItem('lateCircleHistory');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedTags = localStorage.getItem('lateCircleTags');
    if (savedTags) setSelectedTags(JSON.parse(savedTags));
    
    setToday(new Date());
    setIsLoaded(true);
  }, []);

  let currentDay = 1;
  let average = 35;
  let lateDays = 0;
  let windowStart = new Date(2000, 0, 1);
  let windowEnd = new Date(2000, 0, 1);

  if (history.length >= 1 && lastPeriodDate) {
    const allDates = [...history, lastPeriodDate].sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
    const diffs: number[] = [];
    for(let i=1; i<allDates.length; i++){
      const d1 = new Date(allDates[i-1]);
      const d2 = new Date(allDates[i]);
      const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      if(diff > 20 && diff < 50) diffs.push(diff);
    }
    if(diffs.length > 0){
      const last3 = diffs.slice(-3);
      average = Math.round(last3.reduce((a,b)=>a+b,0) / last3.length);
    }
  }

  if (lastPeriodDate && today) {
    const last = new Date(lastPeriodDate);
    const todayClone = new Date(today);
    todayClone.setHours(0,0,0,0);
    last.setHours(0,0,0,0);
    const diffTime = todayClone.getTime() - last.getTime();
    currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if(currentDay < 1) currentDay = 1;
    lateDays = currentDay - average;

    const nextPeriodDate = new Date(last);
    nextPeriodDate.setDate(last.getDate() + average);
    windowStart = new Date(nextPeriodDate);
    windowStart.setDate(nextPeriodDate.getDate() - 2);
    windowEnd = new Date(nextPeriodDate);
    windowEnd.setDate(nextPeriodDate.getDate() + 2);
  }

  const girl = getCyclePhase(currentDay, average);

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
    const todayStr = new Date().toISOString(); // save full date with time
    if (lastPeriodDate) {
      const newHistory = [...history, lastPeriodDate];
      setHistory(newHistory);
      localStorage.setItem('lateCircleHistory', JSON.stringify(newHistory));
    }
    setLastPeriodDate(todayStr);
    localStorage.setItem('lateCircleLastPeriod', todayStr);

    // Reset daily circles for new cycle
    localStorage.removeItem('lateCircleData');
    localStorage.removeItem('lateCircleDailyHistory');

    router.push('/');
  };

  const cyclePercent = (currentDay / average) * 100;
  const ringRadius = 85;
  const circleCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circleCircumference - (Math.min(cyclePercent, 100) / 100) * circleCircumference;

  if (!isLoaded) return null;

  // Data for the Explainer Modal
  const girlData: Record<string, any> = {
    rest: {
      title: "🌙 Rest Girl", days: "Day 1-5",
      why: "Your womb is shedding its lining. That takes energy. That's why you are tired.",
      feel: "Cramps, tired, wants to sleep, low energy, wants hot water.",
      want: "Rice soft, Indomie small, hot tea, sleep.",
      circles: "Close Green: SLEEP + CALM only. FOOD = small Green, no pressure. WALK = leave open, you are resting."
    },
    fresh: {
      title: "🌱 Fresh Girl", days: "Day 6-12",
      why: "Estrogen is rising. Your body is rebuilding. That's why your energy is coming back.",
      feel: "Energy coming back, less tired, wants to gist.",
      want: "Normal appetite returns, to go out small, to do chores.",
      circles: "Best time to build streak. Close Green: WALK + FOOD. They are easy now. SLEEP + CALM = bonus."
    },
    fine: {
      title: "✨ Fine Girl", days: "Day 13-23",
      why: "Ovulation is happening. Your body is at its peak. That's why you feel fine and glowing.",
      feel: "Fine, glowing, fine face, high energy, wants picture, wants to talk, confident. Assignment feels easy.",
      want: "To go out, selfie, talk to people.",
      circles: "You can close all 4 Green today, it's easy. If you do one: Close WALK Green, use that energy."
    },
    chop: {
      title: "🍚 Chop Girl", days: "Day 24-30",
      why: "Progesterone is high. Your body is preparing for a possible pregnancy. That's why you want to eat everything and snap.",
      feel: "Hungry hungry hungry, wants 2 plates rice, puff puff, shawarma, craves sweet, snaps at boyfriend, annoyed small, wants to eat everything.",
      want: "indomie, Ice cream, Garri, eba, puff puff, biscuits by 10pm, to stay inside.",
      circles: "Hardest days. Close Green: FOOD + SLEEP + CALM. FOOD = add protein/veg to your rice to make it Green. SLEEP before 11pm. WALK = bonus, not must."
    },
    ready: {
      title: "💜 Ready Girl", days: "Day 31-35",
      why: "Progesterone is dropping. Your body is getting ready to bleed. That's why you are tired, bloated, and emotional.",
      feel: "Tired again, moody, back pain, small bloat, wants to be alone.",
      want: "To stay inside, sleep, ice cream, gifts, petting, sweet names.",
      circles: "Close Green: SLEEP before 10:30pm + CALM 90 secs. FOOD + WALK = leave open if tired. Pad in bag from today."
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-8 px-6 pb-32 font-sans relative animate-page-enter">

      <button onClick={() => router.push('/')} className="absolute top-6 left-6 text-[#4A2C35]/50 text-sm font-medium active:opacity-50">← Today</button>
      <h1 className="text-2xl font-serif text-[#4A2C35] mb-3 tracking-[0.2em]">YOUR CYCLE</h1>

      {/* Status Pill */}
      <div className="flex flex-col items-center mb-4 w-full max-w-sm">
        {lateDays > 0 ? (
          <div className="bg-[#FFB3C1]/40 border border-[#FF8FA3]/30 px-4 py-1 rounded-full">
            <p className="text-[#8A2C3E] text-xs font-bold">🚨 {lateDays} Days Late. {girl.emoji} {girl.name}</p>
          </div>
        ) : (
          <div className="bg-[#9CAF88]/15 border border-[#9CAF88]/20 px-4 py-1 rounded-full">
            <p className="text-[#5A7350] text-xs font-bold">{girl.emoji} Day {currentDay} • {girl.name}. Period close</p>
          </div>
        )}
      </div>

      {/* Compact Ring with Next Period inside */}
      <div className="relative mb-4 flex items-center justify-center" style={{ width: '200px', height: '200px' }}>
        <svg className="absolute inset-0 transform -rotate-90" width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={ringRadius} fill="transparent" stroke="rgba(74, 44, 53, 0.08)" strokeWidth="10" />
          <circle cx="100" cy="100" r={ringRadius} fill="transparent" stroke={lateDays > 0 ? "#FF8FA3" : girl.color} strokeWidth="10" strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="flex items-baseline justify-center gap-1 leading-none">
            <span className={`text-5xl font-bold tracking-tighter ${lateDays > 0 ? 'text-[#FF8FA3]' : 'text-[#4A2C35]'}`}>{currentDay}</span>
            <span className="text-xl text-[#4A2C35]/30 font-medium">/ {average}</span>
          </div>
          <span className="text-[10px] text-[#4A2C35]/50 mt-1 font-bold tracking-widest uppercase">{girl.name}</span>
          <span className="text-[9px] text-[#4A2C35]/40 mt-2 font-medium">
            Next: {windowStart.toLocaleDateString('en-GB',{day:'numeric',month:'short'})} - {windowEnd.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
          </span>
        </div>
      </div>

      {/* Horizontal Scrollable Tags */}
      <div className="w-full max-w-sm mb-6">
        <h2 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-2 text-center">How are you feeling today?</h2>
        <div className="flex overflow-x-auto gap-2 pb-2 px-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {['bloat', 'acne', 'emotional', 'cravings', 'waist pain'].map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)} className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedTags.includes(tag) ? 'bg-[#4A2C35] text-white border-[#4A2C35] shadow-[0_4px_12px_rgba(74,44,53,0.15)]' : 'bg-white text-[#4A2C35]/70 border-[#4A2C35]/10 shadow-[0_2px_8px_rgba(74,44,53,0.04)]'}`}>
              {tag}
            </button>
          ))}
        </div>
        {tagMessage && (
          <div className="bg-white border border-[#FFB3C1]/30 p-3 rounded-xl text-xs text-[#4A2C35]/80 w-full animate-slide-up shadow-[0_8px_24px_rgba(74,44,53,0.06)] leading-relaxed mt-2">{tagMessage}</div>
        )}
      </div>

      {/* Slimmer Action Button */}
      <button onClick={() => setShowConfirm(true)} className="w-full max-w-sm bg-[#4A2C35] text-white py-3 rounded-full text-sm font-bold shadow-[0_8px_20px_-4px_rgba(74,44,53,0.25)] active:scale-95 transition-transform mb-8">
        My period started today 🌸
      </button>

      {/* Compact 5 Girls Card */}
      <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 rounded-3xl p-5 shadow-[0_16px_32px_-12px_rgba(74,44,53,0.1)] mb-4">
        <div className="mb-3">
          <h2 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-widest">5 Girls in 1 Body</h2>
          <p className="text-[10px] text-[#4A2C35]/50 mt-0.5">Tap a girl to see what she means.</p>
        </div>
        
        <div className="flex flex-col gap-1">
          <button onClick={() => setSelectedGirl('rest')} className={`flex flex-col text-left p-2 rounded-xl transition-all active:scale-[0.98] ${currentDay<=5?'bg-[#FFF0F3] shadow-sm':''}`}>
            <div className="flex justify-between items-center w-full">
              <span className={`text-sm ${currentDay<=5 ? 'font-bold text-[#4A2C35]' : 'text-[#4A2C35]/80'}`}>🌙 Rest Girl</span>
              <div className="flex items-center gap-2"><span className="text-[10px] text-[#4A2C35]/40">Day 1-5</span><span className="text-[#4A2C35]/30 text-lg leading-none">›</span></div>
            </div>
            <span className="text-[10px] text-[#4A2C35]/50 ml-6">{currentDay<=5 ? <span className="text-[#FF8FA3] font-bold">Tired. You are here 💜</span> : "Tired"}</span>
          </button>

          <button onClick={() => setSelectedGirl('fresh')} className={`flex flex-col text-left p-2 rounded-xl transition-all active:scale-[0.98] ${currentDay>5&&currentDay<=12?'bg-[#FFF0F3] shadow-sm':''}`}>
            <div className="flex justify-between items-center w-full">
              <span className={`text-sm ${currentDay>5&&currentDay<=12 ? 'font-bold text-[#4A2C35]' : 'text-[#4A2C35]/80'}`}>🌱 Fresh Girl</span>
              <div className="flex items-center gap-2"><span className="text-[10px] text-[#4A2C35]/40">Day 6-12</span><span className="text-[#4A2C35]/30 text-lg leading-none">›</span></div>
            </div>
            <span className="text-[10px] text-[#4A2C35]/50 ml-6">{currentDay>5&&currentDay<=12 ? <span className="text-[#FF8FA3] font-bold">Energy back. You are here 💜</span> : "Energy back"}</span>
          </button>

          <button onClick={() => setSelectedGirl('fine')} className={`flex flex-col text-left p-2 rounded-xl transition-all active:scale-[0.98] ${currentDay>12&&currentDay<=23?'bg-[#FFF0F3] shadow-sm':''}`}>
            <div className="flex justify-between items-center w-full">
              <span className={`text-sm ${currentDay>12&&currentDay<=23 ? 'font-bold text-[#4A2C35]' : 'text-[#4A2C35]/80'}`}>✨ Fine Girl</span>
              <div className="flex items-center gap-2"><span className="text-[10px] text-[#4A2C35]/40">Day 13-23</span><span className="text-[#4A2C35]/30 text-lg leading-none">›</span></div>
            </div>
            <span className="text-[10px] text-[#4A2C35]/50 ml-6">{currentDay>12&&currentDay<=23 ? <span className="text-[#FF8FA3] font-bold">Glowing. You are here 💜</span> : "Glowing"}</span>
          </button>

          <button onClick={() => setSelectedGirl('chop')} className={`flex flex-col text-left p-2 rounded-xl transition-all active:scale-[0.98] ${currentDay>23&&currentDay<=30?'bg-[#FFF0F3] shadow-sm':''}`}>
            <div className="flex justify-between items-center w-full">
              <span className={`text-sm ${currentDay>23&&currentDay<=30 ? 'font-bold text-[#4A2C35]' : 'text-[#4A2C35]/80'}`}>🍚 Chop Girl</span>
              <div className="flex items-center gap-2"><span className="text-[10px] text-[#4A2C35]/40">Day 24-30</span><span className="text-[#4A2C35]/30 text-lg leading-none">›</span></div>
            </div>
            <span className="text-[10px] text-[#4A2C35]/50 ml-6">{currentDay>23&&currentDay<=30 ? <span className="text-[#FF8FA3] font-bold">Hungry. You are here 💜</span> : "Hungry"}</span>
          </button>

          <button onClick={() => setSelectedGirl('ready')} className={`flex flex-col text-left p-2 rounded-xl transition-all active:scale-[0.98] ${currentDay>30?'bg-[#FFF0F3] shadow-sm':''}`}>
            <div className="flex justify-between items-center w-full">
              <span className={`text-sm ${currentDay>30 ? 'font-bold text-[#4A2C35]' : 'text-[#4A2C35]/80'}`}>💜 Ready Girl</span>
              <div className="flex items-center gap-2"><span className="text-[10px] text-[#4A2C35]/40">Day 31-{average}</span><span className="text-[#4A2C35]/30 text-lg leading-none">›</span></div>
            </div>
            <span className="text-[10px] text-[#4A2C35]/50 ml-6">{currentDay>30 ? <span className="text-[#FF8FA3] font-bold">Waiting. You are here 💜</span> : "Waiting"}</span>
          </button>
        </div>
      </div>

      {/* Compact History Button */}
      <button onClick={() => setShowHistory(true)} className="w-full max-w-sm bg-white border border-[#4A2C35]/5 rounded-2xl p-4 flex justify-between items-center shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08)] active:scale-[0.98] transition-transform">
        <span className="text-sm font-bold text-[#4A2C35]/80">View Recent Cycles ({history.length})</span>
        <span className="text-[#4A2C35]/30 text-lg">›</span>
      </button>

      {/* CONFIRM PERIOD MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-[#4A2C35]/20 backdrop-blur-sm z-100 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white border border-[#4A2C35]/5 rounded-3xl p-6 w-full max-w-sm shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFF0F3] flex items-center justify-center mx-auto mb-4"><span className="text-3xl">🌸</span></div>
            <h3 className="text-xl font-bold text-[#4A2C35] mb-2">Did your period start?</h3>
            <p className="text-sm text-[#4A2C35]/60 mb-6 leading-relaxed">This will save to your history and reset your cycle to Day 1.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-full border border-[#4A2C35]/10 text-[#4A2C35]/60 font-medium active:scale-95 transition-transform bg-[#FFF0F3]/50">Cancel</button>
              <button onClick={() => { setShowConfirm(false); handlePeriodStart(); }} className="flex-1 py-3 rounded-full bg-[#4A2C35] text-white font-bold active:scale-95 transition-transform shadow-[0_8px_20px_-4px_rgba(74,44,53,0.3)]">Yes, reset</button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistory && (
        <div className="fixed inset-0 bg-[#4A2C35]/20 backdrop-blur-sm z-100 flex items-end justify-center sm:items-center p-4 animate-fade-in" onClick={() => setShowHistory(false)}>
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#4A2C35]">Recent Cycles</h2>
              <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#4A2C35]/60 font-bold active:scale-95">✕</button>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-[#4A2C35]/40 text-center py-6">No history yet. Your first cycle is being tracked now.</p>
            ) : (
              <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2">
                {history.slice().reverse().map((date, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-[#4A2C35]/5 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-[#4A2C35]/80 font-medium">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="text-[10px] bg-[#FFF0F3] text-[#FF8FA3] px-2 py-1 rounded-full font-bold">Logged</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-[#4A2C35]/40 mt-6 text-center">Saved on your device. Show your doctor if you need clarity.</p>
          </div>
        </div>
      )}

      {/* 5 GIRLS EXPLAINER MODAL */}
      {selectedGirl && (() => {
        const data = girlData[selectedGirl];
        return (
          <div className="fixed inset-0 bg-[#4A2C35]/20 backdrop-blur-sm z-100 flex items-end justify-center sm:items-center p-4 animate-fade-in" onClick={() => setSelectedGirl(null)}>
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] animate-slide-up max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-[#4A2C35]">{data.title}</h2>
                <button onClick={() => setSelectedGirl(null)} className="w-8 h-8 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#4A2C35]/60 font-bold active:scale-95">✕</button>
              </div>
              <p className="text-xs text-[#4A2C35]/50 font-medium mb-6">{data.days}</p>

              <div className="flex flex-col gap-4 mb-6">
                <div className="bg-[#FFF0F3] rounded-xl p-3 border border-[#4A2C35]/5">
                  <h3 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-1">Why this is happening</h3>
                  <p className="text-sm text-[#4A2C35] leading-relaxed font-medium">{data.why}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-1">You will feel</h3>
                  <p className="text-sm text-[#4A2C35] leading-relaxed">{data.feel}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-1">You will want</h3>
                  <p className="text-sm text-[#4A2C35] leading-relaxed">{data.want}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-1">Your circles</h3>
                  <p className="text-sm text-[#4A2C35] leading-relaxed">{data.circles}</p>
                </div>
              </div>

              <p className="text-[10px] text-[#4A2C35]/40 text-center mb-4 leading-relaxed">35 days is not 1 mood. It's 5 girls. This is your pattern, not everybody's. Not medical. Just your pattern.</p>

              <button onClick={() => setSelectedGirl(null)} className="w-full bg-[#4A2C35] text-white py-3 rounded-full font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(74,44,53,0.2)]">Got it, Ovi</button>
            </div>
          </div>
        );
      })()}
    </main>
  );
}