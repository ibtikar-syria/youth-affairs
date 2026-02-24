import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronRight, MapPin, Calendar, Building2, ArrowRight } from 'lucide-react'
import { api } from '../lib/api'
import type { EventItem } from '../lib/types'

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) {
      setError(true)
      setLoading(false)
      return
    }

    void (async () => {
      try {
        setLoading(true)
        setError(false)
        // Fetch all events and filter by id - modify if you have a specific endpoint
        const result = await api.getPublicEvents({})
        const foundEvent = result.items.find((item) => item.id === Number(id))
        
        if (foundEvent) {
          setEvent(foundEvent)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Error fetching event:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
          <p className="mt-4 text-slate-600">جار تحميل تفاصيل الفعالية...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50">
        <header className="border-b border-blue-100 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
            >
              <ChevronRight className="h-4 w-4" />
              العودة للفعاليات
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-xl border border-blue-100 bg-white p-12 text-center shadow-sm">
            <CalendarDays className="mx-auto h-16 w-16 text-slate-300" />
            <h1 className="mt-4 text-2xl font-bold text-slate-900">الفعالية غير موجودة</h1>
            <p className="mt-2 text-slate-600">لم نتمكن من العثور على الفعالية المطلوبة</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <ArrowRight className="h-4 w-4" />
                تصفح جميع الفعاليات
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      <header className="border-b border-blue-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
            >
              <ChevronRight className="h-4 w-4" />
              رجوع
            </button>
            <Link
              to="/"
              className="text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-primary"
            >
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <article className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
          <div className="relative h-96 overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="mb-2 inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <Building2 className="h-3.5 w-3.5" />
                {event.branch_name ?? event.branch_governorate}
              </div>
              <h1 className="text-4xl font-bold leading-tight">{event.title}</h1>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-slate-600">تاريخ الفعالية</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{event.event_date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-slate-600">الموقع</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                <CalendarDays className="h-5 w-5 text-primary" />
                تفاصيل الفعالية
              </h2>
              <div className="prose max-w-none text-slate-700">
                <p className="whitespace-pre-wrap text-base leading-relaxed">{event.announcement}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
              <div className="text-sm text-slate-600">
                <span className="font-semibold">المحافظة:</span>{' '}
                <span className="text-slate-900">{event.branch_governorate}</span>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  <ArrowRight className="h-4 w-4" />
                  المزيد من الفعاليات
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}
