(function () {
  'use strict';

  var root = document.documentElement;

  /* Theme */
  var COLORS = { light: '#f6f7f4', dark: '#0f1513' };
  var themeButton = document.querySelector('.theme-toggle');
  var systemDark = matchMedia('(prefers-color-scheme: dark)');

  function storedTheme() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    themeButton.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
      meta.content = COLORS[theme];
    });
  }

  applyTheme(root.dataset.theme);

  themeButton.addEventListener('click', function () {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  systemDark.addEventListener('change', function (event) {
    var saved = storedTheme();
    if (saved !== 'light' && saved !== 'dark') applyTheme(event.matches ? 'dark' : 'light');
  });

  /* Mobile menu */
  var menuButton = document.querySelector('.menu-toggle');
  var navLinks = document.getElementById('nav-links');

  function setMenu(open) {
    navLinks.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  }

  menuButton.addEventListener('click', function () {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  navLinks.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.site-nav')) setMenu(false);
  });

  /* Current section in the navigation */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var links = navLinks.querySelectorAll('a');
  var spyQueued = false;

  function updateCurrentLink() {
    spyQueued = false;
    var line = window.innerHeight * 0.4;
    var current = sections[0];
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= line) current = section;
    });
    if (window.innerHeight + window.scrollY >= root.scrollHeight - 2) {
      current = sections[sections.length - 1];
    }
    links.forEach(function (link) {
      if (link.hash.slice(1) === current.id) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function queueCurrentLink() {
    if (spyQueued) return;
    spyQueued = true;
    requestAnimationFrame(updateCurrentLink);
  }

  window.addEventListener('scroll', queueCurrentLink, { passive: true });
  window.addEventListener('resize', queueCurrentLink);
  updateCurrentLink();

  if (!('IntersectionObserver' in window)) return;

  /* Scroll reveal. The class is added here so content stays visible if this file fails to load. */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  root.classList.add('has-reveal');

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal').forEach(function (element) {
    revealObserver.observe(element);
  });
})();
