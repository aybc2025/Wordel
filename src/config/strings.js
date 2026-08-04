// UI string tables. Values are either plain strings or functions taking the
// interpolated values, so callers always go through the same t("key", vals)
// surface and no component has to build sentences by concatenation.

export const STRINGS = {
  he: {
    appTitle: "וורדעל",

    loading: "טוען מאגר מילים...",
    loadError: "שגיאה בטעינת מאגר המילים. נסה/י לרענן את הדף.",

    openMenu: "פתח תפריט",
    closeMenu: "סגור תפריט",
    newRound: "סבב חדש",
    menuTitle: "תפריט",

    submitGuess: "שלח ניחוש",
    deleteLetter: "מחק אות",
    enterKey: "אישור",

    updateAvailable: "גרסה חדשה זמינה",
    refresh: "רענן",

    wonHeading: (n) => `ניצחת! ניחשת ב-${n} נסיונות`,
    lostHeading: "הפעם לא הצליח",
    wonSubtext: "עכשיו תורך לבחור את המילה הבאה — תעביר/י את הטלפון הלאה בלי להציץ 😉",
    lostSubtext: "בחר/י מילה חדשה כדי לנסות שוב, ותעביר/י את הטלפון הלאה בלי להציץ 😉",
    theWordWas: "המילה הייתה",
    backToMenu: "חזרה לתפריט",

    pickerManual: "אני אקליד מילה",
    pickerRandom: "הגרלה אקראית",
    pickerPlaceholder: (n) => `הקלד/י מילה בת ${n} אותיות...`,
    pickerCommonOnly: "רק מילים נפוצות",
    pickerConfirm: "התחל/י סבב חדש",
    errWrongLength: (n) => `המילה חייבת להיות בת ${n} אותיות`,
    errNotInBank: "המילה לא נמצאת במאגר",
    errBankEmpty: "מאגר המילים ריק",

    languageSection: "שפה",
    languageHint: "החלפת שפה מתחילה סבב חדש עם מאגר המילים של אותה שפה.",

    guessRuleSection: "בדיקת ניחושים",
    guessRuleHint:
      "המאגר קטן, ולכן דרישה שכל ניחוש יופיע בו דוחה הרבה מילים אמיתיות. כברירת מחדל מתקבלת כל מילה בת 5 אותיות.",
    guessRuleAny: "כל מילה בת 5 אותיות",
    guessRuleBankOnly: "רק מילים מהמאגר",
    errBadLetters: "אפשר להשתמש רק באותיות עבריות",

    wordBankSection: "מאגר המילים",
    wordBankText: (total, common) =>
      `${total} מילים בנות 5 אותיות במאגר, מתוכן ${common} מסומנות כנפוצות. אפשר לצמצם את ההגרלה האקראית למילים נפוצות בלבד:`,
    wholeBank: "כל המאגר",
    commonWords: "מילים נפוצות",

    statsSection: "סטטיסטיקות מכשיר",
    statsText: (rounds, pct, streak) =>
      `סה"כ סבבים: ${rounds} · אחוז ניצחון: ${pct}% · רצף נוכחי: ${streak}`,
    resetStats: "אפס סטטיסטיקות",
  },

  en: {
    appTitle: "Wordel",

    loading: "Loading word bank...",
    loadError: "Couldn't load the word bank. Try refreshing the page.",

    openMenu: "Open menu",
    closeMenu: "Close menu",
    newRound: "New round",
    menuTitle: "Menu",

    submitGuess: "Submit guess",
    deleteLetter: "Delete letter",
    enterKey: "Enter",

    updateAvailable: "A new version is available",
    refresh: "Refresh",

    wonHeading: (n) => `You got it! Solved in ${n} ${n === 1 ? "guess" : "guesses"}`,
    lostHeading: "Not this time",
    wonSubtext: "Now pick the next word and pass the device on — no peeking 😉",
    lostSubtext: "Pick a new word to try again, then pass the device on — no peeking 😉",
    theWordWas: "The word was",
    backToMenu: "Back to menu",

    pickerManual: "I'll type a word",
    pickerRandom: "Draw at random",
    pickerPlaceholder: (n) => `Type a ${n}-letter word...`,
    pickerCommonOnly: "Common words only",
    pickerConfirm: "Start new round",
    errWrongLength: (n) => `The word must be ${n} letters long`,
    errNotInBank: "That word isn't in the word bank",
    errBankEmpty: "The word bank is empty",

    languageSection: "Language",
    languageHint: "Switching language starts a new round using that language's word bank.",

    guessRuleSection: "Guess checking",
    guessRuleHint:
      "The bank is small, so requiring every guess to appear in it rejects a lot of real words. By default any 5-letter word is accepted.",
    guessRuleAny: "Any 5-letter word",
    guessRuleBankOnly: "Only words in the bank",
    errBadLetters: "Only English letters can be used",

    wordBankSection: "Word bank",
    wordBankText: (total, common) =>
      `${total} five-letter words in the bank, ${common} of them marked common. You can limit the random draw to common words only:`,
    wholeBank: "Whole bank",
    commonWords: "Common words",

    statsSection: "Device stats",
    statsText: (rounds, pct, streak) =>
      `Rounds: ${rounds} · Win rate: ${pct}% · Current streak: ${streak}`,
    resetStats: "Reset stats",
  },
};

/**
 * Builds a translate function bound to one language. Values that are
 * functions in the table are called with the supplied args.
 */
export function makeTranslator(langCode) {
  const table = STRINGS[langCode] || STRINGS.he;
  return function t(key, ...args) {
    const value = table[key];
    if (value === undefined) return key; // surfaces missing keys instead of crashing
    return typeof value === "function" ? value(...args) : value;
  };
}
