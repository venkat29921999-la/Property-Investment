/* =========================================================
   MERIDIAN — script.js
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    if (preloader) setTimeout(() => preloader.classList.add('is-hidden'), 400);
  });
  // Fallback in case 'load' is slow to fire
  setTimeout(() => preloader && preloader.classList.add('is-hidden'), 2500);

  /* ---------- AOS ---------- */
  if (window.AOS) {
    AOS.init({ duration: 800, once: true, offset: 60, easing: 'ease-out-cubic' });
  }

  /* ---------- GSAP registrations ---------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Custom cursor (desktop) ---------- */
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (!isCoarse && cursorDot && cursorRing && window.gsap) {
    let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      gsap.set(cursorDot, { x: mouseX, y: mouseY });
    });
    gsap.ticker.add(() => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      gsap.set(cursorRing, { x: ringX, y: ringY });
    });
    document.querySelectorAll('a, button, .lot-card, input, textarea, select').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.style.width = cursorRing.style.height = '54px');
      el.addEventListener('mouseleave', () => cursorRing.style.width = cursorRing.style.height = '34px');
    });
  }

  /* ---------- Header scroll state + active link (guarded — auth/dashboard
     pages don't carry the marketing site header or back-to-top button) ---------- */
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');
  const onScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 40);
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const navLinks = document.querySelectorAll('.nav-link');
  const sections = Array.from(navLinks).map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => sectionObserver.observe(s));

  /* ---------- Hamburger + mobile menu (guarded — not every page uses the
     marketing site's off-canvas menu, e.g. auth and dashboard pages) ---------- */
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileBackdrop = document.getElementById('mobileBackdrop');

  if (hamburger && mobileMenu && mobileBackdrop) {
    const openMenu = () => {
      hamburger.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('is-open');
      mobileBackdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
      mobileBackdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    hamburger.addEventListener('click', () => {
      hamburger.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    mobileBackdrop.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Hero: mouse parallax on blueprint + photo ---------- */
  const hero = document.getElementById('hero');
  const blueprint = document.getElementById('heroBlueprint');
  const heroPhoto = document.querySelector('.hero-photo');

  if (hero && window.gsap && !isCoarse && !reduceMotion) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(blueprint, { x: px * 26, y: py * 16, duration: 0.9, ease: 'power3.out' });
      gsap.to(heroPhoto, { x: px * -14, y: py * -8, duration: 1.1, ease: 'power3.out' });
    });
  }

  /* ---------- Hero scroll parallax + entrance ---------- */
  if (window.gsap) {
    gsap.from('.hero-kicker, .hero-title, .hero-sub, .hero-actions', {
      y: 26, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.5
    });
    gsap.from('.hero-figure', {
      y: 16, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 1
    });

    if (window.ScrollTrigger && !reduceMotion) {
      gsap.to('.hero-photo', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  }

  /* ---------- Count-up figures on view ---------- */
  const figures = document.querySelectorAll('.fig-num');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const isDecimal = String(target).includes('.');
      const obj = { val: 0 };
      if (window.gsap) {
        gsap.to(obj, {
          val: target, duration: 1.8, ease: 'power2.out',
          onUpdate: () => { el.textContent = isDecimal ? obj.val.toFixed(1) : Math.round(obj.val); }
        });
      } else {
        el.textContent = target;
      }
      countObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  figures.forEach(f => countObserver.observe(f));

  /* ---------- Section reveals (GSAP ScrollTrigger, one style, used broadly but lightly) ---------- */
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.utils.toArray('.service-card').forEach((card) => {
      gsap.set(card, { transformOrigin: 'top center' });
    });
  }

  /* ---------- Portfolio: drag-to-scroll ---------- */
  const track = document.getElementById('portfolioTrack');
  if (track) {
    let isDown = false, startX, scrollStart;
    const start = (x) => { isDown = true; track.classList.add('is-dragging'); startX = x; scrollStart = track.scrollLeft; };
    const move = (x) => { if (!isDown) return; track.scrollLeft = scrollStart - (x - startX); };
    const end = () => { isDown = false; track.classList.remove('is-dragging'); };

    track.addEventListener('mousedown', (e) => start(e.pageX));
    window.addEventListener('mousemove', (e) => move(e.pageX));
    window.addEventListener('mouseup', end);
    track.addEventListener('touchstart', (e) => start(e.touches[0].pageX), { passive: true });
    track.addEventListener('touchmove', (e) => move(e.touches[0].pageX), { passive: true });
    track.addEventListener('touchend', end);
  }

  /* ---------- Testimonials slider ---------- */
  const testiTrack = document.getElementById('testiTrack');
  const testiDotsWrap = document.getElementById('testiDots');
  if (testiTrack && testiDotsWrap) {
    const cards = testiTrack.querySelectorAll('.testi-card');
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => {
        testiTrack.scrollTo({ left: testiTrack.clientWidth * i, behavior: 'smooth' });
      });
      testiDotsWrap.appendChild(dot);
    });
    const dots = testiDotsWrap.querySelectorAll('button');

    const updateDots = () => {
      const idx = Math.round(testiTrack.scrollLeft / testiTrack.clientWidth);
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    };
    testiTrack.addEventListener('scroll', () => { window.requestAnimationFrame(updateDots); }, { passive: true });

    let autoTimer = setInterval(() => {
      const idx = Math.round(testiTrack.scrollLeft / testiTrack.clientWidth);
      const next = (idx + 1) % cards.length;
      testiTrack.scrollTo({ left: testiTrack.clientWidth * next, behavior: 'smooth' });
    }, 6000);
    testiTrack.addEventListener('mouseenter', () => clearInterval(autoTimer));
  }

  /* ---------- Forms (front-end only demo) ---------- */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      formNote.textContent = 'Thanks — an allocations lead will reply within one business day.';
      contactForm.reset();
    });
  }
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      input.value = 'Subscribed ✓';
      setTimeout(() => { input.value = ''; }, 2200);
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
/* =========================================================
   ABOUT PAGE — new interactions (appended; every block is
   guarded so it silently does nothing on index.html).
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  const isCoarseAb = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const reduceMotionAb = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero: split the headline into words and stagger them in ---------- */
  const abHeroTitle = document.getElementById('abHeroTitle');
  if (abHeroTitle) {
    const words = abHeroTitle.textContent.trim().split(/\s+/);
    abHeroTitle.innerHTML = words.map((w, i) =>
      `<span class="ab-word"><span class="ab-word-inner" style="transition-delay:${(i * 0.055).toFixed(2)}s">${w}</span></span>`
    ).join(' ');
    // Runs on load regardless of scroll position — two rAFs ensure the
    // browser has painted the starting (translated) state first.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => abHeroTitle.classList.add('is-revealed'));
    });
  }

  /* ---------- Generic reveal-on-scroll for [data-ab-inview] ---------- */
  const abInviewEls = document.querySelectorAll('[data-ab-inview]');
  if (abInviewEls.length) {
    const abObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          abObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });
    abInviewEls.forEach(el => abObserver.observe(el));
  }

  /* ---------- Timeline: scroll-drawn progress line ---------- */
  const abTimeline = document.getElementById('abTimeline');
  const timelineProgress = document.getElementById('timelineProgress');
  if (abTimeline && timelineProgress) {
    const updateTimeline = () => {
      const rect = abTimeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh * 0.5;
      const covered = Math.min(Math.max(vh * 0.75 - rect.top, 0), total);
      const pct = total > 0 ? (covered / total) * 100 : 0;
      timelineProgress.style.height = pct + '%';
    };
    window.addEventListener('scroll', () => window.requestAnimationFrame(updateTimeline), { passive: true });
    window.addEventListener('resize', updateTimeline);
    updateTimeline();
  }

  /* ---------- Values: tap-to-flip on touch devices ---------- */
  document.querySelectorAll('.ab-flip-card').forEach(card => {
    card.addEventListener('click', () => {
      if (isCoarseAb) card.classList.toggle('is-flipped');
    });
  });

  /* ---------- Stats: animated SVG rings + count-up ---------- */
  const abRings = document.querySelectorAll('.ab-ring');
  if (abRings.length) {
    const CIRC = 2 * Math.PI * 52; // matches r=52 in the SVG markup
    const animateRing = (ring) => {
      const target = parseFloat(ring.dataset.target) || 0;
      const bar = ring.querySelector('.ab-ring-bar');
      const numEl = ring.querySelector('.ab-ring-num');
      if (bar) bar.style.strokeDasharray = CIRC;
      const duration = 1500;
      const start = performance.now();
      const ease = t => 1 - Math.pow(1 - t, 3);
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eT = ease(t);
        const val = target * eT;
        if (bar) bar.style.strokeDashoffset = CIRC - (CIRC * (val / 100));
        if (numEl) numEl.textContent = Math.round(val);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const ringObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateRing(entry.target);
          ringObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    abRings.forEach(r => ringObserver.observe(r));
  }

  /* ---------- Culture gallery: magnetic tilt (desktop only) ---------- */
  if (!isCoarseAb && !reduceMotionAb) {
    document.querySelectorAll('.ab-gallery-item').forEach(item => {
      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        item.style.transform = `rotateX(${(-py * 10).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) scale(1.03)`;
      });
      item.addEventListener('mouseleave', () => { item.style.transform = ''; });
    });
  }

  /* ---------- Join CTA: background parallax on scroll ---------- */
  const abCtaBg = document.getElementById('abCtaBg');
  if (abCtaBg && !reduceMotionAb) {
    const updateCtaParallax = () => {
      const rect = abCtaBg.parentElement.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      const progress = (vh - rect.top) / (vh + rect.height);
      const shift = (progress - 0.5) * 60;
      abCtaBg.style.transform = `translateY(${shift.toFixed(1)}px)`;
    };
    window.addEventListener('scroll', () => window.requestAnimationFrame(updateCtaParallax), { passive: true });
    window.addEventListener('resize', updateCtaParallax);
    updateCtaParallax();
  }

});
/* =========================================================
   SERVICES PAGE (services.html) — additive, self-contained.
   Every handler is guarded so this block is a silent no-op
   on any page that doesn't have these elements.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  const isCoarseSvc = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const reduceMotionSvc = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero: trigger the draw-in underline once painted ---------- */
  const svcHero = document.querySelector('.svc-hero');
  if (svcHero) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => svcHero.classList.add('is-ready'));
    });
  }

  /* ---------- Core services: single-open accordion ---------- */
  const accItems = document.querySelectorAll('.svc-acc-item');
  if (accItems.length) {
    accItems.forEach(item => {
      const trigger = item.querySelector('.svc-acc-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        accItems.forEach(other => {
          other.classList.remove('is-open');
          const t = other.querySelector('.svc-acc-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------- Process: horizontal scroll-drawn connector path ---------- */
  const svcPathWrap = document.getElementById('svcPathWrap');
  const svcPathDraw = document.getElementById('svcPathDraw');
  if (svcPathWrap && svcPathDraw) {
    const pathLength = svcPathDraw.getTotalLength();
    svcPathDraw.style.strokeDasharray = pathLength;
    svcPathDraw.style.strokeDashoffset = pathLength;

    const updatePathDraw = () => {
      const rect = svcPathWrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.25;
      const total = rect.top - end - (start - end) < 0 ? 1 : (start - end);
      let progress = (start - rect.top) / (start - end);
      progress = Math.min(Math.max(progress, 0), 1);
      svcPathDraw.style.strokeDashoffset = pathLength * (1 - progress);
    };
    window.addEventListener('scroll', () => window.requestAnimationFrame(updatePathDraw), { passive: true });
    window.addEventListener('resize', updatePathDraw);
    updatePathDraw();
  }

  /* ---------- Process steps: fade up into view ---------- */
  const svcPathSteps = document.querySelectorAll('.svc-path-step[data-svc-inview]');
  if (svcPathSteps.length) {
    const svcStepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          svcStepObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    svcPathSteps.forEach(el => svcStepObserver.observe(el));
  }

  /* ---------- Engagement models: tab switch with sliding indicator ---------- */
  const svcTabBtns = document.querySelectorAll('.svc-tab-btn');
  const svcTabIndicator = document.getElementById('svcTabIndicator');
  if (svcTabBtns.length && svcTabIndicator) {
    const moveIndicator = (btn) => {
      svcTabIndicator.style.width = btn.offsetWidth + 'px';
      svcTabIndicator.style.transform = `translateX(${btn.offsetLeft - 6}px)`;
    };
    const activeBtn = document.querySelector('.svc-tab-btn.is-active') || svcTabBtns[0];
    // Wait a tick so layout (fonts/webfonts) has settled before measuring.
    requestAnimationFrame(() => moveIndicator(activeBtn));
    window.addEventListener('resize', () => {
      const current = document.querySelector('.svc-tab-btn.is-active');
      if (current) moveIndicator(current);
    });

    svcTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.svcTab;
        svcTabBtns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        moveIndicator(btn);
        document.querySelectorAll('.svc-tab-panel').forEach(panel => {
          panel.classList.toggle('is-active', panel.dataset.svcPanel === target);
        });
      });
    });
  }

  /* ---------- Engagement models: cursor-tracked spotlight on cards ---------- */
  if (!isCoarseSvc && !reduceMotionSvc) {
    document.querySelectorAll('.svc-spot-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* ---------- Stats: odometer digit-roll counters ---------- */
  const svcOdoEls = document.querySelectorAll('.svc-odo');
  if (svcOdoEls.length) {
    svcOdoEls.forEach(odo => {
      const raw = odo.dataset.svcOdo || '0';
      const suffix = odo.dataset.svcSuffix || '';
      const digitsWrap = odo.querySelector('.svc-odo-digits');
      if (!digitsWrap) return;

      const chars = raw.split('');
      const reels = [];
      chars.forEach(ch => {
        if (/[0-9]/.test(ch)) {
          const reel = document.createElement('span');
          reel.className = 'svc-odo-reel';
          const strip = document.createElement('span');
          strip.className = 'svc-odo-reel-strip';
          for (let d = 0; d <= 9; d++) {
            const s = document.createElement('span');
            s.textContent = d;
            strip.appendChild(s);
          }
          reel.appendChild(strip);
          digitsWrap.appendChild(reel);
          reels.push({ strip, target: parseInt(ch, 10) });
        } else {
          const staticEl = document.createElement('span');
          staticEl.className = 'svc-odo-static';
          staticEl.textContent = ch;
          digitsWrap.appendChild(staticEl);
        }
      });
      if (suffix) {
        const suffixEl = document.createElement('span');
        suffixEl.className = 'svc-odo-static';
        suffixEl.textContent = suffix;
        digitsWrap.appendChild(suffixEl);
      }
      odo._svcReels = reels;
    });

    const rollOdometer = (odo) => {
      (odo._svcReels || []).forEach((r, i) => {
        setTimeout(() => {
          r.strip.style.transform = `translateY(-${r.target * 1.25}em)`;
        }, i * 90);
      });
    };
    const odoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          rollOdometer(entry.target);
          odoObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    svcOdoEls.forEach(o => odoObserver.observe(o));
  }

  /* ---------- FAQ: accordion synced to a crossfading photo panel ---------- */
  const svcFaqItems = document.querySelectorAll('.svc-faq-item');
  const svcFaqImg = document.querySelector('.svc-faq-img-stack .svc-faq-img');
  if (svcFaqItems.length) {
    svcFaqItems.forEach(item => {
      const q = item.querySelector('.svc-faq-q');
      if (!q) return;
      q.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        svcFaqItems.forEach(other => {
          other.classList.remove('is-open');
          const otherQ = other.querySelector('.svc-faq-q');
          if (otherQ) otherQ.setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          item.classList.add('is-open');
          q.setAttribute('aria-expanded', 'true');
          const img = item.dataset.svcImg;
          if (img && svcFaqImg && svcFaqImg.src !== img) {
            svcFaqImg.style.opacity = '0';
            setTimeout(() => {
              svcFaqImg.src = img;
              svcFaqImg.style.opacity = '1';
            }, 220);
          }
        }
      });
    });
  }

  /* ---------- CTA: parallax dot field + magnetic button ---------- */
  const svcCta = document.getElementById('svcCta');
  const svcCtaDots = document.getElementById('svcCtaDots');
  const svcMagnetBtn = document.getElementById('svcMagnetBtn');
  if (svcCta && !reduceMotionSvc) {
    svcCta.addEventListener('mousemove', (e) => {
      const rect = svcCta.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      if (svcCtaDots) {
        svcCtaDots.style.backgroundPosition = `${(-px * 24).toFixed(1)}px ${(-py * 24).toFixed(1)}px`;
      }
      if (svcMagnetBtn && !isCoarseSvc) {
        const btnRect = svcMagnetBtn.getBoundingClientRect();
        const bx = e.clientX - (btnRect.left + btnRect.width / 2);
        const by = e.clientY - (btnRect.top + btnRect.height / 2);
        const dist = Math.hypot(bx, by);
        if (dist < 140) {
          svcMagnetBtn.style.transform = `translate(${(bx * 0.28).toFixed(1)}px, ${(by * 0.28).toFixed(1)}px)`;
        } else {
          svcMagnetBtn.style.transform = '';
        }
      }
    });
    svcCta.addEventListener('mouseleave', () => {
      if (svcMagnetBtn) svcMagnetBtn.style.transform = '';
    });
  }

});
/* =========================================================
   BLOG PAGE — new interactions (appended; every block is
   guarded so it silently does nothing on other pages).
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  const isCoarseBl = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const reduceMotionBl = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero: rotating word swap ---------- */
  const blRotate = document.getElementById('blRotate');
  if (blRotate) {
    const words = blRotate.querySelectorAll('.bl-rotate-word');
    let idx = 0;
    if (words.length > 1 && !reduceMotionBl) {
      setInterval(() => {
        const current = words[idx];
        const next = words[(idx + 1) % words.length];
        current.classList.add('is-leaving');
        current.classList.remove('is-active');
        next.classList.add('is-active');
        setTimeout(() => current.classList.remove('is-leaving'), 500);
        idx = (idx + 1) % words.length;
      }, 2800);
    }
  }

  /* ---------- Generic reveal-on-scroll for [data-bl-inview] ---------- */
  const blInviewEls = document.querySelectorAll('[data-bl-inview]');
  if (blInviewEls.length) {
    const blObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          blObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    blInviewEls.forEach(el => blObserver.observe(el));
  }

  /* ---------- Featured: ripple on the CTA button ---------- */
  const blFeatBtn = document.querySelector('.bl-feat-btn');
  if (blFeatBtn) {
    blFeatBtn.addEventListener('click', (e) => {
      const rect = blFeatBtn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'bl-ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      blFeatBtn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  }

  /* ---------- Insights grid: sliding pill filter ---------- */
  const blFilterBar = document.getElementById('blFilterBar');
  const blFilterIndicator = document.getElementById('blFilterIndicator');
  const blGrid = document.getElementById('blGrid');
  const blGridEmpty = document.getElementById('blGridEmpty');
  if (blFilterBar && blFilterIndicator && blGrid) {
    const blFilterBtns = blFilterBar.querySelectorAll('.bl-filter-btn');
    const blCards = blGrid.querySelectorAll('.bl-card');

    const moveIndicator = (btn) => {
      blFilterIndicator.style.width = btn.offsetWidth + 'px';
      blFilterIndicator.style.transform = `translateX(${btn.offsetLeft - 6}px)`;
    };

    const applyFilter = (filter) => {
      let visibleCount = 0;
      blCards.forEach((card, i) => {
        const match = filter === 'all' || card.dataset.cat === filter;
        if (match) {
          visibleCount++;
          card.classList.remove('is-out');
          card.style.transitionDelay = (i * 0.04) + 's';
        } else {
          card.classList.add('is-out');
          card.style.transitionDelay = '0s';
        }
      });
      if (blGridEmpty) blGridEmpty.classList.toggle('is-visible', visibleCount === 0);
    };

    blFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        blFilterBar.querySelector('.bl-filter-btn.is-active')?.classList.remove('is-active');
        btn.classList.add('is-active');
        moveIndicator(btn);
        applyFilter(btn.dataset.filter);
      });
    });

    const activeBtn = blFilterBar.querySelector('.bl-filter-btn.is-active') || blFilterBtns[0];
    requestAnimationFrame(() => moveIndicator(activeBtn));
    window.addEventListener('resize', () => {
      const current = blFilterBar.querySelector('.bl-filter-btn.is-active');
      if (current) moveIndicator(current);
    });
  }

  /* ---------- Insights grid: subtle tilt on hover (desktop only) ---------- */
  if (!isCoarseBl && !reduceMotionBl) {
    document.querySelectorAll('.bl-card').forEach(card => {
      const body = card.querySelector('.bl-card-body');
      if (!body) return;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        body.style.transform = `rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => { body.style.transform = ''; });
    });
  }

  /* ---------- Meet the writers: swipeable stacked card deck ---------- */
  const blAuthorDeck = document.getElementById('blAuthorDeck');
  if (blAuthorDeck) {
    let order = Array.from(blAuthorDeck.querySelectorAll('.bl-author-card'));
    const blAuthorDots = document.getElementById('blAuthorDots');
    const blAuthorPrev = document.getElementById('blAuthorPrev');
    const blAuthorNext = document.getElementById('blAuthorNext');
    let animating = false;

    // Build one dot per card, keyed to each card's fixed data-author id.
    order.forEach(card => {
      const dot = document.createElement('span');
      dot.dataset.author = card.dataset.author;
      blAuthorDots.appendChild(dot);
    });
    const dots = Array.from(blAuthorDots.children);

    const render = () => { order.forEach((card, i) => { card.dataset.stack = i; }); };
    const updateDots = () => {
      const frontId = order[0].dataset.author;
      dots.forEach(d => d.classList.toggle('is-active', d.dataset.author === frontId));
    };

    const goNext = () => {
      if (animating) return;
      animating = true;
      const front = order[0];
      front.classList.add('is-exiting-right');
      setTimeout(() => {
        front.classList.add('bl-no-anim');
        order.push(order.shift());
        render();
        updateDots();
        requestAnimationFrame(() => requestAnimationFrame(() => {
          front.classList.remove('is-exiting-right', 'bl-no-anim');
          animating = false;
        }));
      }, 480);
    };

    const goPrev = () => {
      if (animating) return;
      animating = true;
      const back = order[order.length - 1];
      back.classList.add('bl-no-anim', 'is-entering-left');
      order.unshift(order.pop());
      render();
      updateDots();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        back.classList.remove('bl-no-anim');
        back.classList.remove('is-entering-left');
        setTimeout(() => { animating = false; }, 480);
      }));
    };

    render();
    updateDots();
    if (blAuthorNext) blAuthorNext.addEventListener('click', goNext);
    if (blAuthorPrev) blAuthorPrev.addEventListener('click', goPrev);
    dots.forEach(dot => dot.addEventListener('click', () => {
      const targetIdx = order.findIndex(c => c.dataset.author === dot.dataset.author);
      if (targetIdx <= 0 || animating) return;
      // step forward that many times so the exit animation still plays
      let steps = targetIdx;
      const run = () => { if (steps-- > 0) setTimeout(() => { goNext(); run(); }, 520); };
      run();
    }));

    // Swipe/drag the front card left or right.
    let dragging = false, dragStartX = 0;
    const onDown = (x) => { dragging = true; dragStartX = x; };
    const onUp = (x) => {
      if (!dragging) return;
      dragging = false;
      const dx = x - dragStartX;
      if (dx < -60) goNext();
      else if (dx > 60) goPrev();
    };
    blAuthorDeck.addEventListener('mousedown', (e) => {
      if (e.target.closest('[data-stack="0"]')) onDown(e.clientX);
    });
    window.addEventListener('mouseup', (e) => onUp(e.clientX));
    blAuthorDeck.addEventListener('touchstart', (e) => {
      if (e.target.closest('[data-stack="0"]')) onDown(e.touches[0].clientX);
    }, { passive: true });
    blAuthorDeck.addEventListener('touchend', (e) => onUp(e.changedTouches[0].clientX));
  }

  /* ---------- Archive: load more (slide-down reveal) ---------- */
  const blLoadMore = document.getElementById('blLoadMore');
  if (blLoadMore) {
    blLoadMore.addEventListener('click', () => {
      const hidden = document.querySelectorAll('.bl-archive-row--more:not(.is-shown)');
      hidden.forEach((row, i) => {
        setTimeout(() => {
          row.classList.add('is-shown');
          row.classList.add('is-inview');
        }, i * 120);
      });
      blLoadMore.classList.add('is-open', 'is-done');
      blLoadMore.querySelector('.bl-load-more-text').textContent = 'That\u2019s everything';
      blLoadMore.setAttribute('aria-expanded', 'true');
    });
  }

  /* ---------- Digest: paper-plane submit animation ---------- */
  const blDigestForm = document.getElementById('blDigestForm');
  const blDigestSuccess = document.getElementById('blDigestSuccess');
  if (blDigestForm && blDigestSuccess) {
    blDigestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (blDigestForm.classList.contains('is-sending')) return;
      blDigestForm.classList.add('is-sending');
      setTimeout(() => {
        blDigestForm.classList.add('is-hidden');
        blDigestSuccess.classList.add('is-visible');
      }, 650);
    });
  }

});

/* =========================================================
   CONTACT PAGE — new interactions (appended; every block is
   guarded so it silently does nothing on other pages).
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  const isCoarseCt = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const reduceMotionCt = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero: ambient rising particles ---------- */
  const ctParticles = document.getElementById('ctParticles');
  if (ctParticles && !reduceMotionCt) {
    const count = isCoarseCt ? 14 : 26;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'ct-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
      p.style.animationDuration = (7 + Math.random() * 8) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      ctParticles.appendChild(p);
    }
  }

  /* ---------- Hero: one-time text-scramble reveal ---------- */
  const ctScramble = document.getElementById('ctScramble');
  if (ctScramble) {
    const finalText = ctScramble.dataset.final || ctScramble.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    if (reduceMotionCt) {
      ctScramble.textContent = finalText;
    } else {
      let frame = 0;
      const totalFrames = 26;
      const revealCount = () => Math.floor((frame / totalFrames) * finalText.length);
      const tick = () => {
        const settled = revealCount();
        let out = '';
        for (let i = 0; i < finalText.length; i++) {
          const ch = finalText[i];
          if (ch === ' ') { out += ' '; continue; }
          if (i < settled) out += ch;
          else out += chars[Math.floor(Math.random() * chars.length)];
        }
        ctScramble.textContent = out;
        frame++;
        if (frame <= totalFrames) requestAnimationFrame(() => setTimeout(tick, 28));
        else ctScramble.textContent = finalText;
      };
      tick();
    }
  }

  /* ---------- Contact methods: cursor-spotlight ---------- */
  if (!isCoarseCt) {
    document.querySelectorAll('.ct-method-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
    });
  }

  /* ---------- Contact form: floating labels + progress + check + confetti ---------- */
  const ctForm = document.getElementById('ctForm');
  if (ctForm) {
    const segMap = [
      document.querySelector('.ct-progress-seg[data-seg="0"]'),
      document.querySelector('.ct-progress-seg[data-seg="1"]'),
      document.querySelector('.ct-progress-seg[data-seg="2"]')
    ];
    const ctName = document.getElementById('ctName');
    const ctEmail = document.getElementById('ctEmail');
    const ctMsg = document.getElementById('ctMsg');
    const updateProgress = () => {
      segMap[0]?.classList.toggle('is-filled', ctName.value.trim().length > 0);
      segMap[1]?.classList.toggle('is-filled', /\S+@\S+\.\S+/.test(ctEmail.value));
      segMap[2]?.classList.toggle('is-filled', ctMsg.value.trim().length > 4);
    };
    [ctName, ctEmail, ctMsg].forEach(el => el && el.addEventListener('input', updateProgress));

    const ctSubmit = document.getElementById('ctSubmit');
    const ctConfetti = document.getElementById('ctConfetti');
    const ctFormNote = document.getElementById('ctFormNote');

    const burstConfetti = () => {
      if (!ctConfetti || reduceMotionCt) return;
      const colors = ['#c6a15b', '#ede8df', '#0b1215'];
      for (let i = 0; i < 18; i++) {
        const bit = document.createElement('span');
        bit.className = 'ct-confetti-bit';
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 70;
        bit.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        bit.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        bit.style.setProperty('--rot', (Math.random() * 360) + 'deg');
        bit.style.background = colors[i % colors.length];
        bit.style.animationDelay = (Math.random() * 0.1) + 's';
        ctConfetti.appendChild(bit);
        setTimeout(() => bit.remove(), 1000);
      }
    };

    ctForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!ctForm.checkValidity()) {
        ctForm.reportValidity();
        return;
      }
      ctSubmit.classList.add('is-sent');
      burstConfetti();
      if (ctFormNote) ctFormNote.textContent = "Thanks — we've got it and will reply within two business hours.";
      setTimeout(() => {
        ctForm.reset();
        updateProgress();
        ctSubmit.classList.remove('is-sent');
      }, 3200);
    });
  }

  /* ---------- Offices + Map: shared branch data drives the office panel,
     the office tabs, and the embedded Google Map together ---------- */
  const ctOfficeTabs = document.getElementById('ctOfficeTabs');
  if (ctOfficeTabs) {
    const offices = {
      bengaluru: {
        tag: 'Headquarters', city: 'Bengaluru - Stackly',
        address: 'Khata No 10, Begur - Koppa Rd, in front of SNN Raj Serenity<br>Suraksha Nagar, Yelenahalli, Begur, Bengaluru, Karnataka 560114',
        phone: '+91 80 555 0123', hours: 'Mon–Sat, 10:00–18:00 IST',
        img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=760&q=45&fm=webp',
        alt: "Stackly's Bengaluru office building",
        mapQuery: 'Khata No 10, Begur - Koppa Rd, in front of SNN Raj Serenity, Suraksha Nagar, Yelenahalli, Begur, Bengaluru, Karnataka 560114'
      },
      hyderabad: {
        tag: 'Telangana desk', city: 'Hyderabad - Stackly',
        address: 'SBH Officers Colony, Chanda Naik Nagar<br>Madhapur, Hyderabad, Telangana 500081',
        phone: '+91 40 555 0187', hours: 'Mon–Sat, 10:00–18:00 IST',
        img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=760&q=45&fm=webp',
        alt: "Stackly's Hyderabad office building",
        mapQuery: 'SBH Officers Colony, Chanda Naik Nagar, Madhapur, Hyderabad, Telangana 500081'
      },
      coimbatore: {
        tag: 'Manufacturing & textile desk', city: 'Coimbatore - Stackly',
        address: '79 Aiswarya Complex, Nethaji Road<br>PN Palayam, Coimbatore, Tamil Nadu 641037',
        phone: '+91 422 555 0187', hours: 'Mon–Sat, 10:00–18:00 IST',
        img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=760&q=45&fm=webp',
        alt: "Stackly's Coimbatore office building",
        mapQuery: '79 Aiswarya Complex, Nethaji Road, PN Palayam, Coimbatore, Tamil Nadu 641037'
      }
    };

    const tabs = ctOfficeTabs.querySelectorAll('.ct-office-tab');
    const mapCities = document.querySelectorAll('.ct-map-city');
    const img = document.getElementById('ctOfficeImg');
    const pin = document.getElementById('ctOfficePin');
    const tag = document.getElementById('ctOfficeTag');
    const city = document.getElementById('ctOfficeCity');
    const address = document.getElementById('ctOfficeAddress');
    const phone = document.getElementById('ctOfficePhone');
    const hours = document.getElementById('ctOfficeHours');
    const directionsBtn = document.getElementById('ctDirectionsBtn');

    const ctMapFrameWrap = document.getElementById('ctMapFrameWrap');
    const ctMapFrame = document.getElementById('ctMapFrame');

    const loadMap = (data, { isInitial } = {}) => {
      if (!ctMapFrameWrap || !ctMapFrame) return;
      const markLoaded = () => ctMapFrameWrap.classList.add('is-loaded');
      if (!isInitial) {
        ctMapFrameWrap.classList.remove('is-loaded');
        ctMapFrame.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(data.mapQuery) + '&t=&z=15&ie=UTF8&iwloc=&output=embed';
      }
      ctMapFrame.addEventListener('load', markLoaded, { once: true });
      setTimeout(markLoaded, 3000); // safety net if the load event is missed (e.g. a cached frame)
    };

    const setOffice = (key) => {
      const data = offices[key];
      if (!data) return;

      tabs.forEach(t => t.classList.toggle('is-active', t.dataset.office === key));
      mapCities.forEach(c => c.classList.toggle('is-active', c.dataset.office === key));

      img.style.animation = 'none';
      void img.offsetWidth;
      img.src = data.img;
      img.alt = data.alt;
      img.style.animation = '';

      pin.style.animation = 'none';
      void pin.offsetWidth;
      pin.style.animation = '';

      tag.textContent = data.tag;
      city.textContent = data.city;
      address.innerHTML = data.address;
      phone.textContent = data.phone;
      hours.textContent = data.hours;

      // Google works out the visitor's own location once they open this —
      // no browser geolocation permission needed on our side.
      if (directionsBtn) {
        directionsBtn.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(data.mapQuery);
      }

      loadMap(data);
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (!tab.classList.contains('is-active')) setOffice(tab.dataset.office);
      });
    });

    mapCities.forEach(c => {
      c.addEventListener('click', () => {
        if (!c.classList.contains('is-active')) setOffice(c.dataset.office);
      });
    });

    // Wire the loader to the map that's already in the HTML (don't reset its
    // src — that could silently no-op the load event in some browsers).
    const initialKey = ctOfficeTabs.querySelector('.ct-office-tab.is-active')?.dataset.office || 'bengaluru';
    loadMap(offices[initialKey], { isInitial: true });
    if (directionsBtn && offices[initialKey]) {
      directionsBtn.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(offices[initialKey].mapQuery);
    }
  }

  /* ---------- Testimonial: scroll-driven word highlight ---------- */
  const ctQuoteText = document.getElementById('ctQuoteText');
  if (ctQuoteText) {
    const words = ctQuoteText.textContent.trim().split(/\s+/);
    ctQuoteText.innerHTML = words.map(w => `<span class="ct-word">${w}</span>`).join(' ');
    const wordEls = ctQuoteText.querySelectorAll('.ct-word');

    if (reduceMotionCt) {
      wordEls.forEach(w => w.classList.add('is-lit'));
    } else {
      const updateHighlight = () => {
        const rect = ctQuoteText.getBoundingClientRect();
        const vh = window.innerHeight;
        const start = vh * 0.85;
        const end = vh * 0.35;
        const progress = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);
        const litCount = Math.round(progress * wordEls.length);
        wordEls.forEach((w, i) => w.classList.toggle('is-lit', i < litCount));
      };
      window.addEventListener('scroll', () => window.requestAnimationFrame(updateHighlight), { passive: true });
      window.addEventListener('resize', updateHighlight);
      updateHighlight();
    }
  }

  /* ---------- Schedule: sliding day indicator + time slots ---------- */
  const ctDayStrip = document.getElementById('ctDayStrip');
  if (ctDayStrip) {
    const days = ctDayStrip.querySelectorAll('.ct-day');
    const indicator = document.getElementById('ctDayIndicator');
    const slots = document.querySelectorAll('.ct-slot');
    const confirmBox = document.getElementById('ctScheduleConfirm');
    const confirmDetail = document.getElementById('ctConfirmDetail');
    let selectedDayLabel = 'Mon 08';

    const moveIndicator = (day) => {
      indicator.style.width = day.offsetWidth + 'px';
      indicator.style.transform = `translateX(${day.offsetLeft}px)`;
    };

    const restartSlotStagger = () => {
      slots.forEach((slot, i) => {
        slot.style.animation = 'none';
        slot.classList.remove('is-selected');
        void slot.offsetWidth;
        slot.style.animation = '';
        slot.style.animationDelay = (i * 0.06) + 's';
      });
      confirmBox.classList.remove('is-visible');
    };

    days.forEach(day => {
      day.addEventListener('click', () => {
        days.forEach(d => d.classList.remove('is-active'));
        day.classList.add('is-active');
        moveIndicator(day);
        selectedDayLabel = day.querySelector('.ct-day-name').textContent + ' ' + day.querySelector('.ct-day-num').textContent;
        restartSlotStagger();
      });
    });

    slots.forEach(slot => {
      slot.addEventListener('click', () => {
        slots.forEach(s => s.classList.remove('is-selected'));
        slot.classList.add('is-selected');
        confirmDetail.textContent = `${selectedDayLabel}, ${slot.textContent}`;
        confirmBox.classList.add('is-visible');
      });
    });

    const activeDay = ctDayStrip.querySelector('.ct-day.is-active') || days[0];
    requestAnimationFrame(() => moveIndicator(activeDay));
    window.addEventListener('resize', () => moveIndicator(ctDayStrip.querySelector('.ct-day.is-active') || days[0]));
  }

});

/* =========================================================
   AUTH PAGES (login.html / signup.html) — appended; every
   block is guarded so it silently does nothing elsewhere.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Password show/hide toggle ---------- */
  document.querySelectorAll('.au-eye-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = targetId ? document.getElementById(targetId) : btn.closest('.au-field')?.querySelector('input');
      if (!input) return;
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      btn.setAttribute('aria-pressed', String(!showing));
      btn.innerHTML = showing ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
    });
  });

  /* ---------- Role toggle (shared by login + signup) ---------- */
  const initRoleToggle = (toggleId, indicatorId) => {
    const toggle = document.getElementById(toggleId);
    const indicator = document.getElementById(indicatorId);
    if (!toggle || !indicator) return null;
    const btns = toggle.querySelectorAll('.au-role-btn');
    let current = toggle.querySelector('.au-role-btn.is-active')?.dataset.role || 'user';

    const move = (btn) => {
      indicator.style.width = btn.offsetWidth + 'px';
      indicator.style.transform = `translateX(${btn.offsetLeft - 4}px)`;
    };
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        current = btn.dataset.role;
        move(btn);
      });
    });
    requestAnimationFrame(() => move(toggle.querySelector('.au-role-btn.is-active')));
    window.addEventListener('resize', () => move(toggle.querySelector('.au-role-btn.is-active')));
    return { get: () => current };
  };

  const loginRole = initRoleToggle('loginRoleToggle', 'loginRoleIndicator');
  const signupRole = initRoleToggle('signupRoleToggle', 'signupRoleIndicator');

  /* ---------- Shared helpers: inline validation, no alert() anywhere ---------- */
  const markField = (fieldEl, valid) => {
    if (!fieldEl) return;
    fieldEl.classList.toggle('is-invalid', !valid);
    if (!valid) {
      // restart the shake animation on repeated invalid submits
      fieldEl.classList.remove('is-invalid');
      void fieldEl.offsetWidth;
      fieldEl.classList.add('is-invalid');
    }
  };
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const nameFromEmail = (email) => {
    const local = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
    return local.replace(/\b\w/g, c => c.toUpperCase()) || 'there';
  };

  /* ---------- Login form ---------- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const emailInput = document.getElementById('loginEmail');
    const passInput = document.getElementById('loginPassword');
    const submitBtn = document.getElementById('loginSubmit');

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (submitBtn.classList.contains('is-loading')) return;

      const emailOk = isValidEmail(emailInput.value.trim());
      const passOk = passInput.value.length >= 6;
      markField(emailInput.closest('.au-field'), emailOk);
      markField(passInput.closest('.au-field'), passOk);
      if (!emailOk) { emailInput.focus(); return; }
      if (!passOk) { passInput.focus(); return; }

      const role = loginRole ? loginRole.get() : 'user';
      submitBtn.classList.add('is-loading');

      setTimeout(() => {
        // Keep a name from a previous signup if there is one; otherwise derive
        // a friendly display name from the email so the dashboard greeting
        // still feels personal.
        if (!localStorage.getItem('stackly_user_name')) {
          localStorage.setItem('stackly_user_name', nameFromEmail(emailInput.value.trim()));
        }
        localStorage.setItem('stackly_user_email', emailInput.value.trim());
        localStorage.setItem('stackly_user_role', role);
        window.location.href = role === 'admin' ? 'dashboard-admin.html' : 'dashboard-user.html';
      }, 900);
    });

    [emailInput, passInput].forEach(input => {
      input?.addEventListener('input', () => input.closest('.au-field')?.classList.remove('is-invalid'));
    });
  }

  /* ---------- Signup form ---------- */
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    const nameInput = document.getElementById('suName');
    const emailInput = document.getElementById('suEmail');
    const passInput = document.getElementById('suPassword');
    const confirmInput = document.getElementById('suConfirm');
    const termsBox = document.getElementById('suTerms');
    const termsRow = document.getElementById('suTermsRow');
    const submitBtn = document.getElementById('signupSubmit');
    const strengthFill = document.getElementById('suStrengthFill');
    const strengthLabel = document.getElementById('suStrengthLabel');

    const scoreStrength = (val) => {
      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
      if (/\d/.test(val) && /[^A-Za-z0-9]/.test(val)) score++;
      return score; // 0-4
    };
    passInput?.addEventListener('input', () => {
      const val = passInput.value;
      const score = scoreStrength(val);
      const pct = val.length === 0 ? 0 : Math.max(18, (score / 4) * 100);
      strengthFill.style.width = pct + '%';
      strengthFill.classList.remove('is-fair', 'is-strong');
      if (!val.length) { strengthLabel.textContent = 'Password strength'; return; }
      if (score <= 1) { strengthLabel.textContent = 'Weak password'; }
      else if (score <= 2) { strengthFill.classList.add('is-fair'); strengthLabel.textContent = 'Fair password'; }
      else { strengthFill.classList.add('is-strong'); strengthLabel.textContent = 'Strong password'; }
    });

    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (submitBtn.classList.contains('is-loading')) return;

      const nameOk = nameInput.value.trim().length > 1;
      const emailOk = isValidEmail(emailInput.value.trim());
      const passOk = passInput.value.length >= 6;
      const confirmOk = passOk && confirmInput.value === passInput.value;
      const termsOk = termsBox.checked;

      markField(nameInput.closest('.au-field'), nameOk);
      markField(emailInput.closest('.au-field'), emailOk);
      markField(passInput.closest('.au-field'), passOk);
      markField(confirmInput.closest('.au-field'), confirmOk);
      if (termsRow) {
        termsRow.classList.toggle('is-invalid', !termsOk);
        if (!termsOk) { termsRow.classList.remove('is-invalid'); void termsRow.offsetWidth; termsRow.classList.add('is-invalid'); }
      }

      if (!nameOk) { nameInput.focus(); return; }
      if (!emailOk) { emailInput.focus(); return; }
      if (!passOk) { passInput.focus(); return; }
      if (!confirmOk) { confirmInput.focus(); return; }
      if (!termsOk) return;

      const role = signupRole ? signupRole.get() : 'user';
      submitBtn.classList.add('is-loading');

      setTimeout(() => {
        localStorage.setItem('stackly_user_name', nameInput.value.trim());
        localStorage.setItem('stackly_user_email', emailInput.value.trim());
        localStorage.setItem('stackly_user_role', role);

        signupForm.classList.add('is-hidden');
        const successEl = document.getElementById('signupSuccess');
        const successEmail = document.getElementById('signupSuccessEmail');
        if (successEmail) successEmail.textContent = emailInput.value.trim();
        if (successEl) successEl.style.display = 'flex';

        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
      }, 900);
    });

    [nameInput, emailInput, passInput, confirmInput].forEach(input => {
      input?.addEventListener('input', () => input.closest('.au-field')?.classList.remove('is-invalid'));
    });
    termsBox?.addEventListener('change', () => termsRow?.classList.remove('is-invalid'));
  }

});

/* =========================================================
   DASHBOARD SHELL (dashboard-admin.html / dashboard-user.html)
   appended; every block is guarded so it silently does
   nothing on pages without a dashboard shell.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  const dshBody = document.querySelector('.dsh-body');
  if (!dshBody) return; // not a dashboard page

  const role = dshBody.dataset.role === 'admin' ? 'admin' : 'user';

  /* ---------- Sidebar: hamburger + backdrop, mobile off-canvas ---------- */
  const sidebar = document.getElementById('dshSidebar');
  const backdrop = document.getElementById('dshBackdrop');
  const hamburger = document.getElementById('dshHamburger');
  if (sidebar && backdrop && hamburger) {
    const openSidebar = () => {
      sidebar.classList.add('is-open');
      backdrop.classList.add('is-visible');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const closeSidebar = () => {
      sidebar.classList.remove('is-open');
      backdrop.classList.remove('is-visible');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    hamburger.addEventListener('click', () => {
      sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
    });
    backdrop.addEventListener('click', closeSidebar);
    sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', closeSidebar));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });
  }

  /* ---------- Personalize greeting, avatar and profile name ---------- */
  const storedName = localStorage.getItem('stackly_user_name');
  const displayName = storedName || (role === 'admin' ? 'Admin' : 'there');
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const greetingEl = document.getElementById('dshGreeting');
  if (greetingEl) greetingEl.textContent = `${timeGreeting}, ${displayName} 👋`;

  const avatarEl = document.getElementById('dshAvatar');
  if (avatarEl) avatarEl.textContent = (storedName ? storedName.trim()[0] : (role === 'admin' ? 'A' : 'U')).toUpperCase();

  const profileNameEl = document.getElementById('dshProfileName');
  if (profileNameEl) profileNameEl.textContent = storedName || (role === 'admin' ? 'Admin' : 'Investor');

  /* ---------- Logout: clear the demo session and return to login ---------- */
  const logoutBtn = document.getElementById('dshLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('stackly_user_name');
      localStorage.removeItem('stackly_user_email');
      localStorage.removeItem('stackly_user_role');
      window.location.href = 'login.html';
    });
  }

  /* ---------- View switching: sidebar nav (and any "View all" button)
     swaps the visible page inside the shell — no reload. ---------- */
  const dshViews = document.querySelectorAll('.dsh-view');
  const dshNavLinks = document.querySelectorAll('.dsh-nav-link[data-view]');
  const dshContentEl = document.querySelector('.dsh-content');

  const switchView = (key) => {
    if (!key) return;
    dshViews.forEach(v => v.classList.toggle('is-active', v.dataset.view === key));
    dshNavLinks.forEach(l => l.classList.toggle('is-active', l.dataset.view === key));
    dshContentEl?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (key === 'reports') {
      // bars start at height 0 in CSS; grow them each time this view opens
      requestAnimationFrame(() => {
        document.querySelectorAll('.dsh-chart-bar').forEach(bar => bar.classList.add('is-grown'));
      });
    }
  };

  dshNavLinks.forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); switchView(link.dataset.view); });
  });
  document.querySelectorAll('[data-goto-view]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); switchView(el.dataset.gotoView); });
  });

  /* ---------- Messages: one shared dataset renders both the Overview
     mini-panel and the full two-pane inbox on the Messages view. ---------- */
  const mailData = (role === 'admin' ? [
    { sender: 'Priya Shankar', initials: 'PS', subject: 'Question about my allocation', preview: 'Hi team, I wanted to check on the timing for my Cedar Row allocation…', full: 'Hi team, I wanted to check on the timing for my Cedar Row allocation and whether the K-1 will be available before tax season this year.', time: '9:14 AM', unread: true },
    { sender: 'Fatima Noor', initials: 'FN', subject: 'Listing approval — Coimbatore Retail', preview: 'The Coimbatore listing is ready for final review whenever you have a…', full: 'The Coimbatore listing is ready for final review whenever you have a moment — occupancy docs and the appraisal are both attached.', time: 'Yesterday', unread: true },
    { sender: 'Arjun Mehta', initials: 'AM', subject: 'Withdrawal request', preview: 'Could someone confirm the processing time on a partial withdrawal…', full: 'Could someone confirm the processing time on a partial withdrawal from my Sunbelt Industrial position? Wanted to plan around it.', time: 'Yesterday', unread: false },
    { sender: 'David Osei', initials: 'DO', subject: 'Q1 report draft attached', preview: 'Attaching the first draft of the Q1 portfolio summary for review…', full: 'Attaching the first draft of the Q1 portfolio summary for review before it goes out to investors on Friday.', time: 'Mon', unread: false },
    { sender: 'R. Kapoor', initials: 'RK', subject: 'Thank you for the update', preview: 'Appreciate the quick turnaround on the last note — very helpful…', full: 'Appreciate the quick turnaround on the last note — very helpful ahead of our committee meeting next week.', time: 'Last week', unread: false },
    { sender: 'Meera Iyer', initials: 'MI', subject: 'Bengaluru Tech Park — site visit', preview: 'Can we schedule a site visit for the Bengaluru Tech Park listing…', full: 'Can we schedule a site visit for the Bengaluru Tech Park listing sometime next week? A few committee members want to see it in person.', time: 'Last week', unread: false }
  ] : [
    { sender: 'Investor Relations', initials: 'IR', subject: 'Your Q1 report is ready', preview: 'Your Cedar Row Apartments performance report for Q1 is now available…', full: 'Your Cedar Row Apartments performance report for Q1 is now available in Documents — occupancy held at 96% for the quarter.', time: '10:02 AM', unread: true },
    { sender: 'Stackly Journal', initials: 'SJ', subject: 'New note: Cap rates are compressing again', preview: 'This week\u2019s note looks at where cap rates are moving and why…', full: 'This week\u2019s note looks at where cap rates are moving and why it matters for your Sunbelt positions specifically.', time: 'Yesterday', unread: true },
    { sender: 'Accounts Team', initials: 'AT', subject: 'Your 2024 K-1 is available', preview: 'Your K-1 tax form for the 2024 tax year has been uploaded to your…', full: 'Your K-1 tax form for the 2024 tax year has been uploaded to your Documents tab and is ready to download.', time: '2 days ago', unread: false },
    { sender: 'David Osei', initials: 'DO', subject: 'Re: Coimbatore Retail update', preview: 'Thanks for the question — occupancy dipped slightly this quarter…', full: 'Thanks for the question — occupancy dipped slightly this quarter due to one tenant transition, already re-leased for next month.', time: '4 days ago', unread: false },
    { sender: 'Investor Relations', initials: 'IR', subject: 'Payout confirmation', preview: 'This confirms your payout of $2,140 has been sent to your account…', full: 'This confirms your payout of $2,140 has been sent to your account on file — allow 2-3 business days to appear.', time: 'Last week', unread: false },
    { sender: 'Stackly Journal', initials: 'SJ', subject: 'Founding thesis, revisited', preview: 'A short note on why we still buy fewer, better assets…', full: 'A short note on why we still buy fewer, better assets — and how that discipline shaped the positions in your own portfolio.', time: 'Last week', unread: false }
  ]).map((m, i) => ({ ...m, id: i }));

  const updateAllMailBadges = () => {
    const unreadCount = mailData.filter(m => m.unread).length;
    document.getElementById('dshMailBadge')?.replaceChildren(document.createTextNode(unreadCount));
    document.getElementById('dshFullMailBadge')?.replaceChildren(document.createTextNode(unreadCount));
  };

  // -- Overview mini-panel: compact, expand-in-place, no detail pane --
  const mailList = document.getElementById('dshMailList');
  if (mailList) {
    const mailTabs = document.getElementById('dshMailTabs');
    let activeFilter = 'all';

    const renderMiniMail = () => {
      mailList.innerHTML = '';
      mailData.filter(m => activeFilter === 'all' || m.unread).slice(0, 6).forEach((msg, i) => {
        const row = document.createElement('div');
        row.className = 'dsh-mail-row' + (msg.unread ? ' is-unread' : '');
        row.style.animationDelay = (i * 0.06) + 's';
        row.innerHTML = `
          <span class="dsh-mail-avatar">${msg.initials}</span>
          <span class="dsh-mail-dot"></span>
          <div class="dsh-mail-body">
            <div class="dsh-mail-top-row">
              <span class="dsh-mail-sender">${msg.sender}</span>
              <span class="dsh-mail-time">${msg.time}</span>
            </div>
            <div class="dsh-mail-subject">${msg.subject}</div>
            <div class="dsh-mail-preview">${msg.preview}</div>
            <div class="dsh-mail-full">${msg.full}</div>
          </div>
        `;
        row.addEventListener('click', () => {
          const wasOpen = row.classList.contains('is-open');
          mailList.querySelectorAll('.dsh-mail-row.is-open').forEach(r => { if (r !== row) r.classList.remove('is-open'); });
          row.classList.toggle('is-open', !wasOpen);
          if (msg.unread) { msg.unread = false; row.classList.remove('is-unread'); updateAllMailBadges(); }
        });
        mailList.appendChild(row);
      });
    };

    mailTabs?.querySelectorAll('.dsh-mail-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        mailTabs.querySelector('.dsh-mail-tab.is-active')?.classList.remove('is-active');
        tab.classList.add('is-active');
        activeFilter = tab.dataset.filter;
        renderMiniMail();
      });
    });
    renderMiniMail();
  }

  // -- Full inbox: search + filter + a real detail pane with reply --
  const fullMailList = document.getElementById('dshFullMailList');
  if (fullMailList) {
    const search = document.getElementById('dshFullMailSearch');
    const tabs = document.getElementById('dshFullMailTabs');
    const detail = document.getElementById('dshMailDetail');
    const shell = document.getElementById('dshFullMailShell');
    let filter = 'all', query = '', selectedId = null;

    const renderDetail = (msg) => {
      if (!detail) return;
      if (!msg) {
        detail.innerHTML = '<div class="dsh-mail-detail-empty"><i class="fa-regular fa-envelope-open"></i><p>Select a message to read it here.</p></div>';
        shell?.classList.remove('is-detail-open');
        return;
      }
      detail.innerHTML = `
        <button class="dsh-mail-detail-back" id="dshMailBack"><i class="fa-solid fa-arrow-left"></i> Back to inbox</button>
        <div class="dsh-mail-detail-head">
          <span class="dsh-mail-detail-avatar">${msg.initials}</span>
          <div><strong>${msg.sender}</strong><span>${msg.time}</span></div>
        </div>
        <div class="dsh-mail-detail-subject">${msg.subject}</div>
        <div class="dsh-mail-detail-body">${msg.full}</div>
        <div class="dsh-reply-box">
          <textarea placeholder="Write a reply…"></textarea>
          <div class="dsh-reply-row">
            <button class="dsh-reply-btn" id="dshReplyBtn">Send reply</button>
            <span class="dsh-reply-sent" id="dshReplySent"><i class="fa-solid fa-check"></i> Reply sent</span>
          </div>
        </div>
      `;
      shell?.classList.add('is-detail-open');
      document.getElementById('dshMailBack')?.addEventListener('click', () => shell?.classList.remove('is-detail-open'));
      const textarea = detail.querySelector('textarea');
      const replySent = document.getElementById('dshReplySent');
      document.getElementById('dshReplyBtn')?.addEventListener('click', () => {
        if (!textarea.value.trim()) { textarea.focus(); return; }
        replySent.classList.add('is-visible');
        textarea.value = '';
        setTimeout(() => replySent.classList.remove('is-visible'), 2400);
      });
    };

    const renderFullMail = () => {
      fullMailList.innerHTML = '';
      const q = query.trim().toLowerCase();
      const rows = mailData.filter(m =>
        (filter === 'all' || m.unread) &&
        (!q || m.sender.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.preview.toLowerCase().includes(q))
      );
      rows.forEach((msg, i) => {
        const row = document.createElement('div');
        row.className = 'dsh-mail-row' + (msg.unread ? ' is-unread' : '') + (msg.id === selectedId ? ' is-selected' : '');
        row.style.animationDelay = (i * 0.05) + 's';
        row.innerHTML = `
          <span class="dsh-mail-avatar">${msg.initials}</span>
          <span class="dsh-mail-dot"></span>
          <div class="dsh-mail-body">
            <div class="dsh-mail-top-row"><span class="dsh-mail-sender">${msg.sender}</span><span class="dsh-mail-time">${msg.time}</span></div>
            <div class="dsh-mail-subject">${msg.subject}</div>
            <div class="dsh-mail-preview">${msg.preview}</div>
          </div>
        `;
        row.addEventListener('click', () => {
          selectedId = msg.id;
          if (msg.unread) { msg.unread = false; updateAllMailBadges(); }
          renderFullMail();
          renderDetail(msg);
        });
        fullMailList.appendChild(row);
      });
      if (rows.length === 0) {
        fullMailList.innerHTML = '<p class="dsh-empty-note is-visible">No messages match that search.</p>';
      }
    };

    search?.addEventListener('input', () => { query = search.value; renderFullMail(); });
    tabs?.querySelectorAll('.dsh-mail-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.querySelector('.dsh-mail-tab.is-active')?.classList.remove('is-active');
        tab.classList.add('is-active');
        filter = tab.dataset.filter;
        renderFullMail();
      });
    });
    renderFullMail();
  }

  updateAllMailBadges();

  /* ---------- My Investments (user): filterable, dynamically rendered ---------- */
  const investGrid = document.getElementById('dshInvestGrid');
  if (investGrid) {
    const investments = [
      { name: 'Cedar Row Apartments', type: 'Multifamily', location: 'Austin, TX', cat: 'multifamily', gain: 8.2, up: true, invested: 25000, current: 27050 },
      { name: 'Sunbelt Industrial Fund II', type: 'Fund', location: 'Diversified', cat: 'fund', gain: 5.1, up: true, invested: 15000, current: 15765 },
      { name: '301 Congress Land Parcel', type: 'Land banking', location: 'Austin, TX', cat: 'land', gain: 2.4, up: true, invested: 10000, current: 10240 },
      { name: 'Coimbatore Retail Center', type: 'Commercial', location: 'Coimbatore', cat: 'commercial', gain: -1.2, up: false, invested: 18000, current: 17784 },
      { name: '555 California Street Office', type: 'Commercial', location: 'San Francisco, CA', cat: 'commercial', gain: 3.6, up: true, invested: 18000, current: 18648 },
      { name: 'Cedar Row Apartments — Phase II', type: 'Multifamily', location: 'Austin, TX', cat: 'multifamily', gain: 1.8, up: true, invested: 12000, current: 12216 }
    ];
    const filters = document.getElementById('dshInvestFilters');
    let cat = 'all';

    const renderInvest = () => {
      investGrid.innerHTML = '';
      investments.filter(inv => cat === 'all' || inv.cat === cat).forEach((inv, i) => {
        const card = document.createElement('div');
        card.className = 'dsh-invest-card';
        card.style.animationDelay = (i * 0.05) + 's';
        card.innerHTML = `
          <div class="dsh-invest-top">
            <div><h4>${inv.name}</h4><span class="dsh-invest-type">${inv.type} · ${inv.location}</span></div>
            <span class="dsh-invest-gain ${inv.up ? 'is-up' : 'is-down'}"><i class="fa-solid fa-arrow-${inv.up ? 'up' : 'down'}"></i> ${Math.abs(inv.gain)}%</span>
          </div>
          <div class="dsh-invest-figures">
            <div><strong>$${inv.invested.toLocaleString()}</strong>Invested</div>
            <div><strong>$${inv.current.toLocaleString()}</strong>Current value</div>
          </div>
        `;
        investGrid.appendChild(card);
      });
    };
    filters?.querySelectorAll('.dsh-pill').forEach(p => {
      p.addEventListener('click', () => {
        filters.querySelector('.dsh-pill.is-active')?.classList.remove('is-active');
        p.classList.add('is-active');
        cat = p.dataset.investFilter;
        renderInvest();
      });
    });
    renderInvest();
  }

  /* ---------- Documents (user): filterable, dynamically rendered ---------- */
  const docList = document.getElementById('dshDocList');
  if (docList) {
    const docs = [
      { name: '2024 K-1 Tax Form', cat: 'tax', date: 'Mar 2, 2025', size: '482 KB' },
      { name: '2023 K-1 Tax Form', cat: 'tax', date: 'Mar 4, 2024', size: '465 KB' },
      { name: 'Q1 2025 Portfolio Report', cat: 'report', date: 'Apr 1, 2025', size: '1.2 MB' },
      { name: 'Q4 2024 Portfolio Report', cat: 'report', date: 'Jan 5, 2025', size: '1.1 MB' },
      { name: 'Cedar Row Purchase Agreement', cat: 'legal', date: 'Jun 12, 2022', size: '3.4 MB' },
      { name: 'Subscription Agreement — Sunbelt Fund II', cat: 'legal', date: 'Feb 18, 2025', size: '2.1 MB' },
      { name: 'Operating Agreement', cat: 'legal', date: 'Jun 12, 2022', size: '1.8 MB' }
    ];
    const iconFor = (cat) => cat === 'tax' ? 'fa-file-invoice-dollar' : cat === 'legal' ? 'fa-file-contract' : 'fa-file-lines';
    const filters = document.getElementById('dshDocFilters');
    let cat = 'all';

    const renderDocs = () => {
      docList.innerHTML = '';
      const rows = docs.filter(d => cat === 'all' || d.cat === cat);
      rows.forEach((doc, i) => {
        const row = document.createElement('div');
        row.className = 'dsh-doc-row';
        row.style.animationDelay = (i * 0.05) + 's';
        row.innerHTML = `
          <span class="dsh-doc-icon is-${doc.cat}"><i class="fa-solid ${iconFor(doc.cat)}"></i></span>
          <div class="dsh-doc-body"><strong>${doc.name}</strong><span>${doc.date} · ${doc.size}</span></div>
          <button class="dsh-doc-download" aria-label="Download"><i class="fa-solid fa-download"></i></button>
        `;
        row.querySelector('.dsh-doc-download').addEventListener('click', function () {
          this.innerHTML = '<i class="fa-solid fa-check"></i>';
          setTimeout(() => { this.innerHTML = '<i class="fa-solid fa-download"></i>'; }, 1800);
        });
        docList.appendChild(row);
      });
      if (rows.length === 0) docList.innerHTML = '<p class="dsh-empty-note is-visible">No documents in this category yet.</p>';
    };
    filters?.querySelectorAll('.dsh-pill').forEach(p => {
      p.addEventListener('click', () => {
        filters.querySelector('.dsh-pill.is-active')?.classList.remove('is-active');
        p.classList.add('is-active');
        cat = p.dataset.docFilter;
        renderDocs();
      });
    });
    renderDocs();
  }

  /* ---------- Users (admin): searchable, filterable table ---------- */
  const usersBody = document.getElementById('dshUsersBody');
  if (usersBody) {
    const users = [
      { name: 'Priya Shankar', email: 'priya.shankar@example.com', role: 'user', joined: 'Today', status: 'pending' },
      { name: 'Arjun Mehta', email: 'arjun.mehta@example.com', role: 'user', joined: 'Yesterday', status: 'active' },
      { name: 'Fatima Noor', email: 'fatima.noor@example.com', role: 'admin', joined: '2 days ago', status: 'active' },
      { name: 'David Osei', email: 'david.osei@example.com', role: 'user', joined: '3 days ago', status: 'active' },
      { name: 'R. Kapoor', email: 'r.kapoor@example.com', role: 'user', joined: '5 days ago', status: 'pending' },
      { name: 'Meera Iyer', email: 'meera.iyer@example.com', role: 'user', joined: '6 days ago', status: 'active' },
      { name: 'Karthik Raja', email: 'karthik.raja@example.com', role: 'user', joined: '1 week ago', status: 'active' },
      { name: 'Elena Ford', email: 'elena.ford@example.com', role: 'admin', joined: '2 weeks ago', status: 'active' },
      { name: 'Divya Prakash', email: 'divya.prakash@example.com', role: 'user', joined: '3 weeks ago', status: 'pending' },
      { name: 'Vikram Sethi', email: 'vikram.sethi@example.com', role: 'user', joined: '1 month ago', status: 'active' }
    ];
    const search = document.getElementById('dshUserSearch');
    const filters = document.getElementById('dshUserFilters');
    const empty = document.getElementById('dshUsersEmpty');
    let roleFilter = 'all', q = '';

    const renderUsers = () => {
      usersBody.innerHTML = '';
      const query = q.trim().toLowerCase();
      const rows = users.filter(u =>
        (roleFilter === 'all' || u.role === roleFilter) &&
        (!query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
      );
      rows.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${u.name}</td><td>${u.email}</td>
          <td><span class="dsh-role-pill">${u.role === 'admin' ? 'Admin' : 'User'}</span></td>
          <td>${u.joined}</td>
          <td><span class="dsh-status is-${u.status}">${u.status === 'active' ? 'Active' : 'Pending'}</span></td>
          <td><button class="dsh-action-link">Manage</button></td>
        `;
        usersBody.appendChild(tr);
      });
      empty?.classList.toggle('is-visible', rows.length === 0);
    };
    search?.addEventListener('input', () => { q = search.value; renderUsers(); });
    filters?.querySelectorAll('.dsh-pill').forEach(p => {
      p.addEventListener('click', () => {
        filters.querySelector('.dsh-pill.is-active')?.classList.remove('is-active');
        p.classList.add('is-active');
        roleFilter = p.dataset.roleFilter;
        renderUsers();
      });
    });
    renderUsers();
  }

  /* ---------- Listings (admin): filterable property grid ---------- */
  const listingGrid = document.getElementById('dshListingGrid');
  if (listingGrid) {
    const listings = [
      { name: 'Cedar Row Apartments', type: 'Multifamily · Austin, TX', status: 'active', price: '$4.8M', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=420&q=42&fm=webp' },
      { name: 'Coimbatore Retail Center', type: 'Commercial · Coimbatore', status: 'active', price: '$2.1M', img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=420&q=42&fm=webp' },
      { name: '301 Congress Land Parcel', type: 'Land · Austin, TX', status: 'pending', price: '$1.4M', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=420&q=42&fm=webp' },
      { name: '555 California Street Office', type: 'Commercial · San Francisco', status: 'sold', price: '$6.2M', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=420&q=42&fm=webp' },
      { name: 'Sunbelt Industrial Fund II', type: 'Fund · Diversified', status: 'active', price: '$15.0M', img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=420&q=42&fm=webp' },
      { name: 'Bengaluru Tech Park', type: 'Commercial · Bengaluru', status: 'pending', price: '$3.6M', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=420&q=42&fm=webp' },
      { name: 'Chennai Metro Residences', type: 'Multifamily · Chennai', status: 'active', price: '$2.9M', img: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=420&q=42&fm=webp' },
      { name: 'Hyderabad Business Center', type: 'Commercial · Hyderabad', status: 'sold', price: '$4.1M', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=420&q=42&fm=webp' }
    ];
    const filters = document.getElementById('dshListingFilters');
    let status = 'all';

    const renderListings = () => {
      listingGrid.innerHTML = '';
      listings.filter(l => status === 'all' || l.status === status).forEach((l, i) => {
        const card = document.createElement('div');
        card.className = 'dsh-listing-card';
        card.style.animationDelay = (i * 0.05) + 's';
        card.innerHTML = `
          <div class="dsh-listing-media">
            <img src="${l.img}" alt="${l.name}" loading="lazy">
            <span class="dsh-listing-status is-${l.status}">${l.status}</span>
          </div>
          <div class="dsh-listing-body">
            <h4>${l.name}</h4><span>${l.type}</span>
            <div class="dsh-listing-price">${l.price}</div>
          </div>
        `;
        listingGrid.appendChild(card);
      });
    };
    filters?.querySelectorAll('.dsh-pill').forEach(p => {
      p.addEventListener('click', () => {
        filters.querySelector('.dsh-pill.is-active')?.classList.remove('is-active');
        p.classList.add('is-active');
        status = p.dataset.listingFilter;
        renderListings();
      });
    });
    renderListings();
  }

  /* ---------- Reports (admin): dynamically rendered list ---------- */
  const reportList = document.getElementById('dshReportList');
  if (reportList) {
    const reports = [
      { name: 'Q1 2025 Portfolio Summary', date: 'Apr 1, 2025', size: '2.4 MB', type: 'report' },
      { name: 'Q4 2024 Portfolio Summary', date: 'Jan 6, 2025', size: '2.2 MB', type: 'report' },
      { name: 'Annual Compliance Report 2024', date: 'Feb 14, 2025', size: '4.1 MB', type: 'legal' },
      { name: 'Investor Distribution Summary — March', date: 'Apr 2, 2025', size: '980 KB', type: 'report' },
      { name: 'Platform Audit — FY2024', date: 'Jan 20, 2025', size: '3.6 MB', type: 'legal' }
    ];
    reports.forEach((r, i) => {
      const row = document.createElement('div');
      row.className = 'dsh-report-card';
      row.style.animationDelay = (i * 0.06) + 's';
      row.innerHTML = `
        <span class="dsh-report-icon"><i class="fa-solid ${r.type === 'legal' ? 'fa-file-contract' : 'fa-file-lines'}"></i></span>
        <div class="dsh-report-body"><strong>${r.name}</strong><span>${r.date} · ${r.size}</span></div>
        <button class="dsh-report-download"><i class="fa-solid fa-download"></i> Download</button>
      `;
      row.querySelector('.dsh-report-download').addEventListener('click', function () {
        this.classList.add('is-done');
        this.innerHTML = '<i class="fa-solid fa-check"></i> Downloaded';
        setTimeout(() => { this.classList.remove('is-done'); this.innerHTML = '<i class="fa-solid fa-download"></i> Download'; }, 2200);
      });
      reportList.appendChild(row);
    });
  }

  /* ---------- Settings: prefill from the session, save inline (no alert) ---------- */
  const settingsForm = document.getElementById('dshSettingsForm');
  if (settingsForm) {
    const nameInput = document.getElementById('dshSettingsName');
    const emailInput = document.getElementById('dshSettingsEmail');
    if (nameInput) nameInput.value = storedName || '';
    if (emailInput) emailInput.value = localStorage.getItem('stackly_user_email') || '';
    const savedNote = document.getElementById('dshSettingsSaved');

    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = nameInput?.value.trim();
      const newEmail = emailInput?.value.trim();
      if (newName) {
        localStorage.setItem('stackly_user_name', newName);
        if (greetingEl) greetingEl.textContent = `${timeGreeting}, ${newName} 👋`;
        if (profileNameEl) profileNameEl.textContent = newName;
        if (avatarEl) avatarEl.textContent = newName[0].toUpperCase();
      }
      if (newEmail) localStorage.setItem('stackly_user_email', newEmail);
      savedNote?.classList.add('is-visible');
      setTimeout(() => savedNote?.classList.remove('is-visible'), 2200);
    });

    document.getElementById('dshLogoutAllBtn')?.addEventListener('click', () => {
      localStorage.removeItem('stackly_user_name');
      localStorage.removeItem('stackly_user_email');
      localStorage.removeItem('stackly_user_role');
      window.location.href = 'login.html';
    });
  }

});


/* =========================================================
   404 PAGE (404.html) — "go back" button. Guarded, so it is
   a no-op on every other page.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const nfBackBtn = document.getElementById('nfBackBtn');
  if (nfBackBtn) {
    nfBackBtn.addEventListener('click', () => {
      // If there's real browser history to go back to, use it;
      // otherwise fall back to the homepage so the button never dead-ends.
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'index.html';
      }
    });
  }
});