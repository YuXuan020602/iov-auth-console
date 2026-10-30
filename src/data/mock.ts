// Mock data for the IOV Auth Console prototype

export type Group = 'CP' | 'AA' | 'HiCar';
export type ProjectStatus = '规划中' | '进行中' | '阻塞' | '认证中' | '已通过' | '已终止';
export type SOPStatus = '草稿' | '待审' | '生效' | '归档';
export type SecretLevel = 'L1' | 'L2' | 'L3';
export type ProblemType = '功能异常' | '连接问题' | '认证失败' | '工具链' | '标准解读';

export interface AuthProject {
  id: string;
  name: string;
  group: Group;
  certType: string;
  vehicle: string;
  swVersion: string;
  region: string;
  status: ProjectStatus;
  owner: string;
  startDate: string;
  milestone: string;
  secretLevel: SecretLevel;
  sopCount: number;
  openIssues: number;
}

export interface SOPEntry {
  id: string;
  no: string;
  title: string;
  group: Group;
  version: string;
  status: SOPStatus;
  owner: string;
  certType: string;
  vehicle: string;
  swVersion: string;
  secretLevel: SecretLevel;
  updatedAt: string;
  used30d: boolean;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: string;
  group: Group;
  owner: string;
  updatedAt: string;
  reviewDue: string;
  status: '有效' | '待复审' | '归档';
  refCount: number;
  secretLevel: SecretLevel;
  summary: string;
}

export interface ForumPost {
  id: string;
  title: string;
  group: Group;
  certType: string;
  problemType: ProblemType;
  swVersion: string;
  author: string;
  createdAt: string;
  replyCount: number;
  hasBestAnswer: boolean;
  convertedToKB: boolean;
  views: number;
}

export interface SyncMessage {
  id: string;
  type: '标准变更' | 'SOP 更新' | '项目阻塞' | '认证失败预警' | '知识复审';
  title: string;
  group: Group | '三组';
  issuer: string;
  issuedAt: string;
  confirmedCount: number;
  totalCount: number;
  isUrgent: boolean;
  targetUser: 'all' | string[];
}

export const MOCK_USER = {
  name: '王工',
  group: 'CP' as Group,
  role: '工程师',
  avatar: 'W',
};

export const MOCK_PROJECTS: AuthProject[] = [
  { id: 'p1', name: 'iPhone 17 CarPlay 2026 Q1 认证', group: 'CP', certType: '版本认证', vehicle: 'iPhone 17', swVersion: 'iOS 18.4', region: 'GB 44495', status: '认证中', owner: '王工', startDate: '2026-10-01', milestone: '11/5 终审', secretLevel: 'L1', sopCount: 12, openIssues: 2 },
  { id: 'p2', name: '小米 SU7 HiCar 4.5 产品认证', group: 'HiCar', certType: '产品认证', vehicle: '小米 SU7', swVersion: 'HiCar 4.5', region: 'GB 44495', status: '阻塞', owner: '李工', startDate: '2026-10-28', milestone: '10/29 启动', secretLevel: 'L2', sopCount: 8, openIssues: 5 },
  { id: 'p3', name: '比亚迪海豹 Android Auto 14.0', group: 'AA', certType: '产品认证', vehicle: '比亚迪海豹', swVersion: 'Android Auto 14.0', region: 'EU R155', status: '进行中', owner: '张工', startDate: '2026-09-15', milestone: '12/1 提交报告', secretLevel: 'L1', sopCount: 10, openIssues: 0 },
  { id: 'p4', name: '华为 Mate 70 Pro CarPlay 2025 Q4', group: 'CP', certType: '产品认证', vehicle: '华为 Mate 70 Pro', swVersion: 'iOS 18.3', region: 'GB 44495', status: '已通过', owner: '赵工', startDate: '2026-07-01', milestone: '9/15 终审通过', secretLevel: 'L2', sopCount: 15, openIssues: 0 },
  { id: 'p5', name: '小鹏 G9 HiCar 4.4 升级认证', group: 'HiCar', certType: '版本认证', vehicle: '小鹏 G9', swVersion: 'HiCar 4.4', region: 'GB 44495', status: '规划中', owner: '孙工', startDate: '2026-11-01', milestone: '12/1 启动', secretLevel: 'L1', sopCount: 6, openIssues: 0 },
  { id: 'p6', name: '上汽 ID.4 Android Auto 13.0 合规', group: 'AA', certType: '合规认证', vehicle: '上汽 ID.4', swVersion: 'Android Auto 13.0', region: 'GB 44495 / EU R155', status: '已终止', owner: '周工', startDate: '2026-08-01', milestone: '8/20 终止', secretLevel: 'L3', sopCount: 4, openIssues: 8 },
];

export const MOCK_SOPS: SOPEntry[] = [
  { id: 's1', no: 'CP-SOP-001', title: '蓝牙连接稳定性测试', group: 'CP', version: 'v2.1', status: '生效', owner: '张组长', certType: 'CarPlay', vehicle: 'iPhone 全系列', swVersion: 'iOS 17+', secretLevel: 'L2', updatedAt: '2026-10-15', used30d: true },
  { id: 's2', no: 'CP-SOP-002', title: 'WAC 无线配对测试', group: 'CP', version: 'v1.4', status: '生效', owner: '王工', certType: 'CarPlay WAC', vehicle: 'iPhone 全系列', swVersion: 'iOS 18+', secretLevel: 'L2', updatedAt: '2026-09-20', used30d: true },
  { id: 's3', no: 'CP-SOP-003', title: 'USB 有线连接稳定性', group: 'CP', version: 'v3.0', status: '待审', owner: '王工', certType: 'CarPlay', vehicle: 'iPhone 15+', swVersion: 'iOS 18+', secretLevel: 'L1', updatedAt: '2026-10-27', used30d: false },
  { id: 's4', no: 'AA-SOP-001', title: 'Android Auto 多设备并发连接', group: 'AA', version: 'v2.3', status: '生效', owner: '张组长', certType: 'Android Auto', vehicle: '通用', swVersion: 'Android 13+', secretLevel: 'L1', updatedAt: '2026-10-18', used30d: true },
  { id: 's5', no: 'AA-SOP-002', title: 'Android Auto 音频链路延迟测试', group: 'AA', version: 'v1.0', status: '草稿', owner: '张工', certType: 'Android Auto', vehicle: '通用', swVersion: 'Android 14', secretLevel: 'L2', updatedAt: '2026-10-29', used30d: false },
  { id: 's6', no: 'HC-SOP-001', title: 'HiCar 应用安装与卸载', group: 'HiCar', version: 'v1.3', status: '生效', owner: '李组长', certType: 'HiCar', vehicle: '华为智选全系列', swVersion: 'HiCar 4.0+', secretLevel: 'L1', updatedAt: '2026-10-12', used30d: true },
  { id: 's7', no: 'HC-SOP-002', title: 'HiCar 多屏协同测试', group: 'HiCar', version: 'v2.0', status: '生效', owner: '李工', certType: 'HiCar', vehicle: '问界 M9', swVersion: 'HiCar 4.5', secretLevel: 'L3', updatedAt: '2026-10-22', used30d: false },
];

export const MOCK_KNOWLEDGE: KnowledgeEntry[] = [
  { id: 'k1', title: 'CarPlay vs HiCar 认证流程差异对比', category: '认证差异', group: 'CP', owner: '张组长', updatedAt: '2026-10-10', reviewDue: '2027-04-10', status: '有效', refCount: 28, secretLevel: 'L1', summary: '对比两大生态在资料提交、测试周期、通过率上的核心差异。' },
  { id: 'k2', title: '蓝牙断连高频根因排查清单', category: '踩坑总结', group: 'CP', owner: '王工', updatedAt: '2026-10-20', reviewDue: '2027-04-20', status: '有效', refCount: 156, secretLevel: 'L2', summary: '覆盖 5 类高频断连场景，附抓包要点和 Log 关键字段。' },
  { id: 'k3', title: 'HCI Log 关键字段释义', category: 'Log 分析', group: 'AA', owner: '张工', updatedAt: '2026-09-15', reviewDue: '2027-03-15', status: '有效', refCount: 89, secretLevel: 'L1', summary: 'Android Auto HCI Log 中 20+ 关键字段的详细解读。' },
  { id: 'k4', title: 'Wireshark 抓 CarPlay PCAP 步骤', category: '抓包方法', group: 'CP', owner: '赵工', updatedAt: '2026-08-01', reviewDue: '2027-02-01', status: '有效', refCount: 42, secretLevel: 'L1', summary: '完整抓包流程、常用过滤器、常见坑点。' },
  { id: 'k5', title: '如何申请 CarPlay 测试账号', category: 'FAQ', group: 'CP', owner: '管理员', updatedAt: '2026-09-10', reviewDue: '2027-03-10', status: '有效', refCount: 234, secretLevel: 'L1', summary: '新人 5 分钟搞定测试账号全流程。' },
  { id: 'k6', title: 'ANCS', category: '术语表', group: 'CP', owner: '管理员', updatedAt: '2026-10-01', reviewDue: '2027-04-01', status: '有效', refCount: 67, secretLevel: 'L1', summary: 'Apple Notification Center Service，CarPlay 通知推送协议。' },
  { id: 'k7', title: 'Android Auto 音频延迟问题的根因和规避', category: '踩坑总结', group: 'AA', owner: '李工', updatedAt: '2026-10-05', reviewDue: '2027-04-05', status: '待复审', refCount: 34, secretLevel: 'L2', summary: '音频延迟 > 200ms 的根因分析和解决方案。' },
];

export const MOCK_FORUM_POSTS: ForumPost[] = [
  { id: 'f1', title: 'CarPlay 2026 Q1 蓝牙断连频率明显增加，是标准变更了吗？', group: 'CP', certType: 'CarPlay', problemType: '连接问题', swVersion: 'iOS 18.4', author: '陈工', createdAt: '2026-10-28', replyCount: 8, hasBestAnswer: true, convertedToKB: true, views: 256 },
  { id: 'f2', title: 'Android Auto 14.0 音频延迟 > 300ms，已尝试官方 SOP 未解决', group: 'AA', certType: 'Android Auto', problemType: '功能异常', swVersion: 'Android 14', author: '周工', createdAt: '2026-10-27', replyCount: 15, hasBestAnswer: true, convertedToKB: false, views: 412 },
  { id: 'f3', title: 'HiCar 4.5 多屏协同在问界 M9 上偶发黑屏', group: 'HiCar', certType: 'HiCar', problemType: '功能异常', swVersion: 'HiCar 4.5', author: '孙工', createdAt: '2026-10-28', replyCount: 3, hasBestAnswer: false, convertedToKB: false, views: 89 },
  { id: 'f4', title: 'iAP2 最新标准 GB 44495-2024 第 5.3 条解读', group: 'CP', certType: 'CarPlay', problemType: '标准解读', swVersion: '—', author: '张组长', createdAt: '2026-10-20', replyCount: 22, hasBestAnswer: true, convertedToKB: true, views: 567 },
  { id: 'f5', title: 'CarPlay WAC 配对失败，Log 里全是 "Auth rejected" 怎么办？', group: 'CP', certType: 'CarPlay WAC', problemType: '工具链', swVersion: 'iOS 18.3', author: '刘工', createdAt: '2026-10-25', replyCount: 12, hasBestAnswer: true, convertedToKB: false, views: 301 },
  { id: 'f6', title: '新人请教：测试时如何同时抓 Wireshark + HCI Log？', group: 'AA', certType: 'Android Auto', problemType: '工具链', swVersion: 'Android 13', author: '新员工小吴', createdAt: '2026-10-29', replyCount: 0, hasBestAnswer: false, convertedToKB: false, views: 23 },
];

export const MOCK_SYNC_MESSAGES: SyncMessage[] = [
  { id: 'sm1', type: 'SOP 更新', title: 'CP-SOP-001 蓝牙连接稳定性测试 v2.1 已生效', group: 'CP', issuer: '张组长', issuedAt: '2026-10-15 14:30', confirmedCount: 28, totalCount: 35, isUrgent: false, targetUser: 'all' },
  { id: 'sm2', type: '标准变更', title: '[紧急] Android Auto 14.0 认证标准新增车载音频延迟测试条款', group: 'AA', issuer: 'AA 技术负责人', issuedAt: '2026-10-22 09:00', confirmedCount: 22, totalCount: 22, isUrgent: true, targetUser: 'all' },
  { id: 'sm3', type: '项目阻塞', title: '小米 SU7 HiCar 4.5 项目阻塞：第三方实验室设备故障', group: 'HiCar', issuer: '李工', issuedAt: '2026-10-29 08:00', confirmedCount: 5, totalCount: 12, isUrgent: true, targetUser: ['李组长', '王负责人', '李工'] },
  { id: 'sm4', type: '认证失败预警', title: '上汽 ID.4 Android Auto 13.0 合规认证失败，项目已终止', group: 'AA', issuer: '张组长', issuedAt: '2026-08-20 16:00', confirmedCount: 22, totalCount: 22, isUrgent: true, targetUser: 'all' },
  { id: 'sm5', type: '知识复审', title: '知识条目「Android Auto 音频延迟问题」将于 2027-04-05 到期，请确认', group: 'AA', issuer: '系统自动', issuedAt: '2026-10-06 00:00', confirmedCount: 1, totalCount: 1, isUrgent: false, targetUser: ['李工'] },
];

export const GROUP_COLORS: Record<Group, string> = {
  CP: 'bg-blue-100 text-blue-700',
  AA: 'bg-emerald-100 text-emerald-700',
  HiCar: 'bg-purple-100 text-purple-700',
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  '规划中': 'bg-gray-100 text-gray-700',
  '进行中': 'bg-blue-100 text-blue-700',
  '阻塞': 'bg-amber-100 text-amber-700',
  '认证中': 'bg-indigo-100 text-indigo-700',
  '已通过': 'bg-emerald-100 text-emerald-700',
  '已终止': 'bg-red-100 text-red-700',
};

export const SOP_STATUS_COLORS: Record<SOPStatus, string> = {
  '草稿': 'bg-gray-100 text-gray-700',
  '待审': 'bg-amber-100 text-amber-700',
  '生效': 'bg-emerald-100 text-emerald-700',
  '归档': 'bg-slate-100 text-slate-600',
};

export const PROBLEM_TYPE_COLORS: Record<ProblemType, string> = {
  '功能异常': 'bg-red-100 text-red-700',
  '连接问题': 'bg-amber-100 text-amber-700',
  '认证失败': 'bg-purple-100 text-purple-700',
  '工具链': 'bg-sky-100 text-sky-700',
  '标准解读': 'bg-emerald-100 text-emerald-700',
};
