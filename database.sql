CREATE DATABASE IF NOT EXISTS medisphere_shms;
USE medisphere_shms;

CREATE TABLE IF NOT EXISTS Admin (
    admin_id INTEGER(10) PRIMARY KEY,
    username CHAR(20) NOT NULL,
    password VARCHAR(20) NOT NULL,
    status ENUM ('active', 'inactive') NOT NULL
);

CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER(10) PRIMARY KEY,
    role_id INTEGER(5),
    admin_id INTEGER(10),
    first_name CHAR(20) NOT NULL,
    last_name CHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(20) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    dob DATE NOT NULL,
    address VARCHAR(100) NOT NULL,
    created_at DATE NOT NULL,
    status ENUM('Active', 'Inactive') NOT NULL,

    FOREIGN KEY (role_id) REFERENCES Roles(role_id),
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id)
);

CREATE TABLE IF NOT EXISTS Roles (
    role_id INTEGER(5) PRIMARY KEY,
    role_name CHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS Patients (
    patient_id INTEGER(5) PRIMARY KEY,
    user_id INTEGER(5),
    blood_group CHAR(5) NOT NULL,
    emergency_contact VARCHAR(10) NOT NULL,
    insurance_number VARCHAR(20) NOT NULL,
    medical_history VARCHAR(255) NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS Doctors (
    doctor_id INTEGER(10) PRIMARY KEY,
    user_id INT(10),
    specialization CHAR(30) NOT NULL,
    department CHAR(30) NOT NULL,
    qualification CHAR(30) NOT NULL,
    years_of_experience INTEGER(2) NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS Staff (
    staff_id INTEGER(10) PRIMARY KEY,
    user_id INTEGER(10),
    designation CHAR(30) NOT NULL,
    shift ENUM('Day', 'Night') NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS Attendance(
    attendance_id INTEGER(10) PRIMARY KEY,
    user_id INTEGER(10),
    staff_id INTEGER(10),
    date DATE NOT NULL,
    check_in_time TIME NOT NULL,
    check_out_time TIME NOT NULL,
    method ENUM('Biometric', 'Manual') NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id)
);

CREATE TABLE IF NOT EXISTS Appointments (
    appointment_id INTEGER(10) PRIMARY KEY,
    patient_id INTEGER(10),
    doctor_id INTEGER(10),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    booking_method ENUM('Online', 'Walk-in') NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') NOT NULL,
    notes VARCHAR(255) NOT NULL,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
);

CREATE TABLE IF NOT EXISTS Billing (
    bill_id INTEGER(10) PRIMARY KEY,
    patient_id INTEGER(10),
    appointment_id INTEGER(10),
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('Paid', 'Pending', 'Partial') NOT NULL,
    payment_date DATE NOT NULL,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id)
);

CREATE TABLE IF NOT EXISTS Insurance_Claims  (
    claim_id INTEGER(10) PRIMARY KEY,
    billing_id INTEGER(10),
    patient_id INTEGER(10),
    insurance_number VARCHAR(30) NOT NULL,
    claim_status ENUM('Approved', 'Pending') NOT NULL,
    claim_amount DECIMAL(10,2) NOT NULL,
    processed_date DATE NOT NULL,

    FOREIGN KEY (billing_id) REFERENCES Billing(bill_id),
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id)
);

CREATE TABLE IF NOT EXISTS Reports (
    report_id INTEGER(10) PRIMARY KEY,
    patient_id INTEGER(10),
    doctor_id INTEGER(10),
    report_type CHAR(30) NOT NULL,
    report_file VARCHAR(255) NOT NULL,
    created_at DATE NOT NULL,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
);

CREATE TABLE IF NOT EXISTS Documents (
    document_id INTEGER(10) PRIMARY KEY,
    patient_id INTEGER(10),
    type CHAR(30) NOT NULL,
    file_path VARCHAR(255) NOT NULL,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id)
);

CREATE TABLE IF NOT EXISTS Wards (
    ward_id INTEGER(10) PRIMARY KEY,
    ward_name CHAR(30) NOT NULL,
    capacity INTEGER(5) NOT NULL
);

CREATE TABLE IF NOT EXISTS Beds (
    bed_id INTEGER(10) PRIMARY KEY,
    ward_id INTEGER(10),
    bed_number CHAR(10) NOT NULL,
    status ENUM('Occupied', 'Free') NOT NULL,

    FOREIGN KEY (ward_id) REFERENCES Wards(ward_id)
);

CREATE TABLE IF NOT EXISTS Bed_Allocations (
    allocation_id INTEGER(10) PRIMARY KEY,
    bed_id INTEGER(10),
    patient_id INTEGER(10),
    allocation_date DATE NOT NULL,
    release_date DATE NOT NULL,

    FOREIGN KEY (bed_id) REFERENCES Beds(bed_id),
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id)
);

CREATE TABLE IF NOT EXISTS Visitors (
    visitor_id INTEGER(10) PRIMARY KEY,
    patient_id INTEGER(10),
    visitor_name CHAR(50) NOT NULL,
    relation CHAR(50) NOT NULL,
    entry_time DATETIME NOT NULL,
    exit_time DATETIME NOT NULL,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id)
);

CREATE TABLE IF NOT EXISTS  Disease_Predictions (
    prediction_id INTEGER(10) PRIMARY KEY,
    patient_id INTEGER(10),
    symptoms VARCHAR(255) NOT NULL,
    predicted_disease CHAR(255) NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    created_at DATETIME NOT NULL,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id)
);

CREATE TABLE IF NOT EXISTS Chatbot_Logs (
    notification_id INTEGER(10) PRIMARY KEY,
    user_id INTEGER(10),
    message VARCHAR(255) NOT NULL,
    type ENUM('Alert', 'Reminder') NOT NULL,
    status ENUM('Read', 'Unread') NOT NULL,
    created_at DATETIME NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS Donation (
    donation_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    patient_id INTEGER(10) NULL,
    donation_type VARCHAR(3) NOT NULL,
    donation_amount INTEGER(8) NOT NULL,
    donation_date DATE NOT NULL,
    received_by VARCHAR(50) NOT NULL,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Receptionist (
    reception_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER(10),
    shift ENUM('Morning','Evening','Night') NOT NULL,
    created_at DATETIME NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);
