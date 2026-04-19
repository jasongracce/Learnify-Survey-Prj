# Survey email-upfront — design

Move email capture from the post-survey Thank You page to the welcome flow, between the name form and the "let's get started" transition. Email is required.

## Flow

Inside the `Welcome` component, the phase machine becomes:

```
greeting (2.5s auto) → name-form → email-form → letsStart (2s auto) → Q1
```

The existing `thanks` phase ("Thanks, {name}!") is removed. All other timing and styling stays the same.

The `email-form` phase mirrors the existing name form:
- Centered layout, single `<input type="email">` with the same underline style
- Continue button disabled until the email matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Inline validation error appears below the input on failed submit (not on blur, to avoid punishing partial typing)
- No skip button, no optional path

## Data model

Client-side only — no database migration required. The existing `beta_signups` table (`email unique`, `response_id` FK) already holds what we need.

Changes in `components/survey/types.ts`:
- Add `email: string` to `FormState`
- Add `email: ""` to `INITIAL_FORM`
- Add `isEmailValid(form): boolean` helper (regex check on trimmed email)

`isWelcomeValid` stays as a name-only gate; the welcome component internally gates the email phase on `isEmailValid`.

## Submission flow

In `app/survey/page.tsx`'s `submit`:

1. Insert into `survey_responses` → get `response_id` (existing behavior).
2. Insert into `beta_signups` with `{ email: form.email.trim(), response_id }`.
3. If step 2 fails with Postgres code `23505` (duplicate email): swallow the error. The email is already on the waitlist; the survey response is saved under its own row. Submission is considered successful.
4. If step 2 fails with any other error: log to console but do not block the success path. The survey response is already persisted, which is the primary goal.
5. Advance to Thank You step as today.

Rationale: the user completed a 10-question survey — under no circumstance should a waitlist-row failure discard that work.

## Thank You page

Strip the `capture` / `success` / `skipped` stage machinery from `components/survey/thank-you.tsx`. Replace with a single confirmation view:

- Check icon (kept)
- Heading: `ty.heading` with `{name}` interpolation (kept)
- Divider (kept)
- Body: `ty.successBody` — "We'll be in touch soon" copy
- "Back to home" link (kept)

The component no longer imports Supabase, manages stages, or handles email input.

## i18n changes

Add to `welcome` section (both `en` and `th`):
- `emailQuestion` — "What's your email?" / "อีเมลของคุณคืออะไร?"
- `emailPlaceholder` — "you@example.com"
- `emailContinue` — "Continue" / "ต่อไป"
- `emailInvalid` — "Please enter a valid email." / inline validation copy in Thai

Remove the `thanksMessage` key from `welcome` (no longer shown).

Remove from `thankYou` (no longer used after Thank You refactor):
- `subheading`, `emailLabel`, `emailPlaceholder`, `waitlistCta`, `skipCta`, `successHeading`, `skippedBody`

Remove from `errors` (no longer referenced):
- `emailInvalid`, `emailDuplicate`, `emailFailed`

Keep on `thankYou`: `heading`, `successBody`, `backToHome`.

## Files touched

- `components/survey/welcome.tsx` — add `email-form` phase, remove `thanks` phase, new email UI
- `components/survey/types.ts` — `FormState.email`, `INITIAL_FORM.email`, `isEmailValid`
- `app/survey/page.tsx` — `submit` inserts into `beta_signups` after `survey_responses`
- `components/survey/thank-you.tsx` — strip stages, keep confirmation view only
- `lib/i18n.tsx` — add/remove keys per above

## Out of scope

- No change to the survey questions (Q1–Q10)
- No change to `survey_responses` schema
- No change to `beta_signups` schema
- No backend/edge function changes
- No analytics/event tracking changes
