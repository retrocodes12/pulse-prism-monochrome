import { useState } from 'react'

type SeekBarProps = {
  currentTime: number
  duration: number
  onSeek: (value: number) => void
}

const waveformHeights = [24, 32, 16, 28, 20, 34, 18, 30, 22, 26, 14, 32, 20, 36, 18, 28, 22, 30]

function SeekBar({ currentTime, duration, onSeek }: SeekBarProps) {
  const [draftTime, setDraftTime] = useState<number | null>(null)
  const safeDuration = duration > 0 ? duration : 1
  const displayedTime = draftTime ?? currentTime
  const progress = Math.min((displayedTime / safeDuration) * 100, 100)

  return (
    <div className="relative">
      <div className="glass-tile relative overflow-hidden rounded-[1.5rem] px-3 py-4">
        <div className="absolute inset-y-3 left-3 right-3">
          <div className="absolute inset-0 flex items-center gap-1">
            {waveformHeights.map((height, index) => {
              const isActive = progress >= ((index + 1) / waveformHeights.length) * 100
              return (
                <span
                  key={`${height}-${index}`}
                  className="flex-1 rounded-full transition-colors duration-150"
                  style={{
                    height,
                    background: isActive
                      ? 'linear-gradient(180deg, var(--accent-from), var(--accent-to))'
                      : 'rgba(255,255,255,0.12)',
                    boxShadow: isActive ? '0 0 18px rgba(96, 165, 250, 0.16)' : 'none',
                  }}
                />
              )
            })}
          </div>
          <div
            className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_left,rgba(96,165,250,0.16),transparent_52%)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <input
          type="range"
          min={0}
          max={safeDuration}
          step={0.1}
          value={Math.min(displayedTime, safeDuration)}
          onChange={(event) => {
            const value = Number(event.target.value)
            setDraftTime(value)
            onSeek(value)
          }}
          onPointerUp={() => setDraftTime(null)}
          onTouchEnd={() => setDraftTime(null)}
          className="range-input relative z-10 h-10"
          aria-label="Seek track"
        />
      </div>
    </div>
  )
}

export default SeekBar
