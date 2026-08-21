import { db } from '../db.js';
import { NotificationItem } from '../types.js';

export interface SendNotificationOptions {
  seniorId: string;
  guardianId?: string;
  channel: 'push' | 'whatsapp' | 'sms' | 'in_app';
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  private static apiKey = process.env.NOTIFICATION_API_KEY;

  public static async send(options: SendNotificationOptions): Promise<NotificationItem> {
    const isLiveConfigured = !!this.apiKey && this.apiKey !== 'notif_service_live_token_demo';

    const item: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senior_id: options.seniorId,
      guardian_id: options.guardianId,
      channel: options.channel,
      title: options.title,
      message: options.message,
      status: isLiveConfigured ? 'delivered' : 'simulated',
      metadata: options.metadata || {},
      created_at: new Date().toISOString(),
    };

    db.getRaw().notifications.unshift(item);
    db.scheduleSave();

    // Log delivery
    console.log(`[NotificationService][${item.channel.toUpperCase()}] To Guardian/Senior: "${item.title}" - ${item.message} (${item.status})`);

    return item;
  }

  public static async broadcastToGuardians(seniorId: string, title: string, message: string, metadata?: Record<string, any>): Promise<NotificationItem[]> {
    const guardians = db.getRaw().guardians;
    const seniorGuardians = db.getRaw().senior_guardians.filter(sg => sg.senior_id === seniorId);

    const relevantGuardians = guardians.filter(g => 
      seniorGuardians.some(sg => sg.guardian_id === g.id) || g.is_primary
    );

    const results: NotificationItem[] = [];

    for (const guardian of relevantGuardians) {
      if (guardian.notify_whatsapp) {
        results.push(await this.send({
          seniorId,
          guardianId: guardian.id,
          channel: 'whatsapp',
          title,
          message,
          metadata,
        }));
      }
      if (guardian.notify_push) {
        results.push(await this.send({
          seniorId,
          guardianId: guardian.id,
          channel: 'push',
          title,
          message,
          metadata,
        }));
      }
      if (guardian.notify_sms) {
        results.push(await this.send({
          seniorId,
          guardianId: guardian.id,
          channel: 'sms',
          title,
          message,
          metadata,
        }));
      }
    }

    return results;
  }

  public static getNotifications(seniorId: string): NotificationItem[] {
    return db.getRaw().notifications.filter(n => n.senior_id === seniorId);
  }
}
