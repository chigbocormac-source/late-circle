'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOviReply, ChatState, UserCycleData } from '@/utils/chatEngine';
import { getCyclePhase, getRealCycleLength } from '../../utils/cycleEngine';
import { localDateKey } from '../../utils/analytics';
import { OviSearchHeader } from '../components/OviSearchHeader';
import { getCheckInPrompt, hasCheckedInToday, saveChatCheck, CheckType } from '@/utils/checkInPrompts';

type Message = {
  id: string;
  role: 'user' | 'ovi';
  text: string;
  isEmergency?: boolean;
  chips?: string[];
  isCheckIn?: boolean;
  checkType?: CheckType;
  asksName?: boolean;
};

// --- Shared cycle-day math (mirrors today/page.tsx) ---
function getCycleData(lastPeriodDateString: string | null, cycleLengths: number[] = []) {
  if (!lastPeriodDateString) return { currentDay: 1, average: 35, lateDays: 0 };
  const lastPeriod = new Date(lastPeriodDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastPeriod.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(today.getTime() - lastPeriod.getTime());
  const currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  let average = 35;
  if (cycleLengths.length > 0) {
    average = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
  }
  const lateDays = currentDay - average;
  return { currentDay, average, lateDays: lateDays > 0 ? lateDays : 0 };
}

// --- Read her real data from localStorage ---
function getUserCycleData(): UserCycleData | undefined {
  if (typeof window === 'undefined') return undefined;

  const lastPeriod = localStorage.getItem('lateCircleLastPeriod');
  if (!lastPeriod) return undefined;

  const prevPeriod = localStorage.getItem('lateCirclePrevPeriod');
  const cycleType = localStorage.getItem('lateCircleType');

  const realAvg = getRealCycleLength(lastPeriod, prevPeriod, cycleType);
  const { currentDay, average, lateDays } = getCycleData(lastPeriod, [realAvg]);
  const phase = getCyclePhase(currentDay, average);
  const lastBleedDate = localStorage.getItem('lateCircleLastBleedDate');
  const hasLoggedBleedingToday = lastBleedDate === localDateKey();

  return {
    currentDay,
    average,
    lateDays,
    phase: phase.name,
    hasLoggedBleedingToday,
  };
}

// --- Real time greeting ---
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'this morning';
  if (hour >= 12 && hour < 17) return 'this afternoon';
  if (hour >= 17 && hour < 22) return 'tonight';
  return 'tonight';
}

export default function OviChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatState, setChatState] = useState<ChatState>({});
  const [checkInAsked, setCheckInAsked] = useState(false);
  const [herName, setHerName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (hasConsent === true || hasConsent === false) {
      setTimeout(() => {
        const timeWord = getTimeGreeting();
        setMessages([{
          id: '1',
          role: 'ovi',
          text: `Love, I am here. How are you feeling ${timeWord}? What do you want to understand today?`,
          chips: ["My period is late", "I had sex, am I pregnant?", "How can I feel better right now?", "My Period", "I need Soft Place"]
        }]);
      }, 500);
    }
  }, [hasConsent]);

  // --- One Check prompt inside chat (once, only if she hasn't checked in today) ---
  useEffect(() => {
    if (hasConsent !== true && hasConsent !== false) return;
    if (checkInAsked) return;
    if (typeof window === 'undefined') return;

    const lastPeriod = localStorage.getItem('lateCircleLastPeriod');
    let checkType: CheckType = 'food';
    if (lastPeriod) {
      const last = new Date(lastPeriod);
      const now = new Date();
      last.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const day = Math.floor((now.getTime() - last.getTime()) / 86400000) + 1;
      if (day <= 15) checkType = 'sleep';
      else if (day <= 35) checkType = 'walk';
      else if (day <= 80) checkType = 'food';
      else checkType = 'calm';
    }

    if (hasCheckedInToday()) {
      setCheckInAsked(true);
      return;
    }

    const prompt = getCheckInPrompt(checkType);
    const t = setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `checkin-${Date.now()}`,
          role: 'ovi',
          text: prompt.question,
          chips: prompt.chips,
          isCheckIn: true,
          checkType,
        },
      ]);
      setCheckInAsked(true);
    }, 900);
    return () => clearTimeout(t);
  }, [hasConsent, checkInAsked]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // --- IDENTITY CHECK FIRST - never save this as a name ---
    const lower = text.toLowerCase().trim();
    const isIdentityQuestion =
      lower.includes('are you a boy') ||
      lower.includes('are you a girl') ||
      lower.includes('are you male') ||
      lower.includes('are you female') ||
      lower.includes('are you a woman') ||
      lower.includes('are you a man') ||
      lower.includes('are you human') ||
      lower.includes('are you real') ||
      lower.includes('who are you');

    if (isIdentityQuestion) {
      const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'ovi',
            text: "love, I'm your big sister Ovi. I'm here for girls like you. I'm not a boy. What's your name?",
            chips: ["My period is late", "I had sex, am I pregnant?", "How can I feel better right now?"],
            asksName: true,
          },
        ]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // --- Name capture: only if Ovi just asked "what's your name?" ---
    const lastOviMsg = [...messages].reverse().find(m => m.role === 'ovi');
    if (lastOviMsg?.asksName && text.trim().length <= 30) {
      const name = text.trim().replace(/[.!?]+$/, '');
      const prettyName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      setHerName(prettyName);

      const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'ovi',
            text: `${prettyName}. That is a beautiful name, love. I will remember it. 💜\n\nWhat do you want to understand today?`,
            chips: ["My period is late", "I had sex, am I pregnant?", "How can I feel better right now?"],
          },
        ]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // --- Check-in chip response ---
    const lastOvi = [...messages].reverse().find(m => m.role === 'ovi');
    if (lastOvi?.isCheckIn && lastOvi.checkType) {
      const prompt = getCheckInPrompt(lastOvi.checkType);
      const didIt = text.startsWith('✅');
      const tried = text.startsWith('🤍');

      const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      if (didIt || tried) {
        saveChatCheck(lastOvi.checkType);
      }

      setTimeout(() => {
        const why = didIt
          ? prompt.why
          : tried
            ? `${prompt.why} Small small is still progress. That counts.`
            : `That's okay, love. No pressure. I'm still here whenever you're ready. Your One Check is waiting on the Today page.`;

        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'ovi',
            text: why,
            chips: didIt || tried
              ? ['Tell me my message for today', 'How can I feel better right now?', 'My period is late']
              : ['How can I feel better right now?', 'My period is late', 'I am scared'],
          },
        ]);
        setIsTyping(false);
      }, 1200);
      return;
    }

    // --- Normal chat flow ---
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const userData = getUserCycleData();
      const reply = getOviReply(text, chatState, userData);
      setChatState(reply.newState);

      const oviMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ovi',
        text: reply.text,
        isEmergency: reply.isEmergency,
        chips: reply.chips,
        asksName: reply.asksName,
      };

      setMessages(prev => [...prev, oviMsg]);
      setIsTyping(false);

      if (reply.action === 'OPEN_SOFT_PLACE') {
        setTimeout(() => {
          router.push('/care?open=softplace');
        }, 2500);
      }

      if (reply.action === 'OPEN_YOU_PLACE') {
        setTimeout(() => {
          router.push('/care/you-place');
        }, 2500);
      }
    }, 1500);
  };

  if (hasConsent === null) {
    return (
      <div className="min-h-screen bg-[#FFF0F3] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-sm w-full text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-linear-to-tr from-[#FF8FA3] to-[#9CAF88] animate-orb-breathe mb-6"></div>
          <h2 className="text-xl font-bold text-[#4A2C35] mb-2">Ovi is here</h2>
          <p className="text-[#8A2C3E] text-sm mb-8">
            Love, I am here. Sometimes I save our chats so I can learn how to hold you better. Is that okay?
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setHasConsent(true)} className="w-full py-3 rounded-full bg-[#9CAF88] text-white font-semibold hover:bg-opacity-90 transition">
              Yes, save my chats 💜
            </button>
            <button onClick={() => setHasConsent(false)} className="w-full py-3 rounded-full bg-[#FFF0F3] text-[#8A2C3E] font-semibold hover:bg-pink-100 transition">
              No, keep it private 🤫
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FFF0F3] pb-20">
      <div className="bg-[#9CAF88] px-6 py-4 rounded-b-3xl shadow-md flex items-center gap-4 sticky top-0 z-10">
        <div className="w-12 h-12 rounded-full bg-linear-to-tr from-[#FF8FA3] to-[#FFF0F3] animate-orb-breathe shadow-inner"></div>
        <div>
          <h1 className="text-white font-bold text-lg">Ovi is here</h1>
          <p className="text-white text-xs opacity-90 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-300 rounded-full inline-block"></span> Online • Only yours
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="sticky top-0 z-5 bg-[#FFF0F3] pb-2">
          <OviSearchHeader
            searchTerm={input}
            setSearchTerm={setInput}
            onSelectQuery={(query) => handleSend(query)}
          />
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up-slow`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' ? 'bg-[#FFC2CD] text-[#4A2C35] rounded-tr-sm' 
              : msg.isEmergency ? 'bg-red-100 border-2 border-red-400 text-red-800 rounded-tl-sm'
              : 'bg-[#D1DCC6] text-[#4A2C35] rounded-tl-sm'
            }`}>
              <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              {msg.isEmergency && (
                <div className="mt-3 flex flex-col gap-2">
                  <a href="tel:112" className="block text-center bg-red-600 text-white py-2 rounded-full text-sm font-bold">Call 112 Emergency</a>
                  <a href="https://wa.me/2348000000000" target="_blank" className="block text-center bg-white text-red-600 border border-red-600 py-2 rounded-full text-sm font-bold">WhatsApp a Doctor</a>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-[#D1DCC6] p-4 rounded-2xl rounded-tl-sm flex gap-1">
              <span className="w-2 h-2 bg-[#4A2C35] rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-[#4A2C35] rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-[#4A2C35] rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!isTyping && messages.length > 0 && messages[messages.length - 1].chips && (
        <div className="w-full overflow-x-auto px-4 pb-3 pt-1 scrollbar-none">
          <div className="flex gap-2 w-max max-w-none">
            {messages[messages.length - 1].chips!.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSend(chip)}
                className="shrink-0 whitespace-nowrap px-4 py-2 bg-white border border-[#9CAF88] text-[#4A2C35] rounded-full text-sm font-medium shadow-sm hover:bg-[#D1DCC6] transition"
              >
                {chip}
              </button>
            ))}
            <span className="shrink-0 w-2" />
          </div>
        </div>
      )}

      <div className="p-4 bg-[#FFF0F3]">
        <div className="flex items-center bg-white rounded-full p-2 px-4 shadow-sm border border-[#9CAF88]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Type to Ovi..."
            className="flex-1 bg-transparent outline-none text-[#4A2C35] placeholder-[#9CAF88] text-sm"
          />
          <button onClick={() => handleSend(input)} className="w-10 h-10 bg-[#9CAF88] rounded-full flex items-center justify-center ml-2 hover:bg-opacity-90 transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-1">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}