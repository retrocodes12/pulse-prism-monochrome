import { motion } from 'framer-motion'
import { Compass, Home, LibraryBig, Radio } from 'lucide-react'
import type { AppView } from '../utils/discovery'

type BottomNavProps = {
  activeView: AppView
  onChangeView: (view: AppView) => void
}

const navItems: Array<{ icon: typeof Home; id: AppView; label: string }> = [
  { icon: Home, id: 'home', label: 'Home' },
  { icon: Compass, id: 'discover', label: 'Discover' },
  { icon: LibraryBig, id: 'library', label: 'Library' },
  { icon: Radio, id: 'radio', label: 'Radio' },
]

function BottomNav({ activeView, onChangeView }: BottomNavProps) {
  return (
    <div className="fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-40 xl:hidden">
      <nav className="glass-panel grid grid-cols-4 rounded-[1.6rem] px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.id === activeView

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onChangeView(item.id)}
              whileTap={{ scale: 0.94 }}
              className="flex flex-col items-center justify-center gap-1 rounded-[1.1rem] px-2 py-2 text-center"
            >
              <div
                className={[
                  'flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200',
                  isActive
                    ? 'bg-[linear-gradient(135deg,var(--accent-from),var(--accent-to))] text-white'
                    : 'bg-white/6 text-[var(--text-secondary)]',
                ].join(' ')}
              >
                <Icon className="h-[1.125rem] w-[1.125rem]" />
              </div>
              <span
                className={[
                  'text-[11px] font-medium',
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]',
                ].join(' ')}
              >
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </nav>
    </div>
  )
}

export default BottomNav
