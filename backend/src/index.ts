import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { initializeDatabase } from './lib/db'
import type { AppEnv } from './lib/types'
import { adminRoutes } from './routes/admin'
import { authRoutes } from './routes/auth'
import { publicRoutes } from './routes/public'
import { superadminRoutes } from './routes/superadmin'

const app = new Hono<AppEnv>()

app.use('*', async (c, next) => {
  await initializeDatabase(c.env.DB)
  await next()
})

app.use('/api/*', async (c, next) => {
  const allowedOrigin = c.env.CORS_ORIGIN ?? '*'
  return cors({ origin: allowedOrigin })(c, next)
})

app.get('/api/health', (c) => c.json({ ok: true }))
app.route('/api/public', publicRoutes)
app.route('/api/auth', authRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/superadmin', superadminRoutes)

export default app
