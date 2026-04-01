import { motion } from 'framer-motion'
import { MoonStar, SunMedium } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { usePlayerStore } from '../store/playerStore'

function ThemeToggle() {
  const { theme, toggleTheme } = usePlayerStore(
    useShallow((state) => ({
      theme: state.theme,
      toggleTheme: state.toggleTheme,
    })),
  )

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => toggleTheme()}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="glass-tile flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-[var(--text-primary)]"
    >
      {theme === 'dark' ? (
        <SunMedium className="h-[1.125rem] w-[1.125rem]" />
      ) : (
        <MoonStar className="h-[1.125rem] w-[1.125rem]" />
      )}
      <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </motion.button>
  )
}

export default ThemeToggle
