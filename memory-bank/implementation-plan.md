# AI Budget Battle Implementation Plan

> For AI developers: before writing any code, read `AGENTS.md`, `memory-bank/design-document.md`, and `memory-bank/tech-stack.md` completely. Treat those files as the source of truth for scope, architecture, product behavior, and technical choices.

## Global Rules

- Do not add a separate backend service. Use Next.js App Router, Route Handlers, and Server Actions.
- Do not add a job queue, Kubernetes, native mobile app, payment system, real-time social feed, bank API, real campus ranking, or subscription billing.
- Do not store raw uploaded screenshots long-term.
- Do not claim benchmark comparisons are real user rankings.
- Do not expose Supabase service-role keys or OpenAI keys to client code.
- Do not show raw merchant names or precise transaction details on share cards by default.
- Do not include toxic roast output: no attacks on income, family background, class, body, gender, region, school tier, identity, debt, poverty, mental health, or addiction.
- After each task or milestone, update `memory-bank/architechture.md` with the completed decision, files changed, behavior added, and tests run.
- Keep each implementation small, typed, and testable before moving to the next task.

## Required Project Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth, Postgres, Storage, and RLS
- OpenAI API with structured outputs
- Zod
- React Hook Form
- Recharts
- html-to-image
- Framer Motion or Motion
- Vitest
- Playwright
- Vercel deployment target
- PostHog or Vercel Analytics
- Sentry

## Task 1: Normalize Project Documents and Architecture Memory

Goal: Make repository guidance consistent before any application code exists.

Instructions:

- Confirm `memory-bank/design-document.md`, `memory-bank/tech-stack.md`, and `AGENTS.md` exist in the project root.
- If any old `design-document-md` file remains, remove it only after confirming `memory-bank/design-document.md` has the same content.
- Confirm `memory-bank/architechture.md` exists; create it if missing.
- In `memory-bank/architechture.md`, record that the project uses Next.js, Supabase, OpenAI, Vercel, Zod, Vitest, and Playwright.
- Record that the MVP excludes real rankings, in-app social feed, bank API, payment system, and long-term raw screenshot storage.
- Record that all future milestone completions must update this file.

Completion criteria:

- The project contains `AGENTS.md`, `memory-bank/design-document.md`, `memory-bank/tech-stack.md`, and `memory-bank/implementation-plan.md`.
- `memory-bank/architechture.md` exists and summarizes the initial architecture decisions.

Verification:

- Run a directory listing and confirm the four required root documents are present.
- Search the root for `design-document-md`; expected result is no active project document with that name.
- Read `memory-bank/architechture.md` and confirm it mentions the stack, MVP exclusions, and update rule.

Architecture memory update:

- Add the initial entry to `memory-bank/architechture.md` before marking this task complete.

## Task 2: Scaffold the Next.js Application

Goal: Create the baseline Next.js App Router application with the required frontend tooling.

Instructions:

- Initialize a Next.js App Router project in the repository root using TypeScript.
- Configure Tailwind CSS.
- Add shadcn/ui support.
- Add package scripts for development, build, linting, type checking, unit tests, and end-to-end tests.
- Install the required product dependencies: Supabase client packages, OpenAI SDK, Zod, React Hook Form, Recharts, html-to-image, Framer Motion or Motion, Sentry, and analytics tooling.
- Install Vitest and Playwright for testing.
- Preserve the existing project documents.

Completion criteria:

- The app starts locally.
- The root page renders without runtime errors.
- Package scripts exist for dev, build, lint, typecheck, test, and e2e.
- Existing documents remain in the root.

Verification:

- Run dependency installation successfully.
- Run the development server and open the root page.
- Run lint, typecheck, unit test, and build commands.
- Run Playwright installation and a minimal browser smoke check.

Architecture memory update:

- Record the scaffolding choices, package manager, scripts, and any setup deviations in `memory-bank/architechture.md`.

## Task 3: Build the Base App Shell, Theme, and Route Skeleton

Goal: Establish the user-facing route structure and cyber visual foundation without implementing business logic yet.

Instructions:

- Create routes for landing, region and currency selection, period selection, upload, confirmation, generating, result, share, auth, history, and lightweight dashboard.
- Add a shared app shell for the battle flow.
- Add cyber visual tokens: matte black, charcoal, neon green, electric blue, warm orange, high-contrast text, and mobile-first layout spacing.
- Add placeholder UI content that matches the product direction but does not pretend features are complete.
- Ensure the UI avoids dense banking dashboard patterns.

Completion criteria:

- All planned routes are reachable.
- The app has a consistent dark cyber visual direction.
- The route skeleton reflects the flow from `memory-bank/design-document.md`.

Verification:

- Run lint, typecheck, and build.
- Use Playwright to visit each route and confirm the page loads without client errors.
- Manually inspect mobile and desktop widths for obvious text overflow or broken layout.

Architecture memory update:

- Record route decisions, shell structure, visual token choices, and route coverage in `memory-bank/architechture.md`.

## Task 4: Configure Supabase Schema, Storage, and RLS

Goal: Define the data foundation for anonymous sessions, reports, transactions, uploads, share cards, and benchmark profiles.

Instructions:

- Configure Supabase local or hosted project settings according to `memory-bank/tech-stack.md`.
- Create database tables for users, anonymous sessions, analysis sessions, uploaded images, transaction items, AI reports, share cards, and benchmark profiles.
- Create private storage for temporary uploads.
- Create storage for share card images according to the chosen sharing policy.
- Enable Row Level Security early.
- Add policies so users only access their own saved reports.
- Add policies so anonymous sessions access only their own temporary analysis session.
- Restrict service-role operations to server-side code.
- Add seed benchmark profiles for China mainland CNY categories and broad overseas Chinese-speaking student categories.

Completion criteria:

- Tables, relationships, and storage buckets exist.
- RLS is enabled for user-owned and session-owned records.
- Benchmark seed data exists for the MVP.

Verification:

- Run Supabase migration or schema validation commands.
- Use database inspection to confirm tables, columns, and policies.
- Run a server-side smoke test that creates and reads an anonymous analysis session.
- Confirm client-side code cannot use the service-role key.

Architecture memory update:

- Record table names, storage buckets, RLS policy intent, benchmark seed approach, and any Supabase environment assumptions.

## Task 5: Implement Anonymous Session, Region/Currency, and Period Flow

Goal: Let users start anonymously and configure analysis context before uploading data.

Instructions:

- Create an anonymous session on first battle start.
- Store region, currency, and student scenario in the analysis session.
- Default to China mainland and CNY.
- Allow alternate region and currency choices for overseas or international Chinese-speaking students.
- Add period choices for this week, this month, and custom period.
- Persist choices across route transitions.
- Prevent users from entering upload without a valid session, region, currency, and period.

Completion criteria:

- A new anonymous user can complete the setup flow without logging in.
- The selected region, currency, and period appear in later flow state.
- Invalid or missing setup redirects users to the correct earlier step.

Verification:

- Add unit tests for region, currency, and period validation.
- Add Playwright tests for the anonymous setup flow.
- Run lint, typecheck, unit tests, and the setup-flow Playwright test.

Architecture memory update:

- Record anonymous session behavior, default localization choices, and validation rules.

## Task 6: Implement Screenshot Upload and Manual Transaction Input

Goal: Collect spending data through screenshots and manual entries before AI extraction.

Instructions:

- Build a mobile-first upload page with screenshot dropzone and manual add action.
- Upload screenshots to temporary private storage.
- Show clear privacy text that screenshots are temporary and not stored long-term.
- Build manual transaction entry with amount, currency, category, time or period, and optional merchant or note.
- Ensure categories reflect the selected region and default China mainland categories.
- Prevent submission when required manual fields are missing.

Completion criteria:

- Users can upload one or more screenshots.
- Users can manually add valid transaction items.
- Invalid manual entries show clear validation errors.
- Uploaded screenshots are associated with the current analysis session.

Verification:

- Add unit tests for manual transaction validation.
- Add integration tests for storage upload metadata.
- Add Playwright tests for adding a manual transaction and seeing it prepared for confirmation.
- Run lint, typecheck, unit tests, and the upload-flow Playwright test.

Architecture memory update:

- Record upload storage decisions, manual entry validation, and category source behavior.

## Task 7: Implement AI/OCR Extraction Route and Structured Candidate Schema

Goal: Extract candidate transactions from screenshots using OpenAI vision-capable models and strict validation.

Instructions:

- Create a server-only AI extraction module.
- Define a Zod schema for extracted transaction candidates.
- Ensure extracted fields include amount, currency, category candidate, merchant or note, transaction time when available, source image reference, and confidence.
- Call OpenAI only from server-side code.
- Validate AI output before saving or showing it.
- Mark low-confidence fields clearly for the confirmation step.
- If extraction fails, return a recoverable error and keep manual input available.
- If AI returns invalid structure, retry once with a stricter repair instruction.

Completion criteria:

- Screenshot extraction returns validated candidate rows.
- Invalid AI output is rejected safely.
- Extraction failure does not block manual input.
- API keys remain server-only.

Verification:

- Add schema tests for valid and invalid extraction payloads.
- Add server tests that mock successful extraction, invalid JSON, and extraction failure.
- Add a Playwright scenario where extraction failure still allows manual transaction confirmation.
- Run lint, typecheck, unit tests, and targeted Playwright tests.

Architecture memory update:

- Record the extraction route, schema boundaries, retry policy, and failure behavior.

## Task 8: Implement Transaction Confirmation Table

Goal: Make user confirmation the data-quality gate before report generation.

Instructions:

- Build an editable confirmation table for OCR candidates and manual entries.
- Allow users to edit amount, currency, category, merchant or note, and time.
- Allow users to delete incorrect rows.
- Allow users to add missing rows.
- Show confidence indicators for AI-extracted rows.
- Require all confirmed rows to have amount, currency, category, and time or period.
- Save only confirmed transaction items for analysis.

Completion criteria:

- Users can correct OCR candidates before analysis.
- Users cannot generate a report with invalid transaction rows.
- Confirmed rows are saved as structured transaction items.

Verification:

- Add unit tests for row validation and confirmation eligibility.
- Add component or interaction tests for edit, delete, add, and confirm behavior.
- Add Playwright test for correcting a low-confidence row and generating a valid confirmation payload.
- Run lint, typecheck, unit tests, and confirmation-flow Playwright tests.

Architecture memory update:

- Record confirmation table behavior, required fields, confidence handling, and persistence rules.

## Task 9: Implement AI Report Generation, Safety Checks, and Benchmark Constraints

Goal: Generate the Cyber Wrapped report from confirmed transactions with safe roast and benchmark wording.

Instructions:

- Create a server-only report generation module.
- Define Zod schemas for personality, roast, scores, benchmark insights, risk predictions, challenge, and share copy.
- Generate reports only from confirmed transaction items.
- Use benchmark profiles rather than real user ranking data.
- Enforce wording that describes comparisons as benchmark-style, not real rankings.
- Add local safety checks for roast output before saving or rendering.
- Reject or regenerate unsafe roast text.
- Save the validated report to the report table.

Completion criteria:

- Report generation produces validated structured data.
- Unsafe roast output is blocked or regenerated.
- Benchmark insights never claim real ranking or real percentile unless a future real aggregation system exists.
- Report generation failure is recoverable with retry.

Verification:

- Add schema tests for valid and invalid report payloads.
- Add safety tests covering forbidden roast categories.
- Add benchmark wording tests that reject real-ranking claims.
- Add server tests for successful generation, unsafe roast, invalid AI structure, and retry.
- Run lint, typecheck, unit tests, and report-generation tests.

Architecture memory update:

- Record report schema decisions, roast safety checks, benchmark constraints, and retry behavior.

## Task 10: Build the Cyber Wrapped Result Story Flow

Goal: Reveal AI report results as the main product experience.

Instructions:

- Build story screens for personality reveal, dramatic spending behavior, roast, battle scores, benchmark comparison, risk prediction, challenge tag, and share preview.
- Use mobile-first story navigation.
- Use cyber visual styling, animated transitions, and high-contrast score presentation.
- Keep dense transaction tables out of the story flow.
- Add a clear path from result to share card editor.
- Add a fallback state for missing or failed report data.

Completion criteria:

- A generated report renders all story screens in the planned sequence.
- Users can navigate forward and backward through the story.
- Result rendering does not expose raw merchant details by default.

Verification:

- Add tests that render all story screens from a sample report object.
- Add Playwright tests for navigating the story flow on mobile and desktop viewports.
- Run lint, typecheck, unit tests, build, and story-flow Playwright tests.

Architecture memory update:

- Record story screen sequence, rendering assumptions, and privacy defaults.

## Task 11: Implement Share Card Templates and Export

Goal: Generate static sharing cards optimized for Xiaohongshu and WeChat.

Instructions:

- Build share card templates for Xiaohongshu square, Xiaohongshu vertical, and WeChat Moments.
- Include personality title, one roast line, one score or benchmark highlight, period, challenge tag, product watermark, and optional QR or invite link.
- Hide raw merchant names and precise transaction details by default.
- Add field visibility controls only for safe fields.
- Export cards with html-to-image.
- Persist exported card metadata and image location when a user saves or exports.

Completion criteria:

- Users can preview each template.
- Users can export an image for each target format.
- Exported cards preserve safe privacy defaults.
- Export or save triggers login for anonymous users according to the auth plan.

Verification:

- Add tests that verify share card props do not include raw merchant details by default.
- Add visual or Playwright checks for each template size.
- Add Playwright test for previewing and exporting a share card.
- Run lint, typecheck, unit tests, build, and share-card Playwright tests.

Architecture memory update:

- Record template formats, export method, privacy defaults, and persistence behavior.

## Task 12: Implement Authentication Gate and Saved Report History

Goal: Convert anonymous users after value is proven and support report history for logged-in users.

Instructions:

- Configure Supabase Auth for email magic link or verification code.
- Configure Google OAuth as an optional login path.
- Ensure QQ Mail, 163, Outlook, Gmail, and school email domains can use email login.
- Allow anonymous users to generate one report.
- Require login for saving reports, exporting share cards, viewing history, and generating multiple reports across sessions.
- Link anonymous report data to the user after successful login when appropriate.
- Build a history page listing saved reports with date, period, personality summary, reopen, share, and delete actions.

Completion criteria:

- Anonymous users can complete one report without login.
- Save, export, history, and repeat-use gates prompt login.
- Logged-in users can view and manage their saved reports.

Verification:

- Add auth flow tests with mocked Supabase Auth responses.
- Add Playwright tests for anonymous generation, login prompt on save/export, and history access after login.
- Add tests that users cannot access another user's saved report.
- Run lint, typecheck, unit tests, and auth/history Playwright tests.

Architecture memory update:

- Record auth provider choices, anonymous-to-user linking behavior, and history access rules.

## Task 13: Implement Lightweight Dashboard, Delete, and Privacy Retention Behavior

Goal: Provide supporting detail after the story report without becoming a traditional banking dashboard.

Instructions:

- Build a lightweight dashboard reachable after the story report.
- Show category breakdown, score explanations, confirmed transaction summary, and risk notes.
- Use Recharts only for simple readable charts.
- Avoid dense spreadsheet-like layouts.
- Add report deletion for logged-in users.
- Ensure deletion removes saved report records and share card metadata according to the privacy model.
- Ensure raw screenshots remain temporary and are not retained as historical assets.

Completion criteria:

- Users can inspect supporting report details after the story flow.
- Users can delete their own saved reports.
- Dashboard does not expose raw screenshot assets.

Verification:

- Add unit tests for dashboard aggregation logic.
- Add access tests for deleting own report and rejecting deletion of another user's report.
- Add Playwright tests for opening dashboard from result and deleting a saved report.
- Run lint, typecheck, unit tests, build, and dashboard Playwright tests.

Architecture memory update:

- Record dashboard scope, aggregation behavior, deletion behavior, and retention assumptions.

## Task 14: Add Analytics, Error Tracking, and Core Quality Gates

Goal: Measure the MVP funnel and capture production errors without exposing sensitive financial data.

Instructions:

- Add analytics tracking for landing start, region/currency completion, upload start, OCR success or failure, confirmation completion, report generation completion, story completion, share export, login conversion, and repeat generation.
- Do not send raw transaction details, merchant names, screenshot content, or private report text to analytics.
- Add Sentry for frontend and server errors.
- Add error boundaries for AI generation, upload, result rendering, and share card export.
- Ensure environment variables are documented and server-only secrets stay server-only.

Completion criteria:

- Funnel events fire with non-sensitive metadata.
- Sentry captures errors in local or preview validation.
- Error states are user-friendly and recoverable where possible.

Verification:

- Add tests or mocks confirming analytics payloads exclude sensitive fields.
- Add error-state tests for upload failure, AI failure, and share export failure.
- Run lint, typecheck, unit tests, build, and targeted Playwright error scenarios.

Architecture memory update:

- Record analytics event names, privacy constraints, Sentry setup, and error-state decisions.

## Task 15: Final End-to-End Acceptance and Documentation Review

Goal: Verify the complete MVP flow and ensure implementation matches the product and technical documents.

Instructions:

- Run the full anonymous path: start battle, choose region and currency, choose period, upload or manually enter transactions, confirm rows, generate report, navigate Wrapped story, preview share card, trigger login on save/export.
- Run the logged-in path: login, save report, view history, reopen report, delete report.
- Run the failure path: failed OCR, invalid manual transaction, unsafe roast regeneration, report generation failure, share export failure.
- Review `AGENTS.md`, `memory-bank/design-document.md`, `memory-bank/tech-stack.md`, `memory-bank/implementation-plan.md`, and `memory-bank/architechture.md` for consistency.
- Confirm all MVP exclusions remain excluded.
- Confirm the final architecture memory file reflects the actual implemented system.

Completion criteria:

- Full test suite passes.
- Full build passes.
- Core Playwright journeys pass.
- Documentation matches implemented behavior.
- No accidental scope expansion is present.

Verification:

- Run lint, typecheck, unit tests, build, and full Playwright suite.
- Manually inspect mobile and desktop flows.
- Confirm no raw screenshots are retained as historical report data.
- Confirm share cards hide merchant names and precise transaction details by default.
- Confirm benchmark text does not claim real rankings.
- Confirm `memory-bank/architechture.md` includes every completed milestone.

Architecture memory update:

- Add the final MVP implementation summary, test results, known limits, and future-phase boundaries.

## Final Acceptance Checklist

- `AGENTS.md`, `memory-bank/design-document.md`, `memory-bank/tech-stack.md`, `memory-bank/implementation-plan.md`, and `memory-bank/architechture.md` exist.
- The application uses Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase, OpenAI, Zod, Vitest, and Playwright.
- The app supports anonymous first use.
- Region and currency selection happens before upload.
- Screenshot upload and manual transaction input both work.
- AI extraction returns validated candidate transactions or fails safely.
- The confirmation table blocks invalid report generation.
- AI report generation returns validated structured data.
- Roast safety checks block toxic content.
- Benchmark copy does not claim real user ranking.
- Cyber Wrapped result flow renders the complete story.
- Share cards support Xiaohongshu and WeChat formats.
- Share cards hide raw merchant and precise transaction details by default.
- Login is required for save, export, history, and repeated use beyond the anonymous allowance.
- Saved history supports reopen, share, and delete.
- Analytics avoid sensitive transaction data.
- Error tracking is configured.
- Lint, typecheck, unit tests, build, and Playwright tests pass.
- `memory-bank/architechture.md` is updated after every completed task or milestone.

