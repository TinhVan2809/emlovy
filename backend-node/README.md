# Emlovy Backend API

**Emlovy Backend** là trung tâm xử lý dữ liệu và điều phối thời gian thực cho hệ sinh thái Emlovy (bao gồm Web và Mobile). Hệ thống được xây dựng trên nền tảng Node.js với kiến trúc tối ưu cho việc xử lý tương tác mạng xã hội.

## Công nghệ sử dụng
- **Runtime:** [Node.js](https://nodejs.org/) (v22.x+)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** MySQL
- **Real-time:** [Socket.IO](https://socket.io/) (Xử lý thông báo, chat và cập nhật Reels/Story)
- **Authentication:** JSON Web Token (JWT) & Cookies
- **File Handling:** Multer (Quản lý upload ảnh bài viết và avatar)

## Tính năng cốt lõi
- **Hệ thống Auth:** Đăng ký, đăng nhập và phân quyền (User/Admin).
- **Social Engine:** CRUD bài viết, Story, và video ngắn (Reels).
- **Real-time Communication:** 
    - Tin nhắn tức thì 1:1 và nhóm.
    - Thông báo đẩy (Notifications) khi có tương tác (Like, Comment, Follow).
- **Admin Management:** API dành riêng cho quản trị viên để kiểm duyệt nội dung và người dùng.
- **Media Storage:** Xử lý và phân phối tài nguyên đa phương tiện tĩnh.

## Thiết lập môi trường & Cài đặt

### 1. Yêu cầu hệ thống (Khuyến nghị)
- **Node.js:** Phiên bản 22.x trở lên.
- **MySQL Server:** Phiên bản 8.0 trở lên.

### 2. Cấu hình Cơ sở dữ liệu
1. Mở trình quản lý MySQL (Command line hoặc WorkBench).
2. Tạo database mới:
   ```sql
   CREATE DATABASE emlovy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Import dữ liệu từ file mẫu:
   ```bash
   mysql -u <username> -p emlovy < ../database/emlovy.sql
   ```

### 3. Cấu hình ứng dụng
Chỉnh sửa file `config/env.js` và `/.env` để khớp với môi trường của bạn:
```javascript
module.exports = {
  PORT: 8080,
  DB_HOST: 'localhost',
  DB_USER: 'root',
  DB_PASS: 'your_password',
  DB_NAME: 'emlovy',
  JWT_SECRET: 'your_secret_key'
};
```

### 4. Cài đặt thư viện & Khởi chạy
Di chuyển vào thư mục backend và cài đặt:
```bash
cd backend-node
npm install
```

Chạy ứng dụng ở chế độ phát triển:
```bash
npm start
# hoặc
node server.js
```
Server sẽ mặc định chạy tại: `http://localhost:8080`

## API Security & Middleware
- **Authentication:** Hầu hết các route yêu cầu header `Authorization: Bearer <token>` hoặc Token từ Cookie.
- **CORS:** Đã được cấu hình để cho phép kết nối từ Frontend Web và Mobile.
- **Rate Limiting:** Bảo vệ các endpoint nhạy cảm như Login/Register.

