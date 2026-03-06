import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { applySeo } from '../lib/seo'
import { AdminPage } from '../views/AdminPage'
import { BranchesPage } from '../views/BranchesPage'
import { EventDetailPage } from '../views/EventDetailPage'
import { EventsPage } from '../views/EventsPage'
import { LandingPage } from '../views/LandingPage'
import { LoginPage } from '../views/LoginPage'
import { LogosPage } from '../views/LogosPage'
import { SuperAdminPage } from '../views/SuperAdminPage'

const routeSeo = (pathname: string) => {
  if (pathname === '/') {
    return {
      title: 'شؤون الشباب | تمكين الشباب السوري',
      description:
        'منصة شؤون الشباب لعرض المبادرات والفعاليات والأفرع في المحافظات السورية وتمكين الشباب فكرياً واجتماعياً وسياسياً.',
      robots: 'index,follow',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'شؤون الشباب',
        url: '/',
        logo: '/ya_icon_color.png',
      },
    }
  }

  if (pathname === '/branches') {
    return {
      title: 'دليل الأفرع | شؤون الشباب',
      description: 'استعرض فروع شؤون الشباب في المحافظات السورية مع وسائل التواصل والمعلومات المتاحة لكل فرع.',
      robots: 'index,follow',
    }
  }

  if (pathname === '/events') {
    return {
      title: 'الفعاليات | شؤون الشباب',
      description: 'تصفح الفعاليات والأنشطة الشبابية المعلنة من شؤون الشباب في مختلف المحافظات السورية.',
      robots: 'index,follow',
    }
  }

  if (pathname === '/logos') {
    return {
      title: 'الشعارات الرسمية | شؤون الشباب',
      description: 'صفحة تحميل الشعارات الرسمية المتاحة من منصة شؤون الشباب.',
      robots: 'index,follow',
    }
  }

  if (pathname.startsWith('/events/')) {
    return {
      title: 'تفاصيل الفعالية | شؤون الشباب',
      description: 'تفاصيل فعالية شبابية من أنشطة شؤون الشباب، تشمل التاريخ والمكان والمحتوى والروابط المرفقة.',
      robots: 'index,follow',
    }
  }

  if (pathname === '/login') {
    return {
      title: 'تسجيل الدخول | شؤون الشباب',
      description: 'بوابة تسجيل الدخول الخاصة بمديري ومشرفي منصة شؤون الشباب.',
      robots: 'noindex,nofollow',
    }
  }

  if (pathname === '/admin' || pathname === '/superadmin') {
    return {
      title: 'لوحة التحكم | شؤون الشباب',
      description: 'لوحة التحكم الإدارية لمنصة شؤون الشباب.',
      robots: 'noindex,nofollow',
    }
  }

  return {
    title: 'شؤون الشباب',
    description: 'منصة شؤون الشباب.',
    robots: 'index,follow',
  }
}

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

const RouteSeo = () => {
  const location = useLocation()

  useEffect(() => {
    const seo = routeSeo(location.pathname)
    applySeo({
      title: seo.title,
      description: seo.description,
      robots: seo.robots,
      path: location.pathname,
      structuredData: seo.structuredData,
    })
  }, [location.pathname])

  return null
}

export const AppRouter = () => (
  <BrowserRouter>
    <ScrollToTop />
    <RouteSeo />
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/logos" element={<LogosPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/superadmin" element={<SuperAdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <SiteFooter />
    </div>
  </BrowserRouter>
)
