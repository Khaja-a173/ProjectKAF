import React, { createContext, useContext, ReactNode } from 'react';
import { useAccessControl } from '@/contexts/AccessControlContext';
import { User } from '@/types/access';

interface SessionContextType {
  tenantId: string | null;
  currentTenantId: string | null;
  user: User | null;
  isAuthenticated: boolean;
  session: any; // add this
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const access = useAccessControl();
  const currentTenantId = access?.currentTenantId ?? null;
  const user = (access as any)?.user ?? null;

  const contextValue: SessionContextType = {
    tenantId: currentTenantId ?? null,
    currentTenantId: currentTenantId ?? null,
    user: user ?? null,
    isAuthenticated: !!user,
    session: user?.session ?? null, // add this
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
};
