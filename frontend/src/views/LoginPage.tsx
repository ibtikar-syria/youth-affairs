import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, UserCircle } from 'lucide-react'
import { api } from '../lib/api'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'

const ADMIN_TOKEN_KEY = 'ya_admin_token'
const SUPERADMIN_TOKEN_KEY = 'ya_superadmin_token'

export const LoginPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const redirectByStoredSession = async () => {
      const superadminToken = localStorage.getItem(SUPERADMIN_TOKEN_KEY)
      if (superadminToken) {
        try {
          const result = await api.getAdminMe(superadminToken)
          if (result.user.role === 'superadmin') {
            if (!cancelled) {
              navigate('/superadmin', { replace: true })
            }
            return
          }
        } catch {
          localStorage.removeItem(SUPERADMIN_TOKEN_KEY)
        }
      }

      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY)
      if (adminToken) {
        try {
          const result = await api.getAdminMe(adminToken)
          if (result.user.role === 'admin') {
            if (!cancelled) {
              navigate('/admin', { replace: true })
            }
            return
          }
        } catch {
          localStorage.removeItem(ADMIN_TOKEN_KEY)
        }
      }

      if (!cancelled) {
        setCheckingSession(false)
      }
    }

    void redirectByStoredSession()
    return () => {
      cancelled = true
    }
  }, [navigate])

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await api.login(form.username, form.password)

      if (result.user.role === 'superadmin') {
        localStorage.removeItem(ADMIN_TOKEN_KEY)
        localStorage.setItem(SUPERADMIN_TOKEN_KEY, result.token)
        navigate('/superadmin', { replace: true })
        return
      }

      localStorage.removeItem(SUPERADMIN_TOKEN_KEY)
      localStorage.setItem(ADMIN_TOKEN_KEY, result.token)
      navigate('/admin', { replace: true })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <p className="text-sm font-medium text-slate-600">جارٍ التحقق من الجلسة...</p>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      <SiteHeader />

      <div className="px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">تسجيل الدخول</h1>
              <p className="text-sm text-slate-600">للمدير العام ومشرفي الأفرع</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative">
              <UserCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                dir="ltr"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-9 text-left outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="اسم المستخدم"
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              />
            </div>
            <input
              type="password"
              dir="ltr"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-left outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="كلمة المرور"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            <button
              className="w-full rounded-lg bg-primary px-4 py-2 font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'جار تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          </form>
        </div>
      </div>
      </div>

      <SiteFooter />
    </div>
  )
}