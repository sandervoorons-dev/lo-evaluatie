const CACHE = "lo-eval-v33";
const ASSETS = [
  "Evaluatie-app.html",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isDoc = e.request.mode === "navigate" ||
                (sameOrigin && (url.pathname.endsWith(".html") || url.pathname.endsWith("/") ||
                 url.pathname.endsWith("manifest.webmanifest")));
  if (isDoc) {
    // Network-first voor de app zelf: online steeds de nieuwste versie, offline uit cache.
    e.respondWith(
      fetch(e.request).then(resp => {
        const cp = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
        return resp;
      }).catch(() => caches.match(e.request).then(r => r || caches.match("Evaluatie-app.html")))
    );
    return;
  }
  // Cache-first voor de rest (iconen, lettertype, Excel-bibliotheek).
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const cp = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp));
      return resp;
    }).catch(() => caches.match("Evaluatie-app.html")))
  );
});
