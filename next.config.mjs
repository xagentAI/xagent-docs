import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
  contentDirBasePath: '/'
})

export default withNextra({
  reactStrictMode: true,
  turbopack: {
    // Pin the workspace root to this project (a package-lock.json also exists
    // in the home dir, which would otherwise be picked as the root).
    root: import.meta.dirname
  },
  i18n: {
    locales: ['en', 'ko', 'ja'],
    defaultLocale: 'en'
  }
})
