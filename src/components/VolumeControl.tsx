import { AnimatePresence, motion } from 'framer-motion'
import { Volume1, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { usePlayerStore } from '../store/playerStore'

type VolumeControlProps = {
  compact?: boolean
}

function VolumeControl({ compact = false }: VolumeControlProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isMuted, setVolume, toggleMute, volume } = usePlayerStore(
    useShallow((state) => ({
      isMuted: state.isMuted,
      setVolume: state.setVolume,
      toggleMute: state.toggleMute,
      volume: state.volume,
    })),
  )

  const Icon = isMuted || volume === 0 ? VolumeX : volume > 0.55 ? Volume2 : Volume1

  if (compact) {
    return (
      <div className="relative md:hidden">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMobileOpen((open) => !open)}
          className="glass-tile flex h-12 w-12 items-center justify-center rounded-full"
          aria-expanded={mobileOpen}
          aria-label="Toggle volume controls"
        >
          <Icon className="h-5 w-5" />
        </motion.button>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="glass-panel absolute right-0 top-[calc(100%+0.75rem)] flex w-44 items-center gap-3 rounded-[1.35rem] px-3 py-3"
            >
              <button
                type="button"
                onClick={() => toggleMute()}
                className="glass-tile flex h-10 w-10 items-center justify-center rounded-full"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                <Icon className="h-[1.125rem] w-[1.125rem]" />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="volume-input h-8"
                aria-label="Volume"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="hidden md:flex">
      <div className="glass-tile group flex items-center gap-3 rounded-full px-3 py-2">
        <button
          type="button"
          onClick={() => toggleMute()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/6 text-[var(--text-primary)] transition-colors duration-200 hover:bg-white/12"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          <Icon className="h-[1.125rem] w-[1.125rem]" />
        </button>
        <div className="w-16 overflow-hidden transition-[width] duration-300 group-hover:w-32 group-focus-within:w-32">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="volume-input h-10"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  )
}

export default VolumeControl
