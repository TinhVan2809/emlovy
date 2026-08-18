# SQL Setup Guide - Post Save Feature

## 📋 Tổng Quan

Hướng dẫn cài đặt bảng `post_save` với các optimizations được khuyến nghị.

---

## 🚀 Bước 1: Tạo Bảng

Chạy script SQL sau:

```sql
-- Tạo bảng post_save
CREATE TABLE IF NOT EXISTS `post_save` (
  `post_save_id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID duy nhất cho mỗi lần lưu',
  `post_id` int NOT NULL COMMENT 'ID của bài viết được lưu',
  `user_id` int NOT NULL COMMENT 'ID của user lưu bài viết',
  `save_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian lưu bài viết',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật lần cuối',
  
  -- Composite Primary Key để đảm bảo một user chỉ lưu một bài viết một lần
  UNIQUE KEY `uq_user_post` (`user_id`, `post_id`),
  
  -- Composite Index cho việc lấy danh sách bài viết đã lưu theo user với sorting
  KEY `idx_user_save_at` (`user_id`, `save_at` DESC),
  
  -- Index trên post_id để tối ưu khi join với posts table
  KEY `idx_post_id` (`post_id`),
  
  -- Index trên post_save_id nếu cần query theo ID
  PRIMARY KEY (`post_save_id`),
  
  -- Foreign Keys
  CONSTRAINT `fk_post_save_post` FOREIGN KEY (`post_id`) 
    REFERENCES `posts` (`post_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_post_save_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Bảng lưu trữ thông tin bài viết đã lưu của user';
```

---

## ✅ Bước 2: Kiểm Tra Bảng

### Xem cấu trúc bảng:
```sql
DESC post_save;
```

**Expected Output:**
```
+-----------+----------+------+-----+-------------------+-------------------+
| Field     | Type     | Null | Key | Default           | Extra             |
+-----------+----------+------+-----+-------------------+-------------------+
| post_save_id | bigint | NO   | PRI | NULL              | auto_increment    |
| post_id   | int      | NO   | MUL | NULL              |                   |
| user_id   | int      | NO   | MUL | NULL              |                   |
| save_at   | timestamp| NO   |     | CURRENT_TIMESTAMP |                   |
| updated_at| timestamp| NO   |     | CURRENT_TIMESTAMP | on update ...    |
+-----------+----------+------+-----+-------------------+-------------------+
```

### Xem indexes:
```sql
SHOW INDEXES FROM post_save;
```

**Expected Output:**
```
+----------+------------+----------+--------------+---------+-----------+
| Table    | Non_unique | Key_name | Seq_in_index | Column_name | ...     |
+----------+------------+----------+--------------+---------+-----------+
| post_save| 0          | PRIMARY  | 1            | post_save_id| ...     |
| post_save| 0          | uq_user_post | 1       | user_id     | ...     |
| post_save| 0          | uq_user_post | 2       | post_id     | ...     |
| post_save| 1          | idx_user_save_at | 1   | user_id     | ...     |
| post_save| 1          | idx_user_save_at | 2   | save_at     | ...     |
| post_save| 1          | idx_post_id | 1        | post_id     | ...     |
+----------+------------+----------+--------------+---------+-----------+
```

---

## 📊 Optimizations Explained

### 1. **Composite Unique Key (user_id, post_id)**

**Vấn đề mà nó giải quyết:**
- Nếu không có constraint này, user có thể lưu cùng một bài viết nhiều lần
- Dẫn đến duplicate records, tăng storage, làm chậm queries

**Cách hoạt động:**
```sql
-- Lần đầu lưu: OK
INSERT INTO post_save (user_id, post_id) VALUES (5, 1);

-- Lần thứ 2: Lỗi DUPLICATE KEY ERROR
INSERT INTO post_save (user_id, post_id) VALUES (5, 1);
-- Solution: Sử dụng ON DUPLICATE KEY UPDATE
INSERT INTO post_save (user_id, post_id) VALUES (5, 1)
ON DUPLICATE KEY UPDATE save_at = NOW();
```

### 2. **Composite Index idx_user_save_at (user_id, save_at DESC)**

**Vấn đề mà nó giải quyết:**
- Query thường cần lấy "danh sách bài viết đã lưu của user X, sắp xếp theo thời gian mới nhất"
- Nếu không có index này, MySQL phải scan toàn bộ bảng, rất chậm

**Query được optimize:**
```sql
-- Query này sẽ sử dụng idx_user_save_at
SELECT post_id, save_at FROM post_save
WHERE user_id = 5
ORDER BY save_at DESC
LIMIT 10;
```

**Query Plan (có index):**
```
id | select_type | table | type | key | rows | Extra
1  | SIMPLE      | post_save | ref | idx_user_save_at | 10 | Using index; Using filesort
```

**Query Plan (không có index):**
```
id | select_type | table | type | key | rows | Extra
1  | SIMPLE      | post_save | ALL | NULL | 1000000 | Using where; Using filesort
```

### 3. **Foreign Key Constraints**

**Lợi ích:**
```sql
-- Khi xóa một bài viết
DELETE FROM posts WHERE post_id = 1;
-- Tất cả records trong post_save với post_id = 1 sẽ tự động xóa

-- Khi xóa một user
DELETE FROM users WHERE user_id = 5;
-- Tất cả records trong post_save với user_id = 5 sẽ tự động xóa
```

---

## 📈 Performance Testing

### Test 1: Benchmark query lấy danh sách đã lưu

```sql
-- Insert test data (1M records)
INSERT INTO post_save (user_id, post_id, save_at)
SELECT FLOOR(RAND() * 1000) + 1, FLOOR(RAND() * 50000) + 1, NOW()
FROM (
  SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 -- repeat to get 1M
) t1
ON DUPLICATE KEY UPDATE save_at = NOW();

-- Query benchmark
SELECT SQL_NO_CACHE COUNT(*) FROM post_save
WHERE user_id = 5
ORDER BY save_at DESC
LIMIT 10;
```

**Expected: < 10ms**

### Test 2: Verify uniqueness

```sql
-- Thử lưu cùng bài viết 2 lần
INSERT INTO post_save (user_id, post_id) VALUES (5, 1);
INSERT INTO post_save (user_id, post_id) VALUES (5, 1);
-- Expected: Lỗi DUPLICATE KEY ERROR

-- Check record
SELECT COUNT(*) FROM post_save WHERE user_id = 5 AND post_id = 1;
-- Expected: 1
```

---

## 🔧 Maintenance Scripts

### Tìm indexes không sử dụng

```sql
SELECT OBJECT_SCHEMA, OBJECT_NAME, INDEX_NAME
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'emlovy' 
  AND OBJECT_NAME = 'post_save'
  AND COUNT_READ = 0
  AND INDEX_NAME != 'PRIMARY';
```

### Kiểm tra size bảng

```sql
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
  ROUND(data_length / 1024 / 1024, 2) AS data_mb,
  ROUND(index_length / 1024 / 1024, 2) AS index_mb
FROM information_schema.tables
WHERE table_schema = 'emlovy' AND table_name = 'post_save';
```

### Optimize bảng

```sql
-- Nếu bảng quá lớn, có thể cần optimize
OPTIMIZE TABLE post_save;

-- Hoặc analyze
ANALYZE TABLE post_save;
```

---

## 🚨 Troubleshooting

### Lỗi: Can't create table (Foreign Key Constraint)

**Nguyên nhân:** `posts` hoặc `users` table chưa tồn tại

**Giải pháp:** Tạo `posts` và `users` table trước

### Lỗi: Slow query

**Nguyên nhân:** Index không được sử dụng

**Giải pháp:** Kiểm tra EXPLAIN PLAN
```sql
EXPLAIN SELECT * FROM post_save 
WHERE user_id = 5 
ORDER BY save_at DESC 
LIMIT 10;
-- Nếu Key = NULL, index không được sử dụng
```

### Duplicate entries từ trước

**Nếu bảng đã tồn tại với duplicate records:**

```sql
-- 1. Backup data
CREATE TABLE post_save_backup AS SELECT * FROM post_save;

-- 2. Xóa bảng cũ
DROP TABLE post_save;

-- 3. Tạo lại bảng với constraints
[Chạy lại script CREATE TABLE ở trên]

-- 4. Insert dữ liệu cũ (chỉ giữ record mới nhất)
INSERT INTO post_save (post_id, user_id, save_at)
SELECT post_id, user_id, MAX(save_at)
FROM post_save_backup
GROUP BY user_id, post_id;
```

---

## 📚 Tài liệu Tham Khảo

- [MySQL UNIQUE KEY](https://dev.mysql.com/doc/refman/8.0/en/constraint-unique.html)
- [MySQL Indexes](https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html)
- [Foreign Keys](https://dev.mysql.com/doc/refman/8.0/en/create-table-foreign-keys.html)
- [Performance Schema](https://dev.mysql.com/doc/refman/8.0/en/performance-schema.html)

---

## ✨ Tiếp Theo

- Chạy server: `node server.js`
- Test API endpoints bằng Postman
- Xem [POST_SAVE_API_DOCUMENTATION.md](./POST_SAVE_API_DOCUMENTATION.md) để tìm hiểu chi tiết về API
