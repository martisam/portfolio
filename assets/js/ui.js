// ============================================================
//  Samuel Martinez - Portfolio
//  Section 5: UI interactions
//  Smooth-scroll, scroll-spy nav, reveal-on-scroll
//  All motion respects prefers-reduced-motion.
// ============================================================

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Theme toggle (initial value already set by inline head script) ----
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');

  function reflectTheme(theme) {
    if (!toggle) return;
    // Show the action: in dark mode offer the sun, in light mode the moon.
    toggle.textContent = theme === 'light' ? '🌙' : '☀️';
    toggle.setAttribute('aria-pressed', String(theme === 'light'));
  }

  if (toggle) {
    reflectTheme(root.getAttribute('data-theme'));
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
      reflectTheme(next);
      window.dispatchEvent(new CustomEvent('themechange', { detail: next }));
    });
  }

  // ---- Footer year ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Smooth in-page scrolling (instant if reduced-motion) ----
  document.querySelectorAll('.scroll-link').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  // ---- Scroll-spy: highlight the nav link for the section in view ----
  const navLinks = Array.from(document.querySelectorAll('.navbar a'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = '#' + entry.target.id;
          navLinks.forEach((link) =>
            link.classList.toggle('active', link.getAttribute('href') === id)
          );
        });
      },
      // Trigger when a section crosses the vertical middle of the viewport.
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((section) => spy.observe(section));
  }

  // ---- Reveal-on-scroll ----
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    // No animation: show everything immediately.
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }
})();
