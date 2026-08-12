// content.js — Skip Intro, Skip Recap, Continue Watching, Next Episode
(() => {
  const log = console.log.bind(console, '[AutoSkip]');

  // ponytail: data-uia strings are unverified against live Netflix DOM. The
  // English text fallback keeps the extension working if one is renamed —
  // drop `text` once the selectors are confirmed on a real page.
  const ACTIONS = [
    { key: 'skipIntro',        uia: 'player-skip-intro',           text: 'skip intro',        label: 'Skip Intro' },
    { key: 'skipRecap',        uia: 'player-skip-recap',           text: 'skip recap',        label: 'Skip Recap' },
    { key: 'continueWatching', uia: 'interrupt-autoplay-continue', text: 'continue watching', label: 'Continue Watching' },
  ];
  const NEXT = { key: 'nextEpisode', uia: 'next-episode-seamless-button', label: 'Next Episode' };

  // Settings — defaults double as the storage.get defaults, so no seeding needed
  const cfg = {
    enabled: true, nextThreshold: 0.95, cooldownMs: 10000,
    skipIntro: true, skipRecap: true, nextEpisode: true, continueWatching: true,
  };

  chrome.storage.local.get(cfg, (result) => {
    Object.assign(cfg, result);
    log('Loaded settings:', result);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const k in changes) if (k in cfg) cfg[k] = changes[k].newValue;
    log('Settings updated:', cfg);
  });

  const visible = (el) => !!el && el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });

  const playbackFraction = (v) => (v && v.duration ? v.currentTime / v.duration : 0);

  function find({ uia, text }) {
    const byUia = document.querySelector(`[data-uia="${uia}"]`);
    if (visible(byUia)) return byUia;
    if (!text) return null;
    return Array.from(document.querySelectorAll('button, [role="button"]'))
      .find(b => visible(b) && (b.innerText || '').trim().toLowerCase() === text) || null;
  }

  // Per-episode, per-action cooldown. Key is pathname — stable across
  // currentSrc blob/CDN changes.
  const lastClicked = {};

  function tryClick(action) {
    const el = find(action);
    if (!el) return false;

    const key = location.pathname + ':' + action.key;
    const now = Date.now();
    if (now - (lastClicked[key] || 0) < cfg.cooldownMs) return false;

    lastClicked[key] = now;
    const cutoff = now - cfg.cooldownMs * 2;
    for (const k in lastClicked) if (lastClicked[k] < cutoff) delete lastClicked[k];

    el.click();
    log('Clicked', action.label);
    return true;
  }

  function check() {
    if (!cfg.enabled) return;

    for (const a of ACTIONS) if (cfg[a.key] && tryClick(a)) return;

    if (!cfg.nextEpisode) return;
    const video = document.querySelector('video');
    if (video && (video.ended || playbackFraction(video) >= cfg.nextThreshold)) tryClick(NEXT);
  }

  setInterval(check, 1000);
  log('Netflix AutoSkip loaded');
})();
