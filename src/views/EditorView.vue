<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import EditorLayout from '@/layouts/EditorLayout.vue'
import { Download, FileText, Heading1, Heading2, Heading3, Bold, Italic, Code, Link, List, FileEdit, Settings, Table, Quote, Type, Paintbrush, Code2, PlusCircle, ChevronRight, Copy } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/tokyo-night-dark.css'
import html2pdf from 'html2pdf.js'

import DocCard from '@/components/docs/DocCard.vue'
import { CATEGORIES } from '@/config/categories'
import type { DocMeta, Document } from '@/types/document'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return '' // use external default escaping
  }
})

// Custom code block renderer for language label and copy button
const defaultRender = md.renderer.rules.fence || function(tokens, idx, options, _env, self) {
  return self.renderToken(tokens, idx, options)
}

md.renderer.rules.fence = function (tokens, idx, options, env, self) {
  const token = tokens[idx]
  const language = token.info.trim() || 'text'
  const code = encodeURIComponent(token.content)
  const rawHtml = defaultRender(tokens, idx, options, env, self)

  return `
    <div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="code-block-lang">${language}</span>
        <button class="code-block-copy" data-code="${code}">Copy</button>
      </div>
      ${rawHtml}
    </div>
  `
}

const activeTab = ref('markdown') // 'markdown' | 'meta'

// --- Markdown Editor Logic ---
const markdownText = ref(`# Tiêu đề tài liệu

> **Tóm tắt:** Lời giới thiệu ngắn gọn về nội dung bài viết, giúp người đọc nắm bắt nhanh mục tiêu của tài liệu này.

## 1. Tổng quan (Overview)

Mô tả chi tiết hơn về khái niệm, tại sao nó lại quan trọng và trường hợp nào nên sử dụng. Đừng quên sử dụng \`inline code\` cho các từ khóa kỹ thuật.

## 2. Yêu cầu đầu vào (Prerequisites)

- Kiến thức cơ bản về...
- Đã cài đặt công cụ...

## 3. Nội dung chính

Chia nhỏ nội dung thành các phần dễ hiểu.

### 3.1. Cấu trúc cơ bản

Đây là cách sử dụng cơ bản, hãy sử dụng Code Block để minh họa:

\`\`\`javascript
// Ví dụ mã nguồn minh họa
function helloWorld() {
  console.log("Xin chào Rury Docs!");
}
\`\`\`

> **Lưu ý:** Nếu có điểm quan trọng dễ mắc sai lầm, hãy sử dụng blockquote để gây chú ý.

### 3.2. Tính năng nâng cao

Bảng dữ liệu rất hữu ích để so sánh:

| Tính năng | Điểm mạnh | Hạn chế |
| --- | --- | --- |
| Phương pháp A | Nhanh, dễ thiết lập | Khó mở rộng |
| Phương pháp B | Tối ưu tốt | Phức tạp |

## 4. Tổng kết & Thực hành

Tóm tắt lại những gì đã học. Đề xuất một bài tập nhỏ để người đọc tự thực hành.

## 5. Tài liệu tham khảo
- [Trang chủ công nghệ X](https://example.com)
- [Bài viết liên quan](./bai_viet_lien_quan.md)
`)

const renderedHtml = computed(() => {
  return md.render(markdownText.value)
})

const exportMd = () => {
  const blob = new Blob([markdownText.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'document.md'
  a.click()
  URL.revokeObjectURL(url)
}

const exportPdf = () => {
  const element = document.getElementById('preview-content')
  if (!element) return

  const clone = element.cloneNode(true) as HTMLElement
  clone.style.width = '800px'
  clone.style.padding = '40px'
  clone.style.background = '#ffffff'
  clone.style.color = '#000000'
  
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.appendChild(clone)
  document.body.appendChild(container)

  const opt = {
    margin:       15,
    filename:     'document.pdf',
    image:        { type: 'jpeg' as const, quality: 1 },
    html2canvas:  { scale: 2, useCORS: true, windowWidth: 800 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  }
  
  html2pdf().set(opt).from(clone).save().then(() => {
    document.body.removeChild(container)
  })
}

// --- Meta Editor Logic ---
const metaData = ref<DocMeta>({
  type: 'document',
  title: 'Tiêu đề tài liệu',
  description: 'Mô tả ngắn gọn về tài liệu này. Sẽ hiển thị tối đa 2 dòng trên document card.',
  category: 'fe',
  tags: ['frontend', 'html'],
  difficulty: 'beginner'
})

const metaDoc = computed<Document>(() => {
  return {
    slug: 'preview',
    meta: metaData.value
  }
})

// Tag Input & Suggestions Logic
const COMMON_TAGS = ['html', 'css', 'javascript', 'vue', 'react', 'node', 'express', 'database', 'sql', 'nosql', 'git', 'api', 'flexbox', 'grid', 'layout', 'typescript', 'vite', 'frontend', 'backend', 'fullstack']
const newTagInput = ref('')

const suggestedTags = computed(() => {
  if (!newTagInput.value) return []
  const input = newTagInput.value.toLowerCase()
  return COMMON_TAGS.filter(tag => 
    tag.includes(input) && !(metaData.value.tags || []).includes(tag)
  ).slice(0, 5)
})

const addTag = () => {
  const t = newTagInput.value.trim().toLowerCase()
  if (t && !(metaData.value.tags || []).includes(t)) {
    if (!metaData.value.tags) metaData.value.tags = []
    metaData.value.tags.push(t)
  }
  newTagInput.value = ''
}

const addSuggestedTag = (t: string) => {
  if (!(metaData.value.tags || []).includes(t)) {
    if (!metaData.value.tags) metaData.value.tags = []
    metaData.value.tags.push(t)
  }
  newTagInput.value = ''
}

const removeTag = (index: number) => {
  if (metaData.value.tags) {
    metaData.value.tags.splice(index, 1)
  }
}

const handleTagBackspace = (_e: KeyboardEvent) => {
  if (newTagInput.value === '' && metaData.value.tags && metaData.value.tags.length > 0) {
    metaData.value.tags.pop()
  }
}

const copyJson = () => {
  const jsonStr = JSON.stringify(metaData.value, null, 2)
  navigator.clipboard.writeText(jsonStr)
}

const exportJson = () => {
  const jsonStr = JSON.stringify(metaData.value, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'meta.json'
  a.click()
  URL.revokeObjectURL(url)
}

// --- Context Menu Logic ---
const contextMenuRef = ref<HTMLElement | null>(null)
const isMenuAlignRight = ref(false)
const isMenuAlignBottom = ref(false)

const contextMenu = ref({
  show: false,
  x: 0,
  y: 0
})

const showContextMenu = async (e: MouseEvent) => {
  const offsetX = 5;
  const offsetY = 5;
  
  contextMenu.value = {
    show: true,
    x: e.clientX + offsetX,
    y: e.clientY + offsetY
  }
  
  isMenuAlignRight.value = e.clientX > window.innerWidth - 350;
  isMenuAlignBottom.value = e.clientY > window.innerHeight - 250;

  await nextTick()
  
  if (contextMenuRef.value) {
    const menuRect = contextMenuRef.value.getBoundingClientRect()
    let newX = e.clientX + offsetX
    let newY = e.clientY + offsetY
    
    if (newX + menuRect.width > window.innerWidth) {
      newX = window.innerWidth - menuRect.width - offsetX
    }
    
    if (newY + menuRect.height > window.innerHeight) {
      newY = e.clientY - menuRect.height - offsetY
      if (newY < 0) newY = 0 
    }
    
    contextMenu.value.x = newX
    contextMenu.value.y = newY
  }
}

const hideContextMenu = () => {
  contextMenu.value.show = false
}

const insertMarkdown = (prefix: string, suffix = '') => {
  const textarea = document.querySelector('.markdown-input') as HTMLTextAreaElement
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = markdownText.value.substring(start, end)
  
  const before = markdownText.value.substring(0, start)
  const after = markdownText.value.substring(end)
  
  markdownText.value = before + prefix + selectedText + suffix + after
  
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length)
  }, 0)
}

const handleContextAction = (action: string) => {
  switch (action) {
    case 'h1': insertMarkdown('# ', ''); break;
    case 'h2': insertMarkdown('## ', ''); break;
    case 'h3': insertMarkdown('### ', ''); break;
    case 'bold': insertMarkdown('**', '**'); break;
    case 'italic': insertMarkdown('_', '_'); break;
    case 'code': insertMarkdown('`', '`'); break;
    case 'codeblock': insertMarkdown('\n```\n', '\n```\n'); break;
    case 'blockquote': insertMarkdown('> ', ''); break;
    case 'link': insertMarkdown('[', '](url)'); break;
    case 'list': insertMarkdown('- ', ''); break;
    case 'table': insertMarkdown('\n| Cột 1 | Cột 2 |\n| --- | --- |\n| Nội dung | Nội dung |\n', ''); break;
  }
  hideContextMenu()
}

const handlePreviewClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.classList.contains('code-block-copy')) {
    const code = target.dataset.code
    if (code) {
      navigator.clipboard.writeText(decodeURIComponent(code))
      target.innerText = 'Copied!'
      target.classList.add('copied')
      setTimeout(() => {
        target.innerText = 'Copy'
        target.classList.remove('copied')
      }, 2000)
    }
  }
}
</script>

<template>
  <EditorLayout @click="hideContextMenu">
    <template #actions>
      <!-- Tabs -->
      <div class="editor-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'markdown' }"
          @click="activeTab = 'markdown'"
        >
          <FileEdit :size="16" />
          <span>Markdown</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'meta' }"
          @click="activeTab = 'meta'"
        >
          <Settings :size="16" />
          <span>Meta</span>
        </button>
      </div>
      
      <template v-if="activeTab === 'markdown'">
        <div class="divider"></div>
        <button @click.stop="exportMd" class="btn-action btn-md">
          <FileText :size="16" />
          <span>Lưu .md</span>
        </button>
        <button @click.stop="exportPdf" class="btn-action btn-pdf">
          <Download :size="16" />
          <span>Xuất PDF</span>
        </button>
      </template>

      <template v-if="activeTab === 'meta'">
        <div class="divider"></div>
        <button @click.stop="copyJson" class="btn-action btn-md">
          <Copy :size="16" />
          <span>Copy JSON</span>
        </button>
        <button @click.stop="exportJson" class="btn-action btn-pdf">
          <Download :size="16" />
          <span>Xuất JSON</span>
        </button>
      </template>
    </template>

    <div class="editor-workspace" @click="hideContextMenu">
      <!-- Màn hình Markdown -->
      <template v-if="activeTab === 'markdown'">
        <div class="workspace-pane pane-left">
          <div class="pane-header">
            <span class="pane-title">MARKDOWN</span>
          </div>
          <textarea
            v-model="markdownText"
            class="markdown-input custom-scrollbar"
            placeholder="Bắt đầu viết điều gì đó tuyệt vời..."
            @contextmenu.prevent="showContextMenu"
          ></textarea>
        </div>

        <div class="workspace-pane pane-right">
          <div class="pane-header">
            <span class="pane-title">PREVIEW</span>
          </div>
          <div class="preview-wrapper custom-scrollbar" @click="handlePreviewClick">
            <div id="preview-content" class="markdown-preview" v-html="renderedHtml"></div>
          </div>
        </div>
      </template>

      <!-- Màn hình Meta -->
      <template v-else>
        <div class="workspace-pane pane-left">
          <div class="pane-header">
            <span class="pane-title">META EDITOR</span>
          </div>
          <div class="meta-editor-container custom-scrollbar">
            
            <div class="form-group">
              <label>Loại (Type)</label>
              <select v-model="metaData.type" class="meta-input">
                <option value="document">Tài liệu (Document)</option>
                <option value="exercise">Bài tập (Exercise)</option>
                <option value="series">Bộ tài liệu (Series)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Tiêu đề (Title)</label>
              <input type="text" v-model="metaData.title" class="meta-input" placeholder="Nhập tiêu đề..." />
            </div>
            
            <div class="form-group">
              <label>Mô tả (Description)</label>
              <textarea v-model="metaData.description" class="meta-input meta-textarea custom-scrollbar" placeholder="Nhập mô tả ngắn..."></textarea>
            </div>
            
            <div class="form-group">
              <label>Danh mục (Category)</label>
              <select v-model="metaData.category" class="meta-input">
                <option v-for="cat in CATEGORIES" :key="cat.id" :value="cat.id">{{ cat.label }}</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Độ khó (Difficulty)</label>
              <select v-model="metaData.difficulty" class="meta-input">
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung bình</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Thẻ (Tags)</label>
              <div class="tags-input-wrapper">
                <div class="tags-list">
                  <span v-for="(tag, idx) in metaData.tags" :key="idx" class="tag-badge">
                    {{ tag }}
                    <button class="tag-remove" @click="removeTag(idx)">×</button>
                  </span>
                  <input 
                    type="text" 
                    v-model="newTagInput"
                    @keydown.enter.prevent="addTag"
                    @keydown.backspace="handleTagBackspace"
                    class="tag-input"
                    placeholder="Nhập tag..."
                  />
                </div>
                <div v-if="suggestedTags.length > 0" class="tag-suggestions">
                  <div v-for="tag in suggestedTags" :key="tag" class="tag-suggestion-item" @click="addSuggestedTag(tag)">
                    {{ tag }}
                  </div>
                </div>
              </div>
              <small class="form-hint">Nhấn Enter để thêm tag. Các tag có sẵn sẽ được tự động gợi ý.</small>
            </div>
            
          </div>
        </div>

        <div class="workspace-pane pane-right meta-preview-pane">
          <div class="pane-header">
            <span class="pane-title">PREVIEW (DOC CARD)</span>
          </div>
          <div class="meta-preview-content custom-scrollbar">
            <div class="doc-card-wrapper" @click.prevent>
               <DocCard :doc="metaDoc" />
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Context Menu -->
    <div v-if="contextMenu.show" 
         class="context-menu" 
         ref="contextMenuRef"
         :class="{ 'align-right': isMenuAlignRight, 'align-bottom': isMenuAlignBottom }"
         :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
         @click.stop>
         
      <!-- Nhóm Tiêu đề -->
      <div class="menu-group">
        <div class="menu-item">
          <Type :size="14"/> Tiêu đề 
          <ChevronRight :size="14" class="menu-arrow"/>
        </div>
        <div class="submenu">
          <div class="menu-item" @click="handleContextAction('h1')"><Heading1 :size="14"/> Heading 1</div>
          <div class="menu-item" @click="handleContextAction('h2')"><Heading2 :size="14"/> Heading 2</div>
          <div class="menu-item" @click="handleContextAction('h3')"><Heading3 :size="14"/> Heading 3</div>
        </div>
      </div>

      <!-- Nhóm Định dạng -->
      <div class="menu-group">
        <div class="menu-item">
          <Paintbrush :size="14"/> Định dạng 
          <ChevronRight :size="14" class="menu-arrow"/>
        </div>
        <div class="submenu">
          <div class="menu-item" @click="handleContextAction('bold')"><Bold :size="14"/> In đậm</div>
          <div class="menu-item" @click="handleContextAction('italic')"><Italic :size="14"/> In nghiêng</div>
        </div>
      </div>

      <!-- Nhóm Code -->
      <div class="menu-group">
        <div class="menu-item">
          <Code2 :size="14"/> Mã code 
          <ChevronRight :size="14" class="menu-arrow"/>
        </div>
        <div class="submenu">
          <div class="menu-item" @click="handleContextAction('code')"><Code :size="14"/> Inline Code</div>
          <div class="menu-item" @click="handleContextAction('codeblock')"><Code :size="14"/> Code Block</div>
        </div>
      </div>
      
      <div class="menu-separator"></div>

      <!-- Nhóm Chèn thêm -->
      <div class="menu-group">
        <div class="menu-item">
          <PlusCircle :size="14"/> Chèn thêm 
          <ChevronRight :size="14" class="menu-arrow"/>
        </div>
        <div class="submenu">
          <div class="menu-item" @click="handleContextAction('blockquote')"><Quote :size="14"/> Chú ý</div>
          <div class="menu-item" @click="handleContextAction('link')"><Link :size="14"/> Chèn Link</div>
          <div class="menu-item" @click="handleContextAction('list')"><List :size="14"/> Danh sách</div>
          <div class="menu-item" @click="handleContextAction('table')"><Table :size="14"/> Bảng</div>
        </div>
      </div>

    </div>
  </EditorLayout>
</template>

<style scoped>
/* Toolbar Actions */
.editor-tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--bg-2);
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-2);
  background: transparent;
  border: none;
  border-radius: calc(var(--radius-sm) - 0.125rem);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--text);
}

.tab-btn.active {
  background: var(--bg);
  color: var(--primary);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.divider {
  width: 1px;
  height: 24px;
  background: var(--border);
  margin: 0 0.5rem;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: 1px solid transparent;
  color: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.btn-md {
  background: #10b981;
}
.btn-md:hover { background: #059669; }

.btn-pdf {
  background: #f97316;
}
.btn-pdf:hover { background: #ea580c; }

/* Workspace Layout */
.editor-workspace {
  display: flex;
  width: 100%;
  height: 100%;
  background: var(--bg);
  padding: 0;
  gap: 0;
}

.workspace-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
}

.pane-left {
  border-right: 1px solid var(--border);
}

.pane-header {
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-2);
  display: flex;
  align-items: center;
}

.pane-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.1em;
}

/* Editor Specifics */
.markdown-input {
  flex: 1;
  width: 100%;
  padding: 2rem;
  border: none;
  resize: none;
  background: transparent;
  color: var(--text);
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 0.95rem;
  line-height: 1.7;
  outline: none;
}

.markdown-input::placeholder {
  color: var(--text-muted);
  opacity: 0.6;
}

/* Preview Specifics */
.pane-right {
  background: var(--bg);
}

.preview-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 2.5rem 0;
}

.markdown-preview {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 3rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text);
}

/* Meta Editor Specifics */
.meta-editor-container {
  flex: 1;
  padding: 2.5rem 3rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  background: var(--bg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-left: 0.2rem;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  margin-left: 0.2rem;
}

.meta-input {
  width: 100%;
  padding: 0.85rem 1.125rem;
  background: var(--bg-2);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  outline: none;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.02);
}

.meta-input:hover {
  background: var(--bg);
  border-color: var(--border);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.meta-input:focus {
  background: var(--bg);
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12), 0 4px 12px rgba(0,0,0,0.05);
}

.meta-textarea {
  min-height: 120px;
  resize: vertical;
  line-height: 1.6;
}

select.meta-input {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1.125rem center;
  background-size: 1.2em;
  padding-right: 3rem;
  cursor: pointer;
  font-weight: 500;
}

/* Tags Input */
.tags-input-wrapper {
  position: relative;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-2);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  min-height: 52px;
  align-items: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.02);
}

.tags-list:hover {
  background: var(--bg);
  border-color: var(--border);
}

.tags-list:focus-within {
  background: var(--bg);
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12), 0 4px 12px rgba(0,0,0,0.05);
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.tag-remove {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  font-size: 1.1rem;
  line-height: 1;
  opacity: 0.7;
  transition: color 0.15s;
}

.tag-remove:hover {
  opacity: 1;
  color: #ef4444;
}

.tag-input {
  flex: 1;
  min-width: 120px;
  background: transparent;
  border: none;
  color: var(--text);
  outline: none;
  font-size: 0.95rem;
  padding: 0.35rem 0;
}

.tag-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden;
}

.tag-suggestion-item {
  padding: 0.75rem 1.125rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
  color: var(--text);
  font-weight: 500;
}

.tag-suggestion-item:hover {
  background: var(--bg-2);
  color: var(--primary);
}

/* Meta Preview Pane */
.meta-preview-pane {
  background: var(--bg-2);
}

.meta-preview-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 4rem 2rem;
  overflow-y: auto;
}

.doc-card-wrapper {
  width: 100%;
  max-width: 420px;
  /* Làm cho thẻ nổi bật hơn một chút trên preview pane */
  filter: drop-shadow(0 10px 30px rgba(0,0,0,0.05));
  /* Disable interaction to prevent router link navigation in preview */
  pointer-events: none;
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  min-width: 180px;
  z-index: 9999;
  font-family: 'Inter', sans-serif;
}

.menu-group {
  position: relative;
}

.menu-item {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-arrow {
  margin-left: auto;
  opacity: 0.5;
}

.menu-item:hover {
  background: var(--bg-2);
  color: var(--primary);
}

.submenu {
  position: absolute;
  top: 0;
  left: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s;
  transform: translateX(-5px);
  z-index: 10000;
  padding: 0.25rem 0;
}

.menu-group:hover .submenu {
  visibility: visible;
  opacity: 1;
  transform: translateX(0);
}

.context-menu.align-right .submenu {
  left: auto;
  right: 100%;
  transform: translateX(5px);
}

.context-menu.align-right .menu-group:hover .submenu {
  transform: translateX(0);
}

.context-menu.align-bottom .submenu {
  top: auto;
  bottom: 0;
}

.menu-separator {
  height: 1px;
  background: var(--border);
  margin: 0.25rem 0;
}

/* Markdown Typography Enhancement */
:deep(.markdown-preview) h1,
:deep(.markdown-preview) h2,
:deep(.markdown-preview) h3,
:deep(.markdown-preview) h4 {
  color: var(--text);
  font-weight: 700;
  margin-top: 2em;
  margin-bottom: 0.75em;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

:deep(.markdown-preview) h1 { font-size: 2.5rem; margin-top: 0; background: linear-gradient(to right, var(--text), var(--text-2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
:deep(.markdown-preview) h2 { font-size: 1.875rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5em; }
:deep(.markdown-preview) h3 { font-size: 1.5rem; }

:deep(.markdown-preview) p {
  margin-bottom: 1.25rem;
  line-height: 1.8;
  color: var(--text-2);
  font-size: 1.05rem;
}

:deep(.markdown-preview) a {
  color: #3b82f6;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}
:deep(.markdown-preview) a:hover {
  border-bottom-color: #3b82f6;
}

:deep(.markdown-preview) strong {
  font-weight: 600;
  color: var(--text);
}

:deep(.markdown-preview) code {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
}

/* Custom Code Block with Language & Copy */
:deep(.code-block-wrapper) {
  margin-bottom: 1.5rem;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #1a1b26;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #24283b;
  border-bottom: 1px solid #1f2335;
}

:deep(.code-block-lang) {
  font-size: 0.75rem;
  color: #7aa2f7;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(.code-block-copy) {
  background: none;
  border: 1px solid #414868;
  color: #a9b1d6;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

:deep(.code-block-copy:hover) {
  background: #414868;
  color: #c0caf5;
}

:deep(.code-block-copy.copied) {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

:deep(.code-block-wrapper pre) {
  background: transparent;
  padding: 1.25rem;
  margin: 0;
  overflow-x: auto;
}

:deep(.code-block-wrapper pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Original Pre/Code fallback */
:deep(.markdown-preview > pre) {
  background: #1a1b26;
  padding: 1.25rem;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

:deep(.markdown-preview > pre code) {
  background: transparent;
  padding: 0;
}

:deep(.markdown-preview) ul {
  padding-left: 1.5rem;
  margin-bottom: 1.25rem;
  color: var(--text-2);
  line-height: 1.8;
  font-size: 1.05rem;
  list-style-type: disc;
}

:deep(.markdown-preview) ol {
  padding-left: 1.5rem;
  margin-bottom: 1.25rem;
  color: var(--text-2);
  line-height: 1.8;
  font-size: 1.05rem;
  list-style-type: decimal;
}

:deep(.markdown-preview) li {
  margin-bottom: 0.5rem;
  display: list-item;
}

:deep(.markdown-preview) li::marker {
  color: var(--primary);
}

:deep(.markdown-preview) blockquote {
  border-left: 4px solid var(--primary);
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  color: var(--text-2);
  font-style: italic;
  background: linear-gradient(to right, rgba(99, 102, 241, 0.05), transparent);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  font-size: 1.1rem;
}

:deep(.markdown-preview) img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  margin: 2rem 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

:deep(.markdown-preview) table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 1.5rem;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
}

:deep(.markdown-preview) th,
:deep(.markdown-preview) td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

:deep(.markdown-preview) th {
  background: var(--bg-2);
  font-weight: 600;
  color: var(--text);
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
