'use client';

import { useState, useEffect } from 'react';

export default function InstallHint() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    if (localStorage.getItem('lateCircleInstallDismissed') === 'true') {
      setDismissed(true);
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem('lateCircleInstallDismissed', 'true');
  };

  if (isStandalone || !isIOS || dismissed) return null;

  return (
    <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 p-4 rounded-2xl mb-4 shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08)] relative">
      <button 
        onClick={dismiss} 
        className="absolute top-3 right-3 text-[#4A2C35]/30 text-xs font-bold"
      >
        ✕
      </button>
      <p className="text-sm text-[#4A2C35] font-bold mb-1">📱 Add Late Circle to Home Screen</p>
      <p className="text-xs text-[#4A2C35]/70 leading-relaxed pr-4">
        Tap the <span className="font-bold">Share</span> button (square with arrow) at the bottom of Safari, then scroll down and tap <span className="font-bold">Add to Home Screen</span>.
      </p>
    </div>
  );
}