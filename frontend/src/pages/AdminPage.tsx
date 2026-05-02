import { useState, useEffect } from 'react'
import type { Restaurant, PartnerApplicationPayload } from '../types'

// TODO: Add authentication before production launch
// Currently unprotected — admin route must be secured before going live

const VERIFICATION_OPTIONS = ['pending', 'verified', 'inferred', 'unverified', 'needs_verification']
const PARTNER_OPTIONS = ['new', 'contacted', 'interested', 'follow_up', 'trial', 'active', 'premium', 'paused', 'onboarded', 'rejected']
const APPLICATION_STATUSES = ['pending', 'active', 'rejected']

const VERIFICATION_LABELS: Record<string, string> = {
  pending: 'pending (очікує)',
  verified: 'verified (перевірено)',
  inferred: 'inferred (передбачено)',
  unverified: 'unverified (не перевірено)',
  needs_verification: 'needs_verification (потребує перевірки)'
}

const PARTNER_LABELS: Record<string, string> = {
  new: 'new (новий)',
  contacted: 'contacted (зв\'язалися)',
  interested: 'interested (зацікавлений)',
  follow_up: 'follow_up (на контролі)',
  trial: 'trial (тестовий)',
  active: 'active (активний)',
  premium: 'premium (преміум)',
  paused: 'paused (на паузі)',
  onboarded: 'onboarded (підключений)',
  rejected: 'rejected (відхилено)'
}

const CUISINE_LABELS: Record<string, string> = {
  Italian: 'Italian (Італійська)',
  Asian: 'Asian (Азійська)',
  Burger: 'Burger (Бургери)',
  Kebab: 'Kebab (Кебаб)',
  Local: 'Local (Місцева)',
  Healthy: 'Healthy (Здорова)',
  Indian: 'Indian (Індійська)',
  Other: 'Other (Інше)'
}

const getVerStatusColor = (val: string) => {
  if (val === 'verified') return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10'
  if (val === 'needs_verification') return 'text-red-400 border-red-500/50 bg-red-500/10'
  if (val === 'pending') return 'text-amber-400 border-amber-500/50 bg-amber-500/10'
  return 'text-white border-zinc-700 bg-zinc-800'
}

const getPartnerStatusColor = (val: string) => {
  if (val === 'active' || val === 'premium' || val === 'onboarded') return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10'
  if (val === 'rejected' || val === 'paused') return 'text-red-400 border-red-500/50 bg-red-500/10'
  if (val === 'trial') return 'text-brand-400 border-brand-500/50 bg-brand-500/10'
  if (val === 'new' || val === 'contacted' || val === 'interested' || val === 'follow_up') return 'text-amber-400 border-amber-500/50 bg-amber-500/10'
  return 'text-white border-zinc-700 bg-zinc-800'
}

interface EditState {
  name: string
  city: string
  address: string
  phone: string
  cuisine_primary: string
  verification_status: string
  partner_status: string
  notes: string
}

interface AppEditState {
  status: string
  admin_notes: string
}

interface SaveStatus {
  [id: number]: 'idle' | 'saving' | 'saved' | 'error'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BASE_URL = ((import.meta as any).env?.VITE_API_URL ?? '') + '/api'

// Combine Payload with DB fields
type PartnerApplication = PartnerApplicationPayload & {
  id: number
  status: string
  admin_notes: string | null
  created_at: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'restaurants' | 'applications' | 'analytics'>('restaurants')

  // Restaurants state
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<number, EditState>>({})
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({})
  const [search, setSearch] = useState('')
  const [filterCuisine, setFilterCuisine] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Applications state
  const [applications, setApplications] = useState<PartnerApplication[]>([])
  const [appLoading, setAppLoading] = useState(true)
  const [appError, setAppError] = useState<string | null>(null)
  const [appEdits, setAppEdits] = useState<Record<number, AppEditState>>({})
  const [appSaveStatus, setAppSaveStatus] = useState<SaveStatus>({})
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('bonapp_admin_token') || '')

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem('bonapp_admin_token', adminToken)
    if (activeTab === 'restaurants') fetchRestaurants()
    if (activeTab === 'applications') fetchApplications()
    if (activeTab === 'analytics') fetchAnalytics()
  }, [activeTab, adminToken])

  async function fetchAnalytics() {
    setAnalyticsLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/tracking/summary`)
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const data = await res.json()
      setAnalytics(data)
    } catch (err) {
      console.error(err)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  async function fetchRestaurants() {
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/restaurants?limit=500&admin=true`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data: Restaurant[] = await res.json()
      setRestaurants(data)
      const initEdits: Record<number, EditState> = {}
      data.forEach((r) => {
        initEdits[r.id] = {
          name: r.name,
          city: r.city ?? '',
          address: r.address ?? '',
          phone: r.phone ?? '',
          cuisine_primary: r.cuisine_primary ?? '',
          verification_status: r.verification_status,
          partner_status: r.partner_status,
          notes: r.notes ?? '',
        }
      })
      setEdits(initEdits)
    } catch {
      setError('Failed to load restaurants')
    } finally {
      setLoading(false)
    }
  }

  async function fetchApplications() {
    if (!adminToken) return
    setAppLoading(true)
    setAppError(null)
    try {
      const res = await fetch(`${BASE_URL}/partners`, {
        headers: { 'X-Admin-Token': adminToken }
      })
      if (!res.ok) {
        if (res.status === 401) throw new Error('Unauthorized - Invalid token')
        throw new Error('Failed to fetch')
      }
      const data: PartnerApplication[] = await res.json()
      setApplications(data)
      const initEdits: Record<number, AppEditState> = {}
      data.forEach((app) => {
        initEdits[app.id] = {
          status: app.status,
          admin_notes: app.admin_notes ?? '',
        }
      })
      setAppEdits(initEdits)
    } catch (err: any) {
      setAppError(err.message)
    } finally {
      setAppLoading(false)
    }
  }

  async function handleSaveRestaurant(id: number) {
    setSaveStatus((s) => ({ ...s, [id]: 'saving' }))
    try {
      const body = edits[id]
      const res = await fetch(`${BASE_URL}/restaurants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: body.name,
          city: body.city || null,
          address: body.address || null,
          phone: body.phone || null,
          cuisine_primary: body.cuisine_primary || null,
          verification_status: body.verification_status,
          partner_status: body.partner_status,
          notes: body.notes || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const updated: Restaurant = await res.json()
      setRestaurants((prev) => prev.map((r) => (r.id === id ? updated : r)))
      setSaveStatus((s) => ({ ...s, [id]: 'saved' }))
      setTimeout(() => setSaveStatus((s) => ({ ...s, [id]: 'idle' })), 2000)
    } catch {
      setSaveStatus((s) => ({ ...s, [id]: 'error' }))
    }
  }

  async function handlePromoteApplication(app: PartnerApplication) {
    if (!window.confirm(`Додати "${app.restaurant_name}" в публічний список ресторанів?`)) return
    try {
      // 1. Create restaurant record
      const res = await fetch(`${BASE_URL}/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: app.restaurant_name,
          city: app.city ?? null,
          address: app.address ?? null,
          phone: app.contact_phone ?? null,
          website_url: app.website_url ?? null,
          delivery_url: app.ordering_url ?? null,
          cuisine_primary: app.cuisine_type ?? 'Other',
          own_delivery: app.offers_delivery ?? false,
          pickup: app.offers_pickup ?? false,
          direct_ordering: !!(app.ordering_url),
          source_name: 'partner_application',
          verification_status: 'verified',
          partner_status: 'active',
          notes: app.notes ?? null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create restaurant')
      // 2. Mark application as active
      await fetch(`${BASE_URL}/partners/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
        body: JSON.stringify({ status: 'active', admin_notes: 'Promoted to restaurant' }),
      })
      setApplications((prev) => prev.map((a) => a.id === app.id ? { ...a, status: 'active' } : a))
      alert(`✅ "${app.restaurant_name}" додано на сайт!`)
    } catch {
      alert('Помилка при додаванні ресторану')
    }
  }

  async function handleDeleteApplication(id: number, name: string) {
    if (!window.confirm(`Видалити заявку "${name}"? Цю дію не можна скасувати.`)) return
    try {
      const res = await fetch(`${BASE_URL}/partners/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': adminToken },
      })
      if (!res.ok) throw new Error('Failed to delete')
      setApplications((prev) => prev.filter((a) => a.id !== id))
    } catch {
      alert('Помилка видалення')
    }
  }

  async function handleSaveApplication(id: number) {
    setAppSaveStatus((s) => ({ ...s, [id]: 'saving' }))
    try {
      const body = appEdits[id]
      const res = await fetch(`${BASE_URL}/partners/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({
          status: body.status,
          admin_notes: body.admin_notes || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const updated: PartnerApplication = await res.json()
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)))
      setAppSaveStatus((s) => ({ ...s, [id]: 'saved' }))
      setTimeout(() => setAppSaveStatus((s) => ({ ...s, [id]: 'idle' })), 2000)
    } catch {
      setAppSaveStatus((s) => ({ ...s, [id]: 'error' }))
    }
  }

  function updateEdit(id: number, field: keyof EditState, value: string) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  function updateAppEdit(id: number, field: keyof AppEditState, value: string) {
    setAppEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  function isDirty(r: Restaurant): boolean {
    const e = edits[r.id]
    if (!e) return false
    return (
      e.name !== r.name ||
      e.city !== (r.city ?? '') ||
      e.address !== (r.address ?? '') ||
      e.phone !== (r.phone ?? '') ||
      e.cuisine_primary !== (r.cuisine_primary ?? '') ||
      e.verification_status !== r.verification_status ||
      e.partner_status !== r.partner_status ||
      e.notes !== (r.notes ?? '')
    )
  }

  function isAppDirty(app: PartnerApplication): boolean {
    const e = appEdits[app.id]
    if (!e) return false
    return e.status !== app.status || e.admin_notes !== (app.admin_notes ?? '')
  }

  const cuisines = [...new Set(restaurants.map((r) => r.cuisine_primary).filter(Boolean))]

  const filtered = restaurants.filter((r) => {
    const matchSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.city ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCuisine = !filterCuisine || (r.cuisine_primary ?? '').includes(filterCuisine)
    const matchStatus = !filterStatus || r.verification_status === filterStatus
    return matchSearch && matchCuisine && matchStatus
  })

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
      {/* Warning banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs rounded-xl px-4 py-3 mb-6 flex items-start gap-2">
        <span className="text-base">⚠️</span>
        <span>
          <strong>TODO:</strong> Ця адмін-панель не захищена автентифікацією.
          Додайте авторизацію перед виходом у продакшн.
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Адмін панель</h1>
          <p className="text-xs text-zinc-500 mt-1">BonApp Luxembourg — Управління</p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'restaurants') fetchRestaurants()
            if (activeTab === 'applications') fetchApplications()
            if (activeTab === 'analytics') fetchAnalytics()
          }}
          className="btn-secondary text-xs px-4 py-2"
        >
          ↻ Оновити
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-zinc-800 overflow-hidden mb-6">
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'restaurants'
              ? 'bg-brand-500 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          🍽 Ресторани
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'applications'
              ? 'bg-brand-500 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          📋 Заявки
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'analytics'
              ? 'bg-brand-500 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          📊 Аналітика
        </button>
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analyticsLoading ? (
            <div className="h-32 bg-zinc-900 rounded-xl animate-pulse" />
          ) : analytics ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
                  <p className="text-3xl font-extrabold text-white">{analytics.total_clicks}</p>
                  <p className="text-sm text-zinc-500 mt-1">Всього кліків CTA</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3">За типом події</h3>
                  <div className="space-y-2">
                    {analytics.by_event_type?.map((t: any) => (
                      <div key={t.event_type} className="flex justify-between text-sm">
                        <span className="text-zinc-400">{t.event_type}</span>
                        <span className="font-bold text-white">{t.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">Останні кліки (20 шт.)</h3>
                <div className="space-y-3">
                  {analytics.recent?.map((r: any, i: number) => (
                    <div key={i} className="flex items-center justify-between border-b border-zinc-800 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-bold text-white">{r.name}</p>
                        <p className="text-xs text-zinc-500">{r.city} · {r.event_type}</p>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-zinc-500 text-sm">Не вдалося завантажити аналітику.</p>
          )}
        </div>
      )}

      {activeTab === 'restaurants' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-white">{restaurants.length}</p>
              <p className="text-xs text-zinc-500 mt-1">Всього</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-emerald-400">
                {restaurants.filter((r) => r.verification_status === 'verified').length}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Підтверджено</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-brand-400">
                {restaurants.filter((r) => r.partner_status === 'active').length}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Активних</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              placeholder="Пошук за назвою або містом..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 flex-1 min-w-[160px]"
            />
            <select
              value={filterCuisine}
              onChange={(e) => setFilterCuisine(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">Всі кухні</option>
              {['Italian', 'Asian', 'Burger', 'Kebab', 'Local', 'Healthy', 'Indian', 'Other'].map((c) => (
                <option key={c} value={c}>{CUISINE_LABELS[c] || c}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">Всі статуси</option>
              {VERIFICATION_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          {loading && (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />)}
            </div>
          )}
          {error && !loading && <p className="text-red-400 text-sm">{error}</p>}
          {!loading && !error && filtered.length === 0 && <p className="text-zinc-500 text-sm text-center py-12">Ресторанів не знайдено.</p>}

          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((r) => {
                const e = edits[r.id]
                const status = saveStatus[r.id] ?? 'idle'
                const dirty = isDirty(r)
                const isTest = r.name.toLowerCase().includes('test') || r.name.toLowerCase().includes('тест') || r.partner_status === 'trial' || r.verification_status !== 'verified'

                return (
                  <div key={r.id} className={`bg-zinc-900 border rounded-xl p-4 transition-all ${dirty ? 'border-brand-500/50' : 'border-zinc-800'}`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-white text-lg">{r.name}</span>
                          {isTest && <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">TEST</span>}
                          <span className="badge badge-orange text-[10px]">{r.cuisine_primary}</span>
                        </div>
                        <p className="text-sm text-zinc-400">
                          {r.phone || 'Немає телефону'} · <span className="text-zinc-500">ID #{r.id}</span>
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {[r.city, r.address].filter(Boolean).join(' · ')}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSaveRestaurant(r.id)}
                        disabled={!dirty || status === 'saving'}
                        className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          status === 'saved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : status === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : dirty ? 'bg-brand-500 text-white hover:bg-brand-400'
                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        {status === 'saving' ? '...' : status === 'saved' ? '✓ Збережено' : status === 'error' ? '✗ Помилка' : 'Зберегти'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-zinc-950 p-3 rounded-lg text-xs">
                      <div>
                        <span className="block text-zinc-500 mb-0.5">Сайт</span>
                        {r.website_url ? <a href={r.website_url} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline break-all">Посилання</a> : <span className="text-zinc-600">—</span>}
                      </div>
                      <div>
                        <span className="block text-zinc-500 mb-0.5">Доставка / Меню</span>
                        {r.delivery_url ? <a href={r.delivery_url} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline break-all">Посилання</a> : <span className="text-zinc-600">—</span>}
                      </div>
                      <div>
                        <span className="block text-zinc-500 mb-0.5">Комісія та мін. замовлення</span>
                        <span className="text-zinc-300">Мін: €{r.min_order_eur ?? '-'} / Комісія: €{r.delivery_fee_eur ?? '-'}</span>
                      </div>
                      <div>
                        <span className="block text-zinc-500 mb-0.5">Конфігурація доставки</span>
                        <span className="text-zinc-300">
                          {[r.own_delivery ? 'Власна' : null, r.pickup ? 'Самовивіз' : null].filter(Boolean).join(', ') || 'Немає'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Назва</label>
                        <input
                          type="text"
                          value={e?.name ?? r.name}
                          onChange={(ev) => updateEdit(r.id, 'name', ev.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Місто</label>
                        <input
                          type="text"
                          value={e?.city ?? r.city ?? ''}
                          onChange={(ev) => updateEdit(r.id, 'city', ev.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Адреса</label>
                        <input
                          type="text"
                          value={e?.address ?? r.address ?? ''}
                          onChange={(ev) => updateEdit(r.id, 'address', ev.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Телефон</label>
                        <input
                          type="text"
                          value={e?.phone ?? r.phone ?? ''}
                          onChange={(ev) => updateEdit(r.id, 'phone', ev.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Кухня (можна кілька)</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Italian', 'Asian', 'Burger', 'Kebab', 'Local', 'Healthy', 'Indian', 'Other'].map((c) => {
                          const currentVal = e?.cuisine_primary ?? r.cuisine_primary ?? ''
                          const isSelected = currentVal.includes(c)
                          return (
                            <button
                              key={c}
                              onClick={() => {
                                let arr = currentVal.split(',').map(s => s.trim()).filter(Boolean)
                                if (isSelected) arr = arr.filter(x => x !== c)
                                else arr.push(c)
                                updateEdit(r.id, 'cuisine_primary', arr.join(', '))
                              }}
                              className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${isSelected ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'}`}
                            >
                              {CUISINE_LABELS[c] || c}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Статус верифікації</label>
                        <select
                          value={e?.verification_status ?? r.verification_status}
                          onChange={(ev) => updateEdit(r.id, 'verification_status', ev.target.value)}
                          className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 ${getVerStatusColor(e?.verification_status ?? r.verification_status)}`}
                        >
                          {VERIFICATION_OPTIONS.map((o) => <option key={o} value={o}>{VERIFICATION_LABELS[o] || o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Статус партнера</label>
                        <select
                          value={e?.partner_status ?? r.partner_status}
                          onChange={(ev) => updateEdit(r.id, 'partner_status', ev.target.value)}
                          className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 ${getPartnerStatusColor(e?.partner_status ?? r.partner_status)}`}
                        >
                          {PARTNER_OPTIONS.map((o) => <option key={o} value={o}>{PARTNER_LABELS[o] || o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Примітка</label>
                        <input
                          type="text"
                          value={e?.notes ?? ''}
                          onChange={(ev) => updateEdit(r.id, 'notes', ev.target.value)}
                          placeholder="Внутрішня примітка..."
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'applications' && (
        <>
          {/* Applications View */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 flex gap-3 items-center">
            <input
              type="password"
              placeholder="Токен адміністратора"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 max-w-sm w-full"
            />
            <span className="text-xs text-zinc-500">Потрібен для перегляду та редагування заявок</span>
          </div>

          {!adminToken ? (
            <p className="text-zinc-500 text-sm text-center py-12">Введіть Токен адміністратора для перегляду заявок.</p>
          ) : appLoading ? (
            <div className="space-y-3">
              {[1,2].map((i) => <div key={i} className="h-32 bg-zinc-900 rounded-xl animate-pulse" />)}
            </div>
          ) : appError ? (
            <p className="text-red-400 text-sm text-center py-12">{appError}</p>
          ) : applications.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-12">Заявок не знайдено.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const e = appEdits[app.id]
                const status = appSaveStatus[app.id] ?? 'idle'
                const dirty = isAppDirty(app)

                return (
                  <div key={app.id} className={`bg-zinc-900 border rounded-xl p-5 transition-all ${dirty ? 'border-brand-500/50' : 'border-zinc-800'}`}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white text-lg">{app.restaurant_name}</span>
                          <span className={`badge ${app.status === 'pending' ? 'badge-orange' : app.status === 'active' ? 'badge-green' : 'badge-zinc'}`}>
                            {app.status}
                          </span>
                          {app.application_type === 'update' && <span className="badge badge-zinc">Запит на оновлення</span>}
                        </div>
                        <p className="text-sm text-zinc-400">
                          {app.contact_name} · <a href={`mailto:${app.contact_email}`} className="text-brand-400 hover:underline">{app.contact_email}</a> · {app.contact_phone}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Подано: {new Date(app.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handlePromoteApplication(app)}
                          className="shrink-0 px-3 py-2 rounded-lg text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                          title="Створити ресторан у базі даних"
                        >
                          ➕ На сайт
                        </button>
                        <button
                          onClick={() => handleSaveApplication(app.id)}
                          disabled={!dirty || status === 'saving'}
                          className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            status === 'saved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : status === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : dirty ? 'bg-brand-500 text-white hover:bg-brand-400'
                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                          }`}
                        >
                          {status === 'saving' ? '...' : status === 'saved' ? '✓ Збережено' : status === 'error' ? '✗ Помилка' : 'Зберегти'}
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(app.id, app.restaurant_name)}
                          className="shrink-0 px-3 py-2 rounded-lg text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all"
                          title="Видалити заявку"
                        >
                          🗑
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-zinc-950 p-3 rounded-lg text-xs">
                      <div>
                        <span className="block text-zinc-500 mb-0.5">Місцезнаходження</span>
                        <span className="text-zinc-300">{app.city || '—'}, {app.address || '—'}</span>
                      </div>
                      <div>
                        <span className="block text-zinc-500 mb-0.5">Кухня</span>
                        <span className="text-zinc-300">{app.cuisine_type || '—'}</span>
                      </div>
                      <div>
                        <span className="block text-zinc-500 mb-0.5">URL меню</span>
                        {app.menu_url ? <a href={app.menu_url} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline break-all">Посилання</a> : <span className="text-zinc-600">—</span>}
                      </div>
                      <div>
                        <span className="block text-zinc-500 mb-0.5">URL замовлення</span>
                        {app.ordering_url ? <a href={app.ordering_url} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline break-all">Посилання</a> : <span className="text-zinc-600">—</span>}
                      </div>
                      <div>
                        <span className="block text-zinc-500 mb-0.5">Доставка?</span>
                        <span className={app.offers_delivery ? 'text-emerald-400' : 'text-zinc-600'}>{app.offers_delivery ? 'Так' : 'Ні'}</span>
                        {app.offers_delivery && app.delivery_areas && <span className="text-zinc-500 block">Зони: {app.delivery_areas}</span>}
                      </div>
                      <div>
                        <span className="block text-zinc-500 mb-0.5">Комісія та мін. замовлення</span>
                        <span className="text-zinc-300">Мін: €{app.min_order_eur ?? '-'} / Комісія: €{app.delivery_fee_eur ?? '-'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-zinc-500 mb-0.5">Примітки від ресторану</span>
                        <span className="text-zinc-300">{app.notes || '—'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Статус заявки</label>
                        <select
                          value={e?.status ?? app.status}
                          onChange={(ev) => updateAppEdit(app.id, 'status', ev.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                        >
                          <option value="pending">⏳ Очікує</option>
                          <option value="active">✅ Активна</option>
                          <option value="rejected">❌ Відхилена</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Примітка адміна</label>
                        <input
                          type="text"
                          value={e?.admin_notes ?? ''}
                          onChange={(ev) => updateAppEdit(app.id, 'admin_notes', ev.target.value)}
                          placeholder="Внутрішня примітка..."
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </main>
  )
}
