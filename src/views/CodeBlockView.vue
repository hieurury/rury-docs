<script setup lang="ts">
import Navbar from '@/components/common/Navbar.vue'
import Footer from '@/components/common/Footer.vue'
import { Code2, Hammer } from 'lucide-vue-next'
</script>

<template>
  <div class="code-block-page">
    <Navbar />
    
    <main class="main-content">
      <div class="dev-container">
        <div class="dev-icon-wrapper">
          <Code2 :size="48" class="dev-icon-bg" />
          <Hammer :size="24" class="dev-icon-fg" />
        </div>
        
        <h1 class="dev-title">Trang Code Block Đang Phát Triển</h1>
        <p class="dev-desc">
          Tính năng chia sẻ và lưu trữ các đoạn code (Code Block) đang trong quá trình xây dựng. 
          <br />Chúng tôi sẽ sớm ra mắt tính năng này trong các phiên bản tiếp theo.
        </p>
        
        <RouterLink to="/" class="dev-btn">
          Quay lại Trang Chủ
        </RouterLink>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.code-block-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 1rem 4rem;
}

.dev-container {
  text-align: center;
  max-width: 600px;
  padding: 3rem;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 24px rgba(0,0,0,0.05);
}

.dev-icon-wrapper {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  color: #f97316;
}

.dev-icon-bg {
  opacity: 0.2;
}

.dev-icon-fg {
  position: absolute;
  bottom: 0;
  right: 0;
  color: #f97316;
  background: var(--bg-2);
  padding: 4px;
  border-radius: 50%;
  border: 2px solid #f97316;
}

.dev-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1rem;
}

.dev-desc {
  font-size: 1rem;
  color: var(--text-2);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.dev-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f97316;
  color: #fff;
  font-weight: 600;
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.2s;
}

.dev-btn:hover {
  background: #ea580c;
  transform: translateY(-2px);
}
</style>
