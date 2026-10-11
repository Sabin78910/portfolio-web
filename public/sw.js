const CACHE = "portfolio-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function put(request, response) {
  if (response.ok && response.type === "basic") {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

// Pages and data: fresh when online, cached copy when offline.
async function networkFirst(request) {
  try {
    return await put(request, await fetch(request));
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

// Hashed assets and screenshots never change under the same URL.
async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || put(request, await fetch(request));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const immutable = url.pathname.includes("/assets/") || url.pathname.includes("/shots/");
  event.respondWith(immutable ? cacheFirst(request) : networkFirst(request));
});
