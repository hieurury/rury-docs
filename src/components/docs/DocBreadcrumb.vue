<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ChevronRight } from '@lucide/vue'

interface Crumb {
  label: string
  to?: string
}

defineProps<{
  crumbs: Crumb[]
}>()
</script>

<template>
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol class="breadcrumb-list">
      <li>
        <RouterLink to="/" class="breadcrumb-link">Trang chủ</RouterLink>
      </li>
      <li
        v-for="(crumb, i) in crumbs"
        :key="i"
        class="breadcrumb-item"
      >
        <ChevronRight :size="13" class="breadcrumb-sep" />
        <RouterLink
          v-if="crumb.to"
          :to="crumb.to"
          class="breadcrumb-link"
        >
          {{ crumb.label }}
        </RouterLink>
        <span v-else class="breadcrumb-current">{{ crumb.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb {
  margin-bottom: 1.5rem;
}

.breadcrumb-list {
  list-style: none;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.125rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.breadcrumb-sep {
  color: var(--text-muted);
}

.breadcrumb-link {
  font-size: 0.8125rem;
  color: var(--text-muted);
  text-decoration: none;
  padding: 0.1rem 0.2rem;
  border-radius: var(--radius-sm);
  transition: color var(--transition);
}

.breadcrumb-link:hover { color: var(--text); }

.breadcrumb-current {
  font-size: 0.8125rem;
  color: var(--text-2);
  padding: 0.1rem 0.2rem;
}
</style>
