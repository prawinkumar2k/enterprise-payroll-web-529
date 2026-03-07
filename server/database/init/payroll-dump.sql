-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: billing_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `billing_db`
--

/*!40000 DROP DATABASE IF EXISTS `billing_db`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `billing_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `billing_db`;

--
-- Table structure for table `activate`
--

DROP TABLE IF EXISTS `activate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activate` (
  `SerialNumber` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ActivationKey` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MacAddress` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ActDate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ConfirmKey` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SMode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ClgCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ClgName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ClgCity` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CloseDate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activate`
--

LOCK TABLES `activate` WRITE;
/*!40000 ALTER TABLE `activate` DISABLE KEYS */;
/*!40000 ALTER TABLE `activate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_settings`
--

DROP TABLE IF EXISTS `app_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` longtext,
  `category` varchar(50) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `device_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`setting_key`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_settings`
--

LOCK TABLES `app_settings` WRITE;
/*!40000 ALTER TABLE `app_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` char(36) NOT NULL,
  `user_id` varchar(100) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `action_type` varchar(50) DEFAULT NULL,
  `module` varchar(50) DEFAULT NULL,
  `description` text,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `device_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sync_version` int DEFAULT '1',
  `tenant_id` varchar(64) NOT NULL DEFAULT 'local',
  `is_synced` tinyint(1) NOT NULL DEFAULT '1',
  `uuid` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_created` (`created_at`),
  KEY `idx_audit_module` (`module`,`created_at`),
  KEY `idx_audit_tenant` (`tenant_id`),
  KEY `idx_audit_tenant_uuid` (`tenant_id`,`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billded`
--

DROP TABLE IF EXISTS `billded`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billded` (
  `GNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AccountName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Salary` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billded`
--

LOCK TABLES `billded` WRITE;
/*!40000 ALTER TABLE `billded` DISABLE KEYS */;
/*!40000 ALTER TABLE `billded` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_code` varchar(50) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `license_key` varchar(255) DEFAULT NULL,
  `plan_id` int DEFAULT '1',
  `status` enum('active','inactive','expired') DEFAULT 'active',
  `expiry_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `company_code` (`company_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'DEFAULT','Default Company',1,'2026-03-02 21:09:06','DEFAUL-2026-3DFD8F17',1,'active',NULL),(3,'SF001','searchfirst',1,'2026-03-02 21:56:38','SF001-2026-C585B8D8',1,'active','2027-03-02');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daarrear`
--

DROP TABLE IF EXISTS `daarrear`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daarrear` (
  `MONTHYEAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PNBNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `D_PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TOTAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DAper` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NewDA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NewDAPer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Difference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ArrearMonth` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CAT` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MonthOrder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daarrear`
--

LOCK TABLES `daarrear` WRITE;
/*!40000 ALTER TABLE `daarrear` DISABLE KEYS */;
/*!40000 ALTER TABLE `daarrear` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empdet`
--

DROP TABLE IF EXISTS `empdet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empdet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `SLNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GradePay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PANCARD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AccountNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `BankName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IFSCCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OtherAccNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DOB` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `JDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CheckStatus` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EPF` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ESI` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MPHIL` decimal(10,2) DEFAULT '0.00',
  `PHD` decimal(10,2) DEFAULT '0.00',
  `HATA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Allowance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPECIAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `INTERIM` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ML` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MaL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RH` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LopDate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `device_id` varchar(100) DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `tenant_id` varchar(50) DEFAULT 'local',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `idx_empno_unique` (`EMPNO`) USING BTREE,
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `idx_unique_uuid` (`uuid`),
  KEY `idx_empdet_category` (`Category`) USING BTREE,
  KEY `idx_empdet_status` (`CheckStatus`) USING BTREE,
  KEY `idx_empdet_designation` (`DESIGNATION`) USING BTREE,
  KEY `idx_empdet_sname` (`SNAME`) USING BTREE,
  KEY `idx_empdet_absgroup` (`AbsGroup`) USING BTREE,
  KEY `idx_sync` (`is_synced`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_updated` (`updated_at`),
  KEY `idx_empdet_uuid` (`uuid`),
  KEY `idx_empdet_synced` (`is_synced`),
  KEY `idx_empdet_tenant` (`tenant_id`),
  KEY `idx_emp_checkstatus` (`CheckStatus`,`deleted_at`),
  KEY `idx_emp_category` (`Category`,`CheckStatus`),
  KEY `idx_emp_empno` (`EMPNO`),
  KEY `idx_emp_dgroup` (`DGroup`),
  KEY `idx_emp_updated` (`updated_at`),
  KEY `idx_empdet_tenant_uuid` (`tenant_id`,`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empdet`
--

LOCK TABLES `empdet` WRITE;
/*!40000 ALTER TABLE `empdet` DISABLE KEYS */;
/*!40000 ALTER TABLE `empdet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empdet-141213`
--

DROP TABLE IF EXISTS `empdet-141213`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empdet-141213` (
  `SLNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PANCARD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AccountNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DOB` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `JDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CheckStatus` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EPF` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MPHIL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PHD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Allowance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPECIAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `INTERIM` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empdet-141213`
--

LOCK TABLES `empdet-141213` WRITE;
/*!40000 ALTER TABLE `empdet-141213` DISABLE KEYS */;
/*!40000 ALTER TABLE `empdet-141213` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emppay`
--

DROP TABLE IF EXISTS `emppay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emppay` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `MONTHYEAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Designation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NoofDays` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LeaveDays` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `WorkingDays` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GradePay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PHD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MPHIL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `HATA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Allowance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPECIAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `INTERIM` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GROSSPAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EPF` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ESI` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ESIM` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IT` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PT` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Advance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LIC` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RECOVERY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OTHERS` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TOTDED` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NETSAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AccountNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `BankName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IFSCCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OtherAccNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `InterimPay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DAper` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Bonus` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `device_id` varchar(100) DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `tenant_id` varchar(50) DEFAULT 'local',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `idx_unique_uuid` (`uuid`),
  KEY `idx_emppay_monthyear` (`MONTHYEAR`) USING BTREE,
  KEY `idx_emppay_empno` (`EMPNO`) USING BTREE,
  KEY `idx_emppay_composite` (`MONTHYEAR`,`EMPNO`) USING BTREE,
  KEY `idx_sync` (`is_synced`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_updated` (`updated_at`),
  KEY `idx_emppay_empno_month` (`EMPNO`,`MONTHYEAR`),
  KEY `idx_emppay_synced` (`is_synced`),
  KEY `idx_emppay_tenant` (`tenant_id`),
  KEY `idx_emppay_dgroup_month` (`DGroup`,`MONTHYEAR`),
  KEY `idx_emppay_netsal_month` (`MONTHYEAR`,`NETSAL`),
  KEY `idx_emppay_tenant_uuid` (`tenant_id`,`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emppay`
--

LOCK TABLES `emppay` WRITE;
/*!40000 ALTER TABLE `emppay` DISABLE KEYS */;
/*!40000 ALTER TABLE `emppay` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emptrash`
--

DROP TABLE IF EXISTS `emptrash`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emptrash` (
  `id` int NOT NULL AUTO_INCREMENT,
  `SLNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GradePay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PANCARD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AccountNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `BankName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IFSCCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OtherAccNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DOB` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `JDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CheckStatus` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EPF` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ESI` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MPHIL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PHD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `HATA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Allowance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPECIAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `INTERIM` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ML` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MaL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RH` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LopDate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `idx_empno_unique` (`EMPNO`) USING BTREE,
  KEY `idx_empdet_category` (`Category`) USING BTREE,
  KEY `idx_empdet_status` (`CheckStatus`) USING BTREE,
  KEY `idx_empdet_designation` (`DESIGNATION`) USING BTREE,
  KEY `idx_empdet_sname` (`SNAME`) USING BTREE,
  KEY `idx_empdet_absgroup` (`AbsGroup`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emptrash`
--

LOCK TABLES `emptrash` WRITE;
/*!40000 ALTER TABLE `emptrash` DISABLE KEYS */;
/*!40000 ALTER TABLE `emptrash` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emptrash_091014`
--

DROP TABLE IF EXISTS `emptrash_091014`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emptrash_091014` (
  `SLNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PANCARD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AccountNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DOB` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `JDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CheckStatus` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EPF` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ESI` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MPHIL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PHD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Allowance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPECIAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `INTERIM` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ML` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MaL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RH` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LopDate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emptrash_091014`
--

LOCK TABLES `emptrash_091014` WRITE;
/*!40000 ALTER TABLE `emptrash_091014` DISABLE KEYS */;
/*!40000 ALTER TABLE `emptrash_091014` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logdetails`
--

DROP TABLE IF EXISTS `logdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logdetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sno` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UserId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UDate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UTime` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_log_userid` (`UserId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logdetails`
--

LOCK TABLES `logdetails` WRITE;
/*!40000 ALTER TABLE `logdetails` DISABLE KEYS */;
/*!40000 ALTER TABLE `logdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_attempts`
--

DROP TABLE IF EXISTS `login_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `status` enum('SUCCESS','FAILURE') NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_attempts`
--

LOCK TABLES `login_attempts` WRITE;
/*!40000 ALTER TABLE `login_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `login_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_settings`
--

DROP TABLE IF EXISTS `organization_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `address_line1` text,
  `address_line2` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `tagline` text,
  `logo_url` text,
  `sig_1_label` varchar(100) DEFAULT 'Prepared By',
  `sig_2_label` varchar(100) DEFAULT 'Checked By',
  `sig_3_label` varchar(100) DEFAULT 'Verified By',
  `sig_4_label` varchar(100) DEFAULT 'Principal/Authorised Signatory',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `device_id` varchar(100) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_settings`
--

LOCK TABLES `organization_settings` WRITE;
/*!40000 ALTER TABLE `organization_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `organization_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_line_items`
--

DROP TABLE IF EXISTS `payroll_line_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_line_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payroll_run_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gross` decimal(12,2) NOT NULL,
  `deductions` decimal(12,2) NOT NULL,
  `net_pay` decimal(12,2) NOT NULL,
  `basic` decimal(12,2) NOT NULL DEFAULT '0.00',
  `pf_employee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `pf_employer` decimal(10,2) NOT NULL DEFAULT '0.00',
  `esi_employee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `esi_employer` decimal(10,2) NOT NULL DEFAULT '0.00',
  `trace` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `device_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_payroll_run` (`payroll_run_id`),
  KEY `idx_payroll_line_items_employee` (`employee_id`),
  CONSTRAINT `fk_payroll_run` FOREIGN KEY (`payroll_run_id`) REFERENCES `payroll_runs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_line_items`
--

LOCK TABLES `payroll_line_items` WRITE;
/*!40000 ALTER TABLE `payroll_line_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll_line_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_reversals`
--

DROP TABLE IF EXISTS `payroll_reversals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_reversals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `original_run_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reversal_run_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_original_run` (`original_run_id`),
  KEY `fk_reversal_run` (`reversal_run_id`),
  CONSTRAINT `fk_original_run` FOREIGN KEY (`original_run_id`) REFERENCES `payroll_runs` (`id`),
  CONSTRAINT `fk_reversal_run` FOREIGN KEY (`reversal_run_id`) REFERENCES `payroll_runs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_reversals`
--

LOCK TABLES `payroll_reversals` WRITE;
/*!40000 ALTER TABLE `payroll_reversals` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll_reversals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_runs`
--

DROP TABLE IF EXISTS `payroll_runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_runs` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `run_mode` enum('DRY_RUN','COMMIT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('SUCCESS','FAILED','FINALIZED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `engine_version` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_count` int NOT NULL,
  `total_gross` decimal(12,2) NOT NULL,
  `total_deductions` decimal(12,2) NOT NULL,
  `total_net` decimal(12,2) NOT NULL,
  `failure_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `device_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_payroll_period` (`year`,`month`,`engine_version`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_runs`
--

LOCK TABLES `payroll_runs` WRITE;
/*!40000 ALTER TABLE `payroll_runs` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll_runs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(100) NOT NULL,
  `max_users` int DEFAULT '10',
  `max_storage_mb` int DEFAULT '500',
  `max_records` int DEFAULT '5000',
  `price` decimal(10,2) DEFAULT '0.00',
  `duration_days` int DEFAULT '365',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES (1,'Free',5,100,1000,0.00,365),(2,'Basic',25,1000,10000,999.00,365),(3,'Pro',100,5000,100000,2999.00,365),(4,'Enterprise',999,50000,9999999,9999.00,365);
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `device_id` varchar(100) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `company_code` varchar(50) DEFAULT 'DEFAULT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` datetime DEFAULT NULL,
  `replaced_by_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `token_2` (`token`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,'5cb21a9c6c3032adf80197a3edcf1df298ca6b8113d9c5ef8304a71634b278320579f3aac3c1613f',5,NULL,'2026-03-10 16:35:58','DEFAULT','2026-03-03 16:35:57',NULL,NULL),(2,'b871788eaede1f808fe043d4b1b92565bed388bfa6e3a0566be6da6be1f150c65a83cf07f497065d',9,NULL,'2026-03-10 16:35:58','SF001','2026-03-03 16:35:57',NULL,NULL),(3,'fc47db4ce746e11e89a71ae05deb426a3568d12e2b07e420e10ebff9e402ede638cc08a9493e1e51',5,NULL,'2026-03-10 16:39:51','DEFAULT','2026-03-03 16:39:51',NULL,NULL),(4,'8a1b4a91a19e635cfe6d3fafb489c136dd5507a5e4c9efdc97abb7ee7aadb9be40b25ddbfc587a25',5,NULL,'2026-03-10 16:40:14','DEFAULT','2026-03-03 16:40:13',NULL,NULL),(5,'7dbba1832eb113a1400d044d6f1d478c9c980734b45d201e547a0d76cbb54c2e6eeebacbb1399490',5,NULL,'2026-03-10 16:43:05','DEFAULT','2026-03-03 16:43:04',NULL,NULL),(6,'b15a060167d9217e181210513dac6babf91332da23d3e2e43e283b814c40c33919220bcc421238ac',5,NULL,'2026-03-10 16:54:55','DEFAULT','2026-03-03 16:54:54',NULL,NULL),(7,'8df20a18a45a804a6b882c742bdbde79c327b5f4b5ce50b11612b9abec4790591a96b4a2ed7f40cc',5,NULL,'2026-03-10 17:04:00','DEFAULT','2026-03-03 17:03:59',NULL,NULL),(8,'0ec558f208013d72977e4401e5b83ed54449ae0fdbc3a4ec36dfff0934171fb7185b32c099632961',5,NULL,'2026-03-10 17:05:04','DEFAULT','2026-03-03 17:05:04',NULL,NULL),(9,'260519e6194fce61a678693de8097c51741cccdab65c8e69117cbedee0f4485dd9c4d9a9ae1b767a',9,NULL,'2026-03-10 17:07:15','SF001','2026-03-03 17:07:14',NULL,NULL);
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repabstract`
--

DROP TABLE IF EXISTS `repabstract`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repabstract` (
  `Sno` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Designation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GrossPay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Advance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TotDed` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NetSal` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ByCash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ByBank` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repabstract`
--

LOCK TABLES `repabstract` WRITE;
/*!40000 ALTER TABLE `repabstract` DISABLE KEYS */;
/*!40000 ALTER TABLE `repabstract` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schema_versions`
--

DROP TABLE IF EXISTS `schema_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schema_versions` (
  `version_id` int NOT NULL,
  `version_name` varchar(100) DEFAULT NULL,
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schema_versions`
--

LOCK TABLES `schema_versions` WRITE;
/*!40000 ALTER TABLE `schema_versions` DISABLE KEYS */;
INSERT INTO `schema_versions` VALUES (1,'baseline','2026-02-27 14:19:32'),(2,'sync_columns','2026-02-27 14:19:32'),(3,'missing_tables','2026-02-27 14:19:32');
/*!40000 ALTER TABLE `schema_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staffattendance`
--

DROP TABLE IF EXISTS `staffattendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffattendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `SLNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ADATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AttType` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Leave` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Sessions` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `device_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `tenant_id` varchar(64) NOT NULL DEFAULT 'local',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_uuid` (`uuid`),
  KEY `idx_attendance_empno` (`EMPNO`) USING BTREE,
  KEY `idx_attendance_date` (`ADATE`) USING BTREE,
  KEY `idx_attendance_composite` (`EMPNO`,`ADATE`) USING BTREE,
  KEY `idx_sync` (`is_synced`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_updated` (`updated_at`),
  KEY `idx_staffattendance_category` (`Category`),
  KEY `idx_att_adate` (`ADATE`),
  KEY `idx_att_empno_adate` (`EMPNO`,`ADATE`),
  KEY `idx_att_category_date` (`Category`,`ADATE`),
  KEY `idx_att_created` (`created_at`),
  KEY `idx_attendance_tenant` (`tenant_id`),
  KEY `idx_attendance_tenant_uuid` (`tenant_id`,`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffattendance`
--

LOCK TABLES `staffattendance` WRITE;
/*!40000 ALTER TABLE `staffattendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `staffattendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staffattreport`
--

DROP TABLE IF EXISTS `staffattreport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffattreport` (
  `SLNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ADATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Sessions` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OD0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CL0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ML0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MaL0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RH0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PER0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OD1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CL1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ML1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MaL1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RH1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PER1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ML` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MaL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RH` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PER` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffattreport`
--

LOCK TABLES `staffattreport` WRITE;
/*!40000 ALTER TABLE `staffattreport` DISABLE KEYS */;
/*!40000 ALTER TABLE `staffattreport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `super_admins`
--

DROP TABLE IF EXISTS `super_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `super_admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `super_admins`
--

LOCK TABLES `super_admins` WRITE;
/*!40000 ALTER TABLE `super_admins` DISABLE KEYS */;
INSERT INTO `super_admins` VALUES (1,'admin','$2b$10$jyI1tIONU1k3rU6h3M0BTe.Qe38kVT8esmU0TvdyU7tF0pde03WuG','2026-03-03 17:09:04');
/*!40000 ALTER TABLE `super_admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sync_batches`
--

DROP TABLE IF EXISTS `sync_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sync_batches` (
  `batch_id` varchar(36) NOT NULL,
  `tenant_id` varchar(50) NOT NULL,
  `direction` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `record_count` int DEFAULT '0',
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `error_message` text,
  PRIMARY KEY (`batch_id`),
  KEY `idx_batch_status` (`status`,`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sync_batches`
--

LOCK TABLES `sync_batches` WRITE;
/*!40000 ALTER TABLE `sync_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `sync_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sync_logs`
--

DROP TABLE IF EXISTS `sync_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sync_logs` (
  `id` char(36) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_uuid` char(36) DEFAULT NULL,
  `action` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'PENDING',
  `error_message` text,
  `retry_count` int DEFAULT '0',
  `device_id` varchar(100) DEFAULT NULL,
  `synced_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `local_version` int DEFAULT NULL,
  `server_version` int DEFAULT NULL,
  `local_updated_at` timestamp NULL DEFAULT NULL,
  `server_updated_at` timestamp NULL DEFAULT NULL,
  `conflict_reason` varchar(100) DEFAULT NULL,
  `resolved_by` varchar(100) DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sync_logs`
--

LOCK TABLES `sync_logs` WRITE;
/*!40000 ALTER TABLE `sync_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `sync_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL DEFAULT '1',
  `uuid` char(36) DEFAULT NULL,
  `org_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `org_city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_pincode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_gst` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bank_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bank_account_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bank_ifsc` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bank_account_holder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `fin_year` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `fin_pf_rate` decimal(5,2) DEFAULT NULL,
  `fin_esi_rate` decimal(5,2) DEFAULT NULL,
  `fin_pt_slab_a` decimal(10,2) DEFAULT NULL,
  `fin_pt_slab_b` decimal(10,2) DEFAULT NULL,
  `fin_pt_slab_c` decimal(10,2) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fin_pf_min_limit` decimal(10,2) DEFAULT '15000.00',
  `fin_pf_max_amt` decimal(10,2) DEFAULT '1800.00',
  `fin_esi_limit` decimal(10,2) DEFAULT '21000.00',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `device_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temppay`
--

DROP TABLE IF EXISTS `temppay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temppay` (
  `MonthOrder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CMONTH` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CYEAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MONTHYEAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PNBNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `D_PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `HRA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PPR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PP5` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SP` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GROSSPAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFS` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFARR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFDA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPFG` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPFG_DUENO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GI` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PRD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `FAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `FAR_DUENO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PLI` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `THSOC` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFLR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFLR_DUENO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LIC` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ADIT` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PTAX` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MISC` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `HFS` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `STORES` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `BUS` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TOTDED` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NETSAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DAper` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temppay`
--

LOCK TABLES `temppay` WRITE;
/*!40000 ALTER TABLE `temppay` DISABLE KEYS */;
/*!40000 ALTER TABLE `temppay` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usage_stats`
--

DROP TABLE IF EXISTS `usage_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usage_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `total_users` int DEFAULT '0',
  `total_records` int DEFAULT '0',
  `storage_used_mb` decimal(10,2) DEFAULT '0.00',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `company_id` (`company_id`),
  CONSTRAINT `usage_stats_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usage_stats`
--

LOCK TABLES `usage_stats` WRITE;
/*!40000 ALTER TABLE `usage_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `usage_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userdetails`
--

DROP TABLE IF EXISTS `userdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userdetails` (
  `UserID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `UserName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Qualification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Department` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Role` enum('super_admin','admin','hr_officer','accountant','auditor','employee') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'employee',
  `Contact` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `device_id` varchar(100) DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `company_id` int NOT NULL DEFAULT '1' COMMENT 'FK to companies',
  UNIQUE KEY `new_id` (`id`) USING BTREE,
  UNIQUE KEY `uq_company_userid` (`company_id`,`UserID`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `idx_user_userid` (`UserID`) USING BTREE,
  KEY `idx_user_role` (`Role`) USING BTREE,
  KEY `idx_sync` (`is_synced`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_updated` (`updated_at`),
  CONSTRAINT `fk_userdetails_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userdetails`
--

LOCK TABLES `userdetails` WRITE;
/*!40000 ALTER TABLE `userdetails` DISABLE KEYS */;
INSERT INTO `userdetails` VALUES ('gandhi',2,'39810f0d-e9d4-4e6c-b559-50929996c094','hr123','Client1','','','hr_officer','','','MASTER',0,1,'2026-02-11 08:24:55','2026-02-11 08:24:55',NULL,1),('lathareddi',3,'3f45240d-b543-439e-bbeb-46ef5482667f','acc123','Server','','','accountant','','','MASTER',0,1,'2026-02-11 08:24:55','2026-02-11 08:24:55',NULL,1),('Omega',4,'cce40feb-dac4-484b-b9a4-7a8cffd78bfc','audit123','Jeeva',NULL,NULL,'auditor',NULL,NULL,'MASTER',0,1,'2026-02-11 08:24:55','2026-02-11 08:24:55',NULL,1),('prawin',5,'a10f6874-c0c1-4b08-92b6-9940dc717d27','$2b$10$257oc8Xb5idCu6lGGzhy1u7ztC79sJ0pwAlzbC.CzGVfmDSCqqmQ2','prawinkumar.N','m tech','IT','admin','8807054164','nil','MASTER',0,1,'2026-02-11 08:24:55','2026-03-02 21:16:49',NULL,1),('login ',6,'fbfc9132-c346-406a-8d16-afc1a2b5156f','$2b$10$TBU4eexVVYsk9Z7KKeUC3.Gmw0HUJbNQrqWAJyTjsQl.d7j5y5ckS','npk','mca','ac','admin','9976181075','nil','MASTER',0,1,'2026-02-11 08:24:55','2026-02-11 08:24:55',NULL,1),('test',7,'bb098354-c8cb-4bbe-bc4a-152bc9da571c','$2b$12$wsCa2ZJOUwRCU0p295kUQOjTdd9ECD19OQ./4TYI5rEl1oWpWc3ba','prawin','tset','test','admin','tset',NULL,'MASTER',0,1,'2026-02-11 08:24:55','2026-02-11 08:24:55',NULL,1),('admin',8,NULL,'$2b$10$9oTpjdl8vY6VDhnwPxWBhuIb1Au9mXxJ6frqz7npJhoJTc0rm4/KW','Administrator',NULL,NULL,'admin',NULL,NULL,'MASTER',0,1,'2026-02-14 17:07:16','2026-02-14 17:07:39',NULL,1),('admin',9,'3eaf83e5-1378-4d64-82aa-79f9810eda3a','$2b$10$XYnDPPYPyWqLna515Ca5G.2bxyCS9vqneRv.XdmgELHF51a7WvCt6','admin',NULL,NULL,'admin',NULL,NULL,'MASTER',0,1,'2026-03-02 21:56:38','2026-03-02 21:56:38',NULL,3);
/*!40000 ALTER TABLE `userdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userlogs`
--

DROP TABLE IF EXISTS `userlogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userlogs` (
  `LogID` int NOT NULL AUTO_INCREMENT,
  `UserID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UserName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ActionType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Module` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `IPAddress` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LogDate` date DEFAULT NULL,
  `LogTime` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LogID`) USING BTREE,
  KEY `idx_userid` (`UserID`) USING BTREE,
  KEY `idx_date` (`LogDate`) USING BTREE,
  KEY `idx_userlogs_created` (`created_at`),
  KEY `idx_userlogs_module_dt` (`Module`,`created_at`),
  KEY `idx_userlogs_userid` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userlogs`
--

LOCK TABLES `userlogs` WRITE;
/*!40000 ALTER TABLE `userlogs` DISABLE KEYS */;
INSERT INTO `userlogs` VALUES (1,'prawin',NULL,'user','LOGIN','AUTH','User logged in successfully','127.0.0.1','2026-03-03','22:05:57','2026-03-03 16:35:57'),(2,'admin',NULL,'user','LOGIN','AUTH','User logged in successfully','127.0.0.1','2026-03-03','22:05:57','2026-03-03 16:35:57'),(3,'prawin',NULL,'user','LOGIN','AUTH','User logged in successfully','127.0.0.1','2026-03-03','22:09:51','2026-03-03 16:39:51'),(4,'prawin',NULL,'user','LOGIN','AUTH','User logged in successfully','127.0.0.1','2026-03-03','22:10:13','2026-03-03 16:40:13'),(5,'prawin',NULL,'user','LOGIN','AUTH','User logged in successfully','127.0.0.1','2026-03-03','22:13:04','2026-03-03 16:43:04'),(6,'prawin',NULL,'user','LOGIN','AUTH','User logged in successfully','127.0.0.1','2026-03-03','22:24:54','2026-03-03 16:54:54'),(7,'prawin',NULL,'user','LOGIN','AUTH','User logged in successfully','127.0.0.1','2026-03-03','22:33:59','2026-03-03 17:03:59'),(8,'prawin',NULL,'user','LOGIN','AUTH','User logged in successfully','127.0.0.1','2026-03-03','22:35:04','2026-03-03 17:05:04'),(9,'admin',NULL,'user','LOGIN','AUTH','User logged in successfully','127.0.0.1','2026-03-03','22:37:14','2026-03-03 17:07:14');
/*!40000 ALTER TABLE `userlogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'billing_db'
--
/*!50003 DROP PROCEDURE IF EXISTS `AddColumnSafely` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `AddColumnSafely`(IN p_table VARCHAR(64),

    IN p_column VARCHAR(64),

    IN p_definition TEXT)
BEGIN

    IF NOT EXISTS (

        SELECT 1 FROM information_schema.COLUMNS 

        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = p_column

    ) THEN

        SET @sql = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition);

        PREPARE stmt FROM @sql;

        EXECUTE stmt;

        DEALLOCATE PREPARE stmt;

    END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `AddIndexSafely` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `AddIndexSafely`(IN p_table VARCHAR(64),

    IN p_index VARCHAR(64),

    IN p_columns VARCHAR(255),

    IN p_is_unique BOOLEAN)
BEGIN

    IF NOT EXISTS (

        SELECT 1 FROM information_schema.STATISTICS 

        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND INDEX_NAME = p_index

    ) THEN

        IF p_is_unique THEN

            SET @sql = CONCAT('CREATE UNIQUE INDEX `', p_index, '` ON `', p_table, '` (', p_columns, ')');

        ELSE

            SET @sql = CONCAT('CREATE INDEX `', p_index, '` ON `', p_table, '` (', p_columns, ')');

        END IF;

        PREPARE stmt FROM @sql;

        EXECUTE stmt;

        DEALLOCATE PREPARE stmt;

    END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `DropColumnSafely` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `DropColumnSafely`(IN p_table VARCHAR(64),

    IN p_column VARCHAR(64))
BEGIN

    IF EXISTS (

        SELECT 1 FROM information_schema.COLUMNS 

        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = p_column

    ) THEN

        SET @sql = CONCAT('ALTER TABLE `', p_table, '` DROP COLUMN `', p_column, '`');

        PREPARE stmt FROM @sql;

        EXECUTE stmt;

        DEALLOCATE PREPARE stmt;

    END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `SafeAddColumn` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `SafeAddColumn`(IN t_name VARCHAR(64),

    IN c_name VARCHAR(64),

    IN c_def TEXT)
BEGIN

    IF NOT EXISTS (

        SELECT 1 FROM information_schema.COLUMNS 

        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = t_name AND COLUMN_NAME = c_name

    ) THEN

        SET @s = CONCAT('ALTER TABLE `', t_name, '` ADD COLUMN `', c_name, '` ', c_def);

        PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

    END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `SafeAddIndex` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `SafeAddIndex`(IN t_name VARCHAR(64),

    IN i_name VARCHAR(64),

    IN i_cols VARCHAR(255),

    IN is_unique BOOLEAN)
BEGIN

    IF NOT EXISTS (

        SELECT 1 FROM information_schema.STATISTICS 

        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = t_name AND INDEX_NAME = i_name

    ) THEN

        IF is_unique THEN

            SET @s = CONCAT('CREATE UNIQUE INDEX `', i_name, '` ON `', t_name, '` (', i_cols, ')');

        ELSE

            SET @s = CONCAT('CREATE INDEX `', i_name, '` ON `', t_name, '` (', i_cols, ')');

        END IF;

        PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

    END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `SafeDropColumn` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `SafeDropColumn`(IN t_name VARCHAR(64),

    IN c_name VARCHAR(64))
BEGIN

    IF EXISTS (

        SELECT 1 FROM information_schema.COLUMNS 

        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = t_name AND COLUMN_NAME = c_name

    ) THEN

        SET @s = CONCAT('ALTER TABLE `', t_name, '` DROP COLUMN `', c_name, '`');

        PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

    END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `SafeSetPK` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `SafeSetPK`(IN t_name VARCHAR(64),

    IN c_name VARCHAR(64))
BEGIN

    -- Drop existing PK if any

    IF EXISTS (

        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS 

        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = t_name AND CONSTRAINT_TYPE = 'PRIMARY KEY'

    ) THEN

        SET @s = CONCAT('ALTER TABLE `', t_name, '` DROP PRIMARY KEY');

        PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

    END IF;

    -- Add new PK

    SET @s = CONCAT('ALTER TABLE `', t_name, '` ADD PRIMARY KEY (`', c_name, '`)');

    PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Current Database: `payroll_DEFAULT`
--

/*!40000 DROP DATABASE IF EXISTS `payroll_DEFAULT`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `payroll_DEFAULT` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `payroll_DEFAULT`;

--
-- Table structure for table `activate`
--

DROP TABLE IF EXISTS `activate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activate` (
  `SerialNumber` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ActivationKey` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MacAddress` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ActDate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ConfirmKey` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SMode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ClgCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ClgName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ClgCity` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CloseDate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activate`
--

LOCK TABLES `activate` WRITE;
/*!40000 ALTER TABLE `activate` DISABLE KEYS */;
/*!40000 ALTER TABLE `activate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_settings`
--

DROP TABLE IF EXISTS `app_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` longtext,
  `category` varchar(50) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `device_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`setting_key`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_settings`
--

LOCK TABLES `app_settings` WRITE;
/*!40000 ALTER TABLE `app_settings` DISABLE KEYS */;
INSERT INTO `app_settings` VALUES (46,NULL,'enable_abstract_1','true',NULL,'2026-03-03 11:12:18',0,1,NULL,'2026-03-03 11:12:18',NULL),(47,NULL,'enable_abstract_2','true',NULL,'2026-03-03 11:12:18',0,1,NULL,'2026-03-03 11:12:18',NULL),(12,NULL,'enable_attendance','true','features','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(48,NULL,'enable_bank_statement','true',NULL,'2026-03-03 11:12:18',0,1,NULL,'2026-03-03 11:12:18',NULL),(55,NULL,'enable_expense','true','features','2026-03-03 13:19:05',0,1,NULL,'2026-03-03 13:19:05',NULL),(54,NULL,'enable_income','true','features','2026-03-03 13:19:05',0,1,NULL,'2026-03-03 13:19:05',NULL),(45,NULL,'enable_pay_bill','true',NULL,'2026-03-03 11:12:18',0,1,NULL,'2026-03-03 11:12:18',NULL),(49,NULL,'enable_pay_certificate','true',NULL,'2026-03-03 11:12:18',0,1,NULL,'2026-03-03 11:12:18',NULL),(13,NULL,'enable_reports','true','features','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(14,NULL,'enable_salary','true','features','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(50,NULL,'enable_staff_report','true',NULL,'2026-03-03 11:12:18',0,1,NULL,'2026-03-03 11:12:18',NULL),(2,NULL,'org_address','','organization','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(4,NULL,'org_email','','organization','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(5,NULL,'org_logo_url','','organization','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(1,NULL,'org_name','searchfirst','organization','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(3,NULL,'org_phone','','organization','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(15,NULL,'print_font_family','Times New Roman','print','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(16,NULL,'print_font_size','10pt','print','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(18,NULL,'print_show_timestamp','true','print','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(17,NULL,'print_table_font_size','9pt','print','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(19,NULL,'sig_1_label','Prepared By','signatures','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(20,NULL,'sig_2_label','Checked By','signatures','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(21,NULL,'sig_3_label','Approved By','signatures','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(22,NULL,'sig_4_label','Authorized By','signatures','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(8,NULL,'title_abstract_1','Pay Abstract','reports','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(9,NULL,'title_abstract_2','Pay Abstract II','reports','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(7,NULL,'title_bank_statement','Bank Statement','reports','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(6,NULL,'title_pay_bill','Pay Bill','reports','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(11,NULL,'title_pay_certificate','Pay Certificate','reports','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL),(10,NULL,'title_staff_master','Staff Master','reports','2026-03-03 09:56:33',0,1,NULL,'2026-03-03 09:56:33',NULL);
/*!40000 ALTER TABLE `app_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` char(36) NOT NULL,
  `user_id` varchar(100) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `action_type` varchar(50) DEFAULT NULL,
  `module` varchar(50) DEFAULT NULL,
  `description` text,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `device_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sync_version` int DEFAULT '1',
  `tenant_id` varchar(64) NOT NULL DEFAULT 'local',
  `is_synced` tinyint(1) NOT NULL DEFAULT '1',
  `uuid` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_created` (`created_at`),
  KEY `idx_audit_module` (`module`,`created_at`),
  KEY `idx_audit_tenant` (`tenant_id`),
  KEY `idx_audit_tenant_uuid` (`tenant_id`,`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billded`
--

DROP TABLE IF EXISTS `billded`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billded` (
  `GNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AccountName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Salary` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billded`
--

LOCK TABLES `billded` WRITE;
/*!40000 ALTER TABLE `billded` DISABLE KEYS */;
/*!40000 ALTER TABLE `billded` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daarrear`
--

DROP TABLE IF EXISTS `daarrear`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daarrear` (
  `MONTHYEAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PNBNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `D_PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TOTAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DAper` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NewDA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NewDAPer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Difference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ArrearMonth` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CAT` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MonthOrder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daarrear`
--

LOCK TABLES `daarrear` WRITE;
/*!40000 ALTER TABLE `daarrear` DISABLE KEYS */;
/*!40000 ALTER TABLE `daarrear` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empdet`
--

DROP TABLE IF EXISTS `empdet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empdet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `SLNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GradePay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PANCARD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AccountNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `BankName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IFSCCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OtherAccNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DOB` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `JDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CheckStatus` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EPF` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ESI` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MPHIL` decimal(10,2) DEFAULT '0.00',
  `PHD` decimal(10,2) DEFAULT '0.00',
  `HATA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Allowance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPECIAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `INTERIM` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ML` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MaL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RH` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LopDate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `device_id` varchar(100) DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `tenant_id` varchar(50) DEFAULT 'local',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `idx_empno_unique` (`EMPNO`) USING BTREE,
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `idx_unique_uuid` (`uuid`),
  KEY `idx_empdet_category` (`Category`) USING BTREE,
  KEY `idx_empdet_status` (`CheckStatus`) USING BTREE,
  KEY `idx_empdet_designation` (`DESIGNATION`) USING BTREE,
  KEY `idx_empdet_sname` (`SNAME`) USING BTREE,
  KEY `idx_empdet_absgroup` (`AbsGroup`) USING BTREE,
  KEY `idx_sync` (`is_synced`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_updated` (`updated_at`),
  KEY `idx_empdet_uuid` (`uuid`),
  KEY `idx_empdet_synced` (`is_synced`),
  KEY `idx_empdet_tenant` (`tenant_id`),
  KEY `idx_emp_checkstatus` (`CheckStatus`,`deleted_at`),
  KEY `idx_emp_category` (`Category`,`CheckStatus`),
  KEY `idx_emp_empno` (`EMPNO`),
  KEY `idx_emp_dgroup` (`DGroup`),
  KEY `idx_emp_updated` (`updated_at`),
  KEY `idx_empdet_tenant_uuid` (`tenant_id`,`uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empdet`
--

LOCK TABLES `empdet` WRITE;
/*!40000 ALTER TABLE `empdet` DISABLE KEYS */;
INSERT INTO `empdet` VALUES (4,'d81fc28a-9fda-46ed-94cd-c142841f24a7','1','DEF001','prawin','director','a','a','1000','1000','1','uhiygig','4532312','rterwsaw','5342312`1','`12345','2004-12-07','2026-03-03','2026-03-28','2026-03-10','Active','fsg',NULL,NULL,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-31','SERVER_01',0,1,'2026-03-03 16:45:58','2026-03-03 16:59:22',NULL,'local'),(5,'2a501902-fd3c-45ea-bbff-6ca4cff9efa4','2','DEF002','kjefqnrlkgsd',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active',NULL,NULL,NULL,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'SERVER_01',0,1,'2026-03-03 17:05:58','2026-03-03 17:05:58',NULL,'local');
/*!40000 ALTER TABLE `empdet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emppay`
--

DROP TABLE IF EXISTS `emppay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emppay` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `MONTHYEAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Designation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NoofDays` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LeaveDays` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `WorkingDays` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GradePay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PHD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MPHIL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `HATA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Allowance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPECIAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `INTERIM` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GROSSPAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EPF` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ESI` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ESIM` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IT` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PT` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Advance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LIC` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RECOVERY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OTHERS` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TOTDED` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NETSAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AccountNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `BankName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IFSCCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OtherAccNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `InterimPay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DAper` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Bonus` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `device_id` varchar(100) DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `tenant_id` varchar(50) DEFAULT 'local',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `idx_unique_uuid` (`uuid`),
  KEY `idx_emppay_monthyear` (`MONTHYEAR`) USING BTREE,
  KEY `idx_emppay_empno` (`EMPNO`) USING BTREE,
  KEY `idx_emppay_composite` (`MONTHYEAR`,`EMPNO`) USING BTREE,
  KEY `idx_sync` (`is_synced`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_updated` (`updated_at`),
  KEY `idx_emppay_empno_month` (`EMPNO`,`MONTHYEAR`),
  KEY `idx_emppay_synced` (`is_synced`),
  KEY `idx_emppay_tenant` (`tenant_id`),
  KEY `idx_emppay_dgroup_month` (`DGroup`,`MONTHYEAR`),
  KEY `idx_emppay_netsal_month` (`MONTHYEAR`,`NETSAL`),
  KEY `idx_emppay_tenant_uuid` (`tenant_id`,`uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emppay`
--

LOCK TABLES `emppay` WRITE;
/*!40000 ALTER TABLE `emppay` DISABLE KEYS */;
INSERT INTO `emppay` VALUES (1,'61a6dda7-2c2c-4953-a05e-82ba5692d9c2','03-2026','DEF001','prawin','director','a','31','0','31','1000','1000','0.00','0.00',NULL,NULL,'fsg',NULL,NULL,'2000.00',NULL,NULL,'0','0','0','0','0','0','0','0.00','2000.00','4532312','rterwsaw','5342312`1','`12345','','0','0','a','0','2026-03-03 17:05:04','SERVER_01',0,1,'2026-03-03 17:05:04','2026-03-03 17:05:04',NULL,'local');
/*!40000 ALTER TABLE `emppay` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `income_expense`
--

DROP TABLE IF EXISTS `income_expense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `income_expense` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('income','expense') NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `transaction_date` date NOT NULL,
  `month_year` varchar(7) NOT NULL COMMENT 'MM-YYYY',
  `reference_no` varchar(100) DEFAULT NULL,
  `remarks` text,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ie_type` (`type`),
  KEY `idx_ie_month_year` (`month_year`),
  KEY `idx_ie_transaction_date` (`transaction_date`),
  KEY `idx_ie_category` (`category`),
  KEY `idx_ie_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `income_expense`
--

LOCK TABLES `income_expense` WRITE;
/*!40000 ALTER TABLE `income_expense` DISABLE KEYS */;
/*!40000 ALTER TABLE `income_expense` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logdetails`
--

DROP TABLE IF EXISTS `logdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logdetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sno` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UserId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UDate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UTime` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_log_userid` (`UserId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logdetails`
--

LOCK TABLES `logdetails` WRITE;
/*!40000 ALTER TABLE `logdetails` DISABLE KEYS */;
/*!40000 ALTER TABLE `logdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_attempts`
--

DROP TABLE IF EXISTS `login_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `status` enum('SUCCESS','FAILURE') NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_attempts`
--

LOCK TABLES `login_attempts` WRITE;
/*!40000 ALTER TABLE `login_attempts` DISABLE KEYS */;
INSERT INTO `login_attempts` VALUES (1,'prawin','127.0.0.1','SUCCESS','2026-03-03 16:35:57'),(2,'prawin','127.0.0.1','SUCCESS','2026-03-03 16:39:51'),(3,'prawin','127.0.0.1','SUCCESS','2026-03-03 16:40:13'),(4,'prawin','127.0.0.1','SUCCESS','2026-03-03 16:43:04'),(5,'prawin','127.0.0.1','SUCCESS','2026-03-03 16:54:54'),(6,'prawin','127.0.0.1','SUCCESS','2026-03-03 17:03:59'),(7,'prawin','127.0.0.1','SUCCESS','2026-03-03 17:05:04');
/*!40000 ALTER TABLE `login_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_settings`
--

DROP TABLE IF EXISTS `organization_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `address_line1` text,
  `address_line2` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `tagline` text,
  `logo_url` text,
  `sig_1_label` varchar(100) DEFAULT 'Prepared By',
  `sig_2_label` varchar(100) DEFAULT 'Checked By',
  `sig_3_label` varchar(100) DEFAULT 'Verified By',
  `sig_4_label` varchar(100) DEFAULT 'Principal/Authorised Signatory',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `device_id` varchar(100) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_settings`
--

LOCK TABLES `organization_settings` WRITE;
/*!40000 ALTER TABLE `organization_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `organization_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_line_items`
--

DROP TABLE IF EXISTS `payroll_line_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_line_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uuid` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payroll_run_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gross` decimal(12,2) NOT NULL,
  `deductions` decimal(12,2) NOT NULL,
  `net_pay` decimal(12,2) NOT NULL,
  `basic` decimal(12,2) NOT NULL DEFAULT '0.00',
  `pf_employee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `pf_employer` decimal(10,2) NOT NULL DEFAULT '0.00',
  `esi_employee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `esi_employer` decimal(10,2) NOT NULL DEFAULT '0.00',
  `trace` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `device_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_payroll_run` (`payroll_run_id`),
  KEY `idx_payroll_line_items_employee` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_line_items`
--

LOCK TABLES `payroll_line_items` WRITE;
/*!40000 ALTER TABLE `payroll_line_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll_line_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_reversals`
--

DROP TABLE IF EXISTS `payroll_reversals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_reversals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `original_run_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reversal_run_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_original_run` (`original_run_id`),
  KEY `fk_reversal_run` (`reversal_run_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_reversals`
--

LOCK TABLES `payroll_reversals` WRITE;
/*!40000 ALTER TABLE `payroll_reversals` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll_reversals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_runs`
--

DROP TABLE IF EXISTS `payroll_runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_runs` (
  `id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uuid` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `run_mode` enum('DRY_RUN','COMMIT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('SUCCESS','FAILED','FINALIZED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `engine_version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_count` int NOT NULL,
  `total_gross` decimal(12,2) NOT NULL,
  `total_deductions` decimal(12,2) NOT NULL,
  `total_net` decimal(12,2) NOT NULL,
  `failure_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `device_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_payroll_period` (`year`,`month`,`engine_version`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_runs`
--

LOCK TABLES `payroll_runs` WRITE;
/*!40000 ALTER TABLE `payroll_runs` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll_runs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `device_id` varchar(100) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `company_code` varchar(50) DEFAULT 'DEFAULT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` datetime DEFAULT NULL,
  `replaced_by_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `token_2` (`token`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repabstract`
--

DROP TABLE IF EXISTS `repabstract`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repabstract` (
  `Sno` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Designation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GrossPay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Advance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TotDed` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NetSal` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ByCash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ByBank` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repabstract`
--

LOCK TABLES `repabstract` WRITE;
/*!40000 ALTER TABLE `repabstract` DISABLE KEYS */;
/*!40000 ALTER TABLE `repabstract` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schema_versions`
--

DROP TABLE IF EXISTS `schema_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schema_versions` (
  `version_id` int NOT NULL,
  `version_name` varchar(100) DEFAULT NULL,
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schema_versions`
--

LOCK TABLES `schema_versions` WRITE;
/*!40000 ALTER TABLE `schema_versions` DISABLE KEYS */;
INSERT INTO `schema_versions` VALUES (1,'initial_company_schema','2026-03-03 08:32:00');
/*!40000 ALTER TABLE `schema_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staffattendance`
--

DROP TABLE IF EXISTS `staffattendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffattendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `SLNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ADATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AttType` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Leave` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Sessions` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `device_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `tenant_id` varchar(64) NOT NULL DEFAULT 'local',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_uuid` (`uuid`),
  KEY `idx_attendance_empno` (`EMPNO`) USING BTREE,
  KEY `idx_attendance_date` (`ADATE`) USING BTREE,
  KEY `idx_attendance_composite` (`EMPNO`,`ADATE`) USING BTREE,
  KEY `idx_sync` (`is_synced`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_updated` (`updated_at`),
  KEY `idx_staffattendance_category` (`Category`),
  KEY `idx_att_adate` (`ADATE`),
  KEY `idx_att_empno_adate` (`EMPNO`,`ADATE`),
  KEY `idx_att_category_date` (`Category`,`ADATE`),
  KEY `idx_att_created` (`created_at`),
  KEY `idx_attendance_tenant` (`tenant_id`),
  KEY `idx_attendance_tenant_uuid` (`tenant_id`,`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffattendance`
--

LOCK TABLES `staffattendance` WRITE;
/*!40000 ALTER TABLE `staffattendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `staffattendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staffattreport`
--

DROP TABLE IF EXISTS `staffattreport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffattreport` (
  `SLNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ADATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Sessions` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OD0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CL0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ML0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MaL0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RH0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PER0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OD1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CL1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ML1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MaL1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RH1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PER1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ML` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MaL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RH` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PER` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffattreport`
--

LOCK TABLES `staffattreport` WRITE;
/*!40000 ALTER TABLE `staffattreport` DISABLE KEYS */;
/*!40000 ALTER TABLE `staffattreport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sync_batches`
--

DROP TABLE IF EXISTS `sync_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sync_batches` (
  `batch_id` varchar(36) NOT NULL,
  `tenant_id` varchar(50) NOT NULL,
  `direction` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `record_count` int DEFAULT '0',
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `error_message` text,
  PRIMARY KEY (`batch_id`),
  KEY `idx_batch_status` (`status`,`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sync_batches`
--

LOCK TABLES `sync_batches` WRITE;
/*!40000 ALTER TABLE `sync_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `sync_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sync_logs`
--

DROP TABLE IF EXISTS `sync_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sync_logs` (
  `id` char(36) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_uuid` char(36) DEFAULT NULL,
  `action` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'PENDING',
  `error_message` text,
  `retry_count` int DEFAULT '0',
  `device_id` varchar(100) DEFAULT NULL,
  `synced_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `local_version` int DEFAULT NULL,
  `server_version` int DEFAULT NULL,
  `local_updated_at` timestamp NULL DEFAULT NULL,
  `server_updated_at` timestamp NULL DEFAULT NULL,
  `conflict_reason` varchar(100) DEFAULT NULL,
  `resolved_by` varchar(100) DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sync_logs`
--

LOCK TABLES `sync_logs` WRITE;
/*!40000 ALTER TABLE `sync_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `sync_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL DEFAULT '1',
  `uuid` char(36) DEFAULT NULL,
  `org_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `org_city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_pincode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_gst` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bank_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bank_account_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bank_ifsc` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bank_account_holder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `fin_year` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `fin_pf_rate` decimal(5,2) DEFAULT NULL,
  `fin_esi_rate` decimal(5,2) DEFAULT NULL,
  `fin_pt_slab_a` decimal(10,2) DEFAULT NULL,
  `fin_pt_slab_b` decimal(10,2) DEFAULT NULL,
  `fin_pt_slab_c` decimal(10,2) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fin_pf_min_limit` decimal(10,2) DEFAULT '15000.00',
  `fin_pf_max_amt` decimal(10,2) DEFAULT '1800.00',
  `fin_esi_limit` decimal(10,2) DEFAULT '21000.00',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `device_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temppay`
--

DROP TABLE IF EXISTS `temppay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temppay` (
  `MonthOrder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CMONTH` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CYEAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MONTHYEAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PNBNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `D_PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `HRA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PPR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PP5` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SP` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GROSSPAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFS` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFARR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFDA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPFG` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPFG_DUENO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GI` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PRD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `FAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `FAR_DUENO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PLI` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `THSOC` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFLR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFLR_DUENO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LIC` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ADIT` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PTAX` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MISC` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `HFS` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `STORES` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `BUS` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TOTDED` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NETSAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DAper` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temppay`
--

LOCK TABLES `temppay` WRITE;
/*!40000 ALTER TABLE `temppay` DISABLE KEYS */;
/*!40000 ALTER TABLE `temppay` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userdetails`
--

DROP TABLE IF EXISTS `userdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userdetails` (
  `UserID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `UserName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Qualification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Department` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Role` enum('super_admin','admin','hr_officer','accountant','auditor','employee') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'employee',
  `Contact` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `device_id` varchar(100) DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `company_id` int NOT NULL DEFAULT '1' COMMENT 'FK to companies',
  UNIQUE KEY `new_id` (`id`) USING BTREE,
  UNIQUE KEY `uq_company_userid` (`company_id`,`UserID`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `idx_user_userid` (`UserID`) USING BTREE,
  KEY `idx_user_role` (`Role`) USING BTREE,
  KEY `idx_sync` (`is_synced`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_updated` (`updated_at`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userdetails`
--

LOCK TABLES `userdetails` WRITE;
/*!40000 ALTER TABLE `userdetails` DISABLE KEYS */;
INSERT INTO `userdetails` VALUES ('gandhi',2,'39810f0d-e9d4-4e6c-b559-50929996c094','hr123','Client1','','','hr_officer','','','MASTER',0,1,'2026-02-11 08:24:55','2026-02-11 08:24:55',NULL,1),('lathareddi',3,'3f45240d-b543-439e-bbeb-46ef5482667f','acc123','Server','','','accountant','','','MASTER',0,1,'2026-02-11 08:24:55','2026-02-11 08:24:55',NULL,1),('Omega',4,'cce40feb-dac4-484b-b9a4-7a8cffd78bfc','audit123','Jeeva',NULL,NULL,'auditor',NULL,NULL,'MASTER',0,1,'2026-02-11 08:24:55','2026-02-11 08:24:55',NULL,1),('prawin',5,'a10f6874-c0c1-4b08-92b6-9940dc717d27','$2b$10$257oc8Xb5idCu6lGGzhy1u7ztC79sJ0pwAlzbC.CzGVfmDSCqqmQ2','prawinkumar.N','m tech','IT','admin','8807054164','nil','MASTER',0,1,'2026-02-11 08:24:55','2026-03-02 21:16:49',NULL,1),('login ',6,'fbfc9132-c346-406a-8d16-afc1a2b5156f','$2b$10$TBU4eexVVYsk9Z7KKeUC3.Gmw0HUJbNQrqWAJyTjsQl.d7j5y5ckS','npk','mca','ac','admin','9976181075','nil','MASTER',0,1,'2026-02-11 08:24:55','2026-02-11 08:24:55',NULL,1),('test',7,'bb098354-c8cb-4bbe-bc4a-152bc9da571c','$2b$12$wsCa2ZJOUwRCU0p295kUQOjTdd9ECD19OQ./4TYI5rEl1oWpWc3ba','prawin','tset','test','admin','tset',NULL,'MASTER',0,1,'2026-02-11 08:24:55','2026-02-11 08:24:55',NULL,1),('admin',8,NULL,'$2b$10$9oTpjdl8vY6VDhnwPxWBhuIb1Au9mXxJ6frqz7npJhoJTc0rm4/KW','Administrator',NULL,NULL,'admin',NULL,NULL,'MASTER',0,1,'2026-02-14 17:07:16','2026-02-14 17:07:39',NULL,1);
/*!40000 ALTER TABLE `userdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userlogs`
--

DROP TABLE IF EXISTS `userlogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userlogs` (
  `LogID` int NOT NULL AUTO_INCREMENT,
  `UserID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UserName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ActionType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Module` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `IPAddress` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LogDate` date DEFAULT NULL,
  `LogTime` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LogID`) USING BTREE,
  KEY `idx_userid` (`UserID`) USING BTREE,
  KEY `idx_date` (`LogDate`) USING BTREE,
  KEY `idx_userlogs_created` (`created_at`),
  KEY `idx_userlogs_module_dt` (`Module`,`created_at`),
  KEY `idx_userlogs_userid` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userlogs`
--

LOCK TABLES `userlogs` WRITE;
/*!40000 ALTER TABLE `userlogs` DISABLE KEYS */;
INSERT INTO `userlogs` VALUES (1,'admin','admin','admin','VIEW','REPORTS','Pay Bill Viewed for 03-2026 - Category: ALL','127.0.0.1','2026-03-03','22:36:34','2026-03-03 17:06:34');
/*!40000 ALTER TABLE `userlogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'payroll_DEFAULT'
--

--
-- Current Database: `payroll_SF001`
--

/*!40000 DROP DATABASE IF EXISTS `payroll_SF001`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `payroll_SF001` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `payroll_SF001`;

--
-- Table structure for table `activate`
--

DROP TABLE IF EXISTS `activate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activate` (
  `SerialNumber` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ActivationKey` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MacAddress` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ActDate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ConfirmKey` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SMode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ClgCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ClgName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ClgCity` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CloseDate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activate`
--

LOCK TABLES `activate` WRITE;
/*!40000 ALTER TABLE `activate` DISABLE KEYS */;
/*!40000 ALTER TABLE `activate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_settings`
--

DROP TABLE IF EXISTS `app_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` longtext,
  `category` varchar(50) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `device_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`setting_key`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_settings`
--

LOCK TABLES `app_settings` WRITE;
/*!40000 ALTER TABLE `app_settings` DISABLE KEYS */;
INSERT INTO `app_settings` VALUES (38,NULL,'attendance_status_codes','Present,Absent,CL,ML,OD,L,WO,H',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(39,NULL,'calc_epf_percent','12',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(40,NULL,'calc_esi_percent','0.75',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(41,NULL,'enable_abstract_1','true',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(42,NULL,'enable_abstract_2','true',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(43,NULL,'enable_attendance','true',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(44,NULL,'enable_bank_statement','true',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(85,NULL,'enable_expense','true','features','2026-03-03 13:19:05',0,1,NULL,'2026-03-03 13:19:05',NULL),(84,NULL,'enable_income','true','features','2026-03-03 13:19:05',0,1,NULL,'2026-03-03 13:19:05',NULL),(45,NULL,'enable_pay_bill','true',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(46,NULL,'enable_pay_certificate','true',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(83,NULL,'enable_reports','true',NULL,'2026-03-03 11:12:18',0,1,NULL,'2026-03-03 11:12:18',NULL),(82,NULL,'enable_salary','true',NULL,'2026-03-03 11:12:18',0,1,NULL,'2026-03-03 11:12:18',NULL),(47,NULL,'enable_staff_report','true',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(48,NULL,'last_successful_sync','2026-02-11T15:20:28.166Z',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(49,NULL,'lock_attendance_after_payroll','true',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(50,NULL,'lop_enabled','true',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(51,NULL,'org_address','Annamalai Nagar, Tiruchirappalli - 620018',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(52,NULL,'org_email','cauverycollege_try@rediffmail.com',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(53,NULL,'org_logo_url','',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(54,NULL,'org_name','SearchFirst',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(55,NULL,'org_phone','0431-2730620',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(56,NULL,'org_tagline','Accredited with \"A++\" Grade by NAAC',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(57,NULL,'print_font_family','Times New Roman',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(58,NULL,'print_font_size','10pt',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(59,NULL,'print_show_page_number','true',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(60,NULL,'print_show_timestamp','true',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(61,NULL,'print_table_font_size','9pt',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(62,NULL,'sig_1_label','Prepared By',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(63,NULL,'sig_2_label','Checked By',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(64,NULL,'sig_3_label','Verified By',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(65,NULL,'sig_4_label','Principal/Authorised Signatory',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(66,NULL,'test_sync_key','initial_value',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(67,NULL,'title_abstract_1','STATUTORY ABSTRACT (PF/ESI/ESI)',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(68,NULL,'title_abstract_2','PAYMENT DISTRIBUTION ABSTRACT',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(69,NULL,'title_bank_statement','BANK STATEMENT ADVICE',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(70,NULL,'title_pay_bill','PAY BILL DETAIL REPORT',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(71,NULL,'title_pay_certificate','EMPLOYEE PAY CERTIFICATE',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(72,NULL,'title_staff_report','STAFF MASTER REGISTER',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(73,NULL,'week_off_days','Sunday',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL),(74,NULL,'working_days_per_month','30',NULL,'2026-03-03 09:36:36',0,1,NULL,'2026-03-03 09:36:36',NULL);
/*!40000 ALTER TABLE `app_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` char(36) NOT NULL,
  `user_id` varchar(100) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `action_type` varchar(50) DEFAULT NULL,
  `module` varchar(50) DEFAULT NULL,
  `description` text,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `device_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sync_version` int DEFAULT '1',
  `tenant_id` varchar(64) NOT NULL DEFAULT 'local',
  `is_synced` tinyint(1) NOT NULL DEFAULT '1',
  `uuid` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_created` (`created_at`),
  KEY `idx_audit_module` (`module`,`created_at`),
  KEY `idx_audit_tenant` (`tenant_id`),
  KEY `idx_audit_tenant_uuid` (`tenant_id`,`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billded`
--

DROP TABLE IF EXISTS `billded`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billded` (
  `GNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AccountName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Salary` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billded`
--

LOCK TABLES `billded` WRITE;
/*!40000 ALTER TABLE `billded` DISABLE KEYS */;
/*!40000 ALTER TABLE `billded` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daarrear`
--

DROP TABLE IF EXISTS `daarrear`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daarrear` (
  `MONTHYEAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PNBNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `D_PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TOTAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DAper` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NewDA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NewDAPer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Difference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ArrearMonth` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CAT` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MonthOrder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daarrear`
--

LOCK TABLES `daarrear` WRITE;
/*!40000 ALTER TABLE `daarrear` DISABLE KEYS */;
/*!40000 ALTER TABLE `daarrear` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empdet`
--

DROP TABLE IF EXISTS `empdet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empdet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `SLNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GradePay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PANCARD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AccountNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `BankName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IFSCCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OtherAccNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DOB` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `JDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LDATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CheckStatus` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EPF` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ESI` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MPHIL` decimal(10,2) DEFAULT '0.00',
  `PHD` decimal(10,2) DEFAULT '0.00',
  `HATA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Allowance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPECIAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `INTERIM` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ML` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MaL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RH` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LopDate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `device_id` varchar(100) DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `tenant_id` varchar(50) DEFAULT 'local',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `idx_empno_unique` (`EMPNO`) USING BTREE,
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `idx_unique_uuid` (`uuid`),
  KEY `idx_empdet_category` (`Category`) USING BTREE,
  KEY `idx_empdet_status` (`CheckStatus`) USING BTREE,
  KEY `idx_empdet_designation` (`DESIGNATION`) USING BTREE,
  KEY `idx_empdet_sname` (`SNAME`) USING BTREE,
  KEY `idx_empdet_absgroup` (`AbsGroup`) USING BTREE,
  KEY `idx_sync` (`is_synced`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_updated` (`updated_at`),
  KEY `idx_empdet_uuid` (`uuid`),
  KEY `idx_empdet_synced` (`is_synced`),
  KEY `idx_empdet_tenant` (`tenant_id`),
  KEY `idx_emp_checkstatus` (`CheckStatus`,`deleted_at`),
  KEY `idx_emp_category` (`Category`,`CheckStatus`),
  KEY `idx_emp_empno` (`EMPNO`),
  KEY `idx_emp_dgroup` (`DGroup`),
  KEY `idx_emp_updated` (`updated_at`),
  KEY `idx_empdet_tenant_uuid` (`tenant_id`,`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empdet`
--

LOCK TABLES `empdet` WRITE;
/*!40000 ALTER TABLE `empdet` DISABLE KEYS */;
/*!40000 ALTER TABLE `empdet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emppay`
--

DROP TABLE IF EXISTS `emppay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emppay` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `MONTHYEAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Designation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NoofDays` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LeaveDays` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `WorkingDays` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GradePay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PHD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MPHIL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `HATA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Allowance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPECIAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `INTERIM` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GROSSPAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EPF` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ESI` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ESIM` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IT` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PT` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Advance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LIC` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RECOVERY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OTHERS` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TOTDED` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NETSAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AccountNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `BankName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IFSCCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OtherAccNo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `InterimPay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DAper` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Bonus` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `device_id` varchar(100) DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `tenant_id` varchar(50) DEFAULT 'local',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `idx_unique_uuid` (`uuid`),
  KEY `idx_emppay_monthyear` (`MONTHYEAR`) USING BTREE,
  KEY `idx_emppay_empno` (`EMPNO`) USING BTREE,
  KEY `idx_emppay_composite` (`MONTHYEAR`,`EMPNO`) USING BTREE,
  KEY `idx_sync` (`is_synced`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_updated` (`updated_at`),
  KEY `idx_emppay_empno_month` (`EMPNO`,`MONTHYEAR`),
  KEY `idx_emppay_synced` (`is_synced`),
  KEY `idx_emppay_tenant` (`tenant_id`),
  KEY `idx_emppay_dgroup_month` (`DGroup`,`MONTHYEAR`),
  KEY `idx_emppay_netsal_month` (`MONTHYEAR`,`NETSAL`),
  KEY `idx_emppay_tenant_uuid` (`tenant_id`,`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emppay`
--

LOCK TABLES `emppay` WRITE;
/*!40000 ALTER TABLE `emppay` DISABLE KEYS */;
/*!40000 ALTER TABLE `emppay` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `income_expense`
--

DROP TABLE IF EXISTS `income_expense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `income_expense` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('income','expense') NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `transaction_date` date NOT NULL,
  `month_year` varchar(7) NOT NULL COMMENT 'MM-YYYY',
  `reference_no` varchar(100) DEFAULT NULL,
  `remarks` text,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ie_type` (`type`),
  KEY `idx_ie_month_year` (`month_year`),
  KEY `idx_ie_transaction_date` (`transaction_date`),
  KEY `idx_ie_category` (`category`),
  KEY `idx_ie_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `income_expense`
--

LOCK TABLES `income_expense` WRITE;
/*!40000 ALTER TABLE `income_expense` DISABLE KEYS */;
/*!40000 ALTER TABLE `income_expense` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logdetails`
--

DROP TABLE IF EXISTS `logdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logdetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sno` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UserId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UDate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UTime` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_log_userid` (`UserId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logdetails`
--

LOCK TABLES `logdetails` WRITE;
/*!40000 ALTER TABLE `logdetails` DISABLE KEYS */;
/*!40000 ALTER TABLE `logdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_attempts`
--

DROP TABLE IF EXISTS `login_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `status` enum('SUCCESS','FAILURE') NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_attempts`
--

LOCK TABLES `login_attempts` WRITE;
/*!40000 ALTER TABLE `login_attempts` DISABLE KEYS */;
INSERT INTO `login_attempts` VALUES (1,'admin','127.0.0.1','SUCCESS','2026-03-03 16:35:57'),(2,'admin','127.0.0.1','SUCCESS','2026-03-03 17:07:14');
/*!40000 ALTER TABLE `login_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_settings`
--

DROP TABLE IF EXISTS `organization_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `address_line1` text,
  `address_line2` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `tagline` text,
  `logo_url` text,
  `sig_1_label` varchar(100) DEFAULT 'Prepared By',
  `sig_2_label` varchar(100) DEFAULT 'Checked By',
  `sig_3_label` varchar(100) DEFAULT 'Verified By',
  `sig_4_label` varchar(100) DEFAULT 'Principal/Authorised Signatory',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `device_id` varchar(100) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_settings`
--

LOCK TABLES `organization_settings` WRITE;
/*!40000 ALTER TABLE `organization_settings` DISABLE KEYS */;
INSERT INTO `organization_settings` VALUES (1,'21a28e77-7f0c-4868-8752-5779cd05e27f','CAUVERY COLLEGE FOR WOMEN (AUTONOMOUS)','Annamalai Nagar',NULL,'Tiruchirappalli',NULL,'620018',NULL,NULL,NULL,NULL,NULL,'Prepared By','Checked By','Verified By','Principal/Authorised Signatory','2026-02-09 14:21:46','2026-02-11 09:30:55',0,1,NULL,NULL);
/*!40000 ALTER TABLE `organization_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_line_items`
--

DROP TABLE IF EXISTS `payroll_line_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_line_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uuid` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payroll_run_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gross` decimal(12,2) NOT NULL,
  `deductions` decimal(12,2) NOT NULL,
  `net_pay` decimal(12,2) NOT NULL,
  `basic` decimal(12,2) NOT NULL DEFAULT '0.00',
  `pf_employee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `pf_employer` decimal(10,2) NOT NULL DEFAULT '0.00',
  `esi_employee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `esi_employer` decimal(10,2) NOT NULL DEFAULT '0.00',
  `trace` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `device_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_payroll_run` (`payroll_run_id`),
  KEY `idx_payroll_line_items_employee` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_line_items`
--

LOCK TABLES `payroll_line_items` WRITE;
/*!40000 ALTER TABLE `payroll_line_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll_line_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_reversals`
--

DROP TABLE IF EXISTS `payroll_reversals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_reversals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `original_run_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reversal_run_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_original_run` (`original_run_id`),
  KEY `fk_reversal_run` (`reversal_run_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_reversals`
--

LOCK TABLES `payroll_reversals` WRITE;
/*!40000 ALTER TABLE `payroll_reversals` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll_reversals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_runs`
--

DROP TABLE IF EXISTS `payroll_runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_runs` (
  `id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uuid` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `run_mode` enum('DRY_RUN','COMMIT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('SUCCESS','FAILED','FINALIZED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `engine_version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_count` int NOT NULL,
  `total_gross` decimal(12,2) NOT NULL,
  `total_deductions` decimal(12,2) NOT NULL,
  `total_net` decimal(12,2) NOT NULL,
  `failure_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `device_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_payroll_period` (`year`,`month`,`engine_version`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_runs`
--

LOCK TABLES `payroll_runs` WRITE;
/*!40000 ALTER TABLE `payroll_runs` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll_runs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `device_id` varchar(100) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `company_code` varchar(50) DEFAULT 'DEFAULT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` datetime DEFAULT NULL,
  `replaced_by_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `token_2` (`token`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repabstract`
--

DROP TABLE IF EXISTS `repabstract`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repabstract` (
  `Sno` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Designation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GrossPay` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Advance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TotDed` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NetSal` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ByCash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ByBank` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repabstract`
--

LOCK TABLES `repabstract` WRITE;
/*!40000 ALTER TABLE `repabstract` DISABLE KEYS */;
/*!40000 ALTER TABLE `repabstract` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schema_versions`
--

DROP TABLE IF EXISTS `schema_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schema_versions` (
  `version_id` int NOT NULL,
  `version_name` varchar(100) DEFAULT NULL,
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schema_versions`
--

LOCK TABLES `schema_versions` WRITE;
/*!40000 ALTER TABLE `schema_versions` DISABLE KEYS */;
INSERT INTO `schema_versions` VALUES (1,'initial_company_schema','2026-03-03 08:55:54'),(2,'sync_columns','2026-02-27 14:19:32'),(3,'missing_tables','2026-02-27 14:19:32');
/*!40000 ALTER TABLE `schema_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staffattendance`
--

DROP TABLE IF EXISTS `staffattendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffattendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `SLNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ADATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AttType` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Leave` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Sessions` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `device_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `tenant_id` varchar(64) NOT NULL DEFAULT 'local',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_uuid` (`uuid`),
  KEY `idx_attendance_empno` (`EMPNO`) USING BTREE,
  KEY `idx_attendance_date` (`ADATE`) USING BTREE,
  KEY `idx_attendance_composite` (`EMPNO`,`ADATE`) USING BTREE,
  KEY `idx_sync` (`is_synced`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_updated` (`updated_at`),
  KEY `idx_staffattendance_category` (`Category`),
  KEY `idx_att_adate` (`ADATE`),
  KEY `idx_att_empno_adate` (`EMPNO`,`ADATE`),
  KEY `idx_att_category_date` (`Category`,`ADATE`),
  KEY `idx_att_created` (`created_at`),
  KEY `idx_attendance_tenant` (`tenant_id`),
  KEY `idx_attendance_tenant_uuid` (`tenant_id`,`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffattendance`
--

LOCK TABLES `staffattendance` WRITE;
/*!40000 ALTER TABLE `staffattendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `staffattendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staffattreport`
--

DROP TABLE IF EXISTS `staffattreport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffattreport` (
  `SLNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ADATE` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SNAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DESIGNATION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `AbsGroup` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Sessions` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OD0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CL0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ML0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MaL0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RH0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PER0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP0` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OD1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CL1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ML1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MaL1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RH1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PER1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ML` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MaL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RH` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PER` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOP` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffattreport`
--

LOCK TABLES `staffattreport` WRITE;
/*!40000 ALTER TABLE `staffattreport` DISABLE KEYS */;
/*!40000 ALTER TABLE `staffattreport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sync_batches`
--

DROP TABLE IF EXISTS `sync_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sync_batches` (
  `batch_id` varchar(36) NOT NULL,
  `tenant_id` varchar(50) NOT NULL,
  `direction` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `record_count` int DEFAULT '0',
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `error_message` text,
  PRIMARY KEY (`batch_id`),
  KEY `idx_batch_status` (`status`,`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sync_batches`
--

LOCK TABLES `sync_batches` WRITE;
/*!40000 ALTER TABLE `sync_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `sync_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sync_logs`
--

DROP TABLE IF EXISTS `sync_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sync_logs` (
  `id` char(36) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_uuid` char(36) DEFAULT NULL,
  `action` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'PENDING',
  `error_message` text,
  `retry_count` int DEFAULT '0',
  `device_id` varchar(100) DEFAULT NULL,
  `synced_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `local_version` int DEFAULT NULL,
  `server_version` int DEFAULT NULL,
  `local_updated_at` timestamp NULL DEFAULT NULL,
  `server_updated_at` timestamp NULL DEFAULT NULL,
  `conflict_reason` varchar(100) DEFAULT NULL,
  `resolved_by` varchar(100) DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sync_logs`
--

LOCK TABLES `sync_logs` WRITE;
/*!40000 ALTER TABLE `sync_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `sync_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL DEFAULT '1',
  `uuid` char(36) DEFAULT NULL,
  `org_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `org_city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_pincode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `org_gst` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bank_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bank_account_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bank_ifsc` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bank_account_holder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `fin_year` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `fin_pf_rate` decimal(5,2) DEFAULT NULL,
  `fin_esi_rate` decimal(5,2) DEFAULT NULL,
  `fin_pt_slab_a` decimal(10,2) DEFAULT NULL,
  `fin_pt_slab_b` decimal(10,2) DEFAULT NULL,
  `fin_pt_slab_c` decimal(10,2) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fin_pf_min_limit` decimal(10,2) DEFAULT '15000.00',
  `fin_pf_max_amt` decimal(10,2) DEFAULT '1800.00',
  `fin_esi_limit` decimal(10,2) DEFAULT '21000.00',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `device_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temppay`
--

DROP TABLE IF EXISTS `temppay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temppay` (
  `MonthOrder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CMONTH` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CYEAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MONTHYEAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PNBNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMPNO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NAME` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `D_PAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `HRA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PPR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PP5` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SP` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GROSSPAY` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFS` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFARR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFDA` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPFG` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SPFG_DUENO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GI` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PRD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `FAR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `FAR_DUENO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PLI` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `THSOC` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFLR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TPFLR_DUENO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LIC` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ADIT` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PTAX` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MISC` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `HFS` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `STORES` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `BUS` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TOTDED` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `NETSAL` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DAper` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temppay`
--

LOCK TABLES `temppay` WRITE;
/*!40000 ALTER TABLE `temppay` DISABLE KEYS */;
/*!40000 ALTER TABLE `temppay` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userdetails`
--

DROP TABLE IF EXISTS `userdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userdetails` (
  `UserID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `UserName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Qualification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Department` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Role` enum('super_admin','admin','hr_officer','accountant','auditor','employee') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'employee',
  `Contact` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `device_id` varchar(100) DEFAULT 'MASTER',
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_version` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `company_id` int NOT NULL DEFAULT '1' COMMENT 'FK to companies',
  UNIQUE KEY `new_id` (`id`) USING BTREE,
  UNIQUE KEY `uq_company_userid` (`company_id`,`UserID`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `idx_user_userid` (`UserID`) USING BTREE,
  KEY `idx_user_role` (`Role`) USING BTREE,
  KEY `idx_sync` (`is_synced`),
  KEY `idx_uuid` (`uuid`),
  KEY `idx_updated` (`updated_at`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userdetails`
--

LOCK TABLES `userdetails` WRITE;
/*!40000 ALTER TABLE `userdetails` DISABLE KEYS */;
INSERT INTO `userdetails` VALUES ('admin',9,'3eaf83e5-1378-4d64-82aa-79f9810eda3a','$2b$10$k4v0KeRtFD0AH.tKonY/o.NUeDQaO8XK23eAPksVgriyFt.y/N41G','admin',NULL,NULL,'admin',NULL,NULL,'MASTER',0,1,'2026-03-02 21:56:38','2026-03-03 09:05:07',NULL,3);
/*!40000 ALTER TABLE `userdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userlogs`
--

DROP TABLE IF EXISTS `userlogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userlogs` (
  `LogID` int NOT NULL AUTO_INCREMENT,
  `UserID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UserName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ActionType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Module` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `IPAddress` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LogDate` date DEFAULT NULL,
  `LogTime` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LogID`) USING BTREE,
  KEY `idx_userid` (`UserID`) USING BTREE,
  KEY `idx_date` (`LogDate`) USING BTREE,
  KEY `idx_userlogs_created` (`created_at`),
  KEY `idx_userlogs_module_dt` (`Module`,`created_at`),
  KEY `idx_userlogs_userid` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userlogs`
--

LOCK TABLES `userlogs` WRITE;
/*!40000 ALTER TABLE `userlogs` DISABLE KEYS */;
/*!40000 ALTER TABLE `userlogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'payroll_SF001'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-03 23:24:59
