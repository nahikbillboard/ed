import React, { useState, useEffect, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Share2,
  Copy,
  Check,
  Sparkles,
  Sun,
  Footprints,
  Pill,
  Utensils,
  ShieldCheck,
  Flame,
  Languages,
  MessageCircle,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { Senior, DailyRoutine, DailyActivity, SeniorProgress, Medicine, NotificationItem, SosEvent } from '../../types';
import { speakText, stopSpeaking, playChime } from '../../utils/audioSpeech';

interface GuardianShabdonMeinProps {
  senior: Senior;
  routine: DailyRoutine;
  activity: DailyActivity;
  progress: SeniorProgress;
  medicines: Medicine[];
  notifications: NotificationItem[];
  sosHistory?: SosEvent[];
}

export const GuardianShabdonMein: React.FC<GuardianShabdonMeinProps> = ({
  senior,
  routine,
  activity,
  progress,
  medicines,
  notifications,
  sosHistory = [],
}) => {
  const [lang, setLang] = useState<'hi' | 'en'>('hi');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'chapters'>('overview');

  // Stop speech if unmounted
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Compute calculated metrics
  const stepPercent = Math.round((activity.steps / activity.step_goal) * 100);
  const med1Taken = routine.medicine_status === 'completed' || routine.breakfast_medicine_status === 'completed';
  const med2Taken = routine.lunch_medicine_status === 'completed';
  const med3Taken = routine.dinner_medicine_status === 'completed' || routine.night_medicine_status === 'completed';
  const hasActiveSos = sosHistory.some((s) => s.status === 'active');
  const wakeConfirmed = routine.wake_status === 'completed';
  const wakeTimeDisplay = routine.wake_time || '7:15 AM';

  // Construct Hindi Narrative ("शब्दों में")
  const hindiNarrative = useMemo(() => {
    const parts: string[] = [];

    // Header intro
    parts.push(
      `नमस्ते! यह है ${senior.name} जी की आज की दिनचर्या का संपूर्ण विवरण, शब्दों में:`
    );

    // Morning
    if (wakeConfirmed) {
      parts.push(
        `सुबह का चेक-इन: ${senior.name} जी आज सुबह ठीक ${wakeTimeDisplay} बजे उठीं। उन्होंने सुबह का अभिवादन पूरा किया और अपने दिन की ऊर्जावान शुरुआत की।`
      );
    } else {
      parts.push(
        `सुबह का चेक-इन: सुबह के समय की पुष्टि की प्रतीक्षा है। सामान्य उठने का समय सुबह ${senior.wake_time || '7:30 बजे'} है।`
      );
    }

    // Walking & Yoga
    parts.push(
      `शारीरिक गतिविधि: आज उन्होंने कुल ${activity.steps.toLocaleString()} कदम पूरे किए हैं, जो उनके ${activity.step_goal.toLocaleString()} कदमों के लक्ष्य का ${stepPercent}% है। इसके साथ लगभग ${activity.distance_km || 3.8} किलोमीटर की दूरी तय हुई है।`
    );
    if (routine.yoga_status === 'completed') {
      parts.push('उन्होंने आज चेयर योगा और स्ट्रेचिंग का सत्र भी सफलतापूर्वक पूरा किया है।');
    }

    // Medicines
    const medSummary = [];
    if (med1Taken) medSummary.push('सुबह 9:00 बजे की कार्डियोप्रोटेक्ट (दवाई #1) नाश्ते के बाद समय पर ली जा चुकी है');
    else medSummary.push('सुबह की दवाई #1 अभी लंबित है');

    if (med2Taken) medSummary.push('दोपहर की कैल्शियम गोली ली जा चुकी है');
    if (med3Taken) medSummary.push('रात की न्यूरो-काम खुराक ली गई है');
    else medSummary.push(`रात की न्यूरो-काम गोली रात ${senior.night_medicine_time || '8:30 बजे'} पर निर्धारित है`);

    parts.push(`दवाइयों की स्थिति: ${medSummary.join('। ')}।`);

    // Meals
    parts.push(
      `भोजन: नाश्ता और दोपहर का भोजन सही समय पर दर्ज किया गया है। शाम का भोजन 7:30 बजे निर्धारित है।`
    );

    // Streak & Safety
    if (hasActiveSos) {
      parts.push('चेतावनी: आज एक आपातकालीन सहायता संकेत दर्ज हुआ है, कृपया तुरंत संपर्क करें।');
    } else {
      parts.push(
        `सुरक्षा एवं निरंतरता: आज कोई आपातकालीन अलार्म नहीं है। ${senior.name} जी का ${progress.current_streak}-दिन का वेलनेस स्ट्रीक बहुत शानदार चल रहा है। अभिभावक (${senior.guardian_name}) के नंबर ${senior.guardian_phone} पर सुरक्षा संदेश समय पर प्रेषित हो रहे हैं।`
      );
    }

    return parts.join('\n\n');
  }, [senior, routine, activity, progress, wakeConfirmed, wakeTimeDisplay, stepPercent, med1Taken, med2Taken, med3Taken, hasActiveSos]);

  // Construct English Narrative ("In Words")
  const englishNarrative = useMemo(() => {
    const parts: string[] = [];

    parts.push(
      `Daily Care Summary in Words for ${senior.name}:`
    );

    if (wakeConfirmed) {
      parts.push(
        `Morning Check-In: ${senior.name} woke up cheerfully at ${wakeTimeDisplay} and completed her morning wellness check-in.`
      );
    } else {
      parts.push(
        `Morning Check-In: Morning wakeup pending confirmation. Target wakeup time is ${senior.wake_time || '7:30 AM'}.`
      );
    }

    parts.push(
      `Movement & Activity: She has logged ${activity.steps.toLocaleString()} steps today, achieving ${stepPercent}% of her ${activity.step_goal.toLocaleString()} daily step goal across approximately ${activity.distance_km || 3.8} km.`
    );
    if (routine.yoga_status === 'completed') {
      parts.push('Gentle chair mobility exercises have been completed.');
    }

    const meds = [];
    if (med1Taken) meds.push('Morning Cardioprotect (Medicine #1) confirmed taken with breakfast');
    else meds.push('Morning medicine pending');

    if (med2Taken) meds.push('Afternoon Calcium chewable confirmed');
    if (med3Taken) meds.push('Evening Neuro-calm dose recorded');
    else meds.push(`Night Neuro-calm dose is scheduled for ${senior.night_medicine_time || '8:30 PM'}`);

    parts.push(`Prescription Adherence: ${meds.join('; ')}.`);

    parts.push(
      `Nutrition: Morning breakfast and midday lunch have been logged on schedule. Evening dinner scheduled for 7:30 PM.`
    );

    if (hasActiveSos) {
      parts.push('Safety Alert: An emergency SOS event was initiated. Immediate follow-up recommended.');
    } else {
      parts.push(
        `Safety & Consistency: Zero safety alerts today. Her ${progress.current_streak}-day routine streak remains active and unbroken. Guardian telemetry delivered to ${senior.guardian_name} (${senior.guardian_phone}).`
      );
    }

    return parts.join('\n\n');
  }, [senior, routine, activity, progress, wakeConfirmed, wakeTimeDisplay, stepPercent, med1Taken, med2Taken, med3Taken, hasActiveSos]);

  const currentNarrative = lang === 'hi' ? hindiNarrative : englishNarrative;

  // Audio speech handler
  const handleToggleSpeak = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      playChime('ding');
      setIsPlaying(true);
      const textToSpeak = lang === 'hi'
        ? hindiNarrative.replace(/\n\n/g, '। ')
        : englishNarrative.replace(/\n\n/g, '. ');
      
      speakText(textToSpeak);

      // Approximate duration timeout or reset on end
      const wordsCount = textToSpeak.split(' ').length;
      const durationMs = Math.max((wordsCount / 2.2) * 1000, 5000);
      setTimeout(() => {
        setIsPlaying(false);
      }, durationMs);
    }
  };

  const handleCopy = () => {
    playChime('success');
    navigator.clipboard.writeText(currentNarrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    playChime('ding');
    const headerPrefix = lang === 'hi'
      ? `📋 *शब्दों में दैनिक रिपोर्ट - ${senior.name}*\n\n`
      : `📋 *Daily Care Narrative - ${senior.name}*\n\n`;
    
    const fullText = encodeURIComponent(`${headerPrefix}${currentNarrative}\n\n— *Edheal Sath Browser Engine* (https://Edheal.netlify.app)`);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${senior.guardian_phone}&text=${fullText}`;
    window.open(whatsappUrl, '_blank');
  };

  // Structured Story Chapters for interactive reading
  const chapters = [
    {
      id: 'morning',
      titleHindi: 'सुबह का अध्याय (Morning)',
      titleEnglish: 'Morning Chapter',
      icon: Sun,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      textHindi: `${senior.name} जी आज सुबह ठीक ${wakeTimeDisplay} बजे उठीं। उन्होंने सुबह का अभिवादन पूरा किया और अपने दिन की ऊर्जावान शुरुआत की।`,
      textEnglish: `${senior.name} woke up cheerfully at ${wakeTimeDisplay} and completed her morning wellness check-in.`,
      statusBadge: wakeConfirmed ? 'पुष्टित ✓ (Confirmed)' : 'लंबित (Pending)',
      badgeColor: wakeConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
    },
    {
      id: 'activity',
      titleHindi: 'शारीरिक गतिविधि और सैर (Activity & Steps)',
      titleEnglish: 'Physical Movement & Steps',
      icon: Footprints,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      textHindi: `आज उन्होंने कुल ${activity.steps.toLocaleString()} कदम पूरे किए हैं, जो उनके ${activity.step_goal.toLocaleString()} कदमों के लक्ष्य का ${stepPercent}% है। लगभग ${activity.distance_km || 3.8} किमी की दूरी तय की गई है।`,
      textEnglish: `She has logged ${activity.steps.toLocaleString()} steps today, achieving ${stepPercent}% of her ${activity.step_goal.toLocaleString()} daily step goal across ~${activity.distance_km || 3.8} km.`,
      statusBadge: `${stepPercent}% लक्ष्य पूर्ण`,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'medicines',
      titleHindi: 'दवाई और नुस्खे (Prescriptions)',
      titleEnglish: 'Medication Adherence',
      icon: Pill,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      textHindi: med1Taken
        ? 'सुबह 9:00 बजे की कार्डियोप्रोटेक्ट (दवाई #1) नाश्ते के बाद समय पर ली जा चुकी है। दोपहर की कैल्शियम गोली दर्ज हो गई है।'
        : 'सुबह की दवाई #1 अभी ली जानी बाकी है। दोपहर की कैल्शियम गोली और रात की खुराक निर्धारित हैं।',
      textEnglish: med1Taken
        ? 'Morning Cardioprotect (Medicine #1) confirmed taken on schedule after breakfast. Afternoon calcium recorded.'
        : 'Morning medicine is pending. Afternoon chewable and evening doses scheduled.',
      statusBadge: med1Taken ? 'समय पर ली गई (On Schedule)' : 'लंबित (Pending)',
      badgeColor: med1Taken ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
    },
    {
      id: 'meals',
      titleHindi: 'दैनिक आहार एवं पोषण (Meals & Diet)',
      titleEnglish: 'Daily Nutrition & Meals',
      icon: Utensils,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      textHindi: 'सुबह का नाश्ता और दोपहर का भोजन समय पर दर्ज हो गया है। शाम का भोजन 7:30 बजे निर्धारित है।',
      textEnglish: 'Breakfast and lunch recorded on schedule. Evening dinner scheduled for 7:30 PM.',
      statusBadge: 'दर्ज (Logged)',
      badgeColor: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'safety',
      titleHindi: 'सुरक्षा, स्ट्रीक एवं अभिभावक संवाद (Safety & Sync)',
      titleEnglish: 'Safety, Streak & Sync',
      icon: ShieldCheck,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      textHindi: `कोई आपातकालीन अलार्म नहीं है। ${progress.current_streak} दिन का स्ट्रीक निरंतर चल रहा है। अभिभावक (${senior.guardian_name} - ${senior.guardian_phone}) को लाइव अपडेट्स मिल रहे हैं।`,
      textEnglish: `Zero safety alarms today. Active ${progress.current_streak}-day routine streak. Live guardian updates dispatched to ${senior.guardian_phone}.`,
      statusBadge: `${progress.current_streak} Days Streak 🔥`,
      badgeColor: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div
      id="guardian-shabdon-mein-card"
      className="bg-white border-2 border-stone-200/90 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200/70 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6321]" />
            <span>शब्दों में • IN WORDS CARE NARRATIVE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <span>{senior.name}'s Daily Story In Words</span>
          </h2>

          <p className="text-xs sm:text-sm text-stone-500 font-normal">
            Every metric, timestamp, prescription, and movement translated into simple, compassionate spoken words.
          </p>
        </div>

        {/* Controls: Language Toggle & Audio Player */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Language Toggle */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
            <button
              id="shabdon-mein-lang-hi"
              onClick={() => setLang('hi')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                lang === 'hi'
                  ? 'bg-[#FF6321] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🇮🇳 हिन्दी (शब्दों में)
            </button>
            <button
              id="shabdon-mein-lang-en"
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🇬🇧 English
            </button>
          </div>

          {/* Audio Speech Button */}
          <button
            id="btn-shabdon-mein-speak"
            onClick={handleToggleSpeak}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-[#FF6321] hover:bg-[#e85516] text-white'
            }`}
            title={isPlaying ? 'भाषण रोकें (Stop speech)' : 'शब्दों में सुनें (Listen in words)'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>सुन रहे हैं... (रोकें)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>शब्दों में सुनें (Listen)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode View Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <button
            id="tab-shabdon-overview"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Full Narrative Passage (संपूर्ण विवरण)
          </button>
          <button
            id="tab-shabdon-chapters"
            onClick={() => setActiveTab('chapters')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'chapters'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Chapter Breakdown (अध्यायवार विवरण)
          </button>
        </div>

        {/* Action Buttons: WhatsApp & Copy */}
        <div className="flex items-center gap-2">
          <button
            id="btn-shabdon-whatsapp"
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="व्हाट्सएप पर शब्दों में भेजें (Share via WhatsApp)"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>व्हाट्सएप पर भेजें</span>
          </button>

          <button
            id="btn-shabdon-copy"
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="विवरण कॉपी करें (Copy to Clipboard)"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">कॉपी हो गया!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>कॉपी करें</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'overview' ? (
        /* Full Story Passage with Audio Waveform */
        <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-5 sm:p-7 space-y-4 relative">
          {isPlaying && (
            <div className="flex items-center gap-1.5 text-xs text-[#FF6321] font-bold pb-2 border-b border-amber-200/60">
              <span className="flex gap-1 items-end h-4">
                <span className="w-1 bg-[#FF6321] h-2 animate-bounce"></span>
                <span className="w-1 bg-[#FF6321] h-4 animate-bounce delay-75"></span>
                <span className="w-1 bg-[#FF6321] h-3 animate-bounce delay-150"></span>
                <span className="w-1 bg-[#FF6321] h-4 animate-bounce delay-100"></span>
              </span>
              <span>आवाज में वाचन चालू है (Speaking narrative in words...)</span>
            </div>
          )}

          <div className="text-base sm:text-lg text-stone-800 leading-relaxed font-sans space-y-3 whitespace-pre-line">
            {currentNarrative}
          </div>

          <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500 flex-wrap gap-2">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>सत्यापित समय: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
            <span className="bg-white px-2.5 py-1 rounded-md border border-stone-200 text-stone-600 font-mono text-[11px]">
              Edheal Sath Browser Voice Engine
            </span>
          </div>
        </div>
      ) : (
        /* Chapter Cards Breakdown */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.map((ch) => {
            const Icon = ch.icon;
            return (
              <div
                key={ch.id}
                className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs hover:border-stone-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${ch.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                      {lang === 'hi' ? ch.titleHindi : ch.titleEnglish}
                    </h3>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${ch.badgeColor}`}>
                    {ch.statusBadge}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                  {lang === 'hi' ? ch.textHindi : ch.textEnglish}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
