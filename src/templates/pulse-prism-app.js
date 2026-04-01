(() => {
  const STORAGE_KEYS = {
    liked: 'pulse-prism-liked-track-ids',
    recents: 'pulse-prism-recent-track-ids',
    lastTrack: 'pulse-prism-last-track-id',
    volume: 'pulse-prism-volume',
    muted: 'pulse-prism-muted',
  };

  const EDITORS_PICKS_URL = 'https://monochrome.tf/editors-picks.json';
  const API_INSTANCES = [
    'https://eu-central.monochrome.tf',
    'https://us-west.monochrome.tf',
    'https://api.monochrome.tf',
    'https://arran.monochrome.tf',
  ];

  const MOOD_PRESETS = [
    {
      label: 'After Dark',
      desc: 'Synth-pop and night-drive picks',
      query: 'after dark synth pop',
      colors: ['#335dff', '#8553ff'],
    },
    {
      label: 'Slow Burn',
      desc: 'R&B with a low-lit pace',
      query: 'late night r&b',
      colors: ['#6e4cf8', '#ff5e9a'],
    },
    {
      label: 'Focus Pulse',
      desc: 'Clean rhythm for long sessions',
      query: 'focus electronic',
      colors: ['#0ea5e9', '#2563eb'],
    },
    {
      label: 'Soft Arrival',
      desc: 'Ambient pop and quiet lift',
      query: 'ambient dream pop',
      colors: ['#14b8a6', '#22c55e'],
    },
  ];

  const state = {
    audio: document.getElementById('audio'),
    shakaPlayer: null,
    currentPage: 'home',
    isPlaying: false,
    isShuffle: false,
    repeatMode: 0,
    volume: loadStoredNumber(STORAGE_KEYS.volume, 0.76),
    isMuted: loadStoredBoolean(STORAGE_KEYS.muted, false),
    isExpandedPlayerOpen: false,
    activeLyricIdx: -1,
    activeManifestTrackId: null,
    playbackError: '',
    likes: new Set(loadStoredArray(STORAGE_KEYS.liked)),
    recentTrackIds: loadStoredArray(STORAGE_KEYS.recents),
    trackMap: new Map(),
    albumMap: new Map(),
    manifestCache: new Map(),
    collections: {
      homeTracks: [],
      quickTracks: [],
      discoverTracks: [],
      libraryTracks: [],
      radioTracks: [],
    },
    discoveryCards: [],
    featuredAlbums: [],
    queueTrackIds: [],
    currentQueueIndex: 0,
    searchToken: 0,
    radioToken: 0,
    loadToken: 0,
    searchTimer: null,
    discoverContext: {
      gridTitle: 'Editor picks',
      gridLink: 'Featured albums',
      tracksTitle: 'Fresh from Monochrome',
    },
  };

  const dom = {
    searchInput: document.getElementById('search-input'),
    discoverGridTitle: document.getElementById('discover-grid-title'),
    discoverGridLink: document.getElementById('discover-grid-link'),
    discoverTracksTitle: document.getElementById('discover-tracks-title'),
    librarySummary: document.getElementById('library-summary'),
    radioSummary: document.getElementById('radio-summary'),
    lyricsKicker: document.getElementById('lyrics-kicker'),
    lyricsTitle: document.getElementById('lyrics-title'),
    lyricsHint: document.getElementById('lyrics-hint'),
  };

  const audio = state.audio;

  function loadStoredArray(key) {
    try {
      const value = localStorage.getItem(key);
      if (!value) return [];
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function loadStoredNumber(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function loadStoredBoolean(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return raw === 'true';
    } catch {
      return fallback;
    }
  }

  function saveStoredArray(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function saveCurrentState() {
    saveStoredArray(STORAGE_KEYS.liked, [...state.likes]);
    saveStoredArray(STORAGE_KEYS.recents, state.recentTrackIds);
    localStorage.setItem(STORAGE_KEYS.volume, String(state.volume));
    localStorage.setItem(STORAGE_KEYS.muted, String(state.isMuted));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function shuffle(input) {
    const copy = [...input];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function hashString(input) {
    let hash = 0;
    const value = String(input);
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function normalizeHex(color) {
    const raw = String(color || '').trim();
    if (!raw) return '#5ba4ff';
    const match = raw.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return '#5ba4ff';
    let hex = match[1].toLowerCase();
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }
    return `#${hex}`;
  }

  function hexToRgb(color) {
    const normalized = normalizeHex(color).slice(1);
    return {
      r: Number.parseInt(normalized.slice(0, 2), 16),
      g: Number.parseInt(normalized.slice(2, 4), 16),
      b: Number.parseInt(normalized.slice(4, 6), 16),
    };
  }

  function rgbToHex({ r, g, b }) {
    const channel = (value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');
    return `#${channel(r)}${channel(g)}${channel(b)}`;
  }

  function hexToHsl(color) {
    const { r, g, b } = hexToRgb(color);
    const rr = r / 255;
    const gg = g / 255;
    const bb = b / 255;
    const max = Math.max(rr, gg, bb);
    const min = Math.min(rr, gg, bb);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    const delta = max - min;

    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      switch (max) {
        case rr:
          h = (gg - bb) / delta + (gg < bb ? 6 : 0);
          break;
        case gg:
          h = (bb - rr) / delta + 2;
          break;
        default:
          h = (rr - gg) / delta + 4;
          break;
      }
      h *= 60;
    }

    return { h, s: s * 100, l: l * 100 };
  }

  function hslToHex(h, s, l) {
    const hue = ((h % 360) + 360) % 360;
    const sat = clamp(s, 0, 100) / 100;
    const light = clamp(l, 0, 100) / 100;
    const chroma = (1 - Math.abs(2 * light - 1)) * sat;
    const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = light - chroma / 2;
    let rgb = [0, 0, 0];

    if (hue < 60) rgb = [chroma, x, 0];
    else if (hue < 120) rgb = [x, chroma, 0];
    else if (hue < 180) rgb = [0, chroma, x];
    else if (hue < 240) rgb = [0, x, chroma];
    else if (hue < 300) rgb = [x, 0, chroma];
    else rgb = [chroma, 0, x];

    return rgbToHex({
      r: (rgb[0] + m) * 255,
      g: (rgb[1] + m) * 255,
      b: (rgb[2] + m) * 255,
    });
  }

  function deriveColors(baseColor, seed) {
    const base = hexToHsl(baseColor);
    const shift = (hashString(seed) % 56) - 28;
    return {
      accent: hslToHex(base.h, clamp(base.s + 10, 58, 92), clamp(base.l + 6, 48, 72)),
      secondary: hslToHex(base.h + shift + 42, clamp(base.s + 14, 62, 96), clamp(base.l + 14, 52, 78)),
    };
  }

  function formatDuration(seconds) {
    const total = Number(seconds);
    if (!Number.isFinite(total) || total <= 0) return '0:00';
    const mins = Math.floor(total / 60);
    const secs = String(Math.floor(total % 60)).padStart(2, '0');
    return `${mins}:${secs}`;
  }

  function formatQuality(value) {
    if (!value) return 'Preview';
    return String(value)
      .toLowerCase()
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function formatPresentation(track) {
    if (track.presentation === 'PREVIEW') return 'Preview stream';
    if (track.presentation) return formatQuality(track.presentation);
    return 'TIDAL stream';
  }

  function buildMood(track) {
    const bpm = Number(track.bpm || 0);
    if (bpm >= 126) return 'Night Run';
    if (bpm >= 112) return 'Pulse Drive';
    if (bpm >= 96) return 'After Dark';
    return 'Low Tide';
  }

  function buildBlurb(track) {
    const parts = [];
    if (track.album) parts.push(`From ${track.album}`);
    if (track.releaseYear) parts.push(track.releaseYear);
    parts.push(formatQuality(track.quality));
    return parts.join(' · ');
  }

  function getTrackFacts(track) {
    return [
      track.duration,
      track.bpm ? `${track.bpm} BPM` : '',
      formatQuality(track.quality),
      track.explicit ? 'Explicit' : '',
      track.presentation === 'PREVIEW' ? 'Preview' : '',
    ].filter(Boolean);
  }

  function buildNotes(track) {
    const sentences = [
      `${formatPresentation(track)} through Monochrome's public bridge.`,
      track.releaseYear ? `Released ${track.releaseYear}.` : '',
      track.copyright ? `${track.copyright.replace(/\s+/g, ' ')}.` : '',
    ].filter(Boolean);
    return sentences.join(' ');
  }

  function buildPlaybackGuide(track) {
    const total = Math.max(track.durationSec || 180, 90);
    const facts = getTrackFacts(track);
    return [
      { at: 0, text: `${track.artist} sets the opening tone` },
      { at: Math.round(total * 0.2), text: `${track.title} opens into its first full section` },
      {
        at: Math.round(total * 0.4),
        text: track.bpm ? `${track.bpm} BPM holds the center groove` : 'The middle section stays clean and steady',
      },
      {
        at: Math.round(total * 0.62),
        text: track.album ? `${track.album} textures become most obvious here` : 'The arrangement widens through the midpoint',
      },
      {
        at: Math.round(total * 0.82),
        text: facts[1] ? `Final stretch with ${facts[1].toLowerCase()} pressure` : 'Final stretch with the hook fully open',
      },
    ];
  }

  function createFallbackArtwork(seed, title, colors) {
    const accent = colors.accent;
    const secondary = colors.secondary;
    const hash = hashString(seed);
    const label = escapeHtml(title.slice(0, 2).toUpperCase() || 'PP');
    const circleA = 96 + (hash % 120);
    const circleB = 260 + (hash % 80);
    const svg = `
      <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" rx="72" fill="url(#bg)"/>
        <circle cx="${circleA}" cy="144" r="132" fill="${accent}" fill-opacity="0.32"/>
        <circle cx="${circleB}" cy="348" r="148" fill="${secondary}" fill-opacity="0.28"/>
        <path d="M84 364C154 312 220 286 282 286C338 286 388 308 432 344" stroke="rgba(255,255,255,0.78)" stroke-width="18" stroke-linecap="round"/>
        <path d="M112 250H404" stroke="rgba(255,255,255,0.18)" stroke-width="12" stroke-linecap="round"/>
        <text x="50%" y="74%" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Syne, sans-serif" font-size="72" font-weight="700">${label}</text>
        <defs>
          <linearGradient id="bg" x1="64" y1="40" x2="438" y2="476" gradientUnits="userSpaceOnUse">
            <stop stop-color="#071021"/>
            <stop offset="0.48" stop-color="#111d3d"/>
            <stop offset="1" stop-color="#1d1035"/>
          </linearGradient>
        </defs>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  function getTidalImageUrl(id, size = 640) {
    if (!id) return '';
    const formatted = String(id).replaceAll('-', '/');
    return `https://resources.tidal.com/images/${formatted}/${size}x${size}.jpg`;
  }

  function normalizeAlbum(raw) {
    if (!raw || !raw.id) return null;
    const baseColor = normalizeHex(raw.vibrantColor || '#5ba4ff');
    const colors = deriveColors(baseColor, raw.id);
    const title = raw.title || 'Untitled Album';
    const coverId = raw.cover || null;
    const artwork = coverId ? getTidalImageUrl(coverId, 640) : createFallbackArtwork(raw.id, title, colors);
    const album = {
      id: String(raw.id),
      title,
      artist: raw.artist?.name || raw.artists?.[0]?.name || 'Unknown Artist',
      artistId: raw.artist?.id || raw.artists?.[0]?.id || null,
      releaseYear: String(raw.releaseDate || raw.streamStartDate || '').slice(0, 4),
      coverId,
      artwork,
      thumbnail: coverId ? getTidalImageUrl(coverId, 320) : artwork,
      vibrantColor: baseColor,
      colors,
      numberOfTracks: raw.numberOfTracks || 0,
    };
    state.albumMap.set(album.id, album);
    return album;
  }

  function normalizeTrack(raw, fallback = {}) {
    const source = raw?.track || raw?.item || raw;
    if (!source || !source.id) return null;

    const id = String(source.id);
    const artist = source.artist?.name || source.artists?.[0]?.name || fallback.artist || 'Unknown Artist';
    const artists = Array.isArray(source.artists) && source.artists.length
      ? source.artists.map((entry) => entry.name).filter(Boolean).join(', ')
      : artist;
    const coverId = source.album?.cover || source.cover || fallback.coverId || null;
    const albumTitle = source.album?.title || fallback.album || 'Single';
    const baseColor = normalizeHex(source.album?.vibrantColor || source.vibrantColor || fallback.vibrantColor || '#5ba4ff');
    const colors = deriveColors(baseColor, id);
    const artwork = coverId ? getTidalImageUrl(coverId, 640) : createFallbackArtwork(id, source.title || albumTitle, colors);
    const releaseYear = String(source.streamStartDate || fallback.releaseDate || '').slice(0, 4);
    const existing = state.trackMap.get(id) || {};

    const normalized = {
      ...existing,
      id,
      title: source.title || existing.title || 'Untitled Track',
      artist,
      artists,
      artistId: source.artist?.id || source.artists?.[0]?.id || fallback.artistId || existing.artistId || null,
      album: albumTitle,
      albumId: source.album?.id || fallback.albumId || existing.albumId || null,
      durationSec: Number(source.duration) || existing.durationSec || 0,
      duration: formatDuration(Number(source.duration) || existing.durationSec || 0),
      bpm: source.bpm || existing.bpm || null,
      explicit: Boolean(source.explicit),
      quality: source.audioQuality || existing.quality || 'LOSSLESS',
      presentation: existing.presentation || '',
      previewReason: existing.previewReason || '',
      artwork,
      thumbnail: coverId ? getTidalImageUrl(coverId, 160) : artwork,
      coverId,
      vibrantColor: baseColor,
      colors,
      releaseYear,
      releaseDate: source.streamStartDate || fallback.releaseDate || existing.releaseDate || '',
      streamReady: source.streamReady !== false,
      copyright: source.copyright || existing.copyright || '',
    };

    normalized.mood = buildMood(normalized);
    normalized.blurb = buildBlurb(normalized);
    normalized.notes = buildNotes(normalized);
    normalized.facts = getTrackFacts(normalized);
    normalized.playbackGuide = buildPlaybackGuide(normalized);

    state.trackMap.set(normalized.id, normalized);
    return normalized;
  }

  function normalizeArtist(raw) {
    if (!raw || !raw.id) return null;
    const colors = deriveColors(raw.selectedAlbumCoverFallback || raw.picture || '#5ba4ff', raw.id);
    return {
      id: String(raw.id),
      name: raw.name || 'Unknown Artist',
      picture: raw.picture ? getTidalImageUrl(raw.picture, 640) : createFallbackArtwork(raw.id, raw.name || 'Artist', colors),
      thumbnail: raw.picture ? getTidalImageUrl(raw.picture, 320) : createFallbackArtwork(raw.id, raw.name || 'Artist', colors),
      colors,
      popularity: raw.popularity || 0,
    };
  }

  function uniqById(items) {
    const seen = new Set();
    return items.filter((item) => {
      if (!item || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  async function fetchJsonWithTimeout(url, timeoutMs = 7000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Request failed for ${url}: ${response.status}`);
      }
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async function fetchApi(pathOrUrl) {
    if (/^https?:\/\//.test(pathOrUrl)) {
      return fetchJsonWithTimeout(pathOrUrl, 9000);
    }

    const attempts = shuffle(API_INSTANCES);
    let lastError;
    for (const instance of attempts) {
      try {
        return await fetchJsonWithTimeout(`${instance}${pathOrUrl}`);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error(`Failed to load ${pathOrUrl}`);
  }

  function extractSearchItems(source, preferredKeys) {
    const queue = [source];
    const visited = new Set();

    while (queue.length) {
      const current = queue.shift();
      if (!current || typeof current !== 'object' || visited.has(current)) continue;
      visited.add(current);

      for (const key of preferredKeys) {
        if (current[key] && Array.isArray(current[key].items)) {
          return current[key].items;
        }
      }

      if (Array.isArray(current.items)) {
        return current.items;
      }

      Object.values(current).forEach((value) => {
        if (value && typeof value === 'object') queue.push(value);
      });
    }

    return [];
  }

  function getCurrentTrack() {
    const id = state.queueTrackIds[state.currentQueueIndex];
    return id ? state.trackMap.get(id) || null : null;
  }

  function getQueueTracks() {
    return state.queueTrackIds.map((id) => state.trackMap.get(id)).filter(Boolean);
  }

  function setQueue(trackIds, startIndex = 0) {
    state.queueTrackIds = uniqById(trackIds.map((id) => state.trackMap.get(id)).filter(Boolean)).map((track) => track.id);
    state.currentQueueIndex = clamp(startIndex, 0, Math.max(state.queueTrackIds.length - 1, 0));
  }

  function rememberTrack(trackId) {
    state.recentTrackIds = [trackId, ...state.recentTrackIds.filter((id) => id !== trackId)].slice(0, 24);
    localStorage.setItem(STORAGE_KEYS.lastTrack, trackId);
    saveCurrentState();
  }

  function rebuildLibraryCollection() {
    const likedTracks = [...state.likes].map((id) => state.trackMap.get(id)).filter(Boolean);
    const recentTracks = state.recentTrackIds.map((id) => state.trackMap.get(id)).filter(Boolean);
    state.collections.libraryTracks = uniqById([...likedTracks, ...recentTracks]);

    if (!dom.librarySummary) return;
    if (state.collections.libraryTracks.length) {
      const likedCount = likedTracks.length;
      const recentCount = recentTracks.length;
      dom.librarySummary.textContent = `${likedCount} liked tracks and ${recentCount} recent plays saved locally.`;
    } else {
      dom.librarySummary.textContent = 'Like tracks or play a few albums to start building your library.';
    }
  }

  function updateDiscoverContext(context) {
    state.discoverContext = context;
    if (dom.discoverGridTitle) dom.discoverGridTitle.textContent = context.gridTitle;
    if (dom.discoverGridLink) dom.discoverGridLink.textContent = context.gridLink;
    if (dom.discoverTracksTitle) dom.discoverTracksTitle.textContent = context.tracksTitle;
  }

  function artHTML(track, size) {
    const src = size <= 160 ? track.thumbnail || track.artwork : track.artwork;
    return `<img src="${escapeHtml(src)}" width="${size}" height="${size}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" loading="lazy" decoding="async"/>`;
  }

  function barMarkup(trackId, isCurrent) {
    const hash = hashString(trackId);
    const heights = [4 + (hash % 9), 4 + ((hash >> 3) % 10), 4 + ((hash >> 6) % 8)];
    return `
      <div class="bars ${isCurrent ? (state.isPlaying ? 'playing' : 'paused') : ''}">
        ${heights.map((height) => `<div class="bar" style="height:${height}px"></div>`).join('')}
      </div>
    `;
  }

  function renderQueue() {
    const queueRoot = document.getElementById('queue-list');
    const expandedRoot = document.getElementById('expanded-queue-list');
    const queueCount = document.getElementById('expanded-queue-count');
    const queueTracks = getQueueTracks();

    if (queueRoot) {
      if (!queueTracks.length) {
        queueRoot.innerHTML = '<div class="queue-item"><div class="queue-meta"><div class="queue-title">No tracks queued</div><div class="queue-artist">Search or open an album to start.</div></div></div>';
      } else {
        queueRoot.innerHTML = queueTracks
          .map((track, index) => `
            <div class="queue-item ${index === state.currentQueueIndex ? 'active' : ''}" onclick='playQueueTrack(${index}, true)'>
              <div class="queue-art">${artHTML(track, 38)}</div>
              <div class="queue-meta">
                <div class="queue-title">${escapeHtml(track.title)}</div>
                <div class="queue-artist">${escapeHtml(track.artist)}</div>
              </div>
              <span class="queue-dur">${escapeHtml(track.duration)}</span>
            </div>
          `)
          .join('');
      }
    }

    if (expandedRoot) {
      expandedRoot.innerHTML = queueTracks
        .slice(state.currentQueueIndex)
        .map((track, offset) => {
          const queueIndex = state.currentQueueIndex + offset;
          return `
            <div class="expanded-queue-item ${queueIndex === state.currentQueueIndex ? 'active' : ''}" onclick='playQueueTrack(${queueIndex}, true);openExpandedPlayer("queue")'>
              <div class="queue-art">${artHTML(track, 52)}</div>
              <div class="queue-meta">
                <div class="queue-title">${escapeHtml(track.title)}</div>
                <div class="queue-artist">${escapeHtml(track.artist)} · ${escapeHtml(track.album)}</div>
              </div>
              <span class="queue-dur">${offset === 0 ? 'Now' : escapeHtml(track.duration)}</span>
            </div>
          `;
        })
        .join('');
    }

    if (queueCount) {
      queueCount.textContent = queueTracks.length > 1 ? `${queueTracks.length - 1} tracks after this` : 'No queue';
    }
  }

  function renderQuickRow() {
    const root = document.getElementById('quick-row');
    if (!root) return;
    const currentTrack = getCurrentTrack();

    root.innerHTML = state.collections.quickTracks
      .map((track, index) => `
        <div class="quick-card ${currentTrack?.id === track.id ? 'active' : ''}" onclick='playCollectionTrack("quickTracks", ${index}, true)'>
          <div class="quick-art">${artHTML(track, 48)}</div>
          <div class="quick-meta">
            <div class="quick-accent" style="color:${escapeHtml(track.colors.accent)}">${escapeHtml(track.album)}</div>
            <div class="quick-name">${escapeHtml(track.title)}</div>
            <div class="quick-sub">${escapeHtml(track.artist)}</div>
          </div>
        </div>
      `)
      .join('');
  }

  function renderTrackList(containerId, collectionKey, emptyMessage) {
    const root = document.getElementById(containerId);
    if (!root) return;
    const collection = state.collections[collectionKey] || [];
    const currentTrack = getCurrentTrack();

    if (!collection.length) {
      root.innerHTML = `
        <div class="track-row" style="cursor:default;grid-template-columns:1fr">
          <div class="track-text">
            <div class="track-name" style="color:var(--text-secondary)">${escapeHtml(emptyMessage)}</div>
          </div>
        </div>
      `;
      return;
    }

    root.innerHTML = collection
      .map((track, index) => {
        const isCurrent = currentTrack?.id === track.id;
        return `
          <div class="track-row ${isCurrent ? 'active' : ''}" onclick='playCollectionTrack(${JSON.stringify(collectionKey)}, ${index}, true)'>
            <div class="track-num">
              ${isCurrent ? `<span style="display:flex;justify-content:center">${state.isPlaying ? '▶' : '⏸'}</span>` : `<span>${index + 1}</span>`}
            </div>
            <div class="track-info">
              <div class="track-art">
                ${artHTML(track, 40)}
                <div class="playing-indicator">${barMarkup(track.id, isCurrent)}</div>
              </div>
              <div class="track-text">
                <div class="track-name">${escapeHtml(track.title)}</div>
                <div class="track-meta-row">
                  <span>${escapeHtml(track.artist)}</span>
                  <span class="track-dot">•</span>
                  <span>${escapeHtml(track.album)}</span>
                </div>
              </div>
            </div>
            <div class="track-right">
              <button class="like-btn ${state.likes.has(track.id) ? 'liked' : ''}" onclick='event.stopPropagation();toggleLike(${JSON.stringify(track.id)})' data-tip="Like">
                <svg width="14" height="14" fill="${state.likes.has(track.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              </button>
              <span class="track-dur">${escapeHtml(track.duration)}</span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  function renderDiscoveryCards() {
    const root = document.getElementById('mood-grid');
    if (!root) return;

    root.innerHTML = state.discoveryCards
      .map((card, index) => {
        const hasImage = Boolean(card.image);
        const background = hasImage
          ? `linear-gradient(to top, rgba(5,8,18,0.72), rgba(5,8,18,0.08)), url('${escapeHtml(card.image)}') center/cover`
          : `linear-gradient(135deg, ${card.colors[0]}, ${card.colors[1]})`;

        return `
          <div class="mood-card" onclick='runDiscoveryCard(${index})'>
            <div class="mood-card-bg" style="background:${background}"></div>
            <div class="mood-card-overlay"></div>
            <div class="mood-label">${escapeHtml(card.label)}</div>
            <div class="mood-desc">${escapeHtml(card.desc)}</div>
          </div>
        `;
      })
      .join('');
  }

  function renderRadioRow() {
    const root = document.getElementById('radio-row');
    if (!root) return;
    const currentTrack = getCurrentTrack();

    const cards = state.collections.radioTracks.slice(0, 3);
    root.innerHTML = cards
      .map((track, index) => `
        <div class="quick-card ${currentTrack?.id === track.id ? 'active' : ''}" onclick='playCollectionTrack("radioTracks", ${index}, true)'>
          <div class="quick-art">${artHTML(track, 48)}</div>
          <div class="quick-meta">
            <div class="quick-accent" style="color:${escapeHtml(track.colors.accent)}">Station</div>
            <div class="quick-name">${escapeHtml(track.title)} Radio</div>
            <div class="quick-sub">${escapeHtml(track.artist)}</div>
          </div>
        </div>
      `)
      .join('');
  }

  function renderLyrics(track) {
    const root = document.getElementById('lyrics-lines');
    if (!root) return;
    const lines = track.playbackGuide || [];

    if (dom.lyricsKicker) dom.lyricsKicker.textContent = 'Playback Guide';
    if (dom.lyricsTitle) dom.lyricsTitle.textContent = 'Tap a marker to seek';
    if (dom.lyricsHint) dom.lyricsHint.textContent = 'Lyrics unavailable on this source';

    root.innerHTML = lines
      .map((line) => `
        <button class="lyric-line" type="button" onclick='seekToTime(${line.at})'>${escapeHtml(line.text)}</button>
      `)
      .join('');

    state.activeLyricIdx = -1;
    syncLyricState(true);
  }

  function updateHero(track) {
    document.getElementById('hero-title').textContent = track.title;
    document.getElementById('hero-artist').textContent = `${track.artist} · ${track.album}`;
    document.getElementById('hero-mood').textContent = track.mood;
    document.getElementById('hero-bg').style.background = `linear-gradient(135deg, ${track.colors.accent}50, ${track.colors.secondary}45)`;
    document.getElementById('hero-art').innerHTML = artHTML(track, 88);
  }

  function updatePlayerBar(track) {
    document.getElementById('player-title').textContent = track.title;
    document.getElementById('player-artist').textContent = track.artist;
    document.getElementById('player-art').innerHTML = artHTML(track, 52);
    document.getElementById('player-glow').style.background = `radial-gradient(ellipse at left, ${track.colors.accent}, transparent 60%)`;
    document.getElementById('player-heart').classList.toggle('liked', state.likes.has(track.id));
    document.getElementById('time-total').textContent = audio.duration ? formatDuration(audio.duration) : track.duration;
  }

  function updateExpandedPlayer(track) {
    document.getElementById('expanded-cover-bg').style.background = `linear-gradient(135deg, ${track.colors.accent}54, ${track.colors.secondary}44)`;
    document.getElementById('expanded-art').innerHTML = artHTML(track, 320);
    document.getElementById('expanded-title').textContent = track.title;
    document.getElementById('expanded-title-subtitle').textContent = `${track.artist} · ${track.album}`;
    document.getElementById('expanded-now-title').textContent = track.title;
    document.getElementById('expanded-now-subtitle').textContent = `${track.artist} · ${track.album}`;
    document.getElementById('expanded-blurb').textContent = track.blurb;
    document.getElementById('expanded-notes').textContent = state.playbackError || track.notes;
    document.getElementById('expanded-like').classList.toggle('liked', state.likes.has(track.id));
    document.getElementById('expanded-time-total').textContent = audio.duration ? formatDuration(audio.duration) : track.duration;

    const badges = [track.album, track.mood, ...track.facts.slice(0, 2)].filter(Boolean);
    document.getElementById('expanded-badges').innerHTML = badges
      .map((item, index) => `<span class="expanded-badge ${index === 1 ? 'accent' : ''}">${escapeHtml(item)}</span>`)
      .join('');

    document.getElementById('expanded-detail-pills').innerHTML = track.facts
      .map((item) => `<span class="expanded-detail-pill">${escapeHtml(item)}</span>`)
      .join('');

    renderLyrics(track);
    renderQueue();
  }

  function updatePlayPauseIcons() {
    const pauseIcon = '<rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect>';
    const playIcon = '<path d="M8 5v14l11-7z"></path>';
    const icon = state.isPlaying ? pauseIcon : playIcon;
    const ids = ['play-icon', 'hero-play-icon', 'expanded-play-icon'];
    ids.forEach((id) => {
      const node = document.getElementById(id);
      if (node) node.innerHTML = icon;
    });
  }

  function updateRepeatUI() {
    document.querySelectorAll('[data-repeat-control]').forEach((button) => {
      button.classList.toggle('active', state.repeatMode > 0);
      button.style.color = state.repeatMode === 2 ? 'var(--accent-pink)' : '';
    });
  }

  function updateShuffleUI() {
    document.querySelectorAll('[data-shuffle-control]').forEach((button) => {
      button.classList.toggle('active', state.isShuffle);
    });
  }

  function updateVolumeUI() {
    const width = state.isMuted ? 0 : state.volume * 100;
    document.getElementById('vol-fill').style.width = `${width}%`;
  }

  function updateProgressUI() {
    const track = getCurrentTrack();
    if (!track) return;
    const duration = audio.duration || track.durationSec || 0;
    const current = clamp(audio.currentTime || 0, 0, duration || 0);
    const percent = duration ? (current / duration) * 100 : 0;
    const currentLabel = formatDuration(current);
    const totalLabel = duration ? formatDuration(duration) : track.duration;

    document.getElementById('progress-fill').style.width = `${percent}%`;
    document.getElementById('expanded-progress-fill').style.width = `${percent}%`;
    document.getElementById('time-cur').textContent = currentLabel;
    document.getElementById('expanded-time-cur').textContent = currentLabel;
    document.getElementById('time-total').textContent = totalLabel;
    document.getElementById('expanded-time-total').textContent = totalLabel;
  }

  function syncLyricState(forceScroll = false) {
    const track = getCurrentTrack();
    if (!track || !track.playbackGuide?.length) return;

    const lines = track.playbackGuide;
    let activeIndex = -1;

    for (let index = 0; index < lines.length; index += 1) {
      const currentLine = lines[index];
      const nextLine = lines[index + 1];
      if (audio.currentTime >= currentLine.at && (!nextLine || audio.currentTime < nextLine.at)) {
        activeIndex = index;
        break;
      }
    }

    if (activeIndex === state.activeLyricIdx && !forceScroll) return;
    state.activeLyricIdx = activeIndex;

    const lyricNodes = document.querySelectorAll('.lyric-line');
    lyricNodes.forEach((node, index) => {
      node.classList.toggle('past', activeIndex > -1 && index < activeIndex);
      node.classList.toggle('active', index === activeIndex);
    });

    if (activeIndex > -1) {
      const activeNode = lyricNodes[activeIndex];
      if (activeNode) {
        activeNode.scrollIntoView({ block: 'center', behavior: forceScroll ? 'auto' : 'smooth' });
      }
    }
  }

  function renderCollections() {
    renderQueue();
    renderQuickRow();
    renderTrackList('track-list', 'homeTracks', 'Loading tracks from Monochrome...');
    renderTrackList('discover-tracks', 'discoverTracks', 'Search for tracks, albums, or artists.');
    renderTrackList('library-tracks', 'libraryTracks', 'Your liked tracks and recent plays will land here.');
    renderTrackList('radio-tracks', 'radioTracks', 'Recommendations will appear after you pick a track.');
    renderDiscoveryCards();
    renderRadioRow();
  }

  function applyCurrentTrackToSurface() {
    const track = getCurrentTrack();
    if (!track) return;
    updateHero(track);
    updatePlayerBar(track);
    updateExpandedPlayer(track);
    updateProgressUI();
    updatePlayPauseIcons();
    renderCollections();
  }

  async function ensureShakaPlayer() {
    if (state.shakaPlayer) return state.shakaPlayer;
    if (!window.shaka) {
      throw new Error('Shaka Player failed to load');
    }

    window.shaka.polyfill.installAll();
    if (!window.shaka.Player.isBrowserSupported()) {
      throw new Error('Browser does not support Shaka Player');
    }

    state.shakaPlayer = new window.shaka.Player(audio);
    state.shakaPlayer.configure({
      streaming: {
        bufferingGoal: 20,
        rebufferingGoal: 2,
        bufferBehind: 20,
      },
      abr: {
        enabled: true,
        defaultBandwidthEstimate: 160000,
        switchInterval: 1.5,
      },
    });

    state.shakaPlayer.addEventListener('error', (event) => {
      console.error('Shaka error', event);
      state.playbackError = 'Preview stream unavailable right now.';
      state.isPlaying = false;
      updatePlayPauseIcons();
      const track = getCurrentTrack();
      if (track) updateExpandedPlayer(track);
    });

    return state.shakaPlayer;
  }

  async function fetchManifest(track) {
    if (state.manifestCache.has(track.id)) {
      return state.manifestCache.get(track.id);
    }

    const params = new URLSearchParams();
    params.append('id', track.id);
    params.append('formats', 'HEAACV1');
    params.append('formats', 'AACLC');
    params.append('adaptive', 'true');
    params.append('manifestType', /iPad|iPhone|iPod|Safari/.test(navigator.userAgent) ? 'HLS' : 'MPEG_DASH');
    params.append('uriScheme', 'HTTPS');
    params.append('usage', 'PLAYBACK');

    const payload = await fetchApi(`/trackManifests/?${params.toString()}`);
    const attributes = payload?.data?.data?.attributes;
    if (!attributes?.uri) {
      throw new Error(`Missing manifest URI for track ${track.id}`);
    }

    const manifest = {
      url: attributes.uri,
      presentation: attributes.trackPresentation || '',
      previewReason: attributes.previewReason || '',
    };
    state.manifestCache.set(track.id, manifest);
    return manifest;
  }

  async function loadCurrentTrack(autoplay = false, forceLoad = false) {
    const track = getCurrentTrack();
    if (!track) return;

    const token = ++state.loadToken;
    state.playbackError = '';
    rememberTrack(track.id);
    rebuildLibraryCollection();

    if (state.activeManifestTrackId !== track.id) {
      audio.pause();
      state.isPlaying = false;
      updatePlayPauseIcons();
      try {
        audio.currentTime = 0;
      } catch {
        // ignore
      }
      updateProgressUI();
    }

    if (!autoplay && !forceLoad && state.activeManifestTrackId !== track.id) {
      applyCurrentTrackToSurface();
      return;
    }

    try {
      const player = await ensureShakaPlayer();
      const manifest = await fetchManifest(track);
      if (token !== state.loadToken) return;
      await player.load(manifest.url);
      if (token !== state.loadToken) return;

      const updatedTrack = normalizeTrack({ ...track, presentation: manifest.presentation, previewReason: manifest.previewReason }, {
        album: track.album,
        albumId: track.albumId,
        coverId: track.coverId,
        vibrantColor: track.vibrantColor,
        artist: track.artist,
        artistId: track.artistId,
        releaseDate: track.releaseDate,
      });

      updatedTrack.presentation = manifest.presentation;
      updatedTrack.previewReason = manifest.previewReason;
      updatedTrack.notes = buildNotes(updatedTrack);
      updatedTrack.facts = getTrackFacts(updatedTrack);
      state.trackMap.set(updatedTrack.id, updatedTrack);
      state.activeManifestTrackId = updatedTrack.id;
      applyCurrentTrackToSurface();

      if (autoplay) {
        await audio.play();
      }
    } catch (error) {
      console.error('Playback load failed', error);
      if (token !== state.loadToken) return;
      state.playbackError = 'Preview stream unavailable right now.';
      state.isPlaying = false;
      updatePlayPauseIcons();
      applyCurrentTrackToSurface();
    }
  }

  async function playQueueTrack(index, autoplay = true) {
    if (index < 0 || index >= state.queueTrackIds.length) return;
    state.currentQueueIndex = index;
    await loadCurrentTrack(autoplay);
    await refreshRadio();
  }

  async function playCollectionTrack(collectionKey, index, autoplay = true) {
    const collection = state.collections[collectionKey] || [];
    if (!collection[index]) return;
    setQueue(collection.map((track) => track.id), index);
    await playQueueTrack(index, autoplay);
  }

  async function togglePlay() {
    const track = getCurrentTrack();
    if (!track) return;

    if (state.activeManifestTrackId !== track.id) {
      await loadCurrentTrack(true);
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error('Play failed', error);
      }
    } else {
      audio.pause();
    }
  }

  async function nextTrack() {
    if (!state.queueTrackIds.length) return;
    if (state.isShuffle && state.queueTrackIds.length > 1) {
      let nextIndex = state.currentQueueIndex;
      while (nextIndex === state.currentQueueIndex) {
        nextIndex = Math.floor(Math.random() * state.queueTrackIds.length);
      }
      await playQueueTrack(nextIndex, true);
      return;
    }

    const nextIndex = (state.currentQueueIndex + 1) % state.queueTrackIds.length;
    if (nextIndex === 0 && state.repeatMode === 0 && state.currentQueueIndex === state.queueTrackIds.length - 1) {
      audio.pause();
      state.isPlaying = false;
      updatePlayPauseIcons();
      return;
    }
    await playQueueTrack(nextIndex, true);
  }

  async function prevTrack() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      updateProgressUI();
      syncLyricState(true);
      return;
    }

    if (!state.queueTrackIds.length) return;
    const previousIndex = (state.currentQueueIndex - 1 + state.queueTrackIds.length) % state.queueTrackIds.length;
    await playQueueTrack(previousIndex, true);
  }

  async function seekRel(seconds) {
    const track = getCurrentTrack();
    if (!track) return;
    if (state.activeManifestTrackId !== track.id) {
      await loadCurrentTrack(false, true);
    }
    const duration = audio.duration || track.durationSec || 0;
    audio.currentTime = clamp((audio.currentTime || 0) + seconds, 0, duration || 0);
    updateProgressUI();
    syncLyricState(true);
  }

  async function seekToTime(seconds) {
    const track = getCurrentTrack();
    if (!track) return;
    if (state.activeManifestTrackId !== track.id) {
      await loadCurrentTrack(false, true);
    }
    audio.currentTime = Math.max(0, seconds);
    updateProgressUI();
    syncLyricState(true);
  }

  async function seek(event) {
    const track = getCurrentTrack();
    if (!track) return;
    if (state.activeManifestTrackId !== track.id) {
      await loadCurrentTrack(false, true);
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const duration = audio.duration || track.durationSec || 0;
    if (duration) {
      audio.currentTime = duration * ratio;
      updateProgressUI();
      syncLyricState(true);
    }
  }

  function toggleShuffle() {
    state.isShuffle = !state.isShuffle;
    updateShuffleUI();
  }

  function cycleRepeat() {
    state.repeatMode = (state.repeatMode + 1) % 3;
    updateRepeatUI();
  }

  function toggleMute() {
    state.isMuted = !state.isMuted;
    audio.volume = state.isMuted ? 0 : state.volume;
    updateVolumeUI();
    saveCurrentState();
  }

  function setVolume(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    state.volume = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    state.isMuted = false;
    audio.volume = state.volume;
    updateVolumeUI();
    saveCurrentState();
  }

  function toggleLike(trackId) {
    if (!trackId) return;
    if (state.likes.has(trackId)) state.likes.delete(trackId);
    else state.likes.add(trackId);
    rebuildLibraryCollection();
    saveCurrentState();
    applyCurrentTrackToSurface();
  }

  function toggleLikeCurrent() {
    const track = getCurrentTrack();
    if (!track) return;
    toggleLike(track.id);
  }

  function openExpandedPlayer(section = 'lyrics') {
    const panel = document.getElementById('expanded-player');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('player-open');
    state.isExpandedPlayerOpen = true;

    if (section === 'queue') {
      requestAnimationFrame(() => {
        document.getElementById('expanded-queue-card').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    }
  }

  function closeExpandedPlayer() {
    const panel = document.getElementById('expanded-player');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('player-open');
    state.isExpandedPlayerOpen = false;
  }

  function setPage(pageId, navEl) {
    state.currentPage = pageId;
    document.querySelectorAll('.page').forEach((node) => node.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach((node) => node.classList.remove('active'));
    document.querySelectorAll('.page-tab').forEach((node) => node.classList.remove('active'));

    const page = document.getElementById(`page-${pageId}`);
    if (page) page.classList.add('active');

    const activeNav = navEl || document.querySelector(`[data-page="${pageId}"]`);
    if (activeNav) activeNav.classList.add('active');

    const tab = document.getElementById(`tab-${pageId}`);
    if (tab) tab.classList.add('active');
  }

  async function loadAlbum(albumId, autoplayFirstTrack = false) {
    const payload = await fetchApi(`/album/?id=${encodeURIComponent(albumId)}`);
    const album = normalizeAlbum(payload?.data);
    const tracks = uniqById(
      (payload?.data?.items || [])
        .map((entry) => normalizeTrack(entry?.item || entry, {
          album: album?.title,
          albumId: album?.id,
          artist: album?.artist,
          artistId: album?.artistId,
          coverId: album?.coverId,
          vibrantColor: album?.vibrantColor,
          releaseDate: payload?.data?.releaseDate,
        }))
        .filter(Boolean),
    );

    state.collections.discoverTracks = tracks;
    state.discoveryCards = [
      {
        type: 'album',
        id: album.id,
        label: album.title,
        desc: `${album.artist} · ${album.numberOfTracks} tracks`,
        image: album.artwork,
        colors: [album.colors.accent, album.colors.secondary],
      },
      ...MOOD_PRESETS.map((mood, index) => ({
        type: 'mood',
        id: `mood-${index}`,
        label: mood.label,
        desc: mood.desc,
        image: '',
        colors: mood.colors,
        query: mood.query,
      })),
    ].slice(0, 8);

    updateDiscoverContext({
      gridTitle: album.title,
      gridLink: album.artist,
      tracksTitle: 'Album cuts',
    });

    setPage('discover');

    if (autoplayFirstTrack && tracks.length) {
      setQueue(tracks.map((track) => track.id), 0);
      await playQueueTrack(0, true);
    } else {
      renderCollections();
    }
  }

  async function performSearch(query) {
    const searchId = ++state.searchToken;
    updateDiscoverContext({
      gridTitle: `Searching for "${query}"`,
      gridLink: 'Loading results',
      tracksTitle: 'Matching tracks',
    });
    state.discoveryCards = [];
    state.collections.discoverTracks = [];
    renderCollections();

    try {
      const [tracksPayload, albumsPayload, artistsPayload] = await Promise.all([
        fetchApi(`/search/?s=${encodeURIComponent(query)}`),
        fetchApi(`/search/?al=${encodeURIComponent(query)}`),
        fetchApi(`/search/?a=${encodeURIComponent(query)}`),
      ]);

      if (searchId !== state.searchToken) return;

      const tracks = uniqById(
        extractSearchItems(tracksPayload, ['tracks']).map((item) => normalizeTrack(item)).filter(Boolean),
      ).slice(0, 16);
      const albums = uniqById(
        extractSearchItems(albumsPayload, ['albums']).map((item) => normalizeAlbum(item)).filter(Boolean),
      ).slice(0, 4);
      const artists = uniqById(
        extractSearchItems(artistsPayload, ['artists']).map((item) => normalizeArtist(item)).filter(Boolean),
      ).slice(0, 4);

      state.collections.discoverTracks = tracks;
      state.discoveryCards = [
        ...albums.map((album) => ({
          type: 'album',
          id: album.id,
          label: album.title,
          desc: album.artist,
          image: album.artwork,
          colors: [album.colors.accent, album.colors.secondary],
        })),
        ...artists.map((artist) => ({
          type: 'artist',
          id: artist.id,
          label: artist.name,
          desc: 'Open artist-led results',
          image: artist.picture,
          colors: [artist.colors.accent, artist.colors.secondary],
          name: artist.name,
        })),
      ].slice(0, 8);

      updateDiscoverContext({
        gridTitle: 'Top matches',
        gridLink: `${state.discoveryCards.length} cards`,
        tracksTitle: tracks.length ? `Tracks for "${query}"` : `No tracks for "${query}"`,
      });

      setPage('discover');
      renderCollections();
    } catch (error) {
      console.error('Search failed', error);
      if (searchId !== state.searchToken) return;
      updateDiscoverContext({
        gridTitle: 'Search unavailable',
        gridLink: 'Monochrome backend did not respond',
        tracksTitle: 'Try another search',
      });
      state.discoveryCards = [];
      state.collections.discoverTracks = [];
      renderCollections();
    }
  }

  function resetDiscoverView() {
    state.searchToken += 1;
    state.collections.discoverTracks = state.collections.homeTracks.slice(0, 16);
    state.discoveryCards = [
      ...state.featuredAlbums.map((album) => ({
        type: 'album',
        id: album.id,
        label: album.title,
        desc: album.artist,
        image: album.artwork,
        colors: [album.colors.accent, album.colors.secondary],
      })),
      ...MOOD_PRESETS.map((mood, index) => ({
        type: 'mood',
        id: `mood-${index}`,
        label: mood.label,
        desc: mood.desc,
        image: '',
        colors: mood.colors,
        query: mood.query,
      })),
    ].slice(0, 8);
    updateDiscoverContext({
      gridTitle: 'Editor picks',
      gridLink: 'Featured albums',
      tracksTitle: 'Fresh from Monochrome',
    });
    renderCollections();
  }

  async function refreshRadio() {
    const track = getCurrentTrack();
    if (!track) return;
    const token = ++state.radioToken;
    if (dom.radioSummary) {
      dom.radioSummary.textContent = `Pulling recommendations seeded from ${track.title}.`;
    }

    try {
      const payload = await fetchApi(`/recommendations/?id=${encodeURIComponent(track.id)}`);
      if (token !== state.radioToken) return;

      const results = uniqById(
        (payload?.data?.items || [])
          .map((entry) => normalizeTrack(entry.track || entry.item || entry))
          .filter(Boolean),
      ).filter((entry) => entry.id !== track.id);

      state.collections.radioTracks = results.slice(0, 12);
      if (dom.radioSummary) {
        dom.radioSummary.textContent = results.length
          ? `Live recommendations seeded from ${track.title}.`
          : `No recommendations came back for ${track.title}.`;
      }
      renderCollections();
    } catch (error) {
      console.error('Recommendations failed', error);
      if (token !== state.radioToken) return;
      state.collections.radioTracks = state.collections.homeTracks.filter((entry) => entry.id !== track.id).slice(0, 12);
      if (dom.radioSummary) {
        dom.radioSummary.textContent = `Using the local featured queue while recommendations recover.`;
      }
      renderCollections();
    }
  }

  function runDiscoveryCard(index) {
    const card = state.discoveryCards[index];
    if (!card) return;
    if (card.type === 'album') {
      void loadAlbum(card.id, false);
      return;
    }
    if (card.type === 'artist') {
      if (dom.searchInput) dom.searchInput.value = card.name;
      void performSearch(card.name);
      return;
    }
    if (card.type === 'mood') {
      if (dom.searchInput) dom.searchInput.value = card.query;
      void performSearch(card.query);
    }
  }

  async function hydrateFeaturedContent() {
    const picks = await fetchApi(EDITORS_PICKS_URL);
    const albumIds = picks
      .filter((item) => item?.type === 'album' && item.id)
      .slice(0, 6)
      .map((item) => item.id);

    const albumPayloads = await Promise.all(
      albumIds.map((albumId) =>
        fetchApi(`/album/?id=${encodeURIComponent(albumId)}`).catch((error) => {
          console.warn('Album preload failed', albumId, error);
          return null;
        }),
      ),
    );

    const albums = [];
    const homeTracks = [];
    const quickTracks = [];

    albumPayloads.forEach((payload) => {
      if (!payload?.data) return;
      const album = normalizeAlbum(payload.data);
      const tracks = uniqById(
        (payload.data.items || [])
          .map((entry) => normalizeTrack(entry?.item || entry, {
            album: album?.title,
            albumId: album?.id,
            artist: album?.artist,
            artistId: album?.artistId,
            coverId: album?.coverId,
            vibrantColor: album?.vibrantColor,
            releaseDate: payload.data.releaseDate,
          }))
          .filter(Boolean),
      );

      if (album && tracks.length) {
        albums.push(album);
        quickTracks.push(tracks[0]);
        homeTracks.push(...tracks.slice(0, 3));
      }
    });

    state.featuredAlbums = albums.slice(0, 4);
    state.collections.quickTracks = uniqById(quickTracks).slice(0, 8);
    state.collections.homeTracks = uniqById(homeTracks).slice(0, 16);

    if (!state.collections.homeTracks.length) {
      throw new Error('No tracks could be hydrated from editors picks');
    }

    const lastTrackId = localStorage.getItem(STORAGE_KEYS.lastTrack);
    const defaultIndex = Math.max(
      0,
      state.collections.homeTracks.findIndex((track) => track.id === lastTrackId),
    );
    setQueue(state.collections.homeTracks.map((track) => track.id), defaultIndex > -1 ? defaultIndex : 0);
    rememberTrack(state.queueTrackIds[state.currentQueueIndex]);
    rebuildLibraryCollection();
    resetDiscoverView();
    state.collections.radioTracks = state.collections.homeTracks.filter((track) => track.id !== getCurrentTrack()?.id).slice(0, 12);
  }

  function handleSearchInput() {
    clearTimeout(state.searchTimer);
    const query = dom.searchInput?.value.trim() || '';
    if (query.length < 2) {
      resetDiscoverView();
      return;
    }
    state.searchTimer = setTimeout(() => {
      void performSearch(query);
    }, 260);
  }

  function attachEventListeners() {
    audio.volume = state.isMuted ? 0 : state.volume;
    updateVolumeUI();

    audio.addEventListener('play', () => {
      state.isPlaying = true;
      updatePlayPauseIcons();
      renderCollections();
    });

    audio.addEventListener('pause', () => {
      state.isPlaying = false;
      updatePlayPauseIcons();
      renderCollections();
    });

    audio.addEventListener('loadedmetadata', () => {
      updateProgressUI();
      const track = getCurrentTrack();
      if (track) updateExpandedPlayer(track);
    });

    audio.addEventListener('timeupdate', () => {
      updateProgressUI();
      syncLyricState();
    });

    audio.addEventListener('ended', async () => {
      if (state.repeatMode === 2) {
        audio.currentTime = 0;
        try {
          await audio.play();
        } catch {
          // ignore
        }
        return;
      }
      await nextTrack();
    });

    dom.searchInput?.addEventListener('input', handleSearchInput);
    dom.searchInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const query = dom.searchInput?.value.trim() || '';
        if (query.length >= 2) {
          void performSearch(query);
        }
      }
    });

    document.addEventListener('keydown', (event) => {
      const tag = document.activeElement?.tagName || '';
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';

      if (event.key === 'Escape' && state.isExpandedPlayerOpen) {
        closeExpandedPlayer();
      }

      if (!isTyping && event.code === 'Space') {
        event.preventDefault();
        void togglePlay();
      }

      if (!isTyping && event.shiftKey && event.code === 'ArrowRight') {
        event.preventDefault();
        void nextTrack();
      }

      if (!isTyping && event.shiftKey && event.code === 'ArrowLeft') {
        event.preventDefault();
        void prevTrack();
      }

      if (!isTyping && event.code === 'ArrowUp') {
        event.preventDefault();
        state.volume = clamp(state.volume + 0.05, 0, 1);
        state.isMuted = false;
        audio.volume = state.volume;
        updateVolumeUI();
        saveCurrentState();
      }

      if (!isTyping && event.code === 'ArrowDown') {
        event.preventDefault();
        state.volume = clamp(state.volume - 0.05, 0, 1);
        state.isMuted = false;
        audio.volume = state.volume;
        updateVolumeUI();
        saveCurrentState();
      }
    });
  }

  async function init() {
    document.title = 'Pulse Prism';
    const avatar = document.querySelector('.avatar');
    if (avatar) avatar.textContent = 'PP';

    updateShuffleUI();
    updateRepeatUI();
    attachEventListeners();

    try {
      await hydrateFeaturedContent();
      applyCurrentTrackToSurface();
      await refreshRadio();
    } catch (error) {
      console.error('Pulse Prism bootstrap failed', error);
      updateDiscoverContext({
        gridTitle: 'Connection issue',
        gridLink: 'Monochrome did not respond',
        tracksTitle: 'Refresh to try again',
      });
      state.collections.homeTracks = [];
      state.collections.quickTracks = [];
      state.collections.discoverTracks = [];
      state.collections.libraryTracks = [];
      state.collections.radioTracks = [];
      state.discoveryCards = [];
      renderCollections();
      if (dom.librarySummary) {
        dom.librarySummary.textContent = 'The frontend loaded, but the backend did not respond yet.';
      }
      if (dom.radioSummary) {
        dom.radioSummary.textContent = 'Recommendations are unavailable until the Monochrome instances respond.';
      }
    }
  }

  window.playCollectionTrack = (collectionKey, index, autoplay = true) => {
    void playCollectionTrack(collectionKey, index, autoplay);
  };
  window.playQueueTrack = (index, autoplay = true) => {
    void playQueueTrack(index, autoplay);
  };
  window.togglePlay = () => {
    void togglePlay();
  };
  window.nextTrack = () => {
    void nextTrack();
  };
  window.prevTrack = () => {
    void prevTrack();
  };
  window.seekRel = (seconds) => {
    void seekRel(seconds);
  };
  window.seekToTime = (seconds) => {
    void seekToTime(seconds);
  };
  window.seek = (event) => {
    void seek(event);
  };
  window.toggleShuffle = toggleShuffle;
  window.cycleRepeat = cycleRepeat;
  window.toggleMute = toggleMute;
  window.setVolume = setVolume;
  window.toggleLike = toggleLike;
  window.toggleLikeCurrent = toggleLikeCurrent;
  window.openExpandedPlayer = openExpandedPlayer;
  window.closeExpandedPlayer = closeExpandedPlayer;
  window.setPage = setPage;
  window.runDiscoveryCard = runDiscoveryCard;

  init();
})();
