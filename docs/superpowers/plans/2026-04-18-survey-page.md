# Survey Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone `/survey` page that collects pre-launch product validation from Thai students and offers beta-waitlist signup, persisting to Supabase in EN or TH.

**Architecture:** New App Router route `app/survey/page.tsx` (client component). Page-level state holds 10 answers across 3 wizard steps with a 4th thank-you screen. The 3 step views and the thank-you view live in `components/survey/*.tsx`. Submissions write to two Supabase tables (`survey_responses` + `beta_signups`) via an anon-key client initialized in `lib/supabase.ts`. The existing landing header gets a `simplified` prop so the survey page mounts logo + language toggle only.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4, framer-motion 12 (for entrance animation only), `@supabase/supabase-js` v2. No test framework — verification is `npx tsc --noEmit` + HTTP curl checks + manual walkthrough.

**Spec reference:** `docs/superpowers/specs/2026-04-18-survey-page-design.md`

---

## File Structure

| File | Responsibility | Status |
|---|---|---|
| `package.json` + `package-lock.json` | Add `@supabase/supabase-js` | Modify |
| `.env.local.example` | Template env vars for Supabase | Create |
| `supabase/migrations/0001_survey_schema.sql` | SQL to set up tables + RLS (user pastes into Supabase SQL editor) | Create |
| `lib/supabase.ts` | Singleton browser Supabase client | Create |
| `lib/i18n.tsx` | Extend `Translations` type + EN/TH with `surveyPage` | Modify |
| `components/landing/header.tsx` | Add `simplified?: boolean` prop | Modify |
| `components/landing/survey.tsx` | Point CTA to `/survey` w/ `target="_blank"` | Modify |
| `components/survey/types.ts` | `FormState` shape + stable option-key constants | Create |
| `components/survey/progress.tsx` | Progress bar (`Step X of 3`) | Create |
| `components/survey/nav.tsx` | Back / Next / Submit buttons | Create |
| `components/survey/step1.tsx` | Current-tools questions (Q1-Q3) | Create |
| `components/survey/step2.tsx` | Pain-point questions (Q4-Q6) | Create |
| `components/survey/step3.tsx` | Learnify-reaction questions (Q7-Q10) + blurb | Create |
| `components/survey/thank-you.tsx` | Thank-you + email capture screen | Create |
| `app/survey/page.tsx` | Page shell: header, state, step routing | Create |

---

### Task 1: Install Supabase client

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install the dependency**

Run from repo root:

```bash
npm install @supabase/supabase-js@^2
```

Expected: `package.json` adds `"@supabase/supabase-js": "^2.x.y"` under `dependencies`, `package-lock.json` updates.

- [ ] **Step 2: Verify it installed cleanly**

Run: `npx tsc --noEmit`
Expected: no new errors introduced by this change. (Pre-existing errors in `components/ui/cobe-globe-polaroids.tsx` and `components/ui/cobe-globe-thailand-pin.tsx` are unrelated — ignore them throughout this plan.)

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add @supabase/supabase-js dependency"
```

---

### Task 2: Provide Supabase schema + env template

This task produces two checked-in files — the SQL the user will paste into the Supabase dashboard, and an `.env.local.example` so other contributors know which vars are needed. **The user must still manually create the Supabase project and run the SQL; that's not automatable from this repo.**

**Files:**
- Create: `supabase/migrations/0001_survey_schema.sql`
- Create: `.env.local.example`

- [ ] **Step 1: Create the SQL migration file**

Create `supabase/migrations/0001_survey_schema.sql` with exactly this content:

```sql
-- Survey page schema
-- Run this in the Supabase SQL editor on a fresh project.

create extension if not exists "pgcrypto";

create table survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  language text not null check (language in ('en', 'th')),
  q1_tools_used text not null,
  q2_frequency text,
  q3_use_cases text[],
  q3_other text,
  q4_frustration text,
  q4_other text,
  q5_curriculum_fit smallint check (q5_curriculum_fit between 1 and 5),
  q6_wish text,
  q7_try_likelihood smallint not null check (q7_try_likelihood between 1 and 5),
  q8_top_feature text not null,
  q8_other text,
  q9_blockers text[],
  q9_other text,
  q10_extra text
);

alter table survey_responses enable row level security;

create policy "anon can insert responses"
  on survey_responses
  for insert
  to anon
  with check (true);

create table beta_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  response_id uuid references survey_responses(id) on delete set null
);

alter table beta_signups enable row level security;

create policy "anon can insert signups"
  on beta_signups
  for insert
  to anon
  with check (true);
```

- [ ] **Step 2: Create `.env.local.example`**

Create `.env.local.example` in the repo root with exactly this content:

```
# Supabase — create a project at https://supabase.com, then copy Project URL + anon key
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0001_survey_schema.sql .env.local.example
git commit -m "Add Supabase schema and env template for survey"
```

- [ ] **Step 4: USER ACTION — create Supabase project + populate env**

*This step is not executed by the implementer subagent. Surface it in the handoff.* The user must:

1. Create a Supabase project at https://supabase.com.
2. Copy the SQL from `supabase/migrations/0001_survey_schema.sql` into the project's SQL editor and run it.
3. Copy the Project URL and anon key from Project Settings → API.
4. Create `.env.local` in the repo root mirroring `.env.local.example` with the real values filled in.
5. Restart `npm run dev` so Next.js picks up the new env vars.

---

### Task 3: Create Supabase browser client

**Files:**
- Create: `lib/supabase.ts`

- [ ] **Step 1: Create `lib/supabase.ts`**

Create `lib/supabase.ts` with exactly this content:

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env vars missing — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }
  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}
```

**Note:** We gate client creation behind a function so the page renders fine in dev without env vars — only the actual Submit button will throw, with a clear error in the console. This keeps the typecheck + HTML checks in later tasks useful even before the user has wired up Supabase.

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase.ts
git commit -m "Add Supabase client module"
```

---

### Task 4: Extend i18n with surveyPage strings

**Files:**
- Modify: `lib/i18n.tsx`

- [ ] **Step 1: Add `surveyPage` field to the `Translations` type**

Open `lib/i18n.tsx`. Find the `Translations` type. Inside it, immediately after the closing `};` of the `survey` block and before the outer closing `};` of `Translations`, add:

```ts
  surveyPage: {
    meta: { title: string; backToHome: string };
    progress: { stepLabel: string };
    nav: { back: string; next: string; submit: string; submitting: string };
    step1: {
      eyebrow: string;
      headline: string;
      q1: { label: string; placeholder: string };
      q2: {
        label: string;
        options: {
          daily: string;
          severalTimesWeek: string;
          weekly: string;
          rarely: string;
          never: string;
        };
      };
      q3: {
        label: string;
        options: {
          homework: string;
          examPrep: string;
          newTopics: string;
          language: string;
          curiosity: string;
          other: string;
        };
        otherPlaceholder: string;
      };
    };
    step2: {
      eyebrow: string;
      headline: string;
      q4: {
        label: string;
        options: {
          curriculum: string;
          ads: string;
          expensive: string;
          lowQuality: string;
          boring: string;
          noPersonalization: string;
          hardInThai: string;
          other: string;
        };
        otherPlaceholder: string;
      };
      q5: { label: string; minLabel: string; maxLabel: string };
      q6: { label: string; placeholder: string };
    };
    step3: {
      eyebrow: string;
      headline: string;
      blurb: string;
      q7: { label: string; minLabel: string; maxLabel: string };
      q8: {
        label: string;
        options: {
          lumi: string;
          activeLearning: string;
          thaiCurriculum: string;
          personalized: string;
          stats: string;
          none: string;
          other: string;
        };
        otherPlaceholder: string;
      };
      q9: {
        label: string;
        options: {
          price: string;
          parents: string;
          alreadyHave: string;
          dontTrustAi: string;
          noDevice: string;
          nothing: string;
          other: string;
        };
        otherPlaceholder: string;
      };
      q10: { label: string; placeholder: string };
    };
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

- [ ] **Step 2: Add the English `surveyPage` block**

In the `en` translations object, immediately after the closing `},` of the existing `survey` block and before the closing `}` of `en`, add:

```ts
    surveyPage: {
      meta: {
        title: "Learnify Survey",
        backToHome: "← Back to home",
      },
      progress: { stepLabel: "Step {current} of {total}" },
      nav: {
        back: "← Back",
        next: "Next →",
        submit: "Submit",
        submitting: "Submitting…",
      },
      step1: {
        eyebrow: "CURRENT TOOLS",
        headline: "What do you use now?",
        q1: {
          label: "Which learning tools do you currently use?",
          placeholder: "e.g. Khan Academy, YouTube, QANDA…",
        },
        q2: {
          label: "How often do you use them?",
          options: {
            daily: "Daily",
            severalTimesWeek: "Several times a week",
            weekly: "Weekly",
            rarely: "Rarely",
            never: "Never",
          },
        },
        q3: {
          label: "What do you mainly use them for?",
          options: {
            homework: "School homework",
            examPrep: "Exam prep (O-NET / TGAT / TCAS)",
            newTopics: "Learning new topics",
            language: "Language learning",
            curiosity: "General curiosity",
            other: "Other",
          },
          otherPlaceholder: "Tell us more",
        },
      },
      step2: {
        eyebrow: "PAIN POINTS",
        headline: "What's missing?",
        q4: {
          label: "Biggest frustration with your current tools?",
          options: {
            curriculum: "Content doesn't match Thai curriculum",
            ads: "Too many ads",
            expensive: "Too expensive",
            lowQuality: "Low-quality content",
            boring: "Boring / not engaging",
            noPersonalization: "No personalization",
            hardInThai: "Hard to follow in Thai",
            other: "Other",
          },
          otherPlaceholder: "Tell us more",
        },
        q5: {
          label: "How well do they match the Thai curriculum?",
          minLabel: "Not at all",
          maxLabel: "Perfectly",
        },
        q6: {
          label: "What do you wish existed that doesn't?",
          placeholder: "Tell us anything you've been wanting",
        },
      },
      step3: {
        eyebrow: "LEARNIFY",
        headline: "What do you think?",
        blurb:
          "Learnify is a Thai-first learning platform built for high-school students — active lessons, Lumi (an AI tutor), and personalized paths that follow the Thai curriculum.",
        q7: {
          label: "How likely are you to try Learnify?",
          minLabel: "Not likely",
          maxLabel: "Definitely will try",
        },
        q8: {
          label: "Which feature excites you most?",
          options: {
            lumi: "AI tutor (Lumi)",
            activeLearning: "Active learning / quiz-based lessons",
            thaiCurriculum: "Thai curriculum focus",
            personalized: "Personalized learning paths",
            stats: "Progress stats",
            none: "None",
            other: "Other",
          },
          otherPlaceholder: "Tell us more",
        },
        q9: {
          label: "What would stop you from using it?",
          options: {
            price: "Price",
            parents: "Parents wouldn't pay",
            alreadyHave: "I already have something similar",
            dontTrustAi: "Don't trust AI for learning",
            noDevice: "Don't have reliable device/wifi",
            nothing: "Nothing",
            other: "Other",
          },
          otherPlaceholder: "Tell us more",
        },
        q10: {
          label: "Anything else we should know?",
          placeholder: "Open mic — say anything",
        },
      },
      thankYou: {
        heading: "Thanks for helping us build Learnify",
        subheading:
          "Want early access when the beta launches? Drop your email.",
        emailLabel: "Email",
        emailPlaceholder: "you@example.com",
        waitlistCta: "Join the waitlist",
        skipCta: "Skip",
        successHeading: "You're on the list",
        successBody: "We'll email you when the beta opens.",
        skippedBody: "Thanks again for your answers.",
        backToHome: "← Back to home",
      },
      errors: {
        submitFailed: "Couldn't submit — please try again.",
        emailInvalid: "Please enter a valid email.",
        emailDuplicate: "Looks like you're already on the list!",
        emailFailed: "Couldn't save your email — please try again.",
      },
    },
```

- [ ] **Step 3: Add the Thai `surveyPage` block**

In the `th` translations object, immediately after the closing `},` of the existing `survey` block and before the closing `}` of `th`, add:

```ts
    surveyPage: {
      meta: {
        title: "แบบสอบถาม Learnify",
        backToHome: "← กลับหน้าแรก",
      },
      progress: { stepLabel: "ขั้นที่ {current} จาก {total}" },
      nav: {
        back: "← ย้อนกลับ",
        next: "ถัดไป →",
        submit: "ส่งคำตอบ",
        submitting: "กำลังส่ง…",
      },
      step1: {
        eyebrow: "เครื่องมือปัจจุบัน",
        headline: "ตอนนี้คุณใช้อะไรอยู่?",
        q1: {
          label: "คุณใช้เครื่องมือการเรียนรู้อะไรอยู่ในตอนนี้?",
          placeholder: "เช่น Khan Academy, YouTube, QANDA…",
        },
        q2: {
          label: "ใช้บ่อยแค่ไหน?",
          options: {
            daily: "ทุกวัน",
            severalTimesWeek: "หลายครั้งต่อสัปดาห์",
            weekly: "สัปดาห์ละครั้ง",
            rarely: "นานๆ ครั้ง",
            never: "ไม่ได้ใช้",
          },
        },
        q3: {
          label: "ส่วนใหญ่ใช้เพื่ออะไร?",
          options: {
            homework: "การบ้าน",
            examPrep: "เตรียมสอบ (O-NET / TGAT / TCAS)",
            newTopics: "เรียนเรื่องใหม่ๆ",
            language: "ภาษา",
            curiosity: "ความอยากรู้ทั่วไป",
            other: "อื่นๆ",
          },
          otherPlaceholder: "บอกเพิ่มเติม",
        },
      },
      step2: {
        eyebrow: "ปัญหาที่เจอ",
        headline: "ขาดอะไรไปบ้าง?",
        q4: {
          label: "อะไรที่ทำให้คุณหงุดหงิดที่สุดกับเครื่องมือในตอนนี้?",
          options: {
            curriculum: "เนื้อหาไม่ตรงหลักสูตรไทย",
            ads: "โฆษณาเยอะเกินไป",
            expensive: "แพงเกินไป",
            lowQuality: "เนื้อหาคุณภาพต่ำ",
            boring: "น่าเบื่อ / ไม่น่าสนใจ",
            noPersonalization: "ไม่มีการปรับให้เฉพาะตัว",
            hardInThai: "ฟังภาษาไทยยาก",
            other: "อื่นๆ",
          },
          otherPlaceholder: "บอกเพิ่มเติม",
        },
        q5: {
          label: "เครื่องมือปัจจุบันตรงกับหลักสูตรไทยดีแค่ไหน?",
          minLabel: "ไม่ตรงเลย",
          maxLabel: "ตรงเป๊ะ",
        },
        q6: {
          label: "อยากให้มีอะไรที่ตอนนี้ยังไม่มี?",
          placeholder: "บอกสิ่งที่คุณอยากได้",
        },
      },
      step3: {
        eyebrow: "LEARNIFY",
        headline: "คิดยังไงกับ Learnify?",
        blurb:
          "Learnify คือแพลตฟอร์มการเรียนรู้ที่สร้างเพื่อคนไทยโดยเฉพาะ — บทเรียนแบบ active, Lumi (AI ติวเตอร์) และเส้นทางการเรียนที่ปรับให้เหมาะกับแต่ละคนตามหลักสูตรไทย",
        q7: {
          label: "มีแนวโน้มจะลอง Learnify แค่ไหน?",
          minLabel: "ไม่น่าจะลอง",
          maxLabel: "ลองแน่ๆ",
        },
        q8: {
          label: "ฟีเจอร์ไหนที่ทำให้คุณตื่นเต้นที่สุด?",
          options: {
            lumi: "AI ติวเตอร์ (Lumi)",
            activeLearning: "Active Learning / บทเรียนแบบมีโจทย์",
            thaiCurriculum: "เน้นหลักสูตรไทย",
            personalized: "เส้นทางการเรียนเฉพาะตัว",
            stats: "ติดตามสถิติ",
            none: "ไม่มีเลย",
            other: "อื่นๆ",
          },
          otherPlaceholder: "บอกเพิ่มเติม",
        },
        q9: {
          label: "อะไรที่อาจทำให้คุณไม่ใช้ Learnify?",
          options: {
            price: "ราคา",
            parents: "พ่อแม่ไม่จ่าย",
            alreadyHave: "มีอะไรคล้ายๆ อยู่แล้ว",
            dontTrustAi: "ไม่ไว้ใจ AI ในการเรียน",
            noDevice: "ไม่มีอุปกรณ์หรือเน็ตที่ดี",
            nothing: "ไม่มีเลย",
            other: "อื่นๆ",
          },
          otherPlaceholder: "บอกเพิ่มเติม",
        },
        q10: {
          label: "อยากบอกอะไรเราอีก?",
          placeholder: "พูดอะไรก็ได้",
        },
      },
      thankYou: {
        heading: "ขอบคุณที่ช่วยสร้าง Learnify",
        subheading: "อยากเข้าถึงก่อนใครตอนเปิดเบต้าไหม? ใส่อีเมลไว้ได้เลย",
        emailLabel: "อีเมล",
        emailPlaceholder: "you@example.com",
        waitlistCta: "สมัครรอคิว",
        skipCta: "ข้าม",
        successHeading: "คุณอยู่ในคิวแล้ว",
        successBody: "เราจะส่งอีเมลให้ตอนเบต้าเปิด",
        skippedBody: "ขอบคุณอีกครั้งสำหรับคำตอบ",
        backToHome: "← กลับหน้าแรก",
      },
      errors: {
        submitFailed: "ส่งไม่สำเร็จ — ลองอีกครั้ง",
        emailInvalid: "กรุณากรอกอีเมลที่ถูกต้อง",
        emailDuplicate: "ดูเหมือนคุณจะอยู่ในคิวแล้ว!",
        emailFailed: "บันทึกอีเมลไม่สำเร็จ — ลองอีกครั้ง",
      },
    },
```

- [ ] **Step 4: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors. If there are errors about the type literal not matching for either `en` or `th`, the shape of the EN/TH object must exactly match the type — double-check commas and nesting.

- [ ] **Step 5: Commit**

```bash
git add lib/i18n.tsx
git commit -m "Add survey page translations"
```

---

### Task 5: Add simplified variant to Header

**Files:**
- Modify: `components/landing/header.tsx`

- [ ] **Step 1: Replace `components/landing/header.tsx` with the simplified-aware version**

Open `components/landing/header.tsx` and replace the entire file with:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import LanguageDropdown from "@/components/ui/dropdown";
import { useLanguage } from "@/lib/i18n";

type Props = { simplified?: boolean };

export default function Header({ simplified = false }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { label: t.nav.about, href: "#about" },
    { label: t.nav.features, href: "#features" },
    { label: t.nav.pricing, href: "#pricing" },
    { label: t.nav.survey, href: "#survey" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-[#f9f9f7]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-[24px] leading-none tracking-tight text-[#1a1a1a]"
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 900 }}
        >
          Learnify.
        </Link>

        {simplified ? (
          /* Simplified: just the language toggle on the right */
          <LanguageDropdown />
        ) : (
          <>
            {/* Desktop Nav */}
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-[#6b6b6b] transition-colors hover:text-[#1a1a1a]"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* CTA + Language */}
            <div className="hidden items-center gap-3 md:flex">
              <a
                href="#waitlist"
                className="rounded-full border border-[#1a1a1a] px-5 py-2 text-sm font-medium text-[#1a1a1a] transition-all hover:bg-[#1a1a1a] hover:text-white"
              >
                {t.joinWaitlist}
              </a>
              <LanguageDropdown />
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col gap-1.5 md:hidden"
              aria-label="Toggle menu"
            >
              <span
                className={`h-0.5 w-5 bg-[#1a1a1a] transition-transform ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`h-0.5 w-5 bg-[#1a1a1a] transition-opacity ${mobileOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`h-0.5 w-5 bg-[#1a1a1a] transition-transform ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </button>
          </>
        )}
      </div>

      {/* Mobile menu — only in full variant */}
      {!simplified && mobileOpen && (
        <div className="border-t border-black/5 bg-[#f9f9f7] px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#6b6b6b] transition-colors hover:text-[#1a1a1a]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#waitlist"
              className="mt-2 inline-flex w-fit rounded-full border border-[#1a1a1a] px-5 py-2 text-sm font-medium text-[#1a1a1a] transition-all hover:bg-[#1a1a1a] hover:text-white"
            >
              {t.joinWaitlist}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Verify the landing page still renders the full header**

With the dev server running on `http://localhost:3000`, run:

```bash
curl -s http://localhost:3000 | grep -oE '#about|#features|#pricing|#survey' | sort -u
```

Expected: all four anchor strings appear (landing page still uses `<Header />` — full variant).

- [ ] **Step 4: Commit**

```bash
git add components/landing/header.tsx
git commit -m "Add simplified header variant for focused flows"
```

---

### Task 6: Create shared survey types + option constants

**Files:**
- Create: `components/survey/types.ts`

- [ ] **Step 1: Create `components/survey/types.ts`**

Create `components/survey/types.ts` with exactly this content:

```ts
// Stable option keys — these are what persist to the DB.
// Labels are pulled from i18n at render time.

export const Q2_OPTIONS = [
  "daily",
  "severalTimesWeek",
  "weekly",
  "rarely",
  "never",
] as const;
export type Q2Option = (typeof Q2_OPTIONS)[number];

export const Q3_OPTIONS = [
  "homework",
  "examPrep",
  "newTopics",
  "language",
  "curiosity",
  "other",
] as const;
export type Q3Option = (typeof Q3_OPTIONS)[number];

export const Q4_OPTIONS = [
  "curriculum",
  "ads",
  "expensive",
  "lowQuality",
  "boring",
  "noPersonalization",
  "hardInThai",
  "other",
] as const;
export type Q4Option = (typeof Q4_OPTIONS)[number];

export const Q8_OPTIONS = [
  "lumi",
  "activeLearning",
  "thaiCurriculum",
  "personalized",
  "stats",
  "none",
  "other",
] as const;
export type Q8Option = (typeof Q8_OPTIONS)[number];

export const Q9_OPTIONS = [
  "price",
  "parents",
  "alreadyHave",
  "dontTrustAi",
  "noDevice",
  "nothing",
  "other",
] as const;
export type Q9Option = (typeof Q9_OPTIONS)[number];

export type FormState = {
  q1_tools_used: string;
  q2_frequency: Q2Option | "";
  q3_use_cases: Q3Option[];
  q3_other: string;
  q4_frustration: Q4Option | "";
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
  q1_tools_used: "",
  q2_frequency: "",
  q3_use_cases: [],
  q3_other: "",
  q4_frustration: "",
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

export function isStep1Valid(form: FormState): boolean {
  return form.q1_tools_used.trim().length > 0;
}

export function isStep2Valid(_form: FormState): boolean {
  return true; // no required fields on step 2
}

export function isStep3Valid(form: FormState): boolean {
  return form.q7_try_likelihood !== null && form.q8_top_feature !== "";
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/survey/types.ts
git commit -m "Add survey form types and option constants"
```

---

### Task 7: Build Progress + Nav components

**Files:**
- Create: `components/survey/progress.tsx`
- Create: `components/survey/nav.tsx`

- [ ] **Step 1: Create `components/survey/progress.tsx`**

Create `components/survey/progress.tsx` with exactly this content:

```tsx
"use client";

type Props = {
  current: number;
  total: number;
  stepLabelTemplate: string; // e.g. "Step {current} of {total}"
};

export default function Progress({ current, total, stepLabelTemplate }: Props) {
  const pct = Math.round((current / total) * 100);
  const label = stepLabelTemplate
    .replace("{current}", String(current))
    .replace("{total}", String(total));

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[#6b6b6b]">{label}</span>
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-black/10"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[#1a1a1a] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/survey/nav.tsx`**

Create `components/survey/nav.tsx` with exactly this content:

```tsx
"use client";

type Props = {
  onBack?: () => void;
  onNext: () => void;
  backLabel: string;
  nextLabel: string;
  nextDisabled?: boolean;
  isSubmitting?: boolean;
};

export default function Nav({
  onBack,
  onNext,
  backLabel,
  nextLabel,
  nextDisabled = false,
  isSubmitting = false,
}: Props) {
  return (
    <div className="mt-12 flex items-center justify-between gap-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-sm font-medium text-[#6b6b6b] transition-colors hover:text-[#1a1a1a] disabled:opacity-50"
        >
          {backLabel}
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-8 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-[#1a1a1a]"
      >
        {nextLabel}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add components/survey/progress.tsx components/survey/nav.tsx
git commit -m "Add survey progress bar and nav components"
```

---

### Task 8: Build Step 1 component (Q1-Q3)

**Files:**
- Create: `components/survey/step1.tsx`

- [ ] **Step 1: Create `components/survey/step1.tsx`**

Create `components/survey/step1.tsx` with exactly this content:

```tsx
"use client";

import { useLanguage } from "@/lib/i18n";
import { Q2_OPTIONS, Q3_OPTIONS, type FormState } from "./types";

type Props = {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
};

export default function Step1({ form, setForm }: Props) {
  const { t } = useLanguage();
  const s = t.surveyPage.step1;

  const toggleUseCase = (key: (typeof Q3_OPTIONS)[number]) => {
    setForm((prev) => {
      const has = prev.q3_use_cases.includes(key);
      return {
        ...prev,
        q3_use_cases: has
          ? prev.q3_use_cases.filter((k) => k !== key)
          : [...prev.q3_use_cases, key],
      };
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <span className="text-sm font-bold tracking-[0.2em] text-[#6b6b6b]">
          {s.eyebrow}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
          {s.headline}
        </h1>
      </header>

      {/* Q1 — free text, required */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="q1"
          className="text-base font-medium text-[#1a1a1a]"
        >
          {s.q1.label} <span className="text-[#c13b3b]">*</span>
        </label>
        <input
          id="q1"
          type="text"
          maxLength={200}
          value={form.q1_tools_used}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, q1_tools_used: e.target.value }))
          }
          placeholder={s.q1.placeholder}
          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
        />
      </div>

      {/* Q2 — radio, optional */}
      <div className="flex flex-col gap-3">
        <span className="text-base font-medium text-[#1a1a1a]">
          {s.q2.label}
        </span>
        <div className="flex flex-col gap-2">
          {Q2_OPTIONS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#6b6b6b]"
            >
              <input
                type="radio"
                name="q2"
                value={key}
                checked={form.q2_frequency === key}
                onChange={() =>
                  setForm((prev) => ({ ...prev, q2_frequency: key }))
                }
                className="h-4 w-4 accent-[#1a1a1a]"
              />
              <span>{s.q2.options[key]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Q3 — multi-select checkboxes with Other, optional */}
      <div className="flex flex-col gap-3">
        <span className="text-base font-medium text-[#1a1a1a]">
          {s.q3.label}
        </span>
        <div className="flex flex-col gap-2">
          {Q3_OPTIONS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#6b6b6b]"
            >
              <input
                type="checkbox"
                checked={form.q3_use_cases.includes(key)}
                onChange={() => toggleUseCase(key)}
                className="h-4 w-4 accent-[#1a1a1a]"
              />
              <span>{s.q3.options[key]}</span>
            </label>
          ))}
          {form.q3_use_cases.includes("other") && (
            <input
              type="text"
              maxLength={200}
              value={form.q3_other}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, q3_other: e.target.value }))
              }
              placeholder={s.q3.otherPlaceholder}
              className="ml-7 mt-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/survey/step1.tsx
git commit -m "Add survey step 1 component (current tools)"
```

---

### Task 9: Build Step 2 component (Q4-Q6)

**Files:**
- Create: `components/survey/step2.tsx`

- [ ] **Step 1: Create `components/survey/step2.tsx`**

Create `components/survey/step2.tsx` with exactly this content:

```tsx
"use client";

import { useLanguage } from "@/lib/i18n";
import { Q4_OPTIONS, type FormState } from "./types";

type Props = {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
};

export default function Step2({ form, setForm }: Props) {
  const { t } = useLanguage();
  const s = t.surveyPage.step2;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <span className="text-sm font-bold tracking-[0.2em] text-[#6b6b6b]">
          {s.eyebrow}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
          {s.headline}
        </h1>
      </header>

      {/* Q4 — radio with Other, optional */}
      <div className="flex flex-col gap-3">
        <span className="text-base font-medium text-[#1a1a1a]">
          {s.q4.label}
        </span>
        <div className="flex flex-col gap-2">
          {Q4_OPTIONS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#6b6b6b]"
            >
              <input
                type="radio"
                name="q4"
                value={key}
                checked={form.q4_frustration === key}
                onChange={() =>
                  setForm((prev) => ({ ...prev, q4_frustration: key }))
                }
                className="h-4 w-4 accent-[#1a1a1a]"
              />
              <span>{s.q4.options[key]}</span>
            </label>
          ))}
          {form.q4_frustration === "other" && (
            <input
              type="text"
              maxLength={200}
              value={form.q4_other}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, q4_other: e.target.value }))
              }
              placeholder={s.q4.otherPlaceholder}
              className="ml-7 mt-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
            />
          )}
        </div>
      </div>

      {/* Q5 — 1-5 scale, optional */}
      <div className="flex flex-col gap-3">
        <span className="text-base font-medium text-[#1a1a1a]">
          {s.q5.label}
        </span>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, q5_curriculum_fit: n }))
              }
              className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium transition-all ${
                form.q5_curriculum_fit === n
                  ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                  : "border-black/15 bg-white text-[#6b6b6b] hover:border-[#1a1a1a]"
              }`}
              aria-label={`${n}`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-[#9a9a97]">
          <span>1 · {s.q5.minLabel}</span>
          <span>5 · {s.q5.maxLabel}</span>
        </div>
      </div>

      {/* Q6 — textarea, optional */}
      <div className="flex flex-col gap-2">
        <label htmlFor="q6" className="text-base font-medium text-[#1a1a1a]">
          {s.q6.label}
        </label>
        <textarea
          id="q6"
          rows={4}
          maxLength={500}
          value={form.q6_wish}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, q6_wish: e.target.value }))
          }
          placeholder={s.q6.placeholder}
          className="resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/survey/step2.tsx
git commit -m "Add survey step 2 component (pain points)"
```

---

### Task 10: Build Step 3 component (Q7-Q10) with blurb

**Files:**
- Create: `components/survey/step3.tsx`

- [ ] **Step 1: Create `components/survey/step3.tsx`**

Create `components/survey/step3.tsx` with exactly this content:

```tsx
"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n";
import { Q8_OPTIONS, Q9_OPTIONS, type FormState } from "./types";

type Props = {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
};

export default function Step3({ form, setForm }: Props) {
  const { t } = useLanguage();
  const s = t.surveyPage.step3;

  const toggleBlocker = (key: (typeof Q9_OPTIONS)[number]) => {
    setForm((prev) => {
      const has = prev.q9_blockers.includes(key);
      return {
        ...prev,
        q9_blockers: has
          ? prev.q9_blockers.filter((k) => k !== key)
          : [...prev.q9_blockers, key],
      };
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <span className="text-sm font-bold tracking-[0.2em] text-[#6b6b6b]">
          {s.eyebrow}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
          {s.headline}
        </h1>
      </header>

      {/* Learnify blurb + mockup */}
      <div className="flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6">
        <p className="text-base leading-relaxed text-[#6b6b6b]">{s.blurb}</p>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#ececea]">
          <Image
            src="/personalized-mockup.png"
            alt="Learnify app preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      </div>

      {/* Q7 — 1-5 scale, REQUIRED */}
      <div className="flex flex-col gap-3">
        <span className="text-base font-medium text-[#1a1a1a]">
          {s.q7.label} <span className="text-[#c13b3b]">*</span>
        </span>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, q7_try_likelihood: n }))
              }
              className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium transition-all ${
                form.q7_try_likelihood === n
                  ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                  : "border-black/15 bg-white text-[#6b6b6b] hover:border-[#1a1a1a]"
              }`}
              aria-label={`${n}`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-[#9a9a97]">
          <span>1 · {s.q7.minLabel}</span>
          <span>5 · {s.q7.maxLabel}</span>
        </div>
      </div>

      {/* Q8 — radio with Other, REQUIRED */}
      <div className="flex flex-col gap-3">
        <span className="text-base font-medium text-[#1a1a1a]">
          {s.q8.label} <span className="text-[#c13b3b]">*</span>
        </span>
        <div className="flex flex-col gap-2">
          {Q8_OPTIONS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#6b6b6b]"
            >
              <input
                type="radio"
                name="q8"
                value={key}
                checked={form.q8_top_feature === key}
                onChange={() =>
                  setForm((prev) => ({ ...prev, q8_top_feature: key }))
                }
                className="h-4 w-4 accent-[#1a1a1a]"
              />
              <span>{s.q8.options[key]}</span>
            </label>
          ))}
          {form.q8_top_feature === "other" && (
            <input
              type="text"
              maxLength={200}
              value={form.q8_other}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, q8_other: e.target.value }))
              }
              placeholder={s.q8.otherPlaceholder}
              className="ml-7 mt-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
            />
          )}
        </div>
      </div>

      {/* Q9 — multi-select checkboxes with Other, optional */}
      <div className="flex flex-col gap-3">
        <span className="text-base font-medium text-[#1a1a1a]">
          {s.q9.label}
        </span>
        <div className="flex flex-col gap-2">
          {Q9_OPTIONS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#6b6b6b]"
            >
              <input
                type="checkbox"
                checked={form.q9_blockers.includes(key)}
                onChange={() => toggleBlocker(key)}
                className="h-4 w-4 accent-[#1a1a1a]"
              />
              <span>{s.q9.options[key]}</span>
            </label>
          ))}
          {form.q9_blockers.includes("other") && (
            <input
              type="text"
              maxLength={200}
              value={form.q9_other}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, q9_other: e.target.value }))
              }
              placeholder={s.q9.otherPlaceholder}
              className="ml-7 mt-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
            />
          )}
        </div>
      </div>

      {/* Q10 — textarea, optional */}
      <div className="flex flex-col gap-2">
        <label htmlFor="q10" className="text-base font-medium text-[#1a1a1a]">
          {s.q10.label}
        </label>
        <textarea
          id="q10"
          rows={4}
          maxLength={1000}
          value={form.q10_extra}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, q10_extra: e.target.value }))
          }
          placeholder={s.q10.placeholder}
          className="resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/survey/step3.tsx
git commit -m "Add survey step 3 component (Learnify reaction)"
```

---

### Task 11: Build Thank-you + email capture component

**Files:**
- Create: `components/survey/thank-you.tsx`

- [ ] **Step 1: Create `components/survey/thank-you.tsx`**

Create `components/survey/thank-you.tsx` with exactly this content:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase";

type Props = {
  responseId: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Stage = "capture" | "success" | "skipped";

export default function ThankYou({ responseId }: Props) {
  const { t } = useLanguage();
  const ty = t.surveyPage.thankYou;
  const err = t.surveyPage.errors;

  const [stage, setStage] = useState<Stage>("capture");
  const [email, setEmail] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleJoin = async () => {
    setInlineError(null);
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setInlineError(err.emailInvalid);
      return;
    }
    setIsSaving(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("beta_signups")
        .insert({ email: trimmed, response_id: responseId });
      if (error) {
        // Postgres unique violation code is 23505
        if (error.code === "23505") {
          setInlineError(err.emailDuplicate);
        } else {
          setInlineError(err.emailFailed);
        }
        setIsSaving(false);
        return;
      }
      setStage("success");
    } catch {
      setInlineError(err.emailFailed);
      setIsSaving(false);
    }
  };

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
        {ty.heading}
      </h1>
      <div className="mt-5 h-0.5 w-12 bg-[#1a1a1a]" aria-hidden />

      {stage === "capture" && (
        <>
          <p className="mt-6 max-w-md text-base text-[#6b6b6b]">
            {ty.subheading}
          </p>
          <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
            <label htmlFor="email" className="sr-only">
              {ty.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={ty.emailPlaceholder}
              disabled={isSaving}
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a] disabled:opacity-60"
            />
            {inlineError && (
              <p className="text-sm text-[#c13b3b]">{inlineError}</p>
            )}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleJoin}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-6 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a] disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {ty.waitlistCta}
              </button>
              <button
                type="button"
                onClick={() => setStage("skipped")}
                disabled={isSaving}
                className="text-sm font-medium text-[#6b6b6b] transition-colors hover:text-[#1a1a1a] disabled:opacity-60"
              >
                {ty.skipCta}
              </button>
            </div>
          </div>
        </>
      )}

      {stage === "success" && (
        <>
          <h2 className="mt-6 text-xl font-semibold text-[#1a1a1a]">
            {ty.successHeading}
          </h2>
          <p className="mt-2 text-base text-[#6b6b6b]">{ty.successBody}</p>
          <Link
            href="/"
            className="mt-8 text-sm font-medium text-[#1a1a1a] underline-offset-4 hover:underline"
          >
            {ty.backToHome}
          </Link>
        </>
      )}

      {stage === "skipped" && (
        <>
          <p className="mt-6 text-base text-[#6b6b6b]">{ty.skippedBody}</p>
          <Link
            href="/"
            className="mt-8 text-sm font-medium text-[#1a1a1a] underline-offset-4 hover:underline"
          >
            {ty.backToHome}
          </Link>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/survey/thank-you.tsx
git commit -m "Add survey thank-you and waitlist capture component"
```

---

### Task 12: Create /survey page that wires everything together

**Files:**
- Create: `app/survey/page.tsx`

- [ ] **Step 1: Create `app/survey/page.tsx`**

Create `app/survey/page.tsx` with exactly this content:

```tsx
"use client";

import { useState } from "react";
import Header from "@/components/landing/header";
import Nav from "@/components/survey/nav";
import Progress from "@/components/survey/progress";
import Step1 from "@/components/survey/step1";
import Step2 from "@/components/survey/step2";
import Step3 from "@/components/survey/step3";
import ThankYou from "@/components/survey/thank-you";
import {
  INITIAL_FORM,
  type FormState,
  isStep1Valid,
  isStep2Valid,
  isStep3Valid,
} from "@/components/survey/types";
import { useLanguage } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase";

type Step = 1 | 2 | 3 | 4;

export default function SurveyPage() {
  const { t, language } = useLanguage();
  const sp = t.surveyPage;

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);

  const canProceed =
    (step === 1 && isStep1Valid(form)) ||
    (step === 2 && isStep2Valid(form)) ||
    (step === 3 && isStep3Valid(form));

  const goNext = () => {
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
    }
  };

  const goBack = () => {
    if (step > 1 && step <= 3) {
      setStep((s) => (s - 1) as Step);
    }
  };

  const submit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("survey_responses")
        .insert({
          language,
          q1_tools_used: form.q1_tools_used.trim(),
          q2_frequency: form.q2_frequency || null,
          q3_use_cases:
            form.q3_use_cases.length > 0 ? form.q3_use_cases : null,
          q3_other: form.q3_other.trim() || null,
          q4_frustration: form.q4_frustration || null,
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
      setResponseId(data.id as string);
      setIsSubmitting(false);
      setStep(4);
    } catch {
      setSubmitError(sp.errors.submitFailed);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      <Header simplified />
      <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        {step < 4 ? (
          <>
            <Progress
              current={step}
              total={3}
              stepLabelTemplate={sp.progress.stepLabel}
            />

            <div className="mt-12">
              {step === 1 && <Step1 form={form} setForm={setForm} />}
              {step === 2 && <Step2 form={form} setForm={setForm} />}
              {step === 3 && <Step3 form={form} setForm={setForm} />}
            </div>

            {step === 3 && submitError && (
              <p className="mt-6 text-sm text-[#c13b3b]">{submitError}</p>
            )}

            <Nav
              onBack={step > 1 ? goBack : undefined}
              onNext={step === 3 ? submit : goNext}
              backLabel={sp.nav.back}
              nextLabel={
                step === 3
                  ? isSubmitting
                    ? sp.nav.submitting
                    : sp.nav.submit
                  : sp.nav.next
              }
              nextDisabled={!canProceed}
              isSubmitting={isSubmitting}
            />
          </>
        ) : (
          <ThankYou responseId={responseId} />
        )}
      </main>
    </div>
  );
}
```

**Note:** This imports `language` from `useLanguage()`. The hook already returns `{ language, setLanguage, t }` (confirmed at plan authoring time in `lib/i18n.tsx` line 303-307) — no additional change to the hook is needed.

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Verify the route renders**

With the dev server running, run:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/survey
```

Expected: `200`.

Then:

```bash
curl -s http://localhost:3000/survey | grep -oE 'CURRENT TOOLS|Which learning tools|Step 1 of 3' | sort -u
```

Expected: all three strings appear.

- [ ] **Step 4: Commit**

```bash
git add app/survey/page.tsx
git commit -m "Add survey page route wiring steps, submit and thank-you"
```

---

### Task 13: Update landing "Answer Survey" CTA

**Files:**
- Modify: `components/landing/survey.tsx`

- [ ] **Step 1: Update the CTA anchor**

Open `components/landing/survey.tsx`. Find the `<motion.a>` block that currently has `href="#"` with the TODO comment. Replace:

```tsx
        <motion.a
          // TODO: replace with real survey URL once the survey app is live
          href="#"
          style={{ y: ctaY, opacity: ctaOpacity }}
          className="mt-10 inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-8 py-4 text-base font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a]"
        >
          {s.cta}
        </motion.a>
```

with:

```tsx
        <motion.a
          href="/survey"
          target="_blank"
          rel="noopener noreferrer"
          style={{ y: ctaY, opacity: ctaOpacity }}
          className="mt-10 inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-8 py-4 text-base font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a]"
        >
          {s.cta}
        </motion.a>
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Verify the rendered landing HTML links to /survey**

With the dev server running, run:

```bash
curl -s http://localhost:3000 | grep -oE 'href="/survey"[^>]*target="_blank"' | head -1
```

Expected: one match showing the href + target attributes on the CTA.

- [ ] **Step 4: Commit**

```bash
git add components/landing/survey.tsx
git commit -m "Point landing survey CTA to /survey in a new tab"
```

---

### Task 14: End-to-end manual verification

**Files:** None (verification only)

This task is manual — the implementer must walk through the flow and confirm each item. **If Supabase env vars are not yet populated, skip steps that hit the DB (3, 5) and flag that the user still needs to run the SQL + add env vars before the flow will complete.**

- [ ] **Step 1: Typecheck passes**

Run: `npx tsc --noEmit`
Expected: zero new errors in files owned by this plan.

- [ ] **Step 2: Landing → survey navigation**

Open `http://localhost:3000` in a browser. Scroll to the survey banner, click **Answer Survey**. Verify:
- A new tab opens to `/survey`.
- The simplified header (logo + language toggle) renders.
- Step 1 shows "Step 1 of 3" + "CURRENT TOOLS" eyebrow.

- [ ] **Step 3: Walk all 3 steps in EN**

On the `/survey` tab:
- "Next" is disabled until Q1 has text.
- Filling Q1 enables "Next".
- Advancing to Step 2 shows "Step 2 of 3" + "PAIN POINTS".
- Q5 scale 1-5 is selectable; "Next" stays enabled.
- Advancing to Step 3 shows "LEARNIFY" + the blurb + mockup image.
- "Submit" is disabled until both Q7 and Q8 are answered.
- Clicking "Submit" with both answered advances to the thank-you screen and a row appears in Supabase's `survey_responses` table (check the Supabase dashboard).

- [ ] **Step 4: Language switch mid-flow preserves answers**

Start a new `/survey` tab, fill Q1 with "test EN", switch language via the dropdown, verify:
- All labels re-render in Thai.
- The "test EN" text still sits in Q1.
- Advancing to a later step shows Thai labels.

- [ ] **Step 5: Email capture works**

On the thank-you screen:
- Clicking "Join the waitlist" with an empty email shows the inline "Please enter a valid email" error.
- Clicking with `test@example.com` inserts a row in `beta_signups` linked to the response (check dashboard); screen swaps to "You're on the list" + back-to-home link.
- Opening a fresh `/survey` tab, completing the flow, and submitting the same email again shows "Looks like you're already on the list!" (the unique constraint fires).
- "Skip" swaps the screen to the skipped body + back-to-home link, no email row added.

- [ ] **Step 6: Back-to-home link**

From either success or skipped state, click "← Back to home". Verify it navigates to `/` (landing page).

- [ ] **Step 7: Back navigation preserves answers**

Walk to Step 2, fill Q5 = 3, click Back, change Q1, click Next. Verify Q5 is still 3.

- [ ] **Step 8: Pre-existing suite still loads**

`curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000` returns `200`. The landing page sections (hero, features, pricing, survey banner) still render.

- [ ] **Step 9: No commit on this task** — verification only.

---

## Verification checklist (end of plan)

- [ ] `npx tsc --noEmit` passes with no new errors in files owned by this plan.
- [ ] `/survey` returns 200 and renders the simplified header, progress bar, Step 1.
- [ ] Landing CTA opens `/survey` in a new tab.
- [ ] Required-field gating: Q1, Q7, Q8.
- [ ] Submit inserts into `survey_responses` and captured `id` is available to the thank-you screen.
- [ ] Email capture inserts into `beta_signups` with `response_id` populated; duplicate-email and invalid-email errors surface inline.
- [ ] Language toggle mid-flow preserves answers.
- [ ] Back navigation preserves answers.
- [ ] `supabase/migrations/0001_survey_schema.sql` runs cleanly on a fresh Supabase project.
- [ ] `.env.local.example` lists both required vars.

---

## Out of scope

- Server-side analytics / Mixpanel / PostHog instrumentation.
- Admin UI inside this app for reading responses (use the Supabase dashboard).
- CAPTCHA / rate limiting.
- Autosave of in-progress answers to localStorage.
- A/B testing question wording.
- Exporting responses to CSV from within the app.
- Email confirmation / double opt-in for the beta waitlist.
