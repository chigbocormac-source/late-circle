'use client';

import { useState, useEffect } from 'react';

export default function MyWins() {
  const [pendingYellow, setPendingYellow] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [last7Days, setLast7Days] = useState<any[]>([]);
  const [totalGreens, setTotalGreens] = useState(0);
  const [biggestWin, setBiggestWin] = useState("Keep going. Your first win is coming.");
  const [oviInsight, setOviInsight] = useState("When you eat late, your cycle feels it. Try eating before 8pm tomorrow.");
  const [streak, setStreak] = useState(0);
  const [periodHistory, setPeriodHistory] = useState<string[]>([]);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    // 1. Yellow
    const savedLog = localStorage.getItem('lateCircleLastFoodLog');
    if (savedLog) {
      const log = JSON.parse(savedLog);
      if (log.score === 'Yellow') setPendingYellow(log);
    }

    // 2. Period history
    const savedPeriodHistory = localStorage.getItem('lateCircleHistory');
    if (savedPeriodHistory) setPeriodHistory(JSON.parse(savedPeriodHistory));

    // 3. Daily history (7 days)
    const dailyHistory = JSON.parse(localStorage.getItem('lateCircleDailyHistory') || '{}');
    const days: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({ 
        dateStr, 
        dayInitial: d.toLocaleDateString('en-GB', { weekday: 'narrow' }), 
        data: dailyHistory[dateStr],
        fullDate: d.toLocaleDateString('en-GB', { weekday: 'long' })
      });
    }
    setLast7Days(days);

    // Today count
    const todayStr = new Date().toISOString().split('T')[0];
    setTodayCount(dailyHistory[todayStr] ? dailyHistory[todayStr].count : 0);

    // Total greens
    const greens = days.reduce((acc, curr) => acc + (curr.data ? curr.data.count : 0), 0);
    setTotalGreens(greens);

    // Streak
    let currentStreak = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (dailyHistory[dateStr] && dailyHistory[dateStr].count >= 2) currentStreak++;
      else break;
    }
    setStreak(currentStreak);

    // Biggest Win
    let bestDay: any = null;
    let maxCircles = 0;
    days.forEach(d => {
      if (d.data && d.data.count > maxCircles) {
        maxCircles = d.data.count;
        bestDay = d;
      }
    });

    if (maxCircles > 0 && bestDay) {
      if (maxCircles === 4) {
        setBiggestWin(`Best day this week: ${bestDay.fullDate}. You closed all 4 circles. This is when your body heals most.`);
      } else {
        setBiggestWin(`Best day this week: ${bestDay.fullDate}. You closed ${maxCircles} circles. You were close!`);
      }
    } else {
      setBiggestWin("No wins yet. Close one circle today to start.");
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
      setOviInsight("Keep logging for a few days. I am watching for your patterns.");
    } else {
      const misses = [
        { name: 'Sleep', count: missedSleep, msg: "When you sleep late, your period delays. Try closing the Sleep circle tomorrow." },
        { name: 'Food', count: missedFood, msg: "Eating after 9pm can shift your cycle. Try closing Food tomorrow." },
        { name: 'Walk', count: missedWalk, msg: "Even small walking helps blood flow. Try closing Walk tomorrow." },
        { name: 'Calm', count: missedCalm, msg: "Stress affects your cycle. Try 90 seconds of Calm tomorrow." }
      ];
      misses.sort((a, b) => b.count - a.count);
      
      if (misses[0].count > 0) {
        setOviInsight(`You struggle most with ${misses[0].name}. ${misses[0].msg}`);
      } else {
        setOviInsight("You are closing everything. Your body is loving this steady pattern.");
      }
    }

    setIsLoaded(true);
  }, []);

  const wipeYellow = () => {
    if (!pendingYellow) return;
    const updatedLog = { ...pendingYellow, score: 'Green', name: pendingYellow.name + ' + 20 min walk' };
    localStorage.setItem('lateCircleLastFoodLog', JSON.stringify(updatedLog));
    const savedData = localStorage.getItem('lateCircleData');
    if (savedData) {
      const circles = JSON.parse(savedData);
      circles.walk = true;
      localStorage.setItem('lateCircleData', JSON.stringify(circles));
    }
    setPendingYellow(null);
  };

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-12 px-6 font-sans relative pb-32 animate-page-enter">
      
      <div className="flex flex-col items-center w-full relative mb-6">
        <h1 className="text-2xl font-serif text-[#4A2C35] mb-1 tracking-widest">MY WINS</h1>
        <p className="text-[#4A2C35]/50 text-xs font-medium">Your real progress</p>
      </div>

      <div className="w-full max-w-sm bg-[#9CAF88]/10 border border-[#9CAF88]/20 rounded-2xl p-4 mb-6">
        <p className="text-sm text-[#4A2C35] font-medium leading-relaxed">
          🌱 You are doing well. Keep closing those circles, and Ovi will keep learning your pattern.
        </p>
      </div>

      {pendingYellow && (
        <div className="w-full max-w-sm bg-white border border-[#FFB3C1]/30 rounded-2xl p-4 mb-6 flex justify-between items-center shadow-[0_4px_20px_rgba(74,44,53,0.06)] animate-slide-down">
          <div>
            <p className="text-sm font-bold text-[#4A2C35]">You have a pending win 🟡</p>
            <p className="text-[11px] text-[#4A2C35]/60 mt-1 leading-snug">From {pendingYellow.name}. Walk 20 mins today to turn it Green.</p>
          </div>
          <button onClick={wipeYellow} className="bg-[#4A2C35] text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 shadow-sm">I walked 20m</button>
        </div>
      )}

      <div className="w-full max-w-sm flex gap-3 mb-6">
        <div className="flex-1 bg-white border border-[#4A2C35]/5 rounded-2xl p-4 shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08)]">
          <h3 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-wider mb-1">Today</h3>
          <p className="text-2xl font-bold text-[#4A2C35]">{todayCount} <span className="text-sm text-[#4A2C35]/40 font-medium">/ 4</span></p>
          <p className="text-[10px] text-[#4A2C35]/50">circles closed</p>
        </div>
        <div className="flex-1 bg-white border border-[#4A2C35]/5 rounded-2xl p-4 shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08)]">
          <h3 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-wider mb-1">Streak</h3>
          <p className="text-2xl font-bold text-[#FF8FA3]">🔥 {streak}</p>
          <p className="text-[10px] text-[#4A2C35]/50">days in a row</p>
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
              <div className={`w-8 h-8 rounded-full border-2 transition-all ${
                d.data && d.data.count > 0
                  ? 'bg-[#9CAF88] border-[#9CAF88] shadow-[0_0_10px_rgba(156,175,136,0.3)]' 
                  : 'border-[#4A2C35]/10 bg-[#FFF0F3]'
              }`}></div>
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
            {periodHistory.slice().reverse().map((date, index) => (
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