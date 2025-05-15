# 🎬 Netflix AutoSkip

**Netflix AutoSkip** is a lightweight browser extension that automatically:
- ⏭️ Clicks **"Skip Intro"** on Netflix
- ▶️ Clicks **"Next Episode"** when it appears

This tool helps you binge-watch Netflix without interruptions.

---

## 🚀 Features

- ✅ Automatically clicks:
  - "Skip Intro"
  - "Next Episode"
- ✅ Runs silently in the background
- ✅ Works with:
  - Chrome (Manifest V2 supported via temporary loading)
  - Firefox (Temporary add-on installation)

---

## 📦 Folder Structure

```
netflix-auto-skip/
├── manifest.json
└── content.js
```

---

## 🔧 Installation

### For Chrome

1. Go to `chrome://extensions/`
2. Enable **Developer Mode** (top-right)
3. Click **Load Unpacked**
4. Select the `netflix-auto-skip/` folder

### For Firefox

1. Go to `about:debugging`
2. Click **This Firefox**
3. Click **Load Temporary Add-on**
4. Select the `manifest.json` file

---

## 🧠 How It Works

The script searches for all buttons on the Netflix page every second.
If it finds a button containing:
- “Skip Intro”
- “Next Episode”

...it automatically clicks it for you.

No configuration, no setup — it just works.

---

## ⚠️ Limitations

- Designed specifically for **Netflix desktop browser**.
- May break if Netflix changes its button labels or structure.
- Not currently published in any extension store — manual installation only.

---

## 📜 License

MIT License — Free to use, modify, and distribute.

---

## 👨‍💻 Author

Crafted with care by Yashi Gupta
