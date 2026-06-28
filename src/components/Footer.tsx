import { useTranslations } from "next-intl";

export function Footer() {
  const tr = useTranslations("footer");
  return (
    <footer className="foot">
      {tr("thanks")}
      <small>{tr("rights")}</small>
      <small>{tr("built")}</small>
    </footer>
  );
}
