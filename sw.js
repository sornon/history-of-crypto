/* UTF-8 */
const CACHE_NAME = 'crypto-mobile-shell-v20250823';
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./chapters.json",
  "./chapters/第一编_第1章_密码学奠基.html",
  "./chapters/第一编_第2章_赛博空间的政治.html",
  "./chapters/第一编_第3章_电子现金先驱.html",
  "./chapters/第一编_第4章_未竟之业.html"
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k === CACHE_NAME ? null : caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(resp => resp || fetch(event.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return r;
      }))
    );
  }
});
