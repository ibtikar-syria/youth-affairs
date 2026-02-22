import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { Branch, EventItem, AuthUser } from '../lib/types'

const TOKEN_KEY = 'ya_admin_token'

type EventFormState = {
  title: string
  imageUrl: string
  announcement: string
  eventDate: string
  location: string
}

const emptyEvent: EventFormState = {
  title: '',
  imageUrl: '',
  announcement: '',
  eventDate: '',
  location: '',
}

export const AdminPage = () => {
  const [token, setToken] = useState<string>(localStorage.getItem(TOKEN_KEY) ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [user, setUser] = useState<AuthUser | null>(null)
  const [branch, setBranch] = useState<Branch | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [eventForm, setEventForm] = useState<EventFormState>(emptyEvent)
  const [editingId, setEditingId] = useState<number | null>(null)

  const loadAdminData = async (activeToken: string) => {
    const [me, branchResult, eventsResult] = await Promise.all([
      api.getAdminMe(activeToken),
      api.getAdminBranch(activeToken),
      api.getAdminEvents(activeToken),
    ])
    setUser(me.user)
    setBranch(branchResult.item)
    setEvents(eventsResult.items)
  }

  useEffect(() => {
    if (!token) {
      return
    }

    setLoading(true)
    void loadAdminData(token)
      .catch((authError) => {
        setError(authError instanceof Error ? authError.message : 'تعذر تحميل بيانات الحساب')
        setToken('')
        localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await api.login(loginForm.username, loginForm.password)
      if (result.user.role !== 'admin') {
        setError('هذه الصفحة مخصصة لمشرفي الأفرع فقط')
        return
      }
      localStorage.setItem(TOKEN_KEY, result.token)
      setToken(result.token)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBranch = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token || !branch) {
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.updateAdminBranch(token, {
        address: branch.address,
        phone: branch.phone,
        whatsapp: branch.whatsapp,
        facebook: branch.facebook ?? '',
        telegram: branch.telegram ?? '',
        instagram: branch.instagram ?? '',
      })
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'فشل تحديث بيانات الفرع')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEvent = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    setLoading(true)
    setError('')
    try {
      if (editingId) {
        await api.updateAdminEvent(token, editingId, eventForm)
      } else {
        await api.createAdminEvent(token, eventForm)
      }
      const updated = await api.getAdminEvents(token)
      setEvents(updated.items)
      setEventForm(emptyEvent)
      setEditingId(null)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'فشل حفظ الفعالية')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (!token) {
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.deleteAdminEvent(token, eventId)
      const updated = await api.getAdminEvents(token)
      setEvents(updated.items)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'فشل حذف الفعالية')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setUser(null)
    setBranch(null)
    setEvents([])
  }

  if (!token || !user) {
    return (
      <div dir="rtl" className="mx-auto max-w-lg px-4 py-12">
        <Link to="/" className="mb-6 inline-block text-sm text-primary">
          العودة إلى الصفحة الرئيسية
        </Link>
        <h1 className="mb-4 text-2xl font-bold text-primary">دخول مشرف الفرع</h1>
        <form onSubmit={handleLogin} className="space-y-3 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="اسم المستخدم"
            value={loginForm.username}
            onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
          />
          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="كلمة المرور"
            value={loginForm.password}
            onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          <button className="w-full rounded-lg bg-primary px-4 py-2 font-bold text-white" disabled={loading}>
            تسجيل الدخول
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    )
  }

  return (
    <div dir="rtl" className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">لوحة مشرف الفرع</h1>
          <p className="text-sm text-slate-600">مرحباً {user.displayName}</p>
        </div>
        <button onClick={logout} className="rounded-lg border border-primary px-4 py-2 text-primary">
          تسجيل الخروج
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {branch && (
        <form onSubmit={handleUpdateBranch} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">بيانات الفرع: {branch.name}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2"
              placeholder="العنوان"
              value={branch.address}
              onChange={(event) => setBranch((prev) => (prev ? { ...prev, address: event.target.value } : prev))}
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2"
              placeholder="الهاتف"
              value={branch.phone}
              onChange={(event) => setBranch((prev) => (prev ? { ...prev, phone: event.target.value } : prev))}
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2"
              placeholder="واتساب"
              value={branch.whatsapp}
              onChange={(event) => setBranch((prev) => (prev ? { ...prev, whatsapp: event.target.value } : prev))}
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Facebook"
              value={branch.facebook ?? ''}
              onChange={(event) => setBranch((prev) => (prev ? { ...prev, facebook: event.target.value } : prev))}
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Telegram"
              value={branch.telegram ?? ''}
              onChange={(event) => setBranch((prev) => (prev ? { ...prev, telegram: event.target.value } : prev))}
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Instagram"
              value={branch.instagram ?? ''}
              onChange={(event) => setBranch((prev) => (prev ? { ...prev, instagram: event.target.value } : prev))}
            />
          </div>
          <button className="mt-4 rounded-lg bg-accent px-4 py-2 font-bold text-slate-900" disabled={loading}>
            حفظ بيانات الفرع
          </button>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSaveEvent} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">{editingId ? 'تعديل فعالية' : 'إضافة فعالية جديدة'}</h2>
          <div className="space-y-3">
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="اسم الفعالية"
              value={eventForm.title}
              onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))}
            />
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="رابط الصورة"
              value={eventForm.imageUrl}
              onChange={(event) => setEventForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            />
            <textarea
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="نص الإعلان"
              rows={4}
              value={eventForm.announcement}
              onChange={(event) => setEventForm((prev) => ({ ...prev, announcement: event.target.value }))}
            />
            <input
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={eventForm.eventDate}
              onChange={(event) => setEventForm((prev) => ({ ...prev, eventDate: event.target.value }))}
            />
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="المكان"
              value={eventForm.location}
              onChange={(event) => setEventForm((prev) => ({ ...prev, location: event.target.value }))}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-lg bg-primary px-4 py-2 font-bold text-white" disabled={loading}>
              {editingId ? 'حفظ التعديلات' : 'إضافة الفعالية'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setEventForm(emptyEvent)
                }}
                className="rounded-lg border border-slate-300 px-4 py-2"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>

        <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">فعاليات الفرع</h2>
          <div className="space-y-3">
            {events.map((eventItem) => (
              <article key={eventItem.id} className="rounded-xl border border-slate-200 p-3">
                <h3 className="font-semibold">{eventItem.title}</h3>
                <p className="text-sm text-slate-600">{eventItem.event_date} — {eventItem.location}</p>
                <div className="mt-2 flex gap-2 text-sm">
                  <button
                    onClick={() => {
                      setEditingId(eventItem.id)
                      setEventForm({
                        title: eventItem.title,
                        imageUrl: eventItem.image_url,
                        announcement: eventItem.announcement,
                        eventDate: eventItem.event_date,
                        location: eventItem.location,
                      })
                    }}
                    className="rounded-lg border border-primary px-3 py-1 text-primary"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => void handleDeleteEvent(eventItem.id)}
                    className="rounded-lg border border-red-300 px-3 py-1 text-red-600"
                  >
                    حذف
                  </button>
                </div>
              </article>
            ))}
            {events.length === 0 && <p className="text-sm text-slate-600">لا توجد فعاليات بعد.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
