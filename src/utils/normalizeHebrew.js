// Maps final-form Hebrew letters to their regular equivalents so that
// guessing works regardless of which form was typed/displayed.
// Per product decision: ך→כ, ם→מ, ן→נ, ף→פ, ץ→צ for comparison purposes only
// (display always shows the letter as originally typed/stored).
const FINAL_TO_REGULAR = {
  ך: "כ",
  ם: "מ",
  ן: "נ",
  ף: "פ",
  ץ: "צ",
};

/**
 * Normalizes a single Hebrew letter for comparison purposes.
 * Final-form letters are mapped to their regular counterparts.
 */
export function normalizeLetter(letter) {
  return FINAL_TO_REGULAR[letter] || letter;
}

/**
 * Normalizes an entire word for comparison purposes.
 */
export function normalizeWord(word) {
  return word
    .split("")
    .map(normalizeLetter)
    .join("");
}
