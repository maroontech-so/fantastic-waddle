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

export const ensureNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'default') {
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch (e) {
      console.warn("Auto-permission request failed:", e);
    }
  }
  return false;
};

export const sendPushNotification = (title: string, optionsOrBody?: string | { body?: string; icon?: string }, iconArg: string = '/logo.svg') => {
  if (!('Notification' in window)) return;
  
  let body = typeof optionsOrBody === 'string' ? optionsOrBody : optionsOrBody?.body;
  let icon = typeof optionsOrBody === 'object' && optionsOrBody.icon ? optionsOrBody.icon : iconArg;

  const deliverNotification = () => {
    try {
      const uniqueTag = `advocode-msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body,
            icon: icon || '/logo.svg',
            badge: '/logo.svg',
            vibrate: [200, 100, 200],
            tag: uniqueTag,
            renotify: true,
            data: { url: window.location.origin }
          } as any);
        }).catch(() => {
          try { new Notification(title, { body, icon: icon || '/logo.svg', tag: uniqueTag }); } catch (e) {}
        });
      } else {
        try { new Notification(title, { body, icon: icon || '/logo.svg', tag: uniqueTag }); } catch (e) {}
      }
    } catch (e) {
      console.warn("Push notification delivery error:", e);
    }
  };

  if (Notification.permission === 'granted') {
    deliverNotification();
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        deliverNotification();
      }
    }).catch(() => {});
  }
};
