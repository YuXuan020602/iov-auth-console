import { useApp } from '@/lib/app';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GROUP_COLORS, MOCK_USER } from '@/data/mock';

export function AppHeader() {
  const { group, setGroup } = useApp();

  const groups: ('CP' | 'AA' | 'HiCar')[] = ['CP', 'AA', 'HiCar'];

  return (
    <header className="sticky top-0 z-10 h-14 border-b border-border bg-card/95 backdrop-blur flex items-center gap-4 px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="全局搜索 SOP / 知识库 / 论坛 / 项目…"
          className="pl-9 h-9 text-sm bg-muted/50 border-transparent focus:bg-card focus:border-border"
        />
      </div>

      {/* Group switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 h-9 rounded-md border border-border text-sm hover:bg-accent transition-colors">
          <span className={GROUP_COLORS[group] + ' text-[11px] font-semibold px-1.5 py-0.5 rounded'}>{group}</span>
          <span className="text-muted-foreground">组视角</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>切换组视角</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {groups.map((g) => (
            <DropdownMenuItem key={g} onClick={() => setGroup(g)} className="cursor-pointer">
              <span className={GROUP_COLORS[g] + ' text-[11px] font-semibold px-1.5 py-0.5 rounded mr-2'}>{g}</span>
              <span className="text-sm">{g === 'CP' ? 'CarPlay' : g === 'AA' ? 'Android Auto' : 'HiCar'}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sync icon */}
      <button className="relative w-9 h-9 rounded-md hover:bg-accent flex items-center justify-center transition-colors">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
      </button>

      {/* User */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-2 h-9 rounded-md hover:bg-accent transition-colors cursor-pointer">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {MOCK_USER.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-medium leading-none">{MOCK_USER.name}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{MOCK_USER.group} · {MOCK_USER.role}</div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{MOCK_USER.name} · {MOCK_USER.group}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem><User className="w-4 h-4 mr-2" />个人资料</DropdownMenuItem>
          <DropdownMenuItem><Settings className="w-4 h-4 mr-2" />偏好设置</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive"><LogOut className="w-4 h-4 mr-2" />退出登录</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Badge variant="secondary" className="hidden lg:inline-flex text-[10px] font-normal">v1.0 MVP</Badge>
    </header>
  );
}
