<?php
require_once __DIR__ . '/config/db.php';

try {
    echo "Testing Database Connection...\n";
    
    $tables = ['Users', 'Doctors', 'Patients', 'Appointments', 'Staff', 'Billing'];
    $stats = [];
    
    foreach ($tables as $table) {
        try {
            $count = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
            echo "$table count: $count\n";
        } catch (Exception $e) {
            echo "Error counting $table: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\nTesting Revenue Calculation...\n";
    try {
        $revenue = $pdo->query("SELECT SUM(paid_amount) FROM Billing")->fetchColumn();
        echo "Total Revenue: " . ($revenue ?: 0) . "\n";
    } catch (Exception $e) {
        echo "Error calculating revenue: " . $e->getMessage() . "\n";
    }

} catch (Exception $e) {
    echo "General Error: " . $e->getMessage();
}
?>
