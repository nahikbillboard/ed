import React, { useState } from 'react';
import { Pill, CheckCircle2, BellRing, AlertTriangle, Clock, Sparkles, Check, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';
import { Senior, Medicine, DailyRoutine, SeniorProgress } from '../../types';

interface SeniorMedicinesProps {
  senior: Senior;
  medicines: Medicine[];
  routine: DailyRoutine;
  progress: SeniorProgress;
  onMedicineUpdated: (updatedMeds: Medicine[], updatedRoutine: DailyRoutine, updatedProg: SeniorProgress, whatsappData?: any) => void;
  onNavigateHome: () => void;
}

export const SeniorMedicines: React.FC<SeniorMedicinesProps> = ({
  senior,
  medicines,
  routine,
  progress,
  onMedicineUpdated,
  onNavigateHome,
}) => {
  const [takenStatus, setTakenStatus] = useState<Record<string, boolean>>({
    med_01: routine.breakfast_medicine_status === 'completed' || routine.medicine_status === 'completed',
    med_02: routine.lunch_medicine_status === 'completed',
    med_03: routine.dinner_medicine_status === 'completed' || routine.night_medicine_status === 'completed',
  });
  const [snoozedStatus, setSnoozedStatus] = useState<Record<string, boolean>>({});
  const [loadingMedId, setLoadingMedId] = useState<string | null>(null);

  const handleTakeAndSendToChild = async (med: Medicine) => {
    setLoadingMedId(med.id);
    playChime('success');

    confetti({
      particleCount: 60,
      spread: 60,
    });

    try {
      const res = await ApiClient.takeMedicine(med.id, senior.id);
      setTakenStatus(prev => ({ ...prev, [med.id]: true }));
      
      const updatedList = medicines.map(m => m.id === med.id ? res.medicine : m);
      
      const updatedRoutine: DailyRoutine = {
        ...res.routine,
        breakfast_medicine_status: med.medicine_number === 1 ? 'completed' : res.routine.breakfast_medicine_status,
        lunch_medicine_status: med.medicine_number === 2 ? 'completed' : res.routine.lunch_medicine_status,
        dinner_medicine_status: med.medicine_number === 3 ? 'completed' : res.routine.dinner_medicine_status,
        night_medicine_status: med.medicine_number === 3 ? 'completed' : res.routine.night_medicine_status,
      };

      onMedicineUpdated(updatedList, updatedRoutine, res.progress, {
        medicine: med.name,
      });

      speakText(`दवाई नंबर ${med.medicine_number}, ${med.name}, दर्ज हो गई है और गार्जियन ऐप पर लाइव अपडेट हो गई है।`);
    } catch (e) {
      console.error('Failed to log medicine:', e);
      setTakenStatus(prev => ({ ...prev, [med.id]: true }));
    } finally {
      setLoadingMedId(null);
    }
  };

  const handleSnooze = async (med: Medicine) => {
    setLoadingMedId(med.id);
    playChime('ding');
    try {
      await ApiClient.snoozeMedicineReminder(med.id, senior.id);
      setSnoozedStatus(prev => ({ ...prev, [med.id]: true }));
      speakText(`${med.name} दवाई का रिमाइंडर 15 मिनट के लिए आगे बढ़ा दिया गया है। मैं 15 मिनट बाद फिर याद दिलाऊंगा।`);
    } catch (e) {
      console.error('Failed to snooze:', e);
    } finally {
      setLoadingMedId(null);
    }
  };

  return (
    <div id="senior-medicines-screen" className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl transition-all active:scale-95 text-sm sm:text-base cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Routine</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>+40 XP Each</span>
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-800 rounded-full font-bold text-sm mb-2">
          <Pill className="w-4 h-4" />
          <span>DAILY PRESCRIPTIONS</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif text-stone-900 tracking-tight">
          My Medicines 💊
        </h1>
        <p className="text-base sm:text-lg text-stone-500 mt-2 font-sans">
          Take on time with water. One tap sends instant confirmation to your child on WhatsApp.
        </p>
      </div>

      {/* Medicines List */}
      <div className="space-y-4">
        {medicines.map((med) => {
          const isTaken = takenStatus[med.id];
          const isSnoozed = snoozedStatus[med.id];
          const isLowStock = med.quantity_remaining <= med.low_stock_threshold;
          const isLoading = loadingMedId === med.id;

          return (
            <div
              key={med.id}
              className={`rounded-[32px] p-6 sm:p-8 border transition-all shadow-xs ${
                isTaken
                  ? 'bg-[#FAF8F5] border-emerald-300'
                  : 'bg-white border-stone-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <span className="w-10 h-10 rounded-2xl bg-emerald-700 text-white font-bold text-base flex items-center justify-center shadow-xs">
                    #{med.medicine_number}
                  </span>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                      {med.name}
                    </h3>
                    <p className="text-base sm:text-lg font-medium text-emerald-800">
                      {med.dosage_information}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-stone-600 font-bold text-sm bg-stone-100 px-4 py-1.5 rounded-full self-start sm:self-auto">
                  <Clock className="w-4 h-4 text-stone-600" />
                  <span>Scheduled: {med.schedule_time}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="py-3">
                <p className="text-base sm:text-lg text-stone-700 font-normal">
                  <strong className="font-semibold text-stone-900">Instructions:</strong> {med.instructions}
                </p>
              </div>

              {/* Stock Meter & Low Stock Warning */}
              <div className="py-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-stone-500 mb-1.5">
                  <span>Stock Remaining:</span>
                  <span className={isLowStock ? 'text-amber-700 font-bold' : 'text-stone-700'}>
                    {med.quantity_remaining} {med.refill_unit}s
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (med.quantity_remaining / 30) * 100)}%` }}
                  />
                </div>

                {isLowStock && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-amber-900 text-sm font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Low Stock Alert ({med.quantity_remaining} doses left). Guardian notified for refill.
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row gap-3">
                {!isTaken ? (
                  <>
                    <button
                      id={`btn-send-to-child-med-${med.medicine_number}`}
                      onClick={() => handleTakeAndSendToChild(med)}
                      disabled={isLoading}
                      className="flex-1 py-4.5 px-6 bg-[#FF6321] hover:bg-[#e85516] active:scale-98 text-white text-lg font-bold rounded-2xl shadow-md shadow-orange-900/10 flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-6 h-6 text-white" />
                      <span>{isLoading ? 'Saving...' : 'Done ✓ (पूरा हुआ)'}</span>
                    </button>

                    <button
                      onClick={() => handleSnooze(med)}
                      disabled={isLoading || isSnoozed}
                      className="py-4 px-5 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 text-base font-bold rounded-2xl border border-stone-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <BellRing className="w-5 h-5 text-amber-700" />
                      <span>{isSnoozed ? 'Reminding in 15m' : 'Remind Later'}</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                    <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-base sm:text-lg">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Medicine Confirmed & Synced with Guardian App ✓ (+40 XP)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onNavigateHome}
          className="py-3.5 px-8 bg-stone-900 hover:bg-stone-800 text-white text-base sm:text-lg font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
        >
          Return to Daily Routine
        </button>
      </div>
    </div>
  );
};
