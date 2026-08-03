import WordPicker from "./WordPicker";
import styles from "./HandoffScreen.module.css";

/**
 * The pass-and-play handoff moment: shown after a round ends (win or loss).
 * Announces the result, reveals the word if lost, then lets the winner
 * (or whoever's turn it is) queue up the next round's word before handing
 * the device to the next player.
 */
export default function HandoffScreen({
  gamePhase,
  targetWord,
  guessCount,
  onStartNewRound,
  onBackToMenu,
  pickRandomWord,
  isValidWord,
}) {
  const won = gamePhase === "won";

  return (
    <div className={styles.handoff}>
      <div className={styles.medal}>{won ? "🏆" : "😅"}</div>
      <h2 className={styles.heading}>
        {won ? `ניצחת! ניחשת ב-${guessCount} נסיונות` : "הפעם לא הצליח"}
      </h2>
      <p className={styles.subtext}>
        {won ? (
          <>
            המילה הייתה <b className={styles.word}>{targetWord}</b>. עכשיו
            תורך לבחור את המילה הבאה — תעביר/י את הטלפון הלאה בלי להציץ 😉
          </>
        ) : (
          <>
            המילה הייתה <b className={styles.word}>{targetWord}</b>. בחר/י
            מילה חדשה כדי לנסות שוב, ותעביר/י את הטלפון הלאה בלי להציץ 😉
          </>
        )}
      </p>

      <WordPicker
        onConfirm={onStartNewRound}
        pickRandomWord={pickRandomWord}
        isValidWord={isValidWord}
      />

      <button className={styles.secondaryBtn} onClick={onBackToMenu} type="button">
        חזרה לתפריט
      </button>
    </div>
  );
}
