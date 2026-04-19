# Survey Email-Upfront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move required email capture from the post-survey Thank You page into the welcome flow between the name form and the "let's get started" transition, and auto-persist the email to `beta_signups` on final submission.

**Architecture:** Frontend-only change. Extend `Welcome` component's internal phase state machine with an `email-form` phase and drop the existing `thanks` phase. Store email in `FormState`. Final survey submission does a second Supabase insert into `beta_signups` with graceful handling of duplicate-email. Thank You page is simplified to a confirmation view.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, framer-motion, `@supabase/supabase-js`. No test framework exists in the project — verification is via `npm run lint`, `npm run build`, and manual browser testing.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `components/survey/types.ts` | Modify | Add `email` to `FormState`/`INITIAL_FORM`, add `isEmailValid` helper |
| `lib/i18n.tsx` | Modify | Add email welcome copy (en + th), remove unused thank-you/error copy |
| `components/survey/welcome.tsx` | Modify | Add `email-form` phase, drop `thanks` phase |
| `app/survey/page.tsx` | Modify | After `survey_responses` insert, insert email into `beta_signups` |
| `components/survey/thank-you.tsx` | Modify | Strip stage machinery; confirmation view only |

---

## Task 1: Extend `FormState` with email field

**Files:**
- Modify: `components/survey/types.ts`

- [ ] **Step 1: Add `email` field to `FormState` and `INITIAL_FORM`, add `isEmailValid` helper**

Replace the `FormState` type, `INITIAL_FORM` constant, and append the `isEmailValid` helper. Full updated file content for the affected region:

```typescript
export type FormState = {
  respondent_name: string;
  email: string;
  q1_tools_used: string;
  q2_frequency: Q2Option | "";
  q3_use_cases: Q3Option[];
  q3_other: string;
  q4_frustrations: Q4Option[];
  q4_other: string;
  q5_curriculum_fit: number | null;
  q6_wish: string;
  q7_try_likelihood: number | null;
  q8_top_feature: Q8Option | "";
  q8_other: string;
  q9_blockers: Q9Option[];
  q9_other: string;
  q10_extra: string;
};

export const INITIAL_FORM: FormState = {
  respondent_name: "",
  email: "",
  q1_tools_used: "",
  q2_frequency: "",
  q3_use_cases: [],
  q3_other: "",
  q4_frustrations: [],
  q4_other: "",
  q5_curriculum_fit: null,
  q6_wish: "",
  q7_try_likelihood: null,
  q8_top_feature: "",
  q8_other: "",
  q9_blockers: [],
  q9_other: "",
  q10_extra: "",
};

export const TOTAL_QUESTIONS = 10;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isWelcomeValid(form: FormState): boolean {
  return form.respondent_name.trim().length > 0;
}

export function isEmailValid(form: FormState): boolean {
  return EMAIL_RE.test(form.email.trim());
}

export function canAdvance(step: number, form: FormState): boolean {
  if (step === 1) return form.q1_tools_used.trim().length > 0;
  if (step === 7) return form.q7_try_likelihood !== null;
  if (step === 8) return form.q8_top_feature !== "";
  return step >= 1 && step <= TOTAL_QUESTIONS;
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit`
Expected: No errors (or only errors in files we haven't touched yet).

---

## Task 2: Update i18n copy

**Files:**
- Modify: `lib/i18n.tsx`

- [ ] **Step 1: Update the `Translations` type**

In the `Translations` type, change the `welcome` and `thankYou` and `errors` sub-shapes:

```typescript
welcome: {
  greetingPrefix: string;
  greetingTitle: string;
  nameQuestion: string;
  namePlaceholder: string;
  getStarted: string;
  emailQuestion: string;
  emailPlaceholder: string;
  emailContinue: string;
  emailInvalid: string;
  letsGetStarted: string;
};
```

Remove `thanksMessage` from `welcome`.

Replace the `thankYou` sub-shape entirely with:

```typescript
thankYou: {
  heading: string;
  body: string;
  backToHome: string;
};
```

Replace the `errors` sub-shape with:

```typescript
errors: {
  submitFailed: string;
};
```

- [ ] **Step 2: Update English translations**

In the `en.surveyPage` object:

Replace the `welcome` block with:

```typescript
welcome: {
  greetingPrefix: "Welcome to the",
  greetingTitle: "Learnify Survey",
  nameQuestion: "What's your name?",
  namePlaceholder: "Your name",
  getStarted: "Get Started →",
  emailQuestion: "What's your email?",
  emailPlaceholder: "you@example.com",
  emailContinue: "Continue →",
  emailInvalid: "Please enter a valid email.",
  letsGetStarted: "Let's get started!",
},
```

Replace the `thankYou` block with:

```typescript
thankYou: {
  heading: "Thanks, {name} — you're helping us build Learnify",
  body: "We'll email you when the beta opens.",
  backToHome: "← Back to home",
},
```

Replace the `errors` block with:

```typescript
errors: {
  submitFailed: "Couldn't submit — please try again.",
},
```

- [ ] **Step 3: Update Thai translations**

In the `th.surveyPage` object:

Replace the `welcome` block with:

```typescript
welcome: {
  greetingPrefix: "ยินดีต้อนรับสู่",
  greetingTitle: "แบบสอบถาม Learnify",
  nameQuestion: "คุณชื่ออะไร?",
  namePlaceholder: "ชื่อของคุณ",
  getStarted: "เริ่มต้น →",
  emailQuestion: "อีเมลของคุณคืออะไร?",
  emailPlaceholder: "you@example.com",
  emailContinue: "ต่อไป →",
  emailInvalid: "กรุณากรอกอีเมลที่ถูกต้อง",
  letsGetStarted: "เริ่มกันเลย!",
},
```

Replace the `thankYou` block with:

```typescript
thankYou: {
  heading: "ขอบคุณ {name} — คุณช่วยเราสร้าง Learnify",
  body: "เราจะส่งอีเมลให้ตอนเบต้าเปิด",
  backToHome: "← กลับหน้าแรก",
},
```

Replace the `errors` block with:

```typescript
errors: {
  submitFailed: "ส่งไม่สำเร็จ — ลองอีกครั้ง",
},
```

- [ ] **Step 4: Verify type-check**

Run: `npx tsc --noEmit`
Expected: Errors will exist in `welcome.tsx` and `thank-you.tsx` because they reference copy that no longer matches. That is expected — we will fix them in the next tasks. But **no error should exist in `lib/i18n.tsx` itself.**

---

## Task 3: Rebuild Welcome component with email phase

**Files:**
- Modify: `components/survey/welcome.tsx`

- [ ] **Step 1: Replace the full file contents**

Overwrite `components/survey/welcome.tsx` with:

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { isEmailValid, isWelcomeValid, type FormState } from "./types";

type Phase = "greeting" | "name-form" | "email-form" | "letsStart";

type Props = {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
  onContinue: () => void;
};

export default function Welcome({ form, setForm, onContinue }: Props) {
  const { t } = useLanguage();
  const w = t.surveyPage.welcome;

  const [phase, setPhase] = useState<Phase>("greeting");
  const [emailError, setEmailError] = useState<string | null>(null);

  const onContinueRef = useRef(onContinue);
  useEffect(() => {
    onContinueRef.current = onContinue;
  }, [onContinue]);

  useEffect(() => {
    if (phase === "greeting") {
      const id = window.setTimeout(() => setPhase("name-form"), 2500);
      return () => window.clearTimeout(id);
    }
    if (phase === "letsStart") {
      const id = window.setTimeout(() => onContinueRef.current(), 2000);
      return () => window.clearTimeout(id);
    }
  }, [phase]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isWelcomeValid(form)) setPhase("email-form");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmailValid(form)) {
      setEmailError(null);
      setPhase("letsStart");
    } else {
      setEmailError(w.emailInvalid);
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <AnimatePresence mode="wait">
        {phase === "greeting" && (
          <motion.h1
            key="greeting"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl"
          >
            <span className="block">{w.greetingPrefix}</span>
            <span className="block">{w.greetingTitle}</span>
          </motion.h1>
        )}

        {phase === "name-form" && (
          <motion.form
            key="name-form"
            onSubmit={handleNameSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex w-full max-w-md flex-col items-center gap-6"
          >
            <h1 className="text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl">
              {w.nameQuestion}
            </h1>
            <input
              type="text"
              autoFocus
              maxLength={100}
              value={form.respondent_name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  respondent_name: e.target.value,
                }))
              }
              placeholder={w.namePlaceholder}
              className="w-full border-0 border-b border-black/20 bg-transparent px-0 py-2 text-center text-lg text-[#1a1a1a] outline-none transition-colors placeholder:text-black/30 focus:border-[#1a1a1a]"
            />
            <button
              type="submit"
              disabled={!isWelcomeValid(form)}
              className="inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-8 py-3 text-base font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {w.getStarted}
            </button>
          </motion.form>
        )}

        {phase === "email-form" && (
          <motion.form
            key="email-form"
            onSubmit={handleEmailSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex w-full max-w-md flex-col items-center gap-6"
          >
            <h1 className="text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl">
              {w.emailQuestion}
            </h1>
            <input
              type="email"
              autoFocus
              maxLength={200}
              value={form.email}
              onChange={(e) => {
                setEmailError(null);
                setForm((prev) => ({ ...prev, email: e.target.value }));
              }}
              placeholder={w.emailPlaceholder}
              className="w-full border-0 border-b border-black/20 bg-transparent px-0 py-2 text-center text-lg text-[#1a1a1a] outline-none transition-colors placeholder:text-black/30 focus:border-[#1a1a1a]"
            />
            {emailError && (
              <p className="text-sm text-[#c13b3b]">{emailError}</p>
            )}
            <button
              type="submit"
              disabled={!isEmailValid(form)}
              className="inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-8 py-3 text-base font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {w.emailContinue}
            </button>
          </motion.form>
        )}

        {phase === "letsStart" && (
          <motion.h1
            key="letsStart"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl"
          >
            {w.letsGetStarted}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
}
```

Notes on what changed vs. old component:
- `Phase` union now has `name-form` + `email-form`; `thanks` phase removed.
- `canContinue` prop removed from `Props` (component gates internally using `isWelcomeValid` + `isEmailValid` helpers).
- Two separate form handlers (`handleNameSubmit`, `handleEmailSubmit`).
- `emailError` local state for inline validation.
- `letsStart` still auto-transitions after 2s by calling `onContinue()`.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: `app/survey/page.tsx` will now complain that `Welcome` no longer accepts `canContinue` prop. That's expected — fixed in Task 4.

---

## Task 4: Update survey page to persist email to `beta_signups`

**Files:**
- Modify: `app/survey/page.tsx`

- [ ] **Step 1: Update imports and remove `isWelcomeValid` reliance**

In `app/survey/page.tsx`, update the import from `./types` — remove `isWelcomeValid` (no longer needed; `Welcome` gates internally):

```typescript
import {
  INITIAL_FORM,
  TOTAL_QUESTIONS,
  type FormState,
  canAdvance,
} from "@/components/survey/types";
```

- [ ] **Step 2: Remove `canContinue` prop from the `Welcome` usage**

Find the `Welcome` JSX block (around line 112). Replace it with:

```jsx
<Welcome
  form={form}
  setForm={setForm}
  onContinue={leaveWelcome}
/>
```

- [ ] **Step 3: Extend `submit` to insert into `beta_signups`**

Find the `submit` async function. Replace the entire function body with:

```typescript
const submit = async () => {
  setSubmitError(null);
  setIsSubmitting(true);
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("survey_responses")
      .insert({
        language,
        respondent_name: form.respondent_name.trim(),
        q1_tools_used: form.q1_tools_used.trim(),
        q2_frequency: form.q2_frequency || null,
        q3_use_cases:
          form.q3_use_cases.length > 0 ? form.q3_use_cases : null,
        q3_other: form.q3_other.trim() || null,
        q4_frustrations:
          form.q4_frustrations.length > 0 ? form.q4_frustrations : null,
        q4_other: form.q4_other.trim() || null,
        q5_curriculum_fit: form.q5_curriculum_fit,
        q6_wish: form.q6_wish.trim() || null,
        q7_try_likelihood: form.q7_try_likelihood,
        q8_top_feature: form.q8_top_feature,
        q8_other: form.q8_other.trim() || null,
        q9_blockers: form.q9_blockers.length > 0 ? form.q9_blockers : null,
        q9_other: form.q9_other.trim() || null,
        q10_extra: form.q10_extra.trim() || null,
      })
      .select("id")
      .single();
    if (error || !data) {
      setSubmitError(sp.errors.submitFailed);
      setIsSubmitting(false);
      return;
    }

    const newResponseId = data.id as string;

    const { error: betaError } = await supabase
      .from("beta_signups")
      .insert({ email: form.email.trim(), response_id: newResponseId });
    if (betaError && betaError.code !== "23505") {
      // Non-duplicate error — log, but don't block success. Survey response
      // is already saved, which is the primary goal.
      console.error("beta_signups insert failed:", betaError);
    }

    setResponseId(newResponseId);
    setIsSubmitting(false);
    setStep(THANK_YOU_STEP);
  } catch {
    setSubmitError(sp.errors.submitFailed);
    setIsSubmitting(false);
  }
};
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: Errors will now only be in `thank-you.tsx` (references removed i18n keys). That's fixed in Task 5.

---

## Task 5: Simplify the Thank You page

**Files:**
- Modify: `components/survey/thank-you.tsx`

- [ ] **Step 1: Replace the full file contents**

Overwrite `components/survey/thank-you.tsx` with:

```typescript
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

type Props = {
  responseId: string | null;
  name: string;
};

export default function ThankYou({ responseId: _responseId, name }: Props) {
  const { t } = useLanguage();
  const ty = t.surveyPage.thankYou;

  const heading = ty.heading.replace("{name}", name);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="8 12 11 15 16 9" />
      </svg>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
        {heading}
      </h1>
      <div className="mt-5 h-0.5 w-12 bg-[#1a1a1a]" aria-hidden />

      <p className="mt-6 max-w-md text-base text-[#6b6b6b]">{ty.body}</p>

      <Link
        href="/"
        className="mt-8 text-sm font-medium text-[#1a1a1a] underline-offset-4 hover:underline"
      >
        {ty.backToHome}
      </Link>
    </div>
  );
}
```

Notes:
- All stage state, email input, Supabase call, and error handling are gone.
- `responseId` prop is kept (with underscore prefix to mark unused) so the caller in `app/survey/page.tsx` doesn't need changes.
- If you prefer to drop the unused prop entirely: also change `ThankYou` usage in `app/survey/page.tsx` to stop passing `responseId`. For this plan we keep it to minimize the diff.

---

## Task 6: Verify and commit

- [ ] **Step 1: Type-check passes clean**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 2: Lint passes**

Run: `npm run lint`
Expected: No errors. Warnings about the unused `responseId` prop are fine (the underscore prefix suppresses the TS warning, but ESLint may still flag it — if so, either silence with an inline disable or remove the prop from the signature and the caller).

- [ ] **Step 3: Build passes**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Manual browser test**

Start dev server: `npm run dev`

In a fresh incognito window, go to `http://localhost:3000/survey` and verify:

1. Greeting appears for ~2.5s, auto-advances to name form.
2. Name form accepts input; "Get Started" disabled until name is non-empty.
3. Clicking "Get Started" transitions to email form.
4. Email form: "Continue" disabled while email is empty or malformed.
5. Typing an obviously bad email (e.g. `not-an-email`) then pressing Enter shows the inline validation error.
6. Typing a valid email then pressing Continue transitions to "Let's get started!"; auto-advances to Q1 after ~2s.
7. Complete Q1–Q10. Submit.
8. Confirm the Thank You page renders the confirmation view (no email input).
9. Open Supabase SQL editor and run: `select id, respondent_name from public.survey_responses order by created_at desc limit 1;` — row exists.
10. Run: `select email, response_id from public.beta_signups order by created_at desc limit 1;` — the row exists with your test email and `response_id` matching step 9.
11. **Duplicate-email path:** Reload the page in a new incognito tab, fill out again using the same email. Complete submission. Confirm the survey response still lands (step 9 query shows a new row) and the user lands on Thank You without error.

Also retest in Thai: toggle the language if the header has a toggle, or add `?lang=th` — confirm the email question and validation text show Thai copy.

- [ ] **Step 5: Commit**

```bash
git add components/survey/types.ts lib/i18n.tsx components/survey/welcome.tsx app/survey/page.tsx components/survey/thank-you.tsx
git commit -m "$(cat <<'EOF'
Collect email upfront in survey welcome flow

Move required email capture from the post-survey Thank You page into
the welcome sequence, between the name form and the "Let's get started"
transition. Persist email to beta_signups on final submission; tolerate
duplicate-email inserts silently. Simplify Thank You page to a
confirmation view.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Spec coverage

- ✅ Flow `greeting → name-form → email-form → letsStart → Q1` — Task 3
- ✅ Email required, regex-validated, inline error on failed submit — Task 3
- ✅ `FormState.email` + `isEmailValid` — Task 1
- ✅ Insert into `beta_signups` at submission with duplicate tolerance — Task 4
- ✅ Thank You page reduced to confirmation view — Task 5
- ✅ i18n additions (`emailQuestion`, `emailPlaceholder`, `emailContinue`, `emailInvalid`) and removals (`thanksMessage` and stale thank-you/error keys) — Task 2
- ✅ No DB schema change — confirmed throughout
