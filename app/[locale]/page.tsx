'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Factory,
  Users,
  Shield,
  Timer,
  BarChart3,
  Globe2,
  WifiOff,
  Zap,
  ArrowRight,
  Sparkles,
  Database
} from 'lucide-react'
import { Issue, loadIssues, seedDemoIssues, subscribeIssues, resetIssues } from '@/lib/issues'

export default function HomePage() {
  const t = useTranslations()
  const params = useParams()
  const currentLocale = params.locale as string

  const [issues, setIssues] = useState<Issue[]>([])
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    seedDemoIssues()
    setSeeded(true)
    setIssues(loadIssues())
    return subscribeIssues(() => setIssues(loadIssues()))
  }, [])

  const stats = useMemo(() => {
    const active = issues.filter((i) => i.status === 'active').length
    const escalated = issues.filter((i) => i.status === 'escalated').length
    const resolved = issues.filter((i) => i.status === 'resolved').length
    return { active, escalated, resolved, total: issues.length }
  }, [issues])

  const roles = [
    {
      id: 'worker',
      name: t('roles.worker.name'),
      description: t('roles.worker.description'),
      icon: Factory,
      gradient: 'from-brand-500 to-brand-700',
      href: `/${currentLocale}/worker`
    },
    {
      id: 'fls',
      name: t('roles.fls.name'),
      description: t('roles.fls.description'),
      icon: Users,
      gradient: 'from-emerald-500 to-teal-600',
      href: `/${currentLocale}/fls`
    },
    {
      id: 'admin',
      name: t('roles.admin.name'),
      description: t('roles.admin.description'),
      icon: Shield,
      gradient: 'from-violet-500 to-purple-600',
      href: `/${currentLocale}/admin`
    }
  ]

  const features = [
    { icon: Timer, titleKey: 'home.features.realtime.title', descKey: 'home.features.realtime.desc' },
    { icon: Globe2, titleKey: 'home.features.multilang.title', descKey: 'home.features.multilang.desc' },
    { icon: WifiOff, titleKey: 'home.features.offline.title', descKey: 'home.features.offline.desc' },
    { icon: BarChart3, titleKey: 'home.features.analytics.title', descKey: 'home.features.analytics.desc' },
    { icon: Zap, titleKey: 'home.features.fast.title', descKey: 'home.features.fast.desc' },
    { icon: Shield, titleKey: 'home.features.roles.title', descKey: 'home.features.roles.desc' }
  ]

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-60 bg-grid-slate [background-size:24px_24px]"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="max-w-3xl animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-xs font-medium ring-1 ring-brand-200">
              <Sparkles className="h-3.5 w-3.5" /> {t('home.badge')}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900">
              {t('home.heroTitle')}
            </h1>
            <p className="mt-5 text-lg text-slate-600">{t('home.heroSubtitle')}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/${currentLocale}/worker`} className="btn-primary">
                {t('home.ctaWorker')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/${currentLocale}/fls`} className="btn-secondary">
                {t('home.ctaFls')}
              </Link>
              <Link href={`/${currentLocale}/admin`} className="btn-ghost">
                {t('home.ctaAdmin')}
              </Link>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 text-xs text-slate-500">
              <span className="status-indicator status-green animate-pulse-dot" aria-hidden="true" />
              {t('home.liveDemo')}
            </div>
          </div>

          {/* Live stats row */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <LiveStat label={t('home.stats.active')} value={stats.active} tone="blue" />
            <LiveStat label={t('home.stats.escalated')} value={stats.escalated} tone="amber" />
            <LiveStat label={t('home.stats.resolved')} value={stats.resolved} tone="green" />
            <LiveStat label={t('home.stats.total')} value={stats.total} tone="slate" />
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{t('home.rolesTitle')}</h2>
            <p className="text-slate-600 text-sm mt-1">{t('home.rolesSubtitle')}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {roles.map((role, idx) => {
            const Icon = role.icon
            return (
              <Link
                key={role.id}
                href={role.href}
                className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-slate-200 to-slate-100 hover:from-brand-300 hover:to-brand-500 transition-colors"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="h-full rounded-2xl bg-white p-6 flex flex-col">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${role.gradient} text-white shadow-pop`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">{role.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{role.description}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand-700 group-hover:gap-2 transition-all">
                    {t('home.enter')}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h2 className="text-2xl font-semibold text-slate-900">{t('home.featuresTitle')}</h2>
        <p className="text-slate-600 text-sm mt-1">{t('home.featuresSubtitle')}</p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="card hover:-translate-y-0.5 hover:shadow-pop transition-all"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{t(titleKey)}</h3>
              <p className="text-sm text-slate-600 mt-1">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="card-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{t('home.demoDataTitle')}</h3>
              <p className="text-sm text-slate-600">{t('home.demoDataDesc')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                seedDemoIssues(true)
              }}
            >
              {t('home.seedButton')}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                resetIssues()
              }}
            >
              {t('home.resetButton')}
            </button>
          </div>
        </div>
        {!seeded && <span className="sr-only">initializing</span>}
      </section>
    </div>
  )
}

function LiveStat({
  label,
  value,
  tone
}: {
  label: string
  value: number
  tone: 'blue' | 'green' | 'amber' | 'slate'
}) {
  const toneClass = {
    blue: 'text-brand-700 bg-brand-50',
    green: 'text-emerald-700 bg-emerald-50',
    amber: 'text-amber-700 bg-amber-50',
    slate: 'text-slate-700 bg-slate-100'
  }[tone]
  return (
    <div className="card flex flex-col gap-1">
      <span className={`self-start pill ${toneClass}`}>{label}</span>
      <span className="text-3xl font-semibold tracking-tight text-slate-900">{value}</span>
    </div>
  )
}
