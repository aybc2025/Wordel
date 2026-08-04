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
  service-worker.js    Hand-written (not Workbox). Routing rules, in order:
                       navigations/index.html and the word banks are
                       NETWORK-FIRST (cache is the offline fallback);
                       /assets/*.[hash].{js,css} and everything else is
                       cache-first. See the caching note below before
                       changing any of this.
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
reacts to `kind` — currently `invalid-length` / `invalid-word`, which trigger
both the row-shake and the `<Toast/>` message explaining *why* the guess
bounced (a bare shake reads as "the app is broken", which is exactly how it was
reported). `win` / `lose` / `guess-submitted` events are emitted
but not yet consumed by anything animation-specific beyond the tile flip,
which is pure CSS keyed off `status` prop changes on `<Tile/>`, not off the
event channel at all. If future animation work wants to react to `win`
specifically (confetti, etc.), add it to that same effect — don't give
`useGameEngine` a new callback prop for it.

### Service worker caching — the shell must never be cache-first

`index.html` is the one file that must always be fetched network-first. Vite
emits content-hashed bundles (`index-<hash>.js`) and deletes the old ones on
each deploy, so a cached `index.html` points at filenames that no longer exist
— the module 404s and the app is a blank page until the user clears storage.
This actually shipped and broke the live site: the symptom was
`A ServiceWorker intercepted the request and encountered an unexpected error`
naming an asset hash from a *previous* deploy. Hashed assets under `/assets/`
are the opposite case — immutable per URL, so cache-first is correct there.

Two supporting rules, both learned the hard way:
- Every `respondWith` branch needs a `.catch`. A rejected promise inside the
  fetch handler surfaces to the page as that opaque "unexpected error" instead
  of a normal network failure.
- Precaching uses individual `cache.put`s wrapped in `Promise.allSettled`, not
  `cache.addAll`. `addAll` is atomic, so one missing file fails the whole
  install and leaves the *previous* (possibly broken) worker in control
  indefinitely — exactly when you most need the new one to take over.

`registerServiceWorker` checks `document.readyState` before falling back to a
`load` listener. It's called from React's render, which under React 18's
concurrent scheduling can run after `load` has already fired; the original
listener-only version then never fired and the worker silently never
registered at all.

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
  replacements added. It then grew to 502 via `build_words_he_extra.cjs` (repo
  root, kept for reuse), after a player hit the shake on ordinary words —
  `אנשים` and `דגלים` were both missing.

  It is now **1,731 words, rebuilt against a real corpus** (see below), which
  is what finally made the bank trustworthy rather than merely well-formed.

### The corpus, and why "well-formed" was never enough

Until the user supplied a Hebrew Wikipedia word-frequency list (~656k rows,
546k pure-Hebrew tokens), there was no way to check whether a bank entry was a
*real word* — only whether it was spelled plausibly. That gap shipped: `חיהים`
(a naive חיה+ים) is five Hebrew letters with no misplaced final letter, so it
passed every check, and a player got it as an answer. Cross-checking the 502
entries against the corpus found **17 fabricated words**, all the same
ות/ים concatenation pattern: `חיהים חיהות שעהים שעהות דקהים דקהות עלהות ביתות
סלעות פרחות רגעות רוחים ירחות גזעות עפרים פריות`. (`נשנוש` was also dropped —
a real colloquial word, just absent from Wikipedia.)

Regenerating the bank is a two-stage pipeline:

1. `tools/build_he_candidates.py` — needs the source spreadsheet, which is NOT
   in the repo (12 MB). Filters ~93k five-letter tokens down to ~1,485 by
   dropping particle-prefixed forms (`בשנות` = ב+שנות), construct/smichut
   forms (`מלחמת`, `חיילי`), non-standard א spellings (`גרסא`), 2nd-person
   future forms (`תקבלו`), and anything lacking morphological evidence of being
   an ordinary word — proper nouns essentially never take the definite article
   or a plural ending, so `מדריד`/`ראובן`/`ורסאי` score zero and drop out.
   A stoplist catches the frequent names that survive anyway (`ישראל` passes
   only because `ישראלים` exists). Outputs `tools/he_corpus_candidates.json`.
2. `build_words_he_corpus.cjs` — merges those into `public/words.json` and
   drops any existing entry the corpus has never seen. Checks attestation
   against `tools/he_corpus_attested.json` (all 93k tokens), **not** against
   the curated candidate list: a real word is often missing from the curated
   list without being fake, and confusing the two silently deletes ~260 good
   words.

Two traps worth remembering: a word ending in medial **פ** is correct for
loanwords (`סירופ`, `בישופ`) because final ף reads /f/ — only כ/מ/נ/צ are
errors there; and low corpus frequency is not evidence of fakeness (`קרסול`,
`נסעתי` are real but rare in encyclopaedic writing), so only *zero* attestation
justifies removal.

**~1,500 was the honest ceiling, not 2,500.** The user asked for ~2,500 ordinary
words; past roughly 1,500 the filtered corpus is mostly transliterations
(`גואנו`, `ביטלס`), rare verb inflections and residue, so the bank stops there
rather than padding to a number. **If asked to "finish" or "expand" the word bank later, that's real,
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
- **A guess does NOT have to be in the word bank.** The bank is the source of
  *answers*; guesses only have to be well-formed (right length, letters of the
  active language). Real Wordle can validate guesses because it keeps two
  separate lists — a small answer list and a ~13,000-word list of allowed
  guesses. Here there is one list serving both roles, and at a few hundred
  words it rejected far more real words than junk ones; a player hitting the
  shake on `תרחיף` is what surfaced it. The strict behaviour is still
  available as "רק מילים מהמאגר" / "Only words in the bank" in the menu, but it
  is **off by default**. The same rule governs the WordPicker: a player
  choosing the next word for a friend isn't restricted to the bank either.
  If the bank ever grows to a genuine guess-list size, revisit the default.
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
