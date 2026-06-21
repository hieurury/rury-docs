<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Menu, X } from '@lucide/vue'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()
const mobileOpen = ref(false)
const isScrolled = ref(false)

const navLinks = [
  { to: '/docs',       label: 'Tài liệu' },
  { to: '/editor',     label: 'Editor' },
  { to: '/code-block', label: 'Code Block' },
  { to: '/contribute', label: 'Đóng góp' },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function closeMobile() {
  mobileOpen.value = false
}

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header class="navbar" :class="{ 'navbar--scrolled': isScrolled }">
    <div class="container navbar-inner">
      <!-- Logo -->
      <RouterLink to="/" class="navbar-logo" @click="closeMobile">
        <img src="/logo.png" alt="Rury Docs" class="logo-img" />
      </RouterLink>

      <!-- Desktop nav -->
      <nav class="navbar-nav" aria-label="Điều hướng chính">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :class="{ 'nav-link--active': isActive(link.to) }"
        >
          {{ link.label }}
          <span v-if="isActive(link.to)" class="nav-underline" />
        </RouterLink>
      </nav>

      <!-- Right controls -->
      <div class="navbar-right">
        <ThemeToggle />

        <a
          href="https://github.com/hieurury/rury-docs"
          target="_blank"
          rel="noopener noreferrer"
          class="navbar-gh"
          aria-label="GitHub repository"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
        </a>

        <!-- Mobile toggle -->
        <button
          class="mobile-btn"
          :aria-label="mobileOpen ? 'Đóng menu' : 'Mở menu'"
          @click="mobileOpen = !mobileOpen"
        >
          <Transition name="menu-icon" mode="out-in">
            <X v-if="mobileOpen" :size="17" />
            <Menu v-else :size="17" />
          </Transition>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="mobile-nav">
      <div v-if="mobileOpen" class="mobile-menu">
        <div class="container mobile-menu-inner">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="mobile-link"
            :class="{ 'mobile-link--active': isActive(link.to) }"
            @click="closeMobile"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
/* ── Navbar shell ── */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease;
}

.navbar--scrolled {
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}

.navbar-inner {
  display: flex;
  align-items: center;
  height: 56px;
  gap: 2rem;
}

/* ── Logo ── */
.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0;
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: -0.01em;
}

.logo-img {
  height: 36px;
  width: auto;
}

/* ── Desktop nav ── */
.navbar-nav {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 450;
  color: var(--text-2);
  text-decoration: none;
  transition: color 0.15s;
}

.nav-link:hover { color: var(--text); }

.nav-link--active {
  color: #f97316;
  font-weight: 600;
}

.nav-underline {
  position: absolute;
  bottom: -1px; /* align with navbar bottom border */
  left: 0.75rem;
  right: 0.75rem;
  height: 2px;
  background: #f97316;
  border-radius: 1px 1px 0 0;
}

/* ── Right ── */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
}

.navbar-gh {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem;
  border-radius: 2px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}

.navbar-gh:hover {
  color: var(--text);
  background: var(--bg-2);
}

/* ── Mobile toggle ── */
.mobile-btn {
  display: none;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  border: none;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
  border-radius: 2px;
  transition: color 0.15s, background 0.15s;
}

.mobile-btn:hover {
  color: var(--text);
  background: var(--bg-2);
}

/* ── Mobile menu ── */
.mobile-menu {
  border-top: 1px solid var(--border);
  background: var(--bg);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.mobile-menu-inner {
  display: flex;
  flex-direction: column;
  padding: 0.625rem 0;
  gap: 0.125rem;
}

.mobile-link {
  display: block;
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-2);
  text-decoration: none;
  border-radius: 2px;
  transition: color 0.15s, background 0.15s;
}

.mobile-link:hover,
.mobile-link--active {
  color: #f97316;
  background: rgba(249, 115, 22, 0.07);
}

/* ── Transitions ── */
.menu-icon-enter-active,
.menu-icon-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.menu-icon-enter-from { opacity: 0; transform: rotate(-20deg) scale(0.8); }
.menu-icon-leave-to   { opacity: 0; transform: rotate(20deg) scale(0.8); }

.mobile-nav-enter-active,
.mobile-nav-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.mobile-nav-enter-from { opacity: 0; transform: translateY(-6px); }
.mobile-nav-leave-to   { opacity: 0; transform: translateY(-4px); }

/* ── Responsive ── */
@media (max-width: 720px) {
  .navbar-nav { display: none; }
  .mobile-btn { display: inline-flex; }
}
</style>
