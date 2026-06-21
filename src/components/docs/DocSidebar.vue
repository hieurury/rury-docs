<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import type { Document } from '@/types/document'
import { useDocsStore } from '@/stores/docs'

const props = defineProps<{
  docs: Document[]
  category: string
}>()

const route = useRoute()
const docsStore = useDocsStore()

function isActive(doc: Document) {
  return route.path === `/docs/${props.category}/${doc.slug}`
}

const course = docsStore.getCourse(props.category)

const difficultyDot: Record<string, string> = {
  beginner: '#a1a1aa',
  intermediate: '#71717a',
  advanced: '#3f3f46',
}
</script>

<template>
  <nav class="doc-sidebar" aria-label="Documents navigation">
    <div class="sidebar-group-title">
      {{ course?.meta.title ?? category }}
    </div>
    <ul class="sidebar-list">
      <li v-for="doc in docs" :key="doc.slug">
        <RouterLink
          :to="`/docs/${category}/${doc.slug}`"
          class="sidebar-link"
          :class="{ 'sidebar-link--active': isActive(doc) }"
          :aria-current="isActive(doc) ? 'page' : undefined"
        >
          <span
            v-if="doc.meta.difficulty"
            class="sidebar-dot"
            :style="{ background: difficultyDot[doc.meta.difficulty] }"
            :title="doc.meta.difficulty"
          />
          <span class="sidebar-link-text">{{ doc.meta.title }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.doc-sidebar {
  padding-right: 0.5rem;
}

.sidebar-group-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0 0.5rem;
  margin-bottom: 0.5rem;
}

.sidebar-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.4rem 0.5rem;
  font-size: 0.875rem;
  color: var(--text-2);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: color var(--transition), background var(--transition);
  line-height: 1.4;
}

.sidebar-link:hover {
  color: var(--text);
  background: var(--bg-2);
}

.sidebar-link--active {
  color: var(--text);
  background: var(--bg-2);
  font-weight: 500;
}

.sidebar-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  opacity: 0.7;
}

.sidebar-link--active .sidebar-dot {
  opacity: 1;
}

.sidebar-link-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
