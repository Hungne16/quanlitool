# 🤖 Hướng dẫn dùng Script Cào Tool

## Bước 1 — Lấy Firebase Service Account Key

1. Vào [Firebase Console](https://console.firebase.google.com/project/quanlitool/settings/serviceaccounts/adminsdk)
2. Click **"Generate new private key"** → tải file JSON về
3. Đặt file đó vào thư mục `scripts/` với tên **`serviceAccountKey.json`**

> ⚠️ **QUAN TRỌNG**: Không commit file này lên GitHub! (đã có trong `.gitignore`)

---

## Bước 2 — Chạy script

```bash
# Cú pháp
node scripts/scrape-toolify.mjs [category-slug] [số-trang]

# Ví dụ cào 3 trang tool AI text-to-image
node scripts/scrape-toolify.mjs text-to-image 3

# Cào tool lập trình (2 trang)
node scripts/scrape-toolify.mjs ai-code 2

# Cào tool năng suất (1 trang)
node scripts/scrape-toolify.mjs ai-productivity 1
```

## Các category slug hỗ trợ

| Slug | Danh mục trong app |
|------|-------------------|
| `text-to-image` | AI & Machine Learning |
| `ai-writing` | AI & Machine Learning |
| `ai-code` | Lập trình |
| `ai-productivity` | Năng suất |
| `ai-design` | Thiết kế |
| `chatbot` | AI & Machine Learning |
| `image-generator` | AI & Machine Learning |

---

## Bước 3 — Admin duyệt

Sau khi script chạy xong → vào **Admin Dashboard → Quản lý Công cụ → Lọc "Chờ duyệt"** để duyệt từng tool.

---

## Lưu ý

- Script tự động **bỏ qua tool đã tồn tại** (kiểm tra theo URL)
- Tool cào về mặc định ở trạng thái `pending` — admin phải duyệt thủ công
- Nghỉ 1.5s giữa các trang và 300ms giữa các lần ghi để tránh rate limit
- Nếu Toolify thay đổi cấu trúc HTML thì selector cần cập nhật
