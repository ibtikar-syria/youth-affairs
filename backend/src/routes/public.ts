import { Hono } from 'hono'
import type { AppEnv, BranchRecord, EventRecord, EventUrl } from '../lib/types'

export const publicRoutes = new Hono<AppEnv>()

type EventRecordDb = Omit<EventRecord, 'urls'> & { urls: string }

const normalizeEventUrls = (value: unknown): EventUrl[] | null => {
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

const mapEventRecord = (event: EventRecordDb): EventRecord => ({
  ...event,
  urls: parseEventUrlsFromDb(event.urls),
})

publicRoutes.get('/images/*', async (c) => {
  const bucket = c.env.R2_BUCKET
  if (!bucket) {
    return c.json({ error: 'R2 bucket binding is missing. Configure R2_BUCKET in wrangler and restart wrangler dev.' }, 500)
  }

  const path = new URL(c.req.url).pathname
  const prefix = '/api/public/images/'
  const encodedKey = path.startsWith(prefix) ? path.slice(prefix.length) : ''
  const objectKey = decodeURIComponent(encodedKey)

  if (!objectKey) {
    return c.json({ error: 'Image key is required' }, 400)
  }

  const object = await bucket.get(objectKey)
  if (!object?.body) {
    return c.json({ error: 'Image not found' }, 404)
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('cache-control', 'public, max-age=3600')

  return new Response(object.body, { headers })
})

publicRoutes.get('/branches', async (c) => {
  const branches = await c.env.DB.prepare('SELECT * FROM branches ORDER BY governorate ASC').all<BranchRecord>()
  return c.json({ items: branches.results })
})

publicRoutes.get('/events', async (c) => {
  const branchId = c.req.query('branchId')
  const month = c.req.query('month')
  const year = c.req.query('year')

  const conditions: string[] = []
  const bindings: string[] = []

  if (branchId) {
    conditions.push('e.branch_id = ?')
    bindings.push(branchId)
  }
  if (year) {
    conditions.push("strftime('%Y', e.event_date) = ?")
    bindings.push(year)
  }
  if (month) {
    conditions.push("strftime('%m', e.event_date) = ?")
    bindings.push(month.padStart(2, '0'))
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const query = `
    SELECT
      e.*,
      b.name AS branch_name,
      b.governorate AS branch_governorate
    FROM events e
    JOIN branches b ON b.id = e.branch_id
    ${where}
    ORDER BY e.event_date DESC
  `

  const events = await c.env.DB.prepare(query)
    .bind(...bindings)
    .all<EventRecordDb & { branch_name: string; branch_governorate: string }>()

  return c.json({ items: events.results.map(mapEventRecord) })
})