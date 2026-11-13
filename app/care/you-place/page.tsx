'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase';

export default function YouPlace() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  const [data, setData] = useState({
    lastPeriod: '',
    cycleLength: '',
    bleedDays: '',
    flow: '',
    clots: '',
    painLevel: 5,
    painWhere: [] as string[],
    spotting: '',
    signs: [] as string[],
    signFrequency: '',
    meds: [] as string[],
    medDate: '',
    pregnancyHistory: '',
    pregnancyDate: '',
    weight: '',
    stress: [] as string[],
    family: '',
    sexuallyActive: '',
    testResult: '',
    doctorVisit: '',
    doctorNotes: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('lateCircleYouPlace');
    if (saved) {
      const parsed = JSON.parse(saved);
      setData({
        ...parsed,
        pregnancyDate: parsed.pregnancyDate || '',
        medDate: parsed.medDate || '',
        doctorNotes: parsed.doctorNotes || '',
      });
    }
    const savedStep = localStorage.getItem('lateCircleYouPlaceStep');
    if (savedStep) setStep(parseInt(savedStep));
    setIsLoaded(true);
  }, []);

  // Helper to sync to Supabase
  const syncToSupabase = (currentData: typeof data) => {
    const userId = localStorage.getItem('lateCircleUserId');
    if (!userId) return;

    supabase.from('you_place').upsert([{
      user_id: userId,
      last_period: currentData.lastPeriod || null,
      cycle_length: currentData.cycleLength,
      bleed_days: currentData.bleedDays,
      flow: currentData.flow,
      clots: currentData.clots,
      pain_level: currentData.painLevel,
      pain_where: currentData.painWhere,
      spotting: currentData.spotting,
      signs: currentData.signs,
      sign_frequency: currentData.signFrequency,
      meds: currentData.meds,
      med_date: currentData.medDate || null,
      pregnancy_history: currentData.pregnancyHistory,
      pregnancy_date: currentData.pregnancyDate || null,
      weight: currentData.weight,
      stress: currentData.stress,
      family: currentData.family,
      sexually_active: currentData.sexuallyActive,
      test_result: currentData.testResult,
      doctor_visit: currentData.doctorVisit,
      doctor_notes: currentData.doctorNotes
    }], { onConflict: 'user_id' }).then(({ error }) => {
      if (error) console.error("You place error:", error);
    });
  };

  const saveAndNext = () => {
    localStorage.setItem('lateCircleYouPlace', JSON.stringify(data));
    localStorage.setItem('lateCircleYouPlaceStep', (step + 1).toString());
    syncToSupabase(data);
    if (step < 5) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      router.push('/care/doctor-pdf');
    }
  };

  const saveAndRest = () => {
    localStorage.setItem('lateCircleYouPlace', JSON.stringify(data));
    localStorage.setItem('lateCircleYouPlaceStep', step.toString());
    syncToSupabase(data);
    router.push('/care');
  };

  const goBack = () => {
    localStorage.setItem('lateCircleYouPlace', JSON.stringify(data));
    localStorage.setItem('lateCircleYouPlaceStep', (step - 1).toString());
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const toggleArray = (key: keyof typeof data, value: string) => {
    const current = data[key] as string[];
    if (current.includes(value)) {
      setData({ ...data, [key]: current.filter(v => v !== value) });
    } else {
      setData({ ...data, [key]: [...current, value] });
    }
  };

  const isMoreThan60Days = () => {
    if (!data.lastPeriod) return false;
    const last = new Date(data.lastPeriod);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 60;
  };

  if (!isLoaded) return <div className="h-screen w-full bg-[#FFF0F3]" />;

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] flex flex-col items-center pt-12 px-6 pb-32 font-sans">
      
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-6">
        <button onClick={() => router.push('/care')} className="text-[#4A2C35]/50 text-sm font-medium active:opacity-50">
          ← Care
        </button>
        <span className="text-[10px] font-bold text-[#9CAF88] bg-[#9CAF88]/10 px-3 py-1 rounded-full">
          Step {step} of 5
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-sm h-1.5 bg-[#4A2C35]/5 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-[#9CAF88] transition-all duration-500"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <h1 className="text-xl font-bold text-[#4A2C35] mb-2 text-center w-full">
        Build your story, fine girl.
      </h1>
      <p className="text-xs text-[#4A2C35]/60 mb-8 text-center w-full px-4">
        No rush. Take it small small. If you are tired, tap Save & Close.
      </p>

      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-sm border border-[#4A2C35]/5">
        
        {/* STEP 1: MY PERIODS */}
        {step === 1 && (
          <div className="animate-fade-in space-y-5">
            <h2 className="text-sm font-bold text-[#8A2C3E]">Step 1: My Periods</h2>
            
            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">When did your last period start?</label>
              <input 
                type="date" 
                value={data.lastPeriod}
                onChange={(e) => setData({ ...data, lastPeriod: e.target.value })}
                className="w-full bg-[#FFF0F3] border border-[#4A2C35]/10 text-[#4A2C35] p-3 rounded-xl text-sm focus:outline-none focus:border-[#FF8FA3]" 
              />
              {isMoreThan60Days() && (
                <div className="mt-3 bg-[#FFE5EC] border border-[#FF8FA3]/30 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-[#8A2C3E] leading-relaxed">
                    Fine girl, it has been a long time. Please make sure you mention this to the doctor, and try to get a scan this week.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">How long is your cycle usually?</label>
              <div className="flex flex-wrap gap-2">
                {['I don\'t know', '28', '30', '35', '40+', 'It changes'].map(opt => (
                  <button key={opt} onClick={() => setData({ ...data, cycleLength: opt })}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border ${data.cycleLength === opt ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">How many days do you bleed?</label>
              <div className="flex flex-wrap gap-2">
                {['2', '3', '4', '5', '6', '7+'].map(opt => (
                  <button key={opt} onClick={() => setData({ ...data, bleedDays: opt })}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border ${data.bleedDays === opt ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BLEEDING & PAIN */}
        {step === 2 && (
          <div className="animate-fade-in space-y-5">
            <h2 className="text-sm font-bold text-[#8A2C3E]">Step 2: Bleeding & Pain</h2>
            
            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">How heavy is your flow?</label>
              <div className="flex gap-2">
                {['Light', 'Medium', 'Heavy'].map(opt => (
                  <button key={opt} onClick={() => setData({ ...data, flow: opt })}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border ${data.flow === opt ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Do you see clots?</label>
              <div className="flex gap-2">
                {['Yes', 'No'].map(opt => (
                  <button key={opt} onClick={() => setData({ ...data, clots: opt })}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border ${data.clots === opt ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Pain level (1-10)</label>
              <input 
                type="range" min="1" max="10" 
                value={data.painLevel}
                onChange={(e) => setData({ ...data, painLevel: parseInt(e.target.value) })}
                className="w-full accent-[#FF8FA3]" 
              />
              <p className="text-center text-sm font-bold text-[#8A2C3E] mt-1">{data.painLevel} / 10</p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Where is the pain?</label>
              <div className="flex flex-wrap gap-2">
                {['Waist', 'Belly', 'Back'].map(opt => (
                  <button key={opt} onClick={() => toggleArray('painWhere', opt)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border ${data.painWhere.includes(opt) ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BODY SIGNS */}
        {step === 3 && (
          <div className="animate-fade-in space-y-5">
            <h2 className="text-sm font-bold text-[#8A2C3E]">Step 3: My Body Signs</h2>
            
            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Tick what you feel:</label>
              <div className="flex flex-wrap gap-2">
                {['Acne', 'Hair on chin', 'Cravings', 'Bloat', 'Tired', 'Emotional', 'Waist pain'].map(opt => (
                  <button key={opt} onClick={() => toggleArray('signs', opt)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border ${data.signs.includes(opt) ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">When do you feel them?</label>
              <div className="flex gap-2">
                {['Every cycle', 'Sometimes', 'This month only'].map(opt => (
                  <button key={opt} onClick={() => setData({ ...data, signFrequency: opt })}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border ${data.signFrequency === opt ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: THE SENSITIVE STUFF */}
        {step === 4 && (
          <div className="animate-fade-in space-y-5">
            <h2 className="text-sm font-bold text-[#8A2C3E]">Step 4: What your body took</h2>
            <p className="text-[11px] text-[#4A2C35]/50 italic mb-4">Only on your phone. Skip anything you want. No judgement.</p>
            
            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Did you take any of these this month?</label>
              <div className="flex flex-col gap-2">
                {['Agbo / Herbal', 'Postinor', 'Contraceptive', 'Antibiotic', 'Pain drug', 'Vitamin', 'Nothing'].map(opt => (
                  <button key={opt} onClick={() => toggleArray('meds', opt)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium border ${data.meds.includes(opt) ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {data.meds.length > 0 && !data.meds.includes('Nothing') && (
              <div>
                <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">When did you take it?</label>
                <input 
                  type="date" 
                  value={data.medDate || ''}
                  onChange={(e) => setData({ ...data, medDate: e.target.value })}
                  className="w-full bg-[#FFF0F3] border border-[#4A2C35]/10 text-[#4A2C35] p-3 rounded-xl text-sm focus:outline-none focus:border-[#FF8FA3]" 
                />
              </div>
            )}

            <div className="border-t border-[#4A2C35]/5 pt-5">
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Have you been pregnant in the last 6 months?</label>
              <div className="flex flex-col gap-2">
                {['No', 'Yes - Miscarriage', 'Yes - Abortion', 'Yes - Gave Birth'].map(opt => (
                  <button key={opt} onClick={() => setData({ ...data, pregnancyHistory: opt })}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium border ${data.pregnancyHistory === opt ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
              
              {data.pregnancyHistory?.includes('Miscarriage') || data.pregnancyHistory?.includes('Abortion') ? (
                <div className="mt-3">
                  <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">When did it happen?</label>
                  <input 
                    type="date" 
                    value={data.pregnancyDate || ''}
                    onChange={(e) => setData({ ...data, pregnancyDate: e.target.value })}
                    className="w-full bg-[#FFF0F3] border border-[#4A2C35]/10 text-[#4A2C35] p-3 rounded-xl text-sm focus:outline-none focus:border-[#FF8FA3]" 
                  />
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* STEP 5: LIFE & FAMILY */}
        {step === 5 && (
          <div className="animate-fade-in space-y-5">
            <h2 className="text-sm font-bold text-[#8A2C3E]">Step 5: My Life & Family</h2>
            
            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Did your weight change?</label>
              <div className="flex flex-wrap gap-2">
                {['Went up', 'Went down', 'Same', "I don't know"].map(opt => (
                  <button key={opt} onClick={() => setData({ ...data, weight: opt })}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border ${data.weight === opt ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Any stress this month?</label>
              <div className="flex flex-wrap gap-2">
                {['Exams', 'Travel', 'Work', 'Sickness', 'Family', 'None'].map(opt => (
                  <button key={opt} onClick={() => toggleArray('stress', opt)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border ${data.stress.includes(opt) ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Family history (Mum/Sister)</label>
              <div className="flex flex-wrap gap-2">
                {['Mum - fibroid', 'Sister - PCOS', 'None', "I don't know"].map(opt => (
                  <button key={opt} onClick={() => setData({ ...data, family: opt })}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border ${data.family === opt ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Sexually active?</label>
              <div className="flex gap-2">
                {['Yes', 'No', 'Skip'].map(opt => (
                  <button key={opt} onClick={() => setData({ ...data, sexuallyActive: opt })}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border ${data.sexuallyActive === opt ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Pregnancy test?</label>
              <div className="flex flex-wrap gap-2">
                {['Negative', 'Positive', 'No', 'Skip'].map(opt => (
                  <button key={opt} onClick={() => setData({ ...data, testResult: opt })}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border ${data.testResult === opt ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#4A2C35]/5 pt-5">
              <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">Did you see a doctor about this delay?</label>
              <div className="flex flex-wrap gap-2">
                {['No', 'Yes - Did a test', 'Yes - Did a scan'].map(opt => (
                  <button key={opt} onClick={() => setData({ ...data, doctorVisit: opt })}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border ${data.doctorVisit === opt ? 'bg-[#4A2C35] text-white border-[#4A2C35]' : 'bg-[#FFF0F3] text-[#4A2C35]/60 border-[#4A2C35]/10'}`}>
                    {opt}
                  </button>
                ))}
              </div>
              
              {data.doctorVisit !== 'No' && data.doctorVisit !== '' && (
                <div className="mt-3">
                  <label className="text-xs font-bold text-[#4A2C35]/70 block mb-2">What did they tell you?</label>
                  <input 
                    type="text" 
                    value={data.doctorNotes || ''}
                    onChange={(e) => setData({ ...data, doctorNotes: e.target.value })}
                    placeholder="e.g. They said I was not pregnant"
                    className="w-full bg-[#FFF0F3] border border-[#4A2C35]/10 text-[#4A2C35] p-3 rounded-xl text-sm focus:outline-none focus:border-[#FF8FA3]" 
                  />
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* BUTTONS */}
      <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
        <div className="flex gap-3">
          {step > 1 && (
            <button 
              onClick={goBack}
              className="w-1/3 bg-white border border-[#4A2C35]/15 text-[#4A2C35]/60 py-3.5 rounded-full font-bold active:scale-95 text-sm"
            >
              ← Back
            </button>
          )}
          
          <button 
            onClick={saveAndNext}
            className={`${step > 1 ? 'w-2/3' : 'w-full'} bg-[#4A2C35] text-white py-3.5 rounded-full font-bold shadow-lg active:scale-95 text-sm`}
          >
            {step === 5 ? "Build My Doctor PDF" : "Next Step →"}
          </button>
        </div>

        <button 
          onClick={saveAndRest}
          className="w-full bg-[#FFF0F3] text-[#4A2C35]/60 border border-[#4A2C35]/10 py-3.5 rounded-full font-bold active:scale-95 text-sm"
        >
          Save & Close (I will come back)
        </button>
      </div>

    </main>
  );
}