import styles from "./UpdateBanner.module.css";

export default function UpdateBanner({ visible, onUpdate }) {
  if (!visible) return null;

  return (
    <div className={styles.banner}>
      <span>גרסה חדשה זמינה</span>
      <button className={styles.btn} onClick={onUpdate} type="button">
        רענן
      </button>
    </div>
  );
}
