'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { localDateKey } from '../../utils/analytics';

export default function MyWins() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [last7Days, setLast7Days] = useState<any[]>([]);
  const [totalChecks, setTotalChecks] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalDaysTracked, setTotalDaysTracked] = useState(0);
  const [totalPeriods, setTotalPeriods] = useState(0);
  const [oviInsight, setOviInsight] = useState("I am watching for your patterns, fine girl.");
  const [biggestWin, setBiggestWin] = useState<string | null>(null);
  const [periodHistory, setPeriodHistory] = useState<any[]>([]);

  const loadData = () => {
    const dailyHistory = JSON.parse(localStorage.getItem('lateCircleDailyHistory') || '{}');
    
    // 1. Build the 7-day array
    const days: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = localDateKey(d);
      const data = dailyHistory[dateStr];
      const checkedIn = data && data.count > 0;
      days.push({ 
        dateStr, 
        dayInitial: d.toLocaleDateString('en-GB', { weekday: 'narrow' }), 
        checkedIn,
        fullDate: d.toLocaleDateString('en-GB', { weekday: 'long' })
      });
    }
    setLast7Days(days);

    // 2. Total checks this week
    const total = days.filter(d => d.checkedIn).length;
    setTotalChecks(total);

    // 3. Total days ever tracked (for "Your Journey So Far")
    let totalDays = 0;
    Object.keys(dailyHistory).forEach(key => {
      if (dailyHistory[key] && dailyHistory[key].count > 0) totalDays++;
    });
    setTotalDaysTracked(totalDays);

    // 4. Streak
    let currentStreak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(); 
      d.setDate(d.getDate() - i);
      const key = localDateKey(d);
      const data = dailyHistory[key];
      const done = data && data.count > 0;
      if (done) currentStreak++;
      else if (i === 0) continue;
      else break;
    }
    setStreak(currentStreak);

    // 5. Ovi Noticed
    const todayDone = days[6].checkedIn;
    const yesterdayDone = days[5].checkedIn;
    
    let insight = "";
    if (total === 0) {
      insight = "No check-in yet this week. Today is a good day to start. No wahala.";
    } else if (todayDone && !yesterdayDone && days.slice(0, 5).some(d => d.checkedIn)) {
      insight = "You missed yesterday and you still came back today. That one is the hard part, my girl. Well done.";
    } else if (currentStreak >= 3) {
      insight = `${currentStreak} days in a row. You are doing it steady. I see you.`;
    } else {
      insight = `${total} of 7 days this week. Every one counts.`;
    }
    setOviInsight(insight);

    // 6. Biggest Win
    if (todayDone && !yesterdayDone && days.slice(0, 5).some(d => d.checkedIn)) {
      setBiggestWin("You missed yesterday and you still came back. That is the real win, fine girl.");
    } else {
      setBiggestWin(null);
    }

    // 7. Period History
    const savedHistory: string[] = JSON.parse(localStorage.getItem('lateCircleHistory') || '[]');
    const currentPeriod = localStorage.getItem('lateCircleLastPeriod');
    const allDates = Array.from(new Set([
      ...savedHistory, 
      ...(currentPeriod ? [currentPeriod] : [])
    ].filter(Boolean).map(d => localDateKey(new Date(d))))).sort();

    const rows = allDates.map((k, i) => ({
      date: k,
      length: i < allDates.length - 1
        ? Math.round((new Date(allDates[i + 1] + 'T00:00:00').getTime() - new Date(k + 'T00:00:00').getTime()) / 86400000)
        : null,
    })).reverse();
    
    setPeriodHistory(rows);
    setTotalPeriods(rows.length);

    setIsLoaded(true);
  };

  useEffect(() => {
    loadData();
    const onFocus = () => loadData();
    window.addEventListener('focus', onFocus);
    const onVisibility = () => {
      if (!document.hidden) loadData();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-12 px-6 font-sans relative pb-32 animate-page-enter">
      
      <button 
        onClick={() => router.push('/today')} 
        className="absolute top-6 left-6 text-[#4A2C35]/50 text-sm font-medium active:opacity-50"
      >
        ← Today
      </button>

      <div className="flex flex-col items-center w-full relative mb-6">
        <h1 className="text-2xl font-serif text-[#4A2C35] mb-1 tracking-widest">MY WINS</h1>
        <p className="text-[#4A2C35]/50 text-xs font-medium">Your little story with Ovi</p>
      </div>

      <div className="w-full max-w-sm bg-[#9CAF88]/10 border border-[#9CAF88]/20 rounded-2xl p-4 mb-6">
        <p className="text-sm text-[#4A2C35] font-medium leading-relaxed">
          {totalChecks > 0 
            ? "🌱 Fine girl, you are doing well. I am seeing your pattern as you go." 
            : "🌱 Start today. Even one check-in is a win."}
        </p>
      </div>

      {/* YOUR JOURNEY SO FAR */}
      <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-3">Your Journey So Far</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-2xl font-bold text-[#4A2C35]">{totalDaysTracked}</p>
            <p className="text-[10px] text-[#4A2C35]/50">days checked in</p>
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-[#4A2C35]">{totalPeriods}</p>
            <p className="text-[10px] text-[#4A2C35]/50">periods recorded</p>
          </div>
        </div>
        <p className="text-[11px] text-[#4A2C35]/60 mt-3 leading-relaxed">
          You have been keeping your records. One day at a time, your pattern is becoming clear.
        </p>
      </div>

      {/* STREAK CARD */}
      <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 rounded-2xl p-4 shadow-sm mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-wider mb-1">Current Streak</h3>
          <p className="text-2xl font-bold text-[#FF8FA3]">{streak} <span className="text-sm text-[#4A2C35]/40 font-medium">days</span></p>
          <p className="text-[10px] text-[#4A2C35]/50">
            {last7Days.filter(d => d.checkedIn).map(d => d.dateStr.split('-').slice(1).join('/')).join(', ')}
          </p>
        </div>
        <span className="text-3xl">🔥</span>
      </div>

      {/* SHARE MY STREAK (Only if streak >= 2) */}
      {streak >= 2 && (
        <div className="w-full max-w-sm bg-[#FFF0F3] border border-[#FF8FA3]/30 rounded-2xl p-4 mb-4 animate-fade-in flex flex-col items-center">
          <p className="text-sm font-bold text-[#8A2C3E] mb-1">🔥 {streak} days in a row</p>
          <p className="text-xs text-[#4A2C35]/60 mb-3">Your body is getting used to you checking in.</p>
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(`I have checked in ${streak} days in a row with Ovi. We move. 💜 - Late Circle`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#4A2C35] text-white py-2.5 rounded-xl font-bold text-xs text-center block active:scale-95 transition-transform"
          >
            Share My Streak →
          </a>
        </div>
      )}

      {/* 7 DAY CHART */}
      <div className="w-full max-w-sm bg-white p-6 rounded-3xl border border-[#4A2C35]/5 mb-4 shadow-sm">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest">Your last 7 days</h2>
          <span className="text-xs font-bold text-[#9CAF88] bg-[#9CAF88]/10 px-2.5 py-1 rounded-full">{totalChecks} / 7</span>
        </div>
        
        <div className="flex justify-between items-end h-20 mb-2">
          {last7Days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                d.checkedIn
                  ? 'bg-[#9CAF88] border-[#9CAF88] shadow-[0_0_10px_rgba(156,175,136,0.3)]' 
                  : 'border-dashed border-[#4A2C35]/20 bg-[#FFF0F3]'
              }`}>
                {d.checkedIn && <span className="text-sm font-bold text-white">✓</span>}
              </div>
              <span className="text-[10px] text-[#4A2C35]/40 font-medium">{d.dayInitial}</span>
            </div>
          ))}
        </div>
      </div>

      {/* OVI NOTICED */}
      <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 p-5 rounded-2xl shadow-sm mb-4">
        <h3 className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-wider mb-2">🤔 Ovi Noticed</h3>
        <p className="text-[13px] text-[#4A2C35] leading-relaxed">{oviInsight}</p>
      </div>

      {/* BIGGEST WIN (Only if comeback) */}
      {biggestWin && (
        <div className="w-full max-w-sm bg-[#9CAF88]/10 border border-[#9CAF88]/20 p-5 rounded-2xl mb-4">
          <h3 className="text-[11px] font-bold text-[#9CAF88] uppercase tracking-wider mb-2">🏆 Biggest Win</h3>
          <p className="text-[13px] text-[#4A2C35] leading-relaxed">{biggestWin}</p>
        </div>
      )}

      {/* PERIOD HISTORY */}
      <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 rounded-3xl p-6 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest">📅 Period History</h2>
        </div>
        {periodHistory.length === 0 ? (
          <p className="text-xs text-[#4A2C35]/40 text-center py-4">No history yet. When your period comes, log it here and I will start learning your pattern.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {periodHistory.map((r, index) => (
              <div key={index} className="flex justify-between items-center border-b border-[#4A2C35]/5 pb-2 last:border-0 last:pb-0">
                <span className="text-sm text-[#4A2C35]/80 font-medium">
                  {new Date(r.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-[10px] bg-[#FFF0F3] text-[#FF8FA3] px-2 py-0.5 rounded-full font-bold">
                  {r.length ? `${r.length} days` : 'Current'}
                </span>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => router.push('/care/you-place')} className="w-full mt-4 bg-[#4A2C35] text-white py-2.5 rounded-xl font-bold text-xs active:scale-95 transition-transform">
          See My Health Summary →
        </button>
      </div>

    </main>
  );
}