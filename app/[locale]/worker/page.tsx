'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Clock,
  MapPin,
  MessageSquare,
  HelpCircle,
  StopCircle,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  DEFAULT_ISSUE_TYPES,
  Issue,
  WORKPLACE_KEY,
  formatDuration,
  loadIssues,
  saveIssues,
  subscribeIssues,
  updateIssue
} from '@/lib/issues'

export default function WorkerPage() {
  const t = useTranslations()

  const [workplace, setWorkplace] = useState<number>(1)
  const [issues, setIssues] = useState<Issue[]>([])
  const [showWorkplaceModal, setShowWorkplaceModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [notes, setNotes] = useState('')
  const [connection, setConnection] = useState<'connected' | 'unstable' | 'offline'>('connected')
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())

  const issueTypes = useMemo(
    () => DEFAULT_ISSUE_TYPES.map((i) => ({ ...i, name: t(i.nameKey) })),
    [t]
  )

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WORKPLACE_KEY)
      if (saved) setWorkplace(parseInt(saved))
    } catch {}
    setIssues(loadIssues())
    return subscribeIssues(() => setIssues(loadIssues()))
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(WORKPLACE_KEY, workplace.toString())
    } catch {}
  }, [workplace])

  // Simulated connection status for presentation realism.
  useEffect(() => {
    const id = setInterval(() => {
      const roll = Math.random()
      setConnection(roll < 0.85 ? 'connected' : roll < 0.95 ? 'unstable' : 'offline')
    }, 12000)
    return () => clearInterval(id)
  }, [])

  const activeIssue = useMemo(
    () => issues.find((i) => i.status === 'active' && i.workplace === workplace) ?? null,
    [issues, workplace]
  )

  const recentAtStation = useMemo(
    () => issues.filter((i) => i.workplace === workplace).slice(0, 6),
    [issues, workplace]
  )

  const startIssue = useCallback(
    (typeDef: (typeof issueTypes)[number]) => {
      if (activeIssue) {
        setError(t('worker.alreadyActive'))
        return
      }
      const newIssue: Issue = {
        id: Date.now().toString(),
        type: typeDef.name,
        typeId: typeDef.id,
        category: typeDef.category,
        startTime: new Date().toISOString(),
        workplace,
        status: 'active'
      }
      saveIssues([newIssue, ...issues])
      setError(null)
    },
    [activeIssue, issues, t, workplace]
  )

  const stopIssue = useCallback(() => {
    if (!activeIssue) return
    updateIssue(activeIssue.id, {
      status: 'resolved',
      endTime: new Date().toISOString(),
      duration: Date.now() - new Date(activeIssue.startTime).getTime()
    })
    setError(null)
  }, [activeIssue])

  const requestHelp = useCallback(() => {
    if (!activeIssue) {
      setError(t('worker.noActiveIssue'))
      return
    }
    updateIssue(activeIssue.id, { status: 'escalated', escalatedBy: t('worker.title'), escalatedAt: new Date().toISOString() })
  }, [activeIssue, t])

  const saveNotes = useCallback(() => {
    if (!activeIssue || !notes.trim()) {
      setError(t('worker.emptyNotes'))
      return
    }
    updateIssue(activeIssue.id, { notes })
    setNotes('')
    setShowNotesModal(false)
  }, [activeIssue, notes, t])

  useEffect(() => {
    if (!error) return
    const id = setTimeout(() => setError(null), 4000)
    return () => clearTimeout(id)
  }, [error])

  const connectionPill =
    connection === 'connected'
      ? { cls: 'pill-green', icon: Wifi }
      : connection === 'unstable'
      ? { cls: 'pill-amber', icon: Loader2 }
      : { cls: 'pill-red', icon: WifiOff }
  const ConnIcon = connectionPill.icon

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-800 p-3 flex items-center gap-2 animate-fade-in-up">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {t('worker.title')}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4" />
            <span>
              {t('worker.station')} {workplace}
            </span>
            <button
              type="button"
              onClick={() => setShowWorkplaceModal(true)}
              className="text-brand-700 hover:text-brand-800 underline underline-offset-2"
            >
              {t('worker.selectWorkplace')}
            </button>
          </div>
        </div>
        <span className={connectionPill.cls}>
          <ConnIcon className="h-3.5 w-3.5" /> {t(`worker.connectionStatus.${connection}`)}
        </span>
      </div>

      {activeIssue && (
        <div className="card mb-6 border-amber-200 bg-gradient-to-br from-amber-50 to-white animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="pill-amber">
                <AlertTriangle className="h-3.5 w-3.5" /> {t('worker.activeIssue')}
              </span>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{activeIssue.type}</div>
              <div className="text-sm text-slate-600">
                {t('worker.startedAt')}{' '}
                {new Date(activeIssue.startTime).toLocaleTimeString()}
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="inline-flex items-center gap-2 text-3xl font-semibold tracking-tight text-amber-900">
                <Clock className="h-6 w-6" />
                {formatDuration(now - new Date(activeIssue.startTime).getTime())}
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary" onClick={() => setShowNotesModal(true)}>
                  <MessageSquare className="h-4 w-4" /> {t('worker.addNotes')}
                </button>
                <button className="btn-primary" onClick={requestHelp}>
                  <HelpCircle className="h-4 w-4" /> {t('worker.requestHelp')}
                </button>
                <button className="btn-danger" onClick={stopIssue}>
                  <StopCircle className="h-4 w-4" /> {t('worker.stopTimer')}
                </button>
              </div>
            </div>
          </div>
          {activeIssue.notes && (
            <div className="mt-4 rounded-xl bg-white border border-amber-100 p-3 text-sm text-slate-700">
              <span className="text-xs uppercase tracking-wider text-amber-700 mr-2">
                {t('worker.notes')}
              </span>
              {activeIssue.notes}
            </div>
          )}
        </div>
      )}

      <div className="card mb-6">
        <h2 className="section-title mb-4">{t('worker.reportIssue')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {issueTypes.map((issueType) => (
            <button
              key={issueType.id}
              onClick={() => startIssue(issueType)}
              disabled={!!activeIssue}
              className={`relative overflow-hidden rounded-2xl p-5 text-white text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br ${issueType.color} shadow-pop`}
              aria-label={`Report ${issueType.name}`}
            >
              <div className="text-3xl" aria-hidden="true">{issueType.icon}</div>
              <div className="mt-3 font-semibold">{issueType.name}</div>
              <div className="mt-0.5 text-xs opacity-80">
                {t('worker.slaTag', { min: issueType.slaMinutes })}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">{t('worker.recentIssues')}</h2>
          <span className="text-xs text-slate-500">
            {t('worker.atStation', { n: workplace })}
          </span>
        </div>
        {recentAtStation.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">{t('worker.noIssues')}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentAtStation.map((issue) => (
              <li key={issue.id} className="flex items-center justify-between py-3 gap-4">
                <div>
                  <div className="font-medium text-slate-900">{issue.type}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(issue.startTime).toLocaleTimeString()}
                  </div>
                  {issue.notes && <div className="text-xs text-slate-500 mt-0.5">{issue.notes}</div>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusPill status={issue.status} />
                  {issue.duration && (
                    <span className="text-xs text-slate-500">
                      {formatDuration(issue.duration)}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showWorkplaceModal && (
        <Modal onClose={() => setShowWorkplaceModal(false)} title={t('worker.selectWorkplace')}>
          <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto">
            {Array.from({ length: 100 }, (_, i) => i + 1).map((station) => (
              <button
                key={station}
                onClick={() => {
                  setWorkplace(station)
                  setShowWorkplaceModal(false)
                }}
                className={`p-2 rounded-lg text-sm border transition-colors ${
                  workplace === station
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                {station}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {showNotesModal && (
        <Modal onClose={() => setShowNotesModal(false)} title={t('worker.notes')}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('worker.describeIssue')}
            className="input h-32 resize-none"
          />
          <div className="flex gap-2 mt-4">
            <button className="btn-secondary flex-1" onClick={() => setShowNotesModal(false)}>
              {t('common.cancel')}
            </button>
            <button className="btn-primary flex-1" onClick={saveNotes}>
              {t('worker.saveNotes')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: Issue['status'] }) {
  const t = useTranslations()
  const cls =
    status === 'active'
      ? 'pill-amber'
      : status === 'resolved'
      ? 'pill-green'
      : 'pill-red'
  return <span className={cls}>{t(`status.${status}`)}</span>
}

function Modal({
  children,
  title,
  onClose
}: {
  children: React.ReactNode
  title: string
  onClose: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])
  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-pop p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="section-title mb-4">{title}</h3>
        {children}
      </div>
    </div>
  )
}
