'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { localDateKey } from '../../../utils/analytics';

export default function DoctorPDF() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  
  // Real lifestyle data
  const [lifestyle, setLifestyle] = useState({
    food: { count: 0, percentage: 0 },
    walk: { count: 0, percentage: 0 },
    sleep: { count: 0, percentage: 0 },
    calm: { count: 0, percentage: 0 }
  });

  useEffect(() => {
    // 1. Load the You Place Data
    const saved = localStorage.getItem('lateCircleYouPlace');
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      router.push('/care/you-place');
    }

    // 2. Load the Daily History (The 4 Circles)
    const dailyHistory = JSON.parse(localStorage.getItem('lateCircleDailyHistory') || '{}');
    let foodCount = 0, walkCount = 0, sleepCount = 0, calmCount = 0;

    // Check the last 14 days
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = localDateKey(d);
      const dayData = dailyHistory[dateStr];

      if (dayData) {
        if (dayData.food) foodCount++;
        if (dayData.walk) walkCount++;
        if (dayData.sleep) sleepCount++;
        if (dayData.calm) calmCount++;
      }
    }

    // Calculate percentages (out of 14 days)
    setLifestyle({
      food: { count: foodCount, percentage: Math.round((foodCount / 14) * 100) },
      walk: { count: walkCount, percentage: Math.round((walkCount / 14) * 100) },
      sleep: { count: sleepCount, percentage: Math.round((sleepCount / 14) * 100) },
      calm: { count: calmCount, percentage: Math.round((calmCount / 14) * 100) },
    });

    // 3. Safe Date Setup
    const d = new Date();
    d.setHours(0,0,0,0);
    setToday(d);
    setIsLoaded(true);
  }, [router]);

  if (!isLoaded || !data || !today) return <div className="h-screen w-full bg-[#FFF0F3]" />;

  const lastPeriod = data.lastPeriod ? new Date(data.lastPeriod) : today;
  lastPeriod.setHours(0,0,0,0);
  const currentDay = Math.max(1, Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const average = data?.cycleLength && data.cycleLength !== "I don't know" && data.cycleLength !== "It changes" 
    ? parseInt(data.cycleLength) 
    : 35;
  const lateDays = currentDay - average;

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] font-sans pb-40">
      
      {/* UI Header - Hidden on Print */}
      <div className="print:hidden fixed top-0 left-0 right-0 bg-[#FFF0F3] px-6 py-4 flex justify-between items-center z-50 border-b border-[#4A2C35]/5">
        <button onClick={() => router.push('/care')} className="text-[#4A2C35]/50 text-sm font-medium active:opacity-50">
          ← Back
        </button>
        <span className="text-xs font-bold text-[#4A2C35]/70">Doctor Report Preview</span>
        <div className="w-10" />
      </div>

      <div className="pt-20 px-3 sm:px-4">
        {/* THE PDF PAGE */}
        <div className="bg-white w-full max-w-200 mx-auto shadow-lg print:shadow-none p-5 sm:p-8 border border-[#4A2C35]/10 print:border-0">
          
          {/* DARK HEADER BAND */}
          <div className="bg-[#1A1A1A] text-white p-4 -mx-5 -mt-5 sm:-mx-8 sm:-mt-8 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold tracking-widest uppercase">Late Circle</h1>
              <p className="text-[10px] text-white/60 mt-1">Cycle & Habit Tracker • Doctor Report</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Confidential</p>
              <p className="text-[10px] text-white/60 mt-1">Generated {today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Doctor Report</h2>
          <p className="text-xs text-[#4A2C35]/60 mb-6">Prepared by Late Circle • Ovi • For her doctor visit</p>

          {/* 30-SECOND SUMMARY */}
          <div className="bg-[#F7F9F6] border border-[#E8EEE4] rounded-xl p-4 sm:p-5 mb-6">
            <h3 className="text-[10px] font-bold text-[#4A2C35]/50 uppercase tracking-widest mb-3">30-Second Summary — What the doctor needs first</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 text-[13px] text-[#1A1A1A]">
                <p><strong className="text-[#4A2C35]/70">Age:</strong> {data.age || '—'} years</p>
                <p><strong className="text-[#4A2C35]/70">Last period started:</strong> {lastPeriod.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p><strong className="text-[#4A2C35]/70">Today:</strong> {today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • Day {currentDay}</p>
                <p><strong className="text-[#4A2C35]/70">Status:</strong> {lateDays > 0 ? `${lateDays} days late vs her average` : `On time`}</p>
                <p><strong className="text-[#4A2C35]/70">Her average cycle:</strong> {average} days</p>
                <p><strong className="text-[#4A2C35]/70">Cycles tracked:</strong> 1 cycle (first month)</p>
              </div>
              <div className="bg-white border border-[#4A2C35]/10 rounded-lg p-4 text-xs text-[#1A1A1A] leading-relaxed">
                <p className="font-bold text-[#4A2C35]/50 uppercase tracking-widest mb-2 text-[9px]">In her words:</p>
                <p className="italic mb-2">"{data.doctorNotes || 'No personal note added.'}"</p>
                {data.testResult && data.testResult !== 'Skip' && (
                  <p className="font-bold mt-2">Pregnancy test: {data.testResult}</p>
                )}
                {data.sexuallyActive && data.sexuallyActive !== 'Skip' && (
                  <p className="mt-1 text-[#4A2C35]/60">Sexually active: {data.sexuallyActive}</p>
                )}
              </div>
            </div>
          </div>

          {/* 1. CYCLE HISTORY */}
          <div className="mb-6 overflow-x-auto">
            <h3 className="text-sm font-bold text-[#1A1A1A] border-b border-[#4A2C35]/10 pb-2 mb-2">1. CYCLE HISTORY — The Proof</h3>
            <p className="text-[11px] text-[#4A2C35]/60 mb-3">Doctor can calculate herself. No guessing from memory.</p>
            
            <table className="w-full text-left text-xs border-collapse min-w-100">
              <thead>
                <tr className="bg-[#1A1A1A] text-white">
                  <th className="p-2 font-medium rounded-tl-lg">Cycle</th>
                  <th className="p-2 font-medium">Start Date</th>
                  <th className="p-2 font-medium">Bleeding</th>
                  <th className="p-2 font-medium">Length</th>
                  <th className="p-2 font-medium">Late By</th>
                  <th className="p-2 font-medium rounded-tr-lg">Pain</th>
                </tr>
              </thead>
              <tbody className="text-[#1A1A1A]">
                <tr className="border-b border-[#4A2C35]/5 bg-[#FAFAFA]">
                  <td className="p-2">1</td>
                  <td className="p-2">{lastPeriod.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="p-2">{data.bleedDays || '?'} days - {data.flow || '?'}</td>
                  <td className="p-2">{currentDay} days so far</td>
                  <td className="p-2 font-bold text-[#8A2C3E]">{lateDays > 0 ? `+${lateDays} days` : '—'}</td>
                  <td className="p-2">{data.painLevel || '?'}/10</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. BLEEDING & SYMPTOMS */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#1A1A1A] border-b border-[#4A2C35]/10 pb-2 mb-2">2. BLEEDING & SYMPTOMS — When They Happen Matters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#F7F9F6] border border-[#E8EEE4] rounded-lg p-3">
                <h4 className="text-[9px] font-bold text-[#9CAF88] uppercase tracking-widest mb-1.5">Bleeding Pattern</h4>
                <ul className="text-[11px] text-[#1A1A1A] space-y-1">
                  <li>• Usual bleeding: {data.bleedDays || '?'} days, {data.flow || '?'}</li>
                  <li>• Clots: {data.clots || '?'}</li>
                  <li>• Spotting: {data.spotting || 'Not noted'}</li>
                  <li>• Pain: {data.painLevel || '?'}/10, {data.painWhere?.join(', ') || 'Not noted'}</li>
                </ul>
              </div>
              <div className="bg-[#FFF7F8] border border-[#FFE5EC] rounded-lg p-3">
                <h4 className="text-[9px] font-bold text-[#FF8FA3] uppercase tracking-widest mb-1.5">Symptom Timeline</h4>
                <ul className="text-[11px] text-[#1A1A1A] space-y-1">
                  <li>• Signs: {data.signs?.join(', ') || 'None recorded'}</li>
                  <li>• Frequency: {data.signFrequency || 'Not noted'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. LIFESTYLE - Now with REAL DATA */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#1A1A1A] border-b border-[#4A2C35]/10 pb-2 mb-2">3. LIFESTYLE — The 4 Circles (Last 14 Days)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="border border-[#4A2C35]/10 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[9px] font-bold text-[#4A2C35]/50 uppercase">Food</p>
                  <p className="text-[9px] font-bold text-[#FF8FA3]">{lifestyle.food.percentage}%</p>
                </div>
                <p className="text-lg font-bold text-[#1A1A1A]">{lifestyle.food.count}/14 days</p>
                <p className="text-[9px] text-[#4A2C35]/60">Ate before 9pm</p>
              </div>
              <div className="border border-[#4A2C35]/10 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[9px] font-bold text-[#4A2C35]/50 uppercase">Walk</p>
                  <p className="text-[9px] font-bold text-[#FF8FA3]">{lifestyle.walk.percentage}%</p>
                </div>
                <p className="text-lg font-bold text-[#1A1A1A]">{lifestyle.walk.count}/14 days</p>
                <p className="text-[9px] text-[#4A2C35]/60">20 mins walk</p>
              </div>
              <div className="border border-[#4A2C35]/10 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[9px] font-bold text-[#4A2C35]/50 uppercase">Sleep</p>
                  <p className="text-[9px] font-bold text-[#FF8FA3]">{lifestyle.sleep.percentage}%</p>
                </div>
                <p className="text-lg font-bold text-[#1A1A1A]">{lifestyle.sleep.count}/14 days</p>
                <p className="text-[9px] text-[#4A2C35]/60">Good sleep</p>
              </div>
              <div className="border border-[#4A2C35]/10 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[9px] font-bold text-[#4A2C35]/50 uppercase">Calm</p>
                  <p className="text-[9px] font-bold text-[#FF8FA3]">{lifestyle.calm.percentage}%</p>
                </div>
                <p className="text-lg font-bold text-[#1A1A1A]">{lifestyle.calm.count}/14 days</p>
                <p className="text-[9px] text-[#4A2C35]/60">90-sec calm</p>
              </div>
            </div>
          </div>

          {/* 4A. MEDICATIONS & PREGNANCY HISTORY */}
          <div className="bg-[#F7F9F6] border border-[#E8EEE4] rounded-lg p-3 mb-3">
            <h4 className="text-[9px] font-bold text-[#4A2C35]/50 uppercase tracking-widest mb-1.5">Medications & Pregnancy History</h4>
            <ul className="text-[11px] text-[#1A1A1A] space-y-1">
              <li>• Meds taken: {data.meds?.join(', ') || 'None'} {data.medDate ? `(on ${data.medDate})` : ''}</li>
              <li>• Pregnancy history: {data.pregnancyHistory || 'None'} {data.pregnancyDate ? `(${data.pregnancyDate})` : ''}</li>
              {data.doctorVisit && data.doctorVisit !== 'No' && (
                <li>• Previous doctor visit: {data.doctorVisit} {data.doctorNotes ? `(${data.doctorNotes})` : ''}</li>
              )}
            </ul>
          </div>

          {/* 4B. LIFESTYLE & FAMILY HISTORY */}
          <div className="bg-[#F7F9F6] border border-[#E8EEE4] rounded-lg p-3 mb-5">
            <h4 className="text-[9px] font-bold text-[#4A2C35]/50 uppercase tracking-widest mb-1.5">Lifestyle & Family History</h4>
            <ul className="text-[11px] text-[#1A1A1A] space-y-1">
              <li>• Weight change: {data.weight || 'Not noted'}</li>
              <li>• Stress: {data.stress?.join(', ') || 'None'}</li>
              <li>• Family history: {data.family || 'Not noted'}</li>
            </ul>
            <p className="text-[9px] text-[#4A2C35]/40 mt-2">App does NOT diagnose PCOS or any condition. History only. Doctor to assess.</p>
          </div>

          {/* RED FLAGS (Dynamic Color) */}
          {(() => {
            const hasRedFlag = lateDays > 90 || parseInt(data.bleedDays) > 7 || data.painLevel >= 8;
            
            return (
              <div className={`rounded-lg p-3 mb-6 border ${hasRedFlag ? 'bg-[#FFF0F3] border-[#FF8FA3]' : 'bg-[#F7F9F6] border-[#E8EEE4]'}`}>
                <h4 className={`text-[9px] font-bold uppercase tracking-widest mb-1.5 ${hasRedFlag ? 'text-[#8A2C3E]' : 'text-[#9CAF88]'}`}>
                  Red Flags To Check
                </h4>
                <ul className="text-[11px] text-[#1A1A1A] space-y-1">
                  {hasRedFlag ? (
                    <>
                      {lateDays > 90 && <li className="text-[#8A2C3E] font-bold">• 90+ days late — Urgent check recommended.</li>}
                      {parseInt(data.bleedDays) > 7 && <li className="text-[#8A2C3E] font-bold">• Bleeding {data.bleedDays} days — Normal is 3-7 days.</li>}
                      {data.painLevel >= 8 && <li className="text-[#8A2C3E] font-bold">• Severe pain {data.painLevel}/10 — Needs immediate attention.</li>}
                    </>
                  ) : (
                    <li className="text-[#9CAF88] font-bold">• None severe today. Standard review.</li>
                  )}
                </ul>
              </div>
            );
          })()}

          {/* FOOTER */}
          <div className="border-t border-[#4A2C35]/10 pt-3 flex flex-col sm:flex-row justify-between items-start gap-2 text-[10px] text-[#4A2C35]/50">
            <div>
              <p>Late Circle is a lifestyle tracker. It is not a medical diagnosis.</p>
              <p>Data stays on her phone. Generated by Ovi for her doctor visit. • Page 1 of 1</p>
            </div>
            <p className="font-bold text-[#8A2C3E]">Ovi • You are not broken.</p>
          </div>

        </div>
      </div>

      {/* PRINT BUTTON - Fixed above nav */}
      <div className="fixed bottom-21.25 left-0 right-0 p-4 bg-[#FFF0F3] border-t border-[#4A2C35]/5 print:hidden z-50">
        <button 
          onClick={handlePrint}
          className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 bg-[#4A2C35] text-white py-4 rounded-full font-bold shadow-lg active:scale-95 text-sm"
        >
          <span>📥</span> Download My Doctor PDF
        </button>
      </div>

    </main>
  );
}