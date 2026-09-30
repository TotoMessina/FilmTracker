// FilmTracker PWA Service Worker
const CACHE_NAME = "filmtracker-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon.svg",
  "/icons/icon-maskable.svg",
  "/globals.css"
];

// Install event - precache core static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Pre-caching fallback:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network-first strategy with cache fallback for offline resilience
self.addEventListener("fetch", (event) => {
  // Only handle GET requests and skip Supabase API or Groq AI calls from caching
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip dynamic external API endpoints that must be live
  if (
    url.pathname.startsWith("/api/ai") ||
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("groq.com")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses for static assets and images
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.pathname.startsWith("/_next/static/") ||
           url.pathname.startsWith("/icons/") ||
           url.hostname.includes("image.tmdb.org"))
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline fallback from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If navigating to an HTML page while offline, return cached root
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/");
          }
          return new Response("Contenido offline no disponible", { status: 503 });
        });
      })
  );
});
