import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { AdminUser, AuthUser, Branch } from '../lib/types'

const TOKEN_KEY = 'ya_superadmin_token'

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
      return
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
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'فشل تحديث الفرع')
    } finally {
      setLoading(false)
    }
  }

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
      const result = await api.getSuperAdmins(token)
      setAdmins(result.items)
    } catch (adminError) {
      setError(adminError instanceof Error ? adminError.message : 'فشل إضافة المشرف')
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

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setUser(null)
  }

  if (!token || !user) {
    return (
      <div dir="rtl" className="mx-auto max-w-lg px-4 py-12">
        <Link to="/" className="mb-6 inline-block text-sm text-primary">
          العودة إلى الصفحة الرئيسية
        </Link>
        <h1 className="mb-4 text-2xl font-bold text-primary">دخول المدير العام</h1>
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
          <h1 className="text-2xl font-bold text-primary">لوحة المدير العام</h1>
          <p className="text-sm text-slate-600">مرحباً {user.displayName}</p>
        </div>
        <button onClick={logout} className="rounded-lg border border-primary px-4 py-2 text-primary">
          تسجيل الخروج
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleCreateBranch} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">إضافة فرع جديد</h2>
          <div className="grid gap-3">
            <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="اسم الفرع" value={branchForm.name} onChange={(event) => setBranchForm((prev) => ({ ...prev, name: event.target.value }))} />
            <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="المحافظة" value={branchForm.governorate} onChange={(event) => setBranchForm((prev) => ({ ...prev, governorate: event.target.value }))} />
            <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="العنوان" value={branchForm.address} onChange={(event) => setBranchForm((prev) => ({ ...prev, address: event.target.value }))} />
            <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="الهاتف" value={branchForm.phone} onChange={(event) => setBranchForm((prev) => ({ ...prev, phone: event.target.value }))} />
            <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="واتساب" value={branchForm.whatsapp} onChange={(event) => setBranchForm((prev) => ({ ...prev, whatsapp: event.target.value }))} />
            <button className="rounded-lg bg-primary px-4 py-2 font-bold text-white" disabled={loading}>إضافة الفرع</button>
          </div>
        </form>

        <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">إدارة الأفرع الحالية</h2>
          <div className="space-y-3">
            {branches.map((branch, index) => (
              <div key={branch.id} className="rounded-xl border border-slate-200 p-3">
                <input
                  className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={branch.name}
                  onChange={(event) =>
                    setBranches((prev) => prev.map((item, currentIndex) => (currentIndex === index ? { ...item, name: event.target.value } : item)))
                  }
                />
                <div className="grid gap-2 md:grid-cols-2">
                  <input className="rounded-lg border border-slate-300 px-3 py-2" value={branch.governorate} onChange={(event) => setBranches((prev) => prev.map((item, currentIndex) => (currentIndex === index ? { ...item, governorate: event.target.value } : item)))} />
                  <input className="rounded-lg border border-slate-300 px-3 py-2" value={branch.address} onChange={(event) => setBranches((prev) => prev.map((item, currentIndex) => (currentIndex === index ? { ...item, address: event.target.value } : item)))} />
                  <input className="rounded-lg border border-slate-300 px-3 py-2" value={branch.phone} onChange={(event) => setBranches((prev) => prev.map((item, currentIndex) => (currentIndex === index ? { ...item, phone: event.target.value } : item)))} />
                  <input className="rounded-lg border border-slate-300 px-3 py-2" value={branch.whatsapp} onChange={(event) => setBranches((prev) => prev.map((item, currentIndex) => (currentIndex === index ? { ...item, whatsapp: event.target.value } : item)))} />
                </div>
                <button onClick={() => void handleUpdateBranch(branch)} className="mt-2 rounded-lg border border-primary px-3 py-1 text-primary">حفظ الفرع</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleCreateAdmin} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">إضافة مشرف محافظة</h2>
          <div className="grid gap-3">
            <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="اسم المستخدم" value={adminForm.username} onChange={(event) => setAdminForm((prev) => ({ ...prev, username: event.target.value }))} />
            <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="الاسم الكامل" value={adminForm.displayName} onChange={(event) => setAdminForm((prev) => ({ ...prev, displayName: event.target.value }))} />
            <input type="password" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="كلمة المرور" value={adminForm.password} onChange={(event) => setAdminForm((prev) => ({ ...prev, password: event.target.value }))} />
            <select className="rounded-lg border border-slate-300 px-3 py-2" value={adminForm.branchId} onChange={(event) => setAdminForm((prev) => ({ ...prev, branchId: event.target.value }))}>
              <option value="">اختر المحافظة</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.governorate}</option>
              ))}
            </select>
            <button className="rounded-lg bg-primary px-4 py-2 font-bold text-white" disabled={loading}>إضافة المشرف</button>
          </div>
        </form>

        <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">إدارة المشرفين</h2>
          <div className="space-y-3">
            {admins.filter((admin) => admin.role === 'admin').map((admin) => (
              <article key={admin.id} className="rounded-xl border border-slate-200 p-3">
                <p className="font-semibold">{admin.display_name} ({admin.username})</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select
                    className="rounded-lg border border-slate-300 px-3 py-1"
                    value={admin.branch_id ?? ''}
                    onChange={(event) => void handleChangeAdminBranch(admin.id, Number(event.target.value))}
                  >
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.governorate}</option>
                    ))}
                  </select>
                  <button onClick={() => void handleDeleteAdmin(admin.id)} className="rounded-lg border border-red-300 px-3 py-1 text-red-600">
                    حذف
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
