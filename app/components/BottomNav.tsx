'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-sm z-50">
      <div className="bg-white/95 backdrop-blur-md border border-[#4A2C35]/5 flex justify-between items-center px-2 py-2 rounded-full shadow-[0_8px_30px_rgba(74,44,53,0.12)]">
        
        {/* TODAY TAB */}
        <Link 
          href="/" 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
            pathname === '/' 
              ? 'bg-[#4A2C35] text-white shadow-sm' 
              : 'text-[#4A2C35]/40 hover:text-[#4A2C35]/70'
          }`}
        >
          <span className="text-[16px]">📖</span>
          {pathname === '/' && <span className="text-sm font-bold">Today</span>}
        </Link>

        {/* CYCLE TAB */}
        <Link 
          href="/cycle" 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
            pathname === '/cycle' 
              ? 'bg-[#4A2C35] text-white shadow-sm' 
              : 'text-[#4A2C35]/40 hover:text-[#4A2C35]/70'
          }`}
        >
          <span className="text-[16px]">🌙</span>
          {pathname === '/cycle' && <span className="text-sm font-bold">Cycle</span>}
        </Link>

        {/* MY WINS TAB */}
        <Link 
          href="/insights" 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
            pathname === '/insights' 
              ? 'bg-[#4A2C35] text-white shadow-sm' 
              : 'text-[#4A2C35]/40 hover:text-[#4A2C35]/70'
          }`}
        >
          <span className="text-[16px]">🏆</span>
          {pathname === '/insights' && <span className="text-sm font-bold">My Wins</span>}
        </Link>

      </div>
    </div>
  );
}