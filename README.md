# Rury Docs

Chào mừng bạn đến với **Rury Docs** - Kho tài liệu IT mã nguồn mở, offline-first và được quản lý hoàn toàn dựa trên Git! 🚀

Tất cả các tài liệu ở đây được viết và duy trì bởi cộng đồng. Bất kỳ ai cũng có thể đóng góp thông qua GitHub Pull Request.

---

## 🛠 Hướng Dẫn Đóng Góp

Để duy trì chất lượng và cấu trúc đồng nhất cho toàn bộ kho tài liệu, dự án đã thiết lập sẵn hệ thống tự động hóa (Git Hooks). Việc tạo cấu trúc thư mục, các file cấu hình và phân quyền sẽ do hệ thống tự động lo liệu, bạn chỉ cần tập trung vào việc viết nội dung (Markdown).

### 1. Chuẩn Bị
- Yêu cầu cài đặt sẵn: **Node.js**, **Git**.
- **Fork** repository này về tài khoản GitHub của bạn.
- Clone repository đã fork về máy tính:
  ```bash
  git clone https://github.com/hieurury/rury-docs.git
  cd rury-docs
  ```
- **QUAN TRỌNG:** Cài đặt dependencies để kích hoạt hệ thống tự động sinh tài liệu:
  ```bash
  npm install
  ```

### 2. Bắt Đầu Viết Tài Liệu (Tạo Branch)

Tất cả nội dung đóng góp **bắt buộc** phải được làm việc trên nhánh mới bắt đầu bằng `docs/`. Khi bạn checkout nhánh, hệ thống sẽ tự sinh thư mục và file.

#### Thêm tài liệu gốc (Cấp 1)
Nếu bạn muốn tạo tài liệu về HTML, bạn đặt tên nhánh là `docs/html`:
```bash
git checkout -b docs/html
```
👉 Hệ thống sẽ tạo thư mục `docs/html` gồm: `config.json`, `meta.json`, `document.md`.

#### Thêm tài liệu con (Cấp 2)
Nếu `html` có nhiều bài học bên trong, bạn có thể tạo tài liệu cấp 2 (Tối đa 2 cấp):
```bash
git checkout -b docs/html/bai_hoc_1
```
👉 Hệ thống sẽ tạo thư mục `docs/html/bai_hoc_1` và xóa file `document.md` ở thư mục cha (`docs/html`) để biến nó thành một "kho chứa tài liệu".

### 3. Chỉnh Sửa Nội Dung

Sau khi tạo nhánh, mở thư mục tài liệu tương ứng vừa được sinh ra:
- Mở `document.md` để viết nội dung bằng Markdown.
- Mở `meta.json` để chỉnh sửa lại tiêu đề (title), mô tả (description), mức độ (difficulty) và các tags.
- **Lưu ý về Ảnh:** Nếu bài viết có ảnh, hãy dán trực tiếp file ảnh (`.png`, `.jpg`, `.jpeg`) vào cùng thư mục với `document.md` và dẫn link tương đối trong Markdown (VD: `![Mô tả ảnh](./image.png)`).

> ⚠️ **Chú ý:** File `config.json` chứa trường `"owner"` định danh tên người tạo. Không chỉnh sửa file này, hệ thống sẽ dùng nó để bảo vệ quyền tác giả của bạn.

### 4. Commit và Gửi Pull Request

Khi đã viết xong, thực hiện commit như bình thường:
```bash
git add .
git commit -m "Thêm tài liệu về HTML cơ bản"
```
*Hệ thống sẽ chạy kiểm tra (Pre-commit Hook) để xác nhận: Bạn đang ở đúng nhánh `docs/`, các file định dạng hợp lệ, ảnh được đặt đúng chỗ và bạn là owner thực sự của tài liệu đó.*

Cuối cùng, push lên repo fork của bạn và tạo **Pull Request (PR)**:
```bash
git push origin <tên_nhánh_của_bạn>
```

---

## 💻 Khởi Chạy Dự Án Locally

Nếu bạn muốn chạy thử giao diện Rury Docs trên máy của mình để xem tài liệu hiển thị ra sao:

```bash
# Cài đặt thư viện
npm install

# Khởi chạy Vite Dev Server
npm run dev
```
Trang web sẽ chạy tại: `http://localhost:5173/`

---

Cảm ơn bạn đã đồng hành và đóng góp vào Rury Docs! ❤️
