import { cn } from '@/lib/utils';
import { useApp, type PageId } from '@/lib/app';
import {
  LayoutDashboard,
  Table2,
  FileText,
  BookOpen,
  MessageSquare,
  Bell,
  Search,
  Shield,
  Car,
  Zap,
} from 'lucide-react';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'workbench', label: '工作台', icon: LayoutDashboard },
  { id: 'projects', label: '认证项目矩阵', icon: Table2 },
  { id: 'sop', label: 'SOP 中心', icon: FileText, badge: '1' },
  { id: 'knowledge', label: '知识库', icon: BookOpen },
  { id: 'forum', label: '结构化论坛', icon: MessageSquare },
  { id: 'sync', label: '同步中心', icon: Bell, badge: '5' },
  { id: 'search', label: '搜索与标签', icon: Search },
  { id: 'permission', label: '权限与审计', icon: Shield },
];

export function AppSidebar() {
  const { currentPage, setCurrentPage } = useApp();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 border-r border-border bg-card z-20 flex flex-col">
      <div className="px-5 py-5 border-b border-border flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Car className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <div className="text-sm font-semibold">车联网认证中台</div>
          <div className="text-[11px] text-muted-foreground">IOV Auth Console</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors relative',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                    active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-destructive text-destructive-foreground'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-border">
        <div className="rounded-md bg-muted/50 p-2.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
            <Zap className="w-3 h-3" />
            <span>P0 MVP · 迭代 1</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[85%] bg-primary rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  );
}
