import React, { useState } from 'react';
import { Gift, Flame, Sparkles, CheckCircle2, Trophy, Star, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';
import { Senior, SeniorProgress, Reward } from '../../types';

interface SeniorRewardsProps {
  senior: Senior;
  progress: SeniorProgress;
  rewards: Reward[];
  onProgressUpdated: (updatedProg: SeniorProgress) => void;
  onNavigateHome: () => void;
}

export const SeniorRewards: React.FC<SeniorRewardsProps> = ({
  senior,
  progress,
  rewards,
  onProgressUpdated,
  onNavigateHome,
}) => {
  const [localXp, setLocalXp] = useState(progress.total_xp);
  const [loadingRewardId, setLoadingRewardId] = useState<string | null>(null);
  const [redeemedReward, setRedeemedReward] = useState<Reward | null>(null);

  const handleRedeem = async (reward: Reward) => {
    if (localXp < reward.xp_cost) {
      playChime('alert');
      speakText(`You need ${reward.xp_cost - localXp} more XP to redeem this treat. Keep walking and doing your exercises!`);
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

      speakText(`Congratulations ${senior.name}! You redeemed ${reward.title}. Your guardian ${senior.guardian_name} has received the fulfillment request!`);
    } catch (e) {
      console.error('Failed to redeem reward:', e);
    } finally {
      setLoadingRewardId(null);
    }
  };

  return (
    <div id="senior-rewards-screen" className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FAF8F5] border border-stone-200 rounded-[32px] p-6 sm:p-8 text-stone-900 shadow-xs text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-900 rounded-full text-sm font-bold">
          <Trophy className="w-4 h-4 text-amber-700" />
          <span>SENIOR MILESTONES</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Wellness XP & Rewards 🏆
        </h1>

        <p className="text-lg sm:text-xl text-stone-600 font-sans max-w-xl mx-auto">
          Every step, routine check-in, and medicine taken earns reward credits!
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
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-full text-sm"
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
                    className={`w-full py-4 px-6 text-lg font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
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
          className="py-4 px-8 bg-stone-900 hover:bg-stone-800 text-white text-lg sm:text-xl font-bold rounded-2xl shadow-sm transition-all"
        >
          RETURN TO HOME
        </button>
      </div>
    </div>
  );
};
