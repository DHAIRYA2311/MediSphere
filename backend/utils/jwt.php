<?php
class JWT {
    private static $secret_key = 'your_secret_key_here_change_this_generated_by_medisphere'; // Change this in production
    private static $algo = 'HS256';

    public static function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => self::$algo]);
        $payload = json_encode($payload);

        $base64UrlHeader = str_replace(
            ['+', '/', '='], 
            ['-', '_', ''], 
            base64_encode($header)
        );

        $base64UrlPayload = str_replace(
            ['+', '/', '='], 
            ['-', '_', ''], 
            base64_encode($payload)
        );

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret_key, true);
        $base64UrlSignature = str_replace(
            ['+', '/', '='], 
            ['-', '_', ''], 
            base64_encode($signature)
        );

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function decode($jwt) {
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) != 3) {
            return null;
        }

        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
        $signature_provided = $tokenParts[2];

        $signature = hash_hmac('sha256', $tokenParts[0] . "." . $tokenParts[1], self::$secret_key, true);
        $base64UrlSignature = str_replace(
            ['+', '/', '='], 
            ['-', '_', ''], 
            base64_encode($signature)
        );

        if ($base64UrlSignature === $signature_provided) {
            return json_decode($payload, true);
        } else {
            return null;
        }
    }
    
    public static function get_bearer_token() {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }
        return null;
    }
}
?>
