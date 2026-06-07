/* ═══════════════════════════════════════════════════════
   ZTI Lab NS · script.js
   Cinematic scroll experience – GSAP + Lenis
═══════════════════════════════════════════════════════ */

'use strict';

// ── Prefers reduced motion ───────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ════════════════════════════════════════════════════
//  LENIS SMOOTH SCROLL
// ════════════════════════════════════════════════════
let lenis;

if (!prefersReducedMotion) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Connect Lenis to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

// ════════════════════════════════════════════════════
//  GSAP REGISTER PLUGINS
// ════════════════════════════════════════════════════
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ════════════════════════════════════════════════════
//  SCROLL PROGRESS BAR
// ════════════════════════════════════════════════════
const progressBar = document.getElementById('scrollProgress');

ScrollTrigger.create({
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => {
    gsap.set(progressBar, { scaleX: self.progress, transformOrigin: 'left center' });
  }
});

// ════════════════════════════════════════════════════
//  CUSTOM CURSOR
// ════════════════════════════════════════════════════
const cursor       = document.getElementById('cursor');
const cursorFollow = document.getElementById('cursorFollower');

if (cursor && cursorFollow && !prefersReducedMotion) {
  let mouseX = -100, mouseY = -100;
  let followX = -100, followY = -100;
  let raf_cursor;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(cursor, { x: mouseX, y: mouseY });
  });

  function animateFollower() {
    followX += (mouseX - followX) * 0.1;
    followY += (mouseY - followY) * 0.1;
    gsap.set(cursorFollow, { x: followX, y: followY });
    raf_cursor = requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover states
  const hoverTargets = document.querySelectorAll('a, button, .service-card, .portfolio-card, .workflow-card');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cursor,       { scale: 0.5, duration: 0.3 });
      gsap.to(cursorFollow, { scale: 2,   duration: 0.4, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(cursor,       { scale: 1, duration: 0.3 });
      gsap.to(cursorFollow, { scale: 1, duration: 0.4, ease: 'power2.out' });
    });
  });

  document.addEventListener('mouseleave', () => {
    gsap.to([cursor, cursorFollow], { opacity: 0, duration: 0.3 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to([cursor, cursorFollow], { opacity: 1, duration: 0.3 });
  });
}

// ════════════════════════════════════════════════════
//  NAVBAR – SCROLL BEHAVIOR
// ════════════════════════════════════════════════════
const navbar = document.getElementById('navbar');

ScrollTrigger.create({
  start: 'top+=80 top',
  onEnter:      () => navbar.classList.add('scrolled'),
  onLeaveBack:  () => navbar.classList.remove('scrolled'),
});

// ── Mobile menu toggle ───────────────────────────────
const navToggle  = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open', isOpen);
    const spans = navToggle.querySelectorAll('span');
    if (isOpen) {
      gsap.to(spans[0], { rotate: 45,  y: 6,  duration: 0.3 });
      gsap.to(spans[1], { rotate: -45, y: -6, duration: 0.3 });
    } else {
      gsap.to(spans[0], { rotate: 0, y: 0, duration: 0.3 });
      gsap.to(spans[1], { rotate: 0, y: 0, duration: 0.3 });
    }
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
      const spans = navToggle.querySelectorAll('span');
      gsap.to(spans, { rotate: 0, y: 0, duration: 0.3 });
    });
  });
}

// ── Smooth anchor scroll ─────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: -72, duration: 1.4 });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ════════════════════════════════════════════════════
//  HERO ENTRANCE ANIMATION
// ════════════════════════════════════════════════════
function initHeroEntrance() {
  const tl = gsap.timeline({ delay: 0.15 });

  // Eyebrow
  tl.to('#heroEyebrow', {
    opacity: 1, y: 0, duration: 1, ease: 'power3.out'
  }, 0);

  // Headline lines - staggered reveal
  const hlLines = document.querySelectorAll('.hl-line');
  hlLines.forEach((line, i) => {
    const inner = document.createElement('span');
    inner.style.display = 'block';
    inner.style.transform = 'translateY(100%)';
    inner.innerHTML = line.innerHTML;
    line.innerHTML = '';
    line.style.overflow = 'hidden';
    line.appendChild(inner);

    tl.to(inner, {
      y: '0%',
      duration: 1,
      ease: 'power4.out'
    }, 0.2 + i * 0.12);
  });

  // Sub and actions
  tl.to('#heroSub', {
    opacity: 1, y: 0, duration: 1, ease: 'power3.out'
  }, 0.6);

  tl.to('#heroActions', {
    opacity: 1, y: 0, duration: 1, ease: 'power3.out'
  }, 0.75);

  tl.to('#heroVisual', {
    opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out'
  }, 0.1);

  tl.to('.hero-meta', {
    opacity: 1, duration: 1, ease: 'power2.out'
  }, 1);

  tl.to('#scrollHint', {
    opacity: 1, duration: 1, ease: 'power2.out'
  }, 1.1);

  // Mark as loaded for CSS measurement lines
  setTimeout(() => document.body.classList.add('hero-loaded'), 1200);
}

// Set initial states
gsap.set('#heroVisual', { opacity: 0, scale: 0.96 });
gsap.set('#heroEyebrow', { opacity: 0, y: 12 });
gsap.set('#heroSub', { opacity: 0, y: 12 });
gsap.set('#heroActions', { opacity: 0, y: 12 });

window.addEventListener('load', initHeroEntrance);

// ════════════════════════════════════════════════════
//  HERO – SCROLL-DRIVEN PARALLAX
// ════════════════════════════════════════════════════
if (!prefersReducedMotion) {
  // Pin hero and animate on scroll
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      const p = self.progress;

      // Content moves up
      gsap.set('#heroContent', {
        y: p * -80,
        opacity: 1 - p * 1.8
      });

      // Visual scales slightly and tilts
      gsap.set('#heroVisual', {
        y: p * 60,
        scale: 1 + p * 0.05,
        rotation: p * 2
      });

      // Background gradient moves
      const grad = document.querySelector('.hero-bg-gradient');
      if (grad) gsap.set(grad, { y: p * 40 });

      // Scroll hint fades
      gsap.set('#scrollHint', { opacity: 1 - p * 4 });
    }
  });
}

// ════════════════════════════════════════════════════
//  SECTION TITLE – SPLIT TEXT REVEAL
// ════════════════════════════════════════════════════
function splitAndReveal(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    // Skip if already processed
    if (el.dataset.split) return;
    el.dataset.split = '1';

    const html = el.innerHTML;
    const lines = html.split('<br/>').join('<br>').split('<br>');

    el.innerHTML = lines.map(line =>
      `<span class="line-wrap"><span class="line-inner" style="display:block;transform:translateY(110%);opacity:0;">${line}</span></span>`
    ).join('');

    const inners = el.querySelectorAll('.line-inner');

    ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(inners, {
          y: '0%',
          opacity: 1,
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.1
        });
      }
    });
  });
}

// Run after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  splitAndReveal('.section-title');
  splitAndReveal('.precision-title');
  splitAndReveal('.trust-title');
  splitAndReveal('.contact-title');
});

// ════════════════════════════════════════════════════
//  EYEBROW REVEALS
// ════════════════════════════════════════════════════
document.querySelectorAll('.section-eyebrow').forEach(el => {
  gsap.set(el, { opacity: 0, x: -16 });
  ScrollTrigger.create({
    trigger: el,
    start: 'top 88%',
    once: true,
    onEnter: () => gsap.to(el, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' })
  });
});

// ════════════════════════════════════════════════════
//  SERVICES – STAGGERED PARALLAX CARDS
// ════════════════════════════════════════════════════
function initServices() {
  const cards = document.querySelectorAll('.service-card');
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0, y: 50 });

  ScrollTrigger.create({
    trigger: '.services-grid',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: { amount: 0.6, from: 'start' }
      });
    }
  });

  // Magnetic hover effect on cards
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty('--mx', `${mx}%`);
      card.style.setProperty('--my', `${my}%`);

      gsap.to(card, {
        rotateX: -y * 0.3,
        rotateY: x * 0.3,
        z: 8,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 800
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        z: 0,
        duration: 0.7,
        ease: 'power3.out'
      });
    });
  });
}

initServices();

// ════════════════════════════════════════════════════
//  PRECISION – STICKY LEFT, SCROLLING RIGHT
// ════════════════════════════════════════════════════
function initPrecision() {
  const items = document.querySelectorAll('.precision-item');
  const counter = document.getElementById('precisionCount');
  if (!items.length) return;

  items.forEach((item, i) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 55%',
      end: 'bottom 45%',
      onEnter: () => {
        items.forEach(it => it.classList.remove('active'));
        item.classList.add('active');
        if (counter) {
          counter.textContent = String(i + 1).padStart(2, '0');
        }
      },
      onEnterBack: () => {
        items.forEach(it => it.classList.remove('active'));
        item.classList.add('active');
        if (counter) {
          counter.textContent = String(i + 1).padStart(2, '0');
        }
      }
    });
  });

  // Animate items in on scroll
  items.forEach((item, i) => {
    gsap.set(item, { opacity: 0.15, x: 20 });
    ScrollTrigger.create({
      trigger: item,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(item, {
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: i * 0.05
        });
      }
    });
  });
}

initPrecision();

// ════════════════════════════════════════════════════
//  WORKFLOW – HORIZONTAL SCROLL (PINNED)
// ════════════════════════════════════════════════════
function initWorkflow() {
  const section  = document.querySelector('.workflow');
  const wrap     = document.getElementById('workflowWrap');
  const track    = document.getElementById('workflowTrack');
  const fill     = document.getElementById('workflowFill');
  const label    = document.getElementById('workflowLabel');
  const cards    = document.querySelectorAll('.workflow-card');

  if (!section || !track || prefersReducedMotion) return;

  // Wait a tick for layout
  requestAnimationFrame(() => {
    const trackWidth    = track.scrollWidth;
    const viewportWidth = wrap.offsetWidth;
    const scrollDist    = trackWidth - viewportWidth + 64;

    if (scrollDist <= 0) return;

    gsap.to(track, {
      x: -scrollDist,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 10%',
        end: `+=${scrollDist * 1.5}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          // Progress bar
          if (fill) gsap.set(fill, { scaleX: self.progress, transformOrigin: 'left' });

          // Active card
          const active = Math.round(self.progress * (cards.length - 1));
          cards.forEach((c, i) => c.classList.toggle('wf-active', i === active));

          // Label
          if (label) {
            label.textContent = `${String(active + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
          }
        }
      }
    });
  });
}

initWorkflow();

// ════════════════════════════════════════════════════
//  PORTFOLIO – CINEMATIC REVEAL
// ════════════════════════════════════════════════════
function initPortfolio() {
  const cards = document.querySelectorAll('.portfolio-card');
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0, y: 40, scale: 0.98 });

  ScrollTrigger.create({
    trigger: '.portfolio-grid',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: { amount: 0.7, from: 'start' }
      });
    }
  });
}

initPortfolio();

// ════════════════════════════════════════════════════
//  TRUST – PILLAR REVEALS
// ════════════════════════════════════════════════════
function initTrust() {
  const pillars = document.querySelectorAll('.trust-pillar');
  if (!pillars.length) return;

  gsap.set(pillars, { opacity: 0, y: 30 });

  ScrollTrigger.create({
    trigger: '.trust-pillars',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to(pillars, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12
      });
    }
  });

  // Quote reveal
  const quote = document.querySelector('.trust-quote');
  if (quote) {
    gsap.set(quote, { opacity: 0, y: 20 });
    ScrollTrigger.create({
      trigger: '.trust-statement',
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(quote, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' })
    });
  }
}

initTrust();

// ════════════════════════════════════════════════════
//  CONTACT – CARD REVEALS
// ════════════════════════════════════════════════════
function initContact() {
  const cards = document.querySelectorAll('.contact-card');
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0, y: 40 });

  ScrollTrigger.create({
    trigger: '.contact-grid',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.15
      });
    }
  });

  // Background brightening on scroll into contact
  const contactBg = document.querySelector('.contact-bg');
  if (contactBg) {
    ScrollTrigger.create({
      trigger: '.contact',
      start: 'top 60%',
      end: 'center center',
      scrub: 1,
      onUpdate: (self) => {
        gsap.set(contactBg, { opacity: self.progress });
      }
    });
  }
}

initContact();

// ════════════════════════════════════════════════════
//  PORTFOLIO CARD HOVER – 3D TILT
// ════════════════════════════════════════════════════
document.querySelectorAll('.portfolio-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;

    gsap.to(card, {
      rotateX: -y,
      rotateY: x,
      z: 10,
      duration: 0.6,
      ease: 'power2.out',
      transformPerspective: 1000
    });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      z: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  });
});

// ════════════════════════════════════════════════════
//  DENTAL VISUAL – SUBTLE AMBIENT ROTATION
// ════════════════════════════════════════════════════
if (!prefersReducedMotion) {
  const orbSvg = document.querySelector('.orb-svg');
  if (orbSvg) {
    // Gentle ambient floating
    gsap.to(orbSvg, {
      y: -12,
      rotation: 1.5,
      duration: 6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });
  }

  const glowRing = document.querySelector('.orb-glow-ring');
  if (glowRing) {
    gsap.to(glowRing, {
      scale: 1.04,
      opacity: 0.5,
      duration: 4,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });
  }
}

// ════════════════════════════════════════════════════
//  FOOTER REVEAL
// ════════════════════════════════════════════════════
const footerEls = document.querySelectorAll('.footer-brand, .footer-links, .footer-copy');
if (footerEls.length) {
  gsap.set(footerEls, { opacity: 0, y: 16 });
  ScrollTrigger.create({
    trigger: '.footer',
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.to(footerEls, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12
      });
    }
  });
}

// ════════════════════════════════════════════════════
//  GENERAL SECTION FADE-IN (for sections not covered above)
// ════════════════════════════════════════════════════
document.querySelectorAll('.section-header').forEach(el => {
  const child = el.querySelector('.section-eyebrow');
  // Eyebrow handled separately above; animate title
  const title = el.querySelector('.section-title');
  if (title && !title.dataset.split) {
    gsap.set(title, { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: title,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(title, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
    });
  }
});

// ════════════════════════════════════════════════════
//  HORIZONTAL LINE ANIMATIONS (decorative)
// ════════════════════════════════════════════════════
document.querySelectorAll('.pi-line').forEach(line => {
  gsap.set(line, {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '1px',
    width: '100%',
    background: 'linear-gradient(90deg, rgba(200,169,110,0.2), transparent)',
  });
});

// ════════════════════════════════════════════════════
//  REFRESH SCROLLTRIGGER ON RESIZE
// ════════════════════════════════════════════════════
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 200);
});

// ════════════════════════════════════════════════════
//  CONTACT CARD – SUBTLE BACKGROUND LIGHT FOLLOW
// ════════════════════════════════════════════════════
document.querySelectorAll('.contact-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.background = `radial-gradient(circle at ${x}% ${y}%, #222018 0%, #141412 60%)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});

// ════════════════════════════════════════════════════
//  WORKFLOW CARD – DESKTOP HOVER DEPTH
// ════════════════════════════════════════════════════
document.querySelectorAll('.workflow-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
    gsap.to(card, {
      rotateX: -y,
      rotateY: x,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 800
    });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: 'power3.out'
    });
  });
});

// ════════════════════════════════════════════════════
//  MOBILE – DISABLE CURSOR TRACKING
// ════════════════════════════════════════════════════
if (window.matchMedia('(pointer: coarse)').matches) {
  if (cursor)       cursor.style.display = 'none';
  if (cursorFollow) cursorFollow.style.display = 'none';
  document.body.style.cursor = 'auto';
}

// ════════════════════════════════════════════════════
//  INIT ALL SCROLLTRIGGER
// ════════════════════════════════════════════════════
ScrollTrigger.refresh();

console.log('%cZTI Lab NS · Laboratorija za zubnu tehniku · Novi Sad', 'color:#c8a96e; font-family:Georgia,serif; font-size:13px; padding:8px 0;');