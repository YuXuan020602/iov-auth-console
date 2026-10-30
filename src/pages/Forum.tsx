import { PageContainer } from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GROUP_COLORS, PROBLEM_TYPE_COLORS } from '@/data/mock';
import { forumApi } from '@/lib/api';
import { adaptForumPost } from '@/lib/adapters';
import { useApiList } from '@/lib/useApiList';
import { MessageSquarePlus, CheckCircle2, ArrowRight, FileText, Eye, MessageCircle, Lightbulb, Users } from 'lucide-react';

export function ForumPage() {
  const { data: posts, error } = useApiList(() => forumApi.list().then((r) => r.map(adaptForumPost)));

  return (
    <PageContainer
      title="结构化论坛"
      subtitle="发帖必须选认证类型 / 项目 / 版本 / 问题类型 · 避免水化 · 一键转知识库"
      actions={
        <Dialog>
          <DialogTrigger render={<Button size="sm" />}>
            <MessageSquarePlus className="w-3.5 h-3.5 mr-1.5" />
            发帖
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>新建帖子（模板化）</DialogTitle>
              <DialogDescription>必须填写以下元数据，确保帖子可被搜索和筛选。</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">认证类型 <span className="text-destructive">*</span></Label>
                <Select>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cp">CarPlay</SelectItem>
                    <SelectItem value="aa">Android Auto</SelectItem>
                    <SelectItem value="hicar">HiCar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">关联项目</Label>
                <Input className="h-8 text-xs mt-1" placeholder="从项目矩阵选择…" />
              </div>
              <div>
                <Label className="text-xs">软件版本 <span className="text-destructive">*</span></Label>
                <Input className="h-8 text-xs mt-1" placeholder="iOS 18.4 / Android 14" />
              </div>
              <div>
                <Label className="text-xs">问题类型 <span className="text-destructive">*</span></Label>
                <Select>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="func">功能异常</SelectItem>
                    <SelectItem value="conn">连接问题</SelectItem>
                    <SelectItem value="cert">认证失败</SelectItem>
                    <SelectItem value="tool">工具链</SelectItem>
                    <SelectItem value="std">标准解读</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">标题（≤80 字） <span className="text-destructive">*</span></Label>
                <Input className="h-8 text-xs mt-1" placeholder="概括问题，避免“求帮助”" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">正文（推荐模板） <span className="text-destructive">*</span></Label>
                <Textarea className="text-xs mt-1 h-32 font-mono resize-none" placeholder={`### 问题描述\n\n### 复现步骤\n1.\n2.\n\n### 期望结果\n\n### 已尝试方案`} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm">存草稿</Button>
              <Button size="sm">发布帖子</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {error && <div className="text-xs text-destructive">{error}</div>}

      {/* Top summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: '今日新帖', value: posts.length, icon: <MessageSquarePlus className="w-4 h-4 text-sky-500" /> },
          { label: '已解决', value: posts.filter(p => p.hasBestAnswer).length, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
          { label: '待解决', value: posts.filter(p => !p.hasBestAnswer).length, icon: <Lightbulb className="w-4 h-4 text-amber-500" /> },
          { label: '已转知识库', value: posts.filter(p => p.convertedToKB).length, icon: <FileText className="w-4 h-4 text-purple-500" /> },
          { label: '专家在线', value: 3, icon: <Users className="w-4 h-4 text-primary" /> },
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-md border border-border bg-card">
        <Input placeholder="搜索帖子标题/正文" className="h-8 text-xs max-w-sm" />
        <div className="flex-1" />
        <Tabs defaultValue="全部">
          <TabsList className="h-8">
            <TabsTrigger value="全部" className="text-xs h-7">全部</TabsTrigger>
            <TabsTrigger value="未解决" className="text-xs h-7">未解决</TabsTrigger>
            <TabsTrigger value="有最佳答案" className="text-xs h-7">有最佳答案</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select defaultValue="全部">
          <SelectTrigger className="h-8 text-xs min-w-[100px]"><SelectValue placeholder="问题类型" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部</SelectItem>
            <SelectItem value="功能异常">功能异常</SelectItem>
            <SelectItem value="连接问题">连接问题</SelectItem>
            <SelectItem value="认证失败">认证失败</SelectItem>
            <SelectItem value="标准解读">标准解读</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts list */}
      <div className="space-y-2">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-sm transition-shadow cursor-pointer">
            <CardContent className="p-4 flex gap-4">
              {/* Left badge area */}
              <div className="flex flex-col items-center gap-2 shrink-0 pt-0.5">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                  {post.author[0]}
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  <Badge className={GROUP_COLORS[post.group] + ' text-[10px]'}>{post.group}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{post.certType}</Badge>
                  <Badge className={PROBLEM_TYPE_COLORS[post.problemType] + ' text-[10px]'}>{post.problemType}</Badge>
                  <span className="text-[10px] text-muted-foreground ml-1">· v{post.swVersion}</span>
                </div>
                <div className="font-medium text-sm mb-1 flex items-center gap-1.5">
                  {post.title}
                  {post.hasBestAnswer && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      最佳答案
                    </span>
                  )}
                  {post.convertedToKB && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 rounded px-1.5 py-0.5">
                      <FileText className="w-3 h-3" />
                      已转知识库
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                  <span>{post.author}</span>
                  <span>· {post.createdAt}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.replyCount}</span>
                  <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />{post.views}</span>
                </div>
              </div>
              {/* Right actions */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                {post.hasBestAnswer && !post.convertedToKB && (
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    一键转知识库
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
