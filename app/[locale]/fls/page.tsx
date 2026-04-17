'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  TrendingUp,
  Search,
  Camera,
  XCircle
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Issue,
  formatDuration,
  loadIssues,
  subscribeIssues,
  updateIssue
} from '@/lib/issues'

type Filter = 'all' | 'active' | 'escalated' | 'resolved'

export default function FLSPage() {
  const t = useTranslations()

  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Issue | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [flsNotes, setFlsNotes] = useState('')
  const [now, setNow] = useState(Date.now())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setIssues(loadIssues())
    setLoading(false)
    return subscribeIssues(() => setIssues(loadIssues()))
  }, [])

  const filtered = useMemo(() => {
    return issues.filter((issue) => {
      const statusMatch = filter === 'all' || issue.status === filter
      const q = query.toLowerCase()
      const qMatch =
        q === '' ||
        issue.type.toLowerCase().includes(q) ||
        (issue.notes ?? '').toLowerCase().includes(q) ||
        issue.workplace.toString().includes(q)
      return statusMatch && qMatch
    })
  }, [issues, filter, query])

  const stats = useMemo(() => {
    const active = issues.filter((i) => i.status === 'active').length
    const escalated = issues.filter((i) => i.status === 'escalated').length
    const resolved = issues.filter((i) => i.status === 'resolved').length
    const downtimeHours =
      issues
        .filter((i) => i.status === 'resolved')
        .reduce((acc, i) => acc + (i.duration ?? 0), 0) /
      (1000 * 60 * 60)
    return {
      active,
      escalated,
      resolved,
      downtime: downtimeHours.toFixed(1)
    }
  }, [issues])

  const resolveIssue = useCallback((id: string) => {
    const issue = loadIssues().find((i) => i.id === id)
    if (!issue) return
    updateIssue(id, {
      status: 'resolved',
      endTime: new Date().toISOString(),
      duration: Date.now() - new Date(issue.startTime).getTime()
    })
  }, [])

  const escalateIssue = useCallback((id: string) => {
    updateIssue(id, {
      status: 'escalated',
      escalatedBy: 'FLS User',
      escalatedAt: new Date().toISOString()
    })
  }, [])

  const saveFlsNotes = useCallback(() => {
    if (!selected || !flsNotes.trim()) {
      setError(t('fls.emptyNotes'))
      return
    }
    updateIssue(selected.id, { flsNotes })
    setSelected((prev) => (prev ? { ...prev, flsNotes } : prev))
    setFlsNotes('')
  }, [selected, flsNotes, t])

  useEffect(() => {
    if (!error) return
    const id = setTimeout(() => setError(null), 4000)
    return () => clearTimeout(id)
  }, [error])

  useEffect(() => {
    if (!selected) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selected])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
        <div className="inline-flex items-center gap-3 text-slate-500">
          <div className="h-5 w-5 rounded-full border-2 border-slate-200 border-t-brand-500 animate-spin" />
          {t('fls.loading')}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-800 p-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {t('fls.title')}
        </h1>
        <p className="text-sm text-slate-600 mt-1">{t('fls.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard tone="blue" icon={AlertTriangle} label={t('fls.activeIssues')} value={stats.active} />
        <StatCard tone="amber" icon={TrendingUp} label={t('fls.escalated')} value={stats.escalated} />
        <StatCard tone="green" icon={CheckCircle} label={t('fls.resolvedToday')} value={stats.resolved} />
        <StatCard tone="slate" icon={Clock} label={t('fls.totalDowntime')} value={`${stats.downtime}h`} />
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="input pl-9"
              placeholder={t('fls.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'escalated', 'resolved'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t(`filters.${f}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-3">{t('fls.issuesOverview')}</h2>
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 py-10 text-center">
            {t('fls.noIssuesFound')}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((issue) => (
              <li key={issue.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(issue)
                    setFlsNotes('')
                  }}
                  className="w-full flex items-center justify-between gap-4 py-4 text-left hover:bg-slate-50 rounded-xl px-3 -mx-3 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${
                        issue.status === 'active'
                          ? 'bg-brand-500'
                          : issue.status === 'escalated'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">{issue.type}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {t('worker.station')} {issue.workplace} ·{' '}
                        {new Date(issue.startTime).toLocaleTimeString()}
                      </div>
                      {issue.notes && (
                        <div className="text-xs text-slate-500 mt-1 truncate">{issue.notes}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-sm text-slate-700 tabular-nums">
                      {issue.status === 'active'
                        ? formatDuration(now - new Date(issue.startTime).getTime())
                        : issue.duration
                        ? formatDuration(issue.duration)
                        : '—'}
                    </span>
                    <StatusPill status={issue.status} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-pop p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="pill-slate">
                  {t('worker.station')} {selected.workplace}
                </span>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{selected.type}</h3>
                <div className="text-xs text-slate-500">
                  {t('fls.started')}{' '}
                  {new Date(selected.startTime).toLocaleTimeString()}
                </div>
              </div>
              <button
                className="btn-ghost"
                onClick={() => setSelected(null)}
                aria-label={t('common.close')}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {selected.notes && (
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t('fls.workerNotes')}
                  </div>
                  <div className="text-sm text-slate-800 mt-1">{selected.notes}</div>
                </div>
              )}
              {selected.flsNotes && (
                <div className="rounded-xl bg-emerald-50 p-3">
                  <div className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    {t('fls.flsNotes')}
                  </div>
                  <div className="text-sm text-emerald-900 mt-1">{selected.flsNotes}</div>
                </div>
              )}

              <div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('fls.flsNotes')}
                </div>
                <textarea
                  className="input mt-1 h-24 resize-none"
                  placeholder={t('fls.addYourNotes')}
                  value={flsNotes}
                  onChange={(e) => setFlsNotes(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  className="btn-secondary"
                  onClick={() => alert(t('fls.cameraFunctionality'))}
                >
                  <Camera className="h-4 w-4" /> {t('fls.takePhoto')}
                </button>
                {selected.status === 'active' && (
                  <button className="btn-secondary" onClick={() => escalateIssue(selected.id)}>
                    <TrendingUp className="h-4 w-4" /> {t('fls.escalateToAdmin')}
                  </button>
                )}
                <button className="btn-primary" onClick={saveFlsNotes}>
                  {t('fls.saveNotes')}
                </button>
                {selected.status === 'active' && (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      resolveIssue(selected.id)
                      setSelected(null)
                    }}
                  >
                    <CheckCircle className="h-4 w-4" /> {t('fls.resolveIssue')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  tone,
  icon: Icon,
  label,
  value
}: {
  tone: 'blue' | 'amber' | 'green' | 'slate'
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
}) {
  const toneMap = {
    blue: 'bg-brand-50 text-brand-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    slate: 'bg-slate-100 text-slate-700'
  }[tone]
  return (
    <div className="stat-card">
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-2xl font-semibold text-slate-900 mt-0.5">{value}</div>
      </div>
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneMap}`}>
        <Icon className="h-5 w-5" />
      </span>
    </div>
  )
}

function StatusPill({ status }: { status: Issue['status'] }) {
  const t = useTranslations()
  const cls =
    status === 'active'
      ? 'pill-blue'
      : status === 'resolved'
      ? 'pill-green'
      : 'pill-amber'
  return <span className={cls}>{t(`status.${status}`)}</span>
}
