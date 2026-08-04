// Core game configuration — single source of truth for game rules.
// Anything that varies per language (keyboard layout, valid letters, word
// bank file, UI copy) lives in config/languages.js and config/strings.js.
export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export const TILE_STATUS = {
  EMPTY: "empty",
  CORRECT: "correct", // green — right letter, right spot
  PRESENT: "present", // ochre — letter exists elsewhere in the word
  ABSENT: "absent", // slate — letter not in the word
};

export const STATS_STORAGE_KEY = "wordel:stats";
export const SETTINGS_STORAGE_KEY = "wordel:settings";
export const LANG_STORAGE_KEY = "wordel:lang";
