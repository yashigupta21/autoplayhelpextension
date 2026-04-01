const DEFAULTS = {
  nextThreshold:   0.95,
  cooldownMs:      10000,
  skipIntro:       true,
  skipRecap:       true,
  nextEpisode:     true,
  continueWatching: true
};

const thresholdInput = document.getElementById('threshold');
const thresholdValue = document.getElementById('threshold-value');
const cooldownInput  = document.getElementById('cooldown');
const cooldownValue  = document.getElementById('cooldown-value');
const saveBtn        = document.getElementById('save-btn');
const resetBtn       = document.getElementById('reset-btn');
const savedMsg       = document.getElementById('saved');

const featureToggles = {
  skipIntro:        document.getElementById('feat-skip-intro'),
  skipRecap:        document.getElementById('feat-skip-recap'),
  nextEpisode:      document.getElementById('feat-next-episode'),
  continueWatching: document.getElementById('feat-continue')
};

let savedTimer = null;

function renderValues({ nextThreshold, cooldownMs, skipIntro, skipRecap, nextEpisode, continueWatching }) {
  const pct = Math.round(nextThreshold * 100);
  const sec = Math.round(cooldownMs / 1000);

  thresholdInput.value      = pct;
  thresholdValue.textContent = pct + '%';
  cooldownInput.value       = sec;
  cooldownValue.textContent  = sec + 's';

  featureToggles.skipIntro.checked        = skipIntro;
  featureToggles.skipRecap.checked        = skipRecap;
  featureToggles.nextEpisode.checked      = nextEpisode;
  featureToggles.continueWatching.checked = continueWatching;
}

// Load stored settings
chrome.storage.local.get(DEFAULTS, renderValues);

// Live preview while dragging
thresholdInput.addEventListener('input', () => {
  thresholdValue.textContent = thresholdInput.value + '%';
});

cooldownInput.addEventListener('input', () => {
  cooldownValue.textContent = cooldownInput.value + 's';
});

function showSaved() {
  savedMsg.style.display = 'inline';
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => { savedMsg.style.display = 'none'; }, 2000);
}

// Save all settings
saveBtn.addEventListener('click', () => {
  chrome.storage.local.set({
    nextThreshold:    parseInt(thresholdInput.value, 10) / 100,
    cooldownMs:       parseInt(cooldownInput.value, 10) * 1000,
    skipIntro:        featureToggles.skipIntro.checked,
    skipRecap:        featureToggles.skipRecap.checked,
    nextEpisode:      featureToggles.nextEpisode.checked,
    continueWatching: featureToggles.continueWatching.checked
  });
  showSaved();
});

// Reset to defaults
resetBtn.addEventListener('click', () => {
  chrome.storage.local.set(DEFAULTS);
  renderValues(DEFAULTS);
  showSaved();
});
