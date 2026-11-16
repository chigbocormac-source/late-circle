'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { localDateKey } from '../../../utils/analytics';

export default function DoctorPDF() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  
  const [checkInData, setCheckInData] = useState({
    totalDays: 0,
    mostRecent: 'Never',
  });

  const [periodHistory, setPeriodHistory] = useState<any[]>([]);
  const [hasReliableCycle, setHasReliableCycle] = useState(false);
  const [averageCycle, setAverageCycle] = useState<number | null>(null);

  useEffect(() => {
    // 1. Load the You Place Data
    const saved = localStorage.getItem('lateCircleYouPlace');
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      router.push('/care/you-place');
    }

    // 2. Load the Daily History (One Check Daily)
    const dailyHistory = JSON.parse(localStorage.getItem('lateCircleDailyHistory') || '{}');
    let totalDays = 0;
    let mostRecent = 'Never';
    let mostRecentTime = 0;

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = localDateKey(d);
      const dayData = dailyHistory[dateStr];
      if (dayData && dayData.count > 0) {
        totalDays++;
        if (d.getTime() > mostRecentTime) {
          mostRecentTime = d.getTime();
          mostRecent = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i} days ago`;
        }
      }
    }
    setCheckInData({ totalDays, mostRecent });

    // 3. Load the REAL Period History
    const savedHistory: string[] = JSON.parse(localStorage.getItem('lateCircleHistory') || '[]');
    const currentPeriod = localStorage.getItem('lateCircleLastPeriod');
    const allDates = Array.from(new Set([
      ...savedHistory, 
      ...(currentPeriod ? [currentPeriod] : [])
    ].filter(Boolean).map(d => localDateKey(new Date(d))))).sort();

    const rows = allDates.map((k, i) => ({
      date: k,
      length: i < allDates.length - 1
        ? Math.round((new Date(allDates[i + 1] + 'T00:00:00').getTime() - new Date(k + 'T00:00:00').getTime()) / 86400000)
        : null,
    }));
    
    // Check if we have enough history to calculate an average
    const validLengths = rows.filter(r => r.length !== null && r.length >= 21 && r.length <= 60);
    if (validLengths.length >= 2) {
      setHasReliableCycle(true);
      const avg = Math.round(validLengths.reduce((acc, r) => acc + (r.length || 0), 0) / validLengths.length);
      setAverageCycle(avg);
    }

    setPeriodHistory(rows.reverse()); // Newest first

    // 4. Safe Date Setup
    const d = new Date();
    d.setHours(0,0,0,0);
    setToday(d);
    setIsLoaded(true);
  }, [router]);

  if (!isLoaded || !data || !today) return <div className="h-screen w-full bg-[#FFF0F3]" />;

  // Safe calculations
  const lastPeriodDate = data.lastPeriod ? new Date(data.lastPeriod) : null;
  if (lastPeriodDate) lastPeriodDate.setHours(0,0,0,0);
  
  const currentDay = lastPeriodDate ? Math.max(1, Math.floor((today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24)) + 1) : null;
  const lateDays = (hasReliableCycle && averageCycle && currentDay) ? currentDay - averageCycle : null;

  // Safe Pain parsing
  const painLevel = data.painLevel ? Number(data.painLevel) : null;

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
                <p><strong className="text-[#4A2C35]/70">Last period started:</strong> {lastPeriodDate ? lastPeriodDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not recorded'}</p>
                <p><strong className="text-[#4A2C35]/70">Today:</strong> {today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                {currentDay && <p><strong className="text-[#4A2C35]/70">Days since last period:</strong> {currentDay}</p>}
                <p><strong className="text-[#4A2C35]/70">Status:</strong> {lateDays !== null ? (lateDays > 0 ? `${lateDays} days late vs her average` : `On time`) : 'Cycle length not established'}</p>
                <p><strong className="text-[#4A2C35]/70">Average cycle:</strong> {hasReliableCycle ? `${averageCycle} days` : 'Not enough data'}</p>
                <p><strong className="text-[#4A2C35]/70">Period starts recorded:</strong> {periodHistory.length}</p>
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
                  <th className="p-2 font-medium rounded-tl-lg">Start Date</th>
                  <th className="p-2 font-medium">Length</th>
                  <th className="p-2 font-medium rounded-tr-lg">Notes</th>
                </tr>
              </thead>
              <tbody className="text-[#1A1A1A]">
                {periodHistory.map((r, i) => (
                  <tr key={i} className="border-b border-[#4A2C35]/5 bg-[#FAFAFA] last:border-0">
                    <td className="p-2">{new Date(r.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="p-2">{r.length ? `${r.length} days` : 'Current'}</td>
                    <td className="p-2 text-[#4A2C35]/60">{r.length ? '' : 'Latest cycle'}</td>
                  </tr>
                ))}
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
                  <li>• Usual bleeding: {data.bleedDays || 'Not recorded'} days, {data.flow || 'Not recorded'}</li>
                  <li>• Clots: {data.clots || 'Not recorded'}</li>
                  <li>• Spotting: {data.spotting || 'Not recorded'}</li>
                  <li>• Pain: {painLevel !== null ? `${painLevel}/10` : 'Not recorded'}, {Array.isArray(data.painWhere) ? data.painWhere.join(', ') : 'Not noted'}</li>
                </ul>
              </div>
              <div className="bg-[#FFF7F8] border border-[#FFE5EC] rounded-lg p-3">
                <h4 className="text-[9px] font-bold text-[#FF8FA3] uppercase tracking-widest mb-1.5">Symptom Timeline</h4>
                <ul className="text-[11px] text-[#1A1A1A] space-y-1">
                  <li>• Signs: {Array.isArray(data.signs) ? data.signs.join(', ') : 'None recorded'}</li>
                  <li>• Frequency: {data.signFrequency || 'Not noted'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. LIFESTYLE - The One Check Daily */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#1A1A1A] border-b border-[#4A2C35]/10 pb-2 mb-2">3. LIFESTYLE — Check-in Frequency (Last 14 Days)</h3>
            <div className="bg-[#F7F9F6] border border-[#E8EEE4] rounded-lg p-3">
              <p className="text-[11px] text-[#1A1A1A]">
                She checked in on <strong>{checkInData.totalDays} of 14 days</strong>.
              </p>
              <p className="text-[11px] text-[#1A1A1A] mt-1">
                Most recent check-in: <strong>{checkInData.mostRecent}</strong>.
              </p>
            </div>
          </div>

          {/* 4A. MEDICATIONS & PREGNANCY HISTORY */}
          <div className="bg-[#F7F9F6] border border-[#E8EEE4] rounded-lg p-3 mb-3">
            <h4 className="text-[9px] font-bold text-[#4A2C35]/50 uppercase tracking-widest mb-1.5">Medications & Pregnancy History</h4>
            <ul className="text-[11px] text-[#1A1A1A] space-y-1">
              <li>• Meds taken: {Array.isArray(data.meds) ? data.meds.join(', ') : 'None'} {data.medDate ? `(on ${data.medDate})` : ''}</li>
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
              <li>• Stress: {Array.isArray(data.stress) ? data.stress.join(', ') : 'None'}</li>
              <li>• Family history: {data.family || 'Not noted'}</li>
            </ul>
            <p className="text-[9px] text-[#4A2C35]/40 mt-2">App does NOT diagnose PCOS or any condition. History only. Doctor to assess.</p>
          </div>

          {/* RED FLAGS (Safer Logic) */}
          {(() => {
            const flags = [];
            if (lateDays !== null && lateDays > 35) flags.push("Late by over 35 days");
            if (data.bleedDays && parseInt(data.bleedDays) > 7) flags.push(`Bleeding for ${data.bleedDays} days`);
            if (painLevel !== null && painLevel >= 8) flags.push(`Severe pain (${painLevel}/10)`);
            
            if (flags.length === 0) {
              return (
                <div className="bg-[#F7F9F6] border border-[#E8EEE4] rounded-lg p-3 mb-6">
                  <h4 className="text-[9px] font-bold text-[#9CAF88] uppercase tracking-widest mb-1.5">Health Information to Discuss</h4>
                  <p className="text-[11px] text-[#1A1A1A]">No specific flags from her logs. Standard review.</p>
                </div>
              );
            }

            return (
              <div className="bg-[#FFF0F3] border border-[#FF8FA3] rounded-lg p-3 mb-6">
                <h4 className="text-[9px] font-bold text-[#8A2C3E] uppercase tracking-widest mb-1.5">Health Information to Discuss</h4>
                <ul className="text-[11px] text-[#1A1A1A] space-y-1">
                  {flags.map((f, i) => (
                    <li key={i} className="text-[#8A2C3E] font-bold">• {f} — Please assess.</li>
                  ))}
                </ul>
              </div>
            );
          })()}

          {/* FOOTER */}
          <div className="border-t border-[#4A2C35]/10 pt-3 flex flex-col sm:flex-row justify-between items-start gap-2 text-[10px] text-[#4A2C35]/50">
            <div>
              <p>Late Circle is a lifestyle tracker. It is not a medical diagnosis.</p>
              <p>Data stays on her phone. Generated by Ovi for her doctor visit.</p>
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