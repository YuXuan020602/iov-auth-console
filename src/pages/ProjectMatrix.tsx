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
import { GROUP_COLORS, STATUS_COLORS } from '@/data/mock';
import { projectsApi } from '@/lib/api';
import { adaptProject } from '@/lib/adapters';
import { useApiList } from '@/lib/useApiList';
import { Filter, Plus, Download, LayoutGrid, List, Eye, Pencil, Trash2 } from 'lucide-react';

export function ProjectMatrixPage() {
  const { data: projects, error } = useApiList(() => projectsApi.list().then((r) => r.map(adaptProject)));

  return (
    <PageContainer
      title="认证项目矩阵"
      subtitle="CP / AA / HiCar 三组共用 · 技术同步会全景看板"
      actions={
        <>
          <Button variant="outline" size="sm">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            导出清单
          </Button>
          <Button size="sm">
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
              <SelectItem value="产品认证">产品认证</SelectItem>
              <SelectItem value="版本认证">版本认证</SelectItem>
              <SelectItem value="合规认证">合规认证</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="全部">
            <SelectTrigger className="h-8 w-auto text-xs min-w-[110px]">
              <SelectValue placeholder="组" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部</SelectItem>
              <SelectItem value="CP">CP</SelectItem>
              <SelectItem value="AA">AA</SelectItem>
              <SelectItem value="HiCar">HiCar</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="全部">
            <SelectTrigger className="h-8 w-auto text-xs min-w-[110px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部</SelectItem>
              <SelectItem value="认证中">认证中</SelectItem>
              <SelectItem value="进行中">进行中</SelectItem>
              <SelectItem value="阻塞">阻塞</SelectItem>
              <SelectItem value="已通过">已通过</SelectItem>
              <SelectItem value="已终止">已终止</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="车型 / 平台 / 版本…" className="h-8 text-xs max-w-xs" />
        </div>
        <div className="flex items-center gap-1 border-l border-border pl-2">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <List className="w-3.5 h-3.5 mr-1" />
            表格
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
            <LayoutGrid className="w-3.5 h-3.5 mr-1" />
            卡片
          </Button>
        </div>
      </div>

      {error && <div className="text-xs text-destructive">{error}</div>}

      {/* Table */}
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
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
    </PageContainer>
  );
}
