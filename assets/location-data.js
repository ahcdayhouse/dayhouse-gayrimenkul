(() => {
  const API='https://api.turkiyeapi.dev/v2';
  const PROVINCES=['Adana','Adıyaman','Afyonkarahisar','Ağrı','Amasya','Ankara','Antalya','Artvin','Aydın','Balıkesir','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkâri','Hatay','Isparta','Mersin','İstanbul','İzmir','Kars','Kastamonu','Kayseri','Kırklareli','Kırşehir','Kocaeli','Konya','Kütahya','Malatya','Manisa','Kahramanmaraş','Mardin','Muğla','Muş','Nevşehir','Niğde','Ordu','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Tekirdağ','Tokat','Trabzon','Tunceli','Şanlıurfa','Uşak','Van','Yozgat','Zonguldak','Aksaray','Bayburt','Karaman','Kırıkkale','Batman','Şırnak','Bartın','Ardahan','Iğdır','Yalova','Karabük','Kilis','Osmaniye','Düzce'].map((name,i)=>({id:i+1,name}));
  const norm=s=>String(s||'').trim().toLocaleLowerCase('tr-TR');
  const cacheGet=k=>{try{return JSON.parse(localStorage.getItem('dhLoc:'+k)||'null')}catch(_){return null}};
  const cacheSet=(k,v)=>{try{localStorage.setItem('dhLoc:'+k,JSON.stringify(v))}catch(_){}};
  const getJSON=async url=>{const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()};
  const optionize=(list,dl)=>{if(!dl)return;dl.innerHTML=list.map(x=>`<option value="${String(x.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"></option>`).join('')};
  const exact=(list,name)=>list.find(x=>norm(x.name)===norm(name));
  async function districts(province){const key='d:'+province.id;let data=cacheGet(key);if(!data){try{const j=await getJSON(`${API}/provinces/${province.id}/districts?fields=id,name&sort=name&limit=1000`);data=j.data||[];cacheSet(key,data)}catch(_){data=[]}}return data}
  async function neighborhoods(district){const key='n:'+district.id;let data=cacheGet(key);if(!data){try{const j=await getJSON(`${API}/districts/${district.id}/neighborhoods?fields=id,name&sort=name&limit=1000`);data=j.data||[];cacheSet(key,data)}catch(_){data=[]}}return data}
  function init(root=document){
    root.querySelectorAll('form, .property-filter').forEach(scope=>{
      const city=scope.querySelector('[data-location-role="city"]'), district=scope.querySelector('[data-location-role="district"]'), neighborhood=scope.querySelector('[data-location-role="neighborhood"]');
      if(!city||!district||!neighborhood)return;
      const cityDL=document.getElementById(city.getAttribute('list')), distDL=document.getElementById(district.getAttribute('list')), neighDL=document.getElementById(neighborhood.getAttribute('list'));
      optionize(PROVINCES,cityDL);
      let districtData=[], neighborhoodData=[];
      const loadDistricts=async(clear=true)=>{const p=exact(PROVINCES,city.value);if(clear){district.value='';neighborhood.value=''};optionize([],distDL);optionize([],neighDL);districtData=[];neighborhoodData=[];if(!p)return;districtData=await districts(p);optionize(districtData,distDL)};
      const loadNeighborhoods=async(clear=true)=>{const d=exact(districtData,district.value);if(clear)neighborhood.value='';optionize([],neighDL);neighborhoodData=[];if(!d)return;neighborhoodData=await neighborhoods(d);optionize(neighborhoodData,neighDL)};
      city.addEventListener('change',()=>loadDistricts(true));
      district.addEventListener('change',()=>loadNeighborhoods(true));
      city.addEventListener('blur',()=>loadDistricts(false));
      district.addEventListener('blur',()=>loadNeighborhoods(false));
      scope._dhLocationRefresh=async()=>{await loadDistricts(false);await loadNeighborhoods(false)};
      if(city.value)scope._dhLocationRefresh();
    });
  }
  window.DayHouseLocation={init,PROVINCES};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init());else init();
})();
