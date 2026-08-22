import React from 'react';
import { Heart, PhoneCall, Bot, Wrench, Volume2, VolumeX } from 'lucide-react';
import { Senior } from '../../types';

interface HeaderProps {
  currentView: 'senior' | 'guardian' | 'onboarding';
  onSelectView: (view: 'senior' | 'guardian' | 'onboarding') => void;
  senior: Senior | null;
  onOpenSos: () => void;
  onOpenCompanionChat: () => void;
  onOpenDemoDrawer: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectView,
  onOpenSos,
  onOpenCompanionChat,
  onOpenDemoDrawer,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header id="main-app-header" className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-white px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectView('senior')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-md">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">KinCare</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">AI</span>
            </div>
            <p className="text-xs text-stone-400 font-medium hidden sm:block">
              “Care, even when you're far away.”
            </p>
          </div>
        </div>

        {/* Right Tools & SOS */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Voice Companion Button */}
          <button
            id="header-companion-chat-btn"
            onClick={onOpenCompanionChat}
            className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-amber-300 px-3 sm:px-3.5 py-2 rounded-xl border border-stone-700 text-xs sm:text-sm font-semibold transition-colors"
          >
            <Bot className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">AI Companion</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 sm:p-2.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white border border-stone-700 transition-colors"
            title={soundEnabled ? 'Sound & Voice Alerts Enabled' : 'Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>

          {/* Header SOS */}
          <button
            id="header-desktop-sos-btn"
            onClick={onOpenSos}
            className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs sm:text-base px-3 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 sm:gap-2 shadow-lg transition-transform animate-pulse"
          >
            <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};

