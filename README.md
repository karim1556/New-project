# Hackathon Club Management System (Next.js + TypeScript)

Single-project full-stack app (no separate frontend/backend) using Next.js App Router + server actions + Supabase.

## Stack
- Next.js 14
- TypeScript
- App Router
- Server Actions
- Cookie-based role auth
- Supabase (PostgreSQL)

## Demo credentials
- Admin: `admin@club.local` / `admin123`
- Member: `aarav@club.local` / `member123`

## Run
1. `nvm use` (uses Node 20 from `.nvmrc`)
2. `npm install`
3. Create `.env.local` using `.env.example`
4. In Supabase SQL editor, run `/Users/karimshaikh/Documents/New project/supabase/schema.sql`
5. `npm run dev`
6. Open `http://localhost:3000`

Note: `npm run dev` now auto-cleans `.next` to avoid stale chunk errors like `Cannot find module './937.js'`.

## Included features
- Authentication + role redirects
- Admin control center
  - Dashboard widgets
  - Team management
  - Attendance marking
  - Announcements
  - Weekly reports
  - Leaderboard
- Team member workspace
  - Team dashboard
  - Project tracking
  - Daily work log
  - Hackathon tracker
  - File upload link management
  - Announcements view
  - Personal attendance view

## Data model
All entities are typed in `lib/types.ts` and persisted in Supabase tables:
- Users, Teams
- Projects, Daily Logs
- Hackathons
- Attendance
- Announcements
- File attachments
- Leaderboard points
