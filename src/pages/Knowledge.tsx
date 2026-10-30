import { PageContainer } from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
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
  Card,
  CardContent,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GROUP_COLORS } from '@/data/mock';
import { knowledgeApi } from '@/lib/api';
import { adaptKnowledge } from '@/lib/adapters';
import { useApiList } from '@/lib/useApiList';
import { BookOpen, Plus, Search, Clock, AlertTriangle, Eye } from 'lucide-react';

const CATEGORIES = ['全部', '认证差异', '踩坑总结', 'Log 分析', '抓包方法', 'FAQ', '术语表'];

export function KnowledgePage() {
  const { data: knowledge, error } = useApiList(() => knowledgeApi.list().then((r) => r.map(adaptKnowledge)));
  const expiring = knowledge.filter((k) => k.status === '待复审');

  return (
    <PageContainer
      title="知识库"
      subtitle="认证差异 · 踩坑总结 · Log 分析 · 抓包方法 · FAQ · 术语表"
      actions={
        <>
          <Button variant="outline" size="sm">
            <Search className="w-3.5 h-3.5 mr-1.5" />
            全文搜索
          </Button>
          <Button size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            新建条目
          </Button>
        </>
      }
    >
      {error && <div className="text-xs text-destructive">{error}</div>}

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: '全部条目', count: knowledge.length, icon: <BookOpen className="w-4 h-4" /> },
          { label: '认证差异', count: knowledge.filter(k => k.category === '认证差异').length, icon: <BookOpen className="w-4 h-4" /> },
          { label: '踩坑总结', count: knowledge.filter(k => k.category === '踩坑总结').length, icon: <AlertTriangle className="w-4 h-4" /> },
          { label: 'FAQ', count: knowledge.filter(k => k.category === 'FAQ').length, icon: <BookOpen className="w-4 h-4" /> },
          { label: '术语表', count: knowledge.filter(k => k.category === '术语表').length, icon: <BookOpen className="w-4 h-4" /> },
          { label: '待复审', count: expiring.length, color: 'text-amber-600', icon: <Clock className="w-4 h-4" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1.5">
              {s.icon}
              {s.label}
            </div>
            <div className={`text-xl font-semibold ${s.color || ''}`}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* Expiring review notice */}
      {expiring.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <div className="font-medium text-amber-700">{expiring.length} 条知识库条目需要复审确认</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              责任人 30 天内未确认将自动升级至组长。
              {expiring.map((e) => (
                <span key={e.id} className="inline-flex items-center mx-1.5 text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
                  {e.title} → {e.reviewDue}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-md border border-border bg-card">
        <Tabs defaultValue="全部" className="flex-1">
          <TabsList className="h-8">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c} className="text-xs px-2.5 h-7">
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Select defaultValue="全部">
          <SelectTrigger className="h-8 text-xs min-w-[100px]">
            <SelectValue placeholder="所属组" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部</SelectItem>
            <SelectItem value="CP">CP</SelectItem>
            <SelectItem value="AA">AA</SelectItem>
            <SelectItem value="HiCar">HiCar</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="全部">
          <SelectTrigger className="h-8 text-xs min-w-[110px]">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部</SelectItem>
            <SelectItem value="有效">有效</SelectItem>
            <SelectItem value="待复审">待复审</SelectItem>
            <SelectItem value="归档">归档</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entries list */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-xs">标题</TableHead>
                <TableHead className="text-xs">分类</TableHead>
                <TableHead className="text-xs">组</TableHead>
                <TableHead className="text-xs">责任人</TableHead>
                <TableHead className="text-xs">引用次数</TableHead>
                <TableHead className="text-xs">复审到期</TableHead>
                <TableHead className="text-xs">状态</TableHead>
                <TableHead className="text-xs">密级</TableHead>
                <TableHead className="text-xs text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {knowledge.map((k) => (
                <TableRow key={k.id} className="hover:bg-muted/30 cursor-pointer">
                  <TableCell>
                    <div className="font-medium text-sm">{k.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{k.summary}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">{k.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={GROUP_COLORS[k.group] + ' text-[10px]'}>{k.group}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{k.owner}</TableCell>
                  <TableCell className="text-xs font-medium">{k.refCount}</TableCell>
                  <TableCell>
                    <div className="text-xs">{k.reviewDue}</div>
                    {k.status === '待复审' && (
                      <div className="text-[10px] text-amber-600 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        待确认
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {k.status === '有效' && <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">有效</Badge>}
                    {k.status === '待复审' && <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200">待复审</Badge>}
                    {k.status === '归档' && <Badge variant="outline" className="text-[10px] text-muted-foreground">归档</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal">{k.secretLevel}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="w-3.5 h-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
