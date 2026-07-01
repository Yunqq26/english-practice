const CACHE = 'eng-practice-v4';
const URLS = [
  './', './index.html', './style.css',
  './js/app.js', './js/analyzer.js', './js/questions.js', './js/essay.js',
  './manifest.json', './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS)));
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  // 跳过 API 请求（避免 CORS 拦截）
  if (e.request.url.includes('backend-production-80b8b.up.railway.app')) return;
  // 非 GET 或非同源 → 直接网络
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});
