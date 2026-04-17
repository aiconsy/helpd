'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Settings,
  MapPin,
  AlertTriangle,
  Clock,
  Activity,
  RefreshCcw,
  Trash2,
  Download
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  DEFAULT_ISSUE_TYPES,
  Issue,
  formatDuration,
  loadIssues,
  resetIssues,
  seedDemoIssues,
  subscribeIssues
} from '@/lib/issues'

type AdminTab = 'overview' | 'issues' | 'workplaces' | 'escalated'

interface Workplace {
  id: number
  name: string
  costPerHour: number
  status: 'active' | 'inactive'
}

export default function AdminPage() {
  const t = useTranslations()
  const [tab, setTab] = useState<AdminTab>('overview')
  const [issues, setIssues] = useState<Issue[]>([])
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    setIssues(loadIssues())
    return subscribeIssues(() => setIssues(loadIssues()))
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const workplaces = useMemo<Workplace[]>(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `${t('admin.station')} ${i + 1}`,
        costPerHour: 120 + ((i * 37) % 130),
        status: i % 7 === 6 ? 'inactive' : 'active'
      })),
    [t]
  )

  const stats = useMemo(() => {
    const active = issues.filter((i) => i.status === 'active').length
    const escalated = issues.filter((i) => i.status === 'escalated').length
    const resolved = issues.filter((i) => i.status === 'resolved').length
    const totalDowntimeMs = issues
      .filter((i) => i.status === 'resolved')
      .reduce((acc, i) => acc + (i.duration ?? 0), 0)
    const avgResolution =
      resolved > 0 ? Math.round(totalDowntimeMs / resolved / 60000) : 0
    const cost =
      (totalDowntimeMs / (1000 * 60 * 60)) *
      (workplaces.reduce((acc, w) => acc + w.costPerHour, 0) / workplaces.length)
    return {
      total: issues.length,
      active,
      escalated,
      resolved,
      totalDowntimeMs,
      avgResolution,
      cost
    }
  }, [issues, workplaces])

  const byCategory = useMemo(() => {
    const counts = new Map<string, number>()
    issues.forEach((i) => {
      const key = i.typeId ?? i.type
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    const entries = Array.from(counts.entries()).map(([key, count]) => {
      const def = DEFAULT_ISSUE_TYPES.find((d) => d.id === key)
      return { key, label: def ? t(def.nameKey) : key, count, color: def?.color ?? 'from-slate-400 to-slate-600' }
    })
    entries.sort((a, b) => b.count - a.count)
    return entries
  }, [issues, t])

  const byStation = useMemo(() => {
    const counts = new Map<number, number>()
    issues.forEach((i) => {
      counts.set(i.workplace, (counts.get(i.workplace) ?? 0) + 1)
    })
    return workplaces.map((w) => ({ ...w, count: counts.get(w.id) ?? 0 }))
  }, [issues, workplaces])

  const escalated = useMemo(() => issues.filter((i) => i.status === 'escalated'), [issues])

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(issues, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `helpd-issues-${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [issues])

  const tabs = [
    { id: 'overview' as const, icon: BarChart3, label: t('admin.overview') },
    { id: 'issues' as const, icon: Settings, label: t('admin.issueManagement') },
    { id: 'workplaces' as const, icon: MapPin, label: t('admin.workplaces') },
    { id: 'escalated' as const, icon: AlertTriangle, label: t('admin.escalated') }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {t('admin.title')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{t('admin.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={exportJson}>
            <Download className="h-4 w-4" /> {t('admin.export')}
          </button>
          <button className="btn-secondary" onClick={() => seedDemoIssues(true)}>
            <RefreshCcw className="h-4 w-4" /> {t('admin.reseed')}
          </button>
          <button className="btn-ghost" onClick={resetIssues}>
            <Trash2 className="h-4 w-4" /> {t('admin.clear')}
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-1 bg-white p-1 rounded-2xl border border-slate-200 mb-6 shadow-sm">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              tab === id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <KPI
              tone="blue"
              icon={Activity}
              label={t('admin.activeIssues')}
              value={stats.active}
            />
            <KPI
              tone="amber"
              icon={AlertTriangle}
              label={t('admin.escalated')}
              value={stats.escalated}
            />
            <KPI
              tone="green"
              icon={Clock}
              label={t('admin.avgResolution')}
              value={`${stats.avgResolution}m`}
            />
            <KPI
              tone="slate"
              icon={BarChart3}
              label={t('admin.totalIssues')}
              value={stats.total}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-title">{t('admin.issuesByCategory')}</h3>
                <span className="text-xs text-slate-500">{issues.length} {t('admin.total')}</span>
              </div>
              {byCategory.length === 0 ? (
                <EmptyState t={t} />
              ) : (
                <ul className="space-y-3">
                  {byCategory.map((row) => {
                    const max = Math.max(...byCategory.map((c) => c.count), 1)
                    const pct = (row.count / max) * 100
                    return (
                      <li key={row.key}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">{row.label}</span>
                          <span className="text-slate-500">{row.count}</span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${row.color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-title">{t('admin.issuesByStation')}</h3>
                <span className="text-xs text-slate-500">
                  {t('admin.top10')}
                </span>
              </div>
              {byStation.every((s) => s.count === 0) ? (
                <EmptyState t={t} />
              ) : (
                <ul className="space-y-2">
                  {byStation
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map((s) => {
                      const max = Math.max(...byStation.map((c) => c.count), 1)
                      const pct = (s.count / max) * 100
                      return (
                        <li key={s.id}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-700">{s.name}</span>
                            <span className="text-slate-500">{s.count}</span>
                          </div>
                          <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      )
                    })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'issues' && (
        <div className="card animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">{t('admin.issueManagement')}</h2>
            <span className="text-xs text-slate-500">
              {issues.length} {t('admin.total')}
            </span>
          </div>
          {issues.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-2 pr-4">{t('admin.type')}</th>
                    <th className="py-2 pr-4">{t('admin.station')}</th>
                    <th className="py-2 pr-4">{t('admin.started')}</th>
                    <th className="py-2 pr-4">{t('admin.duration')}</th>
                    <th className="py-2">{t('admin.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {issues.map((issue) => (
                    <tr key={issue.id}>
                      <td className="py-3 pr-4">{issue.type}</td>
                      <td className="py-3 pr-4 text-slate-600">{issue.workplace}</td>
                      <td className="py-3 pr-4 text-slate-600">
                        {new Date(issue.startTime).toLocaleTimeString()}
                      </td>
                      <td className="py-3 pr-4 tabular-nums">
                        {issue.duration
                          ? formatDuration(issue.duration)
                          : formatDuration(now - new Date(issue.startTime).getTime())}
                      </td>
                      <td className="py-3">
                        <StatusPill status={issue.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'workplaces' && (
        <div className="card animate-fade-in-up">
          <h2 className="section-title mb-4">{t('admin.workplaceConfiguration')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-4">{t('admin.station')}</th>
                  <th className="py-2 pr-4">{t('admin.costPerHour')}</th>
                  <th className="py-2 pr-4">{t('admin.issuesReported')}</th>
                  <th className="py-2">{t('admin.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byStation.map((w) => (
                  <tr key={w.id}>
                    <td className="py-3 pr-4 font-medium">{w.name}</td>
                    <td className="py-3 pr-4 text-slate-600">€{w.costPerHour.toFixed(0)}/h</td>
                    <td className="py-3 pr-4 text-slate-600">{w.count}</td>
                    <td className="py-3">
                      <span className={w.status === 'active' ? 'pill-green' : 'pill-slate'}>
                        {t(w.status === 'active' ? 'admin.active' : 'admin.inactive')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'escalated' && (
        <div className="card animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">{t('admin.escalated')}</h2>
            <span className="text-xs text-slate-500">
              {escalated.length} {t('admin.total')}
            </span>
          </div>
          {escalated.length === 0 ? (
            <EmptyState t={t} icon={AlertTriangle} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {escalated.map((issue) => (
                <li key={issue.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-slate-900">{issue.type}</div>
                    <div className="text-xs text-slate-500">
                      {t('worker.station')} {issue.workplace} ·{' '}
                      {new Date(issue.startTime).toLocaleTimeString()}
                    </div>
                    {issue.notes && (
                      <div className="text-xs text-slate-500 mt-1">
                        <span className="text-slate-400">{t('fls.workerNotes')}:</span>{' '}
                        {issue.notes}
                      </div>
                    )}
                    {issue.flsNotes && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        <span className="text-slate-400">{t('fls.flsNotes')}:</span>{' '}
                        {issue.flsNotes}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-xs text-slate-500 whitespace-nowrap">
                    <StatusPill status={issue.status} />
                    <div className="mt-1 tabular-nums">
                      {formatDuration(now - new Date(issue.startTime).getTime())}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function KPI({
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

function EmptyState({
  t,
  icon: Icon = BarChart3
}: {
  t: (key: string) => string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Icon className="h-10 w-10 text-slate-300" />
      <div className="mt-2 text-sm text-slate-500">{t('admin.noData')}</div>
      <div className="mt-0.5 text-xs text-slate-400">{t('admin.noDataHint')}</div>
    </div>
  )
}
