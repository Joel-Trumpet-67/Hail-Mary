import { useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { createLeague, getLeagueByCode, joinLeague } from '@/lib/supabase'
import type { League, Player } from '@/types'

export function useLeague() {
  const { league, player, setLeague, setPlayer, clearSession } = useStore()

  const handleCreateLeague = useCallback(
    async (leagueName: string, playerName: string): Promise<{ league: League; player: Player }> => {
      // Demo mode: create local league without Supabase
      const inviteCode = generateCode(6)
      const leagueId = generateCode(12)
      const playerId = generateCode(12)

      const newLeague: League = {
        id: leagueId,
        name: leagueName,
        inviteCode,
        createdAt: new Date().toISOString(),
        createdBy: playerName,
        phase: 'picks',
      }

      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        leagueId,
        joinedAt: new Date().toISOString(),
        sessionToken: generateCode(16),
      }

      try {
        // Try Supabase if configured
        const dbLeague = await createLeague(leagueName, playerName)
        const dbPlayer = await joinLeague(dbLeague.id, playerName)
        const mappedLeague: League = {
          id: dbLeague.id,
          name: dbLeague.name,
          inviteCode: dbLeague.invite_code,
          createdAt: dbLeague.created_at,
          createdBy: dbLeague.created_by,
          phase: dbLeague.phase,
        }
        const mappedPlayer: Player = {
          id: dbPlayer.id,
          name: dbPlayer.name,
          leagueId: dbPlayer.league_id,
          joinedAt: dbPlayer.created_at,
          sessionToken: dbPlayer.session_token || dbPlayer.sessionToken,
        }
        setLeague(mappedLeague)
        setPlayer(mappedPlayer)
        return { league: mappedLeague, player: mappedPlayer }
      } catch {
        // Fallback to local mode
        setLeague(newLeague)
        setPlayer(newPlayer)
        return { league: newLeague, player: newPlayer }
      }
    },
    [setLeague, setPlayer]
  )

  const handleJoinLeague = useCallback(
    async (inviteCode: string, playerName: string): Promise<{ league: League; player: Player }> => {
      try {
        const dbLeague = await getLeagueByCode(inviteCode)
        const dbPlayer = await joinLeague(dbLeague.id, playerName)
        const mappedLeague: League = {
          id: dbLeague.id,
          name: dbLeague.name,
          inviteCode: dbLeague.invite_code,
          createdAt: dbLeague.created_at,
          createdBy: dbLeague.created_by,
          phase: dbLeague.phase,
        }
        const mappedPlayer: Player = {
          id: dbPlayer.id,
          name: dbPlayer.name,
          leagueId: dbPlayer.league_id,
          joinedAt: dbPlayer.created_at,
          sessionToken: dbPlayer.session_token,
        }
        setLeague(mappedLeague)
        setPlayer(mappedPlayer)
        return { league: mappedLeague, player: mappedPlayer }
      } catch {
        throw new Error(`League not found for code: ${inviteCode}. Check the code and try again.`)
      }
    },
    [setLeague, setPlayer]
  )

  const handleLeaveLeague = useCallback(() => {
    clearSession()
  }, [clearSession])

  return {
    league,
    player,
    createLeague: handleCreateLeague,
    joinLeague: handleJoinLeague,
    leaveLeague: handleLeaveLeague,
  }
}

function generateCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
