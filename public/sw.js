// ONLINE BAR OS: PWA SERVICE WORKER v2
// High-fidelity caching and home-screen widget orchestration.

const CACHE_NAME = 'ob-os-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/favicon.svg',
  '/placeholder.jpg',
  '/widgets/mobile-node.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

/**
 * 🛰️ WIDGET ORCHESTRATION
 * Handling home screen node events for Android/Windows terminals.
 */

self.addEventListener('widgetinstall', (event) => {
  console.log('[OB_OS] Widget Installed:', event.widget.tag);
  event.waitUntil(updateWidget(event.widget));
});

self.addEventListener('widgetresume', (event) => {
  console.log('[OB_OS] Widget Resumed:', event.widget.tag);
  event.waitUntil(updateWidget(event.widget));
});

self.addEventListener('widgetclick', (event) => {
  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow(event.data.deep_link || '/shop'));
  }
});

async function updateWidget(widget) {
  try {
    const response = await fetch('/api/mobile/widget-config');
    const data = await response.json();

    // Sync with PWA Widget Template
    await self.widgets.updateByTag(widget.tag, {
      template: '/widgets/mobile-node.json',
      data: data
    });
  } catch (err) {
    console.error('[OB_OS] Widget Sync Failure:', err);
  }
}
