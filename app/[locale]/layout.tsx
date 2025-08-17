import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import LanguageSwitcher from '@/components/LanguageSwitcher'

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
      <div className="min-h-screen bg-gray-50">
        {/* Header with language switcher */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">HelpD</h1>
              </div>
              <LanguageSwitcher currentLocale={locale} />
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main>
          {children}
        </main>
      </div>
    </NextIntlClientProvider>
  )
}
