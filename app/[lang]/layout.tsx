import type { Metadata } from 'next'
import { Footer, Layout, LocaleSwitch, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import type { FC, ReactNode } from 'react'
import 'nextra-theme-docs/style.css'

export const metadata: Metadata = {
  title: {
    absolute: '',
    template: '%s | X-Agent Docs'
  },
  description:
    'X-Agent documentation — build, run, and monetize custom AI Agents with pure natural language. Speak to Build. Share to Connect.'
}

type LayoutProps = Readonly<{
  children: ReactNode
  params: Promise<{ lang: string }>
}>

const RootLayout: FC<LayoutProps> = async ({ children, params }) => {
  const { lang } = await params
  const pageMap = await getPageMap(`/${lang}`)

  const navbar = (
    <Navbar
      logo={
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img
            src="/logo.png"
            alt="X-Agent"
            width={28}
            height={28}
            style={{ borderRadius: '6px' }}
          />
          <b>X-Agent</b>
        </span>
      }
      projectLink="https://github.com/xagentAI/xagent-docs"
    >
      <LocaleSwitch lite />
    </Navbar>
  )

  const footer = (
    <Footer>
      X-Agent Docs · {new Date().getFullYear()} © X-Agent
    </Footer>
  )

  return (
    <html lang={lang} dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          darkMode={false}
          docsRepositoryBase="https://github.com/xagentAI/xagent-docs/tree/main"
          i18n={[
            { locale: 'en', name: 'English' },
            { locale: 'ko', name: '한국어' },
            { locale: 'ja', name: '日本語' }
          ]}
          pageMap={pageMap}
          sidebar={{ defaultMenuCollapseLevel: 1, autoCollapse: true }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}

export default RootLayout
