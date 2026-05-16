# 🏈 Hail Mary 

Season-long NFL prediction game. Pick W or L for all 32 teams across 17 games, compete on a live leaderboard, then pick the playoffs for a 3× points comeback mechanic.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up env vars
cp .env.local.example .env.local
# → Fill in your Supabase URL and anon key

# 3. Set up Supabase database
# → Go to supabase.com → your project → SQL Editor
# → Paste and run the contents of supabase/schema.sql

# 4. Start dev server
npm run dev
```

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand (with localStorage persistence) |
| Backend | Supabase (Postgres + Realtime) |
| NFL Data | ESPN public API |
| Hosting | Vercel |

---

## File Structure

```
src/
├── main.tsx              # Entry point
├── App.tsx               # View router
├── types/index.ts        # All TypeScript types
├── store/useStore.ts     # Zustand global state
├── lib/
│   ├── espn.ts           # ESPN API + 32-team fallback data
│   └── supabase.ts       # DB client + all query helpers
├── hooks/
│   ├── useNFLData.ts     # Schedule fetching + score polling
│   ├── useLeague.ts      # Create/join league logic
│   ├── usePicks.ts       # Optimistic pick saving
│   └── useRipple.ts      # Ripple + haptic feedback
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx     # Sidebar + mobile nav
│   │   └── LiveTicker.tsx    # Live score banner
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── AnimatedNumber.tsx
│   ├── picks/
│   │   ├── TeamCard.tsx        # Grid card per team
│   │   ├── TeamPicksModal.tsx  # Full-screen pick flow
│   │   └── GamePickCard.tsx    # Single game W/L picker
│   ├── leaderboard/
│   │   ├── LeaderboardPage.tsx
│   │   └── PlayerRow.tsx
│   ├── playoffs/
│   │   ├── PlayoffsPage.tsx
│   │   └── BracketGame.tsx
│   └── league/
│       └── LeaguePage.tsx
└── pages/
    ├── HomePage.tsx    # Landing + create/join
    └── PicksPage.tsx   # 32-team grid
```

---

## Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Copy your **Project URL** and **anon public key** from Settings → API
4. Paste into `.env.local`

> **Note:** The app works fully in offline/demo mode without Supabase — picks are stored in localStorage and the leaderboard shows your own score only. Supabase enables multiplayer.

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars in Vercel dashboard:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

`vercel.json` handles SPA routing automatically.

---

## ESPN API

No API key required. The app calls:
- `site.api.espn.com/apis/site/v2/sports/football/nfl/teams` — all 32 teams
- `site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{id}/schedule` — per-team schedule
- `site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard` — live scores + ticker
- Seasontype `3` for playoff bracket

Schedules are cached 24 hours in localStorage. Scores poll every 60 seconds during season/playoff phases.

---

## Game Phases

| Phase | What happens |
|---|---|
| `picks` | Players make their season picks. Leaderboard hidden. |
| `season` | Picks locked. Live scores update. Leaderboard goes live. |
| `playoffs` | Bracket picks open. 3× points multiplier. |
| `final` | All done. Final leaderboard frozen. |

Phase is stored on the `leagues` table. Change it manually in Supabase or build an admin panel.
