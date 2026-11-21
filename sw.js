// Invigo: שומר את מעטפת האפליקציה בטלפון כדי שתיפתח מהר.
// המערכת עצמה (Google Apps Script) תמיד נטענת מהרשת ולא נשמרת כאן.
const CACHE = 'invigo-shell-v9';
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

// ===== התראות (Push) =====
// כל הודעה מוצגת כהתראה (באייפון חובה להציג התראה על כל Push)
self.addEventListener('push', e => {
  let d = {};
  try { const j = e.data ? e.data.json() : {}; d = j.data || j.notification || j || {}; }
  catch (x) { try { d = { body: e.data ? e.data.text() : '' }; } catch (y) {} }
  const title = d.title || 'Invigo';
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: d.tag || undefined,
    renotify: !!d.tag,
    dir: 'rtl',
    lang: 'he',
    data: { url: d.url || './' }
  }));
});

// לחיצה על התראה: פותחת את האפליקציה (או מביאה אותה לקדמת המסך)
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if (c.url.indexOf(self.registration.scope) === 0 && 'focus' in c) return c.focus(); }
    return self.clients.openWindow ? self.clients.openWindow(target) : null;
  }));
});
