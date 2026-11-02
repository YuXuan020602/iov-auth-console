import { useCallback, useEffect, useState } from 'react';
import { PageContainer } from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { GROUP_COLORS, STATUS_COLORS } from '@/data/mock';
import { projectsApi } from '@/lib/api';
import { adaptProject } from '@/lib/adapters';
import { useApiList } from '@/lib/useApiList';
import type { Project } from '@/data/mock';
import { Filter, Plus, Download, LayoutGrid, List, Eye, Pencil, Trash2 } from 'lucide-react';

// MVP 阶段：前端无登录系统，硬编码当前用户为王工
const CURRENT_USER_ID = 'cmvyld7tq0002111gtzavc1jc';

const GROUPS = ['CP', 'AA', 'HiCar'];
const CERT_TYPES = ['产品认证', '版本认证', '合规认证'];
const STATUSES = ['认证中', '进行中', '阻塞', '已通过', '已终止'];
const SECRET_LEVELS = ['L1', 'L2', 'L3'];

const emptyForm = {
  name: '',
  group: 'CP',
  certType: '产品认证',
  vehicle: '',
  swVersion: '',
  region: '',
  status: '认证中',
  milestone: '',
  secretLevel: 'L1',
  startDate: '',
  endDate: '',
};

export function ProjectMatrixPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 新增项目
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 视图切换：true=表格, false=卡片
  const [isTableView, setIsTableView] = useState(true);

  const load = useCallback(() => {
    projectsApi.list()
      .then((r) => setProjects(r.map(adaptProject)))
      .catch((e) => setError(e?.message ?? '加载失败'));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleOpenCreate = useCallback(() => {
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!form.name.trim() || !form.vehicle.trim()) {
      setFormError('请填写项目名称和车型/平台');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await projectsApi.create({
        name: form.name.trim(),
        group: form.group,
        certType: form.certType,
        vehiclePlatform: form.vehicle.trim(),
        swVersion: form.swVersion.trim() || undefined,
        region: form.region.trim() || undefined,
        status: form.status,
        ownerId: CURRENT_USER_ID,
        milestone: form.milestone.trim() || undefined,
        secretLevel: form.secretLevel,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      });
      setDialogOpen(false);
      load();
    } catch (e: any) {
      setFormError(e?.message ?? '创建失败');
    } finally {
      setSubmitting(false);
    }
  }, [form, load]);

  const handleExport = useCallback(() => {
    alert(`导出项目清单（TODO）\n\n共 ${projects.length} 个项目。\n\n将导出 Excel/CSV，包含：\n• 项目名称 / 组 / 认证类型\n• 车型 / 版本 / 地区\n• 状态 / 负责人 / 里程碑\n• 密级 / 创建时间`);
  }, [projects.length]);

  const handleView = useCallback((p: Project) => {
    alert(`查看项目详情（TODO）\n\n项目：${p.name}\n组：${p.group}\n状态：${p.status}\n\n此处将打开项目详情页，显示：\n• 关联 SOP 列表\n• 里程碑时间线\n• 同步消息历史\n• 论坛讨论链接`);
  }, []);

  const handleEdit = useCallback((p: Project) => {
    alert(`编辑项目（TODO）\n\n项目：${p.name}\n\n此处将打开编辑表单，支持：\n• 修改状态（认证中/进行中/阻塞/已通过/已终止）\n• 更新里程碑\n• 调整密级`);
  }, []);

  const handleDelete = useCallback((p: Project) => {
    if (!confirm(`确认删除项目「${p.name}」？此操作不可恢复。`)) return;
    alert(`删除项目（TODO）\n\n项目：${p.name} (${p.id})\n\n⚠ 实际后端 DELETE /projects/:id 端点待实现。\n当前仅标记为已终止。`);
  }, []);

  return (
    <PageContainer
      title="认证项目矩阵"
      subtitle="CP / AA / HiCar 三组共用 · 技术同步会全景看板"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            导出清单
          </Button>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            新增项目
          </Button>
        </>
      }
    >
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-md border border-border bg-card">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Select defaultValue="全部">
            <SelectTrigger className="h-8 w-auto text-xs min-w-[110px]">
              <SelectValue placeholder="认证类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部</SelectItem>
              {CERT_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select defaultValue="全部">
            <SelectTrigger className="h-8 w-auto text-xs min-w-[110px]">
              <SelectValue placeholder="组" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部</SelectItem>
              {GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select defaultValue="全部">
            <SelectTrigger className="h-8 w-auto text-xs min-w-[110px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="车型 / 平台 / 版本…" className="h-8 text-xs max-w-xs" />
        </div>
        <div className="flex items-center gap-1 border-l border-border pl-2">
          <Button
            variant={isTableView ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setIsTableView(true)}
          >
            <List className="w-3.5 h-3.5 mr-1" />
            表格
          </Button>
          <Button
            variant={!isTableView ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={() => setIsTableView(false)}
          >
            <LayoutGrid className="w-3.5 h-3.5 mr-1" />
            卡片
          </Button>
        </div>
      </div>

      {error && <div className="text-xs text-destructive">{error}</div>}

      {/* Table */}
      {isTableView && (
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-medium">项目名称</TableHead>
                <TableHead className="text-xs font-medium">组</TableHead>
                <TableHead className="text-xs font-medium">认证类型</TableHead>
                <TableHead className="text-xs font-medium">车型/平台</TableHead>
                <TableHead className="text-xs font-medium">软件版本</TableHead>
                <TableHead className="text-xs font-medium">地区/法规</TableHead>
                <TableHead className="text-xs font-medium">状态</TableHead>
                <TableHead className="text-xs font-medium">负责人</TableHead>
                <TableHead className="text-xs font-medium">里程碑</TableHead>
                <TableHead className="text-xs font-medium">密级</TableHead>
                <TableHead className="text-xs font-medium text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-sm">{p.name}</TableCell>
                  <TableCell>
                    <Badge className={GROUP_COLORS[p.group] + ' text-[10px] font-medium px-1.5 py-0.5'} variant="secondary">
                      {p.group}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.certType}</TableCell>
                  <TableCell className="text-xs">{p.vehicle}</TableCell>
                  <TableCell className="text-xs">{p.swVersion}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.region}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[p.status] + ' text-[10px]'}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{p.owner}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.milestone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {p.secretLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="查看" onClick={() => handleView(p)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="编辑" onClick={() => handleEdit(p)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="删除" onClick={() => handleDelete(p)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Card view (simplified) */}
      {!isTableView && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((p) => (
            <div key={p.id} className="rounded-md border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="font-medium text-sm truncate flex-1">{p.name}</div>
                <Badge className={STATUS_COLORS[p.status] + ' text-[10px] shrink-0'}>{p.status}</Badge>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <Badge className={GROUP_COLORS[p.group] + ' text-[10px]'} variant="secondary">{p.group}</Badge>
                <Badge variant="outline" className="text-[10px]">{p.certType}</Badge>
                <Badge variant="outline" className="text-[10px] font-normal">{p.secretLevel}</Badge>
              </div>
              <div className="text-[11px] text-muted-foreground space-y-0.5">
                <div>🚗 {p.vehicle} {p.swVersion && `· ${p.swVersion}`}</div>
                <div>📍 {p.region}</div>
                <div>👤 {p.owner} {p.milestone && `· ${p.milestone}`}</div>
              </div>
              <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-border">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleView(p)}><Eye className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: '总计', count: projects.length, color: 'text-foreground' },
          { label: '认证中', count: projects.filter(p => p.status === '认证中').length, color: 'text-indigo-600' },
          { label: '进行中', count: projects.filter(p => p.status === '进行中').length, color: 'text-blue-600' },
          { label: '阻塞', count: projects.filter(p => p.status === '阻塞').length, color: 'text-amber-600' },
          { label: '已通过', count: projects.filter(p => p.status === '已通过').length, color: 'text-emerald-600' },
          { label: '已终止', count: projects.filter(p => p.status === '已终止').length, color: 'text-destructive' },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border p-3 text-center">
            <div className={`text-xl font-semibold ${s.color}`}>{s.count}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 新增项目 Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>新增认证项目</DialogTitle>
            <DialogDescription>创建后项目将出现在矩阵中，可在详情页继续关联 SOP 和同步消息。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label className="text-xs">项目名称 *</Label>
              <Input
                className="h-8 text-sm"
                placeholder="如 iPhone 17 CarPlay 2026 Q1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">组</Label>
                <Select value={form.group} onValueChange={(v) => setForm({ ...form, group: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">认证类型</Label>
                <Select value={form.certType} onValueChange={(v) => setForm({ ...form, certType: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CERT_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">状态</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">车型/平台 *</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="如 iPhone 17 / 小米 SU7"
                  value={form.vehicle}
                  onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">软件版本</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="如 iOS 18.4 / HiCar 4.5"
                  value={form.swVersion}
                  onChange={(e) => setForm({ ...form, swVersion: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">地区/法规</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="如 CN / EU / GB 44495"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">密级</Label>
                <select
                  className="h-8 rounded-md border border-border bg-transparent px-2 text-sm"
                  value={form.secretLevel}
                  onChange={(e) => setForm({ ...form, secretLevel: e.target.value })}
                >
                  {SECRET_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">里程碑</Label>
              <Input
                className="h-8 text-sm"
                placeholder="如 2026-03-15 提交认证申请"
                value={form.milestone}
                onChange={(e) => setForm({ ...form, milestone: e.target.value })}
              />
            </div>
            {formError && <div className="text-xs text-destructive">{formError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} disabled={submitting}>
              取消
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting}>
              {submitting ? '创建中…' : '创建项目'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
