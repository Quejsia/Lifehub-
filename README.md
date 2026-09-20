# LifeHub Next.js v0.1

A standalone rebuild of LifeHub using the current visual blueprint and the existing Supabase backend.

## Stack

- Next.js App Router + TypeScript
- Supabase Auth + PostgreSQL
- @supabase/ssr for cookie-based SSR auth
- Lucide React for SVG icons
- Plain CSS (no Tailwind dependency)
- GitHub for source control
- Vercel for deployment

## Phase 1 implemented

- Home dashboard with Learn / Practice navigation
- Supabase authentication
- Published courses / lessons / activities loading
- Spelling practice activity loop
- submit_spelling_attempt RPC integration
- XP, level, streak, accuracy, mastery
- Attempts / daily activity / achievement display
- Mobile-responsive UI
- Current LifeHub visual token system

## Setup

1. Install Node.js 20.9+.
2. Copy .env.example to .env.local.
3. Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
4. Install dependencies with npm install.
5. Run npm run dev.
6. Open http://localhost:3000.

The existing LifeHub Supabase project already contains the Phase 1 schema and seed data. This project expects those tables and the submit_spelling_attempt RPC to remain available.

## Design source

The Figma blueprint is LifeHub — Floot Visual Match and uses the established LifeHub palette, spacing, typography, and card hierarchy. Treat the Figma file as the visual reference while implementing later screens.

## Roadmap

Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7

The application should preserve a stable learning engine while adding new activity types and subjects on top of the same course / lesson / activity / progress model.