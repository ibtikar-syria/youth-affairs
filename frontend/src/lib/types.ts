export type UserRole = 'superadmin' | 'admin'

export type AuthUser = {
  id: number
  username: string
  role: UserRole
  branchId: number | null
}

export type Branch = {
  id: number
  name: string
  governorate: string
  address: string | null
  phone: string | null
  mail: string | null
  linkedin: string | null
  twitter: string | null
  whatsapp: string | null
  facebook: string | null
  telegram: string | null
  instagram: string | null
  admins_count?: number
  events_count?: number
}

export type EventItem = {
  id: number
  branch_id: number
  title: string
  image_url: string
  announcement: string
  urls: EventUrlItem[]
  event_date: string
  location: string
  branch_name?: string
  branch_governorate?: string
}

export type EventUrlItem = {
  url: string
  title: string
}

export type AdminUser = {
  id: number
  username: string
  display_name: string
  role: UserRole
  branch_id: number | null
  branch_name: string | null
}
