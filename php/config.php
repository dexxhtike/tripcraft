<?php
session_start();

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$host = "localhost";
$port = 3307;
$username = "root";
$password = "";
$database = "my_database";

try {
    $conn = new mysqli($host, $username, $password, $database, $port);
    $conn->set_charset("utf8mb4");
} catch (mysqli_sql_exception $e) {
    die("Database connection failed: " . htmlspecialchars($e->getMessage()));
}

function isLoggedIn(): bool
{
    return isset($_SESSION["user_id"]);
}

function isAdmin(): bool
{
    return (($_SESSION["user_role"] ?? "") === "admin");
}

function requireLogin(): void
{
    if (!isLoggedIn()) {
        header("Location: login.php");
        exit;
    }
}

function requireAdmin(): void
{
    requireLogin();

    if (!isAdmin()) {
        die("Access denied. Admins only.");
    }
}

function renderPageStart(string $title): void
{
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($title); ?> | TripCraft</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Playfair+Display:wght@700&display=swap"
        rel="stylesheet"
    >
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <?php
}

function renderNavbar(): void
{
    ?>
    <nav class="navbar">
        <a class="brand" href="index.php">TripCraft</a>
        <div class="nav-links">
            <a href="index.php">Home</a>
            <a href="planner.php">Planner</a>
            <a href="map.php">Map</a>
            <a href="destinations.php">Destinations</a>
            <a href="contact.php">Contact</a>
            <?php if (isAdmin()): ?>
                <a href="admin_dashboard.php">Admin</a>
            <?php endif; ?>
        </div>
        <div class="nav-auth">
            <?php if (isLoggedIn()): ?>
                <span class="auth-user">Hi, <?php echo htmlspecialchars($_SESSION["user_name"]); ?></span>
                <a class="button secondary nav-button" href="logout.php">Log Out</a>
            <?php else: ?>
                <a class="button secondary nav-button" href="login.php">Log In</a>
                <a class="button primary nav-button" href="register.php">Sign Up</a>
            <?php endif; ?>
        </div>
    </nav>
    <?php
}

function renderPageEnd(): void
{
    ?>
</body>
</html>
    <?php
}

function formatBudgetWithCurrency($amount, string $currency): string
{
    $symbols = [
        "USD" => "$",
        "MMK" => "Ks",
        "THB" => "Baht",
        "EUR" => "EUR",
        "JPY" => "JPY",
        "SGD" => "S$"
    ];

    $symbol = $symbols[$currency] ?? $currency;
    return $symbol . " " . number_format((float) $amount, 2);
}
?>
