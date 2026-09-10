# AGENTS.md

Chalk Talk is a single-page math speaking-practice app. The user spins a random topic, reads up on a research timer, then explains the topic out loud on a speech timer. Vite + React 19 + TypeScript, static output, no backend, no router, no state library.

## Commands

```sh
npm run dev      # dev server
npm test         # vitest, pure logic only
npm run build    # tsc -b && vite build -> dist/
npm run preview  # serve dist/
```

Run `npm run build` and `npm test` after any change. The build is the type check.

## Structure

| Path | Role |
| --- | --- |
| `src/App.tsx` | All app state: course, settings, spin animation, phase machine, layout |
| `src/data/courses.ts` | The topic lists. Eight courses, each with `concepts` and `theorems` |
| `src/lib/` | Pure logic, no JSX. `spin`, `storage`, `timer`, `format`, `motion`, `sounds` |
| `src/components/` | Presentation only. Props in, callbacks out, no app state |
| `src/styles.css` | One stylesheet. CSS custom properties at `:root`, no framework |
| `syllabi/` | Source syllabi for the topic lists. Gitignored except its README |

## Phase machine

`App.tsx` holds `phase`. The flow is linear:

```
idle -> (spin) -> landed -> research -> ready -> speech -> done
```

`Close` or `Escape` returns to `idle` from any overlay phase and keeps the landed topic. `TimerOverlay` renders every phase except `idle`.

## Topic data

Each course has two string lists. `concepts` are definitions and objects. `theorems` are named results. Both feed one spin pool. `kindOf(topic)` decides the label, `Definition n.` or `Theorem n.`.

Rules the tests enforce: at least 12 concepts and 8 theorems per course, no blanks, no duplicates, no topic in both lists, no name longer than 60 characters. Use Unicode math (`ε`, `ℝᵈ`, `σ`), not LaTeX or KaTeX.

## Conventions

- **No comments.** The code carries no comments. Do not add any. Name things instead.
- **No new dependencies.** React and the Vite toolchain only. No UI, animation, or math libraries.
- **Pure logic goes in `src/lib/` and gets a test.** Anything with DOM, timers, or React goes in a component and is verified in a browser instead.
- **Components stay dumb.** No `useState` for app data in `src/components/`.
- **Accessibility is part of the feature.** The listbox, the radio pattern, the focus trap, `inert` on the background, and `aria-live` all work now. Keep them working.
- **`prefers-reduced-motion` is handled** in `src/lib/motion.ts`, in the spin length, and in the stylesheet.

## Non-obvious behaviour

Read this before you change these files. Nothing in the code explains it.

- **`src/lib/timer.ts`.** The countdown stores an end timestamp and derives the display each tick. Do not decrement a counter. A throttled background tab makes a decremented clock drift.
- **`src/components/SettingsDialog.tsx`.** Focus returns to the trigger in an effect, not inside `close()`. The trigger is still in an `inert` subtree until React renders again.
- **`src/lib/storage.ts`.** The empty `catch` blocks are deliberate. Blocked or full storage must not stop the app. Values are clamped on read, so a hand-edited value cannot break the UI.
- **`src/lib/spin.ts`.** `planSpin` keeps the invariant `(currentIndex + totalSteps) % pool.length === landIndex`. The reel drives the display from this step count. Breaking the invariant lands the reel on the wrong topic.
- **`src/components/SpiralField.tsx`.** The dot field runs a `requestAnimationFrame` loop only while the pointer is present or a dot is away from home. Settled dots snap to their exact home and the loop stops. Do not start an unconditional loop.
- **`src/styles.css`.** `body` has no background. The background is on `html`. A `body` background paints over the fixed canvas at `z-index: -1`.

## Verification

Unit tests do not cover the UI. For any change to the spin, the timers, the overlay, or the field, run `npm run preview` and check in a browser:

1. Spin lands on a new topic. The label reads `Definition n.` or `Theorem n.`.
2. Research runs, `Done researching` skips to ready, `I'm ready to speak` starts the speech, the chime plays at `0:00`.
3. `Escape` closes the overlay and returns focus to the button that opened it.
4. Settings persist after a reload.
5. At 390 px wide the page does not scroll sideways.
6. Moving the pointer across the page pushes the dots, and they return to their exact positions.
