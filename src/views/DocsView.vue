<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Search } from '@lucide/vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import DocCard from '@/components/docs/DocCard.vue'
import { useDocsStore } from '@/stores/docs'
import { CATEGORIES } from '@/config/categories'

const docsStore = useDocsStore()
const route = useRoute()

const searchQuery = ref('')
const activeCategory = ref((route.query.category as string) || 'all')
const activeDifficulty = ref('all')

// Show only categories present in loaded docs, order follows CATEGORIES config
const categories = computed(() => {
  const docCats = new Set(docsStore.categories)
  const configured = CATEGORIES
    .filter(c => docCats.has(c.id))
    .map(c => ({ id: c.id, label: c.label }))
  return [{ id: 'all', label: 'Tất cả' }, ...configured]
})

const difficulties = [
  { id: 'all', label: 'Mọi cấp độ' },
  { id: 'beginner', label: 'Cơ bản' },
  { id: 'intermediate', label: 'Trung cấp' },
  { id: 'advanced', label: 'Nâng cao' },
]

const filteredDocs = computed(() => {
  return docsStore.docs.filter(doc => {
    if (doc.meta.type === 'exercise') return false
    const matchCat = activeCategory.value === 'all' || doc.meta.category === activeCategory.value
    const matchDiff = activeDifficulty.value === 'all' || doc.meta.difficulty === activeDifficulty.value
    const q = searchQuery.value.toLowerCase()
    const title = doc.meta.title?.toLowerCase() || ''
    const description = doc.meta.description?.toLowerCase() || ''
    const tags = doc.meta.tags || []
    const matchSearch = !q || title.includes(q) || description.includes(q) || tags.some(t => t.toLowerCase().includes(q))
    return matchCat && matchDiff && matchSearch
  })
})
</script>

<template>
  <DefaultLayout>
    <div class="docs-page">
      <div class="container">

        <!-- Page header -->
        <div class="page-header">
          <div class="page-header-eyebrow">Thư viện tài liệu</div>
          <h1 class="page-title">Khám phá tài liệu</h1>
          <p class="page-subtitle">
            <strong>{{ docsStore.docs.length }}</strong> tài liệu · Quản lý qua Git · Cộng đồng đóng góp
          </p>
        </div>

        <!-- Filters bar -->
        <div class="filters-bar">
          <!-- Search -->
          <div class="search-wrap">
            <Search :size="14" class="search-icon" />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Tìm kiếm tài liệu..."
              class="search-input"
              aria-label="Tìm kiếm tài liệu"
            />
          </div>

          <!-- Spacer -->
          <div class="filters-sep" />

          <!-- Category pills -->
          <div class="pill-group" role="group" aria-label="Lọc theo danh mục">
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="pill"
              :class="{ 'pill--active': activeCategory === cat.id }"
              @click="activeCategory = cat.id"
            >
              {{ cat.label }}
            </button>
          </div>

          <!-- Difficulty pills -->
          <div class="pill-group pill-group--sm" role="group" aria-label="Lọc theo cấp độ">
            <button
              v-for="diff in difficulties"
              :key="diff.id"
              class="pill pill--sm"
              :class="{ 'pill--active': activeDifficulty === diff.id }"
              @click="activeDifficulty = diff.id"
            >
              {{ diff.label }}
            </button>
          </div>
        </div>

        <!-- Results info -->
        <div class="results-bar">
          <span class="results-count">
            <span class="results-num">{{ filteredDocs.length }}</span> tài liệu
          </span>
          <span v-if="searchQuery" class="results-query">
            · Tìm kiếm "<strong>{{ searchQuery }}</strong>"
          </span>
          <button
            v-if="searchQuery || activeCategory !== 'all' || activeDifficulty !== 'all'"
            class="results-clear"
            @click="searchQuery = ''; activeCategory = 'all'; activeDifficulty = 'all'"
          >
            Xóa bộ lọc
          </button>
        </div>

        <!-- Docs Grid -->
        <div v-if="filteredDocs.length > 0" class="docs-grid">
          <DocCard
            v-for="doc in filteredDocs"
            :key="doc.slug"
            :doc="doc"
          />
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <Search :size="22" />
          </div>
          <p class="empty-title">Không tìm thấy tài liệu</p>
          <p class="empty-sub">Thử thay đổi từ khoá hoặc bộ lọc khác</p>
          <button
            class="empty-reset"
            @click="searchQuery = ''; activeCategory = 'all'; activeDifficulty = 'all'"
          >
            Xóa bộ lọc
          </button>
        </div>

      </div>
    </div>
  </DefaultLayout>
</template>

<style scoped>
/* ── Page layout ── */
.docs-page {
  padding: 3.5rem 0 6rem;
  min-height: 100vh;
}

/* ── Header ── */
.page-header {
  margin-bottom: 2.5rem;
}

.page-header-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #f97316;
  margin-bottom: 0.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text);
  margin-bottom: 0.5rem;
  line-height: 1.15;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.page-subtitle strong {
  color: var(--text-2);
  font-weight: 600;
}

/* ── Filters bar ── */
.filters-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.625rem;
  margin-bottom: 1.25rem;
  padding: 0.875rem 1.125rem;
  background: var(--bg);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
  border-radius: 4px;
}

.filters-sep {
  flex: 1;
  min-width: 0.5rem;
}

/* Search */
.search-wrap {
  position: relative;
  flex: 0 0 220px;
}

.search-icon {
  position: absolute;
  left: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.425rem 0.75rem 0.425rem 1.875rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  background: var(--bg-2);
  border: none;
  border-radius: 2px;
  color: var(--text);
  outline: none;
  box-shadow: 0 0 0 1.5px var(--border);
  transition: box-shadow 0.18s;
}

.search-input:focus {
  box-shadow: 0 0 0 2px #f97316;
}

.search-input::placeholder { color: var(--text-muted); }

/* Pills */
.pill-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.pill {
  padding: 0.325rem 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1;
}

.pill:hover {
  color: var(--text);
  background: var(--bg-2);
}

.pill--active {
  background: #f97316;
  color: #fff;
}

.pill--active:hover {
  background: #ea6c10;
  color: #fff;
}

.pill--sm,
.pill-group--sm .pill {
  font-size: 0.75rem;
  padding: 0.275rem 0.6rem;
}

/* Results bar */
.results-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.results-num {
  font-weight: 700;
  color: var(--text-2);
}

.results-query strong {
  color: var(--text);
}

.results-clear {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 600;
  color: #f97316;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 2px;
  transition: background 0.15s;
}
.results-clear:hover { background: rgba(249,115,22,0.08); }

/* Grid */
.docs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 5rem 0;
  text-align: center;
}

.empty-icon {
  width: 52px;
  height: 52px;
  border-radius: 4px;
  background: var(--bg-2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.empty-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text);
}

.empty-sub {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.empty-reset {
  margin-top: 0.75rem;
  padding: 0.45rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #f97316;
  background: rgba(249,115,22,0.08);
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.15s;
}
.empty-reset:hover { background: rgba(249,115,22,0.15); }

/* Responsive */
@media (max-width: 960px) {
  .docs-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .docs-page { padding: 2rem 0 4rem; }
  .docs-grid { grid-template-columns: 1fr; gap: 0.875rem; }
  .search-wrap { flex: 1; min-width: 0; }
  .filters-sep { display: none; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .pill-group { justify-content: flex-start; }
}
</style>
