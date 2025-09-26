// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');
const headerEl = document.querySelector('.site-header');
const navEl = document.querySelector('.site-nav');

// Respect prefers-reduced-motion
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setHeaderOffset() {
  const h1 = headerEl ? headerEl.offsetHeight : 0;
  const h2 = navEl ? navEl.offsetHeight : 0;
  const total = h1 + h2;
  document.documentElement.style.setProperty('--header-total', `${total}px`);
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    requestAnimationFrame(() => {
      setHeaderOffset();
      updateActiveLink(); // recalc after layout changes
    });
  });
  // Close menu on link click (mobile)
  navMenu.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      requestAnimationFrame(() => {
        setHeaderOffset();
        updateActiveLink();
      });
    }
  });
}

// Smooth scroll with offset correction for sticky header
function scrollWithOffset(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-total')) || 0;
  const y = el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 6;
  window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
}

document.querySelectorAll('a.nav-link[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    scrollWithOffset(id);
    history.replaceState(null, '', `#${id}`);
  });
});

// Scroll spy: highlight the link for the section nearest the viewport center
const links = Array.from(document.querySelectorAll('.nav-link'));
const sections = links
  .map(l => document.querySelector(l.getAttribute('href')))
  .filter(Boolean);

function updateActiveLink() {
  if (!sections.length) return;
  const viewportCenter = window.innerHeight / 2;
  let best = { idx: 0, dist: Infinity };

  sections.forEach((sec, i) => {
    const rect = sec.getBoundingClientRect();
    const secCenter = rect.top + rect.height / 2;
    const dist = Math.abs(secCenter - viewportCenter);
    if (dist < best.dist) best = { idx: i, dist };
  });

  links.forEach(l => {
    l.classList.remove('active');
    l.removeAttribute('aria-current');
  });
  const activeLink = links[best.idx];
  if (activeLink) {
    activeLink.classList.add('active');
    activeLink.setAttribute('aria-current', 'page');
  }
}

// rAF throttle for scroll
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateActiveLink();
      ticking = false;
    });
    ticking = true;
  }
});

window.addEventListener('load', () => {
  setHeaderOffset();
  updateActiveLink();
});
window.addEventListener('resize', () => {
  setHeaderOffset();
  updateActiveLink();
});

// Initial
setHeaderOffset();
updateActiveLink();