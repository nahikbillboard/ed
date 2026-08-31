import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Footprints,
  Utensils,
  Pill,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Flame,
  Clock,
  BedDouble,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Mic,
  MicOff,
  Send,
  Shield,
  Heart,
  ArrowRight,
  MessageCircle,
  ExternalLink,
  Activity,
  Award,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Senior, DailyRoutine, DailyActivity, SeniorProgress, Medicine } from '../../types';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';

interface SeniorOnePageFlowProps {
  senior: Senior;
  routine: DailyRoutine;
  activity: DailyActivity;
  progress: SeniorProgress;
  medicines: Medicine[];
  onTaskCompleted?: (updatedRoutine: DailyRoutine, updatedProg: SeniorProgress, whatsappData?: any) => void;
  onNavigateHome: () => void;
  onOpenSos: () => void;
}

export const SeniorOnePageFlow: React.FC<SeniorOnePageFlowProps> = ({
  senior,
  routine,
  activity,
  progress,
  medicines,
  onTaskCompleted,
  onNavigateHome,
  onOpenSos,
}) => {
  // 9 Sequential Steps in the Daily Routine
  const stepsConfig = [
    {
      id: 'wakeup',
      stepNum: 1,
      title: 'Wake-Up & Morning Check-In',
      titleHi: 'सुप्रभात व सुबह का चेक-इन',
      subtitle: 'Start your morning with positive energy and hydration',
      icon: '🌅',
      time: senior.wake_time || '07:15 AM',
      xp: 50,
      badge: 'Morning Vitality',
      status: routine.wake_status === 'completed',
    },
    {
      id: 'walk',
      stepNum: 2,
      title: 'Morning Walk',
      titleHi: 'सुबह की सैर',
      subtitle: 'Gentle morning walk to invigorate your body and heart',
      icon: '🚶‍♀️',
      time: '07:30 AM',
      xp: 50,
      badge: 'Active Steps',
      status: (activity.steps || 0) >= (activity.step_goal || 8000) || routine.walking_status === 'completed',
    },
    {
      id: 'yoga',
      stepNum: 3,
      title: 'Morning Yoga & Mobility',
      titleHi: 'योग और व्यायाम',
      subtitle: 'Gentle chair yoga stretches for joints, neck and back',
      icon: '🧘',
      time: '08:00 AM',
      xp: 70,
      badge: 'Joint Mobility',
      status: routine.yoga_status === 'completed',
    },
    {
      id: 'breakfast',
      stepNum: 4,
      title: 'Breakfast',
      titleHi: 'सुबह का नाश्ता',
      subtitle: 'Nutritious morning fuel and hydration',
      icon: '🥣',
      time: senior.breakfast_time || '08:30 AM',
      xp: 40,
      badge: 'Morning Nutrition',
      status: routine.breakfast_status === 'completed',
    },
    {
      id: 'breakfast_medicine',
      stepNum: 5,
      title: 'After-Breakfast Medicine',
      titleHi: 'सुबह की दवाई (Medicine #1)',
      subtitle: 'Cardioprotect & Multivitamin (1 tablet with water)',
      icon: '💊',
      time: '09:00 AM',
      xp: 40,
      badge: 'Prescription #1',
      status: routine.breakfast_medicine_status === 'completed' || routine.medicine_status === 'completed',
    },
    {
      id: 'lunch',
      stepNum: 6,
      title: 'Lunch',
      titleHi: 'दोपहर का भोजन',
      subtitle: 'Wholesome midday meal for sustained vitality',
      icon: '🥗',
      time: senior.lunch_time || '01:00 PM',
      xp: 40,
      badge: 'Midday Meal',
      status: routine.lunch_status === 'completed',
    },
    {
      id: 'nap',
      stepNum: 7,
      title: 'Afternoon Rest & Nap',
      titleHi: 'दोपहर का विश्राम',
      subtitle: 'Calming rest and power rejuvenation',
      icon: '😴',
      time: '03:00 PM',
      xp: 40,
      badge: 'Rest & Recovery',
      status: routine.nap_status === 'completed',
    },
    {
      id: 'dinner',
      stepNum: 8,
      title: 'Dinner',
      titleHi: 'रात का खाना',
      subtitle: 'Light evening meal & hydration before sleep',
      icon: '🍲',
      time: senior.dinner_time || '07:30 PM',
      xp: 40,
      badge: 'Evening Meal',
      status: routine.dinner_status === 'completed',
    },
    {
      id: 'night_medicine',
      stepNum: 9,
      title: 'Night Medicine & Goodnight',
      titleHi: 'रात की दवाई और शुभ रात्रि',
      subtitle: 'Neuro-Calm & Sleep Support (1 tablet) before restful sleep',
      icon: '🌙',
      time: senior.night_medicine_time || '08:30 PM',
      xp: 40,
      badge: 'Night Care',
      status: routine.dinner_medicine_status === 'completed' || routine.night_medicine_status === 'completed',
    },
  ];

  // Find the first uncompleted step or default to 0
  const findFirstIncompleteIndex = () => {
    const idx = stepsConfig.findIndex((s) => !s.status);
    return idx !== -1 ? idx : 0;
  };

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(findFirstIncompleteIndex);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);

  // Dish choices for meals
  const breakfastDishes = [
    'Warm Oatmeal with Berries & Almonds',
    'Vegetable Upma & Hot Chai',
    'Poha with Fresh Lemon & Roasted Peanuts',
    'Idli Sambhar with Coconut Chutney',
    'Whole Wheat Toast with Boiled Eggs',
    'Fresh Fruit Bowl with Curd',
  ];

  const lunchDishes = [
    'Steamed Rice with Dal & Mixed Veggies',
    'Whole Wheat Roti with Paneer & Salad',
    'Khichdi with Fresh Curd & Papad',
    'Warm Vegetable Soup with Quinoa',
    'Moong Dal with Steamed Spinach & Rice',
    'Paneer Bhurji with Multigrain Phulka',
  ];

  const dinnerDishes = [
    'Moong Dal Khichdi with Steamed Veggies',
    'Light Vegetable Clear Soup & Multigrain Toast',
    'Soft Phulkas with Yellow Dal Tadka',
    'Steamed Vegetables with Warm Herbal Broth',
    'Warm Porridge with Golden Turmeric Milk',
    'Light Vegetable Dalia with Mint Chutney',
  ];

  // State for meals dish inputs
  const [selectedBreakfastDish, setSelectedBreakfastDish] = useState<string>(breakfastDishes[0]);
  const [selectedLunchDish, setSelectedLunchDish] = useState<string>(lunchDishes[0]);
  const [selectedDinnerDish, setSelectedDinnerDish] = useState<string>(dinnerDishes[0]);
  const [customDishInput, setCustomDishInput] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);

  // Yoga interactive player state
  const yogaPoses = [
    {
      title: '1. Chair Sun Salutation (कुर्सी सूर्य नमस्कार)',
      instructions: 'Sit tall on chair. Inhale, raise arms gently overhead. Exhale, fold forward slowly with hands on knees.',
      duration: 30,
      tip: 'Breathe deeply and gently without straining joints.',
    },
    {
      title: '2. Seated Spinal Twist (रीढ़ का घुमाव)',
      instructions: 'Sit upright, place right hand on left knee, gently turn torso to the left. Hold for 15s, then switch sides.',
      duration: 30,
      tip: 'Keep shoulders relaxed and chest open.',
    },
    {
      title: '3. Gentle Shoulder & Neck Rolls (कंधे व गर्दन का व्यायाम)',
      instructions: 'Slowly roll shoulders backward 5 times, then forward 5 times. Tilt head gently ear-to-shoulder.',
      duration: 30,
      tip: 'Smooth continuous circular movements.',
    },
  ];

  const [activeYogaPoseIndex, setActiveYogaPoseIndex] = useState<number>(0);
  const [yogaSecondsLeft, setYogaSecondsLeft] = useState<number>(30);
  const [isYogaRunning, setIsYogaRunning] = useState<boolean>(false);
  const yogaTimerRef = useRef<any>(null);

  // Walking simulation step counter
  const [simSteps, setSimSteps] = useState<number>(activity.steps || 5420);

  // Auto-speak on step transition
  useEffect(() => {
    const currentStep = stepsConfig[currentStepIndex];
    if (currentStep) {
      if (currentStep.id === 'wakeup') {
        speakText(`सुप्रभात ${senior.name} जी! आपका आज का पहला कदम जागने का चेक-इन है।`);
      } else if (currentStep.id === 'walk') {
        speakText(`${senior.name} जी, अब सुबह की सैर का समय है। आइए कदम पूरे करें।`);
      } else if (currentStep.id === 'yoga') {
        speakText(`${senior.name} जी, अब सुबह का योग और स्ट्रेचिंग शुरू करते हैं।`);
      } else if (currentStep.id === 'breakfast') {
        speakText(`${senior.name} जी, नाश्ते का समय हो गया है। आपने क्या खाया चुनिए।`);
      } else if (currentStep.id === 'breakfast_medicine') {
        speakText(`${senior.name} जी, नाश्ते के बाद की दवाई नंबर एक लेने का समय है।`);
      } else if (currentStep.id === 'lunch') {
        speakText(`${senior.name} जी, दोपहर के भोजन का समय हो गया है।`);
      } else if (currentStep.id === 'nap') {
        speakText(`${senior.name} जी, दोपहर के विश्राम का समय है। आराम कीजिए।`);
      } else if (currentStep.id === 'dinner') {
        speakText(`${senior.name} जी, रात के खाने का समय है। आपने क्या खाया चुनिए, यह गार्जियन ऐप पर दिखेगा।`);
      } else if (currentStep.id === 'night_medicine') {
        speakText(`${senior.name} जी, रात की दवाई लीजिए और अच्छी नींद सोइए।`);
      }
    }
  }, [currentStepIndex]);

  // Yoga countdown timer
  useEffect(() => {
    if (isYogaRunning && yogaSecondsLeft > 0) {
      yogaTimerRef.current = setInterval(() => {
        setYogaSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (yogaSecondsLeft === 0 && isYogaRunning) {
      setIsYogaRunning(false);
      playChime('ding');
      if (activeYogaPoseIndex < yogaPoses.length - 1) {
        setActiveYogaPoseIndex((prev) => prev + 1);
        setYogaSecondsLeft(30);
        speakText(`बहुत बढ़िया! अब अगला आसन: ${yogaPoses[activeYogaPoseIndex + 1].title}`);
      } else {
        speakText(`शाबाश ${senior.name} जी! आज के सभी योग आसन पूरे हो गए हैं।`);
      }
    }
    return () => {
      if (yogaTimerRef.current) clearInterval(yogaTimerRef.current);
    };
  }, [isYogaRunning, yogaSecondsLeft, activeYogaPoseIndex]);

  // Voice speech-to-text recognition for dinner / meals
  const handleVoiceInput = (meal: 'breakfast' | 'lunch' | 'dinner') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can tap any suggested dish below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);
      speakText('बोलिए, आपने क्या खाया?');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          if (meal === 'breakfast') setSelectedBreakfastDish(transcript);
          else if (meal === 'lunch') setSelectedLunchDish(transcript);
          else setSelectedDinnerDish(transcript);

          playChime('success');
          speakText(`दर्ज किया गया: ${transcript}`);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Main Action: Tick the current step & automatically advance to next page!
  const handleTickAndAdvance = async () => {
    const currentStep = stepsConfig[currentStepIndex];
    setLoadingAction(true);
    playChime('success');

    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.6 },
    });

    try {
      let taskType = currentStep.id;
      let taskTitle = currentStep.title;
      let taskDetails = currentStep.subtitle;

      if (currentStep.id === 'wakeup') {
        taskType = 'wakeup';
        taskTitle = 'Morning Wake-Up Check-In';
        taskDetails = 'Sunita checked in awake and refreshed';
        const res = await ApiClient.completeRoutineTask(senior.id, 'wakeup', taskTitle, taskDetails);
        if (onTaskCompleted) onTaskCompleted(res.routine, res.progress);
        speakText(`शाबाश ${senior.name} जी! सुबह का चेक-इन हो गया है।`);
      } else if (currentStep.id === 'walk') {
        taskType = 'walk';
        taskTitle = 'Daily Walk';
        taskDetails = `${simSteps} steps completed on schedule`;
        const res = await ApiClient.completeRoutineTask(senior.id, 'walk', taskTitle, taskDetails);
        if (onTaskCompleted) onTaskCompleted(res.routine, res.progress);
        speakText(`बधाई हो ${senior.name} जी! आपकी दैनिक वॉक पूरी हो गई है।`);
      } else if (currentStep.id === 'yoga') {
        taskType = 'yoga';
        taskTitle = 'Morning Yoga & Mobility';
        taskDetails = '3 Gentle Chair Yoga routines completed with full stretching';
        const res = await ApiClient.completeRoutineTask(senior.id, 'yoga', taskTitle, taskDetails);
        if (onTaskCompleted) onTaskCompleted(res.routine, res.progress);
        speakText(`शाबाश ${senior.name} जी! सुबह का योग पूरा हो गया है।`);
      } else if (currentStep.id === 'breakfast') {
        taskType = 'breakfast';
        taskTitle = 'Breakfast';
        taskDetails = `Ate: ${selectedBreakfastDish}`;
        const res = await ApiClient.completeMeal('breakfast', senior.id, selectedBreakfastDish);
        if (onTaskCompleted) onTaskCompleted(res.routine, res.progress);
        speakText(`नाश्ता दर्ज हो गया: ${selectedBreakfastDish}। गार्जियन ऐप पर लाइव अपडेट हो गया है।`);
      } else if (currentStep.id === 'breakfast_medicine') {
        taskType = 'breakfast_medicine';
        taskTitle = 'After-Breakfast Medicine';
        taskDetails = 'Medicine #1 (Cardioprotect) taken with water';
        const res = await ApiClient.takeMedicine('med_01', senior.id);
        if (onTaskCompleted) onTaskCompleted(res.routine, res.progress);
        speakText(`दवाई नंबर एक ले ली गई है। आपका स्वास्थ्य सुरक्षित है।`);
      } else if (currentStep.id === 'lunch') {
        taskType = 'lunch';
        taskTitle = 'Lunch';
        taskDetails = `Ate: ${selectedLunchDish}`;
        const res = await ApiClient.completeMeal('lunch', senior.id, selectedLunchDish);
        if (onTaskCompleted) onTaskCompleted(res.routine, res.progress);
        speakText(`दोपहर का खाना दर्ज हो गया: ${selectedLunchDish}। गार्जियन ऐप पर लाइव अपडेट हो गया है।`);
      } else if (currentStep.id === 'nap') {
        taskType = 'nap';
        taskTitle = 'Afternoon Nap & Rest';
        taskDetails = 'Restful power nap completed feeling refreshed';
        const res = await ApiClient.completeRoutineTask(senior.id, 'nap', taskTitle, taskDetails);
        if (onTaskCompleted) onTaskCompleted(res.routine, res.progress);
        speakText(`विश्राम पूरा हुआ। आप बहुत तरोताज़ा महसूस कर रही हैं।`);
      } else if (currentStep.id === 'dinner') {
        taskType = 'dinner';
        taskTitle = 'Dinner';
        taskDetails = `Ate: ${selectedDinnerDish}`;
        const res = await ApiClient.completeMeal('dinner', senior.id, selectedDinnerDish);
        if (onTaskCompleted) onTaskCompleted(res.routine, res.progress);
        speakText(`रात का खाना दर्ज हो गया: ${selectedDinnerDish}। गार्जियन पोर्टल पर लाइव अपडेट हो गया है।`);
      } else if (currentStep.id === 'night_medicine') {
        taskType = 'night_medicine';
        taskTitle = 'Night Medicine & Rest';
        taskDetails = 'Medicine #3 (Neuro-Calm) taken before bed';
        const res = await ApiClient.takeMedicine('med_03', senior.id);
        if (onTaskCompleted) onTaskCompleted(res.routine, res.progress);
        speakText(`रात की दवाई ले ली गई है। शुभ रात्रि ${senior.name} जी! आपकी दिनचर्या पूरी हो गई है।`);
      }

      // Automatically advance to the next step if available!
      if (currentStepIndex < stepsConfig.length - 1) {
        setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1);
        }, 1200);
      }
    } catch (e) {
      console.error('Error completing step:', e);
      if (currentStepIndex < stepsConfig.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const currentStep = stepsConfig[currentStepIndex];
  const totalSteps = stepsConfig.length;
  const completedCount = stepsConfig.filter((s) => s.status).length;
  const progressPct = Math.round((completedCount / totalSteps) * 100);

  return (
    <div id="senior-one-page-app" className="max-w-3xl mx-auto px-4 sm:px-6 py-4 space-y-6 animate-in fade-in duration-300">
      {/* Progress Dots Step Indicator Bar */}
      <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3 border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {stepsConfig.map((s, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isDone = s.status;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#FF6321] text-white shadow-md shadow-orange-500/20 scale-105'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                <span>{s.icon}</span>
                <span className="hidden md:inline">{s.stepNum}. {s.title.split(' ')[0]}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN SINGLE PAGE FOCUSED CARD (In your face only one page) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-xl space-y-6 relative overflow-hidden"
        >
          {/* Top Scheduled Time & XP Badge */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2 text-stone-600 font-semibold text-sm">
              <Clock className="w-4 h-4 text-[#FF6321]" />
              <span>Scheduled: {currentStep.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6321]" />
                <span>+{currentStep.xp} Wellness XP</span>
              </span>
              {currentStep.status && (
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Done ✓</span>
                </span>
              )}
            </div>
          </div>

          {/* Large Focused Heading */}
          <div className="text-center sm:text-left space-y-2">
            <div className="inline-block text-5xl mb-2">{currentStep.icon}</div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 tracking-tight">
              {currentStep.title}
            </h1>
            <p className="text-lg sm:text-xl text-[#FF6321] font-bold">
              {currentStep.titleHi}
            </p>
            <p className="text-base text-stone-600">
              {currentStep.subtitle}
            </p>
          </div>

          {/* ========================================================================= */}
          {/* SECTION-SPECIFIC INTERACTIVE ENGINE INSIDE THIS SINGLE PAGE */}
          {/* ========================================================================= */}

          {/* 1. STEP: WAKE-UP */}
          {currentStep.id === 'wakeup' && (
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Flame className="w-7 h-7 text-orange-500 fill-orange-500 animate-pulse" />
                  <div>
                    <div className="text-base font-extrabold text-stone-900">
                      {progress.current_streak}-Day Morning Streak 🔥
                    </div>
                    <p className="text-xs text-stone-600">
                      You are building incredible health habits with daily consistency!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => speakText('सुप्रभात सुनीता जी! आज का दिन बहुत मंगलमय है। एक गिलास गुनगुना पानी पीएं।')}
                  className="px-3 py-2 bg-white rounded-xl border border-amber-300 text-amber-800 text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Volume2 className="w-4 h-4 text-[#FF6321]" />
                  <span>Morning Audio</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. STEP: WALKING */}
          {currentStep.id === 'walk' && (
            <div className="bg-emerald-50/80 rounded-2xl p-5 border border-emerald-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest">
                    Step Target Progress
                  </span>
                  <div className="text-3xl font-black text-emerald-950 mt-1">
                    {simSteps.toLocaleString()} / 8,000 Steps
                  </div>
                  <p className="text-xs text-emerald-700 mt-1">
                    Walking strengthens heart stamina and eases joint stiffness.
                  </p>
                </div>

                {/* Step Simulators */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSimSteps((prev) => prev + 500);
                      playChime('ding');
                    }}
                    className="px-3 py-2 bg-white text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 hover:bg-emerald-100 shadow-xs cursor-pointer"
                  >
                    +500 Steps Walked
                  </button>
                  <button
                    onClick={() => {
                      setSimSteps(8000);
                      playChime('success');
                    }}
                    className="px-3 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 shadow-xs cursor-pointer"
                  >
                    Set 8,000 Goal Complete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. STEP: YOGA (Interactive Guided Player on this single page) */}
          {currentStep.id === 'yoga' && (
            <div className="bg-orange-50/70 rounded-2xl p-5 border border-orange-200 space-y-5">
              <div className="flex items-center justify-between border-b border-orange-200 pb-3">
                <span className="text-xs font-extrabold text-[#FF6321] uppercase tracking-wider">
                  Chair Yoga Routine ({activeYogaPoseIndex + 1} of {yogaPoses.length})
                </span>
                <span className="text-xs font-bold text-stone-600 bg-white px-2.5 py-1 rounded-full border border-orange-200">
                  Pose Timer: {yogaSecondsLeft}s
                </span>
              </div>

              {/* Active Pose Card */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-stone-900">
                  {yogaPoses[activeYogaPoseIndex].title}
                </h3>
                <p className="text-sm text-stone-700 leading-relaxed font-normal bg-white p-3.5 rounded-xl border border-orange-100">
                  {yogaPoses[activeYogaPoseIndex].instructions}
                </p>
                <p className="text-xs text-[#FF6321] font-semibold italic">
                  💡 Safety Tip: {yogaPoses[activeYogaPoseIndex].tip}
                </p>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsYogaRunning(!isYogaRunning)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm shadow-md transition-all cursor-pointer ${
                      isYogaRunning
                        ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                        : 'bg-[#FF6321] hover:bg-[#e05316] text-white'
                    }`}
                  >
                    {isYogaRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    <span>{isYogaRunning ? 'Pause Timer' : 'Start Guided Pose'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsYogaRunning(false);
                      setYogaSecondsLeft(30);
                    }}
                    className="p-2.5 bg-white text-stone-700 rounded-xl border border-stone-300 hover:bg-stone-100 cursor-pointer"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {yogaPoses.map((_, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => {
                        setActiveYogaPoseIndex(pIdx);
                        setYogaSecondsLeft(30);
                        setIsYogaRunning(false);
                      }}
                      className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        activeYogaPoseIndex === pIdx
                          ? 'bg-[#FF6321] text-white font-black'
                          : 'bg-white text-stone-600 border border-stone-200'
                      }`}
                    >
                      {pIdx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. STEP: BREAKFAST */}
          {currentStep.id === 'breakfast' && (
            <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#FF6321]" />
                  <span>आपने नाश्ते में क्या खाया? (Select Breakfast Dish)</span>
                </label>

                <button
                  onClick={() => handleVoiceInput('breakfast')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-white text-stone-800 border border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#FF6321]" />}
                  <span>{isListening ? 'Listening...' : 'Voice Mic'}</span>
                </button>
              </div>

              {/* 1-Tap Quick Dishes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {breakfastDishes.map((dish) => (
                  <button
                    key={dish}
                    onClick={() => setSelectedBreakfastDish(dish)}
                    className={`p-3 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                      selectedBreakfastDish === dish
                        ? 'bg-[#FF6321] text-white border-[#FF6321] shadow-sm font-bold'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-100/50'
                    }`}
                  >
                    🥣 {dish}
                  </button>
                ))}
              </div>

              {/* Readout of what was selected */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Logged for Breakfast:
                  </span>
                  <div className="text-sm font-black text-stone-900 mt-0.5">
                    {selectedBreakfastDish}
                  </div>
                </div>
                <button
                  onClick={() => speakText(`नाश्ता: ${selectedBreakfastDish}`)}
                  className="p-2 bg-amber-50 text-[#FF6321] rounded-lg border border-amber-200"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 5. STEP: BREAKFAST MEDICINE */}
          {currentStep.id === 'breakfast_medicine' && (
            <div className="bg-blue-50/60 rounded-2xl p-5 border border-blue-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-sm">
                  💊
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    Medicine #1: Cardioprotect (Lisinopril 10mg) + Multivitamin
                  </h3>
                  <p className="text-xs text-blue-900 font-medium">
                    Dosage: 1 tablet with a full glass of lukewarm water after breakfast.
                  </p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
                <span className="text-stone-600 font-semibold">Current Stock Remaining:</span>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  {medicines[0]?.quantity_remaining || 28} tablets
                </span>
              </div>
            </div>
          )}

          {/* 6. STEP: LUNCH */}
          {currentStep.id === 'lunch' && (
            <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  <span>दोपहर में क्या खाया? (Select Lunch Dish)</span>
                </label>

                <button
                  onClick={() => handleVoiceInput('lunch')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-white text-stone-800 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{isListening ? 'Listening...' : 'Voice Mic'}</span>
                </button>
              </div>

              {/* 1-Tap Quick Dishes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lunchDishes.map((dish) => (
                  <button
                    key={dish}
                    onClick={() => setSelectedLunchDish(dish)}
                    className={`p-3 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                      selectedLunchDish === dish
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-emerald-50'
                    }`}
                  >
                    🥗 {dish}
                  </button>
                ))}
              </div>

              {/* Readout */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Logged for Lunch:
                  </span>
                  <div className="text-sm font-black text-stone-900 mt-0.5">
                    {selectedLunchDish}
                  </div>
                </div>
                <button
                  onClick={() => speakText(`दोपहर का खाना: ${selectedLunchDish}`)}
                  className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 7. STEP: AFTERNOON NAP */}
          {currentStep.id === 'nap' && (
            <div className="bg-indigo-50/60 rounded-2xl p-5 border border-indigo-200 space-y-4">
              <div className="flex items-center gap-3">
                <BedDouble className="w-8 h-8 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    Afternoon Rest & Power Rejuvenation
                  </h3>
                  <p className="text-xs text-indigo-900 font-medium">
                    A 30-45 minute restful break restores cognitive energy and lowers blood pressure.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 8. STEP: DINNER (Explicitly highlighted by User Request!) */}
          {currentStep.id === 'dinner' && (
            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 rounded-2xl p-5 sm:p-6 border-2 border-amber-300 shadow-md space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs font-black text-[#FF6321] uppercase tracking-wider bg-orange-100 px-2.5 py-1 rounded-full">
                    आज रात का भोजन (Tonight's Dinner)
                  </span>
                  <h3 className="text-xl font-serif font-black text-stone-900 mt-1">
                    What did you have for dinner?
                  </h3>
                </div>

                {/* Voice Input Button */}
                <button
                  onClick={() => handleVoiceInput('dinner')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-xs cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-white text-stone-900 border border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-[#FF6321]" />}
                  <span>{isListening ? 'Listening to your voice...' : 'Speak What You Ate (बोलकर बताएं)'}</span>
                </button>
              </div>

              {/* 1-Tap Quick Dishes List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-600">
                  Tap your meal (या नीचे से कोई एक चुनें):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dinnerDishes.map((dish) => (
                    <button
                      key={dish}
                      onClick={() => {
                        setSelectedDinnerDish(dish);
                        playChime('ding');
                      }}
                      className={`p-3.5 rounded-2xl text-left text-xs sm:text-sm transition-all border-2 cursor-pointer flex items-center justify-between gap-2 ${
                        selectedDinnerDish === dish
                          ? 'bg-[#FF6321] text-white border-[#FF6321] font-bold shadow-md shadow-orange-500/20 scale-101'
                          : 'bg-white text-stone-800 border-stone-200 hover:border-amber-400 hover:bg-amber-50/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>🍲</span>
                        <span>{dish}</span>
                      </span>
                      {selectedDinnerDish === dish && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* "BOTTOM I WILL READ WHAT I ATE & TRANSMIT TO GUARDIAN" AS REQUESTED! */}
              {/* ========================================================================= */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-300 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>📋 खाया गया भोजन (What Sunita Ate & Reads Back):</span>
                  </div>
                  <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    Live Verified
                  </span>
                </div>

                <div className="text-lg sm:text-xl font-serif font-black text-stone-900 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  “{selectedDinnerDish}”
                </div>

                {/* Read Aloud Audio Control + Guardian Sync Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <button
                    onClick={() => speakText(`सुनीता जी ने रात के खाने में खाया: ${selectedDinnerDish}।`)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-stone-900 border border-amber-300 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-[#FF6321]" />
                    <span>🔊 सुनिए क्या खाया (Read Aloud Audio)</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>📡 Live Sync with Guardian Portal (David Vance)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. STEP: NIGHT MEDICINE */}
          {currentStep.id === 'night_medicine' && (
            <div className="bg-purple-50/60 rounded-2xl p-5 border border-purple-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-2xl shadow-sm">
                  💊
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    Medicine #3: Neuro-Calm & Sleep Support
                  </h3>
                  <p className="text-xs text-purple-900 font-medium">
                    Dosage: 1 tablet before bedtime to support restorative sleep.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* THE GIANT "DONE" BUTTON */}
          {/* ========================================================================= */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Step Navigation (Previous / Next) */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentStepIndex === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-700 font-bold text-sm rounded-2xl border border-stone-200 cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setCurrentStepIndex((prev) => Math.min(stepsConfig.length - 1, prev + 1))}
                disabled={currentStepIndex === stepsConfig.length - 1}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-700 font-bold text-sm rounded-2xl border border-stone-200 cursor-pointer transition-all"
              >
                <span>Skip / Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Giant Done Button */}
            <button
              id={`onepage-tick-btn-${currentStep.id}`}
              onClick={handleTickAndAdvance}
              disabled={loadingAction}
              className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-lg sm:text-xl shadow-xl transition-all active:scale-95 cursor-pointer ${
                currentStep.status
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-[#FF6321] via-orange-500 to-amber-500 hover:brightness-105 text-white shadow-orange-500/30'
              }`}
            >
              {loadingAction ? (
                <>
                  <Sparkles className="w-6 h-6 animate-spin" />
                  <span>Updating Guardian App...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 text-white" />
                  <span>Done ✓ (पूरा हुआ)</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Emergency SOS Banner at bottom of one-page flow */}
      <div className="bg-stone-900 text-white rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 border border-stone-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Need Help or Feeling Unwell?</div>
            <div className="text-xs text-stone-400">Press SOS to instantly alert {senior.guardian_name || 'David Vance'}.</div>
          </div>
        </div>
        <button
          onClick={onOpenSos}
          className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition-transform cursor-pointer"
        >
          🚨 SOS ALARM
        </button>
      </div>
    </div>
  );
};
