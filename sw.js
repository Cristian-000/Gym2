const CACHE_NAME = 'rutina-gym-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data.json',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalación del Service Worker y almacenamiento en caché inicial
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Abriendo caché');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar peticiones (Fetch) para servir desde caché si no hay red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve el recurso cacheado si existe, si no, lo busca en la red
        return response || fetch(event.request);
      })
  );
});

// Activación y limpieza de cachés antiguos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
