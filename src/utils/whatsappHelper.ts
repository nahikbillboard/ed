/**
 * KinCare WhatsApp Redirection & Messaging Helper
 * Default Guardian Phone: 9561442888 (+91 9561442888)
 */

export const DEFAULT_GUARDIAN_PHONE = '9561442888';

/**
 * Normalizes phone number into international digits for WhatsApp wa.me / api.whatsapp.com
 * Always resolves to +91 9561442888 (919561442888) if 9561442888 or mock numbers are provided
 */
export function formatWhatsAppPhone(phone: string = DEFAULT_GUARDIAN_PHONE): string {
  if (!phone) return '919561442888';
  const digits = phone.replace(/\D/g, '');
  
  // If it's a mock number (like 555...), fallback directly to 919561442888
  if (digits.includes('555') || digits.length < 10) {
    return '919561442888';
  }
  
  // If it contains the user's phone 9561442888
  if (digits.endsWith('9561442888')) {
    return '919561442888';
  }

  if (digits.length === 10) {
    return `91${digits}`; // Prepend India country code 91
  }
  
  return digits;
}

/**
 * Safely opens a WhatsApp URL without ever navigating the main frame (which causes X-Frame-Options errors in iframes)
 */
export function openWhatsAppSafely(url: string, preOpenedWindow?: Window | null): boolean {
  if (!url) return false;

  // 1. If a window was pre-opened synchronously during user click event:
  if (preOpenedWindow && !preOpenedWindow.closed) {
    try {
      preOpenedWindow.location.href = url;
      preOpenedWindow.focus();
      return true;
    } catch (e) {
      console.warn('Failed to update pre-opened window location:', e);
    }
  }

  // 2. Try window.open in a new tab
  try {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (win) {
      win.focus();
      return true;
    }
  } catch (err) {
    console.warn('window.open failed:', err);
  }

  // 3. Fallback: Create direct DOM anchor element click
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (err) {
    console.warn('Anchor element fallback failed:', err);
  }

  return false;
}

/**
 * Formats a clean ready message and triggers WhatsApp redirection
 */
export function buildWhatsAppTaskMessage(taskName: string, seniorName: string, extraDetails?: string): string {
  const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateStr = new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  let text = `*KinCare Care Alert* 🔔\n\n`;
  text += `Hello! *${seniorName}* has completed: *${taskName}* ✓\n`;
  text += `⏰ *Time:* ${timeStr} (${dateStr})\n`;
  text += `📊 *Status:* Completed & Verified\n`;
  if (extraDetails) {
    text += `📝 *Details:* ${extraDetails}\n`;
  }
  text += `\n_Automated update sent from KinCare AI Companion._`;

  return text;
}

/**
 * Builds meal-specific automated message with the custom dish name
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

  let text = `*KinCare Care Alert* 🔔\n\n`;
  text += `${icon} *${seniorName}* has completed: *${capitalMeal}* at *${timeStr}* ✓\n\n`;
  text += `🍽️ *Dish / Meal:* ${dish}\n`;
  text += `✨ *Status:* Healthy nourishment enjoyed (+40 XP)\n`;
  text += `📅 *Date:* ${dateStr}\n\n`;
  text += `_Status: Done ✓. Everything is on schedule._`;

  return text;
}

/**
 * Redirects to WhatsApp specifically for a meal with the user's custom dish name
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
 * Builds medicine-specific automated message with prescription details and optional note
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

  let text = `*KinCare Care Alert* 🔔\n\n`;
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
 * Redirects to WhatsApp specifically for medicine taken notification
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
 * Opens WhatsApp in a new window/tab with the pre-filled ready message
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

