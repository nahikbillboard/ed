import { TodayBundle, Senior, DailyRoutine, DailyActivity, SeniorProgress, Medicine, ExerciseLibraryItem, Reward, NotificationItem, VoiceCallItem, SosEvent } from '../types';

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
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return data;
    } catch (err: any) {
      console.error(`API Error on [${endpoint}]:`, err);
      throw err;
    }
  }

  // Today's Bundle
  public static async getTodayBundle(seniorId: string = 'senior_eleanor_01'): Promise<TodayBundle> {
    const res = await this.request<TodayBundle>(`/api/seniors/${seniorId}/today`);
    return res.data;
  }

  // Senior Profile & Onboarding
  public static async getSeniors(): Promise<Senior[]> {
    const res = await this.request<Senior[]>('/api/seniors');
    return res.data;
  }

  public static async getSenior(id: string): Promise<Senior> {
    const res = await this.request<Senior>(`/api/seniors/${id}`);
    return res.data;
  }

  public static async createSenior(payload: any): Promise<Senior> {
    const res = await this.request<Senior>('/api/seniors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  }

  public static async updateSenior(id: string, updates: Partial<Senior>): Promise<Senior> {
    const res = await this.request<Senior>(`/api/seniors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return res.data;
  }

  // Wake-Up Check-in
  public static async checkinWakeUp(seniorId: string): Promise<{ routine: DailyRoutine; progress: SeniorProgress; wakeTime: string; xpAwarded: number }> {
    const res = await this.request<any>('/api/checkin/wakeup', {
      method: 'POST',
      body: JSON.stringify({ seniorId }),
    });
    return res.data;
  }

  // Steps Tracking
  public static async addSteps(seniorId: string, addSteps: number): Promise<{ activity: DailyActivity; routine: DailyRoutine; unlockedBreathing: boolean; xpAwarded: number }> {
    const res = await this.request<any>('/api/activity/steps', {
      method: 'POST',
      body: JSON.stringify({ seniorId, addSteps }),
    });
    return res.data;
  }

  public static async updateStepGoal(seniorId: string, stepGoal: number): Promise<{ stepGoal: number }> {
    const res = await this.request<any>('/api/activity/goal', {
      method: 'PATCH',
      body: JSON.stringify({ seniorId, stepGoal }),
    });
    return res.data;
  }

  // Breathing / Wellness
  public static async completeBreathing(seniorId: string, durationSeconds: number = 180): Promise<{ routine: DailyRoutine; progress: SeniorProgress; xpAwarded: number }> {
    const res = await this.request<any>('/api/wellness/breathing/complete', {
      method: 'POST',
      body: JSON.stringify({ seniorId, durationSeconds }),
    });
    return res.data;
  }

  // Routine task complete (Unified)
  public static async completeRoutineTask(
    seniorId: string,
    taskType: 'walk' | 'yoga' | 'breakfast' | 'breakfast_medicine' | 'lunch' | 'lunch_medicine' | 'nap' | 'dinner' | 'dinner_medicine' | 'wakeup',
    taskTitle?: string,
    extraDetails?: string,
    dishName?: string
  ): Promise<{ routine: DailyRoutine; progress: SeniorProgress; xpAwarded: number; whatsapp?: any }> {
    const res = await this.request<any>('/api/routine/task-complete', {
      method: 'POST',
      body: JSON.stringify({ seniorId, taskType, taskTitle, extraDetails, dishName }),
    });
    return res.data;
  }

  // Yoga & Exercises
  public static async completeExercise(exerciseId: string, seniorId: string): Promise<{ routine: DailyRoutine; progress: SeniorProgress; xpAwarded: number }> {
    const res = await this.request<any>(`/api/exercises/${exerciseId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ seniorId }),
    });
    return res.data;
  }

  // Meal confirmation
  public static async completeMeal(
    mealType: 'breakfast' | 'lunch' | 'dinner',
    seniorId: string,
    dishName?: string
  ): Promise<{ routine: DailyRoutine; progress: SeniorProgress; xpAwarded: number; whatsapp?: any }> {
    const res = await this.request<any>(`/api/meals/${mealType}/complete`, {
      method: 'POST',
      body: JSON.stringify({ seniorId, dishName }),
    });
    return res.data;
  }

  // Medicines
  public static async takeMedicine(medicineId: string, seniorId: string): Promise<{ medicine: Medicine; routine: DailyRoutine; progress: SeniorProgress; lowStockAlert: boolean; xpAwarded: number }> {
    const res = await this.request<any>(`/api/medicines/${medicineId}/taken`, {
      method: 'POST',
      body: JSON.stringify({ seniorId }),
    });
    return res.data;
  }

  public static async snoozeMedicineReminder(medicineId: string, seniorId: string): Promise<string> {
    const res = await this.request<any>(`/api/medicines/${medicineId}/remind`, {
      method: 'POST',
      body: JSON.stringify({ seniorId }),
    });
    return res.message || 'Reminder scheduled';
  }

  public static async orderMedicineRefill(refillId: string, medicineId: string, quantityToAdd: number = 30): Promise<void> {
    await this.request('/api/medicines/refill/order', {
      method: 'POST',
      body: JSON.stringify({ refillId, medicineId, quantityToAdd }),
    });
  }

  // Rewards
  public static async redeemReward(rewardId: string, seniorId: string): Promise<{ redemption: any; remainingXp: number }> {
    const res = await this.request<any>(`/api/rewards/${rewardId}/redeem`, {
      method: 'POST',
      body: JSON.stringify({ seniorId }),
    });
    return res.data;
  }

  // Emergency SOS
  public static async triggerSos(seniorId: string, location?: { lat?: number; lng?: number; address?: string }): Promise<SosEvent> {
    const res = await this.request<SosEvent>('/api/sos/trigger', {
      method: 'POST',
      body: JSON.stringify({
        seniorId,
        location_lat: location?.lat,
        location_lng: location?.lng,
        location_address: location?.address,
      }),
    });
    return res.data;
  }

  public static async getSosHistory(seniorId: string): Promise<SosEvent[]> {
    const res = await this.request<SosEvent[]>(`/api/sos/history/${seniorId}`);
    return res.data;
  }

  public static async resolveSos(sosId: string): Promise<void> {
    await this.request(`/api/sos/${sosId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolvedBy: 'Guardian (Direct Response)' }),
    });
  }

  // Voice Calls & Logs
  public static async getVoiceHistory(seniorId: string): Promise<VoiceCallItem[]> {
    const res = await this.request<VoiceCallItem[]>(`/api/voice/history/${seniorId}`);
    return res.data;
  }

  public static async placeVoiceCall(seniorId: string, callType: VoiceCallItem['call_type'], customScript?: string): Promise<VoiceCallItem> {
    const res = await this.request<VoiceCallItem>('/api/voice/call', {
      method: 'POST',
      body: JSON.stringify({ seniorId, callType, customScript }),
    });
    return res.data;
  }

  // Notifications
  public static async getNotifications(seniorId: string): Promise<NotificationItem[]> {
    const res = await this.request<NotificationItem[]>(`/api/notifications/${seniorId}`);
    return res.data;
  }

  // AI Insights
  public static async getMorningGreeting(seniorId: string): Promise<string> {
    const res = await this.request<{ greeting: string }>(`/api/ai/morning-greeting?seniorId=${seniorId}`);
    return res.data.greeting;
  }

  public static async getGuardianSummary(seniorId: string): Promise<string> {
    const res = await this.request<{ summary: string }>(`/api/ai/guardian-summary?seniorId=${seniorId}`);
    return res.data.summary;
  }

  public static async companionChat(seniorId: string, message: string): Promise<string> {
    const res = await this.request<{ reply: string }>('/api/ai/companion-chat', {
      method: 'POST',
      body: JSON.stringify({ seniorId, message }),
    });
    return res.data.reply;
  }

  // Demo Controls
  public static async triggerDemoEvent(seniorId: string, eventType: string, extraParam?: number): Promise<{ success: boolean; message: string }> {
    const res = await this.request<any>('/api/demo/trigger-event', {
      method: 'POST',
      body: JSON.stringify({ seniorId, eventType, extraParam }),
    });
    return res.data;
  }

  public static async resetDemoDatabase(): Promise<void> {
    await this.request('/api/demo/reset', { method: 'POST' });
  }
}
