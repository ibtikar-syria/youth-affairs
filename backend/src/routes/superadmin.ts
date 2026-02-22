import { Hono } from 'hono'
import { badRequest, parseJsonBody } from '../lib/http'
import { hashPassword } from '../lib/password'
import type { AppEnv, BranchRecord, UserRecord } from '../lib/types'
import { requireAuth, requireRole } from '../middleware/auth'

type BranchInput = {
  name: string
  governorate: string
  address: string
  phone: string
  whatsapp: string
  facebook?: string
  telegram?: string
  instagram?: string
}

type AdminInput = {
  username: string
  displayName: string
  password: string
  branchId: number
}

export const superadminRoutes = new Hono<AppEnv>()

superadminRoutes.use('*', requireAuth, requireRole('superadmin'))

superadminRoutes.get('/branches', async (c) => {
  const branches = await c.env.DB.prepare('SELECT * FROM branches ORDER BY governorate ASC').all<BranchRecord>()
  return c.json({ items: branches.results })
})

superadminRoutes.post('/branches', async (c) => {
  const input = await parseJsonBody<BranchInput>(c)
  if (!input?.name || !input.governorate || !input.address || !input.phone || !input.whatsapp) {
    return badRequest(c, 'Missing required branch fields')
  }

  await c.env.DB
    .prepare(
      `INSERT INTO branches (name, governorate, address, phone, whatsapp, facebook, telegram, instagram)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.name.trim(),
      input.governorate.trim(),
      input.address.trim(),
      input.phone.trim(),
      input.whatsapp.trim(),
      input.facebook?.trim() || null,
      input.telegram?.trim() || null,
      input.instagram?.trim() || null
    )
    .run()

  return c.json({ ok: true }, 201)
})

superadminRoutes.put('/branches/:id', async (c) => {
  const branchId = Number(c.req.param('id'))
  if (!branchId) {
    return badRequest(c, 'Invalid branch id')
  }

  const input = await parseJsonBody<BranchInput>(c)
  if (!input?.name || !input.governorate || !input.address || !input.phone || !input.whatsapp) {
    return badRequest(c, 'Missing required branch fields')
  }

  await c.env.DB
    .prepare(
      `UPDATE branches
       SET name = ?, governorate = ?, address = ?, phone = ?, whatsapp = ?, facebook = ?, telegram = ?, instagram = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(
      input.name.trim(),
      input.governorate.trim(),
      input.address.trim(),
      input.phone.trim(),
      input.whatsapp.trim(),
      input.facebook?.trim() || null,
      input.telegram?.trim() || null,
      input.instagram?.trim() || null,
      branchId
    )
    .run()

  return c.json({ ok: true })
})

superadminRoutes.get('/admins', async (c) => {
  const admins = await c.env.DB
    .prepare(
      `SELECT
         u.id,
         u.username,
         u.display_name,
         u.role,
         u.branch_id,
         b.name AS branch_name
       FROM users u
       LEFT JOIN branches b ON b.id = u.branch_id
       ORDER BY u.role DESC, u.created_at DESC`
    )
    .all<UserRecord & { branch_name: string | null }>()
  return c.json({ items: admins.results })
})

superadminRoutes.post('/admins', async (c) => {
  const input = await parseJsonBody<AdminInput>(c)
  if (!input?.username || !input.displayName || !input.password || !input.branchId) {
    return badRequest(c, 'Missing required admin fields')
  }

  const existing = await c.env.DB
    .prepare('SELECT id FROM users WHERE username = ? LIMIT 1')
    .bind(input.username.trim())
    .first<{ id: number }>()

  if (existing) {
    return c.json({ error: 'Username already exists' }, 409)
  }

  const passwordHash = await hashPassword(input.password)
  await c.env.DB
    .prepare(
      `INSERT INTO users (username, display_name, password_hash, role, branch_id)
       VALUES (?, ?, ?, 'admin', ?)`
    )
    .bind(input.username.trim(), input.displayName.trim(), passwordHash, input.branchId)
    .run()

  return c.json({ ok: true }, 201)
})

superadminRoutes.put('/admins/:id/branch', async (c) => {
  const userId = Number(c.req.param('id'))
  const input = await parseJsonBody<{ branchId: number }>(c)
  if (!userId || !input?.branchId) {
    return badRequest(c, 'Invalid input')
  }

  await c.env.DB
    .prepare(`UPDATE users SET branch_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = 'admin'`)
    .bind(input.branchId, userId)
    .run()

  return c.json({ ok: true })
})

superadminRoutes.delete('/admins/:id', async (c) => {
  const userId = Number(c.req.param('id'))
  if (!userId) {
    return badRequest(c, 'Invalid user id')
  }

  await c.env.DB.prepare(`DELETE FROM users WHERE id = ? AND role = 'admin'`).bind(userId).run()
  return c.json({ ok: true })
})