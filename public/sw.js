// ONLINE BAR OS: PWA SERVICE WORKER
// Basic caching protocol for stable offline discovery.

const CACHE_NAME = 'ob-os-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/favicon.svg',
  '/placeholder.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
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
