// Proctcher App: שומר את מעטפת האפליקציה בטלפון כדי שתיפתח מהר.
// המערכת עצמה (Google Apps Script) תמיד נטענת מהרשת ולא נשמרת כאן.
const CACHE = 'proctcher-shell-v5';
const SHELL = ['./', './index.html', './dashboard.html', './manifest.webmanifest', './manifest-dashboard.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './maskable-512.png', './icon-32.png', './dash-icon-180.png', './dash-icon-192.png', './dash-icon-512.png', './dash-maskable-512.png', './dash-icon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // Google לא עובר כאן
  // רשת קודם (כדי לקבל עדכונים), ואם אין רשת — מהזיכרון
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
