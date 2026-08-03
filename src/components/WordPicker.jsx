import { useState } from "react";
import { WORD_LENGTH } from "../config/constants";
import styles from "./WordPicker.module.css";

/**
 * Lets the winner choose how the next round's word gets picked:
 * type it manually (validated against the word bank) or draw randomly.
 */
export default function WordPicker({ onConfirm, pickRandomWord, isValidWord }) {
  const [mode, setMode] = useState("manual"); // manual | random
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [commonOnly, setCommonOnly] = useState(false);

  function handleManualSubmit() {
    const trimmed = inputValue.trim();
    if (trimmed.length !== WORD_LENGTH) {
      setError(`המילה חייבת להיות בת ${WORD_LENGTH} אותיות`);
      return;
    }
    if (!isValidWord(trimmed)) {
      setError("המילה לא נמצאת במאגר");
      return;
    }
    onConfirm(trimmed);
  }

  function handleRandomSubmit() {
    const word = pickRandomWord(commonOnly);
    if (!word) {
      setError("מאגר המילים ריק");
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
          אני אקליד מילה
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
          הגרלה אקראית
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
          placeholder="הקלד/י מילה בת 5 אותיות..."
          maxLength={WORD_LENGTH}
          dir="rtl"
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
          רק מילים נפוצות
        </label>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={styles.confirmBtn}
        onClick={mode === "manual" ? handleManualSubmit : handleRandomSubmit}
        type="button"
      >
        התחל/י סבב חדש
      </button>
    </div>
  );
}
