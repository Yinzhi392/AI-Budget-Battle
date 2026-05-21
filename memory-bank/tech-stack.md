# AI Budget Battle Tech Stack

## 1. Recommendation Summary

Use a **Next.js + Supabase + OpenAI + Vercel** stack.

This is the best fit for AI Budget Battle because the MVP needs to move fast, support authenticated and anonymous users, store structured spending reports, process uploaded screenshots, call AI models safely from the server, and deploy with low operational overhead.

The guiding principle is:

> Keep the product monolithic, typed, and serverless-first until real usage proves which parts need more infrastructure.

## 2. Recommended Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js App Router + TypeScript | One codebase for landing, app flow, API routes, and server actions. Strong ecosystem and simple Vercel deployment. |
| Styling | Tailwind CSS + shadcn/ui | Fast UI development, consistent components, easy to customize for cyber visual style. |
| Animation | Framer Motion / Motion | Good fit for Wrapped-style story transitions and generation animations. |
| Backend | Next.js Route Handlers / Server Actions | Simple MVP backend without a separate API service. Keeps business logic close to the app. |
| Database | Supabase Postgres | Reliable relational model for users, sessions, transactions, reports, benchmarks, and share cards. |
| Auth | Supabase Auth | Supports email login and OAuth. Email flow can support QQ Mail, 163, Outlook, Gmail, and school emails. |
| File Storage | Supabase Storage | Temporary screenshot storage and generated share card storage. |
| AI | OpenAI API | Handles screenshot understanding, structured transaction extraction, personality generation, roast, and report JSON. |
| AI Output | Structured Outputs with JSON Schema | Prevents unstable free-form AI responses and makes frontend rendering reliable. |
| Charts | Recharts | Simple category breakdowns and lightweight dashboard charts. |
| Share Card Export | HTML/CSS templates + html-to-image | Fastest way to export Xiaohongshu and WeChat-ready static cards from existing UI components. |
| Validation | Zod | Shared validation for AI JSON, forms, route inputs, and database payloads. |
| Forms | React Hook Form + Zod resolver | Reliable editable confirmation table and manual input forms. |
| Deployment | Vercel | Best default deployment path for Next.js, preview deployments, environment variables, and serverless functions. |
| Analytics | PostHog or Vercel Analytics | Track funnel completion, export rate, login conversion, and repeat generation. |
| Error Tracking | Sentry | Capture OCR/AI failures, frontend crashes, and server errors. |

## 3. Architecture

Recommended MVP architecture:

```text
Next.js App
  ├─ Public landing pages
  ├─ App flow pages
  ├─ Server actions / route handlers
  ├─ AI service module
  ├─ Supabase client/server adapters
  └─ Share card renderer

Supabase
  ├─ Auth
  ├─ Postgres
  ├─ Row Level Security
  └─ Storage

OpenAI API
  ├─ Screenshot transaction extraction
  ├─ Report generation
  └─ Safety-aware roast generation

Vercel
  ├─ Web deployment
  ├─ Preview deployments
  └─ Serverless execution
```

This keeps the MVP simple: no separate backend server, no queue, no microservices, and no premature mobile app.

## 4. Frontend Stack

### Framework

Use **Next.js App Router** with **TypeScript**.

Recommended structure:

```text
app/
  page.tsx
  battle/
    region-currency/
    period/
    upload/
    confirm/
    generating/
    result/[sessionId]/
    share/[reportId]/
  auth/
  history/
components/
lib/
server/
types/
```

### UI

Use **Tailwind CSS** and **shadcn/ui** as the UI foundation.

Use custom styling for:

- Cyber dark background
- Neon highlights
- Story cards
- Battle score panels
- Share card templates
- Mobile-first interaction

Do not overuse generic shadcn dashboard layouts. The product should feel like a cyber social report, not an admin panel.

### Animation

Use **Framer Motion / Motion** for:

- Wrapped story transitions
- Personality reveal
- Score counting
- Generating screen
- Share card preview transitions

Keep animations client-side and lightweight.

## 5. Backend Stack

Use **Next.js Route Handlers** and **Server Actions** for MVP backend logic.

Recommended server modules:

```text
server/
  auth.ts
  supabase.ts
  ai/
    extract-transactions.ts
    generate-report.ts
    schemas.ts
    safety.ts
  reports/
    create-session.ts
    confirm-transactions.ts
    save-report.ts
  storage/
    upload-image.ts
    expire-image.ts
```

Use API routes for operations that need explicit request boundaries:

- Image upload preparation
- OCR / AI extraction
- Report generation
- Share card persistence

Use Server Actions for simpler authenticated mutations:

- Save report
- Delete report
- Update profile

## 6. Database and Storage

Use **Supabase Postgres** for relational data.

Core tables:

- `users`
- `anonymous_sessions`
- `analysis_sessions`
- `uploaded_images`
- `transaction_items`
- `ai_reports`
- `share_cards`
- `benchmark_profiles`

Enable **Row Level Security** early.

Recommended policies:

- Logged-in users can only read their own saved reports.
- Anonymous sessions can access only their own temporary analysis session.
- Service-role access is only used from server-side code.
- Raw screenshots are temporary and expire automatically.

Use **Supabase Storage** buckets:

- `temporary-uploads`: private, short retention, raw screenshots
- `share-cards`: private or public depending on sharing implementation

## 7. AI and OCR Approach

For MVP, use **OpenAI vision-capable models** for screenshot understanding instead of adding a separate OCR provider immediately.

Why:

- Simpler integration
- Better at messy screenshots and mixed Chinese/English context
- Can extract directly into structured JSON
- Reduces one external dependency during MVP

Recommended AI flow:

1. User uploads screenshot.
2. Server sends image to OpenAI extraction prompt.
3. OpenAI returns structured transaction candidates.
4. Zod validates the JSON.
5. User confirms or corrects the rows.
6. Server sends confirmed transactions to report generation prompt.
7. OpenAI returns structured report JSON.
8. Zod validates again before saving.

Fallback strategy:

- If image extraction fails, user can manually input transactions.
- If report generation fails, show a retry option.
- If AI returns invalid JSON, retry once with a stricter repair prompt.

Future OCR upgrade options:

- Tencent Cloud OCR or Aliyun OCR for China-specific payment screenshots
- PaddleOCR for self-hosted OCR
- Hybrid OCR + LLM cleanup if extraction cost becomes too high

Do not add these in MVP unless OpenAI vision extraction is not good enough during testing.

## 8. AI Output Safety

Use JSON Schema / Structured Outputs for:

- Transaction extraction
- Personality report
- Roast output
- Scores
- Benchmark insights
- Share copy

Add a local safety layer before saving or showing AI text.

Minimum safety checks:

- Block identity attacks
- Block class, body, gender, region, school-tier insults
- Block debt or poverty shaming
- Block medical, legal, tax, investment, or lending advice
- Block claims that preset benchmarks are real user rankings

Use fixed enum fields where possible:

- `safe_level`
- `severity`
- `benchmark_confidence`
- `category`
- `currency`
- `region`

## 9. Share Card Generation

Use **HTML/CSS card templates** rendered inside the app, then export them with **html-to-image**.

Why this is the simplest MVP choice:

- Designers and frontend code can use the same components.
- It works well for static Xiaohongshu and WeChat images.
- It avoids a separate image rendering service in the first version.

Recommended formats:

- Xiaohongshu square: `1080 x 1080`
- Xiaohongshu vertical: `1080 x 1440`
- WeChat Moments: `1080 x 1080`

Later upgrade path:

- Use server-side rendering with Satori / Resvg if client-side export quality is inconsistent.
- Add dynamic video cards only after static card sharing proves demand.

## 10. Authentication

Use **Supabase Auth**.

MVP behavior:

- Anonymous users can complete one report.
- Login is required to save reports, export cards, and view history.
- Email magic link or verification code should support mainstream email providers, including QQ Mail, 163, Outlook, Gmail, and school domains.
- Google OAuth can be available but should not be the only login path.

## 11. Analytics and Observability

Use **PostHog** if product analytics depth matters, or **Vercel Analytics** if you want the lowest setup cost.

Track:

- Landing to start conversion
- Region/currency completion
- Upload start
- OCR success/failure
- OCR correction rate
- Confirmation completion
- Report generation completion
- Story completion
- Share card export
- Login conversion
- Repeat report generation

Use **Sentry** for:

- Frontend runtime errors
- AI route failures
- Supabase errors
- Share card export failures

## 12. Testing

Use:

- **Vitest** for utility, scoring, schema, and prompt contract tests
- **Playwright** for core user flows
- **Zod schema tests** for AI output validation

Minimum MVP test coverage:

- Region/currency selection persists correctly.
- Manual transaction input validates required fields.
- OCR candidate rows can be edited and confirmed.
- Invalid AI JSON is rejected.
- Report JSON renders all story pages.
- Share card hides raw merchants by default.
- Anonymous user is prompted to login when saving/exporting.

## 13. Environment Variables

Expected environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=
SENTRY_DSN=
POSTHOG_KEY=
POSTHOG_HOST=
```

Keep service-role keys server-only.

## 14. Deployment

Deploy the web app on **Vercel**.

Use:

- Preview deployments for every branch
- Production deployment from main branch
- Vercel environment variables
- Supabase project per environment if budget allows

Recommended environments:

- `local`
- `preview`
- `production`

## 15. What Not To Add Yet

Do not add these in MVP:

- Separate Express/Nest backend
- Dedicated job queue
- Kubernetes
- Native mobile app
- Real-time social feed
- Payment system
- Full admin dashboard
- Bank API aggregation
- Complex recommendation engine
- Self-hosted OCR service

These can be added later if usage proves the need.

## 16. Implementation Order

1. Next.js app scaffold with TypeScript, Tailwind, shadcn/ui.
2. Supabase setup: Auth, Postgres schema, Storage buckets, RLS.
3. Anonymous session and region/currency flow.
4. Upload page and manual transaction input.
5. AI screenshot extraction route with structured output.
6. Confirmation table.
7. AI report generation route with structured output.
8. Cyber Wrapped result page.
9. Share card templates and export.
10. Save/export login gate.
11. History page.
12. Analytics, Sentry, and core tests.

## 17. References

- Next.js deployment documentation: https://nextjs.org/docs/app/getting-started/deploying
- Vercel Next.js documentation: https://vercel.com/docs/concepts/next.js/overview
- Supabase documentation: https://supabase.com/docs
- OpenAI Structured Outputs documentation: https://platform.openai.com/docs/guides/structured-outputs

