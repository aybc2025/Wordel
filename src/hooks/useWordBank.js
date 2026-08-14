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
  // Which langCode `status`/`words` actually belong to. Needed to guard
  // against a real race: when `langCode` changes, this hook's own effect
  // (which resets status/words for the new language) only runs *after* the
  // render commits. On the render in between, this hook would otherwise still
  // report the previous language's "ready" status and word list — and a
  // caller reading that in an effect of its own (App.jsx's word-pick effect)
  // could grab a word from the wrong language's bank. See CLAUDE.md's
  // bilingual section for why that's a hard requirement, not a nice-to-have.
  const [statusLang, setStatusLang] = useState(langCode);

  const wordsFile = getLanguage(langCode).wordsFile;

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setStatusLang(langCode);
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
  }, [wordsFile, langCode]);

  // Computed at render time (not in an effect) so there's no in-between
  // render where a stale status/word-list can leak out as "ready".
  const isCurrent = statusLang === langCode;
  const effectiveStatus = isCurrent ? status : "loading";
  const effectiveWords = isCurrent ? words : [];

  // Lookup set for O(1) validation, normalized so ך/כ (Hebrew) or letter case
  // (English) match either form. Built from effectiveWords so a mismatched
  // (stale-language) render can't validate a guess against the wrong bank.
  const lookupSet = useMemo(() => {
    const set = new Set();
    for (const entry of effectiveWords) {
      set.add(normalizeWord(entry.word, langCode));
    }
    return set;
  }, [effectiveWords, langCode]);

  const commonWords = useMemo(
    () => effectiveWords.filter((w) => w.common),
    [effectiveWords]
  );

  /**
   * Returns a random word (raw, as stored) from the bank.
   * @param {boolean} commonOnly - restrict to the "common" difficulty tier
   */
  const pickRandomWord = useCallback(
    (commonOnly = false) => {
      const pool = commonOnly ? commonWords : effectiveWords;
      if (pool.length === 0) return null;
      const idx = Math.floor(Math.random() * pool.length);
      return pool[idx].word;
    },
    [effectiveWords, commonWords]
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
    status: effectiveStatus,
    totalCount: effectiveWords.length,
    commonCount: commonWords.length,
    pickRandomWord,
    isValidWord,
  };
}
