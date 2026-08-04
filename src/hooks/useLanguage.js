import { useState, useEffect, useCallback, useMemo } from "react";
import { getLanguage, DEFAULT_LANG, LANGUAGES } from "../config/languages";
import { makeTranslator } from "../config/strings";
import { LANG_STORAGE_KEY } from "../config/constants";

function readStoredLang() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    return stored && LANGUAGES[stored] ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

/**
 * Owns the active UI language: persists the choice to localStorage and keeps
 * the document's `lang`/`dir` in sync so CSS logical properties and the
 * board's text direction follow automatically.
 *
 * Deliberately does not touch game state — App.jsx decides what a language
 * change means for the current round (it starts a fresh one, since the target
 * word belongs to the previous language's bank).
 */
export function useLanguage() {
  const [lang, setLangState] = useState(readStoredLang);

  const config = useMemo(() => getLanguage(lang), [lang]);
  const t = useMemo(() => makeTranslator(lang), [lang]);

  useEffect(() => {
    document.documentElement.lang = config.code;
    document.documentElement.dir = config.dir;
    document.title = config.documentTitle;
  }, [config]);

  const setLang = useCallback((next) => {
    if (!LANGUAGES[next]) return;
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Non-fatal: the language just won't persist across reloads.
    }
  }, []);

  return { lang, setLang, t, config };
}
