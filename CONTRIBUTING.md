# Contributing

Thanks for taking a look at AI Budget Battle.

This project is currently a demo-stage student spending personality report app. The most useful contributions are focused, easy to review, and aligned with the existing mock-first architecture.

## Local Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The default local flow uses mock providers, so Supabase and OpenAI keys are optional.

## Before Opening a Pull Request

Run the relevant checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run Playwright when changing user flows:

```bash
pnpm e2e
```

## Project Notes

- Keep user-facing copy Chinese-first unless the feature is explicitly developer-facing.
- Preserve the low-friction upload principle: users should not need complete daily bill screenshots.
- Do not expose raw merchant details in share-card or dashboard views by default.
- Keep OpenAI, Supabase, and auth behavior behind server-side provider boundaries.
- Update `memory-bank/progress.md` after project changes.
- Update `memory-bank/architecture.md` when file responsibilities, data flow, UI structure, or provider boundaries change.
