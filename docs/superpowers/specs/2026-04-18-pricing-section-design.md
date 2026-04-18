# Pricing Section — Design Spec

**Date:** 2026-04-18
**Component:** `components/landing/pricing.tsx`
**Mount point:** `app/page.tsx`, after `<FeatureAi />`

## Purpose

Add a 3-tier pricing section to the Learnify landing page. Mirrors the layout of the provided reference image but re-styled to match the site's strict black-and-white aesthetic on the `#f9f9f7` background. All three CTAs are disabled "Coming Soon" buttons since Learnify has not launched yet.

## Content

### Section heading
- Title: **"Pricing plans"**
- Subtitle: **"Choose the right plan for your needs."**

### Tiers

| | Free | Pro (highlighted) | Ultra |
|---|---|---|---|
| Badge | "Free" | "PRO" | "ULTRA" |
| Price | 0 THB/mo | 149 THB/mo | 249 THB/mo |
| Tagline | "For getting started" | "For serious learners" | "For power users" |
| CTA | "Coming Soon" (disabled) | "Coming Soon" (disabled) | "Coming Soon" (disabled) |

### Feature lists

**Free** and **Pro** share the same 5-item feature list, shown with ✓/✕ markers:

| Feature | Free | Pro |
|---|:---:|:---:|
| Active Learning Lessons | ✓ | ✓ |
| Unlimited Learning | ✕ | ✓ |
| Unlimited Lumi Messages | ✕ | ✓ |
| No ads | ✕ | ✓ |
| Personalized Learning Paths | ✕ | ✓ |

**Ultra** uses a different 3-item list (all ✓):
- Everything in Pro
- Advanced Analytics
- Early access to new features

## Visual design

### Layout
- Full-width `<section>` with background `#f9f9f7` and vertical padding `py-24 md:py-32`.
- Centered heading block above the card grid.
- 3-column grid on `lg:` breakpoint and above, stacked single-column on mobile.
- Max container width `max-w-6xl`, horizontal padding `px-6`.

### Card structure (shared)
Each card is a white (`bg-white`) rounded rectangle with a soft shadow (`shadow-sm` or equivalent) and subtle border (`border border-black/5`), matching the site's existing card styling.

Internal vertical stack:
1. **Top panel** — rounded top, contains the tier pill badge and price.
2. **Tagline** — small muted text (`text-[#6b6b6b]`).
3. **CTA button** — full-width, dark, rounded-full, `"Coming Soon"` text, `disabled` attribute, `cursor-not-allowed`, reduced opacity.
4. **Divider** — thin horizontal rule.
5. **Feature list** — vertical list with ✓ (black) or ✕ (light gray `#c9c9c7`) icons + feature text.

### Per-card styling (B&W)

| | Free | Pro | Ultra |
|---|---|---|---|
| Top panel bg | `#f1f1f0` (light gray) | **`#1a1a1a` (black, inverted)** | `#f1f1f0` (light gray) |
| Badge | dark text on white pill | black text on white pill | dark text on white pill |
| Price text color | `#1a1a1a` on gray | `white` on black | `#1a1a1a` on gray |
| CTA button | solid `#1a1a1a`, white text | solid `#1a1a1a`, white text | solid `#1a1a1a`, white text |
| Feature ✓ | black `#1a1a1a` | black `#1a1a1a` | black `#1a1a1a` |
| Feature ✕ | light gray `#c9c9c7` | (n/a — all ✓) | (n/a — all ✓) |

The middle (Pro) card stands out via the **inverted black top panel**, not a color accent — keeping the site's strict B&W feel.

### Icons
- ✓ — inline SVG check, 16px, `stroke="currentColor"`.
- ✕ — inline SVG cross, 16px, `stroke="currentColor"`.

### Typography
- Heading: `text-4xl md:text-5xl font-bold tracking-tight text-[#1a1a1a]`.
- Subtitle: `text-base text-[#6b6b6b]`.
- Price: `text-4xl font-bold` with `/mo` in smaller muted text.
- Tagline: `text-sm text-[#6b6b6b]`.
- Feature text: `text-sm text-[#1a1a1a]` (✕ rows muted to `text-[#9a9a97]`).

## Behavior

### CTA buttons
All three buttons:
- `disabled={true}`
- Render text "Coming Soon"
- `cursor-not-allowed`, `opacity-80`
- No `onClick` handler — purely visual.

### Animation
Match the scroll-triggered motion pattern used by existing feature sections (`framer-motion` + `useScroll` + `useTransform`):
- Section wrapper has a `ref`.
- `useScroll` with offset `["start end", "center start"]`.
- Heading fades + slides up.
- Cards fade + translate up in a stagger (left → right) as the section enters the viewport.

The `useScroll`/`useTransform` driven approach (not `whileInView`) is what the other feature sections use, so this keeps animation consistency.

## i18n

Extend `lib/i18n.tsx` with a `pricing` key under `Translations`:

```ts
pricing: {
  title: string;
  subtitle: string;
  billingSuffix: string; // "THB/mo" or "บาท/เดือน"
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
  cta: string; // "Coming Soon"
};
```

### English values
- title: "Pricing plans"
- subtitle: "Choose the right plan for your needs."
- billingSuffix: "THB/mo"
- tiers.free: { badge: "Free", price: "0", tagline: "For getting started" }
- tiers.pro: { badge: "PRO", price: "149", tagline: "For serious learners" }
- tiers.ultra: { badge: "ULTRA", price: "249", tagline: "For power users" }
- features.activeLearning: "Active Learning Lessons"
- features.unlimitedLearning: "Unlimited Learning"
- features.unlimitedLumi: "Unlimited Lumi Messages"
- features.noAds: "No ads"
- features.personalizedPaths: "Personalized Learning Paths"
- features.everythingInPro: "Everything in Pro"
- features.advancedAnalytics: "Advanced Analytics"
- features.earlyAccess: "Early access to new features"
- cta: "Coming Soon"

### Thai values
- title: "แผนราคา"
- subtitle: "เลือกแผนที่เหมาะกับคุณ"
- billingSuffix: "บาท/เดือน"
- tiers.free: { badge: "ฟรี", price: "0", tagline: "สำหรับผู้เริ่มต้น" }
- tiers.pro: { badge: "PRO", price: "149", tagline: "สำหรับผู้เรียนจริงจัง" }
- tiers.ultra: { badge: "ULTRA", price: "249", tagline: "สำหรับผู้ใช้ขั้นสูง" }
- features.activeLearning: "บทเรียนแบบมีส่วนร่วม"
- features.unlimitedLearning: "เรียนได้ไม่จำกัด"
- features.unlimitedLumi: "ข้อความ Lumi ไม่จำกัด"
- features.noAds: "ไม่มีโฆษณา"
- features.personalizedPaths: "เส้นทางการเรียนเฉพาะบุคคล"
- features.everythingInPro: "ทุกอย่างในแผน Pro"
- features.advancedAnalytics: "วิเคราะห์ข้อมูลขั้นสูง"
- features.earlyAccess: "เข้าถึงฟีเจอร์ใหม่ก่อนใคร"
- cta: "เร็วๆ นี้"

## Files touched

1. `lib/i18n.tsx` — extend `Translations` type and add EN + TH `pricing` objects.
2. `components/landing/pricing.tsx` — new component (client component, uses `"use client"`, `useLanguage`, `framer-motion`).
3. `app/page.tsx` — import and mount `<Pricing />` after `<FeatureAi />`.

## Out of scope

- Real Stripe / payment integration (deferred until launch).
- Monthly/yearly billing toggle.
- Student discount codes or promo logic.
- Currency switcher (THB only for now).
