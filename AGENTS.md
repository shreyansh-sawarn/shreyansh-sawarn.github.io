# shreyansh-sawarn.github.io

Personal portfolio of Shreyansh Sawarn (DevOps Engineer). Cyberpunk × Japanese
cherry-blossom ("Neo-Tokyo sakura") aesthetic. Deployed via GitHub Pages from
`main` — pushing is deploying.

## Architecture — intentionally three files

- `index.html` — single page, semantic HTML
- `style.css` — all styling, theme system, animations
- `main.js` — all behavior, vanilla ES5-ish, zero dependencies

**Do not introduce frameworks, build steps, npm, or split into modules.** The
no-build simplicity is a deliberate feature. jQuery was removed in the 2026
redesign; don't reintroduce it.

## Theme system

- Dark is default; light mode toggles `body.light`, persisted in
  `localStorage('theme')`.
- All theme-dependent colors go through CSS variables defined in `:root` and
  overridden in `body.light`. Never hardcode a theme color in a component rule.
- The hero artwork ships as two files (`images/sakura-dark.webp`,
  `images/sakura-light.webp`) swapped via CSS `display`, because the image
  processing differs per theme (dark variant has lavender-recolored ink and
  boosted petals).

## Hard-won gotchas (do not regress)

1. **Mobile layout viewport**: anything extending past the right viewport edge
   (the artwork overhangs by design) MUST live inside `.tree-wrap`
   (`overflow: clip`). Un-contained horizontal overflow widens the mobile
   layout viewport, which strands all `position: fixed` controls off-screen.
   `overflow-x: clip` on `html`/`body` alone is NOT sufficient — Chrome
   measures content width before clipping.
2. **Animations vs. resting opacity**: entrance animations must not animate
   `opacity` on elements whose resting opacity is < 1 (e.g. `.sakura-tree` at
   80% on mobile) — the animation overrides the cascade and causes a visible
   brightness snap when it ends. Fade the wrapper, slide the element.
3. **Parallax vs. media queries**: JS writes `--fade` (a CSS variable), never
   inline `opacity`, so the mobile opacity cap keeps working. Same idea for
   sway: keyframes use the standalone `rotate` property while JS drives the
   standalone `translate` property — they compose instead of fighting.
4. **`nth-of-type` counts per tag**: in `.pipeline`, stages are `div`s (1–4)
   and pipes are `span`s (1–3). They are counted independently.
5. **Reduced motion**: every new animation must respect
   `prefers-reduced-motion` (global override exists in CSS; JS checks
   `reducedMotion`). Canvases pause on `visibilitychange`.

## Features to be aware of

- Falling sakura petals: `<canvas id="sakura">`, theme-aware colors.
- Katakana digital rain: `<canvas id="rain">`, left edge, hidden ≤1100px.
- Typewriter roles with glitch "zap" on word completion.
- Scroll reveals re-trigger on every scroll in/out (`.reveal.in` toggles).
- CI/CD pipeline animation in Experience lights up on reveal.
- Live GitHub stats on project cards (public API, sessionStorage-cached,
  silently degrades if rate-limited). Stars intentionally not shown.
- Terminal easter egg: `` ` `` key or `>_` button; commands in `COMMANDS` map
  in `main.js`; has ↑/↓ history and Tab completion.

## Assets

- `images/` must stay lean — only files the site references (plus resume).
  Raw AI-generation sources were deliberately deleted; they're in git history.
- `images/og-image.png` is generated (1200×630) for social previews; if the
  branding changes, regenerate it to match.
- Artwork pipeline (if replacing the sakura art): source image on pure white →
  alpha-extract (`1 - min(RGB)`), unpremultiply for the light variant; for the
  dark variant keep observed pastel colors, boost saturation, recolor ink
  toward lavender, threshold alpha < 0.13 to kill paper-texture haze.

## Content

Keep copy in sync with `images/Shreyansh_Sawarn_Resume.pdf`. Japanese accents
(section kanji, footer) are decorative — keep them tasteful and minimal.
