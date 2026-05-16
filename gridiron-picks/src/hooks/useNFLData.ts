import { useEffect, useCallback, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { fetchAllTeams, fetchTeamSchedule, fetchCurrentWeekScoreboard, fetchPlayoffBracket } from '@/lib/espn'

const SCHEDULE_CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours
const SCORE_POLL_INTERVAL = 1000 * 60            // 60 seconds

export function useNFLData() {
  const {
    teams, setTeams,
    schedule, setAllSchedules, setSchedule,
    setLiveGames,
    setPlayoffGames,
    lastScheduleFetch,
    league,
    setLoading,
  } = useStore()

  const scoreInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load teams + schedules (cached)
  const loadTeamsAndSchedules = useCallback(async () => {
    const cacheAge = lastScheduleFetch ? Date.now() - lastScheduleFetch : Infinity
    const needsRefresh = cacheAge > SCHEDULE_CACHE_TTL || Object.keys(schedule).length === 0

    if (!needsRefresh && teams.length > 0) return

    setLoading(true, 'Loading NFL schedules...')

    try {
      // Fetch teams first
      const fetchedTeams = await fetchAllTeams()
      setTeams(fetchedTeams)

      // Fetch all 32 team schedules in parallel batches
      const batchSize = 8
      const allSchedules: Record<string, import('@/types').NFLGame[]> = {}

      for (let i = 0; i < fetchedTeams.length; i += batchSize) {
        const batch = fetchedTeams.slice(i, i + batchSize)
        const results = await Promise.allSettled(
          batch.map((t) => fetchTeamSchedule(t.id))
        )
        results.forEach((result, idx) => {
          if (result.status === 'fulfilled') {
            allSchedules[batch[idx].id] = result.value
          }
        })
        setLoading(true, `Loading schedules... ${Math.min(i + batchSize, fetchedTeams.length)}/32`)
      }

      setAllSchedules(allSchedules)
    } catch (err) {
      console.error('Failed to load NFL data:', err)
    } finally {
      setLoading(false)
    }
  }, [lastScheduleFetch, teams.length, schedule, setTeams, setAllSchedules, setLoading])

  // Poll live scores
  const pollScores = useCallback(async () => {
    try {
      const games = await fetchCurrentWeekScoreboard()
      setLiveGames(games)

      // Update individual game scores in schedule cache
      games.forEach((game) => {
        if (game.status !== 'pre') {
          // Update both teams' schedule entries
          ;[game.homeTeam.id, game.awayTeam.id].forEach((teamId) => {
            const teamGames = schedule[teamId] || []
            const updated = teamGames.map((g) => (g.id === game.id ? game : g))
            if (updated.some((g) => g.id === game.id)) {
              setSchedule(teamId, updated)
            }
          })
        }
      })
    } catch {
      // Silently fail score polls
    }
  }, [schedule, setLiveGames, setSchedule])

  // Load playoff data when in playoffs phase
  const loadPlayoffs = useCallback(async () => {
    if (league?.phase !== 'playoffs' && league?.phase !== 'final') return
    try {
      const games = await fetchPlayoffBracket()
      setPlayoffGames(games)
    } catch {
      // Silently fail
    }
  }, [league?.phase, setPlayoffGames])

  useEffect(() => {
    loadTeamsAndSchedules()
  }, [loadTeamsAndSchedules])

  useEffect(() => {
    if (league?.phase === 'season' || league?.phase === 'playoffs') {
      pollScores()
      scoreInterval.current = setInterval(pollScores, SCORE_POLL_INTERVAL)
    }
    return () => {
      if (scoreInterval.current) clearInterval(scoreInterval.current)
    }
  }, [league?.phase, pollScores])

  useEffect(() => {
    loadPlayoffs()
  }, [loadPlayoffs])
}

export function useTeamSchedule(teamId: string | null) {
  const schedule = useStore((s) => s.schedule)
  return teamId ? schedule[teamId] || [] : []
}

export function useTeamPick(teamId: string | null) {
  const picks = useStore((s) => s.picks)
  const schedule = useStore((s) => s.schedule)

  if (!teamId) return { picks: {}, count: 0, total: 0, complete: false }

  const teamGames = schedule[teamId] || []
  const teamPicks: Record<string, 'W' | 'L'> = {}
  teamGames.forEach((g) => {
    const key = `${g.id}_${teamId}`
    if (picks[key]) teamPicks[key] = picks[key]
  })

  const count = Object.keys(teamPicks).length
  const total = teamGames.length
  return { picks: teamPicks, count, total, complete: total > 0 && count >= total }
}
