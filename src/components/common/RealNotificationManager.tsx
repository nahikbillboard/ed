import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle2, X, Sparkles, Clock, RefreshCw, Volume2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { NotificationManager, ActiveInAppNotification } from '../../services/notificationManager';
import { useAudioLanguage } from '../../context/LanguageContext';
import { speakText, playChime } from '../../utils/audioSpeech';
import { TodayBundle } from '../../types';

interface RealNotificationManagerProps {
  bundle: TodayBundle | null;
  onRefreshData: () => void;
}

export const RealNotificationManager: React.FC<RealNotificationManagerProps> = ({
  bundle,
  onRefreshData,
}) => {
  const { language } = useAudioLanguage();
  const [activeNotif, setActiveNotif] = useState<ActiveInAppNotification | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Initialize notification manager service
    NotificationManager.init();

    // Subscribe to in-app heads up alerts
    const unsub = NotificationManager.subscribe((notif) => {
      setActiveNotif(notif);
      setSuccessMessage(null);
    });

    // Listen to task completed from service worker or external action
    const unsubTask = NotificationManager.onTaskCompleted(() => {
      onRefreshData();
    });

    return () => {
      unsub();
      unsubTask();
    };
  }, [onRefreshData]);

  const handleTickFromNotification = async () => {
    if (!activeNotif || isUpdating) return;
    setIsUpdating(true);

    try {
      // Confetti burst
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.2 },
        colors: ['#FF6321', '#10B981', '#F59E0B'],
      });

      const taskLabel = language === 'hi' ? activeNotif.titleHi : activeNotif.title;
      setSuccessMessage(`✓ ${taskLabel} Marked Done! (+${activeNotif.xp} XP)`);

      // Complete task
      await NotificationManager.completeTask(activeNotif.taskType, bundle?.senior?.id);

      // Voice prompt confirmation
      if (language === 'hi') {
        speakText(`बहुत बढ़िया! ${activeNotif.titleHi} पूरा हो गया है।`, 0.9, 1.0, 'hi');
      } else {
        speakText(`Excellent! ${activeNotif.title} completed.`, 0.9, 1.0, 'en');
      }

      onRefreshData();

      setTimeout(() => {
        setIsUpdating(false);
        setSuccessMessage(null);
        NotificationManager.dismissCurrent();
      }, 1500);
    } catch (e) {
      console.error('Failed to complete from notif:', e);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    playChime('ding');
    NotificationManager.dismissCurrent();
  };

  return (
    <div className="fixed top-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-[420px] z-50 pointer-events-none">
      <AnimatePresence>
        {activeNotif && (
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="pointer-events-auto bg-stone-900/95 backdrop-blur-xl text-white rounded-3xl border-2 border-[#FF6321] shadow-2xl shadow-orange-950/50 p-4 space-y-3 ring-4 ring-orange-500/20"
          >
            {/* Top Bar: App Badge & Close Button */}
            <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FF6321] text-white flex items-center justify-center shadow-xs">
                  <Bell className="w-4 h-4 animate-bounce text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      Sath Live Reminder
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {activeNotif.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  +{activeNotif.xp} XP
                </span>
                <button
                  onClick={handleDismiss}
                  className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification Content Body */}
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                {activeNotif.icon}
              </div>
              <div className="space-y-0.5 flex-1">
                <h4 className="text-base font-black text-white leading-tight">
                  {language === 'hi' ? activeNotif.titleHi : activeNotif.title}
                </h4>
                <p className="text-xs text-stone-300 font-medium line-clamp-2">
                  {language === 'hi' ? activeNotif.messageHi : activeNotif.message}
                </p>
              </div>
            </div>

            {/* Big Tick / Action Button */}
            <button
              id="notification-tick-task-action"
              onClick={handleTickFromNotification}
              disabled={isUpdating}
              className={`w-full py-3 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer ${
                successMessage
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-400/40 shadow-emerald-950/60'
                  : 'bg-gradient-to-r from-[#FF6321] via-orange-500 to-amber-500 hover:from-[#e85516] hover:to-amber-400 text-white ring-2 ring-amber-400/50 shadow-orange-950/60'
              }`}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Updating Task on Mobile...</span>
                </>
              ) : successMessage ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{successMessage}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white stroke-[2.5]" />
                  <span>
                    {language === 'hi' ? '✓ पूरा हुआ (TICK TO UPDATE)' : '✓ TICK DONE (Update on Mobile)'}
                  </span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
