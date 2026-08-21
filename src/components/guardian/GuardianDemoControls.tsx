import React, { useState } from 'react';
import { Wrench, PhoneCall, AlertTriangle, MessageCircle, RefreshCw, X, Sparkles, CheckCircle2, Footprints, Pill } from 'lucide-react';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';
import { Senior, VoiceCallItem, NotificationItem } from '../../types';

interface GuardianDemoControlsProps {
  senior: Senior;
  isOpen: boolean;
  onClose: () => void;
  onEventDispatched: (call?: VoiceCallItem, notif?: NotificationItem) => void;
  onDatabaseReset: () => void;
}

export const GuardianDemoControls: React.FC<GuardianDemoControlsProps> = ({
  senior,
  isOpen,
  onClose,
  onEventDispatched,
  onDatabaseReset,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTriggerEvent = async (eventType: string, extraParam?: number) => {
    setLoadingAction(eventType);
    playChime('ding');
    try {
      if (eventType === 'morning_call') {
        const call = await ApiClient.placeVoiceCall(senior.id, 'wakeup');
        setStatusMessage('Simulated Wake-Up Voice Call Dispatched!');
        onEventDispatched(call);
      } else if (eventType === 'medicine_call') {
        const call = await ApiClient.placeVoiceCall(senior.id, 'medicine_reminder');
        setStatusMessage('Simulated Medicine Reminder Voice Call Dispatched!');
        onEventDispatched(call);
      } else if (eventType === 'meal_call') {
        const call = await ApiClient.placeVoiceCall(senior.id, 'meal_reminder');
        setStatusMessage('Simulated Meal Reminder Call Dispatched!');
        onEventDispatched(call);
      } else if (eventType === 'low_stock') {
        await ApiClient.triggerDemoEvent(senior.id, 'low_stock_med_01');
        setStatusMessage('Lisinopril inventory lowered to 2 tablets (Low Stock Triggered)!');
        onEventDispatched();
      } else if (eventType === 'sos_alert') {
        const sos = await ApiClient.triggerSos(senior.id);
        setStatusMessage('Emergency SOS Dispatched to Guardians & 911 Simulation!');
        onEventDispatched();
      } else if (eventType === 'sim_steps') {
        await ApiClient.addSteps(senior.id, 2500);
        setStatusMessage('+2,500 Steps Added via Simulated Sensor!');
        onEventDispatched();
      }
    } catch (e) {
      console.error('Demo trigger error:', e);
      setStatusMessage('Error executing demo action.');
    } finally {
      setLoadingAction(null);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset demo database to fresh initial state?')) return;
    setLoadingAction('reset');
    try {
      await ApiClient.resetDemoDatabase();
      playChime('success');
      setStatusMessage('Database restored to default demo state.');
      onDatabaseReset();
    } catch (e) {
      console.error('Reset error:', e);
    } finally {
      setLoadingAction(null);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div id="demo-controls-backdrop" className="fixed inset-0 z-50 flex items-center justify-end bg-stone-900/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] bg-white border-l sm:border border-stone-200 sm:rounded-[32px] p-6 text-stone-900 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-center text-[#FF6321]">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Demo Sandbox Controls
                </h3>
                <p className="text-xs text-stone-500 font-normal">Simulate external services & phone calls</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toast Message */}
          {statusMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Trigger Voice Call Reminders */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              AI Voice Calling Simulator
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleTriggerEvent('morning_call')}
                disabled={!!loadingAction}
                className="w-full py-3 px-4 bg-[#FAF8F5] hover:bg-stone-100 active:scale-95 text-stone-800 font-bold text-xs sm:text-sm rounded-xl border border-stone-200 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#FF6321]" />
                  <span>Morning Wake-up Call</span>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">Trigger</span>
              </button>

              <button
                onClick={() => handleTriggerEvent('medicine_call')}
                disabled={!!loadingAction}
                className="w-full py-3 px-4 bg-[#FAF8F5] hover:bg-stone-100 active:scale-95 text-stone-800 font-bold text-xs sm:text-sm rounded-xl border border-stone-200 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>Medicine Prescription Call</span>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">Trigger</span>
              </button>

              <button
                onClick={() => handleTriggerEvent('meal_call')}
                disabled={!!loadingAction}
                className="w-full py-3 px-4 bg-[#FAF8F5] hover:bg-stone-100 active:scale-95 text-stone-800 font-bold text-xs sm:text-sm rounded-xl border border-stone-200 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-amber-600" />
                  <span>Meal Reminder Call</span>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">Trigger</span>
              </button>
            </div>
          </div>

          {/* Trigger Sensor & Edge Scenarios */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Sensor & State Scenarios
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleTriggerEvent('sim_steps')}
                disabled={!!loadingAction}
                className="w-full py-3 px-4 bg-[#FAF8F5] hover:bg-stone-100 active:scale-95 text-stone-800 font-bold text-xs sm:text-sm rounded-xl border border-stone-200 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-blue-600" />
                  <span>Sync +2,500 Steps</span>
                </div>
                <span className="text-[11px] text-blue-600 font-mono">+XP</span>
              </button>

              <button
                onClick={() => handleTriggerEvent('low_stock')}
                disabled={!!loadingAction}
                className="w-full py-3 px-4 bg-[#FAF8F5] hover:bg-amber-50 active:scale-95 text-amber-900 font-bold text-xs sm:text-sm rounded-xl border border-stone-200 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Trigger Low Stock Warning (2 left)</span>
                </div>
                <span className="text-[11px] text-amber-600 font-mono">Alert</span>
              </button>

              <button
                onClick={() => handleTriggerEvent('sos_alert')}
                disabled={!!loadingAction}
                className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-between active:scale-95 transition-all"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Trigger Emergency SOS Broadcast</span>
                </div>
                <span className="text-[11px] text-red-600 font-mono">SOS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reset Database */}
        <div className="pt-6 border-t border-stone-100">
          <button
            onClick={handleReset}
            disabled={!!loadingAction}
            className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'reset' ? 'animate-spin' : ''}`} />
            <span>Reset Demo Database to Initial Seed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
