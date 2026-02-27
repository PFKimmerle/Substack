# Luna Desktop Pet

Sailor Moon's guardian cat Luna as a Windows desktop companion. She idles, walks, sleeps, dances, crawls on walls, and has a subtle glitch effect.

![Windows](https://img.shields.io/badge/platform-Windows-blue)
![Python](https://img.shields.io/badge/python-3.x-yellow)

## Quick Start

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Double-click **Luna.bat**

3. Click **Start Luna** and watch her explore your desktop!

## Controls

| Action | What Happens |
|--------|-------------|
| **Drag** | Pick up Luna and move her around |
| **Drop** | Release to let her fall (alternates belly up/down) |
| **Right-click** | Make her dance |
| **Close launcher** | Stops Luna |

## Features

- Idle animation with breathing and tail movement
- Walking left and right
- Sleep cycle with animated yellow Z's
- Dance moves (right-click)
- Wall crawling - walks to screen edge, climbs walls and ceiling
- Fall toggle - alternates belly-down/belly-up when dropped
- Glitch effect - subtle flash every 5th animation loop
- Taskbar-aware - stays above the taskbar
- Start/Stop launcher GUI

## Requirements

- Windows
- Python 3.x
- [Pillow](https://pypi.org/project/Pillow/)
- [pywin32](https://pypi.org/project/pywin32/)

## Project Structure

```
luna-desktop-pet/
├── Luna.bat              # Double-click to launch
├── luna_launcher.pyw     # Start/Stop GUI
├── pets.py               # Main application
├── configs.json          # Animation configuration
├── requirements.txt
└── pets/
    └── luna/             # 15 animation GIFs
        ├── 00_0_idle.gif
        ├── 01-03: sleep cycle
        ├── 04-05: walking left/right
        ├── 06: falling
        ├── 07: dragging
        ├── 08: dance
        └── 09-14: wall crawl
```

## How It Works

Luna is a transparent overlay window that sits on top of your desktop. She uses a state machine to cycle through animations - idle, walk, sleep, and occasionally crawl up walls and across the ceiling. A subtle glitch effect flashes every 5th animation loop on ground animations for a "did I just see that?" effect.

Built with Python, tkinter, and Pillow. Sprites generated via ChatGPT and manually curated frame-by-frame.