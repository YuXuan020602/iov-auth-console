import { useCallback, useEffect, useState } from 'react';
import { PageContainer } from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { syncApi } from '@/lib/api';
import { adaptSyncMessage } from '@/lib/adapters';
import type { SyncMessage } from '@/data/mock';
import { BellRing, Check, AlertTriangle, TrendingUp, Filter, Send, Download, Clock } from 'lucide-react';

// MVP 阶段：前端无登录系统，硬编码当前用户为王工
const CURRENT_USER_ID = 'cmvyld7tq0002111gtzavc1jc';

const TYPE_OPTIONS = [
  { value: 'StdChange', label: '标准变更' },
  { value: 'SOPUpdate', label: 'SOP 更新' },
  { value: 'ProjectBlock', label: '项目阻塞' },
  { value: 'CertFailure', label: '认证失败预警' },
  { value: 'KnowledgeReview', label: '知识复审' },
];

const GROUP_OPTIONS = ['CP', 'AA', 'HiCar'];

const TYPE_LABEL: Record<string, string> = {
  StdChange: '标准变更',
  SOPUpdate: 'SOP 更新',
  ProjectBlock: '项目阻塞',
  CertFailure: '认证失败预警',
  KnowledgeReview: '知识复审',
};

const TYPE_COLORS: Record<string, string> = {
  StdChange: 'bg-purple-100 text-purple-700',
  SOPUpdate: 'bg-blue-100 text-blue-700',
  ProjectBlock: 'bg-amber-100 text-amber-700',
  CertFailure: 'bg-red-100 text-red-700',
  KnowledgeReview: 'bg-emerald-100 text-emerald-700',
  // fallback 兼容旧数据
  '标准变更': 'bg-purple-100 text-purple-700',
  'SOP 更新': 'bg-blue-100 text-blue-700',
  '项目阻塞': 'bg-amber-100 text-amber-700',
  '认证失败预警': 'bg-red-100 text-red-700',
  '知识复审': 'bg-emerald-100 text-emerald-700',
};

function getWeekString() {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const week = Math.ceil((days + start.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

const emptyForm = {
  type: 'SOPUpdate' as string,
  title: '',
  body: '',
  group: 'CP',
  isUrgent: false,
};

export function SyncCenterPage() {
  const [messages, setMessages] = useState<SyncMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 发布新同步
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishForm, setPublishForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 周报汇总 loading
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  // 确认 loading（per-row）
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const load = useCallback(() => {
    syncApi.list()
      .then((r) => setMessages(r.map(adaptSyncMessage)))
      .catch((e) => setError(e?.message ?? '加载失败'));
  }, []);
  useEffect(() => { load(); }, [load]);

  // ===== 发布新同步 =====
  const handleOpenPublish = useCallback(() => {
    setPublishForm(emptyForm);
    setFormError(null);
    setPublishOpen(true);
  }, []);

  const handlePublish = useCallback(async () => {
    if (!publishForm.title.trim() || !publishForm.body.trim()) {
      setFormError('请填写标题和正文');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await syncApi.publish({
        type: publishForm.type,
        title: publishForm.title.trim(),
        body: publishForm.body.trim(),
        group: publishForm.group,
        issuerId: CURRENT_USER_ID,
        issuer: '王工',
        targetUsers: null,
        isUrgent: publishForm.isUrgent,
        confirmedCount: 0,
        totalCount: 12,
      });
      setPublishOpen(false);
      load();
    } catch (e: any) {
      setFormError(e?.message ?? '发布失败');
    } finally {
      setSubmitting(false);
    }
  }, [publishForm, load]);

  // ===== 我已确认 =====
  const handleConfirm = useCallback(async (id: string) => {
    setConfirmingId(id);
    try {
      await syncApi.confirm(id, CURRENT_USER_ID);
      load();
    } catch (e: any) {
      alert('确认失败：' + (e?.message ?? e));
    } finally {
      setConfirmingId(null);
    }
  }, [load]);

  // ===== 周报自动汇总 =====
  const handleWeeklyReport = useCallback(async () => {
    const week = getWeekString();
    if (!confirm(`确认生成 ${week} 周报自动汇总？将调用后端聚合 SOP/项目/论坛数据。`)) return;
    setWeeklyLoading(true);
    try {
      const result = await syncApi.weeklyReport(week);
      alert(`周报生成成功！\n\n周次：${week}\n\n${typeof result === 'string' ? result : JSON.stringify(result, null, 2)}`);
    } catch (e: any) {
      alert('周报生成失败：' + (e?.message ?? e));
    } finally {
      setWeeklyLoading(false);
    }
  }, []);

  // ===== 订阅设置 =====
  const handleSubscribeSettings = useCallback(() => {
    alert('订阅设置（TODO）\n\n此处将支持：\n• 按组订阅同步消息\n• 指定消息类型（标准变更/SOP更新/项目阻塞/认证失败预警/知识复审）\n• 通知方式（站内信/邮件/Webhook）\n• 免打扰时段');
  }, []);

  // ===== 导出名单 =====
  const handleExportList = useCallback((msg: SyncMessage) => {
    alert(`导出确认名单（TODO）\n\n消息：${msg.title}\n类型：${TYPE_LABEL[msg.type] ?? msg.type}\n\n将导出 CSV，包含：\n• 已确认人员列表\n• 未确认人员列表\n• 超时自动抄送组长记录`);
  }, []);

  return (
    <PageContainer
      title="同步中心"
      subtitle="标准变更 · SOP 更新 · 项目阻塞 · 认证失败预警 · 订阅 · 已读/待确认回执"
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleWeeklyReport}
            disabled={weeklyLoading}
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            {weeklyLoading ? '生成中…' : '周报自动汇总'}
          </Button>
          <Button size="sm" onClick={handleOpenPublish}>
            <Send className="w-3.5 h-3.5 mr-1.5" />
            发布新同步
          </Button>
        </>
      }
    >
      {error && <div className="text-xs text-destructive">{error}</div>}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: '本周同步', value: messages.length, icon: <BellRing className="w-4 h-4 text-primary" /> },
          { label: '紧急消息', value: messages.filter(m => m.isUrgent).length, icon: <AlertTriangle className="w-4 h-4 text-destructive" /> },
          { label: '未确认超时', value: 3, icon: <Clock className="w-4 h-4 text-amber-600" /> },
          { label: '平均确认率', value: '89%', icon: <Check className="w-4 h-4 text-emerald-500" /> },
          { label: '自动抄送组长', value: 2, icon: <BellRing className="w-4 h-4 text-sky-500" /> },
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

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Tabs defaultValue="全部" className="flex-1">
          <TabsList className="h-8">
            <TabsTrigger value="全部" className="text-xs h-7">全部</TabsTrigger>
            {TYPE_OPTIONS.map((t) => (
              <TabsTrigger key={t.value} value={t.label} className="text-xs h-7">{t.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleSubscribeSettings}>
          <Filter className="w-3.5 h-3.5 mr-1" />
          订阅设置
        </Button>
      </div>

      {/* Messages list */}
      <div className="space-y-3">
        {messages.map((msg) => {
          const pct = Math.round((msg.confirmedCount / msg.totalCount) * 100);
          const isFullyConfirmed = msg.confirmedCount === msg.totalCount;
          const typeLabel = TYPE_LABEL[msg.type] ?? msg.type;
          return (
            <Card key={msg.id} className={msg.isUrgent ? 'border-destructive/30' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                    {msg.isUrgent ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <BellRing className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <Badge className={(TYPE_COLORS[msg.type] ?? 'bg-slate-100 text-slate-700') + ' text-[10px]'}>{typeLabel}</Badge>
                      <Badge variant="outline" className="text-[10px] font-normal">{msg.group}</Badge>
                      {msg.isUrgent && <Badge variant="destructive" className="text-[10px]">紧急</Badge>}
                      {isFullyConfirmed && <Badge className="text-[10px] bg-emerald-100 text-emerald-700">全部确认</Badge>}
                    </div>
                    <div className="font-medium text-sm mb-1">{msg.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      发送人：{msg.issuer} · {msg.issuedAt}
                      {msg.targetUser !== 'all' && (
                        <span className="ml-2">· 指定收件人：{Array.isArray(msg.targetUser) ? msg.targetUser.join('、') : '全部'}</span>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={pct} className="h-2 flex-1" />
                      <span className="text-xs font-medium whitespace-nowrap">
                        已确认 {msg.confirmedCount}/{msg.totalCount}（{pct}%）
                      </span>
                    </div>

                    {/* Ack lists */}
                    {!isFullyConfirmed && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2">
                          <div className="text-[11px] font-medium text-emerald-700 mb-1">
                            ✅ 已确认（{msg.confirmedCount}）
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            王工、张工、李组长、赵工、孙工 …
                          </div>
                        </div>
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-2">
                          <div className="text-[11px] font-medium text-amber-700 mb-1">
                            ⏳ 未确认（{msg.totalCount - msg.confirmedCount}）
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {msg.totalCount - msg.confirmedCount === 0
                              ? '无'
                              : '陈工、周工 …（已自动抄送至组长）'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Action button */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {!isFullyConfirmed && (
                      <>
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          disabled={confirmingId === msg.id}
                          onClick={() => handleConfirm(msg.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          {confirmingId === msg.id ? '确认中…' : '我已确认'}
                        </Button>
                        {msg.confirmedCount < msg.totalCount && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[11px] text-muted-foreground"
                            onClick={() => handleExportList(msg)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            导出名单
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 发布新同步 Dialog */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>发布新同步消息</DialogTitle>
            <DialogDescription>发布后将推送到指定组，相关人员需确认接收。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">消息类型 *</Label>
                <Select value={publishForm.type} onValueChange={(v) => setPublishForm({ ...publishForm, type: v })}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">目标组 *</Label>
                <Select value={publishForm.group} onValueChange={(v) => setPublishForm({ ...publishForm, group: v })}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">标题 *</Label>
              <Input
                className="h-8 text-sm"
                placeholder="简洁描述同步内容"
                value={publishForm.title}
                onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">正文 *</Label>
              <Textarea
                className="min-h-[100px] text-sm"
                placeholder="详细描述变更内容、影响范围、需要各方确认的事项..."
                value={publishForm.body}
                onChange={(e) => setPublishForm({ ...publishForm, body: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="urgent"
                checked={publishForm.isUrgent}
                onChange={(e) => setPublishForm({ ...publishForm, isUrgent: e.target.checked })}
              />
              <label htmlFor="urgent" className="text-xs cursor-pointer">标记为紧急（红色警示 + 短信通知组长）</label>
            </div>
            {formError && <div className="text-xs text-destructive">{formError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPublishOpen(false)} disabled={submitting}>
              取消
            </Button>
            <Button size="sm" onClick={handlePublish} disabled={submitting}>
              {submitting ? '发布中…' : '发布同步'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
