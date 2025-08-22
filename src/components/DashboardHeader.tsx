import { Link } from "react-router-dom";
import { ChefHat, Bell, Settings, Search, UserCog } from "lucide-react";
import { useAccessControl } from "../contexts/AccessControlContext";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showUserSwitcher?: boolean;
}

export default function DashboardHeader({ 
  title, 
  subtitle,
  showUserSwitcher = false 
}: DashboardHeaderProps) {
  const { currentUser, switchUser, users } = useAccessControl();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600">{subtitle}</p>
                )}
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Switcher for Testing */}
            {showUserSwitcher && (
              <div className="flex items-center space-x-2">
                <UserCog className="w-4 h-4 text-gray-500" />
                <select
                  value={currentUser?.id || ""}
                  onChange={(e) => switchUser(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} (
                      {user.roles[0]?.displayName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Current User Info */}
            {currentUser && (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">
                  {currentUser.firstName} ({currentUser.roles[0]?.displayName})
                </span>
              </div>
            )}

            <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">Live</span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}