import { useCallback, useEffect, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/lib/app';
import { SOP_STATUS_COLORS } from '@/data/mock';
import { sopApi } from '@/lib/api';
import { adaptSOP } from '@/lib/adapters';
import type { SOPEntry } from '@/data/mock';
import { Search, Plus, Eye, GitCompare, AlertTriangle, CheckCircle2, FileText, Loader2 } from 'lucide-react';

// MVP 阶段：前端无登录系统，硬编码当前用户为王工
const CURRENT_USER_ID = 'cmvyld7tq0002111gtzavc1jc';

const emptyForm = {
  sopNo: '',
  title: '',
  group: 'CP',
  certType: '',
  vehicle: '',
  secretLevel: 'L1',
};

interface SOPVersionRaw {
  id: string;
  sopId: string;
  versionNo: string;
  body: string;
  changeLog?: string;
  status: 'Draft' | 'Pending' | 'Effective' | 'Archived';
  authorId: string;
  reviewerId?: string | null;
  createdAt: string;
}

interface SOPDetailRaw {
  id: string;
  sopNo: string;
  title: string;
  group: string;
  certType: string;
  vehicle: string;
  version: string;
  secretLevel: string;
  ownerId: string;
  owner?: { id: string; name: string };
  versions: SOPVersionRaw[];
}

function calcNextVersion(current: string): string {
  // 从 v2.1 → v2.2，从 v1 → v1.1
  const m = current.match(/^v?(\d+)(?:\.(\d+))?/);
  if (!m) return 'v0.1';
  const major = parseInt(m[1], 10);
  const minor = m[2] ? parseInt(m[2], 10) + 1 : 1;
  return `v${major}.${minor}`;
}

function backendStatusToUi(s: string): string {
  const map: Record<string, string> = {
    Draft: '草稿',
    Pending: '待审',
    Effective: '生效',
    Archived: '归档',
  };
  return map[s] ?? s;
}

function uiStatusToBackend(s: string): string {
  const map: Record<string, string> = {
    '草稿': 'Draft',
    '待审': 'Pending',
    '生效': 'Effective',
    '归档': 'Archived',
  };
  return map[s] ?? s;
}

export function SOPCenterPage() {
  const [sops, setSops] = useState<SOPEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 新建 SOP
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 查看详情 Dialog
  const [viewOpen, setViewOpen] = useState(false);
  const [viewSop, setViewSop] = useState<SOPDetailRaw | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'effective' | 'all'>('effective');

  // 编辑 Dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editSop, setEditSop] = useState<SOPDetailRaw | null>(null);
  const [editVersionId, setEditVersionId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editChangeLog, setEditChangeLog] = useState('');
  const [editVersionNo, setEditVersionNo] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const { group } = useApp();

  const loadSops = useCallback(() => {
    sopApi.list().then((r) => setSops(r.map(adaptSOP))).catch((e) => setError(e?.message ?? '加载失败'));
  }, []);
  useEffect(() => { loadSops(); }, [loadSops]);

  // ===== 新建 SOP =====
  const handleOpenCreate = useCallback(() => {
    setCreateForm({ ...emptyForm, group });
    setFormError(null);
    setCreateOpen(true);
  }, [group]);

  const handleCreate = useCallback(async () => {
    if (!createForm.sopNo.trim() || !createForm.title.trim() || !createForm.certType.trim() || !createForm.vehicle.trim()) {
      setFormError('请填写 SOP 编号、标题、认证类型和适用车型/平台');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await sopApi.create({
        sopNo: createForm.sopNo.trim(),
        title: createForm.title.trim(),
        group: createForm.group,
        certType: createForm.certType.trim(),
        vehicle: createForm.vehicle.trim(),
        version: 'v0.1',
        ownerId: CURRENT_USER_ID,
        secretLevel: createForm.secretLevel,
      });
      setCreateOpen(false);
      loadSops();
    } catch (e: any) {
      setFormError(e?.message ?? '创建失败');
    } finally {
      setSubmitting(false);
    }
  }, [createForm, loadSops]);

  // ===== 查看 SOP 详情 =====
  const handleViewSop = useCallback(async (sopId: string) => {
    setViewLoading(true);
    setViewError(null);
    setViewSop(null);
    try {
      const detail = await sopApi.get(sopId) as SOPDetailRaw;
      setViewSop(detail);
      setViewOpen(true);
      setViewTab('effective');
    } catch (e: any) {
      setViewError(e?.message ?? '加载失败');
    } finally {
      setViewLoading(false);
    }
  }, []);

  // ===== 编辑 SOP（创建/复用 Draft 版本）=====
  const handleEditSop = useCallback(async (sopId: string) => {
    setEditLoading(true);
    setEditError(null);
    setEditSop(null);
    try {
      const detail = await sopApi.get(sopId) as SOPDetailRaw;
      setEditSop(detail);

      // 1. 找已有的 Draft 版本
      let draft = detail.versions?.find((v) => v.status === 'Draft');
      let body = '';
      let versionNo = '';
      let versionId = '';

      if (draft) {
        // 复用已有 Draft
        versionId = draft.id;
        body = draft.body ?? '';
        versionNo = draft.versionNo;
      } else {
        // 2. 从 Effective 版本复制 body，创建新 Draft
        const effective = detail.versions?.find((v) => v.status === 'Effective');
        body = effective?.body ?? '';
        versionNo = calcNextVersion(detail.version ?? 'v0.1');

        const newDraft = await sopApi.createVersion(sopId, {
          versionNo,
          body: body || `# ${detail.title}\n\n（新 SOP 草稿，请填写详细内容）`,
          changeLog: '',
          authorId: CURRENT_USER_ID,
          status: 'Draft',
        });
        versionId = newDraft.id;
      }

      setEditVersionId(versionId);
      setEditBody(body);
      setEditVersionNo(versionNo);
      setEditChangeLog(draft?.changeLog ?? '');
      setEditOpen(true);
    } catch (e: any) {
      setEditError(e?.message ?? '加载失败');
    } finally {
      setEditLoading(false);
    }
  }, []);

  // ===== 保存草稿 =====
  const handleSaveDraft = useCallback(async () => {
    if (!editVersionId) return;
    setEditSaving(true);
    setEditError(null);
    try {
      await sopApi.updateVersion(editVersionId, {
        body: editBody,
        changeLog: editChangeLog,
        versionNo: editVersionNo,
      });
      alert('✅ 草稿已保存！');
    } catch (e: any) {
      setEditError(e?.message ?? '保存失败');
    } finally {
      setEditSaving(false);
    }
  }, [editVersionId, editBody, editChangeLog, editVersionNo]);

  // ===== 提交审批 =====
  const handleSubmitApproval = useCallback(async () => {
    if (!editVersionId || !editSop) return;
    if (!editBody.trim()) {
      setEditError('正文不能为空');
      return;
    }
    if (!confirm(`确认提交 ${editSop.title} ${editVersionNo} 审批？\n\n提交后将进入 Pending 状态，等待组长审批。`)) return;

    setEditSaving(true);
    setEditError(null);
    try {
      // 先保存最新内容
      await sopApi.updateVersion(editVersionId, {
        body: editBody,
        changeLog: editChangeLog,
        versionNo: editVersionNo,
      });
      // 再提交审批
      await sopApi.submitVersion(editVersionId);
      alert('🎉 已提交审批！\n\n版本状态将变为 Pending，组长审批通过后自动生效。');
      setEditOpen(false);
      loadSops();
    } catch (e: any) {
      setEditError(e?.message ?? '提交失败');
    } finally {
      setEditSaving(false);
    }
  }, [editVersionId, editSop, editBody, editChangeLog, editVersionNo, loadSops]);

  // ===== 审批操作（审批卡片的"查看并审批"按钮）=====
  const handleApproveVersion = useCallback(async (versionId: string, sopTitle: string, versionNo: string) => {
    if (!confirm(`确认审批通过 ${sopTitle} ${versionNo}？\n\n通过后当前 Effective 版本将自动归档，此版本成为新的生效版。`)) return;
    try {
      await sopApi.approveVersion(versionId, CURRENT_USER_ID);
      alert('✅ 审批通过！新版本已生效。');
      loadSops();
    } catch (e: any) {
      alert('审批失败：' + (e?.message ?? e));
    }
  }, [loadSops]);

  const handleRejectVersion = useCallback(async (versionId: string, sopTitle: string, versionNo: string) => {
    if (!confirm(`确认驳回 ${sopTitle} ${versionNo}？\n\n驳回后版本退回 Draft 状态，作者可继续编辑。`)) return;
    try {
      await sopApi.rejectVersion(versionId, CURRENT_USER_ID);
      alert('已驳回，版本退回 Draft。');
      loadSops();
    } catch (e: any) {
      alert('驳回失败：' + (e?.message ?? e));
    }
  }, [loadSops]);

  // 辅助：找 Effective/Draft 版本
  const getEffectiveVersion = (sop: SOPDetailRaw) => sop.versions?.find((v) => v.status === 'Effective');
  const getDraftVersion = (sop: SOPDetailRaw) => sop.versions?.find((v) => v.status === 'Draft');

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
          <Button variant="outline" size="sm" onClick={() => alert('按条款搜索（TODO）\n\n支持按 SOP 条款编号、标准章节号、关键术语全文检索。')}>
            <Search className="w-3.5 h-3.5 mr-1.5" />
            按条款搜索
          </Button>
          <Button size="sm" onClick={handleOpenCreate}>
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
        <Button size="sm" variant="destructive" className="h-7 text-xs shrink-0" onClick={() => alert('即将跳转到 CP-SOP-001 v2.1 生效版（TODO）')}>
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
                  <div key={s.id} className="flex items-center gap-3 px-3 py-2 border-b border-amber-200 last:border-0 hover:bg-white/50">
                    <div className="text-xs font-mono text-muted-foreground w-28">{s.no}</div>
                    <div className="flex-1 text-sm truncate">{s.title}</div>
                    <Badge className={SOP_STATUS_COLORS[s.status] + ' text-[10px]'}>{s.status}</Badge>
                    <span className="text-[11px] text-muted-foreground">v{s.version}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleEditSop(s.id)}
                    >
                      {s.status === '待审' ? '查看并审批' : '继续编辑'}
                    </Button>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="查看详情"
                              disabled={viewLoading && viewSop?.id === s.id}
                              onClick={() => handleViewSop(s.id)}
                            >
                              {viewLoading && viewSop?.id === s.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Eye className="w-3.5 h-3.5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="编辑 / 创建新版本"
                              disabled={editLoading && editSop?.id === s.id}
                              onClick={() => handleEditSop(s.id)}
                            >
                              {editLoading && editSop?.id === s.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <GitCompare className="w-3.5 h-3.5" />}
                            </Button>
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

      {/* 新建 SOP 弹窗 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新建 SOP</DialogTitle>
            <DialogDescription>创建 SOP 基本信息后，可在详情中继续编写 v0.1 初版内容。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label className="text-xs">SOP 编号 *</Label>
              <Input
                className="h-8 text-sm"
                placeholder="如 SOP-CP-CCC-010"
                value={createForm.sopNo}
                onChange={(e) => setCreateForm({ ...createForm, sopNo: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">标题 *</Label>
              <Input
                className="h-8 text-sm"
                placeholder="SOP 标题"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">所属组</Label>
                <select
                  className="h-8 rounded-md border border-border bg-transparent px-2 text-sm"
                  value={createForm.group}
                  onChange={(e) => setCreateForm({ ...createForm, group: e.target.value })}
                >
                  <option value="CP">CP</option>
                  <option value="AA">AA</option>
                  <option value="HiCar">HiCar</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">认证类型 *</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="如 CCC / 3C / HiCar"
                  value={createForm.certType}
                  onChange={(e) => setCreateForm({ ...createForm, certType: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">适用车型/平台 *</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="如 Android 车机"
                  value={createForm.vehicle}
                  onChange={(e) => setCreateForm({ ...createForm, vehicle: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">密级</Label>
                <select
                  className="h-8 rounded-md border border-border bg-transparent px-2 text-sm"
                  value={createForm.secretLevel}
                  onChange={(e) => setCreateForm({ ...createForm, secretLevel: e.target.value })}
                >
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                  <option value="L3">L3</option>
                </select>
              </div>
            </div>
            {formError && <div className="text-xs text-destructive">{formError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)} disabled={submitting}>
              取消
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting}>
              {submitting ? '创建中…' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看 SOP 详情 Dialog */}
      <Dialog open={viewOpen} onOpenChange={(o) => { if (!o) setViewSop(null); setViewOpen(o); }}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewSop && (
                <>
                  <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{viewSop.sopNo}</code>
                  <span>{viewSop.title}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {viewSop && (
                <span>
                  {viewSop.group} · {viewSop.certType} · {viewSop.vehicle} · 当前版本 {viewSop.version}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {viewLoading && !viewSop && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                加载中…
              </div>
            )}
            {viewError && (
              <div className="text-sm text-destructive text-center py-12">{viewError}</div>
            )}
            {viewSop && (
              <div className="space-y-4 py-2">
                {/* 版本切换 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground mr-1">版本：</span>
                  {viewSop.versions
                    ?.slice()
                    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                    .map((v) => (
                      <Badge
                        key={v.id}
                        variant={v.status === 'Effective' ? 'default' : 'outline'}
                        className="text-[10px] cursor-pointer"
                      >
                        {v.versionNo} · {backendStatusToUi(v.status)}
                      </Badge>
                    ))}
                </div>

                {/* 生效版正文 */}
                {viewTab === 'effective' && (
                  <div>
                    {(() => {
                      const eff = getEffectiveVersion(viewSop);
                      if (!eff) return <div className="text-sm text-muted-foreground text-center py-8">该 SOP 暂无生效版本</div>;
                      return (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-emerald-600">
                              ✅ 生效版 {eff.versionNo}
                              {eff.changeLog && <span className="text-muted-foreground ml-2">— {eff.changeLog}</span>}
                            </span>
                          </div>
                          <pre className="bg-muted/50 rounded-md p-4 text-xs font-mono whitespace-pre-wrap break-words border border-border max-h-[50vh] overflow-auto">
{eff.body || '（此版本暂无正文内容）'}
                          </pre>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 所有版本列表 */}
                {viewTab === 'all' && (
                  <div className="space-y-3">
                    {viewSop.versions
                      ?.slice()
                      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                      .map((v) => (
                        <div key={v.id} className="rounded-md border border-border p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Badge className={SOP_STATUS_COLORS[backendStatusToUi(v.status) as any] + ' text-[10px]'}>
                                {backendStatusToUi(v.status)}
                              </Badge>
                              <span className="text-sm font-medium">{v.versionNo}</span>
                              <span className="text-[11px] text-muted-foreground">· {v.createdAt?.slice(0, 10) ?? ''}</span>
                            </div>
                            {v.status === 'Pending' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[11px] border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                  onClick={() => handleApproveVersion(v.id, viewSop.title, v.versionNo)}
                                >
                                  通过
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[11px] border-destructive/50 text-destructive hover:bg-destructive/5"
                                  onClick={() => handleRejectVersion(v.id, viewSop.title, v.versionNo)}
                                >
                                  驳回
                                </Button>
                              </div>
                            )}
                          </div>
                          {v.changeLog && <div className="text-[11px] text-muted-foreground mb-1">变更说明：{v.changeLog}</div>}
                          <pre className="text-xs font-mono whitespace-pre-wrap break-words text-muted-foreground bg-muted/30 rounded p-2 max-h-[200px] overflow-auto">
{v.body || '（无正文）'}
                          </pre>
                        </div>
                      ))}
                    {(!viewSop.versions || viewSop.versions.length === 0) && (
                      <div className="text-sm text-muted-foreground text-center py-8">暂无版本记录</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {viewSop && (
            <DialogFooter className="border-t border-border pt-3 mt-2">
              <div className="flex gap-2">
                <Button
                  variant={viewTab === 'effective' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewTab('effective')}
                >
                  生效版
                </Button>
                <Button
                  variant={viewTab === 'all' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewTab('all')}
                >
                  全部版本（{viewSop.versions?.length ?? 0}）
                </Button>
              </div>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewOpen(false)}
              >
                关闭
              </Button>
              <Button
                size="sm"
                onClick={() => { setViewOpen(false); handleEditSop(viewSop.id); }}
              >
                编辑此 SOP
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* 编辑 SOP Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { if (!o) setEditSop(null); setEditOpen(o); }}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editSop && (
                <>
                  <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{editSop.sopNo}</code>
                  <span>{editSop.title}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editSop && (
                <span>
                  当前版本号：
                  <input
                    className="w-20 ml-1 h-6 rounded border border-border px-1 text-xs font-mono"
                    value={editVersionNo}
                    onChange={(e) => setEditVersionNo(e.target.value)}
                  />
                  {' · '}
                  <span className="text-amber-600">草稿状态</span>（保存草稿 / 提交审批）
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            {editLoading && !editSop && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {editError || '加载中…'}
              </div>
            )}
            {editError && !editLoading && (
              <div className="text-xs text-destructive bg-destructive/10 rounded p-2">{editError}</div>
            )}
            {editSop && (
              <>
                <div className="grid gap-1.5">
                  <Label className="text-xs">变更说明（可选）</Label>
                  <Input
                    className="h-8 text-sm"
                    placeholder="简要描述本次修改了什么..."
                    value={editChangeLog}
                    onChange={(e) => setEditChangeLog(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">
                    SOP 正文（Markdown）*
                    <span className="text-muted-foreground ml-2">支持 # 标题、## 二级标题、- 列表、### 问题描述 等 Markdown 语法</span>
                  </Label>
                  <Textarea
                    className="min-h-[350px] text-xs font-mono leading-relaxed"
                    placeholder={`# SOP 标题

## 适用范围

## 前置条件

## 测试步骤

1.
2.

## 预期结果

## 注意事项`}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                  />
                </div>

                {/* 关联版本信息 */}
                <div className="text-[11px] text-muted-foreground bg-muted/30 rounded p-2 border border-dashed border-border">
                  💡 此草稿基于 {editSop.version} 生效版创建，编辑完成后可选择「保存草稿」继续修改，或「提交审批」进入审核流程。
                </div>
              </>
            )}
          </div>
          <DialogFooter className="border-t border-border pt-3 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(false)}
              disabled={editSaving}
            >
              取消
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={editSaving}
            >
              {editSaving ? '保存中…' : '💾 保存草稿'}
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitApproval}
              disabled={editSaving}
            >
              {editSaving ? '提交中…' : '🚀 提交审批'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
