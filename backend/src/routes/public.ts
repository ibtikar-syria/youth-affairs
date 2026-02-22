import { Hono } from 'hono'
import type { AppEnv, BranchRecord, EventRecord } from '../lib/types'

export const publicRoutes = new Hono<AppEnv>()

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
    .all<EventRecord & { branch_name: string; branch_governorate: string }>()

  return c.json({ items: events.results })
})