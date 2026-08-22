import React, { useState } from 'react';
import { UserCheck, ArrowRight, ArrowLeft, CheckCircle2, Sun, Utensils, Pill, Phone, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';
import { Senior } from '../../types';

interface SeniorOnboardingProps {
  onComplete: (senior: Senior) => void;
  onCancel: () => void;
}

export const SeniorOnboarding: React.FC<SeniorOnboardingProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: 'Margaret Taylor',
    age: 76,
    preferred_language: 'en',
    guardian_name: 'Robert Taylor',
    guardian_phone: '+1 (555) 432-8765',
    wake_time: '7:00 AM',
    breakfast_time: '8:00 AM',
    lunch_time: '12:30 PM',
    dinner_time: '6:30 PM',
    night_medicine_time: '9:00 PM',
    step_goal: 6000,
    emergency_contact_name: 'Robert Taylor (Son)',
    emergency_contact_phone: '+1 (555) 432-8765',
  });

  const nextStep = () => {
    playChime('ding');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    playChime('success');

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });

    try {
      const created = await ApiClient.createSenior(formData);
      speakText(`किनकेयर में आपका स्वागत है, ${created.name} जी! आपका दैनिक साथी सेटअप पूरा हो गया है।`);
      onComplete(created);
    } catch (err) {
      console.error('Failed to create senior:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="onboarding-wizard-screen" className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Progress Bar & Steps */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF6321] text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {step}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-stone-400">Step {step} of 4</div>
            <div className="text-base font-serif font-bold text-stone-900">
              {step === 1 && 'Senior Identity'}
              {step === 2 && 'Guardian Link'}
              {step === 3 && 'Daily Routine Times'}
              {step === 4 && 'Review & Activation'}
            </div>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-stone-500 hover:text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#FF6321] rounded-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Step Forms */}
      <div className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 shadow-xs space-y-6">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 bg-amber-50 text-[#FF6321] rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">Who is this companion for?</h2>
              <p className="text-stone-500 text-sm font-normal">Enter the senior's details to personalize their daily voice reminders.</p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Senior's Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Margaret Taylor"
                  className="w-full text-base bg-[#FAF8F5] border border-stone-200 rounded-2xl px-5 py-3.5 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 70 })}
                    className="w-full text-base bg-[#FAF8F5] border border-stone-200 rounded-2xl px-5 py-3.5 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Language</label>
                  <select
                    value={formData.preferred_language}
                    onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                    className="w-full text-base bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-3.5 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.name.trim()}
                className="w-full py-4 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white text-lg font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>NEXT STEP</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <Phone className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">Guardian & Notifications</h2>
              <p className="text-stone-500 text-sm font-normal">Who should receive daily wake-up alerts and emergency reports?</p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Child / Guardian Name</label>
                <input
                  type="text"
                  value={formData.guardian_name}
                  onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                  placeholder="e.g. Robert Taylor (Son)"
                  className="w-full text-base bg-[#FAF8F5] border border-stone-200 rounded-2xl px-5 py-3.5 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Guardian Mobile (WhatsApp & SMS)</label>
                <input
                  type="text"
                  value={formData.guardian_phone}
                  onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                  placeholder="+1 (555) 432-8765"
                  className="w-full text-base bg-[#FAF8F5] border border-stone-200 rounded-2xl px-5 py-3.5 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/3 py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-base font-bold rounded-2xl transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.guardian_name.trim() || !formData.guardian_phone.trim()}
                className="w-2/3 py-4 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white text-lg font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>NEXT STEP</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sun className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">Daily Routine Times</h2>
              <p className="text-stone-500 text-sm font-normal">Set regular reminder times to establish a healthy, predictable rhythm.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Morning Wake-up</label>
                <input
                  type="text"
                  value={formData.wake_time}
                  onChange={(e) => setFormData({ ...formData, wake_time: e.target.value })}
                  className="w-full text-base bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Breakfast Time</label>
                <input
                  type="text"
                  value={formData.breakfast_time}
                  onChange={(e) => setFormData({ ...formData, breakfast_time: e.target.value })}
                  className="w-full text-base bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Lunch Time</label>
                <input
                  type="text"
                  value={formData.lunch_time}
                  onChange={(e) => setFormData({ ...formData, lunch_time: e.target.value })}
                  className="w-full text-base bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Dinner Time</label>
                <input
                  type="text"
                  value={formData.dinner_time}
                  onChange={(e) => setFormData({ ...formData, dinner_time: e.target.value })}
                  className="w-full text-base bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Daily Step Goal</label>
              <input
                type="number"
                step="500"
                value={formData.step_goal}
                onChange={(e) => setFormData({ ...formData, step_goal: parseInt(e.target.value) || 6000 })}
                className="w-full text-base bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/3 py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-base font-bold rounded-2xl transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="w-2/3 py-4 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white text-lg font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>NEXT STEP</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Ready to Activate KinCare!
            </h2>
            <p className="text-stone-500 text-base font-normal">
              We'll activate AI reminder daemons for <strong className="text-stone-800">{formData.name}</strong> and link notifications to <strong className="text-stone-800">{formData.guardian_name}</strong>.
            </p>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 text-left space-y-2 text-stone-700 text-sm font-normal">
              <div>👤 <strong className="font-semibold text-stone-900">Senior:</strong> {formData.name} (Age {formData.age})</div>
              <div>🛡️ <strong className="font-semibold text-stone-900">Guardian:</strong> {formData.guardian_name} ({formData.guardian_phone})</div>
              <div>⏰ <strong className="font-semibold text-stone-900">Routine:</strong> Wake: {formData.wake_time} • Breakfast: {formData.breakfast_time} • Lunch: {formData.lunch_time} • Dinner: {formData.dinner_time}</div>
              <div>🚶 <strong className="font-semibold text-stone-900">Step Target:</strong> {formData.step_goal.toLocaleString()} steps/day</div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/3 py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-base font-bold rounded-2xl transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-2/3 py-4 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white text-lg font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                <span>{loading ? 'ACTIVATING...' : 'LAUNCH COMPANION'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
