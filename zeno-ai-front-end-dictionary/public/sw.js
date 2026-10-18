/* Keep all URLs relative to the deployment scope, including subdirectories. */
const CACHE_PREFIX = 'teum-';
const CACHE_NAME = `${CACHE_PREFIX}v25`;
const SCOPE_URL = new URL(self.registration.scope);
const ROOT_URL = SCOPE_URL.href;
const INDEX_URL = new URL('index.html', SCOPE_URL).href;
const SHELL_URLS = [
  ROOT_URL,
  INDEX_URL,
  new URL('manifest.webmanifest', SCOPE_URL).href,
  ...['logo.svg', 'logo-dark.svg', 'favicon.ico', 'favicon.png', 'favicon-dark.png', 'apple-icon.png', 'apple-icon-dark.png',
    'og-image.png', 'og-image-dark.png']
    .map((name) => new URL(`brand/zeno-blue/${name}`, SCOPE_URL).href),
  ...['zeno-blue-192.png', 'zeno-blue-512.png', 'zeno-blue-maskable-512.png',
    'zeno-blue-dark-192.png', 'zeno-blue-dark-512.png', 'zeno-blue-dark-maskable-512.png']
    .map((name) => new URL(`icons/${name}`, SCOPE_URL).href),
  new URL('fonts/PretendardVariable.woff2', SCOPE_URL).href,
  new URL('fonts/OFL.txt', SCOPE_URL).href,
  new URL('fonts/MontserratVariable.woff2', SCOPE_URL).href,
  new URL('fonts/Montserrat-OFL.txt', SCOPE_URL).href,
  new URL('licenses/Montage-MIT.txt', SCOPE_URL).href,
  new URL('licenses/prism-react-renderer-MIT.txt', SCOPE_URL).href,
  new URL('licenses/Prism-MIT.txt', SCOPE_URL).href,
  ...['supabase-js', 'auth-js', 'functions-js', 'postgrest-js', 'realtime-js', 'storage-js', 'phoenix']
    .map((name) => new URL(`licenses/supabase/${name}-MIT.txt`, SCOPE_URL).href),
];

function appAssetUrls(html) {
  const appAssets = new Set();
  // Vite emits quoted script/link attributes. DOMParser is unavailable in workers.
  const tags = html.match(/<(?:script|link)\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const attribute = (name) => {
      const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
      return match?.[2];
    };
    const isScript = /^<script\b/i.test(tag);
    const rel = (attribute('rel') || '').toLowerCase().split(/\s+/);
    if (!isScript && !rel.includes('stylesheet') && !rel.includes('modulepreload')) {
      continue;
    }
    const source = attribute(isScript ? 'src' : 'href');
    if (!source) continue;
    const url = new URL(source, INDEX_URL);
    if (
      url.origin === SCOPE_URL.origin &&
      url.pathname.startsWith(SCOPE_URL.pathname) &&
      /\.(?:js|css)$/i.test(url.pathname)
    ) {
      appAssets.add(url.href);
    }
  }
  return [...appAssets];
}

async function precacheAppAssets(cache, html) {
  const urls = appAssetUrls(html);
  if (urls.length > 0) await cache.addAll(urls);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(SHELL_URLS);
      const shell = await cache.match(INDEX_URL);
      const html = await shell.text();
      // Finish the app's initial JS/CSS before the first offline launch is allowed.
      await precacheAppAssets(cache, html);
      await self.skipWaiting();
    }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

const isCacheable = (response) => response.ok && response.type === 'basic';

async function navigate(request, event) {
  const cache = await caches.open(CACHE_NAME);
  const network = fetch(request);
  const refresh = network.then(async (response) => {
    if (
      isCacheable(response) &&
      response.headers.get('content-type')?.includes('text/html')
    ) {
      // Keep the previous offline shell until the new build's entry assets are ready.
      const shell = response.clone();
      await precacheAppAssets(cache, await shell.clone().text());
      // One canonical shell also serves deep links and query-string visits.
      await Promise.all([
        cache.put(INDEX_URL, shell.clone()),
        cache.put(ROOT_URL, shell.clone()),
      ]);
    }
  });

  // Serve online HTML promptly; a failed background refresh preserves the saved shell.
  event.waitUntil(refresh.catch(() => undefined));
  let timeout;
  try {
    return await Promise.race([
      network,
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Navigation timed out')), 4000);
      }),
    ]);
  } catch {
    const saved = await cache.match(INDEX_URL);
    return (
      saved ||
      new Response(
        '<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>zeno-ai-front-dictionary</title><body><p>처음에는 인터넷에 연결해 단어장을 열어 주세요.</p></body></html>',
        { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
      )
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function asset(request) {
  const cache = await caches.open(CACHE_NAME);
  // Public static assets have no personalized variants. A crossorigin document load
  // sends Origin while precache requests omit it; Vary: Origin must not hide the cache.
  const saved = await cache.match(request, { ignoreVary: true });
  if (saved) return saved;

  const response = await fetch(request);
  if (isCacheable(response)) {
    // Storage pressure must not interrupt an otherwise successful online request.
    await cache.put(request, response.clone()).catch(() => undefined);
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== 'GET' ||
    url.origin !== SCOPE_URL.origin ||
    !url.pathname.startsWith(SCOPE_URL.pathname)
  ) {
    return;
  }

  const path = url.pathname.slice(SCOPE_URL.pathname.length);
  if (path === 'api' || path.startsWith('api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigate(request, event));
    return;
  }

  if (
    path === 'manifest.webmanifest' ||
    path.startsWith('brand/') ||
    path.startsWith('icons/') ||
    path.startsWith('fonts/') ||
    path.startsWith('assets/') ||
    /\.(?:js|css)$/i.test(path)
  ) {
    event.respondWith(asset(request));
  }
});
