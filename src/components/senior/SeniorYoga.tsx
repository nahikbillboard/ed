import React, { useState } from 'react';
import { Activity, CheckCircle2, Play, Sparkles, ChevronRight, ArrowLeft, Timer, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText, convertToHindiSpeech } from '../../utils/audioSpeech';
import { useAudioLanguage } from '../../context/LanguageContext';
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
  const { isHindi } = useAudioLanguage();

  const handleSelect = (ex: ExerciseLibraryItem) => {
    setSelectedExercise(ex);
    setCurrentStepIdx(0);
    setIsCompleted(false);
    playChime('ding');
    const hindiTitle = convertToHindiSpeech(ex.title);
    const hindiDesc = convertToHindiSpeech(ex.description);
    speakText(`${hindiTitle} शुरू कर रहे हैं। ${hindiDesc}`);
  };

  const handleNextStep = () => {
    if (!selectedExercise) return;
    if (currentStepIdx < selectedExercise.steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      playChime('ding');
      const stepText = selectedExercise.steps[nextIdx];
      speakText(convertToHindiSpeech(stepText));
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
      const exHindiTitle = convertToHindiSpeech(selectedExercise.title);
      speakText(`शाबाश ${senior.name} जी! आपने ${exHindiTitle} पूरा कर लिया है। 70 वेलनेस एक्स पी मिल गए हैं।`);
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
          <span>MOBILITY & FLEXIBILITY • सुगम योग</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif text-stone-900 tracking-tight">
          Gentle Exercises 🧘
        </h1>
        <p className="text-lg sm:text-xl text-stone-500 mt-2 font-sans">
          सुखद और आरामदायक योगाभ्यास • Seated routines designed for joint vitality
        </p>
      </div>

      {!selectedExercise ? (
        /* Exercise Library Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercises.map((ex) => {
            const hindiTitle = convertToHindiSpeech(ex.title);
            const hindiDesc = convertToHindiSpeech(ex.description);

            return (
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

                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 group-hover:text-[#FF6321] transition-colors">
                    {hindiTitle !== ex.title ? `${hindiTitle} (${ex.title})` : ex.title}
                  </h3>
                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-normal mt-1">
                    {hindiDesc}
                  </p>
                </div>

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
            );
          })}
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
              <span>Back to Exercises • वापस जाएं</span>
            </button>
            <div className="text-sm font-bold text-rose-800">
              चरण {currentStepIdx + 1} of {selectedExercise.steps.length}
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {convertToHindiSpeech(selectedExercise.title)}
            </h2>
            <p className="text-stone-500 text-base sm:text-lg mt-1 font-normal">
              {convertToHindiSpeech(selectedExercise.description)}
            </p>
          </div>

          {/* Current Step Instruction Box */}
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-[24px] p-6 text-center space-y-4">
            <div className="text-xs uppercase font-bold tracking-wider text-stone-400">
              निर्देश (Audio Instruction Guide)
            </div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-snug">
              "{convertToHindiSpeech(selectedExercise.steps[currentStepIdx])}"
            </div>
            {convertToHindiSpeech(selectedExercise.steps[currentStepIdx]) !== selectedExercise.steps[currentStepIdx] && (
              <div className="text-xs text-stone-500 italic">
                ({selectedExercise.steps[currentStepIdx]})
              </div>
            )}
            <button
              onClick={() => speakText(selectedExercise.steps[currentStepIdx], 0.86)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-900 rounded-full font-semibold text-sm transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-[#FF6321]" />
              <span>हिंदी में सुनें (Read Aloud)</span>
            </button>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleNextStep}
              disabled={loading}
              className="w-full py-4 sm:py-5 px-6 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white text-xl sm:text-2xl font-bold rounded-2xl shadow-md shadow-orange-200/80 flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <span>
                {currentStepIdx < selectedExercise.steps.length - 1
                  ? 'अगला चरण (NEXT STEP)'
                  : 'व्यायाम पूरा करें (COMPLETE EXERCISE ✓)'}
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
            Exercise Completed ✓ • व्यायाम पूरा हुआ
          </h2>
          <p className="text-lg sm:text-xl text-stone-600 font-normal">
            आपने <strong>{convertToHindiSpeech(selectedExercise.title)}</strong> पूरा कर लिया है। +70 वेलनेस XP आपके खाते में जुड़ गए हैं!
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onNavigateHome}
              className="py-4 sm:py-5 px-8 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white text-xl sm:text-2xl font-bold rounded-2xl shadow-md transition-all cursor-pointer"
            >
              दिनचर्या पर लौटें (HOME)
            </button>
            <button
              onClick={() => {
                setSelectedExercise(null);
                setIsCompleted(false);
              }}
              className="py-4 sm:py-5 px-6 bg-[#FAF8F5] hover:bg-stone-200 border border-stone-200 text-stone-800 text-lg font-bold rounded-2xl transition-all cursor-pointer"
            >
              अन्य व्यायाम चुनें
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
