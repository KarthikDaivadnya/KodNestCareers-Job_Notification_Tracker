/*
 * ============================================================
 * KODNEST CAREERS — SHARED NAVIGATION COMPONENT
 * ============================================================
 * Renders the app nav into #nav-root.
 * Detects current route and sets the active link.
 * Handles hamburger toggle on mobile.
 * ============================================================
 */

(function () {
  'use strict';

  var routes = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/saved',     label: 'Saved'     },
    { href: '/digest',    label: 'Digest'    },
    { href: '/settings',  label: 'Settings'  },
    { href: '/proof',     label: 'Proof'     },
  ];

  /* Normalise current path — strip trailing slash */
  var path = window.location.pathname.replace(/\/$/, '') || '/dashboard';

  /* Build nav links HTML */
  var linksHTML = routes.map(function (r) {
    var isActive = path === r.href;
    return (
      '<li>' +
        '<a href="' + r.href + '" class="app-nav-link' + (isActive ? ' is-active' : '') + '">' +
          r.label +
        '</a>' +
      '</li>'
    );
  }).join('');

  /* Full nav HTML */
  var navHTML =
    '<nav class="app-nav" role="navigation" aria-label="Main navigation">' +
      '<div class="app-nav-inner">' +
        '<a href="/dashboard" class="app-nav-logo">' +
          'KodNest<span class="app-nav-logo-accent">Careers</span>' +
        '</a>' +
        '<button class="app-nav-hamburger" id="js-hamburger" aria-label="Toggle navigation" aria-expanded="false" aria-controls="js-nav-links">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
        '<ul class="app-nav-links" id="js-nav-links" role="list">' +
          linksHTML +
        '</ul>' +
      '</div>' +
    '</nav>';

  /* Inject */
  var root = document.getElementById('nav-root');
  if (root) { root.innerHTML = navHTML; }

  /* Hamburger toggle */
  var hamburger = document.getElementById('js-hamburger');
  var navLinks   = document.getElementById('js-nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    /* Close menu when a link is tapped on mobile */
    navLinks.addEventListener('click', function (e) {
      if (e.target.classList.contains('app-nav-link')) {
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    /* Close menu on outside click */
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
