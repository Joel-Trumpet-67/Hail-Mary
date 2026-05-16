import type { NFLTeam, NFLGame, ESPNScoreboardEvent, ESPNCompetitor } from '@/types'

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'
const IS_PROD = window.location.hostname !== 'localhost'

function url(path: string) {
  return `${ESPN_BASE}${path}`
}

export async function fetchAllTeams(): Promise<NFLTeam[]> {
  if (IS_PROD) return FALLBACK_TEAMS
  try {
    const res = await fetch(url('/teams?limit=32'))
    const json = await res.json()
    return json.sports[0].leagues[0].teams.map((t: { team: Record<string, unknown> }) =>
      mapTeam(t.team as Parameters<typeof mapTeam>[0])
    )
  } catch (err) {
    console.error('Failed to fetch teams:', err)
    return FALLBACK_TEAMS
  }
}

export async function fetchTeamSchedule(_teamId: string, _season = 2025): Promise<NFLGame[]> {
  if (IS_PROD) return []
  try {
    const res = await fetch(url(`/teams/${_teamId}/schedule?season=${_season}`))
    const json = await res.json()
    const events = json.events || []
    return events.map((e: ESPNScoreboardEvent) => mapGame(e)).filter(Boolean) as NFLGame[]
  } catch (err) {
    console.error(`Failed to fetch schedule for team ${_teamId}:`, err)
    return []
  }
}

export async function fetchScoreboard(week?: number): Promise<NFLGame[]> {
  if (IS_PROD) return []
  try {
    const weekParam = week ? `&week=${week}` : ''
    const res = await fetch(url(`/scoreboard?limit=16${weekParam}`))
    const json = await res.json()
    const events: ESPNScoreboardEvent[] = json.events || []
    return events.map(mapGame).filter(Boolean) as NFLGame[]
  } catch (err) {
    console.error('Failed to fetch scoreboard:', err)
    return []
  }
}

export async function fetchCurrentWeekScoreboard(): Promise<NFLGame[]> {
  return fetchScoreboard()
}

export async function fetchPlayoffBracket(): Promise<NFLGame[]> {
  if (IS_PROD) return []
  try {
    const res = await fetch(url('/scoreboard?seasontype=3'))
    const json = await res.json()
    const events: ESPNScoreboardEvent[] = json.events || []
    return events.map(mapGame).filter(Boolean) as NFLGame[]
  } catch {
    return []
  }
}

export interface TickerGame {
  id: string
  shortName: string
  homeAbbr: string
  awayAbbr: string
  homeScore: string
  awayScore: string
  statusDetail: string
  state: 'pre' | 'in' | 'post'
}

export async function fetchTickerGames(): Promise<TickerGame[]> {
  if (IS_PROD) return []
  try {
    const res = await fetch(url('/scoreboard'))
    const json = await res.json()
    const events: ESPNScoreboardEvent[] = json.events || []
    return events.map((e) => {
      const comp = e.competitions[0]
      const home = comp.competitors.find((c) => c.homeAway === 'home')
      const away = comp.competitors.find((c) => c.homeAway === 'away')
      return {
        id: e.id,
        shortName: e.shortName,
        homeAbbr: home?.team.abbreviation || '',
        awayAbbr: away?.team.abbreviation || '',
        homeScore: home?.score || '0',
        awayScore: away?.score || '0',
        statusDetail: e.status.type.shortDetail,
        state: e.status.type.state,
      }
    })
  } catch {
    return []
  }
}

function mapTeam(t: {
  id: string
  abbreviation: string
  displayName: string
  shortDisplayName: string
  location: string
  name: string
  color?: string
  alternateColor?: string
  logos?: Array<{ href: string }>
}): NFLTeam {
  return {
    id: t.id,
    abbreviation: t.abbreviation,
    displayName: t.displayName,
    shortDisplayName: t.shortDisplayName,
    location: t.location,
    nickname: t.name,
    color: `#${t.color || '1a1a1a'}`,
    alternateColor: `#${t.alternateColor || '888888'}`,
    logo: t.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/nfl/500/${t.abbreviation.toLowerCase()}.png`,
  }
}

function mapGame(e: ESPNScoreboardEvent): NFLGame | null {
  try {
    const comp = e.competitions[0]
    const home = comp.competitors.find((c: ESPNCompetitor) => c.homeAway === 'home')
    const away = comp.competitors.find((c: ESPNCompetitor) => c.homeAway === 'away')
    if (!home || !away) return null
    const status = e.status.type.state
    const record = (c: ESPNCompetitor) => c.records?.find((r) => r.type === 'total')?.summary || ''
    return {
      id: e.id,
      week: e.week?.number || 0,
      date: comp.date || e.date,
      homeTeam: { ...mapTeam(home.team), record: record(home) },
      awayTeam: { ...mapTeam(away.team), record: record(away) },
      homeScore: home.score ? parseInt(home.score) : undefined,
      awayScore: away.score ? parseInt(away.score) : undefined,
      status,
      statusDetail: e.status.type.detail || e.status.type.shortDetail,
      venue: comp.venue?.fullName,
      network: comp.broadcasts?.[0]?.names?.[0],
    }
  } catch {
    return null
  }
}

export const FALLBACK_TEAMS: NFLTeam[] = [
  { id: '1', abbreviation: 'ATL', displayName: 'Atlanta Falcons', shortDisplayName: 'Falcons', location: 'Atlanta', nickname: 'Falcons', color: '#A71930', alternateColor: '#000000', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png' },
  { id: '2', abbreviation: 'BUF', displayName: 'Buffalo Bills', shortDisplayName: 'Bills', location: 'Buffalo', nickname: 'Bills', color: '#00338D', alternateColor: '#C60C30', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png' },
  { id: '3', abbreviation: 'CHI', displayName: 'Chicago Bears', shortDisplayName: 'Bears', location: 'Chicago', nickname: 'Bears', color: '#0B162A', alternateColor: '#C83803', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
  { id: '4', abbreviation: 'CIN', displayName: 'Cincinnati Bengals', shortDisplayName: 'Bengals', location: 'Cincinnati', nickname: 'Bengals', color: '#FB4F14', alternateColor: '#000000', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png' },
  { id: '5', abbreviation: 'CLE', displayName: 'Cleveland Browns', shortDisplayName: 'Browns', location: 'Cleveland', nickname: 'Browns', color: '#311D00', alternateColor: '#FF3C00', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png' },
  { id: '6', abbreviation: 'DAL', displayName: 'Dallas Cowboys', shortDisplayName: 'Cowboys', location: 'Dallas', nickname: 'Cowboys', color: '#003594', alternateColor: '#041E42', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png' },
  { id: '7', abbreviation: 'DEN', displayName: 'Denver Broncos', shortDisplayName: 'Broncos', location: 'Denver', nickname: 'Broncos', color: '#FB4F14', alternateColor: '#002244', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png' },
  { id: '8', abbreviation: 'DET', displayName: 'Detroit Lions', shortDisplayName: 'Lions', location: 'Detroit', nickname: 'Lions', color: '#0076B6', alternateColor: '#B0B7BC', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png' },
  { id: '9', abbreviation: 'GB', displayName: 'Green Bay Packers', shortDisplayName: 'Packers', location: 'Green Bay', nickname: 'Packers', color: '#203731', alternateColor: '#FFB612', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png' },
  { id: '10', abbreviation: 'TEN', displayName: 'Tennessee Titans', shortDisplayName: 'Titans', location: 'Tennessee', nickname: 'Titans', color: '#0C2340', alternateColor: '#4B92DB', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png' },
  { id: '11', abbreviation: 'IND', displayName: 'Indianapolis Colts', shortDisplayName: 'Colts', location: 'Indianapolis', nickname: 'Colts', color: '#002C5F', alternateColor: '#A2AAAD', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png' },
  { id: '12', abbreviation: 'KC', displayName: 'Kansas City Chiefs', shortDisplayName: 'Chiefs', location: 'Kansas City', nickname: 'Chiefs', color: '#E31837', alternateColor: '#FFB81C', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png' },
  { id: '13', abbreviation: 'LV', displayName: 'Las Vegas Raiders', shortDisplayName: 'Raiders', location: 'Las Vegas', nickname: 'Raiders', color: '#000000', alternateColor: '#A5ACAF', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png' },
  { id: '14', abbreviation: 'LAR', displayName: 'Los Angeles Rams', shortDisplayName: 'Rams', location: 'Los Angeles', nickname: 'Rams', color: '#003594', alternateColor: '#FFA300', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png' },
  { id: '15', abbreviation: 'MIA', displayName: 'Miami Dolphins', shortDisplayName: 'Dolphins', location: 'Miami', nickname: 'Dolphins', color: '#008E97', alternateColor: '#FC4C02', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png' },
  { id: '16', abbreviation: 'MIN', displayName: 'Minnesota Vikings', shortDisplayName: 'Vikings', location: 'Minnesota', nickname: 'Vikings', color: '#4F2683', alternateColor: '#FFC62F', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png' },
  { id: '17', abbreviation: 'NE', displayName: 'New England Patriots', shortDisplayName: 'Patriots', location: 'New England', nickname: 'Patriots', color: '#002244', alternateColor: '#C60C30', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png' },
  { id: '18', abbreviation: 'NO', displayName: 'New Orleans Saints', shortDisplayName: 'Saints', location: 'New Orleans', nickname: 'Saints', color: '#101820', alternateColor: '#D3BC8D', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png' },
  { id: '19', abbreviation: 'NYG', displayName: 'New York Giants', shortDisplayName: 'Giants', location: 'New York', nickname: 'Giants', color: '#0B2265', alternateColor: '#A71930', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png' },
  { id: '20', abbreviation: 'NYJ', displayName: 'New York Jets', shortDisplayName: 'Jets', location: 'New York', nickname: 'Jets', color: '#125740', alternateColor: '#000000', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png' },
  { id: '21', abbreviation: 'PHI', displayName: 'Philadelphia Eagles', shortDisplayName: 'Eagles', location: 'Philadelphia', nickname: 'Eagles', color: '#004C54', alternateColor: '#A5ACAF', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png' },
  { id: '22', abbreviation: 'ARI', displayName: 'Arizona Cardinals', shortDisplayName: 'Cardinals', location: 'Arizona', nickname: 'Cardinals', color: '#97233F', alternateColor: '#000000', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png' },
  { id: '23', abbreviation: 'PIT', displayName: 'Pittsburgh Steelers', shortDisplayName: 'Steelers', location: 'Pittsburgh', nickname: 'Steelers', color: '#101820', alternateColor: '#FFB612', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png' },
  { id: '24', abbreviation: 'LAC', displayName: 'Los Angeles Chargers', shortDisplayName: 'Chargers', location: 'Los Angeles', nickname: 'Chargers', color: '#0080C6', alternateColor: '#FFC20E', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png' },
  { id: '25', abbreviation: 'SF', displayName: 'San Francisco 49ers', shortDisplayName: '49ers', location: 'San Francisco', nickname: '49ers', color: '#AA0000', alternateColor: '#B3995D', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png' },
  { id: '26', abbreviation: 'SEA', displayName: 'Seattle Seahawks', shortDisplayName: 'Seahawks', location: 'Seattle', nickname: 'Seahawks', color: '#002244', alternateColor: '#69BE28', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png' },
  { id: '27', abbreviation: 'TB', displayName: 'Tampa Bay Buccaneers', shortDisplayName: 'Buccaneers', location: 'Tampa Bay', nickname: 'Buccaneers', color: '#D50A0A', alternateColor: '#FF7900', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png' },
  { id: '28', abbreviation: 'WSH', displayName: 'Washington Commanders', shortDisplayName: 'Commanders', location: 'Washington', nickname: 'Commanders', color: '#5A1414', alternateColor: '#FFB612', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png' },
  { id: '29', abbreviation: 'CAR', displayName: 'Carolina Panthers', shortDisplayName: 'Panthers', location: 'Carolina', nickname: 'Panthers', color: '#0085CA', alternateColor: '#101820', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png' },
  { id: '30', abbreviation: 'JAX', displayName: 'Jacksonville Jaguars', shortDisplayName: 'Jaguars', location: 'Jacksonville', nickname: 'Jaguars', color: '#006778', alternateColor: '#9F792C', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png' },
  { id: '31', abbreviation: 'BAL', displayName: 'Baltimore Ravens', shortDisplayName: 'Ravens', location: 'Baltimore', nickname: 'Ravens', color: '#241773', alternateColor: '#000000', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png' },
  { id: '32', abbreviation: 'HOU', displayName: 'Houston Texans', shortDisplayName: 'Texans', location: 'Houston', nickname: 'Texans', color: '#03202F', alternateColor: '#A71930', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png' },
]