<?php
// Unified Mailer Utility for Medisphere
require_once __DIR__ . '/../config/email_config.php';
require_once __DIR__ . '/SimpleSMTP.php';

class Mailer {
    /**
     * Send a professional HTML email
     * 
     * @param string $to Recipient email
     * @param string $subject Email subject
     * @param string $body HTML or Text body
     * @return bool Success status
     */
    public static function send($to, $subject, $body) {
        // Fallback log file if SMTP fails or is not configured
        $log_file = __DIR__ . "/../../email_log.txt";

        try {
            // Check if default config is still there
            if (SMTP_USER === 'your_email@gmail.com' || empty(SMTP_PASS)) {
                self::logOffline($to, $subject, $body, "SMTP not configured");
                return false;
            }

            $smtp = new SimpleSMTP();
            $smtp->connect(SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS);
            
            // Wrap body in a professional template if it doesn't look like a full HTML
            if (strpos($body, '<div') === false && strpos($body, '<html') === false) {
                $body = self::wrapTemplate($subject, $body);
            }

            return $smtp->sendEmail(
                $to, 
                $subject, 
                $body, 
                SMTP_FROM_EMAIL, 
                SMTP_FROM_NAME
            );

        } catch (Exception $e) {
            self::logOffline($to, $subject, $body, $e->getMessage());
            return false;
        }
    }

    /**
     * Logs the email to a local file if the server is offline (for development/demo)
     */
    private static function logOffline($to, $subject, $body, $reason) {
        $log_file = __DIR__ . "/../../email_log.txt";
        $entry = "[" . date('Y-m-d H:i:s') . "] TO: $to | SUBJECT: $subject | REASON: $reason\n";
        $entry .= "CONTENT: " . strip_tags($body) . "\n";
        $entry .= "--------------------------------------------------\n";
        @file_put_contents($log_file, $entry, FILE_APPEND);
    }

    /**
     * Professional Medisphere Email Template
     */
    private static function wrapTemplate($title, $content) {
        return "
        <div style='font-family: Segoe UI, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;'>
            <div style='background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); padding: 30px; text-align: center;'>
                <h1 style='color: white; margin: 0; font-size: 24px;'>Medisphere</h1>
                <p style='color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;'>Smart Healthcare Management</p>
            </div>
            <div style='padding: 30px; background: white;'>
                <h2 style='color: #0f172a; margin-top: 0;'>$title</h2>
                <div style='line-height: 1.6; color: #475569;'>
                    $content
                </div>
                <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center;'>
                    This is an automated notification from Medisphere. <br/>
                    123 Health Avenue, Medicity.
                </div>
            </div>
        </div>";
    }
}
