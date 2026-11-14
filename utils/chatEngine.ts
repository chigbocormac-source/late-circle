export type Intent = 
  | 'MEDICAL_ECTOPIC' | 'MEDICAL_FAINTING' | 'MEDICAL_HEAVY_BLEEDING' 
  | 'MEDICAL_PREGNANCY_BLEEDING' | 'MEDICAL_PREGNANCY_BLEEDING_ACKNOWLEDGED'
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
}

export interface OviResponse {
  text: string;
  intent: Intent;
  isEmergency?: boolean;
  chips?: string[];
  newState: ChatState;
  action?: 'OPEN_SOFT_PLACE' | 'OPEN_YOU_PLACE'; // <--- THE NEW ACTION TRIGGERS
}

function hasWord(text: string, words: string[]): boolean {
  const regex = new RegExp(`\\b(${words.join('|')})\\b`, 'i');
  return regex.test(text);
}

function checkSafetyEngine(text: string, state: ChatState): OviResponse | null {
  const lower = text.toLowerCase();
  
  if (hasWord(lower, ['bleeding', 'bleed', 'blood', 'spotting'])) state.hasBleeding = true;
  if (hasWord(lower, ['pain', 'hurts', 'hurting', 'cramp'])) state.hasPain = true;
  if (hasWord(lower, ['faint', 'fainted', 'collapse', 'collapsed', 'passed out'])) {
    if (!hasWord(lower, ['not faint', 'almost faint', 'nearly faint', 'no faint'])) state.hasFainted = true;
  }

  // CRITICAL COMBINATION: Pregnant + Bleeding
  if (state.testResult === 'positive' && state.hasBleeding) {
    
    if (state.hasPain || state.hasFainted) {
      return {
        intent: 'MEDICAL_ECTOPIC',
        isEmergency: true,
        text: "Fine girl, I need you to stop and listen to me. Because your test is positive and you have bleeding with pain/fainting, this could be an ectopic pregnancy. Please go to an emergency room immediately or call 112. Do not wait.",
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
        text: "Fine girl, I hear you. Because your test was positive and you are bleeding, you need a medical assessment urgently today. Please go to a hospital. Are you having any severe pain, dizziness, or shoulder pain right now?",
        chips: ["Yes, I have pain", "No, I am fine"],
        newState: state
      };
    }
  }

  if (state.hasFainted) {
    return {
      intent: 'MEDICAL_FAINTING',
      isEmergency: true,
      text: "Sister, fainting is not something to ignore. Please sit or lie down and call 112 or go to a hospital immediately. Do not wait.",
      newState: state
    };
  }

  return null; 
}

export function getOviReply(text: string, currentState: ChatState): OviResponse {
  const lower = text.toLowerCase();
  const state = { ...currentState }; 

  const safetyResponse = checkSafetyEngine(lower, state);
  if (safetyResponse) return safetyResponse;

  // --- SOFT PLACE INTENT ---
  if (hasWord(lower, ['soft place', 'i need soft place', 'hide', 'panic button'])) {
    return {
      intent: 'EMOTIONAL_SOFT_PLACE',
      text: "I am opening the Soft Place for you now. It is a quiet space for you to rest and breathe. I will be right here when you come back. 💜",
      action: 'OPEN_SOFT_PLACE',
      newState: state
    };
  }

  // --- DOCTOR PDF / YOU PLACE INTENT ---
  if (hasWord(lower, ['doctor pdf', 'doctor report', 'build my story', 'you place', 'my story', 'build my pdf'])) {
    return {
      intent: 'DOCTOR_PDF',
      text: "Let's build your story for the doctor. I am opening the You Place form now. Take it small small. You can save and rest at any time. 💜",
      action: 'OPEN_YOU_PLACE',
      newState: state
    };
  }

  // --- THANK YOU INTENT ---
  if (hasWord(lower, ['thank you', 'thanks', 'okay thank you', 'ok thank you'])) {
    return {
      intent: 'GREETING',
      text: "You are welcome, fine girl. 💜 I am always here.",
      chips: ["I am scared", "My period is late", "I am tired"],
      newState: state
    };
  }

  // --- TEST RESULTS ---
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

  // --- EMOTIONAL FEAR ---
  if (hasWord(lower, ['scared', 'fear', 'afraid', 'worried', 'panic'])) {
    return {
      intent: 'EMOTIONAL_FEAR',
      text: "Come and rest, fine girl. I am here. What is making your heart beat fast today?",
      chips: ["My period is late", "I took a test", "I need comfort"],
      newState: state
    };
  }

  // --- LATE PERIOD ---
  if (hasWord(lower, ['late', 'missing period', 'no period'])) {
    return {
      intent: 'CYCLE_LATE',
      text: "A late period can have many causes. Have you taken a pregnancy test yet?",
      chips: ["Yes, it was positive", "Yes, it was negative", "No, I am too scared"],
      newState: state
    };
  }

  // --- TESTING FEAR ---
  if (hasWord(lower, ['took a test', 'did a test', 'used a test'])) {
    return {
      intent: 'EMOTIONAL_FEAR_TESTING',
      text: "How did it go? Was it positive or negative? I am here with you.",
      chips: ["It was positive", "It was negative", "I haven't looked yet"],
      newState: state
    };
  }

  // --- FEELING FINE ---
  if (hasWord(lower, ['am fine', 'i am fine', 'doing well', 'i am okay', 'i am ok'])) {
    return {
      intent: 'FEELING_FINE',
      text: "That is good to hear. 💜 Do you want to check your circles for today, or is there something else on your mind?",
      chips: ["My period is late", "I am just tired", "Let's talk about my body"],
      newState: state
    };
  }

  // --- GREETING ---
  if (hasWord(lower, ['hi', 'hello', 'hey', 'good morning', 'good evening'])) {
    return {
      intent: 'GREETING',
      text: "Fine girl! 💜 I am here. How is your body feeling today?",
      chips: ["I am scared", "My period is late", "I am tired"],
      newState: state
    };
  }

  // --- FALLBACK ---
  return {
    intent: 'UNRESOLVED',
    text: "Fine girl, I want to understand you properly. Can you tell me a little more? 💜",
    chips: ["I am scared", "My period is late", "Something feels wrong"],
    newState: state
  };
}