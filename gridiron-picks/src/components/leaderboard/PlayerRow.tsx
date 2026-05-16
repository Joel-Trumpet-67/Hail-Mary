import { motion } from 'framer-motion'
import { Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import type { PlayerScore } from '@/types'
import clsx from 'clsx'

interface PlayerRowProps {
  score: PlayerScore
  isCurrentPlayer: boolean
  index: number
}

export function PlayerRow({ score, isCurrentPlayer, index }: PlayerRowProps) {
  const { player, rank, prevRank, totalPoints, correctPicks, totalLockedPicks, winPct } = score
  const rankDelta = prevRank != null ? prevRank - rank : 0
  const isLeader = rank === 1

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
      className={clsx(
        'relative flex items-center gap-3 p-4 rounded-2xl border transition-all',
        isLeader && 'animate-pulse-glow',
        isCurrentPlayer
          ? 'bg-pitch-700/80 border-white/20'
          : 'glass border-white/5',
        rankDelta > 0 && 'rank-moved-up',
        rankDelta < 0 && 'rank-moved-down',
      )}
      style={isLeader ? { '--team-color': '#F59E0B' } as React.CSSProperties : undefined}
    >
      {/* Rank */}
      <div className={clsx('rank-badge shrink-0', rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'text-white/30')}>
        {isLeader ? <Crown className="w-5 h-5" /> : rank}
      </div>

      {/* Name + stats */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={clsx(
            'font-display text-lg tracking-wide truncate leading-none',
            isCurrentPlayer ? 'text-white' : 'text-white/80'
          )}>
            {player.name.toUpperCase()}
          </p>
          {isCurrentPlayer && (
            <span className="shrink-0 text-[9px] font-body font-semibold text-white/30 bg-pitch-600 px-1.5 py-0.5 rounded">YOU</span>
          )}
        </div>
        <p className="text-xs text-white/30 mt-0.5">
          {correctPicks}/{totalLockedPicks} correct ·{' '}
          <span className={winPct >= 0.6 ? 'text-turf' : winPct <= 0.4 ? 'text-penalty' : 'text-white/40'}>
            {(winPct * 100).toFixed(1)}%
          </span>
        </p>
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <AnimatedNumber
          value={totalPoints}
          className={clsx(
            'font-display text-2xl leading-none',
            isLeader ? 'text-gold' : isCurrentPlayer ? 'text-white' : 'text-white/70'
          )}
        />
        <p className="text-[10px] text-white/20 tracking-widest">PTS</p>
      </div>

      {/* Rank change indicator */}
      {rankDelta !== 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className={clsx(
            'absolute -top-1.5 -right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-body font-bold',
            rankDelta > 0 ? 'bg-turf text-black' : 'bg-penalty text-white'
          )}
        >
          {rankDelta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(rankDelta)}
        </motion.div>
      )}

      {rankDelta === 0 && prevRank != null && (
        <Minus className="w-3 h-3 text-white/10 absolute -top-1 -right-1" />
      )}
    </motion.div>
  )
}
