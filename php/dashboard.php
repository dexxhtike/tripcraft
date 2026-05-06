<?php
require_once "config.php";

requireLogin();

$userName = $_SESSION["user_name"];
$userEmail = $_SESSION["user_email"];
$userRole = $_SESSION["user_role"];

renderPageStart("Dashboard");
?>
<div class="page-shell">
    <?php renderNavbar(); ?>

    <section class="page-hero">
        <p class="eyebrow">Member Dashboard</p>
        <h1>Welcome, <?php echo htmlspecialchars($userName); ?></h1>
        <p>
            This is your protected dashboard. From here you can save trip plans,
            send contact messages, and access admin tools when your role is admin.
        </p>
    </section>

    <section class="section">
        <div class="dashboard-stats">
            <article class="dashboard-card">
                <p class="summary-label">Email</p>
                <h3><?php echo htmlspecialchars($userEmail); ?></h3>
            </article>
            <article class="dashboard-card">
                <p class="summary-label">Role</p>
                <h3><?php echo htmlspecialchars($userRole); ?></h3>
            </article>
            <article class="dashboard-card">
                <p class="summary-label">Access</p>
                <h3><?php echo isAdmin() ? "Administrator" : "Standard User"; ?></h3>
            </article>
        </div>

        <div class="dashboard-grid">
            <article class="dashboard-card">
                <h4>Trip Planner</h4>
                <p class="dashboard-note">
                    Create and save destinations, dates, budgets, and travel interests.
                </p>
                <p><a class="button primary" href="planner.php">Open Planner</a></p>
            </article>

            <article class="dashboard-card">
                <h4>Contact Page</h4>
                <p class="dashboard-note">
                    Send a message through the project contact form and store it in MySQL.
                </p>
                <p><a class="button secondary" href="contact.php">Open Contact</a></p>
            </article>

            <?php if (isAdmin()): ?>
                <article class="dashboard-card">
                    <h4>Admin Dashboard</h4>
                    <p class="dashboard-note">
                        Review users, saved trips, and contact messages from one place.
                    </p>
                    <p><a class="button primary" href="admin_dashboard.php">Open Admin Dashboard</a></p>
                </article>
            <?php endif; ?>
        </div>
    </section>
</div>
<?php renderPageEnd(); ?>
