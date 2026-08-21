import { TodayBundle, Senior, DailyRoutine, DailyActivity, SeniorProgress, Medicine, ExerciseLibraryItem, Reward, NotificationItem, VoiceCallItem, SosEvent } from '../types';

const LOCAL_STORAGE_KEY = 'kincare_local_bundle_v1';

function getLocalBundle(): TodayBundle {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.senior && parsed.routine) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load local bundle from localStorage, initializing fresh:', e);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const initialBundle: TodayBundle = {
    senior: {
      id: 'senior_eleanor_01',
      user_id: 'user_senior_01',
      name: 'Eleanor Vance',
      age: 78,
      guardian_name: 'David Vance',
      guardian_phone: '9561442888',
      preferred_language: 'English',
      wake_time: '07:30',
      breakfast_time: '08:30',
      lunch_time: '13:00',
      dinner_time: '19:30',
      night_medicine_time: '21:00',
      step_goal: 8000,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
      emergency_contact_name: 'David Vance (Guardian)',
      emergency_contact_phone: '9561442888',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    routine: {
      id: 'rt_today',
      senior_id: 'senior_eleanor_01',
      date: todayStr,
      wake_status: 'pending',
      wake_time: undefined,
      walking_status: 'pending',
      breathing_status: 'unlocked',
      yoga_status: 'pending',
      breakfast_status: 'pending',
      lunch_status: 'pending',
      dinner_status: 'pending',
      breakfast_medicine_status: 'pending',
      lunch_medicine_status: 'pending',
      dinner_medicine_status: 'pending',
      medicine_status: 'pending',
      night_medicine_status: 'pending',
      xp_earned: 0,
      streak: 12,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    activity: {
      id: 'act_today',
      senior_id: 'senior_eleanor_01',
      date: todayStr,
      steps: 5420,
      step_goal: 8000,
      distance_km: 3.8,
      last_updated: new Date().toISOString(),
    },
    progress: {
      id: 'prog_01',
      senior_id: 'senior_eleanor_01',
      total_xp: 380,
      level: 4,
      current_streak: 12,
      longest_streak: 18,
      last_completed_date: todayStr,
    },
    medicines: [
      {
        id: 'med_01',
        senior_id: 'senior_eleanor_01',
        medicine_number: 1,
        name: 'Cardioprotect & Multivitamin',
        dosage_information: '1 tablet with water',
        schedule_time: '09:00 AM',
        instructions: 'Take with water after breakfast. Supports cardiovascular health.',
        quantity_remaining: 18,
        refill_unit: 'tablet',
        low_stock_threshold: 5,
        enabled: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'med_02',
        senior_id: 'senior_eleanor_01',
        medicine_number: 2,
        name: 'Calcium & Joint Vitality',
        dosage_information: '1 chewable tablet',
        schedule_time: '01:30 PM',
        instructions: 'Chew thoroughly after lunch. Promotes bone density and mobility.',
        quantity_remaining: 14,
        refill_unit: 'tablet',
        low_stock_threshold: 5,
        enabled: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'med_03',
        senior_id: 'senior_eleanor_01',
        medicine_number: 3,
        name: 'Night Neuro-Calm & Sleep Support',
        dosage_information: '1 capsule before bed',
        schedule_time: '08:30 PM',
        instructions: 'Take 30 mins before sleep with warm water.',
        quantity_remaining: 22,
        refill_unit: 'capsule',
        low_stock_threshold: 5,
        enabled: true,
        created_at: new Date().toISOString(),
      },
    ],
    exercises: [
      {
        id: 'ex_01',
        title: 'Gentle Morning Chair Stretch',
        category: 'stretching',
        duration_minutes: 10,
        difficulty: 'gentle',
        description: 'Easy posture stretches performed seated in a comfortable chair.',
        steps: ['Sit up straight', 'Inhale gently as you raise arms', 'Exhale slowly'],
        enabled: true,
      },
      {
        id: 'ex_02',
        title: 'Seated Ankle & Joint Mobility',
        category: 'mobility',
        duration_minutes: 8,
        difficulty: 'gentle',
        description: 'Rotational movements for foot and leg circulation.',
        steps: ['Rotate ankles clockwise', 'Flex toes gently', 'Repeat for 10 circles'],
        enabled: true,
      },
      {
        id: 'ex_03',
        title: 'Deep Diaphragmatic Breathing',
        category: 'stretching',
        duration_minutes: 5,
        difficulty: 'gentle',
        description: 'Calming breathing loop to lower stress and increase lung volume.',
        steps: ['Inhale for 4 seconds', 'Hold gently', 'Exhale for 6 seconds'],
        enabled: true,
      },
    ],
    rewards: [
      {
        id: 'rew_01',
        title: 'Family Video Call Night',
        description: 'Scheduled priority HD family video call session.',
        xp_cost: 150,
        category: 'family',
        icon: 'Video',
        enabled: true,
      },
      {
        id: 'rew_02',
        title: 'Favorite Homemade Dessert',
        description: 'Guardian will order or prepare your favorite sugar-free sweet treat.',
        xp_cost: 250,
        category: 'treat',
        icon: 'Cake',
        enabled: true,
      },
      {
        id: 'rew_03',
        title: 'Garden & Park Day Trip',
        description: 'Special weekend trip to the local botanical garden with family.',
        xp_cost: 400,
        category: 'outing',
        icon: 'Trees',
        enabled: true,
      },
    ],
    emergencyContacts: [
      {
        id: 'emg_01',
        senior_id: 'senior_eleanor_01',
        name: 'David Vance',
        relationship: 'Son / Primary Guardian',
        phone: '9561442888',
        is_primary: true,
        priority_order: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'emg_02',
        senior_id: 'senior_eleanor_01',
        name: 'Dr. Robert Harrison',
        relationship: 'Primary Physician (Oakwood Clinic)',
        phone: '9561442888',
        is_primary: false,
        priority_order: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 'emg_03',
        senior_id: 'senior_eleanor_01',
        name: 'Emergency Medical Services (911)',
        relationship: 'Emergency First Responders',
        phone: '9561442888',
        is_primary: false,
        priority_order: 3,
        created_at: new Date().toISOString(),
      },
    ],
    preferences: {
      id: 'pref_01',
      senior_id: 'senior_eleanor_01',
      voice_gender: 'female',
      voice_speed: 'normal',
      large_text_mode: true,
      high_contrast: false,
      auto_speak_prompts: true,
      sound_alerts: true,
    },
    recentNotifications: [
      {
        id: 'notif_01',
        senior_id: 'senior_eleanor_01',
        channel: 'whatsapp',
        title: 'Routine Sync Active',
        message: 'Daily schedule active. Updates automatically sent to David Vance (9561442888).',
        status: 'delivered',
        created_at: new Date().toISOString(),
      },
    ],
  };

  saveLocalBundle(initialBundle);
  return initialBundle;
}

function saveLocalBundle(bundle: TodayBundle) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bundle));
  } catch (e) {
    console.warn('Failed to persist local bundle to localStorage:', e);
  }
}

export class ApiClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data: T; message?: string }> {
    try {
      const res = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        return data;
      }
      throw new Error(`Server returned status ${res.status}`);
    } catch (err: any) {
      console.warn(`[KinCare Offline Mode] Backend API unreachable on [${endpoint}]. Using client-side state.`, err.message || err);
      throw err;
    }
  }

  // Today's Bundle
  public static async getTodayBundle(seniorId: string = 'senior_eleanor_01'): Promise<TodayBundle> {
    try {
      const res = await this.request<TodayBundle>(`/api/seniors/${seniorId}/today`);
      if (res && res.data) {
        saveLocalBundle(res.data);
        return res.data;
      }
    } catch (err) {
      // Offline / Netlify static fallback
    }
    return getLocalBundle();
  }

  // Senior Profile & Onboarding
  public static async getSeniors(): Promise<Senior[]> {
    try {
      const res = await this.request<Senior[]>('/api/seniors');
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    return [getLocalBundle().senior];
  }

  public static async getSenior(id: string): Promise<Senior> {
    try {
      const res = await this.request<Senior>(`/api/seniors/${id}`);
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    return getLocalBundle().senior;
  }

  public static async createSenior(payload: any): Promise<Senior> {
    try {
      const res = await this.request<Senior>('/api/seniors', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    const bundle = getLocalBundle();
    bundle.senior = {
      ...bundle.senior,
      name: payload.name || bundle.senior.name,
      guardian_name: payload.guardian_name || bundle.senior.guardian_name,
      guardian_phone: payload.guardian_phone || bundle.senior.guardian_phone,
      age: Number(payload.age) || bundle.senior.age,
    };
    saveLocalBundle(bundle);
    return bundle.senior;
  }

  public static async updateSenior(id: string, updates: Partial<Senior>): Promise<Senior> {
    try {
      const res = await this.request<Senior>(`/api/seniors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    const bundle = getLocalBundle();
    Object.assign(bundle.senior, updates);
    saveLocalBundle(bundle);
    return bundle.senior;
  }

  // Wake-Up Check-in
  public static async checkinWakeUp(seniorId: string): Promise<{ routine: DailyRoutine; progress: SeniorProgress; wakeTime: string; xpAwarded: number }> {
    try {
      const res = await this.request<any>('/api/checkin/wakeup', {
        method: 'POST',
        body: JSON.stringify({ seniorId }),
      });
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    const bundle = getLocalBundle();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    bundle.routine.wake_status = 'completed';
    bundle.routine.wake_time = nowStr;
    bundle.progress.total_xp += 30;
    saveLocalBundle(bundle);
    return { routine: bundle.routine, progress: bundle.progress, wakeTime: nowStr, xpAwarded: 30 };
  }

  // Steps Tracking
  public static async addSteps(seniorId: string, addSteps: number): Promise<{ activity: DailyActivity; routine: DailyRoutine; unlockedBreathing: boolean; xpAwarded: number }> {
    try {
      const res = await this.request<any>('/api/activity/steps', {
        method: 'POST',
        body: JSON.stringify({ seniorId, addSteps }),
      });
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    const bundle = getLocalBundle();
    bundle.activity.steps += addSteps;
    bundle.activity.distance_km = Number((bundle.activity.steps * 0.0007).toFixed(1));
    if (bundle.activity.steps >= bundle.activity.step_goal) {
      bundle.routine.walking_status = 'completed';
    }
    bundle.progress.total_xp += 50;
    saveLocalBundle(bundle);
    return { activity: bundle.activity, routine: bundle.routine, unlockedBreathing: true, xpAwarded: 50 };
  }

  public static async updateStepGoal(seniorId: string, stepGoal: number): Promise<{ stepGoal: number }> {
    try {
      const res = await this.request<any>('/api/activity/goal', {
        method: 'PATCH',
        body: JSON.stringify({ seniorId, stepGoal }),
      });
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    const bundle = getLocalBundle();
    bundle.activity.step_goal = stepGoal;
    bundle.senior.step_goal = stepGoal;
    saveLocalBundle(bundle);
    return { stepGoal };
  }

  // Breathing / Wellness
  public static async completeBreathing(seniorId: string, durationSeconds: number = 180): Promise<{ routine: DailyRoutine; progress: SeniorProgress; xpAwarded: number }> {
    try {
      const res = await this.request<any>('/api/wellness/breathing/complete', {
        method: 'POST',
        body: JSON.stringify({ seniorId, durationSeconds }),
      });
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    const bundle = getLocalBundle();
    bundle.routine.breathing_status = 'completed';
    bundle.progress.total_xp += 40;
    saveLocalBundle(bundle);
    return { routine: bundle.routine, progress: bundle.progress, xpAwarded: 40 };
  }

  // Routine task complete (Unified)
  public static async completeRoutineTask(
    seniorId: string,
    taskType: 'walk' | 'yoga' | 'breakfast' | 'breakfast_medicine' | 'lunch' | 'lunch_medicine' | 'nap' | 'dinner' | 'dinner_medicine' | 'wakeup',
    taskTitle?: string,
    extraDetails?: string,
    dishName?: string
  ): Promise<{ routine: DailyRoutine; progress: SeniorProgress; xpAwarded: number; whatsapp?: any }> {
    try {
      const res = await this.request<any>('/api/routine/task-complete', {
        method: 'POST',
        body: JSON.stringify({ seniorId, taskType, taskTitle, extraDetails, dishName }),
      });
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    const bundle = getLocalBundle();
    if (taskType === 'wakeup') bundle.routine.wake_status = 'completed';
    else if (taskType === 'walk') bundle.routine.walking_status = 'completed';
    else if (taskType === 'yoga') bundle.routine.yoga_status = 'completed';
    else if (taskType === 'breakfast') bundle.routine.breakfast_status = 'completed';
    else if (taskType === 'lunch') bundle.routine.lunch_status = 'completed';
    else if (taskType === 'dinner') bundle.routine.dinner_status = 'completed';
    else if (taskType === 'breakfast_medicine') bundle.routine.breakfast_medicine_status = 'completed';
    else if (taskType === 'lunch_medicine') bundle.routine.lunch_medicine_status = 'completed';
    else if (taskType === 'dinner_medicine') {
      bundle.routine.dinner_medicine_status = 'completed';
      bundle.routine.night_medicine_status = 'completed';
    }

    bundle.progress.total_xp += 40;
    saveLocalBundle(bundle);

    return {
      routine: bundle.routine,
      progress: bundle.progress,
      xpAwarded: 40,
      whatsapp: {
        recipientPhone: bundle.senior.guardian_phone || '9561442888',
        taskTitle: taskTitle || taskType,
      },
    };
  }

  // Yoga & Exercises
  public static async completeExercise(exerciseId: string, seniorId: string): Promise<{ routine: DailyRoutine; progress: SeniorProgress; xpAwarded: number }> {
    try {
      const res = await this.request<any>(`/api/exercises/${exerciseId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ seniorId }),
      });
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    const bundle = getLocalBundle();
    bundle.routine.yoga_status = 'completed';
    bundle.progress.total_xp += 50;
    saveLocalBundle(bundle);
    return { routine: bundle.routine, progress: bundle.progress, xpAwarded: 50 };
  }

  // Meal confirmation
  public static async completeMeal(
    mealType: 'breakfast' | 'lunch' | 'dinner',
    seniorId: string,
    dishName?: string
  ): Promise<{ routine: DailyRoutine; progress: SeniorProgress; xpAwarded: number; whatsapp?: any }> {
    try {
      const res = await this.request<any>(`/api/meals/${mealType}/complete`, {
        method: 'POST',
        body: JSON.stringify({ seniorId, dishName }),
      });
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    const bundle = getLocalBundle();
    if (mealType === 'breakfast') bundle.routine.breakfast_status = 'completed';
    else if (mealType === 'lunch') bundle.routine.lunch_status = 'completed';
    else if (mealType === 'dinner') bundle.routine.dinner_status = 'completed';

    bundle.progress.total_xp += 40;
    saveLocalBundle(bundle);

    return {
      routine: bundle.routine,
      progress: bundle.progress,
      xpAwarded: 40,
      whatsapp: {
        mealType,
        dishName: dishName || `${mealType} completed`,
      },
    };
  }

  // Medicines
  public static async takeMedicine(medicineId: string, seniorId: string): Promise<{ medicine: Medicine; routine: DailyRoutine; progress: SeniorProgress; lowStockAlert: boolean; xpAwarded: number }> {
    try {
      const res = await this.request<any>(`/api/medicines/${medicineId}/taken`, {
        method: 'POST',
        body: JSON.stringify({ seniorId }),
      });
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    const bundle = getLocalBundle();
    let med = bundle.medicines.find(m => m.id === medicineId);
    if (!med) {
      const medNum = Number(medicineId.replace('med_0', ''));
      med = bundle.medicines.find(m => m.medicine_number === medNum) || bundle.medicines[0];
    }

    if (med) {
      if (med.quantity_remaining > 0) med.quantity_remaining -= 1;
      if (med.medicine_number === 1) bundle.routine.breakfast_medicine_status = 'completed';
      else if (med.medicine_number === 2) bundle.routine.lunch_medicine_status = 'completed';
      else {
        bundle.routine.dinner_medicine_status = 'completed';
        bundle.routine.night_medicine_status = 'completed';
      }
    }

    bundle.progress.total_xp += 40;
    saveLocalBundle(bundle);

    return {
      medicine: med,
      routine: bundle.routine,
      progress: bundle.progress,
      lowStockAlert: med ? med.quantity_remaining <= med.low_stock_threshold : false,
      xpAwarded: 40,
    };
  }

  public static async snoozeMedicineReminder(medicineId: string, seniorId: string): Promise<string> {
    try {
      const res = await this.request<any>(`/api/medicines/${medicineId}/remind`, {
        method: 'POST',
        body: JSON.stringify({ seniorId }),
      });
      if (res && res.message) return res.message;
    } catch (e) {
      // Offline fallback
    }
    return 'Reminder scheduled for 15 minutes';
  }

  public static async orderMedicineRefill(refillId: string, medicineId: string, quantityToAdd: number = 30): Promise<void> {
    try {
      await this.request('/api/medicines/refill/order', {
        method: 'POST',
        body: JSON.stringify({ refillId, medicineId, quantityToAdd }),
      });
      return;
    } catch (e) {
      // Offline fallback
    }
    const bundle = getLocalBundle();
    const med = bundle.medicines.find(m => m.id === medicineId);
    if (med) {
      med.quantity_remaining += quantityToAdd;
      saveLocalBundle(bundle);
    }
  }

  // Rewards
  public static async redeemReward(rewardId: string, seniorId: string): Promise<{ redemption: any; remainingXp: number }> {
    try {
      const res = await this.request<any>(`/api/rewards/${rewardId}/redeem`, {
        method: 'POST',
        body: JSON.stringify({ seniorId }),
      });
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    const bundle = getLocalBundle();
    const reward = bundle.rewards.find(r => r.id === rewardId);
    if (reward && bundle.progress.total_xp >= reward.xp_cost) {
      bundle.progress.total_xp -= reward.xp_cost;
    }
    saveLocalBundle(bundle);
    return {
      redemption: { id: `red_${Date.now()}`, reward_id: rewardId, status: 'approved' },
      remainingXp: bundle.progress.total_xp,
    };
  }

  // Emergency SOS
  public static async triggerSos(seniorId: string, location?: { lat?: number; lng?: number; address?: string }): Promise<SosEvent> {
    try {
      const res = await this.request<SosEvent>('/api/sos/trigger', {
        method: 'POST',
        body: JSON.stringify({
          seniorId,
          location_lat: location?.lat,
          location_lng: location?.lng,
          location_address: location?.address,
        }),
      });
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    const bundle = getLocalBundle();
    const sosEvent: SosEvent = {
      id: `sos_${Date.now()}`,
      senior_id: seniorId,
      contact_name: bundle.senior.emergency_contact_name || 'David Vance',
      contact_phone: bundle.senior.emergency_contact_phone || '9561442888',
      triggered_at: new Date().toISOString(),
      location_lat: location?.lat || 37.7749,
      location_lng: location?.lng || -122.4194,
      location_address: location?.address || 'Senior Residence Home',
      status: 'active',
      call_status: 'completed',
      notification_status: 'delivered',
    };
    return sosEvent;
  }

  public static async getSosHistory(seniorId: string): Promise<SosEvent[]> {
    try {
      const res = await this.request<SosEvent[]>(`/api/sos/history/${seniorId}`);
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    return [];
  }

  public static async resolveSos(sosId: string): Promise<void> {
    try {
      await this.request(`/api/sos/${sosId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolvedBy: 'Guardian (Direct Response)' }),
      });
      return;
    } catch (e) {
      // Offline fallback
    }
  }

  // Voice Calls & Logs
  public static async getVoiceHistory(seniorId: string): Promise<VoiceCallItem[]> {
    try {
      const res = await this.request<VoiceCallItem[]>(`/api/sos/history/${seniorId}`);
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    return [];
  }

  public static async placeVoiceCall(seniorId: string, callType: VoiceCallItem['call_type'], customScript?: string): Promise<VoiceCallItem> {
    try {
      const res = await this.request<VoiceCallItem>('/api/voice/call', {
        method: 'POST',
        body: JSON.stringify({ seniorId, callType, customScript }),
      });
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    return {
      id: `call_${Date.now()}`,
      senior_id: seniorId,
      call_type: callType,
      trigger_source: 'manual',
      status: 'completed',
      script_content: customScript || 'Voice message call completed.',
      duration_seconds: 45,
      initiated_at: new Date().toISOString(),
    };
  }

  // Notifications
  public static async getNotifications(seniorId: string): Promise<NotificationItem[]> {
    try {
      const res = await this.request<NotificationItem[]>(`/api/notifications/${seniorId}`);
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    return getLocalBundle().recentNotifications;
  }

  // AI Insights
  public static async getMorningGreeting(seniorId: string): Promise<string> {
    try {
      const res = await this.request<{ greeting: string }>(`/api/ai/morning-greeting?seniorId=${seniorId}`);
      if (res && res.data && res.data.greeting) return res.data.greeting;
    } catch (e) {
      // Offline fallback
    }
    return 'Good morning, Eleanor! Today is a beautiful day. Remember to take your morning walk and stay hydrated.';
  }

  public static async getGuardianSummary(seniorId: string): Promise<string> {
    try {
      const res = await this.request<{ summary: string }>(`/api/ai/guardian-summary?seniorId=${seniorId}`);
      if (res && res.data && res.data.summary) return res.data.summary;
    } catch (e) {
      // Offline fallback
    }
    return 'Eleanor is doing wonderful today. Daily routine is active with 5,420 steps recorded and prescriptions on schedule.';
  }

  public static async companionChat(seniorId: string, message: string): Promise<string> {
    try {
      const res = await this.request<{ reply: string }>('/api/ai/companion-chat', {
        method: 'POST',
        body: JSON.stringify({ seniorId, message }),
      });
      if (res && res.data && res.data.reply) return res.data.reply;
    } catch (e) {
      // Offline fallback
    }
    return 'I am right here with you, Eleanor! That sounds lovely. How are you feeling today?';
  }

  // Demo Controls
  public static async triggerDemoEvent(seniorId: string, eventType: string, extraParam?: number): Promise<{ success: boolean; message: string }> {
    try {
      const res = await this.request<any>('/api/demo/trigger-event', {
        method: 'POST',
        body: JSON.stringify({ seniorId, eventType, extraParam }),
      });
      if (res && res.data) return res.data;
    } catch (e) {
      // Offline fallback
    }
    return { success: true, message: `Demo event ${eventType} executed locally.` };
  }

  public static async resetDemoDatabase(): Promise<void> {
    try {
      await this.request('/api/demo/reset', { method: 'POST' });
    } catch (e) {
      // Offline fallback
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}
