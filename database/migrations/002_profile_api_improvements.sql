ALTER TABLE `users`
  MODIFY `avata` varchar(500) DEFAULT NULL,
  ADD COLUMN `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

ALTER TABLE `follows`
  DROP FOREIGN KEY `follows_ibfk_1`,
  DROP FOREIGN KEY `follows_ibfk_2`;

ALTER TABLE `follows`
  ADD CONSTRAINT `follows_ibfk_1`
    FOREIGN KEY (`follower_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `follows_ibfk_2`
    FOREIGN KEY (`following_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `follows_no_self_check`
    CHECK (`follower_id` <> `following_id`);
