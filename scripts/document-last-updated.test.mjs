import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import {
  contentPathToRoute,
  getDocumentLastUpdatedMap
} from './document-last-updated.mjs'

const git = (root, args, env = {}) =>
  execFileSync('git', args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: 'ignore'
  })

test('maps localized MDX files to document routes', () => {
  assert.equal(contentPathToRoute('content/en/index.mdx'), '/en')
  assert.equal(contentPathToRoute('content/ko/litepaper.mdx'), '/ko/litepaper')
  assert.equal(
    contentPathToRoute('content/en/resources/brand-kit.mdx'),
    '/en/resources/brand-kit'
  )
})

test('uses Git time for clean files and mtime for local edits', () => {
  const root = mkdtempSync(join(tmpdir(), 'xagent-docs-updated-'))
  const contentDirectory = join(root, 'content/en')
  const documentPath = join(contentDirectory, 'litepaper.mdx')
  mkdirSync(contentDirectory, { recursive: true })
  writeFileSync(documentPath, '# Litepaper\n')

  git(root, ['init'])
  git(root, ['config', 'user.email', 'test@example.com'])
  git(root, ['config', 'user.name', 'Test User'])
  git(root, ['add', '.'])
  git(root, ['commit', '-m', 'initial'], {
    GIT_AUTHOR_DATE: '2026-08-20T12:00:00Z',
    GIT_COMMITTER_DATE: '2026-08-20T12:00:00Z'
  })

  assert.equal(
    getDocumentLastUpdatedMap(root)['/en/litepaper'],
    '2026-08-20T12:00:00Z'
  )

  writeFileSync(documentPath, '# Updated Litepaper\n')
  const modifiedAt = new Date('2026-08-27T06:30:00Z')
  utimesSync(documentPath, modifiedAt, modifiedAt)
  assert.equal(
    getDocumentLastUpdatedMap(root)['/en/litepaper'],
    modifiedAt.toISOString()
  )
})
