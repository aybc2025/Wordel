import styles from "./MenuDrawer.module.css";

export default function MenuDrawer({
  open,
  onClose,
  totalCount,
  commonCount,
  commonOnly,
  onToggleCommonOnly,
  stats,
  onResetStats,
}) {
  if (!open) return null;

  const winPct =
    stats.totalRounds > 0 ? Math.round((stats.wins / stats.totalRounds) * 100) : 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="סגור תפריט">
            ✕
          </button>
          <h2 className={styles.drawerTitle}>תפריט</h2>
          <span />
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>מאגר המילים</h3>
          <p className={styles.sectionText}>
            {totalCount.toLocaleString("he")} מילים בנות 5 אותיות במאגר, מתוכן{" "}
            {commonCount.toLocaleString("he")} מסומנות כנפוצות. אפשר לצמצם את
            ההגרלה האקראית למילים נפוצות בלבד:
          </p>
          <div className={styles.toggleRow}>
            <button
              className={[styles.toggleOpt, !commonOnly ? styles.active : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onToggleCommonOnly(false)}
              type="button"
            >
              כל המאגר
            </button>
            <button
              className={[styles.toggleOpt, commonOnly ? styles.active : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onToggleCommonOnly(true)}
              type="button"
            >
              מילים נפוצות
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>סטטיסטיקות מכשיר</h3>
          <p className={styles.sectionText}>
            סה"כ סבבים: {stats.totalRounds} · אחוז ניצחון: {winPct}% · רצף
            נוכחי: {stats.currentStreak}
          </p>
          <button className={styles.resetBtn} onClick={onResetStats} type="button">
            אפס סטטיסטיקות
          </button>
        </section>
      </div>
    </div>
  );
}
