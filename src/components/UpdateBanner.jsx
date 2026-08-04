import styles from "./UpdateBanner.module.css";

export default function UpdateBanner({ visible, onUpdate, t }) {
  if (!visible) return null;

  return (
    <div className={styles.banner}>
      <span>{t("updateAvailable")}</span>
      <button className={styles.btn} onClick={onUpdate} type="button">
        {t("refresh")}
      </button>
    </div>
  );
}
