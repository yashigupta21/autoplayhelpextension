chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
      ytAd: true,
      skipIntro: true,
      nextEp: true
    });
  });
  