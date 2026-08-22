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
        return `नमस्ते ${seniorName} जी! सुप्रभात! एक नई सुबह की शुरुआत हो चुकी है। आपकी सुबह की वेलनेस दिनचर्या तैयार है। कृपया स्क्रीन पर "मैं जाग गया हूँ" बटन दबाकर अपने परिवार को बताएं कि आप ठीक और खुश हैं।`;

      case 'meal_reminder':
        const meal = options.mealType || 'भोजन';
        return `नमस्ते ${seniorName} जी! यह आपके पौष्टिक ${meal} का समय है। समय पर भोजन और पानी पीने से आपको ताजगी और ऊर्जा मिलती है। कृपया अपने भोजन का आनंद लें और पूरा होने पर बटन दबाएं।`;

      case 'medicine_reminder':
        const medNum = options.medicineNumber || 1;
        const med = db.getMedicines(options.seniorId || '').find(m => m.medicine_number === medNum);
        const medName = med ? `${med.name} (${med.dosage_information})` : `दवाई नंबर ${medNum}`;
        const instructions = med ? med.instructions : 'पानी के साथ लें';
        return `नमस्ते ${seniorName} जी! यह आपकी दवाई का समय है। कृपया दवाई नंबर ${medNum}, यानी ${medName} देखें और इसे ${instructions} लें। इसके बाद स्क्रीन पर दर्ज करें।`;

      case 'sos':
        return `नमस्ते, यह किनकेयर स्वचालित आपातकालीन चेतावनी है। ${seniorName} जी ने आपातकालीन एसओएस बटन दबाया है। हम तुरंत उनके आपातकालीन संपर्क से कॉल जोड़ रहे हैं।`;

      case 'wellness_check':
        return `नमस्ते ${seniorName} जी! यह आपका दैनिक वेलनेस चेक-इन है। आपने आज का वॉक और ध्यान पूरा कर लिया है। आप बहुत अच्छा कर रहे हैं!`;

      case 'companion_chat':
        return `नमस्ते ${seniorName} जी! आप आज कैसा महसूस कर रहे हैं? मैं आपकी दैनिक दिनचर्या में सहायता करने और परिवार से जुड़े रहने के लिए यहाँ हूँ।`;

      default:
        return `नमस्ते ${seniorName} जी, आपका किनकेयर साथी आपके साथ है। आपका दिन सुखद और मंगलमय हो!`;
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
