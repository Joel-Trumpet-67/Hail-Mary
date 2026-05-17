import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Trophy, RefreshCw, Info } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getAllLeaguePicks, getLeaguePlayers, subscribeToLeague } from '@/lib/firebase'
import { PlayerRow } from './PlayerRow'
import type { PlayerScore, Player } from '@/types'

export function LeaderboardPage() {
  const { league, player, picks, schedule, leaderboard, setLeaderboard } = useStore()
  const prevRanks = useRef<Record<string, number>>({})

  const computed = useMemo((): PlayerScore[] => {
    if (!league || !player) return []
    const pts = computePoints(picks, schedule)
    const total = Object.keys(picks).length
    return [{
      player,
      regularSeasonPoints: pts,
      playoffPoints: 0,
      totalPoints: pts,
      correctPicks: pts,
      totalLockedPicks: total,
      winPct: total > 0 ? pts / total : 0,
      rank: 1,
      prevRank: prevRanks.current[player.id] || 1,
    }]
  }, [league, player, picks, schedule])

  const displayBoard = leaderboard.length > 0 ? leaderboard : computed

  useEffect(() => {
    if (!league) return
    const channel = subscribeToLeague(league.id, async () => {
      try {
        const [allPicks, allPlayers] = await Promise.all([
          getAllLeaguePicks(league.id),
          getLeaguePlayers(league.id),
        ])
        const scores = buildLeaderboard(allPlayers, allPicks, schedule, prevRanks.current)
        prevRanks.current = Object.fromEntries(scores.map((s) => [s.player.id, s.rank]))
        setLeaderboard(scores)
      } catch { /* stay on local */ }
    })
    return () => { channel.unsubscribe() }
  }, [league, schedule, setLeaderboard])

  const myScore = displayBoard.find((s) => s.player.id === player?.id)

  return (
    <div className="px-4 pt-6 pb-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-display text-xs tracking-widest text-white/30">SEASON STANDINGS</p>
          <h1 className="font-display text-4xl tracking-wider leading-none">BOARD</h1>
        </div>
        <Trophy className="w-8 h-8 text-gold mb-1" />
      </div>

      {myScore && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 mb-6 flex items-center justify-between border border-white/5"
        >
          <div>
            <p className="text-xs text-white/30 tracking-widest">YOUR RANK</p>
            <p className="font-display text-3xl text-white">
              #{myScore.rank}<span className="text-white/20 text-lg"> / {displayBoard.length}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/30 tracking-widest">POINTS</p>
            <p className="font-display text-3xl text-turf">{myScore.totalPoints}</p>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-2 mb-4 text-xs text-white/30">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>Regular season: 1pt per correct pick · Playoffs: 3× multiplier</span>
      </div>

      {displayBoard.length === 0 ? (
        <div className="text-center py-20">
          <Trophy className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="font-display text-2xl text-white/20 mb-2">NO PLAYERS YET</p>
          <p className="text-sm text-white/20">Share your invite code to get the league started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayBoard.map((score, i) => (
            <PlayerRow
              key={score.player.id}
              score={score}
              isCurrentPlayer={score.player.id === player?.id}
              index={i}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-8 text-xs text-white/20">
        <RefreshCw className="w-3 h-3" />
        <span>Updates live · 60s score refresh</span>
      </div>
    </div>
  )
}

function computePoints(
  picks: Record<string, 'W' | 'L'>,
  schedule: Record<string, import('@/types').NFLGame[]>
): number {
  let points = 0
  const gameMap: Record<string, import('@/types').NFLGame> = {}
  Object.values(schedule).flat().forEach((g) => { gameMap[g.id] = g })

  Object.entries(picks).forEach(([key, pick]) => {
    const [gameId, teamId] = key.split('_')
    const game = gameMap[gameId]
    if (!game || game.status !== 'post') return
    const isHome = game.homeTeam.id === teamId
    const teamWon = isHome
      ? (game.homeScore || 0) > (game.awayScore || 0)
      : (game.awayScore || 0) > (game.homeScore || 0)
    if ((pick === 'W') === teamWon) points++
  })
  return points
}

function buildLeaderboard(
  players: Record<string, unknown>[],
  allPicks: Record<string, unknown>[],
  schedule: Record<string, import('@/types').NFLGame[]>,
  prevRanks: Record<string, number>
): PlayerScore[] {
  const gameMap: Record<string, import('@/types').NFLGame> = {}
  Object.values(schedule).flat().forEach((g) => { gameMap[g.id] = g })

  const scores = players.map((p) => {
    const playerPicks = allPicks.filter((pk) => pk.playerId === p.id)
    let correct = 0, total = 0

    playerPicks.forEach((pk) => {
      const game = gameMap[pk.gameId as string]
      if (!game || game.status !== 'post') return
      total++
      const isHome = game.homeTeam.id === pk.teamId
      const teamWon = isHome
        ? (game.homeScore || 0) > (game.awayScore || 0)
        : (game.awayScore || 0) > (game.homeScore || 0)
      if ((pk.pick === 'W') === teamWon) correct++
    })

    const player: Player = {
      id: p.id as string,
      name: p.name as string,
      leagueId: p.leagueId as string,
      joinedAt: p.joinedAt as string,
      sessionToken: '',
    }

    return {
      player,
      regularSeasonPoints: correct,
      playoffPoints: 0,
      totalPoints: correct,
      correctPicks: correct,
      totalLockedPicks: total,
      winPct: total > 0 ? correct / total : 0,
      rank: 0,
      prevRank: prevRanks[p.id as string],
    }
  })

  scores.sort((a, b) => b.totalPoints - a.totalPoints)
  scores.forEach((s, i) => { s.rank = i + 1 })
  return scores
}