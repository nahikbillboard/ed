// Sath AI Production Service Worker for Mobile Notifications & Offline Support
const CACHE_NAME = 'sath-companion-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for direct push/show notification messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});

// Handle Notification Actions (e.g. when user taps "✓ Tick Done" on mobile notification)
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // For actionable ticks, don't necessarily close permanent tracker, or re-show updated
  if (action === 'tick_done' || action === 'complete') {
    event.waitUntil(
      (async () => {
        const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        
        let clientFound = false;
        for (const client of allClients) {
          client.postMessage({
            type: 'NOTIFICATION_TASK_TICKED',
            taskId: data.taskId || data.taskType || 'next_task',
            taskType: data.taskType || data.taskId || 'next_task',
            timestamp: Date.now(),
          });
          clientFound = true;
          if ('focus' in client) {
            client.focus();
          }
        }

        if (!clientFound && self.clients.openWindow) {
          await self.clients.openWindow('/?action=task_ticked&task=' + (data.taskType || 'routine'));
        }
      })()
    );
  } else {
    // Regular tap on notification body opens or focuses app
    notification.close();
    event.waitUntil(
      (async () => {
        const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of allClients) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })()
    );
  }
});

