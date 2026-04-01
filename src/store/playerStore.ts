import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tracks } from '../utils/tracks'

export type RepeatMode = 'off' | 'all' | 'one'
export type ThemeMode = 'dark' | 'light'

type PlayDirectionOptions = {
  autoplay?: boolean
  wrap?: boolean
}

type PlayerState = {
  currentTrackId: string
  currentTime: number
  duration: number
  isMuted: boolean
  isPlayerExpanded: boolean
  isPlaying: boolean
  isQueueOpen: boolean
  isShuffle: boolean
  queue: typeof tracks
  repeatMode: RepeatMode
  theme: ThemeMode
  volume: number
  cycleRepeat: () => void
  playNext: (options?: PlayDirectionOptions) => void
  playPrevious: (options?: PlayDirectionOptions) => void
  setCurrentTime: (time: number) => void
  setDuration: (time: number) => void
  setPlayerExpanded: (value: boolean) => void
  setPlaying: (value: boolean) => void
  setQueueOpen: (value: boolean) => void
  setTrack: (trackId: string, autoplay?: boolean) => void
  setVolume: (value: number) => void
  syncVolume: (volume: number, isMuted: boolean) => void
  toggleMute: () => void
  togglePlay: () => void
  toggleQueue: () => void
  toggleShuffle: () => void
  toggleTheme: () => void
}

const initialTrackId = tracks[0]?.id ?? ''

function getTrackIndex(trackId: string) {
  const index = tracks.findIndex((track) => track.id === trackId)
  return index >= 0 ? index : 0
}

function getRandomIndex(length: number, currentIndex: number) {
  let nextIndex = currentIndex

  while (length > 1 && nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * length)
  }

  return nextIndex
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrackId: initialTrackId,
      currentTime: 0,
      duration: 0,
      isMuted: false,
      isPlayerExpanded: false,
      isPlaying: false,
      isQueueOpen: false,
      isShuffle: false,
      queue: tracks,
      repeatMode: 'all',
      theme: 'dark',
      volume: 0.72,
      cycleRepeat: () =>
        set((state) => ({
          repeatMode:
            state.repeatMode === 'off'
              ? 'all'
              : state.repeatMode === 'all'
                ? 'one'
                : 'off',
        })),
      playNext: (options) => {
        const state = get()
        const currentIndex = getTrackIndex(state.currentTrackId)
        const autoplay = options?.autoplay ?? state.isPlaying
        const wrap = options?.wrap ?? true

        let nextIndex = currentIndex

        if (state.isShuffle) {
          nextIndex = getRandomIndex(state.queue.length, currentIndex)
        } else if (currentIndex < state.queue.length - 1) {
          nextIndex = currentIndex + 1
        } else if (wrap) {
          nextIndex = 0
        } else {
          set({ isPlaying: false })
          return
        }

        set({
          currentTrackId: state.queue[nextIndex].id,
          currentTime: 0,
          duration: 0,
          isPlaying: autoplay,
        })
      },
      playPrevious: (options) => {
        const state = get()
        const currentIndex = getTrackIndex(state.currentTrackId)
        const autoplay = options?.autoplay ?? state.isPlaying
        const wrap = options?.wrap ?? true

        let previousIndex = currentIndex

        if (state.isShuffle) {
          previousIndex = getRandomIndex(state.queue.length, currentIndex)
        } else if (currentIndex > 0) {
          previousIndex = currentIndex - 1
        } else if (wrap) {
          previousIndex = state.queue.length - 1
        } else {
          return
        }

        set({
          currentTrackId: state.queue[previousIndex].id,
          currentTime: 0,
          duration: 0,
          isPlaying: autoplay,
        })
      },
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      setPlayerExpanded: (isPlayerExpanded) => set({ isPlayerExpanded }),
      setPlaying: (isPlaying) => set({ isPlaying }),
      setQueueOpen: (isQueueOpen) => set({ isQueueOpen }),
      setTrack: (currentTrackId, autoplay = true) =>
        set((state) => ({
          currentTrackId,
          currentTime: 0,
          duration: 0,
          isPlaying: autoplay || (state.currentTrackId === currentTrackId && state.isPlaying),
        })),
      setVolume: (volume) =>
        set({
          isMuted: volume === 0,
          volume,
        }),
      syncVolume: (volume, isMuted) =>
        set({
          isMuted,
          volume,
        }),
      toggleMute: () =>
        set((state) => ({
          isMuted: !state.isMuted,
        })),
      togglePlay: () =>
        set((state) => ({
          isPlaying: !state.isPlaying,
        })),
      toggleQueue: () =>
        set((state) => ({
          isQueueOpen: !state.isQueueOpen,
        })),
      toggleShuffle: () =>
        set((state) => ({
          isShuffle: !state.isShuffle,
        })),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
    }),
    {
      name: 'pulse-prism-player',
      partialize: (state) => ({
        currentTrackId: state.currentTrackId,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
        theme: state.theme,
        volume: state.volume,
      }),
    },
  ),
)
