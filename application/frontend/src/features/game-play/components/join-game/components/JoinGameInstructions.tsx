import { useTranslation } from "react-i18next";

const INSTRUCTIONS_WRAPPER_CLASSES =
  "mt-8 rounded-xl border-2 border-accent-500/30 p-5 glass-effect";
const INSTRUCTIONS_CONTENT_CLASSES = "flex items-start gap-3";
const INSTRUCTIONS_ICON_CLASSES = "flex-shrink-0 text-2xl";
const INSTRUCTIONS_BODY_CLASSES = "flex-1";
const INSTRUCTIONS_TITLE_CLASSES =
  "mb-2 font-display text-xxs uppercase tracking-wider text-accent-400";
const INSTRUCTIONS_LIST_CLASSES =
  "font-mono text-xs text-dark-600 dark:text-light-300 space-y-1";
const INSTRUCTIONS_ITEM_CLASSES = "flex items-start gap-2";
const INSTRUCTIONS_BULLET_CLASSES = "flex-shrink-0 text-accent-500";

interface JoinGameInstructionsProps {
  title?: string;
  items?: string[];
}

export function JoinGameInstructions({
  title,
  items,
}: JoinGameInstructionsProps) {
  const { t } = useTranslation();
  const fallbackItemsRaw = t("game.joinPage.instructions.items", {
    returnObjects: true,
  });
  const fallbackItems = Array.isArray(fallbackItemsRaw) ? fallbackItemsRaw : [];
  const resolvedTitle = title ?? t("game.joinPage.instructions.title");
  const resolvedItems = Array.isArray(items) ? items : fallbackItems;

  return (
    <section className={INSTRUCTIONS_WRAPPER_CLASSES}>
      <div className={INSTRUCTIONS_CONTENT_CLASSES}>
        <span className={INSTRUCTIONS_ICON_CLASSES}>💡</span>
        <div className={INSTRUCTIONS_BODY_CLASSES}>
          <p className={INSTRUCTIONS_TITLE_CLASSES}>{resolvedTitle}</p>
          {resolvedItems.length > 0 ? (
            <ul className={INSTRUCTIONS_LIST_CLASSES}>
              {resolvedItems.map((item, index) => (
                <li key={index} className={INSTRUCTIONS_ITEM_CLASSES}>
                  <span className={INSTRUCTIONS_BULLET_CLASSES}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
