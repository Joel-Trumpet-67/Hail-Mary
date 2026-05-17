import { useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { createLeague, getLeagueByCode, joinLeague } from '@/lib/firebase'
import type { League, Player } from '@/types'

export function useLeague() {
  const { league, player, setLeague, setPlayer, clearSession } = useStore()

  const handleCreateLeague = useCallback(
    async (leagueName: string, playerName: string): Promise<{ league: League; player: Player }> => {
      const dbLeague = await createLeague(leagueName.trim(), playerName.trim())
      const dbPlayer = await joinLeague(dbLeague.id, playerName.trim())

      const mappedLeague: League = {
        id: dbLeague.id,
        name: dbLeague.name,
        inviteCode: dbLeague.inviteCode,
        createdAt: dbLeague.createdAt,
        createdBy: dbLeague.createdBy,
        phase: dbLeague.phase as 'picks' | 'season' | 'playoffs' | 'final',
      }
      const mappedPlayer: Player = {
        id: dbPlayer.id,
        name: dbPlayer.name,
        leagueId: dbPlayer.leagueId,
        joinedAt: dbPlayer.joinedAt,
        sessionToken: dbPlayer.sessionToken,
      }

      setLeague(mappedLeague)
      setPlayer(mappedPlayer)
      return { league: mappedLeague, player: mappedPlayer }
    },
    [setLeague, setPlayer]
  )

  const handleJoinLeague = useCallback(
    async (inviteCode: string, playerName: string): Promise<{ league: League; player: Player }> => {
      const dbLeague = await getLeagueByCode(inviteCode.trim())
      const dbPlayer = await joinLeague(dbLeague.id, playerName.trim())

      const mappedLeague: League = {
        id: dbLeague.id,
        name: dbLeague.name,
        inviteCode: dbLeague.inviteCode,
        createdAt: dbLeague.createdAt,
        createdBy: dbLeague.createdBy,
        phase: dbLeague.phase,
      }
      const mappedPlayer: Player = {
        id: dbPlayer.id,
        name: dbPlayer.name,
        leagueId: dbPlayer.leagueId,
        joinedAt: dbPlayer.joinedAt,
        sessionToken: dbPlayer.sessionToken,
      }

      setLeague(mappedLeague)
      setPlayer(mappedPlayer)
      return { league: mappedLeague, player: mappedPlayer }
    },
    [setLeague, setPlayer]
  )

  return {
    league,
    player,
    createLeague: handleCreateLeague,
    joinLeague: handleJoinLeague,
    leaveLeague: clearSession,
  }
}