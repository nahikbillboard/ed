import React, { useState } from 'react';
import { Sun, CheckCircle, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';
import { Senior, DailyRoutine, SeniorProgress } from '../../types';

interface SeniorWakeUpProps {
  senior: Senior;
  routine: DailyRoutine;
  progress: SeniorProgress;
  onWakeUpSuccess: (updatedRoutine: DailyRoutine, updatedProgress: SeniorProgress) => void;
  onNavigateHome: () => void;
}

export const SeniorWakeUp: React.FC<SeniorWakeUpProps> = ({
  senior,
  routine,
  progress,
  onWakeUpSuccess,
  onNavigateHome,
}) => {
  const [loading, setLoading] = useState(false);
  const [completedTime, setCompletedTime] = useState<string | null>(routine.wake_time || null);

  const isAlreadyAwake = routine.wake_status === 'completed';

  const handleWakeUp = async () => {
    setLoading(true);
    playChime('success');

    try {
      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      const res = await ApiClient.checkinWakeUp(senior.id);
      setCompletedTime(res.wakeTime);
      onWakeUpSuccess(res.routine, res.progress);
      speakText(`Good morning, ${senior.name}! Awakening confirmed. Your 7-day streak is glowing, and 50 Wellness XP has been awarded.`);
    } catch (e) {
      console.error('Wake up checkin error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="senior-wakeup-screen" className="max-w-2xl mx-auto p-4 sm:p-6 text-center space-y-8">
      {/* Sun Header Illustration */}
      <div className="flex justify-center">
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-amber-50 flex items-center justify-center border-4 border-amber-100 shadow-sm">
          <Sun className="w-16 h-16 sm:w-20 sm:h-20 text-[#FF6321]" />
        </div>
      </div>

      <div>
        <h1 className="text-4xl sm:text-5xl font-serif text-stone-900 tracking-tight">
          Good Morning ☀️
        </h1>
        <p className="text-2xl sm:text-3xl font-serif text-amber-800 mt-2">
          {senior.name} ❤️
        </p>
        <p className="text-lg sm:text-xl text-stone-500 mt-2 font-sans">
          {isAlreadyAwake 
            ? `Awakening confirmed at ${completedTime || '7:12 AM'}. Family has been notified!`
            : 'Tap below to start your day and let your loved ones know you are up!'}
        </p>
      </div>

      {!isAlreadyAwake ? (
        <div className="pt-4 space-y-4">
          <button
            id="btn-im-awake-hero"
            onClick={handleWakeUp}
            disabled={loading}
            className="w-full py-10 px-6 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white text-3xl sm:text-4xl font-bold rounded-[36px] shadow-xl shadow-orange-200/80 flex items-center justify-center gap-4 transition-all disabled:opacity-50"
          >
            <Sun className="w-10 h-10 text-white" />
            <span>{loading ? 'CHECKING IN...' : "I'M AWAKE ☀️"}</span>
          </button>
          
          <div className="flex items-center justify-center gap-2 text-stone-500 font-semibold text-base sm:text-lg">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Earns +50 Wellness XP & keeps your streak alive!</span>
          </div>
        </div>
      ) : (
        /* Completed State */
        <div className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="inline-flex p-3 bg-emerald-50 rounded-full text-emerald-700">
            <CheckCircle className="w-12 h-12" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            You Are Checked In!
          </h3>
          <p className="text-lg sm:text-xl text-stone-600 font-medium">
            Morning notification dispatched to <strong>{senior.guardian_name}</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 py-2">
            <span className="px-4 py-2 bg-amber-100 rounded-full text-amber-900 font-bold text-base sm:text-lg">
              🔥 {progress.current_streak} Day Streak
            </span>
            <span className="px-4 py-2 bg-emerald-100 rounded-full text-emerald-900 font-bold text-base sm:text-lg">
              ⭐ +50 XP Earned
            </span>
          </div>

          <button
            id="btn-wakeup-continue"
            onClick={onNavigateHome}
            className="w-full py-5 px-6 bg-stone-900 hover:bg-stone-800 text-white text-xl sm:text-2xl font-bold rounded-2xl flex items-center justify-center gap-3 shadow-md transition-all"
          >
            <span>CONTINUE TO TODAY'S ROUTINE</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
