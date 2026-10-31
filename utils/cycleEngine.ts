export type PhaseId = 'rest' | 'fresh' | 'fine' | 'chop' | 'ready';

export function getCyclePhase(day: number, average: number = 35) {
  if (day <= 5) return { id: 'rest', name: 'Rest Girl', emoji: '🌙', color: '#9CAF88', focus: ['sleep', 'walk'] };
  if (day <= 12) return { id: 'fresh', name: 'Fresh Girl', emoji: '🌱', color: '#9CAF88', focus: ['walk', 'food'] };
  if (day <= 23) return { id: 'fine', name: 'Fine Girl', emoji: '✨', color: '#D4AF37', focus: ['food', 'walk', 'sleep', 'calm'] };
  if (day <= 30) return { id: 'chop', name: 'Chop Girl', emoji: '🍚', color: '#FF8FA3', focus: ['food', 'calm', 'walk'] };
  return { id: 'ready', name: 'Ready Girl', emoji: '💜', color: '#8A2C3E', focus: ['sleep', 'calm', 'food'] };
}

export const oviWelcome: Record<PhaseId, string> = {
  rest: "Day 3. Tired small? That's normal. Warm water and early sleep. You are doing well, Ovi girl 💜",
  fresh: "Day 8. Energy coming back? Good. Try walk small to the junction today. No gym wear needed 💚",
  fine: "Day 20. Fine girl era ✨ High energy today. Good day to take a picture, do assignment, talk to people. Post that selfie, Ovi girl!",
  chop: "Day 28. You will want 2 plates of rice and snap at anyone who talks to you. Na hormone, not you. Eat rice + beans. Walk small 😂",
  ready: "Day 33. Tired and want to be alone? Pad in bag from today. Your pattern says period near. You are safe, Ovi girl 💜"
};

export const oviGists: Record<PhaseId, Record<string, string>> = {
  rest: {
    food: "No appetite today? It's normal. Keep small plate. If you want indomie, make it small and add 2 eggs and small cabbage. Or small rice, stew, protein and vegetables is enough.",
    walk: "Your waist is paining you, I know. Lying down all day makes cramp worse. Walk small to the junction and back. It helps blood flow and pain will reduce tomorrow.",
    sleep: "Your body is tired today. Try to be in bed by 10:30pm. Warm water and early sleep will help.",
    calm: "Pain is making you quiet. Close your eyes for 90 seconds. Breathe in, breathe out. Tell yourself, this will pass."
  },
  fresh: {
    food: "Your appetite is back. Keep your favourite food, just add protein and vegetables. Rice? Add stew, fish and carrot. Indomie? Add egg and cabbage.",
    walk: "Your strength is coming back small small. Walk for 20 minutes or dance to 3 songs. Keep your streak.",
    sleep: "Sleep early tonight so this fresh energy stays. Don't stay on your phone till late.",
    calm: "Your head is clearer now. Do 90 seconds calm to start the week well."
  },
  fine: {
    food: "This is fine girl week. Keep what you like to eat, add protein and vegetables so it shows on your skin. Balanced plate today is Green.",
    walk: "You have energy now. Use it. Walk, do that thing you postponed, take a picture. You are glowing.",
    sleep: "Sleep early to keep this glow. Don't spoil it with late night scrolling.",
    calm: "Even fine girls need small pause. Do 90 seconds calm to keep your mind clear."
  },
  chop: {
    food: "You want to eat a lot today, even garri, indomie and sugary things. It's your hormones, not you. Keep your garri but make it small, add groundnut or fish. Keep your indomie but add 2 eggs and cabbage inside. Don't eat it alone. Eat your protein and vegetables first, then small portion of the main food. You will stay full and your sugar will not rush.",
    walk: "You have eaten plenty today? Walk small for 20 minutes after food. It will help your body digest and your belly will be better tomorrow morning.",
    sleep: "If you eat late and sleep late, your belly will bloat tomorrow. Try to close food before 9pm.",
    calm: "You want to snap at someone today. Small things are making you angry. Before you reply that message, do 90 seconds calm. Breathe in, breathe out. You will not regret it later."
  },
  ready: {
    food: "That bloat is not fat. It's gas from late food and hormone change. Keep your eba, rice or bread but make it small. Add plenty soup, fish and vegetables. Small eba with plenty soup is better than plenty eba with small soup. Close food before 9pm. By morning, your stomach will go down.",
    walk: "You are tired and just want to sit down. I understand. Even small movement counts. Sweep, climb stairs, walk to the shop. Small is better than nothing.",
    sleep: "Small things can make you angry or want to cry today. Sleep before 10:30pm tonight. Early sleep helps your face stay calm and pimples will reduce tomorrow.",
    calm: "You want ice cream, gifts, petting, sweet names today. You want to be soft and pampered. It's normal. Your hormones are making you want love. Do 90 seconds calm. Breathe in, breathe out. Tell yourself, I am loved and this week will pass. Tell your person you need small petting today."
  }
};