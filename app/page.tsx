'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase';

function getCycleData(lastPeriodDateString: string | null, cycleLengths: number[] = []) {
  if (!lastPeriodDateString) return { currentDay: 1, average: 35, lateDays: 0 };
  const lastPeriod = new Date(lastPeriodDateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastPeriod.getTime());
  const currentDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
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

export default function Home() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastPeriodDate, setLastPeriodDate] = useState<string>('');
  
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

  useEffect(() => {
    const onboarded = localStorage.getItem('lateCircleOnboarded');
    if (!onboarded) {
      router.push('/onboarding');
      return;
    }

    const savedDate = localStorage.getItem('lateCircleLastPeriod');
    if (savedDate) setLastPeriodDate(savedDate);

    const savedData = localStorage.getItem('lateCircleData');
    if (savedData) setCircles(JSON.parse(savedData));

    const savedLog = localStorage.getItem('lateCircleLastFoodLog');
    if (savedLog) {
      const log = JSON.parse(savedLog);
      if (log.score === 'Red') {
        setOviPattern(`Yesterday you ate ${log.name} at ${log.time}. It was heavy and late. Tomorrow focus: Eat before 8pm. Same food, just earlier.`);
      }
    }

    const savedNightClosed = localStorage.getItem('lateCircleNightClosed');
    if (savedNightClosed === 'true') setIsNightClosed(true);
    
    async function fetchFoods() {
      const { data, error } = await supabase.from('foods').select('*').order('name');
      if (data) setDbFoods(data);
      if (error) console.error("Error fetching foods:", error);
    }
    fetchFoods();
    
    setIsLoaded(true);
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (calmView === 'breathing' && breathTime > 0) {
      timer = setTimeout(() => setBreathTime((prev) => prev - 1), 1000);
    } else if (calmView === 'breathing' && breathTime === 0) {
      setShowWinCelebration(true);
      setTimeout(() => {
        setShowWinCelebration(false);
        setCircles(prev => ({ ...prev, calm: true }));
        setActiveModal(null);
        setCalmView(null);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [calmView, breathTime]);

  const cycleData = getCycleData(lastPeriodDate, [32, 35, 38]);

  const saveState = (newState: any) => {
    setCircles(newState);
    localStorage.setItem('lateCircleData', JSON.stringify(newState));
  };

  const completeCircle = (circle: 'food' | 'sleep' | 'calm') => {
    saveState({ ...circles, [circle]: true });
    setActiveModal(null); 
    setShowFoodDetails(false);
  };

  const isWalkDone = circles.walk;
  const closedCount = [circles.food, isWalkDone, circles.sleep, circles.calm].filter(Boolean).length;

  const cyclePercent = (cycleData.currentDay / cycleData.average) * 100;
  const ringRadius = 75;
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

    if (finalScore === 'Green') {
      setShowWinCelebration(true);
      setTimeout(() => {
        setShowWinCelebration(false);
        completeCircle('food');
      }, 2500);
    } else {
      completeCircle('food');
    }
  };

  const handleQuickWin = (circle: 'sleep' | 'walk') => {
    setActiveModal(null);
    setShowWinCelebration(true);
    setTimeout(() => {
      setShowWinCelebration(false);
      if (circle === 'walk') {
        saveState({ ...circles, walk: true });
      } else {
        completeCircle(circle);
      }
    }, 2500);
  };

  const handleFoodYes = () => {
    setShowWinCelebration(true);
    setTimeout(() => {
      setShowWinCelebration(false);
      completeCircle('food');
    }, 2500);
  };

  const openCalmMenu = () => {
    setActiveModal('calm');
    setCalmView('menu');
  };

  if (!isLoaded) return null;

  return (
    <main className="h-screen overflow-hidden bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-8 px-6 font-sans relative">
      
      {showWinCelebration && (
        <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-[#FFF0F3]/95 backdrop-blur-md animate-fade-in">
          <div className="w-32 h-32 rounded-full bg-[#9CAF88] flex items-center justify-center mb-6 animate-pop-in shadow-[0_0_60px_rgba(156,175,136,0.3)]">
            <span className="text-7xl text-white font-bold">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-[#4A2C35] mb-2 animate-slide-up-slow">You did well.</h2>
          <p className="text-sm text-[#4A2C35]/60 animate-slide-up-slow">Circle closed Green 💚</p>
        </div>
      )}

      <div className="flex flex-col items-center w-full relative mb-4 px-8 text-center mt-4">
        <h1 className="text-2xl font-serif text-[#4A2C35] mb-1 tracking-[0.2em]">LATE CIRCLE</h1>
        <p className="text-[#4A2C35]/50 text-xs font-medium">Day {cycleData.currentDay} of your cycle</p>
      </div>

      <button onClick={() => router.push('/cycle')} className="relative mt-2 mb-8 active:scale-95 transition-transform" style={{ width: '180px', height: '180px' }}>
        <svg className="absolute inset-0 transform -rotate-90" width="180" height="180" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={ringRadius} fill="transparent" stroke="rgba(74, 44, 53, 0.08)" strokeWidth="26" />
          <circle
            cx="90" cy="90" r={ringRadius} fill="transparent"
            stroke={cycleData.lateDays > 0 ? "#FF8FA3" : "#9CAF88"} strokeWidth="26"
            strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="flex items-baseline justify-center gap-1 leading-none">
            <span className={`text-4xl font-bold tracking-tighter ${cycleData.lateDays > 0 ? 'text-[#FF8FA3]' : 'text-[#4A2C35]'}`}>
              {cycleData.currentDay}
            </span>
            <span className="text-xl text-[#4A2C35]/30 font-medium">/ {cycleData.average}</span>
          </div>
          <span className="text-[9px] text-[#4A2C35]/50 mt-1 font-bold tracking-widest uppercase">days</span>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full max-w-sm mb-6 mt-auto">
        <button onClick={() => { if (!isNightClosed) { setActiveModal('food'); setShowFoodDetails(false); setShowFoodLog(false); } }} className="flex flex-col items-center active:scale-95 transition-all">
          <div className={`w-18 h-18 rounded-full flex items-center justify-center transition-all duration-300 ${
            circles.food ? 'border-[6px] border-[#9CAF88] bg-[#9CAF88]/20 text-[#9CAF88] shadow-[0_0_15px_rgba(156,175,136,0.2)]' : 'border-4 border-[#4A2C35]/10 bg-white text-[#4A2C35]/50'
          }`}>
            <span className={circles.food ? 'text-3xl font-bold text-[#4A2C35]' : 'text-xl'}>{circles.food ? '✓' : '🍲'}</span>
          </div>
          <span className="mt-2 font-semibold text-sm text-[#4A2C35]">Food</span>
          <span className={`text-xs ${circles.food ? 'text-[#9CAF88]' : 'text-[#4A2C35]/40'}`}>{circles.food ? 'Closed' : 'Open'}</span>
        </button>

        <button onClick={() => { if (!isNightClosed) setActiveModal('walk'); }} className="flex flex-col items-center active:scale-95 transition-all">
          <div className={`relative w-18 h-18 rounded-full flex items-center justify-center transition-all duration-300 ${
            isWalkDone ? 'border-[6px] border-[#9CAF88] bg-[#9CAF88]/20 text-[#9CAF88] shadow-[0_0_15px_rgba(156,175,136,0.2)]' : 'border-4 border-[#4A2C35]/10 bg-white text-[#4A2C35]/50'
          }`}>
            <span className={`relative z-10 ${isWalkDone ? 'text-3xl font-bold text-[#4A2C35]' : 'text-xl'}`}>{isWalkDone ? '✓' : '👟'}</span>
          </div>
          <span className="mt-2 font-semibold text-sm text-[#4A2C35]">Walk</span>
          <span className={`text-xs ${isWalkDone ? 'text-[#9CAF88]' : 'text-[#4A2C35]/40'}`}>{isWalkDone ? 'Closed' : 'Open'}</span>
        </button>

        <button onClick={() => { if (!isNightClosed) setActiveModal('sleep'); }} className="flex flex-col items-center active:scale-95 transition-all">
          <div className={`w-18 h-18 rounded-full flex items-center justify-center transition-all duration-300 ${
            circles.sleep ? 'border-[6px] border-[#9CAF88] bg-[#9CAF88]/20 text-[#9CAF88] shadow-[0_0_15px_rgba(156,175,136,0.2)]' : 'border-4 border-[#4A2C35]/10 bg-white text-[#4A2C35]/50'
          }`}>
            <span className={circles.sleep ? 'text-3xl font-bold text-[#4A2C35]' : 'text-xl'}>{circles.sleep ? '✓' : '🌙'}</span>
          </div>
          <span className="mt-2 font-semibold text-sm text-[#4A2C35]">Sleep</span>
          <span className={`text-xs ${circles.sleep ? 'text-[#9CAF88]' : 'text-[#4A2C35]/40'}`}>{circles.sleep ? 'Closed' : 'Open'}</span>
        </button>

        <button onClick={() => { if (!isNightClosed) openCalmMenu(); }} className="flex flex-col items-center active:scale-95 transition-all">
          <div className={`w-18 h-18 rounded-full flex items-center justify-center transition-all duration-300 ${
            circles.calm ? 'border-[6px] border-[#9CAF88] bg-[#9CAF88]/20 text-[#9CAF88] shadow-[0_0_15px_rgba(156,175,136,0.2)]' : 'border-4 border-[#4A2C35]/10 bg-white text-[#4A2C35]/50'
          }`}>
            <span className={circles.calm ? 'text-3xl font-bold text-[#4A2C35]' : 'text-xl'}>{circles.calm ? '✓' : '🧠'}</span>
          </div>
          <span className="mt-2 font-semibold text-sm text-[#4A2C35]">Calm</span>
          <span className={`text-xs ${circles.calm ? 'text-[#9CAF88]' : 'text-[#4A2C35]/40'}`}>{circles.calm ? 'Closed' : '90 secs'}</span>
        </button>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center mb-28 mt-auto">
        <h2 className="text-xl font-bold text-[#4A2C35] mb-2">{closedCount} / 4 today</h2>
        <button 
          onClick={() => setShowGoodnight(true)} 
          className={`w-full py-4 rounded-full text-lg font-bold active:scale-95 transition-all ${
            closedCount === 4 
              ? 'bg-[#4A2C35] text-white shadow-[0_4px_20px_rgba(74,44,53,0.2)] animate-pulse' 
              : 'bg-[#9CAF88] text-white shadow-[0_4px_20px_rgba(156,175,136,0.3)]'
          }`}
        >
          {closedCount === 4 ? "I'm done for today 💚" : "Close my night (7pm-11pm)"}
        </button>
      </div>

      {activeModal && activeModal !== 'calm' && (
        <div className="absolute inset-0 bg-[#4A2C35]/20 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-[#4A2C35] shadow-2xl animate-slide-up border border-[#4A2C35]/5">
            {activeModal === 'food' && (
              <div className="flex flex-col max-h-[75vh]">
                {!showFoodLog ? (
                  <>
                    <h3 className="text-lg font-bold mb-3 text-[#4A2C35] leading-snug">Did you eat balanced plates today with Nigerian food? No food after 9pm?</h3>
                    <div className="bg-[#FFF0F3] border border-[#FFB3C1]/30 rounded-2xl p-4 mb-3">
                      <ul className="text-[13px] text-[#4A2C35]/80 space-y-1.5">
                        <li>• Rice + stew + protein + vegetable</li>
                        <li>• Eba / fufu + soup + protein</li>
                        <li>• Yam / beans + vegetable + protein</li>
                        <li>• Indomie + egg + vegetable</li>
                      </ul>
                    </div>
                    <p className="text-[11px] text-[#9CAF88] font-semibold mb-5">Rule: Last food before 9pm</p>
                    <div className="flex gap-3 mt-auto">
                      <button onClick={handleFoodYes} className="flex-1 bg-[#9CAF88] text-white py-3 rounded-xl font-bold active:scale-95">Yes, I did</button>
                      <button onClick={() => setShowFoodLog(true)} className="flex-1 border border-[#4A2C35]/15 py-3 rounded-xl font-medium active:scale-95">No, I didn't</button>
                    </div>
                  </>
                ) : !showFoodDetails ? (
                  <>
                    <h3 className="text-xl font-bold mb-2 text-[#4A2C35]">What did you eat?</h3>
                    <input type="text" placeholder="Search e.g. Bread, Eba..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#FFF0F3] border border-[#4A2C35]/10 text-[#4A2C35] p-4 rounded-xl mb-4 focus:outline-none focus:border-[#FF8FA3]" />
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
                      <button onClick={() => setActiveModal(null)} className="px-6 border border-[#4A2C35]/15 py-3 rounded-xl font-medium opacity-70">Cancel</button>
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
                <div className="bg-[#FFF0F3] border border-[#FFB3C1]/30 rounded-2xl p-4 mb-3">
                  <ul className="text-[13px] text-[#4A2C35]/80 space-y-1.5">
                    <li>• Walk to junction and back</li>
                    <li>• Dance to 3 songs in room</li>
                    <li>• Sweep, mop, climb stairs 10 mins</li>
                    <li>• Stand &amp; stretch every 2 hrs if you sit in shop/office</li>
                  </ul>
                </div>
                <p className="text-[11px] text-[#9CAF88] font-semibold mb-5">Rule: No need gym wear</p>
                <div className="flex gap-3 mt-auto">
                  <button onClick={() => handleQuickWin('walk')} className="flex-1 bg-[#9CAF88] text-white py-3 rounded-xl font-bold active:scale-95">Yes, I moved 20 mins</button>
                  <button onClick={() => setActiveModal(null)} className="flex-1 border border-[#4A2C35]/15 py-3 rounded-xl font-medium active:scale-95">Not yet</button>
                </div>
              </>
            )}
            {activeModal === 'sleep' && (
              <>
                <h3 className="text-lg font-bold mb-3 text-[#4A2C35] leading-snug">Will you be in bed by 10:30pm tonight? No phone scrolling?</h3>
                <p className="text-[11px] text-[#9CAF88] font-semibold mb-1">Rule: Bed by 10:30, not sleep by 10:30</p>
                <p className="text-[11px] text-[#4A2C35]/50 font-medium mb-5">Target: 7+ hrs of sleep</p>
                <div className="flex gap-3 mt-auto">
                  <button onClick={() => handleQuickWin('sleep')} className="flex-1 bg-[#9CAF88] text-white py-3 rounded-xl font-bold active:scale-95">Yes, I will</button>
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
            <div className="flex flex-col h-full animate-fade-in">
              <div className="flex flex-col items-center mb-8">
                <h1 className="text-3xl font-bold text-[#4A2C35] mb-2">Late Circle</h1>
                <p className="text-sm text-[#4A2C35]/50">Calm tools for your night</p>
              </div>
              <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
                <button onClick={() => { setCalmView('breathing'); setBreathTime(90); }} className="flex items-center gap-4 bg-white border border-[#4A2C35]/5 p-4 rounded-2xl shadow-sm active:scale-95">
                  <div className="w-14 h-14 rounded-xl bg-[#FFF0F3] flex items-center justify-center text-2xl">⭐</div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-[#4A2C35]">Don't Talk To Me</h3>
                    <p className="text-xs text-[#4A2C35]/50">No sweet words, just space</p>
                  </div>
                </button>
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
                <button onClick={() => completeCircle('calm')} className="w-full bg-[#4A2C35] text-white py-4 rounded-full text-lg font-bold active:scale-95">I did my calm</button>
                <button onClick={() => setActiveModal(null)} className="w-full text-center text-sm text-[#4A2C35]/40 py-2">Close</button>
              </div>
            </div>
          )}
          {calmView === 'breathing' && (
            <div className="flex flex-col items-center justify-between h-full animate-fade-in pb-32">
              <h2 className="text-lg text-[#4A2C35]/50 mt-4">Don't Talk To Me</h2>
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
              <div className="w-full max-w-sm bg-white text-[#4A2C35] p-6 rounded-lg shadow-xl rotate-1 border border-[#4A2C35]/5">
                <p className="text-lg font-handwriting">I am just tired of waiting...</p>
              </div>
              <button onClick={() => completeCircle('calm')} className="mt-12 w-full max-w-sm bg-[#4A2C35] text-white py-4 rounded-full text-lg font-bold">Burn & Close Calm</button>
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
              <button onClick={() => completeCircle('calm')} className="w-full max-w-sm bg-[#4A2C35] text-white py-4 rounded-full text-lg font-bold">Close Calm</button>
            </div>
          )}
        </div>
      )}

      {showGoodnight && (
        <div className="absolute inset-0 bg-[#FFF0F3] z-50 flex flex-col items-center pt-12 px-6 pb-28">
          <div className="flex items-center gap-3 mb-2 text-[#9CAF88]">
            <span className="text-3xl">🌙</span>
            <h1 className="text-3xl font-serif text-[#4A2C35]">Goodnight, Ada</h1>
          </div>
          <p className="text-[#4A2C35]/60 text-sm mb-10 text-center">
            {closedCount === 4 ? "You closed all 4 circles today. You showed up for yourself." : `You closed ${closedCount} circle${closedCount === 1 ? '' : 's'} today. That's still a win.`}
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
              {closedCount === 4 ? "Perfect day, babe. Let's do it again tomorrow ✨" : !circles.sleep ? "Tomorrow's little goal: In bed by 10:30pm, no scrolling ✨" : !circles.food ? "Tomorrow's little goal: Eat a lovely balanced plate before 9pm 🍲" : !isWalkDone ? "Tomorrow's little goal: 20 mins of moving your body 👟" : "Tomorrow's little goal: 90 seconds of calm just for you 🧠"}
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

    </main>
  );
}