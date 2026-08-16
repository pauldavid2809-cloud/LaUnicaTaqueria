/* ==========================================================================
   LA ÚNICA TAQUERÍA DIGITAL - PWA SERVICE WORKER
   ========================================================================== */

const CACHE_NAME = 'taqueria-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/supabase-config.js',
  '/manifest.json',
  '/assets/tacos_al_pastor.jpg',
  '/assets/birria_quesatacos.jpg',
  '/assets/taco_asada.jpg',
  '/assets/horchata_sucia.jpg',
  '/assets/guacamole_totopos.jpg',
  '/assets/churros_cajeta.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
