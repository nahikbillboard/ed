import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Trophy, Award, Sparkles, X, Heart, ShieldCheck, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChime, speakText } from '../../utils/audioSpeech';
import { DEFAULT_GUARDIAN_PHONE } from '../../utils/whatsappHelper';

interface StreakCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  seniorName: string;
  guardianPhone?: string;
  totalXp?: number;
}

export const StreakCelebrationModal: React.FC<StreakCelebrationModalProps> = ({
  isOpen,
  onClose,
  streakDays,
  seniorName,
  guardianPhone = DEFAULT_GUARDIAN_PHONE,
  totalXp = 380,
}) => {
  useEffect(() => {
    if (isOpen) {
      playChime('success');
      
      // Multi-stage celebratory confetti fireworks
      const end = Date.now() + 2500;
      const colors = ['#FF6321', '#FFD700', '#25D366', '#FF4500', '#00E5FF'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      const firstName = seniorName.split(' ')[0];
      speakText(`बधाई हो ${firstName} जी! आपने ${streakDays} दिनों का स्ट्रीक पूरा कर लिया है! ऐसे ही स्वस्थ और खुश रहें!`);
    }
  }, [isOpen, streakDays, seniorName]);

  if (!isOpen) return null;

  const getMilestoneInfo = (days: number) => {
    if (days >= 30) {
      return {
        badge: '💎 30-Day Golden Diamond',
        title: 'Legendary Health Master!',
        desc: '30 consecutive days of wellness, activity, and routine perfection!',
        color: 'from-amber-400 via-yellow-500 to-amber-600',
        bgGlow: 'bg-amber-400/20',
      };
    } else if (days >= 21) {
      return {
        badge: '👑 21-Day Habit King',
        title: 'Habit Transformation Unlocked!',
        desc: '21 days in a row! You have successfully built a lifelong healthy routine.',
        color: 'from-purple-500 via-indigo-500 to-purple-700',
        bgGlow: 'bg-purple-500/20',
      };
    } else if (days >= 14) {
      return {
        badge: '🚀 2-Week Power Streak',
        title: 'Unstoppable Momentum!',
        desc: '14 days of dedicated care and daily activity. Your family is super proud!',
        color: 'from-blue-500 via-cyan-500 to-blue-700',
        bgGlow: 'bg-blue-500/20',
      };
    } else if (days >= 7) {
      return {
        badge: '🏆 1-Week Routine Champion',
        title: '1 Full Week Completed!',
        desc: '7 days of unbroken check-ins, walks, meals, and medicine tracking!',
        color: 'from-emerald-500 via-teal-500 to-emerald-700',
        bgGlow: 'bg-emerald-500/20',
      };
    } else if (days >= 3) {
      return {
        badge: '⚡ 3-Day Momentum Booster',
        title: 'Consistency Starter!',
        desc: '3 days strong! Building great momentum day by day.',
        color: 'from-orange-500 via-amber-500 to-red-600',
        bgGlow: 'bg-orange-500/20',
      };
    }
    return {
      badge: '🌱 Wellness Explorer',
      title: 'Daily Streak Active!',
      desc: 'Keep logging your wake-ups, meals, and walks to unlock higher milestone tiers.',
      color: 'from-emerald-600 to-teal-700',
      bgGlow: 'bg-emerald-500/20',
    };
  };

  const milestone = getMilestoneInfo(streakDays);
  const firstName = seniorName.split(' ')[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-[36px] shadow-2xl border border-stone-200 overflow-hidden my-8"
        >
          {/* Top Decorative Banner */}
          <div className={`relative bg-gradient-to-br ${milestone.color} text-white p-8 sm:p-10 text-center overflow-hidden`}>
            {/* Background floating sparkles / glowing circles */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none"
            />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pulsing Animated Flame Icon */}
            <div className="relative inline-block mb-3">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 sm:w-28 sm:h-28 bg-white text-orange-600 rounded-full flex items-center justify-center shadow-xl mx-auto"
              >
                <Flame className="w-14 h-14 sm:w-16 sm:h-16 fill-orange-500 text-orange-600" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute -bottom-2 -right-2 bg-amber-300 text-stone-950 font-black text-xs px-3 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>MILESTONE</span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-2">
                {milestone.badge}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight leading-tight">
                {streakDays} DAY STREAK!
              </h2>
            </motion.div>
          </div>

          {/* Modal Content */}
          <div className="p-6 sm:p-8 space-y-6 text-stone-800">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif font-bold text-stone-900">
                Congratulations, {firstName}! 🎉
              </h3>
              <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
                {milestone.desc}
              </p>
            </div>

            {/* Streak Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-2xs border border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-stone-500 font-medium">Streak Record</div>
                  <div className="text-lg font-bold text-stone-900">{streakDays} Days</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-2xs border border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-stone-500 font-medium">Total Rewards XP</div>
                  <div className="text-lg font-bold text-stone-900">{totalXp} XP</div>
                </div>
              </div>
            </div>

            {/* Guardian Alert Confirmation Badge */}
            <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Streak milestone automatically synced with Guardian Portal <strong>({guardianPhone})</strong> ✓
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-4 px-6 bg-[#FF6321] hover:bg-[#e85516] text-white font-bold text-lg rounded-2xl shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Check className="w-6 h-6 text-white" />
                <span>Keep the Streak Going! 🔥</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
