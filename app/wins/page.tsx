'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { localDateKey } from '../../utils/analytics';

export default function MyWins() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [last7Days, setLast7Days] = useState<any[]>([]);
  const [totalGreens, setTotalGreens] = useState(0);
  const [biggestWin, setBiggestWin] = useState("Keep going. Your first win is coming.");
  const [oviInsight, setOviInsight] = useState("I am watching for your patterns, fine girl.");
  const [consistencyDays, setConsistencyDays] = useState(0);
  const [periodHistory, setPeriodHistory] = useState<string[]>([]);
  const [todayCount, setTodayCount] = useState(0);

  const loadData = () => {
    // 1. Period history
    const savedPeriodHistory = localStorage.getItem('lateCircleHistory');
    if (savedPeriodHistory) setPeriodHistory(JSON.parse(savedPeriodHistory));

    // 2. Daily history (7 days) — local date keys only
    const dailyHistory = JSON.parse(localStorage.getItem('lateCircleDailyHistory') || '{}');
    const days: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = localDateKey(d);
      days.push({ 
        dateStr, 
        dayInitial: d.toLocaleDateString('en-GB', { weekday: 'narrow' }), 
        data: dailyHistory[dateStr],
        fullDate: d.toLocaleDateString('en-GB', { weekday: 'long' })
      });
    }
    setLast7Days(days);

    // Today count — local
    const todayStr = localDateKey();
    setTodayCount(dailyHistory[todayStr] ? dailyHistory[todayStr].count : 0);

    // Total greens — clamped per-day to 4, defensive against legacy bad data
    const greens = days.reduce((acc, curr) => {
      const c = curr.data && typeof curr.data.count === 'number' ? curr.data.count : 0;
      return acc + Math.min(c, 4);
    }, 0);
    setTotalGreens(greens);

    // Consistency: days this week with >=2 wins.
    let consistDays = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = localDateKey(d);
      if (dailyHistory[dateStr] && dailyHistory[dateStr].count >= 2) consistDays++;
    }
    setConsistencyDays(consistDays);

    // Biggest Win
    let bestDay: any = null;
    let maxCircles = 0;
    days.forEach(d => {
      const c = d.data && typeof d.data.count === 'number' ? d.data.count : 0;
      if (c > maxCircles) {
        maxCircles = c;
        bestDay = d;
      }
    });

    if (maxCircles > 0 && bestDay) {
      if (maxCircles === 4) {
        setBiggestWin(`${bestDay.fullDate}, you got all 4 wins. Fine girl, you showed up for yourself that day. I'm proud of you.`);
      } else {
        setBiggestWin(`${bestDay.fullDate}, you got ${maxCircles} wins. That was a good day, fine girl.`);
      }
    } else {
      setBiggestWin("No wins yet. Close one circle today to start, fine girl.");
    }

    // Ovi Noticed
    let missedSleep = 0, missedFood = 0, missedWalk = 0, missedCalm = 0, daysTracked = 0;
    days.forEach(d => {
      if (d.data) {
        daysTracked++;
        if (!d.data.sleep) missedSleep++;
        if (!d.data.food) missedFood++;
        if (!d.data.walk) missedWalk++;
        if (!d.data.calm) missedCalm++;
      }
    });

    if (daysTracked < 3) {
      setOviInsight("Keep logging for a few days, fine girl. I am watching for your patterns.");
    } else {
      const misses = [
        { name: 'Sleep', count: missedSleep, msg: "Sleep has been hard this week, fine girl. Let's try bed by 10:30 tomorrow, just one night." },
        { name: 'Food', count: missedFood, msg: "Food has been tricky this week. Let's try one real plate tomorrow before 9pm." },
        { name: 'Walk', count: missedWalk, msg: "Moving has been hard this week. Even 10 minutes tomorrow counts, fine girl." },
        { name: 'Calm', count: missedCalm, msg: "It's been a heavy week. Let's try 90 seconds of Calm tomorrow, just you and me." }
      ];
      misses.sort((a, b) => b.count - a.count);
      
      if (misses[0].count > 0) {
        setOviInsight(misses[0].msg);
      } else {
        setOviInsight("You are closing everything, fine girl. Your body is loving this steady pattern. I am proud of you.");
      }
    }

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
        <p className="text-[#4A2C35]/50 text-xs font-medium">Your real progress</p>
      </div>

      <div className="w-full max-w-sm bg-[#9CAF88]/10 border border-[#9CAF88]/20 rounded-2xl p-4 mb-6">
        <p className="text-sm text-[#4A2C35] font-medium leading-relaxed">
          🌱 Fine girl, you are doing well. I am learning your pattern as you go. We will get there together.
        </p>
      </div>

      <div className="w-full max-w-sm flex gap-3 mb-6">
        <div className="flex-1 bg-white border border-[#4A2C35]/5 rounded-2xl p-4 shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08)]">
          <h3 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-wider mb-1">Today</h3>
          <p className="text-2xl font-bold text-[#4A2C35]">{todayCount} <span className="text-sm text-[#4A2C35]/40 font-medium">/ 4</span></p>
          <p className="text-[10px] text-[#4A2C35]/50">wins today</p>
        </div>
        <div className="flex-1 bg-white border border-[#4A2C35]/5 rounded-2xl p-4 shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08)]">
          <h3 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-wider mb-1">Consistency</h3>
          <p className="text-2xl font-bold text-[#FF8FA3]">🌱 {consistencyDays}</p>
          <p className="text-[10px] text-[#4A2C35]/50">days this week</p>
        </div>
      </div>

      <div className="w-full max-w-sm bg-white p-6 rounded-3xl border border-[#4A2C35]/5 mb-6 shadow-[0_8px_30px_rgba(74,44,53,0.06)]">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest">This Week</h2>
          <span className="text-xs font-bold text-[#9CAF88] bg-[#9CAF88]/10 px-2.5 py-1 rounded-full">{totalGreens} / 28 Wins</span>
        </div>
        
        <div className="flex justify-between items-end h-20 mb-2">
          {last7Days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                d.data && d.data.count > 0
                  ? 'bg-[#9CAF88] border-[#9CAF88] shadow-[0_0_10px_rgba(156,175,136,0.3)]' 
                  : 'border-[#4A2C35]/10 bg-[#FFF0F3]'
              }`}>
                {d.data && d.data.count > 0 && (
                  <span className="text-[11px] font-bold text-white">{d.data.count}</span>
                )}
              </div>
              <span className="text-[10px] text-[#4A2C35]/40 font-medium">{d.dayInitial}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 p-5 rounded-2xl shadow-[0_4px_20px_rgba(74,44,53,0.04)] mb-4">
        <h3 className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-wider mb-2">🤔 Ovi Noticed</h3>
        <p className="text-[13px] text-[#4A2C35] leading-relaxed">{oviInsight}</p>
      </div>

      <div className="w-full max-w-sm bg-[#9CAF88]/10 border border-[#9CAF88]/20 p-5 rounded-2xl mb-6">
        <h3 className="text-[11px] font-bold text-[#9CAF88] uppercase tracking-wider mb-2">🏆 Biggest Win</h3>
        <p className="text-[13px] text-[#4A2C35] leading-relaxed">{biggestWin}</p>
      </div>

      <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 rounded-3xl p-6 shadow-[0_8px_30px_rgba(74,44,53,0.06)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest">📅 Period History</h2>
        </div>
        {periodHistory.length === 0 ? (
          <p className="text-xs text-[#4A2C35]/40 text-center py-4">No history yet. Log your period to build your pattern.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {periodHistory
              .slice()
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
              .map((date, index) => (
                <div key={index} className="flex justify-between items-center border-b border-[#4A2C35]/5 pb-2 last:border-0 last:pb-0">
                  <span className="text-sm text-[#4A2C35]/80 font-medium">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="text-[10px] bg-[#FFF0F3] text-[#FF8FA3] px-2 py-0.5 rounded-full font-bold">Logged</span>
                </div>
              ))}
          </div>
        )}
        <p className="text-[10px] text-[#4A2C35]/40 mt-4 text-center">Show this to your doctor if you're concerned.</p>
      </div>

    </main>
  );
}