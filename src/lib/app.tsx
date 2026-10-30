import React, { createContext, useContext, useState } from 'react';

export type PageId = 'workbench' | 'projects' | 'sop' | 'knowledge' | 'forum' | 'sync' | 'search' | 'permission';

interface AppState {
  currentPage: PageId;
  setCurrentPage: (p: PageId) => void;
  group: 'CP' | 'AA' | 'HiCar';
  setGroup: (g: 'CP' | 'AA' | 'HiCar') => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageId>('workbench');
  const [group, setGroup] = useState<'CP' | 'AA' | 'HiCar'>('CP');
  return (
    <AppContext.Provider value={{ currentPage, setCurrentPage, group, setGroup }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
