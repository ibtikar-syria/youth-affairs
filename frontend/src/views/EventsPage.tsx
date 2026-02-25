import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { api } from '../lib/api'
import { EventsExplorer } from '../components/EventsExplorer'
import { SiteHeader } from '../components/SiteHeader'
import type { Branch, EventItem } from '../lib/types'

export const EventsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [branches, setBranches] = useState<Branch[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return {
      branchId: params.get('branchId') ?? '',
      month: params.get('month') ?? '',
      year: params.get('year') ?? '',
    }
  })
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
    const nextFilters = {
      branchId: searchParams.get('branchId') ?? '',
      month: searchParams.get('month') ?? '',
      year: searchParams.get('year') ?? '',
    }

    setFilters({
      branchId: nextFilters.branchId,
      month: nextFilters.month,
      year: nextFilters.year,
    })
  }, [searchParams])

  useEffect(() => {
    const currentBranchId = searchParams.get('branchId') ?? ''
    const currentMonth = searchParams.get('month') ?? ''
    const currentYear = searchParams.get('year') ?? ''

    if (
      currentBranchId === filters.branchId &&
      currentMonth === filters.month &&
      currentYear === filters.year
    ) {
      return
    }

    const params = new URLSearchParams()
    if (filters.branchId) params.set('branchId', filters.branchId)
    if (filters.month) params.set('month', filters.month)
    if (filters.year) params.set('year', filters.year)
    setSearchParams(params, { replace: true })
  }, [filters, searchParams, setSearchParams])

  useEffect(() => {
    setLoadingEvents(true)
    void api
      .getPublicEvents(filters)
      .then((result) => setEvents(result.items))
      .finally(() => setLoadingEvents(false))
  }, [filters])

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      <SiteHeader />

      <section className="border-b border-blue-100 bg-white shadow-sm">
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
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <EventsExplorer
          variant="events-page"
          branches={branches}
          events={events}
          filters={filters}
          years={years}
          loadingEvents={loadingEvents}
          onFiltersChange={setFilters}
          onEventClick={(eventId) => navigate(`/events/${eventId}`)}
        />
      </main>
    </div>
  )
}
