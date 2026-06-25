# Emlovy Web Client

**Emlovy** là nền tảng mạng xã hội đa phương tiện. Đây là phiên bản Web được xây dựng với hiệu suất cao, tối ưu SEO và trải nghiệm người dùng mượt mà.

## Công nghệ sử dụng

- **Framework:** [Next.js 16+ (App Router)](https://nextjs.org/)
- **Ngôn ngữ:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API / Hooks
- **Real-time:** Socket.IO Client
- **Icons:** Lucide React / RemixIcon (Tùy chỉnh theo thiết kế)

## Tính năng chính

- **Trang chủ & Bảng tin:** Hiển thị bài viết, Story và Reels xu hướng.
- **Hệ thống Reels:** Trải nghiệm xem video ngắn tương tự Instagram/TikTok với khả năng tối ưu hóa tải video.
- **Tương tác thời gian thực:** Like, Comment và thông báo tức thì qua Socket.IO.
- **Quản lý bảo mật:**
  - Hệ thống Middleware/Proxy kiểm soát truy cập trang bảo mật.
  - Xử lý Token tập trung qua HttpOnly Cookies.
- **Responsive Design:** Giao diện tương thích hoàn toàn với Mobile Web, Tablet và Desktop.

## Cài đặt & Phát triển

### Yêu cầu hệ thống (khuyến nghị)

- **Node.js:** v22.x trở lên
- **Package Manager:** npm v11+ hoặc pnpm v10+

### Các bước cài đặt

1. Di chuyển vào thư mục frontend:

   ```bash
   cd frontend-next
   ```

2. Cài đặt các gói phụ thuộc:

   ```bash
   npm install
   # hoặc
   pnpm install
   ```

3. Chạy ứng dụng ở chế độ phát triển:
   ```bash
   npm run dev
   ```

### Build cho Production

```bash
npm run build
npm run start
```

