import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { notFound } from 'next/navigation'
import type { FC } from 'react'
import { useMDXComponents as getMDXComponents } from '../../../mdx-components'
import localeRoutes from '../../../locale-routes.json'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

type PageProps = Readonly<{
  params: Promise<{
    mdxPath?: string[]
    lang: string
  }>
}>

const timestamps = JSON.parse(
  process.env.NEXT_PUBLIC_DOCUMENT_LAST_UPDATED ?? '{}'
) as Record<string, string>

function validateRoute(lang: string, mdxPath: string[] = []) {
  const routes: Record<string, string[]> = localeRoutes
  const slug = mdxPath.join('/')
  if (!Object.hasOwn(routes, lang) || !routes[lang].includes(slug)) notFound()
  return `/${lang}${slug ? `/${slug}` : ''}`
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params
  validateRoute(params.lang, params.mdxPath)
  const { metadata } = await importPage(params.mdxPath, params.lang)
  return metadata
}

const Wrapper = getMDXComponents().wrapper

const Page: FC<PageProps> = async (props) => {
  const params = await props.params
  const route = validateRoute(params.lang, params.mdxPath)
  const result = await importPage(params.mdxPath, params.lang)
  const { default: MDXContent, toc, metadata, sourceCode } = result
  return (
    <Wrapper
      toc={toc}
      metadata={{
        ...metadata,
        timestamp: timestamps[route] ?? metadata.timestamp
      }}
      sourceCode={sourceCode}
    >
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}

export default Page
