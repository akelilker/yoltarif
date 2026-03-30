const VERSION = 'km-v15';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo-header2.svg',
  './favicon.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './medisa-magaza.png',
  './google-maps.png',
  './yandex.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    const safe = PRECACHE.filter(u => typeof u === 'string' && !u.startsWith('data:') && !u.startsWith('file:'));
    try {
      await cache.addAll(safe);
    } catch (e) {
      // fallback: add one by one to skip failing entries
      for (const u of safe) {
        try { await cache.add(u); } catch (err) {}
      }
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const res = await fetch(event.request);
      // cache same-origin GET only
      if (event.request.method === 'GET') {
        const reqURL = new URL(event.request.url);
        if (reqURL.origin === self.location.origin) {
          const cache = await caches.open(VERSION);
          cache.put(event.request, res.clone());
        }
      }
      return res;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});
