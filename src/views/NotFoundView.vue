<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useRoute } from 'vue-router'
import { ArrowLeft } from '@lucide/vue'

const route = useRoute()
</script>

<template>
  <div class="not-found-page">
    <div class="not-found-inner">
      <span class="not-found-code">404</span>
      <h1 class="not-found-title">Trang không tồn tại</h1>
      <p class="not-found-desc">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <div class="not-found-actions">
        <RouterLink to="/" class="btn btn-primary">
          <ArrowLeft :size="15" />
          Về trang chủ
        </RouterLink>
        <RouterLink to="/docs" class="btn">
          Xem tài liệu
        </RouterLink>
      </div>
      <p class="not-found-path">
        <code>{{ route.path }}</code>
      </p>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}

.not-found-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
}

.not-found-code {
  font-family: var(--font-mono);
  font-size: 5rem;
  font-weight: 700;
  color: var(--border);
  letter-spacing: -0.05em;
  line-height: 1;
}

.not-found-title {
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.01em;
}

.not-found-desc {
  font-size: 0.9375rem;
  color: var(--text-2);
  max-width: 36ch;
  line-height: 1.6;
}

.not-found-actions {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-top: 0.5rem;
}

.not-found-path {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}
</style>
