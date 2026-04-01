import { AnimatePresence, motion } from 'framer-motion'
import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  RotateCcw,
  RotateCw,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { usePlayerStore } from '../store/playerStore'
import IconButton from './IconButton'
import VolumeControl from './VolumeControl'

type PlayerControlsProps = {
  compact?: boolean
  isMobile?: boolean
  onNext: () => void
  onPrevious: () => void
  onSeekBy: (delta: number) => void
}

function PlayerControls({
  compact = false,
  isMobile = false,
  onNext,
  onPrevious,
  onSeekBy,
}: PlayerControlsProps) {
  const {
    cycleRepeat,
    isPlaying,
    isShuffle,
    repeatMode,
    togglePlay,
    toggleShuffle,
  } = usePlayerStore(
    useShallow((state) => ({
      cycleRepeat: state.cycleRepeat,
      isPlaying: state.isPlaying,
      isShuffle: state.isShuffle,
      repeatMode: state.repeatMode,
      togglePlay: state.togglePlay,
      toggleShuffle: state.toggleShuffle,
    })),
  )

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat

  return (
    <div className="glass-tile rounded-[1.75rem] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <IconButton
            active={isShuffle}
            icon={Shuffle}
            label="Toggle shuffle"
            onClick={() => toggleShuffle()}
          />
          <IconButton
            active={repeatMode !== 'off'}
            icon={RepeatIcon}
            label="Cycle repeat mode"
            onClick={() => cycleRepeat()}
          />
        </div>
        <VolumeControl compact={isMobile} />
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <IconButton icon={SkipBack} label="Previous track" onClick={onPrevious} />

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => togglePlay()}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={[
            'flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent-from),var(--accent-to))] text-white',
            compact ? 'h-16 w-16' : 'h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20',
          ].join(' ')}
          style={{ boxShadow: '0 18px 40px var(--accent-glow)' }}
        >
          {isPlaying ? (
            <Pause className={compact ? 'h-7 w-7' : 'h-8 w-8'} strokeWidth={2.2} />
          ) : (
            <Play className={compact ? 'ml-0.5 h-7 w-7' : 'ml-1 h-8 w-8'} strokeWidth={2.2} />
          )}
        </motion.button>

        <IconButton icon={SkipForward} label="Next track" onClick={onNext} />
      </div>

      {!compact ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickAction label="-10s" icon={RotateCcw} onClick={() => onSeekBy(-10)} />
          <QuickAction label="+10s" icon={RotateCw} onClick={() => onSeekBy(10)} />
          <QuickAction label="-30s" icon={RotateCcw} onClick={() => onSeekBy(-30)} />
          <QuickAction label="+30s" icon={RotateCw} onClick={() => onSeekBy(30)} />
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        {!compact && repeatMode !== 'off' ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 text-center text-xs text-[var(--text-secondary)]"
          >
            {repeatMode === 'one'
              ? 'Repeat is locked to the current track.'
              : 'Queue wraps when you reach the final track.'}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

type QuickActionProps = {
  icon: typeof RotateCcw
  label: string
  onClick: () => void
}

function QuickAction({ icon: Icon, label, onClick }: QuickActionProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="glass-tile flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-medium text-[var(--text-primary)]"
    >
      <Icon className="h-4 w-4" />
      {label}
    </motion.button>
  )
}

export default PlayerControls
