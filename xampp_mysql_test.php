<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$host = "localhost";
$port = 3307;
$username = "root";
$password = "";
$database = "my_database";

try {
    $conn = new mysqli($host, $username, $password, $database, $port);
    $conn->set_charset("utf8mb4");

    $createTableSql = "
        CREATE TABLE IF NOT EXISTS sample_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ";
    $conn->query($createTableSql);

    $name = "John Doe";
    $email = "john@example.com";

    $insertSql = "INSERT IGNORE INTO sample_users (name, email) VALUES (?, ?)";
    $insertStmt = $conn->prepare($insertSql);
    $insertStmt->bind_param("ss", $name, $email);
    $insertStmt->execute();
    $insertStmt->close();

    $result = $conn->query("SELECT id, name, email, created_at FROM sample_users ORDER BY id DESC");

    echo "<h2>MySQL Connection Successful</h2>";
    echo "<p>Connected to database: <strong>" . htmlspecialchars($database) . "</strong></p>";
    echo "<h3>Sample Data</h3>";

    if ($result->num_rows > 0) {
        echo "<table border='1' cellpadding='8' cellspacing='0'>";
        echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Created At</th></tr>";

        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars((string) $row["id"]) . "</td>";
            echo "<td>" . htmlspecialchars($row["name"]) . "</td>";
            echo "<td>" . htmlspecialchars($row["email"]) . "</td>";
            echo "<td>" . htmlspecialchars($row["created_at"]) . "</td>";
            echo "</tr>";
        }

        echo "</table>";
    } else {
        echo "<p>No records found.</p>";
    }

    $result->free();
    $conn->close();
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo "<h2>Database Error</h2>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
}
?>
