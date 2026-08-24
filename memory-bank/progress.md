# Progress

## Current Status

- Current branch: `codex/task-2-scaffold`.
- Current milestone: Task 15 completed; first Vercel production deployment completed; latest Vercel production includes the mobile upload Step 3 overflow fix and manual-only upload session recovery; GitHub repository has been prepared for public demo/open-source presentation; waiting for user test verification before Task 16.
- The project now has typed domain models, Zod schemas, mock persistence, mock auth, mock AI extraction/report providers, anonymous setup cookies, auth cookies, region/currency selection, period selection, upload access guarding, low-friction screenshot upload UI, manual transaction input, category-total fallback input, a server-only mock/OpenAI extraction provider boundary with retry and timeout handling, a confirmation table for exact and estimated rows, a safe mock/OpenAI report generation boundary with retry and timeout handling, a Cyber Wrapped result story flow, animated generating/result visuals, share-card templates/export behavior, login gates for save/remove-watermark/additional export/repeated report generation, saved-report history, lightweight dashboard, mock report deletion, screenshot-retention status, and a Supabase schema/provider boundary behind server-only configuration.
- Supabase migration and seed files now exist, but no remote Supabase project migration was executed in this local Codex session. Real OpenAI flow was not manually exercised because no valid local API key/reachable provider was configured. Real OCR queue behavior is still not implemented.
- Production deployment is available at `https://ai-budget-battle.vercel.app` using the default mock-first provider configuration.
- Latest production deployment includes the mobile upload Step 3 overflow fix and manual-only upload session recovery.
- Public GitHub repository target: `https://github.com/Yinzhi392/AI-Budget-Battle`.

## Completed Work

### Pre-Task Documentation Setup

What changed:

- Created project memory-bank structure.
- Moved project source documents into `memory-bank/`.
- Standardized the architecture memory filename to `memory-bank/architecture.md`.
- Removed the previously misspelled architecture memory path from active docs.
- Updated `AGENTS.md` so future agents must read:
  - `memory-bank/design-document.md`
  - `memory-bank/tech-stack.md`
- Updated `AGENTS.md` so future agents must update:
  - `memory-bank/progress.md` after every task
  - `memory-bank/architecture.md` after every feature or milestone

Current document layout:

- `AGENTS.md`
- `memory-bank/design-document.md`
- `memory-bank/tech-stack.md`
- `memory-bank/implementation-plan.md`
- `memory-bank/progress.md`
- `memory-bank/architecture.md`

Verification performed:

- Confirmed required memory-bank files exist.
- Confirmed root-level moved docs are absent:
  - no root `design-document.md`
  - no root `tech-stack.md`
  - no root `implementation-plan.md`
- Confirmed no active references to old misspelled or obsolete document names.

### 2026-05-21 - Task 2: Scaffold Next.js with pnpm and Quality Scripts

Status: completed.

What changed:

- Created a Next.js App Router scaffold in the project root with TypeScript, Tailwind CSS, ESLint, and pnpm.
- Preserved `AGENTS.md` and all `memory-bank/` documents.
- Installed required runtime dependencies:
  - `next`
  - `react`
  - `react-dom`
  - `@supabase/supabase-js`
  - `@supabase/ssr`
  - `openai`
  - `zod`
  - `react-hook-form`
  - `@hookform/resolvers`
  - `recharts`
  - `html-to-image`
  - `motion`
  - `@vercel/analytics`
  - `@sentry/nextjs`
  - `class-variance-authority`
  - `clsx`
  - `tailwind-merge`
  - `lucide-react`
- Installed required test dependencies:
  - `vitest`
  - `jsdom`
  - `@playwright/test`
  - `@vitejs/plugin-react`
- Installed Playwright Chromium runtime.
- Added `typecheck`, `test`, and `e2e` scripts to `package.json`.
- Added shadcn/ui support through `components.json` and `lib/utils.ts`.
- Added baseline Vitest smoke test at `tests/smoke.test.ts`.
- Added baseline Playwright smoke test at `e2e/smoke.spec.ts`.
- Added `vercel.json` and `.env.example` for Vercel-ready setup without deploying yet.
- Removed the default Google font dependency from the initial layout so local builds do not depend on fetching external font assets.
- Added Playwright output directories to `.gitignore`.

Verification run:

- `pnpm install`: passed.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed with 1 Vitest smoke test.
- `pnpm build`: passed with Next.js 16.2.6.
- `pnpm e2e`: passed with 1 Playwright Chromium smoke test.

Environment notes:

- The system had Node available through Codex, but no `pnpm`, `npm`, or `corepack`; pnpm 11.1.3 was installed through the official pnpm installer.
- Use this PATH when running scripts in this Codex environment to avoid macOS code-signing issues with native Rollup/Rolldown modules:
  - `/Users/mayinzhi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/mayinzhi/Library/pnpm/bin:$PATH`
- Vitest is pinned to 3.2.4 because Vitest 4 loaded Rolldown native bindings that failed under the Codex.app-signed Node process.
- `pnpm-workspace.yaml` explicitly allows build scripts for:
  - `@sentry/cli`
  - `sharp`
  - `unrs-resolver`
  - `esbuild`

Current git status summary:

- Branch: `codex/task-2-scaffold`.
- Documentation changes from earlier setup remain in the working tree.
- The previously misspelled architecture memory file is deleted and replaced by `memory-bank/architecture.md`.
- New scaffold files are untracked until staged or committed.
- Build/test artifacts such as `.next/`, `node_modules/`, `test-results/`, and `playwright-report/` are ignored.

Blockers:

- None.

### 2026-05-21 - Task 3: Build App Shell, Cyber Theme, and Route Skeleton

Status: completed.

What changed:

- Added the planned product route skeleton:
  - `/`
  - `/battle/region-currency`
  - `/battle/period`
  - `/battle/upload`
  - `/battle/confirm`
  - `/battle/generating`
  - `/battle/result/[sessionId]`
  - `/battle/share/[reportId]`
  - `/auth`
  - `/history`
  - `/dashboard`
- Added a shared `BattleShell` layout with product identity, flow navigation, CTAs, route highlights, and placeholder status panels.
- Added centralized route placeholder content through `lib/route-content.ts`.
- Updated the root page to use the shared shell and landing route content.
- Added Cyber visual tokens and background treatment:
  - matte black base
  - charcoal surface
  - neon green
  - electric blue
  - warm orange
  - scanline and grid effects
  - mobile-first spacing
- Added Playwright route skeleton coverage for every planned route.
- Kept every page honest about unfinished behavior with `功能骨架` placeholder copy.

Verification run:

- Red test first: `pnpm exec playwright test route-skeleton.spec.ts` failed for 10 missing routes and passed only `/`.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm build`: passed with Next.js 16.2.6 after rerunning outside the sandbox because Turbopack worker startup was blocked by sandbox permissions.
- `pnpm exec playwright test route-skeleton.spec.ts`: passed with 11 route tests.
- `pnpm e2e`: passed with 12 Chromium tests.
- `pnpm test`: passed with 1 Vitest smoke test.
- Responsive inspection on `/battle/result/demo-session` at 1440x900 and 390x844 found no page-level horizontal overflow. The mobile flow nav is horizontally scrollable as intended.

Blockers:

- None.

### 2026-05-21 - Task 4: Create Mock Data, Mock Persistence, and Mock AI Providers

Status: completed; waiting for user verification before Task 5.

What changed:

- Added typed domain models in `types/domain.ts` for anonymous sessions, analysis sessions, uploaded image metadata, transaction candidates, confirmed transaction items, AI reports, share cards, benchmark profiles, and analysis snapshots.
- Added Zod schemas in `server/ai/schemas.ts` for region, currency, spending categories, transaction candidates, and AI report output.
- Added provider interfaces in `server/providers/types.ts` for mock-compatible AI extraction, report generation, persistence operations, and analysis snapshot reads.
- Added `createMockAiProvider()` in `server/providers/mock-ai.ts`.
  - Mock extraction returns plausible China-mainland CNY student transaction candidates from uploaded image metadata.
  - Mock report generation returns complete Cyber Wrapped report data validated by the AI report schema.
  - Benchmark copy uses preset benchmark language and does not claim real rankings.
- Added `createMockPersistence()` in `server/providers/mock-persistence.ts`.
  - Creates anonymous and analysis sessions.
  - Stores uploaded image metadata, confirmed transactions, generated reports, and share-card metadata.
  - Allows one anonymous watermarked share card before login.
  - Returns an analysis snapshot with session, uploaded images, confirmed transactions, report, and share cards.
- Updated `vitest.config.ts` so Vitest resolves the same `@/*` alias used by Next.js and TypeScript.
- Added `tests/task4-mock-providers.test.ts` covering schemas, invalid payload rejection, mock AI output validation, and mock persistence flow.

Verification run:

- Red test first: `pnpm test tests/task4-mock-providers.test.ts` failed because Task 4 modules did not exist.
- `pnpm test tests/task4-mock-providers.test.ts`: passed with 5 tests.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed with 2 test files and 6 tests.

Blockers:

- None.

### 2026-05-21 - Task 5: Implement Anonymous Session, Region/Currency, and Period Flow

Status: completed; waiting for user verification before Task 6.

What changed:

- Added Task 5 setup validation in `server/setup/validation.ts`.
  - Validates supported region and currency choices.
  - Resolves `this_week`, `this_month`, and custom analysis periods.
  - Captures anonymous one-report allowance validation for later generation/export gates.
- Added setup cookie helpers in `server/setup/session.ts`.
  - Uses `abb_anonymous_session`, `abb_region`, `abb_currency`, `abb_period_type`, `abb_period_start`, `abb_period_end`, and `abb_analysis_session`.
  - Creates anonymous mock persistence records when needed.
  - Computes redirect targets for missing setup state.
- Added a singleton mock persistence provider in `server/providers/mock-singleton.ts` so server actions and route handlers share the same in-memory store during local runtime.
- Added `/battle/start` route handler.
  - Creates the anonymous session cookie and mock session record on first battle start.
  - Redirects to `/battle/region-currency`.
- Wired `/battle/region-currency` to a lightweight setup form for China mainland student/CNY and study-abroad students with country/region and currency selection.
- Wired `/battle/period` to require region/currency setup and save the selected period through a server action.
- Wired `/battle/upload` to block access when setup is missing and redirect to the earliest required setup step.
- Added a compact upload setup summary so refresh persistence is visible without implementing upload behavior.
- Extended `BattleShell` to accept page-specific children while keeping the shared Cyber shell and route content.
- Updated `playwright.config.ts` to start the dev server through `./node_modules/.bin/next dev` because the current shell does not expose a global `pnpm` binary.
- Updated route skeleton Playwright coverage so protected setup routes are reached through the required setup path.
- Added Task 5 unit tests and Playwright tests.

Verification run:

- Red test first: `./node_modules/.bin/vitest run tests/task5-setup-flow.test.ts` failed because `server/setup/validation.ts` did not exist yet.
- `./node_modules/.bin/vitest run tests/task5-setup-flow.test.ts`: passed with 5 tests.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed with 3 test files and 11 tests.
- `./node_modules/.bin/playwright test e2e/setup-flow.spec.ts e2e/route-skeleton.spec.ts`: failed inside the sandbox because Next.js could not listen on `0.0.0.0:3000`.
- Elevated rerun of `pnpm exec playwright test e2e/setup-flow.spec.ts e2e/route-skeleton.spec.ts`: passed with 14 Chromium tests.
- Elevated `pnpm e2e`: passed with 15 Chromium tests.

Post-review fix:

- Fixed region/currency and period option cards so border, background, and text accents follow the currently checked radio option instead of staying on the default card.
- Added a Playwright regression assertion for the region/currency card selected-state styling.
- Hid developer-facing skeleton highlight chips on interactive setup pages (`region-currency`, `period`, and `upload`) so users only see the actual setup controls and upload summary.
- Hid the developer-facing `MVP Route Map` sidebar and Task 3 skeleton note on interactive setup pages.
- Added a Playwright regression assertion that the region/currency page does not show the `分类预览待接入`, `MVP Route Map`, or Task 3 skeleton hints.
- Replaced the old three-choice region setup (`中国大陆`, `海外中文学生`, `国际学生`) with two student paths: `中国大陆学生 / CNY` and `留学生`.
- Added global country/region and currency selectors under the `留学生` path.
- Persisted optional study-abroad country/region setup with the anonymous setup cookies and mock analysis session.
- Added Playwright coverage for choosing a study-abroad country/region and currency before proceeding to upload.
- Hid the developer-facing `功能骨架` status badge on interactive setup pages.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed with 3 test files and 11 tests.
- Elevated `pnpm exec playwright test e2e/setup-flow.spec.ts e2e/route-skeleton.spec.ts`: passed with 17 Chromium tests.
- Elevated `pnpm e2e`: passed with 18 Chromium tests.

Blockers:

- None.

### 2026-05-22 - Task 6: Implement Upload UI and Manual Transaction Input Fallback

Status: completed; waiting for user verification before Task 7.

What changed:

- Added Task 6 upload validation in `server/upload/validation.ts`.
  - Validates manual transactions with amount, currency, category, transaction time, and optional merchant/note.
  - Validates category-level total hints as estimated input with confidence metadata.
  - Validates screenshot metadata and low-friction source types.
  - Provides region-aware category options with China mainland categories by default.
- Extended domain and provider models.
  - Added upload source types for monthly summaries, representative daily screenshots, category summaries, and single transaction screenshots.
  - Extended uploaded image metadata with source type, original filename, and size.
  - Added category total hints to `types/domain.ts`, mock persistence state, provider interfaces, and analysis snapshots.
- Added upload persistence action in `app/battle/upload/actions.ts`.
  - Saves screenshot metadata to mock persistence.
  - Saves manual transactions as manual confirmed transaction inputs for the current mock flow.
  - Saves category total hints separately so estimates are not represented as exact transaction rows.
  - Redirects to `/battle/confirm` after enough upload/manual/estimated input exists.
- Added interactive upload form in `app/battle/upload/upload-form.tsx`.
  - Prefers monthly analysis screenshots and explicitly tells users they do not need to upload daily screenshots.
  - Supports representative daily screenshots and category-summary screenshots.
  - Shows temporary upload status and privacy/temporary-processing copy.
  - Supports manual transaction input with clear client-side validation errors.
  - Supports category-level total hints for users who do not want to enter individual transactions.
  - Frames incomplete data as an estimated entertainment/personality analysis.
- Updated `app/battle/upload/page.tsx`.
  - Keeps Task 5 setup guard and setup summary.
  - Passes selected currency, period, and region-aware category options into the upload form.
  - Hides shell shortcut actions so users cannot bypass upload validation by clicking a placeholder CTA.
- Updated `components/battle-shell.tsx` with a `showActions` switch for interactive pages.
- Updated `lib/route-content.ts` upload copy to reflect the real Task 6 upload/manual fallback behavior.
- Updated Task 4 tests for the expanded uploaded image metadata shape.
- Added unit tests in `tests/task6-upload-validation.test.ts`.
- Added browser tests in `e2e/upload-flow.spec.ts`.

Verification run:

- Red test first: `pnpm test tests/task6-upload-validation.test.ts` failed because `server/upload/validation.ts` did not exist.
- `pnpm test tests/task6-upload-validation.test.ts`: passed with 5 tests.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed with 4 test files and 16 tests.
- Elevated `pnpm exec playwright test e2e/upload-flow.spec.ts`: passed with 4 Chromium tests.
- Elevated `pnpm exec playwright test e2e/upload-flow.spec.ts e2e/route-skeleton.spec.ts`: passed with 15 Chromium tests.
- Elevated `pnpm e2e`: passed with 22 Chromium tests.

Blockers:

- None.

### 2026-05-22 - Task 7: Implement Mock/Real AI Extraction Boundary

Status: completed; waiting for user verification before Task 8.

What changed:

- Extended extraction domain models in `types/domain.ts`.
  - Added transaction extraction candidates with source metadata, confidence, dedupe keys, overlap grouping, possible duplicate flags, and `isEstimate: false`.
  - Added aggregate extraction candidates for monthly/category summary screenshots with source metadata, confidence, possible overlap flags, and `isEstimate: true`.
  - Added stored extraction output to analysis snapshots so Task 8 can consume prepared candidates.
- Extended Zod validation in `server/ai/schemas.ts`.
  - Added schemas for extraction source platform, upload source type, transaction candidates, aggregate candidates, and full `ExtractionOutput`.
  - All provider output now parses through Zod before being treated as usable extraction data.
- Added server-only extraction provider selection.
  - Added `server/providers/ai-provider.ts` with `AI_PROVIDER` selection.
  - Default provider remains mock.
  - `AI_PROVIDER=openai` only attempts OpenAI when both `OPENAI_API_KEY` and `OPENAI_EXTRACTION_MODEL` are present.
  - Missing OpenAI config, provider failures, network failures, and invalid output become recoverable extraction failures instead of UI-breaking exceptions.
  - `.env.example` now uses server-only `AI_PROVIDER=mock` and `OPENAI_EXTRACTION_MODEL`; `NEXT_PUBLIC_AI_PROVIDER` is no longer the source of truth.
- Added `server/providers/openai-extraction.ts`.
  - Keeps real extraction server-only.
  - Uses the OpenAI SDK only when explicitly selected.
  - Validates output with the shared extraction schema before returning candidates.
- Updated `server/providers/mock-ai.ts`.
  - Mock extraction now returns `ExtractionOutput` with `transactionCandidates`, `aggregateCandidates`, and `warnings`.
  - Classifies common Chinese spending text such as `一点点 10 元` as `milk_tea`.
  - Produces aggregate candidates for `monthly_summary` and `category_summary` screenshots.
  - Produces transaction candidates for `representative_daily` and `single_transaction` screenshots.
  - Marks mixed monthly summary plus daily screenshot examples with overlap/dedupe metadata instead of blindly adding them together.
- Updated mock persistence.
  - Added `saveExtractionOutput`.
  - Stores one extraction output per analysis session.
  - Exposes stored extraction output through `getAnalysisSnapshot`.
- Wired extraction into `app/battle/upload/actions.ts`.
  - Saves screenshot metadata first.
  - Attempts extraction after screenshot save.
  - Persists valid extraction output for Task 8.
  - If extraction fails but manual transactions or category-total hints exist, users can still continue to `/battle/confirm`.
  - If only screenshots exist and extraction fails, users stay on `/battle/upload` with a recoverable prompt to add manual transactions or category totals.
- Updated `app/battle/upload/page.tsx` to show the recoverable extraction failure message.
- Added Task 7 unit coverage in `tests/task7-ai-extraction-boundary.test.ts`.
- Added a targeted Playwright regression in `e2e/upload-flow.spec.ts` for extraction failure plus manual fallback.

Verification run:

- Red test first: `pnpm test tests/task7-ai-extraction-boundary.test.ts` failed because the extraction provider selector did not exist yet.
- `pnpm test tests/task7-ai-extraction-boundary.test.ts`: passed with 6 tests.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed with 5 test files and 22 tests.
- Non-elevated `pnpm build`: failed because the sandbox blocked Turbopack worker behavior while processing `app/globals.css`.
- Elevated `pnpm build`: passed with Next.js 16.2.6.
- Non-elevated `pnpm exec playwright test e2e/upload-flow.spec.ts`: failed because the sandbox blocked Next.js listening on `0.0.0.0:3000`.
- Elevated `pnpm exec playwright test e2e/upload-flow.spec.ts`: passed with 5 Chromium tests.
- Non-elevated `pnpm e2e`: failed because the sandbox blocked Next.js listening on `0.0.0.0:3000`.
- Elevated `pnpm e2e`: passed with 23 Chromium tests.

Blockers:

- None.

### 2026-05-22 - Task 8: Implement Transaction Confirmation Table

Status: completed; waiting for user verification before Task 9.

What changed:

- Added confirmation-domain support.
  - Added `ConfirmedAggregateItem` to `types/domain.ts`.
  - Added confirmed aggregate storage to `AnalysisSnapshot`.
  - Added `SaveConfirmedAggregateInput` and `saveConfirmedAggregates` to the persistence provider interface.
- Updated mock persistence.
  - Stores accepted aggregate rows separately from upload-time category total hints.
  - Saves confirmed aggregate rows with `isEstimate: true` and `isUserConfirmed: true`.
  - Replaces prior confirmed transactions and confirmed aggregates for the current analysis session on confirmation.
  - Marks the analysis session as `confirmed` after final confirmation save.
- Added `server/confirm/validation.ts`.
  - Validates accepted transaction rows.
  - Validates accepted aggregate rows.
  - Rejects accepted rows without amount, currency, category, and time or period.
  - Ignores rejected rows when checking final confirmation eligibility.
  - Produces badges for low confidence, estimated data, possible duplicates, possible overlap, and source type.
- Added confirmation Server Action in `app/battle/confirm/actions.ts`.
  - Reads setup cookies.
  - Validates submitted confirmation rows.
  - Saves only accepted transaction rows and accepted aggregate rows.
  - Redirects to `/battle/generating` after confirmation.
- Replaced the confirmation route skeleton with an interactive confirmation page.
  - Loads manual rows, extraction transaction candidates, category total hints, and extraction aggregate candidates from the current mock snapshot.
  - Hides developer-facing status/sidebar placeholder UI on the interactive confirmation page.
  - Supports editing amount, currency, category, merchant/note, transaction time, and aggregate period.
  - Supports deleting rows, accepting/rejecting rows, adding manual transactions, and adding estimated aggregate rows.
  - Shows confidence, estimated-data, source-type, duplicate, and overlap markers.
  - Keeps exact transactions visually distinct from estimated aggregates.
- Updated route skeleton Playwright coverage so `/battle/confirm` is reached through a real setup/upload path instead of relying on a placeholder.
- Added Task 8 unit tests in `tests/task8-confirmation-validation.test.ts`.
- Added Task 8 browser tests in `e2e/confirm-flow.spec.ts`.

Verification run:

- Red unit test first: `pnpm test tests/task8-confirmation-validation.test.ts` failed because `server/confirm/validation.ts` did not exist.
- Red Playwright test first: elevated `pnpm exec playwright test e2e/confirm-flow.spec.ts` failed because the confirmation page did not show low-confidence or estimated-data markers yet.
- `pnpm test tests/task8-confirmation-validation.test.ts`: passed with 6 tests.
- `pnpm lint`: passed.
- Non-elevated `pnpm typecheck`: failed because the sandbox could not write `tsconfig.tsbuildinfo`.
- Elevated `pnpm typecheck`: passed.
- `pnpm test`: passed with 6 test files and 28 tests.
- Elevated `pnpm exec playwright test e2e/confirm-flow.spec.ts`: passed with 2 Chromium tests.
- Elevated `pnpm e2e`: passed with 25 Chromium tests.
- Elevated `pnpm build`: passed with Next.js 16.2.6.

Blockers:

- None. Per user instruction, do not begin Task 9 until the user verifies Task 8 tests.

Post-review fix:

- Replaced the three landing-page highlight chips (`中文优先`, `匿名先体验`, `分享卡默认隐藏商户明细`) with one user-facing low-friction product guide sentence.
- Adjusted `BattleShell` so a single highlight occupies one full row instead of a narrow three-column card.
- Added a Playwright regression assertion that the old landing highlight labels are hidden and the new user-facing sentence is visible.
- `pnpm lint`: passed.
- Elevated `pnpm typecheck`: passed.
- Elevated `pnpm exec playwright test e2e/route-skeleton.spec.ts --grep "/ loads"`: passed.

Post-review fix:

- Removed the landing-page developer-facing `MVP Route Map` sidebar and Task 3 implementation note.
- Added a Playwright regression assertion that the landing page hides `MVP Route Map` and the Task 3 implementation note.
- `pnpm lint`: passed.
- Elevated `pnpm typecheck`: passed.
- Elevated `pnpm exec playwright test e2e/route-skeleton.spec.ts --grep "/ loads"`: passed.

Post-review fix:

- Replaced the landing-page low-friction guide highlight with the requested developer credit: `Developer: Yinzhi`.
- Updated the landing-page Playwright regression assertion to require `Developer: Yinzhi` and hide the previous guide sentence.
- `pnpm lint`: passed.
- Elevated `pnpm typecheck`: passed.
- Elevated `pnpm exec playwright test e2e/route-skeleton.spec.ts --grep "/ loads"`: passed.

Post-review fix:

- Removed the landing-page `功能骨架` status badge.
- Updated the landing-page route regression so `/` must hide `功能骨架`.
- First `pnpm lint` run failed because the ignored Playwright `test-results` directory was missing during ESLint file discovery; after Playwright recreated the directory, rerunning `pnpm lint` passed.
- Elevated `pnpm typecheck`: passed.
- Elevated `pnpm exec playwright test e2e/route-skeleton.spec.ts --grep "/ loads"`: passed.

### 2026-05-22 - Task 9: Implement Mock/Real AI Report Generation Boundary

Status: completed; waiting for user verification before Task 10.

What changed:

- Added report safety validation in `server/reports/safety.ts`.
  - Blocks unsafe roast language, including poverty shaming, identity attacks, body/gender/school-tier insults, and advice categories outside product scope.
  - Rejects benchmark wording that claims real rankings, real percentiles, `全校` ranking, or percentile-style claims.
  - Validates report output through `aiReportSchema` before safety checks return trusted data.
- Added server-only report provider selection in `server/providers/report-provider.ts`.
  - Defaults to mock report generation.
  - Enables OpenAI report generation only when `AI_REPORT_PROVIDER=openai`, `OPENAI_API_KEY`, and `OPENAI_REPORT_MODEL` are set server-side.
  - Converts missing config, invalid structure, unsafe roast, forbidden benchmark wording, and provider errors into recoverable failures.
- Added optional OpenAI report boundary in `server/providers/openai-report.ts`.
  - Keeps real report generation server-only.
  - Sends only confirmed transactions and accepted aggregate rows.
  - Parses OpenAI JSON through the shared report schema before the safety layer.
- Updated mock report generation.
  - Consumes `confirmedTransactions` and `confirmedAggregates`.
  - Uses accepted aggregate rows as estimate-based report input.
  - Mentions estimated summaries in behavior copy without pretending they are exact transaction rows.
  - Keeps benchmark copy as benchmark language, not real ranking language.
- Updated `.env.example`.
  - Added `AI_REPORT_PROVIDER=mock`.
  - Added `OPENAI_REPORT_MODEL=`.
- Wired `/battle/generating` to Task 9 report generation.
  - Requires completed setup and confirmed input.
  - Redirects back to setup/confirmation when prerequisites are missing.
  - Shows a retryable generation form.
  - Saves only safe, schema-valid reports.
  - Redirects to `/battle/result/[analysisSessionId]` after successful generation.
- Added Task 9 unit tests in `tests/task9-report-generation-boundary.test.ts`.
- Added Task 9 browser flow test in `e2e/report-generation.spec.ts`.
- Updated route skeleton coverage so `/battle/generating` is reached through the real setup/upload/confirm path.

Verification run:

- Red unit test first: `pnpm test tests/task9-report-generation-boundary.test.ts` failed because `server/reports/safety.ts` did not exist.
- `pnpm test tests/task9-report-generation-boundary.test.ts`: passed with 6 tests.
- `pnpm lint`: passed.
- Elevated `pnpm typecheck`: passed.
- `pnpm test`: passed with 7 test files and 34 tests.
- Elevated `pnpm exec playwright test e2e/report-generation.spec.ts`: passed with 1 Chromium test.
- Elevated `pnpm e2e`: passed with 26 Chromium tests.
- Elevated `pnpm build`: passed with Next.js 16.2.6.

Blockers:

- None. Per user instruction, do not begin Task 10 until the user verifies Task 9 tests.

Post-review mobile compatibility fix:

- Improved `/battle/region-currency` for mobile and desktop setup.
  - Kept only two user types: `中国大陆学生 / CNY` and `留学生`.
  - Made the留学生 country/region and currency selectors always present in the DOM so mobile users can select them without waiting for client-side conditional rendering.
  - Kept the country/region and currency selectors outside the radio label so native mobile select controls remain usable.
  - Submitted留学生 currency through `studyCurrency` so the hidden mainland `CNY` field no longer overrides the selected study-abroad currency.
  - Cached world region/currency display options and switched server validation to lightweight supported-code checks to reduce setup-page and submit latency.
  - Fixed selected-card styling by limiting `:checked` matching to radio inputs; selected `<option>` elements no longer make the留学生 card appear selected by default.
- Added Playwright mobile regression coverage:
  - Confirms the留学生 selectors are visible and usable at a 390px mobile viewport.
  - Selects `US` and `USD`, submits, and verifies navigation to `/battle/period`.
  - Confirms selected-card border styling follows the radio option.

Verification run:

- `pnpm test tests/task5-setup-flow.test.ts`: passed with 5 tests.
- Initial non-elevated `pnpm exec playwright test e2e/setup-flow.spec.ts`: blocked by sandbox `EPERM` writing `test-results/.last-run.json`.
- Elevated `pnpm exec playwright test e2e/setup-flow.spec.ts`: first exposed the selected-card styling bug caused by `has-[:checked]` matching selected `<option>` elements.
- Elevated `pnpm exec playwright test e2e/setup-flow.spec.ts`: passed with 7 Chromium tests after the radio-only selected-state fix.
- `pnpm lint`: passed.
- Elevated `pnpm typecheck`: passed.
- Elevated `pnpm e2e`: passed with 27 Chromium tests.
- `git diff --check`: passed.

Blockers:

- None. Per user instruction, do not begin Task 10 until the user verifies this mobile setup fix.

Post-review copy localization fix:

- Updated `/battle/upload` setup summary so analysis period labels are user-facing Chinese text instead of internal enum values.
  - `this_week` now displays as `本周`.
  - `this_month` now displays as `本月`.
  - `custom` displays a formatted date range when start/end dates are available.
- Passed the same localized period label into the upload form so category-total fallback rows also use user-facing Chinese period text.
- Updated setup-flow Playwright coverage so the upload page must show `本月` and hide `this_month`.

Verification run:

- Red regression first: elevated `pnpm exec playwright test e2e/setup-flow.spec.ts --grep "anonymous setup"` failed because `本月` was not visible.
- Elevated `pnpm exec playwright test e2e/setup-flow.spec.ts --grep "anonymous setup"`: passed after the localization fix.
- `pnpm lint`: passed.
- Elevated `pnpm typecheck`: passed.
- Elevated `pnpm exec playwright test e2e/setup-flow.spec.ts`: passed with 7 Chromium tests.
- `git diff --check`: passed.

Blockers:

- None. Per user instruction, do not begin Task 10 until the user verifies this upload-page copy fix.

### 2026-05-22 - Task 10: Build Cyber Wrapped Result Story Flow

Status: completed; waiting for user verification before Task 11.

What changed:

- Added `lib/report-story.ts`.
  - Converts a saved safe `AiReport` into the required eight Cyber Wrapped story screens:
    1. personality reveal
    2. dramatic spending behavior
    3. safe roast
    4. battle scores
    5. benchmark comparison
    6. risk prediction
    7. challenge tag
    8. share preview
  - Keeps the story data separate from UI state so the sequence is unit-testable.
- Added `components/result-story-flow.tsx`.
  - Provides mobile-first forward/backward story navigation.
  - Adds progress indicators, screen jump controls, high-contrast cyber cards, score bars, and lightweight transition styling.
  - Shows the share-card editor CTA only on the final story screen.
  - Does not render raw merchant details.
- Replaced `/battle/result/[sessionId]` skeleton behavior with the Task 10 story experience.
  - Reads the saved report from mock persistence by `analysisSessionId`.
  - Builds story screens from the saved report.
  - Shows a recoverable missing-report state if the report is absent or the local mock process restarted.
  - Hides developer-facing skeleton status, route panels, and shortcut placeholder actions on the result page.
- Updated route skeleton coverage so `/battle/result/demo-session` is treated as a non-skeleton result route with a missing-report fallback.
- Added Task 10 unit coverage in `tests/task10-result-story.test.tsx`.
- Added Task 10 browser coverage in `e2e/story-flow.spec.ts`.

Verification run:

- Red unit test first: `pnpm test tests/task10-result-story.test.tsx` failed because `components/result-story-flow` and `lib/report-story` did not exist.
- `pnpm test tests/task10-result-story.test.tsx`: passed with 2 tests.
- Elevated `pnpm exec playwright test e2e/story-flow.spec.ts`: passed with 2 Chromium tests covering mobile and desktop story navigation.
- `pnpm lint`: passed.
- Elevated `pnpm typecheck`: passed.
- `pnpm test`: passed with 8 test files and 36 tests.
- Elevated `pnpm build`: passed with Next.js 16.2.6.
- Elevated `pnpm e2e`: passed with 29 Chromium tests.
- `git diff --check`: passed.

Blockers:

- None. Per user instruction, do not begin Task 11 until the user verifies Task 10 tests.

### 2026-05-22 - Task 11: Implement Share Card Templates, Watermark Rules, and Export

Status: completed; waiting for user verification before Task 12.

What changed:

- Added privacy-safe share-card view models in `lib/share-card.ts`.
  - Builds three templates: `xiaohongshu_square`, `xiaohongshu_vertical`, and `wechat_moments`.
  - Uses personality, score, roast, challenge, benchmark, period, and watermark copy from the saved safe report.
  - Keeps raw merchant names and precise transaction detail out of share-card output.
- Added `components/share-card-studio.tsx`.
  - Provides template switching, responsive card previews, watermark display, invite/QR-style footer, and export status.
  - Exports a watermarked card with `html-to-image` when available and falls back to a local mock URL in tests.
  - Shows a login prompt when the anonymous export allowance has already been used.
- Replaced `/battle/share/[reportId]` skeleton behavior with the Task 11 share-card studio.
  - Reads the generated report through `getAnalysisSnapshotByReportId`.
  - Shows a recoverable fallback when no report exists.
  - Hides developer-facing skeleton status, sidebar panels, and shortcut actions on the share page.
- Added `app/battle/share/[reportId]/actions.ts`.
  - Persists the anonymous watermarked share-card export through mock persistence.
  - Allows reuse of the same report's first watermarked anonymous export.
  - Keeps additional anonymous save/remove-watermark behavior gated for Task 12 auth.
- Updated mock persistence and provider interfaces.
  - Added `getAnalysisSnapshotByReportId`.
  - Changed anonymous share-card allowance to one watermarked card per report instead of one global anonymous card.
- Upgraded Task 11 visual polish requested during implementation.
  - Added a Cyber Scan/progress animation to the generating wait screen.
  - Added an animated milk-tea themed character visual to the personality reveal screen.
  - Added animated behavior pulse cards to the spending behavior screen.
  - Sharpened safe roast copy so the tone feels more like social “毒舌” without crossing the safety boundary.
  - Added an animated five-dimensional pentagon radar chart for the battle score screen.
- Updated `app/globals.css` with scan, horizontal scan, float, bubble, bar-growth, and radar-fill keyframes.
- Updated Playwright configuration to run browser tests with `workers: 1`.
  - Current mock persistence is process-level in-memory state and is not parallel-safe under full Playwright concurrency.
- Added Task 11 unit coverage in `tests/task11-share-card.test.tsx`.
- Added Task 11 browser coverage in `e2e/share-card.spec.ts`.
- Updated Task 9/10 browser tests for the new generating and result animations.
- Updated route skeleton coverage so `/battle/share/demo-report` is no longer expected to show the Task 3 skeleton placeholder.

Verification run:

- Red unit test first: `pnpm test tests/task11-share-card.test.tsx` failed because `lib/share-card.ts` did not exist yet.
- `pnpm test tests/task11-share-card.test.tsx`: passed.
- `pnpm test tests/task4-mock-providers.test.ts tests/task11-share-card.test.tsx`: passed with 7 tests.
- Targeted `pnpm exec playwright test e2e/report-generation.spec.ts e2e/story-flow.spec.ts e2e/share-card.spec.ts`: first exposed strict locator and stale anonymous export-state issues; both were fixed.
- Elevated `pnpm exec playwright test e2e/share-card.spec.ts`: passed.
- Elevated `pnpm exec playwright test e2e/report-generation.spec.ts e2e/story-flow.spec.ts e2e/share-card.spec.ts`: passed with 4 Chromium tests.
- `pnpm lint`: passed.
- Elevated `pnpm typecheck`: passed.
- `pnpm test`: passed with 9 test files and 38 tests.
- Elevated `pnpm build`: passed with Next.js 16.2.6.
- Initial full elevated `pnpm e2e` with the default parallel worker setting exposed mock singleton state races and timeouts.
- After setting Playwright `workers: 1`, elevated `pnpm e2e`: passed with 30 Chromium tests.
- `git diff --check`: passed.

Blockers:

- None. Per user instruction, do not begin Task 12 until the user verifies Task 11 tests and UI.

### 2026-05-22 - Task 12: Implement Auth UI with Mock Auth, Email Magic Link, and Google OAuth Boundary

Status: completed; waiting for user verification before Task 13.

What changed:

- Added mock auth domain and provider boundary.
  - Added `AuthUser` and `AuthProviderType` to `types/domain.ts`.
  - Added auth provider interfaces and sign-in result types to `server/providers/types.ts`.
  - Added `server/providers/mock-auth.ts` for local email magic-link and Google OAuth mock login.
  - Added `server/providers/auth-provider.ts` so `AUTH_PROVIDER` defaults to mock and `AUTH_PROVIDER=supabase` remains a recoverable unavailable boundary for the later Supabase task.
- Added auth cookies and session helpers in `server/auth/session.ts`.
  - Stores mock user id, email, and provider in HTTP-only cookies.
  - Sanitizes `returnTo` paths for login continuation.
- Added auth gate rules in `server/auth/gates.ts`.
  - Gates repeated anonymous report generation.
  - Gates additional export, watermark removal, and save-history actions.
- Replaced `/auth` skeleton with a real Task 12 auth UI.
  - Supports Email magic-link mock login.
  - Supports Google OAuth mock login boundary.
  - Supports QQ Mail, 163, Outlook, Gmail, and school email input assumptions.
  - Explicitly leaves verification-code login out of MVP.
  - Returns the user to the original gated page after login.
- Added `app/auth/actions.ts`.
  - Runs the auth provider selector.
  - Sets auth cookies.
  - Links the current anonymous session to the mock user after successful login.
- Extended mock persistence.
  - Tracks mock auth users.
  - Links anonymous sessions and generated report sessions to a user.
  - Marks generated linked reports as saved.
  - Counts generated reports for an anonymous session so repeated anonymous generation can be blocked.
  - Saves report-to-history metadata for logged-in users.
- Updated period creation so logged-in users create new analysis sessions with `userId`.
- Updated report generation.
  - Anonymous users can generate one report.
  - A second anonymous report generation returns a login-required message.
  - Logged-in users can continue generating after the mock auth gate.
- Updated share-card behavior.
  - Anonymous users still get one watermarked export.
  - Additional export, save history, and remove-watermark actions show a login continuation link.
  - Logged-in users can save the report to the mock account and generate a non-watermarked user-owned share card.
  - Share page shows the current mock login email.
- Updated route skeleton coverage so `/auth` is treated as an implemented route rather than a Task 3 skeleton.
- Added Task 12 unit coverage in `tests/task12-auth-boundary.test.ts`.
- Added Task 12 browser coverage in `e2e/auth-gate.spec.ts`.

Verification run:

- Red unit test first: `pnpm test tests/task12-auth-boundary.test.ts` failed because `server/auth/gates` and auth provider modules did not exist.
- `pnpm test tests/task12-auth-boundary.test.ts`: passed with 4 tests.
- Red Playwright test first: elevated `pnpm exec playwright test e2e/auth-gate.spec.ts` failed because the share page did not expose a login continuation link and repeated report generation was not gated.
- Elevated `pnpm exec playwright test e2e/auth-gate.spec.ts`: passed with 2 Chromium tests.
- `pnpm lint`: passed.
- Non-elevated `pnpm typecheck`: exposed a test union-type narrowing issue and was also blocked from writing `tsconfig.tsbuildinfo`; the test was fixed.
- Elevated `pnpm typecheck`: passed.
- `pnpm test`: passed with 10 test files and 42 tests.
- Non-elevated `pnpm build`: failed because the sandbox blocked writing `.next/trace-build`.
- Elevated `pnpm build`: passed with Next.js 16.2.6.
- Initial full elevated `pnpm e2e`: exposed the old `/auth` route skeleton assertion.
- Elevated `pnpm exec playwright test e2e/route-skeleton.spec.ts e2e/auth-gate.spec.ts`: passed with 13 Chromium tests after updating `/auth` route expectations.
- Elevated `pnpm e2e`: passed with 32 Chromium tests.
- Final `pnpm lint`: passed.
- Final elevated `pnpm typecheck`: passed.
- `git diff --check`: passed.

Blockers:

- None. Per user instruction, do not begin Task 13 until the user verifies Task 12 tests and UI.

### 2026-05-22 - Task 13: Implement History, Lightweight Dashboard, Delete, and Retention Rules with Mock Persistence

Status: completed; waiting for user verification before Task 14.

What changed:

- Added `server/storage/retention.ts`.
  - Models screenshot retention as `temporary`, `deletable_after_analysis`, or `expired`.
  - Enforces a 24-hour maximum retention window based on created/expires timestamps.
  - Marks raw screenshots as not retained as historical assets.
- Added `lib/dashboard-summary.ts`.
  - Builds a lightweight dashboard summary from a saved `AnalysisSnapshot`.
  - Aggregates exact transactions and accepted estimated aggregates by category.
  - Produces score explanations, risk notes, confirmed-input summary, period labels, and screenshot retention rows.
  - Avoids exposing raw merchant names in dashboard summary output.
- Extended mock persistence and provider interfaces.
  - Added `listSavedReportsForUser`.
  - Added `getSavedReportForUser`.
  - Added `deleteReportForUser`.
  - Delete is owner-scoped and rejects another user's report.
  - Deleting a report removes the mock AI report and its share cards, then marks the analysis session as unsaved/confirmed.
- Replaced `/history` skeleton with a logged-in saved-report list.
  - Logged-out users see a login gate.
  - Logged-in users see saved reports with date/period, personality summary, reopen, dashboard, share, and delete actions.
  - History copy states that raw screenshots are not saved as history.
- Replaced `/dashboard` skeleton with a lightweight details view.
  - Logged-out users see a login gate.
  - Logged-in users can open a selected saved report by `sessionId`.
  - Shows category breakdown, total/exact/estimated amount summary, score explanations, risk notes, confirmed-input summary, and screenshot retention status.
  - Uses Recharts for a simple readable category bar chart without turning the page into a dense finance dashboard.
- Updated result story final screen controls.
  - Added `查看轻量面板` link next to `编辑分享卡`.
  - Dashboard access still requires Task 12 login.
- Updated route skeleton coverage so `/history` and `/dashboard` are treated as implemented routes rather than Task 3 skeleton pages.
- Added Task 13 unit coverage in `tests/task13-history-dashboard.test.ts`.
- Added Task 13 browser coverage in `e2e/history-dashboard.spec.ts`.

Verification run:

- Red unit test first: `pnpm test tests/task13-history-dashboard.test.ts` failed because `lib/dashboard-summary` and `server/storage/retention` did not exist.
- `pnpm test tests/task13-history-dashboard.test.ts`: passed with 3 tests.
- `pnpm test tests/task10-result-story.test.tsx tests/task13-history-dashboard.test.ts`: passed with 5 tests.
- Red Playwright test first: elevated `pnpm exec playwright test e2e/history-dashboard.spec.ts` exposed duplicate `历史战报` headings; the section heading was changed to `已保存战报`.
- Elevated `pnpm exec playwright test e2e/history-dashboard.spec.ts`: passed with 1 Chromium test.
- Elevated `pnpm exec playwright test e2e/route-skeleton.spec.ts e2e/history-dashboard.spec.ts`: passed with 12 Chromium tests.
- `pnpm lint`: passed.
- Elevated `pnpm typecheck`: passed.
- `pnpm test`: passed with 11 test files and 45 tests.
- Elevated `pnpm build`: passed with Next.js 16.2.6.
- Elevated `pnpm e2e`: passed with 33 Chromium tests.

Blockers:

- None. Per user instruction, do not begin Task 14 until the user verifies Task 13 tests and UI.

Post-review copy fix:

- Removed the developer-facing generating-page sentence `赛博扫描动画和进度消息会在这里承接确认后的等待状态。` from the user UI.
- Replaced it with user-facing copy: `正在根据你确认的记录生成消费人格、吐槽和分享内容。`
- Added a Playwright regression assertion so the old developer-facing sentence stays hidden on `/battle/generating`.

Verification run:

- Elevated `pnpm exec playwright test e2e/route-skeleton.spec.ts --grep "/battle/generating"`: passed with 1 Chromium test.
- `pnpm lint`: passed.
- `git diff --check -- lib/route-content.ts e2e/route-skeleton.spec.ts`: passed.

Post-review generating-status copy fix:

- Removed the internal generating status labels `结构校验`, `毒舌安全阀`, and `基准文案过滤` from the user UI.
- Replaced them with user-facing waiting labels: `整理确认记录`, `生成消费人格`, and `准备分享内容`.
- Removed internal copy about output validation, safety checks, and benchmark copy checks from the generating panel body.
- Added Playwright assertions that the old internal labels and copy are hidden.

Verification run:

- Elevated `pnpm exec playwright test e2e/report-generation.spec.ts e2e/route-skeleton.spec.ts --grep "/battle/generating|confirmed rows"`: passed with 2 Chromium tests.
- `pnpm lint`: passed.
- `git diff --check -- app/battle/generating/generate-report-form.tsx e2e/report-generation.spec.ts`: passed.

### 2026-05-22 - Task 14: Integrate Supabase Behind Persistence/Auth Boundaries

Status: completed; waiting for user verification before Task 15.

What changed:

- Added Supabase schema and seed assets.
  - Added `supabase/migrations/20260522140000_task14_core_schema.sql`.
  - Defines tables for `app_users`, `anonymous_sessions`, `analysis_sessions`, `uploaded_images`, `transaction_items`, `confirmed_aggregates`, `category_total_hints`, `extraction_outputs`, `ai_reports`, `share_cards`, and `benchmark_profiles`.
  - Creates private storage buckets for `temporary-uploads` and `share-cards`.
  - Enables RLS on every app table.
  - Adds service-role policies for server-side app operations and authenticated read policies for user-owned saved reports and benchmark profiles.
  - Added `supabase/seed.sql` with China mainland CNY and broad study-abroad benchmark profile seeds.
- Added server-only Supabase configuration and clients.
  - Added `server/supabase/config.ts` to require `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY` before Supabase is considered usable.
  - Added `server/supabase/client.ts` for a service-role Supabase client with no browser session persistence.
- Added Supabase auth boundary.
  - Added `server/providers/supabase-auth.ts`.
  - Updated `server/providers/auth-provider.ts` so `AUTH_PROVIDER=supabase` uses Supabase only when server config is complete.
  - Missing Supabase config returns a recoverable `auth_unavailable` result instead of breaking the UI.
- Added Supabase persistence boundary.
  - Added `server/providers/supabase-persistence.ts` implementing the existing `PersistenceProvider` interface against Supabase tables.
  - Added `server/providers/persistence-provider.ts` to select mock by default and Supabase only when `PERSISTENCE_PROVIDER=supabase` plus complete server config are present.
  - Updated `server/providers/mock-singleton.ts` to keep the old export name while resolving through the new provider selector, so existing Task 5-13 UI flow remains unchanged.
- Updated `.env.example`.
  - Replaced the client-facing persistence provider variable with server-only `PERSISTENCE_PROVIDER=mock`.
  - Added `AUTH_PROVIDER=mock`.
- Added Task 14 unit coverage in `tests/task14-supabase-boundary.test.ts`.
  - Checks required tables, storage buckets, RLS policies, service-role policy intent, benchmark seed coverage, server-only config resolution, provider fallback, and recoverable Supabase Auth failure.

Verification run:

- Red test first: `pnpm exec vitest run tests/task14-supabase-boundary.test.ts` failed because `server/providers/persistence-provider` did not exist.
- `pnpm exec vitest run tests/task14-supabase-boundary.test.ts`: passed with 6 tests.
- `pnpm test`: passed with 12 test files and 52 tests.
- `pnpm lint`: passed.
- Elevated `pnpm typecheck`: passed.
- Elevated `pnpm build`: passed with Next.js 16.2.6.
- Elevated `pnpm e2e`: passed with 33 Chromium tests.
- `rg -n "create table|enable row level security|temporary-uploads|share-cards|service_role|auth.uid|cn_mainland|study_abroad" supabase`: passed and confirmed schema/seed coverage.
- `git diff --check -- server/supabase server/providers .env.example supabase tests/task14-supabase-boundary.test.ts`: passed.

Blockers:

- No remote Supabase project credentials or Supabase CLI migration target were configured in this local session, so the migration was schema-inspected and unit-tested locally but not applied to a live Supabase project.
- Per user instruction, do not begin Task 15 until the user verifies Task 14 tests and behavior.

Post-review report-persona fix:

- Fixed a mock report generation bug where most non-milk-tea categories could still generate `奶茶黑洞人格`.
- Root cause: `server/providers/mock-ai.ts` only compared `milk_tea` and `food_delivery`; when users chose categories such as gaming, online shopping, transport, or social meals, both compared totals were `0`, so the tie fell back to milk tea.
- Updated mock report generation to choose a persona from the dominant confirmed category:
  - `milk_tea` -> `奶茶黑洞人格`
  - `food_delivery` -> `外卖依赖人格`
  - `gaming` -> `游戏氪金战神人格`
  - `online_shopping` -> `网购拆箱成瘾人格`
  - `transport` -> `出门即打车人格`
  - `social_meals` -> `社交燃烧人格`
  - `study_supplies` -> `卷王燃烧人格`
  - `campus_cafeteria` / `other` -> `生存模式人格`
  - `subscriptions` -> `焦虑奋斗人格`
- Added combination-persona handling when no single category dominates:
  - online shopping + social meals + subscriptions -> `假精致人格`
  - study supplies + subscriptions + transport -> `焦虑奋斗人格`
  - campus cafeteria + transport + other -> `生存模式人格`
- Updated Task 9 unit tests to cover category-driven persona selection and combination personas.
- Added a Playwright regression where selecting `gaming` generates `游戏氪金战神人格🎮` and not `奶茶黑洞人格🧋`.
- Hardened the report-generation Playwright helper so full-suite runs can continue through the existing login continuation path if prior state triggers the anonymous repeated-generation gate.
- Fixed the story-flow Playwright locator for `小额高频` to use exact matching after the new milk-tea behavior copy also contained the same phrase.

Verification run:

- Red test first: `pnpm exec vitest run tests/task9-report-generation-boundary.test.ts` failed because `food_delivery` still produced the old `外卖续命人格` and the combination case still produced `奶茶黑洞人格`.
- `pnpm exec vitest run tests/task9-report-generation-boundary.test.ts`: passed with 8 tests.
- Elevated `pnpm exec playwright test e2e/report-generation.spec.ts`: passed with 2 Chromium tests.
- `pnpm lint`: passed.
- `pnpm test`: passed with 12 test files and 54 tests.
- Elevated `pnpm typecheck`: passed.
- Elevated `pnpm build`: passed with Next.js 16.2.6.
- Initial elevated `pnpm e2e` exposed the Playwright helper and locator issues above; after fixing them, elevated `pnpm exec playwright test e2e/report-generation.spec.ts e2e/story-flow.spec.ts` passed with 4 Chromium tests.
- Elevated `pnpm e2e`: passed with 34 Chromium tests.
- Final `pnpm lint`: passed.
- Final elevated `pnpm typecheck`: passed.
- `git diff --check -- server/providers/mock-ai.ts tests/task9-report-generation-boundary.test.ts e2e/report-generation.spec.ts e2e/story-flow.spec.ts memory-bank/progress.md memory-bank/architecture.md`: passed.

Follow-up stale-report fix:

- Fixed the remaining stale-report path reported by the user: after generating a milk-tea report, going back and entering only transport transactions could still show the old milk-tea report.
- Root cause: old reports were still present for the same `analysisSessionId`, and `/battle/generating` reused any existing report without verifying whether it still matched the newly confirmed input.
- Updated `server/providers/mock-persistence.ts` so saving confirmed transactions or confirmed aggregate rows invalidates stale reports and their share cards for the same analysis session.
- Updated `server/providers/supabase-persistence.ts` with the same stale-report invalidation behavior for the Supabase boundary.
- Added `server/reports/staleness.ts` as a defensive guard.
  - It computes the expected persona from current confirmed transactions and accepted aggregates.
  - `/battle/generating` now reuses an existing report only when the report status is reusable and the persona still matches the current confirmed input.
  - `generateReportAction` does not treat replacing a stale report as anonymous repeated report generation.
- Added a unit regression proving a stale milk-tea report is detected when current confirmed input is transport.
- Added a browser regression proving this exact path:
  - generate `奶茶黑洞人格🧋`
  - return to upload
  - enter only transport spending
  - confirm and regenerate
  - result becomes `出门即打车人格🚕`, not `奶茶黑洞人格🧋`

Verification run:

- Red test first: `pnpm exec vitest run tests/task4-mock-providers.test.ts` failed because stale report still remained after confirmed inputs changed.
- `pnpm exec vitest run tests/task4-mock-providers.test.ts`: passed with 6 tests.
- `pnpm exec vitest run tests/task4-mock-providers.test.ts tests/task9-report-generation-boundary.test.ts`: passed with 15 tests.
- Elevated `pnpm exec playwright test e2e/report-generation.spec.ts`: initially reproduced the stale result path; after adding the generating-page staleness guard, passed with 3 Chromium tests.
- `pnpm test`: passed with 12 test files and 56 tests.
- `pnpm lint`: passed.
- Elevated `pnpm typecheck`: passed.
- Elevated `pnpm build`: passed with Next.js 16.2.6.
- Elevated `pnpm e2e`: passed with 35 Chromium tests.

Post-review radar-label UI fix:

- Added visible labels to the five vertices of the result-story score radar chart so users can understand which axis each point represents.
- Expanded the radar SVG viewBox and container width slightly so Chinese labels are not clipped on mobile or desktop.
- Added unit and Playwright assertions that the score radar renders five SVG text labels.

Verification run:

- Elevated `pnpm exec vitest run tests/task10-result-story.test.tsx`: passed with 3 tests.
- Elevated `pnpm exec playwright test e2e/story-flow.spec.ts`: passed with 2 Chromium tests.
- Elevated `pnpm lint`: passed.
- Elevated `pnpm typecheck`: passed.

Post-review benchmark-copy UI fix:

- Removed duplicated benchmark copy on the result-story student benchmark screen.
- Kept the concrete benchmark insight in the lower observation card.
- Replaced the repeated upper paragraph with user-facing context that the benchmark is an entertainment reference, not a real ranking or precise statistic.
- Added a unit regression that the benchmark story body is not the same text as the first benchmark bullet.

Verification run:

- Elevated `pnpm exec vitest run tests/task10-result-story.test.tsx`: passed with 3 tests.
- Elevated `pnpm exec playwright test e2e/story-flow.spec.ts`: passed with 2 Chromium tests.

Post-review risk-copy UI fix:

- Removed duplicated risk copy on the result-story risk warning screen.
- Kept the concrete risk prediction in the lower observation card.
- Replaced the repeated upper paragraph with user-facing context that explains the warning area marks spending rhythms likely to overspend.
- Added a unit regression that the risk story body is not the same text as the first risk bullet.

Verification run:

- Elevated `pnpm exec vitest run tests/task10-result-story.test.tsx`: passed with 3 tests.
- Elevated `pnpm exec playwright test e2e/story-flow.spec.ts`: passed with 2 Chromium tests.

### 2026-05-23 - Task 15: Enable Optional Real OpenAI Providers

Status: completed; waiting for user verification before Task 16.

What changed:

- Strengthened the optional OpenAI extraction provider.
  - Added `server/providers/openai-json.ts` as a shared server-only JSON request helper.
  - OpenAI extraction now validates output with `extractionOutputSchema` inside the provider.
  - Invalid JSON or schema-invalid extraction output is retried once with stricter repair instructions.
  - Slow OpenAI extraction requests are bounded by `OPENAI_REQUEST_TIMEOUT_MS`.
- Strengthened the optional OpenAI report provider.
  - OpenAI report generation now validates output with `aiReportSchema` inside the provider.
  - Invalid JSON or schema-invalid report output is retried once with stricter repair instructions.
  - Slow OpenAI report requests are bounded by `OPENAI_REQUEST_TIMEOUT_MS`.
  - Report output still passes the local roast-safety and benchmark-wording safety layer before saving.
- Kept mock providers as the default path for local development and automated tests.
- Kept OpenAI provider selection server-side only.
  - Extraction requires `AI_PROVIDER=openai`, `OPENAI_API_KEY`, and `OPENAI_EXTRACTION_MODEL`.
  - Report generation requires `AI_REPORT_PROVIDER=openai`, `OPENAI_API_KEY`, and `OPENAI_REPORT_MODEL`.
  - `NEXT_PUBLIC_OPENAI_API_KEY` is ignored and never used as a provider credential.
- Added `OPENAI_REQUEST_TIMEOUT_MS=20000` to `.env.example`.
- Added unit coverage for:
  - server-only provider selection and ignored public OpenAI keys
  - invalid OpenAI extraction output retry and repair
  - invalid OpenAI report output retry and repair
  - extraction/report timeout fallback as recoverable failures
  - OpenAI timeout env parsing

Verification run:

- Elevated `pnpm exec vitest run tests/task7-ai-extraction-boundary.test.ts tests/task9-report-generation-boundary.test.ts`: passed with 22 tests.
- Elevated `pnpm test`: passed with 12 test files and 63 tests.
- Elevated `pnpm lint`: passed.
- Elevated `pnpm typecheck`: passed.
- Elevated `pnpm build`: passed with Next.js 16.2.6.
- Elevated `pnpm e2e`: passed with 35 Chromium tests.

Manual real-provider note:

- No live OpenAI extraction/report flow was run in this local session because no valid `OPENAI_API_KEY` and reachable provider configuration were available. The provider boundary is enabled and covered with injected fake clients plus recoverable unavailable/timeout tests.

### 2026-05-24 - First Vercel Production Deployment

Status: completed.

What changed:

- Linked the local project to Vercel project `yinzhi-s-projects/ai-budget-battle`.
- Deployed the current Next.js app to Vercel production with the existing `vercel.json` settings:
  - Install command: `pnpm install`
  - Build command: `pnpm build`
- Production deployment URL:
  - `https://ai-budget-battle-bmde74dkq-yinzhi-s-projects.vercel.app`
- Stable production alias:
  - `https://ai-budget-battle.vercel.app`
- `.vercel/project.json` was created locally by the Vercel CLI, but `.vercel` is already ignored by `.gitignore`, so no Vercel project binding secrets are intended for git.
- No business code, UI code, provider code, or environment configuration was changed for deployment.

Verification:

- Local `pnpm build`: initially failed in the sandbox because Next.js could not write `.next/trace-build`; elevated rerun passed.
- Vercel production build: passed on Vercel with Next.js 16.2.6 and pnpm 11.1.3.
- Vercel deployment state: `READY`.
- Vercel fetch check for `https://ai-budget-battle.vercel.app/`: returned `200 OK` and served the expected `AI Budget Battle` HTML.

Deployment notes:

- Hosted deployment is currently mock-first by default. Supabase and OpenAI providers remain disabled unless the corresponding Vercel environment variables are configured server-side.
- Mock persistence is in-memory/serverless-process scoped, so hosted anonymous sessions and saved reports are not durable across Vercel instance resets until Supabase is enabled.

### 2026-05-24 - Mobile Upload Step 3 Overflow Fix

Status: completed and redeployed to Vercel production.

What changed:

- Fixed `/battle/upload` mobile layout overflow reported on the deployed site.
- Tightened the upload page summary cards with `w-full`, `min-w-0`, `overflow-hidden`, and breakable text so the selected region/currency and period panels do not widen the viewport.
- Reworked upload form containers and field grids with mobile-safe width constraints.
- Replaced the visible native file input with an accessible hidden file input plus a custom responsive file picker row:
  - The accessible label remains `账单截图`, so existing file-upload interactions still work.
  - The visible row now shows `选择文件` and a truncating selection status instead of letting the browser-native file input stretch the page.
- Added mobile-safe wrapping/min-width handling to source-type cards, manual transaction fields, category-total fields, and saved-row previews.
- Added Playwright regression coverage for a 390px mobile viewport to assert that `/battle/upload` does not create horizontal document overflow.
- Redeployed the fix to Vercel production:
  - Stable URL: `https://ai-budget-battle.vercel.app`
  - Deployment URL: `https://ai-budget-battle-8i50eq91o-yinzhi-s-projects.vercel.app`

Verification:

- `pnpm lint`: passed.
- `pnpm typecheck`: first sandbox run failed because TypeScript could not write `tsconfig.tsbuildinfo`; elevated rerun passed.
- `pnpm exec playwright test e2e/upload-flow.spec.ts`: first sandbox run failed because Playwright could not write `test-results/.last-run.json`; elevated rerun passed with 6 Chromium tests.
- New mobile overflow regression test passed at 390px viewport.
- Local `pnpm build`: passed.
- Vercel production build: passed.
- Vercel deployment state: `READY`, with `https://ai-budget-battle.vercel.app` aliased to the latest production deployment.

### 2026-05-24 - Upload Manual-Only Server Error Recovery

Status: completed and redeployed to Vercel production.

Problem:

- On the deployed Vercel app, users could hit a generic server error after adding only manual transactions from `/battle/upload`.
- Root cause: the current hosted deployment still uses mock in-memory persistence by default. In Vercel Serverless, a later request can run on an instance that does not have the earlier mock analysis session in memory, while the browser still has `abb_analysis_session` and setup cookies. `saveConfirmedTransactions` then threw `Unknown analysis session`, which surfaced as a page-level server error.

What changed:

- Added `server/upload/session-recovery.ts`.
  - It checks whether the cookie's analysis session still exists in persistence.
  - If the session is missing but setup cookies still contain region, currency, and period state, it recreates a fresh analysis session and refreshes the `abb_analysis_session` cookie.
  - If the anonymous session record is also missing, it recreates the anonymous session from the existing cookie or creates a new one.
- Updated `app/battle/upload/actions.ts` so `saveUploadInputs` runs upload session recovery before saving screenshots, manual transactions, or category-total hints.
- Manual-only upload can now continue to `/battle/confirm` even after a Vercel Serverless mock-memory reset, as long as the user's setup cookies are still present.
- Added unit coverage for the exact failure mode: missing mock analysis memory plus existing setup cookies, followed by manual confirmed transaction persistence.
- Redeployed the fix to Vercel production:
  - Stable URL: `https://ai-budget-battle.vercel.app`
  - Deployment URL: `https://ai-budget-battle-qkdo1xa2v-yinzhi-s-projects.vercel.app`
  - Deployment id: `dpl_HyhU7QGCjiLLCcav6RfTyUa6k4A1`

Verification:

- `pnpm lint`: passed.
- `pnpm exec vitest run tests/task6-upload-validation.test.ts`: passed with 6 tests.
- `pnpm typecheck`: first sandbox run failed because TypeScript could not write `tsconfig.tsbuildinfo`; elevated rerun passed.
- `pnpm exec playwright test e2e/upload-flow.spec.ts`: elevated run passed with 6 Chromium tests, including manual-only fallback coverage.
- `pnpm build`: elevated run passed.
- Vercel production build: passed.
- Vercel deployment state: `READY`, with `https://ai-budget-battle.vercel.app` aliased to the latest production deployment.

Remaining note:

- This recovery layer makes the mock-first hosted demo more resilient, but durable multi-device/session persistence still requires enabling the Supabase provider with real server-side environment variables.

### 2026-05-23 - Post-Task-15 UI Polish Notes

Status: in progress; do not start Task 16 until the user verifies the current UI behavior.

Project memory-bank rule update:

- `AGENTS.md` now explicitly requires every future project change to update memory-bank automatically without waiting for another user reminder.
- All future code, UI, style, copy, test, config, dependency, route, data model, provider, deployment, or documentation changes must at least update `memory-bank/progress.md`.
- Architecture/file-responsibility/data-flow/provider/UI-structure changes must also update `memory-bank/architecture.md`.
- Product principle or task-scope changes must also update `memory-bank/design-document.md` or `memory-bank/implementation-plan.md` as appropriate.

What has been updated after Task 15:

- Mobile layout compatibility was improved through global and shell-level responsive fixes.
  - Page-level horizontal overflow is constrained.
  - Battle flow navigation remains horizontally scrollable on small screens.
  - Large headings, CTA rows, media blocks, and form controls use safer mobile widths.
- Result-story presentation was refined based on browser review feedback.
  - Analysis output cards on benchmark and risk screens use larger, more prominent text.
  - Personality titles support emoji display.
  - Persona-specific image assets from `public/personas/` are used in the result reveal and share-card preview paths.
  - Radar chart vertices show readable labels.
  - Repeated benchmark/risk copy was removed so upper explanatory text and lower insight cards do not duplicate the same sentence.
- Share-card presentation was refined after user review.
  - Share cards include the matching persona character image.
  - Persona image backgrounds are blended into the card stage with a softer Cyber glow so black image backplates do not appear as abrupt separate blocks.
  - Persona image stage now scales the character by available height instead of minimum width, enlarging the central character while keeping the full figure visible.
  - Added a white/transparent isolation layer behind the persona image to reduce conflict between black-backed character assets and the Cyber green card background.
  - Share-card character stage now reserves roughly 44% of square cards and 48% of vertical cards for the persona image, matching the target 40%-50% visual emphasis.
  - Restored blend-based image treatment inside the isolation layer so black-backed persona assets merge into the card instead of reading as a separate rectangle.
  - Removed the hard rectangular image backplate from the persona stage and replaced it with a softer radial glow.
  - Added a radial mask to the persona image so black-backed image edges fade into the card background more naturally.
  - Share-card background is now pure black, with cyan/green edge glows around all sides and subtle inner edge light instead of a blue-green card wash.
  - Persona stage was adjusted to sit on the black card background with only low-opacity radial glow, reducing conflict between the character asset and the card.
  - Share-card bottom metadata row now uses fixed two-column tag cells with enough height so period and challenge tags are fully visible.
  - Character emphasis was slightly reduced from the previous allocation to keep the bottom highlight and tag content inside the card bounds.
  - Share cards now use a persona-first layout: the character image is the main visual block, with only the title/roast, highlight, period, and challenge tag kept around it.
  - Removed the over-dense battle score, risk, and challenge panels from the share-card preview after user feedback that the previous layout was chaotic.
  - Xiaohongshu square, Xiaohongshu vertical, and WeChat Moments cards share the simplified visual hierarchy so the exported card reads as a clean social card rather than a mini dashboard.
  - The QR-style decorative block was removed from share cards.
  - WeChat Moments uses the same vertical-card aspect ratio as the Xiaohongshu vertical template.
  - Removed the visible watermark text from the card preview so it no longer overlaps or visually duplicates the period/date and challenge tag row; watermark state remains in the export/auth data model.
  - Share-card export continues to render from the same DOM preview, so visible persona images are included in exported cards.
- Dashboard navigation was improved.
  - `/dashboard?sessionId=...` now shows a mobile-friendly `返回战报` link back to the matching `/battle/result/[sessionId]` story page.

Verification already run for completed UI polish:

- `pnpm lint`: passed after the dashboard return-link update.
- `pnpm typecheck`: passed after the dashboard return-link update.
- Prior targeted share-card/result-story UI checks passed with `pnpm lint`, `pnpm typecheck`, and relevant Task 10/11 unit tests during the earlier polish passes.
- `pnpm lint`: passed after the share-card persona-first layout update.
- `pnpm typecheck`: passed after the share-card persona-first layout update.
- `pnpm exec vitest run tests/task11-share-card.test.tsx`: passed after the share-card persona-first layout update.
- `pnpm lint`: passed after the share-card character scale/isolation update.
- `pnpm typecheck`: passed after the share-card character scale/isolation update.
- `pnpm exec vitest run tests/task11-share-card.test.tsx`: passed after the share-card character scale/isolation update.
- `pnpm lint`: passed after the 40%-50% share-card character emphasis update.
- `pnpm typecheck`: passed after the 40%-50% share-card character emphasis update.
- `pnpm exec vitest run tests/task11-share-card.test.tsx`: passed after the 40%-50% share-card character emphasis update.
- `pnpm lint`: passed after the share-card persona/background blend refinement.
- `pnpm typecheck`: passed after the share-card persona/background blend refinement.
- `pnpm exec vitest run tests/task11-share-card.test.tsx`: passed after the share-card persona/background blend refinement.
- `pnpm lint`: passed after the share-card black-background/edge-glow update.
- `pnpm typecheck`: passed after the share-card black-background/edge-glow update.
- `pnpm exec vitest run tests/task11-share-card.test.tsx`: passed after the share-card black-background/edge-glow update.
- `pnpm lint`: passed after the share-card bottom tag visibility fix.
- `pnpm typecheck`: passed after the share-card bottom tag visibility fix.
- `pnpm exec vitest run tests/task11-share-card.test.tsx`: passed after the share-card bottom tag visibility fix.
- `pnpm lint`: passed after the share-card visible-watermark removal.
- `pnpm typecheck`: passed after the share-card visible-watermark removal.
- `pnpm exec vitest run tests/task11-share-card.test.tsx`: passed after the share-card visible-watermark removal.
- Attempted a local Playwright screenshot check through `node_repl`, but that runtime could not import `playwright`; no dependency was installed or changed for this check.

### 2026-06-18 - GitHub Open-Source Demo Repository Preparation

Status: completed locally; prepared for commit and push to the public GitHub repository.

What changed:

- Replaced the default Next.js `README.md` with a project-specific open-source/demo README.
  - Added live demo and GitHub repository links.
  - Documented product positioning, feature scope, mock-first status, tech stack, project structure, setup commands, provider configuration, privacy notes, and development notes.
- Added `LICENSE` with MIT License text.
- Added `CONTRIBUTING.md` with local setup, verification commands, and project-specific contribution constraints.
- Did not commit a GitHub Actions workflow in this publish pass because the available GitHub credential rejected pushes that create or update `.github/workflows/*` without `workflow` scope.
  - The README and contributing guide still document the local verification commands.
  - A workflow can be added later from GitHub UI or with a token that has `workflow` scope.
- Updated `package.json` repository metadata:
  - description
  - MIT license
  - author
  - homepage
  - repository URL
  - issues URL
  - keywords
- Removed the incorrectly generated duplicate tracked persona asset path named like `:Users:mayinzhi:Desktop:AI-Budget-Battle:public:personas:/...`.
  - Kept the real persona assets under `public/personas/*.png`.
  - `.DS_Store` remains ignored by `.gitignore`.
- Confirmed the GitHub repository is public through the GitHub API:
  - `https://github.com/Yinzhi392/AI-Budget-Battle`

Verification:

- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed with 12 test files and 64 tests.
- `pnpm build`: passed with Next.js 16.2.6.
- `git diff --check`: passed.
- First `git push origin main` attempt was rejected by GitHub because the token lacked `workflow` scope for `.github/workflows/ci.yml`; the workflow file was removed from the final publish commit.

Next status:

- Push the prepared complete demo to GitHub `main` so the repository homepage shows the usable project instead of the old document-only main branch.

## Next Step

Stop here until the user verifies Task 15 tests and behavior. After user verification, proceed to Task 16 from `memory-bank/implementation-plan.md`.

### 2026-08-24 - Premium Landing and GitHub Presentation Redesign

Status: completed locally and ready for GitHub delivery.

What changed:

- Replaced the generic landing route shell with a dedicated, production-style homepage.
  - Added an asymmetric hero, concise Chinese positioning, clear entry CTA, real product sample, low-friction process explanation, privacy commitments, and final conversion section.
  - Added two original editorial campaign images and a production screenshot for the GitHub README.
  - Locked the landing palette to charcoal, silver-grey, and one acid-lime accent.
  - Added restrained Motion entry transitions with reduced-motion support.
- Rebuilt the shared `BattleShell` visual system used by setup, upload, confirmation, generation, result, share, auth, history, and dashboard routes.
  - Replaced the development-placeholder look with a compact brand header, softer surfaces, consistent radii, improved typography, and responsive navigation.
  - Rewrote generic `Step 01` style eyebrows as functional Chinese guidance.
- Added semantic metadata, Open Graph configuration, Geist/Geist Mono through `next/font`, focus-visible styling, and a reduced-motion fallback.
- Declared the root smooth-scroll behavior for Next.js route transitions so development and production navigation share the same documented scroll contract.
- Restored a real visible watermark inside exported share-card DOM previews.
  - This closes the earlier mismatch where anonymous exports were described and modeled as watermarked while the rendered card omitted the watermark.
- Fixed Vitest alias resolution for workspace paths containing spaces by using `fileURLToPath` instead of URL pathname text containing `%20`.
- Rebuilt `README.md` as a Chinese-first GitHub project page with a production preview image, live-demo link, product flow, current capabilities, architecture, provider setup, privacy notes, and contribution path.
- Updated E2E assertions to match the redesigned landing content and unambiguous entry-link selection.

Verification:

- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed with 12 files and 64 tests.
- `pnpm build`: passed with all 13 routes generated or server-rendered successfully.
- `pnpm e2e`: passed with 36 Chromium tests.
- Browser visual review completed at desktop 1440x1000 and mobile 390x844.
- Additional section-level screenshots reviewed for process, sample report, privacy, and mobile report layouts.

Delivery:

- Committed the redesign as `abdcff2` (`Redesign AI Budget Battle experience`).
- Fast-forwarded GitHub `main` from `b4126d7` to `abdcff2` through the already-authorized GitHub SSH key on port 443.
- Verified the remote `main` hash and fetched the redesigned README from GitHub successfully.
- Replaced the invalid local HTTPS remote with the verified SSH 443 origin URL for future repository operations.
- The Vercel production alias had not switched to the redesigned page within the first 50-second post-push observation window, so production deployment remains pending external GitHub/Vercel automation.
