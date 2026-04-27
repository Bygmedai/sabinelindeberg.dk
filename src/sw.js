// Sabine Lindeberg — minimal service worker.
// Strategi:
//   - Static assets (CSS, fonts, billeder, logo): cache-first, falder tilbage til network.
//   - HTML-sider: network-first, falder tilbage til cache, og til /offline/ hvis offline.
// Versionsnøgle bumpes når CSS/JS-strukturen ændres så gamle caches ryddes.
const VERSION = 'sl-v1';
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE   = `${VERSION}-pages`;

const PRECACHE = [
  '/',
  '/offline/',
  '/assets/css/base.css',
  '/assets/css/components.css',
  '/assets/css/skins/sabinelindeberg.css',
  '/assets/fonts/fonts.css',
  '/assets/materiale/logo-tree.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

function isHTMLRequest(request) {
  return request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');
}

function isStaticAsset(url) {
  return /\.(css|js|woff2|png|jpg|jpeg|webp|avif|svg|ico)$/i.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  // HTML: network-first → cache → /offline/
  if (isHTMLRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Cache en kopi af succesfulde 200-svar
          if (res.ok) {
            const copy = res.clone();
            caches.open(PAGE_CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/offline/')))
    );
    return;
  }

  // Static assets: cache-first
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
        }
        return res;
      }))
    );
  }
});
