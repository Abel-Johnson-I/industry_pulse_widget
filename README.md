# Industry Pulse 🔷🟣
### A minimal Windows desktop widget for Electronics & AI news

---

## Overview

**Industry Pulse** is a lightweight, always-on-top Windows desktop widget that automatically fetches and displays the latest headlines from:

- **Electronics Industry** — Semiconductors, chips, PCB, EDA, power electronics, hardware
- **AI World** — Model releases, AI policy, enterprise AI, research breakthroughs

Built with **Electron** for native Windows feel, glassmorphism dark/light UI, and zero distraction design.

---

## Architecture

```
industry-pulse/
├── src/
│   ├── main.js              # Electron main process (window, tray, IPC, settings)
│   ├── preload.js           # Secure IPC bridge (contextBridge)
│   ├── index.html           # Widget UI (main window)
│   ├── settings.html        # Settings window
│   └── js/
│       ├── news-fetcher.js  # RSS fetch, parse, filter, deduplicate, score
│       └── startup-helper.js # Windows autostart registry helper
├── package.json
└── README.md
```

### Module responsibilities

| Module | Responsibility |
|---|---|
| `main.js` | Window creation, system tray, IPC handlers, file-based settings & cache |
| `preload.js` | Exposes safe `electronAPI` bridge to renderer |
| `news-fetcher.js` | Fetches RSS feeds, parses XML, scores relevance, deduplicates |
| `index.html` | Widget UI: renders news, handles refresh cycle, applies theme |
| `settings.html` | Settings UI: theme, compact mode, always-on-top, intervals |

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Desktop runtime | **Electron 28** | Best Windows integration, transparent windows, tray support |
| UI | Vanilla HTML/CSS/JS | Zero framework overhead, fast, minimal RAM |
| Fonts | DM Sans + DM Mono | Clean, modern, non-generic |
| RSS parsing | Custom regex parser | No heavy XML library needed for RSS |
| Storage | JSON files (userData) | Lightweight, no SQLite overhead |
| Build/package | electron-builder | NSIS installer + portable EXE |

**Why Electron over alternatives?**
- **vs. Tauri**: Electron has better transparent window + always-on-top support on Windows
- **vs. WPF/WinUI**: No .NET install requirement, easier RSS/HTTP handling
- **vs. PyQt**: Better UI polish, no Python runtime required on user machine

---

## Prerequisites

- **Node.js** 18+ (Download: https://nodejs.org)
- **npm** (included with Node.js)
- **Windows 10/11** (64-bit)

---

## Quick Start (Development)

```bash
# 1. Clone or download the project
cd industry-pulse

# 2. Install dependencies
npm install

# 3. Run in development mode
npm start
```

The widget will appear in the **bottom-right corner** of your screen.

---

## Running for the First Time

1. The widget appears as a small dark panel (~380×620px)
2. It is **always-on-top** by default — drag it anywhere on screen
3. Right-click the **system tray icon** (bottom-right taskbar) for quick actions
4. Click the **⚙ gear icon** in the widget to open Settings
5. Headlines refresh automatically every **1 hour**
6. Click **↻** to refresh manually

---

## Build & Package for Windows

### Install build tools
```bash
npm install
```

### Build NSIS installer (.exe)
```bash
npm run build
```
Output: `dist/Industry Pulse Setup 1.0.0.exe`

### Build portable executable (no install needed)
```bash
npm run build-portable
```
Output: `dist/Industry Pulse 1.0.0.exe`

---

## Installation

Run the generated `Industry Pulse Setup 1.0.0.exe`:
- Choose install directory
- Desktop shortcut is created automatically
- Widget starts after installation

---

## RSS Feed Sources

### Electronics Industry
| Source | URL |
|---|---|
| EE Times | https://www.eetimes.com/feed/ |
| Electronic Design | https://www.electronicdesign.com/rss |
| IEEE Spectrum | https://spectrum.ieee.org/feeds/feed.rss |
| Semiconductor Engineering | https://semiengineering.com/feed/ |
| AnandTech | https://www.anandtech.com/rss/ |
| Tom's Hardware | https://www.tomshardware.com/feeds/all |
| EDN Network | https://www.edn.com/feed/ |

### AI World
| Source | URL |
|---|---|
| MIT Technology Review – AI | https://www.technologyreview.com/topic/artificial-intelligence/feed |
| VentureBeat AI | https://venturebeat.com/category/ai/feed/ |
| The Verge – AI | https://www.theverge.com/ai-artificial-intelligence/rss/index.xml |
| AI News | https://www.artificialintelligence-news.com/feed/ |
| Google DeepMind Blog | https://deepmind.google/blog/rss.xml |
| OpenAI Blog | https://openai.com/news/rss.xml |
| Hugging Face Blog | https://huggingface.co/blog/feed.xml |

> **No API keys required.** All feeds are public RSS. No rate limits.

---

## Settings

| Setting | Default | Description |
|---|---|---|
| Theme | Dark | Dark / Light / Auto (system) |
| Compact Mode | Off | 3 headlines vs 5 per section |
| Always on Top | On | Widget floats above other windows |
| Refresh Interval | 60 min | 30 / 60 / 120 / 180 minutes |
| Opacity | 95% | 60%–100% transparency |
| Electronics Section | On | Toggle electronics news |
| AI Section | On | Toggle AI news |

Settings are stored in:
`%APPDATA%\industry-pulse\settings.json`

Cache is stored in:
`%APPDATA%\industry-pulse\cache.json`

---

## Filtering Logic

### Electronics filter
Headlines are scored using keyword matching against 60+ terms:
- Industry: `semiconductor`, `TSMC`, `chip`, `foundry`, `wafer`
- Components: `CPU`, `GPU`, `FPGA`, `MCU`, `MOSFET`, `IGBT`
- Manufacturing: `3nm`, `5nm`, `chiplet`, `heterogeneous integration`
- Markets: `consumer electronics`, `automotive electronics`, `PCB design`

### AI filter
Headlines scored against 50+ terms:
- Models: `LLM`, `GPT`, `Claude`, `Gemini`, `foundation model`
- Companies: `OpenAI`, `Anthropic`, `Google DeepMind`, `Meta AI`
- Events: `model release`, `AI regulation`, `AI policy`, `AI funding`
- Research: `benchmark`, `RLHF`, `multimodal`, `diffusion model`

### Deduplication
Jaccard similarity on word tokens — headlines with >55% word overlap are merged, keeping the highest-scored version.

---

## Performance

| Metric | Value |
|---|---|
| Memory (idle) | ~60–90 MB RAM |
| Memory (refreshing) | ~100 MB peak |
| CPU (idle) | <0.1% |
| Disk | <5 MB |
| Network | ~200KB per refresh (8 feeds × 2 categories) |

---

## Tray Menu

Right-click the tray icon for:
- **Show Widget** — Bring widget back to screen
- **Refresh Now** — Immediate news fetch
- **Settings** — Open settings window
- **Exit** — Quit completely

---

## Customization (Advanced)

### Add your own RSS feeds
Edit `src/js/news-fetcher.js`:
```js
const RSS_FEEDS = {
  electronics: [
    // Add your feed:
    { name: 'My Source', url: 'https://example.com/feed.rss', weight: 8 }
  ],
  ...
}
```

### Adjust keyword scoring
Edit the `ELECTRONICS_KEYWORDS` or `AI_KEYWORDS` arrays in `news-fetcher.js`.

### Change widget size
Edit `main.js`:
```js
const winWidth = 420;   // wider widget
const winHeight = 700;  // taller widget
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "OFFLINE" badge shown | Check internet connection; cached headlines will display |
| Widget not visible | Right-click tray icon → Show Widget |
| No headlines after refresh | Some RSS feeds may be temporarily down; wait for next refresh |
| Widget off screen | Delete `settings.json` from `%APPDATA%\industry-pulse\` to reset position |
| High memory | Restart widget; this is usually a one-time browser engine startup spike |

---

## License

MIT — Free to use and modify.
