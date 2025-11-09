import { useTranslation } from "react-i18next";
import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("AdminHostBadge", {
  slot1: "mb-6 flex justify-center",
  slot2: "glass-effect rounded-2xl px-6 py-3 border-2 border-accent-500 inline-flex items-center gap-3 animate-glow",
  slot3: "text-3xl animate-bounce-slow",
  slot4: "text-center",
  slot5: "font-display text-accent-400 uppercase text-base sm:text-lg tracking-wider block",
  slot6: "font-mono text-accent-500 text-xs uppercase tracking-wider",
});


export default function AdminHostBadge() {
  const { t } = useTranslation();

  return (
    <div {...styles.slot1}>
      <div {...styles.slot2}>
        <span {...styles.slot3} aria-hidden="true">
          👑
        </span>
        <div {...styles.slot4}>
          <span {...styles.slot5}>
            {t("game.hostMode")}
          </span>
          <span {...styles.slot6}>
            {t("game.screenShareHint")}
          </span>
        </div>
      </div>
    </div>
  );
}
