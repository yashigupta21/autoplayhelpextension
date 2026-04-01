# Netflix AutoSkip

A lightweight browser extension (Chrome + Firefox) that automatically handles Netflix interruptions so you can binge uninterrupted.

---

## Features

- **Skip Intro** — clicks "Skip Intro" the moment it appears
- **Skip Recap** — clicks "Skip Recap" at the start of each episode
- **Next Episode** — advances automatically when you reach the end
- **Continue Watching** — dismisses the "Are you still watching?" dialog
- **Popup toggle** — pause/resume the extension from the toolbar without disabling it
- **Configurable** — adjust the next-episode threshold and cooldown via the options page
- **Per-feature control** — turn each action on or off independently
- Visibility-checked before every click — never clicks hidden buttons
- MutationObserver + debounce — reacts instantly to Netflix's dynamic UI

---

## Folder Structure

```
autoplayhelpextension/
├── manifest.json
├── content.js          — core skip logic
├── popup.html/js       — toolbar toggle UI
├── background.js       — service worker, sets defaults on install
├── options.html/js     — settings page (threshold, cooldown, per-feature toggles)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── tests/
    └── test_logic.js   — unit tests (run with: node tests/test_logic.js)
```

---

## Installation

### Chrome

1. Go to `chrome://extensions/`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load Unpacked**
4. Select the `autoplayhelpextension/` folder

Compatible with **Chrome 88+** (Manifest V3).

### Firefox

1. Go to `about:debugging`
2. Click **This Firefox**
3. Click **Load Temporary Add-on**
4. Select the `manifest.json` file

Compatible with **Firefox 109+** (Manifest V3).

> For permanent installation on Firefox, submit to [Firefox Add-ons (AMO)](https://addons.mozilla.org).

---

## How It Works

Every second — and on any Netflix DOM change — the extension runs a check (in priority order):

1. **Skip Intro** — finds a visible "Skip Intro" button → clicks it
2. **Skip Recap** — finds a visible "Skip Recap" button → clicks it
3. **Continue Watching** — finds a visible "Continue Watching" button → clicks it
4. **Next Episode** — finds the next-episode button and the video is at or past the configured threshold → clicks it

Each action has an independent cooldown to prevent repeated clicks. Visibility is verified via computed CSS styles and element dimensions before any click.

Settings (enabled state, thresholds, per-feature toggles) are stored in `chrome.storage.local` and applied immediately to all open Netflix tabs — no page reload required.

---

## Settings

Open settings via the **Settings** button in the popup, or directly at `chrome://extensions` → Details → Extension options.

| Setting | Default | Description |
|---|---|---|
| Skip Intro | On | Auto-click "Skip Intro" |
| Skip Recap | On | Auto-click "Skip Recap" |
| Next Episode | On | Auto-advance at episode end |
| Continue Watching | On | Dismiss "Are you still watching?" |
| Next Episode Threshold | 95% | How far through an episode before advancing |
| Action Cooldown | 10s | Minimum gap between repeated clicks |

---

## Running Tests

```bash
node tests/test_logic.js
```

Tests cover: playback fraction, episode keying, cooldown expiry, per-action independence, memory pruning, options slider round-trips, and default values.

---

## Limitations

- Designed for **Netflix desktop browser** only
- May need selector updates if Netflix changes button labels or `data-uia` attributes
- Not yet published to Chrome Web Store or Firefox AMO — manual installation only

---

## License

MIT License — free to use, modify, and distribute.

---

## Author

Crafted by Yashi Gupta
