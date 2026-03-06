import { Download } from 'lucide-react'
import yaLogoColorAsset from '../assets/ya_logo_color.svg'

type LogoFile = {
  arabicName: string
  fileName: string
  href: string
}

const logos: LogoFile[] = [
  { arabicName: 'الشعار الكامل (PNG)', fileName: 'ya_full_logo.png', href: '/ya_full_logo.png' },
  { arabicName: 'الشعار الكامل (SVG)', fileName: 'ya_full_logo.svg', href: '/ya_full_logo.svg' },
  {
    arabicName: 'الأيقونة الملونة (PNG)',
    fileName: 'ya_icon_color.png',
    href: '/ya_icon_color.png',
  },
  {
    arabicName: 'الأيقونة الملونة (SVG)',
    fileName: 'ya_icon_color.svg',
    href: '/ya_icon_color.svg',
  },
  { arabicName: 'الشعار الرمادي (SVG)', fileName: 'ya_logo_gray.svg', href: '/ya_logo_gray.svg' },
  { arabicName: 'الشعار الأبيض (SVG)', fileName: 'ya_logo_white.svg', href: '/ya_logo_white.svg' },
  {
    arabicName: 'الشعار الملون (SVG)',
    fileName: 'ya_logo_color.svg',
    href: yaLogoColorAsset,
  },
]

export const LogosPage = () => (
  <div dir="rtl" className="bg-slate-50">
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">مكتبة الشعارات</h1>
        <p className="mt-1 text-sm text-slate-600">حمّل الشعارات الرسمية من مكان واحد.</p>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {logos.map((logo) => (
            <article
              key={logo.fileName}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex h-24 items-center justify-center rounded-lg border border-slate-200 bg-white p-3">
                <img
                  src={logo.href}
                  alt={logo.arabicName}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <h2 className="text-sm font-semibold text-slate-800">{logo.arabicName}</h2>
              <p className="mt-1 text-xs text-slate-500">اسم الملف</p>
              <p className="truncate text-sm font-medium text-slate-700" dir="ltr" title={logo.fileName}>
                {logo.fileName}
              </p>

              <a
                href={logo.href}
                download={logo.fileName}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
              >
                <Download className="h-4 w-4" />
                تحميل
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  </div>
)
