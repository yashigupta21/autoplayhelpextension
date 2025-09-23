// content.js — only Skip Intro + Next Episode at the right time
(() => {
  const LOG = '[AutoSkip]';
  const SKIP_TEXT = 'skip intro';
  const NEXT_DATA_UIA = 'next-episode-seamless-button';
  const NEXT_THRESHOLD = 0.95; // 95% into episode
  const EPISODE_COOLDOWN_MS = 10000;

  function log(...a) { console.log(LOG, ...a); }

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

  function findSkipIntro() {
    return Array.from(document.querySelectorAll('button, [role="button"]'))
      .find(b => isVisible(b) && (b.innerText || '').trim().toLowerCase() === SKIP_TEXT);
  }

  function findNextEpisode() {
    const btn = document.querySelector(`button[data-uia="${NEXT_DATA_UIA}"]`);
    if (btn && isVisible(btn)) return btn;
    return null;
  }

  function episodeKey() {
    const v = getVideo();
    return (location.pathname + '|' + (v ? v.currentSrc : ''));
  }

  const lastClicked = {};

  function recentlyClicked(key) {
    return lastClicked[key] && Date.now() - lastClicked[key] < EPISODE_COOLDOWN_MS;
  }

  function markClicked(key) {
    lastClicked[key] = Date.now();
  }

  function safeClick(el, why) {
    try {
      el.click();
      log('Clicked', why);
    } catch (e) {
      console.error(LOG, 'Click failed', e);
    }
  }

  function check() {
    const key = episodeKey();

    const skip = findSkipIntro();
    if (skip && !recentlyClicked(key)) {
      safeClick(skip, 'Skip Intro');
      markClicked(key);
      return;
    }

    const next = findNextEpisode();
    const video = getVideo();
    if (next && video && (video.ended || playbackFraction(video) >= NEXT_THRESHOLD) && !recentlyClicked(key)) {
      safeClick(next, 'Next Episode');
      markClicked(key);
    }
  }

  // Observe DOM changes + check regularly
  const obs = new MutationObserver(() => check());
  obs.observe(document, { childList: true, subtree: true });
  setInterval(check, 1000);

  log('Netflix AutoSkip loaded');
})();
