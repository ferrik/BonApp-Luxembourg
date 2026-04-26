import { useState, useEffect } from 'react'
import type { Restaurant, PartnerApplicationPayload } from '../types'

// TODO: Add authentication before production launch
// Currently unprotected — admin route must be secured before going live

const VERIFICATION_OPTIONS = ['pending', 'verified', 'inferred', 'unverified', 'needs_verification']
const PARTNER_OPTIONS = ['new', 'contacted', 'interested', 'follow_up', 'trial', 'active', 'premium', 'paused', 'onboarded', 'rejected']
const APPLICATION_STATUSES = ['pending', 'active', 'rejected']

interface EditState {
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

// Combine Payload with DB fields
type PartnerApplication = PartnerApplicationPayload & {
  id: number
  status: string
  admin_notes: string | null
  created_at: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'restaurants' | 'applications'>('restaurants')

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

  useEffect(() => {
    localStorage.setItem('bonapp_admin_token', adminToken)
    if (activeTab === 'restaurants') fetchRestaurants()
    if (activeTab === 'applications') fetchApplications()
  }, [activeTab, adminToken])

  async function fetchRestaurants() {
    setLoading(true)
    try {
      const res = await fetch('/api/restaurants?limit=100')
      if (!res.ok) throw new Error('Failed to fetch')
      const data: Restaurant[] = await res.json()
      setRestaurants(data)
      const initEdits: Record<number, EditState> = {}
      data.forEach((r) => {
        initEdits[r.id] = {
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
      const res = await fetch('/api/partners', {
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
      const res = await fetch(`/api/restaurants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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

  async function handleSaveApplication(id: number) {
    setAppSaveStatus((s) => ({ ...s, [id]: 'saving' }))
    try {
      const body = appEdits[id]
      const res = await fetch(`/api/partners/${id}`, {
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
    const matchCuisine = !filterCuisine || r.cuisine_primary === filterCuisine
    const matchStatus = !filterStatus || r.verification_status === filterStatus
    return matchSearch && matchCuisine && matchStatus
  })

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
      {/* Warning banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs rounded-xl px-4 py-3 mb-6 flex items-start gap-2">
        <span className="text-base">⚠️</span>
        <span>
          <strong>TODO:</strong> This admin panel has no authentication.
          Add auth before production launch.
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Admin</h1>
          <p className="text-xs text-zinc-500 mt-1">BonApp Luxembourg — Management</p>
        </div>
        <button
          onClick={() => activeTab === 'restaurants' ? fetchRestaurants() : fetchApplications()}
          className="btn-secondary text-xs px-4 py-2"
        >
          ↻ Refresh
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
          Restaurants
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'applications'
              ? 'bg-brand-500 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Partner Applications
        </button>
      </div>

      {activeTab === 'restaurants' ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-white">{restaurants.length}</p>
              <p className="text-xs text-zinc-500 mt-1">Total</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-emerald-400">
                {restaurants.filter((r) => r.verification_status === 'verified').length}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Verified</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-brand-400">
                {restaurants.filter((r) => r.partner_status === 'active').length}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Active</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              placeholder="Search name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 flex-1 min-w-[160px]"
            />
            <select
              value={filterCuisine}
              onChange={(e) => setFilterCuisine(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All cuisines</option>
              {cuisines.map((c) => <option key={c} value={c!}>{c}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All statuses</option>
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
          {!loading && !error && filtered.length === 0 && <p className="text-zinc-500 text-sm text-center py-12">No restaurants found.</p>}

          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((r) => {
                const e = edits[r.id]
                const status = saveStatus[r.id] ?? 'idle'
                const dirty = isDirty(r)

                return (
                  <div key={r.id} className={`bg-zinc-900 border rounded-xl p-4 transition-all ${dirty ? 'border-brand-500/50' : 'border-zinc-800'}`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">{r.name}</span>
                          <span className="badge badge-orange text-[10px]">{r.cuisine_primary}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {[r.city, r.address].filter(Boolean).join(' · ')} · ID #{r.id}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSaveRestaurant(r.id)}
                        disabled={!dirty || status === 'saving'}
                        className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          status === 'saved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : status === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : dirty ? 'bg-brand-500 text-white hover:bg-brand-400'
                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        {status === 'saving' ? '...' : status === 'saved' ? '✓ Saved' : status === 'error' ? '✗ Error' : 'Save'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Verification status</label>
                        <select
                          value={e?.verification_status ?? r.verification_status}
                          onChange={(ev) => updateEdit(r.id, 'verification_status', ev.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                        >
                          {VERIFICATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Partner status</label>
                        <select
                          value={e?.partner_status ?? r.partner_status}
                          onChange={(ev) => updateEdit(r.id, 'partner_status', ev.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                        >
                          {PARTNER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Notes</label>
                        <input
                          type="text"
                          value={e?.notes ?? ''}
                          onChange={(ev) => updateEdit(r.id, 'notes', ev.target.value)}
                          placeholder="Internal note..."
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
      ) : (
        <>
          {/* Applications View */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 flex gap-3 items-center">
            <input
              type="password"
              placeholder="Admin Token (X-Admin-Token)"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 max-w-sm w-full"
            />
            <span className="text-xs text-zinc-500">Required to view and edit applications</span>
          </div>

          {!adminToken ? (
            <p className="text-zinc-500 text-sm text-center py-12">Enter Admin Token to view applications.</p>
          ) : appLoading ? (
            <div className="space-y-3">
              {[1,2].map((i) => <div key={i} className="h-32 bg-zinc-900 rounded-xl animate-pulse" />)}
            </div>
          ) : appError ? (
            <p className="text-red-400 text-sm text-center py-12">{appError}</p>
          ) : applications.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-12">No applications found.</p>
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
                          {app.application_type === 'update' && <span className="badge badge-zinc">Update req</span>}
                        </div>
                        <p className="text-sm text-zinc-400">
                          {app.contact_name} · <a href={`mailto:${app.contact_email}`} className="text-brand-400 hover:underline">{app.contact_email}</a> · {app.contact_phone}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Submitted: {new Date(app.created_at).toLocaleString()}
                        </p>
                      </div>

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
                        {status === 'saving' ? '...' : status === 'saved' ? '✓ Saved' : status === 'error' ? '✗ Error' : 'Save'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-zinc-950 p-3 rounded-lg text-xs">
                      <div>
                        <span className="block text-zinc-500 mb-0.5">Location</span>
                        <span className="text-zinc-300">{app.city || '—'}, {app.address || '—'}</span>
                      </div>
                      <div>
                        <span className="block text-zinc-500 mb-0.5">Cuisine</span>
                        <span className="text-zinc-300">{app.cuisine_type || '—'}</span>
                      </div>
                      <div>
                        <span className="block text-zinc-500 mb-0.5">Menu URL</span>
                        {app.menu_url ? <a href={app.menu_url} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline break-all">Link</a> : <span className="text-zinc-600">—</span>}
                      </div>
                      <div>
                        <span className="block text-zinc-500 mb-0.5">Ordering URL</span>
                        {app.ordering_url ? <a href={app.ordering_url} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline break-all">Link</a> : <span className="text-zinc-600">—</span>}
                      </div>
                      <div>
                        <span className="block text-zinc-500 mb-0.5">Delivery?</span>
                        <span className={app.offers_delivery ? 'text-emerald-400' : 'text-zinc-600'}>{app.offers_delivery ? 'Yes' : 'No'}</span>
                        {app.offers_delivery && app.delivery_areas && <span className="text-zinc-500 block">Areas: {app.delivery_areas}</span>}
                      </div>
                      <div>
                        <span className="block text-zinc-500 mb-0.5">Fees & Min</span>
                        <span className="text-zinc-300">Min: €{app.min_order_eur ?? '-'} / Fee: €{app.delivery_fee_eur ?? '-'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-zinc-500 mb-0.5">Notes from restaurant</span>
                        <span className="text-zinc-300">{app.notes || '—'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Application Status</label>
                        <select
                          value={e?.status ?? app.status}
                          onChange={(ev) => updateAppEdit(app.id, 'status', ev.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                        >
                          {APPLICATION_STATUSES.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Admin Notes</label>
                        <input
                          type="text"
                          value={e?.admin_notes ?? ''}
                          onChange={(ev) => updateAppEdit(app.id, 'admin_notes', ev.target.value)}
                          placeholder="Private note for us..."
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
