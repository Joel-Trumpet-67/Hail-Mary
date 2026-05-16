import { useCallback, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { savePick } from '@/lib/supabase'

export function usePicks() {
  const { player, league, picks, setPick } = useStore()
  const pendingRef = useRef<Set<string>>(new Set())

  const makePick = useCallback(
    async (gameId: string, teamId: string, pick: 'W' | 'L') => {
      const key = `${gameId}_${teamId}`

      // Optimistic update immediately
      setPick(gameId, teamId, pick)

      // Debounce DB write
      if (pendingRef.current.has(key)) return
      pendingRef.current.add(key)

      try {
        if (player && league) {
          await savePick(player.id, league.id, gameId, teamId, pick)
        }
      } catch (err) {
        console.warn('Pick save failed (local only):', err)
      } finally {
        pendingRef.current.delete(key)
      }
    },
    [player, league, setPick]
  )

  const getPick = useCallback(
    (gameId: string, teamId: string): 'W' | 'L' | null => {
      return picks[`${gameId}_${teamId}`] || null
    },
    [picks]
  )

  return { makePick, getPick, picks }
}
