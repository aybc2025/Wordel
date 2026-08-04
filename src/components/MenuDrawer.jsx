import { LANGUAGES } from "../config/languages";
import styles from "./MenuDrawer.module.css";

export default function MenuDrawer({
  open,
  onClose,
  totalCount,
  commonCount,
  commonOnly,
  onToggleCommonOnly,
  strictWordBank,
  onToggleStrictWordBank,
  stats,
  onResetStats,
  lang,
  onChangeLang,
  locale,
  t,
}) {
  if (!open) return null;

  const winPct =
    stats.totalRounds > 0 ? Math.round((stats.wins / stats.totalRounds) * 100) : 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label={t("closeMenu")}
          >
            ✕
          </button>
          <h2 className={styles.drawerTitle}>{t("menuTitle")}</h2>
          <span />
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("languageSection")}</h3>
          <div className={styles.toggleRow}>
            {Object.values(LANGUAGES).map((entry) => (
              <button
                key={entry.code}
                className={[
                  styles.toggleOpt,
                  lang === entry.code ? styles.active : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onChangeLang(entry.code)}
                type="button"
                lang={entry.code}
                aria-pressed={lang === entry.code}
              >
                {entry.label}
              </button>
            ))}
          </div>
          <p className={styles.sectionText}>{t("languageHint")}</p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("guessRuleSection")}</h3>
          <div className={styles.toggleRow}>
            <button
              className={[styles.toggleOpt, !strictWordBank ? styles.active : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onToggleStrictWordBank(false)}
              type="button"
              aria-pressed={!strictWordBank}
            >
              {t("guessRuleAny")}
            </button>
            <button
              className={[styles.toggleOpt, strictWordBank ? styles.active : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onToggleStrictWordBank(true)}
              type="button"
              aria-pressed={strictWordBank}
            >
              {t("guessRuleBankOnly")}
            </button>
          </div>
          <p className={styles.sectionText}>{t("guessRuleHint")}</p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("wordBankSection")}</h3>
          <p className={styles.sectionText}>
            {t(
              "wordBankText",
              totalCount.toLocaleString(locale),
              commonCount.toLocaleString(locale)
            )}
          </p>
          <div className={styles.toggleRow}>
            <button
              className={[styles.toggleOpt, !commonOnly ? styles.active : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onToggleCommonOnly(false)}
              type="button"
            >
              {t("wholeBank")}
            </button>
            <button
              className={[styles.toggleOpt, commonOnly ? styles.active : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onToggleCommonOnly(true)}
              type="button"
            >
              {t("commonWords")}
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("statsSection")}</h3>
          <p className={styles.sectionText}>
            {t("statsText", stats.totalRounds, winPct, stats.currentStreak)}
          </p>
          <button className={styles.resetBtn} onClick={onResetStats} type="button">
            {t("resetStats")}
          </button>
        </section>
      </div>
    </div>
  );
}
