import React from 'react';
import { MessageCircle, CheckCheck, X, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../../types';
import { DEFAULT_GUARDIAN_PHONE, formatWhatsAppPhone } from '../../utils/whatsappHelper';

interface WhatsAppNotificationModalProps {
  notification: NotificationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppNotificationModal: React.FC<WhatsAppNotificationModalProps> = ({
  notification,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !notification) return null;

  const targetPhone = (notification.metadata?.recipientPhone as string) || DEFAULT_GUARDIAN_PHONE;
  const cleanPhone = formatWhatsAppPhone(targetPhone);
  const encodedMsg = encodeURIComponent(notification.message || notification.title);
  const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;

  return (
    <div id="whatsapp-toast-overlay" className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#0b141a] border border-[#222e35] rounded-2xl shadow-2xl p-4 text-white relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222e35] pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-stone-900 font-bold">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-100 flex items-center gap-1.5">
                <span>KinCare Guardian WhatsApp</span>
                <span className="text-[10px] bg-[#25D366]/20 text-[#25D366] px-1.5 py-0.5 rounded font-mono font-bold">9561442888</span>
              </div>
              <div className="text-xs text-stone-400">Automated Notification dispatched to 9561442888</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Bubble */}
        <div className="bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tl-sm p-3.5 text-sm whitespace-pre-wrap leading-relaxed shadow-sm font-sans">
          <div className="font-bold text-emerald-200 mb-1">{notification.title}</div>
          {notification.message}
          <div className="flex items-center justify-end gap-1 text-[11px] text-emerald-200/70 mt-2">
            <span>{new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[11px] text-stone-400 italic">
            Auto-sent to +91 9561442888
          </span>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
          >
            <span>Open in WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
