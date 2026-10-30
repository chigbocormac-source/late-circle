'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyWins() {
  const [pendingYellow, setPendingYellow] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if there is a yellow sin to wipe
    const savedLog = localStorage.getItem('lateCircleLastFoodLog');
    if (savedLog) {
      const log = JSON.parse(savedLog);
      if (log.score === 'Yellow') {
        setPendingYellow(log);
      }
    }
    setIsLoaded(true);
  }, []);

  const wipeYellow = () => {
    if (!pendingYellow) return;
    
    // Update the log to Green
    const updatedLog = { ...pendingYellow, score: 'Green', name: pendingYellow.name + ' + Walk 2k' };
    localStorage.setItem('lateCircleLastFoodLog', JSON.stringify(updatedLog));
    
    // Add 2k steps to the walk data
    const savedData = localStorage.getItem('lateCircleData');
    if (savedData) {
      const circles = JSON.parse(savedData);
      circles.walk = circles.walk + 2000;
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
            <p className="text-sm font-bold text-[#9CAF88]">You have a Yellow sin 🟡</p>
            <p className="text-[10px] text-[#E8E0D5]/70 mt-1">From {pendingYellow.name}. Walk 2k extra today to turn it Green.</p>
          </div>
          <button onClick={wipeYellow} className="bg-[#9CAF88] text-[#0F0F10] px-4 py-2 rounded-xl text-xs font-bold active:scale-95">Walk 2k</button>
        </div>
      )}

      {/* WEEKLY WINS GRAPH */}
      <div className="w-full max-w-sm bg-[#1A1A1C] p-6 rounded-3xl border border-[#E8E0D5]/10 mb-6">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-sm font-bold text-[#E8E0D5]">This Week</h2>
          <span className="text-xs font-bold text-[#9CAF88]">12 / 28 Greens</span>
        </div>
        
        {/* 7 DAY ROW */}
        <div className="flex justify-between items-end h-20 mb-2">
          {/* Mon */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#9CAF88] border-2 border-[#9CAF88]"></div>
            <span className="text-[10px] text-[#E8E0D5]/50">M</span>
          </div>
          {/* Tue */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#9CAF88] border-2 border-[#9CAF88]"></div>
            <span className="text-[10px] text-[#E8E0D5]/50">T</span>
          </div>
          {/* Wed */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#9CAF88]/50 border-2 border-[#9CAF88]"></div>
            <span className="text-[10px] text-[#E8E0D5]/50">W</span>
          </div>
          {/* Thu */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#E8E0D5]/20"></div>
            <span className="text-[10px] text-[#E8E0D5]/50">T</span>
          </div>
          {/* Fri */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#E8E0D5]/20"></div>
            <span className="text-[10px] text-[#E8E0D5]/50">F</span>
          </div>
          {/* Sat */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#E8E0D5]/20"></div>
            <span className="text-[10px] text-[#E8E0D5]/50">S</span>
          </div>
          {/* Sun */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#E8E0D5]/20"></div>
            <span className="text-[10px] text-[#E8E0D5]/50">S</span>
          </div>
        </div>
      </div>

      {/* OVI'S MAGIC */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        
        <div className="bg-[#9CAF88]/10 border border-[#9CAF88]/20 p-4 rounded-2xl">
          <h3 className="text-xs font-bold text-[#9CAF88] uppercase tracking-wider mb-2">Biggest Win</h3>
          <p className="text-sm text-[#E8E0D5] leading-relaxed">
            You slept before 11pm 2x this week. First time in 3 weeks 💚
          </p>
        </div>

        <div className="bg-[#1A1A1C] border border-[#E8E0D5]/10 p-4 rounded-2xl">
          <h3 className="text-xs font-bold text-[#E8E0D5]/50 uppercase tracking-wider mb-2">Ovi Noticed</h3>
          <p className="text-sm text-[#E8E0D5] leading-relaxed">
            When you eat after 9pm, you sleep after 12am. Try eat before 8pm tomorrow?
          </p>
        </div>

      </div>

    </main>
  );
}