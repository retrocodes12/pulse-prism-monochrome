import { useShallow } from 'zustand/react/shallow'
import { usePlayerStore } from '../store/playerStore'
import { findTrack } from '../utils/tracks'

function NowPlayingInsights() {
  const { currentTrackId, isShuffle, queue, repeatMode, volume } = usePlayerStore(
    useShallow((state) => ({
      currentTrackId: state.currentTrackId,
      isShuffle: state.isShuffle,
      queue: state.queue,
      repeatMode: state.repeatMode,
      volume: state.volume,
    })),
  )

  const currentIndex = queue.findIndex((track) => track.id === currentTrackId)
  const nextTracks = queue
    .slice(currentIndex + 1, currentIndex + 4)
    .map((track) => findTrack(track.id))

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-[1.8rem] p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-tertiary)]">
          Playback
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Metric label="Vol" value={`${Math.round(volume * 100)}%`} />
          <Metric label="Shuffle" value={isShuffle ? 'On' : 'Off'} />
          <Metric label="Repeat" value={repeatMode === 'off' ? 'Off' : repeatMode === 'all' ? 'All' : 'One'} />
        </div>
      </div>

      <div className="glass-panel rounded-[1.8rem] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-tertiary)]">
            Next from queue
          </p>
          <span className="text-[11px] text-[var(--text-tertiary)]">{nextTracks.length} tracks</span>
        </div>
        <div className="mt-4 space-y-3">
          {nextTracks.map((track) => (
            <div key={track.id} className="flex items-center gap-3">
              <img
                src={track.artwork}
                alt=""
                className="h-12 w-12 rounded-[1rem] object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {track.title}
                </p>
                <p className="truncate text-xs text-[var(--text-secondary)]">
                  {track.artist}
                </p>
              </div>
              <span className="ml-auto text-[11px] uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
                {track.durationLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type MetricProps = {
  label: string
  value: string
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="glass-tile rounded-[1rem] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  )
}

export default NowPlayingInsights
