<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="layout-editor">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <button @click="goBack" class="btn-back">
          <ArrowLeft :size="18" />
          <span>Trang chủ</span>
        </button>
        <ThemeToggle />
      </div>
      <div class="toolbar-actions">
        <slot name="actions" />
      </div>
    </div>
    <main class="editor-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--bg);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 1rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-2);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.btn-back:hover {
  color: var(--text);
  background: var(--bg-2);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
