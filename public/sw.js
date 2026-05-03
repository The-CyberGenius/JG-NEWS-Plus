// JG News Plus — Service Worker
// Strategy:
//  - HTML: network-first with offline fallback
//  - Static assets (JS/CSS/fonts): stale-while-revalidate
//  - Images: cache-first with size limit
//  - API: network-first with short cache fallback

const VERSION = 'jgnews-v1';
const CACHE_STATIC = `${VERSION}-static`;
const CACHE_RUNTIME = `${VERSION}-runtime`;
const CACHE_IMAGES = `${VERSION}-images`;

const PRECACHE_URLS = [
    '/',
    '/manifest.webmanifest',
    '/favicon.png',
    '/logo.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_STATIC).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => null))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

const limitCache = async (cacheName, max) => {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > max) {
        for (let i = 0; i < keys.length - max; i++) {
            await cache.delete(keys[i]);
        }
    }
};

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Don't cache cross-origin admin requests or analytics pings
    if (url.pathname.startsWith('/api/articles/') && url.pathname.endsWith('/view')) return;
    if (url.pathname.startsWith('/admin')) return;

    // Images: cache-first
    if (request.destination === 'image' || /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(url.pathname)) {
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ||
                    fetch(request).then((res) => {
                        if (res && res.ok) {
                            const clone = res.clone();
                            caches.open(CACHE_IMAGES).then((cache) => {
                                cache.put(request, clone);
                                limitCache(CACHE_IMAGES, 60);
                            });
                        }
                        return res;
                    }).catch(() => cached)
            )
        );
        return;
    }

    // API: network-first with cache fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((res) => {
                    if (res && res.ok) {
                        const clone = res.clone();
                        caches.open(CACHE_RUNTIME).then((cache) => cache.put(request, clone));
                    }
                    return res;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // HTML navigation: network-first, fallback to cached root
    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then((res) => {
                    const clone = res.clone();
                    caches.open(CACHE_RUNTIME).then((cache) => cache.put(request, clone));
                    return res;
                })
                .catch(() => caches.match(request).then((c) => c || caches.match('/')))
        );
        return;
    }

    // Static assets: stale-while-revalidate
    event.respondWith(
        caches.match(request).then((cached) => {
            const fetchPromise = fetch(request)
                .then((res) => {
                    if (res && res.ok) {
                        const clone = res.clone();
                        caches.open(CACHE_RUNTIME).then((cache) => cache.put(request, clone));
                    }
                    return res;
                })
                .catch(() => cached);
            return cached || fetchPromise;
        })
    );
});
