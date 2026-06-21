<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { RouterLink } from 'vue-router'
import { GitFork, GitBranch, GitPullRequest, Shield, FileText, ArrowRight, FileEdit } from '@lucide/vue'

const workflowSteps = [
  {
    num: '01',
    icon: GitFork,
    title: 'Fork repository',
    desc: 'Bắt đầu bằng việc fork kho lưu trữ rury-docs về tài khoản GitHub cá nhân của bạn. Sau đó clone về máy tính để tiến hành chỉnh sửa.',
    code: `gh repo fork hieurury/rury-docs\ngit clone https://github.com/hieurury/rury-docs.git`,
  },
  {
    num: '02',
    icon: GitBranch,
    title: 'Tạo nhánh mới (Branch)',
    desc: 'Hãy tạo một nhánh mới từ nhánh main để làm việc. Đặt tên nhánh theo chuẩn: docs/<tên_nhánh>.',
    code: 'git checkout -b docs/javascript-promise',
  },
  {
    num: '03',
    icon: FileEdit,
    title: 'Chỉnh sửa meta.json',
    desc: 'Khai báo siêu dữ liệu của tài liệu thông qua meta.json. Một số ràng buộc bắt buộc:',
    constraints: [
      'type: "document" (đơn) hoặc "series" (bộ).',
      'difficulty: "beginner", "intermediate", "advanced".',
      'author: Yêu cầu thông tin name và email.'
    ],
    code: `{\n  "title": "Tên bài",\n  "type": "document",\n  "difficulty": "beginner"\n}`,
    actionLink: { url: '/editor', text: 'Sử dụng Meta Editor' }
  },
  {
    num: '04',
    icon: FileText,
    title: 'Soạn cấu trúc tài liệu',
    desc: 'Tạo thư mục tài liệu tương ứng. Tuỳ thuộc vào dạng tài liệu (đơn hay bộ), cấu trúc cây thư mục sẽ khác nhau.',
    code: `// 1. Tài liệu đơn
docs/
└── <tên_nhánh>/
    ├── config.json
    ├── meta.json
    └── document.md

// 2. Bộ tài liệu
docs/
└── <tên_nhánh>/
    ├── config.json
    ├── meta.json
    ├── <thư_mục_tài_liệu_1>/
    │   ├── meta.json
    │   ├── document.md
    │   └── config.json
    └── <thư_mục_tài_liệu_2>/
        ├── meta.json
        ├── document.md
        └── config.json`,
    actionLink: { url: '/editor', text: 'Sử dụng Markdown Editor' }
  },
  {
    num: '05',
    icon: GitPullRequest,
    title: 'Tạo Pull Request',
    desc: 'Hoàn tất chỉnh sửa, commit và push nhánh lên fork của bạn. Cuối cùng, tạo một Pull Request về repository gốc để review.',
    code: `git add .\ngit commit -m "feat: add js promise doc"\ngit push origin docs/javascript-promise`,
  },
]
</script>

<template>
  <DefaultLayout>
    <div class="contribute-page">
      <div class="container">

        <!-- Hero -->
        <div class="page-header">
          <h1 class="page-title">Hướng dẫn đóng góp</h1>
          <p class="page-subtitle">
            Mọi người đều có thể đóng góp tài liệu. Quy trình minh bạch, an toàn và tự động kiểm duyệt.
          </p>
        </div>

        <!-- Workflow steps -->
        <section class="section">
          <h2 class="section-title">Quy trình đóng góp</h2>

          <div class="workflow">
            <div
              v-for="(step, i) in workflowSteps"
              :key="i"
              class="workflow-step"
            >
              <div class="step-marker">
                <span class="step-num">{{ step.num }}</span>
                <div class="step-icon">
                  <component :is="step.icon" :size="20" />
                </div>
              </div>
              <div class="step-body">
                <h3 class="step-title">{{ step.title }}</h3>
                <p class="step-desc">{{ step.desc }}</p>
                <div v-if="step.constraints" class="step-constraints">
                  <ul>
                    <li v-for="(c, idx) in step.constraints" :key="idx">{{ c }}</li>
                  </ul>
                </div>
                <pre class="step-code"><code>{{ step.code }}</code></pre>
                <div v-if="step.actionLink" class="step-action">
                  <RouterLink :to="step.actionLink.url" class="btn-link">
                    {{ step.actionLink.text }} <ArrowRight :size="14" />
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Rules -->
        <section class="section">
          <h2 class="section-title">Quy tắc quan trọng</h2>
          <div class="rules-grid">
            <div class="rule-card rule-card--ok">
              <h3 class="rule-title">✓ Được phép</h3>
              <ul class="rule-list">
                <li>Tạo tài liệu mới trong phạm vi branch của bạn</li>
                <li>Chỉnh sửa nội dung file markdown và <code>meta.json</code></li>
                <li>Thêm hình ảnh/tài nguyên vào thư mục tài liệu</li>
                <li>Fix các lỗi sai chính tả (typo) trong tài liệu sẵn có</li>
              </ul>
            </div>
            <div class="rule-card rule-card--no">
              <h3 class="rule-title">✗ Không được phép</h3>
              <ul class="rule-list">
                <li>Chỉnh sửa file cấu hình hệ thống <code>config.json</code></li>
                <li>Chỉnh sửa tài liệu của người khác nếu không liên quan đến PR của bạn</li>
                <li>Gom quá nhiều document rác vào chung một PR</li>
                <li>Thay đổi kiến trúc chung hoặc mã nguồn của Website</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- meta.json example -->
        <section class="section">
          <h2 class="section-title">Gợi ý cấu hình meta.json</h2>
          <p class="section-desc">Mọi tài liệu hoặc thư mục bộ tài liệu đều phải có file <code>meta.json</code>. Đây là ví dụ chuẩn:</p>
          <pre class="meta-code"><code>{
  "type": "document",
  "title": "Khai báo biến trong JavaScript",
  "description": "Tìm hiểu về var, let, và const.",
  "category": "javascript",
  "difficulty": "beginner",
  "tags": ["js", "variables", "let", "const"]
}</code></pre>
        </section>

        <!-- CTA -->
        <div class="contribute-cta">
          <div class="cta-icon">
            <Shield :size="24" />
          </div>
          <div class="cta-content">
            <strong>Hệ thống tự động kiểm duyệt (CI/CD)</strong>
            <span>Mọi Pull Request đều được chạy tự động kiểm tra cú pháp, cấu trúc và meta.json trước khi admin xét duyệt.</span>
          </div>
          <a
            href="https://github.com/hieurury/rury-docs"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary btn-sm cta-btn"
          >
            Mở GitHub <ArrowRight :size="14" />
          </a>
        </div>

      </div>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.contribute-page { padding: 3rem 0 6rem; }
.page-header { margin-bottom: 3.5rem; text-align: center; }
.page-title { font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; color: var(--text); margin-bottom: 0.75rem; }
.page-subtitle { font-size: 1rem; color: var(--text-2); max-width: 60ch; margin: 0 auto; line-height: 1.6; }

.section { margin-bottom: 4rem; }
.section-title { font-size: 1.25rem; font-weight: 700; color: var(--text); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
.section-desc { font-size: 0.95rem; color: var(--text-2); margin-bottom: 1.5rem; }

/* Workflow */
.workflow { 
  display: grid; 
  grid-template-columns: repeat(2, 1fr); 
  gap: 1.5rem; 
  align-items: stretch;
}

.workflow-step {
  display: flex;
  gap: 1.25rem;
  padding: 1.75rem;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
  height: 100%;
}

.workflow-step:hover {
  border-color: var(--primary);
  box-shadow: 0 8px 24px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}

.step-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.step-num { 
  font-family: 'JetBrains Mono', monospace; 
  font-size: 0.75rem; 
  font-weight: 700;
  color: var(--text-muted); 
  letter-spacing: 0.1em;
}

.step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--bg);
  color: var(--primary);
  border-radius: 50%;
  border: 1px solid var(--border);
}

.step-body { 
  flex: 1; 
  min-width: 0; 
  display: flex;
  flex-direction: column;
}

.step-title { font-size: 1.05rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; }
.step-desc { font-size: 0.9rem; color: var(--text-2); line-height: 1.6; margin-bottom: 0.75rem; }

.step-constraints {
  font-size: 0.85rem;
  color: var(--text-2);
  margin-bottom: 1.25rem;
}
.step-constraints ul {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.step-code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.825rem;
  background: #1e1e20;
  color: #e4e4e7;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md);
  margin: 0 0 1.25rem 0;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
  border: 1px solid #2e2e30;
}

.step-action {
  margin-top: auto;
}

.btn-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--primary);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  transition: opacity 0.2s;
}
.btn-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* Rules */
.rules-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 1.5rem; 
}

.rule-card { 
  padding: 2rem; 
  border-radius: var(--radius-lg); 
  border: 1px solid transparent;
}

.rule-card--ok { 
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.2);
}

.rule-card--ok .rule-title { color: #10b981; }

.rule-card--no { 
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.rule-card--no .rule-title { color: #ef4444; }

.rule-title { 
  font-size: 1.1rem; 
  font-weight: 700; 
  margin-bottom: 1.25rem; 
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rule-list { 
  list-style: none; 
  display: flex; 
  flex-direction: column; 
  gap: 0.75rem; 
  margin: 0;
  padding: 0;
}

.rule-list li { 
  font-size: 0.925rem; 
  color: var(--text-2); 
  line-height: 1.5;
  padding-left: 1.25rem;
  position: relative;
}

.rule-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: inherit;
  opacity: 0.5;
}

.rule-list code {
  font-size: 0.85em;
  background: var(--bg);
  padding: 0.1em 0.3em;
  border-radius: 3px;
  font-family: 'JetBrains Mono', monospace;
}

/* Meta Code Block */
.meta-code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  background: #1e1e20;
  color: #e4e4e7;
  padding: 1.5rem 2rem;
  border-radius: var(--radius-lg);
  border: 1px solid #2e2e30;
  line-height: 1.6;
}

/* CTA */
.contribute-cta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--radius-lg);
  background: linear-gradient(145deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.1) 100%);
}

.cta-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: rgba(99, 102, 241, 0.15);
  color: var(--primary);
  border-radius: 50%;
  flex-shrink: 0;
}

.cta-content { flex: 1; }
.cta-content strong { display: block; font-size: 1.1rem; color: var(--text); margin-bottom: 0.25rem; }
.cta-content span { font-size: 0.95rem; color: var(--text-2); line-height: 1.5; }

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  white-space: nowrap;
}

@media (max-width: 900px) {
  .workflow { grid-template-columns: 1fr; }
  .rules-grid { grid-template-columns: 1fr; }
  .contribute-cta { flex-direction: column; text-align: center; }
  .cta-icon { margin: 0 auto; }
}
</style>
