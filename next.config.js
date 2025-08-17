const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

const withNextIntl = require('next-intl/plugin')()

module.exports = withNextIntl(withPWA({
  // Clean configuration without deprecated options
}))
