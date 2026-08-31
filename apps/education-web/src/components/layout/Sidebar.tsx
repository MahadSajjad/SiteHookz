import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { name: t("nav.dashboard", "Dashboard"), href: "/dashboard" },
    { name: t("nav.students", "Students"), href: "/dashboard/students" },
    {
      name: t("attendance.schoolAttendance", "School Attendance"),
      href: "/dashboard/attendance/school",
    },
    {
      name: t("attendance.tuitionAttendance", "Tuition Attendance"),
      href: "/dashboard/attendance/tuition",
    },
    {
      name: t("finance.feeHeads", "Fee Heads"),
      href: "/dashboard/finance/fee-heads",
    },
    {
      name: t("finance.feePlans", "Fee Plans"),
      href: "/dashboard/finance/fee-plans",
    },
    {
      name: t("finance.payments", "Payments"),
      href: "/dashboard/finance/payments",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <span className="text-xl font-bold text-primary">SiteHookz</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
