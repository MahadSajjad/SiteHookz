import { useTranslation } from "react-i18next";

export function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        {t("dashboard.title", "Dashboard")}
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-border">
          <h3 className="text-lg font-medium text-foreground">
            Total Branches
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary">4</p>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-border">
          <h3 className="text-lg font-medium text-foreground">
            Active Sessions
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary">12</p>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-border">
          <h3 className="text-lg font-medium text-foreground">
            Total Students
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary">1,204</p>
        </div>
      </div>
    </div>
  );
}
