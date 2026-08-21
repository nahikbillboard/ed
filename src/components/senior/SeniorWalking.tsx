import React, { useState } from 'react';
import { Footprints, CheckCircle2, Sparkles, Wind, ArrowRight, PlusCircle, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';
import { Senior, DailyActivity, DailyRoutine, SeniorProgress } from '../../types';

interface SeniorWalkingProps {
  senior: Senior;
  activity: DailyActivity;
  routine: DailyRoutine;
  progress: SeniorProgress;
  onActivityUpdated: (updatedAct: DailyActivity, updatedRoutine: DailyRoutine, updatedProg: SeniorProgress) => void;
  onNavigateBreathing: () => void;
}

export const SeniorWalking: React.FC<SeniorWalkingProps> = ({
  senior,
  activity,
  routine,
  progress,
  onActivityUpdated,
  onNavigateBreathing,
}) => {
  const [loading, setLoading] = useState(false);
  const [localSteps, setLocalSteps] = useState(activity.steps);

  const goal = activity.step_goal || 8000;
  const percentage = Math.min(100, Math.round((localSteps / goal) * 100));
  const remaining = Math.max(0, goal - localSteps);
  const distanceKm = +(localSteps * 0.00067).toFixed(2);
  const isGoalReached = localSteps >= goal || routine.walking_status === 'completed';

  const handleAddSteps = async (amount: number) => {
    setLoading(true);
    playChime('ding');

    try {
      const res = await ApiClient.addSteps(senior.id, amount);
      setLocalSteps(res.activity.steps);
      onActivityUpdated(res.activity, res.routine, progress);

      if (res.unlockedBreathing || res.activity.steps >= res.activity.step_goal) {
        playChime('success');
        confetti({ particleCount: 70, spread: 60 });
        speakText(`Congratulations ${senior.name}! You reached your daily walking goal! Breathing exercise is now unlocked.`);
      } else {
        speakText(`Added ${amount} steps. Great progress!`);
      }
    } catch (e) {
      console.error('Failed to add steps:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="senior-walking-screen" className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 text-center">
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-800 rounded-full font-bold text-sm mb-2">
          <Footprints className="w-4 h-4" />
          <span>DAILY ACTIVITY</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif text-stone-900 tracking-tight">
          Today's Walk
        </h1>
        <p className="text-xl sm:text-2xl font-serif text-blue-800 mt-1">
          {localSteps.toLocaleString()} / {goal.toLocaleString()} Steps
        </p>
      </div>

      {/* Big Circular Progress Ring Visual */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="currentColor"
            strokeWidth="8"
            className="text-stone-200 fill-none"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={264}
            strokeDashoffset={264 - (264 * percentage) / 100}
            strokeLinecap="round"
            className="text-blue-500 fill-none transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Ring Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className="text-5xl sm:text-6xl font-bold text-stone-900">
            {percentage}%
          </div>
          <div className="text-base sm:text-lg font-bold text-stone-500 mt-1">
            {isGoalReached ? 'GOAL COMPLETED ✓' : `${remaining.toLocaleString()} to go`}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
        <div className="bg-white border border-stone-200 rounded-[24px] p-4 shadow-xs">
          <div className="text-xs uppercase font-bold text-stone-400">Distance</div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">{distanceKm} km</div>
          <div className="text-xs text-stone-500 mt-0.5">Approx. {(distanceKm * 0.62).toFixed(1)} miles</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-[24px] p-4 shadow-xs">
          <div className="text-xs uppercase font-bold text-stone-400">Goal Target</div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">{goal.toLocaleString()}</div>
          <div className="text-xs text-blue-700 font-semibold mt-0.5">Configured by Guardian</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-[24px] p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-xs uppercase font-bold text-stone-400">Status</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
            {isGoalReached ? 'Completed ✓' : 'In Progress 🚶'}
          </div>
          <div className="text-xs text-stone-500 mt-0.5">Auto-synced sensor</div>
        </div>
      </div>

      {/* Goal Reached Reward Card */}
      {isGoalReached && (
        <div className="bg-white border border-emerald-300 rounded-[32px] p-6 text-left space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-stone-900">
                Walking Goal Complete! (+80 XP)
              </h3>
              <p className="text-stone-600 text-base font-medium">
                Awesome work! Next step: relaxed guided breathing.
              </p>
            </div>
          </div>

          <button
            id="btn-unlock-breathing-cta"
            onClick={onNavigateBreathing}
            className="w-full py-5 px-6 bg-[#FF6321] hover:bg-[#e85516] text-white text-xl sm:text-2xl font-bold rounded-2xl shadow-md flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <Wind className="w-6 h-6" />
            <span>START BREATHING EXERCISE</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Sensor Simulation Buttons */}
      <div className="bg-[#FAF8F5] border border-stone-200 rounded-[24px] p-4 text-left space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-700 font-bold text-sm sm:text-base">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Pedometer / Sensor Input (Demo Simulator)</span>
          </div>
          <span className="text-xs bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-mono">SIMULATION</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => handleAddSteps(500)}
            disabled={loading}
            className="py-3 px-4 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>+500 Steps</span>
          </button>

          <button
            onClick={() => handleAddSteps(1500)}
            disabled={loading}
            className="py-3 px-4 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>+1,500 Steps</span>
          </button>

          <button
            onClick={() => handleAddSteps(Math.max(100, goal - localSteps))}
            disabled={loading || isGoalReached}
            className="py-3 px-4 bg-[#FF6321] hover:bg-[#e85516] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all col-span-2 sm:col-span-1 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Complete Goal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
