import { useEffect, useEffectEvent } from 'react'
import { usePlayerStore } from '../store/playerStore'

type KeyboardShortcutsProps = {
  playNextTrack: () => void
  playPreviousTrack: () => void
  seekBy: (delta: number) => void
}

export function useKeyboardShortcuts({
  playNextTrack,
  playPreviousTrack,
  seekBy,
}: KeyboardShortcutsProps) {
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null

    if (target?.matches('input, textarea, select, button') || target?.isContentEditable) {
      return
    }

    const state = usePlayerStore.getState()

    switch (event.code) {
      case 'Space':
        event.preventDefault()
        state.togglePlay()
        break
      case 'ArrowRight':
        event.preventDefault()
        seekBy(10)
        break
      case 'ArrowLeft':
        event.preventDefault()
        seekBy(-10)
        break
      case 'KeyL':
        event.preventDefault()
        playNextTrack()
        break
      case 'KeyJ':
        event.preventDefault()
        playPreviousTrack()
        break
      case 'ArrowUp':
        event.preventDefault()
        state.setVolume(Math.min(state.volume + 0.05, 1))
        break
      case 'ArrowDown':
        event.preventDefault()
        state.setVolume(Math.max(state.volume - 0.05, 0))
        break
      case 'KeyM':
        event.preventDefault()
        state.toggleMute()
        break
      case 'KeyQ':
        event.preventDefault()
        state.toggleQueue()
        break
      default:
        break
    }
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => onKeyDown(event)
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
