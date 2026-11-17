export const OVI_KNOWLEDGE: Record<string, { text: string; chips: string[] }> = {
  // ============================================================
  // GROUP 4: PREGNANCY FEAR
  // ============================================================
  'I had sex, am I pregnant?': {
    text: "Love, breathe first. I am here.\n\nYou can only get pregnant if sex happened around your Ovulation days. Not every sex leads to pregnancy.\n\nTell me, do you know when your last period started? I will help you check if it was a risky day.",
    chips: ["Yes, I know the date", "No, I don't remember"]
  },
  'I missed my period, am I pregnant?': {
    text: "Love, missing your period does not always mean pregnancy.\n\nStress, not eating well, sickness, or emergency pill can also delay it.\n\nIf you had sex since your last period, the only way to know for sure is a pregnancy test.\n\nHave you done a test?",
    chips: ["Yes", "No", "I don't know how"]
  },
  'Can I get pregnant if he didn\'t cum inside?': {
    text: "Love, yes, it is still possible, but the chance is smaller.\n\nThis is because before he cums, a small liquid called pre-cum can come out, and it can have sperm inside.\n\nSo \"he didn't cum inside\" does not mean 100% safe.\n\nIf your period is late, do a test to be sure.",
    chips: ["What should I do?", "How do I take a test?"]
  },
  'Can I get pregnant during my period?': {
    text: "Love, the chance is very low, but it is not zero.\n\nIf your period is very short or your cycle is short, your ovulation can come very early, and sperm can stay alive inside for up to 5 days.\n\nSo it's rare, but possible. If you are worried, let's check your dates.",
    chips: ["Let's check my dates", "I am scared"]
  },
  'When should I do pregnancy test?': {
    text: "Love, don't rush to test the next morning. It will lie to you.\n\nWait until your period is 1 week late, or at least 14 days after the sex.\n\nUse your first urine in the morning. That one is the strongest.\n\nIf you need help to read the result, come back and tell me what you saw.\n\nIf you feel sick, have strong pain, or bleeding, please see a nurse or doctor quickly.",
    chips: ["I took the test", "I am still waiting"]
  },
  'I took Postinor, why is my period late?': {
    text: "Love, this is very common. Don't panic.\n\nPostinor is a strong emergency pill. It works by delaying your ovulation. Because of that, your period can come early, late, or be different.\n\nYour next period may come 1 week late. That can be normal after Postinor.\n\nBut if your period is more than 2 weeks late, please do a pregnancy test and talk to a nurse or pharmacist.\n\nPostinor is for emergency only, not for every time. If you need regular protection, talk to a nurse about better options.",
    chips: ["I understand", "What else can I use?"]
  },

  // ============================================================
  // GROUP 1: MY PERIOD
  // ============================================================
  'I just want to understand my period': {
    text: "Love, your period is your body cleaning itself every month.\n\nYour body prepares an egg. If no pregnancy happens, your body removes the lining it prepared. That blood is your period.\n\nA normal cycle is 21 to 35 days. A normal period is 3 to 7 days. Your own normal is what Ovi will learn with you.",
    chips: ["Why is my period late?", "Why is my period early?"]
  },
  'Why is my period late?': {
    text: "Love, period can be late for many reasons, not only pregnancy.\n\nStress, not sleeping well, sickness, change in food, or taking Postinor can make it late.\n\nIf you had sex and your period is late by more than 7 days, do a pregnancy test or see a nurse. If you did not have sex, wait small and track it with Ovi. If it is late for 2 months in a row, please see a nurse.",
    chips: ["I had sex", "I did not have sex"]
  },
  'Why is my period early?': {
    text: "Love, sometimes your body moves faster. Stress, sickness, or hormones can make it come early.\n\nOne early period is usually okay. If your period keeps coming early every month, or you are bleeding between periods, please see a nurse to check.",
    chips: ["It came early once", "It keeps coming early"]
  },
  'Why is my period not coming?': {
    text: "Love, I know this one can scare you.\n\nIf you had sex, pregnancy is one reason. If you did not have sex, it can be stress, sickness, weight change, or hormones.\n\nDon't panic alone. Track it in Ovi for 2 months. If it does not come, or you are worried, please see a nurse or doctor. They will help you, not judge you.",
    chips: ["I am worried", "I will wait"]
  },
  'Why is my period blood black / brown?': {
    text: "Love, don't fear. Brown or black blood is usually old blood. It means the blood stayed small time before coming out.\n\nAt the start or end of period, it is very common to see brown. If it smells very bad, or you have fever and severe pain with it, please see a nurse.",
    chips: ["It is at the start", "It is at the end", "It smells bad"]
  },
  'Why is my period only 2 days?': {
    text: "Love, some girls have short periods. If your period is always 2-3 days and you feel fine, that can be your normal.\n\nBut if your period suddenly changed from 5 days to 1-2 days, or you are very tired and pale, please see a nurse.",
    chips: ["It is always short", "It just changed"]
  },
  'Why is my period too much?': {
    text: "Love, too much means you are changing pad every 1 hour, or you see big clots, or you feel dizzy and very tired.\n\nThat is too much. Please see a nurse quickly. Don't try to manage heavy bleeding alone. Drink water and rest until you see someone.",
    chips: ["I am dizzy", "I see big clots"]
  },
  'Why does my period smell?': {
    text: "Love, small smell during period is normal because it is blood.\n\nBut if the smell is very strong and bad, and you have itching or pain, it may be infection. Change your pad every 4-6 hours, wash outside with water only. If smell stays, see a nurse.",
    chips: ["It is a small smell", "It is very strong"]
  },
  'Can I bath during my period?': {
    text: "Yes, my love. Please bath. You MUST bath.\n\nBathing does not stop your period. It does not make you sick. It does not make your blood go back inside. That is a myth.\n\nBathing helps you feel fresh, reduces smell, and helps with cramps because warm water relaxes your body.\n\nHow to bath well on your period:\n• Use clean water\n• Wash outside only, don't put soap inside your vagina\n• Change your pad after bathing\n• Bath as many times as you need, 1 or 2 times a day is fine\n\nDon't let anybody shame you for bathing. Being clean is part of taking care of yourself.",
    chips: ["Thank you", "Can I have sex during my period?"]
  },
  'Can I have sex during my period?': {
    text: "Love, yes, you can. It is safe if both of you want it and you use protection.\n\nSome girls feel more pain, some feel less pain. Some don't like it at all. All is okay.\n\nRemember, you can still get pregnant during your period, and you can still get infection.\n\nSo if you choose to, use a condom and be with someone you trust. If you don't want to, say no. Your no is enough.",
    chips: ["Thank you", "I have another question"]
  },
  'My period came twice this month': {
    text: "Love, I know that can worry you.\n\nIf your cycle is short, like 21 days, it is possible to see period twice in one month. That can be normal.\n\nBut if you are bleeding twice every month for 2-3 months, or the bleeding is very heavy, or you feel pain, please see a nurse. Let them check your body and help you.",
    chips: ["It is the first time", "It happens often"]
  },

  // ============================================================
  // GROUP 2: PAIN / BODY
  // ============================================================
  'Why is my stomach paining me?': {
    text: "Love, if your period is near or you are on your period, that pain is cramps. Your womb is squeezing to push out blood.\n\nIt is normal, but it should not stop you from living. Try warm water, rest, and lie on your side. If the pain is too much that you cannot walk or go to school, please see a nurse. You deserve help, not just to endure it.",
    chips: ["The pain is mild", "The pain is severe"]
  },
  'Why is my breast paining me?': {
    text: "Love, before your period your body makes more hormones. That can make your breast feel full, heavy, or pain when you touch it.\n\nIt usually goes away when your period comes. Wear a soft bra, don't press it too much.\n\nIf you feel one hard lump that stays, or one breast is very different from the other, please go and see a nurse to check. Don't be scared to ask.",
    chips: ["It is before my period", "It is after my period", "I feel a lump"]
  },
  'Why am I feeling tired?': {
    text: "Love, you are not lazy. In your Period Phase and Waiting Phase, your body is working hard inside. Your iron is going down, your hormones are changing.\n\nDrink water, eat food with beans, meat, or ugu if you can. Rest small. Your tiredness is real. It will pass.",
    chips: ["I am bleeding", "I am waiting for my period"]
  },
  'Why am I moody?': {
    text: "Love, it's not your fault. Before period, your hormones go up and down fast. That's why you can feel happy one minute, angry the next, and want to cry after.\n\nYou are not a bad person. Tell Ovi: \"I am in my Waiting Phase.\" And be gentle with yourself these days. It will calm down when your period comes.",
    chips: ["I want to cry", "I feel angry"]
  },
  'Why am I craving food?': {
    text: "Love, your body is asking for energy. Before period, many girls crave sweet things, groundnut, chocolate, or salty food.\n\nIt's normal. Eat small small, drink water. Don't punish yourself for craving. Your body is just preparing.",
    chips: ["I crave sweet things", "I crave salty things"]
  },
  'Why is my back paining me?': {
    text: "Love, back pain before and during period is also from cramps. The pain from your womb can go to your back and your legs.\n\nWarm water on your back, rest, and gentle stretching can help. If it is too much, please see a nurse.",
    chips: ["It is mild", "It is severe"]
  },
  'Why do I have pimples before period?': {
    text: "Love, before period your hormones make your skin produce more oil. That oil blocks your pores and brings pimples.\n\nIt is not because you are dirty. Wash your face with clean water, don't squeeze them too much. They will reduce after your period.",
    chips: ["They are small", "They are painful"]
  },

  // ============================================================
  // GROUP 3: OVULATION / DISCHARGE
  // ============================================================
  'What is ovulation?': {
    text: "Love, ovulation is when your body releases one egg. It happens about in the middle of your cycle, around 14 days before your next period.\n\nThink of it like this: Your body is preparing. If that egg meets sperm, pregnancy can happen. If not, your body will let it go and your period will come.\n\nIt is normal. Every girl who sees period does it.",
    chips: ["How do I know I am ovulating?", "What is discharge?"]
  },
  'How do I know I am ovulating?': {
    text: "Love, your body will show you small signs:\n• You will see clear, stretchy discharge like egg white\n• You may feel small pain on one side of your stomach\n• You may feel more desire for sex\n• Your breast may feel full\n\nNot every girl feels all of them. And that's okay. If you are tracking your period with Ovi, Ovi will tell you when your ovulation time is near.",
    chips: ["I see clear discharge", "I feel pain on one side"]
  },
  'What is this white thing coming out?': {
    text: "Love, that white thing is called discharge. It is your vagina cleaning itself.\n\nBefore ovulation, it is white and creamy. During ovulation, it becomes clear and stretchy. After ovulation, it becomes dry or thick again.\n\nAs long as it is not itching you or smelling very strong, it is normal. Please don't put soap inside. Just wash outside with water.",
    chips: ["It is clear and stretchy", "It is white and creamy"]
  },
  'Why is my discharge smelling?': {
    text: "Love, small smell is normal because discharge is cleaning. But listen to your body:\n\nIf the smell is very strong, like fish, or the colour is green or yellow, or it is itching you or paining you when you pee - that is not normal discharge.\n\nThat is your body telling you to see a nurse or doctor quickly. Don't be shy. They have seen this many times. You did nothing wrong.",
    chips: ["It is a small smell", "It is very strong"]
  },
  'Is discharge normal?': {
    text: "Yes, my love. Very normal.\n\nDischarge means your vagina is healthy and working. If you had no discharge at all, that would be the problem.\n\nIt will change throughout the month. Sometimes plenty, sometimes small. That is your cycle working.",
    chips: ["Thank you", "I have another question"]
  },

  // ============================================================
  // GROUP 5: SAFE / SHAME
  // ============================================================
  'I feel ashamed. Am I a bad girl?': {
    text: "No, my love. You are not a bad girl.\n\nHaving a body, having feelings, having questions, having sex, having discharge, having a period - none of these make you bad.\n\nShame is what other people put on us. It is not the truth about you. You are still a good girl. You are still worthy of care and respect.",
    chips: ["I feel dirty", "Can I tell someone?"]
  },
  'I feel dirty. Am I dirty?': {
    text: "No, love. You are not dirty.\n\nPeriod blood is not dirty. Discharge is not dirty. Your body is not dirty. Your body is cleaning itself and working the way it should.\n\nWash outside with water, change your pad, wear clean pant. That is enough. You do not need to wash inside or use strong soap to be clean.",
    chips: ["Thank you", "I feel better"]
  },
  'Can I tell someone what happened to me?': {
    text: "Yes, love. You can tell someone you trust.\n\nIf someone touched you without your permission, or forced you, or you felt scared - that is not your fault. You did nothing wrong.\n\nTell a trusted auntie, nurse, teacher, or call a helpline in your area. You deserve to be safe and to be believed. You don't have to carry it alone.",
    chips: ["I am scared to tell", "I will tell someone"]
  },
  'Is it safe to ask Ovi these questions?': {
    text: "Yes, love. This is why Ovi is here.\n\nOvi will not shout at you. Ovi will not tell your mummy. Ovi will not judge you. You can ask anything about your body here, and Ovi will answer you gently and honestly.\n\nYour questions are safe here.",
    chips: ["Thank you", "I have another question"]
  },
  'How do I stay safe if I have sex?': {
    text: "Love, if you choose to have sex, staying safe means two things:\n\n1. Protection from pregnancy: Use a condom every time, or talk to a nurse about other methods that fit your body.\n2. Protection from infections: Condom is the only method that protects from both pregnancy and infections.\n\nAnd safe also means: It must be your choice. You can say no at any time, even if you said yes before. If someone does not respect your no, that is not love.",
    chips: ["Thank you", "I have another question"]
  },
  'I am scared my parents will find out': {
    text: "Love, I understand that fear. It is real.\n\nOvi is private for your questions. But for your body, please try to find one safe adult you trust - a nurse, a big sister, a teacher. You don't have to tell everything at once. You can start with: \"I have a question about my period.\"\n\nYou deserve help without fear.",
    chips: ["Thank you", "I have another question"]
  },

  // ============================================================
  // THE LATE JOURNEY
  // ============================================================
  'My period is late': {
    text: "Love, breathe with me. I understand you, it's scary when your period is late. You are safe here, I won't judge you. Let's check it together, okay?\n\nWhen was your last period?",
    chips: ["I know the date", "I don't remember"]
  },
  'I know the date': {
    text: "Okay. Is your cycle usually regular? Like 28 days, or it changes?",
    chips: ["It is regular", "It changes a lot"]
  },
  'I don\'t remember': {
    text: "That's okay, love. We can still figure it out. Have you been stressed, sick, or changed your food/sleep recently?",
    chips: ["Yes, I have been stressed", "No, I feel normal"]
  },
  'It is regular': {
    text: "Thank you. Have you been stressed, sick, or changed your food/sleep recently?",
    chips: ["Yes, I have been stressed", "No, I feel normal"]
  },
  'It changes a lot': {
    text: "Thank you for telling me. Irregular cycles are very common for young girls. Have you been stressed, sick, or changed your food/sleep recently?",
    chips: ["Yes, I have been stressed", "No, I feel normal"]
  },
  'Yes, I have been stressed': {
    text: "I hear you. Stress and exam pressure can delay your period. Let's wait 3 more days, track your symptoms, drink water, and rest. Tell me if you have cramps or discharge.\n\nIf you are worried, we can take a test after 7 days. I am here.",
    chips: ["I want to take a test", "I will wait"]
  },
  'No, I feel normal': {
    text: "That is good to hear. Sometimes our bodies just take a little longer. Let's wait 3 more days, track your symptoms, drink water, and rest. Tell me if you have cramps or discharge.\n\nIf you are worried, we can take a test after 7 days. I am here.",
    chips: ["I want to take a test", "I will wait"]
  },
  'I want to take a test': {
    text: "Okay, love. The best way to know for sure is a pregnancy test after 7 days of missed period. You can get it quietly from a pharmacy.\n\nUse your first urine in the morning. That one is the strongest.\n\nIf you need help to read the result, come back and tell me what you saw. I am here.",
    chips: ["I took the test", "I am still waiting"]
  },
  'I will wait': {
    text: "Okay, love. I will check on you tomorrow. Come back and tell me how you are feeling, even if nothing changes. You are not alone. 💜",
    chips: ["Thank you"]
  }
};