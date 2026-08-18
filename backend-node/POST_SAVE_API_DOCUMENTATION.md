# Tài liệu API Lưu Bài Viết (Post Save)

## 📋 Tổng Quan

Hệ thống quản lý bài viết đã lưu (Post Save) cho phép người dùng lưu các bài viết yêu thích và lấy danh sách các bài viết đã lưu.

Kiến trúc: **MVC** (Model-View-Controller)
- **Model**: `backend-node/models/postSaveModel.js` - Xử lý logic database
- **Controller**: `backend-node/controllers/postSaveController.js` - Xử lý request/response
- **Routes**: `backend-node/routes/postSaveRoutes.js` - Định nghĩa endpoints

---

## 🗂️ Bảng Database

### post_save

| Field | Type | Mô Tả |
|-------|------|-------|
| post_save_id | bigint | ID duy nhất (Auto Increment) |
| post_id | int | ID của bài viết (FK → posts.post_id) |
| user_id | int | ID của user lưu (FK → users.user_id) |
| save_at | timestamp | Thời gian lưu (Default: CURRENT_TIMESTAMP) |
| updated_at | timestamp | Thời gian cập nhật cuối cùng |

### Constraints & Indexes

```sql
-- Unique Key: Một user chỉ lưu một bài viết một lần
UNIQUE KEY `uq_user_post` (`user_id`, `post_id`)

-- Composite Index: Tối ưu query lấy danh sách bài viết đã lưu theo user
KEY `idx_user_save_at` (`user_id`, `save_at` DESC)

-- Index: Tối ưu join với posts table
KEY `idx_post_id` (`post_id`)

-- Foreign Keys: Tự động xóa khi user hoặc post bị xóa
CONSTRAINT `fk_post_save_post` FOREIGN KEY (`post_id`) 
    REFERENCES `posts` (`post_id`) ON DELETE CASCADE
CONSTRAINT `fk_post_save_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`user_id`) ON DELETE CASCADE
```

---

## 🚀 API Endpoints

### 1. Lấy Danh Sách Bài Viết Đã Lưu
```http
GET /api/post-save?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Query Parameters:**
- `page` (number, optional): Số trang (mặc định: 1)
- `limit` (number, optional): Số bài viết trên trang (mặc định: 10, tối đa: 100)

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "post_id": 1,
      "user_id": 5,
      "post_type": "post",
      "content": "Nội dung bài viết",
      "like_count": 10,
      "comment_count": 5,
      "save_count": 3,
      "view_count": 100,
      "visibility": "public",
      "location": "Hà Nội",
      "latitude": 21.0285,
      "longitude": 105.8542,
      "is_deleted": false,
      "is_edited": false,
      "is_pinned": false,
      "liked_by_me": false,
      "created_at": "2026-05-15T11:17:40.000Z",
      "updated_at": "2026-06-21T21:02:18.000Z",
      "saved_at": "2026-08-18T10:30:00.000Z",
      "author": {
        "user_id": 5,
        "name": "Nguyễn Văn A",
        "username": "nguyenvana",
        "avata": "/uploads/avatars/user5.webp",
        "is_verified": true
      },
      "media": [
        {
          "post_media_id": 1,
          "post_id": 1,
          "media_url": "/uploads/posts/image1.webp",
          "type": "image",
          "sort_order": 0,
          "width": 1080,
          "height": 1350
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "total_pages": 3
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Bạn chưa đăng nhập."
}
```

---

### 2. Lưu Một Bài Viết
```http
POST /api/post-save/:postId
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**URL Parameters:**
- `postId` (number, required): ID của bài viết cần lưu

**Request Body:**
```json
{}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Lưu bài viết thành công.",
  "data": {
    "post_id": 1,
    "user_id": 5,
    "saved_at": "2026-08-18T10:30:00.000Z"
  }
}
```

**Response Already Saved (200):**
```json
{
  "success": true,
  "message": "Bài viết đã được lưu trước đó.",
  "data": {
    "post_id": 1,
    "user_id": 5,
    "already_saved": true
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Post ID không hợp lệ."
}
```

---

### 3. Xóa Lưu Một Bài Viết
```http
DELETE /api/post-save/:postId
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**URL Parameters:**
- `postId` (number, required): ID của bài viết cần xóa lưu

**Response Success (200):**
```json
{
  "success": true,
  "message": "Xóa lưu bài viết thành công."
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Bài viết này chưa được lưu."
}
```

---

### 4. Kiểm Tra Bài Viết Có Được Lưu Không
```http
GET /api/post-save/:postId/check
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**URL Parameters:**
- `postId` (number, required): ID của bài viết cần kiểm tra

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "post_id": 1,
    "is_saved": true
  }
}
```

---

## ⚙️ Optimizations & Best Practices

### 1. **Composite Primary Key**
- Sử dụng `UNIQUE KEY (user_id, post_id)` thay vì `PRIMARY KEY (post_save_id)`
- **Lợi ích**: Đảm bảo một user chỉ lưu một bài viết một lần, tránh duplicate records

### 2. **Composite Index `idx_user_save_at`**
```sql
KEY `idx_user_save_at` (`user_id`, `save_at` DESC)
```
- **Lợi ích**: 
  - Tối ưu query `WHERE user_id = ? ORDER BY save_at DESC`
  - Giảm disk I/O khi lấy danh sách bài viết đã lưu với pagination
  - MySQL có thể sử dụng covering index nếu query chỉ cần `user_id`, `post_id`, `save_at`

### 3. **Foreign Keys với ON DELETE CASCADE**
- Khi một bài viết (post) bị xóa, tất cả records lưu bài viết đó sẽ tự động xóa
- Khi một user bị xóa, tất cả records lưu của user đó sẽ tự động xóa
- **Lợi ích**: Dữ liệu luôn consistent, không cần xóa thủ công

### 4. **Pagination**
- Mặc định lấy 10 bài viết mỗi trang, tối đa 100
- **Lợi ích**: Giảm load database, tránh fetch quá nhiều dữ liệu cùng lúc

### 5. **Efficient Query Pattern**
```javascript
// 1. Lấy post_id từ post_save (nhẹ)
const savedPostIds = await query(
  `SELECT ps.post_id, ps.save_at 
   FROM post_save ps
   WHERE ps.user_id = :userId
   ORDER BY ps.save_at DESC
   LIMIT :offset, :limit`
);

// 2. Join với posts table (cần post_id cụ thể)
const rows = await query(
  `SELECT p.*, u.* FROM posts p
   JOIN users u ON u.user_id = p.user_id
   WHERE p.post_id IN (?, ?, ?)`
);
```
- **Lợi ích**: Tránh join lớn, query được optimize tốt hơn

### 6. **Update save_count**
- Tự động cập nhật `save_count` khi user lưu/xóa bài viết
- **Lợi ích**: Không cần query riêng để đếm, hiển thị được số lần lưu trên bài viết

### 7. **Handling Concurrent Saves**
```javascript
INSERT INTO post_save (user_id, post_id, save_at)
VALUES (:userId, :postId, NOW())
ON DUPLICATE KEY UPDATE save_at = NOW()
```
- **Lợi ích**: Idempotent, gọi lại không tạo duplicate, chỉ update timestamp

---

## 📊 Performance Considerations

### Query Plans

**Query 1: Lấy danh sách bài viết đã lưu**
```sql
EXPLAIN SELECT ps.post_id, ps.save_at
        FROM post_save ps
        WHERE ps.user_id = 5
        ORDER BY ps.save_at DESC
        LIMIT 0, 10;
```
- **Expected**: Uses `idx_user_save_at` index, scan 10 rows

**Query 2: Join với posts**
```sql
EXPLAIN SELECT p.* FROM posts p
        WHERE p.post_id IN (1, 2, 3);
```
- **Expected**: Uses primary key index, scan 3 rows

### Index Monitoring

Kiểm tra index usage:
```sql
-- Xem unused indexes
SELECT * FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'emlovy' 
  AND OBJECT_NAME = 'post_save'
  AND COUNT_READ = 0;

-- Xem size indexes
SELECT INDEX_NAME, SEQ_IN_INDEX, COLUMN_NAME, STAT_VALUE
FROM mysql.innodb_index_stats
WHERE OBJECT_SCHEMA = 'emlovy' AND OBJECT_NAME = 'post_save'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;
```

### Load Testing Tips

- **Concurrent Saves**: Kiểm tra `ON DUPLICATE KEY` hoạt động tốt
- **Large Pagination**: Test với offset cao (e.g., page 1000)
- **Bulk Operations**: Nếu cần xóa nhiều saves cùng lúc, dùng `DELETE WHERE user_id = ? AND post_id IN (...)`

---

## 🛡️ Security & Validation

1. **Authentication**: Tất cả endpoints yêu cầu token JWT
2. **Authorization**: User chỉ được xem/lưu bài viết của chính mình
3. **Input Validation**:
   - Post ID phải là số nguyên dương
   - Page/limit trong range hợp lệ
4. **SQL Injection Prevention**: Sử dụng parameterized queries
5. **Rate Limiting**: Có thể thêm rate limit middleware nếu cần

---

## 🔄 Integration Examples

### JavaScript/Fetch

```javascript
// Lấy danh sách bài viết đã lưu
const getSavedPosts = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/post-save?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Lưu một bài viết
const savePost = async (postId) => {
  const response = await fetch(`/api/post-save/${postId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};

// Kiểm tra bài viết có được lưu không
const checkPostSaved = async (postId) => {
  const response = await fetch(`/api/post-save/${postId}/check`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data.data.is_saved;
};
```

### React Hooks

```javascript
// Hook để quản lý lưu bài viết
function useSavePost() {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSave = async (postId) => {
    setLoading(true);
    try {
      if (isSaved) {
        await fetch(`/api/post-save/${postId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsSaved(false);
      } else {
        await fetch(`/api/post-save/${postId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsSaved(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return { isSaved, loading, toggleSave };
}
```

---

## 📝 Migration Steps

1. **Tạo bảng post_save**:
   ```bash
   mysql -u root -p emlovy < database/create_post_save_table.sql
   ```

2. **Kiểm tra bảng được tạo đúng**:
   ```sql
   DESC post_save;
   SHOW INDEXES FROM post_save;
   ```

3. **Thêm postSaveRoutes vào server.js** (đã làm)

4. **Test API endpoints** bằng Postman/Insomnia

---

## 🐛 Troubleshooting

**Lỗi: Foreign Key Constraint Fails**
- Đảm bảo post_id và user_id tồn tại trong bảng posts và users

**Lỗi: Duplicate Entry Error**
- Điều này là expected, API xử lý bằng `ON DUPLICATE KEY UPDATE`

**Query Chậm**
- Kiểm tra index `idx_user_save_at` được sử dụng: `EXPLAIN SELECT ...`
- Nếu không, xóa và tạo lại index

**Out of Memory**
- Giảm `limit` khi lấy danh sách bài viết đã lưu
- Tránh `SELECT *`, chỉ lấy fields cần thiết

---

## 📞 Support & Questions

Nếu có câu hỏi, vui lòng liên hệ team backend.
