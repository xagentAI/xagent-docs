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

for (const path of [
  '/en/not-a-real-page',
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

for (const locale of ['ja', 'ko']) {
  test(`untranslated ${locale} routes keep their documented fallback`, async () => {
    const response = await request(`/${locale}/resources/faq`)
    assert.equal(response.status, 307)
    assert.equal(
      new URL(response.headers.get('location'), baseUrl).pathname,
      `/${locale}`
    )
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
