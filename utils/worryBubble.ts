// utils/worryBubble.ts

// Maps how she feels (from Cycle page tags) to her real, unspoken worry.
// This is the moment Ovi proves he sees her.

export type LateWorry = {
  worry: string;       // the bubble text
  oviRelease: string;  // what Ovi says after she lets it go
};

const worryMap: Record<string, LateWorry> = {
  emotional: {
    worry: "What if my body is failing me?",
    oviRelease: "I have it now. Your body is not failing you. It is just taking its time.",
  },
  bloat: {
    worry: "What if something is wrong with me?",
    oviRelease: "I have it now. Nothing is wrong with you. You are not broken.",
  },
  cramps: {
    worry: "What if something is wrong with me?",
    oviRelease: "I have it now. Nothing is wrong with you. Your body is working.",
  },
  "waist pain": {
    worry: "What if something is wrong with me?",
    oviRelease: "I have it now. Your pain is real, but you are safe. I am holding you.",
  },
  tired: {
    worry: "What if I am doing too much to my body?",
    oviRelease: "I have it now. You do not need to do more. Rest is enough.",
  },
  stress: {
    worry: "What if I am doing too much to my body?",
    oviRelease: "I have it now. Let me carry the weight today. You can breathe.",
  },
  cravings: {
    worry: "What if my body is out of control?",
    oviRelease: "I have it now. Your body is not out of control. It is asking for care.",
  },
  acne: {
    worry: "What if my body is fighting me?",
    oviRelease: "I have it now. Your body is not against you. It is doing its best.",
  },
};

const defaultWorry: LateWorry = {
  worry: "What if it never comes?",
  oviRelease: "I have it now. You don't need to carry it again. It is on its way.",
};

export function getWorryForTags(tags: string[]): LateWorry {
  if (!tags || tags.length === 0) return defaultWorry;
  // Pick the first tag we recognize
  for (const tag of tags) {
    const key = tag.toLowerCase().trim();
    if (worryMap[key]) return worryMap[key];
  }
  return defaultWorry;
}