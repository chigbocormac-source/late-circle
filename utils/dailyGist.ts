export interface GistData {
  title: string;
  message: string;
  action: string;
  badge: string | null;
  nextGirlPrep?: string;
}

const LIBRARY: Record<number, Record<string, { title: string; message: string; action: string }[]>> = {
  // CYCLE 1: THE FOUNDATION
  1: {
    rest: [
      { title: "Why rest is your medicine.", message: "You are bleeding, so your body is working hard and losing energy. When you don't sleep well, your body stays stressed.", action: "Try to be in bed by 10:30 tonight. Just rest." },
      { title: "Why your body feels heavy.", message: "Cramps happen because your uterus is squeezing to shed its lining. A warm cloth on your belly can help relax the muscles.", action: "Put a warm water bottle on your belly for 10 minutes." },
      { title: "Replacing the iron you lost.", message: "Blood carries iron, and losing blood can make you feel tired. Food helps you rebuild it. Dark leafy greens like ugu, or beans, are great choices.", action: "Eat ugu or beans with something sour (like tomato or orange) to help your body absorb the iron." },
      { title: "Why your mood drops.", message: "Your hormones are at their lowest right now. If you feel sad or irritable, it is your body, not your personality.", action: "Give yourself permission to do less today. No guilt." },
      { title: "The bleeding is slowing.", message: "Your body is starting to rebuild. Resting well now helps your energy come back faster.", action: "Put your phone down 30 minutes before you sleep tonight." },
      { title: "Energy returning.", message: "The hardest part is almost over. If you have been resting, your body is thanking you.", action: "Take a slow stretch when you wake up." },
      { title: "The shift.", message: "Bleeding is stopping. Tomorrow, you become Fresh Girl. Your body is ready to wake up.", action: "Do something small that makes you feel clean today." },
    ],
    fresh: [
      { title: "Why movement helps.", message: "A gentle walk can ease period aches and lift your mood. You don't need a gym.", action: "Walk to the junction and back today." },
      { title: "Your energy is rising.", message: "Your estrogen is climbing, which is why your mood feels lighter. Movement will help keep that energy steady.", action: "Dance to 3 songs while you do chores today." },
      { title: "Why sitting all day isn't great.", message: "Sitting for too long makes your pelvis tight. Small movements keep your body feeling light.", action: "Stand up and stretch every 2 hours. Reach for the ceiling." },
      { title: "Movement and blood sugar.", message: "A short walk after eating helps your body use sugar better. This keeps your energy stable for the rest of the day.", action: "Walk for 10 minutes after your biggest meal today." },
      { title: "The glow from inside.", message: "Walking gets oxygen flowing to your skin. You might notice your face looks a bit brighter today.", action: "Take a 20-minute walk outside. Breathe deeply." },
      { title: "Building your strength.", message: "Your body is getting ready for your peak phase. Movement now keeps your stamina up.", action: "Do 10 slow squats while waiting for your bath water." },
      { title: "The next step.", message: "Tomorrow, you become Fine Girl. Your body is building up to ovulation.", action: "Wear something you feel beautiful in today." },
    ],
    fine: [
      { title: "Why your cravings are loud.", message: "Your body is burning energy fast. Cravings are not greed, it is just your body asking for fuel.", action: "If you want Indomie, add an egg or vegetables. Don't eat it alone." },
      { title: "The blood sugar swing.", message: "Eating only carbs (like rice or bread) makes your blood sugar spike, then crash. This makes you feel hungrier and tired.", action: "Add protein (beans, fish, chicken) to your plate today to slow the spike." },
      { title: "Why you want sweet things.", message: "Your body wants quick energy. But sugar crashes will make you feel worse later.", action: "Drink a glass of water before you eat anything sweet." },
      { title: "The late-night eating trap.", message: "Eating heavy food after 9pm makes your body work all night instead of resting.", action: "Try to finish your last meal before 9pm tonight." },
      { title: "Food and your skin.", message: "Good food shows on your face. Healthy fats and vitamins keep your skin and hair strong.", action: "Add a handful of nuts or seeds to your snack today." },
      { title: "Why junk food makes you sluggish.", message: "Heavy, fried foods take a lot of energy to digest. This can make you feel sleepy and slow.", action: "Eat one fresh fruit today." },
      { title: "The next step.", message: "Tomorrow, you become Chop Girl. Your body is preparing for the last phase.", action: "Drink one extra bottle of water today." },
    ],
    chop: [
      { title: "The slow down.", message: "Your energy is starting to dip as progesterone rises. This is normal. Do not fight it.", action: "Rest when you can today. Don't overwork yourself." },
      { title: "Why you feel bloated.", message: "Water retention is common now. Your body is holding onto fluid because of hormone shifts.", action: "Drink plenty of water today. It actually helps flush the bloat." },
      { title: "The mood shift.", message: "You might feel more irritable or emotional this week. This is your hormones, not your personality.", action: "Take 3 deep breaths before you respond to anything frustrating today." },
      { title: "Cravings and comfort.", message: "You might want more carbs and sweets. This is your body preparing for the energy dip.", action: "If you eat something sweet, pair it with a protein to avoid a crash." },
      { title: "Sleep getting harder.", message: "Progesterone can make you sleepy but also disrupt your sleep. Keep your room cool.", action: "Try to wind down 30 minutes earlier tonight." },
      { title: "Your skin might act up.", message: "Hormone shifts can cause breakouts. Keep your face clean and hydrated.", action: "Wash your face with a gentle cleanser tonight." },
      { title: "The next step.", message: "Tomorrow, you become Ready Girl. Your body is preparing for the final stretch.", action: "Keep a pad in your bag just in case." },
    ],
    ready: [
      { title: "Why waiting feels so heavy.", message: "Your period is close. You might feel tired, moody, or bloated. This is normal.", action: "Check once, then put it down until tomorrow." },
      { title: "Why you are checking your pant.", message: "You are anxious, and that is normal. But checking every hour will only make you feel more stressed.", action: "Set a timer. Only check every 4 hours. Trust your body." },
      { title: "Sleep and your hormones.", message: "When you don't sleep well, your body stays in a state of stress, which can make your cycle take longer.", action: "Put your phone on Do Not Disturb at 10pm." },
      { title: "Why your breasts hurt.", message: "Your hormone levels are shifting. This is why you feel bloated and tender. It is common before a period and can also be an early pregnancy sign.", action: "Wear a comfortable bra. Do not put pressure on your body." },
      { title: "It is not your fault.", message: "A late period does not mean you are sick. It means your body is taking a little longer. It is not because you worried too much.", action: "Write down one thing you are grateful for today." },
      { title: "Releasing the tension.", message: "When you hold your shoulders tight, your whole body feels heavy. Let them drop.", action: "Roll your shoulders back 5 times and take a deep breath." },
      { title: "Your body is doing its work.", message: "Trust your body. It knows what to do. You are safe.", action: "Do 90 seconds of deep breathing right now." },
      { title: "Checking your calendar.", message: "Look at your last period date. Are you actually late, or just on time?", action: "Log your period today if it came." },
    ],
  },

  // CYCLE 2: THE DEEP DIVE
  2: {
    rest: [
      { title: "Your body remembers.", message: "Last month, you learned to rest. This month, notice if your cramps are better or worse than last time.", action: "Write down how your pain feels today." },
      { title: "The iron pattern.", message: "If you felt dizzy last month, your iron might still be low. Your body needs time to rebuild it fully.", action: "Eat a dark green vegetable today." },
      { title: "Your mood and your hormones.", message: "Your estrogen is dropping. This is why you might feel tearful. It is not your personality.", action: "Be extra gentle with yourself today." },
      { title: "The sleep connection.", message: "Sleep is not just rest. It is when your body repairs your uterus. Protect your sleep this week.", action: "Aim for 7 hours tonight." },
      { title: "The slowing tide.", message: "As bleeding stops, your estrogen starts to rise again. This is the start of your energy coming back.", action: "Notice if you feel a little lighter today." },
      { title: "The rebuild.", message: "Your body has done this before. It knows how to recover. Trust the process.", action: "Do one small thing that brings you joy." },
      { title: "A new cycle.", message: "You are entering Fresh Girl again. This is your chance to build on last month's lessons.", action: "Set one small goal for this week." },
    ],
    fresh: [
      { title: "The estrogen rise.", message: "Your estrogen is climbing. This is what makes you feel more social and confident. Use it today.", action: "Reach out to a friend today." },
      { title: "Movement and your mood.", message: "Last month, walking helped. This month, try walking in the morning to wake up your brain.", action: "Take a 15-minute morning walk." },
      { title: "Why your skin is glowing.", message: "Estrogen improves skin hydration. This is why you might look brighter this week.", action: "Drink an extra glass of water today." },
      { title: "The sitting trap.", message: "If you sit for more than 2 hours, your pelvis gets stiff. Set a timer to stand up.", action: "Stretch your arms above your head every 2 hours." },
      { title: "Energy and blood sugar.", message: "Your body is more sensitive to insulin now. Eating protein with your carbs will keep you steady.", action: "Add an egg or fish to your meal today." },
      { title: "The stamina build.", message: "Your body is getting stronger for ovulation. Movement now helps reduce future cramps.", action: "Do a small dance or walk today." },
      { title: "The transition to peak.", message: "Tomorrow, you become Fine Girl. This is your highest energy phase. Prepare to enjoy it.", action: "Plan something fun for tomorrow." },
    ],
    fine: [
      { title: "Your ovulation window.", message: "This is the week your body releases an egg. It is a short window, but it is your peak.", action: "Notice the changes in your body today." },
      { title: "The craving trap.", message: "Your metabolism is faster now, but you still need protein. Don't just eat carbs.", action: "Eat a protein snack today." },
      { title: "Social energy.", message: "You may feel more social this week. This is normal. Enjoy it, but protect your sleep.", action: "Say yes to something fun today." },
      { title: "The insulin connection.", message: "High insulin can disrupt ovulation. Eating balanced meals is important this week.", action: "Pair every carb with a protein today." },
      { title: "Your body's signal.", message: "Ovulation can cause a small twinge on one side. This is normal. It is just your body working.", action: "Note if you feel any twinges today." },
      { title: "The energy peak.", message: "You are at your strongest today. Use this energy for something you have been putting off.", action: "Do the task you have been delaying." },
      { title: "The descent.", message: "Tomorrow, you become Chop Girl. Your energy will start to dip. This is normal.", action: "Plan a quiet evening for tomorrow." },
    ],
    chop: [
      { title: "Progesterone rises.", message: "This is the hormone that prepares your uterus. It can make you feel sleepy and slower.", action: "Take a 10-minute nap if you can." },
      { title: "The bloat factor.", message: "Progesterone makes your body hold water. It is not fat. It is just fluid.", action: "Drink water and eat a banana today." },
      { title: "The mood shift.", message: "This is the week you might feel more sensitive. It is not your fault. It is your hormones.", action: "Avoid triggers today if you can." },
      { title: "Carb cravings.", message: "Your body wants quick energy. But sugar crashes will make you feel worse.", action: "Eat a small piece of fruit with nuts today." },
      { title: "Sleep disruption.", message: "Progesterone can make you wake up at night. Keep your room cool and dark.", action: "Put your phone away 30 minutes before bed." },
      { title: "The skin shift.", message: "Breakouts are common here. Keep your skin clean but don't over-wash it.", action: "Use a gentle cleanser tonight." },
      { title: "The final stretch.", message: "Tomorrow, you become Ready Girl. Your body is preparing for your period.", action: "Keep a pad in your bag." },
    ],
    ready: [
      { title: "The waiting game.", message: "Your period is close. The waiting can make you anxious. Try to distract yourself today.", action: "Do one thing you enjoy today." },
      { title: "The checking habit.", message: "You may want to check your pant every hour. This will only make you more anxious.", action: "Set a timer. Only check every 4 hours." },
      { title: "Sleep and stress.", message: "If you don't sleep, your body stays in stress mode. This can make your period late.", action: "Go to bed 30 minutes earlier tonight." },
      { title: "Your breasts.", message: "Tenderness is common here. It is your body responding to hormone shifts.", action: "Wear a soft bra today." },
      { title: "The self-blame trap.", message: "You did not cause this. Your body is just taking its time. It is not your fault.", action: "Speak kindly to yourself today." },
      { title: "The waiting tension.", message: "Your shoulders might be tight from waiting. Drop them and breathe.", action: "Roll your shoulders 5 times." },
      { title: "Trust your body.", message: "Your body has done this before. It knows what to do. You are safe.", action: "Do 90 seconds of deep breathing." },
      { title: "The calendar check.", message: "Look at your last period date. Are you actually late, or just on time?", action: "Log your period today if it came." },
    ],
  },

  // CYCLE 3: THE MASTERY
  3: {
    rest: [
      { title: "Your body knows.", message: "You have been doing this for 3 months. Your body has a pattern now. Notice it.", action: "Write down one thing you learned about your body." },
      { title: "The iron rebuild.", message: "If you have been eating iron-rich foods, you should feel less tired this month. Keep going.", action: "Eat a food rich in iron today." },
      { title: "The emotional wave.", message: "Your mood drops every month around this time. This is predictable. Prepare for it.", action: "Plan a quiet day today." },
      { title: "The sleep habit.", message: "You have been sleeping earlier for 3 months. This is now a habit. Your body thanks you.", action: "Go to bed by 10:30 tonight." },
      { title: "The recovery.", message: "Your body is recovering faster now because you have been resting well. Keep it up.", action: "Rest when you feel tired today." },
      { title: "The power of rest.", message: "Rest is not lazy. It is medicine. You have proven this to yourself over 3 months.", action: "Do nothing for 10 minutes today." },
      { title: "The next phase.", message: "Tomorrow, you become Fresh Girl. You are ready for a new cycle.", action: "Celebrate your progress today." },
    ],
    fresh: [
      { title: "Your rising energy.", message: "Your energy is returning. You know this feeling by now. Use it to build your strength.", action: "Take a 20-minute walk today." },
      { title: "The movement habit.", message: "You have been moving more for 3 months. Your body is stronger. Keep it up.", action: "Do 10 squats today." },
      { title: "The estrogen glow.", message: "Your skin is likely brighter this week. This is your body responding to estrogen.", action: "Take a photo of your skin today." },
      { title: "The sugar balance.", message: "You know now that protein with carbs keeps you steady. Keep doing it.", action: "Eat a protein-rich breakfast." },
      { title: "The stamina.", message: "Your stamina is building. You can do more today than you could 3 months ago.", action: "Do one extra thing today." },
      { title: "The confidence.", message: "This is your peak confidence phase. Trust yourself. You have earned it.", action: "Say one kind thing to yourself." },
      { title: "The next step.", message: "Tomorrow, you become Fine Girl. Your peak is coming. Prepare for it.", action: "Plan something fun for tomorrow." },
    ],
    fine: [
      { title: "The ovulation peak.", message: "You are at your most fertile and confident. This is your highest energy phase. Enjoy it.", action: "Do something you love today." },
      { title: "The craving control.", message: "You know now that cravings are not greed. They are your body asking for fuel. Eat well today.", action: "Eat a balanced plate today." },
      { title: "The social energy.", message: "You are naturally more social now. Use this to connect with people you love.", action: "Call a friend today." },
      { title: "The insulin sensitivity.", message: "Your body is sensitive to insulin this week. Protein is your friend.", action: "Pair your meals with protein today." },
      { title: "The glow.", message: "Your skin is glowing because of your hormones. This is your body's natural beauty.", action: "Skip makeup today if you can." },
      { title: "The energy high.", message: "This is your strongest day. Use this energy for something important.", action: "Do the hard task you have been avoiding." },
      { title: "The slow down.", message: "Tomorrow, you become Chop Girl. Your energy will drop. That is normal.", action: "Plan a quiet evening for tomorrow." },
    ],
    chop: [
      { title: "The progesterone rise.", message: "Your body is preparing for your period. Progesterone is rising. This is why you feel slower.", action: "Rest when you need to today." },
      { title: "The bloat reality.", message: "You know now that bloat is just water. It is not fat. Don't let it upset you.", action: "Drink water and wear comfortable clothes." },
      { title: "The emotional wave.", message: "You know this week is emotionally hard. It is your hormones, not your life.", action: "Write down your feelings today." },
      { title: "The carb craving.", message: "You know now that carb cravings are normal here. Eat a balanced meal instead of a snack.", action: "Eat a real meal before snacking." },
      { title: "The sleep struggle.", message: "Progesterone can wake you up. Prepare for this. Make your room cool and dark.", action: "Go to bed 30 minutes earlier." },
      { title: "The skin check.", message: "You know breakouts are common now. Keep your routine simple.", action: "Wash your face tonight." },
      { title: "The final countdown.", message: "Tomorrow, you become Ready Girl. Your period is close. Prepare yourself.", action: "Keep a pad in your bag." },
    ],
    ready: [
      { title: "The waiting game.", message: "You know this feeling by now. The waiting makes you anxious. Try to distract yourself.", action: "Do one thing you enjoy today." },
      { title: "The checking habit.", message: "You know checking every hour doesn't help. Trust your body.", action: "Set a timer. Only check every 4 hours." },
      { title: "The sleep stress.", message: "You know sleep makes a difference. Protect it this week.", action: "Go to bed 30 minutes earlier tonight." },
      { title: "The breast tenderness.", message: "You know this is normal. Your body is responding to hormones.", action: "Wear a comfortable bra today." },
      { title: "The self-blame.", message: "You know it is not your fault. Your body is just doing its job.", action: "Be kind to yourself today." },
      { title: "The tension release.", message: "You know how to calm down now. You have done it before.", action: "Do 90 seconds of deep breathing." },
      { title: "The trust.", message: "You have been tracking for 3 months. You know your body better now than ever.", action: "Write down one thing you have learned about yourself." },
      { title: "The next cycle.", message: "If your period came, log it. If not, keep tracking. You are doing great.", action: "Log your period today if it came." },
    ],
  },
};

// LATE TRACK - CALM + CLEAR
const LATE_TRACK: { title: string; message: string; action: string; recommendation?: string }[] = [
  {
    title: "Still waiting with you.",
    message: "Your cycle is taking longer than your pattern. That happens sometimes. It does not mean your body is broken. We will watch it together, one day at a time.",
    action: "Tonight: Drink water slowly. Eat something warm. Bed by 10:30."
  },
  {
    title: "Close the scary tabs.",
    message: "Reading scary things online will only make your heart beat faster. Close the tabs. Your body is not a textbook case. You are a real girl with a real pattern.",
    action: "Drink a warm cup of tea and watch something funny."
  },
  {
    title: "Your body is not punishing you.",
    message: "A late period does not mean you are sick. It does not mean you worried too much. Stress, travel, illness, and changes in weight can all make a cycle longer.",
    action: "Do 90 seconds of deep breathing right now."
  },
  {
    title: "If pregnancy is possible.",
    message: "A home test from today can give you a clear answer. If it's negative but your period still doesn't come, you can test again in a few days. No rush tonight.",
    action: "When you feel ready, a test can help."
  },
  {
    title: "A quiet note about care.",
    message: "If you want peace of mind, a quick check-up can help. No pressure. You can also wait a few more days and see. Ovi is here to keep your records clear.",
    action: "I have heard you, Ovi 💜"
  },
  {
    title: "Still waiting.",
    message: "You are still waiting. That is hard. If you have not talked to a nurse yet and you want answers, we can prepare your Health Summary together so you don't have to explain everything from scratch.",
    action: "When you are ready, we can prepare it together."
  },
];

const BOUNDS: [string, number][] = [['rest', 0.15], ['fresh', 0.35], ['fine', 0.60], ['chop', 0.80], ['ready', 1.0]];

function locatePhase(cycleDay: number, cycleLength: number) {
  const p = cycleDay / cycleLength;
  let prev = 0;
  for (const [id, end] of BOUNDS) {
    if (p <= end || id === 'ready') {
      const start = Math.floor(prev * cycleLength) + 1;
      const last = Math.floor(end * cycleLength);
      return { 
        id, 
        dayInPhase: Math.max(1, cycleDay - start + 1), 
        length: last - start + 1 
      };
    }
    prev = end;
  }
  return { id: 'rest', dayInPhase: 1, length: 5 };
}

function pickIndex(dayInPhase: number, phaseLength: number, count: number) {
  if (dayInPhase >= phaseLength) return count - 1;
  return Math.min(dayInPhase - 1, count - 2);
}

export function getDailyGist(
  cycleDay: number, 
  totalCycleLength: number, 
  lateDays: number, 
  tags: string[], 
  lastFood: string | null,
  isSexuallyActive: boolean,
  cycleCount: number
): GistData {
  
  let badge = `Day ${cycleDay}`;
  
  if (lateDays > 0) {
    badge = `Day ${cycleDay} • Waiting with you`;
    
    const i = Math.min(lateDays, LATE_TRACK.length) - 1;
    let content = LATE_TRACK[i];
    
    if (i === 0 && !isSexuallyActive) content = LATE_TRACK[1];
    
    return { ...content, badge };
  }

  const { id, dayInPhase, length } = locatePhase(cycleDay, totalCycleLength);
  
  const cycleLibrary = LIBRARY[Math.min(cycleCount, 3)] || LIBRARY[1];
  const list = cycleLibrary[id];
  const content = list[pickIndex(dayInPhase, length, list.length)];

  let message = content.message;
  let nextGirlPrep = undefined;

  // THE PREP FOR TOMORROW (The Hook)
  // This text shows up in the "Tomorrow" card on the Today page
  if (id === 'rest') {
    nextGirlPrep = "Tomorrow you will feel lighter. Take a short walk to the junction and back. Eat something with protein, like egg or beans, so your energy stays steady.";
  }
  if (id === 'fresh') {
    nextGirlPrep = "Tomorrow your energy will go up. Wear something you feel beautiful in. If you eat rice tomorrow, add chicken or fish, so you don't crash after.";
  }
  if (id === 'fine') {
    nextGirlPrep = "Tomorrow you will feel hungry. That is your body asking for fuel. If you want Indomie, add egg and vegetables. Don't eat it alone. Drink water before you eat anything sweet.";
  }
  if (id === 'chop') {
    nextGirlPrep = "Tomorrow your body will slow down. Plan a quiet evening. Keep a pad in your bag. Eat warm soup tomorrow, like pepper soup or eba with egusi, and go to bed early.";
  }
  if (id === 'ready') {
    nextGirlPrep = "Your period might come tomorrow. Rest well tonight. Keep a pad in your bag. Eat something warm, like pap and akara or rice and stew, and sleep early. Don't stress yourself.";
  }

  return {
    title: content.title,
    message: message,
    action: content.action,
    badge: badge,
    nextGirlPrep: nextGirlPrep
  };
}