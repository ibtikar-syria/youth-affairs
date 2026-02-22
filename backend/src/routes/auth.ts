import { Hono } from 'hono'
import { badRequest, parseJsonBody } from '../lib/http'
import { signJwt } from '../lib/jwt'
import { verifyPassword } from '../lib/password'
import type { AppEnv, UserRecord } from '../lib/types'
import { requireAuth } from '../middleware/auth'

type LoginInput = {
  username: string
  password: string
}

export const authRoutes = new Hono<AppEnv>()

authRoutes.post('/login', async (c) => {
  const input = await parseJsonBody<LoginInput>(c)
  if (!input?.username || !input.password) {
    return badRequest(c, 'Username and password are required')
  }

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ? LIMIT 1')
    .bind(input.username.trim())
    .first<UserRecord>()

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const isValidPassword = await verifyPassword(input.password, user.password_hash)
  if (!isValidPassword) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = await signJwt(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
      branchId: user.branch_id,
    },
    c.env.JWT_SECRET
  )

  return c.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      role: user.role,
      branchId: user.branch_id,
    },
  })
})

authRoutes.get('/me', requireAuth, async (c) => {
  const user = c.get('authUser')
  return c.json({ user })
})