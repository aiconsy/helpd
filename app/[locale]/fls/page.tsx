'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Home, AlertTriangle, CheckCircle, Clock, MapPin, Camera, TrendingUp, Search } from 'lucide-react'
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
  escalatedBy?: string
  escalatedAt?: Date
  flsNotes?: string
  photos?: string[]
}

export default function FLSPage() {
  const t = useTranslations()
  const params = useParams()
  const [issues, setIssues] = useState<Issue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [flsNotes, setFlsNotes] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'escalated' | 'resolved'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(Date.now())

  const loadIssuesFromStorage = useCallback(() => {
    try {
      const storedIssues = localStorage.getItem('helpd-issue-history')
      if (!storedIssues) {
        setIssues([])
        setIsLoading(false)
        return
      }

      const parsedIssues: Issue[] = JSON.parse(storedIssues).map((issue: any) => ({
        ...issue,
        startTime: new Date(issue.startTime),
        endTime: issue.endTime ? new Date(issue.endTime) : undefined,
        escalatedAt: issue.escalatedAt ? new Date(issue.escalatedAt) : undefined
      }))

      // Newest first keeps active operations at the top.
      parsedIssues.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      setIssues(parsedIssues)
      setIsLoading(false)
    } catch (err) {
      console.error('Error loading issues from storage:', err)
      setError('Failed to load issues data')
      setIsLoading(false)
    }
  }, [])

  // Update current time every second for real-time timer display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Load real worker issues and keep in sync across tabs.
  useEffect(() => {
    loadIssuesFromStorage()
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'helpd-issue-history') {
        loadIssuesFromStorage()
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [loadIssuesFromStorage])

  // Memoize filtered issues for performance
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesStatus = filterStatus === 'all' || issue.status === filterStatus
      const matchesSearch = searchTerm === '' || 
        issue.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.workplace.toString().includes(searchTerm)
      
      return matchesStatus && matchesSearch
    })
  }, [issues, filterStatus, searchTerm])

  // Memoize statistics for performance
  const stats = useMemo(() => {
    const activeCount = issues.filter(i => i.status === 'active').length
    const escalatedCount = issues.filter(i => i.status === 'escalated').length
    const resolvedCount = issues.filter(i => i.status === 'resolved').length
    const totalDuration = issues.filter(i => i.status === 'resolved').reduce((acc: number, issue) => 
      acc + (issue.duration || 0), 0)
    
    return {
      active: activeCount,
      escalated: escalatedCount,
      resolved: resolvedCount,
      totalDowntime: (totalDuration / (1000 * 60 * 60)).toFixed(1)
    }
  }, [issues])

  const resolveIssue = useCallback((issueId: string) => {
    try {
      setIssues(prev => {
        const updated = prev.map(issue =>
          issue.id === issueId
            ? { ...issue, status: 'resolved' as const, endTime: new Date(), duration: Date.now() - issue.startTime.getTime() }
            : issue
        )
        localStorage.setItem('helpd-issue-history', JSON.stringify(updated))
        return updated
      })
      setError(null)
    } catch (err) {
      console.error('Error resolving issue:', err)
      setError('Failed to resolve issue')
    }
  }, [])

  const escalateIssue = useCallback((issueId: string) => {
    try {
      const issue = issues.find(i => i.id === issueId)
      if (!issue) return

      const escalatedIssue: Issue = {
        ...issue,
        status: 'escalated',
        escalatedBy: 'FLS User',
        escalatedAt: new Date()
      }

      setIssues(prev => {
        const updated = prev.map(i => i.id === issueId ? escalatedIssue : i)
        localStorage.setItem('helpd-issue-history', JSON.stringify(updated))
        return updated
      })
      
      // Store escalated issue in localStorage for admin access
      try {
        const escalatedIssues = JSON.parse(localStorage.getItem('helpd-escalated-issues') || '[]')
        escalatedIssues.push(escalatedIssue)
        localStorage.setItem('helpd-escalated-issues', JSON.stringify(escalatedIssues))
      } catch (err) {
        console.error('Error storing escalated issue:', err)
      }

      setError(null)
    } catch (err) {
      console.error('Error escalating issue:', err)
      setError('Failed to escalate issue')
    }
  }, [issues])

  const addFlsNotes = useCallback(() => {
    if (!selectedIssue || !flsNotes.trim()) {
      setError('Please enter some notes before saving')
      return
    }

    try {
      setIssues(prev => {
        const updated = prev.map(issue =>
          issue.id === selectedIssue.id
            ? { ...issue, flsNotes: flsNotes }
            : issue
        )
        localStorage.setItem('helpd-issue-history', JSON.stringify(updated))
        return updated
      })
      setFlsNotes('')
      setError(null)
    } catch (err) {
      console.error('Error adding FLS notes:', err)
      setError('Failed to save notes')
    }
  }, [selectedIssue, flsNotes])

  const takePhoto = useCallback(() => {
    // Simulate photo functionality
    alert(t('fls.cameraFunctionality'))
  }, [t])

  const formatDuration = useCallback((duration: number) => {
    const minutes = Math.floor(duration / (1000 * 60))
    const seconds = Math.floor((duration % (1000 * 60)) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading issues...</p>
        </div>
      </div>
    )
  }

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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href={`/${params.locale}`} className="btn-secondary" aria-label="Go to home page">
              <Home className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{t('fls.title')}</h1>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('fls.activeIssues')}</p>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.active}
                </div>
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('fls.escalated')}</p>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.escalated}
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('fls.resolvedToday')}</p>
                <div className="text-2xl font-bold text-green-600">
                  {stats.resolved}
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('fls.totalDowntime')}</p>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalDowntime}h
                </div>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('fls.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search issues"
              />
            </div>
            
            <div className="flex space-x-2">
              {(['all', 'active', 'escalated', 'resolved'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    filterStatus === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label={`Filter by ${t(`filters.${status}`)}`}
                >
                  {t(`filters.${status}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">{t('fls.issuesOverview')}</h2>
          
          {filteredIssues.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('fls.noIssuesFound')}</p>
          ) : (
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => {
                    setSelectedIssue(issue)
                    setShowIssueModal(true)
                  }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedIssue(issue)
                      setShowIssueModal(true)
                    }
                  }}
                  role="button"
                  aria-label={`View details for ${issue.type} at station ${issue.workplace}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      issue.status === 'active' ? 'bg-blue-500' :
                      issue.status === 'resolved' ? 'bg-green-500' : 'bg-orange-500'
                    }`} aria-hidden="true"></div>
                    <div>
                      <p className="font-medium">{issue.type}</p>
                      <p className="text-sm text-gray-600">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        {t('worker.station')} {issue.workplace} • {issue.startTime.toLocaleTimeString()}
                      </p>
                      {issue.notes && (
                        <p className="text-sm text-gray-500 mt-1">{issue.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {issue.status === 'active' ? (
                      <p className="text-sm text-gray-600">
                        {formatDuration(currentTime - issue.startTime.getTime())}
                      </p>
                    ) : issue.duration ? (
                      <p className="text-sm text-gray-600">
                        {formatDuration(issue.duration)}
                      </p>
                    ) : null}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      issue.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {t(`status.${issue.status}`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Issue Details Modal */}
      {showIssueModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('fls.issueDetails')}</h3>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedIssue.type}</p>
                <p className="text-sm text-gray-600">
                  {t('worker.station')} {selectedIssue.workplace} • {t('fls.started')} {selectedIssue.startTime.toLocaleTimeString()}
                </p>
              </div>
              
              {selectedIssue.notes && (
                <div>
                  <p className="font-medium text-sm text-gray-700">{t('fls.workerNotes')}</p>
                  <p className="text-sm text-gray-600">{selectedIssue.notes}</p>
                </div>
              )}
              
              {selectedIssue.flsNotes && (
                <div>
                  <p className="font-medium text-sm text-gray-700">{t('fls.flsNotes')}</p>
                  <p className="text-sm text-gray-600">{selectedIssue.flsNotes}</p>
                </div>
              )}
              
              <div>
                <p className="font-medium text-sm text-gray-700">{t('fls.flsNotes')}</p>
                <textarea
                  value={flsNotes}
                  onChange={(e) => setFlsNotes(e.target.value)}
                  placeholder={t('fls.addYourNotes')}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Add FLS notes"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={takePhoto}
                  className="btn-secondary"
                  aria-label="Take photo of issue"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {t('fls.takePhoto')}
                </button>
                {selectedIssue.status === 'active' && (
                  <button
                    onClick={() => escalateIssue(selectedIssue.id)}
                    className="btn-secondary"
                    aria-label="Escalate issue to administrator"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {t('fls.escalateToAdmin')}
                  </button>
                )}
                <button
                  onClick={addFlsNotes}
                  className="btn-primary"
                  aria-label="Save FLS notes"
                >
                  {t('fls.saveNotes')}
                </button>
                {selectedIssue.status === 'active' && (
                  <button
                    onClick={() => {
                      resolveIssue(selectedIssue.id)
                      setShowIssueModal(false)
                    }}
                    className="btn-primary"
                    aria-label="Resolve this issue"
                  >
                    {t('fls.resolveIssue')}
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
