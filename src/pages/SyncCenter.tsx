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
import { syncApi } from '@/lib/api';
import { adaptSyncMessage } from '@/lib/adapters';
import { useApiList } from '@/lib/useApiList';
import { BellRing, Check, AlertTriangle, TrendingUp, Filter, Send, Download, Clock } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  'SOP 更新': 'bg-blue-100 text-blue-700',
  '标准变更': 'bg-purple-100 text-purple-700',
  '项目阻塞': 'bg-amber-100 text-amber-700',
  '认证失败预警': 'bg-red-100 text-red-700',
  '知识复审': 'bg-emerald-100 text-emerald-700',
};

export function SyncCenterPage() {
  const { data: messages, error } = useApiList(() => syncApi.list().then((r) => r.map(adaptSyncMessage)));

  return (
    <PageContainer
      title="同步中心"
      subtitle="标准变更 · SOP 更新 · 项目阻塞 · 认证失败预警 · 订阅 · 已读/待确认回执"
      actions={
        <>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            周报自动汇总
          </Button>
          <Button size="sm">
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
            <TabsTrigger value="SOP 更新" className="text-xs h-7">SOP 更新</TabsTrigger>
            <TabsTrigger value="标准变更" className="text-xs h-7">标准变更</TabsTrigger>
            <TabsTrigger value="项目阻塞" className="text-xs h-7">项目阻塞</TabsTrigger>
            <TabsTrigger value="认证失败预警" className="text-xs h-7">认证失败预警</TabsTrigger>
            <TabsTrigger value="知识复审" className="text-xs h-7">知识复审</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <Filter className="w-3.5 h-3.5 mr-1" />
          订阅设置
        </Button>
      </div>

      {/* Messages list */}
      <div className="space-y-3">
        {messages.map((msg) => {
          const pct = Math.round((msg.confirmedCount / msg.totalCount) * 100);
          const isFullyConfirmed = msg.confirmedCount === msg.totalCount;
          return (
            <Card key={msg.id} className={msg.isUrgent ? 'border-destructive/30' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                    {msg.isUrgent ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <BellRing className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <Badge className={TYPE_COLORS[msg.type] + ' text-[10px]'}>{msg.type}</Badge>
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
                        <Button size="sm" className="h-7 text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          我已确认
                        </Button>
                        {msg.confirmedCount < msg.totalCount && (
                          <Button variant="ghost" size="sm" className="h-6 text-[11px] text-muted-foreground">
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
    </PageContainer>
  );
}
