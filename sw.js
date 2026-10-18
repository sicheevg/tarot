/* Офлайн-кэш приложения. Версию CACHE меняйте при каждом обновлении файлов. */
const CACHE='tarot-v8';
const FILES=['./','./index.html','./data-ru.js?v=8','./data-en.js?v=8','./engine.js?v=8','./app.js?v=8','./manifest.webmanifest','./apple-touch-icon.png','./icon-192.png','./icon-512.png',...Array.from({length:22},(_,i)=>'./cards/'+i+'.jpg')];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
if(req.mode==='navigate'){e.respondWith(fetch(req).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return r}).catch(()=>caches.match('./index.html')));return}
e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return r})))});
