export type UserRole = 'superadmin' | 'admin'

export type AuthTokenPayload = {
  sub: number
  username: string
  role: UserRole
  branchId: number | null
  exp: number
}

export type AuthUser = Omit<AuthTokenPayload, 'exp'>

export type AppEnv = {
  Bindings: {
    DB: D1Database
    R2_BUCKET?: R2Bucket
    JWT_SECRET: string
    CORS_ORIGIN?: string
  }
  Variables: {
    authUser: AuthUser
  }
}

export type BranchRecord = {
  id: number
  name: string
  governorate: string
  address: string
  phone: string
  whatsapp: string
  facebook: string | null
  telegram: string | null
  instagram: string | null
  created_at: string
  updated_at: string
}

export type EventRecord = {
  id: number
  branch_id: number
  title: string
  image_url: string
  announcement: string
  event_date: string
  location: string
  created_by: number
  created_at: string
  updated_at: string
}

export type UserRecord = {
  id: number
  username: string
  display_name: string
  password_hash: string
  role: UserRole
  branch_id: number | null
  created_at: string
  updated_at: string
}