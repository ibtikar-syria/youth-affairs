import { Hono } from 'hono'
import { logAuditEvent } from '../lib/audit'
import { badRequest, parseJsonBody } from '../lib/http'
import type { AppEnv, BranchRecord, EventRecord, EventUrl } from '../lib/types'
import { requireAuth, requireRole } from '../middleware/auth'

type BranchInput = {
  address?: string
  phone?: string
  mail?: string
  linkedin?: string
  twitter?: string
  whatsapp?: string
  facebook?: string
  telegram?: string
  instagram?: string
}

type EventInput = {
  branchId?: number
  title: string
  imageUrl: string
  announcement: string
  urls?: EventUrl[]
  eventDate: string
  eventDuration?: string
  location: string
}

type EventRecordDb = Omit<EventRecord, 'urls'> & { urls: string }
type EventIdentityRecord = Pick<EventRecord, 'id' | 'branch_id' | 'title' | 'event_duration'>

export const adminRoutes = new Hono<AppEnv>()

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const SYRIA_TIMEZONE_OFFSET = '+0300'

const extensionForMimeType = (mimeType: string) => {
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  return 'jpg'
}

const normalizeEventUrls = (value: unknown): EventUrl[] | null => {
  if (value === undefined || value === null) {
    return []
  }

  if (!Array.isArray(value)) {
    return null
  }

  const normalized: EventUrl[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') {
      return null
    }

    const rawUrl = 'url' in item ? item.url : undefined
    const rawTitle = 'title' in item ? item.title : ''

    if (typeof rawUrl !== 'string' || typeof rawTitle !== 'string') {
      return null
    }

    const url = rawUrl.trim()
    const title = rawTitle.trim()

    if (!url) {
      return null
    }

    try {
      new URL(url)
    } catch {
      return null
    }

    normalized.push({ url, title })
  }

  return normalized
}

const parseEventUrlsFromDb = (urlsJson: string | null | undefined): EventUrl[] => {
  if (!urlsJson) {
    return []
  }

  try {
    const parsed = JSON.parse(urlsJson)
    const normalized = normalizeEventUrls(parsed)
    return normalized ?? []
  } catch {
    return []
  }
}

const normalizeEventDateValue = (value: string): string | null => {
  const normalized = value.trim().replace('T', ' ')

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(normalized)) {
    return `${normalized}:00 ${SYRIA_TIMEZONE_OFFSET}`
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalized)) {
    return `${normalized} ${SYRIA_TIMEZONE_OFFSET}`
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{4}$/.test(normalized)) {
    return normalized
  }

  return null
}

const mapEventRecord = (event: EventRecordDb): EventRecord => ({
  ...event,
  urls: parseEventUrlsFromDb(event.urls),
})

adminRoutes.use('*', requireAuth, requireRole('admin', 'superadmin'))

adminRoutes.post('/r2/upload-image', async (c) => {
  const bucket = c.env.R2_BUCKET
  if (!bucket) {
    return c.json({ error: 'R2 bucket binding is missing. Configure R2_BUCKET in wrangler and restart wrangler dev.' }, 500)
  }

  const authUser = c.get('authUser')

  const formData = await c.req.formData().catch(() => null)
  if (!formData) {
    return badRequest(c, 'Invalid multipart form data')
  }

  let targetBranchId = authUser.branchId
  if (authUser.role === 'superadmin') {
    const rawBranchId = formData.get('branchId')
    const parsedBranchId = typeof rawBranchId === 'string' ? Number(rawBranchId) : 0
    if (!parsedBranchId) {
      return badRequest(c, 'Branch is required')
    }

    const branch = await c.env.DB.prepare('SELECT id FROM branches WHERE id = ? LIMIT 1').bind(parsedBranchId).first<{ id: number }>()
    if (!branch) {
      return c.json({ error: 'Branch not found' }, 404)
    }

    targetBranchId = parsedBranchId
  }

  if (!targetBranchId) {
    return badRequest(c, 'Admin has no assigned branch')
  }

  const fileEntry = formData.get('image')
  if (!(fileEntry instanceof File)) {
    return badRequest(c, 'Image file is required')
  }

  if (!allowedImageTypes.has(fileEntry.type)) {
    return badRequest(c, 'Only JPG, PNG, and WEBP images are allowed')
  }

  if (fileEntry.size > MAX_IMAGE_BYTES) {
    return badRequest(c, 'Image size must be 5MB or less')
  }

  const extension = extensionForMimeType(fileEntry.type)
  const objectKey = `r2/${targetBranchId}/${crypto.randomUUID()}.${extension}`

  await bucket.put(objectKey, fileEntry.stream(), {
    httpMetadata: {
      contentType: fileEntry.type,
    },
  })

  const url = new URL(c.req.url)
  const imageUrl = `${url.origin}/api/public/images/${encodeURIComponent(objectKey)}`

  return c.json({ imageUrl, key: objectKey }, 201)
})

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
  if (!input) {
    return badRequest(c, 'Invalid branch payload')
  }

  await c.env.DB
    .prepare(
      `UPDATE branches
       SET address = ?, phone = ?, mail = ?, linkedin = ?, twitter = ?, whatsapp = ?, facebook = ?, telegram = ?, instagram = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(
      input.address?.trim() || null,
      input.phone?.trim() || null,
      input.mail?.trim() || null,
      input.linkedin?.trim() || null,
      input.twitter?.trim() || null,
      input.whatsapp?.trim() || null,
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
      `SELECT e.*, b.name AS branch_name, u.username AS created_by_username, u.display_name AS created_by_display_name
       FROM events e
       JOIN branches b ON b.id = e.branch_id
       LEFT JOIN users u ON u.id = e.created_by
       ${where}
       ORDER BY e.event_date DESC`
    )
    .bind(...bindings)
    .all<EventRecordDb & { branch_name: string }>()

  return c.json({ items: events.results.map(mapEventRecord) })
})

adminRoutes.post('/events', async (c) => {
  const authUser = c.get('authUser')

  const input = await parseJsonBody<EventInput>(c)
  if (!input?.title || !input.announcement || !input.eventDate || !input.location || !input.imageUrl) {
    return badRequest(c, 'Missing required event fields')
  }

  const normalizedEventDate = normalizeEventDateValue(input.eventDate)
  if (!normalizedEventDate) {
    return badRequest(c, 'Invalid eventDate format. Use YYYY-MM-DD or YYYY-MM-DD HH:MM:SS ±HHMM')
  }

  const normalizedEventDuration = typeof input.eventDuration === 'string' ? input.eventDuration.trim() : ''

  let targetBranchId = authUser.branchId
  if (authUser.role === 'superadmin') {
    const parsedBranchId = Number(input.branchId ?? 0)
    if (!parsedBranchId) {
      return badRequest(c, 'Branch is required')
    }

    const branch = await c.env.DB.prepare('SELECT id FROM branches WHERE id = ? LIMIT 1').bind(parsedBranchId).first<{ id: number }>()
    if (!branch) {
      return c.json({ error: 'Branch not found' }, 404)
    }

    targetBranchId = parsedBranchId
  }

  if (!targetBranchId) {
    return badRequest(c, 'Admin has no assigned branch')
  }

  const normalizedUrls = normalizeEventUrls(input.urls)
  if (!normalizedUrls) {
    return badRequest(c, 'Invalid event urls. Each url must be valid and may include an optional title')
  }

  const createResult = await c.env.DB
    .prepare(
      `INSERT INTO events (branch_id, title, image_url, announcement, urls, event_date, event_duration, location, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      targetBranchId,
      input.title.trim(),
      input.imageUrl.trim(),
      input.announcement.trim(),
      JSON.stringify(normalizedUrls),
      normalizedEventDate,
      normalizedEventDuration || null,
      input.location.trim(),
      authUser.sub
    )
    .run()

  const createdEventId = Number(createResult.meta.last_row_id)
  await logAuditEvent(c, {
    action: 'event_create',
    actorUserId: authUser.sub,
    details: {
      eventId: Number.isFinite(createdEventId) ? createdEventId : null,
      branchId: targetBranchId,
      title: input.title.trim(),
      eventDate: normalizedEventDate,
      eventDuration: normalizedEventDuration || null,
      location: input.location.trim(),
    },
  })

  return c.json({ ok: true }, 201)
})

adminRoutes.put('/events/:id', async (c) => {
  const authUser = c.get('authUser')

  const eventId = Number(c.req.param('id'))
  const input = await parseJsonBody<EventInput>(c)
  if (!eventId || !input?.title || !input.announcement || !input.eventDate || !input.location || !input.imageUrl) {
    return badRequest(c, 'Invalid event data')
  }

  const normalizedEventDate = normalizeEventDateValue(input.eventDate)
  if (!normalizedEventDate) {
    return badRequest(c, 'Invalid eventDate format. Use YYYY-MM-DD or YYYY-MM-DD HH:MM:SS ±HHMM')
  }

  const normalizedEventDuration = typeof input.eventDuration === 'string' ? input.eventDuration.trim() : ''

  const normalizedUrls = normalizeEventUrls(input.urls)
  if (!normalizedUrls) {
    return badRequest(c, 'Invalid event urls. Each url must be valid and may include an optional title')
  }

  let targetEvent: EventIdentityRecord | null = null
  if (authUser.role === 'superadmin') {
    targetEvent = await c.env.DB
      .prepare('SELECT id, branch_id, title, event_duration FROM events WHERE id = ? LIMIT 1')
      .bind(eventId)
      .first<EventIdentityRecord>()
  } else {
    if (!authUser.branchId) {
      return badRequest(c, 'Admin has no assigned branch')
    }

    targetEvent = await c.env.DB
      .prepare('SELECT id, branch_id, title, event_duration FROM events WHERE id = ? AND branch_id = ? LIMIT 1')
      .bind(eventId, authUser.branchId)
      .first<EventIdentityRecord>()
  }

  if (!targetEvent) {
    return c.json({ error: 'Event not found' }, 404)
  }

  if (authUser.role === 'superadmin') {
    await c.env.DB
      .prepare(
        `UPDATE events
         SET title = ?, image_url = ?, announcement = ?, urls = ?, event_date = ?, event_duration = ?, location = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
      .bind(
        input.title.trim(),
        input.imageUrl.trim(),
        input.announcement.trim(),
        JSON.stringify(normalizedUrls),
        normalizedEventDate,
        normalizedEventDuration || null,
        input.location.trim(),
        eventId
      )
      .run()
  } else {
    await c.env.DB
      .prepare(
        `UPDATE events
         SET title = ?, image_url = ?, announcement = ?, urls = ?, event_date = ?, event_duration = ?, location = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND branch_id = ?`
      )
      .bind(
        input.title.trim(),
        input.imageUrl.trim(),
        input.announcement.trim(),
        JSON.stringify(normalizedUrls),
        normalizedEventDate,
        normalizedEventDuration || null,
        input.location.trim(),
        eventId,
        authUser.branchId
      )
      .run()
  }

  await logAuditEvent(c, {
    action: 'event_update',
    actorUserId: authUser.sub,
    details: {
      eventId,
      branchId: targetEvent.branch_id,
      titleBefore: targetEvent.title,
      titleAfter: input.title.trim(),
      eventDate: normalizedEventDate,
      eventDurationBefore: targetEvent.event_duration,
      eventDurationAfter: normalizedEventDuration || null,
      location: input.location.trim(),
    },
  })

  return c.json({ ok: true })
})

adminRoutes.delete('/events/:id', async (c) => {
  const authUser = c.get('authUser')

  const eventId = Number(c.req.param('id'))
  if (!eventId) {
    return badRequest(c, 'Invalid event id')
  }

  let targetEvent: EventIdentityRecord | null = null
  if (authUser.role === 'superadmin') {
    targetEvent = await c.env.DB
      .prepare('SELECT id, branch_id, title FROM events WHERE id = ? LIMIT 1')
      .bind(eventId)
      .first<EventIdentityRecord>()
  } else {
    if (!authUser.branchId) {
      return badRequest(c, 'Admin has no assigned branch')
    }

    targetEvent = await c.env.DB
      .prepare('SELECT id, branch_id, title FROM events WHERE id = ? AND branch_id = ? LIMIT 1')
      .bind(eventId, authUser.branchId)
      .first<EventIdentityRecord>()
  }

  if (!targetEvent) {
    return c.json({ error: 'Event not found' }, 404)
  }

  if (authUser.role === 'superadmin') {
    await c.env.DB.prepare('DELETE FROM events WHERE id = ?').bind(eventId).run()
  } else {
    await c.env.DB.prepare('DELETE FROM events WHERE id = ? AND branch_id = ?').bind(eventId, authUser.branchId).run()
  }

  await logAuditEvent(c, {
    action: 'event_delete',
    actorUserId: authUser.sub,
    details: {
      eventId,
      branchId: targetEvent.branch_id,
      title: targetEvent.title,
    },
  })

  return c.json({ ok: true })
})