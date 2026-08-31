import React, { useState, useEffect } from 'react';
import {
  Bell,
  Pill,
  AlertTriangle,
  ShoppingBag,
  MessageSquare,
  ChevronRight,
  X,
  Volume2,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { Senior, Medicine } from '../../types';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';

interface PushNotificationAlertProps {
  senior: Senior;
  medicines: Medicine[];
  onRefillOrdered: () => void;
  onNavigateMedicines: () => void;
}

export const PushNotificationAlert: React.FC<PushNotificationAlertProps> = ({
  senior,
  medicines,
  onRefillOrdered,
  onNavigateMedicines,
}) => {
  const [dismissedMedIds, setDismissedMedIds] = useState<string[]>([]);
  const [orderingMedId, setOrderingMedId] = useState<string | null>(null);
  const [refillSuccessMsg, setRefillSuccessMsg] = useState<string | null>(null);
  const [hasPlayedChime, setHasPlayedChime] = useState<boolean>(false);
  const [showSimulateMenu, setShowSimulateMenu] = useState<boolean>(false);

  // Filter medicines that are currently below a 3-day supply (i.e. <= 3 doses remaining)
  const lowSupplyMedicines = medicines.filter(
    (med) => med.enabled && med.quantity_remaining <= 3 && !dismissedMedIds.includes(med.id)
  );

  // Trigger alert sound & native browser notification when low stock is detected
  useEffect(() => {
    if (lowSupplyMedicines.length > 0 && !hasPlayedChime) {
      playChime('alert');
      setHasPlayedChime(true);

      // Attempt native browser push notification if supported & permitted
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          const medNames = lowSupplyMedicines.map((m) => m.name).join(', ');
          try {
            new Notification(`⚠️ Sath Alert: Low Medicine for ${senior.name}`, {
              body: `${medNames} has less than 3 days of supply remaining. Order a refill now.`,
              icon: '/favicon.ico',
            });
          } catch (e) {
            console.warn('Native notification suppressed:', e);
          }
        }
      }
    }
  }, [lowSupplyMedicines.length, hasPlayedChime, senior.name]);

  const handleOrderRefill = async (med: Medicine) => {
    setOrderingMedId(med.id);
    playChime('success');

    try {
      await ApiClient.orderMedicineRefill(`refill_${Date.now()}`, med.id, 30);
      setRefillSuccessMsg(`30 doses added for ${med.name}! Refill dispatched.`);
      onRefillOrdered();
      speakText(`${senior.name} जी की ${med.name} दवाई का रिफिल ऑर्डर दे दिया गया है। 30 खुराक इन्वेंट्री में जुड़ गई हैं।`);
      setTimeout(() => {
        setRefillSuccessMsg(null);
      }, 5000);
    } catch (err) {
      console.error('Failed to order refill:', err);
    } finally {
      setOrderingMedId(null);
    }
  };

  const handleOrderAllRefills = async () => {
    setOrderingMedId('all');
    playChime('success');

    try {
      for (const med of lowSupplyMedicines) {
        await ApiClient.orderMedicineRefill(`refill_${Date.now()}_${med.id}`, med.id, 30);
      }
      setRefillSuccessMsg(`Pharmacy refill dispatched for all ${lowSupplyMedicines.length} low-stock medicines (+30 doses each)!`);
      onRefillOrdered();
      speakText(`सभी कम स्टॉक वाली दवाइयों का रिफिल सफलतापूर्वक ऑर्डर कर दिया गया है।`);
      setTimeout(() => {
        setRefillSuccessMsg(null);
      }, 5000);
    } catch (err) {
      console.error('Failed to order all refills:', err);
    } finally {
      setOrderingMedId(null);
    }
  };

  const handleSpeakAlert = () => {
    if (lowSupplyMedicines.length === 0) return;
    const names = lowSupplyMedicines.map((m) => `${m.name} में केवल ${m.quantity_remaining} खुराक बाकी हैं`).join(', ');
    speakText(`अलर्ट: ${senior.name} जी की दवाई इन्वेंट्री 3 दिन से कम बची है। ${names}। कृपया जल्द से जल्द रिफिल ऑर्डर करें।`);
  };

  const handleDismiss = (medId: string) => {
    setDismissedMedIds((prev) => [...prev, medId]);
    playChime('ding');
  };

  const handleSimulateLowStock = async (medId: string, qty: number) => {
    try {
      await ApiClient.updateMedicineQuantity(medId, qty);
      setDismissedMedIds((prev) => prev.filter((id) => id !== medId));
      setHasPlayedChime(false);
      onRefillOrdered();
      playChime('alert');
    } catch (e) {
      console.warn('Simulate error:', e);
    }
  };

  const handleWhatsAppPharmacy = (med: Medicine) => {
    playChime('ding');
    const message = encodeURIComponent(
      `Hello Pharmacy / Care Team, this is a prescription refill request for ${senior.name} (Age ${senior.age}).\n\n` +
      `Medicine: ${med.name}\n` +
      `Dosage: ${med.dosage_information}\n` +
      `Current Supply: ${med.quantity_remaining} ${med.refill_unit}s remaining (< 3-day supply)\n` +
      `Requested Refill: 30 ${med.refill_unit}s\n` +
      `Delivery Address: ${senior.address || 'Senior Residence'}\n` +
      `Guardian: ${senior.guardian_name} (${senior.guardian_phone})`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // If no medicines are currently below 3-day supply and no success banner is active, display a subtle normal status indicator with simulator trigger
  if (lowSupplyMedicines.length === 0) {
    return (
      <div className="space-y-2">
        {refillSuccessMsg && (
          <div
            id="refill-success-banner"
            className="p-4 bg-emerald-50 border border-emerald-300 rounded-[28px] flex items-center justify-between gap-3 text-emerald-950 font-semibold text-sm shadow-xs animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{refillSuccessMsg}</span>
            </div>
            <button
              onClick={() => setRefillSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-950 text-xs font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Quiet Healthy Inventory Pill with Test Controls */}
        <div className="bg-white border border-stone-200/80 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-stone-600 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-stone-800">Prescription Inventory Healthy:</span>
            <span className="hidden sm:inline text-stone-500">
              All {medicines.length} active prescriptions have &gt; 3-day supplies.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-simulate-low-stock-toggle"
              onClick={() => setShowSimulateMenu(!showSimulateMenu)}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              title="Test automated push alert when inventory drops below 3 days"
            >
              <Sliders className="w-3 h-3 text-amber-600" />
              <span>Test &lt; 3-Day Push Alert</span>
            </button>
          </div>
        </div>

        {/* Quick Simulator Dropdown */}
        {showSimulateMenu && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-amber-900 font-bold">
              <span>Simulate Low Inventory (&lt; 3-Day Supply):</span>
              <button onClick={() => setShowSimulateMenu(false)} className="text-amber-700 hover:text-amber-950 font-bold">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {medicines.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSimulateLowStock(m.id, 2)}
                  className="p-2 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-xl text-left font-medium text-stone-800 transition-colors flex items-center justify-between"
                >
                  <span className="truncate">#{m.medicine_number} {m.name.split(' ')[0]}</span>
                  <span className="text-amber-700 font-bold ml-1 shrink-0">Set to 2 left</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ACTIVE PUSH-NOTIFICATION ALERT
  return (
    <div
      id="guardian-medicine-push-alert"
      className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50/50 to-white border-2 border-amber-400 rounded-[32px] p-5 sm:p-6 shadow-lg shadow-amber-500/10 space-y-4 animate-in slide-in-from-top-2 duration-300"
    >
      {/* Top Push Notification Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Pulsing App Badge */}
          <div className="w-8 h-8 rounded-xl bg-[#FF6321] text-white flex items-center justify-center shadow-xs">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              Automated Push Alert
            </span>
            <span className="text-[11px] font-bold text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded-full">
              Sath Safety Stream • Just now
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-push-alert-speak"
            onClick={handleSpeakAlert}
            className="flex items-center gap-1 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-2.5 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Listen to audio alert announcement"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#FF6321]" />
            <span className="hidden sm:inline">Listen (Audio)</span>
          </button>

          <span className="px-2.5 py-1 bg-amber-500 text-stone-950 rounded-full font-black text-[11px] uppercase tracking-wide shadow-2xs">
            ⚠️ &lt; 3-Day Supply
          </span>
        </div>
      </div>

      {/* Main Alert Body */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-950 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              <span>
                Low Medicine Inventory for <strong className="text-[#FF6321]">{senior.name}</strong>
              </span>
            </h2>
            <p className="text-stone-700 text-sm sm:text-base mt-1 font-normal">
              Automated telemetry detected prescription inventory has dropped below a critical <strong className="font-semibold text-stone-900">3-day supply threshold</strong>. Immediate refill dispatch is required to prevent missed doses.
            </p>
          </div>

          {lowSupplyMedicines.length > 1 && (
            <button
              id="btn-order-all-refills"
              onClick={handleOrderAllRefills}
              disabled={orderingMedId !== null}
              className="py-2.5 px-4 bg-[#FF6321] hover:bg-[#e85516] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{orderingMedId === 'all' ? 'Ordering All...' : '1-Click Refill All (+30 Each)'}</span>
            </button>
          )}
        </div>

        {/* Itemized Medicine Warning Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {lowSupplyMedicines.map((med) => {
            const dosesLeft = med.quantity_remaining;
            const daysSupply = Math.max(0, dosesLeft); // Assuming 1 dose per scheduled day

            return (
              <div
                key={med.id}
                className="bg-white rounded-2xl p-4 border border-amber-300 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                        #{med.medicine_number}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                        {med.schedule_time} Daily Schedule
                      </span>
                    </div>

                    <button
                      onClick={() => handleDismiss(med.id)}
                      className="text-stone-400 hover:text-stone-700 p-1 text-xs"
                      title="Dismiss this alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                    {med.name}
                  </h3>
                  <div className="text-xs text-stone-600 font-medium">
                    {med.dosage_information} • {med.instructions}
                  </div>
                </div>

                {/* Stock Level Warning Visual */}
                <div className="bg-amber-50/80 rounded-xl p-2.5 border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-amber-950 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-amber-600" />
                      <span>Critical Stock Remaining:</span>
                    </span>
                    <span className="text-red-600 text-sm font-black">
                      {dosesLeft} {med.refill_unit}s ({daysSupply} day{daysSupply === 1 ? '' : 's'} left)
                    </span>
                  </div>

                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(8, (dosesLeft / 30) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons for this Medicine */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    id={`btn-push-refill-${med.medicine_number}`}
                    onClick={() => handleOrderRefill(med)}
                    disabled={orderingMedId === med.id}
                    className="flex-1 py-2.5 px-3 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {orderingMedId === med.id ? 'Ordering...' : '1-Click Refill (+30)'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleWhatsAppPharmacy(med)}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Send WhatsApp refill order to Pharmacy"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-amber-200/60 text-xs text-stone-600">
          <div className="flex items-center gap-1.5 text-amber-900 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Prescription orders are dispatched directly to Sunita's preferred neighborhood pharmacy.</span>
          </div>

          <button
            onClick={onNavigateMedicines}
            className="inline-flex items-center gap-1 text-[#FF6321] hover:text-[#e85516] font-bold transition-colors cursor-pointer"
          >
            <span>Open All Prescription Management</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
