<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { Sun, Moon } from '@lucide/vue'

const theme = useThemeStore()
</script>

<template>
  <button
    class="btn btn-icon theme-toggle"
    :title="theme.isDark ? 'Chuyển sang Light mode' : 'Chuyển sang Dark mode'"
    :aria-label="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="theme.toggle"
  >
    <Transition name="theme-icon" mode="out-in">
      <Sun v-if="theme.isDark" :size="17" :stroke-width="1.75" />
      <Moon v-else :size="17" :stroke-width="1.75" />
    </Transition>
  </button>
</template>

<style scoped>
.theme-toggle {
  position: relative;
  overflow: hidden;
}

.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-30deg) scale(0.8);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(30deg) scale(0.8);
}
</style>
