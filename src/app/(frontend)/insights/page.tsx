import type { Metadata } from 'next'

import { ArticleCard } from '@/components/site/Cards'
import { Container, PageHeader } from '@/components/site/ui'
import { getArticles } from '@/lib/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Insights',
  description: 'Technical updates and articles from NDEL.',
  alternates: { canonical: '/insights' },
}

export default async function InsightsPage() {
  const articles = await getArticles()
  return (
    <>
      <PageHeader eyebrow="Insights" title="Technical updates and articles" />
      <Container className="py-14 sm:py-16">
        {articles.length === 0 ? (
          <p className="text-lg text-muted">Articles will be published here.</p>
        ) : (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </Container>
    </>
  )
}
