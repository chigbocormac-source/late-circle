'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    // The floating container
    <div className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-sm z-50">
      <div className="bg-[#1A1A1C]/95 backdrop-blur-md border border-[#E8E0D5]/10 flex justify-between items-center px-2 py-2 rounded-full shadow-2xl">
        
        {/* TODAY TAB */}
        <Link 
          href="/" 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
            pathname === '/' 
              ? 'bg-[#9CAF88] text-[#0F0F10]' 
              : 'text-[#E8E0D5]/60 hover:text-[#E8E0D5]'
          }`}
        >
          <span className="text-lg">📖</span>
          {pathname === '/' && <span className="text-sm font-bold">Today</span>}
        </Link>

        {/* MY WINS TAB */}
        <Link 
          href="/insights" 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
            pathname === '/insights' 
              ? 'bg-[#9CAF88] text-[#0F0F10]' 
              : 'text-[#E8E0D5]/60 hover:text-[#E8E0D5]'
          }`}
        >
          <span className="text-lg">🏆</span>
          {pathname === '/insights' && <span className="text-sm font-bold">My Wins</span>}
        </Link>

      </div>
    </div>
  );
}