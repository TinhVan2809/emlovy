# Emlovy

![Static Badge](https://img.shields.io/badge/react-%2361DAFB?style=for-the-badge&logo=react&labelColor=black)
![Static Badge](https://img.shields.io/badge/node-%235FA04E?style=for-the-badge&logo=node.js&labelColor=black)



Emlovy là một ứng dụng mạng xã hội di động, phát triển bằng React Native (Expo) cho frontend và Node.js cho backend. Ứng dụng hỗ trợ đăng bài, Reels/Story theo thời gian thực và nhắn tin.

## Tính năng chính
- Đăng bài, Reels, Story thời gian thực (Socket.IO)
- Nhắn tin 1:1 và nhóm
- Tải lên ảnh (avatar, bài viết)
- Xác thực (đăng ký / đăng nhập)
- Quản trị (Admin) để quản lý người dùng

## Kiến trúc & công nghệ
- Frontend: React Native (Expo)
- Backend: Node.js, Express, MySQL, Socket.IO
- Cấu trúc DB: `database/emlovy.sql`
- Lưu trữ file upload: `backend-node/uploads/`

## Khởi động nhanh

Yêu cầu: Node.js, npm, MySQL

1) Import database
```bash
# Tạo database (nếu cần) và import
mysql -u <user> -p -e "CREATE DATABASE emlovy;"
mysql -u <user> -p emlovy < database/emlovy.sql
```

2) Chạy backend
```bash
cd backend-node
npm install
# Điều chỉnh cấu hình kết nối DB tại backend-node/config/env.js nếu cần
node server.js
```

3) Chạy frontend
```bash
cd frontend-native
npm install
npm start
# hoặc: npx expo start
```

## Cấu hình
- Kiểm tra `backend-node/config/env.js` để cập nhật thông tin database và cấu hình khác.
- Đảm bảo thư mục `backend-node/uploads/avatars` và `backend-node/uploads/posts` có quyền ghi.



