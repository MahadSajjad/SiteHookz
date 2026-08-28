import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../stores/auth.store";
import { useAuth } from "../../hooks/useAuth";

export function Topbar() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-surface px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center">
        <div className="font-semibold text-lg">My Organization</div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <span className="text-sm text-muted-foreground">{user?.name}</span>
          <button
            onClick={() => logout()}
            className="text-sm font-medium text-danger hover:text-danger-foreground hover:bg-danger/10 px-3 py-1 rounded-md transition-colors"
          >
            {t("auth.logout", "Logout")}
          </button>
        </div>
      </div>
    </header>
  );
}
