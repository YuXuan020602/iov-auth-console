import { PageContainer } from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shield, Users, FileCheck, ClipboardList, Plus, Calendar, AlertTriangle } from 'lucide-react';

const AUDIT_LOGS = [
  { time: '2026-10-29 10:14', actor: '张组长', action: '审批 SOP 生效', resource: 'CP-SOP-003 v3.0', level: 'info' },
  { time: '2026-10-29 09:32', actor: '王工', action: '下载附件 (L2)', resource: 'CP-SOP-002 wac-pairing.pdf', level: 'info' },
  { time: '2026-10-29 08:50', actor: '系统自动', action: '触发同步消息', resource: '小米 SU7 HiCar 4.5 阻塞预警', level: 'warning' },
  { time: '2026-10-28 16:41', actor: '王工', action: '确认同步消息', resource: 'CP-SOP-001 v2.1 生效', level: 'info' },
  { time: '2026-10-28 14:12', actor: '陈工', action: '下载 L3 项目资料', resource: '上汽 ID.4 合规认证方案', level: 'critical' },
  { time: '2026-10-28 11:00', actor: '外部-实验室A', action: '登录', resource: '临时账号 将于 11/15 到期', level: 'info' },
];

const EXTERNAL_ACCOUNTS = [
  { name: '实验室A-张工', bindProject: '比亚迪海豹 Android Auto 14.0', expiresAt: '2026-11-15', maxLevel: 'L2', status: '活跃' },
  { name: '实验室B-李工', bindProject: '小米 SU7 HiCar 4.5', expiresAt: '2026-11-01', maxLevel: 'L2', status: '即将到期' },
  { name: '实验室C-王工', bindProject: 'iPhone 17 CarPlay', expiresAt: '2026-09-10', maxLevel: 'L2', status: '已禁用' },
];

const ROLE_MATRIX = [
  { role: '工程师', create: '本组内', edit: '本组内', approve: '❌', KB: '本组内', KBEdit: '❌', audit: '❌' },
  { role: '组长/负责人', create: '本组 ✅', edit: '本组 ✅', approve: '本组 ✅', KB: '本组 ✅', KBEdit: '本组 ✅', audit: '本组 ✅' },
  { role: '外部协作', create: '❌', edit: '❌', approve: '❌', KB: '仅指定项目', KBEdit: '❌', audit: '❌' },
  { role: '管理员', create: '全部 ✅', edit: '全部 ✅', approve: '全部 ✅', KB: '全部 ✅', KBEdit: '全部 ✅', audit: '全部 ✅' },
];

export function PermissionPage() {
  return (
    <PageContainer
      title="权限与审计"
      subtitle="按组 + 项目 + 密级三维授权 · 下载和变更留审计"
      actions={
        <>
          <Button variant="outline" size="sm">
            <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
            导出审计
          </Button>
          <Button size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            创建临时账号
          </Button>
        </>
      }
    >
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: '总账号数', value: 68, icon: <Users className="w-4 h-4 text-primary" /> },
          { label: '外部临时账号', value: EXTERNAL_ACCOUNTS.length, icon: <Shield className="w-4 h-4 text-sky-500" /> },
          { label: '7 天内敏感下载', value: 14, icon: <FileCheck className="w-4 h-4 text-amber-500" /> },
          { label: '登录失败告警', value: 2, icon: <AlertTriangle className="w-4 h-4 text-destructive" /> },
          { label: '审计日志保留', value: '2 年', icon: <ClipboardList className="w-4 h-4 text-emerald-500" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-card p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center">{s.icon}</div>
            <div>
              <div className="text-lg font-semibold">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="roles">
        <TabsList className="h-9">
          <TabsTrigger value="roles" className="text-sm">角色与权限矩阵</TabsTrigger>
          <TabsTrigger value="external" className="text-sm">外部临时账号</TabsTrigger>
          <TabsTrigger value="audit" className="text-sm">审计日志</TabsTrigger>
        </TabsList>

        {/* Roles matrix */}
        <TabsContent value="roles" className="mt-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">权限 = 角色 × 组 × 项目 × 密级</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">密级三档：L1（公开） / L2（组内） / L3（项目限权）；跨组可只读 L1，跨组 L2 需组长授权</p>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs">角色</TableHead>
                    <TableHead className="text-xs">新建资源</TableHead>
                    <TableHead className="text-xs">编辑</TableHead>
                    <TableHead className="text-xs">审批 SOP</TableHead>
                    <TableHead className="text-xs">发帖到本组</TableHead>
                    <TableHead className="text-xs">一键转知识库</TableHead>
                    <TableHead className="text-xs">查看 L3</TableHead>
                    <TableHead className="text-xs">查看审计</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ROLE_MATRIX.map((r) => (
                    <TableRow key={r.role}>
                      <TableCell className="font-medium text-sm">{r.role}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.create}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.edit}</TableCell>
                      <TableCell className="text-xs">
                        {r.approve === '❌' ? <span className="text-muted-foreground">❌</span> : <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">{r.approve}</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.KB}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.KBEdit}</TableCell>
                      <TableCell className="text-xs">
                        {r.role === '管理员' ? <span className="text-emerald-600">✅ 全部</span> : r.role === '组长/负责人' ? <span className="text-emerald-600">✅ 按授权</span> : <span className="text-muted-foreground">❌</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.audit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* External accounts */}
        <TabsContent value="external" className="mt-3">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs">账号名</TableHead>
                    <TableHead className="text-xs">绑定项目</TableHead>
                    <TableHead className="text-xs">有效期至</TableHead>
                    <TableHead className="text-xs">密级上限</TableHead>
                    <TableHead className="text-xs">状态</TableHead>
                    <TableHead className="text-xs">审批人</TableHead>
                    <TableHead className="text-xs text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {EXTERNAL_ACCOUNTS.map((a) => (
                    <TableRow key={a.name}>
                      <TableCell className="text-sm font-medium">{a.name}</TableCell>
                      <TableCell className="text-xs">{a.bindProject}</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {a.expiresAt}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{a.maxLevel}</Badge></TableCell>
                      <TableCell>
                        {a.status === '活跃' && <Badge className="text-[10px] bg-emerald-100 text-emerald-700">{a.status}</Badge>}
                        {a.status === '即将到期' && <Badge className="text-[10px] bg-amber-100 text-amber-700">{a.status}</Badge>}
                        {a.status === '已禁用' && <Badge variant="outline" className="text-[10px] text-muted-foreground">{a.status}</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">项目负责人 + 组长双审</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">续期</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">禁用</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit log */}
        <TabsContent value="audit" className="mt-3">
          <div className="flex items-center gap-2 mb-3">
            <Input placeholder="搜索操作人 / 资源 / 操作类型" className="h-8 text-xs max-w-sm" />
            <Button variant="outline" size="sm" className="h-8 text-xs">时间范围：最近 7 天</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs">时间</TableHead>
                    <TableHead className="text-xs">操作人</TableHead>
                    <TableHead className="text-xs">操作类型</TableHead>
                    <TableHead className="text-xs">资源</TableHead>
                    <TableHead className="text-xs">级别</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AUDIT_LOGS.map((l, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs text-muted-foreground font-mono">{l.time}</TableCell>
                      <TableCell className="text-xs font-medium">{l.actor}</TableCell>
                      <TableCell className="text-xs">{l.action}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.resource}</TableCell>
                      <TableCell>
                        {l.level === 'info' && <Badge variant="secondary" className="text-[10px] font-normal">info</Badge>}
                        {l.level === 'warning' && <Badge className="text-[10px] bg-amber-100 text-amber-700">warning</Badge>}
                        {l.level === 'critical' && <Badge variant="destructive" className="text-[10px]">critical</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
