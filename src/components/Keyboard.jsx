import { KEYBOARD_LAYOUT, TILE_STATUS } from "../config/constants";
import styles from "./Keyboard.module.css";

/**
 * On-screen Hebrew keyboard. Keys are colored by their best-known status
 * across all submitted guesses (keyStatuses from the game engine).
 */
export default function Keyboard({ onLetter, onBackspace, onEnter, keyStatuses, disabled }) {
  return (
    <div className={styles.keyboard}>
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div className={styles.row} key={rowIndex}>
          {row.map((key) => {
            if (key === "ENTER") {
              return (
                <button
                  key={key}
                  className={[styles.key, styles.wide].join(" ")}
                  onClick={onEnter}
                  disabled={disabled}
                  aria-label="שלח ניחוש"
                  type="button"
                >
                  אישור
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
                  aria-label="מחק אות"
                  type="button"
                >
                  ⌫
                </button>
              );
            }
            const status = keyStatuses[key];
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
