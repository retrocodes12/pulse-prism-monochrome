import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

type IconButtonProps = {
  active?: boolean
  icon: LucideIcon
  label: string
  large?: boolean
  onClick: () => void
}

function IconButton({
  active = false,
  icon: Icon,
  label,
  large = false,
  onClick,
}: IconButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.94 }}
      aria-label={label}
      aria-pressed={active}
      className={[
        'glass-tile inline-flex items-center justify-center rounded-full text-[var(--text-primary)] transition-colors duration-200',
        large ? 'h-16 w-16' : 'h-12 w-12',
        active
          ? 'border-[rgba(96,165,250,0.34)] bg-[rgba(96,165,250,0.18)] text-white'
          : 'hover:bg-white/12',
      ].join(' ')}
    >
      <Icon className={large ? 'h-7 w-7' : 'h-5 w-5'} strokeWidth={2.1} />
    </motion.button>
  )
}

export default IconButton
