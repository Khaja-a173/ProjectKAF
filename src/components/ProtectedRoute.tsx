import { useAccessControl } from "../contexts/AccessControlContext";
import { AlertTriangle, Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredCapability?: string;
  requiredDashboard?: string;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredCapability,
  requiredDashboard,
  fallback,
}: ProtectedRouteProps) {
  const { hasCapability, canAccessDashboard, currentUser, loading } =
    useAccessControl();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Check capability access
  if (requiredCapability && !hasCapability(requiredCapability)) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this feature. Contact your
              administrator to request access.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Required:</strong> {requiredCapability}
                </p>
                <p>
                  <strong>Your Role:</strong>{" "}
                  {currentUser?.roles[0]?.displayName || "None"}
                </p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      )
    );
  }

  // Check dashboard access
  if (requiredDashboard && !canAccessDashboard(requiredDashboard)) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Dashboard Restricted
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have access to this dashboard. Contact your
              administrator to request access.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Dashboard:</strong> {requiredDashboard}
                </p>
                <p>
                  <strong>Your Role:</strong>{" "}
                  {currentUser?.roles[0]?.displayName || "None"}
                </p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
