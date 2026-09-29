const CACHE = "lo-eval-v71";
const ASSETS = [
  "Evaluatie-app.html",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png"
];
// Extra, maar niet levensnoodzakelijk: lukt dit niet, dan installeert de app gewoon door.
// Zonder dit bestand werkt de app volledig, alleen het Excel-exporteren niet offline.
const EXTRA = ["https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS).then(() =>
        Promise.all(EXTRA.map(u => c.add(u).catch(() => null)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

/* Een foutpagina is voor de browser een geslaagd antwoord.
   Zonder deze controle werd een 404 van de webserver in de cache gezet OVER de
   werkende app heen — dan kreeg je de foutpagina zelfs zonder internet te zien.
   Dat is in september 2026 één keer gebeurd toen de website offline stond.
   Regel: enkel een geslaagd antwoord (status 200-299) mag bewaard of getoond
   worden. Alles daarbuiten valt terug op wat er al in de cache staat. */
function bruikbaar(resp) {
  return resp && resp.ok && resp.status >= 200 && resp.status < 300;
}
function uitCache(req) {
  return caches.match(req).then(r => r || caches.match("Evaluatie-app.html"));
}

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isDoc = e.request.mode === "navigate" ||
                (sameOrigin && (url.pathname.endsWith(".html") || url.pathname.endsWith("/") ||
                 url.pathname.endsWith("manifest.webmanifest")));

  if (isDoc) {
    // Network-first voor de app zelf: online de nieuwste versie, anders uit de cache.
    e.respondWith(
      fetch(e.request).then(resp => {
        if (!bruikbaar(resp)) {
          // Server antwoordde, maar met een fout (404, 500 ...). Cache niet aanraken.
          return uitCache(e.request).then(r => r || resp);
        }
        const cp = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
        return resp;
      }).catch(() => uitCache(e.request))
    );
    return;
  }

  // Cache-first voor de rest (iconen, Excel-bibliotheek).
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      if (!bruikbaar(resp)) return resp;      // fout niet bewaren
      const cp = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp));
      return resp;
    }).catch(() => caches.match("Evaluatie-app.html")))
  );
});
