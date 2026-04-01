import { Bell, Search } from 'lucide-react'
import type { AppView } from '../utils/discovery'

type TopBarProps = {
  activeView: AppView
  isPending: boolean
  onChangeView: (view: AppView) => void
  onSearchChange: (value: string) => void
  searchQuery: string
}

const tabs: Array<{ id: AppView; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'discover', label: 'Discover' },
  { id: 'library', label: 'Library' },
  { id: 'radio', label: 'Radio' },
]

function TopBar({
  activeView,
  isPending,
  onChangeView,
  onSearchChange,
  searchQuery,
}: TopBarProps) {
  return (
    <header className="glass-panel sticky top-3 z-20 rounded-[1.8rem] p-3 backdrop-blur-xl sm:p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search"
            className="w-full rounded-full border border-white/[0.08] bg-white/[0.05] py-3 pl-11 pr-4 text-sm text-[var(--text-primary)] outline-none transition-colors duration-200 placeholder:text-[var(--text-tertiary)] focus:border-[rgba(96,165,250,0.35)] focus:bg-white/[0.07]"
          />
        </div>

        <button
          type="button"
          className="glass-tile flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-primary)]"
          aria-label="Notifications"
        >
          <Bell className="h-[1.125rem] w-[1.125rem]" />
        </button>

        <div className="glass-tile flex items-center gap-3 rounded-full px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent-from),var(--accent-to))] text-sm font-semibold text-white">
            SP
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[var(--text-primary)]">Sohil</p>
            <p className="text-xs text-[var(--text-secondary)]">Premium session</p>
          </div>
        </div>
      </div>

      <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeView

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeView(tab.id)}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'bg-[linear-gradient(135deg,var(--accent-from),var(--accent-to))] text-white'
                  : 'glass-tile text-[var(--text-secondary)]',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
        {isPending ? (
          <span className="glass-tile inline-flex items-center rounded-full px-3 py-2 text-xs text-[var(--text-secondary)]">
            Updating
          </span>
        ) : null}
      </div>
    </header>
  )
}

export default TopBar
