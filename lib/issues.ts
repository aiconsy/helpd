export type IssueStatus = 'active' | 'resolved' | 'escalated'

export interface Issue {
  id: string
  type: string
  typeId?: string
  category?: string
  startTime: string
  endTime?: string
  duration?: number
  notes?: string
  flsNotes?: string
  workplace: number
  status: IssueStatus
  escalatedBy?: string
  escalatedAt?: string
  photos?: string[]
}

export const STORAGE_KEY = 'helpd-issue-history'
export const WORKPLACE_KEY = 'helpd-workplace'
export const SEED_MARKER_KEY = 'helpd-seeded'

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function loadIssues(): Issue[] {
  if (typeof window === 'undefined') return []
  const issues = safeParse<Issue[]>(localStorage.getItem(STORAGE_KEY), [])
  // Newest-first ordering for operational dashboards.
  return [...issues].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )
}

export function saveIssues(issues: Issue[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues))
  // Same-tab listeners rely on a custom event; `storage` only fires cross-tab.
  window.dispatchEvent(new CustomEvent('helpd:issues-updated'))
}

export function updateIssue(id: string, patch: Partial<Issue>): Issue[] {
  const issues = loadIssues().map((issue) =>
    issue.id === id ? { ...issue, ...patch } : issue
  )
  saveIssues(issues)
  return issues
}

export function subscribeIssues(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener()
  }
  const onCustom = () => listener()
  window.addEventListener('storage', onStorage)
  window.addEventListener('helpd:issues-updated', onCustom as EventListener)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('helpd:issues-updated', onCustom as EventListener)
  }
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const mm = minutes.toString().padStart(2, '0')
  const ss = seconds.toString().padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`
}

export interface IssueTypeDef {
  id: string
  nameKey: string
  color: string
  icon: string
  category: string
  slaMinutes: number
}

export const DEFAULT_ISSUE_TYPES: IssueTypeDef[] = [
  { id: 'no-materials', nameKey: 'issueTypes.noMaterials', color: 'from-rose-500 to-red-500', icon: '📦', category: 'supply', slaMinutes: 30 },
  { id: 'machine-fault', nameKey: 'issueTypes.machineFault', color: 'from-orange-500 to-amber-500', icon: '⚙️', category: 'technical', slaMinutes: 60 },
  { id: 'conveyor-stop', nameKey: 'issueTypes.conveyorStop', color: 'from-amber-500 to-yellow-500', icon: '🔄', category: 'technical', slaMinutes: 45 },
  { id: 'safety-issue', nameKey: 'issueTypes.safetyIssue', color: 'from-red-600 to-rose-600', icon: '⚠️', category: 'safety', slaMinutes: 15 },
  { id: 'break-time', nameKey: 'issueTypes.breakTime', color: 'from-sky-500 to-blue-500', icon: '☕', category: 'personal', slaMinutes: 120 },
  { id: 'quality-issue', nameKey: 'issueTypes.qualityIssue', color: 'from-violet-500 to-purple-500', icon: '🔍', category: 'quality', slaMinutes: 90 }
]

export function seedDemoIssues(force = false): void {
  if (typeof window === 'undefined') return
  if (!force && localStorage.getItem(SEED_MARKER_KEY) === 'v1') return
  const now = Date.now()
  const minutes = (m: number) => new Date(now - m * 60_000).toISOString()

  const demo: Issue[] = [
    {
      id: 'demo-1',
      type: 'Machine Fault',
      typeId: 'machine-fault',
      category: 'technical',
      startTime: minutes(12),
      workplace: 5,
      status: 'active',
      notes: 'Unusual vibration and loud noise on spindle.'
    },
    {
      id: 'demo-2',
      type: 'No Materials',
      typeId: 'no-materials',
      category: 'supply',
      startTime: minutes(7),
      workplace: 12,
      status: 'active',
      notes: 'Waiting on pallet delivery from warehouse B.'
    },
    {
      id: 'demo-3',
      type: 'Safety Issue',
      typeId: 'safety-issue',
      category: 'safety',
      startTime: minutes(45),
      endTime: minutes(22),
      duration: 23 * 60_000,
      workplace: 8,
      status: 'resolved',
      notes: 'Oil spill near station.',
      flsNotes: 'Area cleaned and signed off.'
    },
    {
      id: 'demo-4',
      type: 'Conveyor Stopped',
      typeId: 'conveyor-stop',
      category: 'technical',
      startTime: minutes(30),
      workplace: 3,
      status: 'escalated',
      notes: 'Belt tension sensor triggered.',
      escalatedBy: 'FLS User',
      escalatedAt: minutes(18)
    },
    {
      id: 'demo-5',
      type: 'Quality Issue',
      typeId: 'quality-issue',
      category: 'quality',
      startTime: minutes(90),
      endTime: minutes(60),
      duration: 30 * 60_000,
      workplace: 7,
      status: 'resolved',
      notes: 'Out-of-tolerance batch flagged.',
      flsNotes: 'Batch segregated for rework.'
    }
  ]

  saveIssues(demo)
  localStorage.setItem(SEED_MARKER_KEY, 'v1')
}

export function resetIssues(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(SEED_MARKER_KEY)
  window.dispatchEvent(new CustomEvent('helpd:issues-updated'))
}
