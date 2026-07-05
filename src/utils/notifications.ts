// Web Push Notification Helper for </AdvocoDe> PWA

export const requestPushPermissions = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn("Browser does not support desktop notifications");
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.warn("Error requesting notification permission:", err);
    }
  }
  return false;
};

export const requestNotificationPermission = requestPushPermissions;

export const sendPushNotification = (title: string, optionsOrBody?: string | { body?: string; icon?: string }, iconArg: string = '/logo.svg') => {
  if (!('Notification' in window)) return;
  
  let body = typeof optionsOrBody === 'string' ? optionsOrBody : optionsOrBody?.body;
  let icon = typeof optionsOrBody === 'object' && optionsOrBody.icon ? optionsOrBody.icon : iconArg;

  if (Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body,
            icon,
            badge: icon,
            vibrate: [200, 100, 200],
            tag: 'advocode-notification',
            renotify: true
          } as any);
        }).catch(() => {
          new Notification(title, { body, icon, tag: 'advocode-notification' });
        });
      } else {
        new Notification(title, { body, icon, tag: 'advocode-notification' });
      }
    } catch (e) {
      console.warn("Push notification delivery error:", e);
    }
  }
};
