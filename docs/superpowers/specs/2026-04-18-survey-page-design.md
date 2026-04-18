# Survey Page — Design Spec

**Date:** 2026-04-18
**Route:** `/survey` (new page in the existing Next.js app)
**Entry point:** "Answer Survey" CTA in `components/landing/survey.tsx` → `href="/survey"` with `target="_blank"`

## Purpose

A standalone survey page that collects pre-launch product-validation data from Thai students, then offers them a spot on the beta waitlist. Opens in a new tab so users can return to the landing page when done. Responses persist to Supabase.

## Architecture

- **New client component** at `app/survey/page.tsx`. Uses `"use client"`, `useState` for step index + answer state, `useLanguage()` from `lib/i18n.tsx` for EN/TH strings.
- **Shared header:** reuses `components/landing/header.tsx` (logo + language toggle). No footer.
- **Supabase client** in `lib/supabase.ts` — reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from env. Client-side inserts; no Next.js API route.
- **Two tables**, both insert-only for `anon` role via RLS:
  - `survey_responses` — one row per completed survey.
  - `beta_signups` — optional email capture, references `survey_responses.id`.
- **Landing CTA update:** `components/landing/survey.tsx` — change `href="#"` to `href="/survey"`, add `target="_blank" rel="noopener noreferrer"`, remove placeholder TODO.
- **i18n:** extend `Translations` with a new `surveyPage` key (distinct from the existing landing-banner `survey` key).

## Page layout & flow

The page has four screens. Screens 1-3 share a frame with a progress bar at top and nav buttons at bottom. Screen 4 (thank-you) has no progress bar.

```
┌──────────────────────────────────────┐
│  Header (logo + lang toggle)         │
├──────────────────────────────────────┤
│  Step X of 3                         │
│  ▓▓▓▓▓▓▓░░░░░░░░░░░░░░               │
│                                      │
│  SECTION EYEBROW                     │
│  Section headline                    │
│                                      │
│  Q1. ...                             │
│     [input]                          │
│  Q2. ...                             │
│     [options]                        │
│  ...                                 │
│                                      │
│                   [Back]   [Next →]  │
└──────────────────────────────────────┘
```

### Screens

1. **Step 1/3 — Current tools** (3 questions)
2. **Step 2/3 — Pain points** (3 questions)
3. **Step 3/3 — Learnify reaction** (4 questions). A short Learnify blurb + `public/personalized-mockup.png` appears above the questions so respondents have context.
4. **Thank-you + email capture** (no progress bar): checkmark icon, thanks headline, divider, optional email field, "Join the waitlist" + "Skip" buttons. After either action, the card swaps to a final state with a "← Back to home" link.

### Navigation rules

- Step 1: only "Next →" (no Back).
- Steps 2-3: "← Back" and "Next →".
- Step 3's "Next" is relabelled **"Submit"** — clicking it inserts into `survey_responses` and advances to screen 4.
- "Back" preserves all answers (state lives at the page level, not per-step).
- All transitions are client-side — no full page refresh.
- "Next" / "Submit" is disabled until every **required** question on the current step is answered.
- While the Submit request is in flight, the button shows a spinner and is disabled (prevents double-submit).
- Switching language mid-survey re-labels everything but keeps all entered answers.

### Styling

Matches the landing page aesthetic:
- Background `#f9f9f7`.
- Body text `#6b6b6b`, headings `#1a1a1a`.
- CTA buttons: pill-shaped (`rounded-full`), black (`bg-[#1a1a1a]`) for primary actions, outlined/secondary for "Back" and "Skip".
- Same hover treatment as existing black pill CTAs (`hover:-translate-y-0.5 hover:bg-[#2a2a2a]`).
- Section eyebrows use `text-sm font-bold tracking-[0.2em] text-[#6b6b6b]`.
- Section headlines use `text-4xl md:text-5xl font-bold tracking-tight text-[#1a1a1a]`.

## Questions

**Only Q1, Q7, and Q8 are required.** Everything else is optional to minimise drop-off.

### Step 1/3 — Current tools

- **Q1. Which learning tools do you currently use?**
  - Type: free-text input
  - Required: **yes**
  - Max length: 200 chars
  - Placeholder: "e.g. Khan Academy, YouTube, QANDA…"
  - Stored in `q1_tools_used`

- **Q2. How often do you use them?**
  - Type: single-select radio
  - Required: no
  - Options: Daily · Several times a week · Weekly · Rarely · Never
  - Stored in `q2_frequency` (nullable)

- **Q3. What do you mainly use them for?**
  - Type: multi-select checkboxes
  - Required: no
  - Options: School homework · Exam prep (O-NET / TGAT / TCAS) · Learning new topics · Language learning · General curiosity · Other
  - Selecting "Other" reveals a small text input
  - Stored in `q3_use_cases` (text[], nullable) + `q3_other` (text, nullable)

### Step 2/3 — Pain points

- **Q4. Biggest frustration with your current tools?**
  - Type: single-select radio
  - Required: no
  - Options: Content doesn't match Thai curriculum · Too many ads · Too expensive · Low-quality content · Boring / not engaging · No personalization · Hard to follow in Thai · Other
  - Selecting "Other" reveals a small text input
  - Stored in `q4_frustration` (nullable) + `q4_other` (nullable)

- **Q5. How well do they match the Thai curriculum?**
  - Type: 1-5 rating scale (horizontal row of 5 clickable circles)
  - Required: no
  - Labels: 1 = "Not at all", 5 = "Perfectly"
  - Stored in `q5_curriculum_fit` (smallint, nullable)

- **Q6. What do you wish existed that doesn't?**
  - Type: multi-line free text
  - Required: no
  - Max length: 500 chars
  - Stored in `q6_wish` (nullable)

### Step 3/3 — Learnify reaction

> **Top of this step:** a 2-line blurb ("Learnify is …") + `public/personalized-mockup.png` image. See i18n section for the blurb copy.

- **Q7. How likely are you to try Learnify?**
  - Type: 1-5 rating scale
  - Required: **yes**
  - Labels: 1 = "Not likely", 5 = "Definitely will try"
  - Stored in `q7_try_likelihood`

- **Q8. Which feature excites you most?**
  - Type: single-select radio
  - Required: **yes**
  - Options: AI tutor (Lumi) · Active learning / quiz-based lessons · Thai curriculum focus · Personalized learning paths · Progress stats · None · Other
  - Selecting "Other" reveals a small text input
  - Stored in `q8_top_feature` + `q8_other` (nullable)

- **Q9. What would stop you from using it?**
  - Type: multi-select checkboxes
  - Required: no
  - Options: Price · Parents wouldn't pay · I already have something similar · Don't trust AI for learning · Don't have reliable device/wifi · Nothing · Other
  - Selecting "Other" reveals a small text input
  - Stored in `q9_blockers` (text[], nullable) + `q9_other` (nullable)

- **Q10. Anything else we should know?**
  - Type: multi-line free text
  - Required: no
  - Max length: 1000 chars
  - Stored in `q10_extra` (nullable)

## Data model

Separating survey answers from email signups keeps the survey anonymous by default and makes the email list easy to export independently.

### `survey_responses`

One row per completed submission. All inserts happen client-side via the Supabase anon key.

| column | type | nullable | notes |
|---|---|---|---|
| `id` | uuid | no | primary key, default `gen_random_uuid()` |
| `created_at` | timestamptz | no | default `now()` |
| `language` | text | no | `'en'` or `'th'` — whichever language was active at submit time |
| `q1_tools_used` | text | no | free text, required |
| `q2_frequency` | text | yes | |
| `q3_use_cases` | text[] | yes | array of selected option keys |
| `q3_other` | text | yes | populated only when "Other" was selected |
| `q4_frustration` | text | yes | |
| `q4_other` | text | yes | |
| `q5_curriculum_fit` | smallint | yes | 1-5 |
| `q6_wish` | text | yes | |
| `q7_try_likelihood` | smallint | no | 1-5, required |
| `q8_top_feature` | text | no | required |
| `q8_other` | text | yes | |
| `q9_blockers` | text[] | yes | |
| `q9_other` | text | yes | |
| `q10_extra` | text | yes | |

### `beta_signups`

One row per email capture. Links back to the response the user just submitted (if any), so you can match an emailed waitlist member to their answers.

| column | type | nullable | notes |
|---|---|---|---|
| `id` | uuid | no | primary key, default `gen_random_uuid()` |
| `created_at` | timestamptz | no | default `now()` |
| `email` | text | no | `UNIQUE` constraint — duplicate submissions return an error the client handles |
| `response_id` | uuid | yes | foreign key → `survey_responses.id` |

### Row-Level Security policies

- `survey_responses`: **INSERT** allowed for `anon` role; no other operations.
- `beta_signups`: **INSERT** allowed for `anon` role; no other operations.
- The project owner reads both tables via the Supabase dashboard, which uses the service role key and bypasses RLS.

### Environment variables

Required at build time:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These must be set in `.env.local` (local dev) and in the deployment environment before the `/survey` route will function. Both are safe to ship to the client — the anon key is designed for that, and RLS prevents reads.

## Completion flow

1. User clicks **Submit** on Step 3.
2. Client validates all required fields (Q1 non-empty, Q7 set, Q8 set). If anything is missing, the offending field is scrolled into view and highlighted; submission is blocked.
3. Submit button enters loading state (spinner + disabled).
4. Insert into `survey_responses` via the Supabase client. The returned `id` is held in component state.
5. On success, advance to the thank-you screen.
6. On failure (network error, Supabase error), show an inline error below the Submit button ("Couldn't submit — please try again"), re-enable the button, keep all answers intact. Do not advance.

### Thank-you screen

Shown immediately after a successful submit. No progress bar.

Layout:
- Large checkmark icon (centred)
- Heading: thanks copy
- Thin divider (matches landing sections — `h-0.5 w-12 bg-[#1a1a1a]`)
- Subhead: "Want early access when the beta launches? Drop your email."
- Email input (type=`email`, placeholder)
- Two buttons side-by-side: **Join the waitlist** (black pill, primary) and **Skip** (text link)

### Email capture behaviour

- **Join the waitlist:**
  - Client validates email format with a standard regex.
  - On invalid format: inline error below input ("Please enter a valid email"). No network call.
  - On valid format: insert `{ email, response_id }` into `beta_signups`.
  - On success: replace the card content with a confirmation — "You're on the list. We'll email you when the beta opens." + "← Back to home" link.
  - On duplicate email (Supabase unique-constraint error): inline error ("Looks like you're already on the list!"), stay on the thank-you screen.
  - On other network/Supabase error: inline error, stay on screen.

- **Skip:** replace the card with just "← Back to home" + a brief "Thanks again" line. No email is recorded.

- **Back to home:** anchor to `/`. The tab was opened via `target="_blank"` so the user can also just close it.

## i18n additions

Extend `lib/i18n.tsx` `Translations` with a new top-level key `surveyPage`, separate from the existing landing-banner `survey` key.

```ts
surveyPage: {
  meta: { title: string; backToHome: string };
  progress: { stepLabel: string }; // e.g. "Step {current} of {total}"
  nav: { back: string; next: string; submit: string; submitting: string };
  steps: [
    { eyebrow: string; headline: string; questions: QuestionStrings[] },
    { eyebrow: string; headline: string; questions: QuestionStrings[] },
    { eyebrow: string; headline: string; blurb: string; questions: QuestionStrings[] },
  ];
  thankYou: {
    heading: string;
    subheading: string;
    emailLabel: string;
    emailPlaceholder: string;
    waitlistCta: string;
    skipCta: string;
    successHeading: string;
    successBody: string;
    skippedBody: string;
    backToHome: string;
  };
  errors: {
    submitFailed: string;
    emailInvalid: string;
    emailDuplicate: string;
    emailFailed: string;
  };
};
```

Where `QuestionStrings` is a shape capturing each question's `label`, its `options[]` (for radio/checkbox), its `placeholder` (for text), its `otherPlaceholder` (for "Other" reveal inputs), and for rating scales the `minLabel` / `maxLabel`. A concrete TypeScript shape is fine — no need to force-fit every question into the same interface.

Both `en` and `th` objects must be populated for every string above. Sample EN copy for the Learnify blurb (Step 3):
> "Learnify is a Thai-first learning platform built for high-school students — active lessons, Lumi (an AI tutor), and personalized paths that follow the Thai curriculum."

## Testing / verification

No test framework in the repo. Verification is:

1. `npx tsc --noEmit` passes (zero new errors in files we own).
2. `/survey` returns 200 in dev, and the rendered HTML contains the Step 1 eyebrow + the first question label.
3. Manually walk through all 3 steps in both EN and TH. Required-field gating should prevent "Next" / "Submit" until Q1, Q7, Q8 are filled.
4. Supabase dashboard shows a new row in `survey_responses` after a successful submit.
5. Email waitlist: empty-email does nothing; invalid email shows inline error; valid email creates a `beta_signups` row linked to the response; submitting the same email twice shows the duplicate error.
6. Landing-page "Answer Survey" button opens `/survey` in a new tab.

## Out of scope

- Server-side analytics / Mixpanel / PostHog instrumentation on question transitions.
- Admin UI inside this app for reading responses (use the Supabase dashboard).
- CAPTCHA / rate limiting on submissions. If spam becomes a problem, address it in a follow-up.
- Autosave of in-progress answers to localStorage — users finish in one session or lose progress.
- A/B testing question wording.
- Exporting responses to CSV from within the app — Supabase handles this.
- Email confirmation / double opt-in for the beta waitlist — single opt-in for now.
