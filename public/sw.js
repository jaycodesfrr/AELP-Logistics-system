// Antarctica Expedition & Logistics Platform (AELP) Service Worker
const CACHE_NAME = 'aelp-station-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/tactical.css',
    '/js/app.js',
    '/js/map.js',
    '/js/cargo.js',
    '/js/inventory.js',
    '/js/personnel.js',
    '/js/emergency.js',
    '/js/sync.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((res) => res || fetch(e.request))
    );
});
