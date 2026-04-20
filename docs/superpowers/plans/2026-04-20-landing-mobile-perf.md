# Landing Page Mobile Performance Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the landing page smooth on iPhone 14 Pro Max (and better on all devices) by replacing scroll-tied framer-motion animations with one-shot IntersectionObserver reveals, pausing RAF loops when off-screen, and avoiding the cobe WebGL globe and animated phone chat on mobile entirely.

**Architecture:** Introduce two small primitives — a `<Reveal>` wrapper driven by IntersectionObserver and a `useVisibilityPause` hook that reports whether an element is in view. Each feature section drops its `useScroll`/`useTransform` usage in favor of `<Reveal>`. The globe and animated chat gain an `enabled` prop wired to visibility; on mobile they are not rendered at all, replaced by a static CSS placeholder and a static chat snapshot.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, framer-motion (reduced usage), cobe (globe).

**Testing note:** This project has no unit-test framework. Verification is done via `npm run build` (type + lint + compile check) and a manual browser pass on the running dev server (background task `bnhkmtw80`, http://localhost:3000). If the dev server is not running, start it with `npm run dev`.

---

## File Structure

**New files:**
- `lib/use-visibility-pause.ts` — `useVisibilityPause()` hook.
- `components/landing/reveal.tsx` — `<Reveal>` wrapper component.

**Modified files:**
- `app/globals.css` — add `.reveal` utility class.
- `components/ui/cobe-globe-thailand-pin.tsx` — accept `enabled` prop gating the animate loop.
- `components/landing/feature-active.tsx` — remove `useScroll`, use `<Reveal>`, padding tweak.
- `components/landing/feature-personalized.tsx` — remove `useScroll`, use `<Reveal>`, mobile layout tweaks.
- `components/landing/feature-localised.tsx` — remove `useScroll`, use `<Reveal>`, split desktop/mobile, wire visibility pause.
- `components/landing/feature-ai.tsx` — remove `useScroll`, use `<Reveal>`, split desktop/mobile static snapshot, gate `useLoopingTime` with visibility.
- `components/landing/pricing.tsx` — remove `useScroll`, use `<Reveal>`.
- `components/landing/survey.tsx` — remove `useScroll`, use `<Reveal>`.

---

## Task 1: Create `useVisibilityPause` hook

**Files:**
- Create: `lib/use-visibility-pause.ts`

- [ ] **Step 1: Create the hook file**

```ts
// lib/use-visibility-pause.ts
"use client";

import { useEffect, useRef, useState } from "react";

export function useVisibilityPause<T extends Element = HTMLDivElement>(
  rootMargin: string = "200px 0px",
) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setIsVisible(entry.isIntersecting);
      },
      { threshold: 0, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, isVisible };
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npm run build`
Expected: build succeeds (may fail on other not-yet-touched callers, but no error should reference `use-visibility-pause.ts`).

If there are unrelated build failures from stale state, skip this step — subsequent tasks touch the same files and will be re-verified.

- [ ] **Step 3: Commit**

```bash
git add lib/use-visibility-pause.ts
git commit -m "Add useVisibilityPause hook for RAF pause-on-offscreen"
```

---

## Task 2: Create `<Reveal>` component and CSS utility

**Files:**
- Create: `components/landing/reveal.tsx`
- Modify: `app/globals.css` (append the `.reveal` block)

- [ ] **Step 1: Create the component**

```tsx
// components/landing/reveal.tsx
"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type Props = {
  as?: ElementType;
  variant?: "fade-up" | "fade";
  delay?: number;
  className?: string;
  children: ReactNode;
};

export default function Reveal({
  as: Tag = "div",
  variant = "fade-up",
  delay = 0,
  className = "",
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-variant={variant}
      data-revealed={revealed ? "true" : "false"}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${className}`}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 2: Append the CSS utility to `app/globals.css`**

Add at the bottom of the file (after the existing `.animation-delay-500` block):

```css
.reveal {
  opacity: 0;
  transition:
    opacity 600ms ease-out,
    transform 600ms ease-out;
  will-change: opacity, transform;
}

.reveal[data-variant="fade-up"] {
  transform: translateY(16px);
}

.reveal[data-revealed="true"] {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    transition-duration: 200ms;
  }
  .reveal[data-variant="fade-up"] {
    transform: none;
  }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/landing/reveal.tsx app/globals.css
git commit -m "Add Reveal component with IntersectionObserver-driven CSS reveal"
```

---

## Task 3: Add `enabled` prop to `GlobeWithThailandPin`

**Files:**
- Modify: `components/ui/cobe-globe-thailand-pin.tsx`

- [ ] **Step 1: Update the `Props` type and add `enabled` wiring**

Replace the existing `Props` type (lines 6–9) with:

```ts
type Props = {
  className?: string;
  speed?: number;
  enabled?: boolean;
};
```

Replace the component signature (line 55-58):

```tsx
export function GlobeWithThailandPin({
  className = "",
  speed = 0.003,
  enabled = true,
}: Props) {
```

- [ ] **Step 2: Add an `enabledRef` and gate the animate loop**

Just after the `isPausedRef` declaration (line 64), add:

```tsx
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
```

Inside the `animate` function (lines 135–142), gate the `globe.update` call so nothing renders while disabled:

```tsx
      function animate() {
        if (enabledRef.current) {
          if (!isPausedRef.current) phi += speed;
          globe!.update({
            phi: phi + phiOffsetRef.current + dragOffset.current.phi,
            theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
          });
        }
        animationId = requestAnimationFrame(animate);
      }
```

Leave the rest of the file unchanged. The RAF still fires (cheap), but `globe.update()` (expensive WebGL work) is skipped while off-screen.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/ui/cobe-globe-thailand-pin.tsx
git commit -m "Gate GlobeWithThailandPin animate loop with enabled prop"
```

---

## Task 4: Rewrite `feature-active.tsx` — drop scroll animations

**Files:**
- Modify: `components/landing/feature-active.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n";
import Reveal from "./reveal";

export default function FeatureActive() {
  const { t, language } = useLanguage();
  const feature = t.features.active;
  const mockupSrc =
    language === "th"
      ? "/active-learning-mockup-th.png"
      : "/active-learning-mockup.png";

  return (
    <section
      id="features"
      className="w-full bg-[#f9f9f7] py-16 md:py-28"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 md:gap-16 lg:grid-cols-2 lg:gap-20">
        {/* Image */}
        <Reveal className="order-1 flex justify-center lg:order-none">
          <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div
                className="absolute inset-x-8 inset-y-4 rounded-[2rem] bg-[#e8f4fd] opacity-70 blur-3xl"
                aria-hidden
              />
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
              <Image
                key={mockupSrc}
                src={mockupSrc}
                alt="Learnify active learning mockup"
                width={800}
                height={800}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        {/* Text */}
        <Reveal
          delay={120}
          className="order-2 flex flex-col lg:order-none lg:pl-4"
        >
          <span className="text-sm font-bold tracking-[0.2em] text-[#6b6b6b]">
            {feature.number}
          </span>
          <h2 className="mt-3 text-3xl font-bold leading-[1.15] tracking-tight text-[#1a1a1a] sm:text-4xl lg:text-5xl">
            {feature.title}
          </h2>
          <div className="mt-5 h-0.5 w-12 bg-[#1a1a1a]" aria-hidden />
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#6b6b6b] sm:text-lg">
            {feature.description}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
```

Notes:
- Removed `useRef`, `useScroll`, `useTransform`, `motion`, and the `min-h-[70vh]` / clip-path wipe — the section now uses its natural height plus `<Reveal>`.
- Mobile padding reduced from `py-24 md:py-32` to `py-16 md:py-28`.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Browser sanity check**

Open http://localhost:3000 in a browser. Scroll to the "Active Learning" feature section. Confirm text + image fade/slide in once and the section no longer triggers a horizontal wipe on the image.

- [ ] **Step 4: Commit**

```bash
git add components/landing/feature-active.tsx
git commit -m "Replace scroll-tied animations in feature-active with one-shot Reveal"
```

---

## Task 5: Rewrite `feature-personalized.tsx` — drop scroll animations, mobile layout tweaks

**Files:**
- Modify: `components/landing/feature-personalized.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
"use client";

import { useLanguage } from "@/lib/i18n";
import Reveal from "./reveal";

export default function FeaturePersonalized() {
  const { t, language } = useLanguage();
  const feature = t.features.personalized;
  const mockupSrc =
    language === "th"
      ? "/personalized-mockup-th.png"
      : "/personalized-mockup.png";

  return (
    <section className="relative w-full overflow-hidden bg-[#f9f9f7] py-14 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-[#1a1a1a] p-8 md:p-12 lg:p-16">
            <div className="relative grid grid-cols-1 items-center gap-8 md:gap-10 lg:grid-cols-2 lg:gap-16">
              {/* Phone mockup */}
              <div className="flex justify-center lg:justify-start">
                <div
                  className="relative w-full max-w-md overflow-hidden rounded-3xl ring-1 ring-white/10 rotate-[-2deg] md:rotate-[-4deg]"
                  style={{
                    boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={mockupSrc}
                    src={mockupSrc}
                    alt="Personalized learning mockup"
                    className="block h-auto w-full"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-[0.2em] text-white/60">
                  {feature.number}
                </span>
                <h2 className="mt-3 text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {feature.title}
                </h2>
                <div className="mt-5 h-0.5 w-12 bg-white" aria-hidden />
                <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

Notes:
- Rotation reduced from `-4deg` to `-2deg` at `<md` via Tailwind arbitrary rotation.
- Inner gap `gap-10` → `gap-8` at `<md` via `gap-8 md:gap-10`.
- Vertical padding `py-20 md:py-28` → `py-14 md:py-24`.
- `useRef`, `useScroll`, `useTransform`, and `motion` imports removed.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Browser sanity check**

Scroll to the "Personalized" (dark) section. Confirm the whole card fades in once, the mockup is rotated and does not overflow on a narrow viewport (e.g., 375px in devtools mobile emulation).

- [ ] **Step 4: Commit**

```bash
git add components/landing/feature-personalized.tsx
git commit -m "Replace scroll-tied animations in feature-personalized, soften mobile rotation"
```

---

## Task 6: Rewrite `feature-localised.tsx` — split desktop/mobile, pause globe

**Files:**
- Modify: `components/landing/feature-localised.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
"use client";

import { useLanguage } from "@/lib/i18n";
import { GlobeWithThailandPin } from "@/components/ui/cobe-globe-thailand-pin";
import Reveal from "./reveal";
import { useVisibilityPause } from "@/lib/use-visibility-pause";

function StaticGlobe() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm select-none">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #ffffff 0%, #f0f5fb 45%, #d6e3ef 75%, #b9c9d9 100%)",
          boxShadow: "inset -20px -30px 80px rgba(0,0,0,0.12)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.6) 0%, transparent 40%)",
        }}
        aria-hidden
      />
      {/* Thai flag pin marker, roughly centered */}
      <div
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-full"
        style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.22))" }}
        aria-hidden
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            boxShadow: "0 0 0 3px #ffffff",
            background: `linear-gradient(
              to bottom,
              #A51931 0%, #A51931 16.67%,
              #F4F5F8 16.67%, #F4F5F8 33.33%,
              #2D2A4A 33.33%, #2D2A4A 66.67%,
              #F4F5F8 66.67%, #F4F5F8 83.33%,
              #A51931 83.33%, #A51931 100%
            )`,
          }}
        />
        <div
          style={{
            width: 0,
            height: 0,
            margin: "2px auto 0",
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "7px solid #ffffff",
          }}
        />
      </div>
    </div>
  );
}

function DesktopGlobe() {
  const { ref, isVisible } = useVisibilityPause<HTMLDivElement>();
  return (
    <div ref={ref} className="w-full">
      <GlobeWithThailandPin speed={0.008} enabled={isVisible} />
    </div>
  );
}

export default function FeatureLocalised() {
  const { t } = useLanguage();
  const feature = t.features.localised;

  return (
    <section className="relative w-full overflow-hidden bg-[#f9f9f7] py-16 md:py-28">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <Reveal className="flex flex-col items-center">
          <span className="text-sm font-bold tracking-[0.2em] text-[#6b6b6b]">
            {feature.number}
          </span>
          <h2 className="mt-3 text-3xl font-bold leading-[1.15] tracking-tight text-[#1a1a1a] sm:text-4xl lg:text-5xl">
            {feature.title}
          </h2>
          <div className="mt-5 h-0.5 w-12 bg-[#1a1a1a]" aria-hidden />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#6b6b6b] sm:text-lg">
            {feature.description}
          </p>
        </Reveal>

        <Reveal delay={150} className="mt-12 w-full max-w-lg">
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div
                className="absolute inset-6 rounded-full bg-[#e8f4fd] opacity-60 blur-3xl"
                aria-hidden
              />
            </div>
            {/* Mobile: static placeholder. Desktop: live cobe globe. */}
            <div className="md:hidden">
              <StaticGlobe />
            </div>
            <div className="hidden md:block">
              <DesktopGlobe />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

Notes:
- `GlobeWithThailandPin` and `useVisibilityPause` are only reached on `md+` since the element is inside `hidden md:block`. Crucially, on mobile the module still imports `cobe` (tree-shake is unlikely to remove it here because it's referenced), but the WebGL canvas is never mounted.
- Padding reduced to `py-16 md:py-28`.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Browser sanity check**

1. On desktop width: scroll past the section, then open devtools → Performance → record ~3 seconds while scrolled to a different section. Confirm no continuous WebGL activity.
2. On devtools mobile emulation (iPhone 14 Pro Max, 390×844): inspect the section. Confirm there is no `<canvas>` element in the DOM, and the static globe placeholder shows with the pin.

- [ ] **Step 4: Commit**

```bash
git add components/landing/feature-localised.tsx
git commit -m "Split feature-localised into desktop globe + mobile static placeholder"
```

---

## Task 7: Rewrite `feature-ai.tsx` — split desktop/mobile, gate chat timer

**Files:**
- Modify: `components/landing/feature-ai.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useLanguage } from "@/lib/i18n";
import Reveal from "./reveal";
import { useVisibilityPause } from "@/lib/use-visibility-pause";

type ScriptEntry = {
  from: "user" | "lumi";
  text: string;
  typingStart?: number;
  showStart: number;
};

type ChatCopy = {
  header: { name: string; tagline: string; sub: string; tag: string };
  composer: string;
  script: ScriptEntry[];
};

const COPY: Record<"en" | "th", ChatCopy> = {
  en: {
    header: {
      name: "Lumi",
      tagline: "· your study buddy",
      sub: "Socratic tutor · Always curious",
      tag: "Math",
    },
    composer: "Ask Lumi anything…",
    script: [
      { from: "user", text: "Can you help me solve x² − 5x + 6 = 0?", showStart: 0.8 },
      {
        from: "lumi",
        text: "Happy to help you work it out. What method do you already know for a quadratic like this?",
        typingStart: 1.8,
        showStart: 3.6,
      },
      {
        from: "user",
        text: "Factoring, I think. But I'm not sure where to start.",
        showStart: 6.0,
      },
      {
        from: "lumi",
        text: "Good instinct. You need two numbers that multiply to +6 and add to −5. Can you name a pair that works?",
        typingStart: 7.2,
        showStart: 9.2,
      },
      { from: "user", text: "−2 and −3?", showStart: 11.8 },
      {
        from: "lumi",
        text: "Exactly. So you can rewrite it as (x − 2)(x − 3) = 0. What does that tell you about x?",
        typingStart: 12.6,
        showStart: 14.6,
      },
      { from: "user", text: "x = 2 or x = 3!", showStart: 16.8 },
      {
        from: "lumi",
        text: "That's it. Want to try one where the numbers are trickier?",
        typingStart: 17.6,
        showStart: 19.4,
      },
    ],
  },
  th: {
    header: {
      name: "ลูมิ",
      tagline: "· เพื่อนติวของคุณ",
      sub: "ติวเตอร์แบบโสกราตีส · สงสัยอยู่เสมอ",
      tag: "คณิต",
    },
    composer: "ถามลูมิได้ทุกเรื่อง…",
    script: [
      { from: "user", text: "ช่วยแก้สมการ x² − 5x + 6 = 0 หน่อยได้ไหม?", showStart: 0.8 },
      {
        from: "lumi",
        text: "ยินดีช่วยคิดไปด้วยกันเลย วิธีไหนที่คุณพอรู้จักสำหรับสมการกำลังสองแบบนี้?",
        typingStart: 1.8,
        showStart: 3.6,
      },
      {
        from: "user",
        text: "น่าจะเป็นการแยกตัวประกอบ แต่ไม่รู้จะเริ่มยังไงดี",
        showStart: 6.0,
      },
      {
        from: "lumi",
        text: "คิดถูกทางแล้ว ลองหาสองจำนวนที่คูณกันได้ +6 และบวกกันได้ −5 คุณนึกคู่ไหนออกไหม?",
        typingStart: 7.2,
        showStart: 9.2,
      },
      { from: "user", text: "−2 กับ −3 ใช่ไหม?", showStart: 11.8 },
      {
        from: "lumi",
        text: "ใช่เลย! เขียนใหม่ได้เป็น (x − 2)(x − 3) = 0 แล้วแบบนี้บอกอะไรเราเกี่ยวกับ x?",
        typingStart: 12.6,
        showStart: 14.6,
      },
      { from: "user", text: "x = 2 หรือ x = 3!", showStart: 16.8 },
      {
        from: "lumi",
        text: "ถูกต้องเลย อยากลองข้อที่ตัวเลขยากขึ้นอีกหน่อยไหม?",
        typingStart: 17.6,
        showStart: 19.4,
      },
    ],
  },
};

const DURATION = 23;
const ACCENT = "#000";

function useLoopingTime(duration: number, enabled: boolean) {
  const [time, setTime] = useState(0);
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    let raf = 0;
    let last: number | null = null;
    let accumulated = 0;
    const tick = (ts: number) => {
      if (last === null) last = ts;
      const delta = ts - last;
      last = ts;
      if (enabledRef.current) {
        accumulated = (accumulated + delta / 1000) % duration;
        setTime(accumulated);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);
  return time;
}

function TypingDots() {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 4,
        alignItems: "center",
        padding: "8px 12px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 6,
            background: "#999",
            opacity: 0.35,
            animation: `lumiDot 1.2s ${i * 0.15}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Paperclip() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.5l-8.5 8.5a5 5 0 01-7-7l9-9a3.5 3.5 0 015 5L11 17a2 2 0 01-3-3l7-7"
        stroke="#777"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUp() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20V4M5 11l7-7 7 7"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Message({
  msg,
  time,
  idx,
  allMsgs,
}: {
  msg: ScriptEntry;
  time: number;
  idx: number;
  allMsgs: ScriptEntry[];
}) {
  const typingStart = msg.typingStart ?? msg.showStart;
  if (time < typingStart) return null;

  const showingTyping =
    msg.from === "lumi" &&
    msg.typingStart !== undefined &&
    time >= msg.typingStart &&
    time < msg.showStart;

  const entryStart = showingTyping ? msg.typingStart! : msg.showStart;
  const entryDur = 0.26;
  const p = Math.min(1, Math.max(0, (time - entryStart) / entryDur));
  const eased = 1 - Math.pow(1 - p, 3);
  const opacity = eased;
  const ty = (1 - eased) * 10;

  const prev = allMsgs[idx - 1];
  const next = allMsgs[idx + 1];
  const isSameAsPrev = prev && prev.from === msg.from && time >= prev.showStart;
  const isSameAsNext = next && next.from === msg.from && time >= next.showStart;

  if (msg.from === "user") {
    const style: CSSProperties = {
      alignSelf: "flex-end",
      maxWidth: "78%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      opacity,
      transform: `translateY(${ty}px)`,
    };
    return (
      <div style={style}>
        <div
          style={{
            background: ACCENT,
            color: "#fff",
            padding: "9px 14px",
            borderRadius: 18,
            borderBottomRightRadius: isSameAsNext ? 18 : 4,
            borderTopRightRadius: isSameAsPrev ? 4 : 18,
            fontSize: 14,
            lineHeight: 1.4,
          }}
        >
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
        maxWidth: "82%",
        opacity,
        transform: `translateY(${ty}px)`,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: showingTyping ? "4px 6px" : "9px 14px",
          borderRadius: 18,
          borderBottomLeftRadius: isSameAsNext ? 18 : 4,
          borderTopLeftRadius: isSameAsPrev ? 4 : 18,
          fontSize: 14,
          lineHeight: 1.4,
          color: "#111",
          border: "1px solid #ececec",
          minHeight: showingTyping ? 32 : undefined,
          display: "flex",
          alignItems: "center",
        }}
      >
        {showingTyping ? <TypingDots /> : msg.text}
      </div>
    </div>
  );
}

const FONT_BY_LANG: Record<"en" | "th", string> = {
  en: "var(--font-geist-sans), -apple-system, system-ui, sans-serif",
  th: "var(--font-noto-sans-thai), var(--font-geist-sans), -apple-system, system-ui, sans-serif",
};

function ChatChrome({
  lang,
  children,
}: {
  lang: "en" | "th";
  children: React.ReactNode;
}) {
  const copy = COPY[lang];
  return (
    <div
      key={lang}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#fafafa",
        fontFamily: FONT_BY_LANG[lang],
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 20px",
          background: "#fff",
          borderBottom: "1px solid #ececec",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.1 }}>
            {copy.header.name}{" "}
            <span style={{ fontWeight: 400, color: "#999", fontSize: 12 }}>
              {copy.header.tagline}
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: "#8a8a8a", marginTop: 1 }}>
            {copy.header.sub}
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#555",
            padding: "4px 10px",
            border: "1px solid #e6e6e6",
            borderRadius: 999,
          }}
        >
          {copy.header.tag}
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "16px 14px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          justifyContent: "flex-end",
        }}
      >
        {children}
      </div>

      {/* Composer */}
      <div style={{ padding: "10px 14px 18px", background: "#fafafa" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#fff",
            border: "1px solid #e6e6e6",
            borderRadius: 22,
            padding: "6px 6px 6px 14px",
          }}
        >
          <Paperclip />
          <span style={{ flex: 1, fontSize: 13.5, color: "#999" }}>
            {copy.composer}
          </span>
          <button
            type="button"
            aria-label="Send"
            style={{
              width: 32,
              height: 32,
              borderRadius: 32,
              background: ACCENT,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowUp />
          </button>
        </div>
      </div>
    </div>
  );
}

function PhoneChatLive({ lang }: { lang: "en" | "th" }) {
  const { ref, isVisible } = useVisibilityPause<HTMLDivElement>();
  const time = useLoopingTime(DURATION, isVisible);
  const script = COPY[lang].script;
  return (
    <div ref={ref} style={{ height: "100%" }}>
      <ChatChrome lang={lang}>
        {script.map((msg, i) => (
          <Message key={i} msg={msg} time={time} idx={i} allMsgs={script} />
        ))}
      </ChatChrome>
    </div>
  );
}

function PhoneChatStatic({ lang }: { lang: "en" | "th" }) {
  const script = COPY[lang].script;
  // Show the first 3 fully-entered messages; no animation.
  const shown = script.slice(0, 3);
  const BIG_TIME = 999;
  return (
    <ChatChrome lang={lang}>
      {shown.map((msg, i) => (
        <Message
          key={i}
          msg={{ ...msg, typingStart: undefined, showStart: 0 }}
          time={BIG_TIME}
          idx={i}
          allMsgs={shown.map((m) => ({ ...m, typingStart: undefined, showStart: 0 }))}
        />
      ))}
    </ChatChrome>
  );
}

export default function FeatureAi() {
  const { t, language } = useLanguage();
  const feature = t.features.ai;

  return (
    <section className="relative w-full overflow-hidden bg-[#f9f9f7] py-14 md:py-24">
      <style>{`@keyframes lumiDot { 0%, 100% { opacity: 0.35; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-2px); } }`}</style>

      <div className="mx-auto max-w-7xl px-6">
        <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text */}
          <Reveal className="flex flex-col">
            <span className="text-sm font-bold tracking-[0.2em] text-[#6b6b6b]">
              {feature.number}
            </span>
            <h2 className="mt-3 text-3xl font-bold leading-[1.15] tracking-tight text-[#1a1a1a] sm:text-4xl lg:text-5xl">
              {feature.title}
            </h2>
            <div className="mt-5 h-0.5 w-12 bg-[#1a1a1a]" aria-hidden />
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#6b6b6b] sm:text-lg">
              {feature.description}
            </p>
          </Reveal>

          {/* Phone chat: static on mobile, live on md+ */}
          <Reveal delay={120} className="flex justify-center lg:justify-end">
            <div
              className="w-full max-w-sm overflow-hidden rounded-[32px] ring-1 ring-black/5 h-[520px] md:h-[640px]"
              style={{
                boxShadow: "0 30px 60px -25px rgba(0,0,0,0.18)",
              }}
            >
              <div className="md:hidden h-full">
                <PhoneChatStatic lang={language} />
              </div>
              <div className="hidden md:block h-full">
                <PhoneChatLive lang={language} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

Notes on the changes:
- `useLoopingTime` now accepts an `enabled` flag; when false, it keeps the RAF alive but does not advance the clock or call `setState`. No re-render pressure while the chat is off-screen.
- Live chat is only rendered at `md+`. Mobile always shows `PhoneChatStatic` — a frozen snapshot of the first 3 messages, no RAF, no timer.
- Chat container height responsive: `h-[520px] md:h-[640px]`.
- Section vertical padding reduced from `py-20 md:py-28` to `py-14 md:py-24`.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Browser sanity check**

1. Desktop: open http://localhost:3000, scroll to the Lumi chat section. Confirm the chat animates through the full loop. Then scroll well past it (e.g., into Pricing), open devtools → Performance, record ~3 seconds. Confirm no continuous React re-renders from `PhoneChatLive` (no flurry of "Function call" / "Commit" events attributable to it).
2. Mobile (devtools emulation iPhone 14 Pro Max 390×844): scroll to the same section. Confirm the chat is static (3 messages visible, no typing dots, no new messages appearing).

- [ ] **Step 4: Commit**

```bash
git add components/landing/feature-ai.tsx
git commit -m "Split feature-ai into live desktop chat + static mobile snapshot"
```

---

## Task 8: Drop scroll animations from `pricing.tsx` and `survey.tsx`

**Files:**
- Modify: `components/landing/pricing.tsx`
- Modify: `components/landing/survey.tsx`

- [ ] **Step 1: Update `pricing.tsx`**

Replace the top of the file (lines 1–5) to drop `useRef` (if no longer used) and the framer-motion imports:

```tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import Reveal from "./reveal";
```

In the `PricingCard` component signature, remove the `scrollProgress`, `delay`, `entranceY`, `entranceOpacity` props and the `<motion.div>` wrapper. Replace this block (the current `PricingCard` signature through to the `<motion.div>` wrapper):

```tsx
function PricingCard({
  tier,
  billingSuffix,
  cta,
  selected,
  onSelect,
  delay,
  scrollProgress,
}: {
  tier: Tier;
  billingSuffix: string;
  cta: string;
  selected: boolean;
  onSelect: () => void;
  delay: number;
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const entranceY = useTransform(
    scrollProgress,
    [0 + delay, 0.5 + delay],
    [40, 0],
  );
  const entranceOpacity = useTransform(
    scrollProgress,
    [0 + delay, 0.5 + delay],
    [0, 1],
  );
```

with:

```tsx
function PricingCard({
  tier,
  billingSuffix,
  cta,
  selected,
  onSelect,
  delay,
}: {
  tier: Tier;
  billingSuffix: string;
  cta: string;
  selected: boolean;
  onSelect: () => void;
  delay: number;
}) {
```

Replace the `<motion.div style={{ y: entranceY, opacity: entranceOpacity }} className="w-full">` opening and its closing `</motion.div>` with:

```tsx
<Reveal delay={delay * 1000} className="w-full">
```

and the matching `</Reveal>` at the end of the card JSX.

In the outer `Pricing` component, remove:

```tsx
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center start"],
  });

  const headingY = useTransform(scrollYProgress, [0, 0.4], [40, 0]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
```

Also remove the `ref={sectionRef}` from the `<section>` (if present) and replace any `<motion.div style={{ y: headingY, opacity: headingOpacity }}>` with `<Reveal>`. Remove the `scrollProgress={scrollYProgress}` prop from every `<PricingCard>` invocation.

If `useRef`, `useScroll`, `useTransform`, or `motion` are no longer referenced, remove them from the imports. If they are still referenced elsewhere (unlikely after this change), keep only what's needed.

- [ ] **Step 2: Update `survey.tsx`**

Replace the entire file:

```tsx
"use client";

import { useLanguage } from "@/lib/i18n";
import Reveal from "./reveal";

export default function Survey() {
  const { t } = useLanguage();
  const s = t.survey;

  return (
    <section id="survey" className="w-full bg-[#f9f9f7] py-16 md:py-28">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <Reveal className="flex flex-col items-center">
          <span className="text-sm font-bold tracking-[0.2em] text-[#6b6b6b]">
            {s.eyebrow}
          </span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl">
            {s.headline}
          </h2>
          <div className="mt-5 h-0.5 w-12 bg-[#1a1a1a]" aria-hidden />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#6b6b6b] md:text-lg">
            {s.description}
          </p>
        </Reveal>

        <Reveal delay={150} className="mt-10">
          <a
            href="/survey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-7 py-3 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:shadow-lg"
          >
            {s.cta}
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="ml-0.5"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
```

**Important:** before saving, open the current `components/landing/survey.tsx` and confirm the CTA markup matches above (field names like `s.cta`, `s.description`). If the existing file uses different translation keys, keep those keys — don't introduce new ones. The point of this task is dropping the scroll animation, not changing copy.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Browser sanity check**

Open the landing page. Scroll to Pricing — all three cards should fade in once (staggered by their existing `delay` prop values converted to ms). Scroll to the Survey CTA — heading fades in, CTA fades in slightly after.

- [ ] **Step 5: Commit**

```bash
git add components/landing/pricing.tsx components/landing/survey.tsx
git commit -m "Replace scroll-tied animations in pricing and survey sections with Reveal"
```

---

## Task 9: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: build succeeds with no new warnings.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: passes, or only pre-existing warnings.

- [ ] **Step 3: Grep check — no residual `useScroll` / `useTransform` in landing sections**

Run (expect no matches):

```bash
grep -rn "useScroll\|useTransform" components/landing/
```

Expected: empty output.

- [ ] **Step 4: Desktop smoke test**

On http://localhost:3000 (desktop width):
1. Scroll top-to-bottom once. Every section should fade/slide in as it enters the viewport. No stutter.
2. Scroll past the globe section, then back. Confirm the globe spins when visible. When scrolled well past, confirm (via devtools Performance recording) no continuous WebGL activity.
3. Similarly for the Lumi chat.

- [ ] **Step 5: Mobile smoke test (devtools iPhone 14 Pro Max)**

Set viewport to 390×844 with "Mobile" UA and CPU throttling 4×:
1. Scroll top-to-bottom. Confirm smooth scrolling, no frame drops on section transitions.
2. Confirm `feature-localised` shows the static gradient globe, not a `<canvas>`.
3. Confirm `feature-ai` shows a static chat (3 messages, no animation, no typing dots).
4. Confirm reduced padding on feature sections (sections feel tighter but not cramped).

- [ ] **Step 6: Commit if anything came up**

If any fixes were needed during verification:

```bash
git add -A
git commit -m "Fix mobile perf verification issues"
```

Otherwise nothing to commit.

---

## Self-review checklist (performed by plan author)

- **Spec coverage:**
  - Reveal primitive — Task 2 ✓
  - `useVisibilityPause` hook — Task 1 ✓
  - `feature-active` rewrite — Task 4 ✓
  - `feature-localised` + mobile variant — Task 6 ✓
  - `feature-personalized` rewrite + layout tweaks — Task 5 ✓
  - `feature-ai` + mobile variant + gated RAF — Task 7 ✓
  - Globe `enabled` prop — Task 3 ✓
  - Pricing + Survey section reveal conversion — Task 8 ✓
  - Mobile padding tweaks, phone rotation tweak, chat height tweak, static globe max-w — embedded in Tasks 4–7 ✓
  - `prefers-reduced-motion` handling — Task 2 (CSS media query) ✓
  - Final verification — Task 9 ✓

- **Placeholder scan:** no TBDs, no "add appropriate error handling", no "similar to Task N" — each task shows its own code.

- **Type consistency:** `useVisibilityPause` signature in Task 1 matches call sites in Tasks 6 and 7. `Reveal` prop shape in Task 2 matches all usages. `GlobeWithThailandPin` new `enabled` prop in Task 3 matches call site in Task 6.
