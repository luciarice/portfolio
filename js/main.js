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

  /* ---- 2b. scroll-reveal and horizontally swipable curations ---- */
  var deck = document.getElementById('curation-deck');
  if (deck) {
    var panels = Array.prototype.slice.call(deck.querySelectorAll('.curation-panel'));
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-curation-target]'));
    var setCurrent = function (id) {
      if (document.querySelector('.bone-progress')) document.querySelector('.bone-progress').style.opacity = id === 'muirhead-bone' ? '1' : '0';
      tabs.forEach(function (tab) {
        var active = tab.getAttribute('data-curation-target') === id;
        tab.classList.toggle('is-active', active);
        if (active) tab.setAttribute('aria-current', 'true');
        else tab.removeAttribute('aria-current');
      });
    };
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var panel = document.getElementById(tab.getAttribute('data-curation-target'));
        if (panel) {
          var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          deck.scrollTo({ left: panel.offsetLeft - deck.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
          setCurrent(panel.id);
        }
      });
    });
    var sync = function () {
      var i = Math.max(0, Math.min(panels.length - 1, Math.round(deck.scrollLeft / deck.clientWidth)));
      if (panels[i]) setCurrent(panels[i].id);
    };
    deck.addEventListener('scroll', sync, { passive: true });
    /* Slim reading-progress indicator for the Bone exhibition. */
    var bonePanel = document.getElementById('muirhead-bone');
    var progressBar = document.querySelector('.bone-progress');
    if (bonePanel) {
      var updateProgress = function () {
        var extent = bonePanel.scrollHeight - bonePanel.clientHeight;
        if (progressBar) progressBar.style.setProperty('--bone-read-progress', extent > 0 ? Math.max(0,Math.min(1,bonePanel.scrollTop / extent)) : 1);
      };
      bonePanel.addEventListener('scroll', updateProgress, {passive:true});
      window.addEventListener('resize', updateProgress, {passive:true});
      updateProgress();
    }

    deck.addEventListener('keydown', function (e) {
      if (e.target.closest('a,button,input,textarea')) return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var i = Math.round(deck.scrollLeft / deck.clientWidth);
      var next = Math.max(0, Math.min(panels.length - 1, i + (e.key === 'ArrowRight' ? 1 : -1)));
      tabs[next].click();
    });
    if ('IntersectionObserver' in window) {
      var artworkObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('in-view'); artworkObserver.unobserve(entry.target); }
        });
      }, { root: panels[0], threshold: .08, rootMargin: '0px 0px -30px 0px' });
      panels[0].querySelectorAll('.artwork, .curation__heading, .curation__text').forEach(function (el) { artworkObserver.observe(el); });
    } else {
      document.querySelectorAll('.artwork, .curation__heading, .curation__text').forEach(function (el) { el.classList.add('in-view'); });
    }
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
  var opener = null;
  function open(imgs, i) {
    opener = document.activeElement;
    current = imgs;
    show(i);
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    box.classList.remove('open');
    document.body.style.overflow = '';
    if (opener && typeof opener.focus === 'function') opener.focus();
  }

  galleries.forEach(function (g) {
    var imgs = Array.prototype.slice.call(g.querySelectorAll('img'));
    imgs.forEach(function (img, i) {
      img.tabIndex = 0;
      img.setAttribute('role','button');
      img.setAttribute('aria-label','View image full screen: ' + (img.alt || 'artwork'));
      img.addEventListener('click', function () { open(imgs, i); });
      img.addEventListener('keydown', function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(imgs,i);}});
    });
  });

  box.querySelector('.lb-close').addEventListener('click', close);
  var revealed = document.querySelectorAll('.painting-card');
  if ('IntersectionObserver' in window) {
    var paintingObserver = new IntersectionObserver(function(entries){ entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in-view');paintingObserver.unobserve(e.target);}}); }, {threshold:.09});
    revealed.forEach(function(el){paintingObserver.observe(el);});
  } else {revealed.forEach(function(el){el.classList.add('in-view');});}
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
