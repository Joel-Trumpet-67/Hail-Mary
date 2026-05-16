import { useEffect, useState, useRef } from 'react'
import { fetchTickerGames, type TickerGame } from '@/lib/espn'
import { Circle } from 'lucide-react'

const POLL_MS = 60_000

export function LiveTicker() {
  const [games, setGames] = useState<TickerGame[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const load = async () => {
      const data = await fetchTickerGames()
      setGames(data)
    }
    load()
    intervalRef.current = setInterval(load, POLL_MS)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  if (games.length === 0) return null

  const liveGames = games.filter((g) => g.state === 'in')
  const allGames = [...liveGames, ...games.filter((g) => g.state !== 'in')]

  return (
    <div className="relative bg-pitch-900 border-b border-white/5 overflow-hidden h-9 flex items-center">
      {/* Live badge */}
      {liveGames.length > 0 && (
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 border-r border-white/10 h-full bg-pitch-800">
          <Circle className="w-2 h-2 fill-red-500 text-red-500 animate-pulse" />
          <span className="font-display text-xs tracking-widest text-red-400">LIVE</span>
        </div>
      )}

      {/* Scrolling games */}
      <div className="flex-1 overflow-hidden">
        <div
          className="flex items-center gap-8 animate-ticker"
          style={{ width: 'max-content' }}
        >
          {[...allGames, ...allGames].map((game, i) => (
            <TickerItem key={`${game.id}-${i}`} game={game} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TickerItem({ game }: { game: TickerGame }) {
  const isLive = game.state === 'in'
  const isPost = game.state === 'post'

  return (
    <div className="flex items-center gap-3 text-xs whitespace-nowrap">
      <span className={`font-body font-semibold ${isLive ? 'text-white' : 'text-white/50'}`}>
        {game.awayAbbr}
      </span>
      {isPost || isLive ? (
        <>
          <span className="font-mono text-white/70">
            {game.awayScore}
          </span>
          <span className="text-white/30">–</span>
          <span className="font-mono text-white/70">
            {game.homeScore}
          </span>
        </>
      ) : (
        <span className="text-white/30">vs</span>
      )}
      <span className={`font-body font-semibold ${isLive ? 'text-white' : 'text-white/50'}`}>
        {game.homeAbbr}
      </span>
      <span className={`text-[10px] ${isLive ? 'text-red-400' : 'text-white/30'}`}>
        {game.statusDetail}
      </span>
      <span className="text-white/10">|</span>
    </div>
  )
}
