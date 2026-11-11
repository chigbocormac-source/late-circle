// utils/claimCopy.ts

export type ClaimCopy = {
  button: string;
  subtext: string;
  claimedButton: string;
  claimedSub: string;
  step1Title: string;
  step1Sub1: string;
  step1Sub2: string;
  step2Title: string;
  step2Sub: string;
  step3Title: string;
  step3Sub: string;
};

// ============================================================
// 14-day progressive copy (Hope → Trust → Surrender → Still Here)
// ============================================================

const claimDays: ClaimCopy[] = [
  // Day 1
  {
    button: "I claim it 🤍",
    subtext: "It's on its way to you, Fine Girl.",
    claimedButton: "Claimed Today ✨",
    claimedSub: "It's on its way to you, Fine Girl.",
    step1Title: "Claimed, Fine Girl. ✨",
    step1Sub1: "I have it now. You just started, and I am already with you.",
    step1Sub2: "",
    step2Title: "Now give the worry to me.",
    step2Sub: "I will carry it for you today, Fine Girl.",
    step3Title: "You are held.",
    step3Sub: "Rest now. Let it come.",
  },
  // Day 2
  {
    button: "I will let it come 🤍",
    subtext: "Your body heard you too.",
    claimedButton: "Claimed Today ✨",
    claimedSub: "Let's give your body room.",
    step1Title: "Claimed, Fine Girl. ✨",
    step1Sub1: "I heard you. I will hold it while your body does its work.",
    step1Sub2: "",
    step2Title: "Breathe with me.",
    step2Sub: "Let me hold the waiting for you.",
    step3Title: "You are held.",
    step3Sub: "Rest now. It is coming.",
  },
  // Day 3
  {
    button: "I am still trusting 🤍",
    subtext: "3 days is not failure.",
    claimedButton: "Claimed Today ✨",
    claimedSub: "Your body is preparing.",
    step1Title: "Claimed, Fine Girl. ✨",
    step1Sub1: "It's still on its way. You can put this worry down for today.",
    step1Sub2: "",
    step2Title: "Breathe with me.",
    step2Sub: "Your body knows what it is doing.",
    step3Title: "You are held.",
    step3Sub: "Rest now.",
  },
  // Day 4
  {
    button: "I trust my body 🤍",
    subtext: "It has done this before.",
    claimedButton: "Claimed Today ✨",
    claimedSub: "Your body remembers.",
    step1Title: "Claimed, Fine Girl. ✨",
    step1Sub1: "Your body heard you too. I will keep this worry safe for you.",
    step1Sub2: "",
    step2Title: "Breathe with me.",
    step2Sub: "Trust your body. It is working.",
    step3Title: "You are held.",
    step3Sub: "Rest now.",
  },
  // Day 5
  {
    button: "Take this worry from me 🤍",
    subtext: "Worry won't bring it.",
    claimedButton: "Claimed Today ✨",
    claimedSub: "Rest will help.",
    step1Title: "Claimed, Fine Girl. ✨",
    step1Sub1: "You don't have to worry it into coming anymore. I have it now.",
    step1Sub2: "",
    step2Title: "Breathe. Release.",
    step2Sub: "Let me carry the worry today.",
    step3Title: "You are held.",
    step3Sub: "Rest now.",
  },
  // Day 6
  {
    button: "I have done enough today 🤍",
    subtext: "You showed up.",
    claimedButton: "Claimed Today ✨",
    claimedSub: "That is enough.",
    step1Title: "Claimed, Fine Girl. ✨",
    step1Sub1: "You did enough today. I will carry the rest.",
    step1Sub2: "",
    step2Title: "Rest now.",
    step2Sub: "You have done enough.",
    step3Title: "You are held.",
    step3Sub: "Close your eyes.",
  },
  // Day 7
  {
    button: "I am not behind 🤍",
    subtext: "You are still on time for you.",
    claimedButton: "Claimed Today ✨",
    claimedSub: "Still on time for you.",
    step1Title: "Claimed, Fine Girl. ✨",
    step1Sub1: "You are not behind. I am not going anywhere.",
    step1Sub2: "",
    step2Title: "Let it go.",
    step2Sub: "Let me hold the waiting today.",
    step3Title: "You are held.",
    step3Sub: "Rest now.",
  },
  // Day 8
  {
    button: "Ovi, carry it for me 🤍",
    subtext: "You have held it long enough.",
    claimedButton: "Claimed Today ✨",
    claimedSub: "Let Ovi carry it.",
    step1Title: "Claimed, Fine Girl. ✨",
    step1Sub1: "I have it. You can let go for today.",
    step1Sub2: "",
    step2Title: "Give it to me.",
    step2Sub: "I will carry it, Fine Girl.",
    step3Title: "You are held.",
    step3Sub: "Rest now.",
  },
  // Day 9
  {
    button: "I breathe, I release 🤍",
    subtext: "Just breathe.",
    claimedButton: "Claimed Today ✨",
    claimedSub: "Just breathe.",
    step1Title: "Claimed, Fine Girl. ✨",
    step1Sub1: "Breathe. I am holding this for you.",
    step1Sub2: "",
    step2Title: "Breathe with me.",
    step2Sub: "In. Out. Rest.",
    step3Title: "You are held.",
    step3Sub: "Let it come.",
  },
  // Day 10
  {
    button: "I am still held 🤍",
    subtext: "Something is moving inside.",
    claimedButton: "Claimed Today ✨",
    claimedSub: "Something is moving.",
    step1Title: "Claimed, Fine Girl. ✨",
    step1Sub1: "You are still held. Even now.",
    step1Sub2: "",
    step2Title: "Breathe with me.",
    step2Sub: "Let me hold you.",
    step3Title: "You are held.",
    step3Sub: "Rest now.",
  },
  // Day 11
  {
    button: "Stay with me 🤍",
    subtext: "You don't have to carry this alone.",
    claimedButton: "Claimed Today ✨",
    claimedSub: "Ovi is here.",
    step1Title: "Claimed, Fine Girl. ✨",
    step1Sub1: "I am still here. You are not carrying this alone anymore.",
    step1Sub2: "",
    step2Title: "Breathe with me.",
    step2Sub: "I am not leaving.",
    step3Title: "You are held.",
    step3Sub: "Rest now.",
  },
  // Day 12
  {
    button: "My body is for me 🤍",
    subtext: "It's protecting you.",
    claimedButton: "Claimed Today ✨",
    claimedSub: "It's preparing you.",
    step1Title: "Claimed, Fine Girl. ✨",
    step1Sub1: "Your body is for you. I will remind you of that when you forget.",
    step1Sub2: "",
    step2Title: "Breathe with me.",
    step2Sub: "Your body loves you.",
    step3Title: "You are held.",
    step3Sub: "Rest now.",
  },
  // Day 13
  {
    button: "One more day, together 🤍",
    subtext: "Almost there.",
    claimedButton: "Claimed Today ✨",
    claimedSub: "One more day.",
    step1Title: "Claimed, Fine Girl. ✨",
    step1Sub1: "One more day, together. I have you.",
    step1Sub2: "",
    step2Title: "Breathe with me.",
    step2Sub: "One more day.",
    step3Title: "You are held.",
    step3Sub: "Rest now.",
  },
  // Day 14
  {
    button: "I release it all 🤍",
    subtext: "Rest. Let it come.",
    claimedButton: "Claimed Today ✨",
    claimedSub: "Let it come to meet you.",
    step1Title: "Claimed, Fine Girl. ✨",
    step1Sub1: "It's done. You can rest now. I will stay until it comes.",
    step1Sub2: "",
    step2Title: "Breathe with me.",
    step2Sub: "It is coming.",
    step3Title: "You are held.",
    step3Sub: "Let it come.",
  },
];

// Fallback for day 15+
const day14plus: ClaimCopy = {
  button: "Ovi is still holding you 🤍",
  subtext: "You are not alone in this.",
  claimedButton: "Claimed Today ✨",
  claimedSub: "Ovi is still holding you.",
  step1Title: "Claimed, Fine Girl. ✨",
  step1Sub1: "Still here with you. I know this wait has gone on long. You are not alone.",
  step1Sub2: "",
  step2Title: "Breathe with me.",
  step2Sub: "Let me hold you.",
  step3Title: "You are held.",
  step3Sub: "Rest now.",
};

// ============================================================
// Main getter — picks the right copy for the right late day
// ============================================================

export function getClaimCopy(lateDays: number): ClaimCopy {
  if (lateDays < 1) return claimDays[0];
  if (lateDays >= 15) return day14plus;
  return claimDays[lateDays - 1];
}

// Legacy export
export const CLAIM_COPY = {
  day1to6: claimDays[0],
  day7to13: claimDays[6],
  day14plus: day14plus,
};