import { ButtonLink, Container, Eyebrow } from '@/components/site/ui'

export default function NotFound() {
  return (
    <Container className="py-24">
      <Eyebrow>404</Eyebrow>
      <h1 className="mt-4 text-4xl font-bold text-navy-900">Page not found</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        The page may have moved, or the content has not been published yet.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">Go to the home page</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Discuss Your Project
        </ButtonLink>
      </div>
    </Container>
  )
}
