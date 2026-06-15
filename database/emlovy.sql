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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'f31fb58d-48f9-11f1-88b4-b445068c3c7e:1-520';

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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,5,1,NULL,'Ok',1,0,0,NULL,'2026-05-15 11:17:40','2026-05-25 15:09:40'),(2,5,1,1,'Hihi',0,0,0,NULL,'2026-05-15 11:17:54','2026-05-15 11:17:54'),(3,5,5,NULL,'Xin chào',0,0,0,NULL,'2026-05-25 15:09:32','2026-05-25 15:09:32'),(4,5,5,1,'Kk',0,0,0,NULL,'2026-05-25 15:09:47','2026-05-25 15:09:47'),(5,13,3,NULL,'Alo',0,0,0,NULL,'2026-05-30 18:22:55','2026-05-30 18:22:55'),(6,13,3,NULL,'Huydzsieucapvippro',0,0,0,NULL,'2026-05-30 18:23:38','2026-05-30 18:23:38'),(7,13,2,NULL,'M simp chúa',0,0,0,NULL,'2026-05-30 18:24:46','2026-05-30 18:24:46'),(8,14,3,NULL,'Test cmt 123',0,0,0,NULL,'2026-05-30 18:25:16','2026-05-30 18:25:16'),(9,13,3,7,'Cc',0,0,0,NULL,'2026-05-30 18:26:25','2026-05-30 18:26:25'),(10,22,2,NULL,'Tìm thêm cái nào ngon',0,0,0,NULL,'2026-05-31 18:25:22','2026-05-31 18:25:22'),(11,23,1,NULL,'Thêm captions vô mậy',0,0,0,NULL,'2026-05-31 18:26:52','2026-05-31 18:26:52'),(12,24,1,NULL,'???',0,0,0,NULL,'2026-05-31 18:47:22','2026-05-31 18:47:22'),(13,24,3,12,'?',0,0,0,NULL,'2026-05-31 18:54:49','2026-05-31 18:54:49'),(14,24,2,NULL,'...',0,0,0,NULL,'2026-05-31 18:57:49','2026-05-31 18:57:49'),(15,2,2,NULL,'Hi.',0,0,0,NULL,'2026-06-08 23:43:48','2026-06-08 23:43:48');
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
INSERT INTO `conversation_participants` VALUES (1,1,'admin','2026-05-22 08:07:17',0,0,NULL),(1,3,'member','2026-05-22 08:07:17',0,0,NULL),(2,1,'member','2026-05-22 08:09:40',0,0,NULL),(2,2,'admin','2026-05-22 08:09:40',0,0,NULL),(3,1,'member','2026-05-26 14:43:08',0,0,NULL),(3,5,'admin','2026-05-26 14:43:08',0,0,NULL),(4,2,'admin','2026-05-28 21:13:57',0,0,NULL),(4,3,'member','2026-05-28 21:13:57',0,0,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,'private',NULL,NULL,1,'2026-05-22 08:08:13',1,'2026-05-22 08:07:17','2026-05-22 08:08:13'),(2,'private',NULL,NULL,5,'2026-05-22 08:20:02',1,'2026-05-22 08:09:40','2026-05-22 08:20:02'),(3,'private',NULL,NULL,7,'2026-05-26 14:43:26',1,'2026-05-26 14:43:08','2026-05-26 14:43:26'),(4,'private',NULL,NULL,19,'2026-06-12 18:04:27',1,'2026-05-28 21:13:57','2026-06-12 18:04:27');
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
INSERT INTO `follows` VALUES (1,2,'2026-05-27 09:28:44'),(1,3,'2026-05-27 09:33:26'),(2,1,'2026-05-27 16:37:42'),(2,3,'2026-05-29 15:17:17'),(3,1,'2026-05-31 18:54:14'),(3,2,'2026-05-31 18:54:10'),(5,1,'2026-05-25 15:10:02'),(5,2,'2026-05-27 09:30:37');
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
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (1,1,5,NULL,'2026-05-15 11:17:30'),(3,2,2,NULL,'2026-05-15 11:29:24'),(4,2,3,NULL,'2026-05-15 11:29:26'),(5,2,5,NULL,'2026-05-15 13:54:39'),(6,1,2,NULL,'2026-05-15 17:12:23'),(7,1,3,NULL,'2026-05-16 08:02:17'),(8,2,4,NULL,'2026-05-19 15:42:38'),(9,1,4,NULL,'2026-05-24 13:00:49'),(10,5,5,NULL,'2026-05-25 15:09:23'),(11,5,NULL,1,'2026-05-25 15:09:40'),(12,2,9,NULL,'2026-05-27 17:17:40'),(13,2,10,NULL,'2026-05-29 15:48:07'),(14,1,10,NULL,'2026-05-29 18:22:14'),(15,1,11,NULL,'2026-05-30 16:03:13'),(16,2,11,NULL,'2026-05-30 17:54:08'),(17,2,13,NULL,'2026-05-30 18:14:01'),(18,3,12,NULL,'2026-05-30 18:15:38'),(19,3,13,NULL,'2026-05-30 18:15:41'),(20,3,14,NULL,'2026-05-30 18:25:25'),(21,2,15,NULL,'2026-05-30 20:52:53'),(22,1,21,NULL,'2026-05-30 22:47:28'),(23,2,16,NULL,'2026-05-31 09:24:34'),(24,1,23,NULL,'2026-05-31 18:27:05'),(25,1,24,NULL,'2026-05-31 18:47:48'),(26,2,24,NULL,'2026-05-31 18:57:37'),(27,3,2,NULL,'2026-05-31 18:59:30'),(28,3,3,NULL,'2026-05-31 18:59:31'),(29,3,4,NULL,'2026-05-31 18:59:32'),(30,3,5,NULL,'2026-05-31 18:59:34'),(31,3,9,NULL,'2026-05-31 18:59:36'),(32,3,10,NULL,'2026-05-31 18:59:37'),(33,3,11,NULL,'2026-05-31 19:00:40'),(34,2,12,NULL,'2026-06-01 10:39:03'),(35,2,18,NULL,'2026-06-01 11:49:34'),(36,2,17,NULL,'2026-06-01 11:54:30'),(37,2,19,NULL,'2026-06-01 12:16:20'),(38,6,14,NULL,'2026-06-02 20:47:33'),(40,1,26,NULL,'2026-06-03 18:39:19'),(41,1,27,NULL,'2026-06-09 12:44:22'),(42,2,27,NULL,'2026-06-11 17:55:28'),(43,1,9,NULL,'2026-06-11 19:50:32'),(44,2,26,NULL,'2026-06-12 14:17:57');
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,1,'alo','text',0,0,NULL,NULL,'2026-05-22 08:08:13','2026-05-22 08:08:13'),(2,2,2,'Xin chào','text',0,0,NULL,NULL,'2026-05-22 08:09:53','2026-05-22 08:09:53'),(3,2,1,'Có j ko','text',0,0,NULL,NULL,'2026-05-22 08:18:07','2026-05-22 08:18:07'),(4,2,2,'Mai đi chơi ku','text',0,0,NULL,NULL,'2026-05-22 08:19:44','2026-05-22 08:19:44'),(5,2,1,'...','text',0,0,NULL,NULL,'2026-05-22 08:20:02','2026-05-22 08:20:02'),(6,3,5,'Hello','text',0,0,NULL,NULL,'2026-05-26 14:43:15','2026-05-26 14:43:15'),(7,3,1,'hi','text',0,0,NULL,NULL,'2026-05-26 14:43:26','2026-05-26 14:43:26'),(8,4,2,'vô chưa mậy','text',0,0,NULL,NULL,'2026-05-28 21:14:04','2026-05-28 21:14:04'),(9,4,3,'Cc','text',0,0,NULL,NULL,'2026-05-28 21:15:23','2026-05-28 21:15:23'),(10,4,3,'Đi ăn','text',0,0,NULL,NULL,'2026-05-28 21:15:28','2026-05-28 21:15:28'),(11,4,2,'đi ku','text',0,0,NULL,NULL,'2026-05-28 21:15:42','2026-05-28 21:15:42'),(12,4,3,'Đ làm cái ô nhập liệu trên bàn phím với nút gửi ku','text',0,0,NULL,NULL,'2026-05-28 21:15:56','2026-05-28 21:15:56'),(13,4,2,'nhấn enter trên bàn phìm để xuống dòng mậy, gửi mới ấn nút','text',0,0,NULL,NULL,'2026-05-28 21:17:10','2026-05-28 21:17:10'),(14,4,2,'ảnh gái m đâu, đăng đi','text',0,0,NULL,NULL,'2026-05-28 21:18:12','2026-05-28 21:18:12'),(15,4,3,'R ku','text',0,0,NULL,NULL,'2026-05-30 18:13:49','2026-05-30 18:13:49'),(16,4,3,'Ngủ đi ku','text',0,0,NULL,NULL,'2026-05-30 18:25:50','2026-05-30 18:25:50'),(17,4,2,'cc','text',0,0,NULL,NULL,'2026-06-01 09:18:46','2026-06-01 09:18:46'),(18,4,3,'Alo','text',0,0,NULL,NULL,'2026-06-12 17:59:16','2026-06-12 17:59:16'),(19,4,2,'J mậy','text',0,0,NULL,NULL,'2026-06-12 18:04:27','2026-06-12 18:04:27');
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_media`
--

LOCK TABLES `post_media` WRITE;
/*!40000 ALTER TABLE `post_media` DISABLE KEYS */;
INSERT INTO `post_media` VALUES (2,1,'/uploads/posts/user-1-1778209979555-j9ayt2lv.jpg','image',0,NULL,NULL,NULL),(3,1,'/uploads/posts/user-1-1778209979555-b9voh22m.jpg','image',1,NULL,NULL,NULL),(4,2,'/uploads/posts/user-1-1778210329729-b4ti0a7o.jpg','image',0,NULL,NULL,NULL),(6,4,'/uploads/posts/user-3-1778376913673-6zi1d7ay.jpg','image',0,NULL,NULL,NULL),(7,5,'/uploads/posts/user-1-1778782553344-rko6a2jn.jpg','image',0,NULL,NULL,NULL),(8,3,'/uploads/posts/user-2-1778782905230-wei27h29.png','image',0,NULL,NULL,NULL),(9,8,'/uploads/posts/user-5-1779806549290-w4asxk4p.jpg','image',0,NULL,NULL,NULL),(10,9,'/uploads/posts/user-2-1779902156968-8qr7gptl.jpg','image',0,NULL,NULL,NULL),(11,10,'/uploads/posts/user-3-1780002906209-ak9pf4cy.jpg','image',0,NULL,NULL,NULL),(12,11,'/uploads/reels/user-1-1780156393015-j42t7uic.mp4','video',0,NULL,NULL,NULL),(13,12,'/uploads/reels/user-2-1780164654740-fxzi9tc6.mp4','video',0,NULL,NULL,NULL),(14,13,'/uploads/reels/user-3-1780164801886-5qffgakd.mp4','video',0,NULL,NULL,NULL),(15,14,'/uploads/posts/user-3-1780164910377-djl964d2.jpg','image',0,NULL,NULL,NULL),(16,15,'/uploads/reels/user-3-1780165186018-7ir22aio.mp4','video',0,NULL,NULL,NULL),(17,16,'/uploads/reels/user-3-1780165365457-cv1eg536.mp4','video',0,NULL,NULL,NULL),(18,17,'/uploads/reels/user-3-1780165953252-whzeiu3p.mp4','video',0,NULL,NULL,NULL),(19,18,'/uploads/reels/user-3-1780166255472-nnm5w8rd.mp4','video',0,NULL,NULL,NULL),(20,19,'/uploads/reels/user-3-1780166763646-8nvzzig0.mp4','video',0,NULL,NULL,NULL),(21,20,'/uploads/reels/user-3-1780167111067-dynmxun6.mp4','video',0,NULL,NULL,NULL),(22,21,'/uploads/reels/user-3-1780167969267-1a55ptyr.mp4','video',0,NULL,NULL,NULL),(23,22,'/uploads/reels/user-3-1780251514366-nc8vk4n1.mp4','video',0,NULL,NULL,NULL),(24,23,'/uploads/reels/user-3-1780251900096-4ankzztf.mp4','video',0,NULL,NULL,NULL),(25,24,'/uploads/reels/user-3-1780252974884-9xptj07w.mp4','video',0,NULL,NULL,NULL),(26,25,'/uploads/posts/user-2-1780338555252-0kn5g2u2.jpg','image',0,NULL,NULL,NULL),(27,26,'/uploads/posts/user-1-1780511837291-qxqj732j.jpg','image',0,NULL,NULL,NULL),(28,27,'/uploads/posts/user-2-1780960919263-5si0tb9f.jpg','image',0,NULL,NULL,NULL),(29,28,'/uploads/posts/user-2-1780962104169-kcsr90x5.png','image',0,NULL,NULL,NULL),(30,30,'/uploads/posts/user-3-1781289869718-nqc5pjoz.jpg','image',0,NULL,NULL,NULL),(31,31,'/uploads/reels/user-3-1781289898153-3p63no65.mp4','video',0,NULL,NULL,NULL);
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
  `post_type` enum('post','reel') NOT NULL DEFAULT 'post',
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
  KEY `idx_post_type_feed` (`post_type`,`is_deleted`,`visibility`,`created_at` DESC),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,1,'post','Xin chào các bạn.',0,0,0,0,0,'public',NULL,NULL,NULL,1,'2026-05-08 03:15:24',1,0,'2026-05-08 03:11:23','2026-05-08 03:15:24'),(2,1,'post','Hello.',3,1,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-08 03:18:49','2026-06-08 23:43:48'),(3,2,'post','Git syntax basic',3,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,1,0,'2026-05-08 03:20:21','2026-05-31 18:59:31'),(4,3,'post','Xin chao',3,0,0,0,0,'public',NULL,NULL,NULL,1,'2026-05-31 18:59:54',0,0,'2026-05-10 01:35:13','2026-05-31 18:59:54'),(5,1,'post','Http status',4,4,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-14 18:15:53','2026-05-31 18:59:34'),(6,1,'post','something is matter?',0,0,0,0,0,'public',NULL,NULL,NULL,1,'2026-05-21 11:11:50',0,0,'2026-05-21 04:27:46','2026-05-21 11:11:50'),(7,2,'post','Hello anh em',0,0,0,0,0,'public',NULL,NULL,NULL,1,'2026-05-25 14:41:37',0,0,'2026-05-25 14:39:55','2026-05-25 14:41:37'),(8,5,'post','Chill',0,0,0,0,0,'public',NULL,NULL,NULL,1,'2026-05-26 14:42:41',0,0,'2026-05-26 14:42:29','2026-05-26 14:42:41'),(9,2,'post','Tôi chả nghỉ gì',3,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,1,0,'2026-05-27 17:03:12','2026-06-11 19:50:32'),(10,3,'post','Test',3,0,0,0,0,'public',NULL,NULL,NULL,1,'2026-05-31 18:59:53',0,0,'2026-05-28 21:15:06','2026-05-31 18:59:53'),(11,1,'reel','Hello',3,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-30 15:55:42','2026-05-31 19:00:40'),(12,2,'reel','31/05/2026',2,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-30 18:11:17','2026-06-01 10:39:03'),(13,3,'reel','Test test',2,4,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-30 18:13:23','2026-05-30 18:26:25'),(14,3,'post','Test 123',2,1,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-30 18:15:10','2026-06-02 20:47:33'),(15,3,'reel','31/12/2016',1,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-30 18:19:46','2026-05-30 22:26:47'),(16,3,'reel','31/12/2016',1,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-30 18:22:47','2026-05-31 09:24:34'),(17,3,'reel','31/12/2016',1,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-30 18:32:34','2026-06-01 11:54:30'),(18,3,'reel','31/12/2016',1,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-30 18:37:35','2026-06-01 11:49:34'),(19,3,'reel','31/12/2016',1,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-30 18:46:04','2026-06-03 12:52:53'),(20,3,'reel','31/12/2016',0,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-30 18:52:04','2026-05-30 22:25:46'),(21,3,'reel','31/12/2016',1,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-30 19:06:09','2026-05-30 22:47:28'),(22,3,'reel','01/06/2026',0,1,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-31 18:18:34','2026-05-31 18:28:44'),(23,3,'reel','01/06/2026',1,1,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-31 18:25:00','2026-05-31 18:28:44'),(24,3,'reel','Captions test',2,3,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-05-31 18:42:55','2026-05-31 18:57:49'),(25,2,'post','02/06/2026',0,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-06-01 18:29:15','2026-06-01 18:29:15'),(26,1,'post','04/06/2026',2,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-06-03 18:37:23','2026-06-12 14:17:57'),(27,2,'post','Xin chào ae',2,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-06-08 23:22:00','2026-06-11 17:55:28'),(28,2,'post','Test captions',0,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-06-08 23:41:45','2026-06-08 23:41:45'),(29,2,'post','Hello',0,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-06-10 15:06:53','2026-06-10 15:06:53'),(30,3,'post','Test',0,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-06-12 18:44:29','2026-06-12 18:44:29'),(31,3,'reel','Test caption',0,0,0,0,0,'public',NULL,NULL,NULL,0,NULL,0,0,'2026-06-12 18:44:58','2026-06-12 18:44:58');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT 'Nguoi bao cao',
  `report_type` enum('post','user','comment') NOT NULL COMMENT 'Loại đối tượng bị báo cáo',
  `reported_post_id` int DEFAULT NULL COMMENT 'ID bài viết bị báo cáo',
  `reported_user_id` int DEFAULT NULL COMMENT 'ID người dùng bị báo cáo',
  `reported_comment_id` int DEFAULT NULL COMMENT 'ID bình luận bị báo cáo',
  `reason` text COMMENT 'Lý do báo cáo',
  `status` enum('pending','resolved','dismissed') NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái báo cáo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  KEY `user_id` (`user_id`),
  KEY `reported_post_id` (`reported_post_id`),
  KEY `reported_user_id` (`reported_user_id`),
  KEY `reported_comment_id` (`reported_comment_id`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`reported_post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE,
  CONSTRAINT `reports_ibfk_3` FOREIGN KEY (`reported_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `reports_ibfk_4` FOREIGN KEY (`reported_comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_one_reported_entity` CHECK ((((`report_type` = _utf8mb4'post') and (`reported_post_id` is not null) and (`reported_user_id` is null) and (`reported_comment_id` is null)) or ((`report_type` = _utf8mb4'user') and (`reported_user_id` is not null) and (`reported_post_id` is null) and (`reported_comment_id` is null)) or ((`report_type` = _utf8mb4'comment') and (`reported_comment_id` is not null) and (`reported_post_id` is null) and (`reported_user_id` is null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stories`
--

LOCK TABLES `stories` WRITE;
/*!40000 ALTER TABLE `stories` DISABLE KEYS */;
INSERT INTO `stories` VALUES (1,2,'Xin chao','#FFE1D6',NULL,'2026-05-16 14:40:49',0,1,'2026-05-15 14:40:49','2026-05-15 14:41:26'),(2,1,'Hello.','#FFE1D6','https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3','2026-05-16 17:22:15',0,1,'2026-05-15 17:22:15','2026-05-19 10:46:41'),(3,3,'Alo','#FFE1D6',NULL,'2026-05-29 21:14:31',0,1,'2026-05-28 21:14:31','2026-05-30 15:28:57'),(4,3,'Alo','#FFE1D6',NULL,'2026-05-31 18:28:50',0,1,'2026-05-30 18:28:50','2026-05-31 18:34:20');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `story_media`
--

LOCK TABLES `story_media` WRITE;
/*!40000 ALTER TABLE `story_media` DISABLE KEYS */;
INSERT INTO `story_media` VALUES (1,3,'/uploads/stories/user-3-1780002871199-gcer2sl2.jpg','image',NULL,NULL,NULL,'2026-05-28 21:14:31'),(2,4,'/uploads/stories/user-3-1780165729770-3yj88h1v.png','image',NULL,NULL,NULL,'2026-05-30 18:28:50');
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
  `signature` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `role` enum('admin','customer') NOT NULL DEFAULT 'customer' COMMENT 'admin, người dùng',
  `status` tinyint DEFAULT '1' COMMENT '1 là đang hoạt động, 0 là block',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Lữ Văn Tính','tinhlu','$2b$12$zngBXM86GWMgxaZjJ5TdxOHhXNBag22jjyW5q.E1fkZdklzgia0Aq',NULL,NULL,'0818177533',NULL,'tinhlu703@gmail.com',NULL,'customer',1,'2026-04-29 04:42:33','2026-05-28 16:28:25',1),(2,'Lữ Tính Văn','tinhvan','$2b$12$uvBeLQeuf.jbYU7p0yNILuBBrldGxh0g85jtK/qz7CzJMzuELOqP6',NULL,NULL,'0818177533','/uploads/avatars/user-2-1778786275246-hn2pky2q.jpg','tinhlu263@gmail.com',NULL,'customer',1,'2026-05-08 03:19:44','2026-06-09 14:08:42',1),(3,'huyngo','huy123','$2b$12$evqrwvuIjKOopNNv7xFabOPWEtE3ZCFwwDoErV1u8BsOTvdLub6H6',NULL,NULL,'0818177533',NULL,NULL,NULL,'customer',1,'2026-05-10 01:34:57','2026-05-31 18:31:23',1),(4,'tinh','tinh','$2b$10$2eJnGd53OauaeqRAmy6.K.lZzz.BQgUdvoHwIgUr5wTYBXtd9b3d6',NULL,NULL,NULL,NULL,NULL,NULL,'customer',1,'2026-05-16 16:21:11','2026-05-16 16:21:11',0),(5,'Hasekimagru','luvantinh','$2b$12$KuLNBxDekSbwHy237Su/c.b7edfOIRdhoP7Ua0PQYssA0MMB2Et1i',NULL,'0','0818177533','/uploads/avatars/user-5-1779721746324-jetxthi6.jpg',NULL,NULL,'customer',1,'2026-05-25 15:08:20','2026-05-25 15:09:14',0),(6,'Admin','admin','$2b$12$mJ18mA/Y0yhLGXiZMSlDL.NVIR8daPYvVvSNVIU.Yo4Ur0tC.rJ8O',NULL,NULL,'0818177533',NULL,NULL,NULL,'admin',1,'2026-06-02 15:53:29','2026-06-02 15:55:01',0),(7,'luvantinh','tinh123','$2b$12$gowoBg4ksbizRsvIJqt3perMWo29btZC/Ky88JydrpyMaNQaRXGvi',NULL,NULL,'0818177533',NULL,'tinhlu662@gmail.com',NULL,'customer',1,'2026-06-07 22:37:29','2026-06-07 22:37:29',0);
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

-- Dump completed on 2026-06-15  5:39:59
