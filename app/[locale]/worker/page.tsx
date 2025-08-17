'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Home, AlertTriangle, Clock, MapPin, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

interface Issue {
  id: string
  type: string
  startTime: Date
  endTime?: Date
  duration?: number
  notes?: string
  workplace: number
  status: 'active' | 'resolved' | 'escalated'
}

interface IssueType {
  id: string
  name: string
  color: string
  icon: string
}

export default function WorkerPage() {
  const t = useTranslations()
  const params = useParams()
  const [workplace, setWorkplace] = useState<number>(1)
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null)
  const [issueHistory, setIssueHistory] = useState<Issue[]>([])
  const [showWorkplaceModal, setShowWorkplaceModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [notes, setNotes] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'unstable' | 'offline'>('connected')
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Update current time every second for real-time timer display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Memoize issue types to prevent unnecessary re-renders
  const issueTypes: IssueType[] = useMemo(() => [
    { id: 'no-materials', name: t('issueTypes.noMaterials'), color: 'bg-red-500', icon: '📦' },
    { id: 'machine-fault', name: t('issueTypes.machineFault'), color: 'bg-orange-500', icon: '⚙️' },
    { id: 'conveyor-stop', name: t('issueTypes.conveyorStop'), color: 'bg-yellow-500', icon: '🔄' },
    { id: 'safety-issue', name: t('issueTypes.safetyIssue'), color: 'bg-red-600', icon: '⚠️' },
    { id: 'break-time', name: t('issueTypes.breakTime'), color: 'bg-blue-500', icon: '☕' },
    { id: 'quality-issue', name: t('issueTypes.qualityIssue'), color: 'bg-purple-500', icon: '🔍' }
  ], [t])

  // Simulate connection status changes
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses: Array<'connected' | 'unstable' | 'offline'> = ['connected', 'unstable', 'offline']
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      setConnectionStatus(randomStatus)
    }, 10000) // Change every 10 seconds for demo

    return () => clearInterval(interval)
  }, [])

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedWorkplace = localStorage.getItem('helpd-workplace')
      const savedIssues = localStorage.getItem('helpd-issue-history')
      
      if (savedWorkplace) {
        setWorkplace(parseInt(savedWorkplace))
      }
      
      if (savedIssues) {
        const parsedIssues = JSON.parse(savedIssues).map((issue: any) => ({
          ...issue,
          startTime: new Date(issue.startTime),
          endTime: issue.endTime ? new Date(issue.endTime) : undefined
        }))
        setIssueHistory(parsedIssues)
        
        // Restore active issue if it exists
        const activeIssue = parsedIssues.find((issue: Issue) => issue.status === 'active')
        if (activeIssue) {
          setActiveIssue(activeIssue)
        }
      }
    } catch (err) {
      console.error('Error loading saved data:', err)
      setError('Failed to load saved data')
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('helpd-workplace', workplace.toString())
    } catch (err) {
      console.error('Error saving workplace:', err)
    }
  }, [workplace])

  useEffect(() => {
    try {
      localStorage.setItem('helpd-issue-history', JSON.stringify(issueHistory))
    } catch (err) {
      console.error('Error saving issue history:', err)
    }
  }, [issueHistory])

  const startIssue = useCallback((issueType: IssueType) => {
    if (activeIssue) {
      setError('You already have an active issue. Please stop the current timer first.')
      return
    }

    const newIssue: Issue = {
      id: Date.now().toString(),
      type: issueType.name,
      startTime: new Date(),
      workplace,
      status: 'active'
    }

    setActiveIssue(newIssue)
    setIssueHistory(prev => [newIssue, ...prev])
    setError(null)
  }, [activeIssue, workplace])

  const stopIssue = useCallback(() => {
    if (!activeIssue) return

    const updatedIssue: Issue = {
      ...activeIssue,
      endTime: new Date(),
      duration: Date.now() - activeIssue.startTime.getTime(),
      status: 'resolved'
    }

    setIssueHistory(prev => prev.map(issue => 
      issue.id === activeIssue.id ? updatedIssue : issue
    ))
    setActiveIssue(null)
    setError(null)
  }, [activeIssue])

  const requestHelp = useCallback(() => {
    if (!activeIssue) {
      setError('No active issue to request help for')
      return
    }
    
    // Simulate help request
    alert('Help request sent to FLS!')
    setError(null)
  }, [activeIssue])

  const addNotes = useCallback(() => {
    if (!activeIssue || !notes.trim()) {
      setError('Please enter some notes before saving')
      return
    }

    const updatedIssue: Issue = {
      ...activeIssue,
      notes: notes
    }

    setActiveIssue(updatedIssue)
    setIssueHistory(prev => prev.map(issue => 
      issue.id === activeIssue.id ? updatedIssue : issue
    ))
    setNotes('')
    setShowNotesModal(false)
    setError(null)
  }, [activeIssue, notes])

  const formatDuration = useCallback((duration: number) => {
    const minutes = Math.floor(duration / (1000 * 60))
    const seconds = Math.floor((duration % (1000 * 60)) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'connected': return 'status-green'
      case 'unstable': return 'status-yellow'
      case 'offline': return 'status-red'
      default: return 'status-green'
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Error Banner */}
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-3 text-center z-50">
          <div className="flex items-center justify-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
            <button 
              onClick={clearError}
              className="ml-2 text-white hover:text-red-100"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href={`/${params.locale}`} className="btn-secondary" aria-label="Go to home page">
              <Home className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('worker.title')}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{t('worker.station')} {workplace}</span>
                <button
                  onClick={() => setShowWorkplaceModal(true)}
                  className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  {t('worker.selectWorkplace')}
                </button>
              </div>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`status-indicator ${getStatusColor(connectionStatus)}`}></div>
            <span className="text-sm text-gray-600">
              {t(`worker.connectionStatus.${connectionStatus}`)}
            </span>
          </div>
        </div>

        {/* Active Issue Display */}
        {activeIssue && (
          <div className="card mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">{t('worker.activeIssue')}</h3>
                <p className="text-yellow-700">{activeIssue.type}</p>
                <p className="text-sm text-yellow-600">
                  {t('worker.startedAt')} {activeIssue.startTime.toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-800">
                  <Clock className="w-6 h-6 inline mr-2" />
                  {formatDuration(currentTime - activeIssue.startTime.getTime())}
                </div>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => setShowNotesModal(true)}
                    className="btn-secondary text-sm"
                    aria-label="Add notes to current issue"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {t('worker.addNotes')}
                  </button>
                  <button
                    onClick={requestHelp}
                    className="btn-primary text-sm"
                    aria-label="Request help from FLS"
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {t('worker.requestHelp')}
                  </button>
                  <button
                    onClick={stopIssue}
                    className="btn-danger text-sm"
                    aria-label="Stop current timer"
                  >
                    {t('worker.stopTimer')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Issue Buttons */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('worker.reportIssue')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {issueTypes.map((issueType) => (
              <button
                key={issueType.id}
                onClick={() => startIssue(issueType)}
                disabled={!!activeIssue}
                className={`${issueType.color} text-white p-4 rounded-lg text-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                aria-label={`Report ${issueType.name} issue`}
              >
                <div className="text-2xl mb-2" role="img" aria-hidden="true">{issueType.icon}</div>
                <div className="font-medium">{issueType.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Issues */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">{t('worker.recentIssues')}</h2>
          {issueHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('worker.noIssues')}</p>
          ) : (
            <div className="space-y-3">
              {issueHistory.slice(0, 5).map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{issue.type}</p>
                    <p className="text-sm text-gray-600">
                      {issue.startTime.toLocaleTimeString()} - {issue.workplace}
                    </p>
                    {issue.notes && (
                      <p className="text-sm text-gray-500 mt-1">{issue.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      issue.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                      issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {t(`status.${issue.status}`)}
                    </span>
                    {issue.duration && (
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDuration(issue.duration)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Workplace Selection Modal */}
      {showWorkplaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('worker.selectWorkplace')}</h3>
            <div className="grid grid-cols-5 gap-2 mb-4 max-h-60 overflow-y-auto">
              {Array.from({ length: 100 }, (_, i) => i + 1).map((station) => (
                <button
                  key={station}
                  onClick={() => {
                    setWorkplace(station)
                    setShowWorkplaceModal(false)
                  }}
                  className={`p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    workplace === station
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  aria-label={`Select station ${station}`}
                >
                  {station}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowWorkplaceModal(false)}
              className="btn-secondary w-full"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('worker.notes')}</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('worker.describeIssue')}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Issue description"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowNotesModal(false)}
                className="btn-secondary flex-1"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={addNotes}
                className="btn-primary flex-1"
              >
                {t('worker.saveNotes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
