<?php
include 'config/db.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS Face_Embeddings (
        embedding_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INTEGER(10) NOT NULL,
        embedding LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    )";

    $pdo->exec($sql);
    echo "Face_Embeddings table created successfully.";
} catch (PDOException $e) {
    echo "Error creating table: " . $e->getMessage();
}
?>
