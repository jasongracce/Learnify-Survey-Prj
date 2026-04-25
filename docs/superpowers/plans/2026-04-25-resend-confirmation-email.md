# Resend Confirmation Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send a bilingual (English + Thai) thank-you / beta-welcome email to every survey respondent via Resend, fired non-blocking from the existing `/api/survey/submit` route.

**Architecture:** Inline send from the existing API route — after the `beta_signups` insert, call a new `sendSurveyConfirmation()` wrapper as fire-and-forget. The wrapper lives in `lib/email.ts` (mirrors the lazy-singleton pattern of `lib/supabase-server.ts`), reads `RESEND_API_KEY` and `EMAIL_FROM` from env, and short-circuits to a no-op when the key is unset (so the code can ship before `learnify.academy` is verified on Resend). No schema changes. No automated tests for v1 — manual smoke tests only, per the spec.

**Tech Stack:** Next.js 16 (App Router, Node runtime), TypeScript, Resend SDK, existing Supabase service-role client.

**Reference spec:** `docs/superpowers/specs/2026-04-25-resend-confirmation-email-design.md`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `package.json` | Modify | Add `resend` dependency. |
| `.env.local.example` | Modify | Document new env vars (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_ENABLED`). |
| `lib/email.ts` | Create | Resend wrapper. Lazy-init client, HTML-escape helper, `sendSurveyConfirmation()` that builds and sends the bilingual email. ~110 lines. |
| `app/api/survey/submit/route.ts` | Modify | After the `beta_signups` insert block (around line 170), add the fire-and-forget `sendSurveyConfirmation` call. ~7 lines added. |

---

## Task 1: Add Resend dependency and env scaffolding

**Files:**
- Modify: `package.json` (add `resend` to dependencies)
- Modify: `.env.local.example` (document new env vars)

- [ ] **Step 1: Install Resend**

Run:
```bash
npm install resend
```

Expected: `package.json` and `package-lock.json` updated; `resend` appears under `"dependencies"`. Version should be `^4.x` or whatever is current.

- [ ] **Step 2: Verify it landed**

Run:
```bash
node -e "console.log(require('resend/package.json').version)"
```

Expected: prints a version number, no error.

- [ ] **Step 3: Update `.env.local.example`**

Append the following block to `.env.local.example` (after the `SUPABASE_SERVICE_ROLE_KEY=` line):

```env

# Resend — survey confirmation emails
# Get an API key at https://resend.com/api-keys
# Leave RESEND_API_KEY unset to disable sending (route still returns 200,
# logs "email disabled — skipping send"). Useful before learnify.academy
# is verified on Resend.
RESEND_API_KEY=
# From-address. Defaults to "Learnify Team <noreply@learnify.academy>"
# in lib/email.ts if unset.
EMAIL_FROM=
# Optional kill switch. Set to "false" to disable sends without removing
# the API key. Defaults to enabled when RESEND_API_KEY is set.
EMAIL_ENABLED=
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "Add resend dependency and email env scaffolding"
```

---

## Task 2: Create the email wrapper

**Files:**
- Create: `lib/email.ts`

- [ ] **Step 1: Create `lib/email.ts`**

Create the file with this exact content:

```ts
import { Resend } from "resend";

const DEFAULT_FROM = "Learnify Team <noreply@learnify.academy>";

let resendClient: Resend | null = null;

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not set");
  }
  if (!resendClient) {
    resendClient = new Resend(key);
  }
  return resendClient;
}

function isEnabled(): boolean {
  if (!process.env.RESEND_API_KEY) return false;
  if (process.env.EMAIL_ENABLED === "false") return false;
  return true;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SUBJECT =
  "Thanks for your feedback — Learnify beta / ขอบคุณสำหรับความคิดเห็นของคุณ";

function buildText(name: string): string {
  return `Hi ${name},

Thanks for taking the time to share your feedback on Learnify — it
genuinely helps us shape what we build next.

You're now on the early access list for our beta. We're targeting
June 2026 for the first invites, and we'll email you then with
access details. No action needed from you in the meantime.

— The Learnify Team

--------

สวัสดีค่ะ ${name},

ขอบคุณที่สละเวลาแบ่งปันความคิดเห็นเกี่ยวกับ Learnify ให้พวกเรา — คำตอบ
ของคุณช่วยให้ทีมเราพัฒนาผลิตภัณฑ์ได้ดียิ่งขึ้น

ตอนนี้คุณอยู่ในรายชื่อผู้ทดลองใช้งานตัวทดลอง (รุ่นเบต้า) แล้ว เราตั้งเป้าที่จะเปิดให้
ทดลองใช้งานในเดือนมิถุนายน 2569 จะมีส่งอีเมลแจ้งรายละเอียด
การเข้าใช้งานส่งให้เมื่อตอนนั้นมาถึง ระหว่างรอนี้ยังไม่ต้องดำเนินการใดๆ เราจะกลับมาเร็วๆ นี้!

— ทีม Learnify
`;
}

function buildHtml(name: string): string {
  const safeName = escapeHtml(name);
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f6f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#222;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px;line-height:1.55;font-size:15px;">
      <p>Hi ${safeName},</p>
      <p>Thanks for taking the time to share your feedback on Learnify — it genuinely helps us shape what we build next.</p>
      <p>You're now on the early access list for our beta. We're targeting <strong>June 2026</strong> for the first invites, and we'll email you then with access details. No action needed from you in the meantime.</p>
      <p>— The Learnify Team</p>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:28px 0;">
      <p>สวัสดีค่ะ ${safeName},</p>
      <p>ขอบคุณที่สละเวลาแบ่งปันความคิดเห็นเกี่ยวกับ Learnify ให้พวกเรา — คำตอบของคุณช่วยให้ทีมเราพัฒนาผลิตภัณฑ์ได้ดียิ่งขึ้น</p>
      <p>ตอนนี้คุณอยู่ในรายชื่อผู้ทดลองใช้งานตัวทดลอง (รุ่นเบต้า) แล้ว เราตั้งเป้าที่จะเปิดให้ทดลองใช้งานในเดือน<strong>มิถุนายน 2569</strong> จะมีส่งอีเมลแจ้งรายละเอียดการเข้าใช้งานส่งให้เมื่อตอนนั้นมาถึง ระหว่างรอนี้ยังไม่ต้องดำเนินการใดๆ เราจะกลับมาเร็วๆ นี้!</p>
      <p>— ทีม Learnify</p>
    </div>
  </body>
</html>`;
}

export async function sendSurveyConfirmation(args: {
  to: string;
  name: string;
}): Promise<void> {
  if (!isEnabled()) {
    console.log("email disabled — skipping send");
    return;
  }

  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const resend = getResend();

  const { error } = await resend.emails.send({
    from,
    to: args.to,
    subject: SUBJECT,
    text: buildText(args.name),
    html: buildHtml(args.name),
  });

  if (error) {
    throw new Error(
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "resend send failed",
    );
  }
}
```

- [ ] **Step 2: Type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: no new errors. (If the project already has unrelated errors, focus only on errors involving `lib/email.ts`.)

- [ ] **Step 3: Verify the disable switch works (local sanity check)**

Run a one-off Node script to confirm the no-op path works without an API key:
```bash
node --input-type=module -e "import('./lib/email.ts').then(async m => { delete process.env.RESEND_API_KEY; await m.sendSurveyConfirmation({to:'a@b.c',name:'Test'}); console.log('ok'); })" 2>&1 || echo "(if this errors due to TS loader, skip — Step 4 covers real verification)"
```

Expected: prints `email disabled — skipping send` and then `ok`. If Node refuses to load the `.ts` file directly, skip this step — the manual smoke test in Task 4 covers the same path through the actual route.

- [ ] **Step 4: Commit**

```bash
git add lib/email.ts
git commit -m "Add Resend wrapper with bilingual confirmation template"
```

---

## Task 3: Wire the send into the submit route

**Files:**
- Modify: `app/api/survey/submit/route.ts:1-2` (add import)
- Modify: `app/api/survey/submit/route.ts:164-172` (add fire-and-forget call after beta_signups insert)

- [ ] **Step 1: Add the import**

In `app/api/survey/submit/route.ts`, replace:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
```

With:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { sendSurveyConfirmation } from "@/lib/email";
```

- [ ] **Step 2: Add the fire-and-forget send**

In the same file, find this block (currently lines ~164–172):

```ts
  const { error: signupError } = await supabase
    .from("beta_signups")
    .insert({ email: p.email.trim(), response_id: responseId });
  if (signupError && signupError.code !== "23505") {
    // Survey row already saved — don't fail the request over a signup issue
    console.error("beta_signups insert failed:", signupError);
  }

  return NextResponse.json({ id: responseId }, { status: 200 });
```

Replace it with:

```ts
  const { error: signupError } = await supabase
    .from("beta_signups")
    .insert({ email: p.email.trim(), response_id: responseId });
  if (signupError && signupError.code !== "23505") {
    // Survey row already saved — don't fail the request over a signup issue
    console.error("beta_signups insert failed:", signupError);
  }

  sendSurveyConfirmation({
    to: p.email.trim(),
    name: p.respondent_name.trim(),
  }).catch((e) => {
    console.error("survey confirmation email failed:", {
      response_id: responseId,
      error: e instanceof Error ? e.message : String(e),
    });
  });

  return NextResponse.json({ id: responseId }, { status: 200 });
```

Note: no `await` on `sendSurveyConfirmation` — that's intentional. The route returns to the user immediately; the email send finishes in the background within the same Node function invocation.

- [ ] **Step 3: Type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 4: Lint**

Run:
```bash
npm run lint
```

Expected: no new errors. ESLint may warn about the un-awaited promise — if so, it's fine because we attached `.catch()`. If it still complains, add a single `// eslint-disable-next-line @typescript-eslint/no-floating-promises` comment immediately above the `sendSurveyConfirmation(...)` call.

- [ ] **Step 5: Commit**

```bash
git add app/api/survey/submit/route.ts
git commit -m "Send Resend confirmation email after survey submit"
```

---

## Task 4: Manual smoke testing

**Files:** none modified. This task is verification only.

These steps mirror the spec's testing section. Run them in order — earlier steps don't require Resend setup, later steps do.

- [ ] **Step 1: Disabled-path smoke (no API key)**

In `.env.local`, ensure `RESEND_API_KEY` is **unset or empty**.

Run the dev server:
```bash
npm run dev
```

Submit the survey end-to-end with a real-looking email (use your own email so you'd notice if anything actually sent). After submitting:

Expected:
- Survey page shows the success state.
- Terminal running `npm run dev` shows the line: `email disabled — skipping send`.
- No errors logged.
- A new row exists in `survey_responses` and `beta_signups` in Supabase.

Stop the dev server.

- [ ] **Step 2: Real send via Resend test domain**

Get a Resend API key from https://resend.com/api-keys (free tier is fine).

In `.env.local`, set:
```env
RESEND_API_KEY=re_your_key_here
EMAIL_FROM=onboarding@resend.dev
```

(`onboarding@resend.dev` is Resend's pre-verified test sender. It only delivers to the email address registered on your Resend account — that's fine for now.)

Restart the dev server. Submit the survey using the **email address registered on your Resend account** as the `email` field.

Expected:
- Survey returns success.
- No error in the terminal.
- An email arrives in your inbox within a minute.
- Subject reads: `Thanks for your feedback — Learnify beta / ขอบคุณสำหรับความคิดเห็นของคุณ`
- HTML body shows the English block, a horizontal rule, then the Thai block.
- Your name from the survey form appears in both greetings.
- The Thai year reads `2569` and the English month reads `June 2026`.
- "From" address reads `onboarding@resend.dev` (or whatever you set in `EMAIL_FROM`).

- [ ] **Step 3: HTML injection check**

Submit the survey again with the **respondent name** field set to:
```
<script>alert(1)</script>
```

Expected:
- The email arrives.
- The greeting shows the literal text `<script>alert(1)</script>` (or its HTML-escaped equivalent rendered as plain text).
- No `alert` runs in any email client. View → Message Source (or equivalent) should show `&lt;script&gt;` not `<script>`.

- [ ] **Step 4: Failure path**

In `.env.local`, set:
```env
RESEND_API_KEY=re_invalid_key_for_testing
```

Restart the dev server. Submit the survey.

Expected:
- Survey page shows the success state (the user sees no failure).
- The route returns 200.
- The new survey row exists in Supabase.
- Terminal shows a `survey confirmation email failed:` log line that includes the `response_id` and an error message about the invalid key.

- [ ] **Step 5: Production-prep checklist (no code changes)**

Do **not** mark this step complete until the operator has done all of the following manually:

- Verified `learnify.academy` on Resend (added the SPF + DKIM TXT records they provide to the DNS hosting `learnify.academy`, waited for the dashboard to show "Verified").
- Created a production API key on Resend.
- Added `RESEND_API_KEY` and `EMAIL_FROM=Learnify Team <noreply@learnify.academy>` to the Vercel project's Production + Preview environment variables.
- Triggered a redeploy on Vercel so the new env values take effect.
- Submitted one real test response in production using a different inbox you control, and confirmed delivery from `noreply@learnify.academy`.

If verification isn't done yet, you can still ship the code — leave `RESEND_API_KEY` unset in Vercel and the route will keep working with `email disabled — skipping send` in the logs. Set the key once verification completes; no redeploy needed beyond pushing the env var.

- [ ] **Step 6: Restore `.env.local`**

Set `RESEND_API_KEY` back to whatever you want for ongoing local dev (empty to disable, or your test key).

No commit needed — `.env.local` is gitignored.

---

## Self-review notes (for plan author, not the executor)

- **Spec coverage:** every section of the spec maps to a task — dependency + env (Task 1), email content + wrapper (Task 2), send semantics + route wiring (Task 3), all five manual test cases (Task 4 steps 1–4), and the operator deployment checklist (Task 4 step 5).
- **No automated tests:** explicitly excluded by the spec ("None for v1"). Steps use type-check + lint as the in-IDE feedback loop instead of TDD red-green.
- **Type consistency:** `sendSurveyConfirmation({ to, name })` signature matches between Task 2 (definition) and Task 3 (call site).
- **No placeholders:** every code block is the literal final code.
