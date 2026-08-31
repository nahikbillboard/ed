// Elder-friendly Audio Speech & Synthesis System for Sath
// Provides natural Hindi & English speech synthesis with fallback chimes

export type AudioLanguage = 'hi' | 'en';

// Comprehensive Hindi audio translations dictionary covering all sections, yoga steps, tasks & reminders
const HINDI_TRANSLATIONS: Record<string, string> = {
  // Breathing
  'Hold your breath gently...': 'सांस को आराम से रोक कर रखें...',
  'Slowly breathe out...': 'धीरे-धीरे सांस बाहर छोड़ें...',
  'Breathe in deeply...': 'गहरी सांस अंदर लें...',
  'Welcome to your calm breathing exercise. Breathe in deeply...': 'शांत श्वास व्यायाम में आपका स्वागत है। गहरी सांस अंदर लें...',
  'Wonderful job! Breathing exercise is complete. You have earned 60 Wellness XP.': 'बहुत बढ़िया! सांस का व्यायाम पूरा हो गया है। आपको 60 वेलनेस एक्स पी मिले हैं।',
  'Holding breath... stay relaxed.': 'सांस रोकें... शांत और सहज रहें।',

  // SOS & Emergency
  'Emergency Alert triggered. Do you want to call your emergency contact?': 'आपातकालीन अलर्ट शुरू हो गया है। क्या आप अपने आपातकालीन संपर्क को कॉल करना चाहते हैं?',
  'Emergency alert canceled. You are safe.': 'आपातकालीन अलर्ट रद्द कर दिया गया है। आप सुरक्षित हैं।',
  'Emergency SOS Alert': 'आपातकालीन सहायता सूचना',

  // Dictation & Voice input
  'Voice dictation is not supported in this browser. Please type your note.': 'इस ब्राउज़र में वॉयस टाइपिंग समर्थित नहीं है। कृपया लिखकर बताएं।',
  'Voice dictation is not supported in this browser. Please type your dish name.': 'इस ब्राउज़र में वॉयस टाइपिंग समर्थित नहीं है। कृपया लिखकर बताएं।',
  'Listening... please speak your note.': 'सुन रहे हैं... कृपया अपना संदेश बोलिए।',
  'Listening... please say what you ate.': 'सुन रहे हैं... कृपया बताइए कि आपने क्या खाया।',

  // Yoga & Exercise Titles
  'Gentle Chair Yoga': 'कुर्सी पर बैठकर सुगम योग',
  'Shoulder & Neck Mobility': 'कंधे और गर्दन का हल्का व्यायाम',
  'Seated Ankle & Leg Strength': 'बैठकर पैरों और टखनों का व्यायाम',
  'Standing Balance by Chair': 'कुर्सी के सहारे संतुलन व्यायाम',
  'Chest Opener & Deep Breath': 'छाती का विस्तार और गहरी सांस',

  // Yoga & Exercise Descriptions
  'Seated stretching to improve flexibility and release spine tension safely.': 'रीढ़ की हड्डी के तनाव को दूर करने और लचीलापन बढ़ाने के लिए बैठकर स्ट्रेचिंग।',
  'Smooth rotations to ease morning stiffness and maintain neck posture.': 'सुबह के जकड़न को दूर करने और गर्दन के लचीलेपन के लिए हल्का घुमाव।',
  'Active ankle pumps and knee extensions to boost blood circulation.': 'रक्त संचार को बेहतर बनाने के लिए टखने और घुटने का सक्रिय व्यायाम।',
  'Light balance maintenance with chair support for fall prevention.': 'संतुलन बनाए रखने और स्थिरता के लिए कुर्सी के सहारे हल्का अभ्यास।',
  'Open posture and expand lung capacity with rhythmic arm sweeps.': 'फेफड़ों की क्षमता बढ़ाने और ताजगी के लिए लयबद्ध हाथों का अभ्यास।',

  // Yoga Exercise Step Instructions
  'Sit comfortably upright in a sturdy chair with feet flat on the floor.': 'एक मजबूत कुर्सी पर पैरों को जमीन पर सीधा रखकर आराम से सीधे बैठें।',
  'Take a deep breath and raise both arms overhead gently.': 'गहरी सांस लें और दोनों हाथों को धीरे से ऊपर उठाएं।',
  'Exhale and slowly lower your arms to your sides.': 'सांस छोड़ते हुए धीरे-धीरे हाथों को नीचे लाएं।',
  'Gently twist your torso to the right, holding for 10 seconds.': 'अपने धड़ को धीरे से दाईं ओर घुमाएं और 10 सेकंड तक रोकें।',
  'Switch sides and repeat 3 times with slow steady breaths.': 'अब दूसरी तरफ करें और धीमी गहरी सांसों के साथ इसे 3 बार दोहराएं।',

  'Roll both shoulders backward 5 times in slow gentle circles.': 'दोनों कंधों को धीरे-धीरे 5 बार पीछे की ओर गोल घुमाएं।',
  'Roll shoulders forward 5 times while breathing smoothly.': 'आराम से सांस लेते हुए कंधों को 5 बार आगे की ओर गोल घुमाएं।',
  'Tilt head to right ear toward right shoulder; hold 8 seconds.': 'सिर को धीरे से दाएं कंधे की तरफ झुकाएं और 8 सेकंड रोकें।',
  'Tilt head to left ear toward left shoulder; hold 8 seconds.': 'सिर को धीरे से बाएं कंधे की तरफ झुकाएं और 8 सेकंड रोकें।',

  'Lift right foot slightly and point toes up and down 10 times.': 'दाएं पैर को थोड़ा ऊपर उठाएं और पंजों को 10 बार ऊपर-नीचे करें।',
  'Make 5 gentle circles clockwise and counter-clockwise with right foot.': 'दाएं पैर से 5 बार घड़ी की दिशा में और 5 बार उल्टी दिशा में गोल घुमाएं।',
  'Repeat sequence with the left foot.': 'यही प्रक्रिया बाएं पैर के साथ दोहराएं।',
  'Slowly straighten right knee, hold for 3 seconds, lower, and alternate.': 'दाएं घुटने को धीरे से सीधा करें, 3 सेकंड रोकें, फिर नीचे लाएं और दूसरे पैर से करें।',

  'Stand behind chair holding the backrest firmly with both hands.': 'कुर्सी के पीछे खड़े होकर दोनों हाथों से मजबूती से सहारा लें।',
  'Shift weight to left leg and gently lift right foot 2 inches off floor.': 'शरीर का वजन बाएं पैर पर रखें और दाएं पैर को जमीन से 2 इंच ऊपर उठाएं।',
  'Hold balance for 10 seconds while breathing calmly.': 'शांत सांस लेते हुए 10 सेकंड तक संतुलन बनाए रखें।',
  'Lower right foot and repeat with left leg 3 times each side.': 'दाएं पैर को नीचे लाएं और दोनों तरफ 3-3 बार दोहराएं।',

  'Sit tall with hands on your thighs.': 'अपनी जांघों पर हाथ रखकर सीधे बैठें।',
  'Inhale deeply and open your arms wide like giving a warm hug.': 'गहरी सांस लें और अपने दोनों हाथों को गले लगाने की तरह चौड़ा फैलाएं।',
  'Exhale and bring hands back to center over your heart.': 'सांस छोड़ते हुए दोनों हाथों को वापस हृदय के पास लाएं।',
  'Repeat 5 times with calm soothing rhythm.': 'इसे शांत और सुखद लय के साथ 5 बार दोहराएं।',

  'Sit tall and lift your right foot off the ground, pointing toes upward.': 'सीधे बैठें और अपने दाएं पैर को ऊपर उठाएं, पंजों को ऊपर रखें।',
  'Rotate right ankle clockwise 5 times, then counter-clockwise.': 'दाएं टखने को 5 बार गोल घुमाएं, फिर उल्टी दिशा में घुमाएं।',
  'Lower right leg, raise left leg and repeat rotation.': 'दाएं पैर को नीचे लाएं, अब बाएं पैर को उठाकर दोहराएं।',
  'Extend both legs forward gently and tap heels 10 times.': 'दोनों पैरों को आराम से आगे फैलाएं और एड़ियों को 10 बार धीरे से थपथपाएं।',

  // Routine Titles & Steps
  'Morning Wakeup Check-in': 'सुबह का जागना दर्ज करें',
  'Morning Walk': 'सुबह की ताज़ा वॉक',
  'Daily Walk': 'दैनिक वॉक',
  'Morning Yoga': 'सुबह का सुगम योग',
  'Breakfast': 'सुबह का नाश्ता',
  'After-Breakfast Medicine': 'नाश्ते के बाद की दवाई',
  'Lunch': 'दोपहर का भोजन',
  'After-Lunch Medicine': 'दोपहर के भोजन के बाद की दवाई',
  'Sleep Nap': 'दोपहर का विश्राम और नींद',
  'Dinner': 'रात का भोजन',
  'After-Dinner Medicine': 'रात के भोजन के बाद की दवाई',
  'Night Medicine': 'सोने से पहले की दवाई',
  'Gentle Breathing': 'शांत श्वास व्यायाम',
  'Hydration & Water': 'पानी और जलपान',
  'Blood Pressure & Health Vitals': 'रक्तचाप और स्वास्थ्य जांच',
  'Evening Family Check-in': 'शाम को परिवार से बातचीत',
};

// Task & Routine Name translation lookup
export function translateTaskNameToHindi(taskName: string): string {
  if (!taskName) return '';
  const trimmed = taskName.trim();
  if (HINDI_TRANSLATIONS[trimmed]) return HINDI_TRANSLATIONS[trimmed];
  if (trimmed.includes('Morning Walk') || trimmed.includes('Daily Walk')) return 'दैनिक वॉक';
  if (trimmed.includes('Morning Yoga') || trimmed.includes('Yoga')) return 'सुबह का योग';
  if (trimmed.includes('Breakfast Medicine') || trimmed.includes('After-Breakfast Medicine')) return 'नाश्ते के बाद की दवाई';
  if (trimmed.includes('Lunch Medicine') || trimmed.includes('After-Lunch Medicine')) return 'दोपहर की दवाई';
  if (trimmed.includes('Dinner Medicine') || trimmed.includes('After-Dinner Medicine') || trimmed.includes('Night Medicine')) return 'रात की दवाई';
  if (trimmed.includes('Breakfast')) return 'सुबह का नाश्ता';
  if (trimmed.includes('Lunch')) return 'दोपहर का भोजन';
  if (trimmed.includes('Dinner')) return 'रात का भोजन';
  if (trimmed.includes('Nap') || trimmed.includes('Rest')) return 'दोपहर का विश्राम';
  if (trimmed.includes('Wake') || trimmed.includes('Awake')) return 'सुबह का जागना';
  return taskName;
}

export function convertToHindiSpeech(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // Direct match in dictionary
  if (HINDI_TRANSLATIONS[trimmed]) {
    return HINDI_TRANSLATIONS[trimmed];
  }

  // If text is already primarily Devanagari/Hindi, return directly
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return trimmed;
  }

  let text = trimmed;

  // Dynamic regex replacements for common English audio templates
  if (/Good morning,?\s*(.+?)!\s*Awakening confirmed/i.test(text)) {
    const match = text.match(/Good morning,?\s*(.+?)!\s*Awakening confirmed/i);
    const name = match ? match[1] : '';
    return `सुप्रभात ${name} जी! आपका जागना दर्ज हो गया है। आपका स्ट्रीक शानदार चल रहा है और 50 वेलनेस एक्स पी मिल गए हैं।`;
  }

  if (/Well done,?\s*(.+?)!\s*(.+?)\s*is completed/i.test(text)) {
    const match = text.match(/Well done,?\s*(.+?)!\s*(.+?)\s*is completed/i);
    const name = match ? match[1] : '';
    const task = match ? translateTaskNameToHindi(match[2]) : '';
    return `शाबाश ${name} जी! ${task} सफलतापूर्वक पूरा हो गया है।`;
  }

  if (/Congratulations,?\s*(.+?)!\s*Daily Walk completed/i.test(text)) {
    const match = text.match(/Congratulations,?\s*(.+?)!\s*Daily Walk completed/i);
    const name = match ? match[1] : '';
    return `बधाई हो ${name} जी! दैनिक वॉक पूरी हो गई है और परिवार को संदेश भेज दिया गया है।`;
  }

  if (/Congratulations\s*(.+?)!\s*You reached your daily walking goal/i.test(text)) {
    const match = text.match(/Congratulations\s*(.+?)!\s*You reached your daily walking goal/i);
    const name = match ? match[1] : '';
    return `बधाई हो ${name} जी! आपने अपना चलने का लक्ष्य पूरा कर लिया है! सांस का व्यायाम अब खुल गया है।`;
  }

  if (/Added\s*(\d+)\s*steps/i.test(text)) {
    const match = text.match(/Added\s*(\d+)\s*steps/i);
    const steps = match ? match[1] : '';
    return `${steps} कदम जुड़ गए हैं। बहुत अच्छा!`;
  }

  if (/Wonderful\s*(.+?)!\s*Medicine number\s*(\d+),\s*(.+?),\s*is recorded/i.test(text)) {
    const match = text.match(/Wonderful\s*(.+?)!\s*Medicine number\s*(\d+),\s*(.+?),\s*is recorded/i);
    const name = match ? match[1] : '';
    const num = match ? match[2] : '';
    const med = match ? match[3] : '';
    return `बहुत बढ़िया ${name} जी! दवाई नंबर ${num}, ${med}, दर्ज हो गई है और व्हाट्सएप पर भेज दी गई है।`;
  }

  if (/Medicine #(\d+),\s*(.+?),\s*confirmed/i.test(text)) {
    const match = text.match(/Medicine #(\d+),\s*(.+?),\s*confirmed/i);
    const num = match ? match[1] : '';
    const med = match ? match[2] : '';
    return `दवाई नंबर ${num}, ${med}, दर्ज हो गई है और आपके बच्चे को व्हाट्सएप पर भेज दी गई है।`;
  }

  if (/Reminder for\s*(.+?)\s*snoozed/i.test(text)) {
    const match = text.match(/Reminder for\s*(.+?)\s*snoozed/i);
    const med = match ? match[1] : '';
    return `${med} का रिमाइंडर 15 मिनट के लिए आगे बढ़ा दिया गया है। मैं 15 मिनट बाद फिर याद दिलाऊंगा।`;
  }

  if (/Wonderful\s*(.+?)!\s*Your\s*(.+?)\s*with\s*(.+?)\s*is recorded/i.test(text)) {
    const match = text.match(/Wonderful\s*(.+?)!\s*Your\s*(.+?)\s*with\s*(.+?)\s*is recorded/i);
    const name = match ? match[1] : '';
    const meal = match ? translateTaskNameToHindi(match[2]) : '';
    const dish = match ? match[3] : '';
    return `बहुत बढ़िया ${name} जी! आपका ${meal} में ${dish} दर्ज हो गया है और आपके बच्चे को भेज दिया गया है।`;
  }

  if (/Bravo\s*(.+?)!\s*You finished\s*(.+?)\./i.test(text)) {
    const match = text.match(/Bravo\s*(.+?)!\s*You finished\s*(.+?)\./i);
    const name = match ? match[1] : '';
    const ex = match ? (HINDI_TRANSLATIONS[match[2]] || match[2]) : '';
    return `शाबाश ${name} जी! आपने ${ex} पूरा कर लिया है। 70 वेलनेस एक्स पी मिल गए हैं।`;
  }

  if (/Starting\s*(.+?)\.\s*(.+)/i.test(text)) {
    const match = text.match(/Starting\s*(.+?)\.\s*(.+)/i);
    const title = match ? (HINDI_TRANSLATIONS[match[1]] || match[1]) : '';
    const desc = match ? (HINDI_TRANSLATIONS[match[2]] || match[2]) : '';
    return `${title} शुरू कर रहे हैं। ${desc}`;
  }

  if (/You need\s*(\d+)\s*more XP/i.test(text)) {
    const match = text.match(/You need\s*(\d+)\s*more XP/i);
    const xp = match ? match[1] : '';
    return `इस उपहार के लिए आपको ${xp} और एक्स पी चाहिए। वॉक और व्यायाम जारी रखें!`;
  }

  if (/Congratulations\s*(.+?)!\s*You redeemed\s*(.+?)\./i.test(text)) {
    const match = text.match(/Congratulations\s*(.+?)!\s*You redeemed\s*(.+?)\./i);
    const name = match ? match[1] : '';
    const rew = match ? match[2] : '';
    return `बधाई हो ${name} जी! आपने ${rew} रिडीम कर लिया है। आपके अभिभावक को सूचना भेज दी गई है!`;
  }

  if (/Congratulations\s*(.+?)!\s*You have achieved a\s*(\d+)\s*day streak/i.test(text)) {
    const match = text.match(/Congratulations\s*(.+?)!\s*You have achieved a\s*(\d+)\s*day streak/i);
    const name = match ? match[1] : '';
    const streak = match ? match[2] : '';
    return `बधाई हो ${name} जी! आपने ${streak} दिनों का स्ट्रीक पूरा कर लिया है! ऐसे ही स्वस्थ और खुश रहें!`;
  }

  if (/Calling\s*(.+?)\.\s*Your family and emergency responders/i.test(text)) {
    const match = text.match(/Calling\s*(.+?)\.\s*Your family and emergency responders/i);
    const name = match ? match[1] : '';
    return `${name} जी को कॉल किया जा रहा है। आपके परिवार और सहायकों को सूचित कर दिया गया है।`;
  }

  if (/Welcome to Sath,?\s*(.+?)!\s*Your daily companion/i.test(text)) {
    const match = text.match(/Welcome to Sath,?\s*(.+?)!\s*Your daily companion/i);
    const name = match ? match[1] : '';
    return `साथ में आपका स्वागत है, ${name} जी! आपका दैनिक साथी सेटअप पूरा हो गया है।`;
  }

  if (/Refill order placed for\s*(.+?)\.\s*30 doses/i.test(text)) {
    const match = text.match(/Refill order placed for\s*(.+?)\.\s*30 doses/i);
    const med = match ? match[1] : '';
    return `${med} के लिए रिफिल ऑर्डर दे दिया गया है। 30 खुराक इन्वेंट्री में जोड़ दी गई हैं।`;
  }

  // Voice call scripts
  if (text.includes("Good morning! It's a brand new day") || text.includes("I'm Awake")) {
    return 'नमस्ते जी! सुप्रभात! एक नई सुबह की शुरुआत हो चुकी है। आपकी सुबह की दिनचर्या तैयार है। कृपया स्क्रीन पर बटन दबाकर अपने परिवार को बताएं कि आप ठीक हैं।';
  }

  if (text.includes("time for your wholesome") || text.includes("enjoy your meal")) {
    return 'नमस्ते जी! यह आपके पौष्टिक भोजन का समय है। समय पर भोजन करने से आपको ऊर्जा मिलती है। कृपया भोजन का आनंद लें और स्क्रीन पर दर्ज करें।';
  }

  if (text.includes("medication: please check Medicine") || text.includes("care companion reminder")) {
    return 'नमस्ते जी! यह आपकी दवाई लेने का समय है। कृपया अपनी दवाई पानी के साथ लें और इसके बाद स्क्रीन पर दर्ज करें।';
  }

  if (text.includes("activated the emergency SOS button")) {
    return 'नमस्ते, यह किनकेयर आपातकालीन चेतावनी है। आपातकालीन सहायता बटन दबाया गया है। हम तुरंत परिवार और सहायकों से संपर्क कर रहे हैं।';
  }

  return text;
}

export function speakText(
  text: string,
  rate: number = 0.88,
  pitch: number = 1.0,
  language: AudioLanguage = 'hi'
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // cancel any active utterance
    
    // Choose speech text and voice based on requested language
    const spokenText = language === 'hi' ? convertToHindiSpeech(text) : text;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    
    utterance.rate = rate; // elder-friendly pacing
    utterance.pitch = pitch;
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';

    const voices = window.speechSynthesis.getVoices();
    if (language === 'hi') {
      const hindiVoice = voices.find(
        v =>
          v.lang.toLowerCase().startsWith('hi') ||
          v.name.toLowerCase().includes('hindi') ||
          v.name.includes('हिन्दी') ||
          v.name.includes('Lekha') ||
          v.name.includes('Kalpana') ||
          v.name.includes('Hemant')
      );
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
    } else {
      const englishVoice = voices.find(
        v =>
          v.lang.toLowerCase().startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Victoria'))
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Pleasant sound chimes for instant tactile audio feedback
export function playChime(type: 'success' | 'alert' | 'ding' = 'ding') {
  if (typeof window === 'undefined' || !('AudioContext' in window || 'webkitAudioContext' in (window as any))) {
    return;
  }

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'success') {
      // Warm chord: G4 -> C5 -> E5
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(392, now);
      osc.frequency.setValueAtTime(523.25, now + 0.1);
      osc.frequency.setValueAtTime(659.25, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.55);
    } else if (type === 'alert') {
      // Alert pulse: dual high tones
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      // Ding: soft crystal tone 587.33Hz (D5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (err) {
    console.warn('Audio chime error:', err);
  }
}
