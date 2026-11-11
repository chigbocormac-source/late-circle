'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../supabase';
import { getCyclePhase, oviGists, PhaseId, oviWelcome, getMorningGreeting, getRealCycleLength, getLateBoundary } from '../../utils/cycleEngine';
import InstallHint from '../components/InstallHint';
import { trackAppOpened, logEvent, localDateKey } from '../../utils/analytics';
import { subscribeToPush } from '../../utils/push';
import { HOLD_ME_DATA } from '../../utils/holdMe';
import { getClaimCopy } from '../../utils/claimCopy';
import { getWorryForTags } from '../../utils/worryBubble';

function getCycleData(lastPeriodDateString: string | null, cycleLengths: number[] = []) {
  if (!lastPeriodDateString) return { currentDay: 1, average: 35, lateDays: 0 };
  const lastPeriod = new Date(lastPeriodDateString);
  const today = new Date();
  today.setHours(0,0,0,0);
  lastPeriod.setHours(0,0,0,0);
  const diffTime = Math.abs(today.getTime() - lastPeriod.getTime());
  const currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  let average = 35; 
  if (cycleLengths.length > 0) {
    average = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
  }
  const lateDays = currentDay - average;
  return { currentDay, average, lateDays: lateDays > 0 ? lateDays : 0 };
}

interface Food {
  id: string;
  name: string;
  score: 'Green' | 'Yellow' | 'Red';
  fix: string;
  category: string;
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastPeriodDate, setLastPeriodDate] = useState<string>('');
  const [realCycleLength, setRealCycleLength] = useState<number>(35);
  
  const [circles, setCircles] = useState({
    food: false,
    walk: false,
    sleep: false,
    calm: false,
  });
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showGoodnight, setShowGoodnight] = useState(false);

  const [dbFoods, setDbFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);
  const [showFoodDetails, setShowFoodDetails] = useState(false);
  const [showFoodLog, setShowFoodLog] = useState(false);

  const [showWinCelebration, setShowWinCelebration] = useState(false);
  const [oviPattern, setOviPattern] = useState<string | null>(null);

  const [calmView, setCalmView] = useState<'menu' | 'breathing' | 'burn' | 'rain' | null>(null);
  const [breathTime, setBreathTime] = useState(90);

  const [isNightClosed, setIsNightClosed] = useState(false);
  const [showOviWelcome, setShowOviWelcome] = useState(false);
  const [todayStr, setTodayStr] = useState('');
  
  const [promiseDay, setPromiseDay] = useState<number | null>(null);
  const [nowHour, setNowHour] = useState(0);
  const [morningGreeting, setMorningGreeting] = useState<string>('');
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  const [showHoldMeTrigger, setShowHoldMeTrigger] = useState(false);
  const [triggerCircle, setTriggerCircle] = useState<'food' | 'walk' | 'sleep' | 'calm' | null>(null);

  const [holdMeActive, setHoldMeActive] = useState<{circle: 'sleep' | 'food' | 'movement' | 'calm', day: number} | null>(null);
  const [showHoldMePicker, setShowHoldMePicker] = useState(false);
  const [holdMeMissedMessage, setHoldMeMissedMessage] = useState<string | null>(null);
  const [showGraduation, setShowGraduation] = useState(false);
  const [showEndHoldConfirm, setShowEndHoldConfirm] = useState(false);

  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [showClaimFlow, setShowClaimFlow] = useState(false);
  const [claimStep, setClaimStep] = useState(1);
  const [worryReleasing, setWorryReleasing] = useState(false);
  const [worryReleased, setWorryReleased] = useState(false);

  const [showPeriodCame, setShowPeriodCame] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem('lateCircleOnboarded');
    if (!onboarded) {
      router.push('/onboarding');
      return;
    }

    const savedDate = localStorage.getItem('lateCircleLastPeriod');
    if (savedDate) setLastPeriodDate(savedDate);

    const savedData = localStorage.getItem('lateCircleData');
    const savedDateForData = localStorage.getItem('lateCircleDataDate');
    const todayKey = localDateKey();

    if (savedData && savedDateForData === todayKey) {
      setCircles(JSON.parse(savedData));
    } else {
      const empty = { food: false, walk: false, sleep: false, calm: false };
      setCircles(empty);
      localStorage.setItem('lateCircleData', JSON.stringify(empty));
      localStorage.setItem('lateCircleDataDate', todayKey);
    }

    const savedHoldMe = localStorage.getItem('lateCircleHoldMe');
    if (savedHoldMe) setHoldMeActive(JSON.parse(savedHoldMe));

    const lastClaimDate = localStorage.getItem('lateCircleLastClaimDate');
    if (lastClaimDate === localDateKey()) {
      setHasClaimedToday(true);
    }

    const savedLog = localStorage.getItem('lateCircleLastFoodLog');
    if (savedLog) {
      const log = JSON.parse(savedLog);
      if (log.score === 'Red') {
        setOviPattern(`Yesterday you ate ${log.name} at ${log.time}. It was heavy and late. Tomorrow focus: Eat before 8pm. Same food, just earlier.`);
      }
    }

    const savedNightClosed = localStorage.getItem('lateCircleNightClosed');
    if (savedNightClosed === 'true') setIsNightClosed(true);

    const promised = localStorage.getItem('lateCirclePromised7Days');
    const commitDate = localStorage.getItem('lateCircleCommitDate');
    if (promised === 'true' && commitDate) {
      const commit = new Date(commitDate);
      const today = new Date();
      commit.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      const daysSince = Math.floor((today.getTime() - commit.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      if (daysSince >= 1 && daysSince <= 7) {
        setPromiseDay(daysSince);
      } else if (daysSince > 7) {
        setPromiseDay(null);
        localStorage.removeItem('lateCirclePromised7Days');
        localStorage.removeItem('lateCircleCommitDate');
      }
    }

    const savedPrevPeriod = localStorage.getItem('lateCirclePrevPeriod');
    const savedCycleType = localStorage.getItem('lateCircleType');
    const realAvg = getRealCycleLength(savedDate, savedPrevPeriod, savedCycleType);
    setRealCycleLength(realAvg);

    const savedPhase = localStorage.getItem('lateCircleLastPhase');
    const cycleDataForPhase = getCycleData(savedDate, [realAvg]);
    const currentPhaseData = getCyclePhase(cycleDataForPhase.currentDay, cycleDataForPhase.average);

    const dailyHistory = JSON.parse(localStorage.getItem('lateCircleDailyHistory') || '{}');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = localDateKey(yesterday);
    const yesterdayData = dailyHistory[yesterdayStr];
    const yesterdayCount: number | null = yesterdayData ? yesterdayData.count : null;

    let greeting = '';
    try {
      greeting = getMorningGreeting(currentPhaseData.id as PhaseId, yesterdayCount) || '';
    } catch {
      greeting = '';
    }
    setMorningGreeting(greeting);

    if (savedPhase !== currentPhaseData.id) {
      if (!greeting) setShowOviWelcome(true);
      localStorage.setItem('lateCircleLastPhase', currentPhaseData.id);
    }

    setTodayStr(new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }));
    setNowHour(new Date().getHours());
    
    async function fetchFoods() {
      const { data, error } = await supabase.from('foods').select('*').order('name');
      if (data) setDbFoods(data);
      if (error) console.error("Error fetching foods:", error);
    }
    fetchFoods();
    
    trackAppOpened(cycleDataForPhase.currentDay);
        
    const pushAsked = localStorage.getItem('lateCirclePushAsked');
    if (!pushAsked && 'Notification' in window) {
      setTimeout(() => setShowPushPrompt(true), 3000);
    }
    
    if (!savedHoldMe) {
      const lastAsked = localStorage.getItem('lateCircleLastHoldMeAsked');
      const now = Date.now();
      const cooldownMs = 3 * 24 * 60 * 60 * 1000;
      
      const isCooldownOver = !lastAsked || (now - parseInt(lastAsked, 10) > cooldownMs);

      if (isCooldownOver) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dayBefore = new Date();
        dayBefore.setDate(dayBefore.getDate() - 2);
        
        const yStr = localDateKey(yesterday);
        const dbStr = localDateKey(dayBefore);
        
        const yData = dailyHistory[yStr];
        const dbData = dailyHistory[dbStr];

        const hardest = currentPhaseData.focus[0]; 
        
        if (yData && dbData && !yData[hardest] && !dbData[hardest]) {
          setTriggerCircle(hardest as any);
          setShowHoldMeTrigger(true);
        }
      }
    }

    setIsLoaded(true);
  }, [router]);

  useEffect(() => {
    if (!searchParams) return;
    const trigger = searchParams.get('trigger');
    if (!trigger) return;

    const timer = setTimeout(() => {
      if (trigger === 'calm') {
        setActiveModal('calm');
        setCalmView('menu');
        logEvent('late_console_action_opened', { action: 'calm' });
      } else if (trigger === 'sleep') {
        setActiveModal('sleep');
        logEvent('late_console_action_opened', { action: 'sleep' });
      } else if (trigger === 'food') {
        setActiveModal('food');
        setShowFoodDetails(false);
        setShowFoodLog(false);
        logEvent('late_console_action_opened', { action: 'food' });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (calmView === 'breathing' && breathTime > 0) {
      timer = setTimeout(() => setBreathTime((prev) => prev - 1), 1000);
    } else if (calmView === 'breathing' && breathTime === 0) {
      saveState({ calm: true });
      setActiveModal(null);
      setCalmView(null);
      setShowWinCelebration(true);
      setTimeout(() => setShowWinCelebration(false), 2500);
      const realAvg = getRealCycleLength(
        localStorage.getItem('lateCircleLastPeriod'),
        localStorage.getItem('lateCirclePrevPeriod'),
        localStorage.getItem('lateCircleType')
      );
      const cd = getCycleData(localStorage.getItem('lateCircleLastPeriod'), [realAvg]);
      logEvent('circle_closed', { circle: 'calm', day: cd.currentDay, method: 'breathing' });
    }
    return () => clearTimeout(timer);
  }, [calmView, breathTime]);

  const cycleData = getCycleData(lastPeriodDate, [realCycleLength]);
  const girl = getCyclePhase(cycleData.currentDay, cycleData.average);
  
  const historyFromStorage = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lateCircleHistory') || '[]') : [];
  const cycleBounds = getLateBoundary(historyFromStorage, lastPeriodDate, typeof window !== 'undefined' ? localStorage.getItem('lateCircleType') : null);
  const isLate = cycleBounds.isLate;
  const lateDays = cycleBounds.daysLate;

  const copy = getClaimCopy(lateDays);

  const saveState = (updates: Partial<typeof circles>) => {
    const stored = localStorage.getItem('lateCircleData');
    const current = stored ? JSON.parse(stored) : circles;
    const newState = { ...current, ...updates };
    
    setCircles(newState);
    localStorage.setItem('lateCircleData', JSON.stringify(newState));
    localStorage.setItem('lateCircleDataDate', localDateKey());

    const today = localDateKey();
    const closedCount = [newState.food, newState.walk, newState.sleep, newState.calm].filter(Boolean).length;
    
    let history = JSON.parse(localStorage.getItem('lateCircleDailyHistory') || '{}');
    history[today] = {
      count: closedCount,
      food: newState.food,
      walk: newState.walk,
      sleep: newState.sleep,
      calm: newState.calm
    };
    
    const keys = Object.keys(history).sort();
    if (keys.length > 60) delete history[keys[0]];
    
    localStorage.setItem('lateCircleDailyHistory', JSON.stringify(history));
  };

  const completeCircle = (circle: 'food' | 'sleep' | 'calm') => {
    saveState({ [circle]: true });
    setActiveModal(null); 
    setShowFoodDetails(false);
    setCalmView(null);
    setShowActionSheet(false);
    logEvent('circle_closed', { circle, day: cycleData.currentDay });
  };

  const handleWalk = () => {
    saveState({ walk: true });
    setShowActionSheet(false);
    setShowWinCelebration(true);
    setTimeout(() => setShowWinCelebration(false), 2500);
    logEvent('circle_closed', { circle: 'walk', day: cycleData.currentDay });
  };

  const startHoldMe = (circle: 'sleep' | 'food' | 'movement' | 'calm') => {
    const newState = { circle, day: 1 };
    localStorage.setItem('lateCircleHoldMe', JSON.stringify(newState));
    setHoldMeActive(newState);
    setShowHoldMePicker(false);
    logEvent('hold_me_started', { circle });
  };

  const canCompleteToday = () => {
    if (!holdMeActive) return true;
    const lastDate = localStorage.getItem('lateCircleHoldMeLastDate');
    return lastDate !== localDateKey();
  };

  const completeHoldMeDay = () => {
    if (!holdMeActive) return;
    const nextDay = holdMeActive.day + 1;
    
    setShowWinCelebration(true);
    
    setTimeout(() => {
      setShowWinCelebration(false);
      
      if (nextDay > 7) {
        logEvent('hold_me_graduated', { circle: holdMeActive.circle });
        setShowGraduation(true);
        
        setTimeout(() => {
          localStorage.removeItem('lateCircleHoldMe');
          setHoldMeActive(null);
        }, 500); 
      } else {
        const newState = { ...holdMeActive, day: nextDay };
        localStorage.setItem('lateCircleHoldMe', JSON.stringify(newState));
        setHoldMeActive(newState);
        logEvent('hold_me_day_completed', { circle: holdMeActive.circle, day: holdMeActive.day });
      }
    }, 2500); 
  };

  const handleClaim = () => {
    localStorage.setItem('lateCircleLastClaimDate', localDateKey());
    setHasClaimedToday(true);
    setClaimStep(1);
    setWorryReleasing(false);
    setWorryReleased(false);
    setShowClaimFlow(true);
    logEvent('claim_started', { lateDays });
  };

  const handlePeriodCame = () => {
    setShowPeriodCame(true);
    localStorage.setItem('lateCircleLastPeriod', new Date().toISOString());
    
    const newHistory = [...JSON.parse(localStorage.getItem('lateCircleHistory') || '[]'), lastPeriodDate];
    localStorage.setItem('lateCircleHistory', JSON.stringify(newHistory));
    localStorage.removeItem('lateCircleLastClaimDate');
    localStorage.removeItem('lateCircleHoldMe');
    
    logEvent('period_came', { claimed: hasClaimedToday });
  };

  const isWalkDone = circles.walk;
  const closedCount = [circles.food, isWalkDone, circles.sleep, circles.calm].filter(Boolean).length;

  const cyclePercent = (closedCount / 4) * 100;
  const ringRadius = 65; 
  const circleCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circleCircumference - (Math.min(cyclePercent, 100) / 100) * circleCircumference;

  const filteredFoods = dbFoods.filter(f => {
    if (searchQuery.trim() === '') return true; 
    const foodName = f.name.toLowerCase();
    const search = searchQuery.toLowerCase().trim();
    return foodName.includes(search);
  });

  const toggleFoodSelection = (food: Food) => {
    if (selectedFoods.find(f => f.id === food.id)) {
      setSelectedFoods(selectedFoods.filter(f => f.id !== food.id));
    } else {
      setSelectedFoods([...selectedFoods, food]);
      logEvent('food_search_used', {
        query: searchQuery.trim() || null,
        food: food.name,
        score: food.score,
      });
    }
  };

  let plateScore: 'Green' | 'Yellow' | 'Red' = 'Green';
  let plateFix = "This is a good choice. It will keep your sugar steady.";

  if (selectedFoods.length > 0) {
    const hasRed = selectedFoods.some(f => f.score === 'Red');
    if (hasRed) {
      plateScore = 'Red';
      plateFix = selectedFoods.find(f => f.score === 'Red')?.fix || "Add protein to make it Green.";
    } else if (selectedFoods.length > 1) {
      plateScore = 'Green';
    } else {
      plateScore = selectedFoods[0].score;
      plateFix = selectedFoods[0].fix;
    }
  }

  const logFood = (didAddFix: boolean) => {
    if (selectedFoods.length === 0) return;
    const currentHour = new Date().getHours();
    let finalScore = plateScore;
    if (didAddFix) finalScore = 'Green';

    const newLog = {
      name: selectedFoods.map(f => f.name).join(' + '),
      score: finalScore,
      time: currentHour >= 12 ? `${currentHour === 12 ? 12 : currentHour - 12} PM` : `${currentHour === 0 ? 12 : currentHour} AM`
    };
    localStorage.setItem('lateCircleLastFoodLog', JSON.stringify(newLog));

    setActiveModal(null);
    setShowFoodDetails(false);
    setShowFoodLog(false);
    setSearchQuery(''); 
    setSelectedFoods([]); 

    saveState({ food: true });
    setShowWinCelebration(true);
    setTimeout(() => setShowWinCelebration(false), 2500);
    logEvent('circle_closed', { circle: 'food', day: cycleData.currentDay });
  };

  const openCalmMenu = () => {
    setActiveModal('calm');
    setCalmView('menu');
  };

  if (!isLoaded) return <div className="h-screen w-full bg-[#FFF0F3]" />;

  const getBigButtonText = () => {
    if (closedCount === 4) {
      if (nowHour >= 19) return "I'm done for today 💚";
      return "All 4 closed. Come back tonight 🌙";
    }
    if (closedCount === 0) return "Start my circles ➔";
    if (closedCount === 3) return "Finish my last circle ➔";
    return "Close my next circle ➔";
  };

  // 14-day text
  const claimMessages = [
    "I have it now. You just started, and I am already with you.",
    "I heard you. I will hold it while your body does its work.",
    "It's still on its way. You can put this worry down for today.",
    "Your body heard you too. I will keep this worry safe for you.",
    "You don't have to worry it into coming anymore. I have it now.",
    "You did enough today. I will carry the rest.",
    "You are not behind. I am not going anywhere.",
    "I have it. You can let go for today.",
    "Breathe. I am holding this for you.",
    "You are still held. Even now.",
    "I am still here. You are not carrying this alone anymore.",
    "Your body is for you. I will remind you of that when you forget.",
    "One more day, together. I have you.",
    "It's done. You can rest now. I will stay until it comes."
  ];
  const claimDayText = lateDays < 1 ? claimMessages[0] : lateDays > 14 ? claimMessages[13] : claimMessages[lateDays - 1];

  return (
    <main className={`h-screen overflow-y-auto flex flex-col items-center pt-8 px-6 font-sans relative animate-page-enter transition-colors duration-500 ${isLate ? 'bg-[#FFE5EC]' : 'bg-[#FFF0F3]'} text-[#4A2C35]`}>
      
      {showWinCelebration && (
        <div className="absolute inset-0 z-200 flex flex-col items-center justify-center bg-[#FFF0F3]/95 backdrop-blur-md animate-fade-in">
          <div className="w-32 h-32 rounded-full bg-[#9CAF88] flex items-center justify-center mb-6 animate-pop-in shadow-[0_0_60px_rgba(156,175,136,0.3)]">
            <span className="text-7xl text-white font-bold">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-[#4A2C35] mb-2 animate-slide-up-slow">You did well.</h2>
          <p className="text-sm text-[#4A2C35]/60 animate-slide-up-slow">
            {holdMeActive ? `Day ${holdMeActive.day} completed 💚` : 'Circle closed Green 💚'}
          </p>
        </div>
      )}

      {showPeriodCame && (
        <div className="absolute inset-0 bg-[#FFF0F3] z-200 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-[#8A2C3E] mb-4 animate-pop-in">IT CAME! ✨</h1>
          <p className="text-lg text-[#4A2C35] font-bold mb-2">See, Fine Girl? I told you it was on its way to you.</p>
          <p className="text-sm text-[#4A2C35]/70 mb-8">You claimed it. You carried it. You waited. And it came.</p>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm mb-10 w-full max-w-sm">
             <p className="text-sm text-[#4A2C35] leading-relaxed">
               And remember that worry I was carrying for you? I am giving it back to you now, but it's empty. You don't need it anymore. You can drop it.
             </p>
          </div>

          <div className="bg-white p-4 rounded-2xl mb-8 w-full max-w-sm flex justify-between items-center shadow-sm">
             <span className="text-sm font-bold">How do you feel?</span>
             <div className="flex gap-2">
               <button className="text-2xl active:scale-90">😴</button>
               <button className="text-2xl active:scale-90">😊</button>
               <button className="text-2xl active:scale-90">🤕</button>
             </div>
          </div>

          <button onClick={() => { setShowPeriodCame(false); router.push('/cycle'); }} className="w-full max-w-sm bg-[#4A2C35] text-white py-4 rounded-full font-bold active:scale-95 shadow-lg">
            Yes! It Came, Fine Girl ✨
          </button>
        </div>
      )}

      {showOviWelcome && (
        <div className="fixed inset-0 bg-[#4A2C35]/20 backdrop-blur-sm z-110 flex items-start justify-center pt-12 p-6 animate-fade-in">
          <div className="bg-white border border-[#4A2C35]/5 rounded-3xl p-6 w-full max-w-sm shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFF0F3] flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{girl.emoji}</span>
            </div>
            <h3 className="text-xl font-bold text-[#4A2C35] mb-2">Welcome to {girl.name}.</h3>
            <p className="text-sm text-[#4A2C35]/70 mb-6 leading-relaxed italic">
              "{oviWelcome[girl.id as PhaseId]}"
            </p>
            <div className="bg-[#FFF0F3] border border-[#4A2C35]/10 rounded-2xl p-4 mb-6 w-full text-left">
              <h4 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-2">Your circles today</h4>
              <p className="text-sm font-bold text-[#4A2C35] capitalize">
                {girl.focus.join(' + ')}
              </p>
            </div>
            <button onClick={() => setShowOviWelcome(false)} className="w-full bg-[#4A2C35] text-white py-3 rounded-full font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(74,44,53,0.2)]">
              Okay, Ovi
            </button>
          </div>
        </div>
      )}

      {!holdMeActive && (
        <div className="flex flex-col items-center w-full relative mb-2 px-8 text-center mt-2 shrink-0">
          <h1 className="text-2xl font-serif text-[#4A2C35] mb-1 tracking-[0.2em]">{isLate ? 'LATE MODE' : 'YOUR CIRCLE'}</h1>
          <p className="text-[#4A2C35]/50 text-xs font-medium">Today • {todayStr}</p>
          
          {promiseDay && !isLate && (
            <div className="mt-2 bg-[#FFF0F3] border border-[#4A2C35]/10 px-3 py-1 rounded-full shadow-sm">
              <p className="text-[10px] font-bold text-[#4A2C35]/70">Day {promiseDay} of your 7-day promise 💚</p>
            </div>
          )}

          {isLate && (
            <div className="mt-2 bg-[#FFB3C1]/30 border border-[#FF8FA3]/30 px-4 py-1.5 rounded-full shadow-sm mb-2">
              <p className="text-[11px] font-bold text-[#8A2C3E]">Late Mode ✨ Ovi is carrying it for you</p>
            </div>
          )}

          <p className={`mt-1 text-[13px] leading-relaxed px-4 max-w-xs ${isLate ? 'font-bold' : 'text-[#4A2C35]/70'}`}>
            {isLate ? "I am here, Fine Girl. I know you are late." : morningGreeting}
          </p>
        </div>
      )}

      {showPushPrompt && (
        <div className="w-full max-w-sm bg-white border border-[#9CAF88]/30 rounded-2xl p-4 mb-4 shadow-sm animate-slide-down">
          <h3 className="text-sm font-bold text-[#4A2C35] mb-1">Ovi wants to check on you.</h3>
          <p className="text-xs text-[#4A2C35]/60 mb-3 leading-relaxed">
            If you allow notifications, I can remind you to rest, eat, and sleep. No spam. Just me.
          </p>
          <div className="flex gap-2">
            <button 
              onClick={async () => {
                localStorage.setItem('lateCirclePushAsked', 'true');
                setShowPushPrompt(false);
                await subscribeToPush();
              }} 
              className="flex-1 bg-[#4A2C35] text-white py-2 rounded-xl text-xs font-bold active:scale-95"
            >
              Yes, Ovi
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('lateCirclePushAsked', 'true');
                setShowPushPrompt(false);
              }} 
              className="flex-1 bg-[#FFF0F3] text-[#4A2C35]/60 border border-[#4A2C35]/10 py-2 rounded-xl text-xs font-bold active:scale-95"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {isLate && (
        <div className="w-full max-w-sm mb-4 mt-2">
          {!hasClaimedToday ? (
            <div className="flex flex-col items-center">
              <button 
                onClick={handleClaim}
                className="w-full py-4 rounded-full text-[16px] font-bold bg-[#FF8FA3] text-white shadow-[0_8px_30px_rgba(255,143,163,0.4)] animate-soft-glow active:scale-95 transition-transform"
              >
                I Claim My Period 🌸
              </button>
              <p className="text-[10px] text-[#8A2C3E]/70 mt-2 font-medium text-center px-4">
                {copy.subtext}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#FF8FA3]/30 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-[13px] font-bold text-[#8A2C3E]">{copy.claimedButton}</p>
              <p className="text-[11px] text-[#8A2C3E]/70 mt-1">{copy.claimedSub}</p>
            </div>
          )}
        </div>
      )}

      <InstallHint />

      {!holdMeActive && (
        <button
          onClick={() => router.push('/cycle')}
          className={`relative shrink-0 mt-2 mb-2 active:scale-95 transition-transform ${isLate ? 'opacity-70' : ''}`}
          style={{ width: '160px', height: '160px' }}
        >
          <svg className="absolute inset-0 transform -rotate-90" width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={ringRadius} fill="transparent" stroke="rgba(74, 44, 53, 0.08)" strokeWidth="20" />
            <circle
              cx="80" cy="80" r={ringRadius} fill="transparent"
              stroke={isLate ? "#FF8FA3" : "#9CAF88"} strokeWidth="20"
              strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset}
              strokeLinecap="round" className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="flex items-baseline justify-center gap-1 leading-none">
              <span className="text-4xl font-bold tracking-tighter text-[#4A2C35]">
                {closedCount}
              </span>
              <span className="text-lg text-[#4A2C35]/30 font-medium">/ 4</span>
            </div>
            <span className="text-[9px] text-[#4A2C35]/50 mt-1 font-bold tracking-widest uppercase">wins</span>
          </div>
        </button>
      )}

      <div className="w-full max-w-sm text-center mb-4 shrink-0">
        {isLate ? (
          <p className="text-[13px] text-[#8A2C3E] font-bold">
            You don't have to do everything today. <br/> Just 2. I will carry the rest.
          </p>
        ) : (
          <>
            <p className="text-[#4A2C35] text-sm font-medium mb-1">
              Today's focus: <span className="capitalize font-bold">{girl.focus.join(' + ')}</span>
            </p>
            <p className="text-[#4A2C35]/50 text-xs">
              Close 2 to win today. 4 is a full circle 💚
            </p>
          </>
        )}
      </div>

      {holdMeActive ? (
        <div className="w-full max-w-sm animate-slide-up shrink-0 mb-4 mt-6">
          {morningGreeting && (
            <p className="text-center text-[13px] leading-relaxed px-4 mb-4 text-[#4A2C35]/70">
              {morningGreeting}
            </p>
          )}

          <div className="bg-white border border-[#9CAF88]/30 rounded-3xl p-6 shadow-[0_16px_32px_-12px_rgba(74,44,53,0.1)]">
            <div className="flex flex-col items-center mb-5 pb-4">
              <p className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-1">
                Ovi is holding you
              </p>
              <h3 className="text-xl font-bold text-[#4A2C35] mb-3 capitalize">
                {HOLD_ME_DATA[holdMeActive.circle].emoji} {holdMeActive.circle}
              </h3>
              <span className="text-[10px] font-bold text-[#9CAF88] bg-[#9CAF88]/10 px-3 py-1 rounded-full">
                Day {holdMeActive.day} of 7
              </span>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <div
                  key={day}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    day < holdMeActive.day
                      ? 'bg-[#9CAF88] text-white'
                      : day === holdMeActive.day
                      ? 'bg-[#FFF0F3] border-2 border-[#9CAF88] text-[#9CAF88] animate-pulse'
                      : 'bg-[#FFF0F3] text-[#4A2C35]/20'
                  }`}
                >
                  {day < holdMeActive.day ? '✓' : day}
                </div>
              ))}
            </div>

            <p className="text-[15px] text-[#4A2C35]/90 italic mb-4 leading-relaxed text-center font-medium">
              "{HOLD_ME_DATA[holdMeActive.circle].days[holdMeActive.day - 1]?.morning}"
            </p>

            <div className="bg-[#FFF0F3] p-5 rounded-2xl mb-6 text-[14px] text-[#4A2C35] leading-relaxed text-center shadow-inner">
              <span className="font-bold block mb-2 text-[10px] text-[#9CAF88] uppercase tracking-widest">
                Today's task
              </span>
              {HOLD_ME_DATA[holdMeActive.circle].days[holdMeActive.day - 1]?.task}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  if (canCompleteToday()) {
                    localStorage.setItem('lateCircleHoldMeLastDate', localDateKey());
                    completeHoldMeDay();
                  }
                }}
                disabled={!canCompleteToday()}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
                  canCompleteToday() 
                    ? 'bg-[#4A2C35] text-white active:scale-95 shadow-lg shadow-[#4A2C35]/20' 
                    : 'bg-[#9CAF88]/20 text-[#9CAF88] cursor-default'
                }`}
              >
                {canCompleteToday() ? 'I did it ✨' : 'Done for today 💚'}
              </button>
              
              {canCompleteToday() && (
                <button
                  onClick={() => {
                    setHoldMeMissedMessage(
                      HOLD_ME_DATA[holdMeActive.circle].days[holdMeActive.day - 1]?.missed
                        || "It's okay. I am still holding you."
                    );
                  }}
                  className="w-full bg-white text-[#4A2C35]/50 border border-[#4A2C35]/10 py-3.5 rounded-xl text-sm font-bold active:scale-95"
                >
                  Not today
                </button>
              )}

              {holdMeActive.day > 1 && (
                <button
                  onClick={() => setShowEndHoldConfirm(true)} 
                  className="w-full text-[10px] text-[#4A2C35]/30 underline mt-3 active:opacity-50"
                >
                  End this hold
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowHoldMePicker(true)}
          className="w-full max-w-sm mt-3 mb-6 mx-auto flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white border border-[#4A2C35]/20 text-[#4A2C35] text-[13px] font-bold active:scale-95 transition-all shadow-sm"
        >
          <span className="flex items-center gap-1.5">
            Some days are too hard. Hold me 🤍
          </span>
          <span className="text-[#4A2C35]/40">➔</span>
        </button>
      )}

      {!holdMeActive && (
        <div className={`w-full max-w-sm bg-white rounded-3xl p-5 shadow-[0_8px_24px_-8px_rgba(74,44,53,0.06)] mb-4 shrink-0 ${isLate ? 'border border-[#FF8FA3]/20' : ''}`}>
          <div className="flex flex-col gap-3">
            {(isLate ? ['food', 'calm'] : ['food', 'walk', 'sleep', 'calm']).map((circleKey) => {
              const isDone = circles[circleKey as keyof typeof circles];
              const isPriority = girl.focus.includes(circleKey);
              return (
                <div key={circleKey} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{isDone ? '✓' : circleKey === 'food' ? '🍲' : circleKey === 'walk' ? '👟' : circleKey === 'sleep' ? '🌙' : '🧠'}</span>
                    <span className="text-sm font-medium capitalize">{circleKey}</span>
                  </div>
                  <span className={`text-xs font-bold ${isDone ? 'text-[#9CAF88]' : isPriority ? 'text-[#FF8FA3]' : 'text-[#4A2C35]/40'}`}>
                    {isDone ? 'Closed' : isPriority ? 'Priority ✨' : 'Open'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!holdMeActive && (
        <div className="w-full max-w-sm flex flex-col items-center mb-32 mt-auto shrink-0">
          <button 
            onClick={() => { 
              if (closedCount >= 2 && nowHour >= 19) { 
                setShowGoodnight(true); 
              } else if (closedCount === 4) {
                // All 4 closed before 7pm
              } else { 
                setShowActionSheet(true); 
              } 
            }} 
            className={`w-full py-4 rounded-full text-[16px] font-bold transition-all ${
              closedCount >= 2 && nowHour >= 19
                ? 'bg-[#4A2C35] text-white shadow-[0_4px_20px_rgba(74,44,53,0.3)] animate-pulse active:scale-95' 
                : closedCount === 4
                ? 'bg-[#9CAF88]/60 text-white shadow-[0_4px_20px_rgba(156,175,136,0.2)] cursor-default'
                : isLate 
                ? 'bg-[#FF8FA3] text-white shadow-[0_4px_20px_rgba(255,143,163,0.3)] active:scale-95'
                : 'bg-[#9CAF88] text-white shadow-[0_4px_20px_rgba(156,175,136,0.3)] active:scale-95'
            }`}
          >
            {getBigButtonText()}
          </button>
        </div>
      )}

      {/* CLAIM FLOW MODAL */}
      {showClaimFlow && (
        <div className="fixed inset-0 bg-[#FFF0F3] z-200 flex flex-col items-center justify-center p-6 pb-24 animate-fade-in text-center overflow-y-auto">
          
          {/* STEP 1: Proof */}
          {claimStep === 1 && (
            <div className="animate-fade-in-slow w-full max-w-sm flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#FFB3C1]/20 flex items-center justify-center mb-8 animate-pop-in-slow">
                <span className="text-4xl">✨</span>
              </div>
              
              <h1 className="text-xl font-bold text-[#8A2C3E] mb-4 leading-snug px-4">
                Claimed, Fine Girl. ✨
              </h1>
              <p className="text-sm text-[#4A2C35]/80 mb-10 font-medium px-4 leading-relaxed">
                {claimDayText}
              </p>
              
              <button 
                onClick={() => setClaimStep(2)} 
                className="w-full bg-[#FF8FA3] text-white py-3.5 rounded-full font-bold shadow-[0_8px_20px_rgba(255,143,163,0.3)] active:scale-95 text-sm"
              >
                Take this worry from me 🤍
              </button>
            </div>
          )}

          {/* STEP 2: Worry Float Away */}
          {claimStep === 2 && (() => {
            const recentTags = typeof window !== 'undefined'
              ? JSON.parse(localStorage.getItem('lateCircleTags') || '[]')
              : [];
            const worry = getWorryForTags(recentTags);

            return (
              <div className="animate-fade-in-slow w-full max-w-sm flex flex-col items-center text-center">
                <h1 className="text-xl font-bold text-[#8A2C3E] mb-2">
                  {worryReleasing ? "Give it to me." : "What is on your mind?"}
                </h1>
                <p className="text-sm text-[#4A2C35]/60 mb-10">
                  {worryReleasing ? "I am carrying it now." : "Let it float away."}
                </p>

                <div className="relative w-full h-48 flex items-center justify-center mb-8">
                  {!worryReleased && (
                    <div
                      className={`absolute max-w-70 px-6 py-4 rounded-full bg-[#FFF0F3] border border-[#FFB3C1]/40 shadow-[0_8px_30px_rgba(255,143,163,0.15)] transition-all ease-in-out ${
                        worryReleasing
                          ? 'opacity-0 -translate-y-24 scale-50 blur-md'
                          : 'opacity-100 translate-y-0 scale-100'
                      }`}
                      style={{ transitionDuration: '2500ms' }}
                    >
                      <p className="text-[13px] text-[#8A2C3E] font-medium italic leading-snug">
                        "{worry.worry}"
                      </p>
                    </div>
                  )}

                  {worryReleased && (
                    <div className="flex gap-2 animate-fade-in">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FFB3C1]/60 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-[#FFB3C1]/40 animate-pulse delay-150" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FFB3C1]/60 animate-pulse delay-300" />
                    </div>
                  )}
                </div>

                {!worryReleasing && (
                  <button
                    onClick={() => {
                      setWorryReleasing(true);
                      setTimeout(() => {
                        setWorryReleased(true);
                        logEvent('claim_worry_released', { worry: worry.worry });
                        setTimeout(() => {
                          setClaimStep(3);
                        }, 2500);
                      }, 2500);
                    }}
                    className="w-full bg-[#FF8FA3] text-white py-3.5 rounded-full font-bold shadow-[0_8px_20px_rgba(255,143,163,0.3)] active:scale-95 text-sm"
                  >
                    Take this worry from me 🤍
                  </button>
                )}

                {worryReleased && (
                  <p className="text-[15px] text-[#4A2C35]/80 font-medium leading-relaxed animate-fade-in px-4">
                    {worry.oviRelease}
                  </p>
                )}
              </div>
            );
          })()}

          {/* STEP 3: Ovi Suggests Calm */}
          {claimStep === 3 && (
            <div className="animate-fade-in-slow w-full max-w-sm flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#9CAF88]/15 flex items-center justify-center mb-6 animate-pop-in-slow">
                <span className="text-4xl">🌿</span>
              </div>
              
              <h1 className="text-xl font-bold text-[#8A2C3E] mb-3">
                I am holding the worry now.
              </h1>
              <p className="text-sm text-[#4A2C35]/70 mb-8 px-4 leading-relaxed">
                You can rest. Let's take 90 seconds to help your body relax while we wait.
              </p>

              <div className="w-full bg-white border border-[#9CAF88]/30 rounded-2xl p-4 mb-4 shadow-sm">
                <p className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-2">Ovi suggests</p>
                <p className="text-sm text-[#4A2C35] font-medium leading-relaxed">
                  Let's do 90 seconds of Calm together.
                </p>
              </div>
              
              <button 
                onClick={() => {
                  setShowClaimFlow(false);
                  setClaimStep(1);
                  setWorryReleasing(false);
                  setWorryReleased(false);
                  setActiveModal('calm');
                  setCalmView('menu');
                  logEvent('claim_redirected_to_calm', {});
                }} 
                className="w-full bg-[#4A2C35] text-white py-3.5 rounded-full font-bold shadow-lg active:scale-95 text-sm mb-3"
              >
                Okay, let's do 90s of Calm 🤍
              </button>

              <button 
                onClick={() => {
                  setShowClaimFlow(false);
                  setClaimStep(1);
                  setWorryReleasing(false);
                  setWorryReleased(false);
                  logEvent('claim_calm_declined', {});
                }} 
                className="w-full bg-white border border-[#4A2C35]/15 text-[#4A2C35]/70 py-3.5 rounded-full font-bold active:scale-95 transition-all text-sm shadow-sm"
              >
                Not now, Ovi
              </button>
            </div>
          )}
        </div>
      )}

      {showActionSheet && (
        <div className="fixed inset-0 bg-[#4A2C35]/20 backdrop-blur-sm z-100 flex items-center justify-center p-6 animate-fade-in" onClick={() => setShowActionSheet(false)}>
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#4A2C35]">What did you do?</h3>
              <button onClick={() => setShowActionSheet(false)} className="w-8 h-8 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#4A2C35]/60 font-bold">✕</button>
            </div>
            
            <div className="flex flex-col gap-3">
              
              <div className={`flex flex-col p-4 rounded-2xl border transition-all ${circles.food ? 'bg-[#9CAF88]/10 border-[#9CAF88]/30' : 'bg-white border-[#4A2C35]/5 shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF0F3] flex items-center justify-center text-xl">🍲</div>
                    <div className="text-left">
                      <h3 className="font-bold text-[#4A2C35]">Food</h3>
                      <p className="text-[10px] text-[#4A2C35]/50">{circles.food ? 'Completed 💚' : 'Eat balanced, before 9pm'}</p>
                    </div>
                  </div>
                  {!circles.food && (
                    <button onClick={() => { setShowActionSheet(false); setActiveModal('food'); setShowFoodDetails(false); setShowFoodLog(false); }} className="text-[#4A2C35]/30 text-lg">➔</button>
                  )}
                </div>
              </div>

              <div className={`flex flex-col p-4 rounded-2xl border transition-all ${isWalkDone ? 'bg-[#9CAF88]/10 border-[#9CAF88]/30' : 'bg-white border-[#4A2C35]/5 shadow-sm'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E8F0E0] flex items-center justify-center text-xl">👟</div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-[#4A2C35]">Walk</h3>
                    <p className="text-[10px] text-[#4A2C35]/50">{isWalkDone ? 'Completed 💚' : 'Did you move 20 mins?'}</p>
                  </div>
                  {!isWalkDone && (
                    <button onClick={handleWalk} className="bg-[#9CAF88] text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95">Yes</button>
                  )}
                </div>
              </div>

              <div className={`flex flex-col p-4 rounded-2xl border transition-all ${circles.sleep ? 'bg-[#9CAF88]/10 border-[#9CAF88]/30' : 'bg-white border-[#4A2C35]/5 shadow-sm'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF0F3] flex items-center justify-center text-xl">🌙</div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-[#4A2C35]">Sleep</h3>
                    <p className="text-[10px] text-[#4A2C35]/50">{circles.sleep ? 'Completed 💚' : 'In bed by 10:30pm?'}</p>
                  </div>
                  {!circles.sleep && (
                    <button onClick={() => { saveState({ sleep: true }); setShowActionSheet(false); setShowWinCelebration(true); setTimeout(() => setShowWinCelebration(false), 2500); logEvent('circle_closed', { circle: 'sleep', day: cycleData.currentDay }); }} className="bg-[#9CAF88] text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95">Yes</button>
                  )}
                </div>
              </div>

              <div className={`flex flex-col p-4 rounded-2xl border transition-all ${circles.calm ? 'bg-[#9CAF88]/10 border-[#9CAF88]/30' : 'bg-white border-[#4A2C35]/5 shadow-sm'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EDE8FF] flex items-center justify-center text-xl">🧠</div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-[#4A2C35]">Calm</h3>
                    <p className="text-[10px] text-[#4A2C35]/50">{circles.calm ? 'Completed 💚' : 'Did 90 secs of calm?'}</p>
                  </div>
                  {!circles.calm && (
                    <button onClick={() => { setShowActionSheet(false); openCalmMenu(); }} className="bg-[#9CAF88] text-white px-3 py-2 rounded-xl text-[10px] font-bold active:scale-95">Start 90s →</button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeModal && activeModal !== 'calm' && (
        <div className="absolute inset-0 bg-[#4A2C35]/20 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-[#4A2C35] shadow-2xl animate-slide-up border border-[#4A2C35]/5">
            {activeModal === 'food' && (
              <div className="flex flex-col max-h-[75vh]">
                {!showFoodLog ? (
                  <>
                    <h3 className="text-lg font-bold mb-4 text-[#4A2C35] leading-snug">Did you eat balanced plates today with Nigerian food? No food after 9pm?</h3>
                    <div className="bg-[#FFF0F3] border border-[#FFB3C1]/30 rounded-2xl p-4 mb-4">
                      <ul className="text-[13px] text-[#4A2C35]/80 space-y-1.5">
                        <li>• Rice + stew + protein + vegetable</li>
                        <li>• Eba / fufu + soup + protein</li>
                        <li>• Yam / beans + vegetable + protein</li>
                        <li>• Indomie + egg + vegetable</li>
                      </ul>
                    </div>
                    <p className="text-[11px] text-[#9CAF88] font-semibold mb-5">Rule: Last food before 9pm</p>
                    <div className="flex gap-3 mt-auto">
                      <button onClick={() => { saveState({ food: true }); setActiveModal(null); setShowWinCelebration(true); setTimeout(() => setShowWinCelebration(false), 2500); logEvent('circle_closed', { circle: 'food', day: cycleData.currentDay }); }} className="flex-1 bg-[#9CAF88] text-white py-3 rounded-xl font-bold active:scale-95">Yes, I did</button>
                      <button onClick={() => setShowFoodLog(true)} className="flex-1 border border-[#4A2C35]/15 py-3 rounded-xl font-medium active:scale-95">No, I didn't</button>
                    </div>
                  </>
                ) : !showFoodDetails ? (
                  <>
                    <h3 className="text-xl font-bold mb-1 text-[#4A2C35]">What did you eat?</h3>
                    <p className="text-xs text-[#4A2C35]/60 mb-4">
                      No pressure. Just tell me what you had, and I will help you adjust it.
                    </p>

                    <input 
                      type="text" 
                      placeholder="Search e.g. Bread, Eba..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="w-full bg-[#FFF0F3] border border-[#4A2C35]/10 text-[#4A2C35] p-4 rounded-xl mb-4 focus:outline-none focus:border-[#FF8FA3]" 
                    />
                    
                    <div className="overflow-y-auto flex-1 flex flex-col gap-2 mb-4 pr-2">
                      {filteredFoods.map((food) => {
                        const isSelected = selectedFoods.some(f => f.id === food.id);
                        return (
                          <button key={food.id} onClick={() => toggleFoodSelection(food)} className={`p-4 rounded-xl text-left border flex justify-between items-center transition-all ${isSelected ? 'border-[#9CAF88] bg-[#9CAF88]/10' : 'border-[#4A2C35]/5 bg-[#FFF0F3]/50'}`}>
                            <p className="font-semibold text-[#4A2C35]">{food.name}</p>
                            {isSelected && <span className="text-[#9CAF88] text-xl">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="flex gap-3 mt-auto">
                      <button onClick={() => setShowFoodDetails(true)} disabled={selectedFoods.length === 0} className={`flex-1 py-3 rounded-xl font-bold ${selectedFoods.length > 0 ? 'bg-[#9CAF88] text-white' : 'bg-[#9CAF88]/30 text-white/50'}`}>Next</button>
                      <button onClick={() => { setActiveModal(null); setShowActionSheet(true); }} className="px-6 border border-[#4A2C35]/15 py-3 rounded-xl font-medium opacity-70">← Back</button>                   
                   </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold mb-3 text-[#4A2C35]">Confirm your plate</h3>
                    <div className="bg-[#FFF0F3] p-4 rounded-xl border border-[#4A2C35]/5 mb-4">
                      <p className="text-sm font-bold mb-2 text-[#4A2C35]">{selectedFoods.map(f => f.name).join(' + ')}</p>
                      <p className="text-xs text-[#4A2C35]/60 mb-4">{plateFix}</p>
                      {plateScore !== 'Green' ? (
                        <div className="flex gap-2 mb-4">
                          <button onClick={() => logFood(true)} className="flex-1 py-3 rounded-xl font-bold bg-[#9CAF88] text-white text-xs">I added it (Make it Green)</button>
                          <button onClick={() => logFood(false)} className="flex-1 py-3 rounded-xl font-bold bg-white text-[#4A2C35] border border-[#4A2C35]/10 text-xs">I will eat it like this</button>
                        </div>
                      ) : (
                        <button onClick={() => logFood(true)} className="w-full py-3 rounded-xl font-bold bg-[#9CAF88] text-white text-sm mb-4">Close it Green</button>
                      )}
                      <button onClick={() => setShowFoodDetails(false)} className="w-full text-[10px] text-[#4A2C35]/40 underline">Back to search</button>
                    </div>
                  </>
                )}
              </div>
            )}
            {activeModal === 'walk' && (
              <>
                <h3 className="text-lg font-bold mb-3 text-[#4A2C35] leading-snug">Did you walk or move 20 mins today? Not gym, just move?</h3>
                <div className="bg-[#9CAF88]/10 border border-[#9CAF88]/30 rounded-2xl p-3 mb-3">
                  <p className="text-xs text-[#4A2C35]/80 italic">"{oviGists[girl.id as PhaseId].walk}"</p>
                </div>
                <div className="bg-[#FFF0F3] border border-[#FFB3C1]/30 rounded-2xl p-4 mb-3">
                  <ul className="text-[13px] text-[#4A2C35]/80 space-y-1.5">
                    <li>• Walk to junction and back</li>
                    <li>• Dance to 3 songs in room</li>
                    <li>• Sweep, mop, climb stairs 10 mins</li>
                    <li>• Stand & stretch every 2 hrs if you sit in shop/office</li>
                  </ul>
                </div>
                <p className="text-[11px] text-[#9CAF88] font-semibold mb-5">Rule: No need gym wear</p>
                <div className="flex gap-3 mt-auto">
                  <button onClick={handleWalk} className="flex-1 bg-[#9CAF88] text-white py-3 rounded-xl font-bold active:scale-95">Yes, I moved 20 mins</button>
                  <button onClick={() => setActiveModal(null)} className="flex-1 border border-[#4A2C35]/15 py-3 rounded-xl font-medium active:scale-95">Not yet</button>
                </div>
              </>
            )}
            {activeModal === 'sleep' && (
              <>
                <h3 className="text-lg font-bold mb-3 text-[#4A2C35] leading-snug">Will you be in bed by 10:30pm tonight? No phone scrolling?</h3>
                <div className="bg-[#9CAF88]/10 border border-[#9CAF88]/30 rounded-2xl p-3 mb-4">
                  <p className="text-xs text-[#4A2C35]/80 italic">"{oviGists[girl.id as PhaseId].sleep}"</p>
                </div>
                <p className="text-[11px] text-[#9CAF88] font-semibold mb-1">Rule: Bed by 10:30, not sleep by 10:30</p>
                <p className="text-[11px] text-[#4A2C35]/50 font-medium mb-5">Target: 7+ hrs of sleep</p>
                <div className="flex gap-3 mt-auto">
                  <button onClick={() => { saveState({ sleep: true }); setActiveModal(null); setShowWinCelebration(true); setTimeout(() => setShowWinCelebration(false), 2500); logEvent('circle_closed', { circle: 'sleep', day: cycleData.currentDay }); }} className="flex-1 bg-[#9CAF88] text-white py-3 rounded-xl font-bold active:scale-95">Yes, I will</button>
                  <button onClick={() => setActiveModal(null)} className="flex-1 border border-[#4A2C35]/15 py-3 rounded-xl font-medium active:scale-95">Not yet</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeModal === 'calm' && (
        <div className="absolute inset-0 bg-[#FFF0F3] z-50 flex flex-col pt-12 px-6">
          {calmView === 'menu' && (
            <div className="flex flex-col h-full animate-fade-in relative">
              <button 
                onClick={() => setActiveModal(null)} 
                className="absolute top-0 left-0 text-[#4A2C35]/50 text-sm font-medium active:opacity-50 flex items-center gap-1"
              >
                ← Back
              </button>
              <div className="flex flex-col items-center mb-8 pt-6">
                <h1 className="text-3xl font-bold text-[#4A2C35] mb-2">Late Circle</h1>
                <p className="text-sm text-[#4A2C35]/50">Calm tools for your night</p>
              </div>
              <div className="bg-white border border-[#9CAF88]/30 rounded-2xl p-4 mb-6 max-w-sm mx-auto w-full shadow-sm">
                <p className="text-xs text-[#4A2C35]/80 italic">"{oviGists[girl.id as PhaseId].calm}"</p>
              </div>
              <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
                <button onClick={() => { setCalmView('breathing'); setBreathTime(90); }} className="flex items-center gap-4 bg-white border border-[#4A2C35]/5 p-4 rounded-2xl shadow-sm active:scale-95">
                  <div className="w-14 h-14 rounded-xl bg-[#9CAF88]/15 flex items-center justify-center text-2xl">🎯</div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-[#4A2C35]">Breathing Circle</h3>
                    <p className="text-xs text-[#4A2C35]/50">Inhale 4s • Hold • Exhale 4s</p>
                  </div>
                </button>
                <button onClick={() => setCalmView('burn')} className="flex items-center gap-4 bg-white border border-[#4A2C35]/5 p-4 rounded-2xl shadow-sm active:scale-95">
                  <div className="w-14 h-14 rounded-xl bg-[#FFB3C1]/30 flex items-center justify-center text-2xl">✍️</div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-[#4A2C35]">Scribble & Burn</h3>
                    <p className="text-xs text-[#4A2C35]/50">Type & watch it burn</p>
                  </div>
                </button>
                <button onClick={() => setCalmView('rain')} className="flex items-center gap-4 bg-white border border-[#4A2C35]/5 p-4 rounded-2xl shadow-sm active:scale-95">
                  <div className="w-14 h-14 rounded-xl bg-[#9CAF88]/10 flex items-center justify-center text-2xl">🌧️</div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-[#4A2C35]">Rain on Zinc Roof</h3>
                    <p className="text-xs text-[#4A2C35]/50">Enugu rain sounds</p>
                  </div>
                </button>
              </div>
              <div className="mt-auto mb-10 w-full max-w-sm mx-auto flex flex-col gap-3">
                <a 
                  href="https://wa.me/2348000000000?text=Hi%20Ovi,%20I%20need%20help" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full text-center text-sm text-[#4A2C35]/50 py-2 underline"
                >
                  Need help? Talk to Ovi's team 💬
                </a>
                <button onClick={() => setActiveModal(null)} className="w-full text-center text-sm text-[#4A2C35]/40 py-2">Close</button>
              </div>
            </div>
          )}
          {calmView === 'breathing' && (
            <div className="flex flex-col items-center justify-between h-full animate-fade-in pb-32">
              <h2 className="text-lg text-[#4A2C35]/50 mt-4">Breathe with me</h2>
              <div className="relative flex items-center justify-center w-64 h-64">
                <svg className="absolute inset-0 transform -rotate-90" width="256" height="256" viewBox="0 0 256 256">
                  <circle cx="128" cy="128" r="120" fill="transparent" stroke="rgba(74,44,53,0.08)" strokeWidth="2" />
                  <circle cx="128" cy="128" r="120" fill="transparent" stroke="#9CAF88" strokeWidth="2" strokeDasharray={2 * Math.PI * 120} strokeDashoffset={(2 * Math.PI * 120) - ((90 - breathTime) / 90) * (2 * Math.PI * 120)} strokeLinecap="round" />
                </svg>
                <div className="w-32 h-32 rounded-full bg-[#9CAF88] shadow-[0_0_40px_rgba(156,175,136,0.3)] animate-breathe flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white opacity-80"></div>
                </div>
              </div>
              <div className="text-center mb-4">
                <p className="text-sm text-[#4A2C35]/60">90 seconds. Just you.</p>
                <p className="text-sm text-[#4A2C35]/60">You're safe.</p>
              </div>
            </div>
          )}
          {calmView === 'burn' && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
              <h2 className="text-2xl font-bold text-[#4A2C35] mb-2">Scribble & Burn</h2>
              <p className="text-sm text-[#4A2C35]/50 mb-8">Type & watch it burn. Private, not saved.</p>
              <textarea
                placeholder="Write it here. It won't be saved."
                className="w-full max-w-sm h-32 bg-white text-[#4A2C35] p-4 rounded-lg shadow-xl border border-[#4A2C35]/5 focus:outline-none focus:border-[#9CAF88] text-base resize-none"
              />
              <button onClick={() => { saveState({ calm: true }); setActiveModal(null); setShowWinCelebration(true); setTimeout(() => setShowWinCelebration(false), 2500); logEvent('circle_closed', { circle: 'calm', day: cycleData.currentDay }); }} className="mt-6 w-full max-w-sm bg-[#4A2C35] text-white py-4 rounded-full text-lg font-bold active:scale-95">Burn & Close Calm</button>
            </div>
          )}
          {calmView === 'rain' && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
              <h2 className="text-2xl font-bold text-[#4A2C35] mb-2">Rain on Zinc Roof</h2>
              <p className="text-sm text-[#4A2C35]/50 mb-8">Enugu rain sounds • 2:00</p>
              <div className="w-48 h-24 border-b-2 border-[#9CAF88] flex items-end justify-center gap-1 mb-12">
                <div className="w-2 bg-[#9CAF88] h-full animate-pulse"></div>
                <div className="w-2 bg-[#9CAF88] h-3/4 animate-pulse delay-75"></div>
                <div className="w-2 bg-[#9CAF88] h-1/2 animate-pulse delay-150"></div>
                <div className="w-2 bg-[#9CAF88] h-full animate-pulse delay-300"></div>
              </div>
              <button onClick={() => { saveState({ calm: true }); setActiveModal(null); setShowWinCelebration(true); setTimeout(() => setShowWinCelebration(false), 2500); logEvent('circle_closed', { circle: 'calm', day: cycleData.currentDay }); }} className="w-full max-w-sm bg-[#4A2C35] text-white py-4 rounded-full text-lg font-bold">Close Calm</button>
            </div>
          )}
        </div>
      )}

      {showGoodnight && (
        <div className="absolute inset-0 bg-[#FFF0F3] z-50 flex flex-col items-center pt-12 px-6 pb-28">
          <div className="flex items-center gap-3 mb-2 text-[#9CAF88]">
            <span className="text-3xl">🌙</span>
            <h1 className="text-3xl font-serif text-[#4A2C35]">Goodnight, fine girl</h1>
          </div>
          
          <p className="text-[#4A2C35]/70 text-sm mb-10 text-center max-w-xs px-2">
            {closedCount === 0 && "You opened the app. That's the first win. Tomorrow we try one circle."}
            {closedCount === 1 && "You showed up today. 1 win is still a win 💚"}
            {closedCount === 2 && "2 wins today — that's a real win, fine girl! You showed up 💚"}
            {closedCount === 3 && "3 wins — close to a full circle today ✨"}
            {closedCount === 4 && "All 4 today. That's a full circle, babe. Let's do it again tomorrow ✨"}
          </p>

          <div className="flex justify-between w-full max-w-sm mb-10 bg-white p-4 rounded-3xl border border-[#4A2C35]/5 shadow-sm">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${circles.food ? 'bg-[#9CAF88] text-white' : 'border-2 border-[#4A2C35]/10 text-[#4A2C35]/40'}`}><span className="text-xl">{circles.food ? '✓' : '🍲'}</span></div>
              <span className="text-xs text-[#4A2C35]/60">Food</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isWalkDone ? 'bg-[#9CAF88] text-white' : 'border-2 border-[#4A2C35]/10 text-[#4A2C35]/40'}`}><span className="text-xl">{isWalkDone ? '✓' : '👟'}</span></div>
              <span className="text-xs text-[#4A2C35]/60">Walk</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${circles.sleep ? 'bg-[#9CAF88] text-white' : 'border-2 border-[#4A2C35]/10 text-[#4A2C35]/40'}`}><span className="text-xl">{circles.sleep ? '✓' : '🌙'}</span></div>
              <span className="text-xs text-[#4A2C35]/60">Sleep</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${circles.calm ? 'bg-[#9CAF88] text-white' : 'border-2 border-[#4A2C35]/10 text-[#4A2C35]/40'}`}><span className="text-xl">{circles.calm ? '✓' : '🧠'}</span></div>
              <span className="text-xs text-[#4A2C35]/60">Calm</span>
            </div>
          </div>

          {oviPattern && (
            <div className="bg-white border border-[#FFB3C1]/30 p-4 rounded-2xl mb-6 w-full max-w-sm shadow-sm">
              <h3 className="text-xs font-bold text-[#8A2C3E] uppercase tracking-wider mb-2">Ovi Noticed</h3>
              <p className="text-sm text-[#4A2C35] leading-relaxed">{oviPattern}</p>
            </div>
          )}
          
          <div className="w-full max-w-sm flex flex-col items-center mt-12">
            <h2 className="text-3xl font-bold text-[#4A2C35] mb-2 text-center w-full">You showed up today 💚</h2>
            <p className="text-[#4A2C35]/60 text-sm mb-8 text-center px-4">
              {closedCount === 4 ? "Rest well tonight, babe." : !circles.sleep ? "Tomorrow's little goal: In bed by 10:30pm, no scrolling ✨" : !circles.food ? "Tomorrow's little goal: Eat a lovely balanced plate before 9pm 🍲" : !isWalkDone ? "Tomorrow's little goal: 20 mins of moving your body 👟" : "Tomorrow's little goal: 90 seconds of calm just for you 🧠"}
            </p>
            <div className="mt-auto w-full">
              <button onClick={() => { setIsNightClosed(true); localStorage.setItem('lateCircleNightClosed', 'true'); setShowGoodnight(false); }} className="w-full bg-[#4A2C35] text-white py-4 rounded-full text-lg font-bold active:scale-95 shadow-[0_4px_20px_rgba(74,44,53,0.15)]">
                See you tomorrow
              </button>
            </div>
          </div>
        </div>
      )}

      {isNightClosed && (
        <div className="fixed inset-0 bg-[#FFF0F3] z-100 flex flex-col items-center justify-center px-6 pb-28 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-[#9CAF88]/15 flex items-center justify-center mb-6">
            <span className="text-5xl">🌙</span>
          </div>
          <h1 className="text-3xl font-serif text-[#4A2C35] mb-4 text-center">You're all done for today.</h1>
          <p className="text-[#4A2C35]/60 text-sm text-center max-w-xs mb-12">Your circles are locked. Close the app, put the phone down, and get some rest. See you tomorrow.</p>
          <button onClick={() => { setIsNightClosed(false); localStorage.removeItem('lateCircleNightClosed'); }} className="px-6 py-3 rounded-full border border-[#4A2C35]/15 text-[#4A2C35]/60 text-sm font-medium active:scale-95 bg-white">
            I really need to check something
          </button>
        </div>
      )}

      {showHoldMeTrigger && (
        <div className="fixed inset-0 bg-[#4A2C35]/30 backdrop-blur-sm z-110 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFF0F3] flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🕊️</span>
            </div>
            
            <h3 className="text-lg font-bold text-[#4A2C35] mb-2 leading-snug">
              I see this one is hard for you.
            </h3>
            <p className="text-sm text-[#4A2C35]/70 mb-6 leading-relaxed">
              Do you want me to hold your <strong className="capitalize">{triggerCircle}</strong> for you for 7 days?
            </p>

            <div className="flex flex-col gap-2.5">
              <button 
                onClick={() => {
                  setShowHoldMeTrigger(false);
                  localStorage.setItem('lateCircleLastHoldMeAsked', Date.now().toString());
                  if (triggerCircle) {
                     startHoldMe(triggerCircle === 'walk' ? 'movement' : triggerCircle);
                  }
                }} 
                className="w-full bg-[#4A2C35] text-white py-3.5 rounded-xl font-bold active:scale-95 shadow-md"
              >
                Yes, please hold me
              </button>
              
              <button 
                onClick={() => {
                  setShowHoldMeTrigger(false);
                  localStorage.setItem('lateCircleLastHoldMeAsked', Date.now().toString());
                }} 
                className="w-full bg-[#FFF0F3] text-[#4A2C35]/60 border border-[#4A2C35]/10 py-3.5 rounded-xl font-bold active:scale-95"
              >
                No, I can try
              </button>
            </div>
          </div>
        </div>
      )}

      {showHoldMePicker && (
        <div className="fixed inset-0 bg-[#4A2C35]/30 backdrop-blur-sm z-110 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] text-center">
            <h3 className="text-xl font-bold text-[#4A2C35] mb-2">Fine girl, I have you now.</h3>
            <p className="text-sm text-[#4A2C35]/70 mb-6 leading-relaxed">
              I will hold you for 7 days. Tell me, which one is hardest right now?
            </p>
            
            <div className="flex flex-col gap-2.5">
              <button onClick={() => startHoldMe('sleep')} className="w-full bg-[#FFF0F3] text-[#4A2C35] border border-[#4A2C35]/10 py-3.5 rounded-xl font-bold active:scale-95 shadow-sm transition-all flex items-center justify-center gap-2">
                <span className="text-lg">🌙</span> Sleep
              </button>
              <button onClick={() => startHoldMe('food')} className="w-full bg-[#FFF0F3] text-[#4A2C35] border border-[#4A2C35]/10 py-3.5 rounded-xl font-bold active:scale-95 shadow-sm transition-all flex items-center justify-center gap-2">
                <span className="text-lg">🍲</span> Food
              </button>
              <button onClick={() => startHoldMe('movement')} className="w-full bg-[#FFF0F3] text-[#4A2C35] border border-[#4A2C35]/10 py-3.5 rounded-xl font-bold active:scale-95 shadow-sm transition-all flex items-center justify-center gap-2">
                <span className="text-lg">👟</span> Movement
              </button>
              <button onClick={() => startHoldMe('calm')} className="w-full bg-[#FFF0F3] text-[#4A2C35] border border-[#4A2C35]/10 py-3.5 rounded-xl font-bold active:scale-95 shadow-sm transition-all flex items-center justify-center gap-2">
                <span className="text-lg">🧠</span> Calm
              </button>
            </div>
            
            <button onClick={() => setShowHoldMePicker(false)} className="mt-5 text-xs text-[#4A2C35]/40 underline font-medium active:opacity-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {holdMeMissedMessage && (
        <div className="fixed inset-0 bg-[#4A2C35]/40 backdrop-blur-sm z-200 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFF0F3] flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🤍</span>
            </div>
            <p className="text-[15px] text-[#4A2C35] leading-relaxed mb-8 italic">
              "{holdMeMissedMessage}"
            </p>
            <button 
              onClick={() => setHoldMeMissedMessage(null)} 
              className="w-full bg-[#4A2C35] text-white py-3 rounded-full font-bold active:scale-95 shadow-md"
            >
              Okay, Ovi
            </button>
          </div>
        </div>
      )}

      {showGraduation && (
        <div className="fixed inset-0 bg-[#4A2C35]/40 backdrop-blur-sm z-200 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] text-center animate-slide-up border border-[#9CAF88]/30">
            
            <div className="w-20 h-20 rounded-full bg-[#9CAF88]/15 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🕊️</span>
            </div>

            <h2 className="text-2xl font-bold text-[#4A2C35] mb-4">
              You did it.
            </h2>
            
            <p className="text-[15px] text-[#4A2C35]/80 leading-relaxed mb-8 italic">
              "Day 1, I held you. Day 7, you stand. That was the plan. You have it now."
            </p>

            <button 
              onClick={() => setShowGraduation(false)} 
              className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold active:scale-95 shadow-lg shadow-[#4A2C35]/20"
            >
              Thank you, Ovi
            </button>
          </div>
        </div>
      )}

      {showEndHoldConfirm && (
        <div className="fixed inset-0 bg-[#4A2C35]/40 backdrop-blur-sm z-200 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] text-center animate-slide-up border border-[#4A2C35]/10">
            
            <div className="w-16 h-16 rounded-full bg-[#FFF0F3] flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🤍</span>
            </div>

            <h2 className="text-xl font-bold text-[#4A2C35] mb-2">
              Let go of this hold?
            </h2>
            
            <p className="text-sm text-[#4A2C35]/70 leading-relaxed mb-8">
              You are on Day {holdMeActive?.day}. If you end this now, Ovi will let go of your {holdMeActive?.circle}. You can always ask for help again later.
            </p>

            <div className="flex flex-col gap-2.5">
              <button 
                onClick={() => {
                  if (holdMeActive) {
                    localStorage.removeItem('lateCircleHoldMe');
                    setHoldMeActive(null);
                    logEvent('hold_me_abandoned', { circle: holdMeActive.circle, day: holdMeActive.day });
                  }
                  setShowEndHoldConfirm(false);
                }} 
                className="w-full bg-[#4A2C35] text-white py-3.5 rounded-xl font-bold active:scale-95 shadow-md"
              >
                Yes, let go
              </button>
              
              <button 
                onClick={() => setShowEndHoldConfirm(false)} 
                className="w-full bg-[#FFF0F3] text-[#4A2C35]/60 border border-[#4A2C35]/10 py-3.5 rounded-xl font-bold active:scale-95"
              >
                No, keep holding me
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#FFF0F3]" />}>
      <HomeContent />
    </Suspense>
  );
}