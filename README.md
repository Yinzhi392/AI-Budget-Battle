# AI Budget Battle

AI Budget Battle is a Chinese-first, cyber-style spending personality report demo for students.

It turns lightweight spending input into a playful "Cyber Wrapped" report: upload a monthly summary screenshot, add a few representative transactions, confirm the recognized data, and generate a shareable spending personality card.

Live demo: https://ai-budget-battle.vercel.app

GitHub repo: https://github.com/Yinzhi392/AI-Budget-Battle

## What This Demo Shows

- Low-friction spending input for students
- China mainland and study-abroad setup paths
- Monthly summary screenshots, representative screenshots, manual transactions, and category total hints
- Mock-first AI extraction and report generation
- Optional server-only OpenAI provider boundaries
- Confirmation table for exact rows and estimated category totals
- Cyber Wrapped result story flow
- Persona illustrations and animated result sections
- Xiaohongshu and WeChat-style share card editor
- Mock auth gates for save, history, repeated generation, and watermark removal
- Supabase schema and provider boundary for future durable persistence

## Product Positioning

This is not a banking dashboard or accounting tool. The MVP prioritizes participation, fun, and shareability over audit-level financial accuracy.

The current demo is designed to answer one product question:

> Will students enjoy confirming lightweight spending data and sharing an AI-generated spending personality report?

## Current Status

The hosted demo is mock-first by default:

- Persistence defaults to in-memory mock storage.
- Auth defaults to mock auth.
- AI extraction/report generation defaults to mock providers.
- Supabase and OpenAI support exist behind server-only provider switches, but are not required for local demo usage.

Because mock persistence is in-memory, hosted sessions may reset across Vercel Serverless instances. The upload flow includes a recovery bridge for setup-to-upload submissions, but true cross-device and long-term persistence requires enabling Supabase.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Motion
- Recharts
- Zod
- React Hook Form
- Supabase client/provider boundary
- OpenAI SDK provider boundary
- Vitest
- Playwright
- Vercel

## Project Structure

```text
app/                     Next.js routes and Server Actions
components/              Shared UI components and report/share-card views
lib/                     View models, utilities, persona mappings
server/                  Provider boundaries, validation, setup, reports, storage
types/                   Shared domain types
tests/                   Vitest unit tests
e2e/                     Playwright browser tests
supabase/                Migration and seed files
memory-bank/             Product, architecture, implementation, and progress notes
public/personas/         Persona character assets used by reports and share cards
```

## Getting Started

### Requirements

- Node.js 20 or newer
- pnpm 11.x

### Install

```bash
pnpm install
```

### Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

For the default local mock demo, no real Supabase or OpenAI keys are required.

Default provider settings:

```bash
PERSISTENCE_PROVIDER=mock
AUTH_PROVIDER=mock
AI_PROVIDER=mock
AI_REPORT_PROVIDER=mock
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run Locally

```bash
pnpm dev
```

Open http://localhost:3000.

## Useful Scripts

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
pnpm build
```

## Optional Real Providers

### OpenAI

Real AI providers are server-only and disabled by default.

```bash
AI_PROVIDER=openai
OPENAI_EXTRACTION_MODEL=your-extraction-model
AI_REPORT_PROVIDER=openai
OPENAI_REPORT_MODEL=your-report-model
OPENAI_API_KEY=your-server-side-key
```

Do not expose OpenAI keys through `NEXT_PUBLIC_*` variables.

### Supabase

Supabase is supported through a provider boundary and schema files:

```text
supabase/migrations/20260522140000_task14_core_schema.sql
supabase/seed.sql
```

To enable Supabase persistence/auth, configure the required Supabase environment variables and switch:

```bash
PERSISTENCE_PROVIDER=supabase
AUTH_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Privacy Notes

- Raw uploaded screenshots are treated as temporary analysis assets.
- Share cards and dashboards avoid exposing raw merchant details by default.
- Current hosted demo uses mock persistence, so it is best treated as a product demo rather than a production data store.
- Do not upload sensitive financial records to a public demo deployment.

## Development Notes

This repo keeps a `memory-bank/` folder with product decisions, architecture notes, implementation plans, and progress logs. It is intentionally included so reviewers can understand how the demo evolved and what is still mocked.

Before making product or architecture changes, read:

- `memory-bank/design-document.md`
- `memory-bank/tech-stack.md`
- `memory-bank/architecture.md`
- `memory-bank/progress.md`

## License

MIT License. See `LICENSE`.
