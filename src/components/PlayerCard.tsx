import { motion } from 'framer-motion'
import { ListMusic, Minus, Sparkles, WandSparkles } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { usePlayerStore } from '../store/playerStore'
import { formatTime } from '../utils/formatters'
import type { Track } from '../utils/tracks'
import PlayerControls from './PlayerControls'
import SeekBar from './SeekBar'
import ThemeToggle from './ThemeToggle'

type PlayerCardProps = {
  condensed?: boolean
  currentTrack: Track
  isMobile?: boolean
  onNext: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  onSeekBy: (delta: number) => void
}

function PlayerCard({
  condensed = false,
  currentTrack,
  isMobile = false,
  onNext,
  onPrevious,
  onSeek,
  onSeekBy,
}: PlayerCardProps) {
  const { currentTime, duration, isQueueOpen, isPlayerExpanded, queueSize, setPlayerExpanded, toggleQueue } =
    usePlayerStore(
      useShallow((state) => ({
        currentTime: state.currentTime,
        duration: state.duration,
        isQueueOpen: state.isQueueOpen,
        isPlayerExpanded: state.isPlayerExpanded,
        queueSize: state.queue.length,
        setPlayerExpanded: state.setPlayerExpanded,
        toggleQueue: state.toggleQueue,
      })),
    )

  if (condensed) {
    return (
      <section className="glass-panel relative overflow-hidden rounded-[1.9rem] p-4">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-70"
          style={{
            background: `linear-gradient(135deg, ${currentTrack.colors.accent}40, transparent 65%), linear-gradient(225deg, ${currentTrack.colors.secondary}32, transparent 62%)`,
          }}
        />

        <div className="relative">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-tertiary)]">
                Now playing
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{currentTrack.album}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleQueue()}
                className="glass-tile flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-[var(--text-primary)]"
                aria-expanded={isQueueOpen}
                aria-label="Toggle queue"
              >
                <ListMusic className="h-[1.125rem] w-[1.125rem]" />
                {queueSize}
              </button>
              <ThemeToggle />
            </div>
          </div>

          <motion.div layoutId={`artwork-${currentTrack.id}`} className="glass-tile rounded-[1.5rem] p-3">
            <img
              src={currentTrack.artwork}
              alt={`${currentTrack.title} artwork`}
              className="aspect-square w-full rounded-[1.2rem] object-cover shadow-[0_18px_36px_rgba(15,23,42,0.24)]"
            />
          </motion.div>

          <div className="mt-4">
            <p className="truncate text-xl font-semibold text-[var(--text-primary)]">
              {currentTrack.title}
            </p>
            <p className="truncate text-sm text-[var(--text-secondary)]">{currentTrack.artist}</p>
          </div>

          <div className="glass-tile mt-4 rounded-[1.4rem] p-4">
            <SeekBar currentTime={currentTime} duration={duration} onSeek={onSeek} />
            <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-secondary)]">
              <span>{formatTime(currentTime)}</span>
              <span>{duration > 0 ? formatTime(duration) : currentTrack.durationLabel}</span>
            </div>
          </div>

          <div className="mt-4">
            <PlayerControls
              compact
              isMobile={false}
              onNext={onNext}
              onPrevious={onPrevious}
              onSeekBy={onSeekBy}
            />
          </div>
        </div>
      </section>
    )
  }

  return (
    <motion.section
      layout
      className={[
        'glass-panel relative w-full overflow-hidden',
        condensed ? 'rounded-[2rem] p-4' : 'rounded-[2.4rem] p-5 sm:p-6 lg:p-7',
      ].join(' ')}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-44 opacity-80"
        style={{
          background: `linear-gradient(135deg, ${currentTrack.colors.accent}55, transparent 60%), linear-gradient(225deg, ${currentTrack.colors.secondary}66, transparent 62%)`,
        }}
      />

      <div className={['relative flex flex-col', condensed ? 'gap-4' : 'gap-6'].join(' ')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-2 text-[11px] uppercase tracking-[0.38em] text-[var(--text-tertiary)]">
              {isMobile ? 'Playing now' : 'Player'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
                {currentTrack.title}
              </h1>
              <span className="glass-tile rounded-full px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                {currentTrack.album}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMobile ? (
              <button
                type="button"
                onClick={() => setPlayerExpanded(false)}
                className="glass-tile flex h-11 w-11 items-center justify-center rounded-full"
                aria-label="Collapse player"
              >
                <Minus className="h-5 w-5" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => toggleQueue()}
              className="glass-tile flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-[var(--text-primary)]"
              aria-expanded={isQueueOpen}
              aria-label="Toggle queue"
            >
              <ListMusic className="h-[1.125rem] w-[1.125rem]" />
              <span className="hidden sm:inline">Queue</span>
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div
          className={[
            'grid gap-6',
            condensed ? '' : 'lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]',
          ].join(' ')}
        >
          <motion.div
            layoutId={`artwork-${currentTrack.id}`}
            className="glass-tile relative overflow-hidden rounded-[2rem] p-3 sm:p-4"
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_45%)]" />
            <img
              src={currentTrack.artwork}
              alt={`${currentTrack.title} artwork`}
              className="relative aspect-square w-full rounded-[1.5rem] object-cover shadow-[0_24px_50px_rgba(15,23,42,0.36)]"
            />

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[1.05rem] font-semibold text-[var(--text-primary)] sm:text-[1.2rem]">
                  {currentTrack.title}
                </p>
                <p className="truncate text-sm text-[var(--text-secondary)]">
                  {currentTrack.artist}
                </p>
              </div>
              <div className="glass-tile rounded-2xl px-3 py-2 text-right">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
                  Queue
                </p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {queueSize} tracks
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex min-w-0 flex-col gap-5">
            <div className="glass-tile rounded-[1.7rem] p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[var(--text-tertiary)]">
                <WandSparkles className="h-3.5 w-3.5" />
                Track notes
              </div>
              <h2
                className={[
                  'mb-2 font-semibold leading-tight text-[var(--text-primary)]',
                  condensed ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-[2rem]',
                ].join(' ')}
              >
                {currentTrack.title}
              </h2>
              <p className="mb-4 text-base text-[var(--text-secondary)]">{currentTrack.artist}</p>
              <p className="text-sm leading-7 text-[var(--text-secondary)]">{currentTrack.blurb}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="glass-tile rounded-[1.5rem] p-3">
                <p className="mb-1 text-[11px] uppercase tracking-[0.26em] text-[var(--text-tertiary)]">
                  Mood
                </p>
                <p className="font-medium text-[var(--text-primary)]">{currentTrack.mood}</p>
              </div>
              <div className="glass-tile rounded-[1.5rem] p-3">
                <p className="mb-1 text-[11px] uppercase tracking-[0.26em] text-[var(--text-tertiary)]">
                  Source
                </p>
                <p className="font-medium text-[var(--text-primary)]">{currentTrack.sourceLabel}</p>
              </div>
              <div className="glass-tile rounded-[1.5rem] p-3">
                <p className="mb-1 text-[11px] uppercase tracking-[0.26em] text-[var(--text-tertiary)]">
                  Length
                </p>
                <p className="font-medium text-[var(--text-primary)]">
                  {duration > 0 ? formatTime(duration) : currentTrack.durationLabel}
                </p>
              </div>
            </div>

            <div className="glass-tile rounded-[1.75rem] p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.28em] text-[var(--text-tertiary)]">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Wave Seek
                </span>
                <span>{duration > 0 ? formatTime(currentTime) : '00:00'}</span>
              </div>
              <SeekBar currentTime={currentTime} duration={duration} onSeek={onSeek} />
              <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-secondary)]">
                <span>{formatTime(currentTime)}</span>
                <span>{duration > 0 ? formatTime(duration) : currentTrack.durationLabel}</span>
              </div>
            </div>

            <PlayerControls
              isMobile={isMobile || isPlayerExpanded || condensed}
              onNext={onNext}
              onPrevious={onPrevious}
              onSeekBy={onSeekBy}
            />
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default PlayerCard
