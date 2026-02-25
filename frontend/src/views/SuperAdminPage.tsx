import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Check, LogOut, Pencil, ShieldCheck, Trash2, UserCog, Users, X } from 'lucide-react'
import { api } from '../lib/api'
import type { AdminUser, AuthUser, Branch } from '../lib/types'

const TOKEN_KEY = 'ya_superadmin_token'

type BranchConfirmAction = 'save' | 'discard' | 'switch'
type AdminConfirmAction = 'save' | 'discard' | 'switch' | 'delete'

export const SuperAdminPage = () => {
  const [token, setToken] = useState<string>(localStorage.getItem(TOKEN_KEY) ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [user, setUser] = useState<AuthUser | null>(null)

  const [branches, setBranches] = useState<Branch[]>([])
  const [admins, setAdmins] = useState<AdminUser[]>([])

  const [branchForm, setBranchForm] = useState({
    name: '',
    governorate: '',
    address: '',
    phone: '',
    whatsapp: '',
    facebook: '',
    telegram: '',
    instagram: '',
  })

  const [adminForm, setAdminForm] = useState({
    username: '',
    displayName: '',
    password: '',
    branchId: '',
  })
  const [showAddBranchForm, setShowAddBranchForm] = useState(false)
  const [showAddAdminForm, setShowAddAdminForm] = useState(false)
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null)
  const [editingBranchForm, setEditingBranchForm] = useState<{
    name: string
    governorate: string
    address: string
    phone: string
    whatsapp: string
  } | null>(null)
  const [editingBranchInitialForm, setEditingBranchInitialForm] = useState<{
    name: string
    governorate: string
    address: string
    phone: string
    whatsapp: string
  } | null>(null)
  const [branchConfirmState, setBranchConfirmState] = useState<{
    open: boolean
    action: BranchConfirmAction | null
    title: string
    message: string
    confirmText: string
    targetBranch: Branch | null
  }>({
    open: false,
    action: null,
    title: '',
    message: '',
    confirmText: '',
    targetBranch: null,
  })
  const [branchDeleteState, setBranchDeleteState] = useState<{
    open: boolean
    branchId: number | null
    branchName: string
    adminsCount: number
    eventsCount: number
    loadingRelations: boolean
  }>({
    open: false,
    branchId: null,
    branchName: '',
    adminsCount: 0,
    eventsCount: 0,
    loadingRelations: false,
  })
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null)
  const [editingAdminForm, setEditingAdminForm] = useState<{ branchId: string } | null>(null)
  const [editingAdminInitialForm, setEditingAdminInitialForm] = useState<{ branchId: string } | null>(null)
  const [adminConfirmState, setAdminConfirmState] = useState<{
    open: boolean
    action: AdminConfirmAction | null
    title: string
    message: string
    confirmText: string
    targetAdmin: AdminUser | null
  }>({
    open: false,
    action: null,
    title: '',
    message: '',
    confirmText: '',
    targetAdmin: null,
  })

  const refreshData = async (activeToken: string) => {
    const [me, branchesResult, adminsResult] = await Promise.all([
      api.getAdminMe(activeToken),
      api.getSuperBranches(activeToken),
      api.getSuperAdmins(activeToken),
    ])

    if (me.user.role !== 'superadmin') {
      throw new Error('هذه الصفحة مخصصة للمدير العام فقط')
    }

    setUser(me.user)
    setBranches(branchesResult.items)
    setAdmins(adminsResult.items)
  }

  useEffect(() => {
    if (!token) {
      return
    }
    setLoading(true)
    void refreshData(token)
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل البيانات')
        setToken('')
        localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await api.login(loginForm.username, loginForm.password)
      if (result.user.role !== 'superadmin') {
        setError('صلاحية غير كافية')
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

  const handleCreateBranch = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.createSuperBranch(token, branchForm)
      setBranchForm({
        name: '',
        governorate: '',
        address: '',
        phone: '',
        whatsapp: '',
        facebook: '',
        telegram: '',
        instagram: '',
      })
      setShowAddBranchForm(false)
      const result = await api.getSuperBranches(token)
      setBranches(result.items)
    } catch (branchError) {
      setError(branchError instanceof Error ? branchError.message : 'فشل إضافة الفرع')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBranch = async (branch: Branch) => {
    if (!token) {
      return false
    }

    setLoading(true)
    setError('')
    try {
      await api.updateSuperBranch(token, branch.id, {
        name: branch.name,
        governorate: branch.governorate,
        address: branch.address,
        phone: branch.phone,
        whatsapp: branch.whatsapp,
        facebook: branch.facebook ?? '',
        telegram: branch.telegram ?? '',
        instagram: branch.instagram ?? '',
      })
      setBranches((prev) => prev.map((item) => (item.id === branch.id ? branch : item)))
      return true
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'فشل تحديث الفرع')
      return false
    } finally {
      setLoading(false)
    }
  }

  const isBranchEditDirty = () => {
    if (!editingBranchForm || !editingBranchInitialForm) {
      return false
    }

    return (
      editingBranchForm.name !== editingBranchInitialForm.name ||
      editingBranchForm.governorate !== editingBranchInitialForm.governorate ||
      editingBranchForm.address !== editingBranchInitialForm.address ||
      editingBranchForm.phone !== editingBranchInitialForm.phone ||
      editingBranchForm.whatsapp !== editingBranchInitialForm.whatsapp
    )
  }

  const clearBranchEditing = () => {
    setEditingBranchId(null)
    setEditingBranchForm(null)
    setEditingBranchInitialForm(null)
  }

  const applyStartBranchEditing = (branch: Branch) => {
    setEditingBranchId(branch.id)
    setEditingBranchForm({
      name: branch.name,
      governorate: branch.governorate,
      address: branch.address,
      phone: branch.phone,
      whatsapp: branch.whatsapp,
    })
    setEditingBranchInitialForm({
      name: branch.name,
      governorate: branch.governorate,
      address: branch.address,
      phone: branch.phone,
      whatsapp: branch.whatsapp,
    })
  }

  const openBranchConfirm = (
    action: BranchConfirmAction,
    title: string,
    message: string,
    confirmText: string,
    targetBranch: Branch | null = null,
  ) => {
    setBranchConfirmState({
      open: true,
      action,
      title,
      message,
      confirmText,
      targetBranch,
    })
  }

  const closeBranchConfirm = () => {
    setBranchConfirmState({
      open: false,
      action: null,
      title: '',
      message: '',
      confirmText: '',
      targetBranch: null,
    })
  }

  const startBranchEditing = (branch: Branch) => {
    if (editingBranchId && editingBranchId !== branch.id && isBranchEditDirty()) {
      openBranchConfirm(
        'switch',
        'تأكيد تجاهل التعديلات',
        'يوجد تعديل غير محفوظ. هل تريد تجاهل التعديلات وفتح فرع آخر؟',
        'تجاهل وفتح الفرع',
        branch,
      )
      return
    }

    applyStartBranchEditing(branch)
  }

  const discardBranchEditing = () => {
    if (isBranchEditDirty()) {
      openBranchConfirm('discard', 'تأكيد الإلغاء', 'هل تريد تجاهل التعديلات؟', 'تجاهل التعديلات')
      return
    }

    clearBranchEditing()
  }

  const saveBranchEditing = async (branch: Branch) => {
    if (!editingBranchForm) {
      return
    }

    openBranchConfirm('save', 'تأكيد الحفظ', 'هل أنت متأكد من حفظ التعديلات على هذا الفرع؟', 'حفظ التعديلات', branch)
  }

  const handleBranchConfirm = async () => {
    if (!branchConfirmState.action) {
      return
    }

    if (branchConfirmState.action === 'discard') {
      clearBranchEditing()
      closeBranchConfirm()
      return
    }

    if (branchConfirmState.action === 'switch') {
      if (branchConfirmState.targetBranch) {
        applyStartBranchEditing(branchConfirmState.targetBranch)
      }
      closeBranchConfirm()
      return
    }

    if (branchConfirmState.action === 'save') {
      if (!editingBranchForm || !branchConfirmState.targetBranch) {
        closeBranchConfirm()
        return
      }

      const updatedBranch: Branch = {
        ...branchConfirmState.targetBranch,
        name: editingBranchForm.name,
        governorate: editingBranchForm.governorate,
        address: editingBranchForm.address,
        phone: editingBranchForm.phone,
        whatsapp: editingBranchForm.whatsapp,
      }

      const success = await handleUpdateBranch(updatedBranch)
      if (success) {
        clearBranchEditing()
      }
      closeBranchConfirm()
    }
  }

  const branchAdminsCount = admins.filter((admin) => admin.role === 'admin').length

  const handleCreateAdmin = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.createSuperAdmin(token, {
        username: adminForm.username,
        displayName: adminForm.displayName,
        password: adminForm.password,
        branchId: Number(adminForm.branchId),
      })
      setAdminForm({ username: '', displayName: '', password: '', branchId: '' })
      setShowAddAdminForm(false)
      const result = await api.getSuperAdmins(token)
      setAdmins(result.items)
    } catch (adminError) {
      setError(adminError instanceof Error ? adminError.message : 'فشل إضافة المشرف')
    } finally {
      setLoading(false)
    }
  }

  const openBranchDeleteModal = async (branch: Branch) => {
    if (!token) {
      return
    }

    setBranchDeleteState({
      open: true,
      branchId: branch.id,
      branchName: branch.name,
      adminsCount: Number(branch.admins_count ?? 0),
      eventsCount: Number(branch.events_count ?? 0),
      loadingRelations: true,
    })

    try {
      const result = await api.getSuperBranchRelations(token, branch.id)
      setBranchDeleteState((prev) => ({
        ...prev,
        adminsCount: result.item.adminsCount,
        eventsCount: result.item.eventsCount,
        loadingRelations: false,
      }))
    } catch (relationsError) {
      setError(relationsError instanceof Error ? relationsError.message : 'تعذر تحميل العلاقات المرتبطة بالفرع')
      setBranchDeleteState((prev) => ({ ...prev, loadingRelations: false }))
    }
  }

  const closeBranchDeleteModal = () => {
    setBranchDeleteState({
      open: false,
      branchId: null,
      branchName: '',
      adminsCount: 0,
      eventsCount: 0,
      loadingRelations: false,
    })
  }

  const confirmDeleteBranch = async () => {
    if (!token || !branchDeleteState.branchId || branchDeleteState.loadingRelations) {
      return
    }

    if (branchDeleteState.adminsCount > 0 || branchDeleteState.eventsCount > 0) {
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.deleteSuperBranch(token, branchDeleteState.branchId)
      if (editingBranchId === branchDeleteState.branchId) {
        clearBranchEditing()
      }
      const result = await api.getSuperBranches(token)
      setBranches(result.items)
      closeBranchDeleteModal()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'فشل حذف الفرع')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeAdminBranch = async (adminId: number, branchId: number) => {
    if (!token) {
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.setAdminBranch(token, adminId, branchId)
      const result = await api.getSuperAdmins(token)
      setAdmins(result.items)
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : 'فشل تحديث محافظة المشرف')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAdmin = async (adminId: number) => {
    if (!token) {
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.deleteAdmin(token, adminId)
      const result = await api.getSuperAdmins(token)
      setAdmins(result.items)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'فشل حذف المشرف')
    } finally {
      setLoading(false)
    }
  }

  const isAdminEditDirty = () => {
    if (!editingAdminForm || !editingAdminInitialForm) {
      return false
    }

    return editingAdminForm.branchId !== editingAdminInitialForm.branchId
  }

  const clearAdminEditing = () => {
    setEditingAdminId(null)
    setEditingAdminForm(null)
    setEditingAdminInitialForm(null)
  }

  const applyStartAdminEditing = (admin: AdminUser) => {
    const branchIdValue = String(admin.branch_id ?? '')
    setEditingAdminId(admin.id)
    setEditingAdminForm({ branchId: branchIdValue })
    setEditingAdminInitialForm({ branchId: branchIdValue })
  }

  const openAdminConfirm = (
    action: AdminConfirmAction,
    title: string,
    message: string,
    confirmText: string,
    targetAdmin: AdminUser | null = null,
  ) => {
    setAdminConfirmState({
      open: true,
      action,
      title,
      message,
      confirmText,
      targetAdmin,
    })
  }

  const closeAdminConfirm = () => {
    setAdminConfirmState({
      open: false,
      action: null,
      title: '',
      message: '',
      confirmText: '',
      targetAdmin: null,
    })
  }

  const startAdminEditing = (admin: AdminUser) => {
    if (editingAdminId && editingAdminId !== admin.id && isAdminEditDirty()) {
      openAdminConfirm(
        'switch',
        'تأكيد تجاهل التعديلات',
        'يوجد تعديل غير محفوظ. هل تريد تجاهل التعديلات وفتح مشرف آخر؟',
        'تجاهل وفتح المشرف',
        admin,
      )
      return
    }

    applyStartAdminEditing(admin)
  }

  const discardAdminEditing = () => {
    if (isAdminEditDirty()) {
      openAdminConfirm('discard', 'تأكيد الإلغاء', 'هل تريد تجاهل التعديلات؟', 'تجاهل التعديلات')
      return
    }

    clearAdminEditing()
  }

  const saveAdminEditing = async (admin: AdminUser) => {
    if (!editingAdminForm) {
      return
    }

    openAdminConfirm('save', 'تأكيد الحفظ', 'هل أنت متأكد من حفظ التعديلات على هذا المشرف؟', 'حفظ التعديلات', admin)
  }

  const handleAdminConfirm = async () => {
    if (!adminConfirmState.action) {
      return
    }

    if (adminConfirmState.action === 'discard') {
      clearAdminEditing()
      closeAdminConfirm()
      return
    }

    if (adminConfirmState.action === 'switch') {
      if (adminConfirmState.targetAdmin) {
        applyStartAdminEditing(adminConfirmState.targetAdmin)
      }
      closeAdminConfirm()
      return
    }

    if (adminConfirmState.action === 'save') {
      if (!editingAdminForm || !adminConfirmState.targetAdmin) {
        closeAdminConfirm()
        return
      }

      if (!editingAdminForm.branchId) {
        setError('يرجى اختيار محافظة للمشرف')
        closeAdminConfirm()
        return
      }

      await handleChangeAdminBranch(adminConfirmState.targetAdmin.id, Number(editingAdminForm.branchId))
      clearAdminEditing()
      closeAdminConfirm()
      return
    }

    if (adminConfirmState.action === 'delete') {
      if (!adminConfirmState.targetAdmin) {
        closeAdminConfirm()
        return
      }

      await handleDeleteAdmin(adminConfirmState.targetAdmin.id)
      if (editingAdminId === adminConfirmState.targetAdmin.id) {
        clearAdminEditing()
      }
      closeAdminConfirm()
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setUser(null)
  }

  if (!token || !user) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-lg">
          <Link to="/" className="mb-6 inline-flex items-center text-sm font-medium text-primary transition hover:opacity-90">
            العودة إلى الصفحة الرئيسية
          </Link>

          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">دخول المدير العام</h1>
                <p className="text-sm text-slate-600">الوصول إلى إدارة الأفرع والمشرفين</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="اسم المستخدم"
                value={loginForm.username}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
              />
              <input
                type="password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="كلمة المرور"
                value={loginForm.password}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
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
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      <header className="border-b border-blue-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">لوحة المدير العام</h1>
            <p className="text-sm text-slate-600">مرحباً {user.displayName}</p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-primary transition hover:bg-primary hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <div className="mb-2 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-500">إجمالي الأفرع</p>
            <p className="text-2xl font-bold text-slate-900">{branches.length}</p>
          </article>
          <article className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <div className="mb-2 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-500">مشرفو المحافظات</p>
            <p className="text-2xl font-bold text-slate-900">{branchAdminsCount}</p>
          </article>
          <article className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <div className="mb-2 inline-flex rounded-lg bg-accent/20 p-2 text-slate-900">
              <UserCog className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-500">الحساب الحالي</p>
            <p className="text-lg font-bold text-slate-900">{user.displayName}</p>
          </article>
        </section>

        {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        <div className="flex flex-col gap-6 xl:flex-row">
          <section className="min-w-0 flex-1 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="mb-1 text-lg font-bold">الأفرع الحالية</h2>
                <p className="text-sm text-slate-500">عرض وتعديل الأفرع الحالية أو إضافة فرع جديد</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBranchForm((prev) => !prev)}
                className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                {showAddBranchForm ? 'إخفاء الإضافة' : 'إضافة جديد'}
              </button>
            </div>

          {showAddBranchForm && (
            <form onSubmit={handleCreateBranch} className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <input
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="اسم الفرع"
                value={branchForm.name}
                onChange={(event) => setBranchForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <input
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="المحافظة"
                value={branchForm.governorate}
                onChange={(event) => setBranchForm((prev) => ({ ...prev, governorate: event.target.value }))}
              />
              <input
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="العنوان"
                value={branchForm.address}
                onChange={(event) => setBranchForm((prev) => ({ ...prev, address: event.target.value }))}
              />
              <input
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="الهاتف"
                value={branchForm.phone}
                onChange={(event) => setBranchForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
              <input
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="واتساب"
                value={branchForm.whatsapp}
                onChange={(event) => setBranchForm((prev) => ({ ...prev, whatsapp: event.target.value }))}
              />
              <button
                className="rounded-lg bg-primary px-4 py-2 font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                إضافة الفرع
              </button>
            </form>
          )}

            <div className="max-h-[620px] space-y-3 overflow-auto pr-1">
            {branches.map((branch) => (
              <div key={branch.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                {editingBranchId === branch.id ? (
                  <div className="mb-2 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => void saveBranchEditing(branch)}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      <Check className="h-4 w-4" />
                      حفظ
                    </button>
                    <button
                      type="button"
                      onClick={discardBranchEditing}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      <X className="h-4 w-4" />
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <div className="mb-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startBranchEditing(branch)}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary bg-white px-3 py-1 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => void openBranchDeleteModal(branch)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-1 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </button>
                  </div>
                )}

                <input
                  className="mb-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  value={editingBranchId === branch.id ? editingBranchForm?.name ?? '' : branch.name}
                  disabled={editingBranchId !== branch.id}
                  onChange={(event) => setEditingBranchForm((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                />
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    value={editingBranchId === branch.id ? editingBranchForm?.governorate ?? '' : branch.governorate}
                    disabled={editingBranchId !== branch.id}
                    onChange={(event) =>
                      setEditingBranchForm((prev) => (prev ? { ...prev, governorate: event.target.value } : prev))
                    }
                  />
                  <input
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    value={editingBranchId === branch.id ? editingBranchForm?.address ?? '' : branch.address}
                    disabled={editingBranchId !== branch.id}
                    onChange={(event) =>
                      setEditingBranchForm((prev) => (prev ? { ...prev, address: event.target.value } : prev))
                    }
                  />
                  <input
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    value={editingBranchId === branch.id ? editingBranchForm?.phone ?? '' : branch.phone}
                    disabled={editingBranchId !== branch.id}
                    onChange={(event) => setEditingBranchForm((prev) => (prev ? { ...prev, phone: event.target.value } : prev))}
                  />
                  <input
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    value={editingBranchId === branch.id ? editingBranchForm?.whatsapp ?? '' : branch.whatsapp}
                    disabled={editingBranchId !== branch.id}
                    onChange={(event) =>
                      setEditingBranchForm((prev) => (prev ? { ...prev, whatsapp: event.target.value } : prev))
                    }
                  />
                </div>
              </div>
            ))}
            {branches.length === 0 && (
              <p className="rounded-lg bg-slate-50 px-3 py-5 text-center text-sm text-slate-600">لا توجد أفرع حالياً</p>
            )}
            </div>
          </section>

          <section className="min-w-0 flex-1 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="mb-1 text-lg font-bold">المشرفين</h2>
                <p className="text-sm text-slate-500">عرض المشرفين وتغيير المحافظة أو إضافة مشرف جديد</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAdminForm((prev) => !prev)}
                className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                {showAddAdminForm ? 'إخفاء الإضافة' : 'إضافة جديد'}
              </button>
            </div>

          {showAddAdminForm && (
            <form onSubmit={handleCreateAdmin} className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <input
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="اسم المستخدم"
                value={adminForm.username}
                onChange={(event) => setAdminForm((prev) => ({ ...prev, username: event.target.value }))}
              />
              <input
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="الاسم الكامل"
                value={adminForm.displayName}
                onChange={(event) => setAdminForm((prev) => ({ ...prev, displayName: event.target.value }))}
              />
              <input
                type="password"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="كلمة المرور"
                value={adminForm.password}
                onChange={(event) => setAdminForm((prev) => ({ ...prev, password: event.target.value }))}
              />
              <select
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={adminForm.branchId}
                onChange={(event) => setAdminForm((prev) => ({ ...prev, branchId: event.target.value }))}
              >
                <option value="">اختر المحافظة</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.governorate}
                  </option>
                ))}
              </select>
              <button
                className="rounded-lg bg-primary px-4 py-2 font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                إضافة المشرف
              </button>
            </form>
          )}

            <div className="max-h-[560px] space-y-3 overflow-auto pr-1">
            {admins
              .filter((admin) => admin.role === 'admin')
              .map((admin) => (
                <article key={admin.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {editingAdminId === admin.id ? (
                    <div className="mb-2 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void saveAdminEditing(admin)}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        <Check className="h-4 w-4" />
                        حفظ
                      </button>
                      <button
                        type="button"
                        onClick={discardAdminEditing}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        <X className="h-4 w-4" />
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <div className="mb-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => startAdminEditing(admin)}
                        className="inline-flex items-center gap-1 rounded-lg border border-primary bg-white px-3 py-1 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                        تعديل
                      </button>
                    </div>
                  )}

                  <p className="font-semibold text-slate-900">
                    {admin.display_name} <span className="font-normal text-slate-500">({admin.username})</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <select
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      value={editingAdminId === admin.id ? editingAdminForm?.branchId ?? '' : String(admin.branch_id ?? '')}
                      disabled={editingAdminId !== admin.id}
                      onChange={(event) =>
                        setEditingAdminForm((prev) => (prev ? { ...prev, branchId: event.target.value } : prev))
                      }
                    >
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.governorate}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        openAdminConfirm(
                          'delete',
                          'تأكيد حذف المشرف',
                          `هل أنت متأكد من حذف المشرف ${admin.display_name}؟`,
                          'حذف المشرف',
                          admin,
                        )
                      }
                      className="rounded-lg border border-red-300 bg-white px-3 py-1 text-red-600 transition hover:bg-red-50"
                    >
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            {branchAdminsCount === 0 && (
              <p className="rounded-lg bg-slate-50 px-3 py-5 text-center text-sm text-slate-600">لا يوجد مشرفون حتى الآن</p>
            )}
            </div>
          </section>
        </div>

        {branchConfirmState.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-5 shadow-xl">
              <h3 className="mb-2 text-lg font-bold text-slate-900">{branchConfirmState.title}</h3>
              <p className="mb-5 text-sm text-slate-600">{branchConfirmState.message}</p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeBranchConfirm}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => void handleBranchConfirm()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading}
                >
                  {branchConfirmState.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}

        {branchDeleteState.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-2xl rounded-2xl border border-blue-100 bg-white p-6 shadow-xl">
              <h3 className="mb-2 text-xl font-bold text-slate-900">تأكيد حذف الفرع</h3>
              <p className="mb-4 text-sm text-slate-600">
                الفرع: <span className="font-semibold text-slate-900">{branchDeleteState.branchName}</span>
              </p>

              {branchDeleteState.loadingRelations ? (
                <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">جار تحميل العلاقات المرتبطة...</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">عدد الفعاليات المرتبطة</p>
                      <p className="text-2xl font-bold text-slate-900">{branchDeleteState.eventsCount}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">عدد المشرفين المرتبطين</p>
                      <p className="text-2xl font-bold text-slate-900">{branchDeleteState.adminsCount}</p>
                    </div>
                  </div>

                  {branchDeleteState.adminsCount > 0 || branchDeleteState.eventsCount > 0 ? (
                    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                      لا يمكن حذف الفرع حالياً. يجب حذف أو نقل جميع الفعاليات والمشرفين المرتبطين بهذا الفرع أولاً.
                    </p>
                  ) : (
                    <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      لا توجد أي سجلات مرتبطة بهذا الفرع. يمكنك المتابعة بالحذف.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeBranchDeleteModal}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  إغلاق
                </button>
                {branchDeleteState.adminsCount === 0 && branchDeleteState.eventsCount === 0 && !branchDeleteState.loadingRelations && (
                  <button
                    type="button"
                    onClick={() => void confirmDeleteBranch()}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading}
                  >
                    حذف الفرع
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {adminConfirmState.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-5 shadow-xl">
              <h3 className="mb-2 text-lg font-bold text-slate-900">{adminConfirmState.title}</h3>
              <p className="mb-5 text-sm text-slate-600">{adminConfirmState.message}</p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAdminConfirm}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => void handleAdminConfirm()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading}
                >
                  {adminConfirmState.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
  )
}
