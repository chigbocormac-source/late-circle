'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';
import { getCyclePhase, PhaseId, getRealCycleLength } from '../../utils/cycleEngine';
import { logEvent } from '../../utils/analytics';
import { generateShareCard, getCaption, blobToDataURL } from '../../utils/shareCard';

export default function CyclePage() {
  const router = useRouter();
  const [lastPeriodDate, setLastPeriodDate] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedGirl, setSelectedGirl] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [previousPeriodDate, setPreviousPeriodDate] = useState<string | null>(null);

  const [sharePreview, setSharePreview] = useState<{ url: string; caption: string } | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [today, setToday] = useState<Date | null>(null);

  const [calMonth, setCalMonth] = useState<Date | null>(null);

  const [loggedTags, setLoggedTags] = useState<string[]>([]);
  const [lastBleedDays, setLastBleedDays] = useState<number | null>(null);
  
  const [showLateWarning, setShowLateWarning] = useState(true);

  useEffect(() => {
    const savedDate = localStorage.getItem('lateCircleLastPeriod');
    if (savedDate) setLastPeriodDate(savedDate);
    const savedHistory = localStorage.getItem('lateCircleHistory');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    setToday(new Date());
    const d = new Date(); d.setDate(1); setCalMonth(d);

    const savedTags = localStorage.getItem('lateCircleTags');
    if (savedTags) setLoggedTags(JSON.parse(savedTags));

    const savedBleed = localStorage.getItem('lateCircleLastBleedDays');
    if (savedBleed) setLastBleedDays(parseInt(savedBleed));

    // Check if she already acknowledged the warning today
    const acknowledged = localStorage.getItem('lateCircleAcknowledgedLateWarning');
    if (acknowledged === new Date().toISOString().split('T')[0]) {
      setShowLateWarning(false);
    }

    setIsLoaded(true);
  }, []);

  let currentDay = 1;
  let average = 35;
  let longestCycle = 42;
  let lateDays = 0;
  let windowStart = new Date(2000, 0, 1);
  let windowEnd = new Date(2000, 0, 1);
  let daysUntilNext = 0;

  average = getRealCycleLength(
    lastPeriodDate || null,
    typeof window !== 'undefined' ? localStorage.getItem('lateCirclePrevPeriod') : null,
    typeof window !== 'undefined' ? localStorage.getItem('lateCircleType') : null
  );
  longestCycle = average + 7;

  const cycleLengths: number[] = [];
  if (history.length >= 2 && lastPeriodDate) {
    const allDates = [...history, lastPeriodDate].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    for (let i = 1; i < allDates.length; i++) {
      const d1 = new Date(allDates[i - 1]);
      const d2 = new Date(allDates[i]);
      const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 20 && diff < 60) cycleLengths.push(diff);
    }
    if (cycleLengths.length > 0) {
      const last3 = cycleLengths.slice(-3);
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
    
    daysUntilNext = Math.max(0, Math.floor((windowStart.getTime() - todayClone.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const girl = getCyclePhase(currentDay, average);

  const calendarDays = useMemo(() => {
    if (!calMonth) return [];
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [calMonth]);

  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const inWindow = (d: Date) => {
    const c = new Date(d); c.setHours(0, 0, 0, 0);
    const s = new Date(windowStart); s.setHours(0, 0, 0, 0);
    const e = new Date(windowEnd); e.setHours(0, 0, 0, 0);
    return c >= s && c <= e;
  };
  const isLastPeriod = (d: Date) => lastPeriodDate && isSameDay(d, new Date(lastPeriodDate));
  const isHistoryDay = (d: Date) => history.some(h => isSameDay(d, new Date(h)));

  // SMART CALENDAR COLOR LOGIC
  const getPhaseColor = (dateToCheck: Date) => {
    if (!lastPeriodDate) return 'bg-transparent text-[#4A2C35]/70';
    
    const last = new Date(lastPeriodDate);
    last.setHours(0,0,0,0);
    const check = new Date(dateToCheck);
    check.setHours(0,0,0,0);
    
    const diffDays = Math.floor((check.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    const simulatedDay = (diffDays % average) + 1; // Wrap around if looking into future months
    
    const phase = getCyclePhase(simulatedDay, average);
    
    switch (phase.id) {
      case 'rest': return 'bg-[#FFE5EC] text-[#8A2C3E]'; 
      case 'fresh': return 'bg-[#F0F5ED] text-[#5A7350]'; 
      case 'fine': return 'bg-[#FFF8E7] text-[#B58B22]'; 
      case 'chop': return 'bg-[#FFF0E6] text-[#C76B2B]'; 
      case 'ready': return 'bg-[#F3E8FF] text-[#7E57C2]'; 
      default: return 'bg-transparent text-[#4A2C35]/70';
    }
  };

  const handlePeriodStart = () => {
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    if (lastPeriodDate) {
      const newHistory = [...history, lastPeriodDate];
      setHistory(newHistory);
      localStorage.setItem('lateCircleHistory', JSON.stringify(newHistory));
      setPreviousPeriodDate(lastPeriodDate);
    }
    setLastPeriodDate(todayStr);
    localStorage.setItem('lateCircleLastPeriod', todayStr);
    setShowUndo(true);
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
          if (name === 'AbortError') { setShareBusy(false); return; }
        }
      }
      if (shared) logEvent('share_completed', { girl: phase, method: 'native' });
      else {
        try {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'late-circle.png';
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch {}
        try { await navigator.clipboard.writeText(caption); } catch {}
        const dataUrl = await blobToDataURL(blob);
        setSharePreview({ url: dataUrl, caption });
        logEvent('share_completed', { girl: phase, method: 'fallback' });
      }
    } catch (err) { console.error('share failed', err); }
    finally { setShareBusy(false); }
  };

  const whatsappMessage = lateDays > 0 
    ? `I am ${lateDays} day${lateDays > 1 ? 's' : ''} late and a bit worried. Can we talk?`
    : `My period is expected around ${windowStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}. I am on Day ${currentDay}.`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const cyclePercent = (currentDay / average) * 100;
  const ringRadius = 85;
  const circleCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circleCircumference - (Math.min(cyclePercent, 100) / 100) * circleCircumference;

  if (!isLoaded) return null;

  const showStartButton = lateDays > 0 || currentDay >= average - 3 || currentDay <= 1;

  const girlData: Record<string, any> = {
    rest: { 
      title: "🌙 Rest Girl", 
      days: "First 15% of your cycle", 
      why: "Your body is bleeding. It takes energy. That is why you feel tired.", 
      feel: "Cramps, low energy, wanting hot water.", 
      want: "Soft rice, small Indomie, hot tea, sleep.", 
      circles: "Your One Focus: Sleep. Your body is rebuilding. Leave the rest for later." 
    },
    fresh: { 
      title: "🌱 Fresh Girl", 
      days: "15% to 35% of your cycle", 
      why: "Bleeding has stopped. Your energy is coming back.", 
      feel: "Energy returning, less tired, wanting to talk.", 
      want: "Normal appetite, to go out small.", 
      circles: "Your One Focus: Walk. Your energy is coming back. Just move a little." 
    },
    fine: { 
      title: "✨ Fine Girl", 
      days: "35% to 60% of your cycle", 
      why: "Your body is getting ready to release an egg. This is your peak. Your energy, your skin, and your confidence are at their highest.", 
      feel: "Glowing skin, high energy, feeling social and beautiful.", 
      want: "To go out, see friends, wear something nice, and eat good food that keeps the glow.", 
      circles: "Your One Focus: Food. Give your body good fuel to keep this glow." 
    },
    chop: { 
      title: "🍚 Chop Girl", 
      days: "60% to 80% of your cycle", 
      why: "Progesterone is rising. Your body is slowing down and preparing for your period. This is why you feel hungry and crave carbs.", 
      feel: "Slower, bloated, craving sweet or starchy food.", 
      want: "Indomie, eba, sweet things, and warmth.", 
      circles: "Your One Focus: Food. Warm food to ground your body and calm the cravings." 
    },
    ready: { 
      title: "💜 Ready Girl", 
      days: "80% to 100% of your cycle", 
      why: "Your period is close. Your body is waiting.", 
      feel: "Tired, moody, bloated, tender breasts.", 
      want: "To stay inside, sleep, ice cream, sweet names.", 
      circles: "Your One Focus: Calm. Breathe. You are safe. The waiting is almost over." 
    }
  };

  const hasLoggedSymptoms = loggedTags.length > 0;
  const topTag = loggedTags[0] || null;

  // Helper to dismiss the warning for today
  const dismissWarning = () => {
    const todayKey = new Date().toISOString().split('T')[0];
    localStorage.setItem('lateCircleAcknowledgedLateWarning', todayKey);
    setShowLateWarning(false);
  };

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-8 px-6 pb-32 font-sans relative animate-page-enter">
      <button onClick={() => router.push('/today')} className="absolute top-6 left-6 text-[#4A2C35]/50 text-sm font-medium active:opacity-50">← Today</button>
      <h1 className="text-2xl font-serif text-[#4A2C35] mb-3 tracking-[0.2em]">YOUR CYCLE</h1>

      <div className="flex flex-col items-center mb-2 w-full max-w-sm">
        <div className="bg-[#9CAF88]/15 border border-[#9CAF88]/20 px-4 py-1.5 rounded-full text-center">
          <p className="text-[#5A7350] text-xs font-bold">💜 Day {currentDay}</p>
        </div>
      </div>

      <button
        onClick={() => {
          const d = new Date();
          d.setDate(1);
          setCalMonth(d);
        }}
        className="relative mb-4 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
        style={{ width: '200px', height: '200px' }}
      >
        <svg className="absolute inset-0 transform -rotate-90" width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={ringRadius} fill="transparent" stroke="rgba(74, 44, 53, 0.08)" strokeWidth="10" />
          <circle cx="100" cy="100" r={ringRadius} fill="transparent" stroke={girl.color} strokeWidth="10" strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
          <div className="flex items-baseline justify-center gap-1 leading-none">
            <span className="text-5xl font-bold tracking-tighter text-[#4A2C35]">{currentDay}</span>
            <span className="text-xl text-[#4A2C35]/30 font-medium">/ {average}</span>
          </div>
          <span className="text-[10px] text-[#4A2C35]/50 mt-1 font-bold tracking-widest uppercase">{girl.name}</span>
          {lateDays <= 0 ? (
            <span className="text-[9px] text-[#4A2C35]/40 mt-2 font-medium">
              Next: {windowStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {windowEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          ) : (
            <span className="text-[9px] text-[#4A2C35]/40 mt-2 font-medium">Waiting with you</span>
          )}
        </div>
      </button>

      {/* WARNING CARDS - DISMISSIBLE */}
      {lateDays > 0 && showLateWarning && (
        <div className="w-full max-w-sm bg-white border border-[#FF8FA3]/30 p-4 rounded-2xl mb-4 shadow-sm animate-fade-in">
          <p className="text-[10px] font-bold text-[#8A2C3E] uppercase tracking-widest mb-1">Your cycle is taking longer this month</p>
          <p className="text-sm text-[#4A2C35] leading-relaxed mb-3">
            My girl, I see you. Your last three cycles were <strong>{cycleLengths.slice(-3).join(', ')} days</strong>. This one is now <strong>{currentDay} days</strong>. That is <strong>{lateDays} days longer</strong> than your recent pattern.
          </p>
          <p className="text-sm text-[#4A2C35] leading-relaxed mb-3">
            This is not a diagnosis. We don't know the reason from the dates alone. Stress, travel, illness, changes in weight, hormonal conditions, medication and pregnancy can all be relevant.
          </p>
          <p className="text-sm text-[#4A2C35] leading-relaxed mb-3">
            Let's look at your records together, without jumping to conclusions.
          </p>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full bg-[#4A2C35] text-white py-2.5 rounded-xl font-bold text-xs text-center block mb-2">Tell someone I trust 💬</a>
          <button onClick={dismissWarning} className="w-full bg-[#FFF0F3] text-[#4A2C35]/60 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform">
            I hear you, Ovi 🤍
          </button>
        </div>
      )}

      {lateDays >= 30 && showLateWarning && (
        <div className="w-full max-w-sm bg-white border border-[#8A2C3E]/20 p-4 rounded-2xl mb-4 shadow-sm animate-fade-in">
          <p className="text-[10px] font-bold text-[#8A2C3E] uppercase tracking-widest mb-1">A little care reminder</p>
          <p className="text-sm text-[#4A2C35] leading-relaxed mb-3">
            If you want peace of mind, a quick check-up can help. No pressure. You can also wait a few more days and see. Ovi is here to keep your records clear. A nurse or doctor can give you real answers when you are ready.
          </p>
          <button onClick={dismissWarning} className="w-full bg-[#FFF0F3] text-[#4A2C35]/60 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform">
            I hear you, Ovi 🤍
          </button>
        </div>
      )}

      {lateDays >= 60 && showLateWarning && (
        <div className="w-full max-w-sm bg-[#FFE5EC] border border-[#8A2C3E]/40 p-4 rounded-2xl mb-4 shadow-sm animate-fade-in">
          <p className="text-[10px] font-bold text-[#8A2C3E] uppercase tracking-widest mb-1">Please see a doctor</p>
          <p className="text-sm text-[#4A2C35] leading-relaxed mb-3">
            It has been <strong>{lateDays} days</strong>. This is a long time. A doctor can check your hormones and give you real answers. You deserve peace of mind. Please book a visit soon.
          </p>
          <button onClick={dismissWarning} className="w-full bg-[#FFF0F3] text-[#4A2C35]/60 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform">
            I hear you, Ovi 🤍
          </button>
        </div>
      )}

      {daysUntilNext <= 3 && daysUntilNext > 0 && lateDays <= 0 && (
        <div className="w-full max-w-sm bg-white border border-[#FF8FA3]/30 p-4 rounded-2xl mb-4 shadow-sm animate-fade-in">
          <p className="text-[10px] font-bold text-[#8A2C3E] uppercase tracking-widest mb-1">Period coming soon</p>
          <p className="text-sm text-[#4A2C35] leading-relaxed mb-3">Your period is expected in {daysUntilNext} {daysUntilNext === 1 ? 'day' : 'days'}. Pack a pad in your bag today.</p>
        </div>
      )}

      {/* REST OF THE PAGE */}
      {cycleLengths.length >= 2 && (() => {
        const recent3 = cycleLengths.slice(-3);
        const min = Math.min(...recent3);
        const max = Math.max(...recent3);
        const variance = max - min;
        
        let summary = "";
        let badgeColor = "text-[#9CAF88]";
        
        if (variance <= 3) {
          summary = `Your last 3 cycles were ${recent3.join(', ')} days. Ovi is learning your pattern.`;
        } else if (variance <= 7) {
          summary = `Your cycle shifts a little. Your last 3 cycles were ${recent3.join(', ')} days. This is common with stress or travel.`;
          badgeColor = "text-[#FF8FA3]";
        } else {
          summary = `Your cycle changes a lot. Your last 3 cycles were ${recent3.join(', ')} days. This is worth mentioning to a nurse when you see one.`;
          badgeColor = "text-[#8A2C3E]";
        }

        return (
          <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 rounded-2xl p-4 mb-4 shadow-sm">
            <p className={`text-[10px] font-bold ${badgeColor} uppercase tracking-widest mb-1`}>Your Cycle Summary</p>
            <p className="text-sm text-[#4A2C35] leading-relaxed">{summary}</p>
          </div>
        );
      })()}

      {calMonth && (
        <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 rounded-3xl p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <button onClick={() => setCalMonth(prev => prev ? new Date(prev.getFullYear(), prev.getMonth() - 1, 1) : null)} className="w-8 h-8 rounded-full bg-[#FFF0F3] font-bold">‹</button>
            <p className="font-bold text-xs">{calMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
            <button onClick={() => setCalMonth(prev => prev ? new Date(prev.getFullYear(), prev.getMonth() + 1, 1) : null)} className="w-8 h-8 rounded-full bg-[#FFF0F3] font-bold">›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#4A2C35]/40 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
            {calendarDays.map((d, i) => {
              if (!d) return <div key={i} />;
              
              const todayIs = isSameDay(d, new Date());
              const inWin = inWindow(d);
              const lastP = isLastPeriod(d);
              const hist = isHistoryDay(d);
              const phaseColorClass = getPhaseColor(d);

              return (
                <div key={i} className={`py-2 rounded-xl font-medium relative transition-colors ${
                  todayIs ? 'bg-[#4A2C35] text-white font-bold shadow-md' 
                  : inWin ? 'bg-[#FF8FA3] text-white font-bold' 
                  : lastP || hist ? 'bg-[#8A2C3E] text-white font-bold' 
                  : phaseColorClass
                }`}>
                  {d.getDate()}
                  {(lastP || hist) && !inWin && !todayIs && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-70" />}
                </div>
              );
            })}
          </div>
          
          {/* MINI LEGEND */}
          <div className="flex flex-wrap justify-center gap-2 mt-4 pt-3 border-t border-[#4A2C35]/5 text-[9px] font-bold text-[#4A2C35]/50 uppercase tracking-wider">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FFE5EC] border border-[#FF8FA3]"></span> Rest</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F0F5ED] border border-[#9CAF88]"></span> Fresh</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FFF8E7] border border-[#D4AF37]"></span> Fine</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FFF0E6] border border-[#FF8FA3]"></span> Chop</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F3E8FF] border border-[#8A2C3E]"></span> Ready</span>
          </div>

          <p className="text-[9px] text-[#4A2C35]/50 mt-3 text-center">
            Expected: {windowStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {windowEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      )}

      <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 rounded-2xl p-5 mb-4 shadow-sm animate-fade-in">
        <p className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-3">
          Your Month in One Look — {today ? today.toLocaleDateString('en-GB', { month: 'long' }) : ''}
        </p>
        
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-2">
            <span className="text-[#9CAF88] text-xs font-bold mt-0.5">•</span>
            <p className="text-xs text-[#4A2C35]/80">
              Your recent pattern: <strong>{average} days</strong> — {longestCycle - average <= 3 ? 'Consistent for you' : 'Shifts a little'}
            </p>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-[#9CAF88] text-xs font-bold mt-0.5">•</span>
            <p className="text-xs text-[#4A2C35]/80">
              You bled for: <strong>{lastBleedDays !== null ? `${lastBleedDays} days` : 'Not recorded yet'}</strong>
            </p>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-[#9CAF88] text-xs font-bold mt-0.5">•</span>
            <p className="text-xs text-[#4A2C35]/80">
              Most logged: <strong>{hasLoggedSymptoms && topTag ? topTag : 'No symptoms recorded'}</strong>
            </p>
          </div>

          <div className="bg-[#FFF0F3] rounded-xl p-3 mt-1 border border-[#FFB3C1]/20">
            <p className="text-[10px] font-bold text-[#8A2C3E] uppercase tracking-widest mb-1">Ovi's Note</p>
            <p className="text-xs text-[#4A2C35] leading-relaxed italic">
              {lateDays > 0 
                ? `My girl, your last three recorded cycles were ${cycleLengths.slice(-3).join(', ')} days. This cycle is taking longer. I can't tell you why from the dates alone, but we can keep your story updated and take things one step at a time.`
                : (hasLoggedSymptoms && topTag 
                  ? `You logged ${topTag} recently. Keep telling me what you feel, and I will learn your pattern.`
                  : "I am still learning your pattern. Log your symptoms today, and I will start noticing what is normal for you.")}
            </p>
          </div>
        </div>
      </div>

      {showStartButton ? (
        <button onClick={() => setShowConfirm(true)} className="w-full max-w-sm bg-[#4A2C35] text-white py-3.5 rounded-full text-sm font-bold shadow-[0_8px_20px_-4px_rgba(74,44,53,0.25)] active:scale-95 transition-transform mb-4">My period started today 🌸</button>
      ) : (
        <button onClick={() => setShowConfirm(true)} className="w-full max-w-sm bg-white border border-[#4A2C35]/15 text-[#4A2C35]/60 py-3 rounded-full text-xs font-bold shadow-sm active:scale-95 transition-transform mb-4 flex items-center justify-center gap-2">
          <span className="text-lg">🌸</span> Period started early? Log it
        </button>
      )}

      <button onClick={() => { setSelectedGirl(girl.id); logEvent('girl_explainer_opened', { girl: girl.id }); }} className="w-full max-w-sm bg-white border border-[#4A2C35]/5 rounded-2xl p-4 flex justify-between items-center shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08)] active:scale-[0.98] transition-transform mb-3">
        <div className="flex items-center gap-3"><span className="text-xl">{girl.emoji}</span><div className="text-left"><h3 className="text-sm font-bold text-[#4A2C35]">Understand Your 5 Girls</h3><p className="text-[10px] text-[#4A2C35]/50">Why you feel different every week.</p></div></div>
        <span className="text-[#4A2C35]/30 text-lg">›</span>
      </button>

      <button onClick={() => router.push('/care/you-place')} className="w-full max-w-sm bg-white border border-[#4A2C35]/5 rounded-2xl p-4 flex justify-between items-center shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08)] active:scale-[0.98] transition-transform mb-4">
        <div className="flex items-center gap-3"><span className="text-xl">📋</span><div className="text-left"><h3 className="text-sm font-bold text-[#4A2C35]">Prepare My Health Summary</h3><p className="text-[10px] text-[#4A2C35]/50">Keep your health information together for a doctor.</p></div></div>
        <span className="text-[#4A2C35]/30 text-lg">›</span>
      </button>

      {/* MODALS */}
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

      {showUndo && (
        <div className="fixed inset-0 bg-[#4A2C35]/20 backdrop-blur-sm z-100 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white border border-[#4A2C35]/5 rounded-3xl p-6 w-full max-w-sm shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] text-center">
            <div className="w-16 h-16 rounded-full bg-[#9CAF88]/15 flex items-center justify-center mx-auto mb-4"><span className="text-3xl">🌱</span></div>
            <h3 className="text-xl font-bold text-[#4A2C35] mb-2">Cycle reset to Day 1.</h3>
            <p className="text-sm text-[#4A2C35]/60 mb-6 leading-relaxed">Your previous cycle has been saved to history. Was this a mistake?</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => setShowUndo(false)} className="w-full py-3 rounded-full bg-[#9CAF88] text-white font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(156,175,136,0.3)]">No, that's correct</button>
              <button onClick={handleUndoReset} className="w-full py-3 rounded-full border border-[#4A2C35]/15 text-[#4A2C35]/60 font-medium active:scale-95">Undo — that was a mistake</button>
            </div>
          </div>
        </div>
      )}

      {sharePreview && (
        <div className="fixed inset-0 bg-[#4A2C35]/40 backdrop-blur-sm z-100 flex items-start justify-center p-4 pt-6 animate-fade-in overflow-y-auto" onClick={() => setSharePreview(null)}>
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-[#4A2C35]">Your share card</h3>
              <button onClick={() => setSharePreview(null)} className="w-8 h-8 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#4A2C35]/60 font-bold active:scale-95">✕</button>
            </div>
            <img src={sharePreview.url} alt="Your share card" className="w-full rounded-2xl border border-[#4A2C35]/10 mb-3 select-none" draggable={false} />
            <p className="text-[11px] text-[#4A2C35]/60 text-center mb-3 leading-relaxed">Long-press the image above to save it. The caption is already copied to your clipboard.</p>
            <button onClick={() => setSharePreview(null)} className="w-full bg-[#4A2C35] text-white py-3 rounded-full font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(74,44,53,0.2)]">Done</button>
          </div>
        </div>
      )}

      {selectedGirl && (() => {
        const data = girlData[selectedGirl];
        const order = ['rest', 'fresh', 'fine', 'chop', 'ready'];
        const emojis: Record<string, string> = { rest: '🌙', fresh: '🌱', fine: '✨', chop: '🍚', ready: '💜' };
        const labels: Record<string, string> = { rest: 'Rest', fresh: 'Fresh', fine: 'Fine', chop: 'Chop', ready: 'Ready' };
        return (
          <div className="fixed inset-0 bg-[#4A2C35]/20 backdrop-blur-sm z-100 flex items-start justify-center p-4 pt-6 pb-28 overflow-y-auto animate-fade-in" onClick={() => setSelectedGirl(null)}>
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] animate-slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#4A2C35]">Your 5 Girls</h2>
                <button onClick={() => setSelectedGirl(null)} className="w-8 h-8 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#4A2C35]/60 font-bold active:scale-95">✕</button>
              </div>

              <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                {order.map(id => (
                  <button
                    key={id}
                    onClick={() => setSelectedGirl(id)}
                    className={`shrink-0 px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1 border transition-all ${selectedGirl === id ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/70 border-[#4A2C35]/10'}`}
                  >
                    <span>{emojis[id]}</span> {labels[id]}
                    {girl.id === id && <span className="text-[8px] bg-[#FF8FA3] text-white px-1.5 py-0.5 rounded-full ml-0.5">YOU</span>}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-[#4A2C35]">{data.title}</h2>
              </div>
              <p className="text-xs text-[#4A2C35]/50 font-medium mb-6">{data.days}</p>
              <div className="flex flex-col gap-4 mb-6">
                <div className="bg-[#FFF0F3] rounded-xl p-3 border border-[#4A2C35]/5">
                  <h3 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-1">Why this is happening</h3>
                  <p className="text-sm text-[#4A2C35] leading-relaxed font-medium">{data.why}</p>
                </div>
                <div><h3 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-1">You will feel</h3><p className="text-sm text-[#4A2C35] leading-relaxed">{data.feel}</p></div>
                <div><h3 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-1">You will want</h3><p className="text-sm text-[#4A2C35] leading-relaxed">{data.want}</p></div>
                <div><h3 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-1">Your circles</h3><p className="text-sm text-[#4A2C35] leading-relaxed whitespace-pre-line">{data.circles}</p></div>
              </div>
              <p className="text-[10px] text-[#4A2C35]/40 text-center mb-4 leading-relaxed">35 days is not 1 mood. It's 5 girls. This is your pattern, not everybody's. Not medical. Just your pattern.</p>
              <button onClick={handleShareGirl} disabled={shareBusy} className="w-full bg-[#9CAF88] text-white py-3 rounded-full font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(156,175,136,0.3)] mb-2 disabled:opacity-60">{shareBusy ? 'Preparing…' : 'Share this Girl →'}</button>
              <button onClick={() => setSelectedGirl(null)} className="w-full bg-[#4A2C35] text-white py-3 rounded-full font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(74,44,53,0.2)]">Got it, Ovi</button>
            </div>
          </div>
        );
      })()}
    </main>
  );
}