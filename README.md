# MindMap PWA

Infinite canvas mind mapping Progressive Web App inspired by XMind, with:

- **Infinite canvas** (React Flow)
- **Attachments** on every node (images, files, links) — stored locally via IndexedDB
- **Presentation / Pitch mode** with auto-play and screen recording to video
- Offline-first (PWA)
- Ready for cloud sync

## Quick Start

```bash
npm install
npm run dev
```

## Features

### Core
- Create / edit / delete nodes
- Drag & drop free positioning (infinite canvas)
- Connect nodes by dragging handles
- Double-click to edit label
- Color coding + notes per node
- Local save (IndexedDB via Dexie)

### Attachments
- Upload images / files / audio / video
- Add external links
- Preview images
- Files stored as Blobs in IndexedDB (offline)

### Pitch Mode
- Enter presentation mode
- Step through nodes in hierarchical order
- Auto-play
- **Record Video**: Screen Capture API + MediaRecorder → downloads WebM

### PWA
- Installable
- Offline caching

## Tech Stack

- Vite + React 19 + TypeScript
- @xyflow/react (React Flow)
- Zustand
- Dexie (IndexedDB)
- Tailwind CSS v4
- vite-plugin-pwa

## Deploy

Connected to Vercel for automatic deploys from `main`.
