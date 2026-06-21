<script setup lang="ts">
import { RouterLink } from 'vue-router'

const year = new Date().getFullYear()

const footerGroups = [
  {
    title: 'Học tập',
    links: [
      { to: '/docs',       label: 'Tài liệu' },
      { to: '/editor',     label: 'Markdown Editor' },
      { to: '/code-block', label: 'Code Block' },
    ],
  },
  {
    title: 'Cộng đồng',
    links: [
      { to:   '/contribute',                                          label: 'Hướng dẫn đóng góp' },
      { href: 'https://github.com/hieurury/rury-docs',               label: 'GitHub Repository' },
    ],
  },
]
</script>

<template>
  <footer class="footer">
    <div class="container footer-inner">

      <!-- ── Top grid ── -->
      <div class="footer-top">

        <!-- Brand column -->
        <div class="footer-brand">
          <RouterLink to="/" class="footer-logo">
            <img src="/logo.png" alt="Rury Docs" class="logo-img" />
          </RouterLink>

          <p class="footer-tagline">
            Kho tài liệu IT mã nguồn mở.<br />
            Cộng đồng đóng góp qua GitHub Pull Request.
          </p>

          <div class="footer-chips">
            <span class="chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              Offline-first
            </span>
            <span class="chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>
              Git-based
            </span>
            <span class="chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              Open Source
            </span>
          </div>
        </div>

        <!-- Link columns -->
        <div class="footer-links">
          <div
            v-for="group in footerGroups"
            :key="group.title"
            class="footer-col"
          >
            <h4 class="col-title">{{ group.title }}</h4>
            <ul class="col-list">
              <li v-for="link in group.links" :key="link.label">
                <RouterLink
                  v-if="'to' in link"
                  :to="link.to!"
                  class="col-link"
                >
                  {{ link.label }}
                </RouterLink>
                <a
                  v-else
                  :href="link.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="col-link col-link--ext"
                >
                  {{ link.label }}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

      </div>

      <!-- ── Bottom bar ── -->
      <div class="footer-bottom">
        <span class="footer-copy">© {{ year }} Rury Documents · MIT License</span>

        <a
          href="https://github.com/hieurury/rury-docs"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-gh"
          aria-label="GitHub"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
        </a>
      </div>

    </div>
  </footer>
</template>

<style scoped>
/* ── Shell ── */
.footer {
  background: var(--bg);
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.footer-inner {
  padding: 3rem 0 1.5rem;
}

/* ── Top grid ── */
.footer-top {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 4rem;
  margin-bottom: 2.5rem;
}

/* ── Brand ── */
.footer-logo {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 0.875rem;
}

.logo-img {
  height: 44px;
  width: auto;
}

.footer-tagline {
  font-size: 0.8375rem;
  color: var(--text-muted);
  line-height: 1.65;
  margin-bottom: 1.25rem;
}

.footer-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--bg-2);
  padding: 0.225rem 0.55rem;
  border-radius: 2px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

/* ── Link columns ── */
.footer-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
}

.col-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1rem;
}

.col-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.col-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.875rem;
  color: var(--text-2);
  text-decoration: none;
  transition: color 0.15s;
}

.col-link:hover { color: #f97316; }

.col-link--ext svg { opacity: 0.5; }
.col-link--ext:hover svg { opacity: 1; }

/* ── Bottom bar ── */
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.footer-copy {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.footer-gh {
  display: inline-flex;
  padding: 0.3rem;
  border-radius: 2px;
  color: var(--text-muted);
  transition: color 0.15s, background 0.15s;
}
.footer-gh:hover {
  color: var(--text);
  background: var(--bg-2);
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .footer-top {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

@media (max-width: 600px) {
  .footer-links { grid-template-columns: 1fr 1fr; }
  .footer-inner { padding: 2rem 0 1.25rem; }
}
</style>
