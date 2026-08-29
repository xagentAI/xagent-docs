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
