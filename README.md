# Chalk Talk

Math speaking practice. Spin a random concept or theorem, then explain it out loud on a timer.

Made by [bymichaelhan](https://www.instagram.com/bymichaelhan/). Inspired by [Unprompted](https://www.unprompted.cool/).

## How it works

Pick a course and spin. The reel lands on a definition ("Open ball") or a theorem ("Heine–Borel"). A research timer starts; read up, then start the speech timer when you are ready and talk until it runs out.

Timer lengths and mute are in the settings dialog and are saved in your browser.

## Dividing the minute

The timer does not split the minute for you. This is a suggested split to practice against:

| Seconds | Theorem | Definition |
| --- | --- | --- |
| 0–15 | State it in full, hypotheses included | Give the precise definition |
| 15–40 | Give the proof idea: the one key step, not the whole proof | Give one example and one non-example |
| 40–60 | Say why it matters: where it is used, or what breaks without the hypotheses | Say why it matters: what it lets you define or prove next |

Two habits worth drilling. Say the hypotheses out loud every time, because that is what gets dropped under pressure. Leave the last ten seconds for a single closing sentence.

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
