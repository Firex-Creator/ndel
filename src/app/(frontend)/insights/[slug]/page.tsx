import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { formatDate } from '@/components/site/Cards'
import { EnquiryBand } from '@/components/site/EnquiryBand'
import { ContentBadge, Container, Notice } from '@/components/site/ui'
import { getArticle, populatedList } from '@/lib/content'
import type { Service } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle((await params).slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/insights/${article.slug}` },
    openGraph: { type: 'article', publishedTime: article.publishedDate, authors: [article.authorName] },
  }
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle((await params).slug)
  if (!article) notFound()
  const services = populatedList<Service>(article.relatedServices)

  return (
    <>
      <article>
        <header className="border-b border-rule bg-paper-2">
          <Container className="py-14 sm:py-16">
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <Link href="/insights" className="underline-offset-4 hover:underline">
                Insights
              </Link>
            </nav>
            <div className="mt-6 max-w-3xl">
              <ContentBadge source={article.contentSource} />
              <h1 className="mt-4 text-4xl font-bold text-navy-900 sm:text-5xl">{article.title}</h1>
              <p className="mt-6 text-lg text-muted">{article.excerpt}</p>
              <p className="mt-6 text-[0.95rem] text-navy-800">
                By <span className="font-semibold">{article.authorName}</span>
                <span aria-hidden="true"> · </span>
                <time dateTime={article.publishedDate}>{formatDate(article.publishedDate)}</time>
              </p>
            </div>
          </Container>
        </header>
        <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_18rem]">
          <div className="max-w-3xl">
            {article.contentSource === 'demonstration' && (
              <div className="mb-8">
                <Notice tone="demo">
                  This is a demonstration article showing the Insights format. It is general background text, not NDEL
                  technical guidance.
                </Notice>
              </div>
            )}
            <div className="prose-ndel">
              <RichText data={article.body} />
            </div>
          </div>
          {services.length > 0 && (
            <aside aria-labelledby="related-services">
              <h2 id="related-services" className="eyebrow text-teal-700">
                Related services
              </h2>
              <ul className="mt-4 grid gap-2">
                {services.map((s) => (
                  <li key={s.id}>
                    <Link href={`/services/${s.slug}`} className="font-semibold text-navy-900 underline-offset-4 hover:underline">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </Container>
      </article>
      <EnquiryBand href={services[0] ? `/contact?service=${services[0].slug}` : '/contact'} />
    </>
  )
}
