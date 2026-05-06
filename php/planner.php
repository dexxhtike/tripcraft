<?php
require_once "config.php";

$message = "";
$messageType = "";
$ratingMessage = "";
$ratingMessageType = "";
$prefilledDestination = trim($_GET["destination"] ?? "");
$savedTripId = isset($_GET["saved_trip"]) ? (int) $_GET["saved_trip"] : 0;
$recentTrip = null;
$canRateRecentTrip = false;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $formType = $_POST["form_type"] ?? "save_trip";

    if ($formType === "save_trip") {
        $destination = trim($_POST["destination"] ?? "");
        $startDate = $_POST["start_date"] ?? "";
        $endDate = $_POST["end_date"] ?? "";
        $budget = trim($_POST["budget"] ?? "");
        $currency = trim($_POST["currency"] ?? "");
        $travelStyle = trim($_POST["travel_style"] ?? "");
        $interest = trim($_POST["interest"] ?? "");
        $userId = $_SESSION["user_id"] ?? null;

        if (
            $destination === "" ||
            $startDate === "" ||
            $endDate === "" ||
            $budget === "" ||
            $currency === "" ||
            $travelStyle === "" ||
            $interest === ""
        ) {
            $message = "All trip fields are required.";
            $messageType = "error";
        } elseif (!isLoggedIn()) {
            $message = "Please log in before saving a trip plan.";
            $messageType = "error";
        } else {
            $startTimestamp = strtotime($startDate);
            $endTimestamp = strtotime($endDate);

            if ($startTimestamp === false || $endTimestamp === false || $endTimestamp < $startTimestamp) {
                $message = "Please enter valid travel dates.";
                $messageType = "error";
            } else {
                $days = (int) floor(($endTimestamp - $startTimestamp) / 86400) + 1;
                $budgetValue = (float) $budget;

                $stmt = $conn->prepare(
                    "INSERT INTO trips (user_id, destination, start_date, end_date, days, budget, currency, travel_style, interest)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
                );
                $stmt->bind_param(
                    "isssidsss",
                    $userId,
                    $destination,
                    $startDate,
                    $endDate,
                    $days,
                    $budgetValue,
                    $currency,
                    $travelStyle,
                    $interest
                );
                $stmt->execute();
                $newTripId = $stmt->insert_id;
                $stmt->close();

                header("Location: planner.php?saved_trip=" . $newTripId . "&destination=" . urlencode($destination));
                exit;
            }
        }
    }

    if ($formType === "booking_rating") {
        requireLogin();

        $tripId = (int) ($_POST["trip_id"] ?? 0);
        $rating = (int) ($_POST["rating"] ?? 0);
        $review = trim($_POST["review"] ?? "");
        $userId = $_SESSION["user_id"];

        if ($tripId <= 0) {
            $ratingMessage = "We could not find the trip to rate.";
            $ratingMessageType = "error";
        } elseif ($rating < 1 || $rating > 5) {
            $ratingMessage = "Please select a rating from 1 to 5.";
            $ratingMessageType = "error";
        } else {
            $tripCheckStmt = $conn->prepare(
                "SELECT id, destination, start_date, end_date, currency
                 FROM trips
                 WHERE id = ? AND user_id = ?"
            );
            $tripCheckStmt->bind_param("ii", $tripId, $userId);
            $tripCheckStmt->execute();
            $tripCheckResult = $tripCheckStmt->get_result();
            $recentTrip = $tripCheckResult->fetch_assoc();
            $tripCheckStmt->close();

            if (!$recentTrip) {
                $ratingMessage = "That trip is not available for rating.";
                $ratingMessageType = "error";
            } else {
                $existingRatingStmt = $conn->prepare(
                    "SELECT id FROM ratings WHERE user_id = ? AND trip_id = ?"
                );
                $existingRatingStmt->bind_param("ii", $userId, $tripId);
                $existingRatingStmt->execute();
                $existingRating = $existingRatingStmt->get_result()->fetch_assoc();
                $existingRatingStmt->close();

                if ($existingRating) {
                    $ratingMessage = "You already rated this booking.";
                    $ratingMessageType = "error";
                } else {
                    $stmt = $conn->prepare(
                        "INSERT INTO ratings (user_id, trip_id, rating_value, review_text) VALUES (?, ?, ?, ?)"
                    );
                    $stmt->bind_param("iiis", $userId, $tripId, $rating, $review);
                    $stmt->execute();
                    $stmt->close();

                    $ratingMessage = "Thank you for rating your booking experience.";
                    $ratingMessageType = "success";
                    $savedTripId = $tripId;
                }
            }
        }
    }
}

if (isLoggedIn() && $savedTripId > 0) {
    $recentTripStmt = $conn->prepare(
        "SELECT id, destination, start_date, end_date, days, budget, currency, travel_style, interest, created_at
         FROM trips
         WHERE id = ? AND user_id = ?"
    );
    $recentTripStmt->bind_param("ii", $savedTripId, $_SESSION["user_id"]);
    $recentTripStmt->execute();
    $recentTrip = $recentTripStmt->get_result()->fetch_assoc();
    $recentTripStmt->close();

    if ($recentTrip) {
        $message = "Trip plan saved successfully.";
        $messageType = "success";
        $prefilledDestination = $recentTrip["destination"];

        $ratedTripStmt = $conn->prepare(
            "SELECT id FROM ratings WHERE user_id = ? AND trip_id = ?"
        );
        $ratedTripStmt->bind_param("ii", $_SESSION["user_id"], $savedTripId);
        $ratedTripStmt->execute();
        $canRateRecentTrip = $ratedTripStmt->get_result()->num_rows === 0;
        $ratedTripStmt->close();
    }
}

$tripResult = null;

if (isLoggedIn()) {
    $tripStmt = $conn->prepare(
        "SELECT destination, start_date, end_date, days, budget, currency, travel_style, interest, created_at
         FROM trips
         WHERE user_id = ?
         ORDER BY id DESC"
    );
    $tripStmt->bind_param("i", $_SESSION["user_id"]);
    $tripStmt->execute();
    $tripResult = $tripStmt->get_result();
}

renderPageStart("Planner");
?>
<div class="page-shell">
    <?php renderNavbar(); ?>

    <section class="page-hero">
        <p class="eyebrow">Member Planner</p>
        <h1>Build a personalized travel plan.</h1>
        <p>
            Create and save your trip in the MySQL database, then review your saved plans below.
        </p>
    </section>

    <section class="section planner">
        <div class="section-heading">
            <p class="eyebrow">Trip Planner</p>
            <h2>Create your next trip in minutes</h2>
        </div>

        <form class="planner-form" method="post" action="">
            <input type="hidden" name="form_type" value="save_trip">
            <label>
                Destination
                <input
                    type="text"
                    name="destination"
                    placeholder="e.g. Seoul, South Korea"
                    value="<?php echo htmlspecialchars($prefilledDestination); ?>"
                    required
                >
            </label>
            <label>
                Start Date
                <input type="date" name="start_date" required>
            </label>
            <label>
                End Date
                <input type="date" name="end_date" required>
            </label>
            <label>
                Total Budget
                <input type="number" name="budget" placeholder="e.g. 800" step="0.01" min="0" required>
            </label>
            <label>
                Currency
                <select name="currency" required>
                    <option value="">Select currency</option>
                    <option value="USD">USD ($)</option>
                    <option value="MMK">MMK (Ks)</option>
                    <option value="THB">THB (Baht)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="JPY">JPY (Yen)</option>
                    <option value="SGD">SGD (S$)</option>
                </select>
            </label>
            <label>
                Travel Style
                <select name="travel_style" required>
                    <option value="">Select travel style</option>
                    <option value="budget">Budget</option>
                    <option value="balanced">Balanced</option>
                    <option value="comfort">Comfort</option>
                </select>
            </label>
            <label>
                Main Interest
                <select name="interest" required>
                    <option value="">Select main interest</option>
                    <option value="culture">Cultural Sites</option>
                    <option value="nature">Nature</option>
                    <option value="food">Food</option>
                    <option value="shopping">Shopping</option>
                </select>
            </label>
            <button type="submit" class="button primary full-width">Save Trip Plan</button>
        </form>

        <section class="result-panel">
            <?php if ($message !== ""): ?>
                <p class="status-message<?php echo $messageType === "success" ? " success" : ""; ?>">
                    <?php echo htmlspecialchars($message); ?>
                </p>
            <?php else: ?>
                <div class="result-placeholder">
                    You can preview the planner as a guest. Log in to save trips into the MySQL database.
                </div>
            <?php endif; ?>

            <?php if ($recentTrip): ?>
                <section class="auth-layout planner-followup">
                    <article class="info-card">
                        <p class="eyebrow">Recent Booking</p>
                        <h2><?php echo htmlspecialchars($recentTrip["destination"]); ?></h2>
                        <p class="helper-text">
                            <?php echo htmlspecialchars($recentTrip["start_date"]); ?> to
                            <?php echo htmlspecialchars($recentTrip["end_date"]); ?>,
                            <?php echo htmlspecialchars((string) $recentTrip["days"]); ?> day(s),
                            <?php echo htmlspecialchars(formatBudgetWithCurrency($recentTrip["budget"], $recentTrip["currency"])); ?>
                        </p>
                        <p class="helper-text">
                            Your booking is saved. You can rate this trip experience right away.
                        </p>
                    </article>

                    <article class="auth-card">
                        <form class="auth-form" method="post" action="">
                            <input type="hidden" name="form_type" value="booking_rating">
                            <input type="hidden" name="trip_id" value="<?php echo htmlspecialchars((string) $recentTrip["id"]); ?>">
                            <label>
                                Booking Rating
                                <select name="rating" required <?php echo !$canRateRecentTrip ? "disabled" : ""; ?>>
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
                                <textarea name="review" placeholder="Share a short review about this booking" <?php echo !$canRateRecentTrip ? "disabled" : ""; ?>></textarea>
                            </label>
                            <?php if ($ratingMessage !== ""): ?>
                                <p class="status-message<?php echo $ratingMessageType === "success" ? " success" : ""; ?>">
                                    <?php echo htmlspecialchars($ratingMessage); ?>
                                </p>
                            <?php elseif (!$canRateRecentTrip): ?>
                                <p class="status-message success">
                                    You already rated this booking. Thank you for your feedback.
                                </p>
                            <?php endif; ?>
                            <?php if ($canRateRecentTrip): ?>
                                <button class="button primary" type="submit">Submit Booking Rating</button>
                            <?php endif; ?>
                        </form>
                    </article>
                </section>
            <?php endif; ?>

            <div class="result-content">
                <div class="result-header">
                    <div>
                        <p class="eyebrow">Saved Plans</p>
                        <h3>Your trip history</h3>
                    </div>
                    <div class="trip-badge">
                        <?php echo isLoggedIn() && $tripResult ? htmlspecialchars((string) $tripResult->num_rows) . " trip(s)" : "Guest View"; ?>
                    </div>
                </div>

                <div class="itinerary-layout">
                    <article class="itinerary-card" style="grid-column: 1 / -1;">
                        <h4>Saved Trips</h4>
                        <?php if (!isLoggedIn()): ?>
                            <p class="helper-text">
                                Log in to save trip plans and view your history here.
                            </p>
                        <?php elseif ($tripResult && $tripResult->num_rows > 0): ?>
                            <table>
                                <tr>
                                    <th>Destination</th>
                                    <th>Dates</th>
                                    <th>Days</th>
                                    <th>Budget</th>
                                    <th>Currency</th>
                                    <th>Style</th>
                                    <th>Interest</th>
                                </tr>
                                <?php while ($trip = $tripResult->fetch_assoc()): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($trip["destination"]); ?></td>
                                        <td><?php echo htmlspecialchars($trip["start_date"]); ?> to <?php echo htmlspecialchars($trip["end_date"]); ?></td>
                                        <td><?php echo htmlspecialchars((string) $trip["days"]); ?></td>
                                        <td><?php echo htmlspecialchars(formatBudgetWithCurrency($trip["budget"], $trip["currency"])); ?></td>
                                        <td><?php echo htmlspecialchars($trip["currency"]); ?></td>
                                        <td><?php echo htmlspecialchars($trip["travel_style"]); ?></td>
                                        <td><?php echo htmlspecialchars($trip["interest"]); ?></td>
                                    </tr>
                                <?php endwhile; ?>
                            </table>
                        <?php else: ?>
                            <p class="helper-text">No saved trips yet.</p>
                        <?php endif; ?>
                    </article>
                </div>
            </div>
        </section>
    </section>
</div>
<?php renderPageEnd(); ?>
