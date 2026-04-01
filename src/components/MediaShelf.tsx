import type { MediaCardData } from '../utils/discovery'

type MediaShelfProps = {
  description: string
  items: MediaCardData[]
  onSelectTrack: (trackId: string) => void
  title: string
}

function MediaShelf({ description, items, onSelectTrack, title }: MediaShelfProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
        </div>
      </div>

      <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTrack(item.trackId)}
            className="glass-panel w-[11.5rem] shrink-0 rounded-[1.45rem] p-3 text-left transition-transform duration-200 hover:-translate-y-1"
          >
            <img
              src={item.artwork}
              alt=""
              className="aspect-square w-full rounded-[1.15rem] object-cover"
            />
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
                  {item.label}
                </span>
              </div>
              <p className="truncate text-base font-semibold text-[var(--text-primary)]">
                {item.title}
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.subtitle}</p>
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">{item.meta}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

export default MediaShelf
