import { motion } from 'framer-motion'
import { Zap, Lock, Info } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { savePlayoffPick } from '@/lib/supabase'
import { BracketGame } from './BracketGame'

const ROUND_NAMES = ['', 'Wild Card', 'Divisional', 'Conf. Championship', 'Super Bowl']

export function PlayoffsPage() {
  const { league, player, playoffGames, playoffPicks, setPlayoffPick } = useStore()

  const isPicksPhase = league?.phase === 'playoffs'
  const isFinal = league?.phase === 'final'
  const isLocked = isFinal

  const handlePick = async (gameId: string, teamId: string) => {
    if (isLocked) return
    setPlayoffPick(gameId, teamId)
    if (player && league) {
      try {
        await savePlayoffPick(player.id, league.id, gameId, teamId)
      } catch { /* optimistic only */ }
    }
  }

  // Group games by round
  const byRound: Record<number, typeof playoffGames> = {}
  playoffGames.forEach((g) => {
    // ESPN doesn't always have a round field — infer from game count
    const round = (g as unknown as { round?: number }).round || inferRound(playoffGames.indexOf(g))
    if (!byRound[round]) byRound[round] = []
    byRound[round].push(g)
  })

  const hasPlayoffs = playoffGames.length > 0

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-display text-xs tracking-widest text-white/30">NFL PLAYOFFS</p>
          <h1 className="font-display text-4xl tracking-wider leading-none">BRACKET</h1>
        </div>
        <Zap className="w-8 h-8 text-ice mb-1" />
      </div>

      {/* Scoring note */}
      <div className="flex items-start gap-2 glass rounded-xl p-3 mb-6 border border-white/5">
        <Info className="w-4 h-4 text-ice shrink-0 mt-0.5" />
        <p className="text-xs text-white/50 leading-relaxed">
          Every correct playoff pick = <span className="text-ice font-semibold">3× points</span>.
          A perfect bracket can overcome any regular season deficit.
        </p>
      </div>

      {isLocked && (
        <div className="flex items-center gap-2 glass rounded-xl p-3 mb-6 border border-white/10">
          <Lock className="w-4 h-4 text-gold" />
          <p className="text-xs text-gold">Playoff picks are locked. Good luck!</p>
        </div>
      )}

      {!hasPlayoffs ? (
        <div className="text-center py-24">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl mb-6"
          >
            🏆
          </motion.div>
          <p className="font-display text-2xl text-white/30 mb-3">BRACKET NOT RELEASED</p>
          <p className="text-sm text-white/20 max-w-xs mx-auto leading-relaxed">
            The NFL playoff bracket will unlock here automatically once the regular season ends
            and ESPN publishes the matchups.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/20">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
            <span>Checking weekly starting January</span>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byRound)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([round, games]) => (
              <div key={round}>
                <p className="font-display text-xs tracking-widest text-white/30 mb-3">
                  {ROUND_NAMES[Number(round)] || `ROUND ${round}`}
                </p>
                <div className={`grid gap-3 ${games.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-sm'}`}>
                  {games.map((game) => (
                    <BracketGame
                      key={game.id}
                      game={game}
                      pickedTeamId={playoffPicks[game.id]}
                      onPick={(teamId) => handlePick(game.id, teamId)}
                      locked={isLocked}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

function inferRound(index: number): number {
  if (index < 6) return 1  // Wild Card (6 games)
  if (index < 10) return 2 // Divisional (4 games)
  if (index < 12) return 3 // Conf Champ (2 games)
  return 4                 // Super Bowl (1 game)
}
