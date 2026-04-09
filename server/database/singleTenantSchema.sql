-- ===============================================================
-- Single-Tenant Payroll System Schema
-- Compiled for: payroll_system
-- ===============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ── users (formerly userdetails) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `UserID` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `UserName` varchar(100) NOT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `role` enum('super_admin','admin','hr_officer','accountant','auditor','employee') NOT NULL DEFAULT 'employee',
  `contact` varchar(255) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`),
  UNIQUE KEY `idx_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── empdet (Employees) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `empdet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `EMPNO` varchar(50) NOT NULL,
  `SNAME` varchar(255) DEFAULT NULL,
  `DESIGNATION` varchar(255) DEFAULT NULL,
  `AbsGroup` varchar(255) DEFAULT NULL,
  `DGroup` varchar(255) DEFAULT NULL,
  `PAY` decimal(10,2) DEFAULT '0.00',
  `GradePay` decimal(10,2) DEFAULT '0.00',
  `Category` varchar(255) DEFAULT NULL,
  `PANCARD` varchar(255) DEFAULT NULL,
  `AccountNo` varchar(255) DEFAULT NULL,
  `BankName` varchar(255) DEFAULT NULL,
  `IFSCCode` varchar(255) DEFAULT NULL,
  `OtherAccNo` varchar(255) DEFAULT NULL,
  `DOB` date DEFAULT NULL,
  `JDATE` date DEFAULT NULL,
  `RDATE` date DEFAULT NULL,
  `LDATE` date DEFAULT NULL,
  `CheckStatus` varchar(255) DEFAULT 'Active',
  `DA` decimal(10,2) DEFAULT '0.00',
  `EPF` decimal(10,2) DEFAULT '0.00',
  `ESI` decimal(10,2) DEFAULT '0.00',
  `MPHIL` decimal(10,2) DEFAULT '0.00',
  `PHD` decimal(10,2) DEFAULT '0.00',
  `HATA` decimal(10,2) DEFAULT '0.00',
  `Allowance` decimal(10,2) DEFAULT '0.00',
  `SPECIAL` decimal(10,2) DEFAULT '0.00',
  `INTERIM` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_empno` (`EMPNO`),
  UNIQUE KEY `idx_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── emppay (Salary) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `emppay` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `MONTHYEAR` varchar(20) NOT NULL,
  `EMPNO` varchar(50) NOT NULL,
  `SNAME` varchar(255) DEFAULT NULL,
  `Designation` varchar(255) DEFAULT NULL,
  `DGroup` varchar(255) DEFAULT NULL,
  `NoofDays` int DEFAULT '0',
  `LeaveDays` decimal(5,1) DEFAULT '0.0',
  `WorkingDays` decimal(5,1) DEFAULT '0.0',
  `PAY` decimal(10,2) DEFAULT '0.00',
  `GradePay` decimal(10,2) DEFAULT '0.00',
  `PHD` decimal(10,2) DEFAULT '0.00',
  `MPHIL` decimal(10,2) DEFAULT '0.00',
  `HATA` decimal(10,2) DEFAULT '0.00',
  `Allowance` decimal(10,2) DEFAULT '0.00',
  `DA` decimal(10,2) DEFAULT '0.00',
  `SPECIAL` decimal(10,2) DEFAULT '0.00',
  `INTERIM` decimal(10,2) DEFAULT '0.00',
  `GROSSPAY` decimal(10,2) DEFAULT '0.00',
  `EPF` decimal(10,2) DEFAULT '0.00',
  `ESI` decimal(10,2) DEFAULT '0.00',
  `IT` decimal(10,2) DEFAULT '0.00',
  `PT` decimal(10,2) DEFAULT '0.00',
  `Advance` decimal(10,2) DEFAULT '0.00',
  `TOTDED` decimal(10,2) DEFAULT '0.00',
  `NETSAL` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_uuid` (`uuid`),
  KEY `idx_emp_month` (`EMPNO`,`MONTHYEAR`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── staffattendance (Attendance) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `staffattendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `ADATE` date NOT NULL,
  `EMPNO` varchar(50) NOT NULL,
  `AttType` varchar(255) DEFAULT 'Present',
  `PUNCH_IN` time DEFAULT NULL,
  `PUNCH_OUT` time DEFAULT NULL,
  `Leave` decimal(5,1) DEFAULT '0.0',
  `Sessions` varchar(50) DEFAULT 'Full',
  `LOP` decimal(5,1) DEFAULT '0.0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_emp_date` (`EMPNO`,`ADATE`),
  UNIQUE KEY `idx_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── biometric_profiles ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `biometric_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `biometric_type` enum('fingerprint','face','iris') NOT NULL,
  `template_data` text NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_used` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_bio_user` (`user_id`),
  CONSTRAINT `fk_bio_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── audit_logs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) DEFAULT NULL,
  `action_type` varchar(100) NOT NULL,
  `module` varchar(100) DEFAULT NULL,
  `description` text,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── refresh_tokens ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
