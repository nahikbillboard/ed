/**
 * Sath Redirection & Messaging Helper (Internal Guardian Sync)
 * Default Guardian Phone: 9561442888 (+91 9561442888)
 */

export const DEFAULT_GUARDIAN_PHONE = '9561442888';

/**
 * Normalizes phone number into international digits
 */
export function formatWhatsAppPhone(phone: string = DEFAULT_GUARDIAN_PHONE): string {
  if (!phone) return '919561442888';
  const digits = phone.replace(/\D/g, '');
  
  if (digits.includes('555') || digits.length < 10) {
    return '919561442888';
  }
  
  if (digits.endsWith('9561442888')) {
    return '919561442888';
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }
  
  return digits;
}

/**
 * WhatsApp redirection disabled per user instructions.
 * All alerts are routed internally in real-time to the Guardian Portal.
 */
export function openWhatsAppSafely(_url: string, _preOpenedWindow?: Window | null): boolean {
  if (_preOpenedWindow && !_preOpenedWindow.closed) {
    try {
      _preOpenedWindow.close();
    } catch {
      // ignore
    }
  }
  // Do not navigate or open WhatsApp
  return false;
}

/**
 * Formats a clean ready message for guardian alerts
 */
export function buildWhatsAppTaskMessage(taskName: string, seniorName: string, extraDetails?: string): string {
  const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateStr = new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  let text = `*Sath Care Alert* 🔔\n\n`;
  text += `Hello! *${seniorName}* has completed: *${taskName}* ✓\n`;
  text += `⏰ *Time:* ${timeStr} (${dateStr})\n`;
  text += `📊 *Status:* Completed & Verified\n`;
  if (extraDetails) {
    text += `📝 *Details:* ${extraDetails}\n`;
  }
  text += `\n_Automated update sent to Guardian Portal._`;

  return text;
}

/**
 * Builds meal-specific automated message with custom dish name
 */
export function buildWhatsAppMealMessage(
  mealType: 'breakfast' | 'lunch' | 'dinner' | string,
  seniorName: string,
  dishName?: string
): string {
  const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateStr = new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  
  const icon = mealType.toLowerCase() === 'breakfast' ? '🥣' : mealType.toLowerCase() === 'lunch' ? '🥗' : '🍲';
  const capitalMeal = mealType.charAt(0).toUpperCase() + mealType.slice(1);
  const dish = dishName?.trim() || (mealType.toLowerCase() === 'breakfast' ? 'Warm oatmeal with fresh fruits' : mealType.toLowerCase() === 'lunch' ? 'Steamed rice, lentils & fresh greens' : 'Light evening soup & toasted bread');

  let text = `*Sath Care Alert* 🔔\n\n`;
  text += `${icon} *${seniorName}* has completed: *${capitalMeal}* at *${timeStr}* ✓\n\n`;
  text += `🍽️ *Dish / Meal:* ${dish}\n`;
  text += `✨ *Status:* Healthy nourishment enjoyed (+40 XP)\n`;
  text += `📅 *Date:* ${dateStr}\n\n`;
  text += `_Status: Done ✓. Everything is on schedule._`;

  return text;
}

/**
 * Builds meal notification for internal guardian sync (no WhatsApp redirect)
 */
export function redirectMealWithWhatsApp(
  mealType: 'breakfast' | 'lunch' | 'dinner' | string,
  seniorName: string,
  dishName?: string,
  phone: string = DEFAULT_GUARDIAN_PHONE,
  preOpenedWindow?: Window | null
): { url: string; message: string; targetPhone: string } {
  const cleanPhone = formatWhatsAppPhone(phone);
  const message = buildWhatsAppMealMessage(mealType, seniorName, dishName);
  const encodedText = encodeURIComponent(message);
  const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  
  openWhatsAppSafely(url, preOpenedWindow);

  return { url, message, targetPhone: cleanPhone };
}

/**
 * Builds medicine notification for internal guardian sync
 */
export function buildWhatsAppMedicineMessage(
  medNumber: number | string,
  medName: string,
  dosage: string,
  seniorName: string,
  notes?: string
): string {
  const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateStr = new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  let text = `*Sath Care Alert* 🔔\n\n`;
  text += `💊 *${seniorName}* has taken: *Medicine #${medNumber} (${medName})* at *${timeStr}* ✓\n\n`;
  text += `📋 *Dosage:* ${dosage}\n`;
  if (notes && notes.trim()) {
    text += `📝 *Note:* ${notes.trim()}\n`;
  }
  text += `✨ *Status:* Verified & Taken with water (+40 XP)\n`;
  text += `📅 *Date:* ${dateStr}\n\n`;
  text += `_Status: Done ✓. Everything is on schedule._`;

  return text;
}

/**
 * Logs medicine notification without external WhatsApp popup
 */
export function redirectMedicineWithWhatsApp(
  medNumber: number | string,
  medName: string,
  dosage: string,
  seniorName: string,
  notes?: string,
  phone: string = DEFAULT_GUARDIAN_PHONE,
  preOpenedWindow?: Window | null
): { url: string; message: string; targetPhone: string } {
  const cleanPhone = formatWhatsAppPhone(phone);
  const message = buildWhatsAppMedicineMessage(medNumber, medName, dosage, seniorName, notes);
  const encodedText = encodeURIComponent(message);
  const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  
  openWhatsAppSafely(url, preOpenedWindow);

  return { url, message, targetPhone: cleanPhone };
}

/**
 * Logs task notification without external WhatsApp popup
 */
export function redirectWithWhatsApp(
  taskName: string,
  seniorName: string,
  extraDetails?: string,
  phone: string = DEFAULT_GUARDIAN_PHONE,
  preOpenedWindow?: Window | null
): { url: string; message: string; targetPhone: string } {
  const cleanPhone = formatWhatsAppPhone(phone);
  const message = buildWhatsAppTaskMessage(taskName, seniorName, extraDetails);
  const encodedText = encodeURIComponent(message);
  const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  
  openWhatsAppSafely(url, preOpenedWindow);

  return { url, message, targetPhone: cleanPhone };
}

