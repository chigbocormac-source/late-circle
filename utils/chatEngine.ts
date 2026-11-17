import { OVI_KNOWLEDGE, resolveOviResponse } from './chatContent';
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

export interface UserCycleData {
  currentDay: number;
  average: number;
  lateDays: number;
  phase: string;
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

function hasWord(text: string, words: string[]): boolean {
  const regex = new RegExp(`\\b(${words.join('|')})\\b`, 'i');
  return regex.test(text);
}

function dayAndPhase(userData: UserCycleData): string {
  return `Day ${userData.currentDay}, your ${userData.phase} phase`;
}

function isBleedingOutOfWindow(userData: UserCycleData): boolean {
  return userData.currentDay > 7 && userData.currentDay < userData.average;
}

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

  if (state.testResult === 'positive' && state.hasBleeding && (state.hasPain || state.hasFainted)) {
    return {
      intent: 'MEDICAL_ECTOPIC',
      isEmergency: true,
      text: "Love, I need you to stop and listen to me. Because your test is positive and you have bleeding with pain or dizziness, this could need immediate medical care. Please go to a clinic or call 112. You don't have to carry this alone. 💜",
      newState: state
    };
  }

  if (state.hasFainted) {
    return {
      intent: 'MEDICAL_FAINTING',
      isEmergency: true,
      text: "Love, fainting is your body telling you it needs support right now. Please sit or lie down, and let someone nearby know or call 112. Take a deep breath, I'm right here.",
      newState: state
    };
  }

  return null; 
}

export function getOviReply(
  text: string,
  currentState: ChatState,
  userData?: UserCycleData
): OviResponse {
  const lower = text.toLowerCase();
  const state = { ...currentState }; 

  const safetyResponse = checkSafetyEngine(lower, state);
  if (safetyResponse) return safetyResponse;

  // --- 1. Soft Place & Doctor PDF actions first (so they always work) ---
  if (hasWord(lower, ['soft place', 'i need soft place', 'hide', 'panic button'])) {
    return {
      intent: 'EMOTIONAL_SOFT_PLACE',
      text: "I am opening the Soft Place for you now. It's a quiet space for you to rest and breathe. I will be right here when you come back. 💜",
      action: 'OPEN_SOFT_PLACE',
      newState: state
    };
  }

  if (hasWord(lower, ['doctor pdf', 'doctor report', 'build my story', 'you place', 'my story', 'build my pdf'])) {
    return {
      intent: 'DOCTOR_PDF',
      text: "Let's build your story together for the doctor. I am opening the You Place form now. Take it small small, you can save and rest at any time. 💜",
      action: 'OPEN_YOU_PLACE',
      newState: state
    };
  }

  // --- 2. Real cycle data (only if she has logged a period) ---
  if (userData) {
    if (hasWord(lower, ['late', 'missing', 'missing period', 'no period', 'period is late', 'period late', 'am i late', 'l8', 'lat'])) {
      if (userData.lateDays > 0) {
        return {
          intent: 'CYCLE_LATE',
          text: `Yes, love. You're on ${dayAndPhase(userData)}, and you are ${userData.lateDays} day${userData.lateDays > 1 ? 's' : ''} late. Take a gentle breath. Have you thought about taking a test when you feel ready?`,
          chips: ["When should I do pregnancy test?", "How do I take a test?", "I am scared"],
          newState: state
        };
      }
      const daysUntil = Math.max(0, userData.average - userData.currentDay);
      return {
        intent: 'CYCLE_LATE',
        text: `No, love. You're on ${dayAndPhase(userData)}. Your period isn't late yet, it's expected in about ${daysUntil} day${daysUntil === 1 ? '' : 's'}. You're completely fine. 💜`,
        chips: ["I had sex, am I pregnant?", "I just want to understand my period", "How can I feel better right now?"],
        newState: state
      };
    }

    if (hasWord(lower, ['bleeding', 'bleed', 'blood', 'spotting'])) {
      state.hasBleeding = true;

      if (userData.currentDay >= 1 && userData.currentDay <= 7) {
        return {
          intent: 'GREETING',
          text: `It's your period, love. You're on ${dayAndPhase(userData)}. Put warm water on your tummy, rest, and be gentle with yourself today. 🩸`,
          chips: ["Why is my stomach paining me?", "Why is my period too much?", "How can I feel better right now?"],
          newState: state
        };
      }

      if (isBleedingOutOfWindow(userData) || userData.currentDay > 7) {
        if (hasRedFlags(lower)) {
          return {
            intent: 'MEDICAL_HEAVY_BLEEDING',
            isEmergency: true,
            text: `Love, I hear how heavy or painful this feels, and because you're on ${dayAndPhase(userData)}, it's best to have a nurse or doctor check on you today so you can feel comfortable and safe.`,
            newState: state
          };
        }
        return {
          intent: 'MEDICAL_OUT_OF_WINDOW_BLEEDING',
          text: `Love, you're on ${dayAndPhase(userData)}. Spotting or bleeding can sometimes happen when hormones shift, but since it's outside your normal period window, it's good to mention it to a healthcare provider just to be sure. How is your flow feeling?`,
          chips: ["Is this spotting or my period?", "Why is my period too much?", "Why is my stomach paining me?"],
          newState: state
        };
      }
    }

    if (hasWord(lower, ['tired', 'exhausted', 'no energy', 'weak', 'drained'])) {
      return {
        intent: 'LIFESTYLE_EXHAUSTED',
        text: `Of course you're tired, love. You're on ${dayAndPhase(userData)}, and your body is doing so much behind the scenes right now. Rest is your medicine today. 💜`,
        chips: ["Why am I feeling tired?", "How can I feel better right now?", "Why am I always feeling weak and dizzy during my period?"],
        newState: state
      };
    }
  }

  // --- 3. Test results ---
  if (hasWord(lower, ['positive', 'two lines'])) {
    state.testResult = 'positive';
    return {
      intent: 'CYCLE_PREGNANCY_POSITIVE',
      text: "Thank you for trusting me with that, love. Take a deep breath. How are your body and tummy feeling right now? Are you experiencing any pain or bleeding?",
      chips: ["Two lines (Positive)", "I am scared", "I am shy to ask a nurse or pharmacist"],
      newState: state
    };
  }

  if (hasWord(lower, ['negative', 'one line'])) {
    state.testResult = 'negative';
    return {
      intent: 'CYCLE_PREGNANCY_NEGATIVE',
      text: "I hear you, love. A negative test can bring relief, but it can also leave you wondering. When did you take the test?",
      chips: ["One line (Negative)", "When should I do pregnancy test?", "My period is late"],
      newState: state
    };
  }

  // --- 4. Emotions ---
  if (hasWord(lower, ['scared', 'fear', 'afraid', 'worried', 'panic'])) {
    // Let the knowledge base handle exact "I am scared" with its clean chips
    if (OVI_KNOWLEDGE[text]) {
      return {
        intent: 'EMOTIONAL_FEAR',
        text: OVI_KNOWLEDGE[text].text,
        chips: OVI_KNOWLEDGE[text].chips,
        newState: state
      };
    }
    return {
      intent: 'EMOTIONAL_FEAR',
      text: "Come and rest, love. I am right here with you. You are safe here. What is making your heart beat fast today?",
      chips: ["My period is late", "I had sex, am I pregnant?", "How can I feel better right now?"],
      newState: state
    };
  }

  // --- 5. Greeting ---
  if (hasWord(lower, ['hi', 'hello', 'hey', 'good morning', 'good evening'])) {
    // If it is an exact knowledge key like "How are you", use it
    if (OVI_KNOWLEDGE[text]) {
      return {
        intent: 'GREETING',
        text: OVI_KNOWLEDGE[text].text,
        chips: OVI_KNOWLEDGE[text].chips,
        newState: state
      };
    }
    return {
      intent: 'GREETING',
      text: "Love, I am here. 💜 How is your body feeling today?",
      chips: ["My period is late", "I had sex, am I pregnant?", "How can I feel better right now?"],
      newState: state
    };
  }

  // --- 6. Topic menu (My Period, Pregnancy Fear, etc.) ---
  if (text === 'My Period' || text === 'Pregnancy Fear' || text === 'Ovulation' || text === 'Pain & Body' || text === 'Safe & Shame') {
    let filteredChips: string[] = [];
    if (text === 'My Period') filteredChips = Object.keys(OVI_KNOWLEDGE).filter(k => k.toLowerCase().includes('period') || k.toLowerCase().includes('blood')).slice(0, 3);
    else if (text === 'Pregnancy Fear') filteredChips = Object.keys(OVI_KNOWLEDGE).filter(k => k.toLowerCase().includes('pregnant') || k.toLowerCase().includes('postinor')).slice(0, 3);
    else if (text === 'Ovulation') filteredChips = Object.keys(OVI_KNOWLEDGE).filter(k => k.toLowerCase().includes('ovulat') || k.toLowerCase().includes('discharge')).slice(0, 3);
    else if (text === 'Pain & Body') filteredChips = Object.keys(OVI_KNOWLEDGE).filter(k => k.toLowerCase().includes('pain') || k.toLowerCase().includes('tired') || k.toLowerCase().includes('moody')).slice(0, 3);
    else if (text === 'Safe & Shame') filteredChips = Object.keys(OVI_KNOWLEDGE).filter(k => k.toLowerCase().includes('shame') || k.toLowerCase().includes('dirty') || k.toLowerCase().includes('safe')).slice(0, 3);

    return {
      intent: 'GREETING',
      text: `Okay, love. What would you like to understand about ${text}?`,
      chips: filteredChips.length > 0 ? filteredChips : ["I am scared", "My period is late", "How can I feel better right now?"],
      newState: state
    };
  }

  // --- 7. Main knowledge base via resolver (exact match + keyword aliases) ---
  // Only use resolver if the text is an exact key OR matches an alias.
  // Otherwise fall through to UNRESOLVED so we log it.
  const isExactKey = !!OVI_KNOWLEDGE[text];
  const lowerText = text.toLowerCase();
  const aliasKeywords = ['pressuring', 'genuinely cares', 'boyfriend is annoying', 'am shy', 'how are you', 'i am scared', 'are you ai', 'do you know me', 'what do you love', 'what is this', 'whatsup', 'hello', 'hi', 'hey'];
  const isAliasMatch = aliasKeywords.some(k => lowerText.includes(k));

  if (isExactKey || isAliasMatch) {
    const resolved = resolveOviResponse(text);
    return {
      intent: 'GREETING',
      text: resolved.text,
      chips: resolved.chips,
      newState: state
    };
  }

  // --- 8. Unresolved: log for you to add later ---
  const userId = typeof window !== 'undefined' ? localStorage.getItem('lateCircleUserId') : null;
  if (userId) {
    supabase.from('unanswered_questions').insert([{ user_id: userId, question: text }]).then();
  }

  return {
    intent: 'UNRESOLVED',
    text: "Love, I want to understand you properly. Can you tell me a little more, or pick a topic below so I can hold space for you? 💜",
    chips: ["My period is late", "I had sex, am I pregnant?", "How can I feel better right now?"],
    newState: state
  };
}