// ─── NFL Data Types ───────────────────────────────────────────────────────────

export interface NFLTeam {
  id: string
  abbreviation: string
  displayName: string
  shortDisplayName: string
  location: string
  nickname: string
  color: string       // primary hex color
  alternateColor: string
  logo: string        // ESPN CDN logo URL
  record?: string
  wins?: number
  losses?: number
}

export interface NFLGame {
  id: string
  week: number
  date: string        // ISO string
  homeTeam: NFLTeam
  awayTeam: NFLTeam
  homeScore?: number
  awayScore?: number
  status: 'pre' | 'in' | 'post'
  statusDetail: string
  venue?: string
  network?: string
}

export interface ScheduleGame extends NFLGame {
  teamPerspective: 'home' | 'away'   // which side the player is picking for
  opponentTeam: NFLTeam
  isHome: boolean
}

export interface PlayoffGame {
  id: string
  round: number       // 1=wildcard, 2=divisional, 3=conf champ, 4=super bowl
  roundName: string
  date: string
  homeTeam: NFLTeam | null
  awayTeam: NFLTeam | null
  homeScore?: number
  awayScore?: number
  status: 'pre' | 'in' | 'post'
  winnerId?: string
}

// ─── User / League Types ──────────────────────────────────────────────────────

export interface Player {
  id: string
  name: string
  leagueId: string
  joinedAt: string
  sessionToken: string
}

export interface League {
  id: string
  name: string
  inviteCode: string
  createdAt: string
  createdBy: string   // player name
  phase: 'picks' | 'season' | 'playoffs' | 'final'
  picksLockDate?: string
}

// ─── Picks Types ──────────────────────────────────────────────────────────────

export type Pick = 'W' | 'L'

// key = `${gameId}_${teamId}` (which team the pick is for)
export type PicksMap = Record<string, Pick>

export interface PlayerPick {
  id: string
  playerId: string
  leagueId: string
  gameId: string
  teamId: string
  pick: Pick
  correct?: boolean   // set after game resolves
  createdAt: string
}

export interface PlayoffPick {
  id: string
  playerId: string
  leagueId: string
  gameId: string
  pickedTeamId: string
  correct?: boolean
  createdAt: string
}

// ─── Leaderboard Types ────────────────────────────────────────────────────────

export interface PlayerScore {
  player: Player
  regularSeasonPoints: number
  playoffPoints: number
  totalPoints: number
  correctPicks: number
  totalLockedPicks: number
  winPct: number
  rank: number
  prevRank?: number
}

// ─── ESPN API Raw Types ───────────────────────────────────────────────────────

export interface ESPNScoreboardEvent {
  id: string
  date: string
  name: string
  shortName: string
  week?: { number: number }
  competitions: ESPNCompetition[]
  status: ESPNStatus
}

export interface ESPNCompetition {
  id: string
  date: string
  venue?: { fullName: string }
  competitors: ESPNCompetitor[]
  broadcasts?: Array<{ names: string[] }>
  status: ESPNStatus
}

export interface ESPNCompetitor {
  id: string
  homeAway: 'home' | 'away'
  team: ESPNTeam
  score?: string
  records?: Array<{ summary: string; type: string }>
}

export interface ESPNTeam {
  id: string
  abbreviation: string
  displayName: string
  shortDisplayName: string
  location: string
  name: string
  color: string
  alternateColor: string
  logo: string
}

export interface ESPNStatus {
  clock?: number
  displayClock?: string
  period?: number
  type: {
    id: string
    name: string
    state: 'pre' | 'in' | 'post'
    completed: boolean
    description: string
    detail: string
    shortDetail: string
  }
}

// ─── App State Types ──────────────────────────────────────────────────────────

export interface AppState {
  league: League | null
  player: Player | null
  teams: NFLTeam[]
  schedule: Record<string, NFLGame[]>   // teamId → games
  picks: PicksMap
  playoffPicks: Record<string, string>  // gameId → teamId
  liveScores: Record<string, NFLGame>   // gameId → live game
  leaderboard: PlayerScore[]
}

export type ViewName = 'home' | 'picks' | 'leaderboard' | 'playoffs' | 'league'
