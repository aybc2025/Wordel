// Bump this on every release to force cache invalidation.
const CACHE_VERSION = "wordel-v3";
const CACHE_NAME = `${CACHE_VERSION}`;

// Precached app shell. Vite's hashed build assets are added at runtime via the
// cache-first branch below, since their exact filenames aren't known until
// build time.
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./words.json",
  "./words-en.json",
];

// Absolute URL of the offline fallback document.
const SHELL_URL = new URL("./index.html", self.location).href;

// Matches any language's word bank: words.json, words-en.json, ...
const WORD_BANK_RE = /\/words(-[a-z]{2})?\.json$/;

// Vite's build output: content-hashed, so a given URL's bytes never change.
const IMMUTABLE_ASSET_RE = /\/assets\/[^/]+\.[0-9a-zA-Z_-]+\.(js|css)$/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        // Individual puts rather than cache.addAll: addAll is atomic, so one
        // missing file would fail the whole install and leave the previous
        // (possibly broken) worker in control indefinitely.
        Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            fetch(new Request(url, { cache: "reload" })).then((res) => {
              if (res.ok) return cache.put(url, res);
              return undefined;
            })
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Allow the page to trigger immediate activation after an update banner tap.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/** Network-first, falling back to whatever is cached. */
function networkFirst(request, fallbackUrl) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(() =>
      caches
        .match(request)
        .then((cached) => cached || (fallbackUrl ? caches.match(fallbackUrl) : undefined))
        .then((cached) => cached || Response.error())
    );
}

/** Cache-first, for URLs whose contents are immutable. */
function cacheFirst(request) {
  return caches
    .match(request)
    .then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
    // Without this, any rejection here surfaces to the page as the opaque
    // "ServiceWorker intercepted the request and encountered an unexpected
    // error" rather than a normal network failure.
    .catch(() => caches.match(request).then((cached) => cached || Response.error()));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Let cross-origin requests go straight to the network.
  if (url.origin !== self.location.origin) return;

  // Navigations must be network-first. Serving index.html cache-first strands
  // the app on a stale document that references hashed asset filenames deleted
  // by the next deploy — the browser then fails to load the module and the
  // whole page is blank until the cache is cleared.
  if (request.mode === "navigate" || url.pathname.endsWith("/index.html")) {
    event.respondWith(networkFirst(request, SHELL_URL));
    return;
  }

  // Network-first for the word bank data, so word-list updates propagate
  // quickly when online, but still fall back to cache when offline.
  if (WORD_BANK_RE.test(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Content-hashed bundles never change under a given URL — safe to serve
  // from cache indefinitely; a new deploy simply requests new filenames.
  if (IMMUTABLE_ASSET_RE.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Everything else (icons, manifest, favicon): cache-first is fine, and the
  // version bump on release clears them.
  event.respondWith(cacheFirst(request));
});
