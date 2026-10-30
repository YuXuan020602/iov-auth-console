import { PageContainer } from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { projectsApi, sopApi, forumApi, knowledgeApi } from '@/lib/api';
import { adaptProject, adaptSOP, adaptForumPost, adaptKnowledge } from '@/lib/adapters';
import { useApiList } from '@/lib/useApiList';
import { Search as SearchIcon, Tag, Flame, BookOpen, FileText, Table2, Plus } from 'lucide-react';

const PREDEFINED_TAGS = {
  认证类型: ['CarPlay', 'Android Auto', 'HiCar', 'CarPlay WAC'],
  问题域: ['连接', '蓝牙', '音频', '视频', '地图', '权限', '崩溃', '工具链', '标准解读'],
  车型平台: ['iPhone 16', 'iPhone 17', '小米 SU7', '比亚迪海豹', '问界 M9'],
  软件版本: ['iOS 18.3', 'iOS 18.4', 'Android 13', 'Android 14', 'HiCar 4.5'],
  密级: ['L1', 'L2', 'L3'],
};

export function SearchPage() {
  const { data: sops, error } = useApiList(() => sopApi.list().then((r) => r.map(adaptSOP)));
  const { data: knowledge } = useApiList(() => knowledgeApi.list().then((r) => r.map(adaptKnowledge)));
  const { data: posts } = useApiList(() => forumApi.list().then((r) => r.map(adaptForumPost)));
  const { data: projects } = useApiList(() => projectsApi.list().then((r) => r.map(adaptProject)));
  const hotSearches = ['v2.1 SOP 蓝牙', 'ANCS 协议', 'Wireshark 抓 CarPlay', 'GB 44495-2024 第 5.3 条', 'HiCar 多屏协同'];

  return (
    <PageContainer
      title="搜索与标签"
      subtitle="统一标签体系 · 全组预定义维度 · 不可随意新增自由标签"
      actions={
        <Button variant="outline" size="sm">
          <Tag className="w-3.5 h-3.5 mr-1.5" />
          申请新增标签
        </Button>
      }
    >
      {/* Main search bar */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="全局搜索：SOP / 知识库 / 论坛 / 项目 · 支持标签语法 认证类型:CarPlay"
            className="pl-10 h-12 text-base border-transparent bg-muted/30 focus:bg-card focus:border-border"
          />
        </div>
        {/* Quick tag chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground mr-1">快速筛选：</span>
          {['认证类型:CarPlay', '问题域:连接', '状态:生效', '组:CP', '版本:iOS 18.4'].map((tag) => (
            <Badge key={tag} variant="outline" className="text-[11px] font-normal cursor-pointer hover:bg-accent">
              {tag} ×
            </Badge>
          ))}
        </div>
      </div>

      {/* Hot searches + recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-amber-500" />
              <div className="text-sm font-medium">本周热门搜索</div>
            </div>
            <div className="space-y-2">
              {hotSearches.map((query, i) => (
                <div key={query} className="flex items-center gap-2 text-sm hover:bg-accent rounded px-2 py-1.5 cursor-pointer">
                  <span className={`w-5 text-center font-semibold text-xs ${i < 3 ? 'text-destructive' : 'text-muted-foreground'}`}>{i + 1}</span>
                  <span className="flex-1 truncate">{query}</span>
                  <span className="text-[10px] text-muted-foreground">{(200 - i * 37).toLocaleString()} 次</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-primary" />
              <div className="text-sm font-medium">你可能感兴趣</div>
            </div>
            <div className="space-y-2">
              {[
                { title: 'CP-SOP-001 v2.1 蓝牙连接稳定性测试', type: 'SOP', hint: '30 天内 47 人使用', icon: <FileText className="w-3 h-3" /> },
                { title: '蓝牙断连高频根因排查清单', type: '知识库', hint: '被 3 条 SOP 引用', icon: <BookOpen className="w-3 h-3" /> },
                { title: 'CarPlay vs HiCar 认证流程差异', type: '知识库', hint: '本周收藏 +12', icon: <BookOpen className="w-3 h-3" /> },
                { title: 'iPhone 17 CarPlay 2026 Q1 认证', type: '项目', hint: '进行中 · 12 SOP', icon: <Table2 className="w-3 h-3" /> },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-accent cursor-pointer">
                  <span className="text-muted-foreground">{r.icon}</span>
                  <span className="flex-1 truncate">{r.title}</span>
                  <span className="text-[10px] text-muted-foreground">{r.hint}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified tag system */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-primary" />
          <div className="text-sm font-medium">统一标签维度（全组预定义，不可随意新增）</div>
          <span className="text-[11px] text-muted-foreground ml-2">新增标签需管理员审批</span>
          <Button variant="outline" size="sm" className="ml-auto h-7 text-xs">
            <Plus className="w-3 h-3 mr-1" />
            申请新增
          </Button>
        </div>
        <div className="rounded-md border border-border bg-card divide-y">
          {Object.entries(PREDEFINED_TAGS).map(([dim, values]) => (
            <div key={dim} className="flex items-start gap-3 p-3">
              <div className="w-24 shrink-0">
                <Badge variant="secondary" className="text-[11px]">{dim}</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {values.map((v) => (
                  <Badge key={v} variant="outline" className="text-[11px] font-normal cursor-pointer hover:bg-accent">
                    {v}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="text-xs text-destructive">{error}</div>}

      {/* Search results preview tabs */}
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="all">
            <TabsList className="h-8 mb-4">
              <TabsTrigger value="all" className="text-xs h-7">全部（{sops.length + knowledge.length + posts.length + projects.length}）</TabsTrigger>
              <TabsTrigger value="sop" className="text-xs h-7">SOP（{sops.length}）</TabsTrigger>
              <TabsTrigger value="kb" className="text-xs h-7">知识库（{knowledge.length}）</TabsTrigger>
              <TabsTrigger value="forum" className="text-xs h-7">论坛（{posts.length}）</TabsTrigger>
              <TabsTrigger value="project" className="text-xs h-7">项目（{projects.length}）</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-0">
              <div className="space-y-2 text-sm">
                {[
                  ...sops.slice(0, 2).map((s) => ({ type: 'SOP', title: `${s.no} · ${s.title}`, hint: `v${s.version} · ${s.group}组 · ${s.status}` })),
                  ...knowledge.slice(0, 2).map((k) => ({ type: '知识库', title: k.title, hint: `${k.category} · ${k.refCount} 次引用` })),
                  ...posts.slice(0, 2).map((p) => ({ type: '论坛', title: p.title, hint: `${p.group} · ${p.replyCount} 回复` })),
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer border-b border-border last:border-0">
                    <Badge variant="secondary" className="text-[10px] w-14 justify-center">{r.type}</Badge>
                    <span className="flex-1 truncate font-medium">{r.title}</span>
                    <span className="text-[11px] text-muted-foreground">{r.hint}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
