export type DocType = 'document' | 'exercise' | 'series'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface DocMeta {
  type: DocType
  title: string
  description?: string
  category?: string
  tags?: string[]
  difficulty?: Difficulty
}

export interface DocConfig {
  owner?: string
  email?: string
}

export interface Document {
  slug: string // folder name
  meta: DocMeta
  config?: DocConfig
  content?: string // raw markdown content
  children?: Document[] // lessons if type === 'series'
}
