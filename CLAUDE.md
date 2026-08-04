# CLAUDE.md — וורדעל (Wordel)

Hebrew Wordle-style PWA. Pass-and-play: no daily word, no server, no login.
Whoever wins a round picks (or draws) the next round's word before handing
the device to the next player.

## On opening this repo, run automatically

```
npm install && npm run build
```

**This build has never actually run end-to-end.** The sandbox this repo was
built in had no network access, so `npm install` could never be verified and
`vite build` was never executed. Treat the first build as a real verification
step: fix errors and re-run until clean before doing anything else asked of
you.

Likely first-build friction points, roughly in order of likelihood:
1. **Vite/React version drift** — `package.json` pins reasonably recent
   `vite@^5.4.1` / `@vitejs/plugin-react@^4.3.1`, but these were never
   resolved against the real registry. If install fails on peer deps, bump
   to whatever `npm create vite@latest` currently scaffolds for the
   `react` template and re-apply the app's actual source on top.
2. **`vite.config.js` `base: "/wordel/"`** — hardcoded for GitHub Pages
   project-site hosting at `https://<user>.github.io/wordel/`. If the repo
   is renamed or deployed at the domain root instead, this must change to
   `base: "/"` or the correct path, or all asset/manifest/service-worker
   URLs will 404 in production.
3. **CSS Modules + `var(--token)` resolution** — every `*.module.css` file
   reads color tokens (`--ink`, `--paper`, `--green`, etc.) from `:root`,
   which are only defined in `src/index.css`. If `index.css` isn't imported
   before any component renders (it's imported in `main.jsx`), everything
   will render unstyled/transparent. Not a build error — a silent visual
   bug — so actually load the dev server and eyeball it, don't just trust
   a clean build.
4. **Service worker path in `serviceWorkerRegistration.js`** — uses
   `import.meta.env.BASE_URL` to build the SW URL so it matches whatever
   `base` ends up being. If `base` changes (see #2), no other file needs
   touching, but verify `public/service-worker.js` is actually being
   copied into `dist/` at the right path by Vite's default static asset
   handling.

## What you can NOT do here, even if asked

- **Push directly to `main`** in a way that triggers an unreviewed deploy.
  The GitHub Actions workflow (`.github/workflows/deploy.yml`) auto-deploys
  to GitHub Pages on every push to `main`. Open a PR or ask the user to
  push themselves for anything you're not fully confident in.
- **Enable GitHub Pages on the repo itself** — that's a one-time manual step
  in the repo's Settings → Pages, choosing "GitHub Actions" as the source.
  Tell the user to do this; you cannot do it from the repo contents.
- **Obtain or handle any real secret values.** There currently are none —
  this app has no API keys, no backend, no auth — so if a future feature
  ever needs one, stop and tell the user to add it as a repo secret
  themselves rather than inventing or requesting the value directly.

## Architecture

```
public/
  words.json          Hebrew word bank, fetched at runtime by useWordBank.
                       Network-first in the service worker so updates to this
                       file propagate quickly when online.
  words-en.json        English word bank, same {word, common} shape. The
                       service worker's network-first rule matches both via
                       WORD_BANK_RE, so a third language needs no SW change.
  manifest.json        PWA manifest.
  service-worker.js    Hand-written (not Workbox) — cache-first for the app
                       shell/assets, network-first for words.json specifically.
  icons/                Generated via generate_icons.py (kept in repo root,
                       not part of the build — a one-off asset script).

src/
  components/           One component per file, CSS Modules alongside each
                       (Foo.jsx + Foo.module.css). No inline styles.
  hooks/                 All business logic lives here, not in components:
    useGameEngine.js     Owns all game truth (guesses, phase, win/loss).
                        Deliberately animation-unaware — see below.
    useWordBank.js       Loads words.json once, exposes pickRandomWord /
                        isValidWord. normalizeWord() handles ך/ם/ן/ף/ץ.
    useStats.js          Reads/writes localStorage only. Never touches
                        game logic.
    useKeyboardInput.js  Physical keyboard only. The on-screen <Keyboard/>
                        calls the same callback props directly — there's
                        intentionally no shared dispatcher, since both
                        input sources already converge on the same three
                        callbacks (onLetter/onBackspace/onEnter) passed
                        down from App.jsx.
  utils/
    evaluateGuess.js     Pure function, the actual green/yellow/gray
                        algorithm (two-pass, repeated-letter-safe). Has
                        no React dependency — this is the one file most
                        worth unit-testing if tests get added later.
    normalizeHebrew.js   Final-letter normalization (ך→כ etc.) for
                        comparison only; display always uses the raw
                        typed/stored letter.
  config/constants.js   WORD_LENGTH, MAX_GUESSES, storage keys. Single source
                        of truth — nothing hardcodes "5" or "6" outside here.
  config/languages.js   Per-language config: dir, locale, word bank file,
                        keyboard layout, accepted letters, defaultCommonOnly.
                        Adding a language = one entry here + one strings table.
  config/strings.js     UI copy per language. Values are strings or functions
                        (for interpolation); components only ever call
                        t("key", ...args) — never concatenate sentences.
```

### Bilingual (Hebrew / English)

`useLanguage` owns the active language, persists it to localStorage, and syncs
`document.documentElement.lang`/`dir` + `document.title`. `index.html` has a
tiny inline script that pre-applies a stored `en` before first paint, so an
English player never sees a frame of RTL. `t` and `langCode` are passed down as
explicit props (no context) — consistent with how the rest of the app already
threads callbacks from `App.jsx`.

Direction rules, which are easy to get wrong:
- **Board rows use a plain `flex-direction: row`** and inherit the document
  `dir`. Inside `dir="rtl"` that already fills right-to-left. An explicit
  `row-reverse` here double-flips RTL back into LTR — that was a real bug.
- **Keyboard rows are pinned `direction: ltr`.** Both a physical Hebrew
  keyboard and QWERTY are read left-to-right (Hebrew's top row starts with ק on
  the left), so key order must *not* follow `dir`.

Comparison normalization is language-aware: `normalizeWord(word, langCode)`
does final-letter folding for Hebrew and case-folding for English. English
words are stored lowercase in the bank but played on an uppercase keyboard;
`canonicalizeLetter` upper-cases physical keypresses so both input paths agree.

Switching language abandons the current round (the target word belongs to the
other bank) and redraws once the new bank loads — `App.jsx` clears `targetWord`
to `null` and the existing "pick a word" effect handles the rest.

**`defaultCommonOnly` differs per language on purpose.** The English bank is
deliberately broad (~1,550) so typed guesses are rarely rejected, but most of
that breadth is unfair as an *answer*, so English draws from the ~595-word
common tier by default. Hebrew's bank is almost entirely everyday vocabulary,
so it still draws from the whole bank. Don't "unify" these without asking.

### Event-channel pattern (animation)

`useGameEngine` never triggers animation directly. It writes one field,
`lastEvent = { kind, payload, nonce }`, where `nonce` is a monotonic counter.
`App.jsx` watches `lastEvent` in a `useEffect` keyed on the whole object
(not on `nonce` alone, since React needs the object identity to change) and
reacts to `kind` — currently just `invalid-length` / `invalid-word` to
trigger the row-shake. `win` / `lose` / `guess-submitted` events are emitted
but not yet consumed by anything animation-specific beyond the tile flip,
which is pure CSS keyed off `status` prop changes on `<Tile/>`, not off the
event channel at all. If future animation work wants to react to `win`
specifically (confetti, etc.), add it to that same effect — don't give
`useGameEngine` a new callback prop for it.

## Intentional decisions — do not revert without asking

- **No Firebase, no Netlify, no auth.** Explicitly decided in the approved
  spec: this is a local pass-and-play game with no user accounts and no
  data that needs to leave the device. Don't add a backend "for sync"
  without checking with the user first — it's a deliberate scope cut, not
  an oversight.
- **Hebrew word bank is 397 words, not the ~4,000 originally scoped.** The spec
  promised ~4,000 curated Hebrew 5-letter words; the build environment had
  no network access and no local Hebrew dictionary/corpus to draw from, so
  every candidate word had to be manually typed and length-validated. Only
  ~410 survived validation as genuine, correctly-spelled 5-letter words.
  The user was told this directly mid-build and chose to proceed with 410
  rather than wait for a larger hand-curated batch or supply their own word
  list. That dropped to 397 at the first real build: 20 entries carrying a
  final letter in a non-final position (`אבןות`, `דרךים` — the exact
  naive-concatenation artifacts described below, which had been recorded as
  discarded but were still shipping) were removed, and 7 correctly-spelled
  replacements added. **If asked to "finish" or "expand" the word bank later, that's real,
  wanted follow-up work — not a bug to silently work around.** Any
  expansion must go through the same validation discipline: every candidate
  checked for exact 5-letter length using `HEBREW_LETTERS` set membership
  (see `build_words.py` at repo root, kept for reuse) before being added to
  `public/words.json`. Do not auto-generate plural/conjugated forms via
  naive string concatenation — an earlier attempt at that produced invalid
  words (e.g. appending "ות" to a root ending in ן without correcting to
  the medial form) and was discarded. Real morphology is not just
  concatenation; validate against a real source (dictionary, corpus, or the
  user's own list) rather than generating and hoping.
- **English bank (~1,556 words) is generated by `build_words_en.cjs` at repo
  root**, kept for reuse the same way `build_words.py` is. It applies the same
  discipline: every candidate is checked for exact 5-letter length and a-z
  membership, duplicates dropped, and anything rejected is *printed* rather
  than silently swallowed (that report is how 15 bad candidates were caught).
  It is `.cjs`, not `.js`, because `package.json` sets `"type": "module"`.
  Regenerate with `node build_words_en.cjs public/words-en.json`.
- **Final Hebrew letters (ך/ם/ן/ף/ץ) normalize to their regular form for
  guess comparison only**, per explicit user approval in the spec. Display
  still shows whatever was actually typed/stored — only `evaluateGuess`
  and `isValidWord` go through `normalizeWord()`.
- **No niqqud (vowel points) anywhere** — also explicit spec approval.
- **`useKeyboardInput` ignores physical keydown events when focus is in an
  `<input>`/`<textarea>`** (see the WordPicker's manual-entry field) so
  physical typing there doesn't double-fire into the game engine. If a new
  text input is ever added anywhere in the app, it needs the same guard or
  this check should be generalized.

## Commands reference

```
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

## Deployment model

Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) runs
`npm ci && npm run build` → uploads `dist/` as a Pages artifact → deploys.
Fully automatic once Pages is enabled on the repo (one-time manual step,
see above). No environment variables, no secrets, no manual deploy steps
beyond that initial Pages setup.
