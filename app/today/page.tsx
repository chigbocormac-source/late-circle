'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../supabase';
import { getCyclePhase, oviGists, PhaseId, oviWelcome, getMorningGreeting, getRealCycleLength, getLateBoundary } from '../../utils/cycleEngine';
import { getDailyGist } from '../../utils/dailyGist';
import InstallHint from '../components/InstallHint';
import { trackAppOpened, logEvent, localDateKey } from '../../utils/analytics';
import { subscribeToPush } from '../../utils/push';
import { getClaimCopy } from '../../utils/claimCopy';
import { getWorryForTags } from '../../utils/worryBubble';

// --- THE HEALING MATRIX (Exact Prescriptions) ---
function getDailyCheck(cycleDay: number, averageCycle: number, girlId: string) {
  const percentage = (cycleDay / averageCycle) * 100;
  
  if (percentage > 100) return { girlName: 'Ready Girl', checkType: 'calm', question: 'Did you take 90 seconds of calm today?', context: 'Or do you want to do it with me right now?' };  if (percentage <= 15) return { girlName: 'Rest Girl', checkType: 'sleep', question: 'Did you sleep before 10:30pm last night?', context: 'Your body needs rest to rebuild.' };
  if (percentage <= 35) return { girlName: 'Fresh Girl', checkType: 'walk', question: 'Did you move your body today?', context: '20 minutes of walking, dancing, or sweating. Anything counts.' };
  if (percentage <= 75) return { girlName: 'Chop Girl', checkType: 'food', question: 'Did you eat well today?', context: 'At least one real meal with protein or veg. Not just junk.' };
  
  return { girlName: 'Ready Girl', checkType: 'calm', question: 'Did you take 2 minutes of calm today?', context: 'Or do you want to do it with me right now?' };
}

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

  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [showClaimFlow, setShowClaimFlow] = useState(false);
  const [claimStep, setClaimStep] = useState(1);
  const [worryReleasing, setWorryReleasing] = useState(false);
  const [worryReleased, setWorryReleased] = useState(false);

  const [showPeriodCame, setShowPeriodCame] = useState(false);

  const [showBleedingModal, setShowBleedingModal] = useState(false);
  const [hasLoggedBleedingToday, setHasLoggedBleedingToday] = useState(false);
  const [bleedingData, setBleedingData] = useState({
    flow: '',
    pain: 5,
    painWhere: [] as string[],
    clots: '',
    color: '',
    meds: '',
  });

  const [showCheckModal, setShowCheckModal] = useState(false);
  const [checkStep, setCheckStep] = useState<'ask' | 'grace' | 'refused'>('ask');
  const [showNightCheck, setShowNightCheck] = useState(false);
  
  // NEW: The safety net is quiet and collapsed
  const [showSafetyNote, setShowSafetyNote] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem('lateCircleOnboarded');
    if (!onboarded) {
      router.push('/onboarding');
      return;
    }

    let currentUserId = localStorage.getItem('lateCircleUserId');
    if (!currentUserId) {
      currentUserId = crypto.randomUUID();
      localStorage.setItem('lateCircleUserId', currentUserId);
      supabase.from('profiles').insert([{ id: currentUserId, name: 'Fine Girl' }])
        .then(({ error }) => { if (error) console.error("Profile error:", error); });
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

    const lastBleedDate = localStorage.getItem('lateCircleLastBleedDate');
    if (lastBleedDate === localDateKey()) {
      setHasLoggedBleedingToday(true);
    }

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
    const currentHour = new Date().getHours();
    setNowHour(currentHour);

    const nightCheckDone = localStorage.getItem('lateCircleNightCheckDone');
    if (currentHour >= 20 && nightCheckDone !== localDateKey()) {
      setTimeout(() => setShowNightCheck(true), 2000);
    }
    
    async function fetchFoods() {
      const { data, error } = await supabase.from('foods').select('*').order('name');
      if (data) setDbFoods(data);
      if (error) console.error("Error fetching foods:", error);
    }
    fetchFoods();
    
    trackAppOpened(cycleDataForPhase.currentDay);
        
    setIsLoaded(true);
  }, [router]);

  useEffect(() => {
    if (isLoaded && circles && !localStorage.getItem('lateCirclePushAsked')) {
      const todayCheck = getDailyCheck(getCycleData(lastPeriodDate, [realCycleLength]).currentDay, realCycleLength, 'rest');
      const isDoneToday = circles[todayCheck.checkType as keyof typeof circles];
      
      if (isDoneToday) {
        const t = setTimeout(() => setShowPushPrompt(true), 3000);
        return () => clearTimeout(t);
      }
    }
  }, [circles, isLoaded, lastPeriodDate, realCycleLength]);

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
  
  const dailyCheck = getDailyCheck(cycleData.currentDay, cycleData.average, girl.id);
  const isDone = circles[dailyCheck.checkType as keyof typeof circles];
  
  const historyFromStorage = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lateCircleHistory') || '[]') : [];
  const cycleCount = historyFromStorage.length + 1;
  const cycleBounds = getLateBoundary(historyFromStorage, lastPeriodDate, typeof window !== 'undefined' ? localStorage.getItem('lateCircleType') : null);
  
  // FIX: Use the SAME formula as the Cycle page
  const lateDays = cycleData.currentDay - cycleData.average;
  const isLate = lateDays > 0;

  const copy = getClaimCopy(lateDays);

  // PULL REAL-TIME DATA FOR THE GIST
  const savedTags = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lateCircleTags') || '[]') : [];
  const savedFood = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lateCircleLastFoodLog') || 'null')?.name : null;
  
  const userCycleType = typeof window !== 'undefined' ? localStorage.getItem('lateCircleType') || 'Regular' : 'Regular';
  const userSexuallyActive = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lateCircleYouPlace') || 'null')?.sexuallyActive === 'Yes' : false;
  
  const gist = getDailyGist(
    cycleData.currentDay, 
    cycleData.average, 
    lateDays, 
    savedTags, 
    savedFood,
    userSexuallyActive,
    cycleCount
  );

  const saveState = (updates: Partial<typeof circles>) => {
    const stored = localStorage.getItem('lateCircleData');
    const current = stored ? JSON.parse(stored) : circles;
    const newState = { ...current, ...updates };
    
    setCircles(newState);
    localStorage.setItem('lateCircleData', JSON.stringify(newState));
    localStorage.setItem('lateCircleDataDate', localDateKey());

    const today = localDateKey();
    const checkedIn = Object.values(newState).some(Boolean) ? 1 : 0;
    
    let history = JSON.parse(localStorage.getItem('lateCircleDailyHistory') || '{}');
    history[today] = {
      count: checkedIn,
      food: newState.food,
      walk: newState.walk,
      sleep: newState.sleep,
      calm: newState.calm
    };
    
    const keys = Object.keys(history).sort();
    if (keys.length > 60) delete history[keys[0]];
    
    localStorage.setItem('lateCircleDailyHistory', JSON.stringify(history));

    const userId = localStorage.getItem('lateCircleUserId');
    if (userId) {
      const tags = JSON.parse(localStorage.getItem('lateCircleTags') || '[]');
      supabase.from('daily_logs').upsert([{
        user_id: userId,
        log_date: today,
        food: newState.food,
        walk: newState.walk,
        sleep: newState.sleep,
        calm: newState.calm,
        tags: tags
      }], { onConflict: 'user_id, log_date' }).then(({ error }) => {
        if (error) console.error("Daily log error:", error);
      });
    }
  };

  const saveBleedingLog = () => {
    const userId = localStorage.getItem('lateCircleUserId');
    const today = localDateKey();
    
    if (userId) {
      supabase.from('period_days').upsert([{
        user_id: userId,
        log_date: today,
        flow: bleedingData.flow,
        pain_level: bleedingData.pain,
        pain_where: bleedingData.painWhere,
        clots: bleedingData.clots,
        blood_color: bleedingData.color,
        meds: bleedingData.meds,
      }], { onConflict: 'user_id, log_date' }).then(({ error }) => {
        if (error) console.error("Bleeding log error:", error);
      });
    }
    
    localStorage.setItem('lateCircleLastBleedDate', localDateKey());
    setHasLoggedBleedingToday(true);
    setShowBleedingModal(false);
    logEvent('bleeding_logged', { flow: bleedingData.flow, pain: bleedingData.pain });
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
    
    logEvent('period_came', { claimed: hasClaimedToday });
  };

  const isWalkDone = circles.walk;
  const closedCount = [circles.food, isWalkDone, circles.sleep, circles.calm].filter(Boolean).length;

  const ringRadius = 78; 
  const circleCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = isDone ? 0 : circleCircumference;

  if (!isLoaded) return <div className="h-screen w-full bg-[#FFF0F3]" />;

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

  const nextPhase = (() => {
    for (let d = 1; d <= 10; d++) {
      const g = getDailyCheck(cycleData.currentDay + d, cycleData.average, girl.id).girlName;
      if (g !== dailyCheck.girlName) return { days: d, name: g };
    }
    return null;
  })();

  const tomorrowCheck = getDailyCheck(cycleData.currentDay + 1, cycleData.average, girl.id);
  const tomorrowSame = tomorrowCheck.girlName === dailyCheck.girlName;

  return (
    <main className={`h-screen overflow-y-auto flex flex-col items-center pt-12 pb-40 px-6 font-sans relative animate-page-enter transition-colors duration-500 ${isLate ? 'bg-[#FFE5EC]' : 'bg-[#FFF0F3]'} text-[#4A2C35]`}>
      
      {showWinCelebration && (
        <div className="absolute inset-0 z-200 flex flex-col items-center justify-center bg-[#FFF0F3]/95 backdrop-blur-md animate-fade-in">
          <div className="w-32 h-32 rounded-full bg-[#9CAF88] flex items-center justify-center mb-6 animate-pop-in shadow-[0_0_60px_rgba(156,175,136,0.3)]">
            <span className="text-7xl text-white font-bold">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-[#4A2C35] mb-2 animate-slide-up-slow">You did well.</h2>
          <p className="text-sm text-[#4A2C35]/60 animate-slide-up-slow">You checked in today 💚</p>
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
              <h4 className="text-[10px] font-bold text-[#4A2C35]/40 uppercase tracking-widest mb-2">Your check today</h4>
              <p className="text-sm font-bold text-[#4A2C35] capitalize">
                {dailyCheck.checkType}
              </p>
            </div>
            <button onClick={() => setShowOviWelcome(false)} className="w-full bg-[#4A2C35] text-white py-3 rounded-full font-bold active:scale-95 shadow-[0_8px_20px_-4px_rgba(74,44,53,0.2)]">
              Okay, Ovi
            </button>
          </div>
        </div>
      )}

      {showPushPrompt && (
        <div className="w-full max-w-sm bg-white border border-[#9CAF88]/30 rounded-2xl p-4 mb-6 shadow-sm animate-slide-down mt-2">
          <h3 className="text-sm font-bold text-[#4A2C35] mb-1">Ovi wants to check on you.</h3>
          <p className="text-xs text-[#4A2C35]/60 mb-3 leading-relaxed">
            If you allow notifications, I can remind you to rest, eat, and sleep. No spam. Just me.
          </p>
          <div className="flex gap-2">
            <button onClick={async () => { localStorage.setItem('lateCirclePushAsked', 'true'); setShowPushPrompt(false); await subscribeToPush(); }} className="flex-1 bg-[#4A2C35] text-white py-2 rounded-xl text-xs font-bold active:scale-95">
              Yes, Ovi
            </button>
            <button onClick={() => { localStorage.setItem('lateCirclePushAsked', 'true'); setShowPushPrompt(false); }} className="flex-1 bg-[#FFF0F3] text-[#4A2C35]/60 border border-[#4A2C35]/10 py-2 rounded-xl text-xs font-bold active:scale-95">
              Not now
            </button>
          </div>
        </div>
      )}

      {/* --- THE TAPPABLE CIRCLE DASHBOARD --- */}
      <div className="w-full max-w-sm flex flex-col items-center animate-fade-in mt-2 mb-4">
        
        {/* 1. The Girl (Top) - CALM VERSION */}
        <div className="text-center mb-4 w-full flex flex-col items-center">
          
          <h1 className="text-2xl font-serif text-[#4A2C35] italic mb-3">
            {isLate ? "Today, slow down." : `Today you are ${dailyCheck.girlName}`}
          </h1>

          <p className="text-xs text-[#4A2C35]/60 font-medium px-4 leading-relaxed mb-3">
            {isLate ? "Yesterday is gone. Today is new. Slow down today. Just rest." : morningGreeting}
          </p>

          {promiseDay && cycleData.currentDay <= 7 && (
            <p className="text-[10px] font-bold text-[#FF8FA3] bg-[#FFF0F3] px-3 py-1 rounded-full">
              Day {promiseDay} of 7 🌱
            </p>
          )}
          
        </div>

        {/* 2. The Tappable Circle (Center) - FIXED PINK RING */}
        <button 
          onClick={() => {
            if (!isDone) {
              if (dailyCheck.checkType === 'food') {
                setActiveModal('food');
                setShowFoodDetails(false);
                setShowFoodLog(false);
              } else {
                setCheckStep('ask');
                setShowCheckModal(true);
              }
            }
          }}
          className={`relative flex flex-col items-center justify-center w-52 h-52 rounded-full transition-all duration-500 active:scale-95 ${isDone ? 'cursor-default' : 'cursor-pointer shadow-[0_20px_50px_-12px_rgba(255,143,163,0.3)] animate-orb-breathe'}`}
        >
          <div className={`absolute inset-0 rounded-full shadow-[0_12px_40px_-12px_rgba(74,44,53,0.15)] ${isDone ? 'bg-[#9CAF88]' : 'bg-white border border-[#4A2C35]/5'}`}></div>
          
          <svg className="absolute inset-0 transform -rotate-90" width="208" height="208" viewBox="0 0 208 208">
            <circle cx="104" cy="104" r={ringRadius} fill="transparent" stroke="rgba(74, 44, 53, 0.05)" strokeWidth="8" />
            <circle
              cx="104" cy="104" r={ringRadius} fill="transparent"
              stroke={isDone ? "#9CAF88" : (isLate ? "#FF8FA3" : "#9CAF88")} strokeWidth="8"
              strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset}
              strokeLinecap="round" className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="relative z-10 flex flex-col items-center text-center px-8 w-full">
            {isDone ? (
              <div className="animate-pop-in flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <span className="text-5xl text-white font-bold">✓</span>
                </div>
                <p className="text-xl font-bold text-white">You checked in.</p>
                <p className="text-sm text-white/80 mt-1">Rest now 💚</p>
              </div>
            ) : (
              <>
                <h3 className="text-[10px] font-bold text-[#8A2C3E] uppercase tracking-widest mb-2">
                  Your One Check
                </h3>
                <p className="text-[14px] font-bold text-[#4A2C35] leading-snug mb-4 px-2">
                  {dailyCheck.question}
                </p>
                
                <div className="px-5 py-2.5 rounded-full bg-[#FF8FA3] text-white text-[10px] font-bold uppercase tracking-widest shadow-[0_4px_16px_rgba(255,143,163,0.4)] animate-pulse">
                  Check In
                </div>
              </>
            )}
          </div>
        </button>

        {/* 3. The Locked Message (Unlocks when checked in) */}
        {!isDone ? (
          <div className="w-full px-2 text-center mt-6 mb-6 animate-fade-in flex flex-col items-center">
            <div className="bg-white border border-[#4A2C35]/10 rounded-2xl p-4 w-full text-center">
              <p className="text-[11px] font-bold text-[#9CAF88] uppercase tracking-widest mb-1">🔒 A message from Ovi is waiting.</p>
              <p className="text-xs text-[#4A2C35]/60">Tap your circle to unlock it.</p>
            </div>
          </div>
        ) : (
          <div className="w-full px-2 text-center mt-6 mb-6 animate-fade-in flex flex-col items-center">
            <span className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-2 bg-white/50 px-3 py-1 rounded-full">
              {gist.badge}
            </span>
            <p className="text-[11px] font-bold text-[#9CAF88] uppercase tracking-widest mb-1">Message from Ovi</p>
            <p className="text-sm text-[#4A2C35] font-bold mb-1">
              {gist.title}
            </p>
            <p className="text-xs text-[#4A2C35]/60 leading-relaxed mb-4">
              {gist.message}
            </p>
            <div className="bg-[#FFF0F3] border border-[#FFB3C1]/30 rounded-xl p-3 inline-block">
              <p className="text-xs text-[#8A2C3E] font-medium italic">
                "{gist.action}"
              </p>
            </div>
          </div>
        )}

        {/* 4. The Bleeding Card */}
        {isDone && cycleData.currentDay >= 1 && cycleData.currentDay <= 7 && !hasLoggedBleedingToday && (
          <div className="w-full animate-fade-in bg-[#FFE5EC] border border-[#FF8FA3]/30 rounded-3xl p-5 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-[#8A2C3E] flex items-center gap-2">
                <span className="text-lg">🩸</span> Bleeding Mode
              </h2>
            </div>
            <p className="text-xs text-[#8A2C3E]/70 mb-3 leading-relaxed">
              You are bleeding today. Let's check in small small.
            </p>
            <button onClick={() => setShowBleedingModal(true)} className="w-full bg-[#FF8FA3] text-white py-2.5 rounded-full font-bold text-xs shadow-sm active:scale-95 transition-transform">
              Log My Flow & Pain →
            </button>
          </div>
        )}

        {/* 5. The Tomorrow Teaser */}
        {isDone && (
          <div className="w-full bg-white rounded-2xl p-4 mb-4 text-center shadow-sm animate-fade-in">
            <p className="text-[10px] font-bold text-[#9CAF88] uppercase tracking-widest mb-1">Tomorrow</p>
            <p className="text-sm font-bold text-[#4A2C35] mb-1">
              {tomorrowSame ? "I will check on your rest again." : `You become ${tomorrowCheck.girlName}.`}
            </p>
            <p className="text-xs text-[#4A2C35]/60 leading-relaxed">
              {tomorrowSame 
                ? `Tonight: bed by 10:30. ${nextPhase ? `${nextPhase.name} arrives in ${nextPhase.days} day${nextPhase.days > 1 ? 's' : ''}.` : ''}` 
                : `Ovi will ask: "${tomorrowCheck.question}"`}
            </p>
          </div>
        )}

        {/* 6. The Optional Calm Button */}
        {isDone && !circles.calm && dailyCheck.checkType !== 'calm' && (
          <button 
            onClick={() => {
              setActiveModal('calm');
              setCalmView('menu');
            }}
            className="w-full bg-[#FFF0F3] border border-[#9CAF88]/30 py-3 rounded-2xl text-xs font-bold text-[#9CAF88] mb-4 shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 animate-fade-in"
          >
            <span>🧠</span> Want a calm moment too?
          </button>
        )}

      </div>

      {isLate && (
        <div className="w-full max-w-sm mb-4 mt-2">
          {!hasClaimedToday ? (
            <div className="flex flex-col items-center">
              <button onClick={handleClaim} className="w-full py-4 rounded-full text-[16px] font-bold bg-[#FF8FA3] text-white shadow-[0_8px_30px_rgba(255,143,163,0.4)] animate-soft-glow active:scale-95 transition-transform">
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

      {/* SAFETY NOTE - SMALL, GREY, COLLAPSED */}
      {isLate && (
        <div className="w-full max-w-sm mb-6">
          <button 
            onClick={() => setShowSafetyNote(!showSafetyNote)}
            className="w-full text-left text-[10px] text-[#4A2C35]/40 font-medium px-2 py-1 flex items-center gap-1"
          >
            <span>+</span> A quiet note from Ovi about when to get care
          </button>
          
          {showSafetyNote && (
            <div className="bg-white border border-[#4A2C35]/5 rounded-2xl p-4 mt-2 animate-fade-in">
              <p className="text-[11px] text-[#4A2C35]/70 leading-relaxed mb-3">
                If you have severe pain, heavy bleeding that soaks more than 2 pads in 1 hour, fever, fainting, or a positive test and you are worried, please talk to a nurse or go to a clinic. Ovi is here for daily care, not medical treatment. You don't have to figure it out alone.
              </p>
              <button 
                onClick={() => setShowSafetyNote(false)}
                className="w-full bg-[#FFF0F3] text-[#4A2C35]/60 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform"
              >
                I have heard you, Ovi 💜
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- MODALS START HERE --- */}

      {/* NIGHT CHECK MODAL */}
      {showNightCheck && (
        <div className="fixed inset-0 bg-[#4A2C35]/20 backdrop-blur-sm z-200 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-[#4A2C35] rounded-3xl p-6 shadow-2xl text-center animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-2">How is your body now?</h3>
            <p className="text-sm text-white/60 mb-6">Just a quick check before you sleep.</p>
            <div className="flex flex-col gap-2 w-full">
              <button onClick={() => { localStorage.setItem('lateCircleNightCheckDone', localDateKey()); setShowNightCheck(false); }} className="w-full bg-[#9CAF88] text-white py-3.5 rounded-xl font-bold active:scale-95 shadow-md text-sm">Better 🌱</button>
              <button onClick={() => { localStorage.setItem('lateCircleNightCheckDone', localDateKey()); setShowNightCheck(false); }} className="w-full bg-white/10 text-white py-3.5 rounded-xl font-bold active:scale-95 shadow-md text-sm">Same 🌙</button>
              <button onClick={() => { localStorage.setItem('lateCircleNightCheckDone', localDateKey()); setShowNightCheck(false); }} className="w-full bg-[#FF8FA3] text-white py-3.5 rounded-xl font-bold active:scale-95 shadow-md text-sm">Worse 🤍</button>
            </div>
          </div>
        </div>
      )}

      {/* OVI'S CHECK-IN MODAL */}
      {showCheckModal && (
        <div className="fixed inset-0 bg-[#4A2C35]/20 backdrop-blur-sm z-200 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-[0_24px_48px_-16px_rgba(74,44,53,0.25)] text-center animate-slide-up border border-[#4A2C35]/5">
            
            {checkStep === 'ask' && (
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-bold text-[#4A2C35] mb-2">{dailyCheck.question}</h3>
                <p className="text-sm text-[#4A2C35]/60 mb-6 px-4">
                  {dailyCheck.context}
                </p>
                <div className="flex flex-col gap-2 w-full">
                  
                  {dailyCheck.checkType === 'calm' && (
                    <button 
                      onClick={() => {
                        setShowCheckModal(false);
                        setActiveModal('calm');
                        setCalmView('breathing');
                        setBreathTime(90);
                      }}
                      className="w-full bg-[#4A2C35] text-white py-3.5 rounded-xl font-bold active:scale-95 shadow-md text-sm mb-2"
                    >
                      Yes, let's do it together 🧠
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      if (dailyCheck.checkType === 'walk') saveState({ walk: true });
                      else if (dailyCheck.checkType === 'sleep') saveState({ sleep: true });
                      else if (dailyCheck.checkType === 'calm') saveState({ calm: true });
                      setShowCheckModal(false);
                      setShowWinCelebration(true);
                      setTimeout(() => setShowWinCelebration(false), 2500);
                      logEvent('circle_closed', { circle: dailyCheck.checkType, day: cycleData.currentDay, feeling: 'full' });
                    }}
                    className="w-full bg-[#9CAF88] text-white py-3.5 rounded-xl font-bold active:scale-95 shadow-md text-sm"
                  >
                    I already did it ✅
                  </button>
                  
                  <button 
                    onClick={() => setCheckStep('grace')}
                    className="w-full bg-[#FFF0F3] text-[#4A2C35] border border-[#4A2C35]/10 py-3.5 rounded-xl font-bold active:scale-95 text-sm"
                  >
                    I tried a little 🤍
                  </button>

                  <button 
                    onClick={() => setCheckStep('refused')}
                    className="w-full bg-white border border-transparent text-[#4A2C35]/40 py-2 text-xs font-medium active:scale-95"
                  >
                    Not today, but I am still here
                  </button>
                </div>
              </div>
            )}

            {checkStep === 'grace' && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#FFF0F3] flex items-center justify-center mb-4 text-2xl">🤍</div>
                <h3 className="text-lg font-bold text-[#4A2C35] mb-2">That is enough.</h3>
                <p className="text-sm text-[#4A2C35]/70 mb-6 leading-relaxed px-2">
                  Small small is still progress. Let's just do one tiny thing together right now. 
                  {dailyCheck.checkType === 'sleep' ? " Close your eyes and take 3 deep breaths." 
                   : dailyCheck.checkType === 'walk' ? " Stand up and stretch your arms to the ceiling." 
                   : dailyCheck.checkType === 'calm' ? " Close your eyes and breathe with me for 90 seconds." 
                   : " Drink one glass of water right now."}
                </p>
                <div className="flex flex-col gap-2 w-full">
                  <button 
                    onClick={() => {
                      if (dailyCheck.checkType === 'walk') saveState({ walk: true });
                      else if (dailyCheck.checkType === 'sleep') saveState({ sleep: true });
                      else if (dailyCheck.checkType === 'calm') saveState({ calm: true });
                      setShowCheckModal(false);
                      setShowWinCelebration(true);
                      setTimeout(() => setShowWinCelebration(false), 2500);
                      logEvent('circle_closed', { circle: dailyCheck.checkType, day: cycleData.currentDay, feeling: 'micro_win' });
                    }}
                    className="w-full bg-[#FF8FA3] text-white py-3.5 rounded-xl font-bold active:scale-95 shadow-md"
                  >
                    Okay, I did it ✅
                  </button>
                  <button 
                    onClick={() => setCheckStep('refused')}
                    className="w-full bg-white border border-transparent text-[#4A2C35]/40 py-2 text-xs font-medium active:scale-95"
                  >
                    Not right now
                  </button>
                </div>
              </div>
            )}

            {checkStep === 'refused' && (
              <div className="flex flex-col items-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-[#FFF0F3] flex items-center justify-center mb-4 text-2xl">🌙</div>
                <h3 className="text-lg font-bold text-[#4A2C35] mb-2">It's okay.</h3>
                <p className="text-sm text-[#4A2C35]/70 mb-6 leading-relaxed px-2">
                  Thank you for checking in. I am still here with you. Tomorrow is a new day. Rest now.
                </p>
                <button 
                  onClick={() => setShowCheckModal(false)}
                  className="w-full bg-[#4A2C35] text-white py-3.5 rounded-xl font-bold active:scale-95 shadow-md"
                >
                  Okay, Ovi
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {activeModal === 'food' && (
        <div className="fixed inset-0 bg-[#4A2C35]/20 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-slide-up text-center">
            <h3 className="text-lg font-bold mb-3 text-[#4A2C35] leading-snug">Did you eat a balanced plate today before 9pm?</h3>
            <div className="bg-[#FFF0F3] border border-[#FFB3C1]/30 rounded-2xl p-4 mb-5">
              <p className="text-xs text-[#4A2C35]/80 italic">"{oviGists[girl.id as PhaseId]?.food || 'Food is medicine.'}"</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => { saveState({ food: true }); setActiveModal(null); setShowWinCelebration(true); setTimeout(() => setShowWinCelebration(false), 2500); logEvent('circle_closed', { circle: 'food', day: cycleData.currentDay, feeling: 'full' }); }} className="w-full bg-[#9CAF88] text-white py-3.5 rounded-xl font-bold active:scale-95">I gave my body what it needed ✅</button>
              <button onClick={() => { setActiveModal(null); setCheckStep('grace'); setShowCheckModal(true); }} className="w-full bg-[#FFF0F3] text-[#4A2C35] border border-[#4A2C35]/10 py-3.5 rounded-xl font-bold active:scale-95 text-sm">I tried a little 🤍</button>
              <button onClick={() => { setActiveModal(null); setCheckStep('refused'); setShowCheckModal(true); }} className="w-full bg-white border border-transparent text-[#4A2C35]/40 py-2 text-xs font-medium active:scale-95">Not today, but I am still here</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'calm' && (
        <div className="absolute inset-0 bg-[#FFF0F3] z-50 flex flex-col pt-12 px-6">
          {calmView === 'menu' && (
            <div className="flex flex-col h-full animate-fade-in relative">
              <button onClick={() => setActiveModal(null)} className="absolute top-0 left-0 text-[#4A2C35]/50 text-sm font-medium active:opacity-50 flex items-center gap-1">← Back</button>
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
                <a href="https://wa.me/2348000000000?text=Hi%20Ovi,%20I%20need%20help" target="_blank" rel="noopener noreferrer" className="w-full text-center text-sm text-[#4A2C35]/50 py-2 underline">Need help? Talk to Ovi's team 💬</a>
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
              <textarea placeholder="Write it here. It won't be saved." className="w-full max-w-sm h-32 bg-white text-[#4A2C35] p-4 rounded-lg shadow-xl border border-[#4A2C35]/5 focus:outline-none focus:border-[#9CAF88] text-base resize-none" />
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
          <div className="text-[#4A2C35]/70 text-sm mb-10 text-center max-w-xs px-2">
            {promiseDay === 7 ? (
              <p className="text-[#4A2C35] text-sm font-bold mb-1">
                You kept your 7-day promise. 🌱 You are building a real habit.
              </p>
            ) : (
              <>
                {closedCount === 0 && "You opened the app. That's the first win. Tomorrow we try one circle."}
                {closedCount === 1 && "You showed up today. 1 win is still a win 💚"}
                {closedCount === 2 && "2 wins today — that's a real win, fine girl! You showed up 💚"}
                {closedCount === 3 && "3 wins — close to a full circle today ✨"}
                {closedCount === 4 && "All 4 today. That's a full circle, babe. Let's do it again tomorrow ✨"}
              </>
            )}
          </div>
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
              <button onClick={() => { setIsNightClosed(true); localStorage.setItem('lateCircleNightClosed', 'true'); setShowGoodnight(false); }} className="w-full bg-[#4A2C35] text-white py-4 rounded-full text-lg font-bold active:scale-95 shadow-[0_4px_20px_rgba(74,44,53,0.15)]">See you tomorrow</button>
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
          <button onClick={() => { setIsNightClosed(false); localStorage.removeItem('lateCircleNightClosed'); }} className="px-6 py-3 rounded-full border border-[#4A2C35]/15 text-[#4A2C35]/60 text-sm font-medium active:scale-95 bg-white">I really need to check something</button>
        </div>
      )}

      {showBleedingModal && (
        <div className="fixed inset-0 bg-[#4A2C35]/30 backdrop-blur-sm z-200 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#8A2C3E]">Bleeding Check-In</h2>
              <button onClick={() => setShowBleedingModal(false)} className="w-8 h-8 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#4A2C35]/60 font-bold">✕</button>
            </div>
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 pb-2">
              <div>
                <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">How heavy is your flow?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Light', 'Medium', 'Heavy', 'Very Heavy'].map(opt => (
                    <button key={opt} onClick={() => setBleedingData({ ...bleedingData, flow: opt })}
                      className={`py-2 rounded-xl text-xs font-medium border ${bleedingData.flow === opt ? 'bg-[#FF8FA3] text-white border-[#FF8FA3]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Pain level (1-10)</label>
                <input type="range" min="1" max="10" value={bleedingData.pain} onChange={(e) => setBleedingData({ ...bleedingData, pain: parseInt(e.target.value) })} className="w-full accent-[#FF8FA3]" />
                <p className="text-center text-sm font-bold text-[#8A2C3E]">{bleedingData.pain} / 10</p>
              </div>
              <div>
                <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Where is the pain?</label>
                <div className="flex flex-wrap gap-2">
                  {['Waist', 'Belly', 'Back'].map(opt => (
                    <button key={opt} onClick={() => {
                      const current = bleedingData.painWhere;
                      const newWhere = current.includes(opt) ? current.filter(v => v !== opt) : [...current, opt];
                      setBleedingData({ ...bleedingData, painWhere: newWhere });
                    }}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border ${bleedingData.painWhere.includes(opt) ? 'bg-[#FF8FA3] text-white border-[#FF8FA3]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Did you see clots?</label>
                <div className="flex gap-2">
                  {['No', 'Small', 'Big'].map(opt => (
                    <button key={opt} onClick={() => setBleedingData({ ...bleedingData, clots: opt })}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border ${bleedingData.clots === opt ? 'bg-[#FF8FA3] text-white border-[#FF8FA3]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Blood color</label>
                <div className="flex gap-2">
                  {['Bright Red', 'Dark Red', 'Brown'].map(opt => (
                    <button key={opt} onClick={() => setBleedingData({ ...bleedingData, color: opt })}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border ${bleedingData.color === opt ? 'bg-[#FF8FA3] text-white border-[#FF8FA3]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Any meds taken?</label>
                <div className="flex flex-wrap gap-2">
                  {['None', 'Paracetamol', 'Ibuprofen', 'Agbo'].map(opt => (
                    <button key={opt} onClick={() => setBleedingData({ ...bleedingData, meds: opt })}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border ${bleedingData.meds === opt ? 'bg-[#FF8FA3] text-white border-[#FF8FA3]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              {(bleedingData.flow === 'Very Heavy' || bleedingData.clots === 'Big') && (
                <div className="bg-[#FFE5EC] border border-[#FF8FA3]/50 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-[#8A2C3E] leading-relaxed">Sister, this is heavy. If you are soaking a pad in 1 hour or feeling dizzy, please see a nurse quickly. Don't wait alone.</p>
                </div>
              )}
            </div>
            <button onClick={saveBleedingLog} className="w-full bg-[#4A2C35] text-white py-3.5 rounded-full font-bold shadow-lg active:scale-95 mt-4">Save Check-In 💚</button>
          </div>
        </div>
      )}

      {/* FLOATING OVI ORB */}
      <button 
        onClick={() => router.push('/chat')}
        className="fixed bottom-28 right-6 z-50 w-16 h-16 rounded-full bg-linear-to-tr from-[#FF8FA3] to-[#9CAF88] shadow-[0_8px_32px_rgba(255,143,163,0.4)] animate-orb-breathe flex items-center justify-center active:scale-95 transition-transform"
      >
        <span className="text-2xl text-white font-bold drop-shadow-md">O</span>
      </button>

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