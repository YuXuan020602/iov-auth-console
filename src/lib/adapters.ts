// 后端 Prisma 实体 → 前端页面使用的类型（字段名/枚举值转换）
import type {
  AuthProject, SOPEntry, KnowledgeEntry, ForumPost, SyncMessage,
  ProjectStatus, SOPStatus, Group, SecretLevel, ProblemType,
} from '@/data/mock';

// ---------- 通用 ----------
const dateOnly = (v?: string | null) => (v ? v.slice(0, 10) : '—');
const dateTime = (v?: string | null) => (v ? `${v.slice(0, 10)} ${v.slice(11, 16)}` : '—');

// ---------- 项目 ----------
const PROJECT_STATUS: Record<string, ProjectStatus> = {
  Planning: '规划中',
  Ongoing: '进行中',
  Blocked: '阻塞',
  Certifying: '认证中',
  Passed: '已通过',
  Terminated: '已终止',
};

export const adaptProject = (p: any): AuthProject => ({
  id: p.id,
  name: p.name,
  group: (p.group ?? 'CP') as Group,
  certType: p.certType ?? '—',
  vehicle: p.vehiclePlatform ?? '—',
  swVersion: p.swVersion ?? '—',
  region: p.region ?? '—',
  status: PROJECT_STATUS[p.status] ?? '规划中',
  owner: p.owner?.name ?? '—',
  startDate: dateOnly(p.startDate),
  milestone: p.milestone ?? dateOnly(p.endDate),
  secretLevel: (p.secretLevel ?? 'L1') as SecretLevel,
  sopCount: p.sopCount ?? 0,
  openIssues: p.openIssues ?? 0,
});

// ---------- SOP ----------
// 后端 SOP 列表未返回 status / swVersion / used30d，按原型默认值补全
export const adaptSOP = (s: any): SOPEntry => ({
  id: s.id,
  no: s.sopNo,
  title: s.title,
  group: (s.group ?? 'CP') as Group,
  version: s.version ?? 'v0.1',
  status: '生效' as SOPStatus,
  owner: s.owner?.name ?? '—',
  certType: s.certType ?? '—',
  vehicle: s.vehicle ?? '—',
  swVersion: '—',
  secretLevel: (s.secretLevel ?? 'L1') as SecretLevel,
  updatedAt: dateOnly(s.updatedAt),
  used30d: true,
});

// ---------- 知识库 ----------
const KB_STATUS: Record<string, KnowledgeEntry['status']> = {
  Valid: '有效',
  PendingReview: '待复审',
  Archived: '归档',
};

export const adaptKnowledge = (k: any): KnowledgeEntry => ({
  id: k.id,
  title: k.title,
  category: k.category ?? '—',
  group: (k.group ?? 'CP') as Group,
  owner: k.owner?.name ?? '—',
  updatedAt: dateOnly(k.updatedAt),
  reviewDue: dateOnly(k.reviewDue),
  status: KB_STATUS[k.status] ?? '有效',
  refCount: k.refCount ?? 0,
  secretLevel: (k.secretLevel ?? 'L1') as SecretLevel,
  summary: k.summary ?? '',
});

// ---------- 论坛 ----------
const PROBLEM_TYPE: Record<string, ProblemType> = {
  FuncError: '功能异常',
  Connection: '连接问题',
  CertFail: '认证失败',
  Toolchain: '工具链',
  StdInterp: '标准解读',
};

export const adaptForumPost = (f: any): ForumPost => ({
  id: f.id,
  title: f.title,
  group: (f.group ?? 'CP') as Group,
  certType: f.certType ?? '—',
  problemType: PROBLEM_TYPE[f.problemType] ?? '功能异常',
  swVersion: f.swVersion ?? '—',
  author: f.author?.name ?? '—',
  createdAt: dateOnly(f.createdAt),
  replyCount: f._count?.replies ?? 0,
  hasBestAnswer: !!f.bestReplyId,
  convertedToKB: f.status === 'Converted',
  views: f.viewCount ?? 0,
});

// ---------- 同步 ----------
const SYNC_TYPE: Record<string, SyncMessage['type']> = {
  StdChange: '标准变更',
  SOPUpdate: 'SOP 更新',
  ProjectBlock: '项目阻塞',
  CertFailure: '认证失败预警',
  KnowledgeReview: '知识复审',
};

export const adaptSyncMessage = (m: any): SyncMessage => ({
  id: m.id,
  type: SYNC_TYPE[m.type] ?? '标准变更',
  title: m.title,
  group: (m.group ?? '三组') as SyncMessage['group'],
  issuer: m.issuer?.name ?? '系统',
  issuedAt: dateTime(m.issuedAt),
  confirmedCount: m.confirmedCount ?? 0,
  totalCount: m.totalCount ?? 0,
  isUrgent: !!m.isUrgent,
  targetUser: m.targetUsers ? safeParseArray(m.targetUsers) : 'all',
});

function safeParseArray(v: any): string[] {
  if (Array.isArray(v)) return v;
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
