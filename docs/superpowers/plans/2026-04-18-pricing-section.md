# Pricing Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 3-tier pricing section (Free / Pro / Ultra) to the Learnify landing page, matching the reference layout and the site's black-and-white aesthetic, with disabled "Coming Soon" CTAs.

**Architecture:** New client component `components/landing/pricing.tsx` that consumes `useLanguage()` for i18n and uses `framer-motion`'s `useScroll` + `useTransform` for scroll-triggered entrance animation — same pattern as the existing feature sections. Translations extend `lib/i18n.tsx`. Mounted in `app/page.tsx` after `<FeatureAi />`.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, framer-motion 12, TypeScript. No test framework in this repo — verification is via the running dev server on `localhost:3000`.

**Spec reference:** `docs/superpowers/specs/2026-04-18-pricing-section-design.md`

---

## File Structure

| File | Responsibility | Status |
|---|---|---|
| `lib/i18n.tsx` | Add `pricing` key to `Translations` type + EN/TH values | Modify |
| `components/landing/pricing.tsx` | Render the pricing section (heading + 3 cards) | Create |
| `app/page.tsx` | Mount `<Pricing />` after `<FeatureAi />` | Modify |

`pricing.tsx` is a single file (~200 lines) containing the section, a `PricingCard` sub-component, and inline `Check` / `Cross` SVG icons. This matches the existing `feature-*.tsx` files' size and inline-icon pattern (see `feature-ai.tsx` for the precedent).

---

### Task 1: Extend i18n with pricing translations

**Files:**
- Modify: `lib/i18n.tsx`

- [ ] **Step 1: Add `pricing` field to the `Translations` type**

Open `lib/i18n.tsx`. Find the `Translations` type (line 7). After the `features` block (ends at line 53), before the closing `}` of the type (line 54), add:

```ts
  pricing: {
    title: string;
    subtitle: string;
    billingSuffix: string;
    tiers: {
      free: { badge: string; price: string; tagline: string };
      pro: { badge: string; price: string; tagline: string };
      ultra: { badge: string; price: string; tagline: string };
    };
    features: {
      activeLearning: string;
      unlimitedLearning: string;
      unlimitedLumi: string;
      noAds: string;
      personalizedPaths: string;
      everythingInPro: string;
      advancedAnalytics: string;
      earlyAccess: string;
    };
    cta: string;
  };
```

- [ ] **Step 2: Add English pricing translations**

In the `en` translation object, after the `features` block closes (line 134, `},` ending the `ai` feature, then `},` on line 135 closing `features`), add a new `pricing` key before the closing `}` of the `en` object:

```ts
    pricing: {
      title: "Pricing plans",
      subtitle: "Choose the right plan for your needs.",
      billingSuffix: "THB/mo",
      tiers: {
        free: { badge: "Free", price: "0", tagline: "For getting started" },
        pro: { badge: "PRO", price: "149", tagline: "For serious learners" },
        ultra: { badge: "ULTRA", price: "249", tagline: "For power users" },
      },
      features: {
        activeLearning: "Active Learning Lessons",
        unlimitedLearning: "Unlimited Learning",
        unlimitedLumi: "Unlimited Lumi Messages",
        noAds: "No ads",
        personalizedPaths: "Personalized Learning Paths",
        everythingInPro: "Everything in Pro",
        advancedAnalytics: "Advanced Analytics",
        earlyAccess: "Early access to new features",
      },
      cta: "Coming Soon",
    },
```

- [ ] **Step 3: Add Thai pricing translations**

In the `th` translation object, mirror the same structure before the closing `}`:

```ts
    pricing: {
      title: "แผนราคา",
      subtitle: "เลือกแผนที่เหมาะกับคุณ",
      billingSuffix: "บาท/เดือน",
      tiers: {
        free: { badge: "ฟรี", price: "0", tagline: "สำหรับผู้เริ่มต้น" },
        pro: { badge: "PRO", price: "149", tagline: "สำหรับผู้เรียนจริงจัง" },
        ultra: { badge: "ULTRA", price: "249", tagline: "สำหรับผู้ใช้ขั้นสูง" },
      },
      features: {
        activeLearning: "บทเรียนแบบมีส่วนร่วม",
        unlimitedLearning: "เรียนได้ไม่จำกัด",
        unlimitedLumi: "ข้อความ Lumi ไม่จำกัด",
        noAds: "ไม่มีโฆษณา",
        personalizedPaths: "เส้นทางการเรียนเฉพาะบุคคล",
        everythingInPro: "ทุกอย่างในแผน Pro",
        advancedAnalytics: "วิเคราะห์ข้อมูลขั้นสูง",
        earlyAccess: "เข้าถึงฟีเจอร์ใหม่ก่อนใคร",
      },
      cta: "เร็วๆ นี้",
    },
```

- [ ] **Step 4: Verify the typecheck passes**

Run: `npx tsc --noEmit`
Expected: exits 0 with no errors. If there are errors, they'll be about missing fields or type mismatches — fix by re-reading the type definition and making sure both `en` and `th` match.

- [ ] **Step 5: Commit**

```bash
git add lib/i18n.tsx
git commit -m "Add pricing translations to i18n"
```

---

### Task 2: Create the Pricing component

**Files:**
- Create: `components/landing/pricing.tsx`

- [ ] **Step 1: Create `components/landing/pricing.tsx` with the full component**

Write this complete file:

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Cross({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

type FeatureRow = { label: string; included: boolean };

type Tier = {
  badge: string;
  price: string;
  tagline: string;
  features: FeatureRow[];
  highlighted: boolean;
};

function PricingCard({
  tier,
  billingSuffix,
  cta,
  delay,
  scrollProgress,
}: {
  tier: Tier;
  billingSuffix: string;
  cta: string;
  delay: number;
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const y = useTransform(
    scrollProgress,
    [0 + delay, 0.5 + delay],
    [40, 0],
  );
  const opacity = useTransform(
    scrollProgress,
    [0 + delay, 0.5 + delay],
    [0, 1],
  );

  const topPanelClass = tier.highlighted
    ? "bg-[#1a1a1a] text-white"
    : "bg-[#f1f1f0] text-[#1a1a1a]";

  const badgeClass = tier.highlighted
    ? "bg-white text-[#1a1a1a]"
    : "bg-white text-[#1a1a1a]";

  const priceSuffixClass = tier.highlighted ? "text-white/70" : "text-[#6b6b6b]";

  return (
    <motion.div
      style={{ y, opacity }}
      className="flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm"
    >
      {/* Top panel */}
      <div className={`px-6 pt-6 pb-8 ${topPanelClass}`}>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${badgeClass}`}
        >
          {tier.badge}
        </span>
        <div className="mt-6 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
          <span className={`text-sm font-medium ${priceSuffixClass}`}>
            {billingSuffix}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-6 pt-6 pb-6">
        <p className="text-sm text-[#6b6b6b]">{tier.tagline}</p>

        <button
          type="button"
          disabled
          aria-disabled
          className="mt-5 w-full rounded-full bg-[#1a1a1a] px-4 py-3 text-sm font-medium text-white opacity-80 cursor-not-allowed"
        >
          {cta}
        </button>

        <div className="mt-6 h-px w-full bg-black/5" aria-hidden />

        <ul className="mt-6 flex flex-col gap-3">
          {tier.features.map((f) => (
            <li key={f.label} className="flex items-center gap-3 text-sm">
              {f.included ? (
                <Check className="shrink-0 text-[#1a1a1a]" />
              ) : (
                <Cross className="shrink-0 text-[#c9c9c7]" />
              )}
              <span
                className={f.included ? "text-[#1a1a1a]" : "text-[#9a9a97]"}
              >
                {f.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function Pricing() {
  const { t } = useLanguage();
  const p = t.pricing;
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center start"],
  });

  const headingY = useTransform(scrollYProgress, [0, 0.4], [40, 0]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  const tiers: Tier[] = [
    {
      badge: p.tiers.free.badge,
      price: p.tiers.free.price,
      tagline: p.tiers.free.tagline,
      highlighted: false,
      features: [
        { label: p.features.activeLearning, included: true },
        { label: p.features.unlimitedLearning, included: false },
        { label: p.features.unlimitedLumi, included: false },
        { label: p.features.noAds, included: false },
        { label: p.features.personalizedPaths, included: false },
      ],
    },
    {
      badge: p.tiers.pro.badge,
      price: p.tiers.pro.price,
      tagline: p.tiers.pro.tagline,
      highlighted: true,
      features: [
        { label: p.features.activeLearning, included: true },
        { label: p.features.unlimitedLearning, included: true },
        { label: p.features.unlimitedLumi, included: true },
        { label: p.features.noAds, included: true },
        { label: p.features.personalizedPaths, included: true },
      ],
    },
    {
      badge: p.tiers.ultra.badge,
      price: p.tiers.ultra.price,
      tagline: p.tiers.ultra.tagline,
      highlighted: false,
      features: [
        { label: p.features.everythingInPro, included: true },
        { label: p.features.advancedAnalytics, included: true },
        { label: p.features.earlyAccess, included: true },
      ],
    },
  ];

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="w-full bg-[#f9f9f7] py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          style={{ y: headingY, opacity: headingOpacity }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl">
            {p.title}
          </h2>
          <p className="mt-3 text-base text-[#6b6b6b]">{p.subtitle}</p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <PricingCard
              key={tier.badge}
              tier={tier}
              billingSuffix={p.billingSuffix}
              cta={p.cta}
              delay={i * 0.08}
              scrollProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the typecheck passes**

Run: `npx tsc --noEmit`
Expected: exits 0 with no errors.

- [ ] **Step 3: Commit**

```bash
git add components/landing/pricing.tsx
git commit -m "Add pricing section component"
```

---

### Task 3: Mount Pricing in the page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the import**

Open `app/page.tsx`. At the top (after the existing `import FeatureAi from ...` line), add:

```tsx
import Pricing from "@/components/landing/pricing";
```

- [ ] **Step 2: Mount `<Pricing />` after `<FeatureAi />`**

Inside `<main>`, immediately after `<FeatureAi />`, add:

```tsx
        <Pricing />
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
      </main>
```

- [ ] **Step 3: Verify the typecheck passes**

Run: `npx tsc --noEmit`
Expected: exits 0 with no errors.

- [ ] **Step 4: Verify in the browser (EN)**

Make sure the dev server is running (`npm run dev`). Open `http://localhost:3000`. Scroll to the bottom of the page.

Check:
- The "Pricing plans" heading + subtitle appear centered.
- Three cards are visible side-by-side on desktop width.
- Middle card has a **black** top panel with white text; Free and Ultra have **light gray** top panels with dark text.
- Free card shows 5 feature rows: Active Learning Lessons has ✓, the other four have ✕.
- Pro card shows 5 feature rows, all with ✓.
- Ultra card shows 3 feature rows, all with ✓ ("Everything in Pro", "Advanced Analytics", "Early access to new features").
- All three CTA buttons say "Coming Soon", are dark, and show a not-allowed cursor on hover.
- Scrolling into the section plays a fade/slide-up animation on the heading and a staggered fade-up on the cards.

- [ ] **Step 5: Verify in the browser (TH)**

Click the language dropdown in the header and switch to Thai (TH).

Check:
- Heading reads "แผนราคา", subtitle reads "เลือกแผนที่เหมาะกับคุณ".
- Free tier badge reads "ฟรี", its tagline reads "สำหรับผู้เริ่มต้น".
- Pro tier tagline reads "สำหรับผู้เรียนจริงจัง", billing suffix reads "บาท/เดือน".
- Ultra tier tagline reads "สำหรับผู้ใช้ขั้นสูง".
- All 8 feature strings render in Thai (no missing keys / no raw JSON paths showing).
- CTA buttons read "เร็วๆ นี้".

- [ ] **Step 6: Verify mobile layout**

Resize the browser to <768px width (or use device toolbar). Cards should stack vertically to one column. Heading and subtitle should remain centered.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "Mount pricing section on landing page"
```

---

## Verification checklist (end of plan)

- [ ] `npx tsc --noEmit` passes.
- [ ] Dev server renders the pricing section at the bottom of `/`.
- [ ] Pro card's black top panel visibly differentiates it from Free/Ultra.
- [ ] ✓ and ✕ icons render correctly for Free; all ✓ for Pro and Ultra.
- [ ] All three CTAs are disabled and say "Coming Soon".
- [ ] Language switcher updates every string (title, subtitle, badges, taglines, features, CTA, billing suffix).
- [ ] Scroll-triggered entrance animation matches the feel of existing feature sections.
- [ ] Three-column layout collapses to one column on mobile.

---

## Out of scope (from spec)

- Real payment integration.
- Monthly/yearly billing toggle.
- Student discount codes.
- Currency switcher.
