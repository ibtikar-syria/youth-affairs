import { ArrowUpLeft, CalendarDays, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Branch } from '../lib/types'

type BranchesExplorerProps = {
  branches: Branch[]
  loadingBranches: boolean
  variant: 'landing' | 'branches-page'
}

export const BranchesExplorer = ({ branches, loadingBranches, variant }: BranchesExplorerProps) => {
  const isLanding = variant === 'landing'
  const displayedBranches = isLanding ? branches.slice(0, 3) : branches
  const remainingBranchesCount = Math.max(branches.length - displayedBranches.length, 0)

  const getWhatsappLink = (whatsapp: string | null) => {
    if (!whatsapp) {
      return ''
    }

    if (whatsapp.startsWith('http://') || whatsapp.startsWith('https://')) {
      return whatsapp
    }

    const normalizedNumber = whatsapp.replace(/\D/g, '')
    return normalizedNumber ? `https://wa.me/${normalizedNumber}` : ''
  }

  if (loadingBranches) {
    if (isLanding) {
      return <p className="text-slate-600">جار تحميل الأفرع...</p>
    }

    return (
      <div className="py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
        <p className="mt-4 text-slate-600">جار تحميل الأفرع...</p>
      </div>
    )
  }

  if (branches.length === 0) {
    return isLanding ? (
      <article className="js-card rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-center text-slate-600 shadow-sm">
        لا توجد أفرع متاحة حالياً.
      </article>
    ) : (
      <article className="rounded-2xl border border-dashed border-blue-200 bg-white p-12 text-center text-slate-600 shadow-sm">
        لا توجد أفرع متاحة حالياً.
      </article>
    )
  }

  return (
    <>
      <div className={isLanding ? 'js-stagger-cards grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'}>
      {displayedBranches.map((branch) => (
        <article
          key={branch.id}
          className={`group flex h-full flex-col rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/30 ${
            isLanding ? 'js-card' : ''
          }`}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <h4 className="text-lg font-bold text-slate-900">{branch.name}</h4>
            <span className="shrink-0 rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-primary">
              {branch.governorate}
            </span>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <p className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
              <MapPin className="h-3.5 w-3.5" />
              {branch.address || 'لا يوجد عنوان مضاف بعد.'}
            </p>
            <p className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
              <Phone className="h-3.5 w-3.5" />
              {branch.phone || 'غير متوفر'}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {branch.facebook && (
              <a
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
                href={branch.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                title="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {branch.telegram && (
              <a
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
                href={branch.telegram}
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                title="Telegram"
              >
                <Send className="h-4 w-4" />
              </a>
            )}
            {branch.instagram && (
              <a
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
                href={branch.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {branch.linkedin && (
              <a
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
                href={branch.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {branch.twitter && (
              <a
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
                href={branch.twitter}
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                title="X"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.901 1.153h3.68l-8.039 9.188 9.457 12.507h-7.406l-5.8-7.584-6.636 7.584H.477l8.597-9.826L0 1.154h7.594l5.243 6.932L18.901 1.153Zm-1.291 19.495h2.04L6.486 3.24H4.298L17.61 20.648Z" />
                </svg>
              </a>
            )}
            {branch.mail && (
              <a
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
                href={`mailto:${branch.mail}`}
                aria-label="Email"
                title="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
            {branch.whatsapp && getWhatsappLink(branch.whatsapp) && (
              <a
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
                href={getWhatsappLink(branch.whatsapp)}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" 
                  width="200" height="200" viewBox="0 0 432 432" fill="currentColor">
                  <path
                    d="M364.5 65Q427 127 427 214.5T364.5 364T214 426q-54 0-101-26L0 429l30-109Q2 271 2 214q0-87 62-149T214 3t150.5 62zM214 390q73 0 125-51.5T391 214T339 89.5T214 38T89.5 89.5T38 214q0 51 27 94l4 6l-18 65l67-17l6 3q42 25 90 25zm97-132q9 5 10 7q4 6-3 25q-3 8-15 15.5t-21 9.5q-18 2-33-2q-17-6-30-11q-8-4-15.5-8.5t-14.5-9t-13-9.5t-11.5-10t-10.5-10.5t-8.5-9.5t-7-8.5t-5.5-7t-3.5-5L128 222q-22-29-22-55q0-24 19-44q6-7 14-7q6 0 10 1q8 0 12 9q2 3 6 13l7 17.5l3 8.5q3 5 1 9q-3 7-5 9l-3 3l-3 3.5l-2 2.5q-6 6-3 11q13 22 30 37q13 11 43 26q7 3 11-1q12-15 17-21q4-6 12-3q6 3 36 17z"
                  />
                </svg>
              </a>
            )}
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <Link
              to={`/events?branchId=${branch.id}`}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3.5 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <CalendarDays className="h-4 w-4" />
              فعاليات هذا الفرع
              <ArrowUpLeft className="h-4 w-4" />
            </Link>
            <div className="group/tooltip relative inline-flex">
              <div
                className="inline-flex min-w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-bold text-primary"
                aria-label="عدد الفعاليات في هذا الفرع"
                tabIndex={0}
              >
                {branch.events_count ?? 0}
              </div>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100">
                عدد الفعاليات في هذا الفرع
              </div>
            </div>
          </div>
        </article>
      ))}
      </div>
      {isLanding && remainingBranchesCount > 0 && (
        <div className="mt-3 text-sm text-slate-600">+{remainingBranchesCount} فرع آخر</div>
      )}
    </>
  )
}