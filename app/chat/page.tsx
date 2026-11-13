'use client';

import { useState } from 'react';

export default function ChatPage() {
  const [showToast, setShowToast] = useState(false);

  const handleInputTap = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-12 px-6 pb-32 font-sans relative overflow-hidden">
      
      {/* HEADER */}
      <div className="w-full max-w-sm flex flex-col items-center mb-8">
        <h1 className="text-2xl font-serif tracking-[0.2em] mb-1">OVI</h1>
        <p className="text-xs text-[#4A2C35]/50">I am still learning to speak.</p>
      </div>

      {/* THE BREATHING ORB */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Outer Glow */}
          <div className="absolute inset-0 bg-linear-to-tr from-[#FFB3C1] to-[#E6E6FA] rounded-full blur-3xl opacity-40 animate-orb-breathe" />
          
          {/* Inner Orb */}
          <div className="relative w-48 h-48 rounded-full bg-linear-to-br from-[#FF8FA3] via-[#FFB3C1] to-[#E6E6FA] shadow-[0_0_50px_rgba(255,143,163,0.3)] animate-orb-breathe flex items-center justify-center">
            {/* Soft inner highlight */}
            <div className="absolute top-4 left-6 w-20 h-12 bg-white/40 rounded-full blur-md transform -rotate-45" />
            <div className="absolute bottom-6 right-8 w-12 h-8 bg-white/20 rounded-full blur-sm transform rotate-12" />
          </div>
        </div>

        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '1s' }}>
          <p className="text-sm font-bold text-[#4A2C35]/80 mb-2">Ovi is resting.</p>
          <p className="text-xs text-[#4A2C35]/50 max-w-60 leading-relaxed mx-auto">
            I am watching your circles and holding your worries. If you need to tell me something tonight, write it below. I will read it in the morning.
          </p>
        </div>
      </div>

      {/* INPUT BOX (Teaser) */}
      <div className="w-full max-w-sm mt-auto relative">
        {showToast && (
          <div className="absolute -top-14 left-0 right-0 mx-auto w-max bg-[#4A2C35] text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-lg animate-fade-in z-50">
            Ovi's ears are still growing. She can't hear this yet 💜
          </div>
        )}
        
        <div 
          onClick={handleInputTap}
          className="w-full bg-white border border-[#4A2C35]/10 rounded-full py-4 px-5 flex items-center justify-between shadow-sm cursor-text active:scale-[0.98] transition-transform"
        >
          <span className="text-sm text-[#4A2C35]/40">Tell Ovi something...</span>
          <div className="w-8 h-8 rounded-full bg-[#FFF0F3] flex items-center justify-center">
            <span className="text-[#4A2C35]/30 text-lg">↑</span>
          </div>
        </div>
      </div>

    </main>
  );
}