type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>

type SeoPayload = {
  title: string
  description: string
  path?: string
  robots?: string
  image?: string
  type?: 'website' | 'article'
  structuredData?: StructuredData
}

const DEFAULT_SITE_URL = 'https://youth-affairs-frontend.workers.dev'
const DEFAULT_IMAGE = '/ya_full_logo.png'
const JSON_LD_ID = 'seo-structured-data'

const normalizedSiteUrl = (import.meta.env.VITE_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, '')

const upsertMeta = (attribute: 'name' | 'property', key: string, content: string) => {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, key)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

const upsertCanonical = (href: string) => {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }

  canonical.setAttribute('href', href)
}

const clearStructuredData = () => {
  const existingScript = document.head.querySelector<HTMLScriptElement>(`script#${JSON_LD_ID}`)
  if (existingScript) {
    existingScript.remove()
  }
}

const upsertStructuredData = (structuredData?: StructuredData) => {
  clearStructuredData()

  if (!structuredData) {
    return
  }

  const script = document.createElement('script')
  script.id = JSON_LD_ID
  script.type = 'application/ld+json'
  script.text = JSON.stringify(structuredData)
  document.head.appendChild(script)
}

const toAbsoluteUrl = (path?: string) => {
  if (!path) {
    return normalizedSiteUrl
  }

  return new URL(path, `${normalizedSiteUrl}/`).toString()
}

export const applySeo = ({
  title,
  description,
  path = '/',
  robots = 'index,follow',
  image = DEFAULT_IMAGE,
  type = 'website',
  structuredData,
}: SeoPayload) => {
  const url = toAbsoluteUrl(path)
  const imageUrl = toAbsoluteUrl(image)

  document.documentElement.lang = 'ar'
  document.documentElement.dir = 'rtl'
  document.title = title

  upsertMeta('name', 'description', description)
  upsertMeta('name', 'robots', robots)
  upsertMeta('property', 'og:locale', 'ar_SY')
  upsertMeta('property', 'og:site_name', 'شؤون الشباب')
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:type', type)
  upsertMeta('property', 'og:url', url)
  upsertMeta('property', 'og:image', imageUrl)
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta('name', 'twitter:image', imageUrl)

  upsertCanonical(url)
  upsertStructuredData(structuredData)
}