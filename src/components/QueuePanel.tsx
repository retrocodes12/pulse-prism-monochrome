import { AnimatePresence, motion } from 'framer-motion'
import { ListMusic, Pause, Play, X } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { usePlayerStore } from '../store/playerStore'
import type { Track } from '../utils/tracks'

function QueuePanel() {
  const { currentTrackId, isPlaying, isQueueOpen, queue, setQueueOpen, setTrack } =
    usePlayerStore(
      useShallow((state) => ({
        currentTrackId: state.currentTrackId,
        isPlaying: state.isPlaying,
        isQueueOpen: state.isQueueOpen,
        queue: state.queue,
        setQueueOpen: state.setQueueOpen,
        setTrack: state.setTrack,
      })),
    )

  return (
    <AnimatePresence>
      {isQueueOpen ? (
        <motion.div
          key="queue-overlay"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setQueueOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="glass-panel absolute right-0 top-0 flex h-full w-full max-w-[28rem] flex-col rounded-l-[2rem] px-4 pb-6 pt-4 sm:px-5 lg:top-4 lg:right-4 lg:h-[calc(100%-2rem)] lg:rounded-[2rem]"
          >
            <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/16 lg:hidden" />
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-xs uppercase tracking-[0.34em] text-[var(--text-tertiary)]">
                  Queue
                </p>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                  Up Next
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setQueueOpen(false)}
                className="glass-tile flex h-11 w-11 items-center justify-center rounded-full"
                aria-label="Close queue"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+1rem)] pr-1">
              {queue.map((track) => (
                <QueueRow
                  key={track.id}
                  currentTrackId={currentTrackId}
                  isPlaying={isPlaying}
                  track={track}
                  onSelect={() => {
                    setTrack(track.id, true)
                    setQueueOpen(false)
                  }}
                />
              ))}
            </div>

            <div className="glass-tile mt-4 flex items-center gap-3 rounded-[1.5rem] p-3 text-sm text-[var(--text-secondary)]">
              <ListMusic className="h-[1.125rem] w-[1.125rem] text-[var(--text-primary)]" />
              {queue.length} tracks in queue
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

type QueueRowProps = {
  currentTrackId: string
  isPlaying: boolean
  onSelect: () => void
  track: Track
}

function QueueRow({ currentTrackId, isPlaying, onSelect, track }: QueueRowProps) {
  const isCurrent = track.id === currentTrackId

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={[
        'flex w-full items-center gap-3 rounded-[1.5rem] px-3 py-3 text-left transition-colors duration-200',
        isCurrent ? 'bg-white/12 shadow-[0_16px_32px_rgba(15,23,42,0.22)]' : 'hover:bg-white/7',
      ].join(' ')}
    >
      <img
        src={track.artwork}
        alt=""
        className="h-14 w-14 shrink-0 rounded-[1rem] object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {track.title}
        </p>
        <p className="truncate text-xs text-[var(--text-secondary)]">{track.artist}</p>
      </div>
      <div className="flex min-w-[3.8rem] flex-col items-end gap-2">
        {isCurrent ? (
          isPlaying ? (
            <div className="flex h-4 items-end gap-0.5 text-[var(--text-primary)]">
              <span className="equalizer-bar h-2 w-1 rounded-full bg-current" />
              <span className="equalizer-bar h-4 w-1 rounded-full bg-current" />
              <span className="equalizer-bar h-3 w-1 rounded-full bg-current" />
            </div>
          ) : (
            <Pause className="h-4 w-4 text-[var(--text-primary)]" />
          )
        ) : (
          <Play className="h-4 w-4 text-[var(--text-tertiary)]" />
        )}
        <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
          {track.durationLabel}
        </span>
      </div>
    </motion.button>
  )
}

export default QueuePanel
