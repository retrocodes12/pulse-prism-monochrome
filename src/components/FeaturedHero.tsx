import { motion } from 'framer-motion'
import { Play, Search } from 'lucide-react'
import type { AppView } from '../utils/discovery'
import { viewCopy } from '../utils/discovery'
import type { Track } from '../utils/tracks'

type FeaturedHeroProps = {
  activeView: AppView
  currentTrack: Track
  hasSearch: boolean
  onOpenPlayer: () => void
  onPlayTrack: () => void
  resultCount: number
}

function FeaturedHero({
  activeView,
  currentTrack,
  hasSearch,
  onOpenPlayer,
  onPlayTrack,
  resultCount,
}: FeaturedHeroProps) {
  const copy = viewCopy[activeView]

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-6"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background: `linear-gradient(135deg, ${currentTrack.colors.accent}44, transparent 56%), linear-gradient(215deg, ${currentTrack.colors.secondary}4f, transparent 50%)`,
        }}
      />
      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.28em] text-[var(--text-tertiary)]">
            <span>{copy.eyebrow}</span>
            {hasSearch ? (
              <span className="glass-tile flex items-center gap-2 rounded-full px-3 py-1 normal-case tracking-normal text-[var(--text-secondary)]">
                <Search className="h-3.5 w-3.5" />
                {resultCount} matches
              </span>
            ) : null}
          </div>

          <h1 className="display-copy max-w-3xl text-3xl leading-tight text-[var(--text-primary)] sm:text-4xl xl:text-[3rem]">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
            {copy.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onPlayTrack}
              className="flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--accent-from),var(--accent-to))] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_var(--accent-glow)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <Play className="ml-0.5 h-[1.125rem] w-[1.125rem]" />
              Play featured
            </button>
            <button
              type="button"
              onClick={onOpenPlayer}
              className="glass-tile rounded-full px-5 py-3 text-sm font-medium text-[var(--text-primary)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Open player
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="glass-tile rounded-full px-3 py-2 text-sm text-[var(--text-secondary)]">
              {currentTrack.album}
            </span>
            <span className="glass-tile rounded-full px-3 py-2 text-sm text-[var(--text-secondary)]">
              {currentTrack.artist}
            </span>
            <span className="glass-tile rounded-full px-3 py-2 text-sm text-[var(--text-secondary)]">
              {currentTrack.durationLabel}
            </span>
          </div>
        </div>

        <div className="glass-tile flex flex-col gap-3 rounded-[1.7rem] p-4">
          <img
            src={currentTrack.artwork}
            alt={`${currentTrack.title} artwork`}
            className="aspect-square w-full rounded-[1.35rem] object-cover shadow-[0_18px_42px_rgba(15,23,42,0.22)]"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-tertiary)]">
              Current selection
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
              {currentTrack.title}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">{currentTrack.artist}</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">{copy.eyebrow}</p>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default FeaturedHero
