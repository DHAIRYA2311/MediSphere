-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 21, 2026 at 11:23 AM
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
  `face_id` int(10) NOT NULL,
  `user_id` int(10) NOT NULL,
  `embedding` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`embedding`)),
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ai_faces`
--

INSERT INTO `ai_faces` (`face_id`, `user_id`, `embedding`, `created_at`) VALUES
(1, 7, '[-0.14109863340854645, -0.25761979818344116, -0.38256606459617615, -0.35660040378570557, 0.36749374866485596, 0.10645981878042221, 0.16345788538455963, -0.16701960563659668, 0.08206607401371002, 0.09340901672840118, 0.3715634346008301, -0.3346172273159027, -0.06553719192743301, -0.670120358467102, 0.10863697528839111, 0.4235575199127197, 0.303127646446228, -0.12294356524944305, 0.24135378003120422, -0.5050620436668396, -0.03872591257095337, 0.12547236680984497, -0.371515691280365, -0.07664791494607925, 0.0658038780093193, -0.15100663900375366, 0.4940085709095001, 0.2417626678943634, -0.4486698508262634, -0.029547303915023804, -0.10647948086261749, 0.35226431488990784, 0.22799193859100342, -0.17955341935157776, 0.5911813378334045, -0.3627459704875946, 0.26375824213027954, 0.02307986468076706, 0.5328124761581421, -0.07688994705677032, 0.2260577529668808, 0.08470337092876434, -0.27855247259140015, -0.25990137457847595, -0.3317091166973114, -0.615603506565094, 0.12726514041423798, -0.02807603031396866, 0.40008705854415894, 0.35283535718917847, -0.4101185202598572, 0.2388145476579666, 0.32131892442703247, -0.2192152440547943, 0.23999378085136414, 0.2818329334259033, 0.42334797978401184, 0.17179013788700104, -0.23551827669143677, -0.944996178150177, -0.23646867275238037, -0.2978280186653137, -0.11080518364906311, 0.8873864412307739, 0.2762252390384674, 0.45635634660720825, 0.30948910117149353, 0.09647379070520401, 0.14990389347076416, -0.41870495676994324, -0.053921449929475784, -0.586552619934082, 0.11971329152584076, -0.4738031029701233, -0.12997384369373322, -0.1495506912469864, -0.14381107687950134, 0.43348801136016846, -0.2515433728694916, -0.3288642168045044, -0.5461804866790771, -0.2853664457798004, 0.019275762140750885, 0.2659837007522583, 0.4896215498447418, 0.047595731914043427, 0.44361743330955505, -0.19929245114326477, -0.7094835042953491, 0.6330347061157227, 0.2471925914287567, 0.11554256826639175, -0.22133909165859222, -0.00876658782362938, 0.420146644115448, 0.06837595254182816, -0.1113593578338623, -0.47316816449165344, -0.8020859360694885, 0.08548998832702637, -0.4193171262741089, 0.7090322375297546, 0.12754063308238983, -0.3691868782043457, 0.09220116585493088, 0.21232306957244873, -0.1425628364086151, -0.020731940865516663, -0.16001097857952118, -0.3322078287601471, -0.038900651037693024, 0.2772262692451477, 0.3066945970058441, 0.4804333448410034, -0.29499781131744385, 0.2436082363128662, -0.012793936766684055, 0.26577404141426086, 0.2536925971508026, 0.28697314858436584, -0.3173975944519043, -0.04302549734711647, 0.4751250743865967, 0.17323383688926697, 0.4096689224243164, -0.5397613644599915, 0.2603115737438202, 0.10742557048797607]', '2026-02-06 10:31:04'),
(3, 5, '[-0.5346943140029907, -0.09496371448040009, -0.4020635485649109, 0.4020444452762604, -0.8728551268577576, 2.8935258388519287, -0.41328519582748413, -0.9374332427978516, 0.3983007073402405, 0.6852407455444336, -0.9873181581497192, -2.099545955657959, -0.7952432036399841, 0.15594200789928436, -0.4972173869609833, -0.327666699886322, 1.1601452827453613, -0.4094436764717102, -0.5522292852401733, -0.5623572468757629, 0.4895082414150238, 0.4714847803115845, 0.8993673920631409, 0.4005091190338135, -0.9178391098976135, -0.36964279413223267, -1.7479857206344604, -1.659047245979309, -0.44653016328811646, 0.2845957577228546, 1.5389692783355713, -1.6919410228729248, -0.9508713483810425, 0.47087645530700684, 1.8001703023910522, -0.05560757964849472, 0.7307409644126892, 0.4937382638454437, 1.9080395698547363, -0.6233975887298584, -0.23806843161582947, 1.0633782148361206, 1.7228251695632935, 0.3243615925312042, 1.1604708433151245, 0.8711722493171692, 1.0431408882141113, 0.043007057160139084, 0.09762069582939148, 0.43882593512535095, -0.20471589267253876, -0.37968769669532776, -0.76949143409729, -1.1514376401901245, -0.8258211016654968, -0.030288090929389, 0.5849573612213135, 0.2542647421360016, -1.4467859268188477, -1.193144679069519, 0.7639814615249634, 0.4447872042655945, 0.4305417835712433, 1.669613003730774, -1.223429560661316, 1.0913037061691284, -0.22053420543670654, 0.218898206949234, 0.8721266984939575, -1.146576166152954, 1.3039110898971558, 0.04939679801464081, -0.48813581466674805, -2.079224109649658, 1.372939944267273, 0.9366553425788879, -1.4373061656951904, 0.15394243597984314, -0.2476397156715393, 0.6760342121124268, 0.00953098013997078, 0.10502848774194717, 0.9637922048568726, 1.1355922222137451, -1.130928635597229, 0.3226448595523834, 0.3587593734264374, 0.5608624815940857, -1.8715319633483887, -1.5072393417358398, 0.9518461227416992, -0.10032714903354645, -0.1148192435503006, 2.64595890045166, 0.8279515504837036, 1.5961860418319702, -1.114035964012146, 0.5068696141242981, -1.370016098022461, 0.6218587756156921, 0.281990110874176, 0.552301824092865, -1.3817346096038818, 0.6069929599761963, -1.3919000625610352, -1.8307511806488037, -1.58292818069458, -0.4079589545726776, -1.0313080549240112, -1.2050526142120361, -0.6224272847175598, -0.6515628099441528, 1.035629391670227, 1.155287265777588, -2.5808029174804688, 0.1313648372888565, -0.014336274936795235, -0.24344667792320251, -2.3725876808166504, 0.3159063160419464, -0.6306900978088379, -0.8929815292358398, 1.8775972127914429, -1.2328089475631714, -1.3708879947662354, -1.736336350440979, 0.8613883256912231, -1.7449010610580444]', '2026-02-06 10:35:43'),
(4, 10, '[-0.049361929297447205, -0.1793595403432846, -1.1193866729736328, -0.44612857699394226, 0.5765715837478638, -0.009620660915970802, 0.16074974834918976, 0.09425638616085052, 0.13104641437530518, 0.24304881691932678, 0.5620443820953369, -0.41231364011764526, -0.3189844489097595, -1.5021979808807373, 0.19954103231430054, 0.4598926901817322, 0.4355519115924835, 0.02201223373413086, 0.20799416303634644, -0.9877898693084717, -0.11562003940343857, 0.36879289150238037, -0.5858228802680969, 0.07547295093536377, -0.07171441614627838, -0.3785167932510376, -0.008180658333003521, 0.16782650351524353, -0.5803773999214172, 0.3904349207878113, 0.46328791975975037, 0.2226482778787613, 0.6405669450759888, -0.4772973358631134, 0.8422603607177734, -0.4763215482234955, 0.5055252909660339, -0.1830495297908783, 0.776776134967804, -0.5544393062591553, -0.08969360589981079, 0.5424638986587524, -0.08179490268230438, -0.30457547307014465, 0.13828586041927338, -0.6585144996643066, 0.1562049835920334, -0.22563375532627106, 0.33938068151474, 0.7342938184738159, -0.23605407774448395, -0.004055719822645187, 0.32263872027397156, -0.7926068902015686, -0.057715099304914474, 0.7886213064193726, 0.31240856647491455, -0.023632459342479706, -0.17688192427158356, -1.128790020942688, -0.2906588017940521, -0.4893380403518677, -0.146622434258461, 0.9355105757713318, 0.5363829731941223, 0.23677079379558563, 0.09693435579538345, 0.07092282176017761, -0.06506473571062088, -0.9701906442642212, 0.47767266631126404, -0.8229715824127197, -0.3714085519313812, -0.948717474937439, 0.36638984084129333, -0.2524605095386505, -0.29674655199050903, 0.886039674282074, -0.5418983101844788, -0.3414900004863739, -0.493388831615448, -0.0056863706558942795, -0.4202643036842346, 0.00011657923460006714, 0.45586052536964417, -0.32273662090301514, 0.06658371537923813, -0.06299737095832825, -1.1716161966323853, 0.5650891661643982, 0.0638989731669426, 0.3025599420070648, -0.7846474051475525, 0.45753124356269836, 0.22623014450073242, -0.28407421708106995, -0.6384871602058411, -0.7648248672485352, -1.1739163398742676, 0.2543383538722992, -0.3963276147842407, 0.5498437881469727, 0.4887324273586273, -1.0779304504394531, -0.4651522934436798, 0.08366018533706665, -0.08106543123722076, -0.43500497937202454, -0.4053291976451874, -0.07801482081413269, -0.2737462818622589, 0.5812815427780151, 0.32579994201660156, 0.6577439308166504, -0.09734249860048294, 0.3026462495326996, 0.342840313911438, -0.18447208404541016, -0.26396164298057556, 1.1061949729919434, -0.24520720541477203, -0.5076398849487305, 1.0089129209518433, 0.5236741304397583, 0.1977146565914154, -1.010466456413269, 0.0163738876581192, -0.11234278976917267]', '2026-02-06 10:42:42'),
(5, 3, '[0.542893648147583, -0.36169666051864624, -0.2797662019729614, -0.48968949913978577, 1.514014720916748, 0.35654252767562866, -0.5477534532546997, 1.6021342277526855, 0.020164810121059418, 0.5552371740341187, -1.2162644863128662, -0.04023827612400055, 0.3609384298324585, -0.9713773727416992, 0.3691443204879761, -0.07895663380622864, 1.2729299068450928, 0.6248489618301392, 0.7396572828292847, -0.8684636950492859, 0.24943682551383972, 1.6340060234069824, -1.3371131420135498, 0.17650999128818512, -0.02967541664838791, -0.10943546146154404, -0.17258158326148987, 0.8303426504135132, 0.3970375657081604, 1.637813687324524, -0.05024160444736481, 0.9306671023368835, 0.4160032272338867, -0.7412588000297546, 0.7587341070175171, 0.5631072521209717, -0.39628368616104126, -1.6021777391433716, -0.07103130221366882, -0.8637850284576416, -0.5794788599014282, -0.015736175701022148, 0.3899788558483124, 0.4327889084815979, 1.8971312046051025, 0.362769216299057, 0.6516796350479126, -2.250840425491333, -1.188581943511963, -0.03238998353481293, -1.8177478313446045, 0.7035003304481506, -0.33482280373573303, -1.2979824542999268, -0.34674280881881714, -0.6035915017127991, -0.015150301158428192, -0.6612837910652161, 0.5224276781082153, -1.8738343715667725, -1.6046860218048096, -0.8573544025421143, 2.1626315116882324, -1.042745590209961, -0.903307318687439, -0.6346644759178162, 0.33456772565841675, 0.02450362592935562, -0.05328422784805298, -2.230555534362793, 1.6435703039169312, -1.2510426044464111, -1.8687472343444824, -0.3483721613883972, 0.7584565877914429, -0.05907453969120979, -1.3641804456710815, -0.43665143847465515, 1.107107162475586, 0.437122106552124, 2.6924784183502197, -0.19337013363838196, -1.9714961051940918, -0.28184273838996887, 0.8581511378288269, 0.00524304062128067, -1.3615100383758545, 0.7537049651145935, -0.9586809873580933, 0.4976158142089844, -0.5628082156181335, 1.6882061958312988, -1.6486172676086426, 0.4912140667438507, -1.5412142276763916, 0.1041523739695549, -1.6630282402038574, -1.7491493225097656, -0.7029336094856262, 1.2669591903686523, -0.7450927495956421, 0.7598512768745422, 0.05790024623274803, -3.3836116790771484, -2.7679569721221924, 0.08408256620168686, -1.8672585487365723, -1.8343262672424316, -0.716001033782959, 1.3183960914611816, -1.225140929222107, 1.1464319229125977, 0.42896878719329834, -0.21818053722381592, 1.796651840209961, -0.7371171712875366, -0.2952382564544678, -1.6168116331100464, 0.2338002324104309, 1.4671796560287476, -0.5717617273330688, 0.13361358642578125, 1.059440016746521, 0.10290587693452835, 0.6988159418106079, 0.6709515452384949, 1.9525939226150513, -0.45762526988983154]', '2026-02-21 15:42:02');

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
(16, 6, 2, '2026-02-09', '17:00:00', 'Online', 'Confirmed', 'Booked via Chatbot', 'bot-1770286312.248372'),
(17, 7, 2, '2026-02-06', '10:00:00', 'Online', 'Confirmed', '', NULL),
(18, 8, 2, '2026-02-07', '11:50:00', 'Online', 'Confirmed', '', NULL),
(19, 1, 2, '2026-02-06', '12:00:00', 'Walk-in', 'Completed', ' - Admitted to Ward', NULL),
(20, 6, 2, '2026-02-15', '12:00:00', 'Walk-in', 'Completed', 'We gave some medicines if nothing looks perfect visist in 2 days\n\nMedicines are as follows\n1. Lorem Ipsum - Morning (Before Breakfast)\n', NULL);

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
(1, 7, 1, '2026-02-05', '15:15:17', '15:15:44', 'Biometric'),
(2, 7, 1, '2026-02-06', '10:31:24', '10:31:50', 'Biometric'),
(3, 5, NULL, '2026-02-06', '10:35:47', '10:36:06', 'Biometric'),
(4, 10, NULL, '2026-02-15', '12:42:55', '12:43:04', 'Biometric'),
(5, 7, 1, '2026-02-15', '12:58:35', '00:00:00', 'Biometric'),
(6, 3, NULL, '2026-02-21', '15:42:09', '00:00:00', 'Biometric');

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
(2, 1, 'GW-02', 'Occupied'),
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
(4, 1, 5, '2026-02-05', '2026-02-05'),
(5, 2, 1, '2026-02-15', '2026-02-22');

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
(1, 1, NULL, 300.00, 0.00, 'Pending', '2025-12-10'),
(2, 1, 2, 50.00, 0.00, 'Pending', '2025-12-29'),
(3, 1, 3, 50.00, 50.00, 'Paid', '2025-12-29'),
(4, 3, 10, 50.00, 0.00, 'Pending', '2026-01-04'),
(5, 1, 11, 80.00, 0.00, 'Pending', '2026-02-04'),
(6, 1, 12, 80.00, 80.00, 'Paid', '2026-02-04'),
(7, 1, 13, 80.00, 80.00, 'Paid', '2026-02-05'),
(8, 1, NULL, 309.00, 309.00, 'Paid', '2026-02-05'),
(9, 1, NULL, 250.00, 0.00, 'Pending', '2026-02-05'),
(10, 5, NULL, 250.00, 0.00, 'Pending', '2026-02-05'),
(11, 6, 20, 80.00, 80.00, 'Paid', '2026-02-15'),
(12, 1, 19, 500.00, 0.00, 'Pending', '2026-02-15'),
(13, 1, NULL, 90.00, 0.00, 'Pending', '2026-02-15');

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
(9, 5, 'Invoices', 'uploads/documents/1770289118_5_invoices.pdf'),
(10, 6, 'Invoices', 'uploads/documents/1771136538_6_invoices.pdf'),
(11, 6, 'Prescription', 'uploads/documents/1771136538_6_prescription.pdf');

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
  `blood_group` char(5) NOT NULL DEFAULT 'O+',
  `emergency_contact` varchar(20) NOT NULL,
  `insurance_number` varchar(50) NOT NULL,
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
(6, 14, 'N/A', '8229288222', 'N/A', 'Registration via AI Bot'),
(7, 15, 'O+', '7354499999', '', ''),
(8, 16, 'O+', '5555599999', '', '');

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
(14, 3, NULL, 'jwalant', 'bhatt', 'jwala@mail.com', '8229288222', '$2b$12$Rscxme4Xn6lmXqLBgDg2DunzQAsFMzp0wdX9xlb/EBgyrxWi3YrKe', 'Other', '2000-01-01', 'Online Registration', '2026-02-05', 'Active'),
(15, 3, NULL, 'Rishabh', 'Chawla', 'ris@gmail.com', '7354499999', '$2y$10$GxmkiXD3ZWhuobdp28rs6e0XdqMjWZT3mEsAWc4zzOceraQwaF.BS', 'Male', '2026-02-06', 'Ahmedabad, Gujarat', '2026-02-06', 'Active'),
(16, 3, NULL, 'Aaryan', 'Thakkar', 'at@gmail.com', '5555599999', '$2y$10$Xlo4uEMcZ82hXyuByLmQJ.opOqxoQ9l4UVj9gK5RuOIj9spt6XDEm', 'Male', '2026-02-06', 'INDIA', '2026-02-06', 'Active');

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
  ADD PRIMARY KEY (`face_id`),
  ADD KEY `user_id` (`user_id`);

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
  MODIFY `face_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `appointment_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `beds`
--
ALTER TABLE `beds`
  MODIFY `bed_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `bed_allocations`
--
ALTER TABLE `bed_allocations`
  MODIFY `allocation_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `billing`
--
ALTER TABLE `billing`
  MODIFY `bill_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
  MODIFY `document_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
  MODIFY `patient_id` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  MODIFY `user_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

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
-- Constraints for table `ai_faces`
--
ALTER TABLE `ai_faces`
  ADD CONSTRAINT `ai_faces_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

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
