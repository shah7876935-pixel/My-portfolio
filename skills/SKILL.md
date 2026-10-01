---
name: Modern Frontend & Web Development
description: Use when building, styling, animating, reviewing or debugging any frontend or web experience - UI/UX, responsive layout, accessibility, performance, CSS, JavaScript, animation, micro-interactions, 3D and modern web trends.
license: MIT
---

# Modern Frontend & Web Development

Operating standards for shipping interfaces that look premium, feel fast and
stay usable for everyone. Apply the smallest set of rules that solves the
problem; never trade one pillar for another.

**Priority order — never invert it:**
`Accessibility & correctness` → `Performance` → `Readability` → `Motion & delight`.

---

## 1. Modern UI/UX

- **Hierarchy over decoration.** One focal point per screen. Everything else supports it.
- **8px spacing rhythm.** `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96`. Never eyeballed values.
- **Type scale over font sizes.** Display → Heading → Body → Small, fluid with
  `clamp()`: `clamp(1.9rem, 4.2vw, 2.85rem)`. Fixed `px` headings are a smell.
- **Consistency is the design system.** One card treatment, one button family,
  one radius, one border weight. If it appears four times it becomes a component.
- **Design tokens for everything.** Colour, spacing, radius, shadow, motion,
  z-index live as custom properties in `:root`. Never hard-code a repeated value.
- **Restraint reads as premium.** Generous whitespace, one accent family, low
  opacity layers. Fewer effects, better executed, beats more effects.
- **Empty, loading, error and success states are part of the design**, not an afterthought.

---

## 2. Responsive Design

- **Mobile-first, fluid by default.** Layout is `auto`; only media are constrained.
- **Test at** 1440, 1280, 1024, 768, 480, 375 px. Verify every one.
- **Zero horizontal scroll, ever.** Guard:
  `document.documentElement.scrollWidth <= document.documentElement.clientWidth`
  Usual culprits: `100vw` (includes the scrollbar), fixed widths, long unbroken
  strings/URLs, transformed decorations, negative margins.
- **Overflow containment:** `overflow-x: clip` on the section wrapper (not
  `hidden`, which silently creates a scroll container and breaks sticky/anchors).
- **Few breakpoints, well chosen** (≈480 / 768 / 1024 / 1280). No one-off patches.
- **Touch targets ≥ 44×44px.** Adjacent targets get real spacing.
- **Content never depends on hover.** Touch and keyboard must reach everything.
- **Test landscape phones** and very short viewports (`max-height`).

---

## 3. Accessibility (WCAG 2.2 AA)

- **Semantic HTML first.** Landmarks (`header`/`nav`/`main`/`section`/`footer`),
  one `<h1>`, logical heading order, real `<button>`/`<a>`, real `<form>` + `<label>`.
- **Contrast:** body text ≥ 4.5:1, large text and UI boundaries ≥ 3:1.
- **Never remove focus outlines** unless replaced by an equally visible
  `:focus-visible` ring with adequate offset.
- **Every control is keyboard reachable and operable.** Esc closes dialogs and
  menus. Manage focus on open; return it on close.
- **State via ARIA, not invention:** `aria-expanded`, `aria-current`, `aria-live`,
  `aria-label` on icon-only controls, `role` only when the element cannot carry it.
- **Alt text** describes purpose, not pixels. Decorative art is `aria-hidden="true"`.
- **Do not split text for animation in a way that fragments the accessibility
  tree.** Keep one accessible string (`aria-label` + `aria-hidden` spans).
- **Animation is optional, not required.** Honour
  `prefers-reduced-motion: reduce` — remove, do not merely shorten.
- Verify with keyboard-only pass and a screen-reader spot check.

---

## 4. Performance

- **Animate `transform` and `opacity` only.** `width`, `height`, `top`, `left`
  and `margin` trigger layout on every frame.
- **Promote deliberately.** `will-change`/`translate3d` only on elements that
  actually animate, and remove it afterwards. Never blanket-apply.
- **`IntersectionObserver` for scroll work**, not `scroll` listeners that
  recompute geometry. If a listener is unavoidable, gate it behind
  `requestAnimationFrame` and `{ passive: true }`.
- **Composite independent transform properties** — `translate`, `rotate`, `scale`
  — so several effects can share one element without overwriting each other's
  `transform`. This is the cleanest way to stack motion systems.
- **Cheap decorative layers:** few blurs, bounded sizes, low opacity, no
  `filter`/`backdrop-filter` stacked over scrolling content.
- **No layout shift:** explicit `width`/`height` on media, `font-display: swap`,
  space reserved for async content.
- **Lazy-load below the fold** (`loading="lazy"`, `decoding="async"`).
- **Ship fewer bytes.** Every kilobyte is permanent in a build-less site. Reach for
  a dependency only when you can state plainly why vanilla fails.
- Measure with the Performance panel; profile before and after. Never regress first paint.

---

## 5. CSS

- Custom properties for tokens. `* { box-sizing: border-box }`. One reset, one base.
- **Layout:** Grid for 2D, Flexbox for 1D, `gap` over margin hacks, `minmax()`
  for intrinsic responsiveness, `clamp()` for fluid scales.
- **Cascade layers** (`@layer base, layout, components, motion, utilities`) when a
  file grows past a few thousand lines.
- **`:where()`** for zero-specificity resets, **`:is()`** to group without repetition.
- **`:has()`** for parent styling instead of JS class toggling.
- **Container queries** (`@container`) for components that must respond to their
  own box, not the viewport.
- **`@supports`** for progressive enhancement — new syntax ships inside it, never
  as a hard requirement.
- **Match the file's existing conventions** (indentation, banner comments, naming)
  instead of importing your own style.
- **Specificity is a budget.** Do not win a fight with `!important`; restructure.
- Never animate a property inside a `@media (prefers-reduced-motion: reduce)` block
  without an escape hatch.

---

## 6. JavaScript

- **Vanilla by default.** No framework, no bundler, no dependency for something
  30 lines of native code solves.
- **Progressive enhancement:** the page must be complete and usable with JS off.
  Never gate content behind an animation.
- **Delegate** repeated listeners from one parent instead of N handlers.
- **Feature-detect, never sniff.** `IntersectionObserver`, `matchMedia`,
  `element.animate`, `document.startViewTransition` — check, then use, then degrade.
- **One rAF loop per effect, self-stopping** when the motion has settled or the
  tab is hidden. Never a permanent interval.
- **Eased values, not stepped ones.** Lerp toward a target in `requestAnimationFrame`
  instead of relying on CSS transitions for pointer-following effects.
- **Read custom properties the same way you write them** — set `--x` in JS, consume
  it in CSS. Keeps the source of truth in one place.
- **`passive: true`** on touch/scroll listeners; `{ once: true }` on one-shot listeners.
- Small pure functions, descriptive names, comments only where intent is not obvious.

---

## 7. Animation

**Choose the cheapest technique that produces the effect.**

| Effect | Preferred technique |
| --- | --- |
| Enter/exit, state change | CSS transition |
| Keyframe sequence, loop | CSS `@keyframes` |
| Scroll-triggered reveal | `IntersectionObserver` + class |
| One-off imperative flourish | Web Animations API (`element.animate`) |
| Pointer-tracked follow | rAF + eased lerp → CSS variable |
| Hover-only micro-interaction | CSS `:hover` + transition |

- **Durations:** 120–200ms micro, 200–350ms UI, 400–700ms entrances,
  ≥1s ambient loops. Ease-out for entrances, ease-in-out for ambient.
- **Distance over duration.** Movement reads better than opacity alone.
- **Stagger 40–80ms** between related items; never long enough to feel slow.
- **Ambient loops run slow (6–40s)**, at low opacity, and desync per item with
  negative `animation-delay` so nothing pulses in unison.
- **One dominant motion per section.** Competing animations read as noise.
- Reveals must be **idempotent and one-way**, and content must be visible when
  motion is disabled or unavailable.

---

## 8. Micro-interactions

- Feedback within **100ms** of intent. Every actionable element acknowledges
  hover, focus, press and disable.
- **Press:** scale to `0.97–0.99` or nudge down 1–2px.
- **Hover:** lift 2–6px, brighten the border, intensify one shadow. One effect,
  not three.
- **Toggle:** animate the actual state change — width, opacity, colour — so the
  cause and effect are visible.
- **Icons:** arrow nudges forward, glyph rotates a few degrees, never 360° unless
  it represents loading.
- **Focus is a first-class micro-interaction**, not a browser afterthought.
- Never block the next action. A micro-interaction must never delay input.

---

## 9. 3D & Depth

- `perspective()` on the **parent**, `rotateX/rotateY` on the child.
- **Keep tilt shallow: 4–8°.** Beyond that it looks broken, not alive.
- **Light must be consistent.** One implied light source; every shadow points the
  same way. A highlight and its shadow are the pair that sells depth.
- **Layered depth:** background → mid ground (blurred, parallax) → content.
  Slow parallax (a few pixels), never more.
- **Fake 3D beats heavy 3D.** CSS gradients, masks and `translateZ` read as
  premium and cost nothing. Reach for WebGL/Three.js only for genuine 3D geometry.
- **Blur is the most expensive depth cue.** Bound its radius, its size, and how
  many layers carry it simultaneously.

---

## 10. Modern Web Trends (use deliberately, not by reflex)

- **Container queries** · **`:has()`** · **`:is()`** · **nesting** · **cascade layers**
- **View Transitions API** for same-document state changes; `startViewTransition`
  is opt-in and must have a plain fallback.
- **Scroll-driven animations** — `animation-timeline: view()` / `scroll()` — in
  `@supports`, as pure CSS enhancement with zero JS. Requires `translate`/`rotate`/
  `scale` (not `transform`) on anything that already animates.
- **`content-visibility: auto`** + `contain-intrinsic-size` for long pages.
- **Color 4, `color-mix()`, `oklch()`** for perceptual, consistent ramps.
- **`prefers-reduced-transparency` / `prefers-contrast`** — backdrop-filter heavy
  UIs should degrade when transparency is unwanted.
- **`inert`** for correct modal focus trapping; **`popover`** for real overlays.
- **Progressive enhancement as the default posture:** ship the modern path, keep
  the simple path working. A trend that breaks a browser is not an upgrade.
- Do not chase a trend that fights the product. Fancy is not the same as good.

---

## 11. Pre-Delivery Checklist

- [ ] Reads correctly at 375 / 768 / 1280 px, no horizontal scroll
- [ ] Keyboard-only pass works; focus always visible
- [ ] `prefers-reduced-motion: reduce` honoured
- [ ] Works with JS disabled (content visible, navigation intact)
- [ ] Only `transform` / `opacity` animate; no forced reflow in a loop
- [ ] No console errors, no unused CSS/JS, no dead code, no duplicates
- [ ] Contrast passes, alt text and labels present
- [ ] Contrast/no-motion/no-transparency fallbacks all verified