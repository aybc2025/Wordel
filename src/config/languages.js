// Per-language configuration. Everything that differs between the Hebrew and
// English builds of the game lives here, so adding a third language means
// adding one entry plus a strings table — not touching game logic.
//
// `keyboard` rows are always authored in physical left-to-right order (both a
// Hebrew keyboard and QWERTY are read left-to-right), and Keyboard.module.css
// pins the rows to `direction: ltr` so they render that way in either `dir`.

export const LANGUAGES = {
  he: {
    code: "he",
    dir: "rtl",
    locale: "he",
    // Shown on the language toggle — always in the language it switches to.
    label: "עברית",
    wordsFile: "words.json",
    documentTitle: "וורדעל",
    // Nearly the whole Hebrew bank is everyday vocabulary, so the random draw
    // spans all of it by default (unchanged from the original behaviour).
    defaultCommonOnly: false,
    letters: "אבגדהוזחטיכלמנסעפצקרשתךםןףץ",
    keyboard: [
      ["ק", "ר", "א", "ט", "ו", "ן", "ם", "פ"],
      ["ש", "ד", "ג", "כ", "ע", "י", "ח", "ל", "ך", "ף"],
      ["ENTER", "ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת", "ץ", "BACKSPACE"],
    ],
  },
  en: {
    code: "en",
    dir: "ltr",
    locale: "en",
    label: "English",
    wordsFile: "words-en.json",
    documentTitle: "Wordel",
    // The English bank is intentionally broad so typed guesses are rarely
    // rejected, but most of that breadth is not fair game as an *answer*
    // (FRISK, SLOSH, ...). Draw from the common tier unless the player opts
    // into the whole bank from the menu.
    defaultCommonOnly: true,
    letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    keyboard: [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
    ],
  },
};

export const DEFAULT_LANG = "he";

export function getLanguage(code) {
  return LANGUAGES[code] || LANGUAGES[DEFAULT_LANG];
}

/**
 * Normalizes a letter as typed into the form the game stores and compares.
 * Hebrew keeps whatever was typed (final-form handling happens at comparison
 * time in normalizeWord); English is upper-cased so physical and on-screen
 * input agree with the uppercase keyboard layout.
 */
export function canonicalizeLetter(letter, langCode) {
  return langCode === "en" ? letter.toUpperCase() : letter;
}
