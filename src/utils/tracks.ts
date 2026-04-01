import auroraEcho from '../assets/artwork/aurora-echo.svg'
import blueHour from '../assets/artwork/blue-hour.svg'
import lunarCurrent from '../assets/artwork/lunar-current.svg'
import nocturneDrive from '../assets/artwork/nocturne-drive.svg'
import velvetSky from '../assets/artwork/velvet-sky.svg'

export type Track = {
  album: string
  artist: string
  artwork: string
  blurb: string
  colors: {
    accent: string
    secondary: string
  }
  durationLabel: string
  id: string
  mood: string
  sourceLabel: string
  src: string
  title: string
}

export const tracks: Track[] = [
  {
    album: 'Neon Tide',
    artist: 'Aurora Static',
    artwork: nocturneDrive,
    blurb: 'Steady synths, a clean pulse, and a late-night tempo.',
    colors: {
      accent: '#5aa9ff',
      secondary: '#7c3aed',
    },
    durationLabel: '06:12',
    id: 'nocturne-drive',
    mood: 'Midnight Glide',
    sourceLabel: 'HTML5 Audio',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    title: 'Nocturne Drive',
  },
  {
    album: 'Afterimage',
    artist: 'Velvet Bloom',
    artwork: velvetSky,
    blurb: 'Warm pads and softer drums with a slower, wider mix.',
    colors: {
      accent: '#8b5cf6',
      secondary: '#ec4899',
    },
    durationLabel: '05:31',
    id: 'velvet-skyline',
    mood: 'Lush Glow',
    sourceLabel: 'Remote Demo',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    title: 'Velvet Skyline',
  },
  {
    album: 'Blue Voltage',
    artist: 'Static Hearts',
    artwork: blueHour,
    blurb: 'Sharper transients, tighter bass, and a more direct hook.',
    colors: {
      accent: '#38bdf8',
      secondary: '#6366f1',
    },
    durationLabel: '05:03',
    id: 'blue-hour-fm',
    mood: 'Cold Spark',
    sourceLabel: 'Streaming Mock',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    title: 'Blue Hour FM',
  },
  {
    album: 'Silver Orbit',
    artist: 'Lunar Club',
    artwork: lunarCurrent,
    blurb: 'A slower build that opens up into a wider ambient section.',
    colors: {
      accent: '#22d3ee',
      secondary: '#8b5cf6',
    },
    durationLabel: '06:28',
    id: 'lunar-current',
    mood: 'Wide Atmosphere',
    sourceLabel: 'Remote Demo',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    title: 'Lunar Current',
  },
  {
    album: 'Afterlight',
    artist: 'Echo Bloom',
    artwork: auroraEcho,
    blurb: 'A spacious closer with long tails and lighter percussion.',
    colors: {
      accent: '#60a5fa',
      secondary: '#a855f7',
    },
    durationLabel: '07:09',
    id: 'aurora-echo',
    mood: 'Airy Finish',
    sourceLabel: 'HTML5 Audio',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    title: 'Aurora Echo',
  },
]

export function findTrack(trackId: string) {
  return tracks.find((track) => track.id === trackId) ?? tracks[0]
}
