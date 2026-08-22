import React from 'react';
import { MessageCircle, CheckCheck, X, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../../types';
import { DEFAULT_GUARDIAN_PHONE, formatWhatsAppPhone } from '../../utils/whatsappHelper';

interface WhatsAppNotificationModalProps {
  notification: NotificationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppNotificationModal: React.FC<WhatsAppNotificationModalProps> = () => {
  // Permanently disabled overlay as requested
  return null;
};
