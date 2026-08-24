import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const projectRoot = path.resolve(import.meta.dirname, '..')
const routesFile = path.join(projectRoot, 'locale-routes.json')
const configuredRoutes = JSON.parse(await readFile(routesFile, 'utf8'))

async function collectRoutes(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true })
  const routes = []

  for (const entry of entries) {
    const relativePath = path.posix.join(prefix, entry.name)
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      routes.push(...(await collectRoutes(absolutePath, relativePath)))
    } else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
      const route = relativePath.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '')
      routes.push(route)
    }
  }

  return routes.sort()
}

const contentLocales = (await readdir(path.join(projectRoot, 'content'), {
  withFileTypes: true
}))
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort()

assert.deepEqual(
  contentLocales,
  Object.keys(configuredRoutes).sort(),
  'locale-routes.json locales are out of sync with content locale directories'
)

for (const [locale, expectedRoutes] of Object.entries(configuredRoutes)) {
  const contentDirectory = path.join(projectRoot, 'content', locale)
  const actualRoutes = await collectRoutes(contentDirectory)

  assert.deepEqual(
    actualRoutes,
    [...expectedRoutes].sort(),
    `locale-routes.json is out of sync with content/${locale}`
  )
}

console.log('Locale route manifest matches the content tree.')
