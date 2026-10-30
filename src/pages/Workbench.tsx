import { PageContainer } from '@/components/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/app';
import { projectsApi, sopApi, forumApi, syncApi } from '@/lib/api';
import { adaptProject, adaptSOP, adaptForumPost, adaptSyncMessage } from '@/lib/adapters';
import { useApiList } from '@/lib/useApiList';
import {
  ClipboardList,
  AlertTriangle,
  FileClock,
  Flag,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Clock,
  Calendar,
  Bell,
} from 'lucide-react';

export function WorkbenchPage() {
  const { data: projects, error } = useApiList(() => projectsApi.list().then((r) => r.map(adaptProject)));
  const { data: messages } = useApiList(() => syncApi.list().then((r) => r.map(adaptSyncMessage)));
  const { data: sops } = useApiList(() => sopApi.list().then((r) => r.map(adaptSOP)));
  const { data: posts } = useApiList(() => forumApi.list().then((r) => r.map(adaptForumPost)));
  const { setCurrentPage } = useApp();

  // 当前用户视角数据
  const pendingSync = messages.filter((m) => m.targetUser === 'all' || (Array.isArray(m.targetUser) && m.targetUser.includes('王工')));
  const mySOPS = sops.filter((s) => s.used30d && s.status === '生效');
  const myProjects = projects.slice(0, 4);
  const myForumPosts = posts.slice(0, 3);

  return (
    <PageContainer
      title="工作台"
      subtitle="王工 · CP 组 · 今日需要处理和关注的事项"
      actions={
        <Button variant="outline" size="sm">
          <Calendar className="w-3.5 h-3.5 mr-1.5" />
          本周周报
        </Button>
      }
    >
      {/* Top row: 2 key task cards */}
      {error && <div className="text-xs text-destructive">接口不可用：{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent">
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm">我的待办</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">3 条需要处理</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { title: 'CP-SOP-003 v3.0 等待我审批', tag: '审批', danger: true, time: '今天 18:00 前' },
              { title: '知识库「蓝牙断连」复审 3 天内到期', tag: '复审', danger: false, time: '11/01 前' },
              { title: '确认接收 HiCar 4.5 阻塞项目的新同步规则', tag: '规则', danger: false, time: '待处理' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-2.5 rounded-md border border-border hover:bg-accent/50 cursor-pointer transition-colors">
                {item.danger ? <AlertCircle className="w-4 h-4 text-destructive shrink-0" /> : <Clock className="w-4 h-4 text-muted-foreground shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{item.tag} · {item.time}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/10">
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-sm">待确认同步</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{pendingSync.filter(m => m.confirmedCount < m.totalCount).length} 条未确认</p>
            </div>
            <Button size="sm" variant="outline" className="ml-auto text-xs h-7" onClick={() => setCurrentPage('sync')}>
              去同步中心 →
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingSync.slice(0, 3).map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-sm p-2.5 rounded-md border border-border hover:bg-accent/50 cursor-pointer transition-colors">
                {m.isUrgent ? <AlertTriangle className="w-4 h-4 text-destructive shrink-0" /> : <Bell className="w-4 h-4 text-amber-600 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="truncate">{m.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {m.group} · {m.issuer} · 已确认 {m.confirmedCount}/{m.totalCount}
                  </div>
                </div>
                <Button size="sm" className="h-6 text-xs shrink-0">确认</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: 4 info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <FileClock className="w-4 h-4 text-primary" />
            <CardTitle className="text-xs font-medium">SOP 更新提醒</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{mySOPS.length}</div>
            <div className="text-[11px] text-muted-foreground mt-1">最近使用有新版本生效</div>
            <div className="mt-3 space-y-1">
              {mySOPS.slice(0, 2).map((s) => (
                <div key={s.id} className="text-[11px] text-muted-foreground truncate hover:text-foreground cursor-pointer">
                  {s.no} · {s.title}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Flag className="w-4 h-4 text-indigo-500" />
            <CardTitle className="text-xs font-medium">项目里程碑</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{myProjects.length}</div>
            <div className="text-[11px] text-muted-foreground mt-1">当前参与的项目</div>
            <div className="mt-3 space-y-1">
              {myProjects.map((p) => (
                <div key={p.id} className="text-[11px] flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.status === '认证中' ? 'bg-emerald-500' : p.status === '阻塞' ? 'bg-destructive' : 'bg-muted-foreground'}`} />
                  <span className="truncate flex-1 text-muted-foreground hover:text-foreground cursor-pointer">{p.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <CardTitle className="text-xs font-medium">本周问题</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div>
                <div className="text-2xl font-semibold text-amber-600">2</div>
                <div className="text-[10px] text-muted-foreground">阻塞项目</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-destructive">3</div>
                <div className="text-[10px] text-muted-foreground">认证失败</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-purple-600">8</div>
                <div className="text-[10px] text-muted-foreground">论坛讨论</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <MessageSquare className="w-4 h-4 text-sky-500" />
            <CardTitle className="text-xs font-medium">我关注的帖子</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{myForumPosts.length}</div>
            <div className="text-[11px] text-muted-foreground mt-1">有新回复待查看</div>
            <div className="mt-3 space-y-1">
              {myForumPosts.map((p) => (
                <div key={p.id} className="text-[11px] flex items-center gap-1.5">
                  {p.hasBestAnswer ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  ) : (
                    <MessageSquare className="w-3 h-3 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate flex-1 text-muted-foreground hover:text-foreground cursor-pointer">{p.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full-width: quick stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">本周效率指标</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {[
              { label: 'SOP 最新版使用率', value: '94%', trend: '+2%', positive: true },
              { label: '同步触达确认率', value: '87%', trend: '+5%', positive: true },
              { label: '重复问题率', value: '12%', trend: '-3%', positive: true },
              { label: '问题平均解决时长', value: '4.2h', trend: '-0.8h', positive: true },
              { label: '跨组知识复用', value: '28 次', trend: '+12 次', positive: true },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-semibold">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{stat.label}</div>
                <div className={`text-[10px] mt-1 ${stat.positive ? 'text-emerald-600' : 'text-destructive'}`}>{stat.trend} vs 上周</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
