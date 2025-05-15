const SELECTORS = {
    ytAd: ['.ytp-ad-skip-button'],
    skipIntro: ['.skip-credits', '.nf-player-skip-credits', '.atvwebplayersdk-skip-button', 'button.skip-button'],
    nextEp: ['.watch-video--skip-content-button', '.watch-video--next-episode-button']
  };
  
  function tryClick(selector) {
    const el = document.querySelector(selector);
    if (el) el.click();
  }
  
  function applySkips(settings) {
    Object.entries(SELECTORS).forEach(([key, selectors]) => {
      if (!settings[key]) return;
      selectors.forEach(sel => tryClick(sel));
    });
  }
  
  chrome.storage.sync.get(['ytAd', 'skipIntro', 'nextEp'], settings => {
    setInterval(() => applySkips(settings), 1000);
  
    // Optional: Use MutationObserver for YouTube
    const observer = new MutationObserver(() => applySkips(settings));
    observer.observe(document.body, { childList: true, subtree: true });
  });
  