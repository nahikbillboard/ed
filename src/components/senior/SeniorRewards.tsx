import React, { useState, useMemo } from 'react';
import {
  Gift,
  Flame,
  Sparkles,
  CheckCircle2,
  Trophy,
  Star,
  TrendingUp,
  Activity,
  CalendarCheck,
  Dumbbell,
  Volume2,
  CheckCheck,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import confetti from 'canvas-confetti';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';
import { Senior, SeniorProgress, Reward, DailyRoutine, DailyActivity } from '../../types';

interface SeniorRewardsProps {
  senior: Senior;
  progress: SeniorProgress;
  rewards: Reward[];
  routine?: DailyRoutine;
  activity?: DailyActivity;
  onProgressUpdated: (updatedProg: SeniorProgress) => void;
  onNavigateHome: () => void;
}

interface DayTrendData {
  day: string;
  fullDate: string;
  tasks: number;
  exercises: number;
  xp: number;
  label: string;
}

export const SeniorRewards: React.FC<SeniorRewardsProps> = ({
  senior,
  progress,
  rewards,
  routine,
  activity,
  onProgressUpdated,
  onNavigateHome,
}) => {
  const [localXp, setLocalXp] = useState(progress.total_xp);
  const [loadingRewardId, setLoadingRewardId] = useState<string | null>(null);
  const [redeemedReward, setRedeemedReward] = useState<Reward | null>(null);
  const [trendFilter, setTrendFilter] = useState<'all' | 'tasks' | 'exercises'>('all');

  // Compute 7-day activity trend for Sunita
  const weeklyData: DayTrendData[] = useMemo(() => {
    const days: DayTrendData[] = [];
    const today = new Date();

    const historicalData = [
      { tasks: 5, exercises: 1, xp: 180 },
      { tasks: 6, exercises: 2, xp: 210 },
      { tasks: 6, exercises: 1, xp: 190 },
      { tasks: 7, exercises: 2, xp: 240 },
      { tasks: 6, exercises: 2, xp: 220 },
      { tasks: 7, exercises: 2, xp: 250 },
    ];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (i === 0) {
        let todayTasks = 5;
        let todayExercises = 1;
        if (routine) {
          let tCount = 0;
          if (routine.wake_status === 'completed') tCount++;
          if (routine.walking_status === 'completed') tCount++;
          if (routine.breathing_status === 'completed') tCount++;
          if (routine.breakfast_status === 'completed') tCount++;
          if (routine.breakfast_medicine_status === 'completed') tCount++;
          if (routine.lunch_status === 'completed') tCount++;
          if (routine.lunch_medicine_status === 'completed') tCount++;
          if (routine.dinner_status === 'completed') tCount++;
          if (routine.dinner_medicine_status === 'completed') tCount++;
          if (routine.night_medicine_status === 'completed') tCount++;
          todayTasks = Math.max(tCount, 4);
          if (routine.yoga_status === 'completed') todayExercises = 2;
        }
        days.push({
          day: 'Today',
          fullDate,
          tasks: todayTasks,
          exercises: todayExercises,
          xp: routine?.xp_earned || 220,
          label: `${dayName} (${fullDate})`
        });
      } else {
        const seed = historicalData[6 - i] || { tasks: 6, exercises: 1, xp: 200 };
        days.push({
          day: dayName,
          fullDate,
          tasks: seed.tasks,
          exercises: seed.exercises,
          xp: seed.xp,
          label: `${dayName} (${fullDate})`
        });
      }
    }
    return days;
  }, [routine]);

  // Aggregate weekly stats
  const totalWeeklyTasks = weeklyData.reduce((acc, d) => acc + d.tasks, 0);
  const totalWeeklyExercises = weeklyData.reduce((acc, d) => acc + d.exercises, 0);
  const totalWeeklyXp = weeklyData.reduce((acc, d) => acc + d.xp, 0);

  const speakWeeklyRecap = () => {
    playChime('ding');
    speakText(
      `शाबाश ${senior.name} जी! पिछले 7 दिनों में आपने ${totalWeeklyTasks} दैनिक कार्य और ${totalWeeklyExercises} योगाभ्यास पूरे किए हैं। आपका 7 दिन का स्ट्रीक बहुत शानदार चल रहा है!`
    );
  };

  const handleRedeem = async (reward: Reward) => {
    if (localXp < reward.xp_cost) {
      playChime('alert');
      speakText(`इस उपहार के लिए आपको ${reward.xp_cost - localXp} और एक्स-पी चाहिए। वॉक और व्यायाम जारी रखें!`);
      return;
    }

    setLoadingRewardId(reward.id);
    playChime('success');

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });

    try {
      const res = await ApiClient.redeemReward(reward.id, senior.id);
      setLocalXp(res.remainingXp);
      setRedeemedReward(reward);
      onProgressUpdated({ ...progress, total_xp: res.remainingXp });

      speakText(`बधाई हो ${senior.name} जी! आपने ${reward.title} रिडीम कर लिया है। आपके अभिभावक ${senior.guardian_name} जी को सूचना भेज दी गई है!`);
    } catch (e) {
      console.error('Failed to redeem reward:', e);
    } finally {
      setLoadingRewardId(null);
    }
  };

  // Custom Elder-Friendly Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DayTrendData;
      return (
        <div className="bg-stone-900/95 text-white p-3 sm:p-4 rounded-2xl shadow-xl border border-stone-700 text-xs sm:text-sm space-y-1.5 min-w-[180px] backdrop-blur-md">
          <div className="font-serif font-bold text-stone-200 border-b border-stone-800 pb-1 flex items-center justify-between">
            <span>{data.label || label}</span>
            <span className="text-amber-400 font-sans font-semibold">+{data.xp} XP</span>
          </div>
          <div className="flex items-center justify-between text-[#FF6321] font-semibold pt-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6321]"></span>
              <span>Tasks Completed:</span>
            </span>
            <span className="text-white font-bold">{data.tasks}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Yoga & Exercises:</span>
            </span>
            <span className="text-white font-bold">{data.exercises}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="senior-rewards-screen" className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FAF8F5] border border-stone-200 rounded-[32px] p-6 sm:p-8 text-stone-900 shadow-xs text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-900 rounded-full text-sm font-bold">
          <Trophy className="w-4 h-4 text-amber-700" />
          <span>SENIOR MILESTONES • {senior.name.toUpperCase()}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Wellness XP & Rewards 🏆
        </h1>

        <p className="text-lg sm:text-xl text-stone-600 font-sans max-w-xl mx-auto">
          Every step, routine check-in, and medicine taken earns reward credits for {senior.name}!
        </p>

        {/* Big XP & Streak Counter Cards */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-white border border-stone-200 rounded-[24px] p-4 text-center shadow-xs">
            <div className="text-xs uppercase font-bold text-stone-500 flex items-center justify-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Available XP</span>
            </div>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mt-1">
              {localXp.toLocaleString()}
            </div>
            <div className="text-xs text-stone-500 font-medium mt-1">
              Level {progress.level || 2} Companion
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-[24px] p-4 text-center shadow-xs">
            <div className="text-xs uppercase font-bold text-stone-500 flex items-center justify-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#FF6321] fill-[#FF6321]" />
              <span>Daily Streak</span>
            </div>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-[#FF6321] mt-1">
              {progress.current_streak} Days
            </div>
            <div className="text-xs text-stone-500 font-medium mt-1">
              Personal Best: {progress.longest_streak} Days
            </div>
          </div>
        </div>
      </div>

      {/* 7-DAY WEEKLY ACTIVITY SUMMARY CARD WITH RECHARTS */}
      <div
        id="weekly-activity-summary-card"
        className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-7 shadow-xs space-y-5"
      >
        {/* Card Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-[#FF6321] rounded-full text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>7-DAY ACTIVITY TREND</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <span>{senior.name}'s Weekly Summary</span>
              <Activity className="w-5 h-5 text-emerald-600" />
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-normal">
              Trend line of completed daily tasks and gentle exercises over the last 7 days.
            </p>
          </div>

          {/* Hindi Voice Readout Button */}
          <div className="flex items-center gap-2">
            <button
              id="btn-speak-weekly-summary"
              onClick={speakWeeklyRecap}
              className="flex items-center gap-1.5 bg-stone-100 hover:bg-orange-50 hover:text-[#FF6321] text-stone-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors border border-stone-200 cursor-pointer"
              title="हिंदी में सारांश सुनें (Listen to Weekly Recap)"
            >
              <Volume2 className="w-4 h-4 text-[#FF6321]" />
              <span>साप्ताहिक रिपोर्ट सुनें</span>
            </button>
          </div>
        </div>

        {/* Filter Toggle Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              id="activity-filter-all"
              onClick={() => setTrendFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                trendFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Both Trends
            </button>
            <button
              id="activity-filter-tasks"
              onClick={() => setTrendFilter('tasks')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                trendFilter === 'tasks'
                  ? 'bg-[#FF6321] text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span>Tasks Only</span>
            </button>
            <button
              id="activity-filter-exercises"
              onClick={() => setTrendFilter('exercises')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                trendFilter === 'exercises'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span>Exercises Only</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF6321]"></span>
              <span>Tasks (Goal: 6-7/day)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Exercises (Yoga/Walk)</span>
            </span>
          </div>
        </div>

        {/* Recharts Area & Trend Chart */}
        <div id="recharts-activity-container" className="w-full h-64 sm:h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={weeklyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6321" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#FF6321" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorExercises" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EFEA" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#78716C"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E7E5E4' }}
              />
              <YAxis
                stroke="#78716C"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E7E5E4' }}
                domain={[0, 8]}
                ticks={[0, 2, 4, 6, 8]}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Tasks Trend Area & Line */}
              {(trendFilter === 'all' || trendFilter === 'tasks') && (
                <Area
                  type="monotone"
                  dataKey="tasks"
                  name="Tasks Done"
                  stroke="#FF6321"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTasks)"
                  dot={{ r: 4, fill: '#FF6321', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7, fill: '#FF6321', strokeWidth: 3, stroke: '#FFFFFF' }}
                />
              )}

              {/* Exercises Trend Area & Line */}
              {(trendFilter === 'all' || trendFilter === 'exercises') && (
                <Area
                  type="monotone"
                  dataKey="exercises"
                  name="Yoga & Exercises"
                  stroke="#059669"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExercises)"
                  dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7, fill: '#059669', strokeWidth: 3, stroke: '#FFFFFF' }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 4 Weekly Metric Highlight Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-3 text-center">
            <div className="text-[11px] font-bold uppercase text-stone-500 flex items-center justify-center gap-1">
              <CheckCheck className="w-3.5 h-3.5 text-[#FF6321]" />
              <span>Tasks Done</span>
            </div>
            <div className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
              {totalWeeklyTasks}
            </div>
            <div className="text-[11px] text-stone-500 font-medium">96% on schedule</div>
          </div>

          <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-3 text-center">
            <div className="text-[11px] font-bold uppercase text-stone-500 flex items-center justify-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exercises</span>
            </div>
            <div className="text-2xl font-serif font-bold text-emerald-700 mt-0.5">
              {totalWeeklyExercises}
            </div>
            <div className="text-[11px] text-stone-500 font-medium">Yoga & walks</div>
          </div>

          <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-3 text-center">
            <div className="text-[11px] font-bold uppercase text-stone-500 flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Weekly XP</span>
            </div>
            <div className="text-2xl font-serif font-bold text-amber-700 mt-0.5">
              +{totalWeeklyXp}
            </div>
            <div className="text-[11px] text-stone-500 font-medium">Wellness credits</div>
          </div>

          <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-3 text-center">
            <div className="text-[11px] font-bold uppercase text-stone-500 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#FF6321] fill-[#FF6321]" />
              <span>Consistency</span>
            </div>
            <div className="text-2xl font-serif font-bold text-[#FF6321] mt-0.5">
              {progress.current_streak} / 7
            </div>
            <div className="text-[11px] text-stone-500 font-medium">Days active</div>
          </div>
        </div>
      </div>

      {/* Redemption Success Alert */}
      {redeemedReward && (
        <div className="bg-white border border-emerald-300 rounded-[32px] p-6 text-center space-y-3 shadow-xs animate-in zoom-in-95 duration-200">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-700 rounded-full">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-stone-900">
            Reward Redeemed! {redeemedReward.title}
          </h3>
          <p className="text-base sm:text-lg text-stone-600 font-normal">
            We sent a gift fulfillment alert to <strong>{senior.guardian_name}</strong>. Enjoy your special treat!
          </p>
          <button
            onClick={() => setRedeemedReward(null)}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-full text-sm cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Rewards Catalog */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
          <Gift className="w-6 h-6 text-[#FF6321]" />
          <span>Redeemable Wellness Treats</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.map((r) => {
            const canAfford = localXp >= r.xp_cost;

            return (
              <div
                key={r.id}
                className="bg-white border border-stone-200 rounded-[32px] p-6 shadow-xs hover:border-orange-300 transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{r.icon}</span>
                    <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full font-bold text-sm flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{r.xp_cost} XP</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-3">
                    {r.title}
                  </h3>
                  <p className="text-stone-600 text-sm sm:text-base mt-1 leading-relaxed font-normal">
                    {r.description}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    id={`btn-redeem-${r.id}`}
                    onClick={() => handleRedeem(r)}
                    disabled={!canAfford || loadingRewardId === r.id}
                    className={`w-full py-4 px-6 text-lg font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                      canAfford
                        ? 'bg-[#FF6321] hover:bg-[#e85516] text-white shadow-md shadow-orange-200/80'
                        : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                    }`}
                  >
                    <Gift className="w-5 h-5" />
                    <span>
                      {loadingRewardId === r.id
                        ? 'REDEEMING...'
                        : canAfford
                        ? 'REDEEM WITH XP'
                        : `Need ${r.xp_cost - localXp} More XP`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onNavigateHome}
          className="py-4 px-8 bg-stone-900 hover:bg-stone-800 text-white text-lg sm:text-xl font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
        >
          RETURN TO HOME
        </button>
      </div>
    </div>
  );
};

