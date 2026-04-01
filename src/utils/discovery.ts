import type { Track } from './tracks'
import { tracks } from './tracks'

export type AppView = 'home' | 'discover' | 'library' | 'radio'

export type MediaCardData = {
  id: string
  label: string
  meta: string
  subtitle: string
  title: string
  trackId: string
  artwork: string
}

export type Shelf = {
  description: string
  id: string
  items: MediaCardData[]
  title: string
}

export type GenreTile = {
  colors: [string, string]
  description: string
  id: string
  title: string
}

export type LibraryItem = {
  accent: string
  id: string
  meta: string
  title: string
  trackId: string
  artwork: string
}

type ViewCopy = {
  eyebrow: string
  subtitle: string
  title: string
}

function toCard(
  track: Track,
  label: string,
  meta: string,
  subtitle: string,
  suffix: string,
): MediaCardData {
  return {
    artwork: track.artwork,
    id: `${track.id}-${suffix}`,
    label,
    meta,
    subtitle,
    title: track.title,
    trackId: track.id,
  }
}

export const viewCopy: Record<AppView, ViewCopy> = {
  home: {
    eyebrow: 'Home',
    subtitle: 'Recent playlists, saved records, and stations you use most.',
    title: 'Good evening',
  },
  discover: {
    eyebrow: 'Discover',
    subtitle: 'New releases, editor picks, and browseable genres.',
    title: 'Browse',
  },
  library: {
    eyebrow: 'Library',
    subtitle: 'Pinned playlists, albums, downloads, and recent sessions.',
    title: 'Your Library',
  },
  radio: {
    eyebrow: 'Radio',
    subtitle: 'Continuous stations for focus, late night, and commute.',
    title: 'Stations',
  },
}

export const quickAccess: MediaCardData[] = [
  toCard(tracks[0], 'Playlist', 'Resume from 01:42', 'Night Drive', 'quick-1'),
  toCard(tracks[1], 'Mix', '128 liked tracks', 'Velvet Mix', 'quick-2'),
  toCard(tracks[2], 'Album', 'Played today', 'Blue Voltage', 'quick-3'),
  toCard(tracks[3], 'Station', 'Continuous playback', 'Orbit Radio', 'quick-4'),
  toCard(tracks[4], 'Playlist', 'Pinned', 'Late Session', 'quick-5'),
  toCard(tracks[1], 'Shared', 'From Nia + Arjun', 'Friends Loop', 'quick-6'),
]

export const libraryItems: LibraryItem[] = [
  {
    accent: 'Playlist',
    artwork: tracks[0].artwork,
    id: 'library-night-drive',
    meta: '42 tracks',
    title: 'Night Drive',
    trackId: tracks[0].id,
  },
  {
    accent: 'Album',
    artwork: tracks[1].artwork,
    id: 'library-afterimage',
    meta: 'Saved last week',
    title: 'Afterimage',
    trackId: tracks[1].id,
  },
  {
    accent: 'Playlist',
    artwork: tracks[2].artwork,
    id: 'library-focus-grid',
    meta: 'Daily focus queue',
    title: 'Focus Grid',
    trackId: tracks[2].id,
  },
  {
    accent: 'Radio',
    artwork: tracks[3].artwork,
    id: 'library-orbit-radio',
    meta: 'Live station',
    title: 'Orbit Radio',
    trackId: tracks[3].id,
  },
  {
    accent: 'Playlist',
    artwork: tracks[4].artwork,
    id: 'library-soft-neon',
    meta: 'Downloaded',
    title: 'Soft Neon',
    trackId: tracks[4].id,
  },
]

export const genreTiles: GenreTile[] = [
  {
    colors: ['#2563EB', '#7C3AED'],
    description: 'Atmospheric synth layers with polished low-end.',
    id: 'genre-electronica',
    title: 'Electronica',
  },
  {
    colors: ['#0EA5E9', '#06B6D4'],
    description: 'Clean house and low-distraction rhythm.',
    id: 'genre-focus-house',
    title: 'Focus House',
  },
  {
    colors: ['#8B5CF6', '#EC4899'],
    description: 'Soft vocals, warm synths, and lighter grooves.',
    id: 'genre-dream-pop',
    title: 'Dream Pop',
  },
  {
    colors: ['#F97316', '#EF4444'],
    description: 'Faster cuts, louder hooks, and heavier drops.',
    id: 'genre-high-energy',
    title: 'High Energy',
  },
  {
    colors: ['#14B8A6', '#22C55E'],
    description: 'Long-form ambient and slower instrumental sets.',
    id: 'genre-ambient',
    title: 'Ambient',
  },
  {
    colors: ['#6366F1', '#2563EB'],
    description: 'Station playback for long background sessions.',
    id: 'genre-radio',
    title: 'Live Radio',
  },
]

export const shelvesByView: Record<AppView, Shelf[]> = {
  home: [
    {
      description: 'Recent playlists, albums, and autoplay picks.',
      id: 'home-made-for-you',
      items: [
        toCard(tracks[0], 'Mix', 'Made for you', 'Night drive sequencing', 'home-1'),
        toCard(tracks[1], 'Mix', 'Based on Velvet Bloom', 'Warm synth pop', 'home-2'),
        toCard(tracks[2], 'Album', 'Saved earlier', 'Tighter focus cuts', 'home-3'),
        toCard(tracks[3], 'Station', 'Autoplay', 'Slow orbit session', 'home-4'),
      ],
      title: 'Made for you',
    },
    {
      description: 'Recent releases and faster-moving picks.',
      id: 'home-trending',
      items: [
        toCard(tracks[2], 'Trending', 'In your city', 'Blue-lit pressure', 'home-5'),
        toCard(tracks[4], 'Release', 'New this week', 'Afterlight sessions', 'home-6'),
        toCard(tracks[1], 'Artist Mix', 'Shared this weekend', 'Velvet Bloom radio', 'home-7'),
        toCard(tracks[0], 'Playlist', 'Late-night picks', 'Drive-ready sequence', 'home-8'),
      ],
      title: 'Trending now',
    },
  ],
  discover: [
    {
      description: 'New arrivals and current editor picks.',
      id: 'discover-new',
      items: [
        toCard(tracks[4], 'Release', 'Dropped 2 hours ago', 'Late-night closer', 'discover-1'),
        toCard(tracks[3], 'EP', 'Editor pick', 'Wide atmosphere', 'discover-2'),
        toCard(tracks[1], 'Album', 'Playlist pickup', 'Velvet Bloom return', 'discover-3'),
        toCard(tracks[2], 'Single', 'Moving fast', 'Cold spark rhythm', 'discover-4'),
      ],
      title: 'New releases',
    },
    {
      description: 'Stations, mood picks, and smaller editorial rows.',
      id: 'discover-editors',
      items: [
        toCard(tracks[0], 'Editor pick', 'Neon transitions', 'Night opener', 'discover-5'),
        toCard(tracks[2], 'Station', 'Focus autoplay', 'Work-first pacing', 'discover-6'),
        toCard(tracks[3], 'Mood', 'Deep atmosphere', 'Long-form ambient', 'discover-7'),
        toCard(tracks[4], 'Late cut', 'After-hours', 'Air and depth', 'discover-8'),
      ],
      title: 'Picked for this week',
    },
  ],
  library: [
    {
      description: 'Pinned and downloaded items.',
      id: 'library-pinned',
      items: [
        toCard(tracks[0], 'Pinned', 'Downloaded', 'Night Drive', 'library-1'),
        toCard(tracks[2], 'Saved', 'Replayed often', 'Focus Grid', 'library-2'),
        toCard(tracks[1], 'Playlist', 'Shared collection', 'Friends Loop', 'library-3'),
        toCard(tracks[4], 'Archive', 'Recently added', 'Soft Neon', 'library-4'),
      ],
      title: 'Pinned',
    },
    {
      description: 'Recently opened items.',
      id: 'library-recent',
      items: [
        toCard(tracks[3], 'Recent', 'Played last night', 'Orbit Radio', 'library-5'),
        toCard(tracks[1], 'Recent', 'Opened from shared link', 'Afterimage', 'library-6'),
        toCard(tracks[0], 'Recent', 'Resumed from 01:42', 'Nocturne Drive', 'library-7'),
        toCard(tracks[2], 'Recent', 'Queued from Browse', 'Blue Hour FM', 'library-8'),
      ],
      title: 'Recent',
    },
  ],
  radio: [
    {
      description: 'Station playback that keeps moving.',
      id: 'radio-stations',
      items: [
        toCard(tracks[0], 'Station', 'Night drive', 'Steady tempo', 'radio-1'),
        toCard(tracks[3], 'Station', 'Orbital ambient', 'Long-form motion', 'radio-2'),
        toCard(tracks[2], 'Station', 'Focus pressure', 'Tight and clean', 'radio-3'),
        toCard(tracks[1], 'Station', 'Velvet club', 'Warmer dance set', 'radio-4'),
      ],
      title: 'Stations',
    },
    {
      description: 'Mood stations by time of day.',
      id: 'radio-moods',
      items: [
        toCard(tracks[4], 'Mood', 'After-hours', 'Airy and slow', 'radio-5'),
        toCard(tracks[2], 'Mood', 'Deep focus', 'Built for concentration', 'radio-6'),
        toCard(tracks[1], 'Mood', 'Soft club', 'Warm tempo lift', 'radio-7'),
        toCard(tracks[0], 'Mood', 'Commute', 'Forward pulse', 'radio-8'),
      ],
      title: 'By mood',
    },
  ],
}

export function matchesMediaQuery(query: string, values: string[]) {
  if (!query) {
    return true
  }

  const normalized = query.toLowerCase()

  return values.some((value) => value.toLowerCase().includes(normalized))
}
