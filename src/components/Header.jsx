import styles from "./Header.module.css";

export default function Header({ onMenuClick, onNewGameClick, t }) {
  return (
    <header className={styles.header}>
      <button
        className={styles.iconBtn}
        onClick={onMenuClick}
        aria-label={t("openMenu")}
        type="button"
      >
        ☰
      </button>
      <h1 className={styles.title}>{t("appTitle")}</h1>
      <button
        className={styles.iconBtn}
        onClick={onNewGameClick}
        aria-label={t("newRound")}
        type="button"
      >
        ↻
      </button>
    </header>
  );
}
