'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyWins() {
  const [pendingYellow, setPendingYellow] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [weekData, setWeekData] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [totalGreens, setTotalGreens] = useState(0);
  const [biggestWin, setBiggestWin] = useState("Keep going. Your first win is coming.");
  const [oviInsight, setOviInsight] = useState("When you eat late, your cycle feels it. Try eating before 8pm tomorrow.");

  useEffect(() => {
    const savedLog = localStorage.getItem('lateCircleLastFoodLog');
    if (savedLog) {
      const log = JSON.parse(savedLog);
      if (log.score === 'Yellow') {
        setPendingYellow(log);
      }
    }

    const savedData = localStorage.getItem('lateCircleData');
    if (savedData) {
      const circles = JSON.parse(savedData);
      const todayClosed = [circles.food, circles.walk, circles.sleep, circles.calm].filter(Boolean).length;
      
      const simulatedWeek = [true, true, todayClosed > 2, false, false, false, false];
      setWeekData(simulatedWeek);
      
      const greens = simulatedWeek.filter(Boolean).length * 4;
      setTotalGreens(greens);

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
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-12 px-6 font-sans relative pb-32">
      
      <div className="flex flex-col items-center w-full relative mb-6">
        <h1 className="text-2xl font-serif text-[#4A2C35] mb-1 tracking-widest">MY WINS</h1>
        <p className="text-[#4A2C35]/50 text-xs font-medium">Week 1 of your journey</p>
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

      <div className="w-full max-w-sm bg-white p-6 rounded-3xl border border-[#4A2C35]/5 mb-6 shadow-[0_8px_30px_rgba(74,44,53,0.06)]">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-widest">This Week</h2>
          <span className="text-xs font-bold text-[#9CAF88] bg-[#9CAF88]/10 px-2.5 py-1 rounded-full">{totalGreens} / 28 Wins</span>
        </div>
        
        <div className="flex justify-between items-end h-20 mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full border-2 transition-all ${
                weekData[i] 
                  ? 'bg-[#9CAF88] border-[#9CAF88] shadow-[0_0_10px_rgba(156,175,136,0.3)]' 
                  : 'border-[#4A2C35]/10 bg-[#FFF0F3]'
              }`}></div>
              <span className="text-[10px] text-[#4A2C35]/40 font-medium">{day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        
        <div className="bg-[#9CAF88]/10 border border-[#9CAF88]/20 p-5 rounded-2xl">
          <h3 className="text-[11px] font-bold text-[#9CAF88] uppercase tracking-wider mb-2">Biggest Win</h3>
          <p className="text-[13px] text-[#4A2C35] leading-relaxed">
            {biggestWin}
          </p>
        </div>

        <div className="bg-white border border-[#4A2C35]/5 p-5 rounded-2xl shadow-[0_4px_20px_rgba(74,44,53,0.04)]">
          <h3 className="text-[11px] font-bold text-[#4A2C35]/40 uppercase tracking-wider mb-2">Ovi Noticed</h3>
          <p className="text-[13px] text-[#4A2C35] leading-relaxed">
            {oviInsight}
          </p>
        </div>

      </div>

    </main>
  );
}