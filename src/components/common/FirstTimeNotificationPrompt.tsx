import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ShieldCheck, Sparkles, CheckCircle2, Smartphone, ArrowRight, X } from 'lucide-react';
import { NotificationManager } from '../../services/notificationManager';
import { useAudioLanguage } from '../../context/LanguageContext';
import { TodayBundle } from '../../types';
import { playChime, speakText } from '../../utils/audioSpeech';

interface FirstTimeNotificationPromptProps {
  bundle: TodayBundle | null;
}

export const FirstTimeNotificationPrompt: React.FC<FirstTimeNotificationPromptProps> = ({ bundle }) => {
  const { language } = useAudioLanguage();
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check if first time open & permission not yet granted
    const isPending = NotificationManager.isFirstTimePromptPending();
    const perm = NotificationManager.getPermission();

    if (isPending && perm !== 'granted') {
      // Small delay for smooth entry after app loads
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (perm === 'granted') {
      // If already granted, ensure permanent notification is active
      NotificationManager.updatePermanentNotification(bundle, language as any);
    }
  }, [bundle, language]);

  const handleAllowPermissions = async () => {
    setIsLoading(true);
    try {
      const result = await NotificationManager.requestPermission(bundle, language as any);
      
      if (result === 'granted') {
        playChime('success');
        if (language === 'hi') {
          speakText('नोटिफिकेशन और दैनिक ट्रैकर सक्रिय हो गया है।', 0.9, 1.0, 'hi');
        } else {
          speakText('Daily reminder notifications and tracker are now active.', 0.9, 1.0, 'en');
        }
      }
    } catch (e) {
      console.warn('First time permission error:', e);
    } finally {
      setIsLoading(false);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    NotificationManager.markFirstTimePromptDone();
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-stone-900 border-2 border-[#FF6321] text-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl shadow-orange-950/60 ring-4 ring-orange-500/20"
        >
          {/* Header Icon */}
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6321] to-amber-500 flex items-center justify-center text-white shadow-lg ring-4 ring-orange-500/30">
              <Bell className="w-7 h-7 animate-bounce text-white" />
            </div>
            <button
              onClick={handleDismiss}
              className="text-stone-400 hover:text-white p-2 rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full">
                {language === 'hi' ? 'पहला सेटअप' : 'First-Time Setup'}
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-xl font-black text-white leading-tight">
              {language === 'hi'
                ? 'दैनिक रिमाइंडर व स्थायी नोटिफिकेशन चालू करें'
                : 'Enable Daily Reminders & Permanent Notification'}
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              {language === 'hi'
                ? 'समय पर दवाई, टहलना और दैनिक कार्यों के लिए फोन पर ऑफिशियल नोटिफिकेशन की अनुमति दें।'
                : 'Get timely reminders for medicines, walks, and hydration directly on your phone lock screen with 1-tap completion.'}
            </p>
          </div>

          {/* Feature highlights */}
          <div className="bg-stone-800/80 rounded-2xl p-3.5 border border-stone-700 space-y-2.5">
            <div className="flex items-start gap-2.5 text-xs text-stone-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>{language === 'hi' ? 'स्थायी स्टेटस बार ट्रैकर:' : 'Permanent Status Bar Tracker:'}</strong>{' '}
                {language === 'hi' ? 'अगला कार्य व कदम हमेशा सामने दिखेंगे।' : 'Next medicine & step count stay visible in your notification shade.'}
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-stone-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>{language === 'hi' ? '1-टैप टिक डन:' : '1-Tap "✓ Tick Done":'}</strong>{' '}
                {language === 'hi' ? 'बिना ऐप खोले सीधे नोटिफिकेशन से कार्य पूरा करें।' : 'Complete tasks directly from the notification buttons.'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              id="btn-first-time-allow-permission"
              onClick={handleAllowPermissions}
              disabled={isLoading}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-[#FF6321] via-orange-500 to-amber-500 hover:from-[#e85516] hover:to-amber-400 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-orange-950/60 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer ring-2 ring-amber-400/40"
            >
              <Bell className="w-5 h-5 text-white stroke-[2.5]" />
              <span>
                {isLoading
                  ? 'Requesting Permission...'
                  : language === 'hi'
                  ? '🔔 अनुमति दें (ALLOW NOTIFICATION)'
                  : '🔔 ALLOW NOTIFICATIONS'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleDismiss}
              className="w-full py-2 text-center text-xs font-bold text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'बाद में करें (Maybe Later)' : 'Maybe Later'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
