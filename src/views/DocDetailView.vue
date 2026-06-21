<script setup lang="ts">
import { computed, watchEffect, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { renderMarkdown } from '@/markdown/renderer'
import { useDocsStore } from '@/stores/docs'
import { getCategoryConfig } from '@/config/categories'
import { useThemeStore } from '@/stores/theme'
import DocContent from '@/components/docs/DocContent.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import {
  ArrowLeft, ArrowRight, ChevronRight,
  BookOpen, User, PanelLeftClose, PanelLeftOpen,
} from '@lucide/vue'

const route      = useRoute()
const router     = useRouter()
const docsStore  = useDocsStore()
const themeStore = useThemeStore()

// ─── Route params ────────────────────────────────────────────────────────────
const courseSlug = computed(() => route.params.courseSlug as string)
const lessonSlug = computed(() => route.params.lessonSlug as string | undefined)
const course     = computed(() => docsStore.getCourse(courseSlug.value))

const isCourseOverview = computed(() =>
  course.value?.meta.type === 'series' && !lessonSlug.value
)

const doc = computed(() => {
  const c = course.value
  if (!c) return undefined
  if (c.meta.type === 'series') {
    if (!lessonSlug.value) return undefined
    return c.children?.find(ch => ch.slug === lessonSlug.value)
  }
  return c
})

// 404 guard
watchEffect(() => {
  if (docsStore.loading) return
  if (route.name === 'DocDetail' && !course.value) router.replace('/404')
})

// ─── Category colour ─────────────────────────────────────────────────────────
const catCfg = computed(() =>
  getCategoryConfig(
    Array.isArray(course.value?.meta.category)
      ? course.value!.meta.category[0]
      : course.value?.meta.category
  )
)

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const sidebarDocs    = computed(() =>
  course.value?.meta.type === 'series' ? (course.value.children || []) : []
)
const sidebarOpen    = ref(true)

// ─── Prev / Next ─────────────────────────────────────────────────────────────
const currentIndex = computed(() =>
  sidebarDocs.value.findIndex(d => d.slug === lessonSlug.value)
)
const prevDoc = computed(() =>
  currentIndex.value > 0 ? sidebarDocs.value[currentIndex.value - 1] : null
)
const nextDoc = computed(() =>
  currentIndex.value > -1 && currentIndex.value < sidebarDocs.value.length - 1
    ? sidebarDocs.value[currentIndex.value + 1] : null
)

// ─── Markdown ────────────────────────────────────────────────────────────────
const renderedContent = computed(() =>
  renderMarkdown(doc.value?.content || '> Tài liệu đang được cập nhật...')
)

// ─── Labels ──────────────────────────────────────────────────────────────────
const difficultyLabel: Record<string, string> = {
  beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao',
}
const difficultyColor: Record<string, string> = {
  beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444',
}

// ─── Breadcrumbs ─────────────────────────────────────────────────────────────
const breadcrumbs = computed(() => {
  const base = [{ label: 'Tài liệu', to: '/docs' }]
  if (!course.value) return base
  if (isCourseOverview.value) return [...base, { label: course.value.meta.title }]
  return [
    ...base,
    { label: course.value.meta.title, to: `/docs/${courseSlug.value}` },
    ...(lessonSlug.value && doc.value ? [{ label: doc.value.meta.title }] : []),
  ]
})

// ─── Reader top-bar: hide-on-scroll-down ─────────────────────────────────────
const barVisible = ref(true)
let lastY = 0

function onScroll() {
  const y = window.scrollY
  if (y <= 10) {
    barVisible.value = true
  } else if (y > lastY + 4) {
    barVisible.value = false   // scrolling down
  } else if (y < lastY - 4) {
    barVisible.value = true    // scrolling up
  }
  lastY = y
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  themeStore  // init
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="doc-detail-wrapper">
    <!-- ══════════════════════════════════════════════════
         LOADING
    ═══════════════════════════════════════════════════ -->
    <div v-if="docsStore.loading && !course" class="state-loading">
    <div class="loading-dots"><span /><span /><span /></div>
    <p>Đang tải tài liệu...</p>
  </div>

  <!-- ══════════════════════════════════════════════════
       READER PAGE SHELL (covers both Overview & Reader)
  ═══════════════════════════════════════════════════ -->
  <div v-else-if="course" class="reader-page">

    <!-- ── Top bar (hide on scroll down) ── -->
    <header class="reader-bar" :class="{ 'reader-bar--hidden': !barVisible }">
      <div class="reader-bar-inner">
        <!-- Left: back + breadcrumbs -->
        <div class="reader-bar-left">
          <RouterLink to="/docs" class="reader-back" aria-label="Quay lại tài liệu">
            <ArrowLeft :size="14" />
          </RouterLink>

          <nav class="reader-crumbs" aria-label="Breadcrumb">
            <template v-for="(crumb, i) in breadcrumbs" :key="i">
              <span v-if="i > 0" class="crumb-sep" aria-hidden="true">›</span>
              <RouterLink v-if="'to' in crumb && crumb.to" :to="crumb.to" class="crumb">{{ crumb.label }}</RouterLink>
              <span v-else class="crumb crumb--active">{{ crumb.label }}</span>
            </template>
          </nav>
        </div>

        <!-- Right: theme + close -->
        <div class="reader-bar-right">
          <!-- Sidebar toggle (only for series lessons) -->
          <button
            v-if="sidebarDocs.length > 0"
            class="reader-icon-btn"
            :title="sidebarOpen ? 'Ẩn mục lục' : 'Hiện mục lục'"
            @click="sidebarOpen = !sidebarOpen"
          >
            <PanelLeftClose v-if="sidebarOpen" :size="16" />
            <PanelLeftOpen  v-else             :size="16" />
          </button>
          <ThemeToggle />
          <RouterLink
            :to="lessonSlug ? `/docs/${courseSlug}` : '/docs'"
            class="reader-icon-btn"
            title="Đóng"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </RouterLink>
        </div>
      </div>

      <!-- Progress line (for series) -->
      <div v-if="sidebarDocs.length > 0 && currentIndex >= 0" class="reader-progress">
        <div
          class="reader-progress-fill"
          :style="{ width: `${((currentIndex + 1) / sidebarDocs.length) * 100}%`, background: catCfg.color }"
        />
      </div>
    </header>

    <!-- ── Main reader body ── -->
    <div class="reader-body" :class="{ 'reader-body--sidebar': sidebarDocs.length > 0 && sidebarOpen }">

      <!-- Sidebar (series only) -->
      <Transition name="sidebar-slide">
        <aside v-if="sidebarDocs.length > 0 && sidebarOpen" class="reader-sidebar">
          <div class="sidebar-course-title" :style="{ color: catCfg.color }">
            {{ course?.meta.title }}
          </div>
          <nav class="sidebar-nav">
            <RouterLink
              v-for="(lesson, idx) in sidebarDocs"
              :key="lesson.slug"
              :to="`/docs/${courseSlug}/${lesson.slug}`"
              class="sidebar-item"
              :class="{ 'sidebar-item--active': lesson.slug === lessonSlug }"
            >
              <span class="sidebar-item-idx" :style="lesson.slug === lessonSlug ? { color: catCfg.color } : {}">
                {{ String(idx + 1).padStart(2, '0') }}
              </span>
              <span class="sidebar-item-title">{{ lesson.meta.title }}</span>
              <span
                v-if="lesson.meta.difficulty"
                class="sidebar-item-dot"
                :style="{ background: difficultyColor[lesson.meta.difficulty] }"
              />
            </RouterLink>
          </nav>
        </aside>
      </Transition>

      <!-- Content column -->
      <main class="reader-main">
        <template v-if="isCourseOverview">
          <!-- Hero card -->
          <div class="course-hero" :style="{ '--cat': catCfg.color }">
            <div class="hero-accent" />
            <div class="hero-body">
              <div class="hero-badges">
                <span class="badge-series">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  Bộ tài liệu
                </span>
                <span class="badge-cat" :style="{ color: catCfg.color, background: catCfg.tint }">
                  {{ catCfg.label }}
                </span>
                <span v-if="course.meta.difficulty" class="badge-diff"
                  :style="{ color: difficultyColor[course.meta.difficulty], background: `${difficultyColor[course.meta.difficulty]}18` }">
                  {{ difficultyLabel[course.meta.difficulty] }}
                </span>
              </div>

              <h1 class="hero-title">{{ course.meta.title }}</h1>
              <p class="hero-desc">{{ course.meta.description }}</p>

              <div class="hero-meta">
                <span class="hero-meta-item">
                  <BookOpen :size="13" />
                  {{ sidebarDocs.length }} tài liệu
                </span>
                <span v-if="course.config?.owner" class="hero-meta-item">
                  <User :size="13" />
                  {{ course.config.owner }}
                </span>
              </div>

              <div v-if="course.meta.tags?.length" class="hero-tags">
                <span v-for="tag in course.meta.tags.slice(0, 6)" :key="tag" class="hero-tag">{{ tag }}</span>
              </div>

              <RouterLink
                v-if="sidebarDocs.length > 0"
                :to="`/docs/${courseSlug}/${sidebarDocs[0].slug}`"
                class="hero-start" :style="{ background: catCfg.color }"
              >
                Bắt đầu đọc <ChevronRight :size="15" />
              </RouterLink>
            </div>
          </div>

          <!-- Lesson list -->
          <div class="lesson-list">
            <h2 class="lesson-list-title">Danh sách tài liệu</h2>
            <RouterLink
              v-for="(lesson, idx) in sidebarDocs"
              :key="lesson.slug"
              :to="`/docs/${courseSlug}/${lesson.slug}`"
              class="lesson-row"
            >
              <span class="lesson-idx" :style="{ color: catCfg.color }">
                {{ String(idx + 1).padStart(2, '0') }}
              </span>
              <div class="lesson-info">
                <span class="lesson-title">{{ lesson.meta.title }}</span>
                <span v-if="lesson.meta.description" class="lesson-desc">{{ lesson.meta.description }}</span>
              </div>
              <span v-if="lesson.meta.difficulty" class="lesson-diff"
                :style="{ color: difficultyColor[lesson.meta.difficulty], background: `${difficultyColor[lesson.meta.difficulty]}18` }">
                {{ difficultyLabel[lesson.meta.difficulty] }}
              </span>
              <ChevronRight :size="15" class="lesson-arrow" />
            </RouterLink>
            <div v-if="sidebarDocs.length === 0" class="lesson-empty">
              Tài liệu đang được cập nhật...
            </div>
          </div>
        </template>

        <template v-else-if="doc">
          <!-- Doc header -->
          <header class="doc-header">
            <div class="doc-chips">
              <span
                v-if="doc.meta.difficulty"
                class="chip chip-diff"
                :style="{ color: difficultyColor[doc.meta.difficulty], background: `${difficultyColor[doc.meta.difficulty]}18` }"
              >
                {{ difficultyLabel[doc.meta.difficulty] }}
              </span>
              <span v-for="tag in doc.meta.tags?.slice(0, 4) || []" :key="tag" class="chip chip-tag">{{ tag }}</span>
            </div>

            <h1 class="doc-title">{{ doc.meta.title }}</h1>
            <p v-if="doc.meta.description" class="doc-subtitle">{{ doc.meta.description }}</p>

            <div class="doc-meta">
              <span v-if="(doc.meta as any).author?.name || course?.config?.owner" class="doc-meta-item">
                <User :size="12" />
                {{ (doc.meta as any).author?.name || course?.config?.owner }}
              </span>
            </div>
          </header>

          <div class="doc-divider" />

          <!-- Markdown content -->
          <DocContent :content="renderedContent" />

          <!-- Prev / Next (series only) -->
          <nav v-if="sidebarDocs.length > 0" class="doc-nav">
            <RouterLink
              v-if="prevDoc"
              :to="`/docs/${courseSlug}/${prevDoc.slug}`"
              class="doc-nav-btn doc-nav-prev"
            >
              <ArrowLeft :size="14" />
              <div>
                <span class="nav-hint">Tài liệu trước</span>
                <span class="nav-title">{{ prevDoc.meta.title }}</span>
              </div>
            </RouterLink>
            <div v-else />

            <RouterLink
              v-if="nextDoc"
              :to="`/docs/${courseSlug}/${nextDoc.slug}`"
              class="doc-nav-btn doc-nav-next"
              :style="{ '--cat': catCfg.color }"
            >
              <div>
                <span class="nav-hint">Tài liệu tiếp theo</span>
                <span class="nav-title">{{ nextDoc.meta.title }}</span>
              </div>
              <ArrowRight :size="14" />
            </RouterLink>
          </nav>
        </template>
      </main>
    </div>
  </div>

  <!-- Fallback to prevent transition crash during unmount phase -->
  <div v-else class="state-loading"></div>
  </div>
</template>

<style scoped>
.doc-detail-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ══════════════════════════════════════════════════════
   LOADING
══════════════════════════════════════════════════════ */
.state-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 100vh;
  color: var(--text-muted);
}

.loading-dots { display: flex; gap: 0.5rem; }
.loading-dots span {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--text-muted);
  animation: dot-bounce 1.2s infinite ease-in-out;
}
.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }
@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
  40%           { transform: scale(1);   opacity: 1; }
}

/* ══════════════════════════════════════════════════════
   COURSE OVERVIEW
══════════════════════════════════════════════════════ */
.course-hero {
  display: flex;
  background: var(--bg);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 3px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
  margin-bottom: 2rem;
}

.hero-accent { width: 5px; flex-shrink: 0; background: var(--cat, #f97316); }

.hero-body {
  flex: 1;
  padding: 1.75rem 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.hero-badges { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

.badge-series {
  display: inline-flex; align-items: center; gap: 0.3rem;
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.03em;
  padding: 0.18rem 0.45rem; border-radius: 2px;
  background: rgba(99,102,241,0.1); color: #4f46e5;
}

.badge-cat, .badge-diff {
  font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.05em; text-transform: uppercase;
  padding: 0.18rem 0.45rem; border-radius: 2px;
}

.hero-title {
  font-size: 1.75rem; font-weight: 800;
  letter-spacing: -0.025em; color: var(--text);
  line-height: 1.2; margin: 0;
}

.hero-desc { font-size: 0.9rem; color: var(--text-2); line-height: 1.65; margin: 0; }

.hero-meta { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.hero-meta-item {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: 0.8125rem; color: var(--text-muted);
}

.hero-tags { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.hero-tag {
  font-size: 0.7rem; font-weight: 500; color: var(--text-muted);
  background: var(--bg-2); padding: 0.15rem 0.45rem; border-radius: 2px;
}

.hero-start {
  display: inline-flex; align-items: center; gap: 0.4rem;
  margin-top: 0.5rem; padding: 0.525rem 1.2rem;
  font-size: 0.875rem; font-weight: 700; color: #fff;
  text-decoration: none; border-radius: 2px; align-self: flex-start;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  transition: opacity 0.15s, transform 0.15s;
}
.hero-start:hover { opacity: 0.9; transform: translateY(-1px); }

/* Lesson list */
.lesson-list { display: flex; flex-direction: column; }
.lesson-list-title {
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.75rem;
}
.lesson-row {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.875rem 1rem; text-decoration: none; color: inherit;
  background: var(--bg); border-radius: 4px; margin-bottom: 0.5rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  transition: box-shadow 0.18s, transform 0.18s;
}
.lesson-row:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.09); transform: translateX(3px); }
.lesson-idx { font-family: var(--font-mono, monospace); font-size: 0.8rem; font-weight: 700; width: 2rem; flex-shrink: 0; text-align: right; }
.lesson-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }
.lesson-title { font-size: 0.9rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lesson-desc { font-size: 0.775rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lesson-diff { font-size: 0.68rem; font-weight: 600; padding: 0.2rem 0.45rem; border-radius: 2px; flex-shrink: 0; }
.lesson-arrow { color: var(--text-muted); flex-shrink: 0; transition: transform 0.15s; }
.lesson-row:hover .lesson-arrow { transform: translateX(2px); }
.lesson-empty { padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.875rem; }

/* ══════════════════════════════════════════════════════
   READER PAGE SHELL
══════════════════════════════════════════════════════ */
.reader-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
}

/* ── Reader top bar ── */
.reader-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transform: translateY(0);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.28s ease;
}

.reader-bar--hidden {
  transform: translateY(-100%);
  box-shadow: none;
}

.reader-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 1.25rem;
  gap: 1rem;
}

.reader-bar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  flex: 1;
}

.reader-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  border-radius: 2px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;
}
.reader-back:hover { color: var(--text); background: var(--bg-2); }

.reader-crumbs {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  overflow: hidden;
  white-space: nowrap;
}

.crumb-sep { color: var(--text-muted); }

.crumb {
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s;
  overflow: hidden;
  text-overflow: ellipsis;
}
.crumb:hover { color: var(--text); }

.crumb--active {
  color: var(--text);
  font-weight: 600;
}

.reader-bar-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.reader-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px; height: 30px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 2px;
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}
.reader-icon-btn:hover { color: var(--text); background: var(--bg-2); }

/* Progress bar (thin line under top bar) */
.reader-progress {
  height: 2px;
  background: var(--border);
}
.reader-progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

/* ── Reader body layout ── */
.reader-body {
  flex: 1;
  display: flex;
  padding-top: 52px; /* height of top bar */
}

/* ── Sidebar ── */
.reader-sidebar {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: 52px;
  height: calc(100vh - 52px);
  overflow-y: auto;
  border-right: 1px solid var(--border);
  padding: 1.25rem 0.75rem;
  background: var(--bg);
}

.sidebar-course-title {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 0.875rem;
  padding: 0 0.375rem;
}

.sidebar-nav { display: flex; flex-direction: column; gap: 2px; }

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.475rem 0.5rem;
  border-radius: 2px;
  text-decoration: none;
  color: var(--text-2);
  font-size: 0.8375rem;
  transition: background 0.15s, color 0.15s;
}
.sidebar-item:hover { background: var(--bg-2); color: var(--text); }

.sidebar-item--active {
  background: var(--bg-2);
  color: var(--text);
  font-weight: 600;
}

.sidebar-item-idx {
  font-family: var(--font-mono, monospace);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  width: 1.5rem;
  flex-shrink: 0;
  text-align: right;
  transition: color 0.15s;
}

.sidebar-item-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.sidebar-item-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; opacity: 0.6;
}
.sidebar-item--active .sidebar-item-dot { opacity: 1; }

/* Sidebar slide transition */
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: width 0.25s ease, opacity 0.2s ease;
  overflow: hidden;
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  width: 0;
  opacity: 0;
}
.sidebar-slide-enter-to,
.sidebar-slide-leave-from {
  width: 240px;
  opacity: 1;
}

/* ── Main content ── */
.reader-main {
  flex: 1;
  min-width: 0;
  max-width: 760px;
  margin: 0 auto;
  padding: 3rem 2rem 5rem;
}

/* ── Doc header ── */
.doc-header { margin-bottom: 0; }

.doc-chips { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-bottom: 1rem; }

.chip {
  font-size: 0.7rem; font-weight: 600;
  padding: 0.2rem 0.5rem; border-radius: 2px;
}
.chip-tag { background: var(--bg-2); color: var(--text-muted); }

.doc-title {
  font-size: 1.875rem; font-weight: 800;
  letter-spacing: -0.03em; color: var(--text);
  line-height: 1.2; margin: 0 0 0.625rem;
}

.doc-subtitle {
  font-size: 1rem; color: var(--text-2);
  line-height: 1.65; margin: 0 0 0.875rem;
}

.doc-meta { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.doc-meta-item {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: 0.8125rem; color: var(--text-muted);
}

.doc-divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 1.5rem 0;
}

/* ── Prev / Next navigation ── */
.doc-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
  margin-top: 3.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.doc-nav-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--bg-2);
  border-radius: 4px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  transition: box-shadow 0.18s, transform 0.18s, background 0.15s;
}
.doc-nav-btn:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transform: translateY(-1px);
  background: var(--bg);
}

.doc-nav-next { justify-content: flex-end; text-align: right; }

.doc-nav-btn > div { display: flex; flex-direction: column; gap: 0.15rem; }

.nav-hint { font-size: 0.72rem; color: var(--text-muted); }

.nav-title {
  font-size: 0.875rem; font-weight: 600; color: var(--text);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .reader-crumbs { display: none; }
  .reader-main { padding: 2rem 1rem 4rem; }
  .doc-title { font-size: 1.5rem; }
  .doc-nav { grid-template-columns: 1fr; }
  .reader-sidebar { display: none; }
}
</style>
