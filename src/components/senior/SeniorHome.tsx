import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sun, 
  Footprints, 
  Utensils, 
  Pill, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Clock, 
  BedDouble, 
  Check, 
  ExternalLink, 
  Play, 
  ArrowRight,
  Send,
  MessageCircle,
  Activity,
  Trophy,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Senior, DailyRoutine, DailyActivity, SeniorProgress, Medicine } from '../../types';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';
import { redirectWithWhatsApp, DEFAULT_GUARDIAN_PHONE } from '../../utils/whatsappHelper';
import { StreakCelebrationModal } from './StreakCelebrationModal';

interface SeniorHomeProps {
  senior: Senior;
  routine: DailyRoutine;
  activity: DailyActivity;
  progress: SeniorProgress;
  medicines: Medicine[];
  onNavigate: (view: 'wakeup' | 'walking' | 'breathing' | 'yoga' | 'meals' | 'medicines' | 'rewards' | 'breakfast' | 'lunch' | 'dinner' | 'breakfast_medicine' | 'lunch_medicine' | 'dinner_medicine') => void;
  onOpenSos: () => void;
  onTaskCompleted?: (updatedRoutine: DailyRoutine, updatedProg: SeniorProgress, whatsappData?: any) => void;
}

export const SeniorHome: React.FC<SeniorHomeProps> = ({
  senior,
  routine,
  activity,
  progress,
  medicines,
  onNavigate,
  onOpenSos,
  onTaskCompleted,
}) => {
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [showStreakModal, setShowStreakModal] = useState(false);

  const isAwake = routine.wake_status === 'completed';
  const stepsTaken = activity.steps || 0;
  const stepGoal = activity.step_goal || 8000;
  const isWalkingDone = stepsTaken >= stepGoal || routine.walking_status === 'completed';

  // 8 sequential tasks following the Daily Walk
  const routineSequence = [
    {
      id: 'yoga',
      taskType: 'yoga' as const,
      number: 1,
      title: 'Morning Yoga',
      subtitle: 'Gentle chair yoga & mobility stretches',
      time: '08:00 AM',
      icon: '🧘',
      isCompleted: routine.yoga_status === 'completed',
      xp: 70,
      badge: 'Joint Mobility',
      viewTarget: 'yoga' as const,
      details: 'Gentle chair yoga & mobility stretches completed'
    },
    {
      id: 'breakfast',
      taskType: 'breakfast' as const,
      number: 2,
      title: 'Breakfast',
      subtitle: 'Warm oatmeal, fresh berries & hydration',
      time: senior.breakfast_time || '08:30 AM',
      icon: '🥣',
      isCompleted: routine.breakfast_status === 'completed',
      xp: 40,
      badge: 'Morning Nutrition',
      viewTarget: 'breakfast' as const,
      details: 'Healthy breakfast enjoyed with warm beverage'
    },
    {
      id: 'breakfast_medicine',
      taskType: 'breakfast_medicine' as const,
      number: 3,
      title: 'After-Breakfast Medicine',
      subtitle: 'Medicine #1 — Cardioprotect & Multivitamin (1 tab)',
      time: '09:00 AM',
      icon: '💊',
      isCompleted: routine.breakfast_medicine_status === 'completed' || routine.medicine_status === 'completed',
      xp: 40,
      badge: 'Prescription #1',
      viewTarget: 'breakfast_medicine' as const,
      details: 'Medicine #1 (Cardioprotect) taken on time with water'
    },
    {
      id: 'lunch',
      taskType: 'lunch' as const,
      number: 4,
      title: 'Lunch',
      subtitle: 'Steamed vegetable soup & whole grain nourishment',
      time: senior.lunch_time || '01:00 PM',
      icon: '🥗',
      isCompleted: routine.lunch_status === 'completed',
      xp: 40,
      badge: 'Midday Meal',
      viewTarget: 'lunch' as const,
      details: 'Midday wholesome lunch completed'
    },
    {
      id: 'lunch_medicine',
      taskType: 'lunch_medicine' as const,
      number: 5,
      title: 'After-Lunch Medicine',
      subtitle: 'Medicine #2 — Calcium & Joint Vitality (1 chewable)',
      time: '01:30 PM',
      icon: '💊',
      isCompleted: routine.lunch_medicine_status === 'completed',
      xp: 40,
      badge: 'Prescription #2',
      viewTarget: 'lunch_medicine' as const,
      details: 'Medicine #2 (Calcium & Joint Vitality) taken after lunch'
    },
    {
      id: 'nap',
      taskType: 'nap' as const,
      number: 6,
      title: 'Sleep Nap',
      subtitle: 'Afternoon power nap & resting rejuvenation',
      time: '03:00 PM',
      icon: '😴',
      isCompleted: routine.nap_status === 'completed',
      xp: 40,
      badge: 'Rest & Recovery',
      viewTarget: 'breathing' as const,
      details: 'Restful afternoon nap completed, feeling refreshed'
    },
    {
      id: 'dinner',
      taskType: 'dinner' as const,
      number: 7,
      title: 'Dinner',
      subtitle: 'Light evening meal, grilled protein & herbal tea',
      time: senior.dinner_time || '07:30 PM',
      icon: '🍲',
      isCompleted: routine.dinner_status === 'completed',
      xp: 40,
      badge: 'Evening Meal',
      viewTarget: 'dinner' as const,
      details: 'Evening dinner enjoyed with hydration'
    },
    {
      id: 'dinner_medicine',
      taskType: 'dinner_medicine' as const,
      number: 8,
      title: 'After-Dinner Medicine',
      subtitle: 'Medicine #3 — Night Neuro-Calm & Sleep Support',
      time: senior.night_medicine_time || '08:30 PM',
      icon: '💊',
      isCompleted: routine.dinner_medicine_status === 'completed' || routine.night_medicine_status === 'completed',
      xp: 40,
      badge: 'Prescription #3',
      viewTarget: 'dinner_medicine' as const,
      details: 'Medicine #3 (Night Neuro-Calm) taken before bed'
    }
  ];

  // Calculate routine completion percentage including Walk + 8 sequential tasks
  const allTasksList = [isWalkingDone, ...routineSequence.map(s => s.isCompleted)];
  const totalCount = allTasksList.length;
  const completedCount = allTasksList.filter(Boolean).length;
  const routinePct = Math.round((completedCount / totalCount) * 100);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getDayGreetingSubtitle = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const dayStr = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    return `It is ${timeStr} • ${dayStr}`;
  };

  // Direct completion of a routine step with WhatsApp redirect to 9561442888
  const handleMarkTaskDone = async (task: typeof routineSequence[0], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLoadingTask(task.id);
    playChime('success');

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });

    // Synchronously pre-open tab in click event loop to bypass popup blocking
    let waWin: Window | null = null;
    try {
      waWin = window.open('about:blank', '_blank');
    } catch (err) {
      console.warn('Pre-open popup blocked:', err);
    }

    try {
      // 1. Update backend routine state & dispatch server notifications
      const res = await ApiClient.completeRoutineTask(senior.id, task.taskType, task.title, task.details);
      
      if (onTaskCompleted) {
        onTaskCompleted(res.routine, res.progress, res.whatsapp);
      }

      speakText(`Well done, ${senior.name}! ${task.title} is completed and verified.`);

      // 2. Automatically redirect to WhatsApp with ready message for 9561442888
      redirectWithWhatsApp(task.title, senior.name, task.details, senior.guardian_phone || DEFAULT_GUARDIAN_PHONE, waWin);
    } catch (err) {
      console.error('Failed to complete routine task:', err);
      // Fallback direct redirection even if offline
      redirectWithWhatsApp(task.title, senior.name, task.details, senior.guardian_phone || DEFAULT_GUARDIAN_PHONE, waWin);
    } finally {
      setLoadingTask(null);
    }
  };

  // Handler for completing Daily Walk directly
  const handleCompleteDailyWalk = async () => {
    setLoadingTask('walk');
    playChime('success');
    confetti({ particleCount: 70, spread: 60 });

    let waWin: Window | null = null;
    try {
      waWin = window.open('about:blank', '_blank');
    } catch (err) {
      console.warn('Pre-open popup blocked:', err);
    }

    try {
      const res = await ApiClient.completeRoutineTask(senior.id, 'walk', 'Daily Walk', `${stepGoal} steps target achieved`);
      if (onTaskCompleted) {
        onTaskCompleted(res.routine, res.progress, res.whatsapp);
      }
      speakText(`Congratulations, ${senior.name}! Daily Walk completed. Message dispatched to your family.`);
      redirectWithWhatsApp('Daily Walk', senior.name, `${stepGoal} steps completed on schedule`, senior.guardian_phone || DEFAULT_GUARDIAN_PHONE, waWin);
    } catch (e) {
      console.error('Failed to complete walk:', e);
      redirectWithWhatsApp('Daily Walk', senior.name, `${stepGoal} steps completed on schedule`, senior.guardian_phone || DEFAULT_GUARDIAN_PHONE, waWin);
    } finally {
      setLoadingTask(null);
    }
  };

  return (
    <div id="senior-home-hub" className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-300">
      {/* Top Greeting & Senior Profile */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <h1 className="text-4xl sm:text-5xl font-serif text-stone-900 tracking-tight">
            {getGreeting()}, {senior.name.split(' ')[0]} ❤️
          </h1>
          <p className="text-lg sm:text-xl text-stone-500 mt-1 font-sans">
            {getDayGreetingSubtitle()}
          </p>
        </div>

        <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStreakModal(true)}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-extrabold text-base sm:text-lg flex items-center gap-2 cursor-pointer shadow-md shadow-orange-300/50 hover:shadow-lg transition-all"
          >
            <motion.span 
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="text-xl sm:text-2xl"
            >
              🔥
            </motion.span>
            <span>{progress.current_streak} DAY STREAK</span>
          </motion.div>
          <div 
            onClick={() => onNavigate('rewards')}
            className="text-stone-500 font-bold uppercase tracking-widest text-xs sm:text-sm pl-1 cursor-pointer hover:text-stone-700 transition-colors"
          >
            {progress.total_xp} Wellness XP
          </div>
        </div>
      </header>

      {/* Wake-Up Check-in Hero Button if not awake */}
      {!isAwake && (
        <div className="space-y-2">
          <button
            id="senior-home-awake-btn"
            onClick={() => onNavigate('wakeup')}
            className="w-full bg-[#FF6321] hover:bg-[#e85516] text-white py-8 sm:py-10 rounded-[36px] sm:rounded-[40px] text-2xl sm:text-4xl font-bold shadow-xl shadow-orange-200/80 active:scale-95 transition-all flex items-center justify-center gap-4 cursor-pointer"
          >
            <Sun className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
            <span>I'M AWAKE ☀️</span>
          </button>
          <p className="text-center text-stone-500 text-sm sm:text-base font-medium">
            Tap to notify guardian ({senior.guardian_phone || DEFAULT_GUARDIAN_PHONE}) & claim +50 XP streak bonus!
          </p>
        </div>
      )}

      {/* Daily Routine Overall Progress Header */}
      <div className="bg-white border border-stone-200 rounded-[32px] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
              ✓
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                Today's Daily Routine
              </h2>
              <p className="text-stone-500 text-sm">
                WhatsApp alerts routed automatically to guardian at <strong className="text-stone-800 font-semibold">{senior.guardian_phone || DEFAULT_GUARDIAN_PHONE}</strong>
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              {routinePct}%
            </span>
            <span className="text-stone-500 text-sm font-medium ml-1.5">
              ({completedCount} of {totalCount} completed)
            </span>
          </div>
        </div>

        <div className="w-full h-3.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${routinePct}%` }}
          />
        </div>
      </div>

      {/* Celebratory Streak Banner with Framer Motion */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => setShowStreakModal(true)}
        className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-[28px] p-5 sm:p-6 text-white shadow-lg shadow-orange-200 cursor-pointer overflow-hidden group"
      >
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white text-orange-600 flex items-center justify-center shrink-0 shadow-md"
            >
              <Flame className="w-9 h-9 fill-orange-500 text-orange-600" />
            </motion.div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs uppercase font-extrabold tracking-wider text-amber-100">
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>ROUTINE STREAK THRESHOLD</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight mt-0.5">
                {progress.current_streak}-Day Active Streak Milestone! 🔥
              </h3>
              <p className="text-amber-50 text-sm mt-1 max-w-xl font-medium">
                Outstanding consistency, {senior.name.split(' ')[0]}! Tap to view your streak celebration badge & rewards.
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-stone-900 font-extrabold text-sm sm:text-base px-5 py-3 rounded-2xl shadow-md shrink-0 flex items-center gap-2 group-hover:bg-amber-50 transition-colors"
          >
            <span>Celebrate Streak 🎉</span>
            <ChevronRight className="w-4 h-4 text-orange-600" />
          </motion.div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* SECTION 1: THE DAILY WALK SECTION                                         */}
      {/* ========================================================================= */}
      <div id="section-daily-walk" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚶</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              1. Daily Walk Section
            </h2>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
            isWalkingDone ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {isWalkingDone ? 'GOAL COMPLETED ✓' : 'ACTIVE NOW'}
          </span>
        </div>

        <div className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left Info */}
            <div className="space-y-3 flex-1 text-left w-full">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                  <Footprints className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                    Morning Fresh Air Stroll
                  </h3>
                  <p className="text-stone-500 text-base">
                    Daily target configured for joint health & cardiovascular vitality
                  </p>
                </div>
              </div>

              {/* Stats pill row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-3.5">
                  <div className="text-xs uppercase font-bold text-stone-400">Steps Tracked</div>
                  <div className="text-2xl font-bold text-stone-900 mt-0.5">
                    {stepsTaken.toLocaleString()}
                  </div>
                  <div className="text-xs text-stone-500">Goal: {stepGoal.toLocaleString()}</div>
                </div>

                <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-3.5">
                  <div className="text-xs uppercase font-bold text-stone-400">Distance</div>
                  <div className="text-2xl font-bold text-stone-900 mt-0.5">
                    {activity.distance_km || +(stepsTaken * 0.00067).toFixed(2)} km
                  </div>
                  <div className="text-xs text-stone-500">Approx. 40 mins</div>
                </div>

                <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-3.5 col-span-2 sm:col-span-1">
                  <div className="text-xs uppercase font-bold text-stone-400">Guardian Sync</div>
                  <div className="text-base font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>9561442888</span>
                  </div>
                  <div className="text-xs text-stone-500">Auto WhatsApp alert</div>
                </div>
              </div>
            </div>

            {/* Circular Progress & Action */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-stone-100 fill-none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={251}
                    strokeDashoffset={251 - (251 * Math.min(100, Math.round((stepsTaken / stepGoal) * 100))) / 100}
                    strokeLinecap="round"
                    className="text-blue-500 fill-none transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-stone-900">
                    {Math.min(100, Math.round((stepsTaken / stepGoal) * 100))}%
                  </span>
                  <span className="text-[11px] font-bold text-stone-400 uppercase">
                    {isWalkingDone ? 'Completed' : 'Progress'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('walking')}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 font-bold text-sm rounded-xl transition-all"
                >
                  View Pedometer
                </button>

                {!isWalkingDone ? (
                  <button
                    onClick={handleCompleteDailyWalk}
                    disabled={loadingTask === 'walk'}
                    className="px-5 py-2 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{loadingTask === 'walk' ? 'Sending...' : 'Mark Done & Notify'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => redirectWithWhatsApp('Daily Walk', senior.name, `${stepsTaken} steps recorded`, senior.guardian_phone || DEFAULT_GUARDIAN_PHONE)}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Resend WhatsApp</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: SEQUENTIAL ROUTINE AFTER DAILY WALK                             */}
      {/* In exact sequence:                                                        */}
      {/* 1. Morning Yoga                                                           */}
      {/* 2. Breakfast                                                              */}
      {/* 3. After-Breakfast Medicine                                               */}
      {/* 4. Lunch                                                                  */}
      {/* 5. After-Lunch Medicine                                                   */}
      {/* 6. Sleep Nap                                                              */}
      {/* 7. Dinner                                                                 */}
      {/* 8. After-Dinner Medicine                                                  */}
      {/* ========================================================================= */}
      <div id="section-sequential-routine" className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-[#FF6321]">
              Full Daily Sequence
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-0.5">
              Daily Schedule (After Morning Walk)
            </h2>
          </div>
        </div>

        {/* Step-by-Step Sequence Cards */}
        <div className="space-y-3.5">
          {routineSequence.map((task, idx) => {
            const isDone = task.isCompleted;
            const isLoading = loadingTask === task.id;

            const isMeal = task.taskType === 'breakfast' || task.taskType === 'lunch' || task.taskType === 'dinner';
            const isMedicine = task.taskType === 'breakfast_medicine' || task.taskType === 'lunch_medicine' || task.taskType === 'dinner_medicine';

            return (
              <div
                key={task.id}
                id={`routine-card-${task.id}`}
                onClick={() => onNavigate(task.viewTarget)}
                className={`rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 border transition-all shadow-xs cursor-pointer ${
                  isDone
                    ? 'bg-[#FAF8F5] border-emerald-300/80 hover:border-emerald-400'
                    : 'bg-white border-stone-200 hover:border-[#FF6321]/60 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Task Identity & Timing */}
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Step Sequence Badge */}
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-xs transition-colors ${
                          isDone 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-orange-50 text-stone-900 border border-orange-200/60'
                        }`}
                      >
                        {task.icon}
                      </div>
                      <span className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-wider">
                        Step #{task.number}
                      </span>
                    </div>

                    {/* Titles */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                          {task.title}
                        </h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {task.badge}
                        </span>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>+{task.xp} XP</span>
                        </span>
                      </div>

                      <p className="text-stone-600 text-sm sm:text-base font-normal">
                        {task.subtitle}
                      </p>

                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-400">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>Scheduled: {task.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Completion / Interaction Buttons */}
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100"
                  >
                    {/* View Guide / Log Meal / Open Medicine button */}
                    <button
                      onClick={() => onNavigate(task.viewTarget)}
                      className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {isMeal ? 'Write What You Ate ✍️' : isMedicine ? 'View Medicine 💊' : 'Open Guide'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </button>

                    {/* Mark Done & Send WhatsApp Button */}
                    {!isDone ? (
                      <button
                        id={`btn-complete-${task.id}`}
                        onClick={(e) => {
                          if (isMeal || isMedicine) {
                            // Navigate directly to single meal or single medicine view
                            onNavigate(task.viewTarget);
                          } else {
                            handleMarkTaskDone(task, e);
                          }
                        }}
                        disabled={isLoading}
                        className={`flex-1 sm:flex-initial px-5 py-2.5 active:scale-95 text-white font-bold text-sm sm:text-base rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
                          isMedicine
                            ? 'bg-[#25D366] hover:bg-[#20bd5a] text-stone-950 font-extrabold'
                            : 'bg-[#FF6321] hover:bg-[#e85516] text-white'
                        }`}
                      >
                        <Check className="w-5 h-5" />
                        <span>
                          {isLoading 
                            ? 'Notifying...' 
                            : isMeal 
                            ? 'Log Meal & WhatsApp' 
                            : isMedicine 
                            ? 'Send to Child' 
                            : 'Done ✓'}
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Done & Notified ✓</span>
                        </div>
                        <button
                          title="Resend WhatsApp ready message"
                          onClick={() => redirectWithWhatsApp(task.title, senior.name, task.details, senior.guardian_phone || DEFAULT_GUARDIAN_PHONE)}
                          className="p-2 bg-stone-100 hover:bg-emerald-100 text-stone-600 hover:text-emerald-800 rounded-xl transition-colors cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency SOS Button */}
      <div className="pt-2">
        <button
          id="senior-home-bottom-sos-btn"
          onClick={onOpenSos}
          className="bg-rose-50 hover:bg-rose-100 active:scale-98 text-rose-600 w-full py-6 rounded-3xl border-4 border-rose-100 text-2xl sm:text-3xl font-black flex items-center justify-center gap-4 transition-all shadow-sm cursor-pointer"
        >
          <span className="bg-rose-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-sm font-black shadow-sm shrink-0">
            SOS
          </span>
          <span>CALL FOR HELP</span>
        </button>
      </div>

      {/* Streak Celebration Modal with Framer Motion */}
      <StreakCelebrationModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streakDays={progress.current_streak}
        seniorName={senior.name}
        guardianPhone={senior.guardian_phone || DEFAULT_GUARDIAN_PHONE}
        totalXp={progress.total_xp}
      />
    </div>
  );
};
