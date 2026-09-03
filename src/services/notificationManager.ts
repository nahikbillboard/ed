import { TodayBundle, Medicine, DailyRoutine } from '../types';
import { ApiClient } from './apiClient';
import { playChime, speakText } from '../utils/audioSpeech';

export interface ActiveInAppNotification {
  id: string;
  title: string;
  titleHi: string;
  message: string;
  messageHi: string;
  taskType: string;
  icon: string;
  time: string;
  xp: number;
  timestamp: number;
}

type NotificationListener = (notif: ActiveInAppNotification | null) => void;
type TaskCompletedListener = (taskType: string) => void;

const FIRST_TIME_STORAGE_KEY = 'sath_notification_permission_prompted_v3';

export class NotificationManager {
  private static swRegistration: ServiceWorkerRegistration | null = null;
  private static listeners: Set<NotificationListener> = new Set();
  private static taskCompletedListeners: Set<TaskCompletedListener> = new Set();
  private static currentInAppNotification: ActiveInAppNotification | null = null;
  private static isInitialized = false;

  /**
   * Initializes Service Worker for native Web Notifications & background handlers
   */
  public static async init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        this.swRegistration = reg;
        console.log('[NotificationManager] Service Worker registered:', reg);

        // Listen for message from service worker (e.g. user tapped "✓ Tick Done" on phone lockscreen)
        navigator.serviceWorker.addEventListener('message', async (event) => {
          if (event.data && event.data.type === 'NOTIFICATION_TASK_TICKED') {
            const taskType = event.data.taskType || event.data.taskId;
            if (taskType) {
              await this.completeTask(taskType);
            }
          }
        });
      } catch (err) {
        console.warn('[NotificationManager] Service worker registration error:', err);
      }
    }
  }

  /**
   * Check if this is the first time the app is opened
   */
  public static isFirstTimePromptPending(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const alreadyPrompted = localStorage.getItem(FIRST_TIME_STORAGE_KEY);
      return alreadyPrompted !== 'true';
    } catch {
      return false;
    }
  }

  /**
   * Mark first time prompt as completed
   */
  public static markFirstTimePromptDone() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(FIRST_TIME_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  }

  /**
   * Get current native notification permission status
   */
  public static getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Request native notification permission and auto-push permanent tracker if granted
   */
  public static async requestPermission(bundle?: TodayBundle | null, language: 'en' | 'hi' = 'hi'): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      this.markFirstTimePromptDone();
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        playChime('ding');
        // Instantly push permanent ongoing notification
        await this.updatePermanentNotification(bundle || ApiClient.getLocalBundle(), language);
      }
      return permission;
    } catch (e) {
      console.warn('Error requesting permission:', e);
      return 'denied';
    }
  }

  /**
   * Updates or pushes a Permanent / Ongoing notification in the Android status bar
   */
  public static async updatePermanentNotification(bundle: TodayBundle | null, language: 'en' | 'hi' = 'hi') {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const currentBundle = bundle || ApiClient.getLocalBundle();
      const routine = currentBundle?.routine;
      const steps = currentBundle?.activity?.steps || 3420;

      let nextTaskTitle = 'All Morning Tasks Done!';
      let nextTaskTitleHi = 'सभी कार्य पूरे हुए!';
      let nextTaskType = 'hydration';

      if (routine) {
        if (routine.breakfast_medicine_status !== 'completed') {
          nextTaskTitle = 'Morning Medicine (Cardioprotect)';
          nextTaskTitleHi = 'सुबह की दवाई (Cardioprotect)';
          nextTaskType = 'breakfast_medicine';
        } else if (routine.walking_status !== 'completed') {
          nextTaskTitle = 'Morning Walk & Steps';
          nextTaskTitleHi = 'सुबह की ताज़ा सैर व कदम';
          nextTaskType = 'walk';
        } else if (routine.yoga_status !== 'completed') {
          nextTaskTitle = 'Gentle Chair Yoga';
          nextTaskTitleHi = 'सुगम कुर्सी योग';
          nextTaskType = 'yoga';
        } else if (routine.lunch_status !== 'completed') {
          nextTaskTitle = 'Midday Healthy Lunch';
          nextTaskTitleHi = 'दोपहर का पौष्टिक भोजन';
          nextTaskType = 'lunch';
        } else if (routine.night_medicine_status !== 'completed') {
          nextTaskTitle = 'Night Medicine';
          nextTaskTitleHi = 'रात की दवाई';
          nextTaskType = 'night_medicine';
        }
      }

      // Count completed tasks
      let completedCount = 0;
      const totalCount = 6;
      if (routine) {
        if (routine.wake_status === 'completed') completedCount++;
        if (routine.breakfast_medicine_status === 'completed') completedCount++;
        if (routine.walking_status === 'completed') completedCount++;
        if (routine.yoga_status === 'completed') completedCount++;
        if (routine.lunch_status === 'completed') completedCount++;
        if (routine.night_medicine_status === 'completed') completedCount++;
      }

      const title = language === 'hi'
        ? `🌟 Sath: ${nextTaskTitleHi}`
        : `🌟 Sath Companion: ${nextTaskTitle}`;

      const body = language === 'hi'
        ? `🚶 कदम: ${steps.toLocaleString()} • प्रोग्रेस: ${completedCount}/${totalCount} पूर्ण • टैप करें ✓ पूरा करने के लिए`
        : `🚶 Steps: ${steps.toLocaleString()} • Progress: ${completedCount}/${totalCount} Done • Tap below to tick done`;

      if (this.swRegistration && 'showNotification' in this.swRegistration) {
        await this.swRegistration.showNotification(title, {
          body,
          tag: 'sath-permanent-tracker',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ongoing: true,
          requireInteraction: true,
          silent: true,
          renotify: false,
          data: {
            taskType: nextTaskType,
            taskId: nextTaskType,
            isPermanent: true,
          },
          actions: [
            {
              action: 'tick_done',
              title: language === 'hi' ? '✓ पूरा हुआ (Tick Done)' : '✓ Tick Current Task',
            },
            {
              action: 'open_app',
              title: '📱 Open Sath',
            },
          ],
        } as any);
      } else {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'sath-permanent-tracker',
          requireInteraction: true,
        });
      }
    } catch (err) {
      console.warn('[NotificationManager] Permanent notification update suppressed:', err);
    }
  }

  /**
   * Subscribe to in-app heads-up notification events
   */
  public static subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    listener(this.currentInAppNotification);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Subscribe to task completed from notification
   */
  public static onTaskCompleted(listener: TaskCompletedListener): () => void {
    this.taskCompletedListeners.add(listener);
    return () => {
      this.taskCompletedListeners.delete(listener);
    };
  }

  private static emitNotification(notif: ActiveInAppNotification | null) {
    this.currentInAppNotification = notif;
    this.listeners.forEach((fn) => fn(notif));
  }

  /**
   * Triggers a live task notification (Native Push + In-App Heads-Up Banner + Sound + Vibration)
   */
  public static async triggerTaskNotification(params: {
    taskType: string;
    title: string;
    titleHi: string;
    message: string;
    messageHi: string;
    icon?: string;
    time?: string;
    xp?: number;
    speakAlert?: boolean;
    language?: 'en' | 'hi';
  }) {
    const {
      taskType,
      title,
      titleHi,
      message,
      messageHi,
      icon = '🔔',
      time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      xp = 40,
      speakAlert = true,
      language = 'hi',
    } = params;

    // 1. Play alert chime & vibrate phone (200ms - 100ms - 200ms)
    playChime('alert');
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 300]);
      } catch (e) {
        // ignore
      }
    }

    // 2. Multilingual Voice prompt
    if (speakAlert) {
      if (language === 'hi') {
        speakText(`ध्यान दें: ${titleHi} का समय हो गया है। कृपया कार्य पूरा करें।`, 0.9, 1.0, 'hi');
      } else {
        speakText(`Reminder: It is time for ${title}. Please complete your task.`, 0.9, 1.0, 'en');
      }
    }

    // 3. Emit In-App Heads-Up Notification Banner
    const notifItem: ActiveInAppNotification = {
      id: `notif_${Date.now()}`,
      title,
      titleHi,
      message,
      messageHi,
      taskType,
      icon,
      time,
      xp,
      timestamp: Date.now(),
    };
    this.emitNotification(notifItem);

    // 4. Trigger Native Mobile System Notification via Service Worker (supports Android lockscreen action buttons)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const displayTitle = language === 'hi' ? `🔔 Sath: ${titleHi}` : `🔔 Sath: ${title}`;
      const displayBody = language === 'hi' ? `${time} • ${messageHi} • +${xp} XP` : `${time} • ${message} • +${xp} XP`;

      try {
        if (this.swRegistration && 'showNotification' in this.swRegistration) {
          await this.swRegistration.showNotification(displayTitle, {
            body: displayBody,
            tag: `sath-task-${taskType}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            requireInteraction: true,
            vibrate: [200, 100, 200],
            data: {
              taskType,
              taskId: taskType,
            },
            actions: [
              {
                action: 'tick_done',
                title: language === 'hi' ? '✓ पूरा हुआ (Tick Done)' : '✓ Tick Done',
              },
              {
                action: 'open_app',
                title: '📱 Open App',
              },
            ],
          } as any);
        } else {
          new Notification(displayTitle, {
            body: displayBody,
            icon: '/favicon.ico',
            tag: `sath-task-${taskType}`,
            requireInteraction: true,
          });
        }
      } catch (err) {
        console.warn('[NotificationManager] Native notification suppressed:', err);
      }
    }
  }

  /**
   * Dismiss active in-app notification
   */
  public static dismissCurrent() {
    this.emitNotification(null);
  }

  /**
   * Complete task directly from notification tick
   */
  public static async completeTask(taskType: string, seniorId?: string): Promise<boolean> {
    try {
      const activeSeniorId = seniorId || ApiClient.getLocalBundle()?.senior?.id || 'senior_eleanor_01';
      const bundle = ApiClient.getLocalBundle();

      let targetTask = taskType;
      if (taskType === 'next_task' && bundle) {
        const routine = bundle.routine;
        if (routine?.breakfast_medicine_status !== 'completed') {
          targetTask = 'breakfast_medicine';
        } else if (routine?.walking_status !== 'completed') {
          targetTask = 'walk';
        } else if (routine?.yoga_status !== 'completed') {
          targetTask = 'yoga';
        } else if (routine?.lunch_status !== 'completed') {
          targetTask = 'lunch';
        } else if (routine?.night_medicine_status !== 'completed') {
          targetTask = 'night_medicine';
        } else {
          targetTask = 'breakfast_medicine';
        }
      }

      // Update task in database & client
      await ApiClient.completeRoutineTask(activeSeniorId, targetTask as any, `Completed ${targetTask}`);

      playChime('success');
      this.emitNotification(null);

      // Refresh permanent status bar notification
      const updatedBundle = ApiClient.getLocalBundle();
      await this.updatePermanentNotification(updatedBundle);

      // Notify all task completed listeners (updates App state)
      this.taskCompletedListeners.forEach((fn) => fn(targetTask));

      return true;
    } catch (err) {
      console.error('[NotificationManager] Error completing task from notification:', err);
      return false;
    }
  }
}

