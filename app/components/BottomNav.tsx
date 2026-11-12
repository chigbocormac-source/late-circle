'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Today', path: '/today', icon: '🏠' },
    { name: 'Cycle', path: '/cycle', icon: '🌙' },
    { name: 'Wins', path: '/wins', icon: '🏆' },
    { name: 'Care', path: '/care', icon: '🤍' },
    { name: 'Ovi', path: '/chat', icon: '💬' },
  ];

  return (
    <div className="print:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-lg border border-[#4A2C35]/5 shadow-[0_8px_32px_rgba(74,44,53,0.08)] rounded-full px-2 py-2 flex items-center gap-1 sm:gap-4 pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <Link
              key={tab.name}
              href={tab.path}
              className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-[#4A2C35] text-white shadow-md'
                  : 'text-[#4A2C35]/40 hover:bg-[#FFF0F3]'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {isActive && (
                <span className="text-[11px] font-bold tracking-wide">
                  {tab.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}