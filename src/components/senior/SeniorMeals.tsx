import React, { useState } from 'react';
import { Senior, DailyRoutine, SeniorProgress } from '../../types';
import { SeniorSingleMeal } from './SeniorSingleMeal';

interface SeniorMealsProps {
  senior: Senior;
  routine: DailyRoutine;
  progress: SeniorProgress;
  initialMeal?: 'breakfast' | 'lunch' | 'dinner';
  onMealCompleted: (updatedRoutine: DailyRoutine, updatedProg: SeniorProgress, whatsappData?: any) => void;
  onNavigateHome: () => void;
}

export const SeniorMeals: React.FC<SeniorMealsProps> = ({
  senior,
  routine,
  progress,
  initialMeal = 'breakfast',
  onMealCompleted,
  onNavigateHome,
}) => {
  // Determine current meal based on time of day if not specified
  const getDefaultMeal = (): 'breakfast' | 'lunch' | 'dinner' => {
    if (initialMeal === 'breakfast' || initialMeal === 'lunch' || initialMeal === 'dinner') {
      return initialMeal;
    }
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 16) return 'lunch';
    return 'dinner';
  };

  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner'>(getDefaultMeal());

  return (
    <div className="space-y-4">
      {/* Top Meal Switcher Tabs */}
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 p-1.5 bg-stone-200/80 rounded-2xl">
        <button
          onClick={() => setSelectedMeal('breakfast')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedMeal === 'breakfast'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>🥣</span>
          <span>Breakfast</span>
          {routine.breakfast_status === 'completed' && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">✓</span>
          )}
        </button>

        <button
          onClick={() => setSelectedMeal('lunch')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedMeal === 'lunch'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>🥗</span>
          <span>Lunch</span>
          {routine.lunch_status === 'completed' && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">✓</span>
          )}
        </button>

        <button
          onClick={() => setSelectedMeal('dinner')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedMeal === 'dinner'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>🍲</span>
          <span>Dinner</span>
          {routine.dinner_status === 'completed' && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">✓</span>
          )}
        </button>
      </div>

      {/* Render the Single Meal View for the selected meal */}
      <SeniorSingleMeal
        key={selectedMeal}
        mealType={selectedMeal}
        senior={senior}
        routine={routine}
        progress={progress}
        onMealCompleted={onMealCompleted}
        onNavigateHome={onNavigateHome}
      />
    </div>
  );
};
