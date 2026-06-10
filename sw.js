const CACHE = 'trainlog-v5';
const ASSETS = [
  './', './index.html', './manifest.json',
  './css/style.css',
  './js/data.js', './js/timer.js', './js/session.js',
  './js/history.js', './js/export.js', './js/app.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('fonts.g')) {
    e.respondWith(caches.open(CACHE).then(c =>
      fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }).catch(() => caches.match(e.request))
    ));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        return r;
      });
    })
  );
});
