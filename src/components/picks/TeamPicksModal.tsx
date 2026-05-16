import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import ReactConfetti from 'react-confetti'
import { useStore } from '@/store/useStore'
import { GamePickCard } from './GamePickCard'
import type { NFLTeam } from '@/types'

interface TeamPicksModalProps {
  team: NFLTeam
  onClose: () => void
}

export function TeamPicksModal({ team, onClose }: TeamPicksModalProps) {
  const { schedule, picks } = useStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  const games = schedule[team.id] || []
  const pickedCount = games.filter((g) => picks[`${g.id}_${team.id}`]).length
  const isComplete = pickedCount >= games.length && games.length > 0
  const pct = games.length > 0 ? (pickedCount / games.length) * 100 : 0

  // Fire confetti when all games picked
  useEffect(() => {
    if (isComplete && !showConfetti) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
    }
  }, [isComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Block body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Jump to first unpicked game
  useEffect(() => {
    const firstUnpicked = games.findIndex((g) => !picks[`${g.id}_${team.id}`])
    if (firstUnpicked !== -1) setCurrentIndex(firstUnpicked)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const currentGame = games[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col"
        style={{
          background: `linear-gradient(160deg, ${team.color}22 0%, #080A0F 40%)`,
          backgroundColor: '#080A0F',
        }}
      >
        {/* Confetti */}
        {showConfetti && (
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            colors={[team.color, '#22C55E', '#F59E0B', '#38BDF8', '#ffffff']}
          />
        )}

        {/* Header */}
        <div className="flex items-center gap-4 px-4 pt-safe pt-4 pb-3 shrink-0">
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img src={team.logo} alt={team.displayName} className="w-10 h-10" />
            <div className="min-w-0">
              <p className="font-display text-xs tracking-widest text-white/40 leading-none">
                {team.location.toUpperCase()}
              </p>
              <p className="font-display text-xl tracking-wide leading-tight">
                {team.nickname.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="font-display text-xs tracking-widest text-white/40">PICKED</p>
            <p className="font-display text-xl" style={{ color: team.color }}>
              {pickedCount}<span className="text-white/30">/{games.length}</span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 mb-4 shrink-0">
          <div
            className="h-1 rounded-full bg-pitch-700 overflow-hidden"
            style={{ '--team-color': team.color } as React.CSSProperties}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: team.color }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Complete banner */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-4 rounded-xl border border-turf/40 bg-turf/10 px-4 py-3 flex items-center gap-3 shrink-0"
          >
            <span className="text-2xl">🏈</span>
            <div>
              <p className="font-display text-sm tracking-wider text-turf">ALL GAMES PICKED!</p>
              <p className="text-xs text-white/40">The {team.nickname} schedule is complete.</p>
            </div>
          </motion.div>
        )}

        {/* Games picker */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {games.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/30">
              <p className="font-display text-lg">Loading schedule...</p>
            </div>
          ) : currentGame ? (
            <GamePickCard
              game={currentGame}
              team={team}
              gameIndex={currentIndex}
              totalGames={games.length}
              onNext={() => setCurrentIndex((i) => Math.min(i + 1, games.length - 1))}
              onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
            />
          ) : null}

          {/* Quick nav thumbnails */}
          {games.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-white/30 font-body tracking-widest uppercase mb-3">All 17 Games</p>
              <div className="grid grid-cols-9 gap-1.5">
                {games.map((game, i) => {
                  const hasPick = !!picks[`${game.id}_${team.id}`]
                  const pick = picks[`${game.id}_${team.id}`]
                  const isSelected = i === currentIndex

                  return (
                    <button
                      key={game.id}
                      onClick={() => setCurrentIndex(i)}
                      className="relative"
                    >
                      <div className={`
                        rounded-lg aspect-square flex items-center justify-center text-[10px] font-display
                        border transition-all
                        ${isSelected
                          ? 'border-white/40 bg-pitch-600'
                          : hasPick
                          ? pick === 'W'
                            ? 'border-turf/40 bg-turf/10 text-turf'
                            : 'border-penalty/40 bg-penalty/10 text-penalty'
                          : 'border-white/10 bg-pitch-800 text-white/30'
                        }
                      `}>
                        {hasPick ? pick : i + 1}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="px-4 pb-safe pb-4 pt-3 border-t border-white/5 flex gap-3 shrink-0">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
            disabled={currentIndex === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl glass text-white/60 disabled:opacity-30 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-body text-sm">Prev</span>
          </button>
          <button
            onClick={() => setCurrentIndex((i) => Math.min(i + 1, games.length - 1))}
            disabled={currentIndex === games.length - 1}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl glass disabled:opacity-30 transition-colors"
            style={{ backgroundColor: `${team.color}22`, borderColor: `${team.color}44`, color: team.color }}
          >
            <span className="font-body text-sm font-semibold">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
