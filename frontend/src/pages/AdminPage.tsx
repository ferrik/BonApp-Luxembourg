import { useState, useEffect } from 'react'
import type { Restaurant } from '../types'

// TODO: Add authentication before production launch
// Currently unprotected — admin route must be secured before going live

const VERIFICATION_OPTIONS = ['pending', 'verified', 'inferred', 'unverified', 'needs_verification']
const PARTNER_OPTIONS = ['new', 'contacted', 'interested', 'follow_up', 'trial', 'active', 'premium', 'paused', 'onboarded', 'rejected']

interface EditState {
  verification_status: string
  partner_status: string
  notes: string
}

interface SaveStatus {
  [id: number]: 'idle' | 'saving' | 'saved' | 'error'
}

export default function AdminPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<number, EditState>>({})
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({})
  const [search, setSearch] = useState('')
  const [filterCuisine, setFilterCuisine] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const res = await fetch('/api/restaurants?limit=100')
      if (!res.ok) throw new Error('Failed to fetch')
      const data: Restaurant[] = await res.json()
      setRestaurants(data)
      // Init edit state from current values
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

  async function handleSave(id: number) {
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

  function updateEdit(id: number, field: keyof EditState, value: string) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
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

  const verifiedCount = restaurants.filter((r) => r.verification_status === 'verified').length
  const activeCount = restaurants.filter((r) => r.partner_status === 'active').length

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
          <p className="text-xs text-zinc-500 mt-1">BonApp Luxembourg — Restaurant management</p>
        </div>
        <button
          onClick={fetchAll}
          className="btn-secondary text-xs px-4 py-2"
          id="admin-refresh"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-white">{restaurants.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Total restaurants</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-emerald-400">{verifiedCount}</p>
          <p className="text-xs text-zinc-500 mt-1">Verified</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-brand-400">{activeCount}</p>
          <p className="text-xs text-zinc-500 mt-1">Active partners</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          id="admin-search"
          type="text"
          placeholder="Search name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 flex-1 min-w-[160px]"
        />
        <select
          id="admin-filter-cuisine"
          value={filterCuisine}
          onChange={(e) => setFilterCuisine(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
        >
          <option value="">All cuisines</option>
          {cuisines.map((c) => <option key={c} value={c!}>{c}</option>)}
        </select>
        <select
          id="admin-filter-status"
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
          {[1,2,3].map((i) => (
            <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-zinc-500 text-sm text-center py-12">No restaurants found.</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((r) => {
            const e = edits[r.id]
            const status = saveStatus[r.id] ?? 'idle'
            const dirty = isDirty(r)

            return (
              <div
                key={r.id}
                id={`admin-row-${r.id}`}
                className={`bg-zinc-900 border rounded-xl p-4 transition-all ${
                  dirty ? 'border-brand-500/50' : 'border-zinc-800'
                }`}
              >
                {/* Row header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{r.name}</span>
                      <span className="badge badge-orange text-[10px]">{r.cuisine_primary}</span>
                      {r.notes?.includes('TEST DATA') && (
                        <span className="badge bg-yellow-500/15 text-yellow-400 text-[10px]">TEST</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {[r.city, r.address].filter(Boolean).join(' · ')} · ID #{r.id}
                    </p>
                  </div>

                  {/* Save button */}
                  <button
                    id={`admin-save-${r.id}`}
                    onClick={() => handleSave(r.id)}
                    disabled={!dirty || status === 'saving'}
                    className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      status === 'saved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : status === 'error'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : dirty
                        ? 'bg-brand-500 text-white hover:bg-brand-400'
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    {status === 'saving' ? '...' : status === 'saved' ? '✓ Saved' : status === 'error' ? '✗ Error' : 'Save'}
                  </button>
                </div>

                {/* Editable fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                      Verification status
                    </label>
                    <select
                      value={e?.verification_status ?? r.verification_status}
                      onChange={(ev) => updateEdit(r.id, 'verification_status', ev.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      {VERIFICATION_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                      Partner status
                    </label>
                    <select
                      value={e?.partner_status ?? r.partner_status}
                      onChange={(ev) => updateEdit(r.id, 'partner_status', ev.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      {PARTNER_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                      Notes
                    </label>
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
    </main>
  )
}
