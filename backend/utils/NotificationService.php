<?php
// Enterprise Notification Service for Medisphere
require_once __DIR__ . '/Mailer.php';

class NotificationService {

    /**
     * Helper to log notification to Database for the Header Bell
     */
    private static function logNotification($userId, $message, $type = 'Alert') {
        if (!$userId) return;
        try {
            // We use the $pdo from global scope if available, or include it
            global $pdo;
            if (!$pdo) {
                require_once __DIR__ . '/../config/db.php';
            }
            $stmt = $pdo->prepare("INSERT INTO Notifications (user_id, message, type, status, created_at) VALUES (?, ?, ?, 'Unread', NOW())");
            $stmt->execute([$userId, $message, $type]);
        } catch (Exception $e) {}
    }

    public static function sendWelcome($to, $userId, $firstName, $role) {
        $subject = "Welcome to Medisphere 🏥";
        $msg = "Welcome $firstName! Your account as a $role is ready.";
        self::logNotification($userId, "[Info] " . $msg, 'Alert');

        $body = "
            <p>Welcome to <b>Medisphere</b>, $firstName!</p>
            <p>Your account as a <b>$role</b> has been successfully created.</p>
            <p>You can now log in to access your digital medical dashboard and services.</p>
        ";
        return Mailer::send($to, $subject, $body);
    }
    
    // --- APPOINTMENT NOTIFICATIONS ---
    
    public static function sendAppointmentConfirmation($to, $userId, $patientName, $doctorName, $date, $time) {
        $subject = "📅 Appointment Confirmed - Medisphere";
        $msg = "Your appointment with Dr. $doctorName on $date at $time has been confirmed.";
        self::logNotification($userId, "[Info] " . $msg, 'Alert');
        
        $body = "
            <p>Dear <b>$patientName</b>,</p>
            <p>Your appointment has been successfully booked and confirmed.</p>
            <div style='background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                <p style='margin: 5px 0;'>👨‍⚕️ <b>Doctor:</b> Dr. $doctorName</p>
                <p style='margin: 5px 0;'>📅 <b>Date:</b> $date</p>
                <p style='margin: 5px 0;'>⏰ <b>Time:</b> $time</p>
            </div>
            <p>Please arrive 15 minutes before your scheduled time. You can manage your appointment through the patient dashboard.</p>
        ";
        return Mailer::send($to, $subject, $body);
    }

    public static function sendAppointmentCancellation($to, $userId, $patientName, $date, $time) {
        $subject = "❌ Appointment Cancelled - Medisphere";
        $msg = "Appointment on $date at $time has been cancelled.";
        self::logNotification($userId, "[Alert] " . $msg, 'Alert');

        $body = "
            <p>Dear <b>$patientName</b>,</p>
            <p>We regret to inform you that your scheduled appointment on <b>$date at $time</b> has been cancelled.</p>
            <p>If you did not request this, please contact our support desk immediately to reschedule.</p>
        ";
        return Mailer::send($to, $subject, $body);
    }

    // --- ADMISSION NOTIFICATIONS ---

    public static function sendAdmissionConfirmation($to, $userId, $patientName, $ward, $bed) {
        $subject = "🏥 Admission Confirmation - Medisphere";
        $msg = "You have been admitted to $ward, Bed $bed.";
        self::logNotification($userId, "[Info] " . $msg, 'Alert');

        $body = "
            <p>Dear <b>$patientName</b>,</p>
            <p>This is to confirm your admission to Medisphere Hospital.</p>
            <div style='background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;'>
                <p style='margin: 5px 0;'>📍 <b>Location:</b> $ward</p>
                <p style='margin: 5px 0;'>🛏️ <b>Bed Number:</b> $bed</p>
            </div>
            <p>Our medical team is ready to provide you with the best care. Don't hesitate to use the call button if you need assistance.</p>
        ";
        return Mailer::send($to, $subject, $body);
    }

    public static function sendICUTransfer($to, $userId, $patientName, $status = 'Critical Care') {
        $subject = "🚨 ICU Transfer Notification - Medisphere";
        $msg = "Patient $patientName has been transferred to ICU.";
        self::logNotification($userId, "[Alert] " . $msg, 'Alert');

        $body = "
            <p>Dear Family/Guardian of <b>$patientName</b>,</p>
            <p>We are notifying you that the patient has been transferred to the **Intensive Care Unit (ICU)** for closer monitoring and specialized care.</p>
            <p>Please report to the ICU reception desk for further details and visiting protocols.</p>
        ";
        return Mailer::send($to, $subject, $body);
    }

    public static function sendDischargeSummary($to, $userId, $patientName) {
        $subject = "📄 Discharge Summary Ready - Medisphere";
        $msg = "Your discharge summary is now ready for download.";
        self::logNotification($userId, "[Info] " . $msg, 'Alert');

        $body = "
            <p>Dear <b>$patientName</b>,</p>
            <p>Your discharge process is complete. Your digital discharge summary and medical reports are now available in your patient portal.</p>
            <p>Please follow the prescribed medication and follow-up schedule provided by your doctor.</p>
        ";
        return Mailer::send($to, $subject, $body);
    }

    // --- BILLING NOTIFICATIONS ---

    public static function sendInvoiceGenerated($to, $userId, $patientName, $amount, $invoiceId) {
        $subject = "🧾 New Invoice Generated - Medisphere";
        $msg = "Invoice #$invoiceId of ₹$amount has been generated.";
        self::logNotification($userId, "[Info] " . $msg, 'Alert');

        $body = "
            <p>Dear <b>$patientName</b>,</p>
            <p>A new invoice has been generated for your recent medical services.</p>
            <div style='background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                <p style='margin: 5px 0;'>📦 <b>Invoice ID:</b> #$invoiceId</p>
                <p style='margin: 5px 0;'>💰 <b>Total Amount:</b> ₹$amount</p>
            </div>
            <p>You can pay this bill online via the 'Billing' section of your dashboard.</p>
        ";
        return Mailer::send($to, $subject, $body);
    }

    public static function sendPaymentReceived($to, $userId, $patientName, $amount, $transactionId) {
        $subject = "✅ Payment Received - Medisphere";
        $msg = "Payment of ₹$amount received. Txn: $transactionId";
        self::logNotification($userId, "[Info] " . $msg, 'Alert');

        $body = "
            <p>Dear <b>$patientName</b>,</p>
            <p>Thank you! Your payment of <b>₹$amount</b> has been successfully received.</p>
            <p><b>Transaction ID:</b> $transactionId</p>
            <p>A digital receipt has been attached to your profile for your records.</p>
        ";
        return Mailer::send($to, $subject, $body);
    }

    // --- INSURANCE NOTIFICATIONS ---

    public static function sendInsuranceUpdate($to, $userId, $patientName, $status, $claimId) {
        $color = ($status == 'Approved') ? '#22c55e' : (($status == 'Rejected') ? '#ef4444' : '#f59e0b');
        $subject = "🛡️ Insurance Claim $status - Medisphere";
        $msg = "Your insurance claim #$claimId has been $status.";
        self::logNotification($userId, "[Info] " . $msg, 'Alert');

        $body = "
            <p>Dear <b>$patientName</b>,</p>
            <p>We have an update regarding your insurance claim <b>#$claimId</b>.</p>
            <h3 style='color: $color;'>Status: $status</h3>
            <p>Please check the 'Insurance & Claims' section in your portal for detailed remarks from the provider.</p>
        ";
        return Mailer::send($to, $subject, $body);
    }

    // --- DOCTOR & STAFF NOTIFICATIONS ---

    public static function sendDoctorAssignment($to, $userId, $doctorName, $patientName, $time) {
        $subject = "👨‍⚕️ New Appointment Assigned";
        $msg = "New appointment assigned for patient $patientName at $time.";
        self::logNotification($userId, "[Alert] " . $msg, 'Alert');

        $body = "
            <p>Hello Dr. <b>$doctorName</b>,</p>
            <p>A new patient appointment has been assigned to you.</p>
            <div style='background: #f1f5f9; padding: 15px; border-radius: 8px;'>
                <p>👤 <b>Patient:</b> $patientName</p>
                <p>⏰ <b>Schedule:</b> $time</p>
            </div>
            <p>Please review the patient's medical history before the consultation.</p>
        ";
        return Mailer::send($to, $subject, $body);
    }

    public static function sendStaffAttendance($to, $userId, $staffName, $time, $status = 'Present') {
        $subject = "⏱️ Attendance Marked - Medisphere";
        $msg = "Attendance marked as $status at $time.";
        self::logNotification($userId, "[Info] " . $msg, 'Reminder');

        $body = "
            <p>Hello <b>$staffName</b>,</p>
            <p>Your attendance for today has been recorded successfully.</p>
            <p><b>Time:</b> $time</p>
            <p><b>Status:</b> $status</p>
        ";
        return Mailer::send($to, $subject, $body);
    }
}
