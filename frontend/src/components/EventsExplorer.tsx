import { CalendarDays, Filter, MapPin } from 'lucide-react'
import type { Branch, EventItem } from '../lib/types'

type EventsFilters = {
  branchId: string
  month: string
  year: string
}

type EventsExplorerProps = {
  branches: Branch[]
  events: EventItem[]
  filters: EventsFilters
  years: number[]
  loadingEvents: boolean
  variant: 'landing' | 'events-page'
  onFiltersChange: (filters: EventsFilters) => void
  onEventClick: (eventId: number) => void
}

const monthOptions = Array.from({ length: 12 }).map((_, index) => {
  const month = String(index + 1).padStart(2, '0')
  return { value: month, label: `الشهر ${index + 1}` }
})

export const EventsExplorer = ({
  branches,
  events,
  filters,
  years,
  loadingEvents,
  variant,
  onFiltersChange,
  onEventClick,
}: EventsExplorerProps) => {
  const hasActiveFilters = Boolean(filters.branchId || filters.month || filters.year)
  const isLanding = variant === 'landing'

  return (
    <>
      <div
        className={
          isLanding
            ? 'js-card mb-6 flex flex-wrap gap-2'
            : 'mb-6 rounded-xl border border-blue-100 bg-white p-4 shadow-sm'
        }
      >
        {!isLanding && (
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Filter className="h-4 w-4" />
            تصفية النتائج
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <select
            className={
              isLanding
                ? 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'
                : 'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-all duration-200 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
            }
            value={filters.branchId}
            onChange={(event) => onFiltersChange({ ...filters, branchId: event.target.value })}
          >
            <option value="">كل الأفرع</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <select
            className={
              isLanding
                ? 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'
                : 'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-all duration-200 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
            }
            value={filters.month}
            onChange={(event) => onFiltersChange({ ...filters, month: event.target.value })}
          >
            <option value="">كل الأشهر</option>
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <select
            className={
              isLanding
                ? 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'
                : 'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-all duration-200 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
            }
            value={filters.year}
            onChange={(event) => onFiltersChange({ ...filters, year: event.target.value })}
          >
            <option value="">كل السنوات</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {!isLanding && hasActiveFilters && (
            <button
              type="button"
              onClick={() => onFiltersChange({ branchId: '', month: '', year: '' })}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-200"
            >
              إعادة تعيين
            </button>
          )}
        </div>
      </div>

      {loadingEvents ? (
        isLanding ? (
          <p className="text-slate-600">جار تحميل الفعاليات...</p>
        ) : (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
            <p className="mt-4 text-slate-600">جار تحميل الفعاليات...</p>
          </div>
        )
      ) : events.length === 0 ? (
        isLanding ? (
          <article className="js-card rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-center text-slate-600 shadow-sm">
            لا توجد فعاليات متاحة حالياً.
          </article>
        ) : (
          <div className="rounded-xl border border-blue-100 bg-white p-12 text-center shadow-sm">
            <CalendarDays className="mx-auto h-16 w-16 text-slate-300" />
            <p className="mt-4 text-lg font-medium text-slate-600">لا توجد فعاليات متاحة</p>
            <p className="mt-1 text-sm text-slate-500">جرب تغيير الفلاتر أو العودة لاحقاً</p>
          </div>
        )
      ) : (
        <>
          {!isLanding && (
            <div className="mb-4 text-sm text-slate-600">
              عدد النتائج: <span className="font-semibold text-primary">{events.length}</span>
            </div>
          )}
          <div className={isLanding ? 'js-stagger-cards grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
            {events.map((eventItem) => (
              <article
                key={eventItem.id}
                onClick={() => onEventClick(eventItem.id)}
                className={`group cursor-pointer overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition-all duration-300 hover:scale-[1.03] hover:border-primary/30 hover:shadow-xl ${
                  isLanding ? 'js-card' : ''
                }`}
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
                  <div className="flex flex-wrap gap-2">
                    <p className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                      <MapPin className="h-3.5 w-3.5" />
                      {eventItem.location}
                    </p>
                    <p className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
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
    </>
  )
}