import { Outlet } from "react-router-dom";

import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      <div className="md:pl-64 flex flex-col flex-1 w-full h-full">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-surface-secondary">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
