# Pulse Prism

Pulse Prism is a modern music player frontend built with React, Vite, and a standalone glassmorphism player surface. The UI stays in a single HTML template while the runtime injects a Monochrome-backed data and playback layer for search, albums, queueing, recommendations, and preview playback.

## Live demo

GitHub Pages: https://retrocodes12.github.io/pulse-prism-monochrome/

## What is wired right now

- Real discovery data from Monochrome editor picks
- Search for tracks, albums, and artists
- Album loading without breaking the current layout
- Queue, likes, recents, and last-track memory in local storage
- Preview playback through Monochrome `trackManifests` using Shaka Player
- Expanded now-playing view with synced playback markers
- Standalone share export for file sharing or GitHub Pages

## What is intentionally not wired

- Monochrome account auth
- Full lyrics from the backend
- Any mobile-app packaging

The public Monochrome endpoints are enough for metadata, discovery, recommendations, and preview playback. Auth was left out on purpose because the upstream project uses Appwrite configuration that is not safe to assume for a GitHub Pages deployment.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Standalone share export

```bash
npm run build:share
```

That writes a single file to `dist-share/index.html`.

## Project structure

- `src/App.tsx`: React host that mounts the standalone player surface in an iframe
- `src/templates/pulse-prism-ui.html`: current UI source of truth
- `src/templates/pulse-prism-app.js`: Monochrome runtime, playback, search, queue, and persistence
- `scripts/build-share.mjs`: injects the runtime into the HTML template for standalone export

## Deployment

GitHub Pages deploys from the share build in `dist-share/` through `.github/workflows/deploy-pages.yml`.

Current deployment URL: https://retrocodes12.github.io/pulse-prism-monochrome/
