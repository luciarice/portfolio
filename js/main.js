/* Lucia Rice portfolio: small helpers, no dependencies.
   1. mobile menu toggle
   2. fade in on scroll (elements with .fade-in or .stagger-fade-up)
   3. lightbox for galleries marked with data-lightbox
*/
(function () {
  'use strict';

  /* ---- 1. mobile menu ---- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---- 2. fade in on scroll ---- */
  var targets = document.querySelectorAll('.fade-in, .stagger-fade-up');
  document.querySelectorAll('.stagger-fade-up').forEach(function (g) {
    g.querySelectorAll('figure').forEach(function (f, i) { f.style.setProperty('--i', i); });
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('in-view'); });
  }

  /* ---- 3. lightbox ---- */
  var galleries = document.querySelectorAll('[data-lightbox]');
  if (!galleries.length) return;

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Image viewer');
  box.innerHTML =
    '<button class="lb-close" aria-label="Close">&times;</button>' +
    '<button class="lb-prev" aria-label="Previous image">&#8249;</button>' +
    '<img alt="">' +
    '<button class="lb-next" aria-label="Next image">&#8250;</button>';
  document.body.appendChild(box);

  var big = box.querySelector('img');
  var current = [];
  var index = 0;

  function show(i) {
    index = (i + current.length) % current.length;
    big.src = current[index].currentSrc || current[index].src;
    big.alt = current[index].alt || '';
  }
  function open(imgs, i) {
    current = imgs;
    show(i);
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    box.classList.remove('open');
    document.body.style.overflow = '';
  }

  galleries.forEach(function (g) {
    var imgs = Array.prototype.slice.call(g.querySelectorAll('img'));
    imgs.forEach(function (img, i) {
      img.addEventListener('click', function () { open(imgs, i); });
    });
  });

  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(index - 1); });
  box.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(index + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
})();
