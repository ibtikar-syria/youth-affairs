import { Facebook, Instagram, Send, Youtube } from 'lucide-react'
import backgroundTexture from '../assets/background_texture1.svg'

type SiteFooterProps = {
  organizationName?: string
  slogan?: string
}

const socialLinks = [
  {
    label: 'فيسبوك',
    href: 'https://facebook.com',
    icon: Facebook,
  },
  {
    label: 'إنستغرام',
    href: 'https://instagram.com',
    icon: Instagram,
  },
  {
    label: 'تيليغرام',
    href: 'https://t.me',
    icon: Send,
  },
  {
    label: 'يوتيوب',
    href: 'https://youtube.com',
    icon: Youtube,
  },
]

export const SiteFooter = ({
  organizationName = 'شؤون الشباب',
  slogan = 'جيل شبابي متمكّن وواعٍ',
}: SiteFooterProps) => (
  <footer className="relative overflow-hidden bg-primary text-white" dir="rtl">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen"
      style={{
        backgroundImage: `url(${backgroundTexture})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '150px 150px',
        backgroundPosition: 'center',
        filter: 'grayscale(0.5) brightness(14) invert(0.5)',
      }}
    />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-primary/50 via-primary/60 to-primary/55" />

    <div className="relative mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 lg:gap-10">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <img src="/ya_logo_white.svg" alt="شعار شؤون الشباب" className="h-12 w-12" />
            <div>
              <h3 className="text-xl font-bold">{organizationName}</h3>
              <p className="text-sm text-white/80">{slogan}</p>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/80">
            منصة وطنية تُعنى بتمكين الشباب عبر برامج وأنشطة نوعية تسهم في بناء مجتمع أكثر وعياً ومشاركة.
          </p>
        </div>

        <div className="lg:justify-self-end">
          <p className="mb-3 text-sm font-semibold text-white/90">تابعنا على المنصات الاجتماعية</p>
          <div className="flex flex-wrap items-center gap-2">
            {socialLinks.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-white hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </a>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-white/20 pt-4 text-xs text-white/80">
        <p>© {new Date().getFullYear()} {organizationName}. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  </footer>
)