-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: emlovy
-- ------------------------------------------------------
-- Server version	9.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'f31fb58d-48f9-11f1-88b4-b445068c3c7e:1-374';

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `parent_id` int DEFAULT NULL COMMENT 'NULL = comment gốc, NOT NULL = reply',
  `content` text NOT NULL,
  `like_count` int DEFAULT '0',
  `is_edited` tinyint(1) DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_created` (`post_id`,`created_at`),
  KEY `idx_user_post` (`user_id`,`post_id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_created_at` (`created_at` DESC),
  KEY `idx_is_deleted` (`is_deleted`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,5,1,NULL,'Ok',0,0,0,NULL,'2026-05-15 11:17:40','2026-05-15 11:17:46'),(2,5,1,1,'Hihi',0,0,0,NULL,'2026-05-15 11:17:54','2026-05-15 11:17:54');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation_participants`
--

DROP TABLE IF EXISTS `conversation_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation_participants` (
  `conversation_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role` enum('member','admin') DEFAULT 'member' COMMENT 'Dùng cho group chat',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_muted` tinyint(1) DEFAULT '0' COMMENT 'Tắt thông báo',
  `is_archived` tinyint(1) DEFAULT '0',
  `last_read_message_id` int DEFAULT NULL COMMENT 'Tin nhắn cuối cùng người dùng đã đọc',
  PRIMARY KEY (`conversation_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `last_read_message_id` (`last_read_message_id`),
  CONSTRAINT `conversation_participants_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`) ON DELETE CASCADE,
  CONSTRAINT `conversation_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `conversation_participants_ibfk_3` FOREIGN KEY (`last_read_message_id`) REFERENCES `messages` (`message_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_participants`
--

LOCK TABLES `conversation_participants` WRITE;
/*!40000 ALTER TABLE `conversation_participants` DISABLE KEYS */;
INSERT INTO `conversation_participants` VALUES (1,1,'admin','2026-05-22 08:07:17',0,0,NULL),(1,3,'member','2026-05-22 08:07:17',0,0,NULL),(2,1,'member','2026-05-22 08:09:40',0,0,NULL),(2,2,'admin','2026-05-22 08:09:40',0,0,NULL);
/*!40000 ALTER TABLE `conversation_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `conversation_id` int NOT NULL AUTO_INCREMENT,
  `type` enum('private','group') NOT NULL DEFAULT 'private',
  `name` varchar(255) DEFAULT NULL COMMENT 'Tên nhóm nếu là group chat',
  `avatar` varchar(255) DEFAULT NULL COMMENT 'Avatar nhóm',
  `last_message_id` int DEFAULT NULL,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`),
  KEY `last_message_id` (`last_message_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`last_message_id`) REFERENCES `messages` (`message_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,'private',NULL,NULL,1,'2026-05-22 08:08:13',1,'2026-05-22 08:07:17','2026-05-22 08:08:13'),(2,'private',NULL,NULL,5,'2026-05-22 08:20:02',1,'2026-05-22 08:09:40','2026-05-22 08:20:02');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follows` (
  `follower_id` int NOT NULL,
  `following_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`follower_id`,`following_id`),
  KEY `follows_ibfk_2` (`following_id`),
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `follows_no_self_check` CHECK ((`follower_id` <> `following_id`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follows`
--

LOCK TABLES `follows` WRITE;
/*!40000 ALTER TABLE `follows` DISABLE KEYS */;
/*!40000 ALTER TABLE `follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `like_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `post_id` int DEFAULT NULL,
  `comment_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`like_id`),
  UNIQUE KEY `unique_like` (`user_id`,`post_id`,`comment_id`),
  KEY `post_id` (`post_id`),
  KEY `comment_id` (`comment_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`),
  CONSTRAINT `likes_ibfk_3` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (1,1,5,NULL,'2026-05-15 11:17:30'),(3,2,2,NULL,'2026-05-15 11:29:24'),(4,2,3,NULL,'2026-05-15 11:29:26'),(5,2,5,NULL,'2026-05-15 13:54:39'),(6,1,2,NULL,'2026-05-15 17:12:23'),(7,1,3,NULL,'2026-05-16 08:02:17'),(8,2,4,NULL,'2026-05-19 15:42:38');
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_attachments`
--

DROP TABLE IF EXISTS `message_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_attachments` (
  `attachment_id` int NOT NULL AUTO_INCREMENT,
  `message_id` int NOT NULL,
  `media_url` varchar(500) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL COMMENT 'Đơn vị: bytes',
  `mime_type` varchar(100) DEFAULT NULL,
  `type` enum('image','video','audio','file','voice') NOT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `duration` int DEFAULT NULL COMMENT 'Thời lượng audio/video',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attachment_id`),
  KEY `message_id` (`message_id`),
  CONSTRAINT `message_attachments_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_attachments`
--

LOCK TABLES `message_attachments` WRITE;
/*!40000 ALTER TABLE `message_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `message_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `content` text,
  `message_type` enum('text','image','video','file','sticker','voice','location') DEFAULT 'text',
  `is_edited` tinyint(1) DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `reply_to_message_id` int DEFAULT NULL COMMENT 'Trả lời tin nhắn nào',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `reply_to_message_id` (`reply_to_message_id`),
  KEY `idx_messages_sender` (`sender_id`,`created_at` DESC),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`reply_to_message_id`) REFERENCES `messages` (`message_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,1,'alo','text',0,0,NULL,NULL,'2026-05-22 08:08:13','2026-05-22 08:08:13'),(2,2,2,'Xin chào','text',0,0,NULL,NULL,'2026-05-22 08:09:53','2026-05-22 08:09:53'),(3,2,1,'Có j ko','text',0,0,NULL,NULL,'2026-05-22 08:18:07','2026-05-22 08:18:07'),(4,2,2,'Mai đi chơi ku','text',0,0,NULL,NULL,'2026-05-22 08:19:44','2026-05-22 08:19:44'),(5,2,1,'...','text',0,0,NULL,NULL,'2026-05-22 08:20:02','2026-05-22 08:20:02');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `actor_id` int NOT NULL,
  `type` enum('like','comment','follow','mention','share','reaction') NOT NULL,
  `post_id` int DEFAULT NULL,
  `comment_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_media`
--

DROP TABLE IF EXISTS `post_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_media` (
  `post_media_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `media_url` varchar(500) NOT NULL,
  `type` enum('image','video') NOT NULL,
  `sort_order` int DEFAULT '0' COMMENT 'Thứ tự hiển thị',
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `duration` int DEFAULT NULL,
  PRIMARY KEY (`post_media_id`),
  KEY `idx_post_media` (`post_id`,`sort_order`),
  CONSTRAINT `post_media_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_media`
--

LOCK TABLES `post_media` WRITE;
/*!40000 ALTER TABLE `post_media` DISABLE KEYS */;
INSERT INTO `post_media` VALUES (2,1,'/uploads/posts/user-1-1778209979555-j9ayt2lv.jpg','image',0,NULL,NULL,NULL),(3,1,'/uploads/posts/user-1-1778209979555-b9voh22m.jpg','image',1,NULL,NULL,NULL),(4,2,'/uploads/posts/user-1-1778210329729-b4ti0a7o.jpg','image',0,NULL,NULL,NULL),(6,4,'/uploads/posts/user-3-1778376913673-6zi1d7ay.jpg','image',0,NULL,NULL,NULL),(7,5,'/uploads/posts/user-1-1778782553344-rko6a2jn.jpg','image',0,NULL,NULL,NULL),(8,3,'/uploads/posts/user-2-1778782905230-wei27h29.png','image',0,NULL,NULL,NULL);
/*!40000 ALTER TABLE `post_media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `content` text,
  `like_count` int DEFAULT '0',
  `comment_count` int DEFAULT '0',
  `share_count` int DEFAULT '0',
  `view_count` int DEFAULT '0',
  `save_count` int DEFAULT '0',
  `visibility` enum('public','private','friends','followers') DEFAULT 'public',
  `location` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT 'Soft delete',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_edited` tinyint(1) DEFAULT '0',
  `is_pinned` tinyint(1) DEFAULT '0' COMMENT 'Ghim bài viết',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  KEY `idx_user_created` (`user_id`,`created_at` DESC),
  KEY `idx_visibility` (`visibility`),
  KEY `idx_created_at` (`created_at` DESC),
  KEY `idx_is_deleted` (`is_deleted`),
  KEY `idx_pinned` (`is_pinned`,`created_at` DESC),
  KEY `idx_feed_visible` (`is_deleted`,`visibility`,`is_pinned`,`created_at` DESC),
  KEY `idx_user_deleted_created` (`user_id`,`is_deleted`,`created_at` DESC),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,1,'Xin chào các bạn.',0,0,0,0,0,'public',NULL,NULL,NULL,1,'2026-05-08 03:15:24',1,0,'2026-05-08 03:11:23','2026-05-08 03:15:24'),(2,1,'Hello.',2,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-08 03:18:49','2026-05-15 17:12:23'),(3,2,'Git syntax basic',2,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,1,0,'2026-05-08 03:20:21','2026-05-16 08:02:17'),(4,3,'Xin chao',1,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-10 01:35:13','2026-05-19 15:42:38'),(5,1,'Http status',2,2,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-14 18:15:53','2026-05-15 13:54:39'),(6,1,'something is matter?',0,0,0,0,0,'public',NULL,NULL,NULL,1,'2026-05-21 11:11:50',0,0,'2026-05-21 04:27:46','2026-05-21 11:11:50');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stories`
--

DROP TABLE IF EXISTS `stories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stories` (
  `story_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `content` text COMMENT 'Nội dung text nếu có',
  `background_color` varchar(20) DEFAULT '#000000' COMMENT 'Màu nền nếu là story text',
  `music_url` varchar(255) DEFAULT NULL COMMENT 'Nhạc nền (nếu có)',
  `expires_at` timestamp NOT NULL COMMENT 'Thời gian hết hạn (thường là 24h)',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '1: còn hiển thị, 0: đã hết hạn hoặc bị xóa',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`story_id`),
  KEY `idx_user_active` (`user_id`,`is_active`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_story_feed_active` (`is_deleted`,`is_active`,`expires_at`,`created_at` DESC),
  KEY `idx_story_user_active_created` (`user_id`,`is_deleted`,`is_active`,`expires_at`,`created_at` DESC),
  CONSTRAINT `stories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stories`
--

LOCK TABLES `stories` WRITE;
/*!40000 ALTER TABLE `stories` DISABLE KEYS */;
INSERT INTO `stories` VALUES (1,2,'Xin chao','#FFE1D6',NULL,'2026-05-16 14:40:49',0,1,'2026-05-15 14:40:49','2026-05-15 14:41:26'),(2,1,'Hello.','#FFE1D6','https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3','2026-05-16 17:22:15',0,1,'2026-05-15 17:22:15','2026-05-19 10:46:41');
/*!40000 ALTER TABLE `stories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `story_media`
--

DROP TABLE IF EXISTS `story_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `story_media` (
  `story_media_id` int NOT NULL AUTO_INCREMENT,
  `story_id` int NOT NULL,
  `media_url` varchar(500) NOT NULL,
  `type` enum('image','video') NOT NULL,
  `duration` int DEFAULT NULL COMMENT 'Thời lượng video (giây)',
  `position_x` decimal(5,2) DEFAULT NULL COMMENT 'Vị trí sticker/text (nếu cần mở rộng)',
  `position_y` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`story_media_id`),
  KEY `story_id` (`story_id`),
  KEY `idx_story_media_lookup` (`story_id`,`story_media_id`),
  CONSTRAINT `story_media_ibfk_1` FOREIGN KEY (`story_id`) REFERENCES `stories` (`story_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `story_media`
--

LOCK TABLES `story_media` WRITE;
/*!40000 ALTER TABLE `story_media` DISABLE KEYS */;
/*!40000 ALTER TABLE `story_media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `birthday` date DEFAULT NULL,
  `gender` enum('0','1','2') DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avata` varchar(500) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` enum('admin','customer') NOT NULL DEFAULT 'customer' COMMENT 'admin, người dùng',
  `status` tinyint DEFAULT '1' COMMENT '1 là đang hoạt động, 0 là block',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Lữ Văn Tính','tinhlu','$2b$12$zngBXM86GWMgxaZjJ5TdxOHhXNBag22jjyW5q.E1fkZdklzgia0Aq',NULL,NULL,'0818177533',NULL,'tinhlu703@gmail.com','customer',1,'2026-04-29 11:42:33','2026-04-29 05:41:54'),(2,'Lữ Tính Văn','tinhvan','$2b$12$uvBeLQeuf.jbYU7p0yNILuBBrldGxh0g85jtK/qz7CzJMzuELOqP6',NULL,NULL,'0818177533','/uploads/avatars/user-2-1778786275246-hn2pky2q.jpg','tinhlu263@gmail.com','customer',1,'2026-05-08 10:19:44','2026-05-14 19:17:55'),(3,'Gia Huy','huy123','$2b$12$evqrwvuIjKOopNNv7xFabOPWEtE3ZCFwwDoErV1u8BsOTvdLub6H6',NULL,NULL,NULL,NULL,NULL,'customer',1,'2026-05-10 08:34:57','2026-05-10 01:34:57'),(4,'tinh','tinh','$2b$10$2eJnGd53OauaeqRAmy6.K.lZzz.BQgUdvoHwIgUr5wTYBXtd9b3d6',NULL,NULL,NULL,NULL,NULL,'customer',1,'2026-05-16 23:21:11','2026-05-16 16:21:11');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-24 19:52:16
