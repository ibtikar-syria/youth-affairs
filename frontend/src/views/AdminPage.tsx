import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ArrowUpRight, Building2, CalendarDays, Image, LogOut, MapPin, UserCircle } from 'lucide-react'
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

  const [user, setUser] = useState<AuthUser | null>(null)
  const [branch, setBranch] = useState<Branch | null>(null)
  const [branchDraft, setBranchDraft] = useState<Branch | null>(null)
  const [isEditingBranch, setIsEditingBranch] = useState(false)
  const [events, setEvents] = useState<EventItem[]>([])
  const [eventForm, setEventForm] = useState<EventFormState>(emptyEvent)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [eventDeleteState, setEventDeleteState] = useState<{ open: boolean; eventId: number | null; title: string }>({
    open: false,
    eventId: null,
    title: '',
  })

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

  const handleUpdateBranch = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token || !branchDraft) {
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.updateAdminBranch(token, {
        address: branchDraft.address,
        phone: branchDraft.phone,
        whatsapp: branchDraft.whatsapp,
        facebook: branchDraft.facebook ?? '',
        telegram: branchDraft.telegram ?? '',
        instagram: branchDraft.instagram ?? '',
      })
      setBranch(branchDraft)
      setIsEditingBranch(false)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'فشل تحديث بيانات الفرع')
    } finally {
      setLoading(false)
    }
  }

  const startBranchEditing = () => {
    if (!branch) {
      return
    }
    setBranchDraft({ ...branch })
    setIsEditingBranch(true)
  }

  const cancelBranchEditing = () => {
    setBranchDraft(branch ? { ...branch } : null)
    setIsEditingBranch(false)
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
      setShowEventForm(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'فشل حفظ الفعالية')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadR2Image = async (file: File) => {
    if (!token) {
      return
    }

    setUploadingImage(true)
    setError('')
    try {
      const result = await api.uploadAdminR2Image(token, file)
      setEventForm((prev) => ({ ...prev, imageUrl: result.imageUrl }))
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'فشل رفع الصورة')
    } finally {
      setUploadingImage(false)
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
      setEventDeleteState({ open: false, eventId: null, title: '' })
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

  const openDeleteEventModal = (eventItem: EventItem) => {
    setEventDeleteState({ open: true, eventId: eventItem.id, title: eventItem.title })
  }

  const closeDeleteEventModal = () => {
    setEventDeleteState({ open: false, eventId: null, title: '' })
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!user) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <p className="text-sm font-medium text-slate-600">جارٍ تحميل بيانات الحساب...</p>
      </div>
    )
  }

  return (
    <div dir="rtl" className="bg-slate-50">
      <section className="border-b border-blue-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">لوحة مشرف الفرع</h1>
            <p className="text-sm text-slate-600 text-right" dir='ltr'>{user.username}</p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-primary transition hover:bg-primary hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <div className="mb-2 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-500">الفرع الحالي</p>
            <p className="text-2xl font-bold text-slate-900">{branch?.name ?? '—'}</p>
          </article>
          <article className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <div className="mb-2 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
              <CalendarDays className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-500">عدد الفعاليات</p>
            <p className="text-2xl font-bold text-slate-900">{events.length}</p>
          </article>
          <article className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <div className="mb-2 inline-flex rounded-lg bg-accent/20 p-2 text-slate-900">
              <UserCircle className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-500">الحساب الحالي</p>
            <p className="text-lg font-bold text-slate-900 text-right" dir='ltr'>{user.username}</p>
          </article>
        </section>

        {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        {branch && (
          <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">بيانات الفرع</h2>
                <p className="text-sm text-slate-500">عرض بيانات التواصل الخاصة بالفرع</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{branch.name}</span>
                {!isEditingBranch && (
                  <button
                    type="button"
                    onClick={startBranchEditing}
                    className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                  >
                    تعديل
                  </button>
                )}
              </div>
            </div>

            {isEditingBranch && branchDraft ? (
              <form onSubmit={handleUpdateBranch} className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm text-slate-600 md:col-span-2">
                  <span className="font-semibold">العنوان</span>
                  <input
                    dir="auto"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={branchDraft.address}
                    onChange={(event) => setBranchDraft((prev) => (prev ? { ...prev, address: event.target.value } : prev))}
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  <span className="font-semibold">الهاتف</span>
                  <input
                    dir="ltr"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={branchDraft.phone}
                    onChange={(event) => setBranchDraft((prev) => (prev ? { ...prev, phone: event.target.value } : prev))}
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  <span className="font-semibold">واتساب</span>
                  <input
                    dir="ltr"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={branchDraft.whatsapp}
                    onChange={(event) => setBranchDraft((prev) => (prev ? { ...prev, whatsapp: event.target.value } : prev))}
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  <span className="font-semibold">Facebook</span>
                  <input
                    dir="ltr"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={branchDraft.facebook ?? ''}
                    onChange={(event) => setBranchDraft((prev) => (prev ? { ...prev, facebook: event.target.value } : prev))}
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  <span className="font-semibold">Telegram</span>
                  <input
                    dir="ltr"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={branchDraft.telegram ?? ''}
                    onChange={(event) => setBranchDraft((prev) => (prev ? { ...prev, telegram: event.target.value } : prev))}
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  <span className="font-semibold">Instagram</span>
                  <input
                    dir="ltr"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={branchDraft.instagram ?? ''}
                    onChange={(event) => setBranchDraft((prev) => (prev ? { ...prev, instagram: event.target.value } : prev))}
                  />
                </label>
                <div className="md:col-span-2 flex flex-wrap gap-2">
                  <button
                    className="rounded-lg bg-accent px-4 py-2 font-bold text-slate-900 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading}
                  >
                    حفظ بيانات الفرع
                  </button>
                  <button
                    type="button"
                    onClick={cancelBranchEditing}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-600">العنوان</p>
                  <p className="mt-1 text-sm text-slate-900">{branch.address}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-600">الهاتف</p>
                  <p className="mt-1 text-sm text-slate-900">{branch.phone}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-600">واتساب</p>
                  <p className="mt-1 text-sm text-slate-900">{branch.whatsapp}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-600">Facebook</p>
                  <p className="mt-1 text-sm text-slate-900">{branch.facebook ?? '—'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-600">Telegram</p>
                  <p className="mt-1 text-sm text-slate-900">{branch.telegram ?? '—'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-600">Instagram</p>
                  <p className="mt-1 text-sm text-slate-900">{branch.instagram ?? '—'}</p>
                </div>
              </div>
            )}
          </section>
        )}

        <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">فعاليات الفرع</h2>
              <p className="text-sm text-slate-500">إدارة قائمة الفعاليات الحالية</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-slate-600">عدد الفعاليات: {events.length}</span>
              <button
                type="button"
                onClick={() => setShowEventForm((prev) => !prev)}
                className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                {showEventForm ? 'إخفاء الإضافة' : 'إضافة جديدة'}
              </button>
            </div>
          </div>

          {(showEventForm || editingId) && (
            <form onSubmit={handleSaveEvent} className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold">{editingId ? 'تعديل فعالية' : 'إضافة فعالية جديدة'}</h3>
                  <p className="text-sm text-slate-500">أدخل تفاصيل الفعالية وبياناتها الأساسية</p>
                </div>
                {editingId && <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">وضع التعديل</span>}
              </div>
              <div className="space-y-3">
                <label className="space-y-1 text-sm text-slate-600">
                  <span className="font-semibold">اسم الفعالية</span>
                  <input
                    dir="auto"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={eventForm.title}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))}
                  />
                </label>
                <div className="space-y-2 rounded-lg border border-slate-200 bg-white/60 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Image className="h-4 w-4" />
                    ارفع صورة من جهازك
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void handleUploadR2Image(file)
                      }
                      event.currentTarget.value = ''
                    }}
                    className="w-full text-sm"
                    disabled={loading || uploadingImage}
                  />
                  <p className="text-xs text-slate-500">الأنواع المسموحة: JPG, PNG, WEBP — الحد الأعلى 5MB</p>
                  {uploadingImage && <p className="text-sm text-primary">جار رفع الصورة...</p>}
                </div>
                {eventForm.imageUrl && (
                  <img
                    src={eventForm.imageUrl}
                    alt="معاينة صورة الفعالية"
                    className="h-40 w-full rounded-lg object-cover"
                  />
                )}
                <label className="space-y-1 text-sm text-slate-600">
                  <span className="font-semibold">نص الإعلان</span>
                  <textarea
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    rows={4}
                    value={eventForm.announcement}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, announcement: event.target.value }))}
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  <span className="font-semibold">تاريخ الفعالية</span>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={eventForm.eventDate}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, eventDate: event.target.value }))}
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  <span className="font-semibold">المكان</span>
                  <input
                    dir="auto"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={eventForm.location}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, location: event.target.value }))}
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="rounded-lg bg-primary px-4 py-2 font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading}
                >
                  {editingId ? 'حفظ التعديلات' : 'إضافة الفعالية'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null)
                      setEventForm(emptyEvent)
                      setShowEventForm(false)
                    }}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          )}

          {events.length === 0 ? (
            <div className="rounded-xl border border-blue-100 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-600">لا توجد فعاليات بعد.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((eventItem) => (
                <article key={eventItem.id} className="relative rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <a
                    href={`/events/${eventItem.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute left-3 top-3 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1 text-slate-600 transition hover:border-primary hover:text-primary"
                    aria-label="فتح صفحة الفعالية"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <div className="flex gap-3">
                    {eventItem.image_url && (
                      <img
                        src={eventItem.image_url}
                        alt={eventItem.title}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{eventItem.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {eventItem.event_date}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {eventItem.location}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{eventItem.announcement}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
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
                        setShowEventForm(true)
                      }}
                      className="rounded-lg border border-primary px-3 py-1 text-primary transition hover:bg-primary hover:text-white"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => openDeleteEventModal(eventItem)}
                      className="rounded-lg border border-red-300 px-3 py-1 text-red-600 transition hover:bg-red-50"
                    >
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {eventDeleteState.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-5 shadow-xl">
              <h3 className="mb-2 text-lg font-bold text-slate-900">تأكيد حذف الفعالية</h3>
              <p className="mb-5 text-sm text-slate-600">هل أنت متأكد من حذف الفعالية: {eventDeleteState.title}؟</p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDeleteEventModal}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (eventDeleteState.eventId) {
                      void handleDeleteEvent(eventDeleteState.eventId)
                    }
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading}
                >
                  حذف الفعالية
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  )
}
