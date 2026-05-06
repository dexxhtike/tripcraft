<?php
require_once "config.php";

requireAdmin();

$usersResult = $conn->query("
    SELECT id, name, email, role, created_at
    FROM users
    ORDER BY id DESC
");

$tripsResult = $conn->query("
    SELECT trips.id, users.name AS user_name, trips.destination, trips.start_date, trips.end_date,
           trips.days, trips.budget, trips.currency, trips.travel_style, trips.interest, trips.created_at
    FROM trips
    JOIN users ON trips.user_id = users.id
    ORDER BY trips.id DESC
");

$contactsResult = $conn->query("
    SELECT id, name, email, message, created_at
    FROM contacts
    ORDER BY id DESC
");

$ratingsResult = $conn->query("
    SELECT ratings.id, users.name AS user_name, ratings.rating_value, ratings.review_text, ratings.created_at,
           trips.destination AS trip_destination
    FROM ratings
    JOIN users ON ratings.user_id = users.id
    LEFT JOIN trips ON ratings.trip_id = trips.id
    ORDER BY ratings.id DESC
");

renderPageStart("Admin Dashboard");
?>
<div class="page-shell">
    <?php renderNavbar(); ?>

    <section class="page-hero">
        <p class="eyebrow">Admin Area</p>
        <h1>Admin overview for the TripCraft project.</h1>
        <p>
            Review users, saved trips, contact messages, and booking ratings from the MySQL database in one place.
        </p>
    </section>

    <section class="section">
        <div class="dashboard-stats">
            <article class="dashboard-card">
                <p class="summary-label">Registered Users</p>
                <h3><?php echo htmlspecialchars((string) $usersResult->num_rows); ?></h3>
            </article>
            <article class="dashboard-card">
                <p class="summary-label">Saved Trips</p>
                <h3><?php echo htmlspecialchars((string) $tripsResult->num_rows); ?></h3>
            </article>
            <article class="dashboard-card">
                <p class="summary-label">Contact Messages</p>
                <h3><?php echo htmlspecialchars((string) $contactsResult->num_rows); ?></h3>
            </article>
            <article class="dashboard-card">
                <p class="summary-label">Service Ratings</p>
                <h3><?php echo htmlspecialchars((string) $ratingsResult->num_rows); ?></h3>
            </article>
        </div>

        <div class="dashboard-grid">
            <article class="dashboard-card">
                <h4>Users</h4>
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                    </tr>
                    <?php while ($user = $usersResult->fetch_assoc()): ?>
                        <tr>
                            <td><?php echo htmlspecialchars((string) $user["id"]); ?></td>
                            <td><?php echo htmlspecialchars($user["name"]); ?></td>
                            <td><?php echo htmlspecialchars($user["email"]); ?></td>
                            <td><?php echo htmlspecialchars($user["role"]); ?></td>
                        </tr>
                    <?php endwhile; ?>
                </table>
            </article>

            <article class="dashboard-card">
                <h4>Trips</h4>
                <table>
                    <tr>
                        <th>User</th>
                        <th>Destination</th>
                        <th>Days</th>
                        <th>Budget</th>
                        <th>Currency</th>
                    </tr>
                    <?php while ($trip = $tripsResult->fetch_assoc()): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($trip["user_name"]); ?></td>
                            <td><?php echo htmlspecialchars($trip["destination"]); ?></td>
                            <td><?php echo htmlspecialchars((string) $trip["days"]); ?></td>
                            <td><?php echo htmlspecialchars(formatBudgetWithCurrency($trip["budget"], $trip["currency"])); ?></td>
                            <td><?php echo htmlspecialchars($trip["currency"]); ?></td>
                        </tr>
                    <?php endwhile; ?>
                </table>
            </article>

            <article class="dashboard-card" style="grid-column: 1 / -1;">
                <h4>Messages</h4>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Message</th>
                        <th>Created At</th>
                    </tr>
                    <?php while ($contact = $contactsResult->fetch_assoc()): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($contact["name"]); ?></td>
                            <td><?php echo htmlspecialchars($contact["email"]); ?></td>
                            <td><?php echo nl2br(htmlspecialchars($contact["message"])); ?></td>
                            <td><?php echo htmlspecialchars($contact["created_at"]); ?></td>
                        </tr>
                    <?php endwhile; ?>
                </table>
            </article>

            <article class="dashboard-card" style="grid-column: 1 / -1;">
                <h4>Service Ratings</h4>
                <table>
                    <tr>
                        <th>User</th>
                        <th>Rated Booking</th>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Created At</th>
                    </tr>
                    <?php while ($rating = $ratingsResult->fetch_assoc()): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($rating["user_name"]); ?></td>
                            <td><?php echo htmlspecialchars($rating["trip_destination"] ?: "General Service"); ?></td>
                            <td><?php echo htmlspecialchars((string) $rating["rating_value"]); ?>/5</td>
                            <td><?php echo nl2br(htmlspecialchars($rating["review_text"])); ?></td>
                            <td><?php echo htmlspecialchars($rating["created_at"]); ?></td>
                        </tr>
                    <?php endwhile; ?>
                </table>
            </article>
        </div>
    </section>
</div>
<?php renderPageEnd(); ?>
