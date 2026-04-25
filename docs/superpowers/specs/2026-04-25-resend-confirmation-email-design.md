# Resend Confirmation Email — Design

**Date:** 2026-04-25
**Status:** Spec — pending user review
**Owner:** jasongracce

## Goal

When a user submits the survey, automatically send a bilingual (English + Thai) thank-you / beta-welcome confirmation email to the address they provided. Use [Resend](https://resend.com) as the email provider. Sending must be best-effort — survey submission must never fail because of an email problem.

## Non-goals

- Per-language email branching (every recipient gets the same bilingual template).
- Email tracking / open / click analytics.
- Retry queue, dead-letter queue, or background worker.
- Including the user's submitted answers in the email (no "receipt" copy).
- Skipping duplicates — the email fires every time the survey is submitted, even for emails already in `beta_signups`.
- Automated tests for v1.

## Architecture

Inline send from the existing `app/api/survey/submit` route, fired immediately after the `beta_signups` insert block. No new routes, no webhooks, no background workers.

### New files

- **`lib/email.ts`** — thin Resend wrapper. Exports one function: `sendSurveyConfirmation({ to, name })`. Mirrors the lazy-singleton pattern of `lib/supabase-server.ts`. Holds the bilingual HTML and plaintext bodies inline. ~80 lines.

### Modified files

- **`app/api/survey/submit/route.ts`** — after the `beta_signups` insert (current line ~170), before the final `NextResponse.json`, add a fire-and-forget call to `sendSurveyConfirmation`. ~6 lines added.
- **`package.json`** — add `resend` to `dependencies`.

### No schema changes

No new tables, no new columns, no migration. Send success/failure is captured in host logs only.

## Email content

### Recipient

`to` = `p.email.trim()` — the email captured from the survey form (same value already inserted into `beta_signups`).

### Subject

```
Thanks for your feedback — Learnify beta / ขอบคุณสำหรับความคิดเห็นของคุณ
```

### Body (single bilingual template — EN block first, TH block below, separated by a horizontal rule)

```
Hi {name},

Thanks for taking the time to share your feedback on Learnify — it
genuinely helps us shape what we build next.

You're now on the early access list for our beta. We're targeting
June 2026 for the first invites, and we'll email you then with
access details. No action needed from you in the meantime.

— The Learnify Team

────────

สวัสดีค่ะ {name},

ขอบคุณที่สละเวลาแบ่งปันความคิดเห็นเกี่ยวกับ Learnify ให้พวกเรา — คำตอบ
ของคุณช่วยให้ทีมเราพัฒนาผลิตภัณฑ์ได้ดียิ่งขึ้น

ตอนนี้คุณอยู่ในรายชื่อผู้ทดลองใช้งานตัวทดลอง (รุ่นเบต้า) แล้ว เราตั้งเป้าที่จะเปิดให้
ทดลองใช้งานในเดือนมิถุนายน 2569 จะมีส่งอีเมลแจ้งรายละเอียด
การเข้าใช้งานส่งให้เมื่อตอนนั้นมาถึง ระหว่างรอนี้ยังไม่ต้องดำเนินการใดๆ เราจะกลับมาเร็วๆ นี้!

— ทีม Learnify
```

### HTML version

Same content, simple inline styles only:

- System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
- Max-width 560px, centered
- Neutral colors (no brand colors required)
- Horizontal rule between the two language blocks
- No images, no tracking pixels, no marketing chrome

### Plaintext version

Same content as the EN+TH blocks above, with `--------` substituted for the horizontal rule.

### Variable substitution

Only `{name}` is interpolated. The value comes from `p.respondent_name.trim()` and **must be HTML-escaped** before insertion into the HTML body. The plaintext body uses the raw value (no escaping). Escape function handles `<`, `>`, `&`, `"`, `'`.

## Send semantics

### When

Inside `route.ts`, immediately after the `beta_signups` insert block, before `return NextResponse.json({ id: responseId })`. Fires unconditionally once `responseId` exists — i.e., on every successful `survey_responses` insert, regardless of whether the `beta_signups` insert succeeded, failed with `23505` (duplicate), or failed with any other error.

### Pattern: fire-and-forget

```ts
sendSurveyConfirmation({
  to: p.email.trim(),
  name: p.respondent_name.trim(),
}).catch((e) => {
  console.error("survey confirmation email failed:", {
    response_id: responseId,
    error: e instanceof Error ? e.message : String(e),
  });
});
```

No `await`. The route returns to the user as soon as the DB writes are done. The Node runtime keeps the function alive until the promise settles (within the platform's max function duration on Vercel).

### Trade-off acknowledged

If the host kills the function before Resend's request resolves, the email is lost and won't be retried. For a confirmation email this is acceptable — Resend's typical p99 is sub-second and Vercel's serverless function timeout is comfortably longer.

### Timeout

None added. The Resend SDK has its own internal timeout; the wrapper stays minimal.

### Logging

- Success: no log (avoid log noise).
- Failure: `console.error` with `response_id` and the error message. Visible in Vercel function logs. Operator can correlate against `survey_responses.id` in Supabase.

### No retry, no DLQ, no alerting

Explicit YAGNI. If volume of failures becomes a problem, revisit.

## Configuration

### Environment variables

| Name | Required? | Example | Notes |
|---|---|---|---|
| `RESEND_API_KEY` | yes (to send) | `re_xxxxxxxx` | If unset, `sendSurveyConfirmation` returns early with `console.log("email disabled — skipping send")`. |
| `EMAIL_FROM` | optional | `Learnify Team <noreply@learnify.academy>` | Defaults to `Learnify Team <noreply@learnify.academy>` in `lib/email.ts` if unset. |
| `EMAIL_ENABLED` | optional | `true` / `false` | Defaults to `true` if `RESEND_API_KEY` is set. Allows turning off sends without rotating the key. |

### Disable switch logic

```
if (!RESEND_API_KEY || EMAIL_ENABLED === "false") {
  console.log("email disabled — skipping send");
  return;
}
```

This means the code can be deployed to production **before** `learnify.academy` is verified on Resend. Until verification, leave `RESEND_API_KEY` unset → no sends, no errors. Once verification completes, set the key on the next deploy and emails start flowing.

### Secrets handling

- `RESEND_API_KEY` is server-only. Never `NEXT_PUBLIC_*`.
- `lib/email.ts` is imported only by the API route, which is `export const runtime = "nodejs"`.
- `.env.local` stays gitignored.
- Vercel: add all three vars under Production + Preview. Skip Development unless you want local sends to fire.

## Domain verification (operator task, async)

1. In the Resend dashboard, add `learnify.academy`.
2. Add the SPF + DKIM TXT records Resend provides to the domain's DNS.
3. Wait for verification (typically <30 min).
4. Once verified, set `RESEND_API_KEY` in Vercel env and redeploy.

This work happens in parallel with the code change — they're independent.

## Testing

### Manual (primary)

1. **Local smoke (disabled):** unset `RESEND_API_KEY`, submit the survey locally, confirm console logs `"email disabled — skipping send"` and the route returns 200.
2. **Local real send (Resend test domain):** set `RESEND_API_KEY` and use `EMAIL_FROM=onboarding@resend.dev`. Submit with your own Resend-account email. Confirm the email arrives, both EN and TH blocks render, `{name}` is substituted, no HTML escapes leak through.
3. **HTML injection check:** submit with a name like `<script>alert(1)</script>` and confirm the email body shows it as literal text, not as a rendered tag.
4. **Production smoke (after domain verified):** set the real key in Vercel, submit one test response in production with your own email, confirm delivery from `noreply@learnify.academy`.
5. **Failure path:** temporarily set `RESEND_API_KEY=re_invalid`, submit, confirm the route still returns 200, the survey row exists in Supabase, and the host log shows the `survey confirmation email failed` line with the `response_id`.

### Automated

None for v1. The wrapper is small enough that a unit test would mostly mock the SDK and assert call args — low value vs maintenance cost.

## Open questions / future work (out of scope here)

- Welcome email when the beta actually opens in June 2026 — separate template, separate trigger.
- Optional unsubscribe link if marketing emails are added later (one-shot confirmations don't legally require it under most jurisdictions, but check before scaling beyond confirmations).
- Tracking which addresses received which template version, if templates start changing meaningfully over time.
