# AI Budget Battle Implementation Plan

> For AI developers: before writing any code, read `AGENTS.md`, `memory-bank/design-document.md`, and `memory-bank/tech-stack.md` completely. Treat those files as the source of truth for scope, architecture, product behavior, and technical choices.

## Global Rules

- Use `pnpm` for all package management and scripts.
- Build mock-first: complete the full product flow with mock storage, mock auth, and mock AI before integrating Supabase or real OpenAI calls.
- Keep a provider boundary for AI and persistence from the first implementation so mock providers can later be swapped for real providers without rewriting UI flows.
- Do not add a separate backend service. Use Next.js App Router, Route Handlers, and Server Actions.
- Do not add a job queue, Kubernetes, native mobile app, payment system, real-time social feed, bank API, real campus ranking, or subscription billing.
- Do not store raw uploaded screenshots long-term. Mark screenshots deletable after analysis and delete them no later than 24 hours after upload.
- Do not claim benchmark comparisons are real user rankings.
- Do not expose Supabase service-role keys or OpenAI keys to client code.
- Do not show raw merchant names or precise transaction details on share cards by default.
- Do not include toxic roast output: no attacks on income, family background, class, body, gender, region, school tier, identity, debt, poverty, mental health, or addiction.
- Use Vercel Analytics for MVP analytics. Do not add any second analytics product in MVP.
- Configure the app to be Vercel-ready during scaffolding, but do not require the first real deployment until the core mock flow works end-to-end.
- After each task, update `memory-bank/progress.md` with task status, date, tests run, result, and blockers.
- After each task or milestone, update `memory-bank/architecture.md` with completed decisions, files changed, behavior added, and test coverage.
- Keep each implementation small, typed, and testable before moving to the next task.

## Required Project Stack

- Next.js App Router
- TypeScript
- pnpm
- Tailwind CSS
- shadcn/ui
- Mock providers first, then Supabase Auth, Postgres, Storage, and RLS
- Mock AI first, then OpenAI API with structured outputs behind a feature/provider switch
- Zod
- React Hook Form
- Recharts
- html-to-image
- Framer Motion or Motion
- Vitest
- Playwright
- Vercel deployment target
- Vercel Analytics
- Sentry

## Locked Implementation Defaults

- Product flow priority: manual transaction input must complete the full MVP path even if screenshot extraction fails or is disabled.
- Screenshot scope: first version must include screenshot upload UI plus mock/real extraction provider boundaries; the manual input path is the guaranteed fallback.
- AI provider: use mock AI by default in local development and tests. Real OpenAI calls are a later provider switch.
- China access risk: because OpenAI may not be directly accessible for some users or operators in China, keep AI calls server-side and isolate them behind a provider interface. If OpenAI access is blocked or unreliable, the implementation must be able to switch to a compatible server-side provider without changing UI flows.
- Auth: first version uses Email magic link plus Google OAuth. Verification-code login is future scope.
- Anonymous limit: first version uses anonymous session cookie plus a session record; refresh should not lose the report, but cross-browser tracking is not required.
- Sharing: anonymous users may export one watermarked share card. Saving history, removing watermark, exporting more than one card, or generating repeated reports requires login.
- Screenshot retention: after analysis, uploaded screenshots are marked deletable; any retained temporary object must expire or be cleaned up within 24 hours.
- Deployment: scaffold Vercel-ready configuration early; perform first real deployment after the core mock flow works.

## Task 1: Normalize Memory Bank and Project Documents

Goal: Make repository guidance consistent before application code exists.

Instructions:

- Confirm `AGENTS.md`, `memory-bank/design-document.md`, `memory-bank/tech-stack.md`, `memory-bank/implementation-plan.md`, `memory-bank/progress.md`, and `memory-bank/architecture.md` exist.
- Confirm no misspelled architecture memory file remains.
- Confirm no root-level `design-document.md`, `tech-stack.md`, or `implementation-plan.md` remains outside `memory-bank`.
- Update `memory-bank/architecture.md` with the initial architecture decisions: Next.js, pnpm, Supabase later, mock-first AI, Vercel Analytics, Vercel-ready deployment, and MVP exclusions.
- Update `memory-bank/progress.md` with Task 1 status and verification results.

Completion criteria:

- The memory-bank filenames are correctly spelled and all root references point to `memory-bank/...` paths.
- `architecture.md` and `progress.md` have clear responsibilities.

Verification:

- Run a file listing for the project root and `memory-bank`.
- Search for old document names and root-level moved documents; expected result is no active reference or misplaced file.
- Read `AGENTS.md` and confirm it points to `memory-bank/design-document.md`, `memory-bank/tech-stack.md`, and `memory-bank/architecture.md`.

Memory updates:

- Update both `memory-bank/progress.md` and `memory-bank/architecture.md`.

## Task 2: Scaffold Next.js with pnpm and Quality Scripts

Goal: Create the baseline Next.js App Router application with required tooling.

Instructions:

- Initialize a Next.js App Router project in the repository root with TypeScript and pnpm.
- Configure Tailwind CSS and shadcn/ui.
- Add scripts for `dev`, `build`, `lint`, `typecheck`, `test`, and `e2e`.
- Install required packages: Zod, React Hook Form, Recharts, html-to-image, Framer Motion or Motion, Supabase client packages, OpenAI SDK, Vercel Analytics, Sentry, Vitest, and Playwright.
- Preserve `AGENTS.md` and `memory-bank` documents.
- Add Vercel-ready project configuration and environment variable documentation, but do not require production deployment yet.

Completion criteria:

- The app starts locally with pnpm.
- Package scripts exist and run.
- Existing memory-bank documents remain intact.

Verification:

- Run pnpm installation.
- Run `pnpm dev` and open the root page.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- Run a minimal Playwright smoke test.

Memory updates:

- Update `progress.md` with commands and results.
- Update `architecture.md` with scaffolding, package manager, scripts, and Vercel-ready choices.

## Task 3: Build App Shell, Cyber Theme, and Route Skeleton

Goal: Establish the full page map before business logic.

Instructions:

- Create routes for landing, region/currency, period, upload, confirm, generating, result, share, auth, history, and lightweight dashboard.
- Add a shared battle-flow shell.
- Add cyber visual tokens: matte black, charcoal, neon green, electric blue, warm orange, high-contrast text, and mobile-first spacing.
- Use placeholder content that honestly indicates unfinished behavior.
- Avoid dense banking-dashboard layouts.

Completion criteria:

- All planned routes load.
- The route skeleton matches `memory-bank/design-document.md`.
- Mobile and desktop layouts are readable.

Verification:

- Run `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
- Use Playwright to visit every route and confirm no page crashes.
- Manually inspect mobile and desktop widths for broken text or overlapping UI.

Memory updates:

- Update `progress.md` with route and test status.
- Update `architecture.md` with route structure, shell decisions, and visual token choices.

## Task 4: Create Mock Data, Mock Persistence, and Mock AI Providers

Goal: Enable full local product flow without Supabase or real OpenAI.

Instructions:

- Define typed domain models for anonymous session, analysis session, uploaded image metadata, transaction item, AI report, share card, and benchmark profile.
- Define Zod schemas for transaction candidates and AI report output.
- Create mock persistence for local development that can store the current analysis session, confirmed transactions, generated report, and one exported anonymous share card.
- Create mock AI extraction provider that returns plausible transaction candidates from uploaded screenshot metadata.
- Create mock AI report provider that returns a complete Cyber Wrapped report matching the schema.
- Keep provider interfaces compatible with later Supabase and OpenAI implementations.

Completion criteria:

- Mock providers support the complete flow from session creation to report generation.
- Mock provider outputs validate through Zod.
- No real external service is required for local tests.

Verification:

- Add unit tests for schemas and mock provider outputs.
- Add tests that invalid mock payloads are rejected.
- Run `pnpm lint`, `pnpm typecheck`, and `pnpm test`.

Memory updates:

- Update `progress.md` with test results.
- Update `architecture.md` with provider interfaces, mock storage behavior, and schema boundaries.

## Task 5: Implement Anonymous Session, Region/Currency, and Period Flow with Mock Persistence

Goal: Let users start anonymously and configure analysis context before upload.

Instructions:

- Create an anonymous session on first battle start using a session cookie plus mock session record.
- Default to China mainland and CNY.
- Allow alternate region and currency choices for overseas or international Chinese-speaking students.
- Add period choices for this week, this month, and custom period.
- Persist setup choices across route transitions and refreshes.
- Prevent upload access without valid session, region, currency, and period.

Completion criteria:

- A new anonymous user completes setup without login.
- Refresh does not lose setup state.
- Cross-browser tracking is not required.
- Missing setup redirects users to the correct earlier step.

Verification:

- Add unit tests for region, currency, period, and anonymous limit validation.
- Add Playwright tests for setup, refresh persistence, and invalid-step redirect.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and targeted Playwright tests.

Memory updates:

- Update `progress.md` with test results.
- Update `architecture.md` with anonymous session cookie behavior and setup validation.

## Task 6: Implement Upload UI and Manual Transaction Input Fallback

Goal: Ensure users can complete data entry even without OCR.

Instructions:

- Build screenshot upload UI with temporary upload status and privacy note.
- Build manual transaction input with amount, currency, category, time or period, and optional merchant or note.
- Ensure category options reflect selected region and default China mainland categories.
- Keep manual input as the guaranteed path to report generation.
- Uploaded screenshot metadata should feed the mock extraction provider, but failed extraction must not block manual input.

Completion criteria:

- Users can upload one or more screenshots in the UI.
- Users can manually add valid transactions.
- Invalid manual entries show clear errors.
- A user can proceed with manual entries even when extraction is unavailable.

Verification:

- Add unit tests for manual transaction validation.
- Add Playwright tests for manual-only flow and screenshot-upload-with-manual-fallback flow.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and upload-flow Playwright tests.

Memory updates:

- Update `progress.md` with test results.
- Update `architecture.md` with upload UI, fallback behavior, and category source.

## Task 7: Implement Mock/Real AI Extraction Boundary

Goal: Prepare screenshot extraction for future OpenAI use without blocking MVP flow.

Instructions:

- Add an extraction provider switch with mock as the default provider.
- Add a server-only real OpenAI extraction provider behind environment configuration, but keep it disabled by default.
- Keep all AI calls server-side.
- Validate all extraction outputs with Zod.
- If OpenAI is unavailable, blocked, or returns invalid output, fall back to manual input and show a recoverable error.
- Document that China access risk is handled by server-side provider isolation and can later support another compatible AI provider.

Completion criteria:

- Mock extraction works by default.
- Real extraction can be configured later without UI rewrites.
- Invalid extraction output never reaches confirmation as trusted data.

Verification:

- Add tests for provider selection, successful mock extraction, invalid output rejection, and real-provider unavailable fallback.
- Add Playwright test where extraction fails and manual input still completes.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and targeted Playwright tests.

Memory updates:

- Update `progress.md` with test results.
- Update `architecture.md` with AI provider boundary, OpenAI access risk, fallback behavior, and schema validation.

## Task 8: Implement Transaction Confirmation Table

Goal: Make user confirmation the data-quality gate before report generation.

Instructions:

- Build editable rows for OCR candidates and manual entries.
- Allow editing amount, currency, category, merchant or note, and time.
- Allow deleting incorrect rows and adding missing rows.
- Show confidence indicators for AI-extracted rows.
- Require amount, currency, category, and time or period before confirmation.
- Save only confirmed transaction items for report generation.

Completion criteria:

- Users can correct extracted or manual rows before analysis.
- Invalid rows block report generation.
- Confirmed rows become the only report input.

Verification:

- Add unit tests for row validation and confirmation eligibility.
- Add interaction tests for edit, delete, add, and confirm behavior.
- Add Playwright test for correcting a low-confidence row and confirming valid data.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and confirmation-flow Playwright tests.

Memory updates:

- Update `progress.md` with test results.
- Update `architecture.md` with confirmation behavior and persistence rules.

## Task 9: Implement Mock/Real AI Report Generation Boundary

Goal: Generate a safe structured Cyber Wrapped report from confirmed transactions.

Instructions:

- Use mock report generation by default.
- Add a server-only real OpenAI report provider behind environment configuration, disabled by default.
- Validate personality, roast, scores, benchmark insights, risk predictions, challenge, and share copy with Zod.
- Generate reports only from confirmed transaction items.
- Use benchmark profiles rather than real user ranking data.
- Enforce benchmark wording that never claims real ranking or real percentile.
- Add local roast safety checks before saving or rendering.
- Reject or regenerate unsafe roast output.

Completion criteria:

- Mock report generation produces complete valid report data.
- Unsafe roast output is blocked or regenerated.
- Benchmark insights never claim real ranking.
- Report generation failure is recoverable with retry.

Verification:

- Add schema tests for valid and invalid report payloads.
- Add safety tests for forbidden roast categories.
- Add benchmark wording tests rejecting real-ranking claims.
- Add provider tests for mock success, invalid AI structure, unsafe roast, and unavailable real provider.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and report-generation tests.

Memory updates:

- Update `progress.md` with test results.
- Update `architecture.md` with report provider boundary, roast safety, benchmark constraints, and retry behavior.

## Task 10: Build Cyber Wrapped Result Story Flow

Goal: Reveal report results as the main product experience.

Instructions:

- Build story screens for personality reveal, dramatic spending behavior, roast, battle scores, benchmark comparison, risk prediction, challenge tag, and share preview.
- Use mobile-first navigation with forward and backward movement.
- Use cyber styling, animated transitions, and high-contrast score presentation.
- Keep dense transaction tables out of the story flow.
- Do not expose raw merchant details by default.
- Add fallback states for missing or failed report data.

Completion criteria:

- A generated mock report renders all story screens in sequence.
- Users can navigate through the full story.
- Story UI does not reveal raw merchants by default.

Verification:

- Add render tests for all story screens from a sample report object.
- Add Playwright tests for mobile and desktop story navigation.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and story-flow Playwright tests.

Memory updates:

- Update `progress.md` with test results.
- Update `architecture.md` with story sequence, render assumptions, and privacy defaults.

## Task 11: Implement Share Card Templates, Watermark Rules, and Export

Goal: Generate share cards optimized for Xiaohongshu and WeChat while supporting anonymous viral sharing.

Instructions:

- Build templates for Xiaohongshu square, Xiaohongshu vertical, and WeChat Moments.
- Include personality title, one roast line, one score or benchmark highlight, period, challenge tag, product watermark, and optional QR or invite link.
- Hide raw merchant names and precise transaction details by default.
- Allow anonymous users to export exactly one watermarked card.
- Require login to save history, remove watermark, export additional cards, or generate repeated reports beyond the anonymous allowance.
- Export cards with html-to-image.
- Persist exported card metadata in mock persistence first.

Completion criteria:

- Users can preview each template.
- Anonymous users can export one watermarked card.
- Additional export/save/remove-watermark actions trigger login.
- Exported cards preserve privacy defaults.

Verification:

- Add tests verifying share card props exclude raw merchant details by default.
- Add tests for anonymous one-card limit and login gate after the limit.
- Add Playwright checks for each template size and export path.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and share-card Playwright tests.

Memory updates:

- Update `progress.md` with test results.
- Update `architecture.md` with template formats, watermark policy, anonymous export limit, and export method.

## Task 12: Implement Auth UI with Mock Auth, Email Magic Link, and Google OAuth Boundary

Goal: Convert anonymous users after value is proven without blocking the mock MVP.

Instructions:

- Build auth UI for Email magic link and Google OAuth.
- Use mock auth by default for local full-flow development.
- Keep Supabase Auth integration behind a provider boundary for the later real-service task.
- Do not implement verification-code login in MVP.
- Support QQ Mail, 163, Outlook, Gmail, and school email domains through the email input and provider assumptions.
- Link anonymous report data to the logged-in user when auth succeeds.
- Gate save history, remove watermark, additional exports, and repeated report generation behind login.

Completion criteria:

- Anonymous users can finish one report and one watermarked export.
- Login gate appears at the required moments.
- Mock login links anonymous report data to the user.

Verification:

- Add auth provider tests for mock login and login-required actions.
- Add Playwright tests for anonymous generation, one watermarked export, login prompt on restricted actions, and post-login continuation.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and auth-gate Playwright tests.

Memory updates:

- Update `progress.md` with test results.
- Update `architecture.md` with auth provider boundary, auth methods, and anonymous-to-user linking behavior.

## Task 13: Implement History, Lightweight Dashboard, Delete, and Retention Rules with Mock Persistence

Goal: Support saved-report review without turning the product into a banking dashboard.

Instructions:

- Build history page with saved reports, date, period, personality summary, reopen, share, and delete actions.
- Build lightweight dashboard reachable after the story report.
- Show category breakdown, score explanations, confirmed transaction summary, and risk notes.
- Use Recharts only for simple readable charts.
- Avoid dense spreadsheet-like layouts.
- Add report deletion for logged-in users.
- Ensure raw screenshots are not retained as historical assets.
- Mark screenshots deletable after analysis and enforce a 24-hour maximum retention rule in the mock retention model.

Completion criteria:

- Logged-in mock users can view, reopen, share, and delete saved reports.
- Dashboard provides supporting detail without exposing screenshots.
- Retention rules are represented and testable.

Verification:

- Add unit tests for dashboard aggregation and retention status.
- Add access tests for deleting own report and rejecting another user's report.
- Add Playwright tests for history, reopen, dashboard, and delete.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and dashboard/history Playwright tests.

Memory updates:

- Update `progress.md` with test results.
- Update `architecture.md` with history behavior, dashboard scope, deletion behavior, and 24-hour screenshot retention.

## Task 14: Integrate Supabase Behind the Existing Persistence/Auth Boundaries

Goal: Replace mock persistence/auth with Supabase without changing the completed UI flow.

Instructions:

- Configure Supabase Auth for Email magic link and Google OAuth.
- Create tables for users, anonymous sessions, analysis sessions, uploaded images, transaction items, AI reports, share cards, and benchmark profiles.
- Create private temporary upload storage and share card storage.
- Enable RLS for user-owned and session-owned data.
- Implement anonymous session cookie plus Supabase session record.
- Preserve mock providers for tests and local fallback.
- Keep service-role operations server-side only.
- Seed China mainland CNY benchmark profiles and broad overseas Chinese-speaking student profiles.

Completion criteria:

- Existing mock-flow tests still pass.
- Supabase provider can run the same core flow with real persistence.
- RLS prevents cross-user saved report access.
- Anonymous refresh does not lose session state.

Verification:

- Run Supabase migration or schema validation commands.
- Inspect tables, storage buckets, and policies.
- Add integration tests for anonymous session creation, report save/read, history access, and forbidden cross-user access.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and Supabase integration tests.

Memory updates:

- Update `progress.md` with test results.
- Update `architecture.md` with Supabase schema, RLS policy intent, storage buckets, and auth integration decisions.

## Task 15: Enable Optional Real OpenAI Providers

Goal: Add real OpenAI extraction/report generation as an optional server-side provider after mock flow and Supabase flow are stable.

Instructions:

- Add environment-controlled provider selection for extraction and report generation.
- Keep mock AI as the default in local development and automated tests.
- Keep real OpenAI calls server-side only.
- Validate all real OpenAI outputs with the same Zod schemas as mock outputs.
- Retry invalid structured output once with stricter instructions.
- If OpenAI is blocked, unavailable, or too slow, return a recoverable error and keep manual input/report retry paths available.
- Document that China-facing users interact with the app server, not OpenAI directly; if server-side OpenAI access is not viable, replace the provider behind the same interface.

Completion criteria:

- Real provider can be enabled by environment configuration.
- The app remains functional with mock provider disabled or real provider unavailable.
- No OpenAI key reaches client code.

Verification:

- Add tests for provider selection, server-only key access, invalid output retry, unavailable-provider fallback, and schema validation.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and targeted provider tests.
- Manually test one real extraction/report generation flow only when a valid API key and reachable provider are available.

Memory updates:

- Update `progress.md` with test/manual results.
- Update `architecture.md` with AI provider selection, OpenAI access assumptions, fallback behavior, and future alternate-provider path.

## Task 16: Add Vercel Analytics, Sentry, and Error Boundaries

Goal: Measure the MVP funnel and capture errors without collecting sensitive financial data.

Instructions:

- Add Vercel Analytics for landing start, region/currency completion, upload start, extraction success/failure, confirmation completion, report generation completion, story completion, share export, login conversion, and repeat generation.
- Do not send raw transaction details, merchant names, screenshot content, or private report text to analytics.
- Add Sentry for frontend and server errors.
- Add recoverable error states for upload, extraction, report generation, result rendering, and share card export.
- Document required environment variables.

Completion criteria:

- Funnel events fire with non-sensitive metadata.
- Sentry captures local or preview validation errors.
- User-facing failures are recoverable where possible.

Verification:

- Add tests or mocks confirming analytics payloads exclude sensitive fields.
- Add error-state tests for upload failure, extraction failure, report failure, and share export failure.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and targeted Playwright error scenarios.

Memory updates:

- Update `progress.md` with test results.
- Update `architecture.md` with analytics event names, privacy constraints, Sentry setup, and error handling decisions.

## Task 17: First Real Vercel Deployment and End-to-End Acceptance

Goal: Deploy only after the core flow works locally and documentation matches implementation.

Instructions:

- Confirm core mock flow passes locally before deployment.
- Configure Vercel environment variables for the selected providers.
- Deploy to a preview environment first.
- Run the anonymous path: start battle, choose region/currency, choose period, upload or manually enter transactions, confirm rows, generate report, navigate story, export one watermarked card, trigger login on restricted actions.
- Run the logged-in path: login, save report, view history, reopen report, share, and delete report.
- Run failure paths: failed extraction, invalid manual transaction, unsafe roast regeneration, report generation failure, share export failure, and unavailable real AI provider.
- Review `AGENTS.md`, `memory-bank/design-document.md`, `memory-bank/tech-stack.md`, `memory-bank/implementation-plan.md`, `memory-bank/progress.md`, and `memory-bank/architecture.md` for consistency.
- Confirm all MVP exclusions remain excluded.

Completion criteria:

- Full local suite passes.
- Preview deployment runs the core flow.
- Documentation matches implemented behavior.
- No accidental scope expansion is present.

Verification:

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and full Playwright suite locally.
- Run key Playwright journeys against the preview deployment if environment access allows.
- Manually inspect mobile and desktop flows.
- Confirm no raw screenshots are retained as historical report data.
- Confirm share cards hide merchant names and precise transaction details by default.
- Confirm benchmark text does not claim real rankings.
- Confirm `memory-bank/progress.md` and `memory-bank/architecture.md` include every completed milestone.

Memory updates:

- Update `progress.md` with final test and deployment results.
- Update `architecture.md` with final MVP implementation summary, known limits, provider settings, and future-phase boundaries.

## Final Acceptance Checklist

- `AGENTS.md`, `memory-bank/design-document.md`, `memory-bank/tech-stack.md`, `memory-bank/implementation-plan.md`, `memory-bank/progress.md`, and `memory-bank/architecture.md` exist.
- The app uses Next.js App Router, TypeScript, pnpm, Tailwind CSS, shadcn/ui, Supabase, OpenAI provider boundary, Zod, Vitest, Playwright, Vercel Analytics, and Sentry.
- Mock providers complete the full core flow before real Supabase or OpenAI are required.
- The app supports anonymous first use with cookie plus session record.
- Region and currency selection happens before upload.
- Screenshot upload UI exists, and manual transaction input can complete the full flow.
- AI extraction returns validated candidate transactions or fails safely.
- The confirmation table blocks invalid report generation.
- AI report generation returns validated structured data.
- Roast safety checks block toxic content.
- Benchmark copy does not claim real user ranking.
- Cyber Wrapped result flow renders the complete story.
- Share cards support Xiaohongshu and WeChat formats.
- Anonymous users can export exactly one watermarked card.
- Login is required for save history, remove watermark, extra exports, and repeated reports beyond anonymous allowance.
- Email magic link and Google OAuth are the MVP auth methods.
- Saved history supports reopen, share, and delete.
- Screenshots are marked deletable after analysis and retained no longer than 24 hours.
- Vercel Analytics avoids sensitive transaction data.
- Sentry error tracking is configured.
- First real Vercel deployment happens only after the core local flow works.
- Lint, typecheck, unit tests, build, and Playwright tests pass.
- `memory-bank/progress.md` and `memory-bank/architecture.md` are updated after every completed task or milestone.
