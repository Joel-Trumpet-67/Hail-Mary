import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { League, Player, NFLTeam, NFLGame, PicksMap, PlayerScore } from '@/types'

interface GameStore {
  // Auth / session
  league: League | null
  player: Player | null

  // NFL data
  teams: NFLTeam[]
  schedule: Record<string, NFLGame[]>   // teamId → games
  liveGames: NFLGame[]
  playoffGames: NFLGame[]
  lastScheduleFetch: number | null

  // Picks
  picks: PicksMap                          // `${gameId}_${teamId}` → 'W'|'L'
  playoffPicks: Record<string, string>     // gameId → teamId

  // Leaderboard
  leaderboard: PlayerScore[]

  // UI
  activeView: string
  selectedTeamId: string | null
  isLoading: boolean
  loadingMessage: string

  // Actions
  setLeague: (league: League | null) => void
  setPlayer: (player: Player | null) => void
  setTeams: (teams: NFLTeam[]) => void
  setSchedule: (teamId: string, games: NFLGame[]) => void
  setAllSchedules: (schedule: Record<string, NFLGame[]>) => void
  setLiveGames: (games: NFLGame[]) => void
  setPlayoffGames: (games: NFLGame[]) => void
  setPick: (gameId: string, teamId: string, pick: 'W' | 'L') => void
  setPlayoffPick: (gameId: string, teamId: string) => void
  setLeaderboard: (scores: PlayerScore[]) => void
  setActiveView: (view: string) => void
  setSelectedTeam: (teamId: string | null) => void
  setLoading: (loading: boolean, message?: string) => void
  clearSession: () => void

  // Computed helpers
  getTeamPicks: (teamId: string) => PicksMap
  getPicksCount: (teamId: string) => number
  isTeamComplete: (teamId: string) => boolean
  getTotalPicksCount: () => number
  getTotalCompleteTeams: () => number
}

export const useStore = create<GameStore>()(
  persist(
    (set, get) => ({
      league: null,
      player: null,
      teams: [],
      schedule: {},
      liveGames: [],
      playoffGames: [],
      lastScheduleFetch: null,
      picks: {},
      playoffPicks: {},
      leaderboard: [],
      activeView: 'home',
      selectedTeamId: null,
      isLoading: false,
      loadingMessage: '',

      setLeague: (league) => set({ league }),
      setPlayer: (player) => set({ player }),
      setTeams: (teams) => set({ teams }),
      setSchedule: (teamId, games) =>
        set((state) => ({ schedule: { ...state.schedule, [teamId]: games } })),
      setAllSchedules: (schedule) => set({ schedule, lastScheduleFetch: Date.now() }),
      setLiveGames: (liveGames) => set({ liveGames }),
      setPlayoffGames: (playoffGames) => set({ playoffGames }),

      setPick: (gameId, teamId, pick) =>
        set((state) => ({
          picks: { ...state.picks, [`${gameId}_${teamId}`]: pick },
        })),

      setPlayoffPick: (gameId, teamId) =>
        set((state) => ({
          playoffPicks: { ...state.playoffPicks, [gameId]: teamId },
        })),

      setLeaderboard: (leaderboard) => set({ leaderboard }),
      setActiveView: (activeView) => set({ activeView }),
      setSelectedTeam: (selectedTeamId) => set({ selectedTeamId }),
      setLoading: (isLoading, loadingMessage = '') => set({ isLoading, loadingMessage }),

      clearSession: () =>
        set({
          league: null,
          player: null,
          picks: {},
          playoffPicks: {},
          leaderboard: [],
          activeView: 'home',
        }),

      // Computed
      getTeamPicks: (teamId) => {
        const { picks, schedule } = get()
        const teamGames = schedule[teamId] || []
        const result: PicksMap = {}
        teamGames.forEach((game) => {
          const key = `${game.id}_${teamId}`
          if (picks[key]) result[key] = picks[key]
        })
        return result
      },

      getPicksCount: (teamId) => {
        const { picks, schedule } = get()
        const teamGames = schedule[teamId] || []
        return teamGames.filter((game) => picks[`${game.id}_${teamId}`]).length
      },

      isTeamComplete: (teamId) => {
        const { schedule } = get()
        const games = schedule[teamId] || []
        return games.length > 0 && get().getPicksCount(teamId) >= games.length
      },

      getTotalPicksCount: () => {
        const { picks } = get()
        return Object.keys(picks).length
      },

      getTotalCompleteTeams: () => {
        const { teams } = get()
        return teams.filter((t) => get().isTeamComplete(t.id)).length
      },
    }),
    {
      name: 'hail-mary-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        league: state.league,
        player: state.player,
        picks: state.picks,
        playoffPicks: state.playoffPicks,
        teams: state.teams,
        schedule: state.schedule,
        lastScheduleFetch: state.lastScheduleFetch,
      }),
    }
  )
)
