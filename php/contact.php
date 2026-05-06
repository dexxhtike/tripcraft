<?php
require_once "config.php";

requireLogin();

$message = "";
$messageType = "";
$ratingMessage = "";
$ratingMessageType = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $formType = $_POST["form_type"] ?? "";

    if ($formType === "contact") {
        $name = trim($_POST["name"] ?? "");
        $email = trim($_POST["email"] ?? "");
        $userMessage = trim($_POST["message"] ?? "");

        if ($name === "" || $email === "" || $userMessage === "") {
            $message = "All fields are required.";
            $messageType = "error";
        } else {
            $stmt = $conn->prepare("INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $name, $email, $userMessage);
            $stmt->execute();
            $stmt->close();

            $message = "Your message was sent successfully.";
            $messageType = "success";
        }
    }

    if ($formType === "rating") {
        $rating = (int) ($_POST["rating"] ?? 0);
        $review = trim($_POST["review"] ?? "");
        $userId = $_SESSION["user_id"];

        if ($rating < 1 || $rating > 5) {
            $ratingMessage = "Please select a rating from 1 to 5.";
            $ratingMessageType = "error";
        } else {
            $stmt = $conn->prepare(
                "INSERT INTO ratings (user_id, trip_id, rating_value, review_text) VALUES (?, NULL, ?, ?)"
            );
            $stmt->bind_param("iis", $userId, $rating, $review);
            $stmt->execute();
            $stmt->close();

            $ratingMessage = "Thank you for rating our service.";
            $ratingMessageType = "success";
        }
    }
}

renderPageStart("Contact");
?>
<div class="page-shell">
    <?php renderNavbar(); ?>

    <section class="page-hero">
        <p class="eyebrow">Contact Page</p>
        <h1>Get in touch with the TripCraft team.</h1>
        <p>
            The contact form below is connected to MySQL, so every submitted message is stored in the database.
        </p>
    </section>

    <section class="section">
        <div class="section-heading">
            <p class="eyebrow">Reach Out</p>
            <h2>Contact information and message form</h2>
        </div>

        <div class="contact-grid">
            <article>
                <h3>Email</h3>
                <p class="helper-text">support@tripcraft.demo</p>
            </article>
            <article>
                <h3>Phone</h3>
                <p class="helper-text">+95 9 123 456 789</p>
            </article>
            <article>
                <h3>Office</h3>
                <p class="helper-text">University Final Project Showcase</p>
            </article>
        </div>

        <section class="auth-layout">
            <article class="info-card">
                <p class="eyebrow">Need Help?</p>
                <h2>Share your travel question.</h2>
                <p class="helper-text">
                    This page gives your project a fully working contact flow with data stored in MySQL.
                </p>
            </article>

            <article class="auth-card">
                <form class="auth-form" method="post" action="">
                    <input type="hidden" name="form_type" value="contact">
                    <label>
                        Name
                        <input type="text" name="name" value="<?php echo htmlspecialchars($_SESSION["user_name"] ?? ""); ?>" placeholder="Your name" required>
                    </label>
                    <label>
                        Email
                        <input type="email" name="email" value="<?php echo htmlspecialchars($_SESSION["user_email"] ?? ""); ?>" placeholder="you@example.com" required>
                    </label>
                    <label>
                        Message
                        <textarea name="message" placeholder="Write your message here" required></textarea>
                    </label>
                    <?php if ($message !== ""): ?>
                        <p class="status-message<?php echo $messageType === "success" ? " success" : ""; ?>">
                            <?php echo htmlspecialchars($message); ?>
                        </p>
                    <?php endif; ?>
                    <button class="button primary" type="submit">Send Message</button>
                </form>
            </article>
        </section>

        <section class="auth-layout" style="margin-top: 28px;">
            <article class="info-card">
                <p class="eyebrow">Service Rating</p>
                <h2>Rate your experience with TripCraft.</h2>
                <p class="helper-text">
                    Logged-in users can rate the website service and leave a short review. Your feedback will be stored in the database and visible to admins.
                </p>
            </article>

            <article class="auth-card">
                <form class="auth-form" method="post" action="">
                    <input type="hidden" name="form_type" value="rating">
                    <label>
                        Rating
                        <select name="rating" required>
                            <option value="">Select a score</option>
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Very Good</option>
                            <option value="3">3 - Good</option>
                            <option value="2">2 - Fair</option>
                            <option value="1">1 - Poor</option>
                        </select>
                    </label>
                    <label>
                        Review
                        <textarea name="review" placeholder="Write a short review about the service"></textarea>
                    </label>
                    <?php if ($ratingMessage !== ""): ?>
                        <p class="status-message<?php echo $ratingMessageType === "success" ? " success" : ""; ?>">
                            <?php echo htmlspecialchars($ratingMessage); ?>
                        </p>
                    <?php endif; ?>
                    <button class="button primary" type="submit">Submit Rating</button>
                </form>
            </article>
        </section>
    </section>
</div>
<?php renderPageEnd(); ?>
