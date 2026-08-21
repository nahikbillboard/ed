export interface Senior {
  id: string;
  user_id: string;
  name: string;
  age: number;
  guardian_name: string;
  guardian_phone: string;
  preferred_language: string;
  wake_time: string;
  breakfast_time: string;
  lunch_time: string;
  dinner_time: string;
  night_medicine_time: string;
  step_goal: number;
  avatar_url?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface Guardian {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  is_primary: boolean;
  notify_sms: boolean;
  notify_whatsapp: boolean;
  notify_push: boolean;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  senior_id: string;
  name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
  priority_order: number;
  created_at: string;
}

export interface SeniorPreferences {
  id: string;
  senior_id: string;
  voice_gender: 'female' | 'male';
  voice_speed: 'slow' | 'normal';
  large_text_mode: boolean;
  high_contrast: boolean;
  auto_speak_prompts: boolean;
  sound_alerts: boolean;
}

export interface DailyRoutine {
  id: string;
  senior_id: string;
  date: string;
  wake_status: 'completed' | 'pending' | 'missed';
  wake_time?: string;
  walking_status: 'completed' | 'in_progress' | 'pending';
  breathing_status: 'completed' | 'unlocked' | 'locked';
  yoga_status: 'completed' | 'in_progress' | 'pending';
  breakfast_status: 'completed' | 'pending' | 'missed';
  breakfast_medicine_status?: 'completed' | 'pending' | 'missed';
  lunch_status: 'completed' | 'pending' | 'missed';
  lunch_medicine_status?: 'completed' | 'pending' | 'missed';
  nap_status?: 'completed' | 'pending' | 'missed';
  dinner_status: 'completed' | 'pending' | 'missed';
  dinner_medicine_status?: 'completed' | 'pending' | 'missed';
  medicine_status: 'completed' | 'pending' | 'missed';
  night_medicine_status: 'completed' | 'pending' | 'missed';
  xp_earned: number;
  streak: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyActivity {
  id: string;
  senior_id: string;
  date: string;
  steps: number;
  distance_km: number;
  step_goal: number;
  last_updated: string;
}

export interface ExerciseLibraryItem {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  difficulty: 'gentle' | 'easy' | 'moderate';
  category: 'chair_yoga' | 'stretching' | 'balance' | 'mobility';
  media_url?: string;
  steps: string[];
  enabled: boolean;
}

export interface SeniorProgress {
  id: string;
  senior_id: string;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string;
  level: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  xp_cost: number;
  category: 'treat' | 'family' | 'outing' | 'wellness';
  icon: string;
  enabled: boolean;
}

export interface RewardRedemption {
  id: string;
  senior_id: string;
  reward_id: string;
  reward_title: string;
  xp_spent: number;
  status: 'pending' | 'fulfilled' | 'celebrated';
  redeemed_at: string;
  fulfilled_at?: string;
}

export interface Medicine {
  id: string;
  senior_id: string;
  medicine_number: number;
  name: string;
  dosage_information: string;
  instructions: string;
  quantity_remaining: number;
  low_stock_threshold: number;
  refill_unit: string;
  schedule_time: string;
  enabled: boolean;
  created_at: string;
}

export interface MedicineLog {
  id: string;
  medicine_id: string;
  senior_id: string;
  medicine_number: number;
  medicine_name: string;
  date: string;
  scheduled_time: string;
  taken_at?: string;
  status: 'taken' | 'snoozed' | 'pending' | 'missed';
  notes?: string;
}

export interface NotificationItem {
  id: string;
  senior_id: string;
  guardian_id?: string;
  channel: 'push' | 'whatsapp' | 'sms' | 'in_app';
  title: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'simulated';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface VoiceCallItem {
  id: string;
  senior_id: string;
  call_type: 'wakeup' | 'meal_reminder' | 'medicine_reminder' | 'sos' | 'wellness_check' | 'companion_chat';
  trigger_source: 'scheduler' | 'manual' | 'sos' | 'senior_request';
  status: 'completed' | 'scheduled' | 'failed' | 'in_progress' | 'simulated';
  script_content: string;
  audio_url?: string;
  duration_seconds: number;
  initiated_at: string;
  completed_at?: string;
}

export interface SosEvent {
  id: string;
  senior_id: string;
  contact_id?: string;
  contact_name: string;
  contact_phone: string;
  triggered_at: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  status: 'active' | 'resolved' | 'false_alarm';
  call_status: 'completed' | 'in_progress' | 'simulated' | 'failed';
  notification_status: 'delivered' | 'sent' | 'simulated';
  resolved_at?: string;
  resolved_by?: string;
}

export interface TodayBundle {
  senior: Senior;
  routine: DailyRoutine;
  activity: DailyActivity;
  progress: SeniorProgress;
  medicines: Medicine[];
  exercises: ExerciseLibraryItem[];
  rewards: Reward[];
  emergencyContacts: EmergencyContact[];
  preferences?: SeniorPreferences;
  recentNotifications: NotificationItem[];
}
