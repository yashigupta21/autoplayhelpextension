// content.js — Skip Intro, Skip Recap, Continue Watching, Next Episode
(() => {
  const LOG           = '[AutoSkip]';
  const SKIP_TEXT     = 'skip intro';
  const RECAP_TEXT    = 'skip recap';
  const CONTINUE_TEXT = 'continue watching';
  const NEXT_DATA_UIA = 'next-episode-seamless-button';

  // Mutable settings — updated from storage
  let enabled             = true;
  let NEXT_THRESHOLD      = 0.95;
  let EPISODE_COOLDOWN_MS = 10000;
  let skipIntro           = true;
  let skipRecap           = true;
  let nextEpisode         = true;
  let continueWatching    = true;

  function log(...a) { console.log(LOG, ...a); }

  // ── Load settings from storage on page load ──────────────────────
  chrome.storage.local.get(
    {
      enabled: true, nextThreshold: 0.95, cooldownMs: 10000,
      skipIntro: true, skipRecap: true, nextEpisode: true, continueWatching: true
    },
    (result) => {
      enabled             = result.enabled;
      NEXT_THRESHOLD      = result.nextThreshold;
      EPISODE_COOLDOWN_MS = result.cooldownMs;
      skipIntro           = result.skipIntro;
      skipRecap           = result.skipRecap;
      nextEpisode         = result.nextEpisode;
      continueWatching    = result.continueWatching;
      log('Loaded settings:', result);
    }
  );

  // ── React to settings changes from popup / options page ──────────
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.enabled            !== undefined) enabled             = changes.enabled.newValue;
    if (changes.nextThreshold      !== undefined) NEXT_THRESHOLD      = changes.nextThreshold.newValue;
    if (changes.cooldownMs         !== undefined) EPISODE_COOLDOWN_MS = changes.cooldownMs.newValue;
    if (changes.skipIntro          !== undefined) skipIntro           = changes.skipIntro.newValue;
    if (changes.skipRecap          !== undefined) skipRecap           = changes.skipRecap.newValue;
    if (changes.nextEpisode        !== undefined) nextEpisode         = changes.nextEpisode.newValue;
    if (changes.continueWatching   !== undefined) continueWatching    = changes.continueWatching.newValue;
    log('Settings updated:', { enabled, NEXT_THRESHOLD, EPISODE_COOLDOWN_MS, skipIntro, skipRecap, nextEpisode, continueWatching });
  });

  // ── DOM helpers ──────────────────────────────────────────────────
  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.05) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function getVideo() {
    return document.querySelector('video');
  }

  function playbackFraction(video) {
    return video && video.duration ? video.currentTime / video.duration : 0;
  }

  function findByText(text) {
    return Array.from(document.querySelectorAll('button, [role="button"]'))
      .find(b => isVisible(b) && (b.innerText || '').trim().toLowerCase() === text);
  }

  function findNextEpisode() {
    const btn = document.querySelector(`button[data-uia="${NEXT_DATA_UIA}"]`);
    if (btn && isVisible(btn)) return btn;
    return null;
  }

  // ── Cooldown tracking ────────────────────────────────────────────
  function episodeKey() {
    return location.pathname; // stable across currentSrc blob/CDN changes
  }

  const lastClicked = {};

  function recentlyClicked(key) {
    return lastClicked[key] && Date.now() - lastClicked[key] < EPISODE_COOLDOWN_MS;
  }

  function markClicked(key) {
    lastClicked[key] = Date.now();
    // Prune stale entries to prevent unbounded memory growth
    const cutoff = Date.now() - EPISODE_COOLDOWN_MS * 2;
    for (const k of Object.keys(lastClicked)) {
      if (lastClicked[k] < cutoff) delete lastClicked[k];
    }
  }

  // ── Click ────────────────────────────────────────────────────────
  function safeClick(el, why) {
    try {
      el.click();
      log('Clicked', why);
    } catch (e) {
      console.error(LOG, 'Click failed', e);
    }
  }

  function tryClick(btn, label, cooldownSuffix) {
    if (!btn) return false;
    const key = episodeKey() + cooldownSuffix;
    if (recentlyClicked(key)) return false;
    safeClick(btn, label);
    markClicked(key);
    return true;
  }

  // ── Main check ───────────────────────────────────────────────────
  function check() {
    if (!enabled) return;

    if (skipIntro && tryClick(findByText(SKIP_TEXT), 'Skip Intro', ':skip')) return;
    if (skipRecap && tryClick(findByText(RECAP_TEXT), 'Skip Recap', ':recap')) return;
    if (continueWatching && tryClick(findByText(CONTINUE_TEXT), 'Continue Watching', ':continue')) return;

    if (nextEpisode) {
      const next  = findNextEpisode();
      const video = getVideo();
      if (next && video && (video.ended || playbackFraction(video) >= NEXT_THRESHOLD)) {
        tryClick(next, 'Next Episode', ':next');
      }
    }
  }

  // Debounced observer — avoids firing check() on every micro DOM mutation
  let debounceTimer = null;
  const obs = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(check, 200);
  });
  obs.observe(document, { childList: true, subtree: true });
  setInterval(check, 1000);

  log('Netflix AutoSkip loaded');
})();
