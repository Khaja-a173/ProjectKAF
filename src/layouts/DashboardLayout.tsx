import HealthBanner from "@/health/HealthBanner";
//import DashboardHeader from "@/components/DashboardHeader";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Health status banner */}
      <HealthBanner />

      {/* Dashboard content area */}
      <main id="main-content" className="flex-1 bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}