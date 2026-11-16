export interface GistData {
  title: string;
  message: string;
  action: string;
  badge: string | null;
}

// --- 1. THE CONTENT LIBRARY ---

const LIBRARY: Record<string, { title: string; message: string; action: string }[]> = {
  // REST GIRL (Bleeding)
  rest: [
    { title: "Why rest is your medicine.", message: "You are bleeding, so your body is working hard and losing energy. When you don't sleep well, your body stays stressed.", action: "Try to be in bed by 10:30 tonight. Just rest." },
    { title: "Why your body feels heavy.", message: "Cramps happen because your uterus is squeezing to shed its lining. A warm cloth on your belly can help relax the muscles.", action: "Put a warm water bottle on your belly for 10 minutes." },
    { title: "Replacing the iron you lost.", message: "Blood carries iron, and losing blood can make you feel tired. Food helps you rebuild it. Dark leafy greens like ugu, or beans, are great choices.", action: "Eat ugu or beans with something sour (like tomato or orange) to help your body absorb the iron." },
    { title: "Why your mood drops.", message: "Your hormones are at their lowest right now. If you feel sad or irritable, it is your body, not your personality.", action: "Give yourself permission to do less today. No guilt." },
    { title: "The bleeding is slowing.", message: "Your body is starting to rebuild. Resting well now helps your energy come back faster.", action: "Put your phone down 30 minutes before you sleep tonight." },
    { title: "Energy returning.", message: "The hardest part is almost over. If you have been resting, your body is thanking you.", action: "Take a slow stretch when you wake up." },
    { title: "The shift.", message: "Bleeding is stopping. Tomorrow, you become Fresh Girl. Your body is ready to wake up.", action: "Do something small that makes you feel clean today." },
  ],

  // FRESH GIRL (Follicular)
  fresh: [
    { title: "Why movement helps.", message: "A gentle walk can ease period aches and lift your mood. You don't need a gym.", action: "Walk to the junction and back today." },
    { title: "Your energy is rising.", message: "Your estrogen is climbing, which is why your mood feels lighter. Movement will help keep that energy steady.", action: "Dance to 3 songs while you do chores today." },
    { title: "Why sitting all day isn't great.", message: "Sitting for too long makes your pelvis tight. Small movements keep your body feeling light.", action: "Stand up and stretch every 2 hours. Reach for the ceiling." },
    { title: "Movement and blood sugar.", message: "A short walk after eating helps your body use sugar better. This keeps your energy stable for the rest of the day.", action: "Walk for 10 minutes after your biggest meal today." },
    { title: "The glow from inside.", message: "Walking gets oxygen flowing to your skin. You might notice your face looks a bit brighter today.", action: "Take a 20-minute walk outside. Breathe deeply." },
    { title: "Building your strength.", message: "Your body is getting ready for your peak phase. Movement now keeps your stamina up.", action: "Do 10 slow squats while waiting for your bath water." },
    { title: "The next step.", message: "Tomorrow, you become Fine Girl. Your body is building up to ovulation.", action: "Wear something you feel beautiful in today." },
  ],

  // FINE GIRL (Ovulation / Peak)
  fine: [
    { title: "Why your cravings are loud.", message: "Your body is burning energy fast. Cravings are not greed, it is just your body asking for fuel.", action: "If you want Indomie, add an egg or vegetables. Don't eat it alone." },
    { title: "The blood sugar swing.", message: "Eating only carbs (like rice or bread) makes your blood sugar spike, then crash. This makes you feel hungrier and tired.", action: "Add protein (beans, fish, chicken) to your plate today to slow the spike." },
    { title: "Why you want sweet things.", message: "Your body wants quick energy. But sugar crashes will make you feel worse later.", action: "Drink a glass of water before you eat anything sweet." },
    { title: "The late-night eating trap.", message: "Eating heavy food after 9pm makes your body work all night instead of resting.", action: "Try to finish your last meal before 9pm tonight." },
    { title: "Food and your skin.", message: "Good food shows on your face. Healthy fats and vitamins keep your skin and hair strong.", action: "Add a handful of nuts or seeds to your snack today." },
    { title: "Why junk food makes you sluggish.", message: "Heavy, fried foods take a lot of energy to digest. This can make you feel sleepy and slow.", action: "Eat one fresh fruit today." },
    { title: "The next step.", message: "Tomorrow, you become Chop Girl. Your body is preparing for the last phase.", action: "Drink one extra bottle of water today." },
  ],

  // CHOP GIRL (Luteal / Pre-menstrual)
  chop: [
    { title: "The slow down.", message: "Your energy is starting to dip as progesterone rises. This is normal. Do not fight it.", action: "Rest when you can today. Don't overwork yourself." },
    { title: "Why you feel bloated.", message: "Water retention is common now. Your body is holding onto fluid because of hormone shifts.", action: "Drink plenty of water today. It actually helps flush the bloat." },
    { title: "The mood shift.", message: "You might feel more irritable or emotional this week. This is your hormones, not your personality.", action: "Take 3 deep breaths before you respond to anything frustrating today." },
    { title: "Cravings and comfort.", message: "You might want more carbs and sweets. This is your body preparing for the energy dip.", action: "If you eat something sweet, pair it with a protein to avoid a crash." },
    { title: "Sleep getting harder.", message: "Progesterone can make you sleepy but also disrupt your sleep. Keep your room cool.", action: "Try to wind down 30 minutes earlier tonight." },
    { title: "Your skin might act up.", message: "Hormone shifts can cause breakouts. Keep your face clean and hydrated.", action: "Wash your face with a gentle cleanser tonight." },
    { title: "The next step.", message: "Tomorrow, you become Ready Girl. Your body is preparing for the final stretch.", action: "Keep a pad in your bag just in case." },
  ],

  // READY GIRL (Pre-menstrual, not late yet)
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
};

// LATE TRACK (When she is actually late)
const LATE_TRACK: { title: string; message: string; action: string }[] = [
  { title: "The most common reason.", message: "If you are sexually active and your period is late, the most common reason is pregnancy. A pharmacy test will give you a clear answer today.", action: "Buy a test or visit a clinic if there is any chance you could be pregnant." },
  { title: "The danger of Dr. Google.", message: "Reading scary things online will only make your heart beat faster. Close the tabs. Your body is not a textbook case.", action: "Drink a warm cup of tea and watch something funny." },
  { title: "Your body is not broken.", message: "Some cycles are just longer. Your body is not punishing you. It is just moving at its own pace. But 10 days late deserves a check.", action: "Do 90 seconds of deep breathing right now." },
  { title: "The safety net.", message: "If you have been late for over a week, or if you have severe pain, heavy bleeding, or a positive test, please see a nurse. Ovi is here for daily care, not medical treatment.", action: "Tell someone you trust or book a clinic visit." },
  { title: "Still waiting.", message: "Your body is taking its time. If you have not seen a doctor yet, a quick check-up can give you peace of mind.", action: "Talk to a nurse today. You deserve answers." },
  { title: "The decision point.", message: "If you have been waiting this long, it is time to get real answers. A doctor can check your hormones and give you clarity.", action: "Book a clinic visit today. You deserve peace of mind." },
];

// --- 2. THE LOGIC ---

// Same boundaries as the home screen
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
  isSexuallyActive: boolean
): GistData {
  
  // 1. Build the Badge
  let badge = `Day ${cycleDay}`;
  if (lateDays > 0) {
    badge = `Day ${cycleDay} • ${lateDays} day${lateDays > 1 ? 's' : ''} late`;
  }

  // 2. If she is late, use the Late Track
  if (lateDays > 0) {
    const i = Math.min(lateDays, LATE_TRACK.length) - 1;
    let content = LATE_TRACK[i];
    
    // If she is NOT sexually active, skip the pregnancy message
    if (i === 0 && !isSexuallyActive) {
      content = LATE_TRACK[1];
    }
    
    return { ...content, badge };
  }

  // 3. If she is not late, use the Phase Library
  const { id, dayInPhase, length } = locatePhase(cycleDay, totalCycleLength);
  const list = LIBRARY[id];
  const content = list[pickIndex(dayInPhase, length, list.length)];

  // 4. Personalization (Food touch)
  let message = content.message;
  if ((id === 'fine' || id === 'chop') && lastFood) {
    message = `I saw you ate ${lastFood} yesterday. ${message}`;
  }

  return {
    title: content.title,
    message: message,
    action: content.action,
    badge: badge
  };
}