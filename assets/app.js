(() => {
  const intro = document.getElementById('videoIntro');
  const introVideo = document.getElementById('introVideo');
  const introSkip = document.getElementById('introSkip');
  const introSkipProgress = document.getElementById('introSkipProgress');
  const videos = [
    document.getElementById('video1'),
    document.getElementById('video2'),
    document.getElementById('video3'),
    document.getElementById('video4'),
    document.getElementById('video5')
  ].filter(Boolean);
  const buttons = [...document.querySelectorAll('.slide-dot:not(.disabled)')];
  let current = 0;
  let raf = null;
  let heroStarted = false;

  document.body.classList.add('intro-lock', 'intro-running');
  videos.forEach(v => { try { v.pause(); v.currentTime = 0; } catch (_) {} });

  const resetProgress = () => document.querySelectorAll('.slide-dot i').forEach(i => i.style.width = '0%');
  const animateProgress = () => {
    cancelAnimationFrame(raf);
    const video = videos[current];
    const bar = buttons[current]?.querySelector('i');
    if (!video || !bar) return;
    const tick = () => {
      if (video.duration && Number.isFinite(video.duration)) bar.style.width = `${Math.min(100,(video.currentTime/video.duration)*100)}%`;
      raf = requestAnimationFrame(tick);
    };
    tick();
  };

  const show = async index => {
    if (!heroStarted || !videos[index]) return;
    videos[current].pause();
    videos[current].classList.remove('active-video');
    buttons[current]?.classList.remove('active');
    current = index;
    resetProgress();
    const next = videos[current];
    next.currentTime = 0;
    next.classList.add('active-video');
    buttons[current]?.classList.add('active');
    try { await next.play(); } catch (_) {}
    animateProgress();
  };

  const startHero = async () => {
    if (heroStarted) return;
    if (introVideo) {
      try { introVideo.pause(); } catch (_) {}
    }
    heroStarted = true;
    document.body.classList.remove('intro-lock','intro-running');
    document.body.classList.add('intro-done');
    intro?.classList.add('is-exiting');
    resetProgress();
    const first = videos[0];
    first.classList.add('active-video');
    buttons[0]?.classList.add('active');
    try { first.currentTime = 0; await first.play(); } catch (_) {}
    animateProgress();
    setTimeout(() => intro?.remove(), 1300);
  };

  if (introSkip) {
    introSkip.addEventListener('click', startHero);
  }
  if (introVideo && introSkipProgress) {
    const updateIntroProgress = () => {
      if (introVideo.duration && Number.isFinite(introVideo.duration)) {
        introSkipProgress.style.width = `${Math.min(100, (introVideo.currentTime / introVideo.duration) * 100)}%`;
      }
    };
    introVideo.addEventListener('timeupdate', updateIntroProgress);
    introVideo.addEventListener('loadedmetadata', updateIntroProgress);
  }

  videos.forEach((video,index) => {
    video.addEventListener('ended', () => show((index + 1) % videos.length));
    video.addEventListener('loadedmetadata', () => { if (heroStarted && index === current) animateProgress(); });
  });
  buttons.forEach((button,index) => button.addEventListener('click', () => show(index)));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    startHero();
  } else if (introVideo) {
    introVideo.addEventListener('ended', startHero, {once:true});
    introVideo.addEventListener('error', startHero, {once:true});
    try { introVideo.currentTime = 0; introVideo.play().catch(() => startHero()); } catch (_) { startHero(); }
  } else {
    startHero();
  }
})();


/* ===== DAY HOUSE V23 / NAV ACTIVE SECTION SCROLLSPY ===== */
(() => {
  const navLinks = [...document.querySelectorAll('.nav .links a[href^="#"]')];
  const sectionIds = ['hero', 'hizmetlerimiz', 'ilanlarimiz', 'hakkimizda', 'iletisim'];
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (!navLinks.length || !sections.length) return;

  const setActive = (id) => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href').slice(1);
      if (id) setActive(id);
    });
  });

  const syncActiveSection = () => {
    const headerOffset = 150;
    const marker = window.scrollY + headerOffset;
    let current = 'hero';

    sections.forEach(section => {
      if (section.offsetTop <= marker) current = section.id;
    });

    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 8) {
      current = 'iletisim';
    }

    setActive(current);
  };

  syncActiveSection();
  window.addEventListener('scroll', syncActiveSection, { passive: true });
  window.addEventListener('resize', syncActiveSection);
})();


/* ===== DAY HOUSE V29 / MOBILE MENU ===== */
(() => {
  const toggle = document.getElementById('mobileMenuToggle');
  const links = document.getElementById('mainNavLinks');
  if (!toggle || !links) return;

  const closeMenu = () => {
    document.body.classList.remove('mobile-nav-open');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Menüyü aç');
  };

  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('mobile-nav-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });
})();

/* ===== DAY HOUSE V29 / GENTLE NEXT VIDEO PRELOAD ===== */
(() => {
  const videos = [...document.querySelectorAll('.hero-video')];
  if (videos.length < 2) return;

  const prepare = (index) => {
    const video = videos[index];
    if (!video || video.preload !== 'none') return;
    video.preload = 'metadata';
    try { video.load(); } catch (_) {}
  };

  videos.forEach((video, index) => {
    video.addEventListener('play', () => prepare((index + 1) % videos.length), {passive:true});
  });

  // After intro settles, gently prepare the second hero video.
  const intro = document.getElementById('introVideo');
  if (intro) intro.addEventListener('ended', () => prepare(1), {once:true});
})();
