import { CalendarDays, MapPin, UserCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

type SiteHeaderProps = {
  isLanding?: boolean
  onLogoClick?: () => void
}

export const SiteHeader = ({ isLanding = false, onLogoClick }: SiteHeaderProps) => {
  const LogoContent = (
    <>
      <img src="/ya_logo_color.svg" alt="شعار شؤون الشباب" className="h-12 w-12 transition-transform duration-300 hover:rotate-6" />
      <div className="text-right">
        <h1 className="text-xl font-bold text-primary">شؤون الشباب</h1>
        <p className="text-sm text-slate-600">جيل شبابي متمكّن وواعٍ</p>
      </div>
    </>
  )

  return (
    <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {isLanding ? (
          <button
            type="button"
            onClick={onLogoClick}
            className="flex items-center gap-3 rounded-lg text-right transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="العودة إلى أعلى الصفحة"
          >
            {LogoContent}
          </button>
        ) : (
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg text-right transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="العودة إلى الصفحة الرئيسية"
          >
            {LogoContent}
          </Link>
        )}

        <div className="flex items-center gap-3 text-sm">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-700 transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary hover:shadow-sm"
          >
            <CalendarDays className="h-4 w-4" />
            الفعاليات
          </Link>
          <Link
            to="/branches"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-700 transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary hover:shadow-sm"
          >
            <MapPin className="h-4 w-4" />
            الأفرع
          </Link>
          <Link
            to="/login"
            aria-label="تسجيل الدخول"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white transition-all duration-200 hover:scale-105 hover:bg-primary/90 hover:shadow-lg"
          >
            <UserCircle2 className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}