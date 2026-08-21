import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Volume2, Sparkles, HeartHandshake, CheckCircle } from 'lucide-react';
import { playChime, speakText, stopSpeaking } from '../../utils/audioSpeech';
import { VoiceCallItem } from '../../types';

interface VoiceCallSimulationModalProps {
  call: VoiceCallItem | null;
  isOpen: boolean;
  onClose: () => void;
  onActionConfirmed?: (actionType: string) => void;
}

export const VoiceCallSimulationModal: React.FC<VoiceCallSimulationModalProps> = ({
  call,
  isOpen,
  onClose,
  onActionConfirmed,
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [callDuration, setCallDuration] = useState<number>(0);

  useEffect(() => {
    if (!isOpen || !call) {
      setCallState('ringing');
      setCallDuration(0);
      stopSpeaking();
      return;
    }

    setCallState('ringing');
    playChime('ding');

    // Auto-answer after 2 seconds for smooth simulation or let user click Answer
    const autoAnswerTimer = setTimeout(() => {
      handleAnswerCall();
    }, 2200);

    return () => {
      clearTimeout(autoAnswerTimer);
      stopSpeaking();
    };
  }, [isOpen, call]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const handleAnswerCall = () => {
    setCallState('connected');
    playChime('success');
    if (call?.script_content) {
      speakText(call.script_content, 0.86);
    }
  };

  const handleEndCall = () => {
    stopSpeaking();
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleAction = (action: string) => {
    stopSpeaking();
    playChime('success');
    if (onActionConfirmed) onActionConfirmed(action);
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  if (!isOpen || !call) return null;

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div id="voice-call-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        id="voice-call-card"
        className="w-full max-w-md bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 text-stone-900 shadow-2xl text-center relative overflow-hidden"
      >
        {/* Decorative ambient background */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#FF6321]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Label */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-[#FF6321] text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>INCOMING AI COMPANION CALL</span>
        </div>

        {/* Companion Avatar */}
        <div className="relative my-4 flex justify-center">
          <div className={`w-24 h-24 rounded-full bg-amber-100 p-1 shadow-md ${callState === 'ringing' ? 'animate-bounce' : 'animate-pulse'}`}>
            <div className="w-full h-full bg-[#FAF8F5] border border-amber-200 rounded-full flex items-center justify-center">
              <HeartHandshake className="w-12 h-12 text-[#FF6321]" />
            </div>
          </div>
        </div>

        {/* Caller Name */}
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          KinCare AI Companion
        </h3>
        <p className="text-sm text-stone-500 mt-1 font-normal">
          {callState === 'ringing' ? 'Ringing...' : callState === 'connected' ? `Connected • ${formatDuration(callDuration)}` : 'Call Ended'}
        </p>

        {/* Live Audio Waveform (Connected State) */}
        {callState === 'connected' && (
          <div className="my-6 space-y-4">
            <div className="flex items-center justify-center gap-1.5 h-10">
              {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 60].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-[#FF6321] rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDuration: `${0.6 + (i % 4) * 0.2}s`,
                    animationDelay: `${(i * 0.08)}s`,
                  }}
                />
              ))}
            </div>

            {/* Script Text Box */}
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 text-left text-base text-stone-800 font-normal leading-relaxed max-h-48 overflow-y-auto">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#FF6321] font-semibold mb-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Voice Audio Script:</span>
              </div>
              "{call.script_content}"
            </div>

            {/* Contextual Action Buttons depending on call type */}
            <div className="pt-2 space-y-2">
              {call.call_type === 'wakeup' && (
                <button
                  onClick={() => handleAction('wakeup')}
                  className="w-full py-4 px-6 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white text-lg font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>I'M AWAKE ☀️</span>
                </button>
              )}

              {call.call_type === 'medicine_reminder' && (
                <button
                  onClick={() => handleAction('medicine_taken')}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-lg font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>MEDICINE TAKEN ✓</span>
                </button>
              )}

              {call.call_type === 'meal_reminder' && (
                <button
                  onClick={() => handleAction('meal_taken')}
                  className="w-full py-4 px-6 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white text-lg font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>I HAD MY MEAL 🥣</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Ringing / Call Controls */}
        <div className="mt-6 flex justify-center gap-3">
          {callState === 'ringing' ? (
            <>
              <button
                id="voice-call-answer-btn"
                onClick={handleAnswerCall}
                className="py-3.5 px-8 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-base font-bold rounded-2xl flex items-center gap-2 shadow-sm transition-all"
              >
                <Phone className="w-5 h-5" />
                <span>ANSWER</span>
              </button>
              <button
                onClick={handleEndCall}
                className="py-3.5 px-6 bg-stone-100 hover:bg-stone-200 text-stone-700 text-base font-semibold rounded-2xl transition-colors"
              >
                DECLINE
              </button>
            </>
          ) : (
            <button
              id="voice-call-hangup-btn"
              onClick={handleEndCall}
              className="w-full py-3.5 px-6 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 text-base font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <PhoneOff className="w-5 h-5 text-red-600" />
              <span>END CALL</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
