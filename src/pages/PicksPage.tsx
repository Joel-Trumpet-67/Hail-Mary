import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { TeamCard } from '@/components/picks/TeamCard'
import { TeamPicksModal } from '@/components/picks/TeamPicksModal'
import type { NFLTeam } from '@/types'
import clsx from 'clsx'

const TEAM_DIVISIONS: Record<string, string> = {
  BUF: 'AFC East', MIA: 'AFC East', NE: 'AFC East', NYJ: 'AFC East',
  BAL: 'AFC North', CIN: 'AFC North', CLE: 'AFC North', PIT: 'AFC North',
  HOU: 'AFC South', IND: 'AFC South', JAX: 'AFC South', TEN: 'AFC South',
  DEN: 'AFC West', KC: 'AFC West', LV: 'AFC West', LAC: 'AFC West',
  DAL: 'NFC East', NYG: 'NFC East', PHI: 'NFC East', WSH: 'NFC East',
  CHI: 'NFC North', DET: 'NFC North', GB: 'NFC North', MIN: 'NFC North',
  ATL: 'NFC South', CAR: 'NFC South', NO: 'NFC South', TB: 'NFC South',
  ARI: 'NFC West', LAR: 'NFC West', SF: 'NFC West', SEA: 'NFC West',
}

const DIVISIONS = ['AFC East','AFC North','AFC South','AFC West','NFC East','NFC North','NFC South','NFC West']
type Filter = 'all' | 'incomplete' | 'complete' | string

function getDailyFeatured(teams: NFLTeam[]): [NFLTeam, NFLTeam] | null {
  if (teams.length < 2) return null
  const day = Math.floor(Date.now() / 86_400_000)
  const i = (day * 2) % teams.length
  return [teams[i], teams[(i + 1) % teams.length]]
}

export function PicksPage() {
  const { teams, picks, schedule } = useStore()
  const [selectedTeam, setSelectedTeam] = useState<NFLTeam | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [showFilters, setShowFilters] = useState(false)

  const featured = useMemo(() => getDailyFeatured(teams), [teams])

  const isComplete = (team: NFLTeam) => {
    const games = schedule[team.id] || []
    return games.length > 0 && games.filter((g) => picks[`${g.id}_${team.id}`]).length >= games.length
  }

  const totalComplete = useMemo(() => teams.filter(isComplete).length, [teams, picks, schedule])

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !team.displayName.toLowerCase().includes(q) &&
          !team.abbreviation.toLowerCase().includes(q) &&
          !team.location.toLowerCase().includes(q)
        ) return false
      }
      if (filter === 'complete') return isComplete(team)
      if (filter === 'incomplete') return !isComplete(team)
      if (DIVISIONS.includes(filter)) return TEAM_DIVISIONS[team.abbreviation] === filter
      return true
    })
  }, [teams, search, filter, picks, schedule])

  // Group by division when division filter is active, else flat
  const grouped = useMemo(() => {
    if (filter !== 'all' || search) return { All: filteredTeams }
    const groups: Record<string, NFLTeam[]> = {}
    DIVISIONS.forEach((div) => {
      groups[div] = teams.filter((t) => TEAM_DIVISIONS[t.abbreviation] === div)
    })
    return groups
  }, [filteredTeams, filter, search, teams])

  return (
    <>
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-1">
          <div>
            <p className="font-display text-xs tracking-widest text-white/30">2025 NFL SEASON</p>
            <h1 className="font-display text-4xl tracking-wider leading-none">MY PICKS</h1>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl text-turf">
              {totalComplete}<span className="text-white/20 text-xl">/{teams.length || 32}</span>
            </p>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">teams done</p>
          </div>
        </div>

        {/* Global progress */}
        <div className="h-1 rounded-full bg-pitch-700 overflow-hidden mt-4 mb-6">
          <motion.div
            className="h-full rounded-full bg-turf"
            animate={{ width: teams.length > 0 ? `${(totalComplete / teams.length) * 100}%` : '0%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Featured teams */}
        {featured && !search && filter === 'all' && (
          <div className="mb-6">
            <p className="font-display text-xs tracking-widest text-white/30 mb-3">TODAY'S FEATURED</p>
            <div className="grid grid-cols-2 gap-3">
              {featured.map((team, i) => (
                <TeamCard key={team.id} team={team} index={i} featured onClick={() => setSelectedTeam(team)} />
              ))}
            </div>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams..."
              className="w-full bg-pitch-800 border border-white/5 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm transition-colors',
              filter !== 'all'
                ? 'bg-turf/10 border-turf/40 text-turf'
                : 'glass border-white/5 text-white/50 hover:text-white'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <ChevronDown className={clsx('w-3 h-3 transition-transform', showFilters && 'rotate-180')} />
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex flex-wrap gap-2 pb-2">
                {(['all', 'incomplete', 'complete', ...DIVISIONS] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={clsx(
                      'px-3 py-1.5 rounded-xl text-xs font-body font-semibold transition-colors border',
                      filter === f
                        ? 'bg-turf/20 border-turf/40 text-turf'
                        : 'glass border-white/5 text-white/40 hover:text-white'
                    )}
                  >
                    {f === 'all' ? 'All Teams' : f === 'incomplete' ? 'Incomplete' : f === 'complete' ? 'Complete ✓' : f}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Teams grid */}
      <div className="px-4 pb-8">
        {teams.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl shimmer-bg" />
            ))}
          </div>
        ) : Object.entries(grouped).map(([division, divTeams]) => (
          divTeams.length === 0 ? null : (
            <div key={division} className="mb-6">
              {division !== 'All' && (
                <p className="font-display text-xs tracking-widest text-white/25 mb-3 mt-2">
                  {division.toUpperCase()}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {divTeams.map((team, i) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    index={i}
                    onClick={() => setSelectedTeam(team)}
                  />
                ))}
              </div>
            </div>
          )
        ))}

        {filteredTeams.length === 0 && teams.length > 0 && (
          <div className="text-center py-16 text-white/30">
            <p className="font-display text-2xl mb-2">NO TEAMS</p>
            <p className="text-sm">Try a different search or filter</p>
          </div>
        )}
      </div>

      {/* Team picks modal */}
      <AnimatePresence>
        {selectedTeam && (
          <TeamPicksModal
            key={selectedTeam.id}
            team={selectedTeam}
            onClose={() => setSelectedTeam(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
