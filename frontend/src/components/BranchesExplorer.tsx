import { MapPin, MessageCircle, Phone } from 'lucide-react'
import type { Branch } from '../lib/types'

type BranchesExplorerProps = {
  branches: Branch[]
  loadingBranches: boolean
  variant: 'landing' | 'branches-page'
}

export const BranchesExplorer = ({ branches, loadingBranches, variant }: BranchesExplorerProps) => {
  const isLanding = variant === 'landing'

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
    <div className={isLanding ? 'js-stagger-cards grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'}>
      {branches.map((branch) => (
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

          <p className="mb-4 inline-flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
            <span>{branch.address || 'لا يوجد عنوان مضاف بعد.'}</span>
          </p>

          <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            <p className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary/80" />
              الهاتف: {branch.phone || 'غير متوفر'}
            </p>
            <p className="inline-flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary/80" />
              واتساب: {branch.whatsapp || 'غير متوفر'}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {branch.facebook && (
              <a
                className="rounded-lg bg-blue-50 px-3 py-1 text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
                href={branch.facebook}
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
            )}
            {branch.telegram && (
              <a
                className="rounded-lg bg-blue-50 px-3 py-1 text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
                href={branch.telegram}
                target="_blank"
                rel="noreferrer"
              >
                Telegram
              </a>
            )}
            {branch.instagram && (
              <a
                className="rounded-lg bg-blue-50 px-3 py-1 text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
                href={branch.instagram}
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}