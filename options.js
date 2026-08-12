const FEATS = ['skipIntro', 'skipRecap', 'nextEpisode', 'continueWatching'];

// `enabled` is included so "Reset to defaults" un-pauses the extension —
// the popup toggle owns it otherwise.
const DEFAULTS = {
  enabled:       true,
  nextThreshold: 0.95,
  cooldownMs:    10000,
  ...Object.fromEntries(FEATS.map(k => [k, true])),
};

const el      = (id) => document.getElementById(id);
const featEl  = (key) => el('feat-' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase()));

const thresholdInput = el('threshold');
const thresholdValue = el('threshold-value');
const cooldownInput  = el('cooldown');
const cooldownValue  = el('cooldown-value');
const savedMsg       = el('saved');

let savedTimer = null;

function renderValues(settings) {
  const pct = Math.round(settings.nextThreshold * 100);
  const sec = Math.round(settings.cooldownMs / 1000);

  thresholdInput.value       = pct;
  thresholdValue.textContent = pct + '%';
  cooldownInput.value        = sec;
  cooldownValue.textContent  = sec + 's';

  for (const k of FEATS) featEl(k).checked = settings[k];
}

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

el('save-btn').addEventListener('click', () => {
  chrome.storage.local.set({
    nextThreshold: parseInt(thresholdInput.value, 10) / 100,
    cooldownMs:    parseInt(cooldownInput.value, 10) * 1000,
    ...Object.fromEntries(FEATS.map(k => [k, featEl(k).checked])),
  });
  showSaved();
});

el('reset-btn').addEventListener('click', () => {
  chrome.storage.local.set(DEFAULTS);
  renderValues(DEFAULTS);
  showSaved();
});
