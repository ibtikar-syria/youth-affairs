import type { MiddlewareHandler } from 'hono'
import { verifyJwt } from '../lib/jwt'
import type { AppEnv, UserRole } from '../lib/types'

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const authHeader = c.req.header('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const payload = await verifyJwt(token, c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  c.set('authUser', {
    sub: payload.sub,
    username: payload.username,
    role: payload.role,
    branchId: payload.branchId,
  })
  await next()
}

export const requireRole = (...roles: UserRole[]): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const user = c.get('authUser')
    if (!roles.includes(user.role)) {
      return c.json({ error: 'Forbidden' }, 403)
    }
    await next()
  }
}