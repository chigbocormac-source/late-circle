'use client';

import { useState, useEffect } from 'react';

export default function InstallHint() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Only hide if SHE herself tapped X before
    if (localStorage.getItem('oviInstallDismissed') === 'true') {
      setDismissed(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem('oviInstallDismissed', 'true');
  };

  const installAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDismissed(true);
    setDeferredPrompt(null);
  };

  if (isStandalone || dismissed) return null;

  if (!isIOS) {
    return (
      <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 p-4 rounded-2xl mb-4 shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08)] relative">
        <button onClick={dismiss} className="absolute top-3 right-3 text-[#4A2C35]/30 text-xs font-bold">✕</button>
        <p className="text-sm text-[#4A2C35] font-bold mb-1">📱 Add Ovi to Home Screen</p>
        <p className="text-xs text-[#4A2C35]/70 leading-relaxed pr-4 mb-3">
          Install Ovi like a real app, so you get period reminders even when Safari is closed.
        </p>
        <button onClick={installAndroid} className="w-full bg-[#4A2C35] text-white text-sm font-bold py-2.5 rounded-xl">
          {deferredPrompt ? 'Install Ovi Now' : 'Tap ⋮ in Chrome → Add to Home screen'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-white border border-[#4A2C35]/5 p-4 rounded-2xl mb-4 shadow-[0_8px_20px_-8px_rgba(74,44,53,0.08)] relative">
      <button onClick={dismiss} className="absolute top-3 right-3 text-[#4A2C35]/30 text-xs font-bold">✕</button>
      <p className="text-sm text-[#4A2C35] font-bold mb-1">📱 Add Ovi to Home Screen</p>
      <p className="text-xs text-[#4A2C35]/70 leading-relaxed pr-4">
        Tap the <span className="font-bold">Share</span> button (square with arrow) at the bottom of Safari, then scroll down and tap <span className="font-bold">Add to Home Screen</span>.
      </p>
    </div>
  );
}