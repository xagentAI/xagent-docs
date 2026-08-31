import { execFileSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const runGit = (root, args) => {
  try {
    return execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()
  } catch {
    return ''
  }
}

const listMdxFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return listMdxFiles(path)
    return entry.isFile() && entry.name.endsWith('.mdx') ? [path] : []
  })

export const contentPathToRoute = (contentPath) => {
  const normalized = contentPath.replaceAll('\\', '/')
  const match = normalized.match(/^content\/([^/]+)\/(.+)\.mdx$/)
  if (!match) return undefined

  const [, locale, pagePath] = match
  const slug = pagePath === 'index' ? '' : pagePath.replace(/\/index$/, '')
  return `/${locale}${slug ? `/${slug}` : ''}`
}

export const getDocumentLastUpdatedMap = (root = process.cwd()) => {
  const contentDirectory = join(root, 'content')
  const timestamps = {}

  for (const absolutePath of listMdxFiles(contentDirectory)) {
    const contentPath = relative(root, absolutePath).replaceAll('\\', '/')
    const route = contentPathToRoute(contentPath)
    if (!route) continue

    const isDirty = Boolean(
      runGit(root, ['status', '--porcelain', '--', contentPath])
    )
    const committedAt = isDirty
      ? ''
      : runGit(root, ['log', '-1', '--format=%cI', '--', contentPath])

    timestamps[route] =
      committedAt || statSync(absolutePath).mtime.toISOString()
  }

  return timestamps
}
