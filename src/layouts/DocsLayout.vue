<script setup lang="ts">
import Navbar from '@/components/common/Navbar.vue'
import Footer from '@/components/common/Footer.vue'

// No props — sidebar slot presence is detected via useSlots
import { useSlots, computed } from 'vue'

const slots = useSlots()
const hasSidebar = computed(() => !!slots.sidebar)
</script>

<template>
  <div class="layout-docs">
    <Navbar />

    <div
      class="layout-docs-body container"
      :class="hasSidebar ? 'layout-docs-body--with-sidebar' : 'layout-docs-body--full'"
    >
      <!-- Only render aside when slot has content -->
      <aside v-if="hasSidebar" class="layout-sidebar">
        <slot name="sidebar" />
      </aside>

      <main class="layout-content">
        <slot />
      </main>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.layout-docs {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ── With sidebar: 2-column grid ── */
.layout-docs-body {
  flex: 1;
  align-items: start;
  padding-top: 80px; /* below fixed navbar */
  padding-bottom: 5rem;
}

.layout-docs-body--with-sidebar {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2.5rem;
}

/* ── No sidebar: single centred column ── */
.layout-docs-body--full {
  display: block;
  max-width: 860px;
}

/* Sidebar */
.layout-sidebar {
  position: sticky;
  top: 72px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  padding-top: 0.5rem;
}

/* Main content */
.layout-content {
  min-width: 0;
  padding-top: 0.5rem;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .layout-docs-body--with-sidebar {
    grid-template-columns: 1fr;
  }

  .layout-sidebar {
    position: static;
    max-height: none;
    padding-bottom: 1rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);
  }

  .layout-docs-body--full {
    max-width: 100%;
  }
}
</style>
