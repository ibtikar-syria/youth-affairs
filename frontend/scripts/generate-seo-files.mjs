import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const frontendRoot = resolve(__dirname, '..')
const publicDir = resolve(frontendRoot, 'public')

const mode = process.env.MODE ?? process.env.NODE_ENV ?? 'production'
const env = loadEnv(mode, frontendRoot, '')
const siteUrl = (env.VITE_SITE_URL ?? 'https://youth-affairs-frontend.workers.dev').replace(/\/+$/, '')

const publicRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/branches', changefreq: 'weekly', priority: '0.9' },
  { path: '/events', changefreq: 'daily', priority: '0.9' },
]

const robotsContent = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /superadmin
Disallow: /login

Sitemap: ${siteUrl}/sitemap.xml
`

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

await mkdir(publicDir, { recursive: true })
await writeFile(resolve(publicDir, 'robots.txt'), robotsContent, 'utf8')
await writeFile(resolve(publicDir, 'sitemap.xml'), sitemapContent, 'utf8')

console.log(`Generated robots.txt and sitemap.xml using VITE_SITE_URL=${siteUrl}`)