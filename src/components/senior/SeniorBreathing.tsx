import React, { useState, useEffect } from 'react';
import { Wind, CheckCircle2, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText, stopSpeaking } from '../../utils/audioSpeech';
import { Senior, DailyRoutine, SeniorProgress } from '../../types';

interface SeniorBreathingProps {
  senior: Senior;
  routine: DailyRoutine;
  progress: SeniorProgress;
  onBreathingCompleted: (updatedRoutine: DailyRoutine, updatedProg: SeniorProgress) => void;
  onNavigateHome: () => void;
}

type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export const SeniorBreathing: React.FC<SeniorBreathingProps> = ({
  senior,
  routine,
  progress,
  onBreathingCompleted,
  onNavigateHome,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [phaseTimer, setPhaseTimer] = useState(4);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [targetDuration, setTargetDuration] = useState(60); // 1 minute default
  const [voiceGuide, setVoiceGuide] = useState(true);
  const [isCompleted, setIsCompleted] = useState(routine.breathing_status === 'completed');
  const [loading, setLoading] = useState(false);

  // Phase loop (4s Inhale, 4s Hold, 4s Exhale, 2s Rest)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        setTotalSeconds(prev => {
          const nextTotal = prev + 1;
          if (nextTotal >= targetDuration) {
            handleCompleteSession();
          }
          return nextTotal;
        });

        setPhaseTimer(prev => {
          if (prev <= 1) {
            // Transition to next phase
            if (phase === 'inhale') {
              setPhase('hold1');
              if (voiceGuide) speakText('Hold your breath gently...', 0.85);
              return 4;
            } else if (phase === 'hold1') {
              setPhase('exhale');
              if (voiceGuide) speakText('Slowly breathe out...', 0.85);
              return 4;
            } else if (phase === 'exhale') {
              setPhase('hold2');
              return 2;
            } else {
              setPhase('inhale');
              if (voiceGuide) speakText('Breathe in deeply...', 0.85);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
      stopSpeaking();
    };
  }, [isActive, phase, isCompleted, targetDuration, voiceGuide]);

  const handleStart = () => {
    setIsActive(true);
    playChime('ding');
    if (voiceGuide) speakText('Welcome to your calm breathing exercise. Breathe in deeply...', 0.85);
  };

  const handlePause = () => {
    setIsActive(false);
    stopSpeaking();
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setPhaseTimer(4);
    setTotalSeconds(0);
    stopSpeaking();
  };

  const handleCompleteSession = async () => {
    setIsActive(false);
    setIsCompleted(true);
    stopSpeaking();
    playChime('success');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    try {
      setLoading(true);
      const res = await ApiClient.completeBreathing(senior.id, targetDuration);
      onBreathingCompleted(res.routine, res.progress);
      speakText('Wonderful job! Breathing exercise is complete. You have earned 60 Wellness XP.');
    } catch (e) {
      console.error('Failed to complete breathing:', e);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'INHALE';
      case 'hold1':
      case 'hold2':
        return 'HOLD';
      case 'exhale':
        return 'EXHALE';
    }
  };

  const getCircleScaleClass = () => {
    if (!isActive) return 'scale-90';
    switch (phase) {
      case 'inhale':
        return 'scale-125 duration-[4000ms]';
      case 'hold1':
        return 'scale-125 duration-300';
      case 'exhale':
        return 'scale-75 duration-[4000ms]';
      case 'hold2':
        return 'scale-75 duration-300';
    }
  };

  const getCircleColor = () => {
    switch (phase) {
      case 'inhale':
        return 'from-sky-400 to-indigo-400 border-sky-300 shadow-sky-200';
      case 'hold1':
      case 'hold2':
        return 'from-amber-400 to-yellow-300 border-amber-300 shadow-amber-200';
      case 'exhale':
        return 'from-emerald-400 to-teal-400 border-emerald-300 shadow-emerald-200';
    }
  };

  return (
    <div id="senior-breathing-screen" className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 text-center">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-50 text-sky-800 rounded-full font-bold text-sm mb-2">
          <Wind className="w-4 h-4" />
          <span>GENTLE RELAXATION</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif text-stone-900 tracking-tight">
          Breathe With Me
        </h1>
        <p className="text-lg sm:text-xl text-stone-500 mt-2 font-sans">
          Follow the smooth rhythm to calm your body and mind.
        </p>
      </div>

      {!isCompleted ? (
        <>
          {/* Duration Selector */}
          <div className="flex items-center justify-center gap-3">
            {[60, 120, 180].map((dur) => (
              <button
                key={dur}
                onClick={() => {
                  setTargetDuration(dur);
                  handleReset();
                }}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  targetDuration === dur
                    ? 'bg-[#FF6321] text-white shadow-sm'
                    : 'bg-[#FAF8F5] hover:bg-stone-200 text-stone-700 border border-stone-200'
                }`}
              >
                {dur / 60} Min Session
              </button>
            ))}

            {/* Voice toggle */}
            <button
              onClick={() => setVoiceGuide(!voiceGuide)}
              className={`p-2.5 rounded-full border transition-colors ${
                voiceGuide
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-[#FAF8F5] border-stone-200 text-stone-500'
              }`}
              title={voiceGuide ? 'Voice Guide Enabled' : 'Voice Guide Off'}
            >
              {voiceGuide ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Big Breathing Visual Canvas */}
          <div className="py-6 flex flex-col items-center justify-center min-h-[300px]">
            <div
              className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr ${getCircleColor()} border-8 shadow-xl flex flex-col items-center justify-center transition-transform ease-in-out ${getCircleScaleClass()}`}
            >
              <div className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-wider">
                {isActive ? getPhaseText() : 'READY'}
              </div>
              {isActive && (
                <div className="text-6xl font-black text-stone-900 mt-2">
                  {phaseTimer}
                </div>
              )}
            </div>

            <div className="mt-6 text-lg sm:text-xl font-bold text-stone-600">
              {isActive ? (
                <span>Session progress: {totalSeconds}s / {targetDuration}s</span>
              ) : (
                <span>Press Start whenever you are seated comfortably</span>
              )}
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="flex justify-center gap-4">
            {!isActive ? (
              <button
                id="btn-start-breathing"
                onClick={handleStart}
                className="py-5 px-10 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white text-xl sm:text-2xl font-bold rounded-[32px] shadow-lg shadow-orange-200/80 flex items-center gap-3 transition-all"
              >
                <Play className="w-6 h-6 fill-current" />
                <span>START BREATHING</span>
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handlePause}
                  className="py-4 px-8 bg-amber-500 hover:bg-amber-400 text-stone-950 text-lg font-bold rounded-2xl flex items-center gap-2 shadow-sm"
                >
                  <Pause className="w-5 h-5" />
                  <span>PAUSE</span>
                </button>
                <button
                  onClick={handleCompleteSession}
                  className="py-4 px-6 bg-stone-900 hover:bg-stone-800 text-white text-lg font-bold rounded-2xl flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>FINISH EARLY</span>
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Completion State */
        <div className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 space-y-5 shadow-xs animate-in zoom-in-95 duration-200">
          <div className="inline-flex p-4 bg-sky-50 text-sky-700 rounded-full">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            Breathing Complete ✓
          </h2>
          <p className="text-lg sm:text-xl text-stone-600 font-medium">
            You took time to breathe and nurture your peace. +60 Wellness XP earned!
          </p>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
            <button
              id="btn-breathing-im-done"
              onClick={onNavigateHome}
              className="py-5 px-10 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white text-xl sm:text-2xl font-bold rounded-2xl shadow-md transition-all"
            >
              I'M DONE ✓
            </button>
            <button
              onClick={() => {
                setIsCompleted(false);
                handleReset();
              }}
              className="py-5 px-6 bg-[#FAF8F5] hover:bg-stone-200 border border-stone-200 text-stone-800 text-lg font-bold rounded-2xl transition-all"
            >
              REPEAT SESSION ↻
            </button>
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <div className="text-xs text-stone-400 max-w-md mx-auto pt-4 leading-relaxed">
        *Disclaimer: This guided relaxation exercise is designed for daily comfort and mindfulness. It is not intended as medical treatment or diagnostic advice.
      </div>
    </div>
  );
};
