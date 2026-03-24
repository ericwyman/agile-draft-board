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

## Visual Design System

### Aesthetic: "Stadium Scoreboard / Data Instrument"

Utilitarian, high-contrast, dark-mode-only. Designed for rapid visual scanning during a live draft. Every pixel serves readability or state communication. No decoration.

### Typography

- **Display font**: `Oswald` (CSS: `font-display`) — condensed, bold, uppercase. Used for player last names, stat numbers, and position labels. Loaded via `next/font/google` with `--font-display` CSS variable.
- **Body font**: `Geist` (CSS: `font-sans`) — clean sans-serif for first names, metadata, UI controls.
- **Text sizes**: Last name `text-base`, first name `text-xs`, stat number `text-lg`, labels `text-[10px]`, metadata `text-xs`.
- **Legibility**: Target audience is Gen-X/elder millennials. Minimum text size is `text-[10px]`. Prefer zinc-200/300 over zinc-400/500 for readable text. White for primary names.
- **Uppercase + tracking**: All labels, badges, and position tags use `uppercase tracking-wider` or `tracking-widest`.

### Color Palette

Dark zinc base, semantic accent colors for state:

| Element | Color | Class |
|---------|-------|-------|
| Card background | zinc-800/90 | `bg-zinc-800/90` |
| Card hover | zinc-800 | `hover:bg-zinc-800` |
| Page background | shadcn dark theme | `bg-background` |
| Primary text (last name) | white | `text-white` |
| Secondary text (first name, team) | zinc-300 | `text-zinc-300` |
| Label text (stat labels, badges) | zinc-400 | `text-zinc-400` |
| Drafted state | emerald-400 | accent bar, badge, glow |
| Reordered state | amber-400 | accent bar |
| Selected state | zinc-400 | accent bar |
| Draft action | emerald-300 | button text + bg |
| Dismiss action | zinc-400 → zinc-100 | hover transition |

### WAR Stat Color Tiers

Stats are color-coded for instant value recognition:

| Tier | WAR | Text color | Background |
|------|-----|-----------|------------|
| Elite | 5.0+ | `text-amber-300` | `bg-amber-400/15` |
| Strong | 3.0+ | `text-emerald-300` | `bg-emerald-400/15` |
| Solid | 1.5+ | `text-sky-300` | `bg-sky-400/15` |
| Below | <1.5 | `text-zinc-300` | `bg-zinc-400/10` |

Pitcher ADP uses `text-zinc-200` on `bg-zinc-700/80`.

### Card Anatomy

```
┌─╴accent bar (4px, left edge, color = state)
│
│  LAST NAME          ╳ dismiss
│  first name       ┌─────┐
│                    │ 5.8 │ stat block
│  TEA  LF  Drafted  │ WAR │
│               [Draft] └─────┘
└─────────────────────────────┘
```

- **Width**: `w-48` (192px). Constant used in `position-row.tsx` as `CARD_WIDTH = 200` (192 + 8px gap).
- **Corners**: `rounded-sm` (sharp, utilitarian).
- **Left accent bar**: `w-1 absolute left-0 top-0 bottom-0`. Color set by `accentBar()` helper.
- **Stat block**: Right-aligned, `rounded-sm`, contains large `tabular-nums` value + tiny label.
- **Dismiss (X)**: `absolute top-1 right-1`, `size-5` hit area, `size-3` icon. Near-invisible until hover.
- **Draft button**: Conditional — only rendered when `selected || isReordered`. Uses `bg-emerald-400/10` chip style.
- **"Drafted" badge**: `text-[9px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-1.5 py-px rounded-sm`.
- **Sub-position badge** (OF cards): Same pattern but `text-zinc-600 bg-zinc-800`.

### Card States

| State | Accent bar | Background | Extra |
|-------|-----------|------------|-------|
| Default | `bg-zinc-700` | `bg-zinc-900/80` | — |
| Hovered | `bg-zinc-700` | `bg-zinc-900` | — |
| Selected (clicked) | `bg-zinc-500` | `bg-zinc-900/80` | Draft button visible |
| Reordered (dragged) | `bg-amber-500` | `bg-zinc-900/80` | Draft button visible |
| Drafted | `bg-emerald-500` | `bg-emerald-950/40` | "Drafted" badge, glow shadow |
| Dragging | `bg-zinc-700` | — | `opacity-0.4`, `scale-[1.02]`, `shadow-2xl` |

### Position Row Labels

- `w-12`, `font-display font-bold text-sm uppercase tracking-wider`
- `text-zinc-400 bg-zinc-900/60 rounded-sm border-l-2 border-zinc-700`

### Load More Trigger

- Same `w-48` as cards, `rounded-sm`, `border border-dashed border-zinc-700/50`
- `bg-zinc-900/30`, chevron icon + `text-[10px] font-bold uppercase tracking-wider`

### Component Pattern Rules

1. **Custom cards over shadcn Card** — `PlayerCard` uses raw `div` with utility classes, not the shadcn `Card` component. This gives full control over the scoreboard aesthetic without fighting shadcn defaults.
2. **shadcn for structural UI** — `Sheet`, `Button`, `Badge` are still used for the header, My Team drawer, and toolbar controls where standard component behavior is needed.
3. **State through color, not shape** — Card dimensions never change between states. Only color (accent bar, background, text) communicates state. This keeps layouts stable during scanning.
4. **Conditional rendering** — Draft button is not hidden/shown with CSS. It is conditionally rendered (`showDraft && ...`) to keep the DOM clean.
5. **No decorative borders** — Cards have no visible border. State is communicated through the left accent bar and background color only.

### Spacing & Layout Constants

| Constant | Value | Used in |
|----------|-------|---------|
| `CARD_WIDTH` | 200 (192px card + 8px gap) | `position-row.tsx` fit-to-screen calculation |
| `LABEL_WIDTH` | 60 (48px label + 12px gap) | `position-row.tsx` available width |
| `PADDING` | 48 (page padding) | `position-row.tsx` available width |
| `LOAD_MORE_BATCH` | 10 | `position-row.tsx` pagination |
| Row gap | `gap-2` (8px) | Between cards |
| Section gap | `space-y-3` (12px) | Between position rows |
| Page padding | `p-4 md:p-6` | `draft-board.tsx` |

## Conventions

- Follow shadcn/ui patterns for structural UI (Sheet, Button, Badge)
- Use raw utility classes for data-dense components (PlayerCard)
- Keep components in `src/components/`
- Keep data/types in `src/lib/`
- Keep hooks in `src/hooks/`
- Use TypeScript throughout
