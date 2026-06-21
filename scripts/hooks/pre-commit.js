import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

try {
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  
  if (currentBranch === 'main' || currentBranch === 'master') {
    process.exit(0);
  }

  if (!currentBranch.startsWith('docs/')) {
    console.error(`\n[Lỗi Pre-commit] Tên branch "${currentBranch}" không hợp lệ. Phải bắt đầu bằng "docs/".\n`);
    process.exit(1);
  }

  const stagedFilesStr = execSync('git diff --cached --name-only', { encoding: 'utf-8' }).trim();
  if (!stagedFilesStr) {
    process.exit(0); 
  }
  const stagedFiles = stagedFilesStr.split('\n');

  let currentUser = 'unknown';
  try {
    currentUser = execSync('git config user.name', { encoding: 'utf-8' }).trim();
  } catch (e) { }

  const validExts = ['.md', '.json', '.png', '.jpg', '.jpeg'];
  const modifiedDocDirs = new Set();

  for (const file of stagedFiles) {
    if (!file.startsWith('docs/')) {
      continue;
    }

    const ext = path.extname(file).toLowerCase();
    if (!validExts.includes(ext)) {
      console.error(`\n[Lỗi] File "${file}" không được phép. Chỉ chấp nhận .md, .json, .png, .jpg, .jpeg trong docs/.\n`);
      process.exit(1);
    }

    const absFile = path.join(ROOT_DIR, file);
    const fileDir = path.dirname(absFile);
    modifiedDocDirs.add(fileDir);

    if (['.png', '.jpg', '.jpeg'].includes(ext) && fs.existsSync(fileDir)) {
      const mdExists = fs.readdirSync(fileDir).some(f => f.toLowerCase().endsWith('.md'));
      if (!mdExists) {
        console.error(`\n[Lỗi] Không tìm thấy file .md cùng cấp với ảnh "${file}". Ảnh phải đặt cùng thư mục với file markdown.\n`);
        process.exit(1);
      }
    }
  }

  for (const dir of modifiedDocDirs) {
    const configPath = path.join(dir, 'config.json');
    if (fs.existsSync(configPath)) {
      const configStr = fs.readFileSync(configPath, 'utf-8');
      try {
        const config = JSON.parse(configStr);
        if (config.owner && config.owner !== currentUser) {
          console.error(`\n[Lỗi Phân Quyền] Bạn ("${currentUser}") không có quyền chỉnh sửa tài liệu trong "${path.relative(ROOT_DIR, dir)}". Chủ sở hữu là "${config.owner}".\n`);
          process.exit(1);
        }
      } catch (err) {
        console.error(`\n[Lỗi] File config.json tại "${path.relative(ROOT_DIR, dir)}" bị lỗi JSON.\n`);
        process.exit(1);
      }
    }
  }

  process.exit(0);
} catch (err) {
  console.error('\n[Lỗi Git Hook]', err.message);
  process.exit(1);
}
