import { useState, useEffect, useCallback, useMemo } from "react";
import { normalizeWord } from "../utils/normalizeHebrew";
import { getLanguage } from "../config/languages";

/**
 * Loads the static word bank for the active language (public/words.json for
 * Hebrew, public/words-en.json for English), and exposes helpers to pick a
 * random word and validate a typed word against the bank.
 *
 * Refetches when the language changes, resetting to "loading" first so callers
 * can tell that the previous language's words are no longer valid.
 */
export function useWordBank(langCode = "he") {
  const [words, setWords] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  const wordsFile = getLanguage(langCode).wordsFile;

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setWords([]);

    fetch(`${import.meta.env.BASE_URL}${wordsFile}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load word bank: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setWords(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [wordsFile]);

  // Lookup set for O(1) validation, normalized so ך/כ (Hebrew) or letter case
  // (English) match either form.
  const lookupSet = useMemo(() => {
    const set = new Set();
    for (const entry of words) {
      set.add(normalizeWord(entry.word, langCode));
    }
    return set;
  }, [words, langCode]);

  const commonWords = useMemo(() => words.filter((w) => w.common), [words]);

  /**
   * Returns a random word (raw, as stored) from the bank.
   * @param {boolean} commonOnly - restrict to the "common" difficulty tier
   */
  const pickRandomWord = useCallback(
    (commonOnly = false) => {
      const pool = commonOnly ? commonWords : words;
      if (pool.length === 0) return null;
      const idx = Math.floor(Math.random() * pool.length);
      return pool[idx].word;
    },
    [words, commonWords]
  );

  /**
   * Validates whether a typed word exists in the bank (any difficulty tier).
   */
  const isValidWord = useCallback(
    (word) => {
      if (word.length === 0) return false;
      return lookupSet.has(normalizeWord(word, langCode));
    },
    [lookupSet, langCode]
  );

  return {
    status,
    totalCount: words.length,
    commonCount: commonWords.length,
    pickRandomWord,
    isValidWord,
  };
}
