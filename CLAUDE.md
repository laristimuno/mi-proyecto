# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language; Claude generates them using file-editing tools against a virtual file system, with immediate visual feedback in a sandboxed iframe.

## Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run dev:daemon   # Start in background, logs to logs.txt

# Build & Production
npm run build        # Production build
npm run start        # Start production server

# Code Quality & Testing
npm run lint         # ESLint with Next.js config
npm run test         # Run Vitest suite

# Database
npm run setup        # Install deps + Prisma client generation + migrations
npm run db:reset     # Force reset database
npx prisma studio    # Visual DB browser
```

To run a single test file: `npx vitest run src/path/to/__tests__/file.test.tsx`

## Environment

Copy `.env.example` to `.env`. Set `ANTHROPIC_API_KEY` for real AI generation; if absent, the app falls back to `MockLanguageModel` which produces deterministic demo components.

## Architecture

### Request Flow
1. User submits prompt in `ChatInterface`
2. `ChatProvider` (`/src/lib/contexts/chat-context.tsx`) calls `/api/chat` via Vercel AI SDK's `useChat`
3. API route (`/src/app/api/chat/route.ts`) runs `streamText` with Claude Haiku (or mock), passing virtual file state in the system prompt
4. Claude calls structured tools (`str_replace_editor`, `file_manager`) to create/modify files
5. Tool results update `FileSystemProvider` state
6. `PreviewFrame` re-renders an iframe using `JSXTransformer` (Babel Standalone) to compile JSX → executable HTML
7. For authenticated users, state is persisted to SQLite via Prisma after each message

### Key Abstractions

**VirtualFileSystem** (`/src/lib/file-system.ts`) — In-memory Map-based tree; no disk I/O. Files are serialized for DB persistence. Both frontend and backend operate on the same structure.

**JSXTransformer** (`/src/lib/transform/jsx-transformer.ts`) — Babel Standalone converts JSX to browser-executable JS at runtime. Handles import maps, strips CSS imports, and generates a sandboxed HTML document for the iframe.

**AI Tools** (`/src/lib/tools/`) — Two tools Claude can call:
- `str_replace_editor`: Replace specific text in an existing file (surgical edits)
- `file_manager`: Create or delete files

**Provider** (`/src/lib/provider.ts`) — Returns either the real Anthropic model (40 max steps) or `MockLanguageModel` (4 steps, deterministic output). Mock is auto-selected when `ANTHROPIC_API_KEY` is absent.

**Server Actions** (`/src/actions/`) — Next.js server actions for auth and project CRUD. Auth uses bcrypt + JWT stored in httpOnly cookies (7-day expiry). Middleware validates JWT on all routes.

### Route Structure
- `/` — Home/entry, renders `MainContent`
- `/[projectId]` — Project workspace (same `MainContent` with loaded state)
- `/api/chat` — Streaming POST endpoint (120s max duration)

## Data Models (Prisma/SQLite)

```prisma
User { id, email, passwordHash, createdAt, projects[] }
Project { id, name, messages (JSON), files (JSON), userId, createdAt, updatedAt }
```

`messages` stores the full chat history; `files` stores the serialized `VirtualFileSystem`.

## Testing

Tests live in `__tests__` folders co-located with source. Uses Vitest + React Testing Library + jsdom. Path alias `@/*` → `src/*` is configured in `vitest.config.mts`.
