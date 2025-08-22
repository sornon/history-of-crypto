
self.addEventListener('install', (evt) => {
  self.skipWaiting();
  evt.waitUntil(caches.open('book-v1').then(cache => cache.addAll([
    './', './index.html', './chapters.json', './manifest.webmanifest'
  ])));
});
self.addEventListener('activate', (evt) => {
  evt.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (evt) => {
  const url = new URL(evt.request.url);
  // Cache-first for static and chapters
  if (url.pathname.includes('/chapters/') || url.pathname.endsWith('.html') || url.pathname.endsWith('.json') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    evt.respondWith(caches.match(evt.request).then(resp => {
      return resp || fetch(evt.request).then(network => {
        const copy = network.clone();
        caches.open('book-v1').then(cache => cache.put(evt.request, copy));
        return network;
      }).catch(() => resp);
    }));
  }
});
