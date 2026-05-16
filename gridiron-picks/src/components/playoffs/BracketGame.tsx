import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { NFLGame, NFLTeam } from '@/types'
import clsx from 'clsx'

interface BracketGameProps {
  game: NFLGame
  pickedTeamId?: string
  onPick: (teamId: string) => void
  locked?: boolean
}

function TeamSlot({
  team,
  picked,
  won,
  lost,
  locked,
  onPick,
}: {
  team: NFLTeam | null
  picked: boolean
  won?: boolean
  lost?: boolean
  locked: boolean
  onPick: () => void
}) {
  const tbd = !team

  return (
    <motion.button
      whileTap={!locked && !tbd ? { scale: 0.97 } : {}}
      onClick={() => !locked && !tbd && onPick()}
      disabled={locked || tbd}
      className={clsx(
        'w-full flex items-center gap-2.5 px-3 py-2.5 transition-all duration-150 text-left',
        'border-b border-white/5 last:border-b-0',
        !tbd && !locked && 'cursor-pointer hover:bg-white/5',
        picked && !lost && 'bg-turf/10',
        lost && 'opacity-40',
        locked && 'cursor-default',
      )}
    >
      {team ? (
        <>
          <img src={team.logo} alt={team.displayName} className="w-7 h-7 shrink-0" />
          <span className={clsx(
            'flex-1 font-display text-sm tracking-wide truncate',
            won ? 'text-turf' : lost ? 'text-white/30' : 'text-white'
          )}>
            {team.abbreviation}
          </span>
          {picked && !lost && <Check className="w-3.5 h-3.5 text-turf shrink-0" />}
        </>
      ) : (
        <>
          <div className="w-7 h-7 rounded-full bg-pitch-600 shrink-0" />
          <span className="flex-1 font-display text-sm tracking-wide text-white/20">TBD</span>
        </>
      )}
    </motion.button>
  )
}

export function BracketGame({ game, pickedTeamId, onPick, locked = false }: BracketGameProps) {
  const isComplete = game.status === 'post'
  const homeWon = isComplete && (game.homeScore || 0) > (game.awayScore || 0)
  const awayWon = isComplete && (game.awayScore || 0) > (game.homeScore || 0)

  return (
    <div className={clsx(
      'glass rounded-xl overflow-hidden border transition-all',
      pickedTeamId ? 'border-turf/20' : 'border-white/5',
    )}>
      <TeamSlot
        team={game.awayTeam}
        picked={pickedTeamId === game.awayTeam?.id}
        won={awayWon}
        lost={isComplete && homeWon}
        locked={locked}
        onPick={() => game.awayTeam && onPick(game.awayTeam.id)}
      />
      <div className="h-px bg-white/5" />
      <TeamSlot
        team={game.homeTeam}
        picked={pickedTeamId === game.homeTeam?.id}
        won={homeWon}
        lost={isComplete && awayWon}
        locked={locked}
        onPick={() => game.homeTeam && onPick(game.homeTeam.id)}
      />

      {/* Score / status footer */}
      {(isComplete || game.status === 'in') && (
        <div className="px-3 py-1.5 bg-pitch-800/50 flex justify-between text-[10px] text-white/30">
          <span className="tracking-widest">{game.status === 'in' ? 'LIVE' : 'FINAL'}</span>
          {isComplete && (
            <span className="font-mono">
              {game.awayScore} – {game.homeScore}
            </span>
          )}
          {game.status === 'in' && (
            <span className="text-red-400 font-mono">{game.statusDetail}</span>
          )}
        </div>
      )}
    </div>
  )
}
