# BMO Desktop Pet

A pixel art BMO from Adventure Time that walks around your desktop

## How to Run

1. Double-click **BMO.bat**
2. Click **Start BMO** in the launcher window
3. BMO appears on your desktop
4. **Left-click + drag** to move BMO around
5. Click **Stop BMO** in the launcher to stop

First run creates a virtual environment and installs Pillow automatically.

## Assets

All sprites are included in the `assets/` folder:

### Walk Sprites (right-facing, left is auto-mirrored)
- `smile_walk_right0.png` - Walk frame 1 (also used as idle)
- `smile_walk_right_1.png` - Walk frame 2
- `smile_walk__right2.png` - Walk frame 3

### Speech Bubbles
- `bubble_finn.png`, `bubble_jake.png`, `bubble_bmo.png`
- `bubble_lsp.png`, `bubble_marceline.png`, `bubble_pb.png`
- `bubble_gunter.png`, `bubble_peppermint.png`

BMO works without images too (shows a green placeholder).

## Project Files

| File | What it does |
|------|-------------|
| `BMO.bat` | Double-click to start everything |
| `bmo_launcher.pyw` | Start/Stop button window |
| `bmo_pet.pyw` | The actual pet (walks, swaps faces, bubbles) |
| `assets/` | Put your PNG images here |
