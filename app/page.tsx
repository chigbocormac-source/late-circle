'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const onboarded = localStorage.getItem('lateCircleOnboarded');
    if (onboarded) {
      router.replace('/today');
    } else {
      router.replace('/onboarding');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFF0F3] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-[#9CAF88] border-t-transparent animate-spin"></div>
    </div>
  );
}