'use client'

import { LastUpdated } from 'nextra-theme-docs'
import { usePathname } from 'next/navigation'

type DocumentLastUpdatedProps = Readonly<{
  date?: Date
}>

const timestamps = JSON.parse(
  process.env.NEXT_PUBLIC_DOCUMENT_LAST_UPDATED ?? '{}'
) as Record<string, string>

const labels: Record<string, string> = {
  en: 'Last updated on',
  ja: '最終更新日',
  ko: '마지막 업데이트'
}

export const DocumentLastUpdated = ({ date }: DocumentLastUpdatedProps) => {
  const pathname = usePathname()
  const normalizedPath = pathname.replace(/\/$/, '') || '/'
  const locale = normalizedPath.split('/')[1] || 'en'
  const syncedTimestamp = timestamps[normalizedPath]
  const syncedDate = syncedTimestamp ? new Date(syncedTimestamp) : date

  return (
    <LastUpdated date={syncedDate} locale={locale}>
      {labels[locale] ?? labels.en}
    </LastUpdated>
  )
}
