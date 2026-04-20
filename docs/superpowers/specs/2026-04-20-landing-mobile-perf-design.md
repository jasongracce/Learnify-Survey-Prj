# Landing page mobile performance pass — design

**Date:** 2026-04-20
**Scope:** Landing page (`app/page.tsx` and its section components). Survey flow is out of scope for this pass.
**Trigger:** Landing page is laggy on iPhone 14 Pro Max — scroll jank and sluggish animations.

## Goals

1. Eliminate scroll jank on mobile (and improve perceived smoothness on desktop).
2. Stop expensive animations from running while off-screen.
3. Avoid mounting WebGL globe and RAF-driven phone chat on mobile entirely.
4. Apply a small set of mobile layout tweaks in the same pass (spacing, hard-coded heights, rotation overflow).

**Non-goals for this pass:** larger mobile UI redesign, survey flow, any new features. Deeper mobile UI polish will come in a later pass.

## Root causes identified

| Source | Why it's expensive |
|---|---|
| `useScroll` + `useTransform` in 4 feature sections (`feature-active`, `feature-localised`, `feature-personalized`, `feature-ai`) | Every scroll event drives framer-motion updates that re-paint transforms / `clip-path`. On mobile GPUs, `clip-path` animations in particular are costly. |
| `useLoopingTime` in `feature-ai.tsx` | Calls `setState` on every `requestAnimationFrame` (~60×/sec), re-rendering the entire `PhoneChat` component. Runs regardless of visibility. |
| Cobe globe in `feature-localised.tsx` (`GlobeWithThailandPin`) | Continuous WebGL render loop. Runs regardless of visibility, and mounted even on mobile where it's the least suitable. |

## Approach: Option B — one-shot reveals + offscreen pause + selective mobile variants

1. Replace all `useScroll`-driven animations with one-shot fade/slide reveals triggered by `IntersectionObserver`.
2. Pause RAF loops (globe, phone-chat timer) when off-screen.
3. For components where mobile benefits from genuinely different content, render split variants in the same file (CSS-gated via `md:hidden` / `hidden md:block`).

## Architecture

### 1. `Reveal` primitive — `components/landing/reveal.tsx`

A client component that wraps its child and toggles a `data-revealed` attribute when the element enters the viewport.

**Props:**
- `as?: React.ElementType` — defaults to `"div"`.
- `variant?: "fade-up" | "fade"` — defaults to `"fade-up"`.
- `delay?: number` — optional ms delay applied via inline CSS `transition-delay`.
- `className?: string`
- `children: React.ReactNode`

**Behavior:**
- On mount, attach `IntersectionObserver` with `threshold: 0.1` and `rootMargin: "0px 0px -10% 0px"` (trigger slightly before fully in view).
- On first intersection: set `data-revealed="true"` and `observer.disconnect()`.
- Static CSS utility in `app/globals.css`:

```css
.reveal {
  opacity: 0;
  transition: opacity 600ms ease-out, transform 600ms ease-out;
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
  .reveal { transition-duration: 200ms; }
  .reveal[data-variant="fade-up"] { transform: none; }
}
```

### 2. `useVisibilityPause` hook — `lib/use-visibility-pause.ts`

A reusable hook that reports whether a referenced element is visible.

**Signature:**
```ts
function useVisibilityPause<T extends Element = HTMLDivElement>(
  rootMargin?: string
): { ref: React.RefObject<T>; isVisible: boolean };
```

- Default `rootMargin: "200px 0px"` — resume just before scrolling into view.
- `threshold: 0` — toggles on any intersection boundary cross.
- Returns a stable ref and an `isVisible` boolean.

### 3. Per-component changes

| Component | Change |
|---|---|
| `components/landing/hero.tsx` | No change (already uses one-shot CSS `animate-fade-in-up`). |
| `components/landing/floating-cards.tsx` | No change (already has clean desktop/mobile split; cards are static). |
| `components/landing/stats-banner.tsx` | If currently animated, wrap in `Reveal`. Otherwise leave. |
| `components/landing/feature-active.tsx` | Remove `useScroll`, `useTransform`, and the `clip-path` animation. Wrap text block and image block in `Reveal variant="fade-up"`. |
| `components/landing/feature-localised.tsx` | Remove `useScroll`. Wrap text in `Reveal`. **Desktop** (`hidden md:block` wrapper around the globe): mount `GlobeWithThailandPin` with the `useVisibilityPause` hook gating its internal RAF. **Mobile** (`md:hidden`): render a static placeholder — a circular gradient div with a pin marker (no WebGL, no image asset needed). |
| `components/landing/feature-personalized.tsx` | Remove `useScroll`. Wrap dark card in `Reveal`. Reduce phone rotation from `-4deg` to `-2deg` at `<md`. Reduce inner gap `gap-10` → `gap-8` at `<md`. |
| `components/landing/feature-ai.tsx` | Remove `useScroll`. Wrap text and chat blocks in `Reveal`. **Desktop** (`hidden md:block`): keep `PhoneChat`, but `useLoopingTime` accepts an `enabled` parameter driven by `useVisibilityPause`. When not visible, the timer does not advance. **Mobile** (`md:hidden`): render a static snapshot — a minimal HTML/CSS block showing the first 3 messages of the script plus the composer, styled to match the live chat. No RAF. |
| `components/landing/pricing.tsx` | If currently animated, wrap in `Reveal`. Otherwise leave. |
| `components/landing/survey.tsx` (CTA) | If currently animated, wrap in `Reveal`. Otherwise leave. |
| `components/ui/cobe-globe-thailand-pin.tsx` | Inside the animate loop, skip `globe.update()` when the element is off-screen. Use the existing ref (the canvas) to power an internal `IntersectionObserver` — or accept an `enabled` prop driven from the caller. Prefer the prop form for clarity. |
| `components/ui/cobe-globe-polaroids.tsx` | Same treatment as above if/when used. Currently not imported from any landing section — leave unchanged unless already mounted. |

### 4. Mobile layout tweaks (bundled with the rewrites)

- **All feature sections:** reduce vertical padding at `<md`. Patterns to update: `py-24 md:py-32` → `py-16 md:py-28`, and `py-20 md:py-28` → `py-14 md:py-24`.
- **`feature-ai.tsx`:** replace hard-coded `height: 640` on the phone chat container with `h-[520px] md:h-[640px]`. Mobile static snapshot uses the same responsive height.
- **`feature-personalized.tsx`:** reduce phone rotation to `-2deg` at `<md`; reduce grid gap from `gap-10` to `gap-8` at `<md`.
- **`feature-localised.tsx`:** mobile static globe at `max-w-sm` (rather than inheriting `max-w-lg`).

## File-level summary

**New files:**
- `components/landing/reveal.tsx`
- `lib/use-visibility-pause.ts`

**Modified files:**
- `app/globals.css` — add `.reveal` utility.
- `components/landing/feature-active.tsx` — drop scroll animations, add `Reveal`, apply padding tweaks.
- `components/landing/feature-localised.tsx` — drop scroll animations, add `Reveal`, split desktop/mobile, wire `useVisibilityPause`.
- `components/landing/feature-personalized.tsx` — drop scroll animations, add `Reveal`, layout tweaks.
- `components/landing/feature-ai.tsx` — drop scroll animations, add `Reveal`, split desktop/mobile, gate `useLoopingTime` with `enabled`, layout tweaks.
- `components/ui/cobe-globe-thailand-pin.tsx` — accept an `enabled` prop that gates the RAF loop.

## Testing / verification

Test in both Chrome devtools mobile emulation (iPhone 14 Pro Max preset, CPU throttling 4×) and on the real device.

Manual checks:
1. Scroll from top to bottom on mobile — should feel smooth, no animation jank on section transitions.
2. On desktop, scroll past the globe and phone chat, then open devtools Performance. Confirm RAF no longer runs while the component is off-screen.
3. Confirm mobile does not mount the cobe canvas (check DOM: no `<canvas>` element in `feature-localised`).
4. Confirm mobile does not mount the animated `PhoneChat` (check DOM: no `lumiDot` animation, no mutation of message list).
5. Reduced motion: with "Reduce motion" enabled in the OS, reveals should still fire but with minimal transition.
6. No regressions on desktop: floating cards, text, images, and the static content all render identically to before (minus the scroll-tied parallax).

## Out of scope

- Survey flow mobile polish.
- Replacing `framer-motion` entirely (still useful on the survey page and possibly elsewhere).
- Image optimization / lazy-loading beyond what Next.js `Image` already provides.
- Bundle-size work.
- A full mobile UI redesign — the user will iterate on specific mobile UI tweaks in a separate pass.
