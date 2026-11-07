'use client';

import { useState } from 'react';
import { LetterData, buildLetterText, buildStarsData, buildStarsPageText } from '../../utils/oviLetter';

interface OviLetterProps {
  data: LetterData;
  dailyHistory: Record<string, any>;
  onClose: () => void;
}

export default function OviLetter({ data, dailyHistory, onClose }: OviLetterProps) {
  const [page, setPage] = useState<'letter' | 'stars' | 'future'>('letter');
  const [futureLine, setFutureLine] = useState('');
  const [saved, setSaved] = useState(false);
  const stars = buildStarsData(dailyHistory);

  const handleSaveFuture = () => {
    if (futureLine.trim()) {
      localStorage.setItem('lateCircleFutureLetter', futureLine.trim());
      localStorage.setItem('lateCircleFutureLetterDate', new Date().toISOString());
      setSaved(true);
    }
  };

  const renderStars = (count: number, emoji: string) => {
    if (count === 0) {
      return <span className="text-[10px] text-white/40 italic">Not yet</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className="text-lg" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.4))' }}>
            {emoji}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#FFF0F3] z-100 flex flex-col pt-12 px-6 overflow-y-auto overscroll-contain">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h1 className="text-lg font-bold text-[#4A2C35]">
          {page === 'letter' && 'Your Letter'}
          {page === 'stars' && 'Look At You'}
          {page === 'future' && 'One Last Thing'}
        </h1>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#4A2C35]/60 font-bold active:scale-95 border border-[#4A2C35]/10"
        >
          ✕
        </button>
      </div>

      {/* PAGE 1: LETTER */}
      {page === 'letter' && (
        <>
          <div className="bg-white rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.15)] mb-6">
            <h2 className="text-sm font-bold text-[#9CAF88] uppercase tracking-widest mb-3">
              For {data.girlName} — Only Yours
            </h2>
            <p className="text-[13px] text-[#4A2C35]/80 leading-relaxed whitespace-pre-line">
              {buildLetterText(data)}
            </p>
            <p className="text-[10px] text-[#4A2C35]/40 mt-6 text-center">
              This letter is only yours. Delete it anytime you want.
            </p>
          </div>
          <button
            onClick={() => setPage('stars')}
            className="w-full max-w-sm mx-auto bg-[#4A2C35] text-white py-4 rounded-full font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(74,44,53,0.2)]"
          >
            See your stars →
          </button>
        </>
      )}

      {/* PAGE 2: STARS */}
      {page === 'stars' && (
        <>
          <div className="bg-linear-to-b from-[#2D1B3D] to-[#5B3A5B] rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.3)] mb-6 min-h-105 flex flex-col">
            <h2 className="text-lg font-bold text-white text-center mb-4">Look At You</h2>

            <div className="flex-1 flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-white/60 w-12">Food</span>
                {renderStars(stars.food.successes, '🧡')}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-white/60 w-12">Walk</span>
                {renderStars(stars.walk.successes, '💚')}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-white/60 w-12">Sleep</span>
                {renderStars(stars.sleep.successes, '💜')}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-white/60 w-12">Calm</span>
                {renderStars(stars.calm.successes, '💙')}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[10px] text-white/50 text-center mb-2">
                🧡 Food — 💚 Walk — 💜 Sleep — 💙 Calm
              </p>
              <p className="text-sm text-white text-center font-medium leading-relaxed">
                {buildStarsPageText(data)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setPage('future')}
            className="w-full max-w-sm mx-auto bg-[#4A2C35] text-white py-4 rounded-full font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(74,44,53,0.2)]"
          >
            One last thing →
          </button>
        </>
      )}

      {/* PAGE 3: FUTURE LETTER */}
      {page === 'future' && (
        <>
          <div className="bg-white rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.15)] mb-6">
            <h2 className="text-lg font-bold text-[#4A2C35] mb-3">One Last Thing</h2>
            <p className="text-sm text-[#4A2C35]/70 leading-relaxed mb-4">
              What do you want to tell yourself next month, when you are waiting again?
            </p>
            <textarea
              value={futureLine}
              onChange={(e) => setFutureLine(e.target.value)}
              placeholder={`Write one line to future you... e.g. "Fine Girl, you have done this before."`}
              className="w-full bg-[#FFF0F3] border border-[#4A2C35]/10 text-[#4A2C35] p-4 rounded-xl focus:outline-none focus:border-[#9CAF88] text-sm min-h-25 resize-none"
              disabled={saved}
            />
            {!saved ? (
              <button
                onClick={handleSaveFuture}
                disabled={!futureLine.trim()}
                className={`w-full mt-4 py-3 rounded-full font-bold transition-all ${
                  futureLine.trim()
                    ? 'bg-[#9CAF88] text-white active:scale-95 shadow-[0_8px_20px_-4px_rgba(156,175,136,0.3)]'
                    : 'bg-[#9CAF88]/30 text-white/50 cursor-not-allowed'
                }`}
              >
                Save for next month
              </button>
            ) : (
              <div className="mt-4 bg-[#9CAF88]/15 border border-[#9CAF88]/30 rounded-xl p-4 text-center">
                <p className="text-sm font-bold text-[#5A7350] mb-1">Saved.</p>
                <p className="text-xs text-[#4A2C35]/60">
                  Next month, when you are waiting again, I will show you your own words.
                </p>
              </div>
            )}
          </div>

          <div className="w-full max-w-sm mx-auto mt-auto pb-8">
            <button
              onClick={onClose}
              className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(74,44,53,0.2)]"
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}