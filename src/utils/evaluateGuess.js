import { TILE_STATUS, WORD_LENGTH } from "../config/constants";
import { normalizeWord, normalizeLetter } from "./normalizeHebrew";

/**
 * Evaluates a guess against the target word using standard Wordle rules,
 * with correct handling of repeated letters (two-pass algorithm):
 *   Pass 1: mark exact position matches as CORRECT, consume them from the pool.
 *   Pass 2: for remaining letters, mark PRESENT if the letter is still
 *           available in the remaining pool, else ABSENT.
 *
 * Both guess and target are normalized before comparison, so in Hebrew ך/כ
 * etc. behave identically and in English case is irrelevant.
 *
 * @param {string} guess - the guessed word (raw, as typed)
 * @param {string} target - the target word (raw, as stored in word bank)
 * @param {string} [langCode] - "he" (default) or "en"
 * @returns {{ letter: string, status: string }[]} per-letter result, in order
 */
export function evaluateGuess(guess, target, langCode = "he") {
  const guessLetters = guess.split("");
  const normGuess = normalizeWord(guess, langCode).split("");
  const normTarget = normalizeWord(target, langCode).split("");

  const result = new Array(WORD_LENGTH).fill(null);
  const pool = [...normTarget]; // mutable pool of letters still available to match

  // Pass 1: exact matches
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (normGuess[i] === normTarget[i]) {
      result[i] = TILE_STATUS.CORRECT;
      pool[i] = null; // consume
    }
  }

  // Pass 2: present / absent
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] !== null) continue;
    const idx = pool.indexOf(normGuess[i]);
    if (idx !== -1) {
      result[i] = TILE_STATUS.PRESENT;
      pool[idx] = null; // consume
    } else {
      result[i] = TILE_STATUS.ABSENT;
    }
  }

  return result.map((status, i) => ({ letter: guessLetters[i], status }));
}

/**
 * Merges a new evaluated guess into the running best-known status per key,
 * for keyboard coloring. CORRECT > PRESENT > ABSENT priority (never downgrade).
 *
 * Keyed by normalizeLetter(), not the raw typed letter: evaluateGuess already
 * folds ך/ם/ן/ף/ץ to their base form (כ/מ/נ/פ/צ) before deciding correctness,
 * so a status learned by typing one form must show up on the other form's
 * on-screen key too — otherwise the two keys drift out of sync (e.g. ם lights
 * up green from a guess while מ, the key a player would actually reach for,
 * stays gray). Keyboard.jsx does the matching normalize on lookup.
 */
export function mergeKeyStatuses(existingStatuses, evaluatedGuess, langCode = "he") {
  const priority = {
    [TILE_STATUS.CORRECT]: 3,
    [TILE_STATUS.PRESENT]: 2,
    [TILE_STATUS.ABSENT]: 1,
  };
  const next = { ...existingStatuses };
  for (const { letter, status } of evaluatedGuess) {
    const key = normalizeLetter(letter, langCode);
    const current = next[key];
    if (!current || priority[status] > priority[current]) {
      next[key] = status;
    }
  }
  return next;
}
