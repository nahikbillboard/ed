import fs from 'fs';
import path from 'path';
import {
  User, Senior, Guardian, SeniorGuardian, EmergencyContact, SeniorPreferences,
  DailyRoutine, DailyActivity, WellnessSession, ExerciseLibraryItem, ExerciseSession,
  XpTransaction, SeniorProgress, Reward, RewardRedemption, MealSchedule, MealLog,
  Medicine, MedicineLog, RefillRequest, NotificationItem, VoiceCallItem, SosEvent, AuditLog
} from './types.js';

interface DatabaseSchema {
  users: User[];
  seniors: Senior[];
  guardians: Guardian[];
  senior_guardians: SeniorGuardian[];
  emergency_contacts: EmergencyContact[];
  senior_preferences: SeniorPreferences[];
  daily_routines: DailyRoutine[];
  daily_activity: DailyActivity[];
  wellness_sessions: WellnessSession[];
  exercise_library: ExerciseLibraryItem[];
  exercise_sessions: ExerciseSession[];
  xp_transactions: XpTransaction[];
  senior_progress: SeniorProgress[];
  rewards: Reward[];
  reward_redemptions: RewardRedemption[];
  meal_schedules: MealSchedule[];
  meal_logs: MealLog[];
  medicines: Medicine[];
  medicine_logs: MedicineLog[];
  refill_requests: RefillRequest[];
  notifications: NotificationItem[];
  voice_calls: VoiceCallItem[];
  sos_events: SosEvent[];
  audit_logs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'sath_db.json');
const OLD_DB_FILE = path.join(DATA_DIR, 'kincare_db.json');

class DatabaseEngine {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadOrSeed();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data directory:', err);
      }
    }
  }

  private loadOrSeed(): DatabaseSchema {
    const fileToRead = fs.existsSync(DB_FILE) ? DB_FILE : (fs.existsSync(OLD_DB_FILE) ? OLD_DB_FILE : null);
    if (fileToRead) {
      try {
        const content = fs.readFileSync(fileToRead, 'utf-8');
        const parsed = JSON.parse(content);
        if (parsed.seniors && parsed.seniors.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn('Corrupted database file, reseeding initial data:', e);
      }
    }

    const initial = this.getSeedData();
    this.saveImmediate(initial);
    return initial;
  }

  private saveImmediate(data: DatabaseSchema) {
    this.ensureDataDir();
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database file:', e);
    }
  }

  public scheduleSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveImmediate(this.data);
    }, 100);
  }

  public getRaw(): DatabaseSchema {
    return this.data;
  }

  private getTodayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  public getSeedData(): DatabaseSchema {
    const today = this.getTodayStr();
    const seniorId = 'senior_eleanor_01';
    const guardianId = 'guardian_david_01';
    const seniorUserId = 'user_senior_01';
    const guardianUserId = 'user_guardian_01';

    const users: User[] = [
      {
        id: seniorUserId,
        email: 'sunita@sath.demo',
        name: 'Sunita',
        phone: '+91 9561442888',
        role: 'senior',
        created_at: '2026-01-10T08:00:00Z',
      },
      {
        id: guardianUserId,
        email: 'guardian@sath.demo',
        name: 'David Vance (Son)',
        phone: '+91 9561442888',
        role: 'guardian',
        created_at: '2026-01-10T08:00:00Z',
      },
      {
        id: 'user_admin_01',
        email: 'admin@sath.demo',
        name: 'Sath Operations Admin',
        phone: '+91 9561442888',
        role: 'admin',
        created_at: '2026-01-01T00:00:00Z',
      }
    ];

    const seniors: Senior[] = [
      {
        id: seniorId,
        user_id: seniorUserId,
        name: 'Sunita',
        age: 78,
        guardian_name: 'David Vance',
        guardian_phone: '9561442888',
        preferred_language: 'Hindi',
        wake_time: '07:30',
        breakfast_time: '08:30',
        lunch_time: '13:00',
        dinner_time: '19:30',
        night_medicine_time: '21:00',
        step_goal: 8000,
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
        emergency_contact_name: 'David Vance (Guardian)',
        emergency_contact_phone: '9561442888',
        created_at: '2026-01-10T08:00:00Z',
        updated_at: '2026-08-20T10:00:00Z',
      }
    ];

    const guardians: Guardian[] = [
      {
        id: guardianId,
        user_id: guardianUserId,
        name: 'David Vance',
        phone: '9561442888',
        email: 'guardian@sath.demo',
        relationship: 'Son',
        is_primary: true,
        notify_sms: true,
        notify_whatsapp: true,
        notify_push: true,
        created_at: '2026-01-10T08:00:00Z',
      }
    ];

    const senior_guardians: SeniorGuardian[] = [
      {
        id: 'sg_01',
        senior_id: seniorId,
        guardian_id: guardianId,
        permissions: ['read', 'write', 'emergency_manage', 'medicine_config'],
        created_at: '2026-01-10T08:00:00Z',
      }
    ];

    const emergency_contacts: EmergencyContact[] = [
      {
        id: 'emg_01',
        senior_id: seniorId,
        name: 'David Vance',
        relationship: 'Son / Primary Guardian',
        phone: '9561442888',
        is_primary: true,
        priority_order: 1,
        created_at: '2026-01-10T08:00:00Z',
      },
      {
        id: 'emg_02',
        senior_id: seniorId,
        name: 'Dr. Robert Harrison',
        relationship: 'Primary Physician (Oakwood Clinic)',
        phone: '9561442888',
        is_primary: false,
        priority_order: 2,
        created_at: '2026-01-12T09:00:00Z',
      },
      {
        id: 'emg_03',
        senior_id: seniorId,
        name: 'Emergency Medical Services (911)',
        relationship: 'Emergency First Responders',
        phone: '9561442888',
        is_primary: false,
        priority_order: 3,
        created_at: '2026-01-10T08:00:00Z',
      }
    ];

    const senior_preferences: SeniorPreferences[] = [
      {
        id: 'pref_01',
        senior_id: seniorId,
        voice_gender: 'female',
        voice_speed: 'normal',
        large_text_mode: true,
        high_contrast: false,
        auto_speak_prompts: true,
        sound_alerts: true,
      }
    ];

    const daily_routines: DailyRoutine[] = [
      {
        id: `routine_${seniorId}_${today}`,
        senior_id: seniorId,
        date: today,
        wake_status: 'completed',
        wake_time: '07:12 AM',
        walking_status: 'completed',
        breathing_status: 'completed',
        yoga_status: 'completed',
        breakfast_status: 'completed',
        breakfast_medicine_status: 'completed',
        lunch_status: 'pending',
        lunch_medicine_status: 'pending',
        nap_status: 'pending',
        dinner_status: 'pending',
        dinner_medicine_status: 'pending',
        medicine_status: 'completed',
        night_medicine_status: 'pending',
        xp_earned: 220,
        streak: 7,
        notes: 'Sunita woke up energetic and completed morning walk and yoga.',
        created_at: `${today}T07:12:00Z`,
        updated_at: `${today}T08:45:00Z`,
      }
    ];

    const daily_activity: DailyActivity[] = [
      {
        id: `act_${seniorId}_${today}`,
        senior_id: seniorId,
        date: today,
        steps: 6420,
        distance_km: 4.3,
        step_goal: 8000,
        last_updated: `${today}T09:30:00Z`,
      }
    ];

    const wellness_sessions: WellnessSession[] = [
      {
        id: `well_01_${today}`,
        senior_id: seniorId,
        type: 'breathing',
        duration_seconds: 180,
        completed: true,
        completion_time: `${today}T08:15:00Z`,
        notes: 'Completed 3-minute box breathing cycle',
        created_at: `${today}T08:12:00Z`,
      }
    ];

    const exercise_library: ExerciseLibraryItem[] = [
      {
        id: 'ex_01',
        title: 'Gentle Chair Yoga',
        description: 'Seated stretching to improve flexibility and release spine tension safely.',
        duration_minutes: 8,
        difficulty: 'gentle',
        category: 'chair_yoga',
        media_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600',
        steps: [
          'Sit comfortably upright in a sturdy chair with feet flat on the floor.',
          'Take a deep breath and raise both arms overhead gently.',
          'Exhale and slowly lower your arms to your sides.',
          'Gently twist your torso to the right, holding for 10 seconds.',
          'Switch sides and repeat 3 times with slow steady breaths.'
        ],
        enabled: true,
      },
      {
        id: 'ex_02',
        title: 'Shoulder & Neck Mobility',
        description: 'Smooth rotations to ease morning stiffness and maintain neck posture.',
        duration_minutes: 5,
        difficulty: 'gentle',
        category: 'mobility',
        media_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600',
        steps: [
          'Roll both shoulders backward 5 times in slow gentle circles.',
          'Roll shoulders forward 5 times while breathing smoothly.',
          'Tilt head to right ear toward right shoulder; hold 8 seconds.',
          'Tilt head to left ear toward left shoulder; hold 8 seconds.'
        ],
        enabled: true,
      },
      {
        id: 'ex_03',
        title: 'Seated Ankle & Leg Strength',
        description: 'Active ankle pumps and knee extensions to boost blood circulation.',
        duration_minutes: 6,
        difficulty: 'easy',
        category: 'stretching',
        media_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600',
        steps: [
          'Lift right foot slightly and point toes up and down 10 times.',
          'Make 5 gentle circles clockwise and counter-clockwise with right foot.',
          'Repeat sequence with the left foot.',
          'Slowly straighten right knee, hold for 3 seconds, lower, and alternate.'
        ],
        enabled: true,
      },
      {
        id: 'ex_04',
        title: 'Standing Balance by Chair',
        description: 'Light balance maintenance with chair support for fall prevention.',
        duration_minutes: 7,
        difficulty: 'moderate',
        category: 'balance',
        media_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=600',
        steps: [
          'Stand behind chair holding the backrest firmly with both hands.',
          'Shift weight to left leg and gently lift right foot 2 inches off floor.',
          'Hold balance for 10 seconds while breathing calmly.',
          'Lower right foot and repeat with left leg 3 times each side.'
        ],
        enabled: true,
      },
      {
        id: 'ex_05',
        title: 'Chest Opener & Deep Breath',
        description: 'Open posture and expand lung capacity with rhythmic arm sweeps.',
        duration_minutes: 4,
        difficulty: 'gentle',
        category: 'mobility',
        media_url: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=600',
        steps: [
          'Sit tall with hands on your thighs.',
          'Inhale deeply and open your arms wide like giving a warm hug.',
          'Exhale and bring hands back to center over your heart.',
          'Repeat 5 times with calm soothing rhythm.'
        ],
        enabled: true,
      }
    ];

    const exercise_sessions: ExerciseSession[] = [];

    const xp_transactions: XpTransaction[] = [
      {
        id: 'xp_01',
        senior_id: seniorId,
        activity_type: 'wakeup',
        xp_amount: 50,
        description: 'Checked in awake at 7:12 AM',
        created_at: `${today}T07:12:00Z`,
      },
      {
        id: 'xp_02',
        senior_id: seniorId,
        activity_type: 'meal',
        xp_amount: 30,
        description: 'Confirmed breakfast enjoyed',
        created_at: `${today}T08:35:00Z`,
      },
      {
        id: 'xp_03',
        senior_id: seniorId,
        activity_type: 'medicine',
        xp_amount: 40,
        description: 'Confirmed Medicine #1 taken on time',
        created_at: `${today}T08:40:00Z`,
      },
      {
        id: 'xp_04',
        senior_id: seniorId,
        activity_type: 'breathing',
        xp_amount: 60,
        description: 'Completed 3-minute morning breathing routine',
        created_at: `${today}T08:50:00Z`,
      }
    ];

    const senior_progress: SeniorProgress[] = [
      {
        id: `prog_${seniorId}`,
        senior_id: seniorId,
        total_xp: 840,
        current_streak: 7,
        longest_streak: 14,
        last_completed_date: today,
        level: 3,
      }
    ];

    const rewards: Reward[] = [
      {
        id: 'rew_01',
        title: 'Dark Chocolate Treat 🍫',
        description: 'A special afternoon artisan chocolate treat curated with love.',
        xp_cost: 100,
        category: 'treat',
        icon: 'Sparkles',
        enabled: true,
      },
      {
        id: 'rew_02',
        title: 'Weekend Grandkids Video Call 📱',
        description: 'Dedicated 30-minute high-res video story call with the grandchildren.',
        xp_cost: 250,
        category: 'family',
        icon: 'Heart',
        enabled: true,
      },
      {
        id: 'rew_03',
        title: 'Botanical Garden Afternoon Outing 🌿',
        description: 'A relaxing weekend stroll through the local botanical conservatory.',
        xp_cost: 500,
        category: 'outing',
        icon: 'Sun',
        enabled: true,
      },
      {
        id: 'rew_04',
        title: 'Fresh Morning Bakery Pastry 🥐',
        description: 'Warm almond croissant & fresh decaf coffee delivered on Sunday.',
        xp_cost: 180,
        category: 'treat',
        icon: 'Coffee',
        enabled: true,
      }
    ];

    const reward_redemptions: RewardRedemption[] = [
      {
        id: 'red_01',
        senior_id: seniorId,
        reward_id: 'rew_01',
        reward_title: 'Dark Chocolate Treat 🍫',
        xp_spent: 100,
        status: 'fulfilled',
        redeemed_at: '2026-08-18T15:00:00Z',
        fulfilled_at: '2026-08-18T16:30:00Z',
      }
    ];

    const meal_schedules: MealSchedule[] = [
      {
        id: 'meal_sch_01',
        senior_id: seniorId,
        meal_type: 'breakfast',
        scheduled_time: '08:30',
        description: 'Warm oatmeal, blueberries, and herbal tea',
        enabled: true,
      },
      {
        id: 'meal_sch_02',
        senior_id: seniorId,
        meal_type: 'lunch',
        scheduled_time: '13:00',
        description: 'Steamed vegetable soup and whole grain toast',
        enabled: true,
      },
      {
        id: 'meal_sch_03',
        senior_id: seniorId,
        meal_type: 'dinner',
        scheduled_time: '19:30',
        description: 'Grilled salmon, roasted carrots, and quinoa',
        enabled: true,
      }
    ];

    const meal_logs: MealLog[] = [
      {
        id: `ml_${seniorId}_breakfast_${today}`,
        senior_id: seniorId,
        meal_type: 'breakfast',
        date: today,
        completed_at: `${today}T08:35:00Z`,
        status: 'completed',
      }
    ];

    const medicines: Medicine[] = [
      {
        id: 'med_01',
        senior_id: seniorId,
        medicine_number: 1,
        name: 'Breakfast Medicine (Morning Cardioprotect & Multi-Vitamin)',
        dosage_information: '10mg Tablet',
        instructions: 'Take 1 tablet with water immediately after breakfast.',
        quantity_remaining: 18,
        low_stock_threshold: 5,
        refill_unit: 'tablets',
        schedule_time: '08:30',
        enabled: true,
        created_at: '2026-01-10T08:00:00Z',
      },
      {
        id: 'med_02',
        senior_id: seniorId,
        medicine_number: 2,
        name: 'Lunch Medicine (Midday Calcium & Joint Vitality)',
        dosage_information: '500mg/400IU Chewable',
        instructions: 'Chew 1 tablet after lunch with plenty of water.',
        quantity_remaining: 24,
        low_stock_threshold: 7,
        refill_unit: 'tablets',
        schedule_time: '13:30',
        enabled: true,
        created_at: '2026-01-10T08:00:00Z',
      },
      {
        id: 'med_03',
        senior_id: seniorId,
        medicine_number: 3,
        name: 'Dinner Medicine (Night Neuro-Calm & Sleep Support)',
        dosage_information: '20mg Tablet',
        instructions: 'Take 1 tablet after dinner with a glass of water.',
        quantity_remaining: 12,
        low_stock_threshold: 6,
        refill_unit: 'tablets',
        schedule_time: '20:30',
        enabled: true,
        created_at: '2026-01-10T08:00:00Z',
      }
    ];

    const medicine_logs: MedicineLog[] = [
      {
        id: `medlog_01_${today}`,
        medicine_id: 'med_01',
        senior_id: seniorId,
        medicine_number: 1,
        medicine_name: 'Lisinopril (Blood Pressure)',
        date: today,
        scheduled_time: '08:30',
        taken_at: `${today}T08:40:00Z`,
        status: 'taken',
        notes: 'Confirmed by senior on screen with voice acknowledgment',
      }
    ];

    const refill_requests: RefillRequest[] = [
      {
        id: 'refill_01',
        medicine_id: 'med_03',
        senior_id: seniorId,
        medicine_name: 'Atorvastatin (Cholesterol / Heart)',
        quantity_remaining: 4,
        requested_at: `${today}T08:00:00Z`,
        status: 'requested',
        notes: 'Quantity is 4 tablets (below 6-tablet threshold). Refill request dispatched to guardian.',
      }
    ];

    const notifications: NotificationItem[] = [
      {
        id: 'notif_01',
        senior_id: seniorId,
        guardian_id: guardianId,
        channel: 'whatsapp',
        title: 'Mom is awake ☀️',
        message: 'Sunita checked in at 7:12 AM. Routine started smoothly with 7-day streak intact!',
        status: 'delivered',
        metadata: { time: '07:12 AM', streak: 7 },
        created_at: `${today}T07:12:15Z`,
      },
      {
        id: 'notif_02',
        senior_id: seniorId,
        guardian_id: guardianId,
        channel: 'push',
        title: 'Morning Meds Confirmed ✓',
        message: 'Sunita confirmed Medicine #1 (Lisinopril 10mg) taken at 8:40 AM.',
        status: 'delivered',
        metadata: { medicineNumber: 1 },
        created_at: `${today}T08:40:10Z`,
      },
      {
        id: 'notif_03',
        senior_id: seniorId,
        guardian_id: guardianId,
        channel: 'sms',
        title: 'Medicine #3 Running Low ⚠️',
        message: 'Atorvastatin has 4 doses remaining. Please review prescription refill.',
        status: 'delivered',
        metadata: { medicineId: 'med_03' },
        created_at: `${today}T08:00:00Z`,
      }
    ];

    const voice_calls: VoiceCallItem[] = [
      {
        id: 'call_01',
        senior_id: seniorId,
        call_type: 'wakeup',
        trigger_source: 'scheduler',
        status: 'completed',
        script_content: 'Good morning Sunita! It is 7:15 AM. The sun is up, and your morning routine is ready for you. Have a wonderful day!',
        duration_seconds: 45,
        initiated_at: `${today}T07:15:00Z`,
        completed_at: `${today}T07:15:45Z`,
      },
      {
        id: 'call_02',
        senior_id: seniorId,
        call_type: 'medicine_reminder',
        trigger_source: 'scheduler',
        status: 'completed',
        script_content: 'Hello Sunita! This is your gentle morning reminder to check Medicine Number 1 and take it with your breakfast.',
        duration_seconds: 38,
        initiated_at: `${today}T08:30:00Z`,
        completed_at: `${today}T08:30:38Z`,
      }
    ];

    const sos_events: SosEvent[] = [];

    const audit_logs: AuditLog[] = [
      {
        id: 'audit_01',
        actor_id: guardianUserId,
        actor_role: 'guardian',
        action: 'PROFILE_UPDATED',
        entity_type: 'senior',
        entity_id: seniorId,
        details: { fields: ['step_goal', 'breakfast_time'] },
        created_at: '2026-08-20T10:00:00Z',
      },
      {
        id: 'audit_02',
        actor_id: seniorUserId,
        actor_role: 'senior',
        action: 'WAKEUP_CHECKIN',
        entity_type: 'daily_routines',
        entity_id: `routine_${seniorId}_${today}`,
        details: { wake_time: '07:12 AM', xp_awarded: 50 },
        created_at: `${today}T07:12:00Z`,
      }
    ];

    return {
      users,
      seniors,
      guardians,
      senior_guardians,
      emergency_contacts,
      senior_preferences,
      daily_routines,
      daily_activity,
      wellness_sessions,
      exercise_library,
      exercise_sessions,
      xp_transactions,
      senior_progress,
      rewards,
      reward_redemptions,
      meal_schedules,
      meal_logs,
      medicines,
      medicine_logs,
      refill_requests,
      notifications,
      voice_calls,
      sos_events,
      audit_logs,
    };
  }

  // --- Helper Query & Mutation Methods ---

  public getSenior(id: string): Senior | undefined {
    return this.data.seniors.find(s => s.id === id);
  }

  public getSeniorByUserId(userId: string): Senior | undefined {
    return this.data.seniors.find(s => s.user_id === userId);
  }

  public getAllSeniors(): Senior[] {
    return this.data.seniors;
  }

  public createSenior(senior: Senior): Senior {
    this.data.seniors.push(senior);
    this.scheduleSave();
    return senior;
  }

  public updateSenior(id: string, updates: Partial<Senior>): Senior | null {
    const idx = this.data.seniors.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.seniors[idx] = { ...this.data.seniors[idx], ...updates, updated_at: new Date().toISOString() };
    this.scheduleSave();
    return this.data.seniors[idx];
  }

  public getDailyRoutine(seniorId: string, date: string): DailyRoutine {
    let routine = this.data.daily_routines.find(r => r.senior_id === seniorId && r.date === date);
    if (!routine) {
      routine = {
        id: `routine_${seniorId}_${date}`,
        senior_id: seniorId,
        date,
        wake_status: 'pending',
        walking_status: 'pending',
        breathing_status: 'unlocked',
        yoga_status: 'pending',
        breakfast_status: 'pending',
        breakfast_medicine_status: 'pending',
        lunch_status: 'pending',
        lunch_medicine_status: 'pending',
        nap_status: 'pending',
        dinner_status: 'pending',
        dinner_medicine_status: 'pending',
        medicine_status: 'pending',
        night_medicine_status: 'pending',
        xp_earned: 0,
        streak: this.getProgress(seniorId)?.current_streak || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.data.daily_routines.push(routine);
      this.scheduleSave();
    }
    return routine;
  }

  public updateDailyRoutine(id: string, updates: Partial<DailyRoutine>): DailyRoutine | null {
    const idx = this.data.daily_routines.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.daily_routines[idx] = { ...this.data.daily_routines[idx], ...updates, updated_at: new Date().toISOString() };
    this.scheduleSave();
    return this.data.daily_routines[idx];
  }

  public getDailyActivity(seniorId: string, date: string): DailyActivity {
    let act = this.data.daily_activity.find(a => a.senior_id === seniorId && a.date === date);
    if (!act) {
      const senior = this.getSenior(seniorId);
      act = {
        id: `act_${seniorId}_${date}`,
        senior_id: seniorId,
        date,
        steps: 0,
        distance_km: 0,
        step_goal: senior?.step_goal || 8000,
        last_updated: new Date().toISOString(),
      };
      this.data.daily_activity.push(act);
      this.scheduleSave();
    }
    return act;
  }

  public updateDailyActivity(seniorId: string, date: string, steps: number, distanceKm?: number): DailyActivity {
    const act = this.getDailyActivity(seniorId, date);
    act.steps = steps;
    act.distance_km = distanceKm ?? +(steps * 0.00067).toFixed(2);
    act.last_updated = new Date().toISOString();
    this.scheduleSave();
    return act;
  }

  public getProgress(seniorId: string): SeniorProgress {
    let prog = this.data.senior_progress.find(p => p.senior_id === seniorId);
    if (!prog) {
      prog = {
        id: `prog_${seniorId}`,
        senior_id: seniorId,
        total_xp: 0,
        current_streak: 1,
        longest_streak: 1,
        last_completed_date: this.getTodayStr(),
        level: 1,
      };
      this.data.senior_progress.push(prog);
      this.scheduleSave();
    }
    return prog;
  }

  public addXp(seniorId: string, activityType: XpTransaction['activity_type'], amount: number, description: string): SeniorProgress {
    const tx: XpTransaction = {
      id: `xp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senior_id: seniorId,
      activity_type: activityType,
      xp_amount: amount,
      description,
      created_at: new Date().toISOString(),
    };
    this.data.xp_transactions.unshift(tx);

    const prog = this.getProgress(seniorId);
    prog.total_xp += amount;
    prog.level = Math.floor(prog.total_xp / 300) + 1;
    this.scheduleSave();
    return prog;
  }

  public getMedicines(seniorId: string): Medicine[] {
    return this.data.medicines.filter(m => m.senior_id === seniorId);
  }

  public updateMedicine(id: string, updates: Partial<Medicine>): Medicine | null {
    const idx = this.data.medicines.findIndex(m => m.id === id);
    if (idx === -1) return null;
    this.data.medicines[idx] = { ...this.data.medicines[idx], ...updates };
    this.scheduleSave();
    return this.data.medicines[idx];
  }

  public getEmergencyContacts(seniorId: string): EmergencyContact[] {
    return this.data.emergency_contacts
      .filter(c => c.senior_id === seniorId)
      .sort((a, b) => a.priority_order - b.priority_order);
  }

  public addAuditLog(actorId: string, actorRole: string, action: string, entityType: string, entityId: string, details: Record<string, any> = {}) {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actor_id: actorId,
      actor_role: actorRole,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    this.scheduleSave();
    return log;
  }
}

export const db = new DatabaseEngine();
