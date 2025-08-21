import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  Role,
  AccessPolicy,
  AccessAuditLog,
  DASHBOARD_REGISTRY,
  DEFAULT_ROLES,
} from "../types/access";

interface AccessControlContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  policy: AccessPolicy | null;
  users: User[];
  roles: Role[];
  auditLogs: AccessAuditLog[];
  loading: boolean;
  error: string | null;
  hasCapability: (capability: string, locationId?: string) => boolean;
  canAccessDashboard: (dashboardKey: string) => boolean;
  refreshPolicy: () => Promise<void>;
  switchUser: (userId: string) => void;
}

const AccessControlContext = createContext<
  AccessControlContextType | undefined
>(undefined);

// Global access control state for real-time sync
let globalAccessState = {
  policy: {
    id: "policy_default",
    tenantId: "tenant_123",
    version: 1,
    roleCapabilities: {
      ADMIN: [
        "KITCHEN_VIEW",
        "KITCHEN_ACTIONS",
        "KITCHEN_OVERRIDE",
        "LIVE_ORDERS_VIEW",
        "TABLES_VIEW",
        "TABLES_MANAGE",
        "TABLES_CONFIG",
        "MENU_VIEW",
        "MENU_MANAGE",
        "MENU_BULK",
        "STAFF_VIEW",
        "STAFF_MANAGE",
        "STAFF_ROLES",
        "CUSTOMIZATION_VIEW",
        "CUSTOMIZATION_MANAGE",
        "CUSTOMIZATION_PUBLISH",
        "RESERVATIONS_VIEW",
        "RESERVATIONS_MANAGE",
        "PAYMENTS_VIEW",
        "PAYMENTS_PROCESS",
        "PAYMENTS_REFUND",
        "REPORTS_VIEW",
        "REPORTS_EXPORT",
      ],
      MANAGER: [
        "KITCHEN_VIEW",
        "KITCHEN_ACTIONS",
        "LIVE_ORDERS_VIEW",
        "TABLES_VIEW",
        "TABLES_MANAGE",
        "MENU_VIEW",
        "MENU_MANAGE",
        "STAFF_VIEW",
        "RESERVATIONS_VIEW",
        "RESERVATIONS_MANAGE",
        "PAYMENTS_VIEW",
        "REPORTS_VIEW",
      ],
      STAFF_WAITER: [
        "LIVE_ORDERS_VIEW",
        "TABLES_VIEW",
        "KITCHEN_VIEW",
        "RESERVATIONS_VIEW",
      ],
      STAFF_CHEF: ["KITCHEN_VIEW", "KITCHEN_ACTIONS", "LIVE_ORDERS_VIEW"],
    },
    userOverrides: {},
    locationGroups: [],
    createdBy: "system",
    createdAt: new Date(),
  } as AccessPolicy,
  users: [
    {
      id: "user_admin",
      tenantId: "tenant_123",
      email: "admin@restaurant.com",
      firstName: "Admin",
      lastName: "User",
      status: "active" as const,
      roles: [DEFAULT_ROLES.find((r) => r.key === "ADMIN")!] as Role[],
      locationIds: ["location_456"],
      capabilities: ["ALL"],
      lastActive: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "user_manager",
      tenantId: "tenant_123",
      email: "manager@restaurant.com",
      firstName: "Manager",
      lastName: "User",
      status: "active" as const,
      roles: [DEFAULT_ROLES.find((r) => r.key === "MANAGER")!] as Role[],
      locationIds: ["location_456"],
      capabilities: DEFAULT_ROLES.find((r) => r.key === "MANAGER")!
        .capabilities,
      lastActive: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "user_chef",
      tenantId: "tenant_123",
      email: "chef@restaurant.com",
      firstName: "Chef",
      lastName: "User",
      status: "active" as const,
      roles: [DEFAULT_ROLES.find((r) => r.key === "STAFF_CHEF")!] as Role[],
      locationIds: ["location_456"],
      capabilities: DEFAULT_ROLES.find((r) => r.key === "STAFF_CHEF")!
        .capabilities,
      lastActive: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ] as User[],
  roles: DEFAULT_ROLES.map((role) => ({
    ...role,
    id: `role_${role.key}`,
    tenantId: "tenant_123",
    createdAt: new Date(),
    updatedAt: new Date(),
  })) as Role[],
  auditLogs: [] as AccessAuditLog[],
};

const accessSubscribers: Set<(state: typeof globalAccessState) => void> =
  new Set();

const notifyAccessSubscribers = () => {
  console.log("🔐 Notifying access control subscribers");
  accessSubscribers.forEach((callback) => callback({ ...globalAccessState }));
};

export const updateGlobalAccess = (
  updater: (prev: typeof globalAccessState) => typeof globalAccessState,
) => {
  const prevState = { ...globalAccessState };
  globalAccessState = updater(globalAccessState);
  console.log("🔐 Access control state updated");
  notifyAccessSubscribers();
};

interface AccessControlProviderProps {
  children: ReactNode;
  tenantId: string;
  locationId?: string;
  currentUserId?: string;
}

export function AccessControlProvider({
  children,
  tenantId,
  locationId,
  currentUserId = "user_admin",
}: AccessControlProviderProps) {
  const [state, setState] = useState(globalAccessState);
  const [activeUserId, setActiveUserId] = useState(currentUserId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to global access control changes
  useEffect(() => {
    const updateState = (newState: typeof globalAccessState) => {
      console.log("🔐 Received access control update");
      setState(newState);
      setLoading(false);
    };

    accessSubscribers.add(updateState);

    // Initialize with current global state
    setState({ ...globalAccessState });

    return () => {
      accessSubscribers.delete(updateState);
    };
  }, []);

  const currentUser = state.users.find((u) => u.id === activeUserId) || null;

  const setCurrentUser = (user: User | null) => {
    if (user) {
      setActiveUserId(user.id);
    }
  };

  const switchUser = (userId: string) => {
    console.log("🔄 Switching to user:", userId);
    setActiveUserId(userId);
  };

  const hasCapability = (capability: string, locationId?: string): boolean => {
    if (!currentUser) return false;

    // Owner/Admin with ALL capability
    if (currentUser.capabilities.includes("ALL")) return true;

    // Check direct capability
    if (currentUser.capabilities.includes(capability)) {
      // If location-scoped, verify location access
      if (locationId && currentUser.locationIds.length > 0) {
        return currentUser.locationIds.includes(locationId);
      }
      return true;
    }

    // Check temporary access
    if (currentUser.temporaryAccess) {
      const tempAccess = currentUser.temporaryAccess.find(
        (ta) =>
          ta.capability === capability &&
          ta.isActive &&
          ta.expiresAt > new Date(),
      );
      if (tempAccess) {
        if (locationId && tempAccess.locationIds) {
          return tempAccess.locationIds.includes(locationId);
        }
        return true;
      }
    }

    return false;
  };

  const canAccessDashboard = (dashboardKey: string): boolean => {
    const dashboard = DASHBOARD_REGISTRY[dashboardKey];
    if (!dashboard) return false;

    // Check if user has any view capability for this dashboard
    return dashboard.capabilities.some(
      (cap) => cap.type === "view" && hasCapability(cap.key),
    );
  };

  const refreshPolicy = async (): Promise<void> => {
    try {
      setLoading(true);
      // In real implementation, this would fetch from API
      console.log("🔄 Refreshing access policy for tenant:", tenantId);
      setState({ ...globalAccessState });
    } catch (err) {
      console.error("❌ Failed to refresh policy:", err);
      setError("Failed to refresh access policy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccessControlContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        policy: state.policy,
        users: state.users,
        roles: state.roles,
        auditLogs: state.auditLogs,
        loading,
        error,
        hasCapability,
        canAccessDashboard,
        refreshPolicy,
        switchUser,
      }}
    >
      {children}
    </AccessControlContext.Provider>
  );
}

export function useAccessControl() {
  const context = useContext(AccessControlContext);
  if (context === undefined) {
    throw new Error(
      "useAccessControl must be used within an AccessControlProvider",
    );
  }
  return context;
}

// Hook for checking specific capabilities
export function useCapability(capability: string, locationId?: string) {
  const { hasCapability } = useAccessControl();
  return hasCapability(capability, locationId);
}

// Hook for dashboard access
export function useDashboardAccess(dashboardKey: string) {}
