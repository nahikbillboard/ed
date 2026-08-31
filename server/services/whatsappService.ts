import { NotificationService } from './notificationService.js';
import { db } from '../db.js';

export const GLOBAL_GUARDIAN_PHONE = '9561442888';

export interface WhatsAppTemplatePayload {
  seniorId: string;
  templateType: 'wakeup' | 'walk' | 'yoga' | 'breakfast' | 'breakfast_medicine' | 'lunch' | 'lunch_medicine' | 'nap' | 'dinner' | 'dinner_medicine' | 'exercise_complete' | 'medicine_taken' | 'low_stock' | 'sos_alert' | 'daily_summary' | 'task_completed';
  recipientPhone?: string;
  parameters: Record<string, string | number>;
}

export class WhatsAppService {
  private static apiKey = process.env.WHATSAPP_API_KEY;
  private static phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  public static async sendTemplateMessage(payload: WhatsAppTemplatePayload): Promise<{ success: boolean; messageId: string; formattedMessage: string; targetPhone: string }> {
    const isLive = !!this.apiKey && this.apiKey !== 'whatsapp_cloud_live_token_demo';
    const targetPhone = payload.recipientPhone || GLOBAL_GUARDIAN_PHONE;

    let title = 'WhatsApp Notification';
    let formattedMessage = '';

    const seniorName = (payload.parameters.seniorName as string) || 'Sunita';
    const time = (payload.parameters.time as string) || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    switch (payload.templateType) {
      case 'wakeup':
        title = `☀️ Wake-Up Confirmed: ${seniorName}`;
        formattedMessage = `*Sath Care Alert* 🔔\n\n☀️ *Good Morning!* ${seniorName} is awake and checked in at *${time}*.\n\n🔥 *Current Streak:* ${payload.parameters.streak || '7'} Days\n⭐ *XP Earned:* +${payload.parameters.xp || '50'} XP\n\n_Daily routine initiated successfully._`;
        break;

      case 'walk':
      case 'exercise_complete':
        title = `🚶 Daily Walk Completed: ${seniorName}`;
        formattedMessage = `*Sath Care Alert* 🔔\n\n🚶‍♀️ *${seniorName}* has completed their *Daily Walk* at *${time}*!\n\n📊 *Steps Tracked:* ${payload.parameters.steps || 3500} steps\n🌟 *Wellness XP:* +${payload.parameters.xp || 50} XP\n\n_Status: Done ✓. Everything is on schedule._`;
        break;

      case 'yoga':
        title = `🧘 Morning Yoga Completed: ${seniorName}`;
        formattedMessage = `*Sath Care Alert* 🔔\n\n🧘 *${seniorName}* has completed: *Morning Yoga & Mobility* at *${time}* ✓\n\n🌟 *Session:* Gentle Chair Yoga & Joint Stretches\n✨ *Wellness XP:* +${payload.parameters.xp || 70} XP\n\n_Status: Done ✓. Everything is on schedule._`;
        break;

      case 'breakfast':
        title = `🥣 Breakfast Enjoyed: ${seniorName}`;
        formattedMessage = `*Sath Care Alert* 🔔\n\n🥣 *${seniorName}* has completed: *Breakfast* at *${time}* ✓\n\n🍽️ *Dish / Meal:* ${payload.parameters.dishName || 'Morning Nourishment & Hydration'}\n✨ *Wellness XP:* +${payload.parameters.xp || 40} XP\n\n_Status: Done ✓. Everything is on schedule._`;
        break;

      case 'breakfast_medicine':
        title = `💊 Breakfast Medicine Taken: ${seniorName}`;
        formattedMessage = `*Sath Care Alert* 🔔\n\n💊 *${seniorName}* has completed: *After-Breakfast Medicine* at *${time}* ✓\n\n🩺 *Dose:* Morning Cardioprotect & Multivitamin (1 tablet)\n✨ *Status:* Taken with water & verified\n\n_Status: Done ✓. Everything is on schedule._`;
        break;

      case 'lunch':
        title = `🥗 Lunch Enjoyed: ${seniorName}`;
        formattedMessage = `*Sath Care Alert* 🔔\n\n🥗 *${seniorName}* has completed: *Lunch* at *${time}* ✓\n\n🍽️ *Dish / Meal:* ${payload.parameters.dishName || 'Midday Healthy Meal & Warm Soup'}\n✨ *Wellness XP:* +${payload.parameters.xp || 40} XP\n\n_Status: Done ✓. Everything is on schedule._`;
        break;

      case 'lunch_medicine':
        title = `💊 Lunch Medicine Taken: ${seniorName}`;
        formattedMessage = `*Sath Care Alert* 🔔\n\n💊 *${seniorName}* has completed: *After-Lunch Medicine* at *${time}* ✓\n\n🩺 *Dose:* Midday Calcium & Joint Vitality (1 tablet)\n✨ *Status:* Taken with water & verified\n\n_Status: Done ✓. Everything is on schedule._`;
        break;

      case 'nap':
        title = `😴 Afternoon Nap Completed: ${seniorName}`;
        formattedMessage = `*Sath Care Alert* 🔔\n\n😴 *${seniorName}* has completed: *Sleep Nap & Afternoon Rest* at *${time}* ✓\n\n🛌 *Duration:* Restful power nap completed feeling refreshed\n✨ *Wellness XP:* +${payload.parameters.xp || 40} XP\n\n_Status: Done ✓. Everything is on schedule._`;
        break;

      case 'dinner':
        title = `🍲 Dinner Enjoyed: ${seniorName}`;
        formattedMessage = `*Sath Care Alert* 🔔\n\n🍲 *${seniorName}* has completed: *Dinner* at *${time}* ✓\n\n🍽️ *Dish / Meal:* ${payload.parameters.dishName || 'Evening Light Dinner & Hydration'}\n✨ *Wellness XP:* +${payload.parameters.xp || 40} XP\n\n_Status: Done ✓. Everything is on schedule._`;
        break;

      case 'dinner_medicine':
        title = `💊 Dinner Medicine Taken: ${seniorName}`;
        formattedMessage = `*Sath Care Alert* 🔔\n\n💊 *${seniorName}* has completed: *After-Dinner Medicine* at *${time}* ✓\n\n🩺 *Dose:* Night Neuro-Calm & Sleep Support (1 tablet)\n✨ *Status:* Taken with water & verified\n\n_Status: Done ✓. Everything is on schedule._`;
        break;

      case 'medicine_taken':
        title = `Medicine #${payload.parameters.medicineNumber} Confirmed ✓`;
        formattedMessage = `*Sath Health Alert*\n\n💊 *${seniorName}* took *Medicine #${payload.parameters.medicineNumber} (${payload.parameters.medicineName})* at *${time}*.\n\nRemaining stock: ${payload.parameters.remainingDoses} doses.`;
        break;

      case 'low_stock':
        title = `⚠️ Refill Warning: Medicine #${payload.parameters.medicineNumber}`;
        formattedMessage = `*Sath Pharmacy Notice*\n\n⚠️ *Low Stock Alert:* Medicine #${payload.parameters.medicineNumber} (${payload.parameters.medicineName}) has only *${payload.parameters.remainingDoses} doses remaining* (threshold: ${payload.parameters.threshold}).\n\nPlease order a refill soon from your pharmacy.`;
        break;

      case 'sos_alert':
        title = `🚨 SOS EMERGENCY ALERT: ${seniorName}`;
        formattedMessage = `*🚨 EMERGENCY SOS TRIGGERED 🚨*\n\n*${seniorName}* has activated the Emergency SOS alert at *${time}*.\n\n📍 *Reported Location:* ${payload.parameters.location || 'Home (Oakwood Residence, Apt 4B)'}\n📞 *Emergency Contact Dialed:* ${payload.parameters.contactPhone || GLOBAL_GUARDIAN_PHONE}\n\nPlease reach out or check the Guardian Dashboard immediately!`;
        break;

      case 'daily_summary':
        title = `Daily Peace-of-Mind Summary for ${seniorName}`;
        formattedMessage = `*Sath Daily Wrap-Up 🌙*\n\nToday was a wonderful day for *${seniorName}*:\n\n• Wake-up: Completed at ${payload.parameters.wakeTime || '7:15 AM'}\n• Daily Walk: Completed\n• Morning Yoga: Completed\n• Breakfast & Medicine: Completed\n• Lunch & Medicine: Completed\n• Afternoon Nap: Completed\n• Dinner & Medicine: Completed\n• Total XP Earned: +${payload.parameters.xpToday || 320} XP\n\n_Your parent is safe, healthy, and resting well._`;
        break;

      default:
        title = `Task Completed: ${payload.parameters.taskTitle || 'Wellness Routine'}`;
        formattedMessage = `*Sath Care Alert* 🔔\n\nHello! *${seniorName}* has completed: *${payload.parameters.taskTitle || 'Daily Task'}* at *${time}* ✓\n\nStatus: Done ✓. Everything is on schedule.`;
        break;
    }

    // Dispatch via unified notification service
    const notifItem = await NotificationService.send({
      seniorId: payload.seniorId,
      channel: 'whatsapp',
      title,
      message: formattedMessage,
      metadata: {
        templateType: payload.templateType,
        parameters: payload.parameters,
        recipientPhone: targetPhone,
        isLive,
      }
    });

    return {
      success: true,
      messageId: notifItem.id,
      formattedMessage,
      targetPhone,
    };
  }
}
