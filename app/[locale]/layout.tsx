import Link from 'next/link'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { Activity } from 'lucide-react'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: LocaleLayoutProps) {
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link
                href={`/${locale}`}
                className="flex items-center gap-2 group"
                aria-label="HelpD home"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm group-hover:shadow-pop transition-shadow">
                  <Activity className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <div className="text-base font-semibold text-slate-900">HelpD</div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">Factory Support</div>
                </div>
              </Link>
              <LanguageSwitcher currentLocale={locale} />
            </div>
          </div>
        </header>

        <main className="pb-16">{children}</main>

        <footer className="border-t border-slate-200/70 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>HelpD · Demo build</span>
            <span>Built with Next.js · next-intl · Tailwind</span>
          </div>
        </footer>
      </div>
    </NextIntlClientProvider>
  )
}
