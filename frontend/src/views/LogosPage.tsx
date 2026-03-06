import { Download, FolderOpen } from 'lucide-react'
import yaLogoColorAsset from '../assets/ya_logo_color.svg'

type LogoFile = {
  name: string
  href: string
}

const publicLogos: LogoFile[] = [
  { name: 'ya_full_logo.png', href: '/ya_full_logo.png' },
  { name: 'ya_full_logo.svg', href: '/ya_full_logo.svg' },
  { name: 'ya_icon_color.png', href: '/ya_icon_color.png' },
  { name: 'ya_icon_color.svg', href: '/ya_icon_color.svg' },
  { name: 'ya_logo_gray.svg', href: '/ya_logo_gray.svg' },
  { name: 'ya_logo_white.svg', href: '/ya_logo_white.svg' },
]

const assetLogos: LogoFile[] = [{ name: 'ya_logo_color.svg', href: yaLogoColorAsset }]

type LogosSectionProps = {
  title: string
  description: string
  logos: LogoFile[]
}

const LogosSection = ({ title, description, logos }: LogosSectionProps) => (
  <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
    <h2 className="inline-flex items-center gap-2 text-xl font-bold text-primary">
      <FolderOpen className="h-5 w-5" />
      {title}
    </h2>
    <p className="mt-1 text-sm text-slate-600">{description}</p>

    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {logos.map((logo) => (
        <article
          key={`${title}-${logo.name}`}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="mb-3 flex h-24 items-center justify-center rounded-lg border border-slate-200 bg-white p-3">
            <img src={logo.href} alt={logo.name} className="max-h-full max-w-full object-contain" />
          </div>

          <p className="truncate text-sm font-medium text-slate-700" dir="ltr" title={logo.name}>
            {logo.name}
          </p>

          <a
            href={logo.href}
            download={logo.name}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
          >
            <Download className="h-4 w-4" />
            تحميل
          </a>
        </article>
      ))}
    </div>
  </section>
)

export const LogosPage = () => (
  <div dir="rtl" className="bg-slate-50">
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">مكتبة الشعارات</h1>
        <p className="mt-1 text-sm text-slate-600">
          حمّل الشعارات الرسمية من ملفات المشروع ضمن مجلدي public و assets.
        </p>
      </section>

      <div className="grid gap-6">
        <LogosSection
          title="شعارات public"
          description="هذه الملفات متاحة مباشرة من المسار العام للموقع."
          logos={publicLogos}
        />
        <LogosSection
          title="شعارات assets"
          description="هذه الملفات مستوردة من مجلد src/assets."
          logos={assetLogos}
        />
      </div>
    </main>
  </div>
)
