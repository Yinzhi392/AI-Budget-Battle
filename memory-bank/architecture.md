# Architecture

## Current State After Task 15

The repository contains the project documentation memory bank plus a baseline Next.js App Router application scaffold, the full Task 3 route skeleton, the Task 4 mock data/provider foundation, the Task 5 anonymous setup flow, the Task 6 low-friction upload/manual input flow, the Task 7 mock/real AI extraction boundary, the Task 8 confirmation table, the Task 9 mock/real AI report generation boundary, the Task 10 Cyber Wrapped result story flow, the Task 11 share-card export flow, the Task 12 mock auth gate, the Task 13 saved-report review layer, the Task 14 Supabase schema/provider boundary, and the Task 15 optional OpenAI provider enablement. Users can still run the completed local flow with mock providers by default, while Supabase persistence/auth and OpenAI extraction/report generation can be selected only through server-side environment configuration.

Product direction update: future upload and extraction work must prioritize low-friction participation over complete bill reconstruction. The system should support estimated consumer-personality analysis from a monthly summary screenshot, a few representative daily screenshots, category summaries, and optional manual additions.

中文架构约束：后续上传和 AI 抽取必须支持低摩擦输入、月度截图、消费分类、多来源对齐、数据合成、重复去重和估算置信度。

Implemented so far:

- Project documentation structure.
- Next.js App Router scaffold.
- TypeScript configuration.
- Tailwind CSS setup.
- shadcn/ui support configuration.
- pnpm dependency and workspace setup.
- Vitest unit test harness.
- Playwright browser smoke test harness.
- Vercel-ready configuration.
- Shared Cyber battle shell.
- Centralized route placeholder content.
- Planned route skeleton for landing, battle flow, auth, history, and dashboard pages.
- Cyber visual tokens and background treatment.
- Typed domain models for the core MVP entities.
- Zod schemas for transaction candidates and AI report output.
- Mock AI extraction and report generation provider.
- Server-only AI extraction provider selector with mock as the default provider.
- Optional OpenAI extraction provider boundary, disabled unless server-only environment variables are set, with schema validation, one repair retry, timeout handling, and recoverable fallback.
- Zod-validated extraction output with transaction candidates, aggregate candidates, warnings, source metadata, confidence, dedupe metadata, and overlap metadata.
- Mock persistence provider for local session/report/share-card state.
- Anonymous session cookie behavior wired to the mock persistence provider.
- Region/currency setup form with China mainland/CNY as the default.
- Period setup form for this week, this month, and custom period.
- Upload route guard that redirects missing setup to the earliest required step.
- Low-friction upload UI for monthly summaries, representative daily screenshots, category summaries, and single transaction screenshots.
- Manual transaction fallback with validation.
- Category-level total hints for estimated input when users do not want to enter individual transactions.
- Mock persistence support for uploaded screenshot metadata, manual transactions, and category total hints.
- Mock persistence support for validated extraction output.
- Mock persistence support for final confirmed aggregate rows.
- Interactive confirmation table for manual rows, AI transaction candidates, category total hints, and AI aggregate candidates.
- Confirmation validation for accepted exact transactions and accepted estimated aggregates.
- Server-only report provider selector with mock as the default provider.
- Optional OpenAI report provider boundary, disabled unless server-only environment variables are set, with schema validation, one repair retry, timeout handling, and recoverable fallback.
- Report safety layer for roast safety and benchmark wording constraints.
- Generating route that runs report generation with recoverable retry behavior.
- Cyber Wrapped result story flow for saved safe reports.
- Mobile-first story navigation with forward/backward movement, screen progress, high-contrast score presentation, and final share-preview CTA.
- Share-card templates for Xiaohongshu square, Xiaohongshu vertical, and WeChat Moments.
- Share-card export with a watermarked anonymous first export, mock persistence storage, and a login prompt for additional gated behavior.
- Share-card privacy view models that exclude raw merchant names and precise transaction detail.
- Mock auth provider with Email magic-link and Google OAuth sign-in methods.
- Server-only auth provider selector with mock as the default provider and Supabase Auth left as a recoverable unavailable boundary.
- Auth cookie helpers for mock user id, email, provider, and safe login continuation.
- Auth gate rules for save history, remove watermark, additional export, and repeated report generation.
- Anonymous-to-user linking in mock persistence.
- Login continuation UI for gated share and generation actions.
- Saved-report history for logged-in mock users.
- Lightweight dashboard with category breakdown, score explanations, confirmed input summary, risk notes, and screenshot retention status.
- Recharts category bar chart for simple readable dashboard support.
- Owner-scoped mock report deletion.
- Screenshot retention model with 24-hour maximum retention and no raw screenshot history retention.
- Generating-page Cyber Scan/progress animation.
- Result-story visual polish with animated personality character, behavior pulse cards, sharper safe roast copy, and a five-dimensional radar chart.
- Post-Task-15 UI polish for mobile layout stability, larger result insight cards, persona image assets, emoji-enhanced persona titles, share-card persona images, and a dashboard return-to-story link.
- Unit tests for schema validation, invalid payload rejection, mock provider outputs, and mock persistence flow.
- Unit and Playwright tests for Task 5 setup validation, refresh persistence, and invalid-step redirects.
- Unit and Playwright tests for Task 6 upload validation and fallback upload/manual flows.
- Unit and Playwright tests for Task 7/15 provider selection, extraction schema validation, category classification, summary aggregate extraction, overlap metadata, unavailable-provider fallback, failed-extraction manual fallback, server-only OpenAI key access, OpenAI repair retry, and OpenAI timeout fallback.
- Unit and Playwright tests for Task 8 confirmation validation, editing, deleting, adding, marker display, and confirmation flow.
- Unit and Playwright tests for Task 9/15 report provider selection, unavailable-provider fallback, report schema validation, OpenAI repair retry, OpenAI timeout fallback, roast safety, benchmark wording safety, and mock report generation.
- Unit and Playwright tests for Task 10 story-screen construction, screen rendering, mobile navigation, desktop navigation, and raw merchant privacy defaults.
- Unit and Playwright tests for Task 11 share-card templates, privacy defaults, report lookup, anonymous export gating, and browser share flow.
- Unit and Playwright tests for Task 12 auth provider selection, mock login, anonymous-to-user linking, auth gates, post-login continuation, and repeated-generation gating.
- Unit and Playwright tests for Task 13 dashboard aggregation, screenshot retention status, owner-scoped deletion, history, reopen, dashboard, and delete flows.
- Unit tests for Task 14 Supabase schema/RLS inspection, benchmark seed coverage, server-only config resolution, persistence provider fallback, and recoverable Supabase Auth configuration failure.
- Supabase migration and seed files for app tables, private storage buckets, RLS policies, and benchmark seed data.
- Server-only Supabase config, service client, Auth provider boundary, and PersistenceProvider implementation.
- Persistence selector that defaults to mock and only selects Supabase when `PERSISTENCE_PROVIDER=supabase` plus complete Supabase server config are present.

Not implemented yet:

- Applying the Supabase migration to a live remote Supabase project in this local session.
- Full Supabase Auth callback/session exchange UI beyond the current provider boundary and recoverable configuration behavior.
- Manual live OpenAI extraction/report verification with a real key and reachable provider in local or hosted environments.
- Vercel Analytics runtime events.
- Sentry initialization behavior.

## Source-of-Truth Documents

- `AGENTS.md`: repository operating rules for AI developers.
- `memory-bank/design-document.md`: product source of truth.
- `memory-bank/tech-stack.md`: technical source of truth.
- `memory-bank/implementation-plan.md`: task-by-task execution source of truth.
- `memory-bank/progress.md`: chronological work log and verification record.
- `memory-bank/architecture.md`: evolving architecture and file-responsibility record.

## Current File Responsibilities

### Project Guidance

- `AGENTS.md`: requires future agents to read `memory-bank/design-document.md` and `memory-bank/tech-stack.md` before code changes; requires `memory-bank/progress.md` updates after each task and `memory-bank/architecture.md` updates after each feature or milestone.
- `memory-bank/design-document.md`: defines the Cyber Wrapped Battle product, Chinese-first student audience, MVP scope, user flow, AI output contract, privacy model, share behavior, and excluded future features.
- `memory-bank/tech-stack.md`: defines the mock-first Next.js + Supabase + OpenAI-compatible provider + Vercel architecture, pnpm package manager, Vercel Analytics, Sentry, Vitest, and Playwright.
- `memory-bank/implementation-plan.md`: defines the execution order. It states Task 3 must not begin until Task 2 is verified.
- `memory-bank/progress.md`: records completed work, commands run, verification results, environment notes, blockers, and current waiting points.
- `memory-bank/architecture.md`: records architectural decisions, file responsibilities, provider boundaries, and implementation constraints.

### App Scaffold

- `package.json`: project manifest. Defines pnpm 11.1.3, scripts (`dev`, `build`, `start`, `lint`, `typecheck`, `test`, `e2e`), runtime dependencies, and dev dependencies.
- `pnpm-lock.yaml`: pnpm lockfile for reproducible installs.
- `pnpm-workspace.yaml`: single-package pnpm workspace configuration. Also allowlists required native build dependencies for the current toolchain.
- `tsconfig.json`: TypeScript configuration with strict mode and `@/*` path alias.
- `next.config.ts`: Next.js configuration placeholder generated by the scaffold.
- `postcss.config.mjs`: PostCSS configuration for Tailwind CSS v4.
- `eslint.config.mjs`: ESLint configuration using Next.js core web vitals and TypeScript presets.
- `.gitignore`: ignores dependencies, build outputs, test outputs, env files, and generated TypeScript build info.
- `.env.example`: environment variable template for Supabase, server-only persistence/auth provider selection, AI providers, Sentry, and app URL configuration.
- `vercel.json`: Vercel-ready install/build configuration. Real deployment is deferred until the core local flow works.
- `supabase/migrations/20260522140000_task14_core_schema.sql`: Task 14 schema migration for app tables, private storage buckets, RLS, service-role policies, user-owned saved-report read policies, and benchmark read access.
- `supabase/seed.sql`: Task 14 seed data for China mainland CNY and broad study-abroad benchmark profiles.

### App Runtime Files

- `app/layout.tsx`: root HTML layout and metadata for the baseline app. It deliberately avoids external Google font fetching so local builds remain stable.
- `app/page.tsx`: landing route skeleton. It renders `BattleShell` with `routePages.landing`; the primary CTA now enters `/battle/start`.
- `app/battle/start/route.ts`: route handler that creates or reuses the anonymous session cookie, creates a mock anonymous session record when needed, and redirects to `/battle/region-currency`.
- `app/battle/actions.ts`: Server Actions for saving region/currency setup and period setup into cookies plus mock persistence.
- `app/battle/region-currency/page.tsx`: region/currency route using `routePages.regionCurrency` plus the Task 5 setup form. It defaults to China mainland student/CNY and supports a study-abroad path with country/region and currency selectors.
- `app/battle/region-currency/region-currency-form.tsx`: client-side setup form for the two student paths. It only exposes China mainland student and study-abroad student as top-level choices; study-abroad users then choose country/region and currency.
- `app/battle/period/page.tsx`: analysis-period route using `routePages.period` plus a lightweight period form. It requires region/currency setup before rendering.
- `app/battle/upload/page.tsx`: upload/manual-input route using `routePages.upload`. It guards against missing setup, shows a compact setup summary, renders the Task 6 upload/manual fallback form, and displays the recoverable extraction-failure prompt when screenshot-only extraction fails.
- `app/battle/upload/upload-form.tsx`: client-side upload/manual input form. It prefers quick monthly summary screenshots, supports representative screenshots, manual transaction rows, category-level estimated totals, client-side validation errors, and estimated-analysis copy.
- `app/battle/upload/actions.ts`: Server Action for saving upload inputs. It stores screenshot metadata, manual transactions, and category total hints in mock persistence, runs the Task 7 extraction boundary, stores valid extraction output, redirects to `/battle/confirm` when there is manual/category/extracted input, and redirects back to upload with a recoverable prompt when screenshot-only extraction fails.
- `app/battle/confirm/page.tsx`: interactive confirmation route using `routePages.confirm`. It requires completed setup, loads the current mock analysis snapshot, builds editable rows from manual transactions, extraction transaction candidates, upload-time category total hints, and extraction aggregate candidates, and renders the Task 8 confirmation table without developer-facing skeleton chrome.
- `app/battle/confirm/confirmation-form.tsx`: client-side confirmation table. It supports editing exact transactions and estimated aggregates, deleting rows, accepting/rejecting rows, adding missing transaction rows, adding estimated aggregate rows, and showing confidence/source/estimated/duplicate/overlap markers before final confirmation.
- `app/battle/confirm/actions.ts`: Server Action for final confirmation. It validates submitted rows, saves only accepted exact transactions and accepted estimated aggregates, and redirects to `/battle/generating`.
- `app/battle/generating/page.tsx`: report generation route using `routePages.generating`. It requires completed setup and confirmed input, redirects missing prerequisites to setup/confirmation, redirects existing reports to the result route, and renders the retryable Task 9 generation form.
- `app/battle/generating/generate-report-form.tsx`: client-side retry form for report generation. It explains that only confirmed rows are used, shows recoverable errors from the provider boundary, and renders the Task 11 Cyber Scan/progress animation.
- `app/battle/generating/actions.ts`: Server Action that runs the report provider boundary, saves only safe schema-valid reports, and redirects to `/battle/result/[analysisSessionId]`.
- `app/battle/result/[sessionId]/page.tsx`: dynamic report result route using `routePages.result`. It reads the saved safe report from mock persistence by analysis session id, renders the Task 10/11/13 Cyber Wrapped story flow, and shows a recoverable missing-report state when no report is available.
- `app/battle/share/[reportId]/page.tsx`: dynamic share editor route. It reads the saved safe report by report id, builds privacy-safe share-card templates, reads current mock auth cookies, renders the Task 11/12 share-card studio, and shows a recoverable missing-report state when local mock state is absent.
- `app/battle/share/[reportId]/actions.ts`: Server Actions for saving an anonymous watermarked share-card export, saving a logged-in user share-card export, saving the report to mock history metadata, and returning Task 12 login-required states for gated actions.
- `app/auth/page.tsx`: implemented Task 12 auth-gate route. It hides developer-facing skeleton chrome, renders login state when already authenticated, and otherwise renders the mock auth form.
- `app/auth/auth-form.tsx`: client-side Task 12 auth form for Email magic-link and Google OAuth mock sign-in.
- `app/auth/actions.ts`: Server Action for auth provider sign-in, auth cookie writes, anonymous-to-user linking, and `returnTo` continuation.
- `app/history/page.tsx`: implemented Task 13 history route. It requires mock login, lists the current user's saved reports, and provides reopen, dashboard, share, and delete actions without showing raw screenshots.
- `app/history/actions.ts`: Server Action for owner-scoped saved-report deletion.
- `app/dashboard/page.tsx`: implemented Task 13 lightweight dashboard route. It requires mock login, loads a saved report by `sessionId`, renders category breakdown, score explanations, confirmed input summary, risk notes, and screenshot retention status, and provides a `返回战报` link back to the matching story report.
- `app/dashboard/dashboard-panel.tsx`: client-side dashboard presentation component with a simple Recharts bar chart and non-dense Cyber support panels.
- `app/globals.css`: Tailwind CSS entrypoint, Cyber color tokens, Chinese-friendly font stack, scanline effect, and grid background treatment.
- `app/favicon.ico`: default scaffold favicon.
- `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`: default Next.js public assets. These are scaffold artifacts, not product assets.

### UI Utilities

- `components.json`: shadcn/ui configuration. It sets TypeScript, React Server Components, neutral base color, Tailwind CSS entrypoint, aliases, and Lucide icon library.
- `components/battle-shell.tsx`: shared route skeleton shell. It owns product identity, battle flow navigation, optional placeholder status badge, optional primary/secondary CTAs, optional highlight chips, optional right-side route panels, and route-specific children for setup/upload forms. Post-Task-15 mobile polish keeps the shell constrained on small screens and keeps the flow nav horizontally scrollable.
- `components/result-story-flow.tsx`: client-side Task 10/11/13 story experience. It renders story progress, jump controls, forward/backward navigation, high-contrast story cards, persona image assets, emoji-enhanced personality titles, behavior pulse cards, animated score bars, the five-dimensional radar chart with visible vertex labels, larger analysis insight cards, the final dashboard CTA, and the final share-card CTA without exposing raw merchant details.
- `components/share-card-studio.tsx`: client-side Task 11/12 share-card editor. It renders template selection, responsive card previews, persona-first character imagery on a pure black card background, cyan/green edge glow, height-based character scaling, soft radial image isolation, masked image-edge blending, a 40%-50% character emphasis zone balanced against bottom content, a single highlight block, fixed two-column period/challenge tags, local export status, `html-to-image` export, current login email, login continuation link, and save/remove-watermark actions. The visible DOM preview remains the source for exported images, but it no longer renders a separate watermark row because the export/auth model already tracks watermark state and the extra visible text conflicted with the period/date tag row.
- `lib/route-content.ts`: centralized copy and route metadata for all Task 3 placeholder pages. It also defines the battle flow navigation links.
- `lib/report-story.ts`: pure Task 10/11 story builder that converts an `AiReport` into the eight Cyber Wrapped story screens used by the result UI, including score radar point data. The benchmark and risk screens keep general context in the body and concrete observations/warnings in bullets so the same insight is not repeated twice.
- `lib/share-card.ts`: pure Task 11 share-card builder that converts a saved safe report into privacy-safe share-card view models, persona display titles/images, formatted period labels, highlight copy, challenge tags, and watermark copy for card composition.
- `lib/dashboard-summary.ts`: pure Task 13 dashboard summary builder. It aggregates confirmed exact and estimated input by category, builds score explanations and risk notes, and intentionally excludes raw merchant detail from dashboard summary output.
- `lib/utils.ts`: shared `cn` utility built from `clsx` and `tailwind-merge`; intended for future shadcn/ui components.

### Domain, Schemas, And Providers

- `types/domain.ts`: shared TypeScript domain models for student region path, global currency code, optional study-abroad country/region, categories, upload source types, extraction source platforms, extraction transaction candidates, extraction aggregate candidates, stored extraction outputs, anonymous sessions, mock auth users, analysis sessions, uploaded image metadata, category total hints, transaction candidates, confirmed transaction items, confirmed aggregate items, AI reports, share cards, benchmark profiles, and analysis snapshots.
- `server/ai/schemas.ts`: Zod validation boundary for transaction candidates, extraction output payloads, aggregate candidates, and AI report payloads. Provider output must validate here before later UI or persistence layers trust it.
- `server/auth/gates.ts`: pure Task 12 auth-gate rules for repeated report generation, additional exports, watermark removal, and save-history actions.
- `server/auth/session.ts`: Task 12 auth cookie names, mock auth cookie reads/writes, and safe `returnTo` sanitization.
- `server/providers/types.ts`: provider interfaces for AI extraction/report generation, auth, and persistence. The extraction method intentionally returns `unknown` so selectors can reject invalid provider output with Zod before persistence. Persistence now includes report lookup by report id, anonymous-to-user linking, generated-report counting, save-to-history metadata, saved-report listing, saved-report lookup, and owner-scoped report deletion.
- `server/providers/ai-provider.ts`: server-only extraction selector and runner. It defaults to mock, enables OpenAI only with `AI_PROVIDER=openai` plus `OPENAI_API_KEY` and `OPENAI_EXTRACTION_MODEL`, injects `OPENAI_REQUEST_TIMEOUT_MS`, and returns recoverable failures for unavailable providers, thrown errors, network failures, timeouts, or invalid output.
- `server/providers/openai-json.ts`: shared Task 15 server-only OpenAI JSON helper. It wraps Responses API calls, applies `OPENAI_REQUEST_TIMEOUT_MS`, parses JSON, validates with a Zod schema, and retries one schema-invalid or JSON-invalid output with stricter repair instructions.
- `server/providers/openai-extraction.ts`: optional server-only OpenAI extraction implementation. It is disabled by default, validates model output through the extraction schema before returning candidates, retries invalid structured output once, and keeps summary screenshots as aggregate candidates rather than fake transactions.
- `server/providers/report-provider.ts`: server-only report selector and runner. It defaults to mock, enables OpenAI only with `AI_REPORT_PROVIDER=openai` plus `OPENAI_API_KEY` and `OPENAI_REPORT_MODEL`, injects `OPENAI_REQUEST_TIMEOUT_MS`, validates output through schema and safety checks, and returns recoverable failures for unavailable providers, invalid structure, unsafe roast output, forbidden benchmark wording, or timeouts.
- `server/providers/openai-report.ts`: optional server-only OpenAI report implementation. It is disabled by default, sends confirmed transactions and confirmed aggregates only, validates model JSON through the shared report schema, and retries invalid structured output once before the local safety layer runs.
- `server/providers/auth-provider.ts`: server-only auth selector. It defaults to mock auth and selects Supabase Auth only when `AUTH_PROVIDER=supabase` and complete Supabase server config are present.
- `server/providers/supabase-auth.ts`: Task 14 Supabase Auth boundary for Email magic-link and Google OAuth provider selection. Missing or failing Supabase config returns a recoverable `auth_unavailable` result.
- `server/providers/mock-auth.ts`: default local mock auth provider for Email magic-link and Google OAuth sign-in. It accepts common email providers and returns deterministic mock user ids.
- `server/providers/mock-ai.ts`: default local mock AI provider. It returns validated extraction output with transaction candidates, aggregate candidates, source metadata, overlap/dedupe metadata, Chinese merchant classification such as `一点点` to `milk_tea`, and complete Cyber Wrapped report payloads generated from confirmed transactions plus accepted aggregate rows. Mock report roast copy is sharper after Task 11 while still passing the safety layer.
- `server/providers/mock-persistence.ts`: in-memory mock persistence provider. It stores mock auth users, anonymous sessions, analysis sessions, uploaded image metadata, validated extraction output, upload-time category total hints, confirmed transactions, confirmed aggregate rows, generated reports, report-id snapshot lookups, one anonymous watermarked share card per report, logged-in user share cards, saved-report listing, and owner-scoped deletion. Saving new confirmed transactions or confirmed aggregate rows invalidates stale generated reports and share cards for the same analysis session.
- `server/providers/supabase-persistence.ts`: Task 14 Supabase implementation of the existing `PersistenceProvider` interface. It maps the current domain objects to Supabase tables while preserving mock-compatible method contracts, including stale report/share-card invalidation when final confirmed input changes.
- `server/providers/persistence-provider.ts`: server-only persistence selector. It defaults to mock, falls back to mock when Supabase is selected without complete server config, and creates Supabase persistence only when `PERSISTENCE_PROVIDER=supabase` is fully configured.
- `server/providers/mock-singleton.ts`: backward-compatible export name for existing Task 5-13 call sites. It now resolves through the Task 14 persistence selector rather than always constructing mock persistence directly.
- `server/supabase/config.ts`: resolves server-side Supabase configuration and requires `SUPABASE_SERVICE_ROLE_KEY` before enabling server persistence/auth operations.
- `server/supabase/client.ts`: creates a Supabase service-role client with browser session persistence disabled.
- `server/setup/validation.ts`: pure setup validation for supported region/currency choices, period range resolution, custom-period bounds, and anonymous report allowance.
- `lib/world-options.ts`: global country/region and currency option helpers. Country/region options use a built-in ISO-style region code list rendered through `Intl.DisplayNames`; currency options use `Intl.supportedValuesOf("currency")` when available.
- `server/setup/session.ts`: cookie names, anonymous session cookie creation, setup cookie reads/writes, and redirect target calculation for guarded setup routes.
- `server/upload/validation.ts`: pure Task 6 validation for manual transactions, category-total hints, screenshot metadata, upload source types, and region-aware category options.
- `server/storage/retention.ts`: pure Task 13 retention model. It marks screenshots as temporary, deletable after analysis, or expired, enforces a 24-hour maximum retention window, and records that raw screenshots are not retained as historical assets.
- `server/confirm/validation.ts`: pure Task 8 validation for accepted confirmation rows. It converts accepted transaction rows into `SaveConfirmedTransactionInput`, accepted aggregate rows into `SaveConfirmedAggregateInput`, rejects incomplete accepted rows, ignores rejected rows, and computes user-facing markers for estimated, low-confidence, duplicate, overlap, and source-type states.
- `server/reports/safety.ts`: pure Task 9 report safety layer. It validates AI report shape, blocks unsafe roast output, and rejects benchmark wording that claims real rankings, real percentiles, `全校` ranking, or percentile-style claims.
- `server/reports/staleness.ts`: pure defensive guard that compares the currently confirmed input against an existing report personality. `/battle/generating` only reuses an existing report when this guard confirms it still matches the current final input.

Task 10 boundary: report generation consumes only final `confirmedTransactions` and `confirmedAggregates`, never raw extraction candidates or upload-time hints. The result page renders only the saved safe report story, not raw merchant details or dense transaction tables.

### Test Harness

- `vitest.config.ts`: Vitest configuration using jsdom and `tests/**/*.test.ts(x)` patterns.
- `tests/smoke.test.ts`: minimal unit smoke test that verifies the unit test harness runs.
- `tests/task4-mock-providers.test.ts`: Task 4 unit coverage for Zod schemas, invalid payload rejection, mock AI provider outputs, and mock persistence state flow.
- `tests/task5-setup-flow.test.ts`: Task 5 unit coverage for region/currency validation, quick/custom period calculation, and anonymous one-report allowance validation.
- `tests/task6-upload-validation.test.ts`: Task 6 unit coverage for manual transaction validation, category-total validation, screenshot metadata validation, and default China mainland category options.
- `tests/task7-ai-extraction-boundary.test.ts`: Task 7 unit coverage for provider selection, OpenAI unavailable fallback, Zod validation, Chinese merchant/category classification, summary aggregate extraction, mixed-source overlap metadata, and invalid-output rejection.
- `tests/task8-confirmation-validation.test.ts`: Task 8 unit coverage for transaction row validation, aggregate row validation, rejected-row handling, duplicate/overlap/confidence badges, and confirmed aggregate persistence.
- `tests/task9-report-generation-boundary.test.ts`: Task 9 unit coverage for report provider selection, OpenAI unavailable fallback, schema validation, unsafe roast blocking, benchmark wording rejection, and mock report generation from confirmed exact and aggregate inputs.
- `tests/task10-result-story.test.tsx`: Task 10 unit coverage for building the eight story screens and rendering each story card without raw merchant detail.
- `tests/task11-share-card.test.tsx`: Task 11 unit coverage for share-card template construction, raw merchant privacy defaults, report-id snapshot lookup, and anonymous watermarked export gating.
- `tests/task12-auth-boundary.test.ts`: Task 12 unit coverage for mock email login, auth provider selection, Supabase unavailable fallback, anonymous-to-user linking, repeated-report gates, and share-upgrade gates.
- `tests/task13-history-dashboard.test.ts`: Task 13 unit coverage for dashboard aggregation, raw merchant privacy defaults, screenshot retention status, saved-report listing, owner-scoped deletion, and forbidden delete attempts.
- `playwright.config.ts`: Playwright configuration that starts `./node_modules/.bin/next dev` and tests against `http://localhost:3000`.
- `e2e/smoke.spec.ts`: minimal Chromium smoke test verifying the root page title and heading.
- `e2e/route-skeleton.spec.ts`: Task 3 Chromium route coverage. Protected Task 5 setup routes are reached through the required setup flow before asserting the expected heading plus `功能骨架` placeholder copy.
- `e2e/setup-flow.spec.ts`: Task 5 Chromium coverage for anonymous setup, refresh persistence, upload guard redirect, and period guard redirect.
- `e2e/upload-flow.spec.ts`: Task 6 and Task 7 Chromium coverage for monthly-summary upload, manual-only fallback, invalid manual-entry errors, category-total estimated fallback, and extraction-failure manual fallback.
- `e2e/confirm-flow.spec.ts`: Task 8 Chromium coverage for correcting a low-confidence extracted row, deleting extracted rows, adding an estimated aggregate, and confirming valid data.
- `e2e/report-generation.spec.ts`: Task 9 Chromium coverage for generating a safe mock report from confirmed rows and continuing to the result route.
- `e2e/story-flow.spec.ts`: Task 10/11 Chromium coverage for mobile and desktop Cyber Wrapped story navigation, behavior animation content, and radar chart rendering after a generated report.
- `e2e/share-card.spec.ts`: Task 11 Chromium coverage for the full generated-report-to-share-card flow, three share templates, watermark copy, privacy defaults, export success, and anonymous login gating.
- `e2e/auth-gate.spec.ts`: Task 12 Chromium coverage for gated share actions, mock login continuation, post-login save/remove-watermark behavior, and anonymous repeated-report generation blocking.
- `e2e/history-dashboard.spec.ts`: Task 13 Chromium coverage for saving a report, viewing history, opening the lightweight dashboard, reopening the story report, and deleting the saved report.

### Generated/Local Artifacts

- `node_modules/`: local dependency install; ignored by git.
- `.next/`: Next.js dev/build output; ignored by git.
- `tsconfig.tsbuildinfo`: TypeScript incremental build info; ignored by git.
- `test-results/`: Playwright run output; ignored by git.
- `playwright-report/`: Playwright HTML report output; ignored by git.
- `.DS_Store`: macOS metadata file; ignored by git.

## Architectural Decisions Locked So Far

- Package manager is pnpm, not npm, yarn, or bun.
- Next.js App Router is the app framework.
- TypeScript strict mode is enabled.
- Tailwind CSS v4 is the styling foundation.
- shadcn/ui support is configured, but no UI components have been generated yet.
- Motion is the animation dependency, matching the tech-stack decision to use Framer Motion or Motion.
- Vercel Analytics is the MVP analytics choice; no second analytics product is part of MVP.
- Sentry is installed, but runtime initialization is intentionally deferred to a later task.
- Supabase packages are installed, but no Supabase client, schema, storage, auth, or RLS behavior exists yet.
- OpenAI SDK is installed and isolated behind the server-only extraction provider boundary. It is not enabled by default and no API key is exposed to the browser.
- Mock-first provider boundaries exist for persistence, auth, and AI. Task 5 wires anonymous and analysis session creation to mock persistence. Task 6 wires upload metadata, manual transactions, and category total hints to mock persistence. Task 7 wires screenshot metadata through the extraction provider boundary and saves valid extraction output. Task 8 wires confirmation UI and final confirmation persistence. Task 9 wires report generation. Task 10 wires the saved report into the result story. Task 11 wires the saved safe report into privacy-safe share-card templates and anonymous watermarked export. Task 12 wires mock auth, auth cookies, anonymous-to-user linking, and login gates. Task 13 wires saved history, lightweight dashboard summaries, owner-scoped deletion, and screenshot retention status into mock persistence.
- `AI_PROVIDER` is the server-only extraction provider switch. `NEXT_PUBLIC_AI_PROVIDER` is intentionally not used as the source of truth for provider selection.
- `AI_PROVIDER=mock` or an unset provider uses the mock extraction provider.
- `AI_PROVIDER=openai` only enables the OpenAI extraction provider when server-only `OPENAI_API_KEY` and `OPENAI_EXTRACTION_MODEL` are both present.
- `NEXT_PUBLIC_OPENAI_API_KEY` is intentionally ignored. OpenAI credentials must never be used as client-readable environment variables.
- `OPENAI_REQUEST_TIMEOUT_MS` controls both extraction and report provider timeouts. Invalid, too-small, too-large, or missing values fall back to 20 seconds.
- OpenAI missing configuration, blocked network access, thrown provider errors, timeouts, and invalid provider JSON all return recoverable extraction failures. They must not throw through to the upload UI.
- `AI_REPORT_PROVIDER` is the server-only report provider switch. `NEXT_PUBLIC_*` variables are not used for report provider selection.
- `AI_REPORT_PROVIDER=mock` or an unset provider uses the mock report provider.
- `AI_REPORT_PROVIDER=openai` only enables the OpenAI report provider when server-only `OPENAI_API_KEY` and `OPENAI_REPORT_MODEL` are both present.
- OpenAI extraction and report providers retry invalid structured output once with stricter repair instructions before returning recoverable failure.
- Report provider failures are recoverable and retryable on `/battle/generating`.
- Report generation saves only schema-valid output that passes local roast safety and benchmark wording checks.
- Result story rendering reads only the saved safe report from persistence; it does not re-run AI or read raw transaction candidates.
- The Task 10 story sequence is fixed at eight screens: personality reveal, spending behavior, roast, battle scores, benchmark comparison, risk prediction, challenge tag, and share preview.
- Result story navigation is client-side and mobile-first with forward/backward buttons plus direct screen progress controls.
- Result story privacy default: do not render raw merchant names or precise transaction details in the story flow.
- Task 11 share cards are built from saved safe report fields, not raw transactions or extraction candidates.
- Task 11 share cards support three templates: `xiaohongshu_square`, `xiaohongshu_vertical`, and `wechat_moments`.
- Share-card export is client-side via `html-to-image`; local tests can use a mock export URL fallback when browser image generation APIs are unavailable.
- Anonymous users can export one watermarked share card per report. Saving additional cards, removing the watermark, save-history metadata, and repeated report generation now require Task 12 mock login.
- Task 12 auth methods are Email magic-link and Google OAuth only. Verification-code login is explicitly outside MVP.
- `AUTH_PROVIDER` is the server-only auth provider switch. Unset or `mock` uses local mock auth; `supabase` uses the Supabase Auth boundary only when complete Supabase server config is present.
- `PERSISTENCE_PROVIDER` is the server-only persistence provider switch. Unset or `mock` uses local mock persistence; `supabase` uses Supabase persistence only when complete Supabase server config is present.
- `NEXT_PUBLIC_PERSISTENCE_PROVIDER` is intentionally not used as a persistence source of truth. Persistence provider selection must stay server-side.
- Supabase service-role access is isolated to server modules and requires `SUPABASE_SERVICE_ROLE_KEY`; no service-role key is exposed to browser code.
- The Task 14 Supabase migration creates private `temporary-uploads` and `share-cards` storage buckets.
- Task 14 RLS policy intent: service-role server operations can manage app tables; authenticated users can read only their own saved report sessions/reports; benchmark profiles are readable for authenticated users.
- Task 14 benchmark seed data covers China mainland CNY and broad study-abroad profiles. It remains preset benchmark data, not real rankings.
- Mock report personality selection is category-driven. The report provider sums confirmed exact transactions and accepted estimated aggregates, chooses a single-category persona when one category is at least half of the confirmed amount, and otherwise evaluates combination personas.
- Current single-category persona mapping: milk tea -> `奶茶黑洞人格`, food delivery -> `外卖依赖人格`, gaming -> `游戏氪金战神人格`, online shopping -> `网购拆箱成瘾人格`, transport -> `出门即打车人格`, social meals -> `社交燃烧人格`, study supplies -> `卷王燃烧人格`, subscriptions -> `焦虑奋斗人格`, campus cafeteria/other -> `生存模式人格`.
- Current combination persona mapping: online shopping + social meals + subscriptions -> `假精致人格`; study supplies + subscriptions + transport -> `焦虑奋斗人格`; campus cafeteria + transport + other -> `生存模式人格`.
- Confirmed input changes are report-invalidating events. Mock and Supabase persistence delete stale report/share-card records for the same analysis session when confirmed transactions or accepted aggregate rows are replaced.
- `/battle/generating` must not blindly redirect to any existing report for an analysis session. It can reuse a report only when the status is reusable and `server/reports/staleness.ts` confirms the saved report personality still matches the current confirmed input.
- Replacing a stale report in the same analysis session does not count as anonymous repeated report generation; it is a correction of the current report input.
- Auth session state is stored in HTTP-only cookies named `abb_user_id`, `abb_user_email`, and `abb_auth_provider`.
- Successful mock login links the current `abb_anonymous_session` to the mock user and marks generated linked reports as saved in mock persistence.
- Logged-in users can continue from gated share actions through `/auth?returnTo=...` and return to the share page after login.
- Logged-in users can view only their own saved reports in `/history`.
- Logged-in users can reopen a saved report, open its lightweight dashboard, share it again, or delete it.
- Report deletion is owner-scoped. A user cannot delete another user's saved report.
- `/dashboard` is a support view after the story report, not a dense banking dashboard. It shows category bars, score explanations, confirmed input summary, risk notes, and screenshot retention status.
- Dashboard summaries are based on confirmed transactions and accepted estimated aggregates. Raw merchant names are not rendered by default.
- Raw screenshots are temporary analysis assets. They are never retained as historical assets, are deletable after analysis, and expire after at most 24 hours in the mock retention model.
- Current Task 11 personality character and radar visuals are in-app generated visual components; there is not yet a persisted external image-asset pipeline.
- Missing report data on `/battle/result/[sessionId]` is a recoverable UI state, not a crash.
- Report benchmark text must use benchmark language and must not claim real rankings, real school-wide rankings, or real percentiles.
- Report roast text must avoid poverty shaming, identity attacks, body/gender/school-tier insults, and medical/legal/tax/investment/lending advice.
- China access risk is handled at the provider boundary: users only interact with the app server, and OpenAI-compatible alternatives can later replace the server-side provider without changing upload UI flows.
- The app is Vercel-ready through `vercel.json`, but no real deployment has been performed.
- Most route pages remain placeholder-only. The Task 5 setup routes are the exception: `/battle/start` creates anonymous session state, `/battle/region-currency` stores region/currency setup, `/battle/period` stores period setup and creates an analysis session, and `/battle/upload` guards missing setup.
- Anonymous setup state is stored in HTTP-only cookies named `abb_anonymous_session`, `abb_region`, `abb_currency`, `abb_period_type`, `abb_period_start`, `abb_period_end`, and `abb_analysis_session`.
- Task 5 setup cookies are local browser state. They survive refresh but are not intended to provide cross-browser tracking.
- Student setup has two top-level region paths only: `cn_mainland` and `study_abroad`.
- Study-abroad setup stores the selected country/region in `abb_country_region` and a global three-letter currency code in `abb_currency`.
- Upload access requires region, currency, period, and analysis session setup. Missing setup redirects to `/battle/region-currency` or `/battle/period`.
- Upload source types are `monthly_summary`, `representative_daily`, `category_summary`, and `single_transaction`.
- The upload UI must not ask users to upload every daily bill screenshot. Monthly analysis screenshots and category summaries are first-class low-friction inputs.
- Manual transactions are saved as manual confirmed transaction inputs for the current mock flow so users can continue even if extraction is unavailable.
- Category total hints are stored separately from transactions with `isEstimate: true` and confidence metadata; they must not be presented later as exact transaction rows.
- Upload-time category total hints are not final report input until the user accepts them in the confirmation table.
- Confirmed aggregate rows are stored separately from upload-time hints in `confirmedAggregates`.
- Final report input for Task 9 should use only `confirmedTransactions` and `confirmedAggregates`.
- Confirmation saves only accepted rows. Deleted or rejected rows are excluded from final report input.
- Accepted exact transaction rows require amount, currency, category, and transaction time.
- Accepted aggregate rows require amount, currency, category, and period label.
- Confirmation UI must keep exact transactions visually distinct from estimated aggregate rows.
- Low confidence, possible duplicate, possible overlap, estimated-data, and source-type markers are visible in confirmation before the user confirms.
- Extraction output has three top-level fields: `transactionCandidates`, `aggregateCandidates`, and `warnings`.
- Transaction extraction candidates represent possible exact transactions and must carry `isEstimate: false`.
- Aggregate extraction candidates represent category or period summaries from monthly/category screenshots and must carry `isEstimate: true`.
- Summary screenshot aggregate candidates must not be converted into fake transaction rows.
- Mixed-source extraction uses `dedupeKey`, `overlapGroupId`, `possibleDuplicate`, and `possibleOverlap` metadata to warn downstream UI about likely duplicate or overlapping data.
- If extraction fails and the user already entered manual transactions or category-total hints, the upload flow can continue to confirmation.
- If extraction fails and screenshots are the only input, the upload flow stays on `/battle/upload` and prompts the user to add manual transactions or category totals.
- Interactive setup/upload pages hide developer-facing shell status, skeleton hints, sidebar panels, and placeholder shortcut CTAs.
- Cyber visual direction uses a matte black base, charcoal surfaces, neon green, electric blue, warm orange, high-contrast text, scanline texture, and grid background.
- The battle flow nav is horizontally scrollable on mobile to avoid page-level horizontal overflow.
- AI provider outputs must validate through `server/ai/schemas.ts` before consumers use them.
- Mock persistence is in-memory and local-test oriented. It is compatible with the later Supabase boundary but does not survive process restarts.
- Mock persistence enforces the first anonymous share-card rule at the provider layer by allowing one anonymous watermarked share card per report before login.
- Mock persistence counts generated reports per anonymous session so report generation can enforce the one-anonymous-report rule before login.
- Playwright runs with `workers: 1` because the current process-level mock persistence is intentionally simple and not parallel-safe for full e2e stateful flows.
- Transaction and report schemas use benchmark language fields; mock report copy avoids real-ranking or percentile claims.
- Low-friction upload is now a product constraint: do not design future upload flows around complete daily screenshot collection.
- AI/OCR extraction is expected to classify merchant or note text into categories, for example mapping "一点点 10 元" to milk tea.
- Future AI provider outputs should support two result families: transaction candidates and category or period aggregate candidates.
- Future synthesis logic must preserve source type, source platform, confidence, possible duplicate or overlap status, and whether data came from an estimated summary.
- Mixed-source analysis must avoid blindly summing monthly summaries and daily transaction details. When sources overlap, the confirmation UI should expose uncertainty instead of presenting estimated data as exact transactions.

## Verification Coverage

Task 4 verification passed with:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test tests/task4-mock-providers.test.ts`

Task 5 verification passed with:

- `./node_modules/.bin/eslint`
- `./node_modules/.bin/tsc --noEmit`
- `./node_modules/.bin/vitest run`
- `./node_modules/.bin/vitest run tests/task5-setup-flow.test.ts`
- elevated `./node_modules/.bin/playwright test e2e/setup-flow.spec.ts e2e/route-skeleton.spec.ts`
- elevated `pnpm e2e`

Task 6 verification passed with:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test tests/task6-upload-validation.test.ts`
- elevated `pnpm exec playwright test e2e/upload-flow.spec.ts`
- elevated `pnpm exec playwright test e2e/upload-flow.spec.ts e2e/route-skeleton.spec.ts`
- elevated `pnpm e2e`

Task 7 verification passed with:

- `pnpm lint`
- `pnpm typecheck`
- elevated `pnpm build`
- `pnpm test`
- `pnpm test tests/task7-ai-extraction-boundary.test.ts`
- elevated `pnpm exec playwright test e2e/upload-flow.spec.ts`
- elevated `pnpm e2e`

Task 8 verification passed with:

- `pnpm lint`
- elevated `pnpm typecheck`
- elevated `pnpm build`
- `pnpm test`
- `pnpm test tests/task8-confirmation-validation.test.ts`
- elevated `pnpm exec playwright test e2e/confirm-flow.spec.ts`
- elevated `pnpm e2e`

Task 9 verification passed with:

- `pnpm lint`
- elevated `pnpm typecheck`
- elevated `pnpm build`
- `pnpm test`
- `pnpm test tests/task9-report-generation-boundary.test.ts`
- elevated `pnpm exec playwright test e2e/report-generation.spec.ts`
- elevated `pnpm e2e`

Task 10 verification passed with:

- `pnpm lint`
- elevated `pnpm typecheck`
- elevated `pnpm build`
- `pnpm test`
- `pnpm test tests/task10-result-story.test.tsx`
- elevated `pnpm exec playwright test e2e/story-flow.spec.ts`
- elevated `pnpm e2e`

Task 11 verification passed with:

- `pnpm lint`
- elevated `pnpm typecheck`
- elevated `pnpm build`
- `pnpm test`
- `pnpm test tests/task11-share-card.test.tsx`
- `pnpm test tests/task4-mock-providers.test.ts tests/task11-share-card.test.tsx`
- elevated `pnpm exec playwright test e2e/share-card.spec.ts`
- elevated `pnpm exec playwright test e2e/report-generation.spec.ts e2e/story-flow.spec.ts e2e/share-card.spec.ts`
- elevated `pnpm e2e`
- `git diff --check`

Task 12 verification passed with:

- `pnpm test tests/task12-auth-boundary.test.ts`
- elevated `pnpm exec playwright test e2e/auth-gate.spec.ts`
- `pnpm lint`
- elevated `pnpm typecheck`
- `pnpm test`
- elevated `pnpm build`
- elevated `pnpm exec playwright test e2e/route-skeleton.spec.ts e2e/auth-gate.spec.ts`
- elevated `pnpm e2e`
- `git diff --check`

Task 13 verification passed with:

- `pnpm test tests/task13-history-dashboard.test.ts`
- `pnpm test tests/task10-result-story.test.tsx tests/task13-history-dashboard.test.ts`
- elevated `pnpm exec playwright test e2e/history-dashboard.spec.ts`
- elevated `pnpm exec playwright test e2e/route-skeleton.spec.ts e2e/history-dashboard.spec.ts`
- `pnpm lint`
- elevated `pnpm typecheck`
- `pnpm test`
- elevated `pnpm build`
- elevated `pnpm e2e`

Task 14 verification passed with:

- `pnpm exec vitest run tests/task14-supabase-boundary.test.ts`
- `pnpm test`
- `pnpm lint`
- elevated `pnpm typecheck`
- elevated `pnpm build`
- elevated `pnpm e2e`
- `rg -n "create table|enable row level security|temporary-uploads|share-cards|service_role|auth.uid|cn_mainland|study_abroad" supabase`
- `git diff --check -- server/supabase server/providers .env.example supabase tests/task14-supabase-boundary.test.ts`

Post-Task-14 report-persona bugfix verification passed with:

- `pnpm exec vitest run tests/task9-report-generation-boundary.test.ts`
- elevated `pnpm exec playwright test e2e/report-generation.spec.ts`
- elevated `pnpm exec playwright test e2e/report-generation.spec.ts e2e/story-flow.spec.ts`
- `pnpm lint`
- `pnpm test`
- elevated `pnpm typecheck`
- elevated `pnpm build`
- elevated `pnpm e2e`

Post-Task-14 stale-report bugfix verification passed with:

- `pnpm exec vitest run tests/task4-mock-providers.test.ts`
- `pnpm exec vitest run tests/task4-mock-providers.test.ts tests/task9-report-generation-boundary.test.ts`
- elevated `pnpm exec playwright test e2e/report-generation.spec.ts`
- `pnpm test`
- `pnpm lint`
- elevated `pnpm typecheck`
- elevated `pnpm build`
- elevated `pnpm e2e`

Current smoke coverage:

- Unit: 12 Vitest files and 63 tests covering smoke, Task 4 provider/schema behavior and stale-report invalidation, Task 5 setup validation, Task 6 upload validation, Task 7/15 AI extraction boundary behavior including OpenAI server-only key selection, invalid-output repair retry, and timeout fallback, Task 8 confirmation validation, Task 9/15 report generation boundary behavior including OpenAI server-only key selection, invalid-output repair retry, timeout fallback, category-driven persona selection, and stale-report detection, Task 10 result-story building/rendering, Task 11 share-card view models/persistence, Task 12 auth boundary/gates/linking, Task 13 history/dashboard/retention/deletion behavior, and Task 14 Supabase boundary/schema behavior.
- Browser: 35 Playwright Chromium tests covering the root page, planned route coverage, Task 5 setup-flow persistence and redirects, Task 6/7 upload-flow low-friction screenshots, manual fallback, validation errors, category-total fallback, extraction-failure manual fallback, Task 8 confirmation editing/deleting/adding/confirming rows, Task 9 report-generation flow, category-driven persona regression, stale report regeneration from milk tea to transport, Task 10/11 story-flow navigation and visual content, Task 11 share-card export/gating, Task 12 auth-gate continuation/repeated-report blocking, and Task 13 history/dashboard/delete flow.
- Responsive inspection: `/battle/result/demo-session` checked at desktop and mobile widths with no page-level horizontal overflow.

## Environment Notes For Future Developers

- In this Codex environment, scripts should be run with the workspace Node path before the pnpm path:
  - `/Users/mayinzhi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/mayinzhi/Library/pnpm/bin:$PATH`
- pnpm 11.1.3 was installed through the official pnpm installer because the initial environment had no `pnpm`, `npm`, or `corepack`.
- Vitest is pinned to 3.2.4 because Vitest 4 triggered native Rolldown binding signature failures under the Codex.app Node process.
- `pnpm-workspace.yaml` allowlists native build dependencies required by the toolchain:
  - `@sentry/cli`
  - `sharp`
  - `unrs-resolver`
  - `esbuild`
- Playwright Chromium has been installed into the user Playwright cache.
- `playwright.config.ts` currently sets `workers: 1` because full stateful e2e relies on process-level in-memory mock persistence.

## Next Architectural Work

Wait for user verification before Task 16. Task 16 should add Vercel Analytics, Sentry, and error boundaries. Do not start Task 16 until the user confirms Task 15.
