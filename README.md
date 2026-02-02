# MyClassroom Web

A browser-based classroom management tool for teachers. Fast, distraction-free tools accessible from any browser - no app install required.

## Features

### Available Now (MVP)
- **Timer** - Countdown/count-up with presets, visual + audio alerts
- **Time Loss** - Track wasted class time with dramatic visual display
- **Random Picker** - Select random student from class list
- **Noise Monitor** - Visual noise level meter using mic input
- **Dice & Coin** - Animated random generators
- **Class Notes** - Auto-timestamped quick notes
- **Groups** - Random group generator

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start/Stop (Timer, Time Loss, Noise Monitor, Picker) |
| `R` | Reset |
| `F` | Toggle Fullscreen |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: Zustand with localStorage persistence
- **Icons**: Lucide React
- **Audio**: Web Audio API

## Data Storage

All data is stored locally in your browser using localStorage. Use the Settings page to export your data for backup.

## Browser Support

Modern browsers with support for:
- Web Audio API (Noise Monitor)
- MediaDevices API (Microphone access)
- Fullscreen API
- localStorage

## License

MIT
