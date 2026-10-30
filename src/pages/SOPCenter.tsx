import { PageContainer } from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useApp } from '@/lib/app';
import { SOP_STATUS_COLORS } from '@/data/mock';
import { sopApi } from '@/lib/api';
import { adaptSOP } from '@/lib/adapters';
import { useApiList } from '@/lib/useApiList';
import { Search, Plus, Eye, GitCompare, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';

export function SOPCenterPage() {
  const { data: sops, error } = useApiList(() => sopApi.list().then((r) => r.map(adaptSOP)));
  const { group } = useApp();
  // MVP 简化：左侧目录 + 右侧默认生效版 + 归档版强提示
  const visibleSOPS = sops.filter((s) => s.group === group || s.secretLevel === 'L1');
  const draftOrPending = visibleSOPS.filter((s) => s.status === '草稿' || s.status === '待审');
  const effective = visibleSOPS.filter((s) => s.status === '生效');

  return (
    <PageContainer
      title="SOP 中心"
      subtitle={`${group} 组 · 默认仅展示生效版，过期版本将强提示`}
      actions={
        <>
          <Button variant="outline" size="sm">
            <Search className="w-3.5 h-3.5 mr-1.5" />
            按条款搜索
          </Button>
          <Button size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            新建 SOP
          </Button>
        </>
      }
    >
      {error && <div className="text-xs text-destructive">{error}</div>}

      {/* 过期版本强提示 Demo banner */}
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm font-medium text-destructive">检测到你正在查看已过期版本：CP-SOP-001 v1.3（归档）</div>
          <div className="text-xs text-muted-foreground mt-0.5">请使用当前生效版 v2.1。使用归档版将被记录审计并向组长推送提醒。</div>
        </div>
        <Button size="sm" variant="destructive" className="h-7 text-xs shrink-0">
          跳转到 v2.1 →
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left sidebar tree */}
        <div className="col-span-12 lg:col-span-3">
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <div className="px-3 py-2 border-b border-border bg-muted/30 text-xs font-medium flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              SOP 目录
            </div>
            <div className="p-2 text-xs">
              {[
                { label: `${group} 组 SOP`, children: [
                  { label: 'CarPlay / 认证', count: effective.filter(s => s.certType.startsWith('CarPlay')).length },
                  { label: 'CarPlay WAC / 无线配对', count: effective.filter(s => s.certType.includes('WAC')).length },
                  { label: 'HiCar / 多屏协同', count: 0 },
                ]},
                { label: 'AA 组 SOP（只读 L1）', children: [] },
                { label: 'HiCar 组 SOP（只读 L1）', children: [] },
              ].map((cat, i) => (
                <div key={i} className="mb-2">
                  <div className="font-medium px-1 py-1 text-foreground">{cat.label}</div>
                  {cat.children.map((child: any, j) => (
                    <div key={j} className="flex items-center justify-between px-2 py-1 rounded hover:bg-accent cursor-pointer">
                      <span className="text-muted-foreground hover:text-foreground">{child.label}</span>
                      {child.count > 0 && (
                        <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5">{child.count}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="col-span-12 lg:col-span-9 space-y-4">
          {/* Draft/Pending alerts */}
          {draftOrPending.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
              <CardHeader className="py-2 px-3 border-b border-amber-200 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <CardTitle className="text-xs font-medium">待处理审批</CardTitle>
                </div>
                <span className="text-[10px] text-muted-foreground">{draftOrPending.length} 条</span>
              </CardHeader>
              <CardContent className="p-0">
                {draftOrPending.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 px-3 py-2 border-b border-amber-200 last:border-0 hover:bg-white/50 cursor-pointer">
                    <div className="text-xs font-mono text-muted-foreground w-28">{s.no}</div>
                    <div className="flex-1 text-sm truncate">{s.title}</div>
                    <Badge className={SOP_STATUS_COLORS[s.status] + ' text-[10px]'}>{s.status}</Badge>
                    <span className="text-[11px] text-muted-foreground">v{s.version}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs">查看并审批</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* SOP list by status */}
          <Tabs defaultValue="effective">
            <TabsList className="h-8">
              <TabsTrigger value="effective" className="text-xs">
                生效版 <Badge variant="secondary" className="ml-1 text-[10px]">{effective.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs">
                包含草稿/归档
              </TabsTrigger>
            </TabsList>

            <TabsContent value="effective" className="mt-3">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs">SOP 编号</TableHead>
                      <TableHead className="text-xs">标题</TableHead>
                      <TableHead className="text-xs">版本</TableHead>
                      <TableHead className="text-xs">适用车型/平台</TableHead>
                      <TableHead className="text-xs">责任人</TableHead>
                      <TableHead className="text-xs">更新时间</TableHead>
                      <TableHead className="text-xs">关联</TableHead>
                      <TableHead className="text-xs text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {effective.map((s) => (
                      <TableRow key={s.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs text-muted-foreground">{s.no}</TableCell>
                        <TableCell className="font-medium text-sm">{s.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">v{s.version}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{s.vehicle}</TableCell>
                        <TableCell className="text-xs">{s.owner}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{s.updatedAt}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <span className="inline-flex gap-1">
                            <Badge variant="secondary" className="text-[10px] font-normal px-1.5">
                              {Math.floor(Math.random() * 3) + 1} 标准
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] font-normal px-1.5">
                              {Math.floor(Math.random() * 5)} 问题
                            </Badge>
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><GitCompare className="w-3.5 h-3.5" /></Button>
                            {s.used30d && (
                              <span className="my-auto ml-1" title="30 天内使用过">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="all" className="mt-3">
              <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-3 border border-dashed border-border">
                ⚠ 包含草稿和归档版本，归档版本会以黄色警示框提示。此视图仅用于技术同步会和历史追溯。
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
