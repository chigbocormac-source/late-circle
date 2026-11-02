export type PhaseId = 'rest' | 'fresh' | 'fine' | 'chop' | 'ready';

export function getCyclePhase(day: number, average: number = 35) {
  if (day <= 5) return { id: 'rest' as PhaseId, name: 'Rest Girl', emoji: '🌙', color: '#9CAF88', focus: ['sleep', 'walk'] };
  if (day <= 12) return { id: 'fresh' as PhaseId, name: 'Fresh Girl', emoji: '🌱', color: '#9CAF88', focus: ['walk', 'food'] };
  if (day <= 23) return { id: 'fine' as PhaseId, name: 'Fine Girl', emoji: '✨', color: '#D4AF37', focus: ['food', 'walk', 'sleep', 'calm'] };
  if (day <= 30) return { id: 'chop' as PhaseId, name: 'Chop Girl', emoji: '🍚', color: '#FF8FA3', focus: ['food', 'calm', 'walk'] };
  return { id: 'ready' as PhaseId, name: 'Ready Girl', emoji: '💜', color: '#8A2C3E', focus: ['sleep', 'calm', 'food'] };
}

export const oviWelcome: Record<PhaseId, string> = {
  rest: "You are in your Rest phase. Your womb is shedding its lining, so your energy is naturally low right now. Don't force yourself to do too much. Focus on Sleep + Calm today. You are doing well 💜",
  
  fresh: "You are in your Fresh phase. Estrogen is rising, and your body is rebuilding. Your energy is coming back! This is a great time to move a little. Focus on Walk + Food today 🌱",
  
  fine: "You are in your Fine phase. You are ovulating, which means your energy and confidence are at their peak. Your skin is glowing. Use this energy for your work or take that picture. You can close all 4 today ✨",
  
  chop: "You are in your Chop phase. Progesterone is rising, which makes your body crave extra energy and makes you feel more emotional. It's just hormones, not you. If you want more food, add protein to your plate. Focus on Food + Calm + Walk today 🍚",
  
  ready: "You are in your Ready phase. Progesterone is dropping, which is why you feel tired, bloated, or moody. Your period is near. Keep a pad in your bag and be gentle with yourself. Focus on Sleep + Calm today 💜"
};

export const oviGists: Record<PhaseId, Record<string, string>> = {
  rest: {
    food: "No appetite? It's normal. Keep small plate. Indomie? Add 2 eggs and cabbage.",
    walk: "Waist paining you? Lying down makes it worse. Walk small to the junction. It helps blood flow.",
    sleep: "Body is tired. In bed by 10:30pm. Warm water and early sleep.",
    calm: "Close your eyes for 90 seconds. Breathe in, out. Tell yourself, this will pass."
  },
  fresh: {
    food: "Appetite is back. Keep your food, add protein and vegetables. Rice? Add fish and carrot.",
    walk: "Strength is coming back. Walk 20 minutes or dance to 3 songs.",
    sleep: "Sleep early tonight so this energy stays. Don't scroll till late.",
    calm: "Head is clearer now. Do 90 seconds calm to keep the week smooth."
  },
  fine: {
    food: "Fine girl week. Keep what you like, add protein and veg so it shows on your skin.",
    walk: "You have energy. Use it. Walk, take a picture. You are glowing.",
    sleep: "Sleep early to keep this glow. Don't spoil it with late scrolling.",
    calm: "Even fine girls need small pause. 90 seconds to keep your mind clear."
  },
  chop: {
    food: "You want to eat plenty today. Make your plate smaller. Add enough protein or veggies if you can. Just don't overeat, so you don't feel heavy later.",
    walk: "Eaten plenty? Walk 20 minutes after food. It helps digestion and your belly.",
    sleep: "If you eat late and sleep late, your belly will bloat tomorrow. Close food before 9pm.",
    calm: "Want to snap at someone? Take 90 seconds. Breathe in, out. You will not regret it."
  },
  ready: {
    food: "Bloat is gas, not fat. Keep eba/rice small. Add plenty soup and vegetables. Close food before 9pm.",
    walk: "Tired and want to sit? Even small movement counts. Sweep, climb stairs.",
    sleep: "Small things making you cry? Sleep before 10:30pm. Early sleep helps your skin calm down.",
    calm: "Want ice cream or petting today? It's hormones. Do 90 secs calm. Tell your person you need a soft hug."
  }
};