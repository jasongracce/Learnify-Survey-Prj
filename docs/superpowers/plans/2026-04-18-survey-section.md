# Survey Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a light, centered survey CTA banner to the Learnify landing page at `#survey` (header already links there), with EN/TH i18n, scroll-triggered entrance animation, and a placeholder href until the real survey site exists.

**Architecture:** New client component `components/landing/survey.tsx` that consumes `useLanguage()` for i18n and uses `framer-motion`'s `useScroll` + `useTransform` scroll-triggered animation — same pattern as the existing feature and pricing sections. Translations extend `lib/i18n.tsx`. Mounted in `app/page.tsx` after `<Pricing />`.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, framer-motion 12, TypeScript. No test framework — verification is via typecheck + HTTP-served HTML check on `http://localhost:3000`.

**Spec reference:** `docs/superpowers/specs/2026-04-18-survey-section-design.md`

---

## File Structure

| File | Responsibility | Status |
|---|---|---|
| `lib/i18n.tsx` | Add `survey` key to `Translations` type + EN/TH values | Modify |
| `components/landing/survey.tsx` | Render the survey CTA banner | Create |
| `app/page.tsx` | Mount `<Survey />` after `<Pricing />` | Modify |

---

### Task 1: Extend i18n with survey translations

**Files:**
- Modify: `lib/i18n.tsx`

- [ ] **Step 1: Add `survey` field to the `Translations` type**

Open `lib/i18n.tsx`. Find the `Translations` type. Inside the type object, immediately after the closing `};` of the `pricing` block and before the outer closing `};` of the `Translations` type, add:

```ts
  survey: {
    eyebrow: string;
    headline: string;
    subtitle: string;
    cta: string;
  };
```

- [ ] **Step 2: Add English survey translations**

In the `en` translation object, after the closing `},` of the `pricing` block and before the closing `}` of the `en` object, add:

```ts
    survey: {
      eyebrow: "BETA LAUNCHING SOON",
      headline: "Help shape Learnify's launch",
      subtitle:
        "Take our short survey and tell us what you need from a learning platform built for Thai students. Every answer helps us build the beta right.",
      cta: "Answer Survey",
    },
```

- [ ] **Step 3: Add Thai survey translations**

In the `th` translation object, after the closing `},` of the `pricing` block and before the closing `}` of the `th` object, add:

```ts
    survey: {
      eyebrow: "เบต้าเปิดเร็วๆ นี้",
      headline: "ช่วยกำหนดทิศทางการเปิดตัวของ Learnify",
      subtitle:
        "ตอบแบบสอบถามสั้นๆ แล้วบอกเราว่าคุณต้องการอะไรจากแพลตฟอร์มการเรียนที่สร้างมาเพื่อนักเรียนไทย ทุกคำตอบช่วยให้เราพัฒนาเบต้าได้ตรงจุด",
      cta: "ตอบแบบสอบถาม",
    },
```

- [ ] **Step 4: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: zero source-file errors in files we own. (Pre-existing unused-directive errors in `components/ui/cobe-globe-polaroids.tsx` and `components/ui/cobe-globe-thailand-pin.tsx` are unrelated — ignore them.)

- [ ] **Step 5: Commit**

```bash
git add lib/i18n.tsx
git commit -m "Add survey translations to i18n"
```

---

### Task 2: Create the Survey component

**Files:**
- Create: `components/landing/survey.tsx`

- [ ] **Step 1: Create `components/landing/survey.tsx` with exactly this content**

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export default function Survey() {
  const { t } = useLanguage();
  const s = t.survey;
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center start"],
  });

  const textY = useTransform(scrollYProgress, [0, 0.5], [40, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.1, 0.6], [30, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.1, 0.6], [0, 1]);

  return (
    <section
      id="survey"
      ref={sectionRef}
      className="w-full bg-[#f9f9f7] py-24 md:py-32"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="flex flex-col items-center"
        >
          <span className="text-sm font-bold tracking-[0.2em] text-[#6b6b6b]">
            {s.eyebrow}
          </span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl">
            {s.headline}
          </h2>
          <div className="mt-5 h-0.5 w-12 bg-[#1a1a1a]" aria-hidden />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#6b6b6b] md:text-lg">
            {s.subtitle}
          </p>
        </motion.div>

        <motion.a
          // TODO: replace with real survey URL once the survey app is live
          href="#"
          style={{ y: ctaY, opacity: ctaOpacity }}
          className="mt-10 inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-8 py-4 text-base font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a]"
        >
          {s.cta}
        </motion.a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: zero source-file errors in files we own.

- [ ] **Step 3: Commit**

```bash
git add components/landing/survey.tsx
git commit -m "Add survey CTA banner component"
```

---

### Task 3: Mount Survey in the page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the import**

Open `app/page.tsx`. At the top, after the existing `import Pricing from "@/components/landing/pricing";` line, add:

```tsx
import Survey from "@/components/landing/survey";
```

- [ ] **Step 2: Mount `<Survey />` after `<Pricing />`**

Inside `<main>`, immediately after `<Pricing />`, add:

```tsx
        <Survey />
```

The final `<main>` block should read:

```tsx
      <main>
        <FloatingCards>
          <Hero />
        </FloatingCards>
        <StatsBanner />
        <FeatureActive />
        <FeatureLocalised />
        <FeaturePersonalized />
        <FeatureAi />
        <Pricing />
        <Survey />
      </main>
```

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: zero source-file errors in files we own.

- [ ] **Step 4: Verify the rendered HTML contains the expected strings**

With the dev server running (`npm run dev` on `localhost:3000`), run:

```bash
curl -s http://localhost:3000 | grep -oE 'id="survey"|BETA LAUNCHING SOON|Help shape Learnify|Answer Survey' | sort -u
```

Expected: all four strings appear.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "Mount survey CTA banner on landing page"
```

---

## Verification checklist (end of plan)

- [ ] `npx tsc --noEmit` passes (no new errors).
- [ ] Dev-server HTML contains `id="survey"`, the eyebrow, the headline, and the CTA text.
- [ ] Clicking "Survey" in the header nav scrolls to the section (anchor already in place).
- [ ] The big black pill CTA lifts slightly on hover.
- [ ] Section enters with a scroll-triggered fade-up.
- [ ] Switching language to TH updates all four strings (eyebrow, headline, subtitle, CTA).

---

## Out of scope

- Building the survey site itself (next project).
- Analytics/tracking on the CTA click.
- Opening the CTA in a new tab (will be decided once the real URL exists).
