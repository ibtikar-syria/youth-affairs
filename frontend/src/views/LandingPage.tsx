import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowUpLeft,
  BookOpen,
  CalendarDays,
  ChevronUp,
  Flag,
  Globe2,
  Handshake,
  Lightbulb,
  MapPin,
  Megaphone,
  MessageCircle,
  Scale,
  Send,
  Shield,
  Sprout,
  Target,
  Users,
} from 'lucide-react'
import { api } from '../lib/api'
import { BranchesExplorer } from '../components/BranchesExplorer'
import { EventsExplorer } from '../components/EventsExplorer'
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

export const LandingPage = () => {
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [filters, setFilters] = useState({ branchId: '', month: '', year: '' })
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const landingBranches = useMemo(() => branches.slice(0, 6), [branches])

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return [currentYear - 1, currentYear, currentYear + 1]
  }, [])

  useEffect(() => {
    setLoadingBranches(true)
    void api
      .getPublicBranches()
      .then((branchesResult) => setBranches(branchesResult.items))
      .finally(() => setLoadingBranches(false))
  }, [])

  useEffect(() => {
    setLoadingEvents(true)
    void api
      .getPublicEvents(filters)
      .then((result) => setEvents(result.items))
      .finally(() => setLoadingEvents(false))
  }, [filters])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 320)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        immediateRender: false,
      })

      gsap.utils.toArray<HTMLElement>('.js-reveal').forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 34,
          duration: 0.75,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: section,
            start: 'top 84%',
            once: true,
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
          immediateRender: false,
          scrollTrigger: {
            trigger: grid,
            start: 'top 86%',
            once: true,
          },
        })
      })
    }, pageRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={pageRef} dir="rtl" className="bg-slate-50 text-slate-800">
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
                className="js-hero-reveal inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-primary transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-blue-50"
              >
                تطوع الآن
                <ArrowUpLeft className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
              </a>
            </div>
            <div className="js-hero-reveal rounded-2xl bg-white/15 p-6 backdrop-blur transition-all duration-300 hover:bg-white/20 hover:shadow-2xl">
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
              <article key={goal.title} className="js-card rounded-xl border border-blue-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/30">
                <h4 className="mb-3 inline-flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Icon className="h-5 w-5 text-primary" />
                  {goal.title}
                </h4>
                <ul className="space-y-2 text-slate-700">
                  {goal.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 leading-7">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{point}</span>
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
              <div key={value.label} className="js-card rounded-xl border border-blue-100 bg-white p-4 text-center font-semibold shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 hover:bg-primary/5 hover:border-primary/40">
                <Icon className="mx-auto mb-2 h-5 w-5 text-primary transition-transform duration-300 hover:scale-110" />
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
          <article className="js-card rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30">
            <p className="leading-8 text-slate-700">{content.workScope}</p>
          </article>
        </section>

        <section id="branches" className="animate-in js-reveal mx-auto max-w-6xl px-4 py-14">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <h3 className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
                <MapPin className="h-6 w-6" />
                دليل الأفرع
              </h3>
              <Link
                to="/branches"
                className="inline-flex items-center gap-1 rounded-lg border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
              >
                عرض المزيد
                <ArrowUpLeft className="h-4 w-4" />
              </Link>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{branches.length} فرع</span>
          </div>

          <BranchesExplorer
            variant="landing"
            branches={landingBranches}
            loadingBranches={loadingBranches}
          />
        </section>

        <section id="events" className="animate-in js-reveal mx-auto max-w-6xl px-4 py-14">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <h3 className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
                <CalendarDays className="h-6 w-6" />
                الفعاليات
              </h3>
              <Link
                to="/events"
                className="inline-flex items-center gap-1 rounded-lg border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
              >
                عرض المزيد
                <ArrowUpLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <EventsExplorer
            variant="landing"
            branches={branches}
            events={events}
            filters={filters}
            years={years}
            loadingEvents={loadingEvents}
            onFiltersChange={setFilters}
            onEventClick={(eventId) => navigate(`/events/${eventId}`)}
          />
        </section>
      </main>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="العودة للأعلى"
        className={`fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all duration-300 hover:scale-105 ${
          showScrollTop ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <ChevronUp className="h-6 w-6" />
      </button>
    </div>
  )
}
