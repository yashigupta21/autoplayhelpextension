// Set default settings once on install — never overwrite existing values
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(
    ['enabled', 'nextThreshold', 'cooldownMs', 'skipIntro', 'skipRecap', 'nextEpisode', 'continueWatching'],
    (result) => {
      const defaults = {};
      if (result.enabled           === undefined) defaults.enabled           = true;
      if (result.nextThreshold     === undefined) defaults.nextThreshold     = 0.95;
      if (result.cooldownMs        === undefined) defaults.cooldownMs        = 10000;
      if (result.skipIntro         === undefined) defaults.skipIntro         = true;
      if (result.skipRecap         === undefined) defaults.skipRecap         = true;
      if (result.nextEpisode       === undefined) defaults.nextEpisode       = true;
      if (result.continueWatching  === undefined) defaults.continueWatching  = true;

      if (Object.keys(defaults).length > 0) {
        chrome.storage.local.set(defaults);
      }
    }
  );
});
