import { OVI_KNOWLEDGE, resolveOviResponse } from './chatContent';
import { matchClumsyShield } from './clumsyShield';
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
  askedName?: boolean;
  topic?: string;
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
  asksName?: boolean;
}

export const TOPIC_MENU = [
  { id: 'late', label: 'My Period is Late', emoji: '⏳' },
  { id: 'pregnancy', label: 'Pregnancy Fear', emoji: '🤰' },
  { id: 'period', label: 'My Period', emoji: '🩸' },
  { id: 'ovulation', label: 'Ovulation', emoji: '🥚' },
  { id: 'pain', label: 'Pain & Body', emoji: '🤕' },
  { id: 'shame', label: 'Safe & Shame', emoji: '🫂' }
];

// --- SAFETY HELPERS ---

function hasWord(text: string, words: string[]): boolean {
  const escaped = words.map(word =>
    word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'i').test(text);
}

function mentionsSymptom(text: string, terms: string[]): boolean | null {
  const escaped = terms.map(term =>
    term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'i');
  const match = pattern.exec(text);
  if (!match || match.index === undefined) return null;

  const before = text.slice(Math.max(0, match.index - 45), match.index);

  const negated =
    /\b(no|not|never|without|denies|don't have|do not have|haven't|hasn't|isn't|aren't)\s+(?:(?:any|the|much|much of|currently|experiencing|having|feel|feeling|am|is|are)\s+){0,3}$/i.test(before);

  return !negated;
}

function dayAndPhase(userData: UserCycleData): string {
  return `Day ${userData.currentDay}, your ${userData.phase} phase`;
}

function isBleedingOutOfWindow(userData: UserCycleData): boolean {
  return userData.currentDay > 7 && userData.currentDay < userData.average;
}

function hasEmergencyBleeding(text: string): boolean {
  return (
    /\b(soaking|soaked)\s+(?:through\s+)?(?:a\s+)?(?:pad|pads)\b.*\b(hour|hours)\b/i.test(text) ||
    /\b(?:two|2|three|3)\s+(?:or\s+more\s+)?pads?\s+(?:in|within)\s+(?:one|1|two|2)\s+hours?\b/i.test(text) ||
    /\bbleeding heavily and feeling faint\b/i.test(text)
  );
}

function hasSeverePain(text: string): boolean {
  return (
    /\b(severe|unbearable|excruciating|agonising|agonizing)\b.{0,35}\b(pain|cramps?|stomach|tummy|abdomen)\b/i.test(text) ||
    /\b(pain|cramps?|stomach|tummy|abdomen)\b.{0,35}\b(severe|unbearable|excruciating|agonising|agonizing|very bad|extreme)\b/i.test(text) ||
    /\b(can't stand|cannot stand|can't bear|cannot bear)\b.{0,30}\b(pain|it)\b/i.test(text)
  );
}

function hasNearFainting(text: string): boolean {
  return (
    /\b(almost|nearly)\s+(fainted|faint|passed out|collapsed)\b/i.test(text) ||
    /\b(feel|feeling|felt)\s+(dizzy|lightheaded|like i (might|will|am going to) (faint|pass out))\b/i.test(text) ||
    /\b(dizzy|lightheaded)\b/i.test(text)
  );
}

// --- 5 GIRLS STORIES — science + anecdote, one Girl at a time ---
function getGirlId(userData?: UserCycleData): 'rest' | 'fresh' | 'fine' | 'chop' | 'ready' {
  if (!userData) return 'ready';
  const p = userData.phase.toLowerCase();
  if (p.includes('rest')) return 'rest';
  if (p.includes('fresh')) return 'fresh';
  if (p.includes('fine')) return 'fine';
  if (p.includes('chop')) return 'chop';
  if (p.includes('ready')) return 'ready';
  const ratio = userData.currentDay / Math.max(1, userData.average);
  if (ratio <= 0.15) return 'rest';
  if (ratio <= 0.35) return 'fresh';
  if (ratio <= 0.60) return 'fine';
  if (ratio <= 0.80) return 'chop';
  return 'ready';
}

function getNextGirlId(current: 'rest' | 'fresh' | 'fine' | 'chop' | 'ready'): 'rest' | 'fresh' | 'fine' | 'chop' | 'ready' {
  const order: ('rest' | 'fresh' | 'fine' | 'chop' | 'ready')[] = ['rest', 'fresh', 'fine', 'chop', 'ready'];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

const GIRL_STORIES: Record<string, string> = {
  rest: `Love, let me tell you about the Girl you are today. You are Rest Girl.\n\nRight now, your body is letting go of the lining it built last month. To do that, it makes something called prostaglandins. They make your womb squeeze to push the blood out. That squeezing is the cramp you feel. And because you are losing blood, your energy drops.\n\nYou know after you wash a big pile of clothes and your arms are shaking? That's your womb right now. It has been working.\n\nSo if you want hot water, sleep, and to be left alone — that is not laziness. That is your body asking for rest after work.\n\nRest today, love. Drink water, eat something warm, put your phone down. You are not weak. You are bleeding and still standing. That is strength.`,

  fresh: `Love, you are Fresh Girl today.\n\nBleeding has stopped. Your estrogen is starting to rise again. Estrogen is like sun after rain — it lifts your mood, your energy, your skin starts to clear. Your body is cleaning up and starting again.\n\nYou know after NEPA brings light after 2 days and you can finally charge your phone and feel normal again? That is Fresh Girl. Your body is charging again.\n\nYou may feel like talking more, going out small, laughing again. That is normal. You are coming back to yourself.\n\nDon't rush yourself. Walk small, eat normal, sleep well. Fresh Girl doesn't need big things. She just needs you to be gentle while you come back.`,

  fine: `Love, you are Fine Girl today. This is your peak, and I need you to hear me well.\n\nYour body is about to release an egg. That is called ovulation. Your estrogen is at its highest, so your skin glows, your hair looks better, you feel confident, you want to go out. You may also notice clear, stretchy discharge — like egg white. That discharge is there to help sperm travel, if sex happens.\n\nYou know that one week where your pictures just come out fine, your clothes fit fine, even strangers are smiling at you? That's not coincidence. That's Fine Girl.\n\nEnjoy her, love. But let me hold your hand for this part: because the egg is out, this is when pregnancy can happen if you have sex without protection. So if you are not ready for that, this is the week to be extra careful.`,

  chop: `Love, you are Chop Girl today.\n\nAfter ovulation, a hormone called progesterone rises. Progesterone slows your digestion, makes you feel bloated, makes you crave carbs and sweet things, and makes you sleepy. Your body is preparing — if pregnancy happens, it needs to hold the lining. If not, it will let it go.\n\nYou know when you cook a big pot of soup and you keep going to the kitchen to taste it, taste it, taste it? Your body is doing that — tasting, checking, wanting more fuel.\n\nSo if you want Indomie at 11pm, you are not greedy. You are not undisciplined. Your body is asking for warmth and fuel.\n\nEat, drink water, rest. Don't fight her, don't shame her. Chop Girl just wants to be fed and held warm.`,

  ready: `Love, you are Ready Girl today. And I know this Girl is hard.\n\nIf pregnancy did not happen, estrogen and progesterone drop sharply. That drop is why you feel moody, cry easily, breasts hurt, you feel bloated, you want to be alone and held at the same time. Doctors call this PMS. It is real. It is hormones falling, not you being a bad person.\n\nYou know when you have been waiting for your period, checking your pad every hour, and you are just tired of waiting? That's Ready Girl. She is sitting by the door with her bag packed, waiting for period to come.\n\nSo don't make big decisions in Ready Girl. Don't break up with your boyfriend, don't fight your mother, don't decide you hate everyone. Just breathe, sleep, eat something warm, and wait. Period is close. This feeling will pass.\n\nYou are not too much, love. You are just a girl whose body is tired of waiting. I'm waiting with you.`,
};

const NEXT_GIRL_INTRO: Record<string, string> = {
  rest: `Next is Fresh Girl, love.\n\nWhen Rest Girl leaves, bleeding stops and your estrogen starts to rise again. You will start to feel like yourself again — less tired, clearer head, wanting to talk small, wanting to go out small.\n\nYou know after NEPA brings light after 2 days and you can charge your phone again? That is Fresh Girl. Your body is charging again.\n\nDon't rush her. Walk small, eat normal, sleep well. You are coming back.`,
  fresh: `Next is Fine Girl, love. She is the one everybody notices.\n\nYour estrogen will rise to its highest and your body will get ready to release an egg. That is ovulation. Your skin glows, your energy is high, you feel confident, you want to dress up.\n\nYou know that week your pictures just come out fine? That's her.\n\nEnjoy her when she comes, but remember gently: because the egg is out, this is when pregnancy can happen if you have sex without protection.`,
  fine: `Next is Chop Girl, love.\n\nAfter ovulation, progesterone rises. It slows your digestion, makes you bloated, makes you crave carbs and sweet things, and makes you sleepy. Your body is preparing to hold the lining, just in case.\n\nYou know when you cook soup and keep going to taste it? Your body will do that — wanting more fuel.\n\nIf you want Indomie at 11pm then, you are not greedy. Your body is asking for warmth.`,
  chop: `Next is Ready Girl, love. She is the hardest one.\n\nEstrogen and progesterone will drop sharply. That drop is why you may feel moody, cry easily, breasts hurt, bloated, wanting to be alone and held at the same time. Doctors call this PMS. It is real.\n\nYou know when you keep checking your pad every hour, tired of waiting? That's Ready Girl, sitting by the door with her bag packed.\n\nDon't make big decisions in her. Just breathe, sleep, eat warm, and wait. Period is close.`,
  ready: `Next is Rest Girl again, love. A new cycle.\n\nYour period will come. Your body will let go of the lining it built. Prostaglandins will make your womb squeeze — that is the cramp — and you will bleed.\n\nYou know after washing a big pile of clothes and your arms shake? That's your womb working.\n\nRest then. Hot water, sleep, soft food. You are not weak. You are starting again.`,
};

function checkSafetyEngine(text: string, state: ChatState): OviResponse | null {
  const lower = text.toLowerCase();

  const bleeding = mentionsSymptom(lower, ['bleeding', 'bleed', 'blood', 'spotting']);
  const pain = mentionsSymptom(lower, ['pain', 'hurts', 'hurting', 'cramp', 'cramping']);
  const fainting = mentionsSymptom(lower, [
    'fainted',
    'fainting',
    'passed out',
    'lost consciousness',
    'collapsed'
  ]);

  const currentBleeding = bleeding === true;
  const currentPain = pain === true;
  const currentFainting = fainting === true;
  const deniedBleeding = bleeding === false;
  const deniedPain = pain === false;
  const nearFainting = hasNearFainting(lower);
  const severePain = hasSeverePain(lower);
  const emergencyBleeding = hasEmergencyBleeding(lower);

  if (bleeding !== null) state.hasBleeding = bleeding;
  if (pain !== null) state.hasPain = pain;
  if (fainting !== null) {
    if (currentFainting) {
      state.hasFainted = true;
      state.acknowledgedBleedingWarning = false;
    } else if (fainting === false) {
      state.hasFainted = false;
    }
  }

  if ((deniedBleeding || deniedPain) && !currentBleeding && !currentPain && !currentFainting && !severePain && !emergencyBleeding) {
    if (state.testResult === 'positive') {
      return {
        intent: 'CYCLE_PREGNANCY_POSITIVE',
        text: "Thank you for telling me that, love. No bleeding and no pain right now is reassuring. For a positive test, the next step is to see a healthcare professional for confirmation and to talk about your options and care. Do you have someone you trust who can go with you?",
        chips: ["I am scared", "What should I ask a nurse?", "My period is late"],
        newState: state
      };
    }
    if (deniedBleeding && deniedPain) {
      return {
        intent: 'GREETING',
        text: "Thank you for telling me that, love. No bleeding and no pain right now — I hear you. How is the rest of your body feeling today?",
        chips: ["My period is late", "I am scared", "How can I feel better right now?"],
        newState: state
      };
    }
    if (deniedBleeding) {
      return {
        intent: 'GREETING',
        text: "Okay love, thank you — no bleeding right now. That helps me understand. Are you feeling any pain, dizziness, or anything else worrying you?",
        chips: ["I have no pain", "My period is late", "I am scared"],
        newState: state
      };
    }
    if (deniedPain) {
      return {
        intent: 'GREETING',
        text: "Okay love, thank you — no pain right now. That is good to know. Are you bleeding or feeling dizzy at all?",
        chips: ["I'm not bleeding", "My period is late", "I am scared"],
        newState: state
      };
    }
  }

  if (state.testResult === 'positive' && (currentBleeding || currentPain || currentFainting)) {
    const emergency = currentFainting || severePain || emergencyBleeding;
    return {
      intent: emergency ? 'MEDICAL_ECTOPIC' : 'MEDICAL_PREGNANCY_BLEEDING',
      isEmergency: emergency,
      text: emergency
        ? "Love, because you have a positive pregnancy test and these symptoms, you need emergency medical assessment now. Please go to the nearest emergency department. If you feel faint, don't drive yourself. Ask someone nearby to help you."
        : "Love, a positive pregnancy test together with bleeding or pain needs prompt medical assessment. Please contact a healthcare professional today. If the pain becomes severe, you feel faint, or bleeding becomes heavy, seek emergency care.",
      newState: state
    };
  }

  if (state.testResult === 'positive' && (deniedBleeding || deniedPain) && !currentBleeding && !currentPain) {
    return {
      intent: 'CYCLE_PREGNANCY_POSITIVE',
      text: "Thank you for telling me that, love. No bleeding and no pain right now is reassuring. For a positive test, the next step is to see a healthcare professional for confirmation and to talk about your options and care. Do you have someone you trust who can go with you?",
      chips: ["I am scared", "What should I ask a nurse?", "My period is late"],
      newState: state
    };
  }

  if (currentFainting) {
    state.acknowledgedBleedingWarning = true;
    return {
      intent: 'MEDICAL_FAINTING',
      isEmergency: true,
      text: "Love, fainting or passing out needs urgent medical attention. Please lie down somewhere safe, tell someone nearby, and get emergency medical help now. Don't drive yourself.",
      newState: state
    };
  }
  if (state.hasFainted && !state.acknowledgedBleedingWarning) {
    state.acknowledgedBleedingWarning = true;
    return {
      intent: 'MEDICAL_FAINTING',
      isEmergency: true,
      text: "Love, fainting or passing out needs urgent medical attention. Please lie down somewhere safe, tell someone nearby, and get emergency medical help now. Don't drive yourself.",
      newState: state
    };
  }

  if (nearFainting) {
    if (state.testResult === 'positive' || currentBleeding || severePain) {
      return {
        intent: 'MEDICAL_FAINTING',
        isEmergency: true,
        text: "Love, feeling like you might faint together with a positive test, bleeding, or severe pain needs urgent medical attention. Please sit or lie down, tell someone nearby, and get emergency medical help now. Don't drive yourself.",
        newState: state
      };
    }
    return {
      intent: 'MEDICAL_FAINTING',
      isEmergency: false,
      text: "Love, feeling dizzy or like you might faint is important — please sit or lie down, drink some water, and tell someone nearby how you feel. If you actually faint, have severe pain, heavy bleeding, or a positive pregnancy test with these symptoms, get emergency help right away. Are you bleeding or in pain right now?",
      chips: ["I am bleeding", "I have no pain", "I'm not bleeding"],
      newState: state
    };
  }

  if (severePain || emergencyBleeding) {
    return {
      intent: 'MEDICAL_HEAVY_BLEEDING',
      isEmergency: true,
      text: "Love, severe pain or very heavy bleeding needs emergency medical assessment now. Please go to the nearest emergency department and ask someone to accompany you.",
      newState: state
    };
  }

  return null;
}

export function getOviReply(
  text: string,
  currentState: ChatState,
  userData?: UserCycleData,
  allowUnansweredLogging = false
): OviResponse {
  const lower = text.toLowerCase().trim();
  const state = { ...currentState }; 

  // --- 0. IDENTITY CHECK FIRST ---
  const isBoyQuestion =
    lower.includes('are you a boy') ||
    lower.includes('are you male') ||
    lower.includes('are you a man') ||
    lower.includes('are you a guy');

  const isGirlQuestion =
    lower.includes('are you a girl') ||
    lower.includes('are you female') ||
    lower.includes('are you a woman') ||
    lower.includes('are you a lady');

  const isRealHumanQuestion =
    lower.includes('are you real') ||
    lower.includes('are you human') ||
    lower.includes('who are you');

  if (isBoyQuestion) {
    return {
      intent: 'GREETING',
      text: "No love, I am not a boy. I am your big sister Ovi. I am here for girls like you. What do you want to understand today?",
      chips: ["My period is late", "I had sex, am I pregnant?", "How can I feel better right now?"],
      newState: state,
      asksName: false,
    };
  }

  if (isGirlQuestion) {
    if (state.askedName) {
      return {
        intent: 'GREETING',
        text: "Love, I'm your big sister Ovi. I'm here for girls like you. What do you want to understand today?",
        chips: ["My period is late", "I had sex, am I pregnant?", "How can I feel better right now?"],
        newState: state,
        asksName: false,
      };
    }
    state.askedName = true;
    return {
      intent: 'GREETING',
      text: "Love, I'm your big sister Ovi. I'm here for girls like you. What's your name?",
      chips: ["My period is late", "I had sex, am I pregnant?", "How can I feel better right now?"],
      newState: state,
      asksName: true,
    };
  }

  if (isRealHumanQuestion) {
    return {
      intent: 'GREETING',
      text: "I'm real enough to stay up with you at 2am when you can't sleep. I'm your sister in this app. You can trust me. What do you want to understand today?",
      chips: ["Are you AI?", "What can you help me with?", "How are you"],
      newState: state,
      asksName: false,
    };
  }

  // --- 0.5 SHE IS TELLING US SHE IS PREGNANT / TEST IS POSITIVE ---
  const isPregnancyDisclosure =
    lower === 'am pregnant' ||
    lower === 'i am pregnant' ||
    lower === 'im pregnant' ||
    lower === "i'm pregnant" ||
    lower === 'am postive' ||
    lower === 'am positive' ||
    lower === 'i am positive' ||
    lower === 'im positive' ||
    lower === "i'm positive" ||
    lower === 'test is positive' ||
    lower === 'my test is positive' ||
    lower === 'it says positive' ||
    lower === 'it came out positive' ||
    lower === 'two lines' ||
    lower.includes('i tested positive') ||
    lower.includes('test came out positive') ||
    lower.includes('i am pregnant') ||
    lower.includes('am postive') ||
    lower.includes('am positive') ||
    lower.includes('my test is positive');

  if (isPregnancyDisclosure) {
    state.testResult = 'positive';
    state.topic = 'pregnancy-positive';
    return {
      intent: 'CYCLE_PREGNANCY_POSITIVE',
      text: `Love, thank you for telling me. I hear you. Take a slow breath with me. You are safe here.\n\nIf your test says positive, it likely means you are pregnant. A test can sometimes be wrong, so the next kind step is to confirm it — you can take another test in a few days, or see a nurse or doctor who can check for you.\n\nYou do not have to decide everything today. You do not have to carry this alone.\n\nDo you want to tell me how you are feeling about it right now — scared, confused, or something else? And is there someone you trust who can be with you?`,
      chips: ["I am scared", "What should I do next?", "Can I talk to someone I trust?", "How can I feel better right now?"],
      newState: state
    };
  }

  // --- 0.6 Follow-up after positive disclosure ---
  if (state.topic === 'pregnancy-positive' && (lower.includes('what should i do') || lower.includes('what do i do') || lower === 'what next' || lower.includes('next'))) {
    return {
      intent: 'CYCLE_PREGNANCY_POSITIVE',
      text: `Okay love, one small step at a time.\n\n1. Confirm — another test in a few days, or a check at a clinic.\n2. Care for your body — rest, eat, drink water, avoid alcohol and smoking.\n3. Talk to someone you trust — a nurse, doctor, or a safe adult. You deserve support, not shame.\n\nYou do not need to decide your whole future today. First, let's make sure you are safe and supported.\n\nDo you have someone safe you can tell?`,
      chips: ["I am scared", "I have no one to tell", "Tell me about my body now"],
      newState: state
    };
  }

  if (state.topic === 'pregnancy-positive' && (lower.includes('no one') || lower.includes('no-one') || lower.includes('nobody') || lower.includes('i have no one'))) {
    return {
      intent: 'CYCLE_PREGNANCY_POSITIVE',
      text: `Love, I am here, and you are not alone even if it feels like it right now.\n\nIf there is no safe person at home, a nurse, a school counsellor, or a trusted clinic can listen without judgement. You deserve someone kind beside you for this.\n\nDo you want me to help you think about who might be safe to tell first?`,
      chips: ["Help me think who to tell", "I am scared", "What should I do next?"],
      newState: state
    };
  }

  const safetyResponse = checkSafetyEngine(lower, state);
  if (safetyResponse) return safetyResponse;

  // --- 1.5 WHY DO I FEEL LIKE THIS? — tell her HER Girl only ---
  if (
    lower === 'why do i feel like this?' ||
    lower === 'why do i feel like this' ||
    lower.includes('why do i feel like this') ||
    lower.includes('explain my body') ||
    lower.includes('explain my girl') ||
    lower === 'what girl am i' ||
    lower.includes('which girl am i') ||
    lower === 'tell me about my body now'
  ) {
    const girlId = getGirlId(userData);
    return {
      intent: 'GREETING',
      text: GIRL_STORIES[girlId],
      chips: ["What will happen next?", "My period is late", "How can I feel better right now?"],
      newState: state,
    };
  }

  // --- 1.6 WHAT WILL HAPPEN NEXT? — tell her the NEXT Girl ---
  if (
    lower === 'what will happen next?' ||
    lower === 'what will happen next' ||
    lower.includes('what will happen next') ||
    lower.includes('what happens next') ||
    lower.includes('who is coming next') ||
    lower.includes('what girl is next')
  ) {
    const currentGirl = getGirlId(userData);
    const nextGirl = getNextGirlId(currentGirl);
    return {
      intent: 'GREETING',
      text: NEXT_GIRL_INTRO[currentGirl],
      chips: ["Why do I feel like this?", "My period is late", "How can I feel better right now?"],
      newState: state,
    };
  }

  // --- 1. Soft Place & Doctor PDF ---
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

  // --- 2. Real cycle data ---
  if (userData) {
    if (hasWord(lower, ['late', 'missing', 'missing period', 'no period', 'period is late', 'period late', 'am i late', 'l8', 'lat'])) {
      if (userData.lateDays > 0) {
        return {
          intent: 'CYCLE_LATE',
          text: `I hear you, love. You're on ${dayAndPhase(userData)}, and you are ${userData.lateDays} day${userData.lateDays > 1 ? 's' : ''} late. Take a gentle breath. Have you thought about taking a test when you feel ready?`,
          chips: ["When should I do pregnancy test?", "How do I take a test?", "I am scared"],
          newState: state
        };
      }
      const daysUntil = Math.max(0, userData.average - userData.currentDay);
      return {
        intent: 'CYCLE_LATE',
        text: `I hear you, love. I know waiting is hard. Based on the dates you've logged, you're on ${dayAndPhase(userData)}, and your period is expected in about ${daysUntil} day${daysUntil === 1 ? '' : 's'}. Dates can shift by a few days with stress or sleep, so feeling like it's late makes sense.\n\nIf pregnancy is possible, a pregnancy test can help you check and have peace of mind.`,
        chips: ["I had sex, am I pregnant?", "When should I do pregnancy test?", "How can I feel better right now?"],
        newState: state
      };
    }

    if (mentionsSymptom(lower, ['bleeding', 'bleed', 'blood', 'spotting']) === true) {
      state.hasBleeding = true;

      if (userData.currentDay >= 1 && userData.currentDay <= 7) {
        return {
          intent: 'GREETING',
          text: `Love, you're on ${dayAndPhase(userData)} and you mentioned bleeding. Can you tell me when it started, how heavy it is, and if you have pain with it? That will help me understand how to support you.`,
          chips: ["Why is my stomach paining me?", "Why is my period too much?", "How can I feel better right now?"],
          newState: state
        };
      }

      if (isBleedingOutOfWindow(userData) || userData.currentDay > 7) {
        if (hasSeverePain(lower) || hasEmergencyBleeding(lower)) {
          return {
            intent: 'MEDICAL_HEAVY_BLEEDING',
            isEmergency: true,
            text: `Love, severe pain or very heavy bleeding needs emergency medical assessment now. Please go to the nearest emergency department and ask someone to accompany you.`,
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

  // --- 3. Test results (single words, not full disclosure) ---
  if (hasWord(lower, ['positive', 'two lines', 'postive'])) {
    state.testResult = 'positive';
    state.topic = 'pregnancy-positive';
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

  // --- 3.5 Clumsy Shield: after medical routing ---
  const shield = matchClumsyShield(text);
  if (shield) {
    const shieldWantsName = shield.text.toLowerCase().includes("what's your name");
    let shieldText = shield.text;

    if (shieldWantsName && state.askedName) {
      shieldText = shieldText.replace("What's your name?", "What do you want to understand today?");
      shieldText = shieldText.replace("What's your name, love?", "What do you want to understand today?");
      return {
        intent: 'GREETING',
        text: shieldText,
        chips: shield.chips,
        newState: state,
        asksName: false,
      };
    }
    if (shieldWantsName) {
      state.askedName = true;
    }
    return {
      intent: 'GREETING',
      text: shieldText,
      chips: shield.chips,
      newState: state,
      asksName: shieldWantsName,
    };
  }

  // --- 4. Emotions ---
  if (hasWord(lower, ['scared', 'fear', 'afraid', 'worried', 'panic'])) {
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

  // --- 4.5 Feeling fine / small talk (must be before UNRESOLVED) ---
  const isFine =
    /\b(im|i am|i'm|am)\s*(fine|gine|fyn|ok|okay|good|alright|better)\b/i.test(lower) ||
    lower === 'fine' ||
    lower === 'gine' ||
    lower === 'good' ||
    lower === 'ok' ||
    lower === 'okay';

  const asksHowAreYou =
    lower.includes('and you') ||
    lower.includes('how about you') ||
    lower.includes('how are you');

  if (isFine) {
    if (asksHowAreYou) {
      return {
        intent: 'FEELING_FINE',
        text: "I'm good love, because you're here talking to me. I'm glad you're feeling fine today. Is there anything on your body or mind you want to understand, or do you just want to gist a little?",
        chips: ["My period is late", "I had sex, am I pregnant?", "How can I feel better right now?"],
        newState: state
      };
    }
    return {
      intent: 'FEELING_FINE',
      text: "I love to hear that, love. I'm glad you're feeling fine today. Tell me, is there anything you want to understand about your body today, or should we just gist?",
      chips: ["My period is late", "I had sex, am I pregnant?", "How can I feel better right now?"],
      newState: state
    };
  }

  if (asksHowAreYou || lower === 'how are you' || lower.includes('how are you doing')) {
    return {
      intent: 'GREETING',
      text: "I'm here love, staying up with you. I'm good. How are you feeling in your body today?",
      chips: ["My period is late", "I had sex, am I pregnant?", "How can I feel better right now?"],
      newState: state
    };
  }

    // --- 4.6 Yes / No — answer to Ovi's last question ---
  const isYes = ['yes','yeah','yep','yea','yes please','yes pls','ok yes','sure','okay yes'].includes(lower) || lower === 'yes';
  const isNo = ['no','nope','nah','not really','no thanks'].includes(lower) || lower === 'no';

  if (isYes) {
    if (state.pendingQuestion === 'gist') {
      state.pendingQuestion = undefined;
      return {
        intent: 'GREETING',
        text: "Okay love, let's gist. Tell me — how was your day today? Did anything happen with your body, your boyfriend, or your mood that you want to pour out? I'm listening, no judgement.",
        chips: ["My boyfriend is annoying", "I am scared", "Why am I moody?"],
        newState: state
      };
    }
    state.pendingQuestion = undefined;
    return {
      intent: 'GREETING',
      text: "Okay love, I'm listening. Tell me more, in your own words. What happened?",
      chips: ["My period is late", "I am scared", "I had sex, am I pregnant?"],
      newState: state
    };
  }

  if (isNo) {
    state.pendingQuestion = undefined;
    return {
      intent: 'GREETING',
      text: "No wahala love, no pressure. We can stay quiet, or we can talk about your body. What do you want to understand today?",
      chips: ["My period is late", "I had sex, am I pregnant?", "How can I feel better right now?"],
      newState: state
    };
  }
  
  // --- 5. Greeting ---
  if (hasWord(lower, ['hi', 'hello', 'hey', 'good morning', 'good evening'])) {
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

  // --- 6. Topic menu ---
  if (text === 'My Period is Late' || text === 'My Period' || text === 'Pregnancy Fear' || text === 'Ovulation' || text === 'Pain & Body' || text === 'Safe & Shame') {
    let filteredChips: string[] = [];
    if (text === 'My Period is Late' || text === 'My Period') filteredChips = Object.keys(OVI_KNOWLEDGE).filter(k => k.toLowerCase().includes('period') || k.toLowerCase().includes('blood')).slice(0, 3);
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

  // --- 7. Main knowledge base ---
  const isExactKey = !!OVI_KNOWLEDGE[text];
  const lowerText = text.toLowerCase();
  const aliasKeywords = ['pressuring', 'genuinely cares', 'boyfriend is annoying', 'am shy', 'how are you', 'i am scared', 'are you ai', 'do you know me', 'what do you love', 'what is this', 'whatsup', 'hello', 'hi', 'hey', 'doctor said pcos', 'need a scan', 'hormonal imbalance', 'come back in 3 months', 'went to the doctor'];
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

  // --- 7.5 Doctor language translator ---
  if (lower.includes('doctor said') || lower.includes('doctor told me')) {
    if (lower.includes('pcos')) {
      return { intent: 'GREETING', text: OVI_KNOWLEDGE['Doctor said PCOS'].text, chips: OVI_KNOWLEDGE['Doctor said PCOS'].chips, newState: state };
    }
    if (lower.includes('scan') || lower.includes('ultrasound')) {
      return { intent: 'GREETING', text: OVI_KNOWLEDGE['Doctor said I need a scan'].text, chips: OVI_KNOWLEDGE['Doctor said I need a scan'].chips, newState: state };
    }
    if (lower.includes('hormon')) {
      return { intent: 'GREETING', text: OVI_KNOWLEDGE['Doctor said hormonal imbalance'].text, chips: OVI_KNOWLEDGE['Doctor said hormonal imbalance'].chips, newState: state };
    }
    if (lower.includes('3 month') || lower.includes('three month')) {
      return { intent: 'GREETING', text: OVI_KNOWLEDGE['Doctor said come back in 3 months'].text, chips: OVI_KNOWLEDGE['Doctor said come back in 3 months'].chips, newState: state };
    }
    return {
      intent: 'GREETING',
      text: "Love, tell me exactly what the doctor said, word for word if you can. I will translate it into simple sister language so you understand it without fear. Big medical words are just labels — they are not sentences about your future.",
      chips: ["Doctor said PCOS", "Doctor said I need a scan", "Doctor said hormonal imbalance"],
      newState: state,
    };
  }

  // --- 8. Unresolved: log ONLY if user consented ---
  const userId = typeof window !== 'undefined' ? localStorage.getItem('lateCircleUserId') : null;
  if (allowUnansweredLogging && userId) {
    supabase
      .from('unanswered_questions')
      .insert([{ user_id: userId, question: text }])
      .then();
  }

  return {
    intent: 'UNRESOLVED',
    text: "Love, I want to understand you properly. Can you tell me a little more, or pick a topic below so I can hold space for you? 💜",
    chips: ["My period is late", "I had sex, am I pregnant?", "How can I feel better right now?"],
    newState: state
  };
}