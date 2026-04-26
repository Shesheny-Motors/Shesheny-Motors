// sw.js - Service Worker for aggressive image caching
const CACHE_NAME = 'shesheny-storage-cache-v1';
// Regex to match Supabase storage URLs (or mock googleusercontent URLs used in the mock data)
const STORAGE_REGEX = /(supabase\.co\/storage\/v1\/object\/public|lh3\.googleusercontent\.com)/;

self.addEventListener('install', (event) => {
    self.skipWaiting();
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
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (STORAGE_REGEX.test(event.request.url) && event.request.method === 'GET') {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                }).catch(() => {
                    // Fallback image could be returned here if needed
                    console.error('Fetch failed for', event.request.url);
                });
            })
        );
    }
});
