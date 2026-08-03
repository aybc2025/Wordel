import Tile from "./Tile";
import { WORD_LENGTH, MAX_GUESSES } from "../config/constants";
import styles from "./Board.module.css";

/**
 * Renders the full guess grid: submitted rows (with evaluated status),
 * the current in-progress row, and remaining empty rows.
 */
export default function Board({ submittedGuesses, currentInput, shakeRow }) {
  const rows = [];

  // Submitted rows
  submittedGuesses.forEach((evaluated, rowIndex) => {
    rows.push(
      <div className={styles.row} key={`submitted-${rowIndex}`}>
        {evaluated.map((cell, colIndex) => (
          <Tile
            key={colIndex}
            letter={cell.letter}
            status={cell.status}
            delayMs={colIndex * 220}
          />
        ))}
      </div>
    );
  });

  // Current in-progress row
  if (submittedGuesses.length < MAX_GUESSES) {
    const letters = currentInput.split("");
    const isShaking = shakeRow === submittedGuesses.length;
    rows.push(
      <div
        className={[styles.row, isShaking ? styles.shake : ""]
          .filter(Boolean)
          .join(" ")}
        key="current"
      >
        {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => (
          <Tile
            key={colIndex}
            letter={letters[colIndex] || ""}
            isCurrentRow
          />
        ))}
      </div>
    );
  }

  // Remaining empty rows
  const filledCount = submittedGuesses.length + (submittedGuesses.length < MAX_GUESSES ? 1 : 0);
  for (let i = filledCount; i < MAX_GUESSES; i++) {
    rows.push(
      <div className={styles.row} key={`empty-${i}`}>
        {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => (
          <Tile key={colIndex} letter="" />
        ))}
      </div>
    );
  }

  return <div className={styles.board}>{rows}</div>;
}
