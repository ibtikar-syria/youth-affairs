import { Hono } from 'hono'
import { badRequest, parseJsonBody } from '../lib/http'
import type { AppEnv, BranchRecord, EventRecord } from '../lib/types'
import { requireAuth, requireRole } from '../middleware/auth'

type BranchInput = {
  address: string
  phone: string
  whatsapp: string
  facebook?: string
  telegram?: string
  instagram?: string
}

type EventInput = {
  title: string
  imageUrl: string
  announcement: string
  eventDate: string
  location: string
}

export const adminRoutes = new Hono<AppEnv>()

adminRoutes.use('*', requireAuth, requireRole('admin', 'superadmin'))

adminRoutes.get('/me', (c) => c.json({ user: c.get('authUser') }))

adminRoutes.get('/branch', async (c) => {
  const authUser = c.get('authUser')
  const branchId = authUser.role === 'superadmin' ? Number(c.req.query('branchId') || 0) : authUser.branchId

  if (!branchId) {
    return c.json({ error: 'Branch is required' }, 400)
  }

  const branch = await c.env.DB.prepare('SELECT * FROM branches WHERE id = ? LIMIT 1').bind(branchId).first<BranchRecord>()
  if (!branch) {
    return c.json({ error: 'Branch not found' }, 404)
  }

  return c.json({ item: branch })
})

adminRoutes.put('/branch', async (c) => {
  const authUser = c.get('authUser')
  if (!authUser.branchId) {
    return c.json({ error: 'Admin has no assigned branch' }, 400)
  }

  const input = await parseJsonBody<BranchInput>(c)
  if (!input?.address || !input.phone || !input.whatsapp) {
    return badRequest(c, 'Address, phone, and WhatsApp are required')
  }

  await c.env.DB
    .prepare(
      `UPDATE branches
       SET address = ?, phone = ?, whatsapp = ?, facebook = ?, telegram = ?, instagram = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(
      input.address.trim(),
      input.phone.trim(),
      input.whatsapp.trim(),
      input.facebook?.trim() || null,
      input.telegram?.trim() || null,
      input.instagram?.trim() || null,
      authUser.branchId
    )
    .run()

  return c.json({ ok: true })
})

adminRoutes.get('/events', async (c) => {
  const authUser = c.get('authUser')
  if (!authUser.branchId && authUser.role !== 'superadmin') {
    return c.json({ items: [] })
  }

  const branchId = authUser.role === 'superadmin' ? Number(c.req.query('branchId') || 0) : authUser.branchId
  const conditions: string[] = []
  const bindings: number[] = []

  if (branchId) {
    conditions.push('e.branch_id = ?')
    bindings.push(branchId)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const events = await c.env.DB
    .prepare(
      `SELECT e.*, b.name AS branch_name
       FROM events e
       JOIN branches b ON b.id = e.branch_id
       ${where}
       ORDER BY e.event_date DESC`
    )
    .bind(...bindings)
    .all<EventRecord & { branch_name: string }>()

  return c.json({ items: events.results })
})

adminRoutes.post('/events', async (c) => {
  const authUser = c.get('authUser')
  if (!authUser.branchId) {
    return badRequest(c, 'Admin has no assigned branch')
  }

  const input = await parseJsonBody<EventInput>(c)
  if (!input?.title || !input.announcement || !input.eventDate || !input.location || !input.imageUrl) {
    return badRequest(c, 'Missing required event fields')
  }

  await c.env.DB
    .prepare(
      `INSERT INTO events (branch_id, title, image_url, announcement, event_date, location, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      authUser.branchId,
      input.title.trim(),
      input.imageUrl.trim(),
      input.announcement.trim(),
      input.eventDate,
      input.location.trim(),
      authUser.sub
    )
    .run()

  return c.json({ ok: true }, 201)
})

adminRoutes.put('/events/:id', async (c) => {
  const authUser = c.get('authUser')
  if (!authUser.branchId) {
    return badRequest(c, 'Admin has no assigned branch')
  }

  const eventId = Number(c.req.param('id'))
  const input = await parseJsonBody<EventInput>(c)
  if (!eventId || !input?.title || !input.announcement || !input.eventDate || !input.location || !input.imageUrl) {
    return badRequest(c, 'Invalid event data')
  }

  await c.env.DB
    .prepare(
      `UPDATE events
       SET title = ?, image_url = ?, announcement = ?, event_date = ?, location = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND branch_id = ?`
    )
    .bind(input.title.trim(), input.imageUrl.trim(), input.announcement.trim(), input.eventDate, input.location.trim(), eventId, authUser.branchId)
    .run()

  return c.json({ ok: true })
})

adminRoutes.delete('/events/:id', async (c) => {
  const authUser = c.get('authUser')
  if (!authUser.branchId) {
    return badRequest(c, 'Admin has no assigned branch')
  }

  const eventId = Number(c.req.param('id'))
  if (!eventId) {
    return badRequest(c, 'Invalid event id')
  }

  await c.env.DB.prepare('DELETE FROM events WHERE id = ? AND branch_id = ?').bind(eventId, authUser.branchId).run()
  return c.json({ ok: true })
})