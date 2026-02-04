<?php
// A simple standalone SMTP class for sending emails without Composer/PHPMailer
// Based on common lightweight PHP SMTP implementations

class SimpleSMTP {
    private $connection;
    private $log = [];

    public function connect($host, $port, $username, $password) {
        $socket_options = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ];

        // For port 465, use ssl:// prefix
        // For port 587, use tcp:// then STARTTLS
        $protocol = ($port == 465) ? 'ssl://' : 'tcp://';
        
        $context = stream_context_create($socket_options);
        // Reduced timeout to 5 seconds to prevent browser hanging -> "Failed to fetch"
        $this->connection = @stream_socket_client(
            $protocol . $host . ':' . $port, 
            $errno, 
            $errstr, 
            5, 
            STREAM_CLIENT_CONNECT, 
            $context
        );

        if (!$this->connection) {
            throw new Exception("Could not connect to SMTP host: $errstr");
        }

        stream_set_timeout($this->connection, 5); // Read timeout

        $this->read(); // Greeting
        $this->send("EHLO " . gethostname());
        $this->read();
        
        if ($port == 587) {
            $this->send("STARTTLS");
            $this->read();
            
            if (!stream_socket_enable_crypto($this->connection, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                 throw new Exception("TLS encryption failed");
            }
            
            $this->send("EHLO " . gethostname());
            $this->read();
        }
        
        $this->send("AUTH LOGIN");
        $this->read();
        
        $this->send(base64_encode($username));
        $this->read();
        
        $this->send(base64_encode($password));
        $this->read(); // Auth success?
    }

    public function sendEmail($to, $subject, $body, $fromEmail, $fromName) {
        if (!$this->connection) return false;
        
        $this->send("MAIL FROM: <$fromEmail>");
        $this->read();
        
        $this->send("RCPT TO: <$to>");
        $this->read();
        
        $this->send("DATA");
        $this->read();
        
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: $fromName <$fromEmail>\r\n";
        $headers .= "To: $to\r\n";
        $headers .= "Subject: $subject\r\n";
        
        $this->send($headers . "\r\n" . $body . "\r\n.");
        $response = $this->read();
        
        $this->send("QUIT");
        @fclose($this->connection);
        
        return strpos($response, '250') !== false;
    }

    private function send($cmd) {
        if (!is_resource($this->connection)) return;
        fputs($this->connection, $cmd . "\r\n");
    }

    private function read() {
        if (!is_resource($this->connection)) return "";
        $response = "";
        while ($str = fgets($this->connection, 515)) {
            $response .= $str;
            if (substr($str, 3, 1) == " ") { break; }
        }
        return $response;
    }
}
?>
