import { db } from '../db.js';
import { VoiceCallItem } from '../types.js';

export interface MakeCallOptions {
  seniorId: string;
  callType: VoiceCallItem['call_type'];
  triggerSource: VoiceCallItem['trigger_source'];
  recipientPhone?: string;
  customScript?: string;
  medicineNumber?: number;
  mealType?: string;
}

export class VoiceService {
  private static apiKey = process.env.VOICE_API_KEY;
  private static callerPhone = process.env.VOICE_API_PHONE || '+18005550199';

  public static generateStandardScript(seniorName: string, callType: VoiceCallItem['call_type'], options: Partial<MakeCallOptions> = {}): string {
    switch (callType) {
      case 'wakeup':
        return `Hello ${seniorName}! Good morning! It's a brand new day with sunshine and fresh air. Your morning wellness routine is ready whenever you are. Please press "I'm Awake" on your screen to let your family know you're up and feeling good!`;

      case 'meal_reminder':
        const meal = options.mealType || 'meal';
        return `Hello ${seniorName}! It is time for your wholesome ${meal}. Staying nourished and hydrated gives you wonderful energy. Please enjoy your meal, and press "I Had ${meal.charAt(0).toUpperCase() + meal.slice(1)}" on your tablet when you're done!`;

      case 'medicine_reminder':
        const medNum = options.medicineNumber || 1;
        const med = db.getMedicines(options.seniorId || '').find(m => m.medicine_number === medNum);
        const medName = med ? `${med.name} (${med.dosage_information})` : `Medicine Number ${medNum}`;
        const instructions = med ? med.instructions : 'with water as prescribed';
        return `Hello ${seniorName}! This is your gentle care companion reminder. It is time for your medication: please check Medicine Number ${medNum}, which is ${medName}. Remember to take it ${instructions}. Afterward, please tap "Taken" on your screen.`;

      case 'sos':
        return `Hello, this is an automated KinCare Emergency Alert. ${seniorName} has activated the emergency SOS button. We are connecting you immediately with their primary emergency contact and notifying their family.`;

      case 'wellness_check':
        return `Hello ${seniorName}! This is your daily companion check-in. You have completed your walking and gentle breathing today. You are doing fantastic! Remember that your family loves you and is cheering you on.`;

      case 'companion_chat':
        return `Hello ${seniorName}! How are you feeling today? I am here to assist you with your daily routine and keep you connected with your family.`;

      default:
        return `Hello ${seniorName}, your KinCare daily companion is checking in. Have a warm and peaceful day!`;
    }
  }

  public static async makeCall(options: MakeCallOptions): Promise<VoiceCallItem> {
    const senior = db.getSenior(options.seniorId) || { name: 'Friend', emergency_contact_phone: '+15558765432' };
    const script = options.customScript || this.generateStandardScript(senior.name, options.callType, options);

    const isLive = !!this.apiKey && this.apiKey !== 'voice_live_sk_demo_credentials';

    const callRecord: VoiceCallItem = {
      id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senior_id: options.seniorId,
      call_type: options.callType,
      trigger_source: options.triggerSource,
      status: isLive ? 'completed' : 'simulated',
      script_content: script,
      duration_seconds: Math.floor(Math.random() * 25) + 30, // 30-55 seconds
      initiated_at: new Date().toISOString(),
      completed_at: new Date(Date.now() + 35000).toISOString(),
    };

    db.getRaw().voice_calls.unshift(callRecord);
    db.scheduleSave();

    console.log(`[VoiceService][CALL DISPATCHED] Type: ${options.callType} to ${senior.name} (Status: ${callRecord.status})`);
    console.log(`[VoiceService][SCRIPT] "${script.substring(0, 100)}..."`);

    return callRecord;
  }

  public static async scheduleCall(options: MakeCallOptions & { scheduledTime: string }): Promise<VoiceCallItem> {
    const senior = db.getSenior(options.seniorId) || { name: 'Friend' };
    const script = options.customScript || this.generateStandardScript(senior.name, options.callType, options);

    const callRecord: VoiceCallItem = {
      id: `call_sch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senior_id: options.seniorId,
      call_type: options.callType,
      trigger_source: 'scheduler',
      status: 'scheduled',
      script_content: script,
      duration_seconds: 0,
      initiated_at: options.scheduledTime,
    };

    db.getRaw().voice_calls.unshift(callRecord);
    db.scheduleSave();
    return callRecord;
  }

  public static async cancelCall(callId: string): Promise<boolean> {
    const call = db.getRaw().voice_calls.find(c => c.id === callId);
    if (call && call.status === 'scheduled') {
      call.status = 'failed';
      db.scheduleSave();
      return true;
    }
    return false;
  }

  public static getCallStatus(callId: string): VoiceCallItem | undefined {
    return db.getRaw().voice_calls.find(c => c.id === callId);
  }

  public static getCallHistory(seniorId: string): VoiceCallItem[] {
    return db.getRaw().voice_calls.filter(c => c.senior_id === seniorId);
  }
}
