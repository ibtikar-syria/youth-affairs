import type { AdminUser, AuthUser, Branch, EventItem } from './types'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  token?: string
  body?: Record<string, unknown>
}

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error((data as { error?: string } | null)?.error ?? 'حدث خطأ في الطلب')
  }
  return data as T
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    }),

  getPublicBranches: () => request<{ items: Branch[] }>('/api/public/branches'),
  getPublicEvents: (filters: { branchId?: string; month?: string; year?: string }) => {
    const params = new URLSearchParams()
    if (filters.branchId) params.set('branchId', filters.branchId)
    if (filters.month) params.set('month', filters.month)
    if (filters.year) params.set('year', filters.year)
    const query = params.toString()
    return request<{ items: EventItem[] }>(`/api/public/events${query ? `?${query}` : ''}`)
  },

  getAdminMe: (token: string) => request<{ user: AuthUser }>('/api/auth/me', { token }),
  getAdminBranch: (token: string) => request<{ item: Branch }>('/api/admin/branch', { token }),
  updateAdminBranch: (token: string, body: Record<string, unknown>) =>
    request<{ ok: boolean }>('/api/admin/branch', { method: 'PUT', token, body }),
  getAdminEvents: (token: string) => request<{ items: EventItem[] }>('/api/admin/events', { token }),
  createAdminEvent: (token: string, body: Record<string, unknown>) =>
    request<{ ok: boolean }>('/api/admin/events', { method: 'POST', token, body }),
  uploadAdminR2Image: async (token: string, file: File) => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${API_BASE}/api/admin/r2/upload-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error((data as { error?: string } | null)?.error ?? 'فشل رفع الصورة')
    }

    return data as { imageUrl: string; key: string }
  },
  updateAdminEvent: (token: string, id: number, body: Record<string, unknown>) =>
    request<{ ok: boolean }>(`/api/admin/events/${id}`, { method: 'PUT', token, body }),
  deleteAdminEvent: (token: string, id: number) =>
    request<{ ok: boolean }>(`/api/admin/events/${id}`, { method: 'DELETE', token }),

  getSuperBranches: (token: string) => request<{ items: Branch[] }>('/api/superadmin/branches', { token }),
  createSuperBranch: (token: string, body: Record<string, unknown>) =>
    request<{ ok: boolean }>('/api/superadmin/branches', { method: 'POST', token, body }),
  updateSuperBranch: (token: string, id: number, body: Record<string, unknown>) =>
    request<{ ok: boolean }>(`/api/superadmin/branches/${id}`, { method: 'PUT', token, body }),
  getSuperBranchRelations: (token: string, id: number) =>
    request<{ item: { adminsCount: number; eventsCount: number } }>(`/api/superadmin/branches/${id}/relations`, { token }),
  deleteSuperBranch: (token: string, id: number) =>
    request<{ ok: boolean }>(`/api/superadmin/branches/${id}`, { method: 'DELETE', token }),

  getSuperAdmins: (token: string) => request<{ items: AdminUser[] }>('/api/superadmin/admins', { token }),
  createSuperAdmin: (token: string, body: Record<string, unknown>) =>
    request<{ ok: boolean }>('/api/superadmin/admins', { method: 'POST', token, body }),
  updateSuperAdmin: (token: string, id: number, body: Record<string, unknown>) =>
    request<{ ok: boolean }>(`/api/superadmin/admins/${id}`, { method: 'PUT', token, body }),
  setAdminBranch: (token: string, id: number, branchId: number) =>
    request<{ ok: boolean }>(`/api/superadmin/admins/${id}/branch`, {
      method: 'PUT',
      token,
      body: { branchId },
    }),
  deleteAdmin: (token: string, id: number) =>
    request<{ ok: boolean }>(`/api/superadmin/admins/${id}`, { method: 'DELETE', token }),

}
