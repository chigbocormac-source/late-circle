'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Choice = 'menu' | 'pcos' | 'scan' | 'hormones' | 'back3months' | 'after' | 'rushed' | 'cry';

export default function DoctorSaid() {
  const router = useRouter();
  const [step, setStep] = useState<Choice>('menu');
  const [scanWorry, setScanWorry] = useState<string | null>(null);
  const [afterChoice, setAfterChoice] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] font-sans pb-40 px-6 pt-12 flex flex-col items-center">
      <button onClick={() => router.push('/care')} className="self-start text-[#4A2C35]/50 text-sm mb-6">← Back</button>

      {step === 'menu' && (
        <div className="w-full max-w-sm animate-fade-in">
          <h1 className="text-2xl font-bold leading-snug mb-2">What did the doctor say?</h1>
          <p className="text-sm text-[#4A2C35]/60 mb-6 leading-relaxed">Tap what you heard. I will translate it into sister language. I am not diagnosing you — I am helping you understand what the doctor said.</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => setStep('pcos')} className="w-full bg-white p-4 rounded-2xl text-left font-bold text-sm shadow-sm active:scale-95">Doctor said PCOS →</button>
            <button onClick={() => setStep('scan')} className="w-full bg-white p-4 rounded-2xl text-left font-bold text-sm shadow-sm active:scale-95">Doctor said I need a scan →</button>
            <button onClick={() => setStep('hormones')} className="w-full bg-white p-4 rounded-2xl text-left font-bold text-sm shadow-sm active:scale-95">Doctor said hormonal imbalance →</button>
            <button onClick={() => setStep('back3months')} className="w-full bg-white p-4 rounded-2xl text-left font-bold text-sm shadow-sm active:scale-95">Doctor said come back in 3 months →</button>
          </div>
          <button onClick={() => setStep('after')} className="w-full mt-6 bg-[#4A2C35] text-white py-4 rounded-full font-bold text-sm active:scale-95">I already finished my visit →</button>
        </div>
      )}

      {step === 'pcos' && (
        <div className="w-full max-w-sm animate-fade-in">
          <h1 className="text-2xl font-bold mb-3">Breathe, love. I am here.</h1>
          <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3 text-[14px] leading-relaxed mb-6">
            <p>PCOS is a big word, but it is not a death sentence. Let me explain it like a sister would.</p>
            <p>Imagine your body is like a garden. Every month, your garden is supposed to release one egg, like a flower. With PCOS, the garden makes many small flowers, but sometimes none of them open. So your period gets confused and comes late.</p>
            <p>That&apos;s all it is. Your garden is a little crowded. It is not broken.</p>
            <p className="font-bold">Millions of girls in Nigeria have this. And they live normal lives. They have babies. They are fine.</p>
            <p className="font-bold text-[#8A2C3E]">It does NOT mean you cannot have children. It does NOT mean you are less of a woman.</p>
            <p className="text-[#4A2C35]/60 text-[12px]">Ovi does not diagnose. Only your doctor can say if you have PCOS. This is just what the word means.</p>
          </div>
          <p className="text-sm font-bold mb-2">Did the doctor give you medicine? Or did he say to change food and sleep first?</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => setStep('after')} className="w-full bg-[#9CAF88] text-white py-3.5 rounded-xl font-bold text-sm active:scale-95">He gave medicine</button>
            <button onClick={() => setStep('after')} className="w-full bg-[#FFF0F3] border border-[#4A2C35]/10 py-3.5 rounded-xl font-bold text-sm active:scale-95">He said change lifestyle</button>
            <button onClick={() => setStep('after')} className="w-full bg-white border border-transparent text-[#4A2C35]/60 py-2 text-xs active:scale-95">He didn&apos;t explain, I&apos;m confused — ask me anything</button>
          </div>
          <button onClick={() => setStep('menu')} className="w-full text-[#4A2C35]/40 text-xs py-3">← Back to what doctor said</button>
        </div>
      )}

      {step === 'scan' && (
        <div className="w-full max-w-sm animate-fade-in">
          <h1 className="text-2xl font-bold mb-3">Okay, a scan sounds scary, but it is actually good news.</h1>
          <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3 text-[14px] leading-relaxed mb-4">
            <p>It means the doctor wants to SEE, not guess. A scan is just a camera. For your womb.</p>
            <p><strong>1. Pelvic scan (on your tummy):</strong> They put cold gel on your tummy and move a small thing around. No pain. Takes 10 minutes.</p>
            <p><strong>2. Vaginal scan:</strong> They put a small stick inside, with a condom on it. It can feel uncomfortable, but not painful. You can say NO if you are not comfortable. You have the right to say &apos;Please do the tummy one only.&apos;</p>
            <p>You don&apos;t need to be ashamed. The nurse has seen thousands of girls. You are just another girl taking care of herself.</p>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => setScanWorry('cost')} className="w-full bg-white p-4 rounded-2xl text-left font-bold text-sm shadow-sm active:scale-95">I&apos;m scared of the cost →</button>
            <button onClick={() => setScanWorry('pain')} className="w-full bg-white p-4 rounded-2xl text-left font-bold text-sm shadow-sm active:scale-95">I&apos;m scared it will hurt →</button>
            <button onClick={() => setScanWorry('prepare')} className="w-full bg-white p-4 rounded-2xl text-left font-bold text-sm shadow-sm active:scale-95">Yes, prepare me →</button>
          </div>
          {scanWorry === 'cost' && (
            <div className="bg-[#FFF0F3] rounded-2xl p-4 mt-4 text-[13px] leading-relaxed animate-fade-in">
              I understand. In PH, a pelvic scan is usually N15,000 - N30,000 in a private lab, cheaper in a teaching hospital. Don&apos;t go alone if you can. Take someone. And tell them &apos;I want a pelvic ultrasound for PCOS check.&apos; That is the name.
            </div>
          )}
          {scanWorry === 'pain' && (
            <div className="bg-[#FFF0F3] rounded-2xl p-4 mt-4 text-[13px] leading-relaxed animate-fade-in">
              The tummy scan does not hurt. Just cold gel. The vaginal one can feel uncomfortable, not painful. And you can always say &apos;Stop&apos; or &apos;Tummy only, please.&apos; Your body, your choice.
            </div>
          )}
          {scanWorry === 'prepare' && (
            <div className="bg-[#FFF0F3] rounded-2xl p-4 mt-4 text-[13px] leading-relaxed animate-fade-in">
              Wear a loose skirt or wrapper, not tight jeans. Go with a full bladder if they say pelvic scan — drink water before. Ask: &apos;What are you checking for?&apos; and &apos;When will I get the result?&apos; Take someone with you.
            </div>
          )}
          <button onClick={() => setStep('menu')} className="w-full text-[#4A2C35]/40 text-xs py-3">← Back</button>
        </div>
      )}

      {step === 'hormones' && (
        <div className="w-full max-w-sm animate-fade-in">
          <h1 className="text-2xl font-bold mb-3">Hormonal imbalance sounds like your body is fighting you. It&apos;s not.</h1>
          <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3 text-[14px] leading-relaxed mb-6">
            <p>Hormones are just messengers in your body. Like WhatsApp messages telling your period &apos;Come now&apos; or &apos;Wait.&apos;</p>
            <p>Sometimes, because of stress, no sleep, exams, or not eating well, the messages get delayed. So your period comes late.</p>
            <p>It&apos;s like NEPA. The light is not gone. The wire is just a little loose.</p>
            <p className="font-bold">Your body is not broken. Your messages are just late.</p>
            <p>And we can help the messages come on time. With sleep, food, and calm. That&apos;s why your One Check matters.</p>
            <p className="text-[12px] text-[#4A2C35]/60">Ovi does not diagnose. Only your doctor can tell you if your hormones are imbalanced. Ask him: &apos;Which hormone, doctor? And what should I do next?&apos;</p>
          </div>
          <button onClick={() => setStep('after')} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold text-sm active:scale-95">Okay, Ovi →</button>
        </div>
      )}

      {step === 'back3months' && (
        <div className="w-full max-w-sm animate-fade-in">
          <h1 className="text-2xl font-bold mb-3">He didn&apos;t abandon you. He gave you time.</h1>
          <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3 text-[14px] leading-relaxed mb-6">
            <p>He wants to see if your body can balance itself with good sleep and food first, before giving you strong medicine.</p>
            <p>That is actually a good doctor. A bad doctor would just give you drugs immediately.</p>
            <p>Let&apos;s use these 3 months. I will be here every day. We will track together. When you go back, you will have 3 more months of proof to show him.</p>
            <p className="font-bold">You are not waiting. You are healing.</p>
          </div>
          <button onClick={() => router.push('/today')} className="w-full bg-[#4A2C35] text-white py-4 rounded-full font-bold text-sm active:scale-95">Let&apos;s track together →</button>
        </div>
      )}

      {step === 'after' && (
        <div className="w-full max-w-sm animate-fade-in text-center">
          <h1 className="text-2xl font-bold mb-2">You did it. You went. I&apos;m so proud of you.</h1>
          <p className="text-sm text-[#4A2C35]/70 mb-6">How did it go? Did you feel heard?</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => setAfterChoice('listened')} className="w-full bg-white p-4 rounded-2xl font-bold text-sm shadow-sm active:scale-95">He listened 💚</button>
            <button onClick={() => setAfterChoice('rushed')} className="w-full bg-white p-4 rounded-2xl font-bold text-sm shadow-sm active:scale-95">He rushed me</button>
            <button onClick={() => setAfterChoice('tests')} className="w-full bg-white p-4 rounded-2xl font-bold text-sm shadow-sm active:scale-95">He gave me tests</button>
            <button onClick={() => setAfterChoice('cry')} className="w-full bg-white p-4 rounded-2xl font-bold text-sm shadow-sm active:scale-95">I need to cry</button>
          </div>
          {afterChoice === 'listened' && (
            <div className="bg-[#F7F9F6] rounded-2xl p-4 mt-4 text-[13px] leading-relaxed animate-fade-in">I&apos;m so happy, love. You deserved that. You walked in prepared, and he saw you. Rest tonight. You did a brave thing.</div>
          )}
          {afterChoice === 'rushed' && (
            <div className="bg-[#FFF0F3] rounded-2xl p-4 mt-4 text-[13px] leading-relaxed animate-fade-in">I&apos;m sorry, love. That was not your fault. You did your part. You showed up with proof. Some doctors are in a hurry. It doesn&apos;t mean your pain is not real. Do you want me to help you prepare for a second doctor?</div>
          )}
          {afterChoice === 'tests' && (
            <div className="bg-[#FFF0F3] rounded-2xl p-4 mt-4 text-[13px] leading-relaxed animate-fade-in">Good — tests mean he is taking you seriously. Tap &apos;Doctor said I need a scan&apos; if one of them is a scan, and I will prepare you. Don&apos;t panic about the words. Ask me what they mean.</div>
          )}
          {afterChoice === 'cry' && (
            <div className="bg-[#FFF0F3] rounded-2xl p-4 mt-4 text-[13px] leading-relaxed animate-fade-in">Cry. I&apos;m here. You don&apos;t have to be strong right now. You were brave today.</div>
          )}
          {afterChoice && (
            <button onClick={() => router.push('/today')} className="w-full mt-4 bg-[#4A2C35] text-white py-4 rounded-full font-bold text-sm active:scale-95">Back to Today →</button>
          )}
        </div>
      )}
    </main>
  );
}