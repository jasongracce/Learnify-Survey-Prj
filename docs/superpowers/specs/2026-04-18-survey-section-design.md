# Survey Section — Design Spec

**Date:** 2026-04-18
**Component:** `components/landing/survey.tsx`
**Mount point:** `app/page.tsx`, after `<Pricing />`
**Anchor:** `id="survey"` (header already links to `#survey`)

## Purpose

Add a lightweight, centered "help us launch" call-to-action section that asks visitors to fill out a pre-launch survey. It doubles as the anchor target for the existing `#survey` link in the header nav.

## Content

### Copy (English)
- **Eyebrow:** "BETA LAUNCHING SOON"
- **Headline:** "Help shape Learnify's launch"
- **Subtitle:** "Take our short survey and tell us what you need from a learning platform built for Thai students. Every answer helps us build the beta right."
- **CTA:** "Answer Survey"

### Copy (Thai)
- **Eyebrow:** "เบต้าเปิดเร็วๆ นี้"
- **Headline:** "ช่วยกำหนดทิศทางการเปิดตัวของ Learnify"
- **Subtitle:** "ตอบแบบสอบถามสั้นๆ แล้วบอกเราว่าคุณต้องการอะไรจากแพลตฟอร์มการเรียนที่สร้างมาเพื่อนักเรียนไทย ทุกคำตอบช่วยให้เราพัฒนาเบต้าได้ตรงจุด"
- **CTA:** "ตอบแบบสอบถาม"

## Visual design

### Layout
- Full-width `<section id="survey">`, background `#f9f9f7`, vertical padding `py-24 md:py-32`.
- Inner container `max-w-3xl`, centered, `text-center`.
- Contents stack vertically: eyebrow → headline → subtitle → CTA.

### Typography
- **Eyebrow:** `text-sm font-bold tracking-[0.2em] text-[#6b6b6b]` — matches the pattern from existing feature sections (`feature-active.tsx` etc.).
- **Headline:** `text-4xl md:text-5xl font-bold tracking-tight text-[#1a1a1a]`.
- **Subtitle:** `text-base md:text-lg text-[#6b6b6b] leading-relaxed`, `mt-5`, `max-w-xl mx-auto`.
- **Divider:** thin `h-0.5 w-12 bg-[#1a1a1a]` rule between headline and subtitle, `mt-5`, centered — matches feature sections.

### CTA button
- Rounded pill, solid black:
  - `inline-flex items-center justify-center`
  - `rounded-full`
  - `bg-[#1a1a1a] text-white`
  - `px-8 py-4 text-base font-medium`
  - `transition-all hover:bg-[#2a2a2a] hover:-translate-y-0.5`
- Wrapped in an `<a href="#" />` anchor — placeholder target for now (real survey site will be built later). Leave an inline `TODO: replace with real survey URL once the survey app is live` comment next to the href.
- Opens in the same tab (no `target="_blank"` until we have the real URL).

### Animation
Match the scroll-triggered motion used by existing sections:
- Section wrapper has a `ref`.
- `useScroll` with offset `["start end", "center start"]`.
- Headline block fades + slides up.
- CTA button fades + slides up on a slight delay.

## i18n

Extend `lib/i18n.tsx` with a `survey` key in `Translations`:

```ts
survey: {
  eyebrow: string;
  headline: string;
  subtitle: string;
  cta: string;
};
```

Populate EN and TH per the copy section above.

## Behavior

- The CTA is a real `<a>` anchor, not a `<button>` — it will eventually navigate to a separate survey site.
- Clicking the header's "Survey" nav link scrolls to this section (behavior already exists via `#survey` href).
- No form logic lives here. This is purely a marketing/CTA banner.

## Files touched

1. `lib/i18n.tsx` — add `survey` to the `Translations` type + EN and TH values.
2. `components/landing/survey.tsx` — new client component (`"use client"`, uses `useLanguage`, `framer-motion`).
3. `app/page.tsx` — import and mount `<Survey />` after `<Pricing />`.

## Out of scope

- Building the survey itself (separate project the user will tackle next).
- Tracking / analytics on the CTA click.
- A/B testing the copy.
