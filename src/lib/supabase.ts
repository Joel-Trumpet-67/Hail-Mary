import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase env vars not set — running in demo mode')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 10 } },
  }
)

// ─── Database helpers ─────────────────────────────────────────────────────────

export async function createLeague(name: string, createdBy: string) {
  const inviteCode = generateCode(6)
  const { data, error } = await supabase
    .from('leagues')
    .insert({ name, invite_code: inviteCode, created_by: createdBy, phase: 'picks' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getLeagueByCode(inviteCode: string) {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single()
  if (error) throw error
  return data
}

export async function joinLeague(leagueId: string, playerName: string) {
  const sessionToken = generateCode(16)
  const { data, error } = await supabase
    .from('players')
    .insert({ name: playerName, league_id: leagueId, session_token: sessionToken })
    .select()
    .single()
  if (error) throw error
  return { ...data, sessionToken }
}

export async function getLeaguePlayers(leagueId: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('league_id', leagueId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function savePick(
  playerId: string,
  leagueId: string,
  gameId: string,
  teamId: string,
  pick: 'W' | 'L'
) {
  const { error } = await supabase
    .from('picks')
    .upsert(
      { player_id: playerId, league_id: leagueId, game_id: gameId, team_id: teamId, pick },
      { onConflict: 'player_id,game_id,team_id' }
    )
  if (error) throw error
}

export async function getPlayerPicks(playerId: string, leagueId: string) {
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .eq('player_id', playerId)
    .eq('league_id', leagueId)
  if (error) throw error
  return data
}

export async function getAllLeaguePicks(leagueId: string) {
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .eq('league_id', leagueId)
  if (error) throw error
  return data
}

export async function savePlayoffPick(
  playerId: string,
  leagueId: string,
  gameId: string,
  pickedTeamId: string
) {
  const { error } = await supabase
    .from('playoff_picks')
    .upsert(
      { player_id: playerId, league_id: leagueId, game_id: gameId, picked_team_id: pickedTeamId },
      { onConflict: 'player_id,game_id' }
    )
  if (error) throw error
}

// ─── Realtime subscriptions ───────────────────────────────────────────────────

export function subscribeToLeague(leagueId: string, callback: () => void) {
  return supabase
    .channel(`league:${leagueId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'picks', filter: `league_id=eq.${leagueId}` }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `league_id=eq.${leagueId}` }, callback)
    .subscribe()
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function generateCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
