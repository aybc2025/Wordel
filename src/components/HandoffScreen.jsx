import WordPicker from "./WordPicker";
import styles from "./HandoffScreen.module.css";

/**
 * The pass-and-play handoff moment: shown after a round ends (win or loss).
 * Announces the result, reveals the word, then lets the winner (or whoever's
 * turn it is) queue up the next round's word before handing the device to the
 * next player.
 */
export default function HandoffScreen({
  gamePhase,
  targetWord,
  guessCount,
  onStartNewRound,
  onBackToMenu,
  pickRandomWord,
  isValidWord,
  strictWordBank,
  langCode,
  t,
}) {
  const won = gamePhase === "won";

  return (
    <div className={styles.handoff}>
      <div className={styles.medal}>{won ? "🏆" : "😅"}</div>
      <h2 className={styles.heading}>
        {won ? t("wonHeading", guessCount) : t("lostHeading")}
      </h2>
      <p className={styles.subtext}>
        {t("theWordWas")} <b className={styles.word}>{targetWord}</b>.{" "}
        {won ? t("wonSubtext") : t("lostSubtext")}
      </p>

      <WordPicker
        onConfirm={onStartNewRound}
        pickRandomWord={pickRandomWord}
        isValidWord={isValidWord}
        strictWordBank={strictWordBank}
        langCode={langCode}
        t={t}
      />

      <button className={styles.secondaryBtn} onClick={onBackToMenu} type="button">
        {t("backToMenu")}
      </button>
    </div>
  );
}
