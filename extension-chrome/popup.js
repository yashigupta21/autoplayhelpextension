const options = ['ytAd', 'skipIntro', 'nextEp'];

options.forEach(id => {
  const checkbox = document.getElementById(id);
  chrome.storage.sync.get(id, data => {
    checkbox.checked = data[id] ?? true;
  });

  checkbox.addEventListener('change', () => {
    chrome.storage.sync.set({ [id]: checkbox.checked });
  });
});
