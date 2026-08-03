// Core game configuration — single source of truth for game rules.
export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export const TILE_STATUS = {
  EMPTY: "empty",
  CORRECT: "correct", // green — right letter, right spot
  PRESENT: "present", // ochre — letter exists elsewhere in the word
  ABSENT: "absent", // slate — letter not in the word
};

export const KEY_ROWS = [
  ["ק", "ר", "א", "ט", "ו", "ן", "ם", "פ"],
  ["ש", "ד", "ג", "כ", "ע", "י", "ח", "ל", "ך", "ף"],
  ["ENTER", "ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת", "ץ", "ק", "BACKSPACE"],
];

// Simplified, single-row-per-line keyboard actually used by <Keyboard/>.
// Kept here as the canonical Hebrew QWERTY-equivalent layout.
export const KEYBOARD_LAYOUT = [
  ["ק", "ר", "א", "ט", "ו", "ן", "ם", "פ"],
  ["ש", "ד", "ג", "כ", "ע", "י", "ח", "ל", "ך", "ף"],
  ["ENTER", "ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת", "ץ", "BACKSPACE"],
];

export const STATS_STORAGE_KEY = "wordel:stats";
export const SETTINGS_STORAGE_KEY = "wordel:settings";
