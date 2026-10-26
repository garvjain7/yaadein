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
  var openingScreen = $('opening-screen');
  var rotateHint = $('rotate-hint');
  var textEl = $('text');
  var titleEl = $('title');
  var captionEl = $('caption');
  var nowBtn = $('now-btn');
  var clockEl = $('clock-time');
  var presenceCountEl = $('presence-count');
  var timelineEl = $('timeline');
  var timelineCue = $('timeline-cue');
  var tourSkipBtn = $('tour-skip');
  var radioTitle = $('radio-title');
  var radioStatus = $('radio-status');
  var radio = $('radio');
  var fullscreenBtn = $('fullscreen-btn');
  var fullscreenLabel = $('fullscreen-label');
  var fullscreenStatus = $('fullscreen-status');
  var playBtn = $('play-btn');
  var prevBtn = $('prev-btn');
  var nextBtn = $('next-btn');
  var repeatBtn = $('repeat-btn');
  var listBtn = $('list-btn');
  var playlistClose = $('playlist-close');
  var playlistSummary = $('playlist-summary');
  var seek = $('seek');
  var timeNow = $('time-now');
  var timeTotal = $('time-total');
  var popEl = $('playlist-pop');
  var searchEl = $('song-search');
  var playlistEl = $('playlist');
  var emptyEl = $('playlist-empty');

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
    var showFallbackImmediately = !!(opts && opts.showFallbackImmediately);
    var scene = scenes[index];
    var my = ++token;
    updateUI(index);

    if (showFallbackImmediately) {
      paint(layers[activeLayer], scene, false);
      settle();
      current = index;
    }

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
      textEl.dataset.scene = scene.id;
      titleEl.hidden = !scene.title;
      captionEl.hidden = !scene.caption;
      // Per-scene text position (laptops/desktops): scenes.js textBox -> CSS variables
      var box = scene.textBox || null;
      ['top', 'bottom', 'left', 'right', 'width', 'scale', 'capw'].forEach(function (k) {
        if (box && box[k] != null) textEl.style.setProperty('--t-' + k, box[k]);
        else textEl.style.removeProperty('--t-' + k);
      });
      textEl.dataset.box = box ? '1' : '0';
      textEl.dataset.pos = scene.textPos || 'top';
      textEl.dataset.align = (box && box.align) || scene.textAlign || 'center';
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
      btn.addEventListener('click', function () {
        stopTourForInteraction();
        showScene(i);
      });
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
  var tourActive = false;
  var tourTimer = null;
  var tourReturnIndex = -1;
  var tourSequence = [];
  var tourPosition = 0;

  function showRotateHint() {
    if (!portrait.matches || window.innerWidth > 1100) return;
    rotateHint.classList.add('is-visible');
    setTimeout(function () { rotateHint.classList.remove('is-visible'); }, 2200);
  }

  function finishTour(restoreStart) {
    if (!tourActive) return;
    tourActive = false;
    window.clearTimeout(tourTimer);
    timelineCue.hidden = true;
    document.querySelector('.ui').classList.remove('is-guided-tour');
    timelineEl.parentNode.classList.remove('is-guiding');
    updateNowBtn();
    if (restoreStart && selected !== tourReturnIndex) showScene(tourReturnIndex);
  }

  function advanceTour() {
    if (!tourActive) return;
    if (tourPosition >= tourSequence.length) {
      finishTour(false);
      showRotateHint();
      return;
    }
    var nextIndex = tourSequence[tourPosition++];
    showScene(nextIndex).then(function () {
      if (tourActive) tourTimer = window.setTimeout(advanceTour, 4000);
    });
  }

  function startTour(startIndex) {
    tourActive = true;
    tourReturnIndex = startIndex;
    tourSequence = [];
    for (var i = 1; i < scenes.length; i++) {
      tourSequence.push((startIndex + i) % scenes.length);
    }
    tourSequence.push(startIndex);
    tourPosition = 0;
    document.querySelector('.ui').classList.add('is-guided-tour');
    timelineCue.hidden = false;
    timelineEl.parentNode.classList.add('is-guiding');
    tourTimer = window.setTimeout(advanceTour, 4000);
  }

  function stopTourForInteraction() {
    if (tourActive) finishTour(false);
  }

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
  function updateNowBtn() { nowBtn.hidden = tourActive || selected === currentNearest(); }
  nowBtn.addEventListener('click', function () {
    stopTourForInteraction();
    showScene(currentNearest());
  });
  tourSkipBtn.addEventListener('click', stopTourForInteraction);
  document.addEventListener('pointerdown', stopTourForInteraction);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') stopTourForInteraction();
  });

  /* ---------- Live clock (independent of the selected scene) ---------- */
  function tickClock() {
    clockEl.textContent = new Date().toLocaleTimeString([], {
      hour: 'numeric', minute: '2-digit', second: '2-digit'
    });
    updateNowBtn();
  }

  /* ---------- Ambient activity counter ---------- */
  function updatePresenceCount() {
    var previous = parseInt(presenceCountEl.textContent, 10);
    var next = 20 + Math.floor(Math.random() * 16);
    if (next === previous) next = 20 + ((previous - 19) % 16);
    presenceCountEl.textContent = String(next);
    window.setTimeout(updatePresenceCount, 1000 + Math.random() * 9000);
  }

  /* ---------- Music: YouTube player with our own controls ---------- */
  function ytId(v) {
    if (!v) return null;
    v = String(v).trim();
    if (/^[\w-]{11}$/.test(v)) return v;
    var m = v.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  }
  var tracks = (cfg.tracks || []).map(function (t) {
    var id = ytId(t && (t.youtube || t.url || t.id));
    return t ? {
      id: id,
      title: t.title || '',
      artist: t.artist || '',
      duration: t.duration || '',
      bad: false
    } : null;
  }).filter(function (t) { return t && (t.title || t.id); });
  var playableCount = tracks.filter(function (t) { return !!t.id; }).length;

  var trackIdx = 0, repeatMode = 0;          // repeat: 0 off, 1 all songs, 2 this song
  var player = null, creating = false, wantPlay = false, dragging = false, skipGuard = 0, statusTimer = null;
  var REPEAT_LABELS = ['Repeat off', 'Repeat all songs', 'Repeat this song'];

  function fmt(s) {
    if (!isFinite(s) || s < 0) return '0:00';
    var r = Math.floor(s % 60);
    return Math.floor(s / 60) + ':' + (r < 10 ? '0' : '') + r;
  }
  function setSeekFill() {
    var max = parseFloat(seek.max) || 1;
    seek.style.setProperty('--p', (parseFloat(seek.value) / max * 100) + '%');
  }
  function label(t, i) { return t.title || ('Song ' + (i + 1)); }

  function showTrackInfo() {
    var t = tracks[trackIdx];
    radioTitle.textContent = label(t, trackIdx);
    radioStatus.textContent = t.id
      ? t.artist
      : 'YouTube link needed';
    Array.prototype.forEach.call(playlistEl.children, function (li, i) {
      li.classList.toggle('is-current', i === trackIdx);
      li.classList.toggle('is-bad', tracks[i].bad);
      var b = li.firstChild;
      li.classList.toggle('is-unlinked', !tracks[i].id);
      b.disabled = !tracks[i].id;
      b.setAttribute('aria-label', label(tracks[i], i) + (tracks[i].id ? '' : ' — YouTube link needed'));
      if (i === trackIdx) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      b.querySelector('.t').textContent = label(tracks[i], i);
      b.querySelector('.a').textContent = tracks[i].artist + (tracks[i].duration ? ' \u00b7 ' + tracks[i].duration : '');
      b.querySelector('.availability').textContent = tracks[i].id ? '' : 'Link needed';
    });
  }
  function setStatus(msg, sticky) {
    clearTimeout(statusTimer);
    radioStatus.textContent = msg;
    if (!sticky) statusTimer = setTimeout(showTrackInfo, 3500);
  }

  function isPlaying() {
    if (!player || !player.getPlayerState) return false;
    var s = player.getPlayerState();
    return s === 1 || s === 3;
  }
  function setPlayUI(playing) {
    playBtn.classList.toggle('is-playing', playing);
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }
  function openCard() { radio.classList.add('is-open'); }

  function nextPlayable(from, dir) {
    var n = tracks.length;
    for (var k = 1; k <= n; k++) {
      var j = (((from + dir * k) % n) + n) % n;
      if (tracks[j].id && !tracks[j].bad) return j;
    }
    return -1;
  }
  function resetSeek() { seek.value = 0; seek.max = 100; setSeekFill(); timeNow.textContent = '0:00'; timeTotal.textContent = '0:00'; }

  function go(i, play) {
    trackIdx = i;
    showTrackInfo();
    resetSeek();
    if (!tracks[i].id) { setStatus('Add a YouTube link to this song before playing it.', true); return; }
    if (play) { wantPlay = true; openCard(); }
    if (!player) { if (play) ensurePlayer(); return; }
    if (play) player.loadVideoById(tracks[i].id); else player.cueVideoById(tracks[i].id);
  }
  function step(dir) {
    var j = nextPlayable(trackIdx, dir);
    if (j < 0) { setStatus('None of the songs can be played here.', true); return; }
    go(j, isPlaying());
  }

  /* ----- loading YouTube's player (only after the first click, never on page load) ----- */
  function loadYT(cb) {
    if (window.YT && window.YT.Player) { cb(true); return; }
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () { if (prev) prev(); cb(true); };
    if (document.getElementById('yt-api')) return;
    var s = document.createElement('script');
    s.id = 'yt-api'; s.async = true; s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = function () { cb(false); };
    document.head.appendChild(s);
  }
  function ensurePlayer() {
    if (player || creating) return;
    creating = true;
    loadYT(function (ok) {
      if (!ok) { creating = false; setStatus("Couldn't reach YouTube. Check your connection.", true); return; }
      var vars = { autoplay: wantPlay ? 1 : 0, controls: 0, rel: 0, playsinline: 1, modestbranding: 1, iv_load_policy: 3 };
      if (/^https?:/.test(location.protocol)) vars.origin = location.origin;
      player = new window.YT.Player('yt-player', {
        host: 'https://www.youtube-nocookie.com', width: 200, height: 200,
        videoId: tracks[trackIdx].id, playerVars: vars,
        events: { onReady: onPlayerReady, onStateChange: onPlayerState, onError: onPlayerError }
      });
    });
  }
  function onPlayerReady() { creating = false; if (wantPlay && !isPlaying()) player.playVideo(); }

  function fillMeta() {                     // if you did not give a title, use YouTube's
    var d = player.getVideoData && player.getVideoData();
    var t = tracks[trackIdx];
    if (d && ((!t.title && d.title) || (!t.artist && d.author))) {
      if (!t.title && d.title) t.title = d.title;
      if (!t.artist && d.author) t.artist = d.author;
      showTrackInfo();
    }
  }
  function onPlayerState(e) {
    var s = e.data;
    if (s === 1) { skipGuard = 0; setPlayUI(true); fillMeta(); }
    else if (s === 3) { setPlayUI(true); }
    else if (s === 0) { setPlayUI(false); handleEnded(); }
    else { setPlayUI(false); }              // paused (2) or cued (5)
  }
  function handleEnded() {
    if (repeatMode === 2) { player.seekTo(0, true); player.playVideo(); return; }
    var last = nextPlayable(trackIdx, 1);
    var wraps = last <= trackIdx;           // next playable song comes before this one = we are at the end
    if (last >= 0 && (repeatMode === 1 || !wraps)) { go(last, true); return; }
    wantPlay = false;                       // end of list, repeat off: stop at the start
    player.cueVideoById(tracks[trackIdx].id);
    resetSeek();
  }
  function onPlayerError() {
    creating = false;
    if (location.protocol === 'file:') {
      setStatus('YouTube needs the site opened from http://, not as a file.', true);
      return;
    }
    tracks[trackIdx].bad = true;            // blocked, removed or private
    showTrackInfo();
    var j = nextPlayable(trackIdx, 1);
    if (j < 0) { setStatus('None of the songs can be played here.', true); return; }
    setStatus("Can't play this one here. Skipping\u2026", false);
    if (wantPlay && skipGuard < tracks.length) {
      skipGuard++;
      setTimeout(function () { go(j, true); }, 1200);
    }
  }

  function togglePlay() {
    if (!tracks.length) return;
    if (!player) { wantPlay = true; openCard(); ensurePlayer(); return; }
    if (isPlaying()) { wantPlay = false; player.pauseVideo(); }
    else { wantPlay = true; openCard(); player.playVideo(); }
  }
  /* ----- song list + search ----- */
  function filterList() {
    var q = searchEl.value.trim().toLowerCase(), shown = 0;
    Array.prototype.forEach.call(playlistEl.children, function (li, i) {
      var t = tracks[i];
      var hit = !q || (label(t, i) + ' ' + t.artist).toLowerCase().indexOf(q) !== -1;
      li.hidden = !hit;
      if (hit) shown++;
    });
    emptyEl.hidden = shown > 0;
    emptyEl.textContent = tracks.length ? 'No songs match your search.' : 'Add songs to get started.';
  }
  function toggleList(force) {
    var open = typeof force === 'boolean' ? force : popEl.hidden;
    popEl.hidden = !open;
    listBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { searchEl.value = ''; filterList(); searchEl.focus(); }
  }

  function initPlayer() {
    var songCount = tracks.length;
    var missingLinks = tracks.some(function (track) { return !track.id; });
    playlistSummary.textContent = songCount + (songCount === 1 ? ' song' : ' songs')
      + (missingLinks ? ' · YouTube links needed to play' : '');

    tracks.forEach(function (t, i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span class="n"></span><span class="track-copy"><span class="t"></span><span class="a"></span></span><span class="availability"></span>';
      b.querySelector('.n').textContent = String(i + 1);
      b.addEventListener('click', function () { go(i, true); });
      li.appendChild(b);
      playlistEl.appendChild(li);
    });
    resetSeek();
    playBtn.disabled = !playableCount;
    repeatBtn.disabled = !playableCount;
    seek.disabled = !playableCount;
    prevBtn.disabled = nextBtn.disabled = playableCount < 2;
    if (tracks.length) showTrackInfo();
    else {
      radioTitle.textContent = 'Your music';
      radioStatus.textContent = 'Add songs to get started';
    }

    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', function () { step(1); });
    prevBtn.addEventListener('click', function () {
      if (player && player.getCurrentTime && player.getCurrentTime() > 3) player.seekTo(0, true);   // like most players
      else step(-1);
    });
    repeatBtn.addEventListener('click', function () {
      repeatMode = (repeatMode + 1) % 3;
      repeatBtn.dataset.mode = String(repeatMode);
      repeatBtn.setAttribute('aria-label', REPEAT_LABELS[repeatMode]);
      repeatBtn.setAttribute('aria-pressed', repeatMode > 0 ? 'true' : 'false');
    });

    seek.addEventListener('pointerdown', function () { dragging = true; });
    seek.addEventListener('input', function () { setSeekFill(); timeNow.textContent = fmt(parseFloat(seek.value)); });
    seek.addEventListener('change', function () { dragging = false; if (player && player.seekTo) player.seekTo(parseFloat(seek.value), true); });
    setInterval(function () {               // keeps the bar and times in step with the video
      if (!player || !player.getCurrentTime || dragging) return;
      var d = player.getDuration();
      if (d > 0) { seek.max = d; timeTotal.textContent = fmt(d); }
      seek.value = player.getCurrentTime(); setSeekFill(); timeNow.textContent = fmt(player.getCurrentTime());
    }, 400);

    listBtn.addEventListener('click', function () { toggleList(); });
    playlistClose.addEventListener('click', function () { toggleList(false); listBtn.focus(); });
    searchEl.addEventListener('input', filterList);
    searchEl.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      for (var i = 0; i < playlistEl.children.length; i++) {
        if (!playlistEl.children[i].hidden && tracks[i].id && !tracks[i].bad) { go(i, true); return; }
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !popEl.hidden) { toggleList(false); listBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!popEl.hidden && !popEl.contains(e.target) && !listBtn.contains(e.target)) toggleList(false);
    });
  }

  /* ---------- Fullscreen ---------- */
  function syncFullscreenControl() {
    var active = !!document.fullscreenElement;
    fullscreenLabel.textContent = active ? 'Exit fullscreen' : 'Enter fullscreen';
    fullscreenBtn.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
  }
  if (!document.documentElement.requestFullscreen || !document.exitFullscreen) {
    fullscreenBtn.disabled = true;
    fullscreenBtn.title = 'Fullscreen is not supported by this browser';
  } else {
    fullscreenBtn.addEventListener('click', function () {
      var action = document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen();
      action.then(function () {
        fullscreenStatus.textContent = '';
      }).catch(function (error) {
        console.error('Could not change fullscreen mode:', error);
        fullscreenStatus.textContent = 'Fullscreen could not be enabled. Your browser may block it on this page.';
      });
    });
    document.addEventListener('fullscreenchange', syncFullscreenControl);
  }

  /* ---------- Start ---------- */
  buildTimeline();
  tickClock();
  setInterval(tickClock, 1000);
  updatePresenceCount();
  initPlayer();

  var now = new Date();
  var initialScene = showScene(nearestIndex(now.getHours() * 60 + now.getMinutes()), {
    instant: true,
    showFallbackImmediately: true
  });
  var openingAnimation = new Promise(function (resolve) {
    setTimeout(resolve, reduceMotion.matches ? 0 : 3000);
  });
  var sceneTimeout;
  var initialSceneReady = Promise.race([
    initialScene,
    new Promise(function (resolve) { sceneTimeout = setTimeout(resolve, 5500); })
  ]).then(function () {
    clearTimeout(sceneTimeout);
  });
  Promise.all([initialSceneReady, openingAnimation]).then(function () {
    openingScreen.classList.add('is-leaving');
    setTimeout(function () {
      openingScreen.remove();
      startTour(selected);
    }, 450);
  });

  // Re-crop when the device rotates / crosses portrait <-> landscape
  var onOrient = function () { if (current !== -1) showScene(current, { instant: true }); };
  if (portrait.addEventListener) portrait.addEventListener('change', onOrient);
  else if (portrait.addListener) portrait.addListener(onOrient);
})();