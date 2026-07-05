const CACHE_NAME = 'advocode-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  
  const isExternalCacheable = (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('ui-avatars.com') ||
    url.hostname.includes('i.ibb.co') ||
    url.hostname.includes('ibb.co')
  );

  const isStaticAsset = (isSameOrigin && (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.json')
  )) || isExternalCacheable;

  // Stale-While-Revalidate for static assets, avatars & fonts for instant offline loading
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Network-First for HTML navigation and dynamic requests with SPA fallback to /index.html
  if (isSameOrigin) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/index.html').then(html => html || caches.match('/'));
            }
            return new Response('Offline Mode Active — Data cached locally', { status: 503, statusText: 'Service Unavailable' });
          });
        })
    );
  }
});

self.addEventListener('push', (event) => {
  let data = { title: '</AdvocoDe> Notification', body: 'New broadcast received!', icon: '/logo.svg' };
  try {
    if (event.data) {
      data = Object.assign(data, event.data.json());
    }
  } catch (e) {}

  const options = {
    body: data.body,
    icon: data.icon || '/logo.svg',
    badge: '/logo.svg',
    vibrate: [100, 50, 100],
    data: { url: self.location.origin }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
