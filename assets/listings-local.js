(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=v=>{const n=Number(String(v??'').replace(/[^0-9]/g,''));return n?new Intl.NumberFormat('tr-TR').format(n)+' ₺':esc(v||'Fiyat sorunuz')};
 const norm=s=>String(s||'').trim().toLocaleLowerCase('tr-TR').replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9çğıöşü]+/g,' ');
 const mediaOf=l=>Array.isArray(l.media)?l.media:[];
 const cover=l=>mediaOf(l).find(m=>m.type==='image')?.path||'';
 const url=l=>l.url||('ilan.html?id='+encodeURIComponent(l.id));
 const card=l=>`<a class="featured-listing-card" href="${esc(url(l))}"><div class="featured-listing-image" style="${cover(l)?`background-image:url('${cover(l).replace(/'/g,'%27')}')`:''}"><span class="featured-listing-badge">${esc((l.transaction||'PORTFÖY').toUpperCase())}</span></div><div class="featured-listing-body"><div class="featured-listing-loc">${esc([l.city,l.district,l.neighborhood].filter(Boolean).join(' / '))}</div><h3>${esc(l.title||'Day House Gayrimenkul')}</h3><div class="featured-listing-meta">${l.rooms?`<span>${esc(l.rooms)}</span>`:''}${l.area?`<span>${esc(l.area)} m²</span>`:''}${l.type?`<span>${esc(l.type)}</span>`:''}</div><div class="featured-listing-price">${money(l.price)}</div></div></a>`;
 let cache=null;
 const load=async()=>{if(cache)return cache;try{const r=await fetch('/data/ilanlar.json?ts='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('İlan verisi okunamadı');const d=await r.json();cache=Array.isArray(d)?d:[];return cache}catch(e){console.error(e);return[]}};
 window.DayHouseListings={load,esc,money,norm,card,url,cover};
 document.addEventListener('DOMContentLoaded',async()=>{
   const form=document.getElementById('listingFilter'),grid=document.getElementById('listingsGrid');if(!form||!grid)return;
   const p=new URLSearchParams(location.search);[...form.elements].forEach(el=>{if(el.name&&p.has(el.name))el.value=p.get(el.name)});
   const render=async()=>{const f=Object.fromEntries(new FormData(form).entries());const items=(await load()).filter(x=>x.published!==false)
     .filter(x=>!f.transaction||norm(x.transaction)===norm(f.transaction)).filter(x=>!f.type||norm(x.type).includes(norm(f.type)))
     .filter(x=>!f.city||norm(x.city).includes(norm(f.city))).filter(x=>!f.district||norm(x.district).includes(norm(f.district)))
     .filter(x=>!f.neighborhood||norm(x.neighborhood).includes(norm(f.neighborhood)))
     .filter(x=>!f.q||norm([x.title,x.description,x.listingNo,x.city,x.district,x.neighborhood,x.type,x.transaction].join(' ')).includes(norm(f.q)));
     grid.innerHTML=items.length?items.map(card).join(''):'<div class="empty-state" style="grid-column:1/-1">Bu filtrelerle eşleşen aktif Day House ilanı bulunamadı.</div>';
   };
   form.addEventListener('submit',e=>{e.preventDefault();const q=new URLSearchParams(new FormData(form));[...q.entries()].forEach(([k,v])=>{if(!String(v).trim())q.delete(k)});history.replaceState(null,'','?'+q.toString());render()});render();
 });
})();
