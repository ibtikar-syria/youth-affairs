import { CalendarDays, MapPin } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

type SiteHeaderProps = {
  isLanding?: boolean
  onLogoClick?: () => void
}

export const SiteHeader = ({ isLanding = false, onLogoClick }: SiteHeaderProps) => {
  const location = useLocation()
  const isLandingRoute = location.pathname === '/'
  const useLandingMode = isLanding || isLandingRoute

  const handleLandingLogoClick = () => {
    if (onLogoClick) {
      onLogoClick()
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const LogoContent = (
    <>
      <img
        src="/ya_logo_color.svg"
        alt="شعار شؤون الشباب"
        className="h-10 w-10 transition-transform duration-[3600ms] ease-linear group-hover:rotate-[360deg] sm:h-12 sm:w-12"
      />
      <div className="text-right">
        <h1 className="text-lg font-bold text-primary sm:text-xl">شؤون الشباب</h1>
        <p className="text-xs text-slate-600 sm:text-sm">جيل شبابي متمكّن وواعٍ</p>
      </div>
    </>
  )

  return (
    <header dir="rtl" className="sticky top-0 z-30 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
        {useLandingMode ? (
          <button
            type="button"
            onClick={handleLandingLogoClick}
            className="group flex items-center gap-2 rounded-lg text-right transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:gap-3"
            aria-label="العودة إلى أعلى الصفحة"
          >
            {LogoContent}
          </button>
        ) : (
          <Link
            to="/"
            className="group flex items-center gap-2 rounded-lg text-right transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:gap-3"
            aria-label="العودة إلى الصفحة الرئيسية"
          >
            {LogoContent}
          </Link>
        )}

        <div className="flex w-full items-center gap-2 text-sm sm:w-auto sm:gap-3">
          <Link
            to="/events"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-700 transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary hover:shadow-sm sm:flex-none"
          >
            <CalendarDays className="h-4 w-4" />
            الفعاليات
          </Link>
          <Link
            to="/branches"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-700 transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary hover:shadow-sm sm:flex-none"
          >
            <MapPin className="h-4 w-4" />
            الأفرع
          </Link>
        </div>
      </div>
    </header>
  )
}