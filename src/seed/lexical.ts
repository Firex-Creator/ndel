// Minimal Lexical JSON builders for seeding rich-text fields.

const text = (t: string) => ({ type: 'text', text: t, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })

const block = (extra: Record<string, unknown>, children: unknown[]) => ({
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children,
  ...extra,
})

export const p = (t: string) => block({ type: 'paragraph', textFormat: 0, textStyle: '' }, [text(t)])
export const h2 = (t: string) => block({ type: 'heading', tag: 'h2' }, [text(t)])
export const ul = (items: string[]) =>
  block(
    { type: 'list', listType: 'bullet', start: 1, tag: 'ul' },
    items.map((t, i) => block({ type: 'listitem', value: i + 1 }, [text(t)])),
  )

export const doc = (...children: unknown[]) =>
  ({ root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } }) as never
