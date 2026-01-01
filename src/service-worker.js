// Simple service worker for offline caching (development-friendly)
// Bump CACHE_NAME on updates so clients will install a fresh service worker and refresh cached assets
const CACHE_NAME = 'krause-cache-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    // include cache-busted bundle reference to ensure the updated script is cached
    '/krause.app.js?v=1.1',
    '/api-integration.js',
    '/styles/app.css',
    '/styles/acrylic.css',
    '/favicon.ico'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                // Optionally cache new requests
                return response;
            }).catch(() => {
                // Fallback to index.html for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
