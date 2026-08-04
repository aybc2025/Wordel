import styles from "./Toast.module.css";

/**
 * Transient message shown above the board — currently the reason a guess was
 * rejected. Without this the row just shakes, which doesn't tell the player
 * whether the word was too short or simply missing from the word bank.
 */
export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      {message}
    </div>
  );
}
