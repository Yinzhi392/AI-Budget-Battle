# AI Budget Battle Product Design Document

## 1. Product Direction

AI Budget Battle MVP will use the **Cyber Wrapped Battle** direction: a Chinese-first, playful, AI-powered spending personality report for university students and Chinese-speaking student users.

The product is not a traditional budgeting app. Its main promise is:

> Upload your spending records, confirm what AI recognized, and receive a cyber-style financial personality battle report that is funny, slightly savage, and ready to share.

The MVP should feel closer to a cyber version of Spotify Wrapped than a banking dashboard. The goal is to validate whether students enjoy, trust, and share AI-generated spending identity reports.

Participation and shareability are more important than audit-level financial accuracy. The product should not make users feel they must collect every daily bill screenshot. A useful MVP can work from a monthly summary screenshot, a few representative daily screenshots, or light manual additions, then present the result as an entertaining and explainable estimate rather than an exact accounting record.

中文产品原则：上传必须低摩擦；月度账单分析、少量日账单截图和手动补充都可以进入分析；AI 需要做消费分类、多来源对齐、数据合成和去重；不完整数据必须以估算和置信度方式呈现。

## 2. Target Users

### Primary Users

- Chinese mainland university students
- Chinese-speaking students studying abroad
- Students who already share lifestyle, spending, study, food, shopping, and self-improvement content on social platforms

### Default Scenario

The default product experience prioritizes Chinese mainland student spending behavior:

- Currency: CNY by default
- Categories: food delivery, milk tea, online shopping, gaming, transport, campus cafeteria, social meals, study supplies, subscriptions
- Language: Chinese-first
- Tone: meme-aware, funny, slightly savage, but not humiliating

The MVP supports two student setup paths: China mainland students and students studying abroad. Students studying abroad choose their country or region and currency after selecting the study-abroad path; do not split them into separate "overseas Chinese" and "international student" user categories.

## 3. MVP Scope

### Included

- Landing page
- Region and currency selection
- Analysis period selection
- Screenshot upload
- Manual transaction input
- AI/OCR pre-recognition
- User confirmation and correction table
- AI spending personality generation
- AI roast generation
- Financial scores
- Predictive risk insights
- Benchmark-style student comparison
- Cyber Wrapped story result flow
- Xiaohongshu and WeChat sharing card generation
- Challenge-tag sharing mechanism
- Anonymous first-use flow
- Login when saving, exporting, or viewing history
- Historical reports for logged-in users

### Excluded

- Bank API integration
- Real campus rankings
- In-app social feed
- Comments, likes, follows, or friend graphs
- Subscription billing
- Full AI financial coaching
- Investment, lending, medical, legal, or tax advice
- Long-term storage of raw uploaded screenshots
- Video sharing cards

## 4. Core User Flow

1. **Landing / Start Battle**
   - User sees a direct promise: generate an AI spending personality report.
   - Primary CTA: start my Budget Battle.

2. **Select Region and Currency**
   - Default: China mainland + CNY.
   - Users choose either China mainland student or study-abroad student.
   - Study-abroad students then choose a country or region from a global list and choose the relevant currency.
   - This choice controls category defaults, amount formatting, benchmark profile, and AI language context.

3. **Select Analysis Period**
   - Options: this week, this month, custom period.
   - The selected period is shown throughout the report and sharing card.

4. **Upload Screenshots and Add Transactions**
   - Users can upload a small number of representative screenshots instead of every daily bill.
   - Supported inputs include monthly analysis screenshots, daily transaction screenshots, category summary screenshots, and light manual additions.
   - The upload flow should encourage low-friction participation and must not imply that complete daily screenshots are required.
   - Users can manually add transactions or category-level hints when screenshots are incomplete or unavailable.

5. **AI Recognition and Confirmation**
   - AI/OCR extracts candidate transaction fields and category summary fields.
   - AI classifies merchant or note text into spending categories, for example recognizing "一点点 10 元" as a milk tea expense.
   - AI aligns and merges multiple input sources, such as one Alipay monthly analysis screenshot plus several WeChat daily bill screenshots.
   - The system marks confidence, possible duplicates, and estimate-based aggregates clearly.
   - User reviews, edits, deletes, and adds transaction items or category summaries.
   - Only confirmed or accepted estimated data enters analysis.

6. **Cyber Wrapped Generation**
   - A cyber scanning/generation screen builds anticipation.
   - The system generates personality, roast, scores, benchmarks, predictions, and challenge content.

7. **Story Result Reveal**
   - Results are shown as a swipe/click-through story flow.
   - Each screen has one memorable point.

8. **Share and Save**
   - User chooses Xiaohongshu or WeChat card templates.
   - Anonymous users can export one watermarked card. Save, history, watermark removal, extra exports, and repeated report generation trigger login.

## 5. Core Modules

### 5.1 Region, Currency, and Scenario Configuration

This module determines:

- Currency display
- Default transaction categories
- Benchmark profile selection
- AI prompt context
- Localized roast and sharing language

The MVP should prioritize China mainland defaults while allowing broader Chinese-speaking student scenarios.

### 5.2 Screenshot Upload and OCR Recognition

The upload experience prioritizes speed and participation. Users may upload one monthly summary screenshot, a few representative transaction screenshots, or a mix of payment-app screenshots. The product must not require a complete screenshot set for every day in the analysis period.

The system attempts to detect the screenshot type:

- Monthly or period summary screenshot
- Daily transaction list screenshot
- Individual transaction screenshot
- Category analysis screenshot
- Unknown screenshot requiring manual fallback

From detailed transaction screenshots, the system attempts to extract:

- Amount
- Time
- Merchant or note
- Category candidate
- Currency
- Confidence score

From summary screenshots, the system attempts to extract:

- Period or month
- Category totals
- Merchant or category labels
- Currency
- Source platform
- Confidence score

AI must perform category classification, not only raw OCR. Examples:

- "一点点 10 元" should map to milk tea.
- "美团外卖 32 元" should map to food delivery.
- "腾讯视频会员" should map to subscriptions.

When users provide mixed sources, such as Alipay monthly analysis plus WeChat daily bills, the system should align them by period, source, category, amount, and merchant/note where possible. It should identify likely duplicates and avoid presenting estimated aggregates as exact transactions.

Low-confidence fields, possible duplicates, source conflicts, and estimated aggregate rows must be visibly marked in the confirmation experience.

### 5.3 Manual Input and Confirmation Table

The confirmation table is the data-quality gate.

Users can:

- Add a transaction
- Add or adjust category-level totals
- Edit amount, category, merchant/note, and time
- Delete incorrect recognition results
- Accept or reject estimated aggregate rows
- Review possible duplicate or overlapping rows
- Confirm all records before generating a report

Required fields:

- Amount
- Currency
- Category
- Time or period

Optional fields:

- Merchant
- Note
- Source image reference
- Source type
- Confidence
- Duplicate or estimated-data flag

### 5.4 AI Analysis Engine

The AI engine receives confirmed structured data and returns structured JSON, not free-form text.

The AI engine may receive a mix of confirmed transactions and confirmed category or period aggregates. It must treat aggregate data as estimate-based input and should not generate copy that implies precise accounting when the source data is incomplete.

It generates:

- Spending personality
- Roast
- Financial scores
- Benchmark insights
- Risk predictions
- Challenge tag
- Share copy

### 5.5 Student Benchmark Library

The MVP uses a preset benchmark library because there may not be enough real user data at launch.

The product must not claim real rankings or real campus percentiles. Wording should use benchmark language such as:

- "接近高频奶茶消费组"
- "高于学生基准线"
- "属于外卖支出偏高区间"
- "based on student spending benchmarks"

Future versions may replace or supplement this with anonymized real-user aggregation.

### 5.6 Cyber Wrapped Story Flow

The result page is the main product experience.

Recommended story sequence:

1. Personality reveal
2. Most dramatic spending behavior
3. Roast
4. Financial battle scores
5. Benchmark comparison
6. Risk prediction
7. Challenge tag
8. Share card preview

The result experience should avoid dense tables. A lightweight dashboard can appear after the story flow for users who want details.

### 5.7 Sharing Card Generator

The sharing system creates static cards optimized for:

- Xiaohongshu square image
- Xiaohongshu vertical image
- WeChat Moments image
- WeChat group-friendly image

Cards may include:

- Personality title
- Roast
- Financial score
- Challenge tag
- Period
- Product watermark
- QR code or invite link

Cards should hide raw merchants and precise transaction details by default. Anonymous exports must include a product watermark.

## 6. AI Output Contract

AI output should follow a stable schema so the frontend can render reliably.

```json
{
  "personality": {
    "title": "奶茶黑洞人格",
    "emoji": "🧋",
    "description": "你不是在买奶茶，你是在给情绪续命。",
    "strengths": ["会奖励自己", "生活仪式感强"],
    "weaknesses": ["小额高频支出容易失控"],
    "behavior_summary": "本期饮品和外卖支出明显偏高。"
  },
  "roast": {
    "short": "你的奶茶预算已经开始像房租一样稳定了。",
    "safe_level": "sharp_safe"
  },
  "scores": {
    "financial_health": 68,
    "impulse": 82,
    "savings_potential": 61,
    "lifestyle_efficiency": 54,
    "stability": 72
  },
  "benchmark_insights": [
    {
      "category": "milk_tea",
      "text": "你的奶茶支出接近学生高频消费组。",
      "confidence": "benchmark"
    }
  ],
  "risk_predictions": [
    {
      "type": "overspending",
      "text": "如果保持这个节奏，月底娱乐和外卖预算会提前透支。",
      "severity": "medium"
    }
  ],
  "challenge": {
    "title": "奶茶战损挑战",
    "tag": "#本周奶茶战损",
    "description": "晒出你的本周奶茶人格。"
  },
  "share_copy": {
    "xiaohongshu": "AI 说我是奶茶黑洞人格，笑死但有点准。",
    "wechat": "我的 AI 消费人格报告出来了。"
  }
}
```

## 7. Roast Tone and Safety Rules

The roast style should be:

- Funny
- Meme-aware
- Slightly savage
- Shareable
- Non-toxic
- Not corporate

Allowed:

- Jokes about spending patterns
- Exaggerated but harmless metaphors
- Playful challenge language
- Light self-awareness prompts

Forbidden:

- Attacks on income, family background, class, body, gender, region, school tier, or identity
- Shaming debt, poverty, mental health, or addiction
- Statements like "you are hopeless" or "you deserve to be poor"
- Specific investment, lending, medical, legal, or tax advice
- Claims that the benchmark is a real ranking unless supported by real anonymized data

## 8. Data Model

### user

- `id`
- `email`
- `auth_provider`
- `display_name`
- `avatar_url`
- `created_at`

### anonymous_session

- `id`
- `created_at`
- `expires_at`
- `linked_user_id`

### analysis_session

- `id`
- `user_id`
- `anonymous_session_id`
- `region`
- `currency`
- `period_start`
- `period_end`
- `status`
- `is_saved`
- `created_at`

### uploaded_image

- `id`
- `analysis_session_id`
- `temporary_storage_url`
- `ocr_status`
- `expires_at`
- `created_at`

### transaction_item

- `id`
- `analysis_session_id`
- `amount`
- `currency`
- `category`
- `merchant`
- `note`
- `transaction_time`
- `source`
- `confidence`
- `is_user_confirmed`

### ai_report

- `id`
- `analysis_session_id`
- `personality_json`
- `roast_json`
- `scores_json`
- `benchmark_json`
- `prediction_json`
- `challenge_json`
- `generated_at`

### share_card

- `id`
- `ai_report_id`
- `template_type`
- `platform`
- `image_url`
- `challenge_tag`
- `created_at`

### benchmark_profile

- `id`
- `region`
- `currency`
- `student_context`
- `category`
- `range_low`
- `range_high`
- `label`
- `description`

## 9. Privacy and Data Retention

The MVP uses a minimum-save privacy model.

Rules:

- Raw screenshots are temporary and should not be stored long-term.
- Confirmed structured transactions may be stored for saved reports.
- AI reports and share cards may be stored for logged-in users.
- Raw screenshots are marked deletable after analysis and must be removed no later than 24 hours after upload.
- Users can delete historical reports.
- Sharing cards hide merchants and precise transaction details by default.
- Benchmark outputs are generated from preset profiles unless future real aggregation is implemented.

## 10. Authentication

The MVP uses an anonymous-first experience.

Users can generate one report without logging in. Anonymous users may export one watermarked share card. Login is prompted when they:

- Save a report
- Remove a watermark
- Export additional share cards
- View history
- Generate multiple reports across sessions

Supported MVP login methods:

- Google OAuth
- Email magic link

Future login method:

- Email verification code

Email login must support mainstream email providers, including QQ Mail, 163, Outlook, Gmail, and school email domains.

## 11. Page Inventory

### Landing Page

Purpose: explain the core promise quickly and start the battle.

Key elements:

- Product name
- Short value proposition
- Example personality/roast preview
- Start battle CTA

### Region and Currency Page

Purpose: configure localization before data input.

Key elements:

- Region selector
- Currency selector
- Default categories preview

### Period Selection Page

Purpose: define the analysis period.

Key elements:

- This week
- This month
- Custom period

### Upload Page

Purpose: collect screenshots and manual entries.

Key elements:

- Screenshot upload dropzone
- Manual add button
- Privacy note

### Confirmation Table

Purpose: make OCR output trustworthy.

Key elements:

- Editable transaction rows
- Confidence indicators
- Category picker
- Add/delete controls
- Confirm and generate CTA

### Generating Page

Purpose: build anticipation.

Key elements:

- Cyber scanning animation
- Status messages
- Report generation progress

### Wrapped Result Page

Purpose: reveal the report as the main product experience.

Key elements:

- Story navigation
- Personality reveal
- Roast
- Scores
- Benchmark insights
- Prediction
- Challenge
- Share CTA

### Share Card Editor

Purpose: produce platform-ready images.

Key elements:

- Platform selector
- Template selector
- Field visibility controls
- Export button with one anonymous watermarked export allowed

### Login Page

Purpose: convert anonymous users when value is proven.

Key elements:

- Email login
- Google login
- Clear explanation of why login is needed

### History Page

Purpose: let logged-in users revisit saved reports.

Key elements:

- Report list
- Date/period
- Personality summary
- Reopen/share/delete actions

### Lightweight Dashboard

Purpose: provide supporting detail after the story report.

Key elements:

- Category breakdown
- Score explanations
- Confirmed transaction summary
- Risk notes

## 12. Visual System

### Product UI

The product UI should be dark, cyber, and playful.

Recommended style:

- Matte black and charcoal base
- Neon green, electric blue, and warm orange accents
- Scan lines and cyber data effects
- Large typography for personality and scores
- Strong contrast numbers
- Smooth story transitions
- Glass and glow effects used sparingly

Avoid:

- Corporate fintech dashboards
- Dense spreadsheet layouts
- Overloaded numbers
- Generic banking visual language
- Low-contrast decorative UI

### Sharing Cards

Sharing cards should preserve cyber identity but be more readable and social-platform friendly.

Recommended formats:

- Xiaohongshu square card
- Xiaohongshu vertical card
- WeChat Moments card

Design principles:

- Strong personality title
- One funny roast line
- One score or benchmark highlight
- One challenge tag
- No raw transaction details by default
- Product watermark and optional QR code

## 13. Success Metrics

### Activation

- Landing to start-battle conversion
- Region/currency completion rate
- Upload start rate

### Data Flow

- OCR recognition success rate
- OCR correction rate
- Confirmation completion rate
- Manual transaction add rate

### Report Experience

- Confirmation to report completion rate
- Story flow completion rate
- Time spent on result page
- Roast satisfaction rating
- Roast report/flag rate

### Growth

- Share card export rate
- Xiaohongshu template usage
- WeChat template usage
- Challenge tag usage
- Invite or QR return visits

### Retention

- Login conversion after report generation
- Saved report rate
- Repeat analysis rate
- History page return rate

## 14. Future Phases

### Phase 2: Real Social Layer

- Anonymous aggregated real-user comparisons
- Campus or region-level benchmark pools
- Weekly challenges
- Optional leaderboard once privacy and sample size are sufficient

### Phase 3: AI Finance Companion

- Budget suggestions
- Subscription tracking
- Personalized saving goals
- Follow-up reports
- Safer coaching-style recommendations

### Phase 4: Financial Infrastructure

- Bank or payment API integration
- More reliable transaction syncing
- Paid premium reports
- Advanced analytics

## 15. Key Product Principles

- Fun before finance-dashboard complexity.
- User confirmation before AI analysis.
- Benchmark language before real-ranking claims.
- Anonymous first, login after value.
- Toxicity safety before viral shock value.
- Minimum data retention before convenience.
- Share cards before in-app social networks.
