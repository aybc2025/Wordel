import { TILE_STATUS } from "../config/constants";
import { getLanguage } from "../config/languages";
import { normalizeLetter } from "../utils/normalizeHebrew";
import styles from "./Keyboard.module.css";

/**
 * On-screen keyboard for the active language. Keys are colored by their
 * best-known status across all submitted guesses (keyStatuses from the game
 * engine). Row order is authored left-to-right and pinned that way in CSS —
 * see Keyboard.module.css.
 *
 * keyStatuses is keyed by normalizeLetter() (see evaluateGuess.js's
 * mergeKeyStatuses), so the lookup below normalizes each button's own label
 * the same way — otherwise a final-form key (ם/ך/ן/ף/ץ) and its base-form
 * counterpart (מ/כ/נ/פ/צ) would show independent, inconsistent colors even
 * though they're the same letter for guess purposes.
 */
export default function Keyboard({
  onLetter,
  onBackspace,
  onEnter,
  keyStatuses,
  disabled,
  langCode,
  t,
}) {
  const layout = getLanguage(langCode).keyboard;

  return (
    <div className={styles.keyboard}>
      {layout.map((row, rowIndex) => (
        <div className={styles.row} key={rowIndex}>
          {row.map((key) => {
            if (key === "ENTER") {
              return (
                <button
                  key={key}
                  className={[styles.key, styles.wide].join(" ")}
                  onClick={onEnter}
                  disabled={disabled}
                  aria-label={t("submitGuess")}
                  type="button"
                >
                  {t("enterKey")}
                </button>
              );
            }
            if (key === "BACKSPACE") {
              return (
                <button
                  key={key}
                  className={[styles.key, styles.wide].join(" ")}
                  onClick={onBackspace}
                  disabled={disabled}
                  aria-label={t("deleteLetter")}
                  type="button"
                >
                  ⌫
                </button>
              );
            }
            const status = keyStatuses[normalizeLetter(key, langCode)];
            return (
              <button
                key={key}
                className={[
                  styles.key,
                  status === TILE_STATUS.CORRECT ? styles.correct : "",
                  status === TILE_STATUS.PRESENT ? styles.present : "",
                  status === TILE_STATUS.ABSENT ? styles.absent : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onLetter(key)}
                disabled={disabled}
                type="button"
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
