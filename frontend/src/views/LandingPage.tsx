import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowUpLeft,
  BookOpen,
  CalendarDays,
  Flag,
  Globe2,
  Handshake,
  Lightbulb,
  MapPin,
  Megaphone,
  MessageCircle,
  Phone,
  Scale,
  Send,
  Shield,
  Sprout,
  Target,
  Users,
} from 'lucide-react'
import { api } from '../lib/api'
import type { Branch, EventItem } from '../lib/types'

const values = [
  { label: 'الانتماء', icon: Flag },
  { label: 'المسؤولية', icon: Shield },
  { label: 'الابتكار', icon: Lightbulb },
  { label: 'الحوار', icon: MessageCircle },
  { label: 'العدالة', icon: Scale },
  { label: 'الاستدامة', icon: Sprout },
  { label: 'المبادرة', icon: Megaphone },
]

const goalIcons = [BookOpen, Users, Flag, Handshake, Target, MessageCircle, Globe2, Megaphone]

const goals = [
  {
    title: 'تنمية الشباب تنمية شاملة',
    points: [
      'فكرياً وسياسياً واجتماعياً، مع دعم التحصيل العلمي وتشجيع القراءة والبحث.',
      'تنمية التفكير النقدي والتحليلي، ودعم الطلاب في مختلف التخصصات.',
      'غرس القيم الإنسانية والأخلاقية وتعزيز مفاهيم الخير وبناء الضمير الحي.',
      'تعزيز الثقة بالنفس، والعمل الجماعي، ومهارات التواصل، وتحمل المسؤولية الاجتماعية.',
    ],
  },
  {
    title: 'إعداد جيل قيادي ومبادر',
    points: [
      'تدريب الشباب على القيادة وروح المبادرة.',
      'إعداد كوادر قادرة على إدارة المشاريع بفعالية.',
      'تأهيل الشباب ليكونوا فاعلين في المجتمع لا متفرجين.',
    ],
  },
  {
    title: 'حماية الهوية الثقافية والحضارية',
    points: [
      'تعزيز الانتماء للهوية السورية وربط الشباب بتاريخهم وحضارتهم.',
      'مواجهة الاغتراب الثقافي والفكري.',
      'الجمع بين الأصالة والمعاصرة.',
    ],
  },
  {
    title: 'دعم المشاركة المجتمعية والتطوع',
    points: [
      'نشر ثقافة العمل التطوعي وإشراك الشباب في خدمة المجتمع.',
      'تنمية الإحساس بالمسؤولية تجاه الآخرين.',
      'دعم مشاريع اجتماعية وإنسانية ذات أثر مستدام.',
    ],
  },
  {
    title: 'إبراز الرموز والقدوات',
    points: ['تسليط الضوء على النماذج الشبابية الملهمة وتعزيز حضورها في المجال العام.'],
  },
  {
    title: 'خلق قنوات مؤسساتية لتمثيل صوت الشباب',
    points: ['تطوير مسارات رسمية تضمن وصول تطلعات الشباب إلى جهات القرار.'],
  },
  {
    title: 'تعزيز الثقة وبناء جسور التواصل',
    points: ['تقوية العلاقة بين الشباب والمؤسسات الرسمية على أساس الشراكة والمسؤولية.'],
  },
  {
    title: 'تقديم توصيات للمؤسسات الرسمية',
    points: ['صياغة مقترحات عملية تدعم السياسات الشبابية والتنمية المستدامة.'],
  },
]

const content = {
  organizationName: 'شؤون الشباب',
  slogan: 'جيل شبابي متمكّن وواعٍ',
  definition:
    'مؤسسة رسمية وطنية تُعنى بتمكين الشباب فكرياً وسياسياً واجتماعياً، بهدف صناعة جيل واعٍ يسهم في بناء وطنه وتمثيله وخدمة قيمه ومبادئه.',
  vision:
    'أن تكون المؤسسة الرائدة في صناعة جيل شبابي واعٍ، متمكّن فكرياً، مؤهّل سياسياً، فاعل اجتماعياً، معتز بهويته، ومسهم في بناء وطنه وخدمة قيمه ومبادئه.',
  mission:
    'النهوض بالشباب فكرياً وسياسياً واجتماعياً عبر تنمية الوعي ورفع الكفاءة المعرفية والمهارات القيادية ضمن الأطر القانونية، ليكون شريكاً حقيقياً في صناعة القرار وبناء الدولة والتنمية المستدامة.',
  workScope:
    'يمتد عمل المؤسسة ليشمل الشباب السوري من مختلف الفئات العمرية وعلى المستوى الوطني، مع إمكانية تنفيذ أنشطة مشتركة إقليمياً أو دولياً بما لا يتعارض مع القوانين والسيادة الوطنية.',
  volunteerFormUrl: 'https://forms.google.com',
}

const monthOptions = Array.from({ length: 12 }).map((_, index) => {
  const month = String(index + 1).padStart(2, '0')
  return { value: month, label: `الشهر ${index + 1}` }
})

export const LandingPage = () => {
  const pageRef = useRef<HTMLDivElement | null>(null)
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
    if (!pageRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.from('.js-hero-reveal', {
        opacity: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
      })

      gsap.utils.toArray<HTMLElement>('.js-reveal').forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 34,
          duration: 0.75,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 84%',
            toggleActions: 'play none none none',
          },
        })
      })

      gsap.utils.toArray<HTMLElement>('.js-stagger-cards').forEach((grid) => {
        const cards = grid.querySelectorAll('.js-card')
        if (!cards.length) return

        gsap.from(cards, {
          opacity: 0,
          y: 22,
          duration: 0.55,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: grid,
            start: 'top 86%',
            toggleActions: 'play none none none',
          },
        })
      })
    }, pageRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={pageRef} dir="rtl" className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/ya_logo_color.svg" alt="شعار شؤون الشباب" className="h-12 w-12" />
            <div>
              <h1 className="text-xl font-bold text-primary">{content.organizationName}</h1>
              <p className="text-sm text-slate-600">{content.slogan}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <a href="#events" className="inline-flex items-center gap-1 text-slate-600 hover:text-primary">
              <CalendarDays className="h-4 w-4" />
              الفعاليات
            </a>
            <a href="#branches" className="inline-flex items-center gap-1 text-slate-600 hover:text-primary">
              <MapPin className="h-4 w-4" />
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
        <section className="relative overflow-hidden bg-gradient-to-l from-primary to-accent py-16 text-white">
          <img
            src="/ya_logo_gray.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-1/2 w-100 max-w-none -translate-x-1/2 -translate-y-1/2 opacity-25"
          />
          <div className="animate-in relative z-10 mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="js-hero-reveal mb-4 text-3xl font-bold md:text-4xl">{content.slogan}</h2>
              <p className="js-hero-reveal mb-6 text-base leading-8 md:text-lg">{content.definition}</p>
              <a
                href={content.volunteerFormUrl}
                target="_blank"
                rel="noreferrer"
                className="js-hero-reveal inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-primary"
              >
                تطوع الآن
                <ArrowUpLeft className="h-5 w-5" />
              </a>
            </div>
            <div className="js-hero-reveal rounded-2xl bg-white/15 p-6 backdrop-blur">
              <h3 className="mb-3 inline-flex items-center gap-2 text-lg font-bold">
                <Target className="h-5 w-5" />
                رؤيتنا
              </h3>
              <p className="mb-5 leading-8">{content.vision}</p>
              <h3 className="mb-3 inline-flex items-center gap-2 text-lg font-bold">
                <Send className="h-5 w-5" />
                رسالتنا
              </h3>
              <p className="leading-8">{content.mission}</p>
            </div>
          </div>
        </section>

        <section className="animate-in js-reveal mx-auto max-w-6xl px-4 py-14">
          <h3 className="mb-6 inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <Target className="h-6 w-6" />
            أهدافنا
          </h3>
          <div className="js-stagger-cards grid gap-4 md:grid-cols-2">
            {goals.map((goal, index) => {
              const Icon = goalIcons[index % goalIcons.length]
              return (
              <article key={goal.title} className="js-card rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
                <h4 className="mb-3 inline-flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Icon className="h-5 w-5 text-primary" />
                  {goal.title}
                </h4>
                <ul className="space-y-2 text-slate-700">
                  {goal.points.map((point) => (
                    <li key={point} className="relative pe-4 leading-7">
                      <span className="absolute right-0 top-3 h-1.5 w-1.5 rounded-full bg-accent" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
              )
            })}
          </div>
        </section>

        <section className="animate-in js-reveal mx-auto max-w-6xl px-4 py-14">
          <h3 className="mb-6 inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <Shield className="h-6 w-6" />
            قيمنا
          </h3>
          <div className="js-stagger-cards grid grid-cols-2 gap-3 sm:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon
              return (
              <div key={value.label} className="js-card rounded-xl border border-blue-100 bg-white p-4 text-center font-semibold shadow-sm">
                <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                {value.label}
              </div>
              )
            })}
          </div>
        </section>

        <section className="animate-in js-reveal mx-auto max-w-6xl px-4 py-14">
          <h3 className="mb-6 inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <Globe2 className="h-6 w-6" />
            فضاء العمل
          </h3>
          <article className="js-card rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <p className="leading-8 text-slate-700">{content.workScope}</p>
          </article>
        </section>

        <section id="branches" className="animate-in js-reveal mx-auto max-w-6xl px-4 py-14">
          <h3 className="mb-6 inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <MapPin className="h-6 w-6" />
            دليل الأفرع
          </h3>
          <div className="js-stagger-cards grid gap-4 md:grid-cols-2">
            {branches.map((branch) => (
              <article key={branch.id} className="js-card rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <h4 className="text-lg font-bold text-slate-900">{branch.name}</h4>
                <p className="mt-2 text-sm text-slate-600">{branch.address}</p>
                <p className="inline-flex items-center gap-1 text-sm text-slate-600">
                  <Phone className="h-4 w-4" />
                  الهاتف: {branch.phone}
                </p>
                <p className="inline-flex items-center gap-1 text-sm text-slate-600">
                  <MessageCircle className="h-4 w-4" />
                  واتساب: {branch.whatsapp}
                </p>
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

        <section id="events" className="animate-in js-reveal mx-auto max-w-6xl px-4 py-14">
          <div className="js-card mb-6 flex flex-wrap items-center justify-between gap-4">
            <h3 className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
              <CalendarDays className="h-6 w-6" />
              الفعاليات
            </h3>
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
            <div className="js-stagger-cards grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((eventItem) => (
                <article key={eventItem.id} className="js-card overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                  <img src={eventItem.image_url} alt={eventItem.title} className="h-44 w-full object-cover" />
                  <div className="p-4">
                    <h4 className="mb-2 text-lg font-bold">{eventItem.title}</h4>
                    <p className="mb-3 text-sm text-slate-600">{eventItem.announcement}</p>
                    <p className="inline-flex items-center gap-1 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      المكان: {eventItem.location}
                    </p>
                    <p className="inline-flex items-center gap-1 text-sm text-slate-600">
                      <CalendarDays className="h-4 w-4" />
                      التاريخ: {eventItem.event_date}
                    </p>
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
