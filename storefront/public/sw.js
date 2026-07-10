/*
 * Luma·headless service worker.
 *
 * Conservative by design — the storefront's HTML varies by cookies
 * (qa_locale flips lang/dir, customer_token gates account + seller portal,
 * guest_cart_id / compare_skus personalize the chrome), so documents are
 * NEVER cached. Navigations are network-first with a static offline
 * fallback; only immutable hashed build assets and PWA art are cached.
 */

const VERSION = "v2";
// Immutable hashed build assets (cache-first, pruned).
const STATIC_CACHE = `luma-static-${VERSION}`;
// PWA art + offline fallback (stale-while-revalidate so re-exported
// icons/screenshots under the same filename still refresh).
const ASSET_CACHE = `luma-assets-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const MAX_STATIC_ENTRIES = 100;

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Same-origin paths the SW must never touch: Magento/nginx-owned routes
// (/admin, /media, /static, /errors), the private API surface, and the
// admin page-builder preview.
const EXCLUDED_PREFIXES = [
  "/api/",
  "/admin",
  "/media/",
  "/static/",
  "/errors/",
  "/magezon-preview",
];

// Magento endpoints blocked at nginx; matched exactly or as a directory so
// storefront routes like /reset-password don't get caught by "/rest".
const EXCLUDED_ENDPOINTS = ["/graphql", "/rest", "/soap"];

function isExcluded(pathname) {
  return (
    EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    EXCLUDED_ENDPOINTS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  );
}

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(ASSET_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const keep = [STATIC_CACHE, ASSET_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !keep.includes(key)).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Server actions POST to page URLs; anything non-GET goes to the network.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isExcluded(url.pathname)) return;

  // RSC flight requests share the page URL (?_rsc= / RSC header). Caching
  // them would collide with document responses — always pass through.
  if (url.searchParams.has("_rsc") || request.headers.get("RSC") === "1") {
    return;
  }

  // Documents: network-first, offline fallback. Never cached (cookie-varied).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then(
          (cached) =>
            cached ||
            new Response(
              "<h1>You are offline</h1><p>Reconnect and try again.</p>",
              { status: 200, headers: { "Content-Type": "text/html" } }
            )
        )
      )
    );
    return;
  }

  // Hashed build assets: cache-first. Only cache when the server marks the
  // response immutable (production) — `next dev` assets reuse URLs with
  // changing content, and caching those would poison later dev sessions.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const cacheable =
              response.ok &&
              response.type === "basic" &&
              (response.headers.get("Cache-Control") || "").includes("immutable");
            if (cacheable) {
              const copy = response.clone();
              caches
                .open(STATIC_CACHE)
                .then((cache) => cache.put(request, copy))
                .then(() => trimCache(STATIC_CACHE, MAX_STATIC_ENTRIES))
                .catch(() => {});
            }
            return response;
          })
      )
    );
    return;
  }

  // PWA art (fixed filenames): stale-while-revalidate — serve the cached
  // copy instantly but refresh it in the background so a re-exported icon
  // or screenshot under the same path is picked up on the next visit.
  if (url.pathname.startsWith("/icons/") || url.pathname.startsWith("/screenshots/")) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const refresh = fetch(request)
          .then((response) => {
            if (response.ok && response.type === "basic") {
              cache.put(request, response.clone()).catch(() => {});
            }
            return response;
          })
          .catch(() => undefined);
        return cached || refresh.then((r) => r || Response.error());
      })
    );
  }
  // Everything else (suggest API, fonts CSS, etc.) falls through to network.
});
