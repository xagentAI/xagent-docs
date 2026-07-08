export { proxy } from 'nextra/locales'

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    // Ignore /api, /_next, /_pagefind, and any path with a file extension (e.g. /logo.png)
    '/((?!api|_next|_pagefind|.*\\..*).*)'
  ]
}
