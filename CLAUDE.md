@AGENTS.md

# Doctor OS — AI Clinical Copilot

## Project
- Next.js 16, TypeScript, Prisma 7, Supabase, AI SDK v6
- 13 pages, 1 API route (agent chat), 38 AI tools, 10 engines, 18 Prisma models
- Standalone product extracted from Netcare Health OS

## Architecture
- **Agent-first**: One chat interface with 38 tools covering full clinical workflow
- **AI**: Claude Sonnet 4.6 (reasoning/tools), Gemini 2.5 Flash (audio transcription)
- **Tools pattern**: `getPracticeId()` closure for practice-scoped data access
- **Engines**: Extracted from netcare-healthos, adapted for standalone use

## Key Patterns
- ICD-10: WHO standard (NOT US ICD-10-CM)
- Tariffs: 4-digit CCSA codes (NOT CPT)
- NAPPI: 7-digit product + 3-digit pack suffix
- AI SDK v6: `streamText` + `stopWhen: stepCountIs(N)`, `useChat` with `DefaultChatTransport`
- Prisma 7: Adapter-based (`@prisma/adapter-pg`), URLs in `prisma.config.ts` not schema

## Stack
- Design: Dark theme (#0A0F1A), teal accent (#3DA9D1), Geist font, shadcn/ui
- Auth: Supabase Auth (planned), currently demo mode
- Deploy: Vercel
