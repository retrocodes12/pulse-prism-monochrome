import { Compass, Home, LibraryBig, ListMusic, Radio } from 'lucide-react'
import type { AppView, LibraryItem } from '../utils/discovery'

type AppSidebarProps = {
  activeView: AppView
  currentTrackTitle: string
  libraryItems: LibraryItem[]
  onChangeView: (view: AppView) => void
  onSelectTrack: (trackId: string) => void
}

const navItems: Array<{
  icon: typeof Home
  id: AppView
  label: string
}> = [
  { icon: Home, id: 'home', label: 'Home' },
  { icon: Compass, id: 'discover', label: 'Discover' },
  { icon: LibraryBig, id: 'library', label: 'Library' },
  { icon: Radio, id: 'radio', label: 'Radio' },
]

function AppSidebar({
  activeView,
  currentTrackTitle,
  libraryItems,
  onChangeView,
  onSelectTrack,
}: AppSidebarProps) {
  return (
    <div className="glass-panel sticky top-4 flex min-h-[calc(100svh-2rem)] flex-col rounded-[2rem] p-5">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,var(--accent-from),var(--accent-to))] shadow-[0_16px_40px_var(--accent-glow)]">
          <ListMusic className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-tertiary)]">
            Prism
          </p>
          <p className="text-xl font-semibold text-[var(--text-primary)]">Music</p>
        </div>
      </div>

      <div className="space-y-2">
        {navItems.map((item) => {
          const isActive = item.id === activeView
          const Icon = item.icon

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeView(item.id)}
              className={[
                'flex w-full items-center gap-3 rounded-[1.2rem] px-3 py-3 text-left transition-colors duration-200',
                isActive ? 'bg-white/12' : 'hover:bg-white/[0.06]',
              ].join(' ')}
            >
              <div
                className={[
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  isActive
                    ? 'bg-[linear-gradient(135deg,var(--accent-from),var(--accent-to))] text-white'
                    : 'bg-white/[0.05] text-[var(--text-secondary)]',
                ].join(' ')}
              >
                <Icon className="h-[1.125rem] w-[1.125rem]" />
              </div>
              <p className="font-medium text-[var(--text-primary)]">{item.label}</p>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-[var(--text-tertiary)]">
        <span>Library</span>
        <span className="rounded-full bg-white/[0.08] px-2 py-1 text-[10px] text-[var(--text-secondary)]">
          {libraryItems.length}
        </span>
      </div>

      <div className="hide-scrollbar mt-3 space-y-1 overflow-y-auto pr-1">
        {libraryItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTrack(item.trackId)}
            className="flex w-full items-center gap-3 rounded-[1rem] px-2 py-2 text-left transition-colors duration-200 hover:bg-white/[0.06]"
          >
            <img
              src={item.artwork}
              alt=""
              className="h-12 w-12 rounded-[1rem] object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                {item.title}
              </p>
              <p className="truncate text-xs text-[var(--text-secondary)]">
                {item.accent} • {item.meta}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="glass-tile mt-auto rounded-[1.4rem] p-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-tertiary)]">
          Now playing
        </p>
        <p className="mt-2 font-semibold text-[var(--text-primary)]">{currentTrackTitle}</p>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">Space pause • J / L skip • Q queue</p>
      </div>
    </div>
  )
}

export default AppSidebar
