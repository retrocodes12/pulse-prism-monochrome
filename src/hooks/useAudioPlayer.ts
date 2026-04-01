import { useEffect, useEffectEvent, useRef } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { findTrack } from '../utils/tracks'

const audio = typeof window === 'undefined' ? null : new Audio()

if (audio) {
  audio.preload = 'metadata'
  audio.crossOrigin = 'anonymous'
}

export function useAudioPlayer() {
  const isMounted = useRef(false)
  const currentTrackId = usePlayerStore((state) => state.currentTrackId)
  const isMuted = usePlayerStore((state) => state.isMuted)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const volume = usePlayerStore((state) => state.volume)

  const syncFromAudio = useEffectEvent(() => {
    if (!audio) {
      return
    }

    const state = usePlayerStore.getState()
    state.syncVolume(audio.volume, audio.muted)
    state.setCurrentTime(audio.currentTime)
    state.setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
  })

  const handleTrackEnded = useEffectEvent(() => {
    if (!audio) {
      return
    }

    const state = usePlayerStore.getState()
    const currentIndex = state.queue.findIndex((track) => track.id === state.currentTrackId)
    const isLastTrack = currentIndex === state.queue.length - 1

    if (state.repeatMode === 'one') {
      audio.currentTime = 0
      void audio.play()
      return
    }

    if (!state.isShuffle && state.repeatMode === 'off' && isLastTrack) {
      state.setPlaying(false)
      state.setCurrentTime(audio.duration || 0)
      return
    }

    state.playNext({ wrap: state.repeatMode !== 'off' || state.isShuffle, autoplay: true })
  })

  useEffect(() => {
    if (!audio) {
      return
    }

    const handleLoadedMetadata = () => syncFromAudio()
    const handleTimeUpdate = () => syncFromAudio()
    const handlePlay = () => usePlayerStore.getState().setPlaying(true)
    const handlePause = () => usePlayerStore.getState().setPlaying(false)
    const handleVolumeChange = () => usePlayerStore.getState().syncVolume(audio.volume, audio.muted)

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleTrackEnded)
    audio.addEventListener('volumechange', handleVolumeChange)

    isMounted.current = true

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleTrackEnded)
      audio.removeEventListener('volumechange', handleVolumeChange)
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!audio) {
      return
    }

    const track = findTrack(currentTrackId)

    if (audio.src === track.src) {
      return
    }

    audio.src = track.src
    audio.load()
    usePlayerStore.getState().setCurrentTime(0)
    usePlayerStore.getState().setDuration(0)
  }, [currentTrackId])

  useEffect(() => {
    if (!audio) {
      return
    }

    audio.volume = volume
    audio.muted = isMuted
  }, [isMuted, volume])

  useEffect(() => {
    if (!audio) {
      return
    }

    if (!isMounted.current) {
      return
    }

    if (isPlaying) {
      void audio.play().catch(() => {
        usePlayerStore.getState().setPlaying(false)
      })
      return
    }

    audio.pause()
  }, [currentTrackId, isPlaying])

  return {
    playNextTrack: () => {
      usePlayerStore.getState().playNext({ wrap: true })
    },
    playPreviousTrack: () => {
      if (!audio) {
        return
      }

      if (audio.currentTime > 4) {
        audio.currentTime = 0
        usePlayerStore.getState().setCurrentTime(0)
        return
      }

      usePlayerStore.getState().playPrevious({ wrap: true })
    },
    seekBy: (delta: number) => {
      if (!audio) {
        return
      }

      const safeDuration = Number.isFinite(audio.duration) ? audio.duration : usePlayerStore.getState().duration
      const nextTime = Math.min(Math.max(audio.currentTime + delta, 0), safeDuration || 0)
      audio.currentTime = nextTime
      usePlayerStore.getState().setCurrentTime(nextTime)
    },
    seekTo: (time: number) => {
      if (!audio) {
        return
      }

      audio.currentTime = time
      usePlayerStore.getState().setCurrentTime(time)
    },
  }
}
