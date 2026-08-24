import { proxy as nextraLocaleProxy } from 'nextra/locales'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import localeRoutes from './locale-routes.json'

const englishRoutes = new Set(localeRoutes.en)
const localizedRoutes = new Map<string, Set<string>>(
  Object.entries(localeRoutes)
    .filter(([locale]) => locale !== 'en')
    .map(([locale, routes]) => [locale, new Set(routes)])
)

export function proxy(request: NextRequest) {
  const [locale = '', ...routeSegments] = request.nextUrl.pathname
    .split('/')
    .filter(Boolean)
  const localizedRoute = routeSegments.join('/')

  const availableRoutes = localizedRoutes.get(locale)

  if (
    availableRoutes &&
    englishRoutes.has(localizedRoute) &&
    !availableRoutes.has(localizedRoute)
  ) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}`
    url.search = ''

    const response = NextResponse.redirect(url)
    response.cookies.set('NEXT_LOCALE', locale)
    return response
  }

  return nextraLocaleProxy(request)
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    // Ignore /api, /_next, /_pagefind, and any path with a file extension (e.g. /logo.png)
    '/((?!api|_next|_pagefind|.*\\..*).*)'
  ]
}
