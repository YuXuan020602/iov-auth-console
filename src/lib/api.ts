// API Client — 统一封装 fetch，对接 NestJS 后端
// 后端统一响应格式: { code: 0, data: T, message: 'ok' }
// 后端版本前缀: /api/v1

// 开发环境走 Vite proxy（相对路径）；生产环境由 VITE_API_BASE 指定后端域名
const API_ORIGIN = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');
const API_BASE = `${API_ORIGIN}/api/v1`;

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

class ApiError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let msg = text || `HTTP ${res.status}`;
    try { msg = JSON.parse(text).message || msg; } catch {}
    throw new ApiError(res.status, msg);
  }

  const body = await res.json() as ApiResponse<T>;
  if (body.code !== 0) {
    throw new ApiError(body.code, body.message || 'API Error');
  }
  return body.data;
}

// ====== Auth ======
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; name: string; email: string; role: string; group: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),
  me: () => request<{ id: string; name: string; email: string; role: string; group: string } | null>('/auth/me'),
};

// ====== Projects ======
export const projectsApi = {
  list: (params?: { group?: string; status?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<any[]>(`/projects${qs ? '?' + qs : ''}`);
  },
  get: (id: string) => request<any>(`/projects/${id}`),
  create: (data: any) => request<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    request<any>(`/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// ====== SOP ======
export const sopApi = {
  list: () => request<any[]>('/sop'),
  get: (id: string) => request<any>(`/sop/${id}`),
  create: (data: any) => request<any>('/sop', { method: 'POST', body: JSON.stringify(data) }),
  versions: (sopId: string) => request<any[]>(`/sop/${sopId}/versions`),
  createVersion: (sopId: string, data: any) =>
    request<any>(`/sop/${sopId}/versions`, { method: 'POST', body: JSON.stringify(data) }),
  submitVersion: (versionId: string) => request<any>(`/sop/version/${versionId}/submit`, { method: 'POST' }),
  approveVersion: (versionId: string, reviewerId: string) =>
    request<any>(`/sop/version/${versionId}/approve`, { method: 'POST', body: JSON.stringify({ reviewerId }) }),
  rejectVersion: (versionId: string, reviewerId: string) =>
    request<any>(`/sop/version/${versionId}/reject`, { method: 'POST', body: JSON.stringify({ reviewerId }) }),
};

// ====== Knowledge ======
export const knowledgeApi = {
  list: () => request<any[]>('/knowledge'),
  get: (id: string) => request<any>(`/knowledge/${id}`),
  create: (data: any) => request<any>('/knowledge', { method: 'POST', body: JSON.stringify(data) }),
  fav: (id: string) => request<any>(`/knowledge/${id}/fav`, { method: 'POST' }),
  archive: (id: string) => request<any>(`/knowledge/${id}/archive`, { method: 'POST' }),
  convertFromPost: (postId: string) => request<any>(`/knowledge/convert/${postId}`, { method: 'POST' }),
};

// ====== Forum ======
export const forumApi = {
  list: () => request<any[]>('/forum/posts'),
  get: (id: string) => request<any>(`/forum/posts/${id}`),
  create: (data: any) => request<any>('/forum/posts', { method: 'POST', body: JSON.stringify(data) }),
  replies: (postId: string) => request<any[]>(`/forum/posts/${postId}/replies`),
  reply: (postId: string, body: string, authorId: string) =>
    request<any>(`/forum/posts/${postId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ body, authorId }),
    }),
  fav: (id: string) => request<any>(`/forum/posts/${id}/fav`, { method: 'POST' }),
  solve: (id: string) => request<any>(`/forum/posts/${id}/solve`, { method: 'POST' }),
};

// ====== Sync ======
export const syncApi = {
  list: () => request<any[]>('/sync/messages'),
  get: (id: string) => request<any>(`/sync/messages/${id}`),
  publish: (data: any) => request<any>('/sync/messages', { method: 'POST', body: JSON.stringify(data) }),
  confirm: (id: string) => request<any>(`/sync/messages/${id}/confirm`, { method: 'POST' }),
  weeklyReport: (week: string) => request<any>(`/sync/weekly-report/${week}`, { method: 'POST' }),
};

// ====== Tags ======
export const tagsApi = {
  list: () => request<any[]>('/tags'),
  create: (dimension: string, value: string, createdBy: string) =>
    request<any>('/tags', {
      method: 'POST',
      body: JSON.stringify({ dimension, value, createdBy }),
    }),
  delete: (id: string) => request<void>(`/tags/${id}`, { method: 'DELETE' }),
};
