// Comparison-time normalization. Display always shows the letter exactly as
// typed/stored — only evaluateGuess and isValidWord go through here.
//
// Hebrew: final-form letters map to their regular equivalents, per product
// decision (ך→כ, ם→מ, ן→נ, ף→פ, ץ→צ), so a guess matches regardless of which
// form was typed.
// English: case-folded, so the uppercase on-screen keyboard and lowercase
// stored word bank compare equal.
const FINAL_TO_REGULAR = {
  ך: "כ",
  ם: "מ",
  ן: "נ",
  ף: "פ",
  ץ: "צ",
};

/**
 * Normalizes a single letter for comparison purposes.
 * @param {string} letter
 * @param {string} [langCode] - "he" (default) or "en"
 */
export function normalizeLetter(letter, langCode = "he") {
  if (langCode === "en") return letter.toLowerCase();
  return FINAL_TO_REGULAR[letter] || letter;
}

/**
 * Normalizes an entire word for comparison purposes.
 * @param {string} word
 * @param {string} [langCode] - "he" (default) or "en"
 */
export function normalizeWord(word, langCode = "he") {
  if (langCode === "en") return word.toLowerCase();
  return word.split("").map((c) => normalizeLetter(c, langCode)).join("");
}
