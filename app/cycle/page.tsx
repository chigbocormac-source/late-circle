'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';
import { getCyclePhase, PhaseId, getRealCycleLength } from '../../utils/cycleEngine';
import { logEvent, localDateKey } from '../../utils/analytics';
import { generateShareCard, getCaption, blobToDataURL } from '../../utils/shareCard';

export default function CyclePage() {
  const router = useRouter();
  const [lastPeriodDate, setLastPeriodDate] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagMessage, setTagMessage] = useState<string | null>(null);

  // Modals
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedGirl, setSelectedGirl] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [previousPeriodDate, setPreviousPeriodDate] = useState<string | null>(null);

  // Share
  const [sharePreview, setSharePreview] = useState<{ url: string; caption: string } | null>(null);
  const [shareBusy, setShareBusy] = useState(false);

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
  let longestCycle = 42;
  let lateDays = 0;
  let windowStart = new Date(2000, 0, 1);
  let windowEnd = new Date(2000, 0, 1);

  average = getRealCycleLength(
    lastPeriodDate || null,
    typeof window !== 'undefined' ? localStorage.getItem('lateCirclePrevPeriod') : null,
    typeof window !== 'undefined' ? localStorage.getItem('lateCircleType') : null
  );
  longestCycle = average + 7;

  if (history.length >= 2 && lastPeriodDate) {
    const allDates = [...history, lastPeriodDate].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const diffs: number[] = [];
    for (let i = 1; i < allDates.length; i++) {
      const d1 = new Date(allDates[i - 1]);
      const d2 = new Date(allDates[i]);
      const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 20 && diff < 60) diffs.push(diff);
    }
    if (diffs.length > 0) {
      const last3 = diffs.slice(-3);
      average = Math.round(last3.reduce((a, b) => a + b, 0) / last3.length);
      longestCycle = Math.max(...last3);
    }
  }

  if (lastPeriodDate && today) {
    const last = new Date(lastPeriodDate);
    const todayClone = new Date(today);
    todayClone.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);
    const diffTime = todayClone.getTime() - last.getTime();
    currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (currentDay < 1) currentDay = 1;
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
    if (tag === 'bloat') setTagMessage("Bloat is not fat, fine girl. Your belly is just holding water today. Drink water, eat before 9pm, walk small if you can. I am here with you.");
    else if (tag === 'waist pain') setTagMessage("Waist pain is hard. Lying down all day can make it feel worse. Walk small, even to junction and back, if you can. Rest after.");
    else if (tag === 'acne') setTagMessage("Acne is annoying, I know. It doesn't mean you are dirty. Sleep early tonight if you can. Your skin will thank you small small.");
    else if (tag === 'emotional') setTagMessage("Small thing will make you want to cry today. That's hormones, not you. Do 90 seconds of Calm. Breathe. I am here.");
    else if (tag === 'cravings') setTagMessage("Cravings are loud today because your body wants quick energy. Eat protein first, then small sweet if you want. Don't fight yourself.");
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
    const todayStr = new Date().toISOString();
    if (lastPeriodDate) {
      const newHistory = [...history, lastPeriodDate];
      setHistory(newHistory);
      localStorage.setItem('lateCircleHistory', JSON.stringify(newHistory));
      setPreviousPeriodDate(lastPeriodDate);
    }
    setLastPeriodDate(todayStr);
    localStorage.setItem('lateCircleLastPeriod', todayStr);
    localStorage.removeItem('lateCircleData');
    localStorage.removeItem('lateCircleDataDate');
    localStorage.removeItem('lateCircleDailyHistory');
    setShowUndo(true);

    // --- SUPABASE SYNC ---
    const userId = localStorage.getItem('lateCircleUserId');
    if (userId) {
      supabase.from('cycles').insert([{ user_id: userId, start_date: todayStr }])
        .then(({ error }) => { if (error) console.error("Cycle error:", error); });
    }
  };

  const handleUndoReset = () => {
    if (!previousPeriodDate) return;
    setLastPeriodDate(previousPeriodDate);
    localStorage.setItem('lateCircleLastPeriod', previousPeriodDate);
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    localStorage.setItem('lateCircleHistory', JSON.stringify(newHistory));
    setShowUndo(false);
    setPreviousPeriodDate(null);
  };

  const handleShareGirl = async () => {
    if (!selectedGirl || shareBusy) return;
    const phase = selectedGirl as PhaseId;
    setShareBusy(true);
    try {
      const blob = await generateShareCard(phase, currentDay);
      const caption = getCaption(phase);
      const file = new File([blob], 'late-circle.png', { type: 'image/png' });

      let shared = false;

      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
        try {
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], text: caption });
            shared = true;
          }
        } catch (err) {
          const name = (err as Error)?.name;
          if (name === 'AbortError') {
            setShareBusy(false);
            return;
          }
        }
      }

      if (shared) {
        logEvent('share_completed', { girl: phase, method: 'native' });
      } else {
        try {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'late-circle.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch {}

        try {
          await navigator.clipboard.writeText(caption);
        } catch {}

        const dataUrl = await blobToDataURL(blob);
        setSharePreview({ url: dataUrl, caption });
        logEvent('share_completed', { girl: phase, method: 'fallback' });
      }
    } catch (err) {
      console.error('share failed', err);
    } finally {
      setShareBusy(false);
    }
  };

  const cyclePercent = (currentDay / average) * 100;
  const ringRadius = 85;
  const circleCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circleCircumference - (Math.min(cyclePercent, 100) / 100) * circleCircumference;

  if (!isLoaded) return null;

  const girlData: Record<string, any> = {
    rest: {
      title: "🌙 Rest Girl", days: "First 15% of your cycle",
      why: "Your body is bleeding. It takes energy. That is why you feel tired.",
      feel: "Cramps, low energy, wanting hot water.",
      want: "Soft rice, small Indomie, hot tea, sleep.",
      circles: "Focus: Sleep + Calm.\nFood is okay if you eat small.\nLeave Walk open. You are resting."
    },
    fresh: {
      title: "🌱 Fresh Girl", days: "15% to 35% of your cycle",
      why: "Bleeding has stopped. Your energy is coming back.",
      feel: "Energy returning, less tired, wanting to talk.",
      want: "Normal appetite, to go out small.",
      circles: "Focus: Walk + Food.\nThis is your best time to build a streak."
    },
    fine: {
      title: "✨ Fine Girl", days: "35% to 60% of your cycle",
      why: "This is your glow time. You feel confident.",
      feel: "Fine, glowing, high energy.",
      want: "To go out, take pictures, talk to people.",
      circles: "Focus: All 4.\nYou have the energy to close all 4 today."
    },
    chop: {
      title: "🍚 Chop Girl", days: "60% to 80% of your cycle",
      why: "Your body wants extra energy. That is why you want to eat everything.",
      feel: "Very hungry, craving sweet and starchy food.",
      want: "Indomie, garri, puff puff, shawarma.",
      circles: "Focus: Food + Calm.\nAdd protein to your plate.\nWalk is optional."
    },
    ready: {
      title: "💜 Ready Girl", days: "Last 20% of your cycle",
      why: "Your period is close. Your body is slowing down.",
      feel: "Tired, moody, bloated.",
      want: "To stay inside, sleep, ice cream, sweet names.",
      circles: "Focus: Sleep + Calm.\nLeave Food and Walk open if you are tired.\nKeep a pad in your bag."
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-8 px-6 pb-32 font-sans relative animate-page-enter">

      <button onClick={() => router.push('/today')} className="absolute top-6 left-6 text-[#4A2C35]/50 text-sm font-medium active:opacity-50">← Today</button>
      <h1 className="text-2xl font-serif text-[#4A2C35] mb-3 tracking-[0.2em]">YOUR CYCLE</h1>

      {/* Status pill */}
      <div className="flex flex-col items-center mb-4 w-full max-w-sm">
        <div className="bg-[#9CAF88]/15 border border-[#9CAF88]/20 px-4 py-1.5 rounded-full text-center">
          <p className="text-[#5A7350] text-xs font-bold">
            {girl.emoji} Day {currentDay} • {girl.name}
          </p>
        </div>
      </div>

      {/* Ring */}
      <div className="relative mb-4 flex items-center justify-center" style={{ width: '200px', height: '200px' }}>
        <svg className="absolute inset-0 transform -rotate-90" width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={ringRadius} fill="transparent" stroke="rgba(74, 44, 53, 0.08)" strokeWidth="10" />
          <circle cx="100" cy="100" r={ringRadius} fill="transparent" stroke={girl.color} strokeWidth="10" strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="flex items-baseline justify-center gap-1 leading-none">
            <span className="text-5xl font-bold tracking-tighter text-[#4A2C35]">{currentDay}</span>
            <span className="text-xl text-[#4A2C35]/30 font-medium">/ {average}</span>
          </div>
          <span className="text-[10px] text-[#4A2C35]/50 mt-1 font-bold tracking-widest uppercase">{girl.name}</span>
          {lateDays <= 0 ? (
            <span className="text-[9px] text-[#4A2C35]/40 mt-2 font-medium">
              Next: {windowStart.toLocaleDateString('en-GB',{day:'numeric',month:'short'})} - {windowEnd.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
            </span>
          ) : (
            <span className="text-[9px] text-[#4A2C35]/40 mt-2 font-medium">Waiting with you</span>
          )}
        </div>
      </div>

      {/* OVI'S LATE CONSOLE — inside normal window */}
      {lateDays > 0 && currentDay <= longestCycle && (
        <div className="w-full max-w-sm bg-white border border-[#9CAF88]/30 p-4 rounded-2xl mb-6 shadow-[0_8px_24px_-8px_rgba(74,44,53,0.06)]">
          <p className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-1">
            Ovi is holding you
          </p>
          <p className="text-sm text-[#4A2C35] leading-relaxed">
            Day {currentDay}. Your normal is {average} to {longestCycle}. You are still inside your own normal. Breathe, I'm here.
          </p>
        </div>
      )}

      {/* OVI'S LATE CONSOLE — past longest (1-4 days) */}
      {lateDays > 0 && currentDay > longestCycle && currentDay <= longestCycle + 4 && (
        <div className="w-full max-w-sm bg-white border border-[#FF8FA3]/30 p-4 rounded-2xl mb-6 shadow-sm animate-fade-in">
          <p className="text-[10px] font-bold text-[#8A2C3E] uppercase tracking-widest mb-1">
            Ovi is holding you
          </p>
          <p className="text-sm text-[#4A2C35] leading-relaxed mb-4">
            Day {currentDay}. Okay, now you are {currentDay - longestCycle} {currentDay - longestCycle === 1 ? 'day' : 'days'} past your longest. I am holding you. Have you been stressed? Not sleeping well? Let us wait together 2 more days.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                logEvent('late_console_action', { action: 'stressed' });
                router.push('/today?trigger=calm');
              }}
              className="w-full bg-[#FFF0F3] text-[#4A2C35] border border-[#4A2C35]/10 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all text-left px-4"
            >
              I am stressed 🤍 Let's close Calm
            </button>
            <button
              onClick={() => {
                logEvent('late_console_action', { action: 'sleep' });
                router.push('/today?trigger=sleep');
              }}
              className="w-full bg-[#FFF0F3] text-[#4A2C35] border border-[#4A2C35]/10 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all text-left px-4"
            >
              I am not sleeping 😴 Let's close Sleep
            </button>
          </div>
        </div>
      )}

      {/* OVI'S LATE CONSOLE — deep late (5+ days past longest) */}
      {currentDay > longestCycle + 4 && (
        <div className="w-full max-w-sm bg-white border border-[#8A2C3E]/20 p-4 rounded-2xl mb-6 shadow-sm">
          <p className="text-[10px] font-bold text-[#8A2C3E] uppercase tracking-widest mb-1">
            Ovi noticed
          </p>
          <p className="text-sm text-[#4A2C35] leading-relaxed mb-3">
            Day {currentDay}. You are {currentDay - longestCycle} days past your longest. If you want, let us check what could be pushing it.
          </p>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => router.push('/today?trigger=calm')} 
              className="w-full bg-[#FFF0F3] text-[#4A2C35] border border-[#4A2C35]/10 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all text-left px-4"
            >
              I am stressed 🤍 Let's close Calm
            </button>
            <button 
              onClick={() => router.push('/today?trigger=sleep')} 
              className="w-full bg-[#FFF0F3] text-[#4A2C35] border border-[#4A2C35]/10 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all text-left px-4"
            >
              I am not sleeping 😴 Let's close Sleep
            </button>
            <button 
              onClick={() => router.push('/today?trigger=food')} 
              className="w-full bg-[#FFF0F3] text-[#4A2C35] border border-[#4A2C35]/10 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all text-left px-4"
            >
              I am not eating well 🍲 Let's close Food
            </button>
            <a 
              href="https://wa.me/2348000000000?text=Hi%20Ovi,%20I%20am%20late%20and%20I%20need%20to%20talk" 
              target="_blank" 
              className="w-full bg-[#4A2C35] text-white py-3 rounded-xl font-bold text-xs text-center active:scale-95"
            >
              Let us talk about a test 💬
            </a>
          </div>
        </div>
      )}

      {/* Period start button — moved up so she can find it when late */}
      <button onClick={() => setShowConfirm(true)} className="w-full max-w-sm bg-[#4A2C35] text-white py-3.5 rounded-full text-sm font-bold shadow-[0_8px_20px_-4px_rgba(74,44,53,0.25)] active:scale-95 transition-transform mb-6 mt-2">
        My period started today 🌸
      </button>
      
      {/* Feelings tags */}
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

      {/* 5 Girls Card */}
      <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 rounded-3xl p-5 shadow-[0_16px_32px_-12px_rgba(74,44,53,0.1)] mb-4">
        <div className="mb-3">
          <h2 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-widest">5 Girls in 1 Body</h2>
          <p className="text-[10px] text-[#4A2C35]/50 mt-0.5">Tap a girl to see what she means.</p>
        </div>

        <div className="flex flex-col gap-1">
          {[
            { id: 'rest', label: '🌙 Rest Girl', pct: 'First 15%', short: 'Tired' },
            { id: 'fresh', label: '🌱 Fresh Girl', pct: '15% - 35%', short: 'Energy back' },
            { id: 'fine', label: '✨ Fine Girl', pct: '35% - 60%', short: 'Glowing' },
            { id: 'chop', label: '🍚 Chop Girl', pct: '60% - 80%', short: 'Hungry' },
            { id: 'ready', label: '💜 Ready Girl', pct: 'Last 20%', short: 'Waiting' },
          ].map(g => {
            const active = girl.id === g.id;
            return (
              <button
                key={g.id}
                onClick={() => { setSelectedGirl(g.id); logEvent('girl_explainer_opened', { girl: g.id }); }}
                className={`flex flex-col text-left p-2 rounded-xl transition-all active:scale-[0.98] ${active ? 'bg-[#FFF0F3] shadow-sm' : ''}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-sm ${active ? 'font-bold text-[#4A2C35]' : 'text-[#4A2C35]/80'}`}>{g.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#4A2C35]/40">{g.pct}</span>
                    <span className="text-[#4A2C35]/30 text-lg leading-none">›</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#4A2C35]/50 ml-6">
                  {active ? <span className="text-[#FF8FA3] font-bold">{g.short}. You are here 💜</span> : g.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* History button */}
      <button onClick={() => setShowHistory(true)} className="w-full max-w-sm bg-white border border-[#4A2C35]/5 rounded-2xl p-4 flex justify-between items-center shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08)] active:scale-[0.98] transition-transform">
        <span className="text-sm font-bold text-[#4A2C35]/80">My History — Show to Doctor ({history.length})</span>
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

      {/* UNDO RESET MODAL */}
      {showUndo && (
        <div className="fixed inset-0 bg-[#4A2C35]/20 backdrop-blur-sm z-100 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white border border-[#4A2C35]/5 rounded-3xl p-6 w-full max-w-sm shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] text-center">
            <div className="w-16 h-16 rounded-full bg-[#9CAF88]/15 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌱</span>
            </div>
            <h3 className="text-xl font-bold text-[#4A2C35] mb-2">Cycle reset to Day 1.</h3>
            <p className="text-sm text-[#4A2C35]/60 mb-6 leading-relaxed">
              Your previous cycle has been saved to history. Was this a mistake?
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => setShowUndo(false)} className="w-full py-3 rounded-full bg-[#9CAF88] text-white font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(156,175,136,0.3)]">
                No, that's correct
              </button>
              <button onClick={handleUndoReset} className="w-full py-3 rounded-full border border-[#4A2C35]/15 text-[#4A2C35]/60 font-medium active:scale-95">
                Undo — that was a mistake
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistory && (
        <div className="fixed inset-0 bg-[#4A2C35]/20 backdrop-blur-sm z-100 flex items-center justify-center p-6 animate-fade-in" onClick={() => setShowHistory(false)}>
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] animate-slide-up max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-lg font-bold text-[#4A2C35]">My Cycle History</h2>
              <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#4A2C35]/60 font-bold active:scale-95">✕</button>
            </div>

            <div className="overflow-y-auto pr-2">
              {history.length === 0 ? (
                <p className="text-sm text-[#4A2C35]/40 text-center py-6">No history yet. Your first cycle is being tracked now.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {history.slice().sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map((date, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-[#4A2C35]/5 pb-3 last:border-0 last:pb-0">
                      <span className="text-sm text-[#4A2C35]/80 font-medium">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="text-[10px] bg-[#FFF0F3] text-[#FF8FA3] px-2 py-1 rounded-full font-bold">Logged</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[10px] text-[#4A2C35]/40 mt-6 text-center shrink-0">Saved on your device. Show your doctor if you need clarity.</p>
          </div>
        </div>
      )}

      {/* SHARE PREVIEW MODAL */}
      {sharePreview && (
        <div className="fixed inset-0 bg-[#4A2C35]/40 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSharePreview(null)}>
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-[#4A2C35]">Your share card</h3>
              <button onClick={() => setSharePreview(null)} className="w-8 h-8 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#4A2C35]/60 font-bold active:scale-95">✕</button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sharePreview.url}
              alt="Your share card"
              className="w-full rounded-2xl border border-[#4A2C35]/10 mb-3 select-none"
              draggable={false}
            />
            <p className="text-[11px] text-[#4A2C35]/60 text-center mb-3 leading-relaxed">
              Long-press the image above to save it. The caption is already copied to your clipboard.
            </p>
            <button
              onClick={() => setSharePreview(null)}
              className="w-full bg-[#4A2C35] text-white py-3 rounded-full font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(74,44,53,0.2)]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 5 GIRLS EXPLAINER MODAL */}
      {selectedGirl && (() => {
        const data = girlData[selectedGirl];
        return (
          <div className="fixed inset-0 bg-[#4A2C35]/20 backdrop-blur-sm z-100 flex items-end justify-center sm:items-center p-4 animate-fade-in" onClick={() => setSelectedGirl(null)}>
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 pb-28 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] animate-slide-up max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                  <p className="text-sm text-[#4A2C35] leading-relaxed whitespace-pre-line">{data.circles}</p>
                </div>
              </div>

              <p className="text-[10px] text-[#4A2C35]/40 text-center mb-4 leading-relaxed">35 days is not 1 mood. It's 5 girls. This is your pattern, not everybody's. Not medical. Just your pattern.</p>

              <button
                onClick={handleShareGirl}
                disabled={shareBusy}
                className="w-full bg-[#9CAF88] text-white py-3 rounded-full font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(156,175,136,0.3)] mb-2 disabled:opacity-60"
              >
                {shareBusy ? 'Preparing…' : 'Share this Girl →'}
              </button>
              <button onClick={() => setSelectedGirl(null)} className="w-full bg-[#4A2C35] text-white py-3 rounded-full font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(74,44,53,0.2)]">Got it, Ovi</button>
            </div>
          </div>
        );
      })()}

    </main>
  );
}