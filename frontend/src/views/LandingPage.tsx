import { gsap } from 'gsap'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { Branch, EventItem } from '../lib/types'

const values = ['الانتماء', 'المسؤولية', 'الابتكار', 'الحوار', 'العدالة', 'الاستدامة', 'المبادرة', 'التطوع']
const goals = [
  'تنمية الشباب تنمية شاملة فكرياً واجتماعياً ومهارياً.',
  'إعداد جيل قيادي ومبادر قادر على خدمة المجتمع.',
  'حماية الهوية الثقافية الوطنية وتعزيز الانتماء.',
  'تعزيز العمل التطوعي والمبادرات الشبابية المؤثرة.',
  'إبراز النماذج الشبابية السورية المتميزة محلياً.',
]

const content = {
  organizationName: 'شؤون الشباب',
  slogan: 'جيل شبابي متمكن وقوي',
  definition:
    'مؤسسة رسمية وطنية تُعنى بتمكين الشباب فكرياً وسياسياً واجتماعياً لصناعة جيل واعٍ يسهم في بناء وطنه.',
  vision:
    'الريادة في صناعة جيل شبابي متمكن فكرياً، مؤهل سياسياً، فاعل اجتماعياً، ومعتز بهويته.',
  mission:
    'النهوض بالشباب عبر تنمية الوعي ورفع الكفاءة المعرفية والمهارات القيادية ليكون شريكاً حقيقياً في صناعة القرار وبناء الدولة.',
  volunteerFormUrl: 'https://forms.google.com',
}

const monthOptions = Array.from({ length: 12 }).map((_, index) => {
  const month = String(index + 1).padStart(2, '0')
  return { value: month, label: `الشهر ${index + 1}` }
})

export const LandingPage = () => {
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

  useEffect(() => {
    gsap.from('.animate-in', {
      y: 18,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
    })
  }, [branches, events])

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-primary">{content.organizationName}</h1>
            <p className="text-sm text-slate-600">{content.slogan}</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <a href="#events" className="text-slate-600 hover:text-primary">
              الفعاليات
            </a>
            <a href="#branches" className="text-slate-600 hover:text-primary">
              الأفرع
            </a>
            <Link to="/admin" className="rounded-lg border border-primary px-3 py-2 text-primary">
              دخول المشرف
            </Link>
            <Link to="/superadmin" className="rounded-lg bg-primary px-3 py-2 text-white">
              المدير العام
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-l from-primary to-accent py-16 text-white">
          <div className="animate-in mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">{content.slogan}</h2>
              <p className="mb-6 text-base leading-8 md:text-lg">{content.definition}</p>
              <a
                href={content.volunteerFormUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-xl bg-white px-6 py-3 font-bold text-primary"
              >
                تطوع الآن
              </a>
            </div>
            <div className="rounded-2xl bg-white/15 p-6 backdrop-blur">
              <h3 className="mb-3 text-lg font-bold">رؤيتنا</h3>
              <p className="mb-5 leading-8">{content.vision}</p>
              <h3 className="mb-3 text-lg font-bold">رسالتنا</h3>
              <p className="leading-8">{content.mission}</p>
            </div>
          </div>
        </section>

        <section className="animate-in mx-auto max-w-6xl px-4 py-14">
          <h3 className="mb-6 text-2xl font-bold text-primary">أهدافنا</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {goals.map((goal) => (
              <article key={goal} className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
                <p className="leading-7 text-slate-700">{goal}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="animate-in mx-auto max-w-6xl px-4 py-14">
          <h3 className="mb-6 text-2xl font-bold text-primary">قيمنا</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {values.map((value) => (
              <div key={value} className="rounded-xl border border-blue-100 bg-white p-4 text-center font-semibold shadow-sm">
                {value}
              </div>
            ))}
          </div>
        </section>

        <section id="branches" className="animate-in mx-auto max-w-6xl px-4 py-14">
          <h3 className="mb-6 text-2xl font-bold text-primary">دليل الأفرع</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {branches.map((branch) => (
              <article key={branch.id} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <h4 className="text-lg font-bold text-slate-900">{branch.name}</h4>
                <p className="mt-2 text-sm text-slate-600">{branch.address}</p>
                <p className="text-sm text-slate-600">الهاتف: {branch.phone}</p>
                <p className="text-sm text-slate-600">واتساب: {branch.whatsapp}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  {branch.facebook && (
                    <a className="rounded-lg bg-blue-50 px-3 py-1 text-primary" href={branch.facebook} target="_blank" rel="noreferrer">
                      Facebook
                    </a>
                  )}
                  {branch.telegram && (
                    <a className="rounded-lg bg-blue-50 px-3 py-1 text-primary" href={branch.telegram} target="_blank" rel="noreferrer">
                      Telegram
                    </a>
                  )}
                  {branch.instagram && (
                    <a className="rounded-lg bg-blue-50 px-3 py-1 text-primary" href={branch.instagram} target="_blank" rel="noreferrer">
                      Instagram
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="events" className="animate-in mx-auto max-w-6xl px-4 py-14">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-2xl font-bold text-primary">الفعاليات</h3>
            <div className="flex flex-wrap gap-2">
              <select
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
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
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
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
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
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
            </div>
          </div>

          {loadingEvents ? (
            <p className="text-slate-600">جار تحميل الفعاليات...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((eventItem) => (
                <article key={eventItem.id} className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                  <img src={eventItem.image_url} alt={eventItem.title} className="h-44 w-full object-cover" />
                  <div className="p-4">
                    <h4 className="mb-2 text-lg font-bold">{eventItem.title}</h4>
                    <p className="mb-3 text-sm text-slate-600">{eventItem.announcement}</p>
                    <p className="text-sm text-slate-600">المكان: {eventItem.location}</p>
                    <p className="text-sm text-slate-600">التاريخ: {eventItem.event_date}</p>
                    <p className="text-sm font-semibold text-primary">{eventItem.branch_name ?? eventItem.branch_governorate}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-12 bg-primary py-8 text-white">
        <div className="mx-auto max-w-6xl px-4 text-sm">
          <p>
            {content.organizationName} — {content.slogan}
          </p>
        </div>
      </footer>
    </div>
  )
}
