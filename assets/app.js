(() => {
  const intro = document.getElementById('videoIntro');
  const introVideo = document.getElementById('introVideo');
  const introSkip = document.getElementById('introSkip');
  const introSkipProgress = document.getElementById('introSkipProgress');
  const introRealestateLabel = document.getElementById('introRealestateLabel');
  const videos = [1,2,3,4,5].map(n => document.getElementById(`video${n}`)).filter(Boolean);
  const buttons = [...document.querySelectorAll('.slide-dot:not(.disabled)')];
  if (!videos.length) { document.body.classList.add('intro-done'); return; }
  let current = 0, raf = null, heroStarted = false;
  let introSeen = false;
  try { introSeen = sessionStorage.getItem('dayhouseIntroSeen') === '1'; } catch (_) {}

  const resetProgress=()=>document.querySelectorAll('.slide-dot i').forEach(i=>i.style.width='0%');
  const animateProgress=()=>{ cancelAnimationFrame(raf); const v=videos[current],bar=buttons[current]?.querySelector('i'); if(!v||!bar)return; const tick=()=>{if(v.duration&&Number.isFinite(v.duration))bar.style.width=`${Math.min(100,(v.currentTime/v.duration)*100)}%`;raf=requestAnimationFrame(tick)};tick(); };
  const show=async index=>{if(!heroStarted||!videos[index])return;videos[current].pause();videos[current].classList.remove('active-video');buttons[current]?.classList.remove('active');current=index;resetProgress();const next=videos[current];next.currentTime=0;next.classList.add('active-video');buttons[current]?.classList.add('active');try{await next.play()}catch(_){}animateProgress();};
  const startHero=async(markSeen=true)=>{if(heroStarted)return;heroStarted=true;if(markSeen){try{sessionStorage.setItem('dayhouseIntroSeen','1')}catch(_){}}if(introVideo)try{introVideo.pause()}catch(_){}document.body.classList.remove('intro-lock','intro-running');document.body.classList.add('intro-done');intro?.classList.add('is-exiting');resetProgress();const first=videos[0];first.classList.add('active-video');buttons[0]?.classList.add('active');try{first.currentTime=0;await first.play()}catch(_){}animateProgress();setTimeout(()=>intro?.remove(),introSeen?0:1300);};

  videos.forEach((video,index)=>{video.addEventListener('ended',()=>show((index+1)%videos.length));video.addEventListener('loadedmetadata',()=>{if(heroStarted&&index===current)animateProgress()});});
  buttons.forEach((button,index)=>button.addEventListener('click',()=>show(index)));

  if (introSeen || !intro || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    intro?.remove(); startHero(false);
  } else {
    document.body.classList.add('intro-lock','intro-running');
    videos.forEach(v=>{try{v.pause();v.currentTime=0}catch(_){}});
    introSkip?.addEventListener('click',()=>startHero(true));
    if(introVideo&&introSkipProgress){const update=()=>{if(introVideo.duration&&Number.isFinite(introVideo.duration)){const r=introVideo.currentTime/introVideo.duration;introSkipProgress.style.width=`${Math.min(100,r*100)}%`;if(introRealestateLabel&&r>=.70)introRealestateLabel.classList.add('is-visible')}};introVideo.addEventListener('timeupdate',update);introVideo.addEventListener('loadedmetadata',update);introVideo.addEventListener('ended',()=>startHero(true),{once:true});introVideo.addEventListener('error',()=>startHero(true),{once:true});try{introVideo.currentTime=0;introVideo.play().catch(()=>startHero(true))}catch(_){startHero(true)}} else startHero(true);
  }
})();

/* HOME SCROLLSPY */
(() => {
  const navLinks=[...document.querySelectorAll('.nav .links a[href^="#"]')];
  const sections=['hero','ilanlarimiz','hakkimizda','iletisim'].map(id=>document.getElementById(id)).filter(Boolean);
  if(!navLinks.length||!sections.length)return;
  const setActive=id=>navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${id}`));
  navLinks.forEach(link=>link.addEventListener('click',()=>{const id=link.getAttribute('href').slice(1);if(id)setActive(id)}));
  const sync=()=>{const marker=window.scrollY+150;let current='hero';sections.forEach(s=>{if(s.offsetTop<=marker)current=s.id});if((innerHeight+scrollY)>=document.documentElement.scrollHeight-8)current='iletisim';setActive(current)};
  sync();addEventListener('scroll',sync,{passive:true});addEventListener('resize',sync);
})();

/* MOBILE MENU */
(() => {const toggle=document.getElementById('mobileMenuToggle'),links=document.getElementById('mainNavLinks');if(!toggle||!links)return;const close=()=>{document.body.classList.remove('mobile-nav-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Menüyü aç')};toggle.addEventListener('click',()=>{const open=document.body.classList.toggle('mobile-nav-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Menüyü kapat':'Menüyü aç')});links.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));addEventListener('resize',()=>{if(innerWidth>900)close()})})();

/* NEXT HERO VIDEO PRELOAD */
(() => {const videos=[...document.querySelectorAll('.hero-video')];if(videos.length<2)return;const prepare=i=>{const v=videos[i];if(!v||v.preload!=='none')return;v.preload='metadata';try{v.load()}catch(_){}};videos.forEach((v,i)=>v.addEventListener('play',()=>prepare((i+1)%videos.length),{passive:true}));})();
