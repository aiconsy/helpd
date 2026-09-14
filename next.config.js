const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

// next-intl v4: request config moved to `i18n/request.ts` (was `i18n.ts` at the root).
const withNextIntl = require('next-intl/plugin')('./i18n/request.ts')

module.exports = withNextIntl(withPWA({
  // Clean configuration without deprecated options
}))
