/* ==========================================================
   app.js: behaviour only. Content/settings are in scenes.js
   ========================================================== */
(function () {
  'use strict';

  var cfg = window.NOSTALGIA_CONFIG;
  if (!cfg || !cfg.scenes || !cfg.scenes.length) {
    console.error('NOSTALGIA_CONFIG missing or has no scenes. Check js/scenes.js is loaded first.');
    return;
  }

  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage');
  var layers = [$('bg-a'), $('bg-b')];
  var textEl = $('text');
  var titleEl = $('title');
  var captionEl = $('caption');
  var nowBtn = $('now-btn');
  var clockEl = $('clock-time');
  var timelineEl = $('timeline');
  var radioBtn = $('radio-btn');
  var radioStatus = $('radio-status');
  var spotifyPanel = $('spotify-panel');

  var portrait = window.matchMedia('(orientation: portrait)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Scenes (sorted by time) ---------- */
  function toMinutes(t) {
    var p = String(t).split(':');
    return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
  }
  function formatTick(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    var suffix = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ':' + (m < 10 ? '0' : '') + m : '') + suffix.toLowerCase();
  }
  var scenes = cfg.scenes.map(function (s) {
    var copy = Object.assign({}, s);
    copy.minutes = toMinutes(s.time);
    return copy;
  }).sort(function (a, b) { return a.minutes - b.minutes; });

  function nearestIndex(nowMins) {
    var best = 0, bestDist = Infinity;
    scenes.forEach(function (s, i) {
      var d = Math.abs(s.minutes - nowMins);
      d = Math.min(d, 1440 - d);            // wrap around midnight
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  }

  /* ---------- Image helpers ---------- */
  function sourceFor(scene) {
    return portrait.matches && scene.mobileImage ? scene.mobileImage : scene.image;
  }
  function positionFor(scene) {
    return portrait.matches ? (scene.focusMobile || scene.focus || '50% 50%') : (scene.focus || '50% 50%');
  }
  function preload(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        var done = function () { resolve(true); };
        if (img.decode) { img.decode().then(done, done); } else { done(); }
      };
      img.onerror = function () { resolve(false); };
      img.src = src;
    });
  }
  function paint(layer, scene, ok) {
    layer.style.backgroundColor = scene.fallback || '#1a130d';
    layer.style.backgroundImage = ok ? 'url("' + sourceFor(scene) + '")' : 'none';
    layer.style.backgroundPosition = positionFor(scene);
  }

  /* ---------- Crossfade ---------- */
  var current = -1;      // index of the scene on screen
  var activeLayer = 0;   // which layer is the visible one
  var token = 0;         // lets us ignore stale, superseded requests

  // Snap both layers to their final state instantly (no animation).
  function settle() {
    stage.classList.add('no-anim');
    layers.forEach(function (l, i) { l.classList.toggle('is-visible', i === activeLayer); });
    void stage.offsetWidth; // force reflow so the snap is applied
    stage.classList.remove('no-anim');
  }

  function showScene(index, opts) {
    var instant = !!(opts && opts.instant);
    var scene = scenes[index];
    var my = ++token;
    updateUI(index);

    return preload(sourceFor(scene)).then(function (ok) {
      if (my !== token) return;                       // a newer choice replaced this one
      if (!ok) console.warn('Could not load image for scene "' + scene.id + '": ' + sourceFor(scene));

      if (current === -1 || instant || reduceMotion.matches) {
        paint(layers[activeLayer], scene, ok);
        settle();
      } else {
        settle();                                     // finish any crossfade in progress
        var next = 1 - activeLayer;
        paint(layers[next], scene, ok);               // incoming layer is loaded before it shows
        layers[next].classList.add('is-visible');
        layers[activeLayer].classList.remove('is-visible');
        activeLayer = next;
      }
      current = index;
    });
  }

  /* ---------- Caption & timeline UI ---------- */
  var textTimer = null;
  function setText(scene) {
    clearTimeout(textTimer);
    textEl.classList.add('is-changing');
    textTimer = setTimeout(function () {
      titleEl.textContent = scene.title || '';
      captionEl.textContent = scene.caption || '';
      titleEl.hidden = !scene.title;
      captionEl.hidden = !scene.caption;
      textEl.dataset.pos = scene.textPos || 'top';
      textEl.dataset.align = scene.textAlign || 'center';
      textEl.classList.remove('is-changing');
    }, reduceMotion.matches ? 0 : 250);
  }

  var markers = [];
  function buildTimeline() {
    scenes.forEach(function (scene, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'marker';
      btn.dataset.index = i;
      btn.setAttribute('aria-label', scene.label + ', around ' + formatTick(scene.minutes));
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = '<span class="dot"></span><span class="tick"></span>';
      btn.querySelector('.tick').textContent = formatTick(scene.minutes);
      btn.title = scene.label;
      btn.addEventListener('click', function () { showScene(i); });
      li.appendChild(btn);
      timelineEl.appendChild(li);
      markers.push(btn);
    });

    // Arrow keys move between markers while one has focus
    timelineEl.addEventListener('keydown', function (e) {
      var i = markers.indexOf(document.activeElement);
      if (i === -1) return;
      var n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % markers.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + markers.length) % markers.length;
      if (n !== null) { e.preventDefault(); markers[n].focus(); showScene(n); }
    });
  }

  var selected = -1;
  function updateUI(index) {
    selected = index;
    markers.forEach(function (m, i) {
      var on = i === index;
      m.classList.toggle('is-active', on);
      m.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) m.setAttribute('aria-current', 'true'); else m.removeAttribute('aria-current');
    });
    setText(scenes[index]);
    updateNowBtn();
  }

  // "back to now" only appears when the chosen scene differs from the clock's scene
  function currentNearest() {
    var d = new Date();
    return nearestIndex(d.getHours() * 60 + d.getMinutes());
  }
  function updateNowBtn() { nowBtn.hidden = selected === currentNearest(); }
  nowBtn.addEventListener('click', function () { showScene(currentNearest()); });

  /* ---------- Live clock (independent of the selected scene) ---------- */
  function tickClock() {
    clockEl.textContent = new Date().toLocaleTimeString([], {
      hour: 'numeric', minute: '2-digit', second: '2-digit'
    });
    updateNowBtn();
  }

  /* ---------- Music player: visual shell + optional Spotify embed ---------- */
  function embedUrl(url) {
    if (!/^https:\/\/open\.spotify\.com\//.test(url)) return null;
    if (url.indexOf('/embed/') !== -1) return url;
    return url.replace('open.spotify.com/', 'open.spotify.com/embed/');
  }
  function initPlayer() {
    var src = cfg.spotifyUrl ? embedUrl(cfg.spotifyUrl) : null;
    if (!src) {
      radioStatus.textContent = 'Tune in soon';
      radioBtn.title = 'Add a Spotify link in js/scenes.js to enable';
      return;
    }
    radioStatus.textContent = 'Spotify';
    radioBtn.disabled = false;
    radioBtn.title = '';
    radioBtn.addEventListener('click', function () {
      var open = spotifyPanel.hidden;                 // never autoplays: embed loads only after a click
      if (open && !spotifyPanel.firstChild) {
        var f = document.createElement('iframe');
        f.src = src;
        f.title = 'Spotify player';
        f.height = '152';
        f.loading = 'lazy';
        f.allow = 'encrypted-media';
        spotifyPanel.appendChild(f);
      }
      spotifyPanel.hidden = !open;
      radioBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      radioBtn.setAttribute('aria-label', open ? 'Hide music player' : 'Show music player');
    });
  }

  /* ---------- Start ---------- */
  buildTimeline();
  tickClock();
  setInterval(tickClock, 1000);
  initPlayer();

  var now = new Date();
  showScene(nearestIndex(now.getHours() * 60 + now.getMinutes()), { instant: true });

  // Warm the cache for the other scenes so later switches are instant
  window.addEventListener('load', function () {
    scenes.forEach(function (s) { preload(sourceFor(s)); });
  });

  // Re-crop when the device rotates / crosses portrait <-> landscape
  var onOrient = function () { if (current !== -1) showScene(current, { instant: true }); };
  if (portrait.addEventListener) portrait.addEventListener('change', onOrient);
  else if (portrait.addListener) portrait.addListener(onOrient);
})();