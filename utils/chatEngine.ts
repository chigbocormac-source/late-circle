import { OVI_KNOWLEDGE } from './chatContent';
import { supabase } from '../app/supabase';

export type Intent = 
  | 'MEDICAL_ECTOPIC' | 'MEDICAL_FAINTING' | 'MEDICAL_HEAVY_BLEEDING' 
  | 'MEDICAL_PREGNANCY_BLEEDING' | 'MEDICAL_PREGNANCY_BLEEDING_ACKNOWLEDGED'
  | 'MEDICAL_OUT_OF_WINDOW_BLEEDING'
  | 'EMOTIONAL_FEAR' | 'EMOTIONAL_FEAR_TESTING' | 'EMOTIONAL_SOFT_PLACE'
  | 'CYCLE_LATE' | 'CYCLE_PREGNANCY_NEGATIVE' | 'CYCLE_PREGNANCY_POSITIVE'
  | 'LIFESTYLE_EXHAUSTED' | 'LIFESTYLE_STRESS' | 'DOCTOR_PDF'
  | 'GREETING' | 'FEELING_FINE' | 'UNRESOLVED';

export interface ChatState {
  testResult?: 'positive' | 'negative';
  hasBleeding?: boolean;
  hasPain?: boolean;
  hasFainted?: boolean;
  acknowledgedBleedingWarning?: boolean;
  pendingQuestion?: string;
}

// --- NEW: the cycle data Ovi can now "see" ---
export interface UserCycleData {
  currentDay: number;
  average: number;
  lateDays: number;
  phase: string;        // 'Rest Girl' | 'Fresh Girl' | 'Fine Girl' | 'Chop Girl' | 'Ready Girl'
  hasLoggedBleedingToday: boolean;
}

export interface OviResponse {
  text: string;
  intent: Intent;
  isEmergency?: boolean;
  chips?: string[];
  newState: ChatState;
  action?: 'OPEN_SOFT_PLACE' | 'OPEN_YOU_PLACE';
}

export const TOPIC_MENU = [
  { id: 'late', label: 'My Period is Late', emoji: '⏳' },
  { id: 'pregnancy', label: 'Pregnancy Fear', emoji: '🤰' },
  { id: 'period', label: 'My Period', emoji: '🩸' },
  { id: 'ovulation', label: 'Ovulation', emoji: '🥚' },
  { id: 'pain', label: 'Pain & Body', emoji: '🤕' },
  { id: 'shame', label: 'Safe & Shame', emoji: '🫂' }
];

// --- THE TYPO MATCHER ---
function hasWord(text: string, words: string[]): boolean {
  const regex = new RegExp(`\\b(${words.join('|')}|l8|lat|preg|period|menstruat)\\b`, 'i');
  return regex.test(text);
}

// --- Helper: "Day 20 (Chop Girl)" phrasing — Option A + B combined ---
function dayAndPhase(userData: UserCycleData): string {
  return `Day ${userData.currentDay} — that's your ${userData.phase}`;
}

// --- Helper: is bleeding "out of window" (not a normal period)? ---
function isBleedingOutOfWindow(userData: UserCycleData): boolean {
  return userData.currentDay > 7 && userData.currentDay < userData.average;
}

// --- Helper: red flags reported by her in this message ---
function hasRedFlags(lower: string): boolean {
  return hasWord(lower, ['heavy', 'soaking', 'soak', 'clot', 'clots', 'dizzy', 'dizziness', 'faint', 'fainted', 'passed out', 'severe pain', 'unbearable']);
}

function checkSafetyEngine(text: string, state: ChatState): OviResponse | null {
  const lower = text.toLowerCase();
  
  if (hasWord(lower, ['bleeding', 'bleed', 'blood', 'spotting'])) state.hasBleeding = true;
  if (hasWord(lower, ['pain', 'hurts', 'hurting', 'cramp'])) state.hasPain = true;
  if (hasWord(lower, ['faint', 'fainted', 'collapse', 'collapsed', 'passed out'])) {
    if (!hasWord(lower, ['not faint', 'almost faint', 'nearly faint', 'no faint'])) state.hasFainted = true;
  }

  if (state.testResult === 'positive' && state.hasBleeding) {
    if (state.hasPain || state.hasFainted) {
      return {
        intent: 'MEDICAL_ECTOPIC',
        isEmergency: true,
        text: "Love, I need you to stop and listen to me. Because your test is positive and you have bleeding with pain/fainting, this could be an ectopic pregnancy. Please go to an emergency room immediately or call 112. Do not wait.",
        newState: state
      };
    }
    if (hasWord(lower, ['no pain', 'no dizziness', 'i am fine', 'no i am fine', 'not in pain'])) {
      state.acknowledgedBleedingWarning = true;
      return {
        intent: 'MEDICAL_PREGNANCY_BLEEDING_ACKNOWLEDGED',
        isEmergency: true,
        text: "Okay, I hear you. Because there is no severe pain right now, you don't need an ambulance. But you still need to see a doctor today because of the bleeding. Please go to a hospital or clinic for a check-up.",
        newState: state
      };
    }
    if (!state.acknowledgedBleedingWarning) {
      return {
        intent: 'MEDICAL_PREGNANCY_BLEEDING',
        isEmergency: true,
        text: "Love, I hear you. Because your test was positive and you are bleeding, you need a medical assessment urgently today. Please go to a hospital. Are you having any severe pain, dizziness, or shoulder pain right now?",
        chips: ["Yes, I have pain", "No, I am fine"],
        newState: state
      };
    }
  }

  if (state.hasFainted) {
    return {
      intent: 'MEDICAL_FAINTING',
      isEmergency: true,
      text: "Love, fainting is not something to ignore. Please sit or lie down and call 112 or go to a hospital immediately. Do not wait.",
      newState: state
    };
  }

  return null; 
}

export function getOviReply(
  text: string,
  currentState: ChatState,
  userData?: UserCycleData   // <-- NEW, optional
): OviResponse {
  const lower = text.toLowerCase();
  const state = { ...currentState }; 

  // 1. Run Safety Engine First (unchanged — still highest priority)
  const safetyResponse = checkSafetyEngine(lower, state);
  if (safetyResponse) return safetyResponse;

  // ============================================================
  // 2. DATA-AWARE ENGINE (runs only if userData exists)
  // ============================================================
  if (userData) {

    // --- BLEEDING with data ---
    if (hasWord(lower, ['bleeding', 'bleed', 'blood', 'spotting', 'i am bleeding'])) {
      state.hasBleeding = true;

      // Normal period window (Day 1–7)
      if (userData.currentDay >= 1 && userData.currentDay <= 7) {
        return {
          intent: 'GREETING',
          text: `It's your period, love. You're on ${dayAndPhase(userData)}. Put warm water on your tummy, rest, and be gentle with yourself today. 🩸`,
          chips: ["It hurts", "It's heavy", "I'm okay"],
          newState: state
        };
      }

      // Early (Day 8–14)
      if (userData.currentDay >= 8 && userData.currentDay <= 14) {
        return {
          intent: 'MEDICAL_OUT_OF_WINDOW_BLEEDING',
          text: `Love, you're on ${dayAndPhase(userData)}. Bleeding now is a little early — it's not your usual period window. Keep an eye on it. If it gets heavy or painful, please see a nurse. How is the flow?`,
          chips: ["Light", "Heavy", "It hurts"],
          newState: state
        };
      }

      // Out of window (Day 15–21+) — firm nudge, escalate only on red flags
      if (isBleedingOutOfWindow(userData) || userData.currentDay > 21) {
        if (hasRedFlags(lower)) {
          return {
            intent: 'MEDICAL_HEAVY_BLEEDING',
            isEmergency: true,
            text: `Love, I need you to listen. You're on ${dayAndPhase(userData)} — bleeding now is not your period, and you're also describing heavy flow or pain. Please go to a hospital or clinic today. Don't wait alone.`,
            newState: state
          };
        }
        return {
          intent: 'MEDICAL_OUT_OF_WINDOW_BLEEDING',
          text: `Love, you're on ${dayAndPhase(userData)}. You shouldn't be bleeding right now — this isn't your period window. Please see a nurse today so they can check you properly. Is it heavy?`,
          chips: ["Light", "Heavy", "It hurts"],
          newState: state
        };
      }
    }

    // --- TIRED with data (phase-aware) ---
    if (hasWord(lower, ['tired', 'exhausted', 'no energy', 'weak', 'drained'])) {
      if (userData.phase === 'Rest Girl') {
        return {
          intent: 'LIFESTYLE_EXHAUSTED',
          text: `Of course you're tired, love. You're on ${dayAndPhase(userData)} — your body is bleeding and rebuilding. Rest is the medicine today. 💜`,
          newState: state
        };
      }
      if (userData.phase === 'Chop Girl') {
        return {
          intent: 'LIFESTYLE_EXHAUSTED',
          text: `Love, you're on ${dayAndPhase(userData)}. Your energy is dropping because your body is preparing for your period. Warm food, water, and rest will help. 💜`,
          newState: state
        };
      }
      if (userData.phase === 'Fine Girl') {
        return {
          intent: 'LIFESTYLE_EXHAUSTED',
          text: `You're on ${dayAndPhase(userData)} — this is usually your peak energy phase. If you're tired, your body is asking for rest. Listen to it. 💜`,
          newState: state
        };
      }
      return {
        intent: 'LIFESTYLE_EXHAUSTED',
        text: `Love, you're on ${dayAndPhase(userData)}. Tiredness is real — rest when you can. 💜`,
        newState: state
      };
    }

    // --- LATE with data ---
    if (hasWord(lower, ['am i late', 'late', 'missing period', 'no period', 'period is late', 'period late'])) {
      if (userData.lateDays > 0) {
        return {
          intent: 'CYCLE_LATE',
          text: `Yes, love. You're on ${dayAndPhase(userData)}, and you are ${userData.lateDays} day${userData.lateDays > 1 ? 's' : ''} late. Let's take a pregnancy test when you're ready. Have you taken one yet?`,
          chips: ["Yes, it was positive", "Yes, it was negative", "No, I am too scared"],
          newState: state
        };
      }
      const daysUntil = Math.max(0, userData.average - userData.currentDay);
      return {
        intent: 'CYCLE_LATE',
        text: `No, love. You're on ${dayAndPhase(userData)}. Your period is expected in ${daysUntil} day${daysUntil === 1 ? '' : 's'}. You're not late. 💜`,
        newState: state
      };
    }
  }

  // ============================================================
  // 3. Existing state handling (unchanged)
  // ============================================================
  if (state.pendingQuestion === 'protection') {
    state.pendingQuestion = undefined;
    if (lower.includes('no')) {
      return {
        intent: 'EMOTIONAL_FEAR',
        text: "Thank you for telling me. I am not here to judge you. The only way to know for sure is a pregnancy test. Have you taken one?",
        chips: ["Yes", "No", "I am too scared"],
        newState: state
      };
    } else {
      return {
        intent: 'GREETING',
        text: "Okay, Love. If you used protection, the risk is lower, but it is not zero. It is still good to test if your period is late.",
        chips: ["I want to test", "I will wait"],
        newState: state
      };
    }
  }

  // 4. Topic Menu (unchanged)
  if (text === 'My Period' || text === 'Pregnancy Fear' || text === 'Ovulation' || text === 'Pain & Body' || text === 'Safe & Shame') {
    let filteredChips: string[] = [];
    
    if (text === 'My Period') filteredChips = Object.keys(OVI_KNOWLEDGE).filter(k => k.toLowerCase().includes('period') || k.toLowerCase().includes('blood')).slice(0, 4);
    else if (text === 'Pregnancy Fear') filteredChips = Object.keys(OVI_KNOWLEDGE).filter(k => k.toLowerCase().includes('pregnant') || k.toLowerCase().includes('postinor')).slice(0, 4);
    else if (text === 'Ovulation') filteredChips = Object.keys(OVI_KNOWLEDGE).filter(k => k.toLowerCase().includes('ovulat') || k.toLowerCase().includes('discharge')).slice(0, 4);
    else if (text === 'Pain & Body') filteredChips = Object.keys(OVI_KNOWLEDGE).filter(k => k.toLowerCase().includes('pain') || k.toLowerCase().includes('tired') || k.toLowerCase().includes('moody') || k.toLowerCase().includes('pimples') || k.toLowerCase().includes('craving')).slice(0, 4);
    else if (text === 'Safe & Shame') filteredChips = Object.keys(OVI_KNOWLEDGE).filter(k => k.toLowerCase().includes('shame') || k.toLowerCase().includes('dirty') || k.toLowerCase().includes('tell') || k.toLowerCase().includes('safe')).slice(0, 4);

    return {
      intent: 'GREETING',
      text: `Okay, Love. What do you want to know about ${text}?`,
      chips: filteredChips.length > 0 ? filteredChips : ["I am scared", "I need Soft Place"],
      newState: state
    };
  }

  // 5. Dictionary (unchanged)
  if (OVI_KNOWLEDGE[text]) {
    return {
      intent: 'GREETING',
      text: OVI_KNOWLEDGE[text].text,
      chips: OVI_KNOWLEDGE[text].chips,
      newState: state
    };
  }

  // 6. Keyword fallbacks (unchanged, except late now enriches with data if present)
  if (hasWord(lower, ['soft place', 'i need soft place', 'hide', 'panic button'])) {
    return {
      intent: 'EMOTIONAL_SOFT_PLACE',
      text: "I am opening the Soft Place for you now. It is a quiet space for you to rest and breathe. I will be right here when you come back. 💜",
      action: 'OPEN_SOFT_PLACE',
      newState: state
    };
  }

  if (hasWord(lower, ['doctor pdf', 'doctor report', 'build my story', 'you place', 'my story', 'build my pdf'])) {
    return {
      intent: 'DOCTOR_PDF',
      text: "Let's build your story for the doctor. I am opening the You Place form now. Take it small small. You can save and rest at any time. 💜",
      action: 'OPEN_YOU_PLACE',
      newState: state
    };
  }

  if (hasWord(lower, ['positive', 'two lines'])) {
    state.testResult = 'positive';
    return {
      intent: 'CYCLE_PREGNANCY_POSITIVE',
      text: "Thank you for telling me. How are you feeling? Are you experiencing any bleeding or pain right now?",
      chips: ["I am bleeding", "I have pain", "I am fine, just scared"],
      newState: state
    };
  }

  if (hasWord(lower, ['negative', 'one line'])) {
    state.testResult = 'negative';
    return {
      intent: 'CYCLE_PREGNANCY_NEGATIVE',
      text: "Okay, I hear you. A negative test is good news, but it might be too early. When did you take the test?",
      chips: ["Today", "A few days ago", "Last week"],
      newState: state
    };
  }

  if (hasWord(lower, ['scared', 'fear', 'afraid', 'worried', 'panic'])) {
    return {
      intent: 'EMOTIONAL_FEAR',
      text: "Come and rest, Love. I am here. What is making your heart beat fast today?",
      chips: ["My period is late", "I took a test", "I need comfort"],
      newState: state
    };
  }

  if (hasWord(lower, ['late', 'missing period', 'no period'])) {
    return {
      intent: 'CYCLE_LATE',
      text: "A late period can have many causes. Have you taken a pregnancy test yet?",
      chips: ["Yes, it was positive", "Yes, it was negative", "No, I am too scared"],
      newState: state
    };
  }

  if (hasWord(lower, ['hi', 'hello', 'hey', 'good morning', 'good evening'])) {
    return {
      intent: 'GREETING',
      text: "Love! 💜 I am here. How is your body feeling today?",
      chips: ["I am scared", "My period is late", "I am tired"],
      newState: state
    };
  }

  // 7. ULTIMATE FALLBACK (unchanged)
  const userId = typeof window !== 'undefined' ? localStorage.getItem('lateCircleUserId') : null;
  if (userId) {
    supabase.from('unanswered_questions').insert([{ user_id: userId, question: text }]).then();
  }

  return {
    intent: 'UNRESOLVED',
    text: "Love, I want to understand you properly. Can you tell me a little more? Or pick a topic below so I can help you better. 💜",
    chips: ["My Period", "Pregnancy Fear", "I am scared"],
    newState: state
  };
}