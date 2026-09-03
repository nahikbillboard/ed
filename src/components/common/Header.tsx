import React from 'react';
import { Heart, PhoneCall, Bot, Wrench, Volume2, VolumeX, Languages, Shield, User, ExternalLink, Layers, ArrowLeft } from 'lucide-react';
import { useAudioLanguage } from '../../context/LanguageContext';
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
  isOnePageActive?: boolean;
  onToggleOnePageMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  senior,
  onOpenSos,
  onOpenCompanionChat,
  onOpenDemoDrawer,
  soundEnabled,
  onToggleSound,
  isOnePageActive = false,
  onToggleOnePageMode,
}) => {
  const { language, toggleLanguage } = useAudioLanguage();

  const handleOpenGuardianNewTab = () => {
    const guardianUrl = `${window.location.origin}${window.location.pathname}?role=guardian`;
    window.open(guardianUrl, '_blank');
  };

  return (
    <header id="main-app-header" className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-white px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        {/* Brand & Tagline */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => {
            if (isOnePageActive && onToggleOnePageMode) {
              onToggleOnePageMode();
            } else {
              onSelectView('senior');
            }
          }}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-md">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">Sath</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">AI</span>
            </div>
            <p className="text-xs text-stone-400 font-medium hidden md:block">
              “Care, even when you're far away.” • Edheal Engine
            </p>
          </div>
        </div>

        {/* When in 1-Page App: Only the Back to Home button */}
        {isOnePageActive ? (
          <div className="flex items-center">
            <button
              id="header-back-home-btn"
              onClick={() => {
                if (onToggleOnePageMode) {
                  onToggleOnePageMode();
                } else {
                  onSelectView('senior');
                }
              }}
              className="flex items-center gap-2.5 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white px-5 py-2.5 rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-orange-900/30 transition-all cursor-pointer border border-amber-400/30"
              title="Return to main dashboard (मुख्य पृष्ठ पर वापस जाएं)"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>
        ) : (
          <>
            {/* Center: Senior vs Guardian Portal Switcher */}
            <div className="flex items-center bg-stone-800 p-1 rounded-2xl border border-stone-700 text-xs sm:text-sm font-bold">
              <button
                id="nav-switch-senior"
                onClick={() => onSelectView('senior')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  currentView === 'senior'
                    ? 'bg-[#FF6321] text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Senior App ({senior?.name || 'सुनीता'})</span>
              </button>

              <button
                id="nav-switch-guardian"
                onClick={() => onSelectView('guardian')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  currentView === 'guardian'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Guardian Portal</span>
              </button>
            </div>

            {/* Right Tools & SOS */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Open Guardian in Separate Tab */}
              <button
                id="header-open-guardian-tab"
                onClick={handleOpenGuardianNewTab}
                className="hidden lg:flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white px-3 py-2 rounded-xl border border-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                title="Open Guardian portal in a new browser tab for live multi-window sync"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Guardian Tab</span>
              </button>

              {/* Audio Language Toggle */}
              <button
                id="header-audio-language-toggle"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded-xl border border-stone-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                title="ऑडियो भाषा बदलें (Switch Audio Language)"
              >
                <Languages className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'hi' ? '🇮🇳 हिन्दी' : '🇬🇧 English'}</span>
              </button>

              {/* AI Voice Companion Button */}
              <button
                id="header-companion-chat-btn"
                onClick={onOpenCompanionChat}
                className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-amber-300 px-3 sm:px-3.5 py-2 rounded-xl border border-stone-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <Bot className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">AI Companion</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={onToggleSound}
                className="p-2 sm:p-2.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white border border-stone-700 transition-colors cursor-pointer"
                title={soundEnabled ? 'Sound & Voice Alerts Enabled' : 'Muted'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
              </button>

              {/* One Page App Mode Switcher (Beside SOS Button) */}
              {onToggleOnePageMode && (
                <button
                  id="header-one-page-app-btn"
                  onClick={onToggleOnePageMode}
                  className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer shadow-xs ${
                    isOnePageActive
                      ? 'bg-gradient-to-r from-[#FF6321] to-amber-500 text-white border-amber-400 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 border-amber-500/30'
                  }`}
                  title="One Page App • एक-एक कदम मोड (Step-by-step routine)"
                >
                  <Layers className={`w-4 h-4 ${isOnePageActive ? 'text-white' : 'text-amber-400'}`} />
                  <span className="whitespace-nowrap font-black">
                    {isOnePageActive ? '✓ 1-Page Active' : '1-Page App'}
                  </span>
                </button>
              )}

              {/* Header SOS */}
              <button
                id="header-desktop-sos-btn"
                onClick={onOpenSos}
                className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs sm:text-base px-3 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 sm:gap-2 shadow-lg transition-transform animate-pulse cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>SOS</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};



