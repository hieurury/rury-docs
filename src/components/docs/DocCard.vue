<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Document } from '@/types/document'
import { getCategoryConfig } from '@/config/categories'

const props = defineProps<{
  doc: Document
}>()

const isSeries = computed(() => props.doc.meta.type === 'series')
const isExercise = computed(() => props.doc.meta.type === 'exercise')

// Use first category to determine color
const catCfg = computed(() => getCategoryConfig(
  Array.isArray(props.doc.meta.category)
    ? props.doc.meta.category[0]
    : props.doc.meta.category
))

const difficultyLabel: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
}

const difficultyColor: Record<string, string> = {
  beginner:     '#22c55e',
  intermediate: '#f59e0b',
  advanced:     '#ef4444',
}
</script>

<template>
  <RouterLink
    :to="`/docs/${doc.slug}`"
    class="doc-card"
    :class="isSeries ? 'doc-card--series' : 'doc-card--single'"
    :aria-label="`Xem ${isSeries ? 'bộ tài liệu' : isExercise ? 'bài tập' : 'tài liệu'}: ${doc.meta.title}`"
  >
    <!-- Accent strip (left edge, category colour) -->
    <div class="card-accent" :style="{ background: catCfg.color }" />

    <!-- Body -->
    <div class="card-body">

      <!-- Top row: type badge + category label -->
      <div class="card-top">
        <div
          class="type-badge"
          :style="{ 
            background: isSeries ? 'rgba(99,102,241,0.1)' : isExercise ? 'rgba(16, 185, 129, 0.1)' : catCfg.tint, 
            color: isSeries ? '#4f46e5' : isExercise ? '#059669' : catCfg.tintText 
          }"
        >
          <!-- Folder for series -->
          <svg v-if="isSeries" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <!-- Pen for exercise -->
          <svg v-else-if="isExercise" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <!-- File for single -->
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span>{{ isSeries ? 'Bộ tài liệu' : isExercise ? 'Bài tập' : 'Tài liệu' }}</span>
        </div>

        <span class="cat-label" :style="{ color: catCfg.color }">
          {{ catCfg.label }}
        </span>
      </div>

      <!-- Decorative art -->
      <div class="card-art" aria-hidden="true">
        <!-- Folder art for series -->
        <svg v-if="isSeries" width="72" height="52" viewBox="0 0 72 52" fill="none">
          <rect x="0" y="9" width="62" height="43" rx="2" :fill="catCfg.color" opacity="0.08"/>
          <path d="M0 16 Q0 9 5 9 L22 9 L27 15 L67 15 Q72 15 72 20 L72 48 Q72 52 68 52 L4 52 Q0 52 0 48 Z" :fill="catCfg.color" opacity="0.14"/>
          <rect x="6" y="21" width="40" height="3" rx="1.5" :fill="catCfg.color" opacity="0.35"/>
          <rect x="6" y="28" width="32" height="3" rx="1.5" :fill="catCfg.color" opacity="0.25"/>
          <rect x="6" y="35" width="36" height="3" rx="1.5" :fill="catCfg.color" opacity="0.18"/>
          <rect x="6" y="42" width="24" height="3" rx="1.5" :fill="catCfg.color" opacity="0.13"/>
        </svg>
        <!-- Page art for single doc/exercise -->
        <svg v-else width="56" height="64" viewBox="0 0 56 64" fill="none">
          <rect x="0" y="0" width="48" height="60" rx="2" :fill="catCfg.color" opacity="0.08"/>
          <path d="M38 0 L48 0 L48 12 L38 12 Z" :fill="catCfg.color" opacity="0.06"/>
          <path d="M38 0 L48 12 L38 12 Z" :fill="catCfg.color" opacity="0.2"/>
          <rect x="7" y="18" width="26" height="2.5" rx="1.25" :fill="catCfg.color" opacity="0.45"/>
          <rect x="7" y="25" width="34" height="2.5" rx="1.25" :fill="catCfg.color" opacity="0.32"/>
          <rect x="7" y="32" width="22" height="2.5" rx="1.25" :fill="catCfg.color" opacity="0.25"/>
          <rect x="7" y="39" width="30" height="2.5" rx="1.25" :fill="catCfg.color" opacity="0.18"/>
          <rect x="7" y="46" width="18" height="2.5" rx="1.25" :fill="catCfg.color" opacity="0.13"/>
        </svg>
      </div>

      <!-- Title & description -->
      <h3 class="card-title">{{ doc.meta.title }}</h3>
      <p class="card-desc">{{ doc.meta.description }}</p>

      <!-- Footer -->
      <div class="card-footer">
        <div class="card-tags">
          <span
            v-for="tag in doc.meta.tags?.slice(0, 3) || []"
            :key="tag"
            class="tag-item"
          >{{ tag }}</span>
        </div>

        <div class="card-meta">
          <div
            v-if="doc.meta.difficulty"
            class="diff-badge"
            :style="{ color: difficultyColor[doc.meta.difficulty] || '#aaa' }"
          >
            <span class="diff-dot" :style="{ background: difficultyColor[doc.meta.difficulty] || '#aaa' }"></span>
            {{ difficultyLabel[doc.meta.difficulty] }}
          </div>
          <span v-if="isSeries && doc.children" class="lesson-count">
            {{ doc.children.length }} tài liệu
          </span>
          <svg class="card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.doc-card {
  position: relative;
  display: flex;
  text-decoration: none;
  color: inherit;
  background: var(--bg);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.doc-card:hover {
  box-shadow: 0 8px 28px rgba(0,0,0,0.11), 0 2px 6px rgba(0,0,0,0.06);
  transform: translateY(-2px);
}

.card-accent {
  width: 4px;
  flex-shrink: 0;
  transition: width 0.18s ease;
}

.doc-card:hover .card-accent { width: 5px; }

.card-body {
  flex: 1;
  min-width: 0;
  padding: 1rem 1.125rem 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

/* Top */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 0.18rem 0.45rem;
  border-radius: 2px;
}

.cat-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Art */
.card-art {
  margin: 0.15rem 0 0.1rem;
  opacity: 0.85;
  transition: opacity 0.2s;
}
.doc-card:hover .card-art { opacity: 1; }

/* Content */
.card-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.35;
  margin: 0;
  letter-spacing: -0.01em;
}

.card-desc {
  font-size: 0.8125rem;
  color: var(--text-muted);
  line-height: 1.55;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
  padding-top: 0.575rem;
  border-top: 1px solid var(--border);
}

.card-tags { display: flex; flex-wrap: wrap; gap: 0.2rem; }

.tag-item {
  font-size: 0.675rem;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--bg-2);
  padding: 0.15rem 0.4rem;
  border-radius: 2px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.diff-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  background: var(--bg-2);
  border-radius: 4px;
}

.diff-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.lesson-count {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
}

.card-arrow {
  color: var(--text-muted);
  transition: transform 0.15s ease, color 0.15s ease;
}

.doc-card:hover .card-arrow {
  transform: translateX(3px);
  color: v-bind('catCfg.color');
}
</style>
