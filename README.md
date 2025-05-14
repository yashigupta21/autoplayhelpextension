# 🎬 AutoSkip Helper

**AutoSkip Helper** is a browser extension for Chrome and Firefox that automatically:
- ⏭️ Skips YouTube ads when the "Skip Ad" button appears
- 🎞️ Skips intros on platforms like Netflix, Prime Video, and Hotstar
- 📺 Moves to the next episode automatically

---

## 🚀 Features

- ✅ **Auto-click "Skip Ad"** on YouTube
- ✅ **Auto-click "Skip Intro"** on OTT platforms
- ✅ **Auto-click "Next Episode"** on binge-worthy series
- ✅ **Toggle features from a popup UI**
- ✅ **Works on:**
  - YouTube
  - Netflix
  - Amazon Prime Video
  - Disney+ Hotstar

---

## 🔧 Installation Instructions

### 🧪 For Chrome

1. Go to `chrome://extensions/`
2. Enable **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select the `autoplay-helper-extension/` folder

### 🦊 For Firefox

1. Go to `about:debugging`
2. Click **This Firefox**
3. Click **Load Temporary Add-on**
4. Select the `manifest.json` inside the extension folder

---

## 🖼 UI Preview

The popup lets you enable or disable:
- Skip YouTube Ads
- Skip Intros
- Auto Next Episode

![Popup UI Screenshot](assets/popup-preview.png) *(optional if you have)*

---

## 🧠 How It Works

- The extension uses content scripts to monitor page content.
- When it detects known selectors (e.g., `.ytp-ad-skip-button`), it simulates a click.
- Users can toggle which features are active using the popup.
/***
