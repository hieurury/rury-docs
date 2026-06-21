import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

const [previousHead, newHead, checkoutType] = process.argv.slice(2);

// Only act on branch checkout (type == 1)
if (checkoutType !== '1') {
  process.exit(0);
}

try {
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  
  if (currentBranch === 'main' || currentBranch === 'master') {
    process.exit(0);
  }

  if (!currentBranch.startsWith('docs/')) {
    console.error(`\n[Lỗi] Tên branch không hợp lệ: "${currentBranch}". Branch phải bắt đầu bằng "docs/".\n`);
    console.log('Đang quay lại branch trước đó...\n');
    try {
      execSync(`git checkout -`, { stdio: 'inherit' });
    } catch(e) {}
    process.exit(0); 
  }

  const docPath = currentBranch.substring(5); // remove 'docs/'
  const parts = docPath.split('/');

  if (parts.length > 2) {
    console.error(`\n[Lỗi] Hệ thống chỉ hỗ trợ tối đa 2 cấp tài liệu. (Bạn đang thử tạo: ${docPath})\n`);
    try {
      execSync(`git checkout -`, { stdio: 'inherit' });
    } catch(e) {}
    process.exit(0);
  }

  const targetDir = path.join(DOCS_DIR, ...parts);

  if (!fs.existsSync(targetDir)) {
    console.log(`[Hệ thống] Đang tạo thư mục: docs/${docPath}`);
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let owner = 'unknown';
  try {
    owner = execSync('git config user.name', { encoding: 'utf-8' }).trim();
  } catch (e) {
  }

  const configPath = path.join(targetDir, 'config.json');
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ owner }, null, 2));
  }

  const metaPath = path.join(targetDir, 'meta.json');
  if (!fs.existsSync(metaPath)) {
    const metaData = {
      type: "document",
      title: `Tài liệu ${parts[parts.length - 1]}`,
      description: "Mô tả tài liệu...",
      category: parts[0],
      difficulty: "beginner",
      tags: [parts[0]]
    };
    fs.writeFileSync(metaPath, JSON.stringify(metaData, null, 2));
  }

  const docFilePath = path.join(targetDir, 'document.md');
  if (!fs.existsSync(docFilePath)) {
    const template = `# ${parts[parts.length - 1]}

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
`;
    fs.writeFileSync(docFilePath, template);
  }

  // If this is a level 2 doc, delete document.md in the parent folder (level 1)
  if (parts.length === 2) {
    const parentDocPath = path.join(DOCS_DIR, parts[0], 'document.md');
    if (fs.existsSync(parentDocPath)) {
      console.log(`[Hệ thống] Xóa document.md ở thư mục cha để biến thành kho tài liệu.`);
      fs.unlinkSync(parentDocPath);
    }
  }

  console.log(`[Hệ thống] Hoàn tất chuẩn bị cho branch ${currentBranch}.\n`);
} catch (err) {
  console.error('[Lỗi Git Hook]', err.message);
  process.exit(0);
}
