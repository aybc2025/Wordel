import { useState } from "react";
import { WORD_LENGTH } from "../config/constants";
import { getLanguage, hasOnlyLanguageLetters } from "../config/languages";
import styles from "./WordPicker.module.css";

/**
 * Lets the winner choose how the next round's word gets picked:
 * type it manually (validated against the word bank) or draw randomly.
 */
export default function WordPicker({
  onConfirm,
  pickRandomWord,
  isValidWord,
  strictWordBank,
  langCode,
  t,
}) {
  const [mode, setMode] = useState("manual"); // manual | random
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [commonOnly, setCommonOnly] = useState(false);

  const dir = getLanguage(langCode).dir;

  function handleManualSubmit() {
    const trimmed = inputValue.trim();
    if ([...trimmed].length !== WORD_LENGTH) {
      setError(t("errWrongLength", WORD_LENGTH));
      return;
    }
    // A hand-picked word is chosen by a player for the next player, so it only
    // has to be well-formed — the bank is the source of *random* words, not a
    // whitelist of what a person is allowed to choose.
    if (!hasOnlyLanguageLetters(trimmed, langCode)) {
      setError(t("errBadLetters"));
      return;
    }
    if (strictWordBank && !isValidWord(trimmed)) {
      setError(t("errNotInBank"));
      return;
    }
    // Store in the same form the word bank uses, so the reveal and the
    // evaluated tiles stay consistent regardless of how it was typed.
    onConfirm(langCode === "en" ? trimmed.toLowerCase() : trimmed);
  }

  function handleRandomSubmit() {
    const word = pickRandomWord(commonOnly);
    if (!word) {
      setError(t("errBankEmpty"));
      return;
    }
    onConfirm(word);
  }

  return (
    <div className={styles.picker}>
      <div className={styles.toggleRow}>
        <button
          className={[styles.toggleOpt, mode === "manual" ? styles.active : ""]
            .filter(Boolean)
            .join(" ")}
          onClick={() => {
            setMode("manual");
            setError("");
          }}
          type="button"
        >
          {t("pickerManual")}
        </button>
        <button
          className={[styles.toggleOpt, mode === "random" ? styles.active : ""]
            .filter(Boolean)
            .join(" ")}
          onClick={() => {
            setMode("random");
            setError("");
          }}
          type="button"
        >
          {t("pickerRandom")}
        </button>
      </div>

      {mode === "manual" ? (
        <input
          className={styles.input}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError("");
          }}
          placeholder={t("pickerPlaceholder", WORD_LENGTH)}
          maxLength={WORD_LENGTH}
          dir={dir}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      ) : (
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={commonOnly}
            onChange={(e) => setCommonOnly(e.target.checked)}
          />
          {t("pickerCommonOnly")}
        </label>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={styles.confirmBtn}
        onClick={mode === "manual" ? handleManualSubmit : handleRandomSubmit}
        type="button"
      >
        {t("pickerConfirm")}
      </button>
    </div>
  );
}
