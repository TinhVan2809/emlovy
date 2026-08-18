-- Tạo bảng post_save để lưu trữ bài viết đã lưu
-- Optimizations:
-- 1. Composite Primary Key (user_id, post_id) để đảm bảo uniqueness và tạo clustered index tối ưu
-- 2. Foreign Keys với ON DELETE CASCADE để tự động xóa khi user hoặc post bị xóa
-- 3. Composite Index (user_id, save_at DESC) để tối ưu query lấy bài viết đã lưu theo user với pagination
-- 4. Index trên post_id để tối ưu khi join với bảng posts
-- 5. Timestamp auto_update để track thời gian cập nhật

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

-- Nếu cần thêm index cho việc đếm số lượng bài viết đã lưu của một bài (save_count)
CREATE INDEX IF NOT EXISTS `idx_post_save_count` ON `post_save` (`post_id`);
