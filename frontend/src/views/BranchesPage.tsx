import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { api } from '../lib/api'
import { BranchesExplorer } from '../components/BranchesExplorer'
import type { Branch } from '../lib/types'

export const BranchesPage = () => {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loadingBranches, setLoadingBranches] = useState(false)

  useEffect(() => {
    setLoadingBranches(true)
    void api
      .getPublicBranches()
      .then((result) => setBranches(result.items))
      .finally(() => setLoadingBranches(false))
  }, [])

  return (
    <div dir="rtl" className="bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div>
            <div>
              <h1 className="inline-flex items-center gap-2 text-3xl font-bold text-primary">
                <MapPin className="h-7 w-7" />
                دليل الأفرع
              </h1>
              <p className="mt-1 text-sm text-slate-600">تصفح جميع الأفرع ومعلومات التواصل</p>
            </div>
          </div>
        </section>

        <div className="mb-4 text-sm text-slate-600">
          عدد الأفرع: <span className="font-semibold text-primary">{branches.length}</span>
        </div>
        <BranchesExplorer
          variant="branches-page"
          branches={branches}
          loadingBranches={loadingBranches}
        />
      </main>

    </div>
  )
}