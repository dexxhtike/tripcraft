<?php
require_once "config.php";

$message = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST["email"] ?? "");
    $passwordInput = $_POST["password"] ?? "";

    if ($email === "" || $passwordInput === "") {
        $message = "Email and password are required.";
    } else {
        $stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();

            if (password_verify($passwordInput, $user["password"])) {
                $_SESSION["user_id"] = $user["id"];
                $_SESSION["user_name"] = $user["name"];
                $_SESSION["user_email"] = $user["email"];
                $_SESSION["user_role"] = $user["role"];

                header("Location: dashboard.php");
                exit;
            }
        }

        $message = "Invalid email or password.";
    }
}

renderPageStart("Log In");
?>
<div class="page-shell">
    <?php renderNavbar(); ?>

    <section class="auth-layout">
        <article class="info-card">
            <p class="eyebrow">Welcome Back</p>
            <h1>Log in to continue planning your trip.</h1>
            <p class="helper-text">
                Your account is connected to the MySQL database, so saved trips and
                access permissions stay with your profile.
            </p>
            <ul class="list-clean">
                <li>Access the protected planner page</li>
                <li>Keep your trip history linked to your account</li>
                <li>Open the admin dashboard when your role is admin</li>
            </ul>
        </article>

        <article class="auth-card">
            <p class="eyebrow">Account Access</p>
            <h2>Log In</h2>
            <form class="auth-form" method="post" action="">
                <label>
                    Email
                    <input type="email" name="email" placeholder="you@example.com" required>
                </label>
                <label>
                    Password
                    <input type="password" name="password" placeholder="Enter your password" required>
                </label>
                <?php if ($message !== ""): ?>
                    <p class="status-message"><?php echo htmlspecialchars($message); ?></p>
                <?php endif; ?>
                <button class="button primary" type="submit">Log In</button>
            </form>
            <p class="helper-text">
                New user? <a href="register.php"><strong>Create an account here</strong></a>.
            </p>
        </article>
    </section>
</div>
<?php renderPageEnd(); ?>
