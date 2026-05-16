import { useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, MapPin, Tv } from 'lucide-react'
import { format } from 'date-fns'
import { usePicks } from '@/hooks/usePicks'
import { useRipple, haptic } from '@/hooks/useRipple'
import type { NFLGame, NFLTeam } from '@/types'
import clsx from 'clsx'

interface GamePickCardProps {
  game: NFLGame
  team: NFLTeam              // the team we're picking FOR
  gameIndex: number
  totalGames: number
  onNext: () => void
  onPrev: () => void
}

export function GamePickCard({ game, team, gameIndex, totalGames, onNext, onPrev }: GamePickCardProps) {
  const { makePick, getPick } = usePicks()
  const { createRipple } = useRipple()
  const currentPick = getPick(game.id, team.id)
  const [animating, setAnimating] = useState<'W' | 'L' | null>(null)
  const [direction, setDirection] = useState(0)

  const isHome = game.homeTeam.id === team.id
  const opponent = isHome ? game.awayTeam : game.homeTeam

  const handlePick = async (pick: 'W' | 'L', e: React.MouseEvent | React.TouchEvent) => {
    if (animating) return
    haptic('medium')
    createRipple(e, pick === 'W' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)')
    setAnimating(pick)
    await makePick(game.id, team.id, pick)
    setTimeout(() => {
      setAnimating(null)
      // Auto-advance after pick
      if (gameIndex < totalGames - 1) {
        setTimeout(() => { setDirection(1); onNext() }, 300)
      }
    }, 600)
  }

  const handleSwipe = (dir: 'left' | 'right') => {
    if (dir === 'left' && gameIndex < totalGames - 1) {
      setDirection(1)
      onNext()
    } else if (dir === 'right' && gameIndex > 0) {
      setDirection(-1)
      onPrev()
    }
  }

  // Drag handling
  const x = useMotionValue(0)
  const cardRotate = useTransform(x, [-200, 0, 200], [-5, 0, 5])
  const dragRef = useRef<number>(0)

  const gameDate = new Date(game.date)
  const isLive = game.status === 'in'
  const isComplete = game.status === 'post'
  const teamWon = isComplete && (
    isHome
      ? (game.homeScore || 0) > (game.awayScore || 0)
      : (game.awayScore || 0) > (game.homeScore || 0)
  )
  const resultCorrect = currentPick !== null && isComplete && (
    (currentPick === 'W') === teamWon
  )
  const resultWrong = currentPick !== null && isComplete && !resultCorrect

  return (
    <div className="w-full select-none">
      {/* Game number indicator */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={() => handleSwipe('right')}
          disabled={gameIndex === 0}
          className="p-2 text-white/30 disabled:opacity-20 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalGames }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                'rounded-full transition-all duration-300',
                i === gameIndex
                  ? 'w-4 h-1.5 bg-white'
                  : 'w-1.5 h-1.5',
                i < gameIndex ? 'bg-turf/60' : 'bg-white/20'
              )}
            />
          ))}
        </div>

        <button
          onClick={() => handleSwipe('left')}
          disabled={gameIndex === totalGames - 1}
          className="p-2 text-white/30 disabled:opacity-20 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Main Game Card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={game.id}
          custom={direction}
          initial={{ opacity: 0, x: direction * 80, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, x: direction * -80, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ rotate: cardRotate }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={() => { dragRef.current = 0 }}
          onDrag={(_, info) => { dragRef.current = info.offset.x }}
          onDragEnd={(_, info) => {
            if (Math.abs(info.velocity.x) > 300 || Math.abs(dragRef.current) > 100) {
              handleSwipe(info.offset.x < 0 ? 'left' : 'right')
            }
          }}
          className="glass-strong rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing"
        >
          {/* Team color header */}
          <div
            className="px-5 py-4"
            style={{ background: `linear-gradient(135deg, ${team.color}33, ${team.color}11)` }}
          >
            {/* Week + status */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-xs tracking-widest text-white/40">
                WEEK {game.week}
              </span>
              {isLive ? (
                <span className="flex items-center gap-1.5 text-xs text-red-400 font-body font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {game.statusDetail}
                </span>
              ) : isComplete ? (
                <span className={clsx(
                  'text-xs font-body font-semibold',
                  resultCorrect ? 'text-turf' : resultWrong ? 'text-penalty' : 'text-white/40'
                )}>
                  FINAL
                </span>
              ) : (
                <span className="text-xs text-white/30">
                  {format(gameDate, 'EEE, MMM d · h:mm a')}
                </span>
              )}
            </div>

            {/* Matchup */}
            <div className="flex items-center justify-between gap-4">
              {/* Your team */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <img src={team.logo} alt={team.displayName} className="w-20 h-20 drop-shadow-lg" />
                  {isComplete && (
                    <div
                      className={clsx(
                        'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs',
                        teamWon ? 'bg-turf text-black' : 'bg-penalty/20 text-penalty border border-penalty/40'
                      )}
                    >
                      {teamWon ? 'W' : 'L'}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-display text-xs tracking-widest text-white/40">
                    {isHome ? 'HOME' : 'AWAY'}
                  </p>
                  <p className="font-display text-lg tracking-wide">{team.abbreviation}</p>
                  {isComplete && (
                    <p className="font-mono text-2xl text-white font-bold">
                      {isHome ? game.homeScore : game.awayScore}
                    </p>
                  )}
                </div>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center">
                {isLive ? (
                  <span className="font-mono text-2xl text-white/40">
                    {game.homeScore ?? 0}–{game.awayScore ?? 0}
                  </span>
                ) : (
                  <span className="font-display text-2xl text-white/20">VS</span>
                )}
                {game.network && (
                  <div className="flex items-center gap-1 mt-1">
                    <Tv className="w-3 h-3 text-white/20" />
                    <span className="text-[10px] text-white/20">{game.network}</span>
                  </div>
                )}
              </div>

              {/* Opponent */}
              <div className="flex flex-col items-center gap-2">
                <img src={opponent.logo} alt={opponent.displayName} className="w-20 h-20 drop-shadow-lg opacity-70" />
                <div className="text-center">
                  <p className="font-display text-xs tracking-widest text-white/30">
                    {isHome ? 'AWAY' : 'HOME'}
                  </p>
                  <p className="font-display text-lg tracking-wide text-white/60">{opponent.abbreviation}</p>
                  {isComplete && (
                    <p className="font-mono text-2xl text-white/60">
                      {isHome ? game.awayScore : game.homeScore}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Venue */}
            {game.venue && (
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <MapPin className="w-3 h-3 text-white/20" />
                <span className="text-[10px] text-white/30">{game.venue}</span>
              </div>
            )}
          </div>

          {/* Pick Buttons */}
          <div className="p-5">
            {isComplete ? (
              /* Result display */
              <div className={clsx(
                'rounded-xl py-4 text-center border',
                resultCorrect
                  ? 'bg-turf/10 border-turf/30'
                  : resultWrong
                  ? 'bg-penalty/10 border-penalty/30'
                  : 'bg-pitch-700/50 border-white/5'
              )}>
                <p className="font-display text-sm tracking-widest text-white/40 mb-1">YOUR PICK</p>
                <div className="flex items-center justify-center gap-2">
                  <span className={clsx(
                    'font-display text-3xl',
                    currentPick === 'W' ? 'text-turf' : currentPick === 'L' ? 'text-penalty' : 'text-white/20'
                  )}>
                    {currentPick || '—'}
                  </span>
                  {currentPick && (
                    <span className={clsx(
                      'text-sm font-body',
                      resultCorrect ? 'text-turf' : resultWrong ? 'text-penalty' : 'text-white/30'
                    )}>
                      {resultCorrect ? '✓ Correct! +1pt' : resultWrong ? '✗ Wrong' : ''}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-xs text-white/30 font-body tracking-widest uppercase mb-3">
                  Pick {team.nickname} to...
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {/* WIN button */}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={(e) => handlePick('W', e)}
                    className={clsx('pick-btn pick-btn-win relative overflow-hidden', currentPick === 'W' && 'selected')}
                  >
                    {animating === 'W' && (
                      <motion.div
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 rounded-xl bg-turf/30"
                      />
                    )}
                    <span className="relative flex flex-col items-center gap-1">
                      {currentPick === 'W' && <Check className="w-4 h-4" />}
                      <span>WIN</span>
                    </span>
                  </motion.button>

                  {/* LOSS button */}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={(e) => handlePick('L', e)}
                    className={clsx('pick-btn pick-btn-loss relative overflow-hidden', currentPick === 'L' && 'selected')}
                  >
                    {animating === 'L' && (
                      <motion.div
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 rounded-xl bg-penalty/30"
                      />
                    )}
                    <span className="relative flex flex-col items-center gap-1">
                      {currentPick === 'L' && <Check className="w-4 h-4" />}
                      <span>LOSS</span>
                    </span>
                  </motion.button>
                </div>

                <p className="text-center text-[10px] text-white/20">
                  Swipe left/right to navigate games
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
