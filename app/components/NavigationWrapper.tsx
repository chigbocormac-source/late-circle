'use client';

import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';

export default function NavigationWrapper() {
  const pathname = usePathname();

  // Hide the bottom navigation bar when on the onboarding route
  if (pathname === '/onboarding') {
    return null;
  }

  return <BottomNav />;
}