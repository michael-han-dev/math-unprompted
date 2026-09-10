# Chalk Talk

Math speaking practice. Spin a random concept or theorem, then explain it out loud on a timer.

Made by [bymichaelhan](https://www.instagram.com/bymichaelhan/). Inspired by [Unprompted](https://www.unprompted.cool/).

## Modes

- **Off the cuff.** Pick a course, spin a *concept* ("Open ball", "Cauchy sequence"), and talk for a minute. The speech arc is *Define it → Example → Why it matters*.
- **Deep research.** Spin a *theorem* ("Heine–Borel", "Rank–nullity"), read up on a research timer, then start the speech timer when you are ready. The arc is *State it → Proof idea → Why it matters*.

Timer lengths and mute are in the settings dialog and are saved in your browser.

## Run it

```sh
npm install
npm run dev       # local dev server
npm test          # unit tests (vitest)
npm run build     # typecheck + production build into dist/
npm run preview   # serve the production build
```

## Edit the topics

Everything lives in `src/data/courses.ts`. Each course has a `concepts` list (Off the cuff) and a `theorems` list (Deep research). Add, remove, or rename freely; `npm test` checks for blanks, duplicates, and minimum list sizes.

Drop course syllabi into `syllabi/` to have the lists regenerated from them. That folder is gitignored except for its README.

## Deploy

Connect the repo on Vercel or Netlify. Both detect Vite automatically: build command `npm run build`, output directory `dist`.
