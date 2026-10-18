/* Офлайн-кэш приложения. Версию CACHE меняйте при каждом обновлении файлов. */
const CACHE='tarot-v13';
const FILES=['./','./index.html','./ru/','./data-ru.js?v=13','./data-en.js?v=13','./engine.js?v=13','./app.js?v=13','./manifest.webmanifest','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./og-image.png',...Array.from({length:22},(_,i)=>'./cards/'+i+'.jpg'),...Array.from({length:10},(_,i)=>'./backs/'+i+'.jpg'),...Array.from({length:10},(_,i)=>'./backs/orb-'+i+'.jpg')];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
if(req.mode==='navigate'){const key=new URL(new URL(req.url).pathname.includes('/ru/')?'ru/':'./',self.registration.scope).href;e.respondWith(fetch(req).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(key,copy))}return r}).catch(()=>caches.match(key).then(h=>h||caches.match(new URL('./',self.registration.scope).href))));return}
e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return r})))});
