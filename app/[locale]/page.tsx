'use client'

import { Factory, Users, Shield } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

export default function HomePage() {
  const t = useTranslations()
  const params = useParams()
  const currentLocale = params.locale as string

  const roles = [
    {
      id: 'worker',
      name: t('roles.worker.name'),
      description: t('roles.worker.description'),
      icon: Factory,
      color: 'bg-blue-500',
      href: `/${currentLocale}/worker`
    },
    {
      id: 'fls',
      name: t('roles.fls.name'),
      description: t('roles.fls.description'),
      icon: Users,
      color: 'bg-green-500',
      href: `/${currentLocale}/fls`
    },
    {
      id: 'admin',
      name: t('roles.admin.name'),
      description: t('roles.admin.description'),
      icon: Shield,
      color: 'bg-purple-500',
      href: `/${currentLocale}/admin`
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('app.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('app.subtitle')}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {t('app.selectRole')}
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const IconComponent = role.icon
            return (
              <Link key={role.id} href={role.href}>
                <div
                  className={`${role.color} p-8 rounded-2xl text-white text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                >
                  <IconComponent className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">{role.name}</h2>
                  <p className="text-blue-100">{role.description}</p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Status Indicator */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <div className="status-indicator status-green"></div>
            <span className="text-sm text-gray-600">{t('app.onlineMode')}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>{t('app.testVersion')}</p>
          <p>{t('app.clickToTest')}</p>
        </div>
      </div>
    </div>
  )
}
