// Mode hors ligne : garde en cache la page, les bibliothèques et les zones de carte déjà consultées
const C='ny3d-v1';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const h=new URL(r.url).host;
  if(/overpass|nominatim|routing\.openstreetmap|arcgisonline/.test(h))return;
  e.respondWith(caches.open(C).then(async c=>{
    const hit=await c.match(r);
    const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>hit||Response.error());
    return hit||net;
  }));
});
