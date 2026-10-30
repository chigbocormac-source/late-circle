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
    walk: 0, 
    sleep: false,
    calm: false,
  });
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showGoodnight, setShowGoodnight] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagMessage, setTagMessage] = useState<string | null>(null);

  const [dbFoods, setDbFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);
  const [showFoodDetails, setShowFoodDetails] = useState(false);

  const [showWinCelebration, setShowWinCelebration] = useState(false);
  const [oviPattern, setOviPattern] = useState<string | null>(null);

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

    // Check yesterday's log for the Ovi Pattern
    const savedLog = localStorage.getItem('lateCircleLastFoodLog');
    if (savedLog) {
      const log = JSON.parse(savedLog);
      if (log.score === 'Red') {
        setOviPattern(`Yesterday you ate ${log.name} at ${log.time}. It was heavy and late. Tomorrow focus: Eat before 8pm. Same food, just earlier.`);
      } else if (log.score === 'Yellow') {
        setOviPattern(`Yesterday you ate ${log.name} at ${log.time}. It was carb only. Tomorrow focus: Add protein to your plate.`);
      }
    }
    
    async function fetchFoods() {
      const { data, error } = await supabase.from('foods').select('*').order('name');
      if (data) setDbFoods(data);
      if (error) console.error("Error fetching foods:", error);
    }
    fetchFoods();
    
    setIsLoaded(true);
  }, [router]);

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

  const toggleTag = (tag: string) => {
    if (tag === 'bloat') setTagMessage("Bloat is not fat. It's gas from late eating. Close Food Green (before 9pm) and walk 30 mins today. Tomorrow morning, your belly will be flat.");
    else if (tag === 'waist pain') setTagMessage("Lying down makes cramps worse. Walk today = blood flow = cramp -40% tomorrow.");
    else if (tag === 'acne') setTagMessage("Sleep before 11pm tonight. Less stress hormone = fewer patches tomorrow.");
    else if (tag === 'emotional') setTagMessage("Small thing will make you angry or cry today. Do 2 mins Calm. Tell your brain: 'I am safe.'");
    else setTagMessage(null);

    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
      setTagMessage(null);
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const isWalkDone = circles.walk >= 6000;
  const closedCount = [circles.food, isWalkDone, circles.sleep, circles.calm].filter(Boolean).length;

  const cyclePercent = (cycleData.currentDay / cycleData.average) * 100;
  const ringRadius = 75;
  const circleCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circleCircumference - (Math.min(cyclePercent, 100) / 100) * circleCircumference;

  // THE SMART SEARCH LOGIC
  const filteredFoods = dbFoods.filter(f => {
    // 1. If search is empty, show ALL foods
    if (searchQuery.trim() === '') return true; 

    // 2. Only show foods that include the EXACT phrase she typed
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
    const hasGreen = selectedFoods.some(f => f.score === 'Green');
    
    if (hasRed) {
      plateScore = hasGreen ? 'Yellow' : 'Red';
      plateFix = hasGreen ? "The protein helps, but the heavy carb is still there. Keep portions small." : selectedFoods.find(f => f.score === 'Red')?.fix || "You can eat it, but alone your sugar will rush. Add protein to balance it.";
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
    const isLate = currentHour >= 21;

    let finalScore = plateScore;
    if (didAddFix) finalScore = 'Green';

    const newLog = {
      name: selectedFoods.map(f => f.name).join(' + '),
      score: finalScore,
      time: currentHour >= 12 ? `${currentHour - 12} PM` : `${currentHour} AM`
    };
    
    localStorage.setItem('lateCircleLastFoodLog', JSON.stringify(newLog));

    setActiveModal(null);
    setShowFoodDetails(false);
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

  const handleQuickWin = (circle: 'sleep' | 'calm' | 'walk') => {
    setActiveModal(null);
    setShowWinCelebration(true);
    setTimeout(() => {
      setShowWinCelebration(false);
      if (circle === 'walk') {
        saveState({ ...circles, walk: 6000 });
      } else {
        completeCircle(circle);
      }
    }, 2500);
  };

  if (!isLoaded) return null;

  return (
    <main className="h-screen overflow-hidden bg-[#0F0F10] text-[#E8E0D5] flex flex-col items-center pt-8 px-6 font-sans relative">
      
      {/* WIN CELEBRATION OVERLAY */}
      {showWinCelebration && (
        <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-[#0F0F10]/95 backdrop-blur-md animate-fade-in">
          <div className="w-32 h-32 rounded-full bg-[#9CAF88] flex items-center justify-center mb-6 animate-pop-in shadow-[0_0_60px_rgba(156,175,136,0.6)]">
            <span className="text-7xl text-white font-bold">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-[#9CAF88] mb-2 animate-slide-up-slow">You did well.</h2>
          <p className="text-sm text-[#E8E0D5]/70 animate-slide-up-slow">Circle closed Green 💚</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col items-center w-full relative mb-4 px-8 text-center mt-4">
        <h1 className="text-2xl font-serif text-[#9CAF88] mb-1 tracking-[0.2em]">LATE CIRCLE</h1>
        <p className="text-[#E8E0D5]/70 text-xs font-medium">Day {cycleData.currentDay} of your cycle</p>
        <button 
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="absolute right-0 top-0 text-[10px] text-red-500/50 hover:text-red-500 border border-red-500/30 px-2 py-1 rounded"
        >
          Reset
        </button>
      </div>

      {/* CYCLE RING */}
      <div className="relative mt-2 mb-4" style={{ width: '180px', height: '180px' }}>
        <svg className="absolute inset-0 transform -rotate-90" width="180" height="180" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={ringRadius} fill="transparent" stroke="rgba(232, 224, 213, 0.1)" strokeWidth="26" />
          <circle
            cx="90" cy="90" r={ringRadius} fill="transparent"
            stroke={cycleData.lateDays > 0 ? "#C97363" : "#9CAF88"} strokeWidth="26"
            strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="flex items-baseline justify-center gap-1 leading-none">
            <span className={`text-4xl font-bold tracking-tighter ${cycleData.lateDays > 0 ? 'text-[#C97363]' : ''}`}>
              {cycleData.currentDay}
            </span>
            <span className="text-xl text-[#E8E0D5]/50 font-medium">/ {cycleData.average}</span>
          </div>
          <span className="text-[9px] text-[#E8E0D5]/70 mt-1 font-bold tracking-widest uppercase">days</span>
        </div>
      </div>

      {/* WARNING BANNER */}
      <div className="flex flex-col items-center mb-3 w-full max-w-sm">
        {cycleData.lateDays > 0 ? (
          <p className="text-[#C97363] text-[10px] font-medium mb-2 flex items-center gap-1 opacity-80">🚨 {cycleData.lateDays} Days Late</p>
        ) : (
          <p className="text-[#9CAF88] text-[10px] font-medium mb-2 flex items-center gap-1 opacity-80">⚠️ Period close. Tags loading...</p>
        )}
        {tagMessage && (
          <div className="bg-[#1A1A1C] border border-[#9CAF88]/30 p-3 rounded-xl text-xs text-[#E8E0D5]/90 mb-2 transition-all animate-slide-up w-full">{tagMessage}</div>
        )}
      </div>

      {/* 4 CIRCLES */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full max-w-sm mb-6 mt-auto">
        <button onClick={() => { setActiveModal('food'); setShowFoodDetails(false); setSearchQuery(''); }} className="flex flex-col items-center active:scale-95 transition-all">
          <div className={`w-18 h-18 rounded-full flex items-center justify-center transition-all duration-300 ${
            circles.food ? 'border-[6px] border-[#9CAF88] bg-[#9CAF88]/20 text-[#9CAF88] shadow-[0_0_15px_rgba(156,175,136,0.3)]' : 'border-4 border-[#E8E0D5]/20 text-[#E8E0D5]/50'
          }`}>
            <span className={circles.food ? 'text-3xl font-bold text-white' : 'text-xl'}>{circles.food ? '✓' : '🍲'}</span>
          </div>
          <span className="mt-2 font-semibold text-sm">Food</span>
          <span className={`text-xs ${circles.food ? 'text-[#9CAF88]' : 'text-[#E8E0D5]/50'}`}>{circles.food ? 'Done' : 'Not yet'}</span>
        </button>

        <button onClick={() => setActiveModal('walk')} className="flex flex-col items-center active:scale-95 transition-all">
          <div className={`relative w-18 h-18 rounded-full flex items-center justify-center transition-all duration-300 ${
            isWalkDone ? 'border-[6px] border-[#9CAF88] bg-[#9CAF88]/20 text-[#9CAF88] shadow-[0_0_15px_rgba(156,175,136,0.3)]' : 'border-4 border-[#E8E0D5]/20 text-[#E8E0D5]/50'
          }`}>
            {!isWalkDone && circles.walk > 0 && (
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `conic-gradient(rgba(232, 224, 213, 0.2) ${(circles.walk / 6000) * 100}%, transparent 0)` }} />
            )}
            <span className={`relative z-10 ${isWalkDone ? 'text-3xl font-bold text-white' : 'text-xl'}`}>{isWalkDone ? '✓' : '👟'}</span>
          </div>
          <span className="mt-2 font-semibold text-sm">Walk</span>
          <span className={`text-xs ${isWalkDone ? 'text-[#9CAF88]' : 'text-[#E8E0D5]/50'}`}>{isWalkDone ? 'Done' : `${(circles.walk / 1000).toFixed(1)}k/6k`}</span>
        </button>

        <button onClick={() => setActiveModal('sleep')} className="flex flex-col items-center active:scale-95 transition-all">
          <div className={`w-18 h-18 rounded-full flex items-center justify-center transition-all duration-300 ${
            circles.sleep ? 'border-[6px] border-[#9CAF88] bg-[#9CAF88]/20 text-[#9CAF88] shadow-[0_0_15px_rgba(156,175,136,0.3)]' : 'border-4 border-[#E8E0D5]/20 text-[#E8E0D5]/50'
          }`}>
            <span className={circles.sleep ? 'text-3xl font-bold text-white' : 'text-xl'}>{circles.sleep ? '✓' : '🌙'}</span>
          </div>
          <span className="mt-2 font-semibold text-sm">Sleep</span>
          <span className={`text-xs ${circles.sleep ? 'text-[#9CAF88]' : 'text-[#E8E0D5]/50'}`}>{circles.sleep ? 'Done' : 'Not yet'}</span>
        </button>

        <button onClick={() => setActiveModal('calm')} className="flex flex-col items-center active:scale-95 transition-all">
          <div className={`w-18 h-18 rounded-full flex items-center justify-center transition-all duration-300 ${
            circles.calm ? 'border-[6px] border-[#9CAF88] bg-[#9CAF88]/20 text-[#9CAF88] shadow-[0_0_15px_rgba(156,175,136,0.3)]' : 'border-4 border-[#E8E0D5]/20 text-[#E8E0D5]/50'
          }`}>
            <span className={circles.calm ? 'text-3xl font-bold text-white' : 'text-xl'}>{circles.calm ? '✓' : '🧠'}</span>
          </div>
          <span className="mt-2 font-semibold text-sm">Calm</span>
          <span className={`text-xs ${circles.calm ? 'text-[#9CAF88]' : 'text-[#E8E0D5]/50'}`}>{circles.calm ? 'Done' : '2 mins'}</span>
        </button>
      </div>

      {/* TAGS */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 w-full max-w-sm">
        {['bloat', 'acne', 'emotional', 'cravings', 'waist pain'].map(tag => (
          <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            selectedTags.includes(tag) ? 'bg-[#9CAF88] text-[#0F0F10] border-[#9CAF88]' : 'bg-transparent text-[#E8E0D5]/70 border-[#E8E0D5]/20 hover:border-[#9CAF88]'
          }`}>
            {tag}
          </button>
        ))}
      </div>

      {/* BOTTOM SCORE */}
      <div className="w-full max-w-sm flex flex-col items-center mb-28 mt-auto">
        <h2 className="text-xl font-bold text-[#9CAF88] mb-2">{closedCount} / 4 today</h2>
        <button onClick={() => setShowGoodnight(true)} className="w-full bg-[#9CAF88] text-[#0F0F10] py-4 rounded-full text-lg font-bold shadow-[0_0_20px_rgba(156,175,136,0.2)] active:scale-95 transition-transform">
          Close my night (7pm-11pm)
        </button>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-sm bg-[#1A1A1C] rounded-3xl p-6 text-[#E8E0D5] shadow-2xl animate-slide-up border border-[#E8E0D5]/10">
            
            {activeModal === 'food' && (
              <div className="flex flex-col h-[70vh]">
                {!showFoodDetails ? (
                  <>
                    <h3 className="text-xl font-bold mb-2 text-[#9CAF88]">What did you eat?</h3>
                    <input 
                      type="text" 
                      placeholder="Search e.g. Bread, Eba..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="w-full bg-[#0F0F10] border border-[#E8E0D5]/20 text-[#E8E0D5] p-4 rounded-xl mb-4 focus:outline-none focus:border-[#9CAF88]" 
                    />
                    
                    <div className="overflow-y-auto flex-1 flex flex-col gap-2 mb-4 pr-2">
                      
                      {/* SHOW THE GREEN PAIRINGS */}
                      {filteredFoods.map((food) => {
                        const isSelected = selectedFoods.some(f => f.id === food.id);
                        return (
                          <button 
                            key={food.id} 
                            onClick={() => toggleFoodSelection(food)} 
                            className={`p-4 rounded-xl text-left border flex justify-between items-center transition-all ${
                              isSelected ? 'border-[#9CAF88] bg-[#9CAF88]/10' : 'border-[#E8E0D5]/10 bg-[#E8E0D5]/5'
                            }`}
                          >
                            <p className="font-semibold text-[#E8E0D5]">{food.name}</p>
                            {isSelected && <span className="text-[#9CAF88] text-xl">✓</span>}
                          </button>
                        );
                      })}
                      
                      {/* IF SHE SEARCHES SOMETHING WE DON'T HAVE A PAIRING FOR */}
                      {searchQuery.trim() !== '' && filteredFoods.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-sm text-[#E8E0D5]/70 mb-2">No Green pairing found for "{searchQuery}"</p>
                          <p className="text-xs text-[#E8E0D5]/40">Try searching a different food.</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3 mt-auto">
                      <button 
                        onClick={() => setShowFoodDetails(true)} 
                        disabled={selectedFoods.length === 0} 
                        className={`flex-1 py-3 rounded-xl font-bold ${selectedFoods.length > 0 ? 'bg-[#9CAF88] text-[#0F0F10]' : 'bg-[#9CAF88]/30 text-[#0F0F10]/50'}`}
                      >
                        Next
                      </button>
                      <button onClick={() => setActiveModal(null)} className="px-6 border border-[#E8E0D5]/30 py-3 rounded-xl font-medium opacity-70">
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold mb-3 text-[#9CAF88]">Confirm your plate</h3>
                    <div className="bg-[#0F0F10] p-4 rounded-xl border border-[#E8E0D5]/10 mb-4">
                      
                      {/* JUST THE FOOD NAME */}
                      <p className="text-sm font-bold mb-2 text-[#E8E0D5]">
                        {selectedFoods.map(f => f.name).join(' + ')}
                      </p>
                      
                      {/* EXACT FIX FROM DATABASE */}
                      <p className="text-xs text-[#E8E0D5]/70 mb-4">
                        {plateFix}
                      </p>
                      
                      {plateScore !== 'Green' ? (
                        <div className="flex gap-2 mb-4">
                          <button onClick={() => logFood(true)} className="flex-1 py-3 rounded-xl font-bold bg-[#9CAF88] text-[#0F0F10] text-xs">I added it (Make it Green)</button>
                          <button onClick={() => logFood(false)} className="flex-1 py-3 rounded-xl font-bold bg-[#E8E0D5]/10 text-[#E8E0D5] border border-[#E8E0D5]/30 text-xs">I will eat it like this</button>
                        </div>
                      ) : (
                        <button onClick={() => logFood(true)} className="w-full py-3 rounded-xl font-bold bg-[#9CAF88] text-[#0F0F10] text-sm mb-4">Close it Green</button>
                      )}
                      
                      <button onClick={() => setShowFoodDetails(false)} className="w-full text-[10px] text-[#E8E0D5]/50 underline">Back to search</button>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {activeModal === 'walk' && (
              <>
                <h3 className="text-xl font-bold mb-2 text-[#9CAF88]">Walk</h3>
                <p className="text-sm mb-6 opacity-80">Just 6k steps. No gym. Shop to junction twice.</p>
                <div className="flex gap-3 mb-4">
                  <button onClick={() => handleQuickWin('walk')} className="flex-1 bg-[#9CAF88] text-[#0F0F10] py-3 rounded-xl font-bold active:scale-95">Yes, I moved 6k</button>
                  <button onClick={() => setActiveModal(null)} className="flex-1 border border-[#E8E0D5]/30 py-3 rounded-xl font-medium opacity-70">Not yet</button>
                </div>
              </>
            )}
            {activeModal === 'sleep' && (
              <>
                <h3 className="text-xl font-bold mb-2 text-[#9CAF88]">Sleep</h3>
                <p className="text-sm mb-6 opacity-80">Sleep by 11pm. Just get into bed, phone in corner.</p>
                <div className="flex gap-3 mb-4">
                  <button onClick={() => handleQuickWin('sleep')} className="flex-1 bg-[#9CAF88] text-[#0F0F10] py-3 rounded-xl font-bold active:scale-95">Yes, slept before 11</button>
                  <button onClick={() => setActiveModal(null)} className="flex-1 border border-[#E8E0D5]/30 py-3 rounded-xl font-medium opacity-70">Not yet</button>
                </div>
              </>
            )}
            {activeModal === 'calm' && (
              <>
                <h3 className="text-xl font-bold mb-2 text-[#9CAF88]">Calm</h3>
                <p className="text-sm mb-6 opacity-80">Breathe with Ovi — inhale 4, hold 4, exhale 4. 2 mins only.</p>
                <div className="flex gap-3 mb-4">
                  <button onClick={() => handleQuickWin('calm')} className="flex-1 bg-[#9CAF88] text-[#0F0F10] py-3 rounded-xl font-bold active:scale-95">Breathe now 2 mins</button>
                  <button onClick={() => setActiveModal(null)} className="flex-1 border border-[#E8E0D5]/30 py-3 rounded-xl font-medium opacity-70">Later</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* GOODNIGHT */}
      {showGoodnight && (
        <div className="absolute inset-0 bg-[#0F0F10] z-50 flex flex-col items-center pt-12 px-6">
          <div className="flex items-center gap-3 mb-2 text-[#9CAF88]">
            <span className="text-3xl">🌙</span>
            <h1 className="text-3xl font-serif">Goodnight, Ada</h1>
          </div>
          <p className="text-[#E8E0D5]/70 text-sm mb-6">Today you closed {closedCount}/4 circles</p>
          
          {/* OVI'S PATTERN */}
          {oviPattern && (
            <div className="bg-[#1A1A1C] border border-[#C97363]/30 p-4 rounded-2xl mb-8 w-full max-w-sm">
              <h3 className="text-xs font-bold text-[#C97363] uppercase tracking-wider mb-2">Ovi Noticed</h3>
              <p className="text-sm text-[#E8E0D5] leading-relaxed">{oviPattern}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 w-full max-w-sm mb-12">
            <div className="flex flex-col items-center">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center ${circles.food ? 'bg-[#9CAF88] text-white' : 'border-4 border-[#E8E0D5]/20 text-[#E8E0D5]/50'}`}>
                <span className={circles.food ? 'text-5xl font-bold' : 'text-3xl'}>{circles.food ? '✓' : '🍲'}</span>
              </div>
              <span className="mt-4 font-semibold text-lg">Food</span>
              <span className="text-sm text-[#E8E0D5]/50">{circles.food ? 'Done' : 'Not yet'}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center ${circles.calm ? 'bg-[#9CAF88] text-white' : 'border-4 border-[#E8E0D5]/20 text-[#E8E0D5]/50'}`}>
                <span className={circles.calm ? 'text-5xl font-bold' : 'text-3xl'}>{circles.calm ? '✓' : '🧠'}</span>
              </div>
              <span className="mt-4 font-semibold text-lg">Calm</span>
              <span className="text-sm text-[#E8E0D5]/50">{circles.calm ? 'Done' : 'Not yet'}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center ${isWalkDone ? 'bg-[#9CAF88] text-white' : 'border-4 border-[#E8E0D5]/20 text-[#E8E0D5]/50'}`}>
                <span className={isWalkDone ? 'text-5xl font-bold' : 'text-3xl'}>{isWalkDone ? '✓' : '👟'}</span>
              </div>
              <span className="mt-4 font-semibold text-lg">Walk</span>
              <span className="text-sm text-[#E8E0D5]/50">{isWalkDone ? 'Done' : `${(circles.walk / 1000).toFixed(1)}k/6k`}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center ${circles.sleep ? 'bg-[#9CAF88] text-white' : 'border-4 border-[#E8E0D5]/20 text-[#E8E0D5]/50'}`}>
                <span className={circles.sleep ? 'text-5xl font-bold' : 'text-3xl'}>{circles.sleep ? '✓' : '🌙'}</span>
              </div>
              <span className="mt-4 font-semibold text-lg">Sleep</span>
              <span className="text-sm text-[#E8E0D5]/50">{circles.sleep ? 'Done' : 'Not yet'}</span>
            </div>
          </div>
          <div className="w-full max-w-sm flex flex-col items-center mt-auto mb-8">
            <h2 className="text-4xl font-bold text-[#9CAF88] mb-2 flex items-center gap-2">You tried today 💚</h2>
            <p className="text-[#E8E0D5]/70 text-sm mb-8">Tomorrow focus: No food after 9pm</p>
            <button onClick={() => setShowGoodnight(false)} className="w-full bg-[#E8E0D5] text-[#0F0F10] py-4 rounded-full text-lg font-bold active:scale-95 transition-transform">See you tomorrow</button>
          </div>
        </div>
      )}

    </main>
  );
}