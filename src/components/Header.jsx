import styles from "./Header.module.css";

export default function Header({ onMenuClick, onNewGameClick }) {
  return (
    <header className={styles.header}>
      <button
        className={styles.iconBtn}
        onClick={onMenuClick}
        aria-label="פתח תפריט"
        type="button"
      >
        ☰
      </button>
      <h1 className={styles.title}>וורדעל</h1>
      <button
        className={styles.iconBtn}
        onClick={onNewGameClick}
        aria-label="סבב חדש"
        type="button"
      >
        ↻
      </button>
    </header>
  );
}
