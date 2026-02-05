<?php
include 'backend/config/db.php';
try {
    $pdo->exec("DROP TABLE IF EXISTS ai_faces");
    $pdo->exec("CREATE TABLE ai_faces (
        face_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
        user_id INTEGER(10) NOT NULL,
        embedding JSON NOT NULL,
        created_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
    )");
    echo "Table ai_faces updated successfully.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
