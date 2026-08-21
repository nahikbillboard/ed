import React, { useState } from 'react';
import { Activity, CheckCircle2, Play, Sparkles, ChevronRight, ArrowLeft, Timer, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';
import { Senior, ExerciseLibraryItem, DailyRoutine, SeniorProgress } from '../../types';

interface SeniorYogaProps {
  senior: Senior;
  exercises: ExerciseLibraryItem[];
  routine: DailyRoutine;
  progress: SeniorProgress;
  onExerciseCompleted: (updatedRoutine: DailyRoutine, updatedProg: SeniorProgress) => void;
  onNavigateHome: () => void;
}

export const SeniorYoga: React.FC<SeniorYogaProps> = ({
  senior,
  exercises,
  routine,
  progress,
  onExerciseCompleted,
  onNavigateHome,
}) => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseLibraryItem | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelect = (ex: ExerciseLibraryItem) => {
    setSelectedExercise(ex);
    setCurrentStepIdx(0);
    setIsCompleted(false);
    playChime('ding');
    speakText(`Starting ${ex.title}. ${ex.description}`);
  };

  const handleNextStep = () => {
    if (!selectedExercise) return;
    if (currentStepIdx < selectedExercise.steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      playChime('ding');
      speakText(selectedExercise.steps[nextIdx]);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (!selectedExercise) return;
    setLoading(true);
    playChime('success');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    try {
      const res = await ApiClient.completeExercise(selectedExercise.id, senior.id);
      setIsCompleted(true);
      onExerciseCompleted(res.routine, res.progress);
      speakText(`Bravo ${senior.name}! You finished ${selectedExercise.title}. +70 Wellness XP awarded.`);
    } catch (e) {
      console.error('Failed to complete exercise:', e);
      setIsCompleted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="senior-yoga-screen" className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-800 rounded-full font-bold text-sm mb-2">
          <Activity className="w-4 h-4" />
          <span>MOBILITY & FLEXIBILITY</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif text-stone-900 tracking-tight">
          Gentle Exercises 🧘
        </h1>
        <p className="text-lg sm:text-xl text-stone-500 mt-2 font-sans">
          Seated and low-impact routines designed for comfort and joint vitality.
        </p>
      </div>

      {!selectedExercise ? (
        /* Exercise Library Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => handleSelect(ex)}
              className="bg-white border border-stone-200 hover:border-[#FF6321] rounded-[32px] p-6 cursor-pointer transition-all active:scale-[0.98] space-y-3 group shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  {ex.category.replace('_', ' ')}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-stone-500">
                  <Timer className="w-3.5 h-3.5 text-stone-400" />
                  <span>{ex.duration_minutes} mins</span>
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 group-hover:text-[#FF6321] transition-colors">
                {ex.title}
              </h3>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-normal">
                {ex.description}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-amber-700 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  <span>+70 XP</span>
                </span>
                <div className="w-9 h-9 rounded-full bg-[#FF6321] group-hover:bg-[#e85516] text-white flex items-center justify-center shadow-xs">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !isCompleted ? (
        /* Guided Step by Step Modal / View */
        <div className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <button
              onClick={() => setSelectedExercise(null)}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Exercises</span>
            </button>
            <div className="text-sm font-bold text-rose-800">
              Step {currentStepIdx + 1} of {selectedExercise.steps.length}
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {selectedExercise.title}
            </h2>
            <p className="text-stone-500 text-base sm:text-lg mt-1 font-normal">
              {selectedExercise.description}
            </p>
          </div>

          {/* Current Step Instruction Box */}
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-[24px] p-6 text-center space-y-4">
            <div className="text-xs uppercase font-bold tracking-wider text-stone-400">
              Instruction Guide
            </div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-snug">
              "{selectedExercise.steps[currentStepIdx]}"
            </div>
            <button
              onClick={() => speakText(selectedExercise.steps[currentStepIdx], 0.86)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-900 rounded-full font-semibold text-sm transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Aloud</span>
            </button>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleNextStep}
              disabled={loading}
              className="w-full py-4 sm:py-5 px-6 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white text-xl sm:text-2xl font-bold rounded-2xl shadow-md shadow-orange-200/80 flex items-center justify-center gap-3 transition-all"
            >
              <span>
                {currentStepIdx < selectedExercise.steps.length - 1
                  ? 'NEXT STEP'
                  : 'COMPLETE EXERCISE ✓'}
              </span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        /* Completion State */
        <div className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 text-center space-y-5 shadow-xs animate-in zoom-in-95 duration-200">
          <div className="inline-flex p-4 bg-rose-50 text-rose-700 rounded-full">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            Exercise Completed ✓
          </h2>
          <p className="text-lg sm:text-xl text-stone-600 font-normal">
            You completed <strong>{selectedExercise.title}</strong>. +70 Wellness XP added to your rewards bank!
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onNavigateHome}
              className="py-4 sm:py-5 px-8 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white text-xl sm:text-2xl font-bold rounded-2xl shadow-md transition-all"
            >
              RETURN TO ROUTINE
            </button>
            <button
              onClick={() => {
                setSelectedExercise(null);
                setIsCompleted(false);
              }}
              className="py-4 sm:py-5 px-6 bg-[#FAF8F5] hover:bg-stone-200 border border-stone-200 text-stone-800 text-lg font-bold rounded-2xl transition-all"
            >
              CHOOSE ANOTHER
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
