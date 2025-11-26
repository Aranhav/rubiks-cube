const CACHE_NAME = 'cubic-v1';
const ASSETS = [
    './',
    './index.html',
    './src/css/style.css',
    './src/js/main.js',
    './src/js/state.js',
    './src/js/cube.js',
    './src/js/solver.js',
    './src/js/interaction.js',
    './src/js/config.js',
    './src/js/utils.js',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
