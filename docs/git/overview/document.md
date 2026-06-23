# Git - Khởi đầu
---
## Tổng quát
`Git` là một công cụ quản lý phiên bản mã nguồn mở hoạt động theo hình thức phân tán, tức là trên máy mỗi người dùng điều lưu 1 phiên bản của mã nguồn đó và có thể hoạt động offline. Xuất hiện năm 2005 bởi Linus Torvalds, từ đó đến nay git luôn là công cụ hàng đầu trong việc quản lý phiên bản của các nhà phát triển phần mềm.

## Cài đặt
Truy cập: [https://git-scm.com/](https://git-scm.com/) và tiến hành tải xuống phiên bản phù hợp với thiết bị.

Sau khi cài đặt hoàn tất có thể mở Terminal và kiểm tra sự tồn tại của git.

```bash
git -v
```
> Nếu xuất hiện kiểu: `git version 2.52.0.windows.1` tức là đã cài thành công.

## Cấu hình
Để tham gia quản lý phiên bản, bạn cần cho git biết thông tin về tên và email của mình, đây là điều kiện bắt buộc để tham gia vào 1 dự án.
Cấu hình như sau: Mở terminal và thực hiện lần lượt.

```bash
# khai báo tên
git config --global user.name "tên của bạn"

# khai báo email
git config --global user.email "email của bạn"
```
Sau khi xong có thể chạy `git list` để xem lại kết quả
> Đây chỉ là các cấu hình cơ bản và bắt buộc để tham gia vào việc sử dụng dịch vụ, có thể xem qua nhiều cấu hình chuyên môn hơn tại [Git setting](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration)
