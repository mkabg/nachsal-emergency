declare const clients: Clients;

// Explicitly declare the service worker global scope.
declare let self: ServiceWorkerGlobalScope;

self.addEventListener('push', (event: PushEvent) => {
  console.log('[Service Worker] Push Received.');

  let notificationData = {
    title: 'New Alert',
    body: 'Something important has happened!',
    icon: '/IDF.png',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title,
        body: data.body,
        icon: '/IDF.png',
        data: { url: data.data?.url || '/' },
      };
    } catch (e) {
      console.error('[Service Worker] Error parsing push data:', e);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    data: notificationData.data,
    badge: '/IDF.png',
  };

  const notificationPromise = self.registration.showNotification(notificationData.title, options);
  event.waitUntil(notificationPromise);
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  }).then((clientList) => {
    for (const client of clientList) {
      if (client.url === urlToOpen && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});

self.addEventListener('notificationclose', (event: NotificationEvent) => {
  console.log('[Service Worker] Notification closed:', event.notification.title);
  // You could send this to an analytics service or log it more persistently
});
