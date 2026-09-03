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
            const taskType = event.data.taskType;
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
   * Get current native notification permission status
   */
  public static getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Request native notification permission
   */
  public static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        playChime('ding');
      }
      return permission;
    } catch (e) {
      console.warn('Error requesting permission:', e);
      return 'denied';
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
                title: '✓ Tick Done (पूरा हुआ)',
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
      
      // Update task in database & client
      await ApiClient.completeRoutineTask(activeSeniorId, taskType as any, `Completed ${taskType}`);

      playChime('success');
      this.emitNotification(null);

      // Notify all task completed listeners (updates App state)
      this.taskCompletedListeners.forEach((fn) => fn(taskType));

      return true;
    } catch (err) {
      console.error('[NotificationManager] Error completing task from notification:', err);
      return false;
    }
  }
}
