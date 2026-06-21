import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const stored = localStorage.getItem('rury-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  const isDark = ref(stored ? stored === 'dark' : prefersDark)

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem('rury-theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  // Apply immediately on store init
  applyTheme()

  return { isDark, toggle }
})
