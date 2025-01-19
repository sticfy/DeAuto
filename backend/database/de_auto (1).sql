-- phpMyAdmin SQL Dump
-- version 5.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 12, 2025 at 07:02 PM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `de_auto`
--

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_banners`
--

CREATE TABLE `deautodb_banners` (
  `id` int(15) NOT NULL,
  `banner_type` int(15) NOT NULL DEFAULT 0 COMMENT '1: left, 2: right, 3: middle',
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `image` varchar(255) NOT NULL DEFAULT 'default_image.png',
  `details` text DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_banners`
--

INSERT INTO `deautodb_banners` (`id`, `banner_type`, `from_date`, `to_date`, `image`, `details`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(5, 3, NULL, NULL, '1736013541172-Devr3sus6I.png', NULL, 1, 1, 1, '2025-01-04 23:36:45', '2025-01-04 23:59:01'),
(6, 3, NULL, NULL, '1736012225828-bFOAmpB7Ly.png', NULL, 0, 1, 1, '2025-01-04 23:37:05', '2025-01-04 23:43:18'),
(7, 3, NULL, NULL, '1736013548849-n9e19nxTiH.png', NULL, 1, 1, 1, '2025-01-04 23:59:08', '2025-01-04 23:59:08');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_billing_cards`
--

CREATE TABLE `deautodb_billing_cards` (
  `id` int(11) NOT NULL,
  `card_type` varchar(255) DEFAULT NULL COMMENT 'master, visa, amex',
  `card_holder_name` varchar(255) NOT NULL DEFAULT 'Unknown',
  `card_number` varchar(255) NOT NULL DEFAULT 'Unknown',
  `cvv` int(11) NOT NULL DEFAULT 0,
  `expired_month` varchar(255) DEFAULT NULL,
  `expired_year` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL DEFAULT 0,
  `company_id` int(11) NOT NULL DEFAULT 0,
  `status` int(11) NOT NULL DEFAULT 1,
  `is_primary` int(11) NOT NULL DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_categories`
--

CREATE TABLE `deautodb_categories` (
  `id` int(11) NOT NULL,
  `title` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`title`)),
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_categories`
--

INSERT INTO `deautodb_categories` (`id`, `title`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, '{\"en\":\"title 4\",\"dutch\":\"dutch 4\"}', 1, NULL, NULL, '2025-01-04 01:23:16', '2025-01-04 01:23:16'),
(2, '{\"en\":\"title 100\",\"dutch\":\"dutch 100\"}', 2, NULL, 1, '2025-01-04 01:51:30', '2025-01-04 03:21:07');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_companies`
--

CREATE TABLE `deautodb_companies` (
  `id` int(15) NOT NULL,
  `current_package_id` int(11) NOT NULL DEFAULT 0,
  `company_name` varchar(255) NOT NULL DEFAULT 'N/A',
  `owner_first_name` varchar(255) NOT NULL DEFAULT 'N/A',
  `owner_last_name` varchar(255) NOT NULL DEFAULT 'N/A',
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(20) DEFAULT NULL,
  `logo` varchar(255) NOT NULL DEFAULT 'default_profile_image.png',
  `cover_image` varchar(255) NOT NULL DEFAULT 'default_profile_image.png',
  `year_of_establishment` int(11) NOT NULL DEFAULT 1970,
  `company_size` varchar(255) NOT NULL DEFAULT 'N/A',
  `latitude` varchar(255) NOT NULL DEFAULT 'N/A',
  `longitude` varchar(255) NOT NULL DEFAULT 'N/A',
  `tagline` text DEFAULT NULL,
  `trade_license_no` varchar(255) NOT NULL DEFAULT 'N/A',
  `street` varchar(255) NOT NULL DEFAULT 'N/A',
  `house_no` varchar(255) NOT NULL DEFAULT 'N/A',
  `postal_code` varchar(255) NOT NULL DEFAULT 'N/A',
  `province` varchar(255) NOT NULL DEFAULT 'N/A',
  `city` varchar(255) NOT NULL DEFAULT 'N/A',
  `website_url` varchar(255) NOT NULL DEFAULT 'N/A',
  `status` int(2) NOT NULL DEFAULT 1 COMMENT '1 = Approve, 2 = Pending',
  `created_by` int(15) DEFAULT NULL,
  `updated_by` int(15) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_company_services`
--

CREATE TABLE `deautodb_company_services` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL DEFAULT 0,
  `service_id` int(11) NOT NULL DEFAULT 0,
  `price_start_from` double NOT NULL DEFAULT 1,
  `service_start_date` date DEFAULT NULL,
  `service_end_date` date DEFAULT NULL,
  `details` text DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_company_subscribed_packages`
--

CREATE TABLE `deautodb_company_subscribed_packages` (
  `id` int(11) NOT NULL,
  `package_id` int(11) NOT NULL DEFAULT 0,
  `company_id` int(11) NOT NULL DEFAULT 0,
  `total_available_user` int(11) NOT NULL DEFAULT 0,
  `total_available_services` int(11) NOT NULL DEFAULT 0,
  `expired_date` date DEFAULT NULL,
  `details` text DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_company_subscribed_package_histories`
--

CREATE TABLE `deautodb_company_subscribed_package_histories` (
  `id` int(11) NOT NULL,
  `package_id` int(11) NOT NULL DEFAULT 0,
  `company_id` int(11) NOT NULL DEFAULT 0,
  `enroll_date` date DEFAULT NULL,
  `expired_date` date DEFAULT NULL,
  `price` double NOT NULL DEFAULT 1,
  `details` text DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_company_users`
--

CREATE TABLE `deautodb_company_users` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `owner_first_name` varchar(255) NOT NULL DEFAULT 'N/A',
  `owner_last_name` varchar(255) NOT NULL DEFAULT 'N/A',
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) NOT NULL DEFAULT 'default_profile_image.png',
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_consumers`
--

CREATE TABLE `deautodb_consumers` (
  `id` int(11) NOT NULL,
  `role_id` int(10) NOT NULL,
  `first_name` varchar(255) NOT NULL DEFAULT 'N/A',
  `last_name` varchar(255) DEFAULT 'N/A',
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) NOT NULL DEFAULT 'default_profile_image.png',
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_consumers`
--

INSERT INTO `deautodb_consumers` (`id`, `role_id`, `first_name`, `last_name`, `email`, `phone`, `profile_image`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(2, 3, 'Shovon Lal', 'Dhaka', 'shovon57@gmail.com', '01744545786', '1736701307601-1Teib7iKoR.png', 1, NULL, 2, '2025-01-08 08:54:08', '2025-01-12 18:55:58'),
(3, 3, 'Shovon 3', 'Chakroborty', 'shovon8@gmai6.com', '123', 'default_profile_image.png', 1, NULL, NULL, '2025-01-08 09:18:43', '2025-01-08 09:18:43'),
(6, 3, 'Rafik', 'N/A', 'rafik@gmail.com', NULL, 'default_profile_image.png', 1, 0, 0, '2025-01-11 14:35:00', '2025-01-11 14:35:00');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_employees`
--

CREATE TABLE `deautodb_employees` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL DEFAULT 0,
  `gender_id` int(11) NOT NULL DEFAULT 0,
  `employee_id` varchar(150) DEFAULT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'Unknown',
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(240) NOT NULL DEFAULT ' ',
  `date_of_birth` date DEFAULT NULL,
  `address` text DEFAULT NULL,
  `profile_image` varchar(255) NOT NULL DEFAULT 'default_profile_image.png',
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_faqs`
--

CREATE TABLE `deautodb_faqs` (
  `id` int(11) NOT NULL,
  `question` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`question`)),
  `answer` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`answer`)),
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_faqs`
--

INSERT INTO `deautodb_faqs` (`id`, `question`, `answer`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, '{\"en\":\"Question-1\",\"dutch\":\"Quest-1\"}', '{\"en\":\"Answer-1\",\"dutch\":\"Ans-1\"}', 1, 1, 1, '2025-01-04 03:45:52', '2025-01-04 04:11:11'),
(2, '{\"en\":\"Question 10\",\"dutch\":\"Quest 10\"}', '{\"en\":\"Answer 20\",\"dutch\":\"Ans 20\"}', 1, 1, 1, '2025-01-04 03:46:09', '2025-01-04 04:10:18');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_login_attempts`
--

CREATE TABLE `deautodb_login_attempts` (
  `id` int(15) NOT NULL,
  `user_id` int(11) NOT NULL DEFAULT 0,
  `release_time` bigint(20) NOT NULL,
  `used_password` text DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_login_tracks`
--

CREATE TABLE `deautodb_login_tracks` (
  `id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `updated_by` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `jwt_token` text NOT NULL,
  `login_device_info` text NOT NULL,
  `uuid` varchar(255) NOT NULL DEFAULT '',
  `status` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_login_tracks`
--

INSERT INTO `deautodb_login_tracks` (`id`, `created_by`, `updated_by`, `user_id`, `jwt_token`, `login_device_info`, `uuid`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiJmM2ZlNDk2MWI3NjE4NjM4NmQ1MzM4NDZjODExM2I3ZCIsImVtYWlsIjoiaXNoZWlibHVAZ21haWwuY29tIiwicGhvbmUiOiIwMTY3MTc5NDA2MSIsInJvbGUiOnsicm9sZV9pZCI6MSwicm9sZV9uYW1lIjoic3VwZXJfYWRtaW4ifSwicHJvZmlsZSI6eyJuYW1lIjoiQXNocmFmdWwgSXNsYW0iLCJlbWFpbCI6ImlzaGVpYmx1QGdtYWlsLmNvbSIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X2ltYWdlLnBuZyIsInBob25lIjoiMDE2NzE3OTQwNjQiLCJzdGF0dXMiOjF9LCJ0aW1lX3BlcmlvZCI6MTczNTkzMjEyMTMyMywiaWRlbnRpdHlfaWQiOiI4YTlhMWM3Yi0zNjE3LTQyYTctODYyMi1kNjYyN2YyZDQ3ZDgiLCJpYXQiOjE3MzU5Mjg1MjEsImV4cCI6MTc2NzQ4NjEyMX0.LuqTmRRyY-13H8mq5ExLVRWevI0rxcXGlwCobGDz1XY', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '8a9a1c7b-3617-42a7-8622-d6627f2d47d8', 1, '2025-01-04 00:22:01', '2025-01-04 00:22:01'),
(2, 1, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiJmM2ZlNDk2MWI3NjE4NjM4NmQ1MzM4NDZjODExM2I3ZCIsImVtYWlsIjoiaXNoZWlibHVAZ21haWwuY29tIiwicGhvbmUiOiIwMTY3MTc5NDA2MSIsInJvbGUiOnsicm9sZV9pZCI6MSwicm9sZV9uYW1lIjoic3VwZXJfYWRtaW4ifSwicHJvZmlsZSI6eyJuYW1lIjoiQXNocmFmdWwgSXNsYW0iLCJlbWFpbCI6ImlzaGVpYmx1QGdtYWlsLmNvbSIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X2ltYWdlLnBuZyIsInBob25lIjoiMDE2NzE3OTQwNjQiLCJzdGF0dXMiOjF9LCJ0aW1lX3BlcmlvZCI6MTczNjAxNTQ0MTQwNywiaWRlbnRpdHlfaWQiOiI1NDMxYTkyMy0zYmMxLTQwNTItYTAxNy02NzFlZGNmZmFjMWYiLCJpYXQiOjE3MzYwMTE4NDEsImV4cCI6MTc2NzU2OTQ0MX0.ESIrr9ttCtaaIq9hHBMdYHy6XaBsNuaz7jfZjSOXAdE', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '5431a923-3bc1-4052-a017-671edcffac1f', 1, '2025-01-04 23:30:41', '2025-01-04 23:30:41'),
(3, 1, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiJmM2ZlNDk2MWI3NjE4NjM4NmQ1MzM4NDZjODExM2I3ZCIsImVtYWlsIjoiaXNoZWlibHVAZ21haWwuY29tIiwicGhvbmUiOiIwMTY3MTc5NDA2MSIsInJvbGUiOnsicm9sZV9pZCI6MSwicm9sZV9uYW1lIjoic3VwZXJfYWRtaW4ifSwicHJvZmlsZSI6eyJuYW1lIjoiQXNocmFmdWwgSXNsYW0iLCJlbWFpbCI6ImlzaGVpYmx1QGdtYWlsLmNvbSIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X2ltYWdlLnBuZyIsInBob25lIjoiMDE2NzE3OTQwNjQiLCJzdGF0dXMiOjF9LCJ0aW1lX3BlcmlvZCI6MTczNjE2NDk3NDEwMiwiaWRlbnRpdHlfaWQiOiI2ZDJmYTk4ZS1hZDUzLTRmNmMtODliNi1kNzYzMTc5ZTg1YmIiLCJpYXQiOjE3MzYxNjEzNzQsImV4cCI6MTc2NzcxODk3NH0.RfnGaX85jIqenKizWx15BsIrxZ1tpsqWcPUZl136FAI', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '6d2fa98e-ad53-4f6c-89b6-d763179e85bb', 1, '2025-01-06 17:02:54', '2025-01-06 17:02:54'),
(4, 1, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiJmM2ZlNDk2MWI3NjE4NjM4NmQ1MzM4NDZjODExM2I3ZCIsImVtYWlsIjoiaXNoZWlibHVAZ21haWwuY29tIiwicGhvbmUiOiIwMTY3MTc5NDA2MSIsInJvbGUiOnsicm9sZV9pZCI6MSwicm9sZV9uYW1lIjoic3VwZXJfYWRtaW4ifSwicHJvZmlsZSI6eyJuYW1lIjoiQXNocmFmdWwgSXNsYW0iLCJlbWFpbCI6ImlzaGVpYmx1QGdtYWlsLmNvbSIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X2ltYWdlLnBuZyIsInBob25lIjoiMDE2NzE3OTQwNjQiLCJzdGF0dXMiOjF9LCJ0aW1lX3BlcmlvZCI6MTczNjE2NTExNTAyMywiaWRlbnRpdHlfaWQiOiI3MjU5YzAxYi0yMTBkLTRmOTctYTU2NS02MTIzMmNhMzBjMTUiLCJpYXQiOjE3MzYxNjE1MTUsImV4cCI6MTc2NzcxOTExNX0.tVUo9b36-tZP7a9kBeIg4D7uB3qZlFzz7HGL7h3y3jE', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '7259c01b-210d-4f97-a565-61232ca30c15', 1, '2025-01-06 17:05:15', '2025-01-06 17:05:15'),
(5, 1, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiJmM2ZlNDk2MWI3NjE4NjM4NmQ1MzM4NDZjODExM2I3ZCIsImVtYWlsIjoiaXNoZWlibHVAZ21haWwuY29tIiwicGhvbmUiOiIwMTY3MTc5NDA2MSIsInJvbGUiOnsicm9sZV9pZCI6MSwicm9sZV9uYW1lIjoic3VwZXJfYWRtaW4ifSwicHJvZmlsZSI6eyJuYW1lIjoiQXNocmFmdWwgSXNsYW0iLCJlbWFpbCI6ImlzaGVpYmx1QGdtYWlsLmNvbSIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X2ltYWdlLnBuZyIsInBob25lIjoiMDE2NzE3OTQwNjQiLCJzdGF0dXMiOjF9LCJ0aW1lX3BlcmlvZCI6MTczNjE2NTE1MDEyOSwiaWRlbnRpdHlfaWQiOiI3MDg2YTAzNi05ODM1LTQzZjAtODY0YS1lODNlY2ZlMjVmYjAiLCJpYXQiOjE3MzYxNjE1NTAsImV4cCI6MTc2NzcxOTE1MH0.K_fIqxYk0bc0tZMTqFvtz8H2VD-CLj0UXtZlbn5qpPM', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '7086a036-9835-43f0-864a-e83ecfe25fb0', 1, '2025-01-06 17:05:50', '2025-01-06 17:05:50'),
(6, 1, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiJmM2ZlNDk2MWI3NjE4NjM4NmQ1MzM4NDZjODExM2I3ZCIsImVtYWlsIjoiaXNoZWlibHVAZ21haWwuY29tIiwicGhvbmUiOiIwMTY3MTc5NDA2MSIsInJvbGUiOnsicm9sZV9pZCI6MSwicm9sZV9uYW1lIjoic3VwZXJfYWRtaW4ifSwicHJvZmlsZSI6eyJuYW1lIjoiQXNocmFmdWwgSXNsYW0iLCJlbWFpbCI6ImlzaGVpYmx1QGdtYWlsLmNvbSIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X2ltYWdlLnBuZyIsInBob25lIjoiMDE2NzE3OTQwNjQiLCJzdGF0dXMiOjF9LCJ0aW1lX3BlcmlvZCI6MTczNjIzNjA5MzYxNCwiaWRlbnRpdHlfaWQiOiJmZWNmYzRiNS0zN2M3LTQ5YzQtYjM4My1jZWM5OTU3NjAzYjQiLCJpYXQiOjE3MzYyMzI0OTMsImV4cCI6MTc2Nzc5MDA5M30.Y1OjWFV7jKuNVPt2ZCmN2gvrgK_OuKqk2FRnKliBmXI', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', 'fecfc4b5-37c7-49c4-b383-cec9957603b4', 1, '2025-01-07 07:48:13', '2025-01-07 07:48:13'),
(7, 1, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiJmM2ZlNDk2MWI3NjE4NjM4NmQ1MzM4NDZjODExM2I3ZCIsImVtYWlsIjoiaXNoZWlibHVAZ21haWwuY29tIiwicGhvbmUiOiIwMTY3MTc5NDA2MSIsInJvbGUiOnsicm9sZV9pZCI6MSwicm9sZV9uYW1lIjoic3VwZXJfYWRtaW4ifSwicHJvZmlsZSI6eyJuYW1lIjoiQXNocmFmdWwgSXNsYW0iLCJlbWFpbCI6ImlzaGVpYmx1QGdtYWlsLmNvbSIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X2ltYWdlLnBuZyIsInBob25lIjoiMDE2NzE3OTQwNjQiLCJzdGF0dXMiOjF9LCJ0aW1lX3BlcmlvZCI6MTczNjIzNjEwOTU2MCwiaWRlbnRpdHlfaWQiOiIzNmQxNmRjOS1jZWY3LTQ1M2MtOGZhNy1kMTllMDA5NDdmNjIiLCJpYXQiOjE3MzYyMzI1MDksImV4cCI6MTc2Nzc5MDEwOX0.EjcSaBO8sqkcWBuX4A2PcAxRplDtzheDtlgvIFxnbl8', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '36d16dc9-cef7-453c-8fa7-d19e00947f62', 1, '2025-01-07 07:48:29', '2025-01-07 07:48:29'),
(8, 1, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiJmM2ZlNDk2MWI3NjE4NjM4NmQ1MzM4NDZjODExM2I3ZCIsImVtYWlsIjoiaXNoZWlibHVAZ21haWwuY29tIiwicGhvbmUiOiIwMTY3MTc5NDA2MSIsInJvbGUiOnsicm9sZV9pZCI6MSwicm9sZV9uYW1lIjoic3VwZXJfYWRtaW4ifSwicHJvZmlsZSI6eyJuYW1lIjoiQXNocmFmdWwgSXNsYW0iLCJlbWFpbCI6ImlzaGVpYmx1QGdtYWlsLmNvbSIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X2ltYWdlLnBuZyIsInBob25lIjoiMDE2NzE3OTQwNjQiLCJzdGF0dXMiOjF9LCJ0aW1lX3BlcmlvZCI6MTczNjMyNzQ5MDIwMCwiaWRlbnRpdHlfaWQiOiJhYjc5MjU1OS05ZWNjLTRmYWEtOWZkZi0wNWE1MjI3NzNlMWQiLCJpYXQiOjE3MzYzMjM4OTAsImV4cCI6MTc2Nzg4MTQ5MH0.nqmmG9L8j-Gx-PDwKWXc3GzXuqeZrSc7JcrYFL17Z2c', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', 'ab792559-9ecc-4faa-9fdf-05a522773e1d', 1, '2025-01-08 09:11:30', '2025-01-08 09:11:30'),
(9, 2, 2, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiI3ZmNhNjA0YTFhYzllZGE4NjliYjZlYmIzYWZkMDNlZCIsImVtYWlsIjoic2hvdm9uNTYuc3R1ZHlAZ21haWwuY29tIiwicGhvbmUiOiIxMjMiLCJyb2xlIjp7InJvbGVfaWQiOjMsInJvbGVfbmFtZSI6ImdlbmVyYWxfdXNlciJ9LCJwcm9maWxlIjp7ImZpcnN0X25hbWUiOiJTaG92b24gMyIsImxhc3RfbmFtZSI6IkNoYWtyb2JvcnR5IiwiZW1haWwiOiJzaG92b241Ni5zdHVkeUBnbWFpbC5jb20iLCJwaG9uZSI6IjEyMyIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X3Byb2ZpbGVfaW1hZ2UucG5nIiwic3RhdHVzIjoxLCJjcmVhdGVkX2J5IjpudWxsLCJ1cGRhdGVkX2J5IjpudWxsLCJjcmVhdGVkX2F0IjoiMjAyNS0wMS0wOFQwODo1NDowOC4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjUtMDEtMDhUMDg6NTQ6MDguMDAwWiJ9LCJ0aW1lX3BlcmlvZCI6MTczNjMzMDgzOTIyOCwiaWRlbnRpdHlfaWQiOiIwYTlkZTMyYy02MGU3LTRhNWYtYjZiYy04N2M4NWQ4MDVmMDYiLCJpYXQiOjE3MzYzMjcyMzksImV4cCI6MTc2Nzg4NDgzOX0.PZvVV6JotD9mJcrjQP0HUpJ4bWF8fpA8_9wYfd4-bNo', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '0a9de32c-60e7-4a5f-b6bc-87c85d805f06', 1, '2025-01-08 10:07:19', '2025-01-08 10:07:19'),
(10, 2, 2, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiI3ZmNhNjA0YTFhYzllZGE4NjliYjZlYmIzYWZkMDNlZCIsImVtYWlsIjoic2hvdm9uNTYuc3R1ZHlAZ21haWwuY29tIiwicGhvbmUiOiIxMjMiLCJyb2xlIjp7InJvbGVfaWQiOjMsInJvbGVfbmFtZSI6ImdlbmVyYWxfdXNlciJ9LCJwcm9maWxlIjp7ImZpcnN0X25hbWUiOiJTaG92b24gMyIsImxhc3RfbmFtZSI6IkNoYWtyb2JvcnR5IiwiZW1haWwiOiJzaG92b241Ni5zdHVkeUBnbWFpbC5jb20iLCJwaG9uZSI6IjEyMyIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X3Byb2ZpbGVfaW1hZ2UucG5nIiwic3RhdHVzIjoxLCJjcmVhdGVkX2J5IjpudWxsLCJ1cGRhdGVkX2J5IjpudWxsLCJjcmVhdGVkX2F0IjoiMjAyNS0wMS0wOFQwODo1NDowOC4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjUtMDEtMDhUMDg6NTQ6MDguMDAwWiJ9LCJ0aW1lX3BlcmlvZCI6MTczNjMzMDg0OTI0NSwiaWRlbnRpdHlfaWQiOiJkNTE5NGYwMi00ZGQ1LTQyMDktYTA1ZC1iNGVjNjNlZDI2MWEiLCJpYXQiOjE3MzYzMjcyNDksImV4cCI6MTc2Nzg4NDg0OX0.JUutSfzWn2n2hFgi30f206HT4e8nAR0REKCrZkFUGJg', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', 'd5194f02-4dd5-4209-a05d-b4ec63ed261a', 1, '2025-01-08 10:07:29', '2025-01-08 10:07:29'),
(11, 2, 2, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiI3ZmNhNjA0YTFhYzllZGE4NjliYjZlYmIzYWZkMDNlZCIsImVtYWlsIjoic2hvdm9uNTYuc3R1ZHlAZ21haWwuY29tIiwicGhvbmUiOiIxMjMiLCJyb2xlIjp7InJvbGVfaWQiOjMsInJvbGVfbmFtZSI6ImdlbmVyYWxfdXNlciJ9LCJwcm9maWxlIjp7ImZpcnN0X25hbWUiOiJTaG92b24gMyIsImxhc3RfbmFtZSI6IkNoYWtyb2JvcnR5IiwiZW1haWwiOiJzaG92b241Ni5zdHVkeUBnbWFpbC5jb20iLCJwaG9uZSI6IjEyMyIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X3Byb2ZpbGVfaW1hZ2UucG5nIiwic3RhdHVzIjoxLCJjcmVhdGVkX2J5IjpudWxsLCJ1cGRhdGVkX2J5IjpudWxsLCJjcmVhdGVkX2F0IjoiMjAyNS0wMS0wOFQwODo1NDowOC4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjUtMDEtMDhUMDg6NTQ6MDguMDAwWiJ9LCJ0aW1lX3BlcmlvZCI6MTczNjMzMTIyMDQ2OCwiaWRlbnRpdHlfaWQiOiJkY2M4NDc2OS02Y2Q0LTRlZmUtYTZiZi02ZTg1ODYwNTEwMGIiLCJpYXQiOjE3MzYzMjc2MjAsImV4cCI6MTc2Nzg4NTIyMH0.LNnKj3cawJ9UsfXjWGDhc8gFCqLLLvP7WnQtcMinXr4', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', 'dcc84769-6cd4-4efe-a6bf-6e858605100b', 1, '2025-01-08 10:13:40', '2025-01-08 10:13:40'),
(12, 2, 2, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiI3ZmNhNjA0YTFhYzllZGE4NjliYjZlYmIzYWZkMDNlZCIsImVtYWlsIjoic2hvdm9uNTYuc3R1ZHlAZ21haWwuY29tIiwicGhvbmUiOiIxMjMiLCJyb2xlIjp7InJvbGVfaWQiOjMsInJvbGVfbmFtZSI6ImdlbmVyYWxfdXNlciJ9LCJwcm9maWxlIjp7ImZpcnN0X25hbWUiOiJTaG92b24gMyIsImxhc3RfbmFtZSI6IkNoYWtyb2JvcnR5IiwiZW1haWwiOiJzaG92b241Ni5zdHVkeUBnbWFpbC5jb20iLCJwaG9uZSI6IjEyMyIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X3Byb2ZpbGVfaW1hZ2UucG5nIiwic3RhdHVzIjoxLCJjcmVhdGVkX2J5IjpudWxsLCJ1cGRhdGVkX2J5IjpudWxsLCJjcmVhdGVkX2F0IjoiMjAyNS0wMS0wOFQwODo1NDowOC4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjUtMDEtMDhUMDg6NTQ6MDguMDAwWiJ9LCJ0aW1lX3BlcmlvZCI6MTczNjMzMTQxMDk5MywiaWRlbnRpdHlfaWQiOiIxMTNkNWM3Zi1hNTI1LTQzZmQtYmE5Zi0wODcxMjYxNjdkNDYiLCJpYXQiOjE3MzYzMjc4MTAsImV4cCI6MTc2Nzg4NTQxMH0.xsn5xUWvUMXvBqWLBpiUt46HdKcWzgM5VWp59dFoxNI', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '113d5c7f-a525-43fd-ba9f-087126167d46', 1, '2025-01-08 10:16:50', '2025-01-08 10:16:50'),
(13, 2, 2, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiI3ZmNhNjA0YTFhYzllZGE4NjliYjZlYmIzYWZkMDNlZCIsImVtYWlsIjoic2hvdm9uNTYuc3R1ZHlAZ21haWwuY29tIiwicGhvbmUiOiIxMjMiLCJyb2xlIjp7InJvbGVfaWQiOjMsInJvbGVfbmFtZSI6ImdlbmVyYWxfdXNlciJ9LCJwcm9maWxlIjp7ImZpcnN0X25hbWUiOiJTaG92b24gMyIsImxhc3RfbmFtZSI6IkNoYWtyb2JvcnR5IiwiZW1haWwiOiJzaG92b241Ni5zdHVkeUBnbWFpbC5jb20iLCJwaG9uZSI6IjEyMyIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X3Byb2ZpbGVfaW1hZ2UucG5nIiwic3RhdHVzIjoxLCJjcmVhdGVkX2J5IjpudWxsLCJ1cGRhdGVkX2J5IjpudWxsLCJjcmVhdGVkX2F0IjoiMjAyNS0wMS0wOFQwODo1NDowOC4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjUtMDEtMDhUMDg6NTQ6MDguMDAwWiJ9LCJ0aW1lX3BlcmlvZCI6MTczNjMzMTQ0MDYyNywiaWRlbnRpdHlfaWQiOiI3NGM5ZWE4Yi1iN2E2LTQ3YTQtOTcxYy0wMmJhOTI3MWQzODQiLCJpYXQiOjE3MzYzMjc4NDAsImV4cCI6MTc2Nzg4NTQ0MH0.C2Oet2r99OiCV-8z3cyJWZa-3mFKoiTlHcVFezV6MqE', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '74c9ea8b-b7a6-47a4-971c-02ba9271d384', 1, '2025-01-08 10:17:20', '2025-01-08 10:17:20'),
(14, 2, 2, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiI3ZmNhNjA0YTFhYzllZGE4NjliYjZlYmIzYWZkMDNlZCIsImVtYWlsIjoic2hvdm9uNTYuc3R1ZHlAZ21haWwuY29tIiwicGhvbmUiOiIxMjMiLCJyb2xlIjp7InJvbGVfaWQiOjMsInJvbGVfbmFtZSI6ImdlbmVyYWxfdXNlciJ9LCJwcm9maWxlIjp7ImZpcnN0X25hbWUiOiJTaG92b24gMyIsImxhc3RfbmFtZSI6IkNoYWtyb2JvcnR5IiwiZW1haWwiOiJzaG92b241Ni5zdHVkeUBnbWFpbC5jb20iLCJwaG9uZSI6IjEyMyIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X3Byb2ZpbGVfaW1hZ2UucG5nIiwic3RhdHVzIjoxLCJjcmVhdGVkX2J5IjpudWxsLCJ1cGRhdGVkX2J5IjpudWxsLCJjcmVhdGVkX2F0IjoiMjAyNS0wMS0wOFQwODo1NDowOC4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjUtMDEtMDhUMDg6NTQ6MDguMDAwWiJ9LCJ0aW1lX3BlcmlvZCI6MTczNjMzNTgzNTk3MCwiaWRlbnRpdHlfaWQiOiJhZGU5ZTRiMS1hY2Y4LTQzZjMtODJhYy1lMWUzZjQxMDBiODciLCJpYXQiOjE3MzYzMzIyMzUsImV4cCI6MTc2Nzg4OTgzNX0.PLvkI2jM17yGT5397_Mrf2FYC4L3QmcP97JO1TIBRzU', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', 'ade9e4b1-acf8-43f3-82ac-e1e3f4100b87', 1, '2025-01-08 11:30:35', '2025-01-08 11:30:35'),
(15, 2, 2, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiI3ZmNhNjA0YTFhYzllZGE4NjliYjZlYmIzYWZkMDNlZCIsImVtYWlsIjoic2hvdm9uNTYuc3R1ZHlAZ21haWwuY29tIiwicGhvbmUiOiIxMjMiLCJyb2xlIjp7InJvbGVfaWQiOjMsInJvbGVfbmFtZSI6ImdlbmVyYWxfdXNlciJ9LCJwcm9maWxlIjp7ImZpcnN0X25hbWUiOiJTaG92b24gMyIsImxhc3RfbmFtZSI6IkNoYWtyb2JvcnR5IiwiZW1haWwiOiJzaG92b241Ni5zdHVkeUBnbWFpbC5jb20iLCJwaG9uZSI6IjEyMyIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X3Byb2ZpbGVfaW1hZ2UucG5nIiwic3RhdHVzIjoxLCJjcmVhdGVkX2J5IjpudWxsLCJ1cGRhdGVkX2J5IjpudWxsLCJjcmVhdGVkX2F0IjoiMjAyNS0wMS0wOFQwODo1NDowOC4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjUtMDEtMDhUMDg6NTQ6MDguMDAwWiJ9LCJ0aW1lX3BlcmlvZCI6MTczNjMzNTg1MTMyNywiaWRlbnRpdHlfaWQiOiJjZWUyMGE3OC1mZjhiLTQ1YzctOTdiMC00NjllOTIzOWVhOGQiLCJpYXQiOjE3MzYzMzIyNTEsImV4cCI6MTc2Nzg4OTg1MX0.kF3ESHvrp5yub5icNCc83Xerdi5gmXyTzvYXDp3OgSk', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', 'cee20a78-ff8b-45c7-97b0-469e9239ea8d', 1, '2025-01-08 11:30:51', '2025-01-08 11:30:51'),
(16, 4, 4, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiJmNzI3ZGI5ODBlYzdhMTlkM2Y0OTdiYzZlOTM3YjUyZSIsImVtYWlsIjoicmFmaWtAZ21haWwuY29tIiwicm9sZSI6MywicHJvZmlsZSI6eyJmaXJzdF9uYW1lIjoiUmFmaWsiLCJlbWFpbCI6InJhZmlrQGdtYWlsLmNvbSIsInJvbGVfaWQiOjMsImNyZWF0ZWRfYnkiOjAsInVwZGF0ZWRfYnkiOjAsInN0YXR1cyI6MX0sInRpbWVfcGVyaW9kIjoxNzM2NTg1NTAwODAzLCJpZGVudGl0eV9pZCI6ImEwYjlkN2NiLWRkY2UtNDY2Mi04YTNhLTIyMDdmZmNhNGI2NSIsImlhdCI6MTczNjU4MTkwMCwiZXhwIjoxNzY4MTM5NTAwfQ.ljh4V_CB9_AJdwcb6KCujLsIQSCxJr42vyYLCvy53aE', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', 'a0b9d7cb-ddce-4662-8a3a-2207ffca4b65', 1, '2025-01-11 08:51:40', '2025-01-11 08:51:40'),
(17, 4, 4, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiJmNzI3ZGI5ODBlYzdhMTlkM2Y0OTdiYzZlOTM3YjUyZSIsImVtYWlsIjoicmFmaWtAZ21haWwuY29tIiwicGhvbmUiOm51bGwsInJvbGUiOnsiaWQiOjMsInRpdGxlIjoiZ2VuZXJhbF91c2VyIn0sInByb2ZpbGUiOnsiaWQiOjQsInJvbGVfaWQiOjMsImZpcnN0X25hbWUiOiJSYWZpayIsImxhc3RfbmFtZSI6bnVsbCwiZW1haWwiOiJyYWZpa0BnbWFpbC5jb20iLCJwaG9uZSI6bnVsbCwicHJvZmlsZV9pbWFnZSI6ImRlZmF1bHRfcHJvZmlsZV9pbWFnZS5wbmciLCJzdGF0dXMiOjEsImNyZWF0ZWRfYnkiOjAsInVwZGF0ZWRfYnkiOjAsImNyZWF0ZWRfYXQiOiIyMDI1LTAxLTExVDEzOjUxOjM5LjAwMFoiLCJ1cGRhdGVkX2F0IjoiMjAyNS0wMS0xMVQxMzo1Mjo0My4wMDBaIn0sInRpbWVfcGVyaW9kIjoxNzM2NTg3MzMzMzQ0LCJpZGVudGl0eV9pZCI6IjRmNjkzMjFlLWRkOTMtNDYyYS1hY2FjLTc2Yzc3ZTE3NmQ5MCIsImlhdCI6MTczNjU4MzczMywiZXhwIjoxNzY4MTQxMzMzfQ.JvqX3Mnj8s9idVph4d_yJwbtnAbTss5NFx1Yswy33cM', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '4f69321e-dd93-462a-acac-76c77e176d90', 1, '2025-01-11 09:22:13', '2025-01-11 09:22:13'),
(18, 4, 4, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiJmNzI3ZGI5ODBlYzdhMTlkM2Y0OTdiYzZlOTM3YjUyZSIsImVtYWlsIjoicmFmaWtAZ21haWwuY29tIiwicGhvbmUiOm51bGwsInJvbGUiOnsiaWQiOjMsInRpdGxlIjoiZ2VuZXJhbF91c2VyIn0sInByb2ZpbGUiOnsiaWQiOjQsInJvbGVfaWQiOjMsImZpcnN0X25hbWUiOiJSYWZpayIsImxhc3RfbmFtZSI6bnVsbCwiZW1haWwiOiJyYWZpa0BnbWFpbC5jb20iLCJwaG9uZSI6bnVsbCwicHJvZmlsZV9pbWFnZSI6ImRlZmF1bHRfcHJvZmlsZV9pbWFnZS5wbmciLCJzdGF0dXMiOjEsImNyZWF0ZWRfYnkiOjAsInVwZGF0ZWRfYnkiOjAsImNyZWF0ZWRfYXQiOiIyMDI1LTAxLTExVDEzOjUxOjM5LjAwMFoiLCJ1cGRhdGVkX2F0IjoiMjAyNS0wMS0xMVQxMzo1Mjo0My4wMDBaIn0sInRpbWVfcGVyaW9kIjoxNzM2NTg3MzY1MzA0LCJpZGVudGl0eV9pZCI6IjRkM2E0YjM0LTgwYWItNDRiNS1iYzBmLTA1NTQ5YTIxMWQ1YiIsImlhdCI6MTczNjU4Mzc2NSwiZXhwIjoxNzY4MTQxMzY1fQ.N4pcRHPVX91T0UttZStDK0brlGUcMX6iiWfmqMNzkT8', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '4d3a4b34-80ab-44b5-bc0f-05549a211d5b', 1, '2025-01-11 09:22:45', '2025-01-11 09:22:45'),
(19, 4, 4, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiJmNzI3ZGI5ODBlYzdhMTlkM2Y0OTdiYzZlOTM3YjUyZSIsImVtYWlsIjoicmFmaWtAZ21haWwuY29tIiwicGhvbmUiOm51bGwsInJvbGUiOnsiaWQiOjMsInRpdGxlIjoiZ2VuZXJhbF91c2VyIn0sInByb2ZpbGUiOnsiaWQiOjQsInJvbGVfaWQiOjMsImZpcnN0X25hbWUiOiJSYWZpayIsImxhc3RfbmFtZSI6bnVsbCwiZW1haWwiOiJyYWZpa0BnbWFpbC5jb20iLCJwaG9uZSI6bnVsbCwicHJvZmlsZV9pbWFnZSI6ImRlZmF1bHRfcHJvZmlsZV9pbWFnZS5wbmciLCJzdGF0dXMiOjEsImNyZWF0ZWRfYnkiOjAsInVwZGF0ZWRfYnkiOjAsImNyZWF0ZWRfYXQiOiIyMDI1LTAxLTExVDEzOjUxOjM5LjAwMFoiLCJ1cGRhdGVkX2F0IjoiMjAyNS0wMS0xMVQxMzo1Mjo0My4wMDBaIn0sInRpbWVfcGVyaW9kIjoxNzM2NTg3Mzg3Njg5LCJpZGVudGl0eV9pZCI6IjQ2OTQxOTJiLTIxODEtNGI1Ny04ZmY4LWJlMWY5YWM0ZTFkMyIsImlhdCI6MTczNjU4Mzc4NywiZXhwIjoxNzY4MTQxMzg3fQ.lpC7U3yvjoV-j0AQueE4k6AVKDrjyEAzkjC58pwVwOs', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '4694192b-2181-4b57-8ff8-be1f9ac4e1d3', 1, '2025-01-11 09:23:07', '2025-01-11 09:23:07'),
(20, 6, 6, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiIwYjQ1ZTJkNjI1MWU0Yzk1MjEyYzU5MTE2YzYxOGViNiIsImVtYWlsIjoicmFmaWtAZ21haWwuY29tIiwicm9sZSI6eyJyb2xlX2lkIjozLCJ0aXRsZSI6ImdlbmVyYWxfdXNlciJ9LCJwcm9maWxlIjp7ImZpcnN0X25hbWUiOiJSYWZpayIsImVtYWlsIjoicmFmaWtAZ21haWwuY29tIiwicm9sZV9pZCI6MywiY3JlYXRlZF9ieSI6MCwidXBkYXRlZF9ieSI6MCwic3RhdHVzIjoxfSwidGltZV9wZXJpb2QiOjE3MzY1ODgxMDMwMzgsImlkZW50aXR5X2lkIjoiMjEyOTA3OGEtNmE2Yy00ZjY1LWIwNjItZmE0YmFkN2FlN2YzIiwiaWF0IjoxNzM2NTg0NTAzLCJleHAiOjE3NjgxNDIxMDN9._yfArAh3FKnTN_2fyjxPB7WnzIvoG9f38Bxbw4dgLOA', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '2129078a-6a6c-4f65-b062-fa4bad7ae7f3', 1, '2025-01-11 09:35:03', '2025-01-11 09:35:03'),
(21, 6, 6, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiIwYjQ1ZTJkNjI1MWU0Yzk1MjEyYzU5MTE2YzYxOGViNiIsImVtYWlsIjoicmFmaWtAZ21haWwuY29tIiwicGhvbmUiOm51bGwsInJvbGUiOnsicm9sZV9pZCI6MywidGl0bGUiOiJnZW5lcmFsX3VzZXIifSwicHJvZmlsZSI6eyJpZCI6Niwicm9sZV9pZCI6MywiZmlyc3RfbmFtZSI6IlJhZmlrIiwibGFzdF9uYW1lIjoiTi9BIiwiZW1haWwiOiJyYWZpa0BnbWFpbC5jb20iLCJwaG9uZSI6bnVsbCwicHJvZmlsZV9pbWFnZSI6ImRlZmF1bHRfcHJvZmlsZV9pbWFnZS5wbmciLCJzdGF0dXMiOjEsImNyZWF0ZWRfYnkiOjAsInVwZGF0ZWRfYnkiOjAsImNyZWF0ZWRfYXQiOiIyMDI1LTAxLTExVDE0OjM1OjAwLjAwMFoiLCJ1cGRhdGVkX2F0IjoiMjAyNS0wMS0xMVQxNDozNTowMC4wMDBaIn0sInRpbWVfcGVyaW9kIjoxNzM2NTg4MTExNTA1LCJpZGVudGl0eV9pZCI6Ijg2NTJlNWZiLTQzNjktNGRjYi04ZGMyLTgxNTI1ZjEwNWM0ZiIsImlhdCI6MTczNjU4NDUxMSwiZXhwIjoxNzY4MTQyMTExfQ.gZhDTg2xYWNQ31XxQdj9tGEFFkfuD_oFPAC9SfceR54', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '8652e5fb-4369-4dcb-8dc2-81525f105c4f', 1, '2025-01-11 09:35:11', '2025-01-11 09:35:11'),
(22, 2, 2, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiI3ZmNhNjA0YTFhYzllZGE4NjliYjZlYmIzYWZkMDNlZCIsImVtYWlsIjoic2hvdm9uNTYuc3R1ZHlAZ21haWwuY29tIiwicGhvbmUiOiIxMjMiLCJyb2xlIjp7InJvbGVfaWQiOjMsInJvbGVfbmFtZSI6ImdlbmVyYWxfdXNlciJ9LCJwcm9maWxlIjp7ImZpcnN0X25hbWUiOiJTaG92b24gMyIsImxhc3RfbmFtZSI6IkNoYWtyb2JvcnR5IiwiZW1haWwiOiJzaG92b241Ni5zdHVkeUBnbWFpbC5jb20iLCJwaG9uZSI6IjEyMyIsInByb2ZpbGVfaW1hZ2UiOiJkZWZhdWx0X3Byb2ZpbGVfaW1hZ2UucG5nIiwic3RhdHVzIjoxLCJjcmVhdGVkX2J5IjpudWxsLCJ1cGRhdGVkX2J5IjpudWxsLCJjcmVhdGVkX2F0IjoiMjAyNS0wMS0wOFQwODo1NDowOC4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjUtMDEtMDhUMDg6NTQ6MDguMDAwWiJ9LCJ0aW1lX3BlcmlvZCI6MTczNjcwMzg3MDE4OSwiaWRlbnRpdHlfaWQiOiIwM2FlMjBkNi1lYmY5LTRmYjgtOTI4Mi1lNzE4ZDQ5ZmZmMTQiLCJpYXQiOjE3MzY3MDAyNzAsImV4cCI6MTc2ODI1Nzg3MH0.qbzeb1AsGDP1TsXhCsbp_1f50nHFPAHFXh7Qe3tru3Y', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '03ae20d6-ebf9-4fb8-9282-e718d49fff14', 1, '2025-01-12 17:44:30', '2025-01-12 17:44:30'),
(23, 2, 2, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiI3ZmNhNjA0YTFhYzllZGE4NjliYjZlYmIzYWZkMDNlZCIsImVtYWlsIjoic2hvdm9uNTYuc3R1ZHlAZ21haWwuY29tIiwicGhvbmUiOiIwMTc0NDU0NTc4NiIsInJvbGUiOnsicm9sZV9pZCI6Mywicm9sZV9uYW1lIjoiZ2VuZXJhbF91c2VyIn0sInByb2ZpbGUiOnsiZmlyc3RfbmFtZSI6IlNob3ZvbiBMYWwiLCJsYXN0X25hbWUiOiJEaGFrYSIsImVtYWlsIjoic2hvdm9uNTYuc3R1ZHlAZ21haWwuY29tIiwicGhvbmUiOiIwMTc0NDU0NTc4NiIsInByb2ZpbGVfaW1hZ2UiOiIxNzM2NzAxMzA3NjAxLTFUZWliN2lLb1IucG5nIiwic3RhdHVzIjoxLCJjcmVhdGVkX2J5IjpudWxsLCJ1cGRhdGVkX2J5IjoyLCJjcmVhdGVkX2F0IjoiMjAyNS0wMS0wOFQwODo1NDowOC4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjUtMDEtMTJUMTg6MDE6NDcuMDAwWiJ9LCJ0aW1lX3BlcmlvZCI6MTczNjcwNzMyOTM4NiwiaWRlbnRpdHlfaWQiOiI2MWU2MjFjMC1iMTVjLTRjYjAtOGVlYy0wYzUxNmIwYjE2YmYiLCJpYXQiOjE3MzY3MDM3MjksImV4cCI6MTc2ODI2MTMyOX0.1-2ffCBza1_DexaS8nsPM-utskoB1PtikqF_JwKo1Pw', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '61e621c0-b15c-4cb0-8eec-0c516b0b16bf', 1, '2025-01-12 18:42:09', '2025-01-12 18:42:09'),
(24, 2, 2, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiI3ZmNhNjA0YTFhYzllZGE4NjliYjZlYmIzYWZkMDNlZCIsImVtYWlsIjoic2hvdm9uNTdAZ21haWwuY29tIiwicGhvbmUiOiIwMTc0NDU0NTc4NiIsInJvbGUiOnsicm9sZV9pZCI6Mywicm9sZV9uYW1lIjoiZ2VuZXJhbF91c2VyIn0sInByb2ZpbGUiOnsiZmlyc3RfbmFtZSI6IlNob3ZvbiBMYWwiLCJsYXN0X25hbWUiOiJEaGFrYSIsImVtYWlsIjoic2hvdm9uNTdAZ21haWwuY29tIiwicGhvbmUiOiIwMTc0NDU0NTc4NiIsInByb2ZpbGVfaW1hZ2UiOiIxNzM2NzAxMzA3NjAxLTFUZWliN2lLb1IucG5nIiwic3RhdHVzIjoxLCJjcmVhdGVkX2J5IjpudWxsLCJ1cGRhdGVkX2J5IjoyLCJjcmVhdGVkX2F0IjoiMjAyNS0wMS0wOFQwODo1NDowOC4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjUtMDEtMTJUMTg6NTU6NTguMDAwWiJ9LCJ0aW1lX3BlcmlvZCI6MTczNjcwODE3ODg0MCwiaWRlbnRpdHlfaWQiOiI1ZGNmYzkwMS0zMTNhLTQyMzEtOGNiZC0wYThhNDQ4ODIwNTciLCJpYXQiOjE3MzY3MDQ1NzgsImV4cCI6MTc2ODI2MjE3OH0.R4d1h5Ns7txt0yxE6gD3f7ygiKjsC9BMw3xuMi8Libs', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', '5dcfc901-313a-4231-8cbd-0a8a44882057', 1, '2025-01-12 18:56:18', '2025-01-12 18:56:18'),
(25, 6, 6, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW4iOiIwYjQ1ZTJkNjI1MWU0Yzk1MjEyYzU5MTE2YzYxOGViNiIsImVtYWlsIjoicmFmaWtAZ21haWwuY29tIiwicGhvbmUiOm51bGwsInJvbGUiOnsicm9sZV9pZCI6MywidGl0bGUiOiJnZW5lcmFsX3VzZXIifSwicHJvZmlsZSI6eyJpZCI6Niwicm9sZV9pZCI6MywiZmlyc3RfbmFtZSI6IlJhZmlrIiwibGFzdF9uYW1lIjoiTi9BIiwiZW1haWwiOiJyYWZpa0BnbWFpbC5jb20iLCJwaG9uZSI6bnVsbCwicHJvZmlsZV9pbWFnZSI6ImRlZmF1bHRfcHJvZmlsZV9pbWFnZS5wbmciLCJzdGF0dXMiOjEsImNyZWF0ZWRfYnkiOjAsInVwZGF0ZWRfYnkiOjAsImNyZWF0ZWRfYXQiOiIyMDI1LTAxLTExVDE0OjM1OjAwLjAwMFoiLCJ1cGRhdGVkX2F0IjoiMjAyNS0wMS0xMVQxNDozNTowMC4wMDBaIn0sInRpbWVfcGVyaW9kIjoxNzM2NzA4MTg2MjkwLCJpZGVudGl0eV9pZCI6ImYzYTA2ZDA4LWZlYjAtNDFmMi04NWZmLWIyN2ZiMGIwOWQ1NCIsImlhdCI6MTczNjcwNDU4NiwiZXhwIjoxNzY4MjYyMTg2fQ.bVinMelrTIi37sYXEdVi5ZHEen0qDU9PXqIky1nHwpE', '{\"useragent\":\"PostmanRuntime/7.43.0\",\"os-name\":\"\",\"os-short-name\":\"\",\"os-family\":\"\",\"client-type\":\"library\",\"client-name\":\"Postman Desktop\",\"client-short-name\":\"\",\"client-version\":\"7.43.0\",\"device-id\":\"\",\"device-type\":\"\",\"device-brand\":\"\",\"device-model\":\"\"}', 'f3a06d08-feb0-41f2-85ff-b27fb0b09d54', 1, '2025-01-12 18:56:26', '2025-01-12 18:56:26');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_modules`
--

CREATE TABLE `deautodb_modules` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT 'Unknown',
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_modules`
--

INSERT INTO `deautodb_modules` (`id`, `title`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'Test Shovon', 1, 1, 1, '2025-01-05 18:44:40', '2025-01-05 18:44:40'),
(2, 'Test Shovon 2', 1, 1, 1, '2025-01-05 18:45:01', '2025-01-05 18:45:01');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_module_permissions`
--

CREATE TABLE `deautodb_module_permissions` (
  `id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_module_permissions`
--

INSERT INTO `deautodb_module_permissions` (`id`, `module_id`, `permission_id`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 2, 2, 1, 1, 1, '2025-01-05 18:45:01', '2025-01-05 18:45:01'),
(2, 2, 1, 1, 1, 1, '2025-01-05 18:45:01', '2025-01-05 18:45:01');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_otp`
--

CREATE TABLE `deautodb_otp` (
  `id` int(11) NOT NULL,
  `unique_id` varchar(255) NOT NULL DEFAULT 'Unknown',
  `sent_media` int(11) NOT NULL DEFAULT 1 COMMENT '1 = sms',
  `otp` varchar(45) NOT NULL,
  `counter` int(11) NOT NULL DEFAULT 3,
  `reason` text DEFAULT NULL,
  `other_info` text DEFAULT NULL,
  `expired_time` datetime DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_otp`
--

INSERT INTO `deautodb_otp` (`id`, `unique_id`, `sent_media`, `otp`, `counter`, `reason`, `other_info`, `expired_time`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'b547c4af-4ebb-4486-a39f-fe15b2b48ed8', 1, '5930', 3, 'User Registration', '\"{\\\"first_name\\\":\\\"Shovon 3\\\",\\\"last_name\\\":\\\"Chakroborty\\\",\\\"email\\\":\\\"shovon56.study@gmail.com\\\",\\\"phone\\\":\\\"123\\\",\\\"password\\\":\\\"$2b$10$cZ5DMfjAyQLfpkh99QB2OeDkZbt5is/jikvoT6YEKDH7ofoukE37K\\\",\\\"confirm_password\\\":\\\"123456\\\",\\\"role_id\\\":3,\\\"id\\\":1}\"', '2025-01-08 08:55:06', 0, NULL, NULL, '2025-01-08 08:50:06', '2025-01-08 13:54:08'),
(2, 'f6e99e96-0955-4b09-9e39-269c4f25839c', 1, '7230', 2, 'User Registration', '\"{\\\"first_name\\\":\\\"Shovon 3\\\",\\\"last_name\\\":\\\"Chakroborty\\\",\\\"email\\\":\\\"shovon8@gmai6.com\\\",\\\"phone\\\":\\\"123\\\",\\\"password\\\":\\\"$2b$10$wOngnP8ONXnX1YucW3uukeJJRMjW3TzRblWUgsJAPU85dh136e2vG\\\",\\\"confirm_password\\\":\\\"123456\\\",\\\"role_id\\\":3,\\\"id\\\":2}\"', '2025-01-08 09:18:04', 0, NULL, NULL, '2025-01-08 09:13:04', '2025-01-08 14:18:08'),
(3, '03934e88-5f1e-4bef-9187-fa66ea37c9f3', 1, '3062', 3, 'User Registration', '\"{\\\"first_name\\\":\\\"Shovon 3\\\",\\\"last_name\\\":\\\"Chakroborty\\\",\\\"email\\\":\\\"shovon8@gmai6.com\\\",\\\"phone\\\":\\\"123\\\",\\\"password\\\":\\\"$2b$10$IKVXYbPhkR23PEBXhNGay.Z40kLgOVHCQ2Bplm9gnXbunQXNKo2gC\\\",\\\"confirm_password\\\":\\\"123456\\\",\\\"role_id\\\":3,\\\"id\\\":3}\"', '2025-01-08 09:23:31', 0, NULL, NULL, '2025-01-08 09:18:31', '2025-01-08 14:18:43'),
(4, '2', 1, '1358', 3, 'Forget Password', NULL, '2025-01-08 11:34:34', 0, NULL, NULL, '2025-01-08 11:29:34', '2025-01-08 16:30:10');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_payment_packages`
--

CREATE TABLE `deautodb_payment_packages` (
  `id` int(15) NOT NULL,
  `country_code` int(10) NOT NULL DEFAULT 1,
  `title` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'Unknown' CHECK (json_valid(`title`)),
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '\' \'' CHECK (json_valid(`details`)),
  `duration` int(11) NOT NULL DEFAULT 1,
  `service_limit` int(10) NOT NULL DEFAULT 0,
  `appointment_limit` int(10) NOT NULL DEFAULT 0,
  `price` double NOT NULL DEFAULT 1,
  `discount_amount` double DEFAULT NULL,
  `discount_percentage` double DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_payment_packages`
--

INSERT INTO `deautodb_payment_packages` (`id`, `country_code`, `title`, `details`, `duration`, `service_limit`, `appointment_limit`, `price`, `discount_amount`, `discount_percentage`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 1, '{\"en\":\"3 mas\",\"dutch\":\"3 mn\"}', '{\"en\":\"ewew\",\"dutch\":\"3 sadas\"}', 90, 5, 10, 1000, 500, 50, 1, 1, 1, '2025-01-05 19:59:57', '2025-01-05 20:29:50'),
(2, 1, '{\"en\":\"6 Month\",\"dutch\":\"6 monte\"}', '{\"en\":\"sfasfsa\",\"dutch\":\"3 safsaf\"}', 180, 50, 100, 1000, 200, 20, 1, 1, 1, '2025-01-05 20:00:28', '2025-01-05 20:00:28');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_permissions`
--

CREATE TABLE `deautodb_permissions` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT 'Unknown',
  `key_name` varchar(255) NOT NULL DEFAULT 'Unknown',
  `access_user` int(11) NOT NULL DEFAULT 1,
  `api_version` varchar(255) DEFAULT 'v1',
  `file_name` varchar(255) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_permissions`
--

INSERT INTO `deautodb_permissions` (`id`, `title`, `key_name`, `access_user`, `api_version`, `file_name`, `url`, `method`, `details`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'Leave Create', 'leave_create', 1, 'v1', NULL, NULL, NULL, ' ', 1, 1, 1, '2025-01-05 18:37:28', '2025-01-05 18:44:26'),
(2, 'Category List', 'category_list', 1, 'v1', NULL, NULL, NULL, '', 1, 1, 1, '2025-01-05 18:37:44', '2025-01-05 18:37:44');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_roles`
--

CREATE TABLE `deautodb_roles` (
  `id` int(11) NOT NULL,
  `title` varchar(50) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_roles`
--

INSERT INTO `deautodb_roles` (`id`, `title`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'super_admin', 1, 1, 1, '2025-01-03 02:28:55', '2025-01-03 02:28:55'),
(2, 'company_admin', 1, 1, 1, '2025-01-03 02:28:55', '2025-01-03 02:28:55'),
(3, 'general_user', 1, 1, 1, '2025-01-03 02:29:14', '2025-01-03 02:29:14');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_role_permissions`
--

CREATE TABLE `deautodb_role_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_services`
--

CREATE TABLE `deautodb_services` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL DEFAULT 0,
  `title` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`title`)),
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_services`
--

INSERT INTO `deautodb_services` (`id`, `category_id`, `title`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 1, '{\"en\":\"title 42\",\"dutch\":\"dutch 42\"}', 1, 1, 1, '2025-01-05 00:55:01', '2025-01-05 00:55:01'),
(2, 2, '{\"en\":\"title 4\",\"dutch\":\"dutch 4\"}', 0, 1, 1, '2025-01-05 00:55:41', '2025-01-05 01:04:29'),
(3, 1, '{\"en\":\"title 400\",\"dutch\":\"dutch 400\"}', 1, 1, 1, '2025-01-05 01:04:38', '2025-01-05 01:12:27');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_super_admins`
--

CREATE TABLE `deautodb_super_admins` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'Unknown',
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `profile_image` varchar(255) NOT NULL DEFAULT 'default_image.png',
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_super_admins`
--

INSERT INTO `deautodb_super_admins` (`id`, `name`, `email`, `phone`, `address`, `profile_image`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'Ashraful Islam', 'isheiblu@gmail.com', '01671794064', 'Dhaka', 'default_image.png', 1, 1, 1, '2025-01-03 15:17:37', '2025-01-03 15:17:37');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_temp_users`
--

CREATE TABLE `deautodb_temp_users` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL DEFAULT 0,
  `email` varchar(255) NOT NULL,
  `token` text DEFAULT NULL,
  `uuid` varchar(255) NOT NULL DEFAULT 'Unknown',
  `password` text NOT NULL,
  `otp_verified` int(11) NOT NULL DEFAULT 0,
  `details` text DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_temp_users`
--

INSERT INTO `deautodb_temp_users` (`id`, `role_id`, `email`, `token`, `uuid`, `password`, `otp_verified`, `details`, `status`, `created_at`) VALUES
(1, 3, 'shovon56.study@gmail.com', NULL, 'b547c4af-4ebb-4486-a39f-fe15b2b48ed8', '$2b$10$cZ5DMfjAyQLfpkh99QB2OeDkZbt5is/jikvoT6YEKDH7ofoukE37K', 1, '{\"first_name\":\"Shovon 3\",\"last_name\":\"Chakroborty\",\"email\":\"shovon56.study@gmail.com\",\"phone\":\"123\",\"password\":\"$2b$10$cZ5DMfjAyQLfpkh99QB2OeDkZbt5is/jikvoT6YEKDH7ofoukE37K\",\"confirm_password\":\"123456\",\"role_id\":3}', 1, '2025-01-08 08:50:06'),
(2, 3, 'shovon8@gmai6.com', NULL, 'f6e99e96-0955-4b09-9e39-269c4f25839c', '$2b$10$wOngnP8ONXnX1YucW3uukeJJRMjW3TzRblWUgsJAPU85dh136e2vG', 0, '{\"first_name\":\"Shovon 3\",\"last_name\":\"Chakroborty\",\"email\":\"shovon8@gmai6.com\",\"phone\":\"123\",\"password\":\"$2b$10$wOngnP8ONXnX1YucW3uukeJJRMjW3TzRblWUgsJAPU85dh136e2vG\",\"confirm_password\":\"123456\",\"role_id\":3}', 0, '2025-01-08 09:13:04'),
(3, 3, 'shovon8@gmai6.com', NULL, '03934e88-5f1e-4bef-9187-fa66ea37c9f3', '$2b$10$IKVXYbPhkR23PEBXhNGay.Z40kLgOVHCQ2Bplm9gnXbunQXNKo2gC', 1, '{\"first_name\":\"Shovon 3\",\"last_name\":\"Chakroborty\",\"email\":\"shovon8@gmai6.com\",\"phone\":\"123\",\"password\":\"$2b$10$IKVXYbPhkR23PEBXhNGay.Z40kLgOVHCQ2Bplm9gnXbunQXNKo2gC\",\"confirm_password\":\"123456\",\"role_id\":3}', 1, '2025-01-08 09:18:31');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_users`
--

CREATE TABLE `deautodb_users` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL DEFAULT 0,
  `profile_id` int(11) NOT NULL DEFAULT 0,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `password` text NOT NULL,
  `social_provider_name` varchar(45) DEFAULT NULL COMMENT 'google, apple, facebook',
  `social_provider_id` varchar(255) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1 =active , 2 = de-active',
  `updated_by` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `deautodb_users`
--

INSERT INTO `deautodb_users` (`id`, `role_id`, `profile_id`, `email`, `phone`, `password`, `social_provider_name`, `social_provider_id`, `status`, `updated_by`, `updated_at`) VALUES
(1, 1, 1, 'isheiblu@gmail.com', '01671794061', '$2b$10$REUeKiIvt2ftFOHfn0xuuehM0Rphdm6pQ93xYTYzrf9l0t7kPEc2e', NULL, NULL, 1, 1, '2025-01-07 07:47:53'),
(2, 3, 2, 'shovon57@gmail.com', '01744545786', '$2b$10$hdTBhvZK/LRf1ag.9eeDK.SM0TTVsm4IceInX/kE0xsjTgdrivJj6', NULL, NULL, 1, 2, '2025-01-12 18:55:58'),
(3, 3, 3, 'shovon8@gmai6.com', '123', '$2b$10$IKVXYbPhkR23PEBXhNGay.Z40kLgOVHCQ2Bplm9gnXbunQXNKo2gC', NULL, NULL, 1, 0, '2025-01-08 09:18:43'),
(6, 3, 6, 'rafik@gmail.com', NULL, 'no password set yet.', 'facebook', '106300062574083692889', 1, 0, '2025-01-11 14:35:00');

-- --------------------------------------------------------

--
-- Table structure for table `deautodb_user_payment_package_histories`
--

CREATE TABLE `deautodb_user_payment_package_histories` (
  `id` int(15) NOT NULL,
  `user_id` int(15) NOT NULL DEFAULT 0,
  `payment_package_id` int(15) DEFAULT 0,
  `enroll_date` date DEFAULT NULL,
  `expired_date` date DEFAULT NULL,
  `details` text DEFAULT NULL,
  `price` double NOT NULL DEFAULT 1,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `deautodb_banners`
--
ALTER TABLE `deautodb_banners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_billing_cards`
--
ALTER TABLE `deautodb_billing_cards`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_categories`
--
ALTER TABLE `deautodb_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_companies`
--
ALTER TABLE `deautodb_companies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_company_services`
--
ALTER TABLE `deautodb_company_services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_company_subscribed_packages`
--
ALTER TABLE `deautodb_company_subscribed_packages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_company_subscribed_package_histories`
--
ALTER TABLE `deautodb_company_subscribed_package_histories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_company_users`
--
ALTER TABLE `deautodb_company_users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_consumers`
--
ALTER TABLE `deautodb_consumers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_employees`
--
ALTER TABLE `deautodb_employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_faqs`
--
ALTER TABLE `deautodb_faqs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_login_attempts`
--
ALTER TABLE `deautodb_login_attempts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_login_tracks`
--
ALTER TABLE `deautodb_login_tracks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_modules`
--
ALTER TABLE `deautodb_modules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_module_permissions`
--
ALTER TABLE `deautodb_module_permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_otp`
--
ALTER TABLE `deautodb_otp`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_payment_packages`
--
ALTER TABLE `deautodb_payment_packages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_permissions`
--
ALTER TABLE `deautodb_permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_roles`
--
ALTER TABLE `deautodb_roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_role_permissions`
--
ALTER TABLE `deautodb_role_permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_services`
--
ALTER TABLE `deautodb_services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_super_admins`
--
ALTER TABLE `deautodb_super_admins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_temp_users`
--
ALTER TABLE `deautodb_temp_users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_users`
--
ALTER TABLE `deautodb_users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deautodb_user_payment_package_histories`
--
ALTER TABLE `deautodb_user_payment_package_histories`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `deautodb_banners`
--
ALTER TABLE `deautodb_banners`
  MODIFY `id` int(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `deautodb_billing_cards`
--
ALTER TABLE `deautodb_billing_cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deautodb_categories`
--
ALTER TABLE `deautodb_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `deautodb_companies`
--
ALTER TABLE `deautodb_companies`
  MODIFY `id` int(15) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deautodb_company_services`
--
ALTER TABLE `deautodb_company_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deautodb_company_subscribed_packages`
--
ALTER TABLE `deautodb_company_subscribed_packages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deautodb_company_subscribed_package_histories`
--
ALTER TABLE `deautodb_company_subscribed_package_histories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deautodb_company_users`
--
ALTER TABLE `deautodb_company_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deautodb_consumers`
--
ALTER TABLE `deautodb_consumers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `deautodb_employees`
--
ALTER TABLE `deautodb_employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deautodb_faqs`
--
ALTER TABLE `deautodb_faqs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `deautodb_login_attempts`
--
ALTER TABLE `deautodb_login_attempts`
  MODIFY `id` int(15) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deautodb_login_tracks`
--
ALTER TABLE `deautodb_login_tracks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `deautodb_modules`
--
ALTER TABLE `deautodb_modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `deautodb_module_permissions`
--
ALTER TABLE `deautodb_module_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `deautodb_otp`
--
ALTER TABLE `deautodb_otp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `deautodb_payment_packages`
--
ALTER TABLE `deautodb_payment_packages`
  MODIFY `id` int(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `deautodb_permissions`
--
ALTER TABLE `deautodb_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `deautodb_roles`
--
ALTER TABLE `deautodb_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `deautodb_role_permissions`
--
ALTER TABLE `deautodb_role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deautodb_services`
--
ALTER TABLE `deautodb_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `deautodb_super_admins`
--
ALTER TABLE `deautodb_super_admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `deautodb_temp_users`
--
ALTER TABLE `deautodb_temp_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `deautodb_users`
--
ALTER TABLE `deautodb_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `deautodb_user_payment_package_histories`
--
ALTER TABLE `deautodb_user_payment_package_histories`
  MODIFY `id` int(15) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
