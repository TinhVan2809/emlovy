# Vercel Environment Variables Configuration

## 📋 Required Environment Variables

Copy và paste các biến sau vào **Vercel Dashboard → Project Settings → Environment Variables**

### Authentication
```
JWT_SECRET=alkdasidiaoquerqds9dahsda09shd9aydas8dy9asdh8aw8yd82399834u923hweihrwooweiruweoiurfdnfjskf3o409239032849382904oiwerhoiwer093u09r
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
```

### CORS
```
CORS_ORIGIN=https://emlovy.vercel.app
```
*Lưu ý: Thêm các domain khác nếu cần, cách nhau bởi dấu phẩy*

### Database (Aiven Cloud)
```
DB_HOST=emlovy-tinhlu263-f103.c.aivencloud.com
DB_PORT=17137
DB_USER=avnadmin
DB_PASS=your-aiven-password-here
DB_NAME=emlovy
DB_CONNECTION_LIMIT=5
DB_QUEUE_LIMIT=0
DB_CONNECT_TIMEOUT=10000
DB_SSL=true
```

### Upload Limits
```
AVATAR_MAX_FILE_SIZE=2097152
POST_MEDIA_MAX_FILE_SIZE=10485760
POST_MEDIA_MAX_FILES=10
REEL_VIDEO_MAX_FILE_SIZE=83886080
```

### Server
```
NODE_ENV=production
```

## 🚨 Lưu ý quan trọng

1. **DB_NAME**: Phải là database đã được import schema Emlovy, hiện tại là `emlovy`
2. **DB_PASS**: Không có dấu ngoặc kép
3. **CORS_ORIGIN**: Phải bao gồm protocol (`https://`)
4. **DB_CONNECTION_LIMIT**: Nên giảm xuống 5 cho Vercel Serverless (tránh too many connections)
5. **DB_SSL**: Đặt `true` khi dùng Aiven MySQL

## 📝 Cách thêm trên Vercel

### Method 1: Qua Dashboard (Recommended)

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project **emlovy-backend**
3. Settings → Environment Variables
4. Thêm từng biến:
   - Key: `JWT_SECRET`
   - Value: `alkdasidiaoquerqds9dahsda09shd9aydas8dy9asdh8aw8yd82399834u923hweihrwooweiruweoiurfdnfjskf3o409239032849382904oiwerhoiwer093u09r`
   - Environment: **Production**, **Preview**, **Development** (chọn tất cả)
   - Click **Save**
5. Lặp lại cho tất cả các biến

### Method 2: Qua CLI

```bash
vercel env add JWT_SECRET production
# Nhập value khi được yêu cầu
```

### Method 3: Import từ file

```bash
# Tạo file .env.production
vercel env pull .env.production
```

## ✅ Kiểm tra sau khi thêm

1. **Redeploy project:**
   ```bash
   vercel --prod
   ```

2. **Test health endpoint:**
   ```bash
   curl https://your-backend.vercel.app/health
   ```

3. **Test database connection:**
   ```bash
   curl https://your-backend.vercel.app/health/db
   ```

## 🐛 Troubleshooting

### Lỗi: "Missing required environment variable: DB_HOST"

**Nguyên nhân:** Environment variables chưa được set hoặc chưa được deploy

**Giải pháp:**
1. Kiểm tra lại tất cả biến trong Vercel Dashboard
2. Đảm bảo chọn đúng Environment (Production/Preview/Development)
3. Redeploy project

### Lỗi: "connect ETIMEDOUT"

**Nguyên nhân:** 
- Database host/port sai
- Vercel IP chưa được whitelist trong Aiven

**Giải pháp:**
1. Kiểm tra `DB_HOST` và `DB_PORT`
2. Vào Aiven Console → Allowed IP addresses → Add `0.0.0.0/0` (allow all)

### Lỗi: "Access denied for user"

**Nguyên nhân:** Username hoặc password sai

**Giải pháp:**
1. Kiểm tra `DB_USER` và `DB_PASS`
2. Đảm bảo không có khoảng trắng thừa
3. Không bọc password trong dấu ngoặc kép

### Lỗi: "Unknown database"

**Nguyên nhân:** `DB_NAME` không tồn tại

**Giải pháp:**
1. Kiểm tra database name trong Aiven Console
2. Thường là `emlovy` cho Aiven MySQL
3. Hoặc tạo database mới với tên khác rồi cập nhật `DB_NAME`

## 🔐 Security Best Practices

1. ✅ Sử dụng JWT_SECRET dài và random
2. ✅ Không commit file `.env` vào Git
3. ✅ Rotate JWT_SECRET định kỳ
4. ✅ Giới hạn CORS_ORIGIN chỉ domain cần thiết
5. ✅ Sử dụng SSL/TLS cho database connection (Aiven tự động enable)
