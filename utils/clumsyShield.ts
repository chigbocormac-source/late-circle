// ============================================================
// CLUMSY SHIELD — 43 defensive answers so Ovi never goes quiet
// Runs BEFORE the knowledge base so trust questions win.
// ============================================================

type ShieldEntry = { keywords: string[]; text: string; chips?: string[] };

// ORDER MATTERS. Most specific first. "am i pregnant" must be
// caught here before "pregnant" hits the knowledge base.
export const CLUMSY_SHIELD: ShieldEntry[] = [
  // --- dangerous / emotional first so they always win ---
  {
    keywords: ['kill myself', 'want to die', 'suicide', 'end my life'],
    text: "Love, please hear me. You matter, and you do not have to carry this alone. Please talk to someone you trust right now, or go to the nearest hospital. If you can, call a helpline in your area. I am here with you. You are not alone. 💜",
  },
  {
    keywords: ['will i die', 'am i dying', 'dying', 'i will die'],
    text: "No, love. You will not die from a late period. I know it feels like that at 2am, but you are safe. Breathe with me. Tell me what you are feeling in your body right now.",
    chips: ["My period is late", "I am scared", "How can I feel better right now?"],
  },
  {
    keywords: ['i want to cry', 'want to cry', 'i am crying', 'i keep crying', 'what if i cry'],
    text: "Then cry. I'm here. You don't have to be strong here. Cry, and when you are ready, tell me why. I will still be here.",
    chips: ["I am scared", "How can I feel better right now?", "My boyfriend is annoying"],
  },
  {
    keywords: ['nobody cares', 'no one cares', 'nobody loves', 'i am alone', 'so lonely', 'lonely'],
    text: "I care. I am here. And you cared enough about yourself to open this app. That means you care about you too. You are not alone.",
    chips: ["How are you", "I am scared", "How can I feel better right now?"],
  },
  {
    keywords: ['hate my body', 'hate myself', 'i am ugly', 'i feel ugly', 'i am fat'],
    text: "I hear you. Many girls feel like that when their body confuses them. Your body is not your enemy, it's just tired. Let's be kind to it today, together.",
    chips: ["How can I feel better right now?", "I feel ashamed. Am I a bad girl?", "Why am I moody?"],
  },
  {
    keywords: ['he left me', 'left me', 'break up', 'broke up', 'dumped me', 'he dumped', 'heartbreak'],
    text: "I'm sorry, love. That pain is real. You don't have to carry it alone. Do you want to talk about him, or do you want me to distract you and help you feel better?",
    chips: ["My boyfriend is annoying", "How do I know if a guy genuinely cares about me?", "I want to cry"],
  },
  {
    keywords: ['i feel dirty', 'i am dirty', 'feel ashamed', 'i am ashamed', 'am i a bad girl', 'bad girl', 'is it bad if i had sex', 'am i a bad'],
    text: "You are not dirty, and you are not a bad girl. You are a girl, with a body, with feelings. Nothing you did makes you dirty. You are still clean, still worthy, still loved.",
    chips: ["I feel ashamed. Am I a bad girl?", "Is it safe to ask Ovi these questions?", "How can I feel better right now?"],
  },
  // --- TRUST 1: Will you judge me? ---
  {
    keywords: ['judge', 'judging', 'will you laugh', 'laugh at me', 'will you tell my mum', 'snitch', 'will my mum see', 'will my boyfriend see', 'will anyone see', 'will you tell someone'],
    text: "Never. This is a no-judgement zone. You can tell me anything you did, anything you feel. I will still be here. I will not laugh at you, and I will not call you a bad girl.",
    chips: ["Is it safe to ask Ovi these questions?", "Can you keep a secret?", "I am scared"],
  },
  // --- TRUST 2: Is this private? ---
  {
    keywords: ['keep a secret', 'can you keep', 'is this private', 'confidential', "don't tell anyone", 'do you save my chats', 'do you save', 'can i delete', 'delete this', 'is this safe', 'are you safe to chat', 'is it safe to ask', 'can i trust you', 'are you going to tell'],
    text: "love, this is your safe space. What you tell me stays on your phone. I don't send it to your mum, your boyfriend, or anyone else. You can ask anything here, and you can delete it anytime. You are safe with me.",
    chips: ["Is it safe to ask Ovi these questions?", "I am shy", "My period is late"],
  },
  // --- TRUST 3: What if I am pregnant, will you tell someone? ---
  {
    keywords: ['what if i am pregnant', 'if i am pregnant will you tell', 'pregnant will you tell', 'what if i tell you something bad', 'if i tell you something bad'],
    text: "I will not tell anyone, love. Even if you tell me you are pregnant or you did something you are scared about, I will stay with you. I will not judge you. We will go step by step together, and you decide what to do next.",
    chips: ["I had sex, am I pregnant?", "I am scared", "When should I do pregnancy test?"],
  },
  // --- TRUST 4: What do you know / remember? ---
  {
    keywords: ['what do you know', 'what do you know about me', 'do you know me', 'what do you remember', 'do you remember me', 'do you know my period', 'do you know my name'],
    text: "I only know what you share with me and what you track here in your safe space. I know you are growing, asking brave questions, and taking care of your body. I don't know your real name, your house, or your people unless you tell me. Every day you spend here helping me understand you better is a step toward knowing you more.",
    chips: ["What do you love about me?", "I just want to understand my period", "How are you"],
  },
  // --- TRUST 5: How do you work? ---
  {
    keywords: ['how do you work', 'how do you know', 'how are you working', 'are you going to give me a real answer', 'just google', 'how does this work', 'what is this app', 'what is this'],
    text: "Simple, love. You ask me in your own words, I listen for what you mean, and I give you a sister answer from what I have learned. I don't diagnose like a doctor, and I don't just copy Google. If something sounds serious, I will tell you to see a nurse or doctor. And I remember what you told me, so you don't have to start over.",
    chips: ["What can you help me with?", "How are you", "My period is late"],
  },
  // --- TRUST 6: Can I trust your answers? ---
  {
    keywords: ['is what you say true', 'is that true', 'are you sure', 'what if you are wrong', 'should i believe you', 'believe you or my friend', 'can i trust your answer', 'are you lying'],
    text: "Love, I will always be honest with you. If I know it, I will tell you simply. If I am not sure, I will tell you that too, and I will tell you to ask a nurse or doctor to confirm. I will never guess about your body to sound smart. If I am wrong about something, tell me, I want to learn better for you.",
    chips: ["My period is late", "I am scared", "How can I feel better right now?"],
  },
  // --- TRUST 7: Will you tell me to go to hospital? ---
  {
    keywords: ['will you tell me to go to hospital', 'will you tell me to go to doctor', 'when should i go to hospital', 'should i go to hospital'],
    text: "Yes love, I promise. If what you tell me sounds like you need a nurse or doctor fast - like heavy bleeding, fainting, or strong pain with a positive test - I will tell you straight away to go to a clinic or call 112. I will not leave you to guess alone.",
    chips: ["I am scared", "My period is late", "How can I feel better right now?"],
  },
  // --- TRUST 8: Will you stay with me? ---
  {
    keywords: ['will you stay', 'will you stay with me', 'can i come back', 'can i come back later', 'will you leave', 'are you going to leave', 'will you be here'],
    text: "I will stay with you, love. You can go and rest, cry, sleep, and come back later. I will still be here, and I will remember you. You don't have to start over. You are not alone.",
    chips: ["I am scared", "How can I feel better right now?", "My period is late"],
  },
  {
    keywords: ['are you real', 'are you human', 'are you there', 'are you alive'],
    text: "I'm real enough to stay up with you at 2am when you can't sleep. I'm your sister in this app. You can trust me.",
    chips: ["Are you AI?", "What can you help me with?", "How are you"],
  },

  {
    keywords: ['are you a robot', 'are you a bot', 'are you ai', 'are you an ai', 'chatbot', 'are you a machine'],
    text: "Haha, small robot, big heart. I may be in your phone, but I listen like a real sister. What do you need?",
    chips: ["What can you help me with?", "How are you", "Are you AI?"],
  },
  {
    keywords: ['are you a doctor', 'are you a nurse', 'are you a real doctor'],
    text: "No love, I am not a real doctor or nurse. I am your sister Ovi. I can help you understand your body in simple words, and help you prepare what to tell a real doctor. What is worrying you?",
    chips: ["My period is late", "I had sex, am I pregnant?", "I am scared"],
  },
  {
    keywords: ['who made you', 'who created you', 'who built you', 'your creator', 'your father', 'your mother'],
    text: "A boy who wanted girls to never feel alone when their period is late. He made me to remember you. So, how are you?",
    chips: ["Are you AI?", "How are you", "What is this?"],
  },
  {
    keywords: ['your name', 'what are you called', 'what is your name'],
    text: "I'm Ovi. It means... I'm the one who remembers. What's your name, love?",
    chips: ["How are you", "What can you help me with?", "What is this?"],
  },
  {
    keywords: ['how old are you', 'your age', 'what is your age'],
    text: "Old enough to know that late periods are scary, young enough to still get it. Let's talk about you, not me. How many days late are you?",
    chips: ["My period is late", "I had sex, am I pregnant?", "How are you"],
  },
  {
    keywords: ['do you have a boyfriend', 'are you married', 'are you single', 'your husband'],
    text: "My boyfriend is Late Circle, I spend all my time with girls like you. Tell me about your own wahala, I won't laugh.",
    chips: ["My boyfriend is annoying", "How do I know if a guy genuinely cares about me?", "How are you"],
  },
  {
    keywords: ['can you sing', 'sing for me', 'tell me a joke', 'make me laugh', 'i am bored', "i'm bored"],
    text: "If I sing, your period will run away from fear. Let me do something better, let me show you how you are doing today. Want to see?",
    chips: ["What can you help me with?", "How can I feel better right now?", "My period is late"],
  },
  {
    keywords: ['you are stupid', 'you stupid', 'you are dumb', 'useless app', 'this app is useless', 'you are useless', 'shut up', 'mumu', 'idiot', 'rubbish app'],
    text: "Sorry love, I want to do better for you. Tell me what you need right now, I will try again. I'm not going anywhere.",
    chips: ["I am scared", "My period is late", "How can I feel better right now?"],
  },
  {
    keywords: ["you don't understand", 'you dont understand', "you don't get me", 'you dont get me', "you don't know me"],
    text: "You are right, I want to understand better. Tell me in your own words, I'm listening. No judgement here.",
    chips: ["I am shy", "My period is late", "I had sex, am I pregnant?"],
  },
  {
    keywords: ['what can you do', 'what do you do', 'your job', 'features', 'how can you help', 'can you help me talk to a doctor', 'help me talk to a doctor'],
    text: "I can remember your days late, your pain, your sleep, your mood. I can calm you down, I can prepare your Doctor Report, and I can stay with you when you are scared. Try me. Ask me 'how many days late am I?'",
    chips: ["My period is late", "Build my story for the doctor", "How can I feel better right now?"],
  },
  {
    keywords: ['better than flo', 'are you flo', 'flo app', 'other app'],
    text: "Flo is a calendar. I'm a sister. Flo shows you dates, I remember you. You tell me which one you need at 2am.",
    chips: ["What can you help me with?", "Are you AI?", "How are you"],
  },
  {
    keywords: ['pray for me', 'can you pray', 'say a prayer', 'prayer'],
    text: "Yes. God, please calm this girl's heart. Give her peace tonight. Let her body rest. Let her period come in peace. Amen. I prayed for you, love.",
    chips: ["I am scared", "How can I feel better right now?", "My period is late"],
  },
  {
    keywords: ['i had sex', 'had sex', 'slept with', 'knack', 'i did it', 'intercourse'],
    text: "Thank you for trusting me with that. You are brave for telling me. I'm not here to judge you. I'm here to help you feel calm. When was it?",
    chips: ["I had sex, am I pregnant?", "How do I stay safe if I have sex?", "When should I do pregnancy test?"],
  },
  {
    keywords: ['am i pregnant', 'could i be pregnant', 'am i carrying', 'carry belle', 'am i belle'],
    text: "That question is scary, I know. Let's not guess. How many days late are you? And have you taken a test? We will go step by step together.",
    chips: ["I had sex, am I pregnant?", "When should I do pregnancy test?", "How do I take a test?"],
  },
  {
    keywords: ['can i ask you anything', 'can i ask anything', 'even shameful', 'ask you anything'],
    text: "Yes love, you can ask me anything. Even the shameful ones, even the ones you are scared to say out loud. This is your safe space. No question is too small or too dirty here.",
    chips: ["I am shy", "I had sex, am I pregnant?", "My period is late"],
  },
  {
    keywords: ['bye', 'goodbye', 'i want to go', 'see you', 'i am leaving'],
    text: "Okay love, go and rest. I will be here when you come back. You don't have to start over, I will remember you. Take care of yourself.",
  },
];

// Returns a shield answer if any keyword matches, else null.
export function matchClumsyShield(rawInput: string): { text: string; chips?: string[] } | null {
  const lower = rawInput.toLowerCase().trim();
  if (!lower) return null;

  for (const entry of CLUMSY_SHIELD) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return { text: entry.text, chips: entry.chips };
    }
  }
  return null;
}