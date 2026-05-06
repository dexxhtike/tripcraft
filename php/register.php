<?php
require_once "config.php";

$message = "";
$messageType = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $passwordInput = $_POST["password"] ?? "";

    if ($name === "" || $email === "" || $passwordInput === "") {
        $message = "All fields are required.";
        $messageType = "error";
    } else {
        $checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $checkStmt->bind_param("s", $email);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();

        if ($checkResult->num_rows > 0) {
            $message = "This email is already registered.";
            $messageType = "error";
        } else {
            $hashedPassword = password_hash($passwordInput, PASSWORD_DEFAULT);
            $role = "user";

            $insertStmt = $conn->prepare(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
            );
            $insertStmt->bind_param("ssss", $name, $email, $hashedPassword, $role);
            $insertStmt->execute();

            $_SESSION["user_id"] = $insertStmt->insert_id;
            $_SESSION["user_name"] = $name;
            $_SESSION["user_email"] = $email;
            $_SESSION["user_role"] = $role;

            header("Location: dashboard.php");
            exit;
        }
    }
}

renderPageStart("Sign Up");
?>
<div class="page-shell">
    <?php renderNavbar(); ?>

    <section class="auth-layout">
        <article class="info-card">
            <p class="eyebrow">New Account</p>
            <h1>Create a TripCraft account for your planner.</h1>
            <p class="helper-text">
                Registration now stores your account directly in MySQL, giving your
                project real login and role-based access.
            </p>
            <ul class="list-clean">
                <li>Register with name, email, and password</li>
                <li>Auto-log in after account creation</li>
                <li>Redirect directly to your dashboard</li>
            </ul>
        </article>

        <article class="auth-card">
            <p class="eyebrow">Join Now</p>
            <h2>Sign Up</h2>
            <form class="auth-form" method="post" action="">
                <label>
                    Full Name
                    <input type="text" name="name" placeholder="Your name" required>
                </label>
                <label>
                    Email
                    <input type="email" name="email" placeholder="you@example.com" required>
                </label>
                <label>
                    Password
                    <input type="password" name="password" placeholder="Create a password" required>
                </label>
                <?php if ($message !== ""): ?>
                    <p class="status-message<?php echo $messageType === "success" ? " success" : ""; ?>">
                        <?php echo htmlspecialchars($message); ?>
                    </p>
                <?php endif; ?>
                <button class="button primary" type="submit">Create Account</button>
            </form>
            <p class="helper-text">
                Already registered? <a href="login.php"><strong>Log in here</strong></a>.
            </p>
        </article>
    </section>
</div>
<?php renderPageEnd(); ?>
