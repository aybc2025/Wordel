import styles from "./Tile.module.css";

/**
 * A single letter tile. When `status` is provided (submitted row), it
 * plays a flip-reveal animation with a per-tile stagger delay controlled
 * by the parent via `delayMs`. Empty/in-progress tiles render plainly.
 */
export default function Tile({ letter, status, delayMs = 0, isCurrentRow }) {
  const hasResult = Boolean(status);

  return (
    <div
      className={[
        styles.tile,
        hasResult ? styles[status] : "",
        letter && !hasResult ? styles.filled : "",
        isCurrentRow && letter ? styles.pop : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={hasResult ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      <span className={hasResult ? styles.letterFlip : ""}>{letter}</span>
    </div>
  );
}
