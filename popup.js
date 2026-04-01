const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
const dot    = document.getElementById('dot');

function applyState(enabled) {
  toggle.checked   = enabled;
  status.textContent = enabled ? 'Active' : 'Paused';
  dot.className    = 'dot' + (enabled ? ' active' : '');
}

// Load current state from storage
chrome.storage.local.get({ enabled: true }, ({ enabled }) => {
  applyState(enabled);
});

// Write to storage on toggle — content script picks up via storage.onChanged
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ enabled });
  applyState(enabled);
});

// Open options page
document.getElementById('settings-btn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
