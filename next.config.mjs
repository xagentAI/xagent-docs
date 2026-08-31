import nextra from 'nextra'
import localeRoutes from './locale-routes.json' with { type: 'json' }
import { getDocumentLastUpdatedMap } from './scripts/document-last-updated.mjs'

const documentLastUpdated = getDocumentLastUpdatedMap()

const withNextra = nextra({
  defaultShowCopyCode: true,
  contentDirBasePath: '/'
})

export default withNextra({
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/logo.png',
        permanent: true,
        locale: false
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/audits/PeckShield-Audit-Report-ERC20-XAgentToken-v1.0.pdf',
        locale: false,
        headers: [
          {
            key: 'Content-Disposition',
            value:
              'attachment; filename="PeckShield-Audit-Report-ERC20-XAgentToken-v1.0.pdf"'
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' }
        ]
      }
    ]
  },
  env: {
    NEXT_PUBLIC_DOCUMENT_LAST_UPDATED: JSON.stringify(documentLastUpdated)
  },
  turbopack: {
    // Pin the workspace root to this project (a package-lock.json also exists
    // in the home dir, which would otherwise be picked as the root).
    root: import.meta.dirname
  },
  i18n: {
    locales: Object.keys(localeRoutes),
    defaultLocale: 'en'
  }
})
