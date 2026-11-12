'use client';

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center justify-center px-6 pb-32 font-sans text-center">
      <div className="w-20 h-20 rounded-full bg-[#FFB3C1]/20 flex items-center justify-center mb-6 animate-pulse">
        <span className="text-4xl">💬</span>
      </div>
      <h1 className="text-2xl font-bold text-[#4A2C35] mb-3">Ovi Chat</h1>
      <p className="text-sm text-[#4A2C35]/60 leading-relaxed max-w-xs">
        Ovi is resting right now. But soon, you will be able to talk to me here anytime you need.
      </p>
    </main>
  );
}