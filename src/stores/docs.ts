import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Document, DocMeta, DocConfig } from '@/types/document'

export const useDocsStore = defineStore('docs', () => {
  const docs = ref<Document[]>([])
  const loading = ref(false)

  const categories = computed(() => {
    const cats = new Set(docs.value.filter(d => d.meta.category).map(d => d.meta.category!))
    return Array.from(cats)
  })

  const allExercises = computed(() => {
    return docs.value.filter(d => d.meta.type === 'exercise')
  })

  function getByCategory(category: string) {
    return docs.value.filter(d => d.meta.category === category)
  }

  function getCourse(courseSlug: string) {
    return docs.value.find(d => d.slug === courseSlug)
  }

  function getLesson(courseSlug: string, lessonSlug: string) {
    const course = getCourse(courseSlug)
    if (!course) return undefined
    if (course.meta.type === 'series') {
      return course.children?.find(c => c.slug === lessonSlug)
    }
    return undefined
  }

  async function loadDocs() {
    loading.value = true
    try {
      const metaFiles = import.meta.glob<{ default: DocMeta }>('../../docs/**/meta.json', { eager: true })
      const configFiles = import.meta.glob<{ default: DocConfig }>('../../docs/**/config.json', { eager: true })
      const mdFiles = import.meta.glob<string>('../../docs/**/document.md', { eager: true, query: '?raw', import: 'default' })

      const rootDocs = new Map<string, Document>()

      // First pass: construct root level documents (series or single docs)
      for (const [path, module] of Object.entries(metaFiles)) {
        const match = path.match(/docs\/(.+)\/meta\.json$/)
        if (!match) continue
        const relativePath = match[1]
        const parts = relativePath.split('/')

        if (parts.length === 1) {
          const slug = parts[0]
          // Find config and md paths dynamically since keys might differ
          const configKey = Object.keys(configFiles).find(k => k.includes(`docs/${slug}/config.json`))
          const mdKey = Object.keys(mdFiles).find(k => k.includes(`docs/${slug}/document.md`))

          rootDocs.set(slug, {
            slug,
            meta: module.default,
            config: configKey ? configFiles[configKey]?.default : undefined,
            content: mdKey ? mdFiles[mdKey] : undefined,
            children: module.default.type === 'series' ? [] : undefined
          })
        }
      }

      // Second pass: add children to series
      for (const [path, module] of Object.entries(metaFiles)) {
        const match = path.match(/docs\/(.+)\/meta\.json$/)
        if (!match) continue
        const relativePath = match[1]
        const parts = relativePath.split('/')

        if (parts.length === 2) {
          const parentSlug = parts[0]
          const childSlug = parts[1]

          const configKey = Object.keys(configFiles).find(k => k.includes(`docs/${parentSlug}/${childSlug}/config.json`))
          const mdKey = Object.keys(mdFiles).find(k => k.includes(`docs/${parentSlug}/${childSlug}/document.md`))

          const parent = rootDocs.get(parentSlug)
          if (parent && parent.children) {
            parent.children.push({
              slug: childSlug,
              meta: module.default,
              config: configKey ? configFiles[configKey]?.default : undefined,
              content: mdKey ? mdFiles[mdKey] : undefined
            })
          }
        }
      }

      docs.value = Array.from(rootDocs.values())
      console.log('Loaded docs:', docs.value)
    } catch (err) {
      console.error('Failed to load docs via glob:', err)
    } finally {
      loading.value = false
    }
  }

  return { docs, loading, categories, allExercises, getByCategory, getCourse, getLesson, loadDocs }
})
