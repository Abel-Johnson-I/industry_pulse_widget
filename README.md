# industry_pulse_widget
Minimal Windows desktop widget for real-time Electronics &amp; AI news — built with Electron

## ✨ Features

- 🔷 **Electronics Industry** — Semiconductors, chips, PCB, EDA, power electronics, hardware
- 🟣 **AI World** — Model releases, AI policy, enterprise AI, research breakthroughs
- ⏱ Auto-refreshes every hour (configurable)
- 🧠 Keyword scoring + Jaccard deduplication — no repeated or irrelevant stories
- 📡 15+ trusted RSS sources — no API keys required
- 💾 Offline-resilient — shows cached headlines when internet is unavailable
- 🎨 Dark / Light / Auto theme with glassmorphism UI
- 📌 Always-on-top, borderless, transparent window
- 🗂 Remembers position, theme, and preferences
- 🖥 System tray with Refresh / Settings / Exit

---



## 🚀 Quick Start

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- Windows 10/11 (64-bit)



### Build Windows installer

```bash
npm run build
# Output: dist/Industry Pulse Setup 1.0.0.exe
```

### Build portable EXE (no install needed)

```bash
npm run build-portable
# Output: dist/Industry Pulse 1.0.0.exe
```

---

## 🏗 Architecture

```
industry-pulse/
├── src/
│   ├── main.js              # Electron main process (window, tray, IPC)
│   ├── preload.js           # Secure contextBridge IPC
│   ├── index.html           # Widget UI
│   ├── settings.html        # Settings window
│   └── js/
│       ├── news-fetcher.js  # RSS fetch, parse, filter, score, deduplicate
│       └── startup-helper.js
└── package.json
```

---

## 📡 News Sources

**Electronics Industry**
| Source | Feed |
|---|---|
| IEEE Spectrum | https://spectrum.ieee.org/feeds/feed.rss |
| EE Times | https://www.eetimes.com/feed/ |
| Semiconductor Engineering | https://semiengineering.com/feed/ |
| EDN Network | https://www.edn.com/feed/ |
| Electronic Design | https://www.electronicdesign.com/rss |
| AnandTech | https://www.anandtech.com/rss/ |
| Tom's Hardware | https://www.tomshardware.com/feeds/all |

**AI World**
| Source | Feed |
|---|---|
| MIT Technology Review | https://www.technologyreview.com/topic/artificial-intelligence/feed |
| VentureBeat AI | https://venturebeat.com/category/ai/feed/ |
| OpenAI Blog | https://openai.com/news/rss.xml |
| Google DeepMind | https://deepmind.google/blog/rss.xml |
| Hugging Face Blog | https://huggingface.co/blog/feed.xml |
| The Verge – AI | https://www.theverge.com/ai-artificial-intelligence/rss/index.xml |
| AI News | https://www.artificialintelligence-news.com/feed/ |

> No API keys required. All sources are public RSS feeds.

---

## ⚙️ Settings

| Setting | Default | Options |
|---|---|---|
| Theme | Dark | Dark / Light / Auto |
| Compact Mode | Off | 3 or 5 headlines per section |
| Always on Top | On | On / Off |
| Refresh Interval | 60 min | 30 / 60 / 120 / 180 min |
| Opacity | 95% | 60% – 100% |
| Electronics Section | On | Toggle |
| AI Section | On | Toggle |

Settings stored at: `%APPDATA%\industry-pulse\settings.json`

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Desktop runtime | Electron 28 |
| UI | Vanilla HTML / CSS / JS |
| Fonts | DM Sans + DM Mono |
| RSS parsing | Custom regex XML parser |
| Storage | Local JSON files |
| Packaging | electron-builder (NSIS + portable) |

---

## 🪟 Add to Windows Startup

Run this in PowerShell:

```powershell
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\IndustryPulse.lnk")
$Shortcut.TargetPath = "cmd.exe"
$Shortcut.Arguments = "/c cd `"$env:USERPROFILE\path\to\industry-pulse`" && npm start"
$Shortcut.WindowStyle = 7
$Shortcut.Save()
```

---

## 🤝 Contributing

Pull requests welcome! To add new RSS sources, edit the `RSS_FEEDS` object in `src/js/news-fetcher.js`.

To add new keyword filters, edit `ELECTRONICS_KEYWORDS` or `AI_KEYWORDS` in the same file.

---

## 📄 License

MIT — free to use, modify, and distribute.

---

> Built with ❤️ and [Claude AI](https://claude.ai)
