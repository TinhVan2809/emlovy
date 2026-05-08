ALTER TABLE `posts`
  ADD COLUMN `deleted_at` timestamp NULL DEFAULT NULL AFTER `is_deleted`,
  ADD INDEX `idx_feed_visible` (`is_deleted`, `visibility`, `is_pinned`, `created_at` DESC),
  ADD INDEX `idx_user_deleted_created` (`user_id`, `is_deleted`, `created_at` DESC);
