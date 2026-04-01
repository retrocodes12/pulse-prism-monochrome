import { motion } from 'framer-motion'
import { ListMusic, Pause, Play, Volume2 } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { usePlayerStore } from '../store/playerStore'
import { formatTime } from '../utils/formatters'
import type { Track } from '../utils/tracks'

type MiniPlayerProps = {
  currentTrack: Track
}

function MiniPlayer({ currentTrack }: MiniPlayerProps) {
  const { currentTime, duration, isPlaying, setPlayerExpanded, togglePlay, setQueueOpen } =
    usePlayerStore(
      useShallow((state) => ({
        currentTime: state.currentTime,
        duration: state.duration,
        isPlaying: state.isPlaying,
        setPlayerExpanded: state.setPlayerExpanded,
        togglePlay: state.togglePlay,
        setQueueOpen: state.setQueueOpen,
      })),
    )

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] z-40 xl:hidden"
    >
      <div className="glass-panel overflow-hidden rounded-[1.75rem]">
        <div
          className="h-1.5 bg-white/10"
          role="progressbar"
          aria-label="Track progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-from),var(--accent-to))]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center gap-3 px-3 py-3">
          <button
            type="button"
            onClick={() => setPlayerExpanded(true)}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.2rem] text-left"
            aria-label="Expand player"
          >
            <img
              src={currentTrack.artwork}
              alt={`${currentTrack.title} artwork`}
              className="h-14 w-14 shrink-0 rounded-[1.1rem] object-cover shadow-[0_16px_36px_rgba(15,23,42,0.28)]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {currentTrack.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <span className="truncate">{currentTrack.artist}</span>
                <span className="rounded-full bg-white/8 px-2 py-0.5">
                  {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : currentTrack.durationLabel}
                </span>
              </div>
            </div>
          </button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => togglePlay()}
            className="glass-tile flex h-12 w-12 items-center justify-center rounded-full"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </motion.button>

          <button
            type="button"
            onClick={() => setQueueOpen(true)}
            className="glass-tile flex h-12 w-12 items-center justify-center rounded-full text-[var(--text-primary)]"
            aria-label="Open queue"
          >
            <ListMusic className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between px-4 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] text-[11px] uppercase tracking-[0.28em] text-[var(--text-tertiary)]">
          <span>Tap to expand</span>
          <span className="flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5" />
            {currentTrack.mood}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default MiniPlayer
