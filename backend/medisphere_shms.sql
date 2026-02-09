-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 05, 2026 at 02:08 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `medisphere_shms`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(10) NOT NULL,
  `username` char(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_attendance_logs`
--

CREATE TABLE `ai_attendance_logs` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ai_attendance_logs`
--

INSERT INTO `ai_attendance_logs` (`id`, `name`, `time`) VALUES
(1, 'MediSphere User', '2025-12-21 19:46:18'),
(2, 'MediSphere User', '2025-12-22 12:28:34'),
(3, 'MediSphere User', '2025-12-29 11:02:48'),
(4, 'MediSphere Nurse', '2025-12-29 16:33:30'),
(5, 'MediSphere User', '2026-01-31 15:49:06'),
(6, 'MediSphere User', '2026-02-04 19:48:28'),
(7, 'MediSphere Nurse', '2026-02-05 12:21:50');

-- --------------------------------------------------------

--
-- Table structure for table `ai_faces`
--

CREATE TABLE `ai_faces` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `embedding` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`embedding`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ai_faces`
--

INSERT INTO `ai_faces` (`id`, `name`, `embedding`) VALUES
(1, 'MediSphere User', '[-0.9615803956985474, -0.05040956288576126, -1.1692699193954468, -0.034477349370718, 0.8976274728775024, 0.8289223313331604, -0.11128191649913788, 0.808413565158844, 0.06771573424339294, 0.4585784077644348, 0.3567991554737091, -0.9676880240440369, 0.33700186014175415, -1.2827004194259644, 0.27910375595092773, -0.6007500886917114, 0.38681331276893616, 1.047987937927246, -0.05666900426149368, -0.030735982581973076, 0.24386689066886902, 0.32831743359565735, 0.27092260122299194, -0.3045579493045807, -0.598537027835846, -0.6754890084266663, -0.5051465034484863, 0.23956042528152466, -1.8305087089538574, 0.19478724896907806, -0.050849057734012604, 0.2144518345594406, 0.4759005606174469, -0.5585599541664124, 1.1697615385055542, -0.584221363067627, 1.1577904224395752, -0.6175053119659424, 1.0518748760223389, -1.5380699634552002, -0.39279910922050476, 0.28213372826576233, -0.32329487800598145, -0.1362595558166504, 0.5901610851287842, -0.26257583498954773, 0.34277233481407166, -0.5635979175567627, 0.4943438768386841, 0.6347907781600952, -0.4242255687713623, 0.6835082173347473, -0.10218711942434311, -0.5264082551002502, 0.1858595460653305, 0.5071196556091309, -0.6714617013931274, -1.067702054977417, 0.03503897786140442, -0.7407280206680298, 0.7212809324264526, 0.3019447922706604, 1.358130693435669, 0.1779622882604599, 0.40136927366256714, -0.16808776557445526, -0.44922763109207153, 0.7865574955940247, 0.6400436758995056, -0.7388174533843994, -0.391381174325943, 0.08839131891727448, -1.709495186805725, -1.5171937942504883, 0.23879577219486237, -0.15102407336235046, -1.3509106636047363, -0.6818093061447144, -0.19722208380699158, 0.17587493360042572, 0.5728377103805542, 0.10221431404352188, -0.6668394804000854, 1.4303339719772339, 0.3654462993144989, 0.2249256670475006, -0.36972522735595703, 0.3141939043998718, -1.595564365386963, -0.5692197680473328, -0.10365874320268631, 0.1356562376022339, -1.3037446737289429, 1.5489740371704102, -0.47328704595565796, -0.26990506052970886, -0.05401553958654404, -1.199820876121521, -0.4526079297065735, 0.8671650290489197, 0.02079135924577713, 0.5279455780982971, -0.25234490633010864, -0.7474080920219421, -1.4409266710281372, 0.19862505793571472, -1.3153951168060303, -1.416035771369934, -0.7166727185249329, 0.3741075396537781, -0.45858728885650635, -0.36632853746414185, -0.10479505360126495, 0.7636587619781494, -0.3843614161014557, 0.21773797273635864, -0.7212487459182739, -1.0082242488861084, -0.7747468948364258, 1.6789056062698364, -0.8578556180000305, 0.3800128400325775, 0.8266931772232056, -0.04587860405445099, -1.05319082736969, -0.6327342987060547, 0.9199618697166443, -0.3809050917625427]'),
(2, 'MediSphere Nurse', '[-0.7043311595916748, -0.40807679295539856, -1.4340128898620605, 0.5211886167526245, 1.8562979698181152, -0.11840973049402237, -0.3285747766494751, 0.6006063222885132, -0.3018779754638672, 0.42197537422180176, 0.9800096154212952, -0.2947205603122711, -0.7376618981361389, -1.5236424207687378, 0.7866824865341187, -0.6994625329971313, 1.6232396364212036, 1.0641776323318481, -0.9792864322662354, -0.4556070566177368, 1.1840704679489136, -0.8867607712745667, -0.4449590742588043, -0.7980095148086548, -0.8171840906143188, -0.9189022779464722, 0.065977081656456, 1.454239845275879, -1.7871229648590088, 1.4304403066635132, 0.6065670251846313, 2.1979310512542725, -1.125661015510559, -0.07550471276044846, 0.4456462264060974, -0.2594965100288391, 0.231137216091156, -2.0379843711853027, 0.8639506101608276, -1.3548225164413452, -0.5018925070762634, 0.3712490499019623, -0.052397385239601135, -0.6790319085121155, 1.3759613037109375, 0.5180458426475525, 1.1453418731689453, -2.1215388774871826, 0.26888227462768555, 1.2340127229690552, -1.2956138849258423, -0.28497156500816345, 1.3163927793502808, -0.9203577637672424, 1.0920346975326538, -0.49338391423225403, -1.23309326171875, -1.1529006958007812, 1.5422929525375366, -1.475129246711731, -0.7642884254455566, 0.3608466386795044, 2.188018321990967, -0.26069778203964233, 0.3804972469806671, -0.35390686988830566, -0.13248541951179504, 0.8879493474960327, -0.005585383623838425, -0.7680656909942627, -0.09500844031572342, 0.2835419774055481, -0.9904420971870422, -0.9766507148742676, -0.5466955900192261, 0.8732677698135376, -0.5804727077484131, -0.19926925003528595, -0.045750245451927185, 0.1054907888174057, 0.13550010323524475, 0.09548740088939667, -1.9645836353302002, -0.17870454490184784, 0.5763803720474243, 0.2867256700992584, -1.9210915565490723, 0.14279980957508087, -1.2177214622497559, 0.17370149493217468, 0.9276789426803589, 1.3943393230438232, -3.00512433052063, 1.6074120998382568, -0.025156639516353607, -0.7247732281684875, -0.09887300431728363, -0.948490560054779, -0.2463068664073944, 1.0914175510406494, -0.0037141479551792145, 0.5682481527328491, 0.0009429529309272766, -2.8879196643829346, -1.1949434280395508, 0.7297852039337158, -0.765140175819397, -0.7888083457946777, -1.1071714162826538, 0.9246572852134705, -0.6275579333305359, 0.9535422325134277, -0.041043780744075775, -0.29502496123313904, 0.9502290487289429, 0.7774022817611694, -0.8235335350036621, -1.1923115253448486, -0.9792253971099854, 1.9424487352371216, -1.0375288724899292, 0.20445646345615387, 2.0776398181915283, -1.043656587600708, -0.8054990768432617, -1.1312528848648071, 1.4549936056137085, -1.2627123594284058]');

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `appointment_id` int(10) NOT NULL,
  `patient_id` int(10) DEFAULT NULL,
  `doctor_id` int(10) DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `booking_method` enum('Online','Walk-in') NOT NULL,
  `status` enum('Pending','Confirmed','Completed','Cancelled') NOT NULL,
  `notes` varchar(255) NOT NULL,
  `meeting_code` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`appointment_id`, `patient_id`, `doctor_id`, `appointment_date`, `appointment_time`, `booking_method`, `status`, `notes`, `meeting_code`) VALUES
(1, 1, 1, '2025-12-29', '11:00:00', 'Online', 'Pending', '', NULL),
(2, 1, 2, '2025-12-28', '19:30:00', 'Online', 'Completed', 'Video Consultation Completed', 'medisphere-6951349b9a659-3546'),
(3, 1, 2, '2025-12-29', '16:30:00', 'Online', 'Completed', 'Video Consultation Completed', 'medisphere-69525cad810b3-7022'),
(4, NULL, 2, '2025-12-30', '16:45:00', 'Walk-in', 'Confirmed', '', NULL),
(5, NULL, 2, '2025-12-30', '16:45:00', 'Walk-in', 'Confirmed', '', NULL),
(6, NULL, 2, '2025-12-30', '16:45:00', 'Walk-in', 'Confirmed', '', NULL),
(7, NULL, 2, '2025-12-30', '16:45:00', 'Walk-in', 'Confirmed', '', NULL),
(8, NULL, 2, '2025-12-30', '16:45:00', 'Walk-in', 'Confirmed', '', NULL),
(9, 2, 1, '2026-01-01', '14:00:00', 'Online', 'Confirmed', 'Booked via Chatbot', 'bot-1767100566.258573'),
(10, 3, 2, '2026-01-01', '14:00:00', 'Online', 'Completed', 'Lorem Ipsum ---- Day\nLorem Ipsum ---- Day\nLorem Ipsum ---- Day\n', 'bot-1767187456.296331'),
(11, 1, 2, '2026-02-04', '20:00:00', 'Walk-in', 'Completed', 'Lorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLo', NULL),
(12, 1, 2, '2026-02-04', '20:10:00', 'Walk-in', 'Completed', 'ty', NULL),
(13, 1, 2, '2026-02-05', '14:54:00', 'Walk-in', 'Completed', 'Nothing to worry', NULL),
(15, 5, 2, '2026-02-15', '18:00:00', 'Online', 'Confirmed', 'Booked via Chatbot', 'bot-1770285821.585063'),
(16, 6, 2, '2026-02-09', '17:00:00', 'Online', 'Confirmed', 'Booked via Chatbot', 'bot-1770286312.248372');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` int(10) NOT NULL,
  `user_id` int(10) DEFAULT NULL,
  `staff_id` int(10) DEFAULT NULL,
  `date` date NOT NULL,
  `check_in_time` time NOT NULL,
  `check_out_time` time NOT NULL,
  `method` enum('Biometric','Manual') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`attendance_id`, `user_id`, `staff_id`, `date`, `check_in_time`, `check_out_time`, `method`) VALUES
(1, 7, 1, '2026-02-05', '15:15:17', '15:15:44', 'Biometric');

-- --------------------------------------------------------

--
-- Table structure for table `beds`
--

CREATE TABLE `beds` (
  `bed_id` int(10) NOT NULL,
  `ward_id` int(10) DEFAULT NULL,
  `bed_number` char(10) NOT NULL,
  `status` enum('Occupied','Free') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `beds`
--

INSERT INTO `beds` (`bed_id`, `ward_id`, `bed_number`, `status`) VALUES
(1, 1, 'GW-01', 'Free'),
(2, 1, 'GW-02', 'Free'),
(3, 2, 'SP-01', 'Free'),
(4, 3, 'PW-01', 'Free'),
(5, 4, 'ICU-01', 'Free'),
(6, 1, 'GW-03', 'Free'),
(7, 4, 'ICU-02', 'Free'),
(8, 4, 'ICU-03', 'Free'),
(9, 4, 'ICU-04', 'Free'),
(10, 4, 'ICU-05', 'Free'),
(11, 4, 'ICU-06', 'Free'),
(12, 4, 'ICU-07', 'Free'),
(13, 4, 'ICU-08', 'Free'),
(14, 4, 'ICU-09', 'Free'),
(15, 4, 'ICU-10', 'Free');

-- --------------------------------------------------------

--
-- Table structure for table `bed_allocations`
--

CREATE TABLE `bed_allocations` (
  `allocation_id` int(10) NOT NULL,
  `bed_id` int(10) DEFAULT NULL,
  `patient_id` int(5) DEFAULT NULL,
  `allocation_date` date NOT NULL,
  `release_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bed_allocations`
--

INSERT INTO `bed_allocations` (`allocation_id`, `bed_id`, `patient_id`, `allocation_date`, `release_date`) VALUES
(1, 1, 1, '2025-12-22', '2026-01-31'),
(2, 1, 1, '2026-02-05', '2026-02-05'),
(3, 2, 1, '2026-02-05', '2026-02-05'),
(4, 1, 5, '2026-02-05', '2026-02-05');

-- --------------------------------------------------------

--
-- Table structure for table `billing`
--

CREATE TABLE `billing` (
  `bill_id` int(10) NOT NULL,
  `patient_id` int(5) DEFAULT NULL,
  `appointment_id` int(10) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('Paid','Pending','Partial') NOT NULL,
  `payment_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `billing`
--

INSERT INTO `billing` (`bill_id`, `patient_id`, `appointment_id`, `total_amount`, `paid_amount`, `payment_status`, `payment_date`) VALUES
(1, 1, NULL, 300.00, 300.00, 'Pending', '2025-12-10'),
(2, 1, 2, 50.00, 0.00, 'Pending', '2025-12-29'),
(3, 1, 3, 50.00, 50.00, 'Paid', '2025-12-29'),
(4, 3, 10, 50.00, 0.00, 'Pending', '2026-01-04'),
(5, 1, 11, 80.00, 0.00, 'Pending', '2026-02-04'),
(6, 1, 12, 80.00, 80.00, 'Paid', '2026-02-04'),
(7, 1, 13, 80.00, 80.00, 'Paid', '2026-02-05'),
(8, 1, NULL, 309.00, 309.00, 'Paid', '2026-02-05'),
(9, 1, NULL, 250.00, 0.00, 'Pending', '2026-02-05'),
(10, 5, NULL, 250.00, 0.00, 'Pending', '2026-02-05');

-- --------------------------------------------------------

--
-- Table structure for table `chatbot_logs`
--

CREATE TABLE `chatbot_logs` (
  `chat_id` int(10) NOT NULL,
  `patient_id` int(5) DEFAULT NULL,
  `user_message` varchar(255) NOT NULL,
  `bot_response` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `disease_predictions`
--

CREATE TABLE `disease_predictions` (
  `prediction_id` int(10) NOT NULL,
  `patient_id` int(5) DEFAULT NULL,
  `symptoms` varchar(255) NOT NULL,
  `predicted_disease` char(255) NOT NULL,
  `confidence_score` decimal(5,2) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `doctor_id` int(10) NOT NULL,
  `user_id` int(10) DEFAULT NULL,
  `specialization` char(30) NOT NULL,
  `department` char(30) NOT NULL,
  `qualification` char(30) NOT NULL,
  `years_of_experience` int(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`doctor_id`, `user_id`, `specialization`, `department`, `qualification`, `years_of_experience`) VALUES
(1, 2, 'General', 'General', 'MBBS', 0),
(2, 4, 'General', 'General', 'MBBS', 0),
(3, 6, 'General', 'General', 'MBBS', 0),
(4, 11, 'General', 'General', 'MBBS', 0);

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `document_id` int(10) NOT NULL,
  `patient_id` int(5) DEFAULT NULL,
  `type` char(30) NOT NULL,
  `file_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`document_id`, `patient_id`, `type`, `file_path`) VALUES
(1, 1, 'Prescription', 'uploads/documents/1770216187_1_prescription.pdf'),
(2, 1, 'Prescription', 'uploads/documents/1770216190_1_prescription.pdf'),
(3, 1, 'Prescription', 'uploads/documents/1770216194_1_prescription.pdf'),
(4, 1, 'Prescription', 'uploads/documents/1770283525_1_prescription.pdf'),
(5, 1, 'Prescription', 'uploads/documents/1770283539_1_prescription.pdf'),
(6, 1, 'Invoices', 'uploads/documents/1770283539_1_invoices.pdf'),
(7, 1, 'Invoices', 'uploads/documents/1770284119_1_invoices.pdf'),
(8, 1, 'Invoices', 'uploads/documents/1770289053_1_invoices.pdf'),
(9, 5, 'Invoices', 'uploads/documents/1770289118_5_invoices.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `donation`
--

CREATE TABLE `donation` (
  `donation_id` int(10) NOT NULL,
  `patient_id` int(5) DEFAULT NULL,
  `donation_type` varchar(3) NOT NULL,
  `donation_amount` int(8) NOT NULL,
  `donation_date` date NOT NULL,
  `received_by` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `insurance_claims`
--

CREATE TABLE `insurance_claims` (
  `claim_id` int(10) NOT NULL,
  `billing_id` int(10) DEFAULT NULL,
  `patient_id` int(5) DEFAULT NULL,
  `insurance_number` varchar(30) NOT NULL,
  `claim_status` enum('Approved','Pending') NOT NULL,
  `claim_amount` decimal(10,2) NOT NULL,
  `processed_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `insurance_claims`
--

INSERT INTO `insurance_claims` (`claim_id`, `billing_id`, `patient_id`, `insurance_number`, `claim_status`, `claim_amount`, `processed_date`) VALUES
(1, NULL, 1, 'POL-123456789', 'Approved', 90000.00, '2026-01-04');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(10) NOT NULL,
  `user_id` int(10) DEFAULT NULL,
  `message` varchar(255) NOT NULL,
  `type` enum('Alert','Reminder') NOT NULL,
  `status` enum('Read','Unread') NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `patient_id` int(5) NOT NULL,
  `user_id` int(10) DEFAULT NULL,
  `blood_group` char(5) NOT NULL,
  `emergency_contact` varchar(10) NOT NULL,
  `insurance_number` varchar(20) NOT NULL,
  `medical_history` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`patient_id`, `user_id`, `blood_group`, `emergency_contact`, `insurance_number`, `medical_history`) VALUES
(1, 1, 'N/A', 'N/A', 'N/A', 'None'),
(2, 8, 'N/A', '2468097531', 'N/A', 'None'),
(3, 9, 'N/A', '1234974087', 'N/A', 'None'),
(5, 13, 'N/A', '6282023743', 'N/A', 'Registration via AI Bot'),
(6, 14, 'N/A', '8229288222', 'N/A', 'Registration via AI Bot');

-- --------------------------------------------------------

--
-- Table structure for table `receptionist`
--

CREATE TABLE `receptionist` (
  `reception_id` int(10) NOT NULL,
  `user_id` int(10) DEFAULT NULL,
  `shift` enum('Morning','Evening','Night') NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `receptionist`
--

INSERT INTO `receptionist` (`reception_id`, `user_id`, `shift`, `created_at`) VALUES
(1, 5, 'Morning', '2025-12-21 19:05:37'),
(2, 10, 'Morning', '2026-02-05 10:18:20');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `report_id` int(10) NOT NULL,
  `patient_id` int(5) DEFAULT NULL,
  `doctor_id` int(10) DEFAULT NULL,
  `report_type` char(30) NOT NULL,
  `report_file` varchar(255) NOT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(5) NOT NULL,
  `role_name` char(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'Admin'),
(2, 'Doctor'),
(3, 'Patient'),
(4, 'Receptionist'),
(5, 'Staff');

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `staff_id` int(10) NOT NULL,
  `user_id` int(10) DEFAULT NULL,
  `designation` char(30) NOT NULL,
  `shift` enum('Day','Night') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`staff_id`, `user_id`, `designation`, `shift`) VALUES
(1, 7, 'Nurse', 'Day');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(10) NOT NULL,
  `role_id` int(5) DEFAULT NULL,
  `admin_id` int(10) DEFAULT NULL,
  `first_name` char(20) NOT NULL,
  `last_name` char(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `dob` date NOT NULL,
  `address` varchar(100) NOT NULL,
  `created_at` date NOT NULL,
  `status` enum('Active','Inactive') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `role_id`, `admin_id`, `first_name`, `last_name`, `email`, `phone`, `password`, `gender`, `dob`, `address`, `created_at`, `status`) VALUES
(1, 3, NULL, 'Dhairya', 'Amin', 'amindhairya1@gmail.com', '7859908889', '$2y$10$yec4W40tZojVlDpaZRgQReKKDOOZyPRm/ElmP8hdcbgg2wv6Xcv3O', 'Male', '2006-11-23', 'AHMEDABAD', '2025-12-09', 'Active'),
(2, 2, NULL, 'Doctor', 'Patel', 'docter@medisphere.com', '1234567890', '$2y$10$yec4W40tZojVlDpaZRgQReKKDOOZyPRm/ElmP8hdcbgg2wv6Xcv3O', 'Male', '1984-05-31', 'DELHI', '2025-12-09', 'Inactive'),
(3, 1, NULL, 'System', 'Admin', 'admin@medisphere.com', '0000000000', '$2y$10$314NFdY9z/1eFNSPqw5qc.NKzjOFbgf29jMEh546cfFpmcIZkiuV6', 'Other', '2000-01-01', 'Admin HQ', '2025-12-09', 'Active'),
(4, 2, NULL, 'Dhairya', 'Amin', 'doctor2@medisphere.com', '10101010', '$2y$10$vtE16iLV9uXuViV1DVtVhOEgTzKYw/S9bJXLC5SUPC51s2oMdGzzm', 'Male', '1979-08-22', '123 Colony\nState', '2025-12-20', 'Active'),
(5, 4, NULL, 'MediSphere', 'Receptionist', 'receptionist@medisphere.com', '9889382828', '$2y$10$CHREduZF2s8ImuDObv44AeOlTHhMwdZ4j1ljZVoTsKwrrlOHUtNS2', 'Female', '2025-12-14', 'Gandhinagar, Gujarat', '2025-12-21', 'Active'),
(6, 2, NULL, 'jatin', 'basantani', 'jatinbasantani861@gmail.com', '5272347323', '$2y$10$Wk/IZUsLO5q/Jtq.FDTxRu7omhc/WxSjESteim4xDnMpMGS6pdxR6', 'Male', '1988-05-22', 'ind', '2025-12-22', 'Active'),
(7, 5, NULL, 'MediSphere', 'Nurse', 'nurse@medisphere.com', '9889382828', '$2y$10$bNn1zM9UQd1cIh69U1QdeumjRGZKa8ybI302isAKb1lBEoMvaydgK', 'Female', '0000-00-00', '12 India', '2025-12-29', 'Active'),
(8, 3, NULL, 'john', 'doe', 'johndoe@gmail.com', '2468097531', 'Password123', 'Other', '2000-01-01', 'Online Bot User', '2025-12-30', 'Active'),
(9, 3, NULL, 'john', '', 'ami@gmail.com', '1234974087', 'Password123', 'Other', '2000-01-01', 'Online Bot User', '2025-12-31', 'Active'),
(10, 4, NULL, 'jatin', 'basantani', 'abc@medisphere.com', '7829260423', '$2y$10$peI8LRIxN30/RoDadQAFV.RufESrPULhZhxrxhE5ZmCgtNGCWls3a', 'Male', '2026-01-28', 'india', '2026-02-05', 'Active'),
(11, 2, NULL, 'jatin', 'basantani', 'abc@gmail.com', '9889382828', '$2y$10$umhjKdC01FsEMQSMIuPA0eywVUD7.7CL5Pk/5ScAhDJsoN8kJ.F3a', 'Male', '2026-02-03', 'INDIA', '2026-02-05', 'Active'),
(13, 3, NULL, 'kavan', 'chavda', 'kavan@gmail.com', '6282023743', '$2b$12$SG7xTuGKB9MamsRLJWjBdufv/dqOkOBVDXON/82F7KeIAft4IbBp.', 'Other', '2000-01-01', 'Online Registration', '2026-02-05', 'Active'),
(14, 3, NULL, 'jwalant', 'bhatt', 'jwala@mail.com', '8229288222', '$2b$12$Rscxme4Xn6lmXqLBgDg2DunzQAsFMzp0wdX9xlb/EBgyrxWi3YrKe', 'Other', '2000-01-01', 'Online Registration', '2026-02-05', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `visitors`
--

CREATE TABLE `visitors` (
  `visitor_id` int(10) NOT NULL,
  `patient_id` int(5) DEFAULT NULL,
  `visitor_name` char(50) NOT NULL,
  `relation` char(50) NOT NULL,
  `entry_time` datetime NOT NULL,
  `exit_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `visitors`
--

INSERT INTO `visitors` (`visitor_id`, `patient_id`, `visitor_name`, `relation`, `entry_time`, `exit_time`) VALUES
(1, 1, 'Brother', 'Family', '2025-12-29 12:22:41', '2026-01-04 08:11:19');

-- --------------------------------------------------------

--
-- Table structure for table `wards`
--

CREATE TABLE `wards` (
  `ward_id` int(10) NOT NULL,
  `ward_name` char(30) NOT NULL,
  `capacity` int(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wards`
--

INSERT INTO `wards` (`ward_id`, `ward_name`, `capacity`) VALUES
(1, 'General Ward', 50),
(2, 'Semi-Private Ward', 20),
(3, 'Private Ward', 10),
(4, 'ICU', 10);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `ai_attendance_logs`
--
ALTER TABLE `ai_attendance_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ai_faces`
--
ALTER TABLE `ai_faces`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`appointment_id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `beds`
--
ALTER TABLE `beds`
  ADD PRIMARY KEY (`bed_id`),
  ADD KEY `ward_id` (`ward_id`);

--
-- Indexes for table `bed_allocations`
--
ALTER TABLE `bed_allocations`
  ADD PRIMARY KEY (`allocation_id`),
  ADD KEY `bed_id` (`bed_id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `billing`
--
ALTER TABLE `billing`
  ADD PRIMARY KEY (`bill_id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `appointment_id` (`appointment_id`);

--
-- Indexes for table `chatbot_logs`
--
ALTER TABLE `chatbot_logs`
  ADD PRIMARY KEY (`chat_id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `disease_predictions`
--
ALTER TABLE `disease_predictions`
  ADD PRIMARY KEY (`prediction_id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`doctor_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `donation`
--
ALTER TABLE `donation`
  ADD PRIMARY KEY (`donation_id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `insurance_claims`
--
ALTER TABLE `insurance_claims`
  ADD PRIMARY KEY (`claim_id`),
  ADD KEY `billing_id` (`billing_id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`patient_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `receptionist`
--
ALTER TABLE `receptionist`
  ADD PRIMARY KEY (`reception_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`staff_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `visitors`
--
ALTER TABLE `visitors`
  ADD PRIMARY KEY (`visitor_id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `wards`
--
ALTER TABLE `wards`
  ADD PRIMARY KEY (`ward_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ai_attendance_logs`
--
ALTER TABLE `ai_attendance_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `ai_faces`
--
ALTER TABLE `ai_faces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `appointment_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `beds`
--
ALTER TABLE `beds`
  MODIFY `bed_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `bed_allocations`
--
ALTER TABLE `bed_allocations`
  MODIFY `allocation_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `billing`
--
ALTER TABLE `billing`
  MODIFY `bill_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `chatbot_logs`
--
ALTER TABLE `chatbot_logs`
  MODIFY `chat_id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `disease_predictions`
--
ALTER TABLE `disease_predictions`
  MODIFY `prediction_id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `doctor_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `document_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `donation`
--
ALTER TABLE `donation`
  MODIFY `donation_id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `insurance_claims`
--
ALTER TABLE `insurance_claims`
  MODIFY `claim_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `patient_id` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `receptionist`
--
ALTER TABLE `receptionist`
  MODIFY `reception_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `report_id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `staff_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `visitors`
--
ALTER TABLE `visitors`
  MODIFY `visitor_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `wards`
--
ALTER TABLE `wards`
  MODIFY `ward_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`),
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`);

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`);

--
-- Constraints for table `beds`
--
ALTER TABLE `beds`
  ADD CONSTRAINT `beds_ibfk_1` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`ward_id`);

--
-- Constraints for table `bed_allocations`
--
ALTER TABLE `bed_allocations`
  ADD CONSTRAINT `bed_allocations_ibfk_1` FOREIGN KEY (`bed_id`) REFERENCES `beds` (`bed_id`),
  ADD CONSTRAINT `bed_allocations_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`);

--
-- Constraints for table `billing`
--
ALTER TABLE `billing`
  ADD CONSTRAINT `billing_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`),
  ADD CONSTRAINT `billing_ibfk_2` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`);

--
-- Constraints for table `chatbot_logs`
--
ALTER TABLE `chatbot_logs`
  ADD CONSTRAINT `chatbot_logs_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`);

--
-- Constraints for table `disease_predictions`
--
ALTER TABLE `disease_predictions`
  ADD CONSTRAINT `disease_predictions_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`);

--
-- Constraints for table `doctors`
--
ALTER TABLE `doctors`
  ADD CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`);

--
-- Constraints for table `donation`
--
ALTER TABLE `donation`
  ADD CONSTRAINT `donation_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`);

--
-- Constraints for table `insurance_claims`
--
ALTER TABLE `insurance_claims`
  ADD CONSTRAINT `insurance_claims_ibfk_1` FOREIGN KEY (`billing_id`) REFERENCES `billing` (`bill_id`),
  ADD CONSTRAINT `insurance_claims_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `receptionist`
--
ALTER TABLE `receptionist`
  ADD CONSTRAINT `receptionist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`),
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`);

--
-- Constraints for table `staff`
--
ALTER TABLE `staff`
  ADD CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`admin_id`);

--
-- Constraints for table `visitors`
--
ALTER TABLE `visitors`
  ADD CONSTRAINT `visitors_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
