import { db } from '../db.js';
import { VoiceService } from './voiceService.js';
import { NotificationService } from './notificationService.js';
import { WhatsAppService } from './whatsappService.js';

export class SchedulerService {
  private static interval: NodeJS.Timeout | null = null;
  private static lastTriggeredMinute: string = '';

  public static start() {
    if (this.interval) return;
    console.log('[SchedulerService] Background daily reminder daemon started.');
    
    // Check every 30 seconds
    this.interval = setInterval(() => {
      this.tick();
    }, 30000);
  }

  public static stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private static tick() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    if (this.lastTriggeredMinute === currentTimeStr) return;
    this.lastTriggeredMinute = currentTimeStr;

    const seniors = db.getAllSeniors();
    for (const senior of seniors) {
      this.evaluateSeniorSchedule(senior.id, currentTimeStr);
    }
  }

  private static async evaluateSeniorSchedule(seniorId: string, currentTime: string) {
    const senior = db.getSenior(seniorId);
    if (!senior) return;

    const today = new Date().toISOString().split('T')[0];
    const routine = db.getDailyRoutine(seniorId, today);

    // Wake-up check (if not yet awake 30 mins after scheduled wake time)
    if (senior.wake_time === currentTime && routine.wake_status === 'pending') {
      console.log(`[SchedulerService] Scheduled wake-up check for ${senior.name}`);
      await VoiceService.makeCall({
        seniorId,
        callType: 'wakeup',
        triggerSource: 'scheduler',
      });
    }

    // Breakfast check
    if (senior.breakfast_time === currentTime && routine.breakfast_status === 'pending') {
      await VoiceService.makeCall({
        seniorId,
        callType: 'meal_reminder',
        triggerSource: 'scheduler',
        mealType: 'breakfast',
      });
    }

    // Medicines check
    const meds = db.getMedicines(seniorId).filter(m => m.enabled && m.schedule_time === currentTime);
    for (const med of meds) {
      await VoiceService.makeCall({
        seniorId,
        callType: 'medicine_reminder',
        triggerSource: 'scheduler',
        medicineNumber: med.medicine_number,
      });
    }
  }

  /**
   * Manual Demo Trigger to simulate any scheduled event on demand!
   */
  public static async triggerEvent(seniorId: string, eventType: 'wakeup_call' | 'breakfast_call' | 'lunch_call' | 'dinner_call' | 'med_call' | 'summary_whatsapp', extraParam?: number): Promise<{ success: boolean; message: string }> {
    const senior = db.getSenior(seniorId);
    if (!senior) throw new Error('Senior not found');

    const today = new Date().toISOString().split('T')[0];
    const routine = db.getDailyRoutine(seniorId, today);
    const activity = db.getDailyActivity(seniorId, today);

    switch (eventType) {
      case 'wakeup_call':
        await VoiceService.makeCall({
          seniorId,
          callType: 'wakeup',
          triggerSource: 'manual',
        });
        return { success: true, message: `Wake-up reminder call placed to ${senior.name}` };

      case 'breakfast_call':
      case 'lunch_call':
      case 'dinner_call':
        const meal = eventType.replace('_call', '');
        await VoiceService.makeCall({
          seniorId,
          callType: 'meal_reminder',
          triggerSource: 'manual',
          mealType: meal,
        });
        return { success: true, message: `${meal.toUpperCase()} reminder call placed to ${senior.name}` };

      case 'med_call':
        const medNum = extraParam || 1;
        await VoiceService.makeCall({
          seniorId,
          callType: 'medicine_reminder',
          triggerSource: 'manual',
          medicineNumber: medNum,
        });
        return { success: true, message: `Medicine #${medNum} voice call reminder triggered for ${senior.name}` };

      case 'summary_whatsapp':
        await WhatsAppService.sendTemplateMessage({
          seniorId,
          recipientPhone: senior.guardian_phone,
          templateType: 'daily_summary',
          parameters: {
            seniorName: senior.name,
            wakeTime: routine.wake_time || '7:12 AM',
            steps: activity.steps,
            distance: activity.distance_km,
            xpToday: routine.xp_earned,
          }
        });
        return { success: true, message: `Daily Peace-of-Mind WhatsApp summary sent to ${senior.guardian_name}` };

      default:
        return { success: false, message: 'Unknown event type' };
    }
  }
}
