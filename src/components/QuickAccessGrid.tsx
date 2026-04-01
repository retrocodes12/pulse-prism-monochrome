import type { MediaCardData } from '../utils/discovery'

type QuickAccessGridProps = {
  items: MediaCardData[]
  onSelectTrack: (trackId: string) => void
}

function QuickAccessGrid({ items, onSelectTrack }: QuickAccessGridProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
          Quick access
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
          Jump back in
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTrack(item.trackId)}
            className="glass-panel flex items-center gap-3 rounded-[1.4rem] p-3 text-left transition-transform duration-200 hover:-translate-y-0.5"
          >
            <img
              src={item.artwork}
              alt=""
              className="h-[4.5rem] w-[4.5rem] rounded-[1.2rem] object-cover"
            />
            <div className="min-w-0">
              <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
                {item.label}
              </span>
              <p className="mt-2 truncate text-base font-semibold text-[var(--text-primary)]">
                {item.title}
              </p>
              <p className="truncate text-sm text-[var(--text-secondary)]">{item.subtitle}</p>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">{item.meta}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

export default QuickAccessGrid
