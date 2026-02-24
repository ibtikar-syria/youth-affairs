import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronRight, Filter, MapPin } from 'lucide-react'
import { api } from '../lib/api'
import type { Branch, EventItem } from '../lib/types'

const monthOptions = Array.from({ length: 12 }).map((_, index) => {
  const month = String(index + 1).padStart(2, '0')
  return { value: month, label: `الشهر ${index + 1}` }
})

export const EventsPage = () => {
  const navigate = useNavigate()
  const [branches, setBranches] = useState<Branch[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [filters, setFilters] = useState({ branchId: '', month: '', year: '' })
  const [loadingEvents, setLoadingEvents] = useState(false)

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return [currentYear - 1, currentYear, currentYear + 1]
  }, [])

  useEffect(() => {
    void (async () => {
      const branchesResult = await api.getPublicBranches()
      setBranches(branchesResult.items)
    })()
  }, [])

  useEffect(() => {
    setLoadingEvents(true)
    void api
      .getPublicEvents(filters)
      .then((result) => setEvents(result.items))
      .finally(() => setLoadingEvents(false))
  }, [filters])

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      <header className="border-b border-blue-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">الفعاليات</h1>
              <p className="mt-1 text-sm text-slate-600">تصفح جميع الفعاليات والأنشطة</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
            >
              <ChevronRight className="h-4 w-4" />
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Filter className="h-4 w-4" />
            تصفية النتائج
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-all duration-200 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={filters.branchId}
              onChange={(event) => setFilters((prev) => ({ ...prev, branchId: event.target.value }))}
            >
              <option value="">كل المحافظات</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.governorate}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-all duration-200 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={filters.month}
              onChange={(event) => setFilters((prev) => ({ ...prev, month: event.target.value }))}
            >
              <option value="">كل الأشهر</option>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-all duration-200 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={filters.year}
              onChange={(event) => setFilters((prev) => ({ ...prev, year: event.target.value }))}
            >
              <option value="">كل السنوات</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {(filters.branchId || filters.month || filters.year) && (
              <button
                type="button"
                onClick={() => setFilters({ branchId: '', month: '', year: '' })}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-200"
              >
                إعادة تعيين
              </button>
            )}
          </div>
        </div>

        {loadingEvents ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
            <p className="mt-4 text-slate-600">جار تحميل الفعاليات...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-blue-100 bg-white p-12 text-center shadow-sm">
            <CalendarDays className="mx-auto h-16 w-16 text-slate-300" />
            <p className="mt-4 text-lg font-medium text-slate-600">لا توجد فعاليات متاحة</p>
            <p className="mt-1 text-sm text-slate-500">جرب تغيير الفلاتر أو العودة لاحقاً</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-slate-600">
              عدد النتائج: <span className="font-semibold text-primary">{events.length}</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events.map((eventItem) => (
                <article
                  key={eventItem.id}
                  onClick={() => navigate(`/events/${eventItem.id}`)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition-all duration-300 hover:scale-[1.03] hover:border-primary/30 hover:shadow-xl"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={eventItem.image_url}
                      alt={eventItem.title}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  </div>
                  <div className="p-4">
                    <h4 className="mb-2 line-clamp-2 text-lg font-bold text-slate-900 transition-colors duration-200 group-hover:text-primary">
                      {eventItem.title}
                    </h4>
                    <p className="mb-3 line-clamp-2 text-sm text-slate-600">{eventItem.announcement}</p>
                    <div className="space-y-1">
                      <p className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <MapPin className="h-3.5 w-3.5" />
                        {eventItem.location}
                      </p>
                      <p className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {eventItem.event_date}
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold text-primary">
                      {eventItem.branch_name ?? eventItem.branch_governorate}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
