import React, { useState } from 'react';
import { 
  Pill, 
  CheckCircle2, 
  Clock, 
  Send, 
  Mic, 
  MicOff, 
  ArrowLeft, 
  Edit3,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';
import { Senior, Medicine, DailyRoutine, SeniorProgress } from '../../types';
import { 
  redirectMedicineWithWhatsApp,
  formatWhatsAppPhone,
  buildWhatsAppMedicineMessage 
} from '../../utils/whatsappHelper';
import { MessageCircle, ExternalLink } from 'lucide-react';

interface SeniorSingleMedicineProps {
  medicineNumber: 1 | 2 | 3;
  senior: Senior;
  medicines: Medicine[];
  routine: DailyRoutine;
  progress: SeniorProgress;
  onMedicineUpdated: (updatedMeds: Medicine[], updatedRoutine: DailyRoutine, updatedProg: SeniorProgress, whatsappData?: any) => void;
  onNavigateHome: () => void;
}

export const SeniorSingleMedicine: React.FC<SeniorSingleMedicineProps> = ({
  medicineNumber,
  senior,
  medicines,
  routine,
  progress,
  onMedicineUpdated,
  onNavigateHome,
}) => {
  // Find matching medicine from array or fallback
  const med = medicines.find(m => m.medicine_number === medicineNumber) || medicines[medicineNumber - 1] || {
    id: `med_0${medicineNumber}`,
    senior_id: senior.id,
    name: medicineNumber === 1 ? 'Cardioprotect & Multivitamin' : medicineNumber === 2 ? 'Calcium & Joint Vitality' : 'Night Neuro-Calm & Sleep Support',
    medicine_number: medicineNumber,
    dosage_information: medicineNumber === 1 ? '1 tablet with water' : medicineNumber === 2 ? '1 chewable tablet' : '1 capsule before bed',
    schedule_time: medicineNumber === 1 ? '09:00 AM' : medicineNumber === 2 ? '01:30 PM' : (senior.night_medicine_time || '08:30 PM'),
    instructions: medicineNumber === 1 ? 'Take with water after breakfast. Supports cardiovascular health.' : medicineNumber === 2 ? 'Chew thoroughly after lunch. Promotes bone density and mobility.' : 'Take 30 mins before sleep with warm water.',
    quantity_remaining: 18,
    refill_unit: 'tablet',
    low_stock_threshold: 5,
    is_active: true,
  };

  const isCompleted = medicineNumber === 1 
    ? (routine.breakfast_medicine_status === 'completed' || routine.medicine_status === 'completed')
    : medicineNumber === 2
    ? routine.lunch_medicine_status === 'completed'
    : (routine.dinner_medicine_status === 'completed' || routine.night_medicine_status === 'completed');

  const defaultNoteSuggestions = medicineNumber === 1
    ? [
        'Taken with water after breakfast',
        'Taken with warm milk',
        'All good, feeling energetic',
        'Taken on time with vitamins',
      ]
    : medicineNumber === 2
    ? [
        'Chewed thoroughly after lunch',
        'Taken with a glass of water',
        'Feeling active and comfortable',
        'Taken after midday meal',
      ]
    : [
        'Taken with warm water before bed',
        'Ready for a peaceful sleep',
        'Taken on schedule with night routine',
        'All done for today',
      ];

  const [note, setNote] = useState<string>(defaultNoteSuggestions[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(isCompleted);

  const targetPhone = '9561442888';
  const isLowStock = med.quantity_remaining <= med.low_stock_threshold;

  // Web Speech Recognition for voice typing notes
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      speakText('Voice dictation is not supported in this browser. Please type your note.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        speakText('Listening... please speak your note.');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setNote(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const handleConfirmAndSendWhatsApp = async () => {
    setLoading(true);
    playChime('success');

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
    });

    const chosenNote = note.trim() || 'Taken on time with water';

    // Synchronously pre-open tab in click event loop to bypass popup blocking
    let waWin: Window | null = null;
    try {
      waWin = window.open('about:blank', '_blank');
    } catch (e) {
      console.warn('Pre-open popup blocked:', e);
    }

    try {
      // 1. Record medicine in backend
      const res = await ApiClient.takeMedicine(med.id, senior.id);
      
      const updatedList = medicines.map(m => m.id === med.id ? res.medicine : m);
      
      // Update routine status depending on medicine number
      const updatedRoutine: DailyRoutine = {
        ...res.routine,
        breakfast_medicine_status: medicineNumber === 1 ? 'completed' : res.routine.breakfast_medicine_status,
        lunch_medicine_status: medicineNumber === 2 ? 'completed' : res.routine.lunch_medicine_status,
        dinner_medicine_status: medicineNumber === 3 ? 'completed' : res.routine.dinner_medicine_status,
        night_medicine_status: medicineNumber === 3 ? 'completed' : res.routine.night_medicine_status,
      };

      onMedicineUpdated(updatedList, updatedRoutine, res.progress, {
        medicine: med.name,
        note: chosenNote,
      });

      setSentSuccess(true);

      speakText(
        `Wonderful ${senior.name}! Medicine number ${medicineNumber}, ${med.name}, is recorded and sent to your child on WhatsApp.`
      );

      // 2. Open WhatsApp directly with ready pre-filled message for 9561442888
      redirectMedicineWithWhatsApp(
        medicineNumber,
        med.name,
        med.dosage_information,
        senior.name,
        chosenNote,
        targetPhone,
        waWin
      );
    } catch (err) {
      console.error('Failed to complete medicine:', err);
      // Fallback direct WhatsApp redirection
      redirectMedicineWithWhatsApp(
        medicineNumber,
        med.name,
        med.dosage_information,
        senior.name,
        chosenNote,
        targetPhone,
        waWin
      );
      setSentSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id={`senior-medicine-${medicineNumber}-section`} className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Return */}
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
            <span>+40 XP</span>
          </span>
        </div>
      </div>

      {/* Hero Header for this Single Medicine */}
      <div className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              #{medicineNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Prescription #{medicineNumber}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  {medicineNumber === 1 ? 'Morning' : medicineNumber === 2 ? 'Afternoon' : 'Night'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
                {med.name}
              </h1>
              <p className="text-base sm:text-lg text-emerald-800 font-semibold mt-0.5">
                Dosage: {med.dosage_information}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-4 py-2 rounded-2xl self-start sm:self-center">
            <Clock className="w-4 h-4 text-stone-500" />
            <span className="text-stone-700 font-bold text-sm">Scheduled: {med.schedule_time}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-stone-800 text-sm sm:text-base leading-relaxed">
          <strong className="font-bold text-emerald-900">Doctor's Instructions: </strong>
          <span>{med.instructions}</span>
        </div>

        {/* Stock Meter */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-stone-500 mb-1.5">
            <span>Stock Remaining:</span>
            <span className={isLowStock ? 'text-amber-700 font-bold' : 'text-stone-700 font-medium'}>
              {med.quantity_remaining} {med.refill_unit}s left
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
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-amber-900 text-xs sm:text-sm font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Low Stock Alert ({med.quantity_remaining} doses left). Refill alert logged for your guardian.</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. NOTE / DETAILS INPUT                                                   */}
      {/* ========================================================================= */}
      <div className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                Notes / Confirmation
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm">
                Optional note sent to your child along with your medicine confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Note Input Box + Voice Dictation */}
        <div className="relative">
          <input
            id={`input-medicine-note-${medicineNumber}`}
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Taken with a full glass of water..."
            className="w-full py-3.5 pl-4 pr-14 text-base sm:text-lg font-medium text-stone-900 bg-stone-50 border-2 border-stone-200 focus:border-emerald-500 rounded-2xl focus:bg-white focus:outline-none transition-all"
          />

          <button
            type="button"
            onClick={handleVoiceInput}
            title="Speak your note"
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        {/* Quick Suggestions Chips */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Quick One-Tap Notes:
          </span>
          <div className="flex flex-wrap gap-2">
            {defaultNoteSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setNote(suggestion)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                  note === suggestion
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEND TO CHILD BUTTON (DIRECT WHATSAPP REDIRECTION)                     */}
      {/* ========================================================================= */}
      <div className="pt-2 space-y-3">
        <button
          id={`btn-send-to-child-medicine-${medicineNumber}`}
          type="button"
          onClick={handleConfirmAndSendWhatsApp}
          disabled={loading}
          className="w-full py-4.5 px-6 bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-stone-950 text-lg sm:text-xl font-bold rounded-2xl shadow-lg shadow-emerald-900/15 flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-5 h-5 text-stone-950" />
          <span>
            {loading ? 'Sending to Child...' : 'Send to Child & Open WhatsApp'}
          </span>
        </button>

        <a
          href={`https://api.whatsapp.com/send?phone=${formatWhatsAppPhone('9561442888')}&text=${encodeURIComponent(buildWhatsAppMedicineMessage(medicineNumber, med.name, med.dosage_information, senior.name, note))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-6 bg-[#075E54] hover:bg-[#054c44] text-white text-base font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>Open WhatsApp Chat with Child (+91 9561442888)</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        {sentSuccess && (
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 py-2.5 px-4 rounded-xl text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Medicine confirmed and sent to your child via WhatsApp (9561442888) ✓ (+40 XP)</span>
          </div>
        )}
      </div>

      {/* Footer Return */}
      <div className="text-center pt-2">
        <button
          onClick={onNavigateHome}
          className="text-stone-500 hover:text-stone-800 text-sm font-bold underline transition-colors cursor-pointer"
        >
          Return to Daily Routine
        </button>
      </div>
    </div>
  );
};
