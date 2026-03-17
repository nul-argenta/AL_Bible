/**
 * Armor & Light — Service Worker
 * Provides offline caching for the PWA so QR drop pages and the reader
 * work even without an internet connection after the first visit.
 */

const CACHE_NAME = "armor-light-v1";

// Core shell assets to cache on install
const PRECACHE_URLS = [
    "/",
    "/manifest.json",
    "/icon-512.png",
];

// Install: pre-cache the app shell
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: network-first for API calls, cache-first for static assets
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and cross-origin requests
    if (request.method !== "GET" || url.origin !== self.location.origin) return;

    // API calls: always go to network (don't cache dynamic data)
    if (url.pathname.startsWith("/api/")) return;

    // Static assets & pages: stale-while-revalidate
    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cached = await cache.match(request);
            const fetchPromise = fetch(request)
                .then((response) => {
                    // Only cache successful responses
                    if (response.ok) {
                        cache.put(request, response.clone());
                    }
                    return response;
                })
                .catch(() => {
                    // Network failed — return cached version or offline fallback
                    return cached;
                });

            // Return cached version immediately, update in background
            return cached || fetchPromise;
        })
    );
});
