'use client'

import { useState, useEffect } from 'react'
import { Home, Settings, BarChart3, Plus, Edit, Trash2, MapPin, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

interface IssueType {
  id: string
  name: string
  color: string
  icon: string
  category: string
  slaMinutes: number
}

interface Workplace {
  id: number
  name: string
  costPerHour: number
  workerWage: number
  status: 'active' | 'inactive'
}

interface EscalatedIssue {
  id: string
  type: string
  startTime: Date
  workplace: number
  status: 'escalated'
  escalatedBy: string
  escalatedAt: Date
  notes?: string
  flsNotes?: string
}

export default function AdminPage() {
  const t = useTranslations()
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'workplaces' | 'settings' | 'escalated'>('overview')
  const [escalatedIssues, setEscalatedIssues] = useState<EscalatedIssue[]>([])
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Update current time every second for real-time displays
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Load escalated issues from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('helpd-escalated-issues')
      if (stored) {
        const parsed = JSON.parse(stored).map((issue: any) => ({
          ...issue,
          startTime: new Date(issue.startTime),
          escalatedAt: new Date(issue.escalatedAt)
        }))
        setEscalatedIssues(parsed)
      }
    } catch (err) {
      console.error('Error loading escalated issues:', err)
    }
  }, [])

  // Listen for new escalated issues
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('helpd-escalated-issues')
        if (stored) {
          const parsed = JSON.parse(stored).map((issue: any) => ({
            ...issue,
            startTime: new Date(issue.startTime),
            escalatedAt: new Date(issue.escalatedAt)
          }))
          setEscalatedIssues(parsed)
        }
      } catch (err) {
        console.error('Error updating escalated issues:', err)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const [issueTypes, setIssueTypes] = useState<IssueType[]>([
    {
      id: '1',
      name: t('issueTypes.noMaterials'),
      color: 'bg-red-500',
      icon: '📦',
      category: t('categories.supply'),
      slaMinutes: 30
    },
    {
      id: '2',
      name: t('issueTypes.machineFault'),
      color: 'bg-orange-500',
      icon: '⚙️',
      category: t('categories.technical'),
      slaMinutes: 60
    },
    {
      id: '3',
      name: t('issueTypes.conveyorStop'),
      color: 'bg-yellow-500',
      icon: '🔄',
      category: t('categories.technical'),
      slaMinutes: 45
    },
    {
      id: '4',
      name: t('issueTypes.safetyIssue'),
      color: 'bg-red-600',
      icon: '⚠️',
      category: t('categories.safety'),
      slaMinutes: 15
    },
    {
      id: '5',
      name: t('issueTypes.breakTime'),
      color: 'bg-blue-500',
      icon: '☕',
      category: t('categories.personal'),
      slaMinutes: 120
    },
    {
      id: '6',
      name: t('issueTypes.qualityIssue'),
      color: 'bg-purple-500',
      icon: '🔍',
      category: t('categories.quality'),
      slaMinutes: 90
    }
  ])

  const [workplaces, setWorkplaces] = useState<Workplace[]>(
    Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `${t('admin.station')} ${i + 1}`,
      costPerHour: 150 + Math.random() * 100,
      workerWage: 25 + Math.random() * 10,
      status: 'active' as const
    }))
  )

  // Modal states
  const [showAddIssueType, setShowAddIssueType] = useState(false)
  const [showEditIssueType, setShowEditIssueType] = useState(false)
  const [editingIssueType, setEditingIssueType] = useState<IssueType | null>(null)
  const [newIssueType, setNewIssueType] = useState<Partial<IssueType>>({})

  // Mock data for analytics
  const mockIssues = [
    { type: t('issueTypes.machineFault'), count: 15, duration: 45 },
    { type: t('issueTypes.noMaterials'), count: 8, duration: 30 },
    { type: t('issueTypes.conveyorStop'), count: 12, duration: 25 },
    { type: t('issueTypes.safetyIssue'), count: 3, duration: 15 },
    { type: t('issueTypes.breakTime'), count: 20, duration: 60 }
  ]

  const totalDowntime = mockIssues.reduce((acc, issue) => acc + (issue.count * issue.duration), 0)
  const totalCost = totalDowntime * 2.5 // Mock cost calculation
  const avgResolutionTime = totalDowntime / mockIssues.reduce((acc, issue) => acc + issue.count, 0)

  const addIssueType = () => {
    if (!newIssueType.name || !newIssueType.category) return

    const issueType: IssueType = {
      id: Date.now().toString(),
      name: newIssueType.name,
      color: newIssueType.color || 'bg-gray-500',
      icon: newIssueType.icon || '📋',
      category: newIssueType.category,
      slaMinutes: newIssueType.slaMinutes || 60
    }

    setIssueTypes(prev => [...prev, issueType])
    setNewIssueType({})
    setShowAddIssueType(false)
  }

  const updateIssueType = () => {
    if (!editingIssueType) return

    setIssueTypes(prev => prev.map(issue =>
      issue.id === editingIssueType.id ? editingIssueType : issue
    ))
    setEditingIssueType(null)
    setShowEditIssueType(false)
  }

  const deleteIssueType = (id: string) => {
    setIssueTypes(prev => prev.filter(issue => issue.id !== id))
  }

  const updateWorkplace = (id: number, updates: Partial<Workplace>) => {
    setWorkplaces(prev => prev.map(workplace =>
      workplace.id === id ? { ...workplace, ...updates } : workplace
    ))
  }

  const categories = [
    t('categories.technical'),
    t('categories.supply'),
    t('categories.safety'),
    t('categories.quality'),
    t('categories.personal')
  ]

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / (1000 * 60))
    const seconds = Math.floor((duration % (1000 * 60)) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href={`/${params.locale}`} className="btn-secondary">
              <Home className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.title')}</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          {([
            { id: 'overview', icon: BarChart3, label: t('admin.overview') },
            { id: 'issues', icon: Settings, label: t('admin.issueManagement') },
            { id: 'workplaces', icon: MapPin, label: t('admin.workplaces') },
            { id: 'escalated', icon: AlertTriangle, label: 'Escalated Issues' },
            { id: 'settings', icon: Settings, label: t('admin.settings') }
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{t('admin.totalStations')}</p>
                    <div className="text-2xl font-bold text-blue-600">{workplaces.length}</div>
                  </div>
                  <MapPin className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{t('admin.issueTypes')}</p>
                    <div className="text-2xl font-bold text-green-600">{issueTypes.length}</div>
                  </div>
                  <Settings className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{t('admin.issuesToday')}</p>
                    <div className="text-2xl font-bold text-orange-600">
                      {mockIssues.reduce((acc, issue) => acc + issue.count, 0)}
                    </div>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Escalated Issues</p>
                    <div className="text-2xl font-bold text-red-600">{escalatedIssues.length}</div>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">{t('admin.issuesByCategory')}</h3>
                <div className="space-y-3">
                  {mockIssues.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{issue.type}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">{issue.count}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(issue.count / Math.max(...mockIssues.map(i => i.count))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">{t('admin.costByStation')}</h3>
                <div className="space-y-3">
                  {workplaces.slice(0, 10).map((workplace) => (
                    <div key={workplace.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{workplace.name}</span>
                      <span className="text-sm font-medium">€{workplace.costPerHour.toFixed(0)}/h</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{t('admin.issueManagement')}</h2>
              <button
                onClick={() => setShowAddIssueType(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('admin.addIssueType')}
              </button>
            </div>

            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.type')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.category')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.sla')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issueTypes.map((issueType) => (
                      <tr key={issueType.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{issueType.icon}</span>
                            <span>{issueType.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{issueType.category}</td>
                        <td className="py-3 px-4 text-gray-600">{issueType.slaMinutes} min</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingIssueType(issueType)
                                setShowEditIssueType(true)
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteIssueType(issueType.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'escalated' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Escalated Issues</h2>
              <div className="text-sm text-gray-600">
                {escalatedIssues.length} issue{escalatedIssues.length !== 1 ? 's' : ''} escalated
              </div>
            </div>

            {escalatedIssues.length === 0 ? (
              <div className="card text-center py-12">
                <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Escalated Issues</h3>
                <p className="text-gray-600">Issues escalated by FLS will appear here for admin review.</p>
              </div>
            ) : (
              <div className="card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Issue Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Station</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Started</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Escalated</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Escalated By</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {escalatedIssues.map((issue) => (
                        <tr key={issue.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">⚠️</span>
                              <span className="font-medium">{issue.type}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">Station {issue.workplace}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {issue.startTime.toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {issue.escalatedAt.toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {formatDuration(currentTime - issue.startTime.getTime())}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{issue.escalatedBy}</td>
                          <td className="py-3 px-4 text-gray-600">
                            <div className="max-w-xs">
                              {issue.notes && (
                                <div className="mb-1">
                                  <span className="text-xs text-gray-500">Worker:</span> {issue.notes}
                                </div>
                              )}
                              {issue.flsNotes && (
                                <div>
                                  <span className="text-xs text-gray-500">FLS:</span> {issue.flsNotes}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'workplaces' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">{t('admin.workplaceConfiguration')}</h2>
            <p className="text-sm text-gray-600">{t('admin.showingFirst20')}</p>

            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.station')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.costPerHour')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.workerWage')}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">{t('admin.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workplaces.map((workplace) => (
                      <tr key={workplace.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">{workplace.name}</td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={workplace.costPerHour}
                            onChange={(e) => updateWorkplace(workplace.id, { costPerHour: parseFloat(e.target.value) })}
                            className="w-20 p-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={workplace.workerWage}
                            onChange={(e) => updateWorkplace(workplace.id, { workerWage: parseFloat(e.target.value) })}
                            className="w-20 p-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={workplace.status}
                            onChange={(e) => updateWorkplace(workplace.id, { status: e.target.value as 'active' | 'inactive' })}
                            className="p-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="active">{t('admin.active')}</option>
                            <option value="inactive">{t('admin.inactive')}</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">{t('admin.systemSettings')}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">{t('admin.generalSettings')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.defaultSla')}
                    </label>
                    <input
                      type="number"
                      defaultValue={60}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.offlineWarning')}
                    </label>
                    <input
                      type="number"
                      defaultValue={10}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.dataRetention')}
                    </label>
                    <input
                      type="number"
                      defaultValue={30}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4">{t('admin.costConfiguration')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.defaultCostPerHour')}
                    </label>
                    <input
                      type="number"
                      defaultValue={150}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.defaultWorkerWage')}
                    </label>
                    <input
                      type="number"
                      defaultValue={25}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.overheadPercentage')}
                    </label>
                    <input
                      type="number"
                      defaultValue={15}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="btn-secondary">
                {t('admin.resetToDefaults')}
              </button>
              <button className="btn-primary">
                {t('admin.saveSettings')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Issue Type Modal */}
      {showAddIssueType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('admin.addNewIssueType')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.name')}</label>
                <input
                  type="text"
                  value={newIssueType.name || ''}
                  onChange={(e) => setNewIssueType(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('admin.namePlaceholder')}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.category')}</label>
                <select
                  value={newIssueType.category || ''}
                  onChange={(e) => setNewIssueType(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">{t('admin.selectCategory')}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.slaMinutes')}</label>
                <input
                  type="number"
                  value={newIssueType.slaMinutes || ''}
                  onChange={(e) => setNewIssueType(prev => ({ ...prev, slaMinutes: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.icon')}</label>
                <input
                  type="text"
                  value={newIssueType.icon || ''}
                  onChange={(e) => setNewIssueType(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder={t('admin.iconPlaceholder')}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddIssueType(false)}
                className="btn-secondary flex-1"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={addIssueType}
                className="btn-primary flex-1"
              >
                {t('common.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Issue Type Modal */}
      {showEditIssueType && editingIssueType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('admin.editIssueType')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.name')}</label>
                <input
                  type="text"
                  value={editingIssueType.name}
                  onChange={(e) => setEditingIssueType(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.category')}</label>
                <select
                  value={editingIssueType.category}
                  onChange={(e) => setEditingIssueType(prev => prev ? { ...prev, category: e.target.value } : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.slaMinutes')}</label>
                <input
                  type="number"
                  value={editingIssueType.slaMinutes}
                  onChange={(e) => setEditingIssueType(prev => prev ? { ...prev, slaMinutes: parseInt(e.target.value) } : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditIssueType(false)}
                className="btn-secondary flex-1"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={updateIssueType}
                className="btn-primary flex-1"
              >
                {t('admin.updateIssueType')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
