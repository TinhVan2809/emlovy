# Emlovy Mobile Client
**Emlovy Mobile** là ứng dụng mạng xã hội đa nền tảng (iOS & Android) được xây dựng trên nền tảng React Native và Expo. Ứng dụng tập trung vào trải nghiệm mượt mà, tương tác thời gian thực và quản lý nội dung đa phương tiện.

## Công nghệ sử dụng
- **Framework:** [React Native (Expo SDK)](https://expo.dev/)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Ngôn ngữ:** TypeScript
- **Real-time:** Socket.IO Client
- **Icons:** Ionicons (@expo/vector-icons)
- **Styling:** React Native StyleSheet & Design Tokens (Theme)

## Tính năng chính
- **Trải nghiệm người dùng:**
    - Bảng tin (Feed), Story và video ngắn (Reels) tích hợp.
    - Hệ thống cài đặt cá nhân hóa: Chỉnh sửa profile, quản lý quyền riêng tư, danh sách chặn.
    - Trung tâm tài khoản: Bảo mật, mật khẩu và kết nối quảng cáo.
- **Tính năng Real-time:**
    - Thông báo tức thì qua Socket.IO.
    - Nhắn tin 1:1 và trò chuyện nhóm.
- **Quản trị (Admin Dashboard):**
    - Quản lý người dùng: Xem, chỉnh sửa, khóa/mở khóa tài khoản.
    - Quản lý nội dung: Kiểm duyệt bài viết và các hoạt động cộng đồng.
    - Xác thực: Hệ thống cấp quyền Admin/Moderator và gán nhãn xác minh (Tick xanh).

## Cấu trúc thư mục
```text
frontend-native/
├── app/                # Expo Router (Tabs, Stacks, Groups)
│   ├── (auth)/         # Luồng đăng nhập/đăng ký
│   ├── (main)/         # Luồng chính (Feed, Reels, Profile)
│   ├── (setting)/      # Cài đặt chi tiết người dùng
│   └── admin/          # Giao diện dành cho quản trị viên
├── components/         # Các UI Components tái sử dụng (ScreenShell, Buttons...)
├── constants/          # Định nghĩa màu sắc (Theme), Font, Config
├── assets/             # Hình ảnh, Fonts, Icons
├── hooks/              # Custom React Hooks
├── services/           # Logic gọi API và xử lý dữ liệu
└── types/              # Định nghĩa Interface/Type cho TypeScript
```

## Cài đặt & Phát triển

### Yêu cầu hệ thống (Khuyến nghị)
- **Node.js:** v22.x trở lên
- **Package Manager:** npm v11+ hoặc pnpm v10+
- **Expo Go** (trên điện thoại) hoặc **Emulator** (Android Studio / Xcode)

### Các bước cài đặt
1. Di chuyển vào thư mục dự án:
   ```bash
   cd frontend-native
   ```

2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   # hoặc
   pnpm install
   ```

3. Chạy ứng dụng:
   ```bash
   npx expo start
   ```
   - Quét mã QR bằng ứng dụng **Expo Go** để xem trên thiết bị thật hoặc
   - Nhấn `a` để mở trên Android Emulator.
   - Nhấn `i` để mở trên iOS Simulator.

