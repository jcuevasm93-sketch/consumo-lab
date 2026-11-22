const CACHE_NAME = 'consumo-lab-v11';
const ARCHIVOS_LOCALES = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png'
];
const LIBRERIAS_EXTERNAS = [
  'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await cache.addAll(ARCHIVOS_LOCALES);
      await Promise.allSettled(
        LIBRERIAS_EXTERNAS.map(url => cache.add(url))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(llaves =>
      Promise.all(
        llaves.filter(llave => llave !== CACHE_NAME).map(llave => caches.delete(llave))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(respuestaCache => {
      return respuestaCache || fetch(event.request).then(respuestaRed => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, respuestaRed.clone());
          return respuestaRed;
        });
      });
    }).catch(() => caches.match('./index.html'))
  );
});
