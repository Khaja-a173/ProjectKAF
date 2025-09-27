import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAccessControl } from '@/contexts/AccessControlContext';
import { syncTenantId } from '@/lib/api';

type TenantPublicState = {
  tenantId?: string;         // persisted for anonymous visitors
  tenantCode?: string;
  tableCode?: string;
};

type TenantState = {
  /** Stable, always-defined tenant id. Empty string when unknown. */
  tenantId: string;
  /** Optional restaurant code like DEMO; useful for QR flows. */
  tenantCode?: string;
  /** Optional table code like T01; useful for QR flows. */
  tableCode?: string;
  /**
   * Store/override a public tenant (for anonymous users scanning QR etc.).
   * Does not override an authenticated user's membership tenant.
   */
  setPublicTenant: (t: { tenantId?: string; tenantCode?: string; tableCode?: string }) => void;
  /** Clear any public tenant stored for anonymous users. */
  clearPublicTenant: () => void;
};

const STORAGE_KEYS = {
  tenantId: 'kaf.publicTenantId',
  tenantCode: 'kaf.publicTenantCode',
  tableCode: 'kaf.publicTableCode',
} as const;

const Ctx = createContext<TenantState | null>(null);

export const TenantProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // Pull current authenticated user's tenant from AccessControl
  const { currentUser } = useAccessControl();

  // Persisted "public" tenant for anonymous users (e.g., QR entry)
  const [publicTenant, setPublicTenantState] = useState<TenantPublicState>(() => ({
    tenantId: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.tenantId) || undefined : undefined,
    tenantCode: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.tenantCode) || undefined : undefined,
    tableCode: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.tableCode) || undefined : undefined,
  }));

  // Keep localStorage in sync when public tenant changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (publicTenant.tenantId) {
      localStorage.setItem(STORAGE_KEYS.tenantId, publicTenant.tenantId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.tenantId);
    }
    if (publicTenant.tenantCode) {
      localStorage.setItem(STORAGE_KEYS.tenantCode, publicTenant.tenantCode);
    } else {
      localStorage.removeItem(STORAGE_KEYS.tenantCode);
    }
    if (publicTenant.tableCode) {
      localStorage.setItem(STORAGE_KEYS.tableCode, publicTenant.tableCode);
    } else {
      localStorage.removeItem(STORAGE_KEYS.tableCode);
    }
  }, [publicTenant.tenantId, publicTenant.tenantCode, publicTenant.tableCode]);

  // Authenticated tenant takes precedence; fall back to public tenant; never undefined
  const effectiveTenantId = currentUser?.tenantId || publicTenant.tenantId || '';

  // Sync effectiveTenantId with API tenant-aware header system
  useEffect(() => {
    syncTenantId(effectiveTenantId);
  }, [effectiveTenantId]);

  const value = useMemo<TenantState>(() => ({
    tenantId: effectiveTenantId,
    tenantCode: publicTenant.tenantCode,
    tableCode: publicTenant.tableCode,
    setPublicTenant: (t) => {
      setPublicTenantState(prev => ({
        tenantId: t.tenantId ?? prev.tenantId,
        tenantCode: t.tenantCode ?? prev.tenantCode,
        tableCode: t.tableCode ?? prev.tableCode,
      }));
    },
    clearPublicTenant: () => {
      setPublicTenantState({});
    },
  }), [effectiveTenantId, publicTenant.tenantCode, publicTenant.tableCode]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useTenant = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
};