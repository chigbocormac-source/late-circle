'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyWins() {
  const [pendingYellow, setPendingYellow] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Real data states
  const [weekData, setWeekData] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [totalGreens, setTotalGreens] = useState(0);
  const [biggestWin, setBiggestWin] = useState("Keep going. Your first win is coming.");
  const [oviInsight, setOviInsight] = useState("When you eat late, your cycle feels it. Try eating before 8pm tomorrow.");

  useEffect(() => {
    // 1. Check for Yellow Sin
    const savedLog = localStorage.getItem('lateCircleLastFoodLog');
    if (savedLog) {
      const log = JSON.parse(savedLog);
      if (log.score === 'Yellow') {
        setPendingYellow(log);
      }
    }

    // 2. Load real weekly data
    // In a real app, you'd store an array of daily history. 
    // For now, we simulate based on today's circles.
    const savedData = localStorage.getItem('lateCircleData');
    if (savedData) {
      const circles = JSON.parse(savedData);
      const todayClosed = [circles.food, circles.walk, circles.sleep, circles.calm].filter(Boolean).length;
      
      // Simulate a week of data (since we don't have a history DB yet)
      const simulatedWeek = [true, true, todayClosed > 2, false, false, false, false];
      setWeekData(simulatedWeek);
      
      const greens = simulatedWeek.filter(Boolean).length * 4; // 4 circles per day
      setTotalGreens(greens);

      // 3. Smart Insights
      if (circles.sleep && circles.food) {
        setBiggestWin("You closed both Food and Sleep on the same day. This is when your body heals.");
      } else if (circles.walk) {
        setBiggestWin("You moved your body today. Blood flow = less cramps tomorrow.");
      } else {
        setBiggestWin("You opened the app today. That is the first win.");
      }
    }

    setIsLoaded(true);
  }, []);

  const wipeYellow = () => {
    if (!pendingYellow) return;
    
    // Update the log to Green
    const updatedLog = { ...pendingYellow, score: 'Green', name: pendingYellow.name + ' + 20 min walk' };
    localStorage.setItem('lateCircleLastFoodLog', JSON.stringify(updatedLog));
    
    // Mark Walk as done
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
    <main className="min-h-screen bg-[#0F0F10] text-[#E8E0D5] flex flex-col items-center pt-12 px-6 font-sans relative pb-32">
      
      {/* HEADER */}
      <div className="flex flex-col items-center w-full relative mb-6">
        <h1 className="text-2xl font-serif text-[#9CAF88] mb-1 tracking-widest">MY WINS</h1>
        <p className="text-[#E8E0D5]/70 text-xs font-medium">Week 1 of your journey</p>
      </div>

      {/* THE YELLOW SIN BANNER */}
      {pendingYellow && (
        <div className="w-full max-w-sm bg-[#1A1A1C] border border-[#9CAF88]/40 rounded-2xl p-4 mb-6 flex justify-between items-center shadow-lg animate-slide-down">
          <div>
            <p className="text-sm font-bold text-[#9CAF88]">You have a pending win 🟡</p>
            <p className="text-[10px] text-[#E8E0D5]/70 mt-1">From {pendingYellow.name}. Walk 20 mins today to turn it Green.</p>
          </div>
          <button onClick={wipeYellow} className="bg-[#9CAF88] text-[#0F0F10] px-4 py-2 rounded-xl text-xs font-bold active:scale-95">I walked 20m</button>
        </div>
      )}

      {/* WEEKLY WINS GRAPH */}
      <div className="w-full max-w-sm bg-[#1A1A1C] p-6 rounded-3xl border border-[#E8E0D5]/10 mb-6">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-sm font-bold text-[#E8E0D5]">This Week</h2>
          <span className="text-xs font-bold text-[#9CAF88]">{totalGreens} / 28 Wins</span>
        </div>
        
        {/* 7 DAY ROW */}
        <div className="flex justify-between items-end h-20 mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full border-2 transition-all ${
                weekData[i] 
                  ? 'bg-[#9CAF88] border-[#9CAF88] shadow-[0_0_10px_rgba(156,175,136,0.4)]' 
                  : 'border-[#E8E0D5]/20 bg-transparent'
              }`}></div>
              <span className="text-[10px] text-[#E8E0D5]/50">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* OVI'S MAGIC */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        
        <div className="bg-[#9CAF88]/10 border border-[#9CAF88]/20 p-4 rounded-2xl">
          <h3 className="text-xs font-bold text-[#9CAF88] uppercase tracking-wider mb-2">Biggest Win</h3>
          <p className="text-sm text-[#E8E0D5] leading-relaxed">
            {biggestWin}
          </p>
        </div>

        <div className="bg-[#1A1A1C] border border-[#E8E0D5]/10 p-4 rounded-2xl">
          <h3 className="text-xs font-bold text-[#E8E0D5]/50 uppercase tracking-wider mb-2">Ovi Noticed</h3>
          <p className="text-sm text-[#E8E0D5] leading-relaxed">
            {oviInsight}
          </p>
        </div>

      </div>

    </main>
  );
}