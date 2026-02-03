USE medisphere_shms;

ALTER TABLE Users MODIFY password VARCHAR(255);
ALTER TABLE Users MODIFY user_id INT AUTO_INCREMENT;
ALTER TABLE Roles MODIFY role_id INT AUTO_INCREMENT;
ALTER TABLE Patients MODIFY patient_id INT AUTO_INCREMENT;
ALTER TABLE Doctors MODIFY doctor_id INT AUTO_INCREMENT;
ALTER TABLE Admin MODIFY admin_id INT AUTO_INCREMENT;
ALTER TABLE Staff MODIFY staff_id INT AUTO_INCREMENT;

INSERT INTO Roles (role_name) SELECT 'Admin' WHERE NOT EXISTS (SELECT * FROM Roles WHERE role_name = 'Admin');
INSERT INTO Roles (role_name) SELECT 'Doctor' WHERE NOT EXISTS (SELECT * FROM Roles WHERE role_name = 'Doctor');
INSERT INTO Roles (role_name) SELECT 'Patient' WHERE NOT EXISTS (SELECT * FROM Roles WHERE role_name = 'Patient');
INSERT INTO Roles (role_name) SELECT 'Receptionist' WHERE NOT EXISTS (SELECT * FROM Roles WHERE role_name = 'Receptionist');
