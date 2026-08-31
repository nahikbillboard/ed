import React, { useState } from 'react';
import { Pill, AlertTriangle, CheckCircle2, ShoppingBag, ArrowLeft, RefreshCw, Plus, Clock, Sliders } from 'lucide-react';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';
import { Senior, Medicine } from '../../types';

interface GuardianMedicinesProps {
  senior: Senior;
  medicines: Medicine[];
  onRefillOrdered: () => void;
  onBack: () => void;
}

export const GuardianMedicines: React.FC<GuardianMedicinesProps> = ({
  senior,
  medicines,
  onRefillOrdered,
  onBack,
}) => {
  const [loadingMedId, setLoadingMedId] = useState<string | null>(null);
  const [refillSuccessMed, setRefillSuccessMed] = useState<string | null>(null);

  const handleOrderRefill = async (med: Medicine) => {
    setLoadingMedId(med.id);
    playChime('success');

    try {
      await ApiClient.orderMedicineRefill(`refill_${Date.now()}`, med.id, 30);
      setRefillSuccessMed(med.name);
      onRefillOrdered();
      speakText(`${med.name} के लिए रिफिल ऑर्डर दे दिया गया है। 30 खुराक इन्वेंट्री में जोड़ दी गई हैं।`);
      setTimeout(() => setRefillSuccessMed(null), 4000);
    } catch (e) {
      console.error('Failed to order refill:', e);
    } finally {
      setLoadingMedId(null);
    }
  };

  const handleSimulateStock = async (med: Medicine, qty: number) => {
    try {
      await ApiClient.updateMedicineQuantity(med.id, qty);
      onRefillOrdered();
      playChime(qty <= 3 ? 'alert' : 'success');
      if (qty <= 3) {
        speakText(`चेतावनी: ${senior.name} जी की ${med.name} दवाई में केवल ${qty} खुराक शेष हैं।`);
      }
    } catch (e) {
      console.warn('Stock simulation error:', e);
    }
  };

  return (
    <div id="guardian-medicines-view" className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-semibold text-sm mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            Prescription & Inventory Management 💊
          </h1>
          <p className="text-stone-500 text-sm sm:text-base mt-1 font-normal">
            Tracking active prescriptions and pharmacy refill thresholds for <strong className="font-semibold text-stone-800">{senior.name}</strong>. Automated alerts trigger whenever supply falls below 3 days.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-[#FAF8F5] border border-stone-200 text-stone-800 rounded-full font-bold text-xs">
            {medicines.length} Prescriptions Active
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {refillSuccessMed && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-[24px] flex items-center gap-3 text-emerald-950 font-semibold text-sm shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Refill Order Dispatched! +30 doses added for <strong className="font-bold">{refillSuccessMed}</strong>. Pharmacy notification sent.
          </span>
        </div>
      )}

      {/* Prescriptions Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medicines.map((med) => {
          const isCritical = med.quantity_remaining <= 3;
          const isLow = med.quantity_remaining <= med.low_stock_threshold;
          const pct = Math.min(100, Math.round((med.quantity_remaining / 30) * 100));

          return (
            <div
              key={med.id}
              className={`bg-white rounded-[32px] p-6 border shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                isCritical
                  ? 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-50/20'
                  : isLow
                  ? 'border-amber-300 bg-amber-50/10'
                  : 'border-stone-200 hover:border-emerald-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                    #{med.medicine_number}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-stone-500">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{med.schedule_time}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">{med.name}</h3>
                  <div className="text-sm font-semibold text-emerald-800">{med.dosage_information}</div>
                </div>

                <div className="bg-[#FAF8F5] rounded-2xl p-3 text-xs sm:text-sm text-stone-700 font-normal">
                  <strong className="font-semibold text-stone-900">Instructions:</strong> {med.instructions}
                </div>

                {/* Stock Level Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-stone-500">Inventory Remaining:</span>
                    <span className={isCritical ? 'text-red-600 font-black' : isLow ? 'text-amber-700 font-bold' : 'text-stone-800'}>
                      {med.quantity_remaining} {med.refill_unit}s ({med.quantity_remaining} day{med.quantity_remaining === 1 ? '' : 's'} supply)
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(6, pct)}%` }}
                    />
                  </div>
                </div>

                {isCritical ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-900 text-xs font-medium">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>
                      🚨 <strong>Critical (&lt; 3 Days):</strong> Only {med.quantity_remaining} doses left! Push alert active.
                    </span>
                  </div>
                ) : isLow ? (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-900 text-xs font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Low stock alert! Below threshold ({med.low_stock_threshold} {med.refill_unit}s).</span>
                  </div>
                ) : null}

                {/* Stock Simulation Tester */}
                <div className="pt-1 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-100">
                  <span className="font-semibold">Test Stock:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSimulateStock(med, 2)}
                      className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded border border-amber-200 transition-colors cursor-pointer"
                      title="Set inventory to 2 doses (< 3 days)"
                    >
                      Set to 2 (Alert)
                    </button>
                    <button
                      onClick={() => handleSimulateStock(med, 30)}
                      className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded border border-stone-300 transition-colors cursor-pointer"
                      title="Reset inventory to 30 doses"
                    >
                      Reset 30
                    </button>
                  </div>
                </div>
              </div>

              {/* 1-Click Refill Button */}
              <div className="pt-2">
                <button
                  id={`btn-order-refill-${med.medicine_number}`}
                  onClick={() => handleOrderRefill(med)}
                  disabled={loadingMedId === med.id}
                  className="w-full py-3.5 px-4 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white font-bold text-sm rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {loadingMedId === med.id ? 'Ordering...' : 'Order Pharmacy Refill (+30)'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
