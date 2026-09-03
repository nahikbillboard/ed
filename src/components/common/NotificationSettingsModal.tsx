import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Volume2,
  Vibrate,
  X,
  Sparkles,
  Send,
  HelpCircle,
  ExternalLink,
  Flame,
  Clock
} from 'lucide-react';
import { NotificationManager } from '../../services/notificationManager';
import { useAudioLanguage } from '../../context/LanguageContext';
import { playChime, speakText } from '../../utils/audioSpeech';
import { TodayBundle } from '../../types';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundle: TodayBundle | null;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  bundle,
}) => {
  const { language } = useAudioLanguage();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState<boolean>(false);
  const [selectedTaskToTest, setSelectedTaskToTest] = useState<string>('breakfast_medicine');

  useEffect(() => {
    if (isOpen) {
      setPermission(NotificationManager.getPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await NotificationManager.requestPermission(bundle, language as any);
    setPermission(res);
  };

  const handleRefreshPermanentNotification = async () => {
    await NotificationManager.updatePermanentNotification(bundle, language as any);
    playChime('ding');
  };

  const handleSendTestNotification = () => {
    setTestSent(true);
    playChime('alert');

    // Determine task info based on selection
    let title = 'Morning Medicine (Cardioprotect)';
    let titleHi = 'सुबह की दवाई (Cardioprotect)';
    let message = '1 tablet with warm water after breakfast.';
    let messageHi = 'नाश्ते के बाद गर्म पानी के साथ 1 गोली लें।';
    let icon = '💊';

    if (selectedTaskToTest === 'walk') {
      title = 'Morning Fresh Air Walk';
      titleHi = 'सुबह की ताज़ा सैर';
      message = 'Gentle 15-minute garden walk.';
      messageHi = 'बगीचे में 15 मिनट की ताज़ा सैर।';
      icon = '🚶‍♀️';
    } else if (selectedTaskToTest === 'yoga') {
      title = 'Gentle Chair Yoga & Stretches';
      titleHi = 'सुगम कुर्सी योग व स्ट्रेचिंग';
      message = 'Mobility stretches for joints.';
      messageHi = 'जोड़ों के लिए आसान स्ट्रेचिंग।';
      icon = '🧘';
    } else if (selectedTaskToTest === 'lunch') {
      title = 'Midday Nourishing Lunch';
      titleHi = 'दोपहर का पौष्टिक भोजन';
      message = 'Wholesome balanced meal time.';
      messageHi = 'संतुलित दोपहर का खाना।';
      icon = '🥗';
    }

    NotificationManager.triggerTaskNotification({
      taskType: selectedTaskToTest,
      title,
      titleHi,
      message,
      messageHi,
      icon,
      xp: 50,
      speakAlert: true,
      language: language as any,
    });

    setTimeout(() => {
      setTestSent(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-stone-900 border border-stone-700 text-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-5 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6321] text-white flex items-center justify-center shadow-md">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {language === 'hi' ? 'मोबाइल नोटिफिकेशन सिस्टम' : 'Mobile Notification System'}
              </h3>
              <p className="text-xs text-stone-400">
                {language === 'hi' ? 'अलर्ट, साउंड और टास्क टिकिंग' : 'Push alerts, audio chimes & task ticking'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Card */}
        <div className="bg-stone-800/80 rounded-2xl p-4 border border-stone-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              {language === 'hi' ? 'फोन परमिशन स्थिति' : 'Phone Notification Permission'}
            </span>
            {permission === 'granted' ? (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Active & Permitted</span>
              </span>
            ) : permission === 'denied' ? (
              <span className="text-xs font-bold text-red-400 bg-red-950/80 border border-red-500/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Blocked in Browser</span>
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Not Yet Allowed</span>
              </span>
            )}
          </div>

          <p className="text-xs text-stone-300">
            {permission === 'granted'
              ? '✅ Notifications and Service Worker are active. Live reminders with "✓ Tick Done" actions will trigger on your device.'
              : 'Allow system notifications so Sath can buzz your phone and show routine tasks with 1-tap completion.'}
          </p>

          {permission !== 'granted' ? (
            <button
              onClick={handleRequestPermission}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Bell className="w-4 h-4" />
              <span>{language === 'hi' ? 'फोन पर नोटिफिकेशन चालू करें' : 'Enable System Notifications'}</span>
            </button>
          ) : (
            <button
              onClick={handleRefreshPermanentNotification}
              className="w-full py-2.5 px-4 bg-stone-700 hover:bg-stone-600 text-amber-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-600"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? '🌟 स्थायी स्टेटस बार ट्रैकर अपडेट करें' : '🌟 Push / Update Permanent Status Bar Tracker'}</span>
            </button>
          )}
        </div>

        {/* Live Test Trigger */}
        <div className="bg-gradient-to-r from-orange-950/40 to-amber-950/40 border border-orange-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {language === 'hi' ? 'लाइव नोटिफिकेशन टेस्ट' : 'Send Live Test Notification'}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-stone-300 font-medium">
              {language === 'hi' ? 'टेस्ट के लिए कार्य चुनें:' : 'Select Task to Remind & Tick:'}
            </label>
            <select
              value={selectedTaskToTest}
              onChange={(e) => setSelectedTaskToTest(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#FF6321]"
            >
              <option value="breakfast_medicine">💊 Morning Medicine (Cardioprotect)</option>
              <option value="walk">🚶‍♀️ Morning Walk & Steps</option>
              <option value="yoga">🧘 Gentle Chair Yoga</option>
              <option value="lunch">🥗 Midday Lunch</option>
            </select>
          </div>

          <button
            id="btn-trigger-live-notification-test"
            onClick={handleSendTestNotification}
            disabled={testSent}
            className="w-full py-3 px-4 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {testSent
                ? 'Notification Dispatched!'
                : language === 'hi'
                ? '🔔 फोन पर टेस्ट नोटिफिकेशन भेजें'
                : '🔔 Trigger Test Notification with Tick Button'}
            </span>
          </button>
        </div>

        {/* Netlify & WebIntoApp Helper Note */}
        <div className="bg-stone-800/40 border border-stone-800 rounded-2xl p-3.5 space-y-1.5 text-xs text-stone-400">
          <div className="flex items-center gap-1.5 text-stone-300 font-bold">
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Web / Netlify & Mobile App Tip</span>
          </div>
          <p className="leading-relaxed">
            When hosted on Netlify (<code className="text-amber-300 font-mono">edheal.netlify.app</code>) or installed via mobile browser <strong>(Add to Home Screen)</strong>, notifications fire natively with audio &amp; vibration, and tapping <strong>"✓ Tick Done"</strong> immediately updates the task.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
