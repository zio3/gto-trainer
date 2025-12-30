# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GTO プリフロップトレーナー - A poker training app for practicing Game Theory Optimal (GTO) preflop strategies. Built with Next.js 16 (App Router), TypeScript, and Tailwind CSS. Integrates Claude API for AI coaching.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Core Structure

- **`src/app/page.tsx`** - Main app component (~600 lines). Manages all game state, UI state, and chat interactions using React hooks.
- **`src/lib/`** - Core logic:
  - `types.ts` - All TypeScript interfaces (Position, Action, Situation, Result, etc.)
  - `gto-ranges.ts` - GTO data (OPEN_RANGES, VS_OPEN_RANGES, hand notation conversion)
  - `game-logic.ts` - Game mechanics (generateSituation, getCorrectAction, getAnswerLevel)
- **`src/components/`** - UI components (Card, HandDisplay, PokerTable)

### API Routes (Server-Side)

All routes call Claude API with `ANTHROPIC_API_KEY` from environment:

| Route | Model | Purpose |
|-------|-------|---------|
| `/api/explain` | Haiku | Individual hand explanation (low cost) |
| `/api/chat` | Sonnet | Hand-specific Q&A with context |
| `/api/analyze` | Sonnet | Streaming analysis of practice session |
| `/api/analyze-chat` | Sonnet | Follow-up questions on analysis |

### Key Patterns

1. **Streaming responses** - `/api/analyze` uses Web Streams API for real-time text display
2. **Answer levels** - 5-tier feedback system: `critical_mistake`, `wrong`, `borderline`, `correct`, `obvious`
3. **Hand weighting** - 70% borderline hands, 30% random for optimized learning
4. **Mobile-first** - Fixed bottom button bar, auto-scroll after actions, PWA support

## GTO Data Structure

Ranges defined in `gto-ranges.ts`:
- `OPEN_RANGES[position]` - Opening hands per position (UTG/HJ/CO/BTN/SB)
- `VS_OPEN_RANGES[rangeKey]` - BB defense vs opener (3bet/call/fold)
- `BORDERLINE_HANDS` / `OBVIOUS_HANDS` - Learning emphasis categorization

## Environment

Requires `.env.local`:
```
ANTHROPIC_API_KEY=your-key
```

## Language

All user-facing text is in Japanese. Code comments and variable names are in English.
