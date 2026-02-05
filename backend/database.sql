CREATE DATABASE IF NOT EXISTS medisphere_shms;
USE medisphere_shms;

CREATE TABLE Admin (
    admin_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    username CHAR(20) NOT NULL,
    password VARCHAR(20) NOT NULL,
    status ENUM ('Active', 'Inactive') NOT NULL
);

CREATE TABLE Roles (
    role_id INTEGER(5) PRIMARY KEY AUTO_INCREMENT,
    role_name CHAR(20) NOT NULL
);

CREATE TABLE Users (
    user_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    role_id INTEGER(5),
    admin_id INTEGER(10),
    first_name CHAR(20) NOT NULL,
    last_name CHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    dob DATE NOT NULL,
    address VARCHAR(100) NOT NULL,
    created_at DATE NOT NULL,
    status ENUM('Active', 'Inactive') NOT NULL,

    FOREIGN KEY (role_id) REFERENCES Roles(role_id),
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id)
);

CREATE TABLE Patients (
    patient_id INTEGER(5) PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER(10),
    blood_group CHAR(5) NOT NULL,
    emergency_contact VARCHAR(10) NOT NULL,
    insurance_number VARCHAR(20) NOT NULL,
    medical_history VARCHAR(255) NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Doctors (
    doctor_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER(10),
    specialization CHAR(30) NOT NULL,
    department CHAR(30) NOT NULL,
    qualification CHAR(30) NOT NULL,
    years_of_experience INTEGER(2) NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Staff (
    staff_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER(10),
    designation CHAR(30) NOT NULL,
    shift ENUM('Day', 'Night') NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Attendance (
    attendance_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER(10),
    staff_id INTEGER(10),
    date DATE NOT NULL,
    check_in_time TIME NOT NULL,
    check_out_time TIME NOT NULL,
    method ENUM('Biometric', 'Manual') NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id)
);

CREATE TABLE Appointments (
    appointment_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
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

CREATE TABLE Billing (
    bill_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    patient_id INTEGER(5),
    appointment_id INTEGER(10),
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('Paid', 'Pending', 'Partial') NOT NULL,
    payment_date DATE NOT NULL,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id)
);

CREATE TABLE Insurance_Claims (
    claim_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    billing_id INTEGER(10),
    patient_id INTEGER(5),
    insurance_number VARCHAR(30) NOT NULL,
    claim_status ENUM('Approved', 'Pending') NOT NULL,
    claim_amount DECIMAL(10,2) NOT NULL,
    processed_date DATE NOT NULL,

    FOREIGN KEY (billing_id) REFERENCES Billing(bill_id),
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id)
);

CREATE TABLE Reports (
    report_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    patient_id INTEGER(5),
    doctor_id INTEGER(10),
    report_type CHAR(30) NOT NULL,
    report_file VARCHAR(255) NOT NULL,
    created_at DATE NOT NULL,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
);

CREATE TABLE Documents (
    document_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    patient_id INTEGER(5),
    type CHAR(30) NOT NULL,
    file_path VARCHAR(255) NOT NULL,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id)
);

CREATE TABLE Wards (
    ward_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    ward_name CHAR(30) NOT NULL,
    capacity INTEGER(5) NOT NULL
);

CREATE TABLE Beds (
    bed_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    ward_id INTEGER(10),
    bed_number CHAR(10) NOT NULL,
    status ENUM('Occupied', 'Free') NOT NULL,

    FOREIGN KEY (ward_id) REFERENCES Wards(ward_id)
);

CREATE TABLE Bed_Allocations (
    allocation_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    bed_id INTEGER(10),
    patient_id INTEGER(5),
    allocation_date DATE NOT NULL,
    release_date DATE NOT NULL,

    FOREIGN KEY (bed_id) REFERENCES Beds(bed_id),
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id)
);

CREATE TABLE Visitors (
    visitor_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    patient_id INTEGER(5),
    visitor_name CHAR(50) NOT NULL,
    relation CHAR(50) NOT NULL,
    entry_time DATETIME NOT NULL,
    exit_time DATETIME NOT NULL,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id)
);

CREATE TABLE Disease_Predictions (
    prediction_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    patient_id INTEGER(5),
    symptoms VARCHAR(255) NOT NULL,
    predicted_disease CHAR(255) NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    created_at DATETIME NOT NULL,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id)
);

CREATE TABLE Chatbot_Logs (
    chat_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    patient_id INTEGER(5),
    user_message VARCHAR(255) NOT NULL,
    bot_response VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id)
);

CREATE TABLE Notifications (
    notification_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER(10),
    message VARCHAR(255) NOT NULL,
    type ENUM('Alert', 'Reminder') NOT NULL,
    status ENUM('Read', 'Unread') NOT NULL,
    created_at DATETIME NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Donation (
    donation_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    patient_id INTEGER(5),
    donation_type VARCHAR(3) NOT NULL,
    donation_amount INTEGER(8) NOT NULL,
    donation_date DATE NOT NULL,
    received_by VARCHAR(50) NOT NULL,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id)
);

CREATE TABLE Receptionist (
    reception_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER(10),
    shift ENUM('Morning','Evening','Night') NOT NULL,
    created_at DATETIME NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

INSERT INTO Roles (role_name) SELECT 'Admin' WHERE NOT EXISTS (SELECT * FROM Roles WHERE role_name = 'Admin');
INSERT INTO Roles (role_name) SELECT 'Doctor' WHERE NOT EXISTS (SELECT * FROM Roles WHERE role_name = 'Doctor');
INSERT INTO Roles (role_name) SELECT 'Patient' WHERE NOT EXISTS (SELECT * FROM Roles WHERE role_name = 'Patient');
INSERT INTO Roles (role_name) SELECT 'Receptionist' WHERE NOT EXISTS (SELECT * FROM Roles WHERE role_name = 'Receptionist');

CREATE TABLE ai_faces (
    face_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER(10) NOT NULL,
    embedding JSON NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

