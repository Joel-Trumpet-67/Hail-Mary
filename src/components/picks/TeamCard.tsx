import { motion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { NFLTeam } from '@/types'
import clsx from 'clsx'

interface TeamCardProps {
  team: NFLTeam
  index: number
  onClick: () => void
  featured?: boolean
}

export function TeamCard({ team, index, onClick, featured = false }: TeamCardProps) {
  const { picks, schedule } = useStore()
  const teamGames = schedule[team.id] || []
  const pickedCount = teamGames.filter((g) => picks[`${g.id}_${team.id}`]).length
  const total = teamGames.length || 17
  const complete = pickedCount >= total && total > 0
  const pct = total > 0 ? (pickedCount / total) * 100 : 0

  // Fly-in direction based on index
  const directions = [
    { x: -40, y: -20 },
    { x: 40, y: -20 },
    { x: -40, y: 20 },
    { x: 40, y: 20 },
    { x: 0, y: -40 },
    { x: 0, y: 40 },
  ]
  const dir = directions[index % directions.length]

  return (
    <motion.div
      initial={{ opacity: 0, x: dir.x, y: dir.y, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.04,
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={clsx(
        'relative cursor-pointer rounded-2xl overflow-hidden border transition-all duration-200',
        featured ? 'h-40' : 'h-28',
        complete
          ? 'border-turf/40'
          : 'border-white/5 hover:border-white/20'
      )}
      style={{
        background: complete
          ? `linear-gradient(135deg, ${team.color}22, ${team.color}11)`
          : `linear-gradient(135deg, #1C233022, #14192022)`,
      }}
    >
      {/* Team color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: team.color }}
      />

      {/* Background logo watermark */}
      <div className="absolute -right-4 -bottom-4 opacity-10">
        <img
          src={team.logo}
          alt=""
          className={clsx(featured ? 'w-32 h-32' : 'w-20 h-20')}
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="relative p-3 flex flex-col h-full">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <img
            src={team.logo}
            alt={team.displayName}
            className={clsx(featured ? 'w-12 h-12' : 'w-9 h-9')}
            loading="lazy"
          />
          {complete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-turf/20 border border-turf/40 rounded-full px-2 py-0.5"
            >
              <Lock className="w-2.5 h-2.5 text-turf" />
              <span className="text-[9px] font-display tracking-widest text-turf">LOCKED</span>
              <Check className="w-2.5 h-2.5 text-turf" />
            </motion.div>
          ) : pickedCount > 0 ? (
            <span className="text-[10px] text-white/40 font-mono">
              {pickedCount}/{total}
            </span>
          ) : null}
        </div>

        {/* Team name */}
        <div className="mt-auto">
          <p className="font-display text-white/40 text-[10px] tracking-widest leading-none">
            {team.location.toUpperCase()}
          </p>
          <p
            className={clsx(
              'font-display tracking-wider leading-tight',
              featured ? 'text-xl' : 'text-base'
            )}
          >
            {team.nickname.toUpperCase()}
          </p>
        </div>

        {/* Progress bar */}
        {pickedCount > 0 && !complete && (
          <div className="mt-2 h-0.5 rounded-full bg-pitch-600 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: team.color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        )}
      </div>

      {/* Complete shimmer overlay */}
      {complete && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute inset-0 lock-shimmer pointer-events-none"
        />
      )}
    </motion.div>
  )
}
