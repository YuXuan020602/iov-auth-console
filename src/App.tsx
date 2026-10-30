import { lazy, Suspense } from 'react';
import { AppProvider, useApp } from '@/lib/app';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';

// 各页面按需加载，避免首屏加载全部模块
const WorkbenchPage = lazy(() => import('@/pages/Workbench').then((m) => ({ default: m.WorkbenchPage })));
const ProjectMatrixPage = lazy(() => import('@/pages/ProjectMatrix').then((m) => ({ default: m.ProjectMatrixPage })));
const SOPCenterPage = lazy(() => import('@/pages/SOPCenter').then((m) => ({ default: m.SOPCenterPage })));
const KnowledgePage = lazy(() => import('@/pages/Knowledge').then((m) => ({ default: m.KnowledgePage })));
const ForumPage = lazy(() => import('@/pages/Forum').then((m) => ({ default: m.ForumPage })));
const SyncCenterPage = lazy(() => import('@/pages/SyncCenter').then((m) => ({ default: m.SyncCenterPage })));
const SearchPage = lazy(() => import('@/pages/Search').then((m) => ({ default: m.SearchPage })));
const PermissionPage = lazy(() => import('@/pages/Permission').then((m) => ({ default: m.PermissionPage })));

function PageFallback() {
  return (
    <div className="p-6 text-sm text-muted-foreground">页面加载中…</div>
  );
}

function PageRouter() {
  const { currentPage } = useApp();
  const page = (() => {
    switch (currentPage) {
      case 'workbench': return <WorkbenchPage />;
      case 'projects': return <ProjectMatrixPage />;
      case 'sop': return <SOPCenterPage />;
      case 'knowledge': return <KnowledgePage />;
      case 'forum': return <ForumPage />;
      case 'sync': return <SyncCenterPage />;
      case 'search': return <SearchPage />;
      case 'permission': return <PermissionPage />;
      default: return <WorkbenchPage />;
    }
  })();

  return <Suspense fallback={<PageFallback />}>{page}</Suspense>;
}

function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="pl-60">
        <AppHeader />
        <main className="min-h-[calc(100vh-56px)]">
          <PageRouter />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
