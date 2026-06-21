import md from './parser'

export function renderMarkdown(content: string): string {
  return md.render(content)
}

export function renderInline(content: string): string {
  return md.renderInline(content)
}
