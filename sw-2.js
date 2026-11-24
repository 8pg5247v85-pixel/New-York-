// Mode hors ligne. Page = réseau d'abord (toujours la dernière version), cache en secours.
const C='ny3d-v2';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>clients.claim())
));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(/overpass|nominatim|routing\.openstreetmap|arcgisonline/.test(u.host))return;
  const page=r.mode==='navigate'||u.origin===location.origin;
  e.respondWith(caches.open(C).then(async c=>{
    if(page){
      try{const res=await fetch(r,{cache:'no-store'});if(res.ok)c.put(r,res.clone());return res}
      catch(err){return (await c.match(r))||Response.error()}
    }
    const hit=await c.match(r);
    const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>hit||Response.error());
    return hit||net;
  }));
});
