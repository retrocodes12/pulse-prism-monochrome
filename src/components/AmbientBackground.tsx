import { AnimatePresence, motion } from 'framer-motion'
import type { Track } from '../utils/tracks'

type AmbientBackgroundProps = {
  track: Track
}

function AmbientBackground({ track }: AmbientBackgroundProps) {
  const gradient = `radial-gradient(circle at 15% 20%, ${track.colors.accent}55, transparent 32%),
    radial-gradient(circle at 85% 25%, ${track.colors.secondary}4d, transparent 28%),
    radial-gradient(circle at 50% 85%, ${track.colors.accent}1a, transparent 35%)`

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={track.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <motion.img
            src={track.artwork}
            alt=""
            className="absolute inset-[-8%] h-[116%] w-[116%] object-cover opacity-25 blur-[60px] saturate-125 will-change-transform"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1.02 }}
            transition={{ duration: 7, ease: 'linear' }}
          />
          <div className="absolute inset-0" style={{ background: gradient }} />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.3),rgba(3,7,18,0.68))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_32%)]" />
    </div>
  )
}

export default AmbientBackground
