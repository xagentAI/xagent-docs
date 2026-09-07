import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const baseUrl = process.env.DOCS_TEST_BASE_URL || 'http://127.0.0.1:3100'
const routes = JSON.parse(
  readFileSync(new URL('../locale-routes.json', import.meta.url))
)
const request = (path, options = {}) =>
  fetch(new URL(path, baseUrl), {
    redirect: 'manual',
    signal: AbortSignal.timeout(15000),
    ...options
  })

for (const [locale, paths] of Object.entries(routes)) {
  for (const path of paths) {
    const url = `/${locale}${path ? `/${path}` : ''}`
    test(`renders a document, not an error or redirect: ${url}`, async () => {
      const response = await request(url)
      assert.equal(response.status, 200)
      const html = await response.text()
      assert.match(html, new RegExp(`<html[^>]+lang="${locale}"`))
      assert.match(html, /<main\b/)
      assert.match(html, /<h1\b/)
      assert.doesNotMatch(html, /Application error: a server-side exception/)
    })
  }
}

for (const locale of ['en', 'ja', 'ko']) {
  test(`the ${locale} announcement index links to its localized detail page`, async () => {
    const response = await request(`/${locale}/announcement`)
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.match(
      html,
      new RegExp(`href="/${locale}/announcement/token-allocation-vesting"`)
    )
    assert.doesNotMatch(
      html,
      new RegExp(`href="/${locale}/token-allocation-vesting"`)
    )
  })

  test(`the ${locale} brand kit includes the official social banner`, async () => {
    const response = await request(`/${locale}/resources/brand-kit`)
    assert.equal(response.status, 200)
    assert.match(
      await response.text(),
      /\/brand\/x-agent-social-banner-1500x500\.jpeg/
    )
  })
}

for (const [locale, sectionLabel, indexLabel, detailLabel] of [
  [
    'en',
    'Announcements',
    'Latest Updates',
    'XAGT Token Allocation &amp; Vesting'
  ],
  ['ja', 'お知らせ', '最新情報', 'トークン配分およびベスティングスケジュール'],
  ['ko', '공지사항', '최신 공지', '토큰 배분 및 베스팅 일정']
]) {
  test(`the ${locale} announcement navigation exposes the index and detail page`, async () => {
    const response = await request(`/${locale}/announcement`)
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.match(html, new RegExp(`>${sectionLabel}<`))
    assert.match(html, new RegExp(`>${indexLabel}<`))
    assert.match(html, new RegExp(`>${detailLabel}<`))
  })
}

for (const locale of ['en', 'ja', 'ko']) {
  test(`the legacy ${locale} token allocation URL redirects to the announcement`, async () => {
    const response = await request(`/${locale}/token-allocation-vesting`)
    assert.equal(response.status, 308)
    assert.equal(
      new URL(response.headers.get('location'), baseUrl).pathname,
      `/${locale}/announcement/token-allocation-vesting`
    )
  })

  test(`the legacy ${locale} security URL redirects to the consolidated security page`, async () => {
    const response = await request(`/${locale}/resources/security`)
    assert.equal(response.status, 308)
    assert.equal(
      new URL(response.headers.get('location'), baseUrl).pathname,
      `/${locale}/security`
    )
  })
}

for (const path of [
  '/en/not-a-real-page',
  '/en/resources/media',
  '/en/token/governance',
  '/en/token/utility',
  '/missing-asset.png',
  '/audits/missing.pdf'
]) {
  test(`missing content returns 404 instead of crashing: ${path}`, async () => {
    const response = await request(path)
    assert.equal(response.status, 404)
  })
}

test('favicon request resolves to an image without a server error', async () => {
  const response = await request('/favicon.ico', { redirect: 'follow' })
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /^image\//)
})

test('search JavaScript is built and served', async () => {
  const response = await request('/_pagefind/pagefind.js')
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /javascript/)
})

for (const locale of ['en', 'ja', 'ko']) {
  test(`new or changed ${locale} documents display an update timestamp`, async () => {
    const response = await request(`/${locale}/changelog`)
    assert.ok(
      /<time\b[^>]*dateTime="\d{4}-\d{2}-\d{2}T/i.test(await response.text()),
      'document update timestamp is missing'
    )
  })
}

for (const [cookie, expected] of [
  ['NEXT_LOCALE=ko', '/ko/litepaper'],
  ['NEXT_LOCALE=ja', '/ja/litepaper'],
  ['NEXT_LOCALE=unsupported', '/en/litepaper'],
  ['NEXT_LOCALE=//example.com', '/en/litepaper']
]) {
  test(`locale cookie is constrained to supported languages: ${cookie}`, async () => {
    const response = await request('/litepaper', {
      headers: { cookie, 'accept-language': 'en' }
    })
    assert.equal(response.status, 307)
    const destination = new URL(response.headers.get('location'), baseUrl)
    assert.equal(destination.origin, new URL(baseUrl).origin)
    assert.equal(destination.pathname, expected)
  })
}

test('audit download serves the exact original PDF as an attachment', async () => {
  const response = await request(
    '/audits/PeckShield-Audit-Report-ERC20-XAgentToken-v1.0.pdf'
  )
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('content-type'), 'application/pdf')
  assert.match(response.headers.get('content-disposition'), /^attachment;/)
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  const data = Buffer.from(await response.arrayBuffer())
  assert.equal(
    createHash('sha256').update(data).digest('hex'),
    'd2b40ecdf9d604a81e41313aa4457a4819df6c4915b6ee051dbf09d575a3680b'
  )
})

for (const path of [
  '/brand/x-agent-logo-pack.zip',
  '/brand/x-agent-social-banner-1500x500.jpeg',
  '/brand/x-agent-avatar-green.svg',
  '/brand/x-agent-avatar-white.svg',
  '/brand/x-agent-avatar-dark-green.svg',
  '/brand/x-agent-avatar-dark-white.svg',
  '/brand/x-agent-horizontal-light.svg',
  '/brand/x-agent-horizontal-green.svg',
  '/brand/x-agent-horizontal-white.svg',
  '/brand/x-agent-horizontal-dark-green.svg',
  '/brand/x-agent-horizontal-dark-white.svg',
  '/brand/x-agent-stacked-light.svg',
  '/brand/x-agent-stacked-green.svg',
  '/brand/x-agent-stacked-white.svg',
  '/brand/x-agent-stacked-dark-green.svg',
  '/brand/x-agent-stacked-dark-white.svg'
]) {
  test(`brand kit asset is published: ${path}`, async () => {
    const response = await request(path)
    assert.equal(response.status, 200)
    assert.ok((await response.arrayBuffer()).byteLength > 0)
  })
}
