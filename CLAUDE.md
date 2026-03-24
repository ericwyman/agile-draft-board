# Agile Draft Board

## Project Overview

A kanban-style baseball draft board UI. Players are organized in rows by position (C, 1B, 2B, SS, 3B, OF, DH, SP, RP). Position players ranked left-to-right by projected WAR; pitchers ranked by ADP.

## Tech Stack

- **Framework**: Next.js (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit (for card reordering within rows)
- **Hosting**: Vercel
- **Repository**: GitHub (`ericwyman/agile-draft-board`)

## Data Source

- **Position players** (C, 1B, 2B, SS, 3B, OF, DH): Scraped from Fangraphs 2026 Positional Power Rankings articles. Sorted by projected WAR descending.
- **OF row**: Collapsed from LF/CF/RF articles; each card has a `subPosition` badge.
- **SP/RP classification**: ADP TSV (`docs/ADP(1).tsv`) lists all pitchers as "P". Cross-referenced with Fangraphs bullpen articles to identify RPs; remainder classified as SP. Sorted by ADP ascending.
- **Scrape script**: `npm run scrape` runs `scripts/scrape-fangraphs.mjs` → outputs `src/data/players.json`
- **Static data**: `players.json` is committed to repo as seed data (no runtime scraping needed)

## Core Features

1. **Position Rows** — Each row is labeled by position, displayed vertically like a kanban board
2. **Player Cards** — shadcn Card components showing player name, team, ADP rank
3. **Dismissable** — Cards have an `X` button to hide them from the board
4. **Draggable** — Cards can be dragged left/right within their position row to reorder
5. **Multi-position players** — Each player appears only in the position where Fangraphs lists them

## Architecture Decisions

- Static JSON seed data from Fangraphs scrape; re-run `npm run scrape` to refresh
- Client-side state for card visibility and ordering (localStorage persistence)
- Horizontal scroll per row for positions with many players

## Development Commands

```bash
npm run dev          # Local development
npm run build        # Production build
npm run lint         # Lint check
npm run scrape       # Re-scrape Fangraphs data → src/data/players.json
```

## Deployment

- Vercel auto-deploys from `main` branch
- Preview deployments on PRs
- Vercel CLI: `vercel` (preview) / `vercel --prod` (production)

## Conventions

- Follow shadcn/ui patterns for component structure
- Keep components in `src/components/`
- Keep data/types in `src/lib/`
- Use TypeScript throughout
