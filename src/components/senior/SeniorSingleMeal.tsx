import React, { useState } from 'react';
import { 
  Utensils, 
  CheckCircle2, 
  Clock, 
  Send, 
  Mic, 
  MicOff, 
  ArrowLeft, 
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';
import { Senior, DailyRoutine, SeniorProgress } from '../../types';
import { 
  DEFAULT_GUARDIAN_PHONE, 
  redirectMealWithWhatsApp,
  formatWhatsAppPhone,
  buildWhatsAppMealMessage
} from '../../utils/whatsappHelper';
import { MessageCircle, ExternalLink } from 'lucide-react';

interface SeniorSingleMealProps {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  senior: Senior;
  routine: DailyRoutine;
  progress: SeniorProgress;
  onMealCompleted: (updatedRoutine: DailyRoutine, updatedProg: SeniorProgress, whatsappData?: any) => void;
  onNavigateHome: () => void;
}

export const SeniorSingleMeal: React.FC<SeniorSingleMealProps> = ({
  mealType,
  senior,
  routine,
  progress,
  onMealCompleted,
  onNavigateHome,
}) => {
  const isBreakfast = mealType === 'breakfast';
  const isLunch = mealType === 'lunch';
  const isDinner = mealType === 'dinner';

  // Preset default dish suggestion depending on meal
  const defaultDishSuggestions = isBreakfast
    ? [
        'Warm Oatmeal with Berries & Almonds',
        'Toasted Bread with Boiled Eggs',
        'Vegetable Upma & Hot Tea',
        'Poha with Fresh Lemon & Peanuts',
        'Idli Sambhar & Coconut Chutney',
        'Fruit Bowl with Yogurt & Honey',
      ]
    : isLunch
    ? [
        'Steamed Rice with Dal & Mixed Greens',
        'Whole Wheat Roti with Paneer & Cucumber Salad',
        'Warm Vegetable Soup with Quinoa',
        'Khichdi with Fresh Curd & Papad',
        'Grilled Protein Bowl with Steamed Veggies',
        'Wholesome Veggie Wrap with Fresh Juice',
      ]
    : [
        'Light Vegetable Clear Soup with Multigrain Toast',
        'Moong Dal Khichdi with Steamed Veggies',
        'Steamed Vegetables with Warm Herbal Broth',
        'Warm Porridge with Golden Milk',
        'Soft Phulkas with Yellow Dal Tadka',
        'Mixed Green Salad with Steamed Lentils',
      ];

  const defaultTitle = isBreakfast ? 'Breakfast 🥣' : isLunch ? 'Lunch 🥗' : 'Dinner 🍲';
  const defaultScheduledTime = isBreakfast
    ? senior.breakfast_time || '08:30 AM'
    : isLunch
    ? senior.lunch_time || '01:00 PM'
    : senior.dinner_time || '07:30 PM';

  const defaultDescription = isBreakfast
    ? 'Start your day with healthy fuel, hydration and vitamins.'
    : isLunch
    ? 'Wholesome midday nourishment for sustained physical vitality.'
    : 'Light and calming evening dinner before restful night sleep.';

  const isCompleted = isBreakfast
    ? routine.breakfast_status === 'completed'
    : isLunch
    ? routine.lunch_status === 'completed'
    : routine.dinner_status === 'completed';

  const [dishName, setDishName] = useState<string>(defaultDishSuggestions[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(isCompleted);

  const targetPhone = '9561442888';

  // Web Speech Recognition for voice typing dish name
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      speakText('Voice dictation is not supported in this browser. Please type your dish name.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        speakText('Listening... please say what you ate.');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setDishName(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const handleConfirmAndSendWhatsApp = async () => {
    setLoading(true);
    playChime('success');

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });

    const chosenDish = dishName.trim() || defaultDishSuggestions[0];

    // Synchronously pre-open tab in click event context to avoid popup blocking
    let waWin: Window | null = null;
    try {
      waWin = window.open('about:blank', '_blank');
    } catch (e) {
      console.warn('Pre-open popup blocked:', e);
    }

    try {
      // 1. Log meal to backend database & award XP
      const res = await ApiClient.completeMeal(mealType, senior.id, chosenDish);

      onMealCompleted(res.routine, res.progress, res.whatsapp);
      setSentSuccess(true);

      speakText(
        `Wonderful ${senior.name}! Your ${mealType} with ${chosenDish} is recorded and sent to your child on WhatsApp.`
      );

      // 2. Open WhatsApp directly with ready pre-filled message for 9561442888
      redirectMealWithWhatsApp(mealType, senior.name, chosenDish, targetPhone, waWin);
    } catch (err) {
      console.error('Failed to complete meal:', err);
      // Fallback direct WhatsApp redirection
      redirectMealWithWhatsApp(mealType, senior.name, chosenDish, targetPhone, waWin);
      setSentSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id={`senior-${mealType}-section`} className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Return */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Routine</span>
        </button>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
            isCompleted || sentSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {isCompleted || sentSuccess ? 'Completed ✓ (+40 XP)' : 'Scheduled'}
          </span>
        </div>
      </div>

      {/* Main Single Meal Header */}
      <div className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 shadow-xs text-center space-y-3">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-orange-50 text-[#FF6321] text-4xl shadow-xs mx-auto">
          {isBreakfast ? '🥣' : isLunch ? '🥗' : '🍲'}
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          {defaultTitle}
        </h1>

        <div className="flex items-center justify-center gap-2 text-stone-500 font-medium text-base">
          <Clock className="w-4 h-4 text-stone-400" />
          <span>Scheduled Time: <strong className="text-stone-700">{defaultScheduledTime}</strong></span>
        </div>

        <p className="text-stone-600 text-base max-w-lg mx-auto font-sans">
          {defaultDescription}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 1. DISH INPUT SECTION (WRITE WHAT YOU ATE)                               */}
      {/* ========================================================================= */}
      <div className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-orange-100 text-[#FF6321] flex items-center justify-center font-bold">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                What Did You Eat?
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm">
                Type or speak what you ate to send it directly to your child.
              </p>
            </div>
          </div>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#FF6321]" />}
            <span>{isListening ? 'Listening...' : 'Voice Type 🎙️'}</span>
          </button>
        </div>

        {/* Text Input for Dish Name */}
        <div className="relative">
          <input
            id={`input-dish-${mealType}`}
            type="text"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            placeholder={`e.g., ${defaultDishSuggestions[0]}`}
            className="w-full text-lg sm:text-xl font-medium text-stone-900 bg-[#FAF8F5] border-2 border-stone-300 focus:border-[#FF6321] rounded-2xl px-4 py-3.5 outline-none transition-colors shadow-inner"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-2">
          <div className="text-xs uppercase font-bold text-stone-400 tracking-wider">
            Quick Suggestions (Tap to Select):
          </div>
          <div className="flex flex-wrap gap-2">
            {defaultDishSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setDishName(suggestion)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  dishName === suggestion
                    ? 'bg-[#FF6321] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEND TO CHILD BUTTON (DIRECT WHATSAPP REDIRECTION)                     */}
      {/* ========================================================================= */}
      <div className="pt-2 space-y-3">
        <button
          id={`btn-send-to-child-${mealType}`}
          type="button"
          onClick={handleConfirmAndSendWhatsApp}
          disabled={loading}
          className="w-full py-4.5 px-6 bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-stone-950 text-lg sm:text-xl font-bold rounded-2xl shadow-lg shadow-emerald-900/15 flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-5 h-5 text-stone-950" />
          <span>
            {loading ? 'Sending to Child...' : 'Send to Child & Open WhatsApp'}
          </span>
        </button>

        <a
          href={`https://api.whatsapp.com/send?phone=${formatWhatsAppPhone('9561442888')}&text=${encodeURIComponent(buildWhatsAppMealMessage(mealType, senior.name, dishName))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-6 bg-[#075E54] hover:bg-[#054c44] text-white text-base font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>Open WhatsApp Chat with Child (+91 9561442888)</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        {sentSuccess && (
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 py-2.5 px-4 rounded-xl text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sent to your child via WhatsApp (9561442888) ✓ (+40 XP awarded)</span>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="text-center pt-2">
        <button
          onClick={onNavigateHome}
          className="py-3 px-8 bg-stone-900 hover:bg-stone-800 text-white text-base font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
        >
          Return to Daily Routine
        </button>
      </div>
    </div>
  );
};
