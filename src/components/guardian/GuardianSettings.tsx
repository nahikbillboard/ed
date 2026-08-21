import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, ArrowLeft, Shield, Bell, Phone, Clock, Target } from 'lucide-react';
import { ApiClient } from '../../services/apiClient';
import { playChime } from '../../utils/audioSpeech';
import { Senior } from '../../types';

interface GuardianSettingsProps {
  senior: Senior;
  onSeniorUpdated: (updatedSenior: Senior) => void;
  onBack: () => void;
}

export const GuardianSettings: React.FC<GuardianSettingsProps> = ({
  senior,
  onSeniorUpdated,
  onBack,
}) => {
  const [formData, setFormData] = useState({
    name: senior.name,
    age: senior.age,
    guardian_name: senior.guardian_name,
    guardian_phone: senior.guardian_phone,
    preferred_language: senior.preferred_language || 'en',
    wake_time: senior.wake_time || '7:00 AM',
    breakfast_time: senior.breakfast_time || '8:00 AM',
    lunch_time: senior.lunch_time || '12:30 PM',
    dinner_time: senior.dinner_time || '6:30 PM',
    step_goal: senior.step_goal || 8000,
    emergency_contact_name: senior.emergency_contact_name || senior.guardian_name,
    emergency_contact_phone: senior.emergency_contact_phone || senior.guardian_phone,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    playChime('success');

    try {
      const updated = await ApiClient.updateSenior(senior.id, formData);
      onSeniorUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update senior settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="guardian-settings-view" className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-semibold text-sm mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-[#FF6321]" />
            <span>Senior Care Configuration</span>
          </h1>
          <p className="text-stone-500 text-sm sm:text-base mt-1 font-normal">
            Customize daily routine schedules, notification preferences, and emergency responders.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-[24px] flex items-center gap-3 text-emerald-950 font-semibold text-sm shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Configuration saved successfully! All scheduled reminder daemons updated.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 border-b border-stone-100 pb-2">
            Senior Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Senior Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 70 })}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Routine Times */}
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FF6321]" />
            <span>Daily Routine Timetable</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Morning Wake-Up Call Time</label>
              <input
                type="text"
                value={formData.wake_time}
                onChange={(e) => setFormData({ ...formData, wake_time: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all text-sm"
                placeholder="7:00 AM"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Breakfast Reminder Time</label>
              <input
                type="text"
                value={formData.breakfast_time}
                onChange={(e) => setFormData({ ...formData, breakfast_time: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all text-sm"
                placeholder="8:00 AM"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Lunch Reminder Time</label>
              <input
                type="text"
                value={formData.lunch_time}
                onChange={(e) => setFormData({ ...formData, lunch_time: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all text-sm"
                placeholder="12:30 PM"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Dinner Reminder Time</label>
              <input
                type="text"
                value={formData.dinner_time}
                onChange={(e) => setFormData({ ...formData, dinner_time: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all text-sm"
                placeholder="6:30 PM"
              />
            </div>
          </div>
        </div>

        {/* Step Goal */}
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Activity Goal</span>
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Daily Step Goal (Pedometer)</label>
            <input
              type="number"
              step="500"
              value={formData.step_goal}
              onChange={(e) => setFormData({ ...formData, step_goal: parseInt(e.target.value) || 8000 })}
              className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all text-sm"
            />
          </div>
        </div>

        {/* Emergency & Guardian Contact */}
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#FF6321]" />
            <span>Guardian & Emergency Responders</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Guardian Name</label>
              <input
                type="text"
                value={formData.guardian_name}
                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Guardian WhatsApp & Mobile</label>
              <input
                type="text"
                value={formData.guardian_phone}
                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="py-3.5 px-8 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white font-bold text-base rounded-2xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
