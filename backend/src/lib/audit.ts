import type { Context } from 'hono'
import type { AppEnv } from './types'

type AuditAction = 'login' | 'admin_create' | 'admin_update' | 'admin_delete'

type LogAuditEventInput = {
  action: AuditAction
  actorUserId: number
  targetUserId?: number | null
  details?: Record<string, unknown>
}

const getFirstHeaderValue = (value: string | undefined): string | null => {
  if (!value) {
    return null
  }

  const first = value
    .split(',')
    .map((entry) => entry.trim())
    .find(Boolean)

  return first || null
}

export const getClientIp = (c: Context<AppEnv>): string => {
  const ip =
    getFirstHeaderValue(c.req.header('cf-connecting-ip')) ||
    getFirstHeaderValue(c.req.header('x-forwarded-for')) ||
    getFirstHeaderValue(c.req.header('x-real-ip')) ||
    getFirstHeaderValue(c.req.header('x-client-ip'))

  return ip || 'unknown'
}

export const logAuditEvent = async (c: Context<AppEnv>, input: LogAuditEventInput): Promise<void> => {
  await c.env.DB
    .prepare(
      `INSERT INTO audit_logs (action, actor_user_id, target_user_id, ip_address, details)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      input.action,
      input.actorUserId,
      input.targetUserId ?? null,
      getClientIp(c),
      input.details ? JSON.stringify(input.details) : null
    )
    .run()
}
