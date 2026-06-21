<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight, ExternalLink, ChevronLeft, ChevronRight,
  BookOpen, Users, GitFork,
} from '@lucide/vue'
import Navbar from '@/components/common/Navbar.vue'
import Footer from '@/components/common/Footer.vue'
import { useDocsStore } from '@/stores/docs'

gsap.registerPlugin(ScrollTrigger)

const docsStore   = useDocsStore()

// ─── Hero stats ───────────────────────────────────────────────────────────────
const heroStats = computed(() => [
  { value: docsStore.docs.length,        label: 'Tài liệu'   },
  { value: docsStore.allExercises.length, label: 'Bài tập' },
  { value: 4,                            label: 'Danh mục'   },
  { value: '∞',                          label: 'Contributors' },
])

// ─── Categories Slideshow ────────────────────────────────────────────────────
const currentSlide = ref(0)
let slideTimer: ReturnType<typeof setInterval> | null = null

function getWeekSeed(): number {
  const d = new Date()
  const startOfYear = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(
    ((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
  )
  return d.getFullYear() * 1000 + week
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed >>> 0
  for (let i = a.length - 1; i > 0; i--) {
    s = Math.imul(s ^ (s >>> 15), s | 1) >>> 0
    s = (s ^ (s >>> 7) ^ (s << 3)) >>> 0
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const CATEGORY_META: Record<string, { label: string; description: string; contributors: number }> = {
  html: {
    label: 'HTML',
    description: 'Ngôn ngữ đánh dấu cơ bản để xây dựng cấu trúc mọi trang web. Hãy bắt đầu hành trình của bạn tại đây.',
    contributors: 5,
  },
  css: {
    label: 'CSS',
    description: 'Tạo kiểu và thiết kế giao diện cho trang web. Từ Flexbox đến Grid và Animations.',
    contributors: 4,
  },
  javascript: {
    label: 'JavaScript',
    description:
      'Từ Promise và Closure đến Event Loop và Prototype Chain — JavaScript là nền tảng của toàn bộ web hiện đại. Tài liệu được viết bởi cộng đồng, liên tục cập nhật.',
    contributors: 3,
  },
  server: {
    label: 'Server',
    description:
      'REST API, Authentication, Caching và Microservices. Mọi kiến thức cần thiết để xây dựng backend vững chắc, có khả năng scale và bảo mật cao.',
    contributors: 2,
  },
  database: {
    label: 'Database',
    description:
      'SQL, NoSQL, Indexing, Transactions và Query Optimization. Nắm vững database là nền tảng không thể thiếu của mọi hệ thống production.',
    contributors: 1,
  },
  logical: {
    label: 'Logical',
    description:
      'Algorithms, Data Structures, Big O Notation và Design Patterns. Tư duy thuật toán là kỹ năng cốt lõi của mọi kỹ sư phần mềm.',
    contributors: 1,
  },
}

const weekSeed = getWeekSeed()

const topCategories = computed(() =>
  Object.entries(CATEGORY_META)
    .map(([id, meta]) => ({
      id,
      ...meta,
      docCount: docsStore.getByCategory(id).length,
    }))
    .sort((a, b) => b.docCount - a.docCount)
    .slice(0, 3),
)

const weeklyDocs = computed(() =>
  topCategories.value.map((cat, i) =>
    seededShuffle(docsStore.getByCategory(cat.id), weekSeed + i * 31).slice(0, 3),
  ),
)

function goToSlide(i: number) {
  currentSlide.value = i
  resetTimer()
}
function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % topCategories.value.length
}
function prevSlide() {
  currentSlide.value =
    (currentSlide.value - 1 + topCategories.value.length) % topCategories.value.length
}
function resetTimer() {
  if (slideTimer) clearInterval(slideTimer)
  slideTimer = setInterval(nextSlide, 7000)
}

// ─── Contributors Network ────────────────────────────────────────────────────
interface ContributorNode {
  login: string
  avatar_url: string
  html_url: string
  contributions: number
  x: number
  y: number
}

const networkRef     = ref<HTMLElement | null>(null)
const canvasRef      = ref<HTMLCanvasElement | null>(null)
const contributorNodes = ref<ContributorNode[]>([])

const MOCK_CONTRIBUTORS = [
  { login: 'hieurury',   contributions: 42 },
  { login: 'viet-dev',   contributions: 28 },
  { login: 'nguyen-js',  contributions: 21 },
  { login: 'tran-code',  contributions: 18 },
  { login: 'le-backend', contributions: 15 },
  { login: 'pham-sql',   contributions: 12 },
  { login: 'hoang-algo', contributions: 10 },
  { login: 'dao-web',    contributions: 8  },
  { login: 'mai-react',  contributions: 7  },
  { login: 'bui-node',   contributions: 5  },
  { login: 'ly-python',  contributions: 4  },
  { login: 'tung-cloud', contributions: 3  },
]

async function initNetwork() {
  const container = networkRef.value
  if (!container) return

  const { width, height } = container.getBoundingClientRect()
  if (canvasRef.value) {
    canvasRef.value.width  = width
    canvasRef.value.height = height
  }

  // Try GitHub API — auto-detects contributors from commit history
  let rawList: { login: string; contributions: number; avatar_url: string; html_url: string }[] =
    MOCK_CONTRIBUTORS.map(c => ({
      ...c,
      avatar_url: `https://api.dicebear.com/9.x/initials/svg?seed=${c.login}&backgroundColor=f97316,ea580c&textColor=ffffff&fontSize=40`,
      html_url: `https://github.com/${c.login}`,
    }))

  try {
    const res = await fetch('https://api.github.com/repos/hieurury/rury-docs/contributors', {
      headers: { Accept: 'application/vnd.github.v3+json' },
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        rawList = data.slice(0, 14).map((d: Record<string, unknown>) => ({
          login:         String(d.login),
          contributions: Number(d.contributions),
          avatar_url:    String(d.avatar_url),
          html_url:      String(d.html_url),
        }))
      }
    }
  } catch {
    // silence — mock data will be used
  }

  // Place nodes without heavy overlap
  const NODE = 52, PAD = 64
  const positions: { x: number; y: number }[] = []

  for (const _c of rawList) {
    let x = 0, y = 0, tries = 0
    do {
      x = PAD + Math.random() * (width  - PAD * 2 - NODE)
      y = PAD + Math.random() * (height - PAD * 2 - NODE)
      tries++
    } while (tries < 100 && positions.some(p => Math.hypot(p.x - x, p.y - y) < NODE + 24))
    positions.push({ x, y })
  }

  contributorNodes.value = rawList.map((c, i) => ({
    ...c,
    x: positions[i]?.x ?? 80 + (i % 4) * 130,
    y: positions[i]?.y ?? 80 + Math.floor(i / 4) * 130,
  }))
}

function drawLines() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const MAX = 200
  const nodes = contributorNodes.value
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const ax = nodes[i].x + 26, ay = nodes[i].y + 26
      const bx = nodes[j].x + 26, by = nodes[j].y + 26
      const d  = Math.hypot(bx - ax, by - ay)
      if (d < MAX) {
        const alpha = (1 - d / MAX) * 0.45
        ctx.beginPath()
        ctx.strokeStyle = `rgba(249,115,22,${alpha})`
        ctx.lineWidth   = 1.2
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()
      }
    }
  }
}

function startPulse() {
  document.querySelectorAll<HTMLElement>('.c-node').forEach(el => {
    gsap.to(el, {
      opacity:  0.2 + Math.random() * 0.65,
      duration: 1.5 + Math.random() * 2.5,
      repeat:   -1,
      yoyo:     true,
      delay:    Math.random() * 4,
      ease:     'sine.inOut',
    })
  })
}

// ─── GSAP Animations ─────────────────────────────────────────────────────────
onMounted(async () => {
  document.documentElement.style.scrollSnapType = 'y mandatory'

  // Hero entrance
  gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero-badge',      { opacity: 0, y: 14, duration: 0.5 })
    .from('.hero-line-1',     { opacity: 0, y: 28, duration: 0.65 }, '-=0.3')
    .from('.hero-line-2',     { opacity: 0, y: 28, duration: 0.65 }, '-=0.48')
    .from('.hero-line-3',     { opacity: 0, y: 28, duration: 0.65 }, '-=0.48')
    .from('.hero-subtitle',   { opacity: 0, y: 12, duration: 0.5  }, '-=0.32')
    .from('.hero-cta-group',  { opacity: 0, y: 8,  duration: 0.4  }, '-=0.28')
    .from('.hero-stats-row',  { opacity: 0,         duration: 0.45 }, '-=0.15')
    .from('.scroll-hint',     { opacity: 0, y: -8,  duration: 0.5  }, '-=0.1')

  // Categories
  gsap.from('.cat-eyebrow', {
    scrollTrigger: { trigger: '.categories-section', start: 'top 82%' },
    opacity: 0, y: 8, duration: 0.4,
  })
  gsap.from('.rankings-panel', {
    scrollTrigger: { trigger: '.categories-section', start: 'top 80%' },
    x: -50, opacity: 0, duration: 0.7,
  })
  gsap.from('.slide-area', {
    scrollTrigger: { trigger: '.categories-section', start: 'top 80%' },
    x: 50, opacity: 0, duration: 0.7, delay: 0.1,
  })

  // Contributors
  ScrollTrigger.create({
    trigger: '.contributors-section',
    start:   'top 80%',
    once:    true,
    onEnter: async () => {
      await initNetwork()
      await nextTick()
      drawLines()
      gsap.from('.c-node', {
        scale:   0,
        opacity: 0,
        duration: 0.55,
        stagger: { each: 0.045, from: 'random' },
        ease: 'back.out(1.7)',
        onComplete: startPulse,
      })
    },
  })

  // CTA
  gsap.from('.cta-inner', {
    scrollTrigger: { trigger: '.cta-section', start: 'top 80%' },
    y: 40, opacity: 0, duration: 0.7,
  })

  resetTimer()
})

onUnmounted(() => {
  document.documentElement.style.scrollSnapType = ''
  ScrollTrigger.getAll().forEach(t => t.kill())
  if (slideTimer) clearInterval(slideTimer)
})

const diffLabel: Record<string, string> = {
  beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao',
}
</script>

<template>
  <div class="home-page">
    <Navbar />

    <!-- ════════════════════════════════════════════════════════════
         SECTION 1 — HERO
    ════════════════════════════════════════════════════════════ -->
    <section class="section hero-section" id="home-hero">
      <!-- Ambient glow blobs -->
      <div class="hero-blob hero-blob-1" aria-hidden="true" />
      <div class="hero-blob hero-blob-2" aria-hidden="true" />

      <div class="container hero-body">
        <div class="hero-badge">
          <span class="badge-dot" aria-hidden="true" />
          Mã nguồn mở · Offline-first · Git-based
        </div>

        <h1 class="hero-title">
          <span class="hero-line-1">Học, đóng góp</span><br />
          <span class="hero-line-2 hero-accent-text">và phát triển</span><br />
          <span class="hero-line-3">cùng cộng đồng.</span>
        </h1>

        <p class="hero-subtitle">
          Rury Documents là kho tài liệu IT mã nguồn mở, offline-first, quản lý bằng Git.
          Bất kỳ ai cũng có thể đóng góp thông qua GitHub Pull Request.
        </p>

        <div class="hero-cta-group">
          <RouterLink to="/docs" class="cta-btn cta-orange">
            Xem tài liệu <ArrowRight :size="16" />
          </RouterLink>
          <a
            href="https://github.com/hieurury/rury-docs"
            target="_blank"
            rel="noopener noreferrer"
            class="cta-btn cta-ghost"
          >
            GitHub <ExternalLink :size="14" />
          </a>
        </div>

        <div class="hero-stats-row">
          <div v-for="(s, i) in heroStats" :key="i" class="hero-stat">
            <strong>{{ s.value }}</strong>
            <span>{{ s.label }}</span>
          </div>
        </div>
      </div>

      <div class="scroll-hint" aria-hidden="true">
        <div class="scroll-mouse">
          <div class="scroll-wheel" />
        </div>
        <span>Kéo xuống</span>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════════════
         SECTION 2 — CATEGORIES SLIDESHOW
    ════════════════════════════════════════════════════════════ -->
    <section class="section categories-section" id="home-categories">
      <div class="cat-header-wrap">
        <p class="cat-eyebrow">Danh mục nổi bật</p>
      </div>

      <div class="cat-wrapper">
        <!-- Left — Rankings -->
        <aside class="rankings-panel">
          <h2 class="rankings-heading">Top danh mục</h2>

          <div class="rankings-list">
            <Transition name="cat-slide" mode="out-in">
              <div v-if="topCategories.length > 0" :key="currentSlide" class="rank-item">
                <div class="rank-number" :class="['rank-gold','rank-silver','rank-bronze'][currentSlide]">
                  {{ currentSlide + 1 }}
                </div>

                <div class="rank-meta">
                  <span class="rank-name">{{ topCategories[currentSlide]?.label }}</span>
                  <div class="rank-stats">
                    <div class="rank-stat">
                      <BookOpen :size="12" class="rank-stat-icon" />
                      <div class="rank-stat-info">
                        <strong>{{ topCategories[currentSlide]?.docCount }}</strong>
                        <span>tài liệu</span>
                      </div>
                    </div>
                    <div class="rank-stat">
                      <Users :size="12" class="rank-stat-icon" />
                      <div class="rank-stat-info">
                        <strong>{{ topCategories[currentSlide]?.contributors }}</strong>
                        <span>đóng góp</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </aside>

        <!-- Right — Slide content -->
        <div class="slide-area">
          <Transition name="cat-slide" mode="out-in">
            <div :key="currentSlide" class="slide-body">
              <div class="slide-head">
                <span class="slide-rank-no">#{{ currentSlide + 1 }}</span>
                <h2 class="slide-cat-name">{{ topCategories[currentSlide]?.label }}</h2>
              </div>

              <p class="slide-desc">{{ topCategories[currentSlide]?.description }}</p>

              <div class="weekly-label">
                <BookOpen :size="13" />
                Tài liệu ngẫu nhiên tuần này
              </div>

              <div class="weekly-docs">
                <RouterLink
                  v-for="doc in weeklyDocs[currentSlide]"
                  :key="doc.slug"
                  :to="`/docs/${doc.slug}`"
                  class="wdc"
                >
                  <div class="wdc-left">
                    <span class="wdc-title">{{ doc.meta.title }}</span>
                    <div class="wdc-tags">
                      <span v-for="t in doc.meta.tags?.slice(0, 2) || []" :key="t" class="wdc-tag">
                        {{ t }}
                      </span>
                    </div>
                  </div>
                  <div class="wdc-right">
                    <span class="wdc-diff" :class="`diff-${doc.meta.difficulty || 'beginner'}`">
                      {{ diffLabel[doc.meta.difficulty || 'beginner'] }}
                    </span>
                    <ArrowRight :size="14" class="wdc-arrow" />
                  </div>
                </RouterLink>
              </div>

              <RouterLink
                v-if="topCategories[currentSlide]"
                :to="`/docs?category=${topCategories[currentSlide].id}`"
                class="slide-see-all"
              >
                Xem tất cả {{ topCategories[currentSlide].label }}
                <ArrowRight :size="13" />
              </RouterLink>
            </div>
          </Transition>

          <!-- Controls -->
          <div class="slide-controls">
            <button class="slide-ctrl" aria-label="Trước" @click="prevSlide">
              <ChevronLeft :size="18" />
            </button>
            <div class="slide-dots">
              <button
                v-for="(_, i) in topCategories"
                :key="i"
                class="slide-dot"
                :class="{ 'slide-dot--active': i === currentSlide }"
                :aria-label="`Slide ${i + 1}`"
                @click="goToSlide(i)"
              />
            </div>
            <button class="slide-ctrl" aria-label="Tiếp" @click="nextSlide">
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════════════
         SECTION 3 — CONTRIBUTORS NETWORK
    ════════════════════════════════════════════════════════════ -->
    <section class="section contributors-section" id="home-contributors">
      <div class="contrib-header">
        <p class="contrib-eyebrow">Cộng đồng</p>
        <h2 class="contrib-title">Những người đóng góp</h2>
      </div>

      <div class="network-wrap" ref="networkRef">
        <canvas class="network-canvas" ref="canvasRef" />

        <a
          v-for="(node, i) in contributorNodes"
          :key="node.login"
          :href="node.html_url"
          target="_blank"
          rel="noopener noreferrer"
          class="c-node"
          :data-index="i"
          :style="{ left: node.x + 'px', top: node.y + 'px' }"
          :aria-label="`${node.login} — ${node.contributions} commits`"
        >
          <img :src="node.avatar_url" :alt="node.login" class="c-avatar" loading="lazy" />
          <div class="c-tooltip">
            <strong>{{ node.login }}</strong>
            <span>{{ node.contributions }} commits</span>
          </div>
        </a>

        <div v-if="contributorNodes.length === 0" class="network-empty" aria-live="polite">
          <div class="loading-dots">
            <span /><span /><span />
          </div>
          <p>Đang tải danh sách người đóng góp...</p>
        </div>
      </div>

      <div class="contrib-footer">
        <a
          href="https://github.com/hieurury/rury-docs/graphs/contributors"
          target="_blank"
          rel="noopener noreferrer"
          class="cta-btn cta-ghost-dark"
        >
          <Users :size="15" />
          Xem tất cả trên GitHub
        </a>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════════════
         SECTION 4 — CTA
    ════════════════════════════════════════════════════════════ -->
    <section class="section cta-section" id="home-cta">
      <div class="container cta-inner">
        <div class="cta-icon-ring" aria-hidden="true">
          <GitFork :size="22" />
        </div>
        <p class="cta-eyebrow">Mã nguồn mở</p>
        <h2 class="cta-title">
          Sẵn sàng<br />đóng góp?
        </h2>
        <p class="cta-desc">
          Fork repository, tạo branch, viết tài liệu và tạo Pull Request.
          CI/CD tự động kiểm tra — merge ngay khi hợp lệ.
        </p>

        <div class="cta-btns">
          <a
            href="https://github.com/hieurury/rury-docs/fork"
            target="_blank"
            rel="noopener noreferrer"
            class="cta-btn cta-white"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Fork Repository
          </a>
          <RouterLink to="/contribute" class="cta-btn cta-outline-white">
            Xem hướng dẫn <ArrowRight :size="14" />
          </RouterLink>
        </div>

        <div class="cta-stats">
          <div class="cta-stat">
            <strong>{{ docsStore.docs.length }}+</strong>
            <span>Tài liệu</span>
          </div>
          <div class="cta-stat">
            <strong>{{ docsStore.allExercises.length }}+</strong>
            <span>Bài tập</span>
          </div>
          <div class="cta-stat">
            <strong>MIT</strong>
            <span>License</span>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
/* ─────────────────────────────────────────────────────────────────────────────
   SHARED
───────────────────────────────────────────────────────────────────────────── */
.home-page {
  overflow-x: hidden;
}

.section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

/* CTA buttons */
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, background 0.2s ease;
  white-space: nowrap;
  user-select: none;
}

.cta-orange {
  background: #f97316;
  color: #fff;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.35);
}
.cta-orange:hover {
  background: #ea580c;
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(249, 115, 22, 0.45);
}

.cta-ghost {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  backdrop-filter: blur(4px);
}
.cta-ghost:hover {
  background: var(--bg-2);
  border-color: var(--border-strong);
}

.cta-ghost-dark {
  background: rgba(249, 115, 22, 0.1);
  color: #fb923c;
  border: 1px solid rgba(249, 115, 22, 0.3);
}
.cta-ghost-dark:hover {
  background: rgba(249, 115, 22, 0.18);
  transform: translateY(-1px);
}

.cta-white {
  background: #fff;
  color: #1a0f06;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
.cta-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.cta-outline-white {
  background: transparent;
  color: #fff;
  border: 1.5px solid rgba(255, 255, 255, 0.45);
}
.cta-outline-white:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.7);
  transform: translateY(-1px);
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 1 — HERO
───────────────────────────────────────────────────────────────────────────── */
.hero-section {
  background: var(--bg);
  color: var(--text);
  padding: 5rem 0 3rem;
  justify-content: center;
  gap: 0;
  position: relative;
}

.hero-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(to right, var(--border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.3;
  mask-image: linear-gradient(to bottom, black 20%, transparent 80%);
  -webkit-mask-image: linear-gradient(to bottom, black 20%, transparent 80%);
  pointer-events: none;
  z-index: 0;
}

/* Glow blobs */
.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
.hero-blob-1 {
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, var(--hero-glow-1) 0%, transparent 70%);
  top: -80px;
  left: -100px;
}
.hero-blob-2 {
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, var(--hero-glow-2) 0%, transparent 70%);
  bottom: 60px;
  right: 10%;
}

.hero-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 720px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.875rem;
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.3);
  border-radius: 4px;
  color: #fb923c;
  font-size: 0.8125rem;
  font-weight: 500;
  align-self: flex-start;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: #f97316;
  border-radius: 50%;
  animation: pulse-dot 2s ease infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.7); }
}

.hero-title {
  font-size: clamp(2.25rem, 6vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.08;
  color: var(--text);
  margin: 0;
}

.hero-accent-text { color: #f97316; }

.hero-subtitle {
  font-size: 1rem;
  color: var(--text-2);
  line-height: 1.7;
  max-width: 52ch;
  margin: 0;
}

.hero-cta-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero-stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding-top: 0.5rem;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.hero-stat strong {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--text);
  line-height: 1;
}
.hero-stat span {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* Scroll hint */
.scroll-hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.scroll-mouse {
  width: 20px;
  height: 30px;
  border: 1.5px solid var(--border-strong);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

.scroll-wheel {
  width: 2px;
  height: 6px;
  background: #f97316;
  border-radius: 2px;
  animation: scroll-wheel 1.8s ease infinite;
}

@keyframes scroll-wheel {
  0%   { transform: translateY(0); opacity: 1; }
  80%  { opacity: 0; }
  100% { transform: translateY(10px); opacity: 0; }
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 2 — CATEGORIES SLIDESHOW
───────────────────────────────────────────────────────────────────────────── */
.categories-section {
  background: var(--bg-2);
  color: var(--text);
  padding: 4rem 0;
  gap: 2rem;
  overflow: hidden;
}

.cat-header-wrap {
  padding: 0 5vw;
  width: 100%;
}

.cat-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #f97316;
  margin: 0;
}

.cat-wrapper {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 2.5rem;
  width: 100%;
  padding: 0 5vw;
}

/* Rankings panel */
.rankings-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.rankings-heading {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}

.rankings-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rank-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  text-align: center;
}

.rank-number {
  font-size: 10rem;
  font-weight: 900;
  line-height: 0.8;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  flex-shrink: 0;
  padding-top: 0.2rem;
  margin-bottom: 0.5rem;
}

.rank-gold   { background-image: linear-gradient(135deg, #fbbf24, #d97706); }
.rank-silver { background-image: linear-gradient(135deg, #cbd5e1, #64748b); }
.rank-bronze { background-image: linear-gradient(135deg, #d4a96a, #92400e); }

.rank-meta { flex: 1; min-width: 0; }
.rank-name {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 1rem;
}
.rank-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
}
.rank-stat {
  display: flex;
  align-items: center;
  text-align: left;
  gap: 0.375rem;
}
.rank-stat-icon { color: #d97706; margin-top: 2px; }
.rank-stat-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.rank-stat-info strong { font-size: 0.875rem; font-weight: 700; color: var(--text); }
.rank-stat-info span { font-size: 0.6875rem; color: var(--text-muted); font-weight: 500; }



/* Slide area */
.slide-area {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  min-height: 320px;
}

/* Slide transition */
.cat-slide-enter-active,
.cat-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.cat-slide-enter-from { opacity: 0; transform: translateX(18px); }
.cat-slide-leave-to   { opacity: 0; transform: translateX(-14px); }

.slide-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.slide-head { display: flex; align-items: baseline; gap: 0.625rem; }

.slide-rank-no {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: #f97316;
  font-weight: 700;
}

.slide-cat-name {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0;
}

.slide-desc {
  font-size: 0.9rem;
  color: var(--text-2);
  line-height: 1.65;
  margin: 0;
}

.weekly-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #c2764a;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Weekly doc cards */
.weekly-docs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  height: 130px;
}

.wdc {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg);
  border-radius: 4px;
  text-decoration: none;
  color: inherit;
  gap: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  height: 100%;
}
.wdc:hover {
  background: var(--bg-3);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.12);
  transform: translateY(-2px);
}

.wdc-left { flex: 1; min-width: 0; }
.wdc-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}
.wdc-tags { display: flex; flex-wrap: wrap; gap: 0.25rem; }
.wdc-tag {
  font-size: 0.7rem;
  color: var(--text-2);
  background: var(--bg-2);
  border-radius: 2px;
  padding: 0.1rem 0.35rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.wdc-right { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; margin-top: auto; border-top: 1px solid var(--border); padding-top: 0.5rem; }

.wdc-diff {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.45rem;
  border-radius: 2px;
}
.diff-beginner     { background: #fef9ee; color: #d97706; }
.diff-intermediate { background: #fff0e1; color: #c2410c; }
.diff-advanced     { background: #1a0f06; color: #f97316; }

.wdc-arrow { color: #c2764a; transition: transform 0.15s ease; }
.wdc:hover .wdc-arrow { transform: translateX(3px); }

.slide-see-all {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #f97316;
  text-decoration: none;
  margin-top: auto;
  transition: gap 0.15s ease;
}
.slide-see-all:hover { gap: 0.55rem; }

/* Slide controls */
.slide-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}

.slide-ctrl {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.15s ease;
}
.slide-ctrl:hover { background: #f97316; color: #fff; border-color: #f97316; }

.slide-dots { display: flex; gap: 0.375rem; flex: 1; justify-content: center; }

.slide-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: none;
  background: var(--border-strong);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}
.slide-dot--active {
  background: #f97316;
  width: 20px;
  border-radius: 3px;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 3 — CONTRIBUTORS NETWORK
───────────────────────────────────────────────────────────────────────────── */
.contributors-section {
  background: var(--bg);
  color: var(--text);
  padding: 4rem 0;
  gap: 2rem;
}

.contrib-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  padding: 0 1.5rem;
}

.contrib-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #f97316;
  margin: 0;
}

.contrib-title {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--text);
  margin: 0;
}

.contrib-note {
  font-size: 0.875rem;
  color: var(--text-2);
  text-align: center;
  line-height: 1.6;
  margin: 0;
}

/* Network canvas area */
.network-wrap {
  position: relative;
  width: min(960px, 94vw);
  height: 480px;
}

.network-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Contributor nodes */
.c-node {
  position: absolute;
  width: 52px;
  height: 52px;
  text-decoration: none;
  z-index: 2;
}

.c-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(249, 115, 22, 0.35);
  box-shadow: 0 0 0 0 rgba(249, 115, 22, 0);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  background: var(--bg-2);
}

.c-node:hover .c-avatar {
  border-color: #f97316;
  box-shadow: 0 0 18px rgba(249, 115, 22, 0.55), 0 0 40px rgba(249, 115, 22, 0.2);
  transform: scale(1.15);
}

.c-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) translateY(4px) scale(0.9);
  background: var(--bg-invert);
  border: 1px solid var(--border-invert);
  color: var(--text-invert);
  padding: 0.4rem 0.7rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease, transform 0.18s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}
.c-tooltip strong { color: #f97316; font-size: 0.8125rem; }
.c-tooltip span   { color: var(--text-muted); font-size: 0.7rem; }

.c-node:hover .c-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}

/* Loading */
.network-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.loading-dots {
  display: flex;
  gap: 0.375rem;
}
.loading-dots span {
  width: 8px;
  height: 8px;
  background: #f97316;
  border-radius: 50%;
  animation: loading-bounce 1.2s ease infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }

@keyframes loading-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%            { transform: scale(1);   opacity: 1; }
}

.contrib-footer { padding-bottom: 1rem; }

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 4 — CTA
───────────────────────────────────────────────────────────────────────────── */
.cta-section {
  background: linear-gradient(140deg, #f97316 0%, #c2410c 60%, #7c2d12 100%);
  color: #fff;
  padding: 4rem 0;
}

.cta-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.25rem;
}

.cta-icon-ring {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  backdrop-filter: blur(4px);
}

.cta-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.cta-title {
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 900;
  letter-spacing: -0.035em;
  line-height: 1.05;
  color: #fff;
  margin: 0;
}

.cta-desc {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.75);
  max-width: 44ch;
  line-height: 1.65;
  margin: 0;
}

.cta-btns { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; }

.cta-stats {
  display: flex;
  gap: 2.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 0.5rem;
}

.cta-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}
.cta-stat strong {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.03em;
  line-height: 1;
}
.cta-stat span {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.02em;
}

/* ─────────────────────────────────────────────────────────────────────────────
   RESPONSIVE
───────────────────────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .cat-wrapper {
    grid-template-columns: 1fr;
  }
  .rankings-list {
    flex-direction: row;
    overflow-x: auto;
    gap: 0.5rem;
    padding-bottom: 0.25rem;
  }
  .rank-item { flex-direction: row; min-width: 260px; padding: 0.75rem 0; align-items: center; gap: 1.5rem; }
  .rank-number { font-size: 4rem; width: auto; padding-top: 0; margin-bottom: 0; }
  .rank-name { font-size: 1.5rem; margin-bottom: 0.5rem; }
  .rank-stats { gap: 1rem; }
  .weekly-docs { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(3, 1fr); height: 380px; }
  .network-wrap { height: 360px; width: 92vw; }
}

@media (max-width: 600px) {
  .hero-section { padding: 4rem 0 2.5rem; }
  .hero-stats-row { gap: 1.25rem; }
  .hero-blob-1, .hero-blob-2 { display: none; }
  .section { min-height: auto; padding: 4rem 0; }
  .hero-section { min-height: 100vh; }
  .weekly-docs { grid-template-columns: 1fr; grid-template-rows: repeat(6, 1fr); height: auto; gap: 0.5rem; }
  .cta-stats { gap: 1.5rem; }
  .network-wrap { height: 280px; }
}
</style>