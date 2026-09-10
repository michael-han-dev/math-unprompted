# Chalk Talk

Math speaking practice. Spin a random concept or theorem, then explain it out loud on a timer.

Made by [bymichaelhan](https://www.instagram.com/bymichaelhan/). Inspired by [Unprompted](https://www.unprompted.cool/).

## How it works

Pick a course and spin. The reel lands on a definition ("Open ball") or a theorem ("Heine–Borel"). A research timer starts; read up, then start the speech timer when you are ready. The speech arc is *Define it → Example → Why it matters* for a definition and *State it → Proof idea → Why it matters* for a theorem.

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

Everything lives in `src/data/courses.ts`. Each course has a `concepts` list (definitions) and a `theorems` list (named results); both feed the spin. Add, remove, or rename freely; `npm test` checks for blanks, duplicates, and minimum list sizes.

Drop course syllabi into `syllabi/` to have the lists regenerated from them. That folder is gitignored except for its README.

## Deploy

Connect the repo on Vercel or Netlify. Both detect Vite automatically: build command `npm run build`, output directory `dist`.
