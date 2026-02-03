<?php
require_once __DIR__ . '/config/db.php';
$roles = $pdo->query("SELECT * FROM Roles")->fetchAll();
print_r($roles);
?>
