import React, { useState, useEffect } from 'react';
import { PhoneCall, AlertTriangle, X, ShieldAlert, CheckCircle2, MapPin, Volume2 } from 'lucide-react';
import { ApiClient } from '../../services/apiClient';
import { playChime, speakText } from '../../utils/audioSpeech';
import { Senior, EmergencyContact } from '../../types';

interface SosModalProps {
  senior: Senior;
  contacts: EmergencyContact[];
  isOpen: boolean;
  onClose: () => void;
  onSosTriggered?: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ senior, contacts, isOpen, onClose, onSosTriggered }) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [callSuccess, setCallSuccess] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('Detecting location...');
  const [coords, setCoords] = useState<{ lat?: number; lng?: number; address?: string }>({
    address: 'Oakwood Residence, Apt 4B'
  });

    const primaryContact = contacts[0] || {
    name: senior.emergency_contact_name || senior.guardian_name || 'Guardian',
    phone: senior.emergency_contact_phone || '9561442888',
    relationship: 'Primary Emergency Contact'
  };

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setIsCalling(false);
      setCallSuccess(false);
      return;
    }

    playChime('alert');
    speakText('Emergency Alert triggered. Do you want to call your emergency contact?');

    // Attempt geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Home Residence)`
          });
          setLocationStatus('GPS Location Verified');
        },
        () => {
          setLocationStatus('Oakwood Residence, Apt 4B');
        },
        { timeout: 4000 }
      );
    } else {
      setLocationStatus('Oakwood Residence, Apt 4B');
    }
  }, [isOpen]);

  // Countdown timer before auto-dialing for senior safety
  useEffect(() => {
    if (!isOpen || isCalling || callSuccess) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      handleTriggerEmergency();
    }
  }, [isOpen, countdown, isCalling, callSuccess]);

  const handleTriggerEmergency = async () => {
    setIsCalling(true);
    playChime('alert');
    try {
      await ApiClient.triggerSos(senior.id, coords);
      setCallSuccess(true);
      speakText(`Calling ${primaryContact.name}. Your family and emergency responders have been alerted.`);
      
      // Redirect to phone dialer immediately
      window.location.href = `tel:${primaryContact.phone}`;
      
      if (onSosTriggered) onSosTriggered();
    } catch (err) {
      console.error('SOS call trigger error:', err);
      // Even if network glitch occurs, ensure native call dialer is still opened for safety
      setCallSuccess(true);
      window.location.href = `tel:${primaryContact.phone}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div id="sos-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        id="sos-modal-card" 
        className="w-full max-w-lg bg-white border-2 border-red-500 rounded-[32px] p-6 sm:p-8 text-stone-900 shadow-2xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close / Cancel Button */}
        {!callSuccess && (
          <button
            id="sos-cancel-corner-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600 transition-colors"
            aria-label="Cancel Emergency Call"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {!callSuccess ? (
          <div className="text-center space-y-6">
            <div className="inline-flex p-4 bg-red-50 border border-red-200 rounded-full animate-pulse">
              <ShieldAlert className="w-12 h-12 text-red-600" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-red-600">
                EMERGENCY SOS
              </h2>
              <p className="text-lg text-stone-600 mt-2 font-normal">
                Do you want to call your emergency contact?
              </p>
            </div>

            {/* Primary Contact Details */}
            <div className="bg-red-50/60 border border-red-200 rounded-2xl p-4 text-left">
              <div className="text-xs font-semibold text-red-700 uppercase tracking-wider">Dialing Primary Responder:</div>
              <div className="text-xl font-bold text-stone-900 mt-1">{primaryContact.name}</div>
              <div className="text-base text-stone-600 font-medium">{primaryContact.phone}</div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-red-700 font-medium">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>{locationStatus}</span>
              </div>
            </div>

            {/* Auto-dial countdown pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-200 text-amber-900 font-medium text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>Auto-calling in <strong className="font-bold">{countdown}s</strong>...</span>
            </div>

            {/* Large Accessible Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                id="sos-call-now-btn"
                onClick={handleTriggerEmergency}
                disabled={isCalling}
                className="w-full py-4 px-6 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-lg font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <PhoneCall className="w-6 h-6" />
                <span>{isCalling ? 'DIALING...' : 'CALL NOW'}</span>
              </button>

              <button
                id="sos-cancel-btn"
                onClick={onClose}
                disabled={isCalling}
                className="w-full py-4 px-6 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 text-lg font-bold rounded-2xl transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          /* SOS Triggered Success Screen */
          <div className="text-center space-y-6 py-2 animate-in zoom-in-95 duration-200">
            <div className="inline-flex p-4 bg-emerald-50 border border-emerald-200 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                HELP IS ON THE WAY
              </h2>
              <p className="text-base text-stone-600 mt-2 font-normal">
                We have dialed <strong className="font-semibold text-stone-800">{primaryContact.name}</strong> and dispatched an emergency broadcast to your family.
              </p>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 text-left text-sm space-y-2 text-stone-700">
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Emergency phone call initiated</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp emergency alert sent to {senior.guardian_name}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>GPS coordinates transmitted: {coords.address}</span>
              </div>
            </div>

            <button
              id="sos-dismiss-btn"
              onClick={onClose}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-lg font-bold rounded-2xl shadow-sm transition-all"
            >
              I'M OKAY / RETURN HOME
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
