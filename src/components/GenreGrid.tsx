import type { GenreTile } from '../utils/discovery'

type GenreGridProps = {
  genres: GenreTile[]
}

function GenreGrid({ genres }: GenreGridProps) {
  if (genres.length === 0) {
    return null
  }

  return (
    <section className="mt-8">
      <div className="mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
            Browse all
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
            Genres and stations
          </h2>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {genres.map((genre) => (
          <article
            key={genre.id}
            className="glass-panel relative min-h-[8.25rem] overflow-hidden rounded-[1.35rem] p-4 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background: `linear-gradient(135deg, ${genre.colors[0]}36, transparent 55%), linear-gradient(225deg, ${genre.colors[1]}3d, transparent 52%)`,
              }}
            />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
                Genre
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                {genre.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {genre.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default GenreGrid
