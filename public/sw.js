const CACHE_NAME = 'session-tracker-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/assets/index.js',
  '/assets/index.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
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
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle offline support
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Network-first strategy for API requests and dynamic content
  if (request.url.includes('/api/') || request.method !== 'GET') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first strategy for static assets
  if (STATIC_ASSETS.some(asset => request.url.endsWith(asset))) {
    event.respondWith(
      caches.match(request)
        .then((response) => response || fetch(request))
    );
    return;
  }

  // Stale-while-revalidate for everything else
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            // Cache the new response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseToCache));
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
  );
});