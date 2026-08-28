import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function MobileNav() {
  const { t } = useTranslation();
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex justify-around items-center px-4 pb-safe">
      <Link to="/dashboard" className="flex flex-col items-center text-primary">
        <span className="text-xs mt-1">{t("nav.dashboard", "Dashboard")}</span>
      </Link>
    </div>
  );
}
