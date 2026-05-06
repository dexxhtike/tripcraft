<?php
require_once "config.php";

renderPageStart("Home");
?>
<header class="hero">
    <?php renderNavbar(); ?>

    <section class="hero-content">
        <div class="hero-copy">
            <h1>Plan memorable trips with a simple smart guide.</h1>
            <p class="hero-text">
                TripCraft helps users explore destinations, organize travel plans,
                and manage trip ideas in one easy place.
            </p>
            <div class="hero-actions">
                <?php if (isLoggedIn()): ?>
                    <a class="button primary" href="planner.php">Start Planning</a>
                    <a class="button secondary" href="dashboard.php">Open Dashboard</a>
                <?php else: ?>
                    <a class="button primary" href="register.php">Start Planning</a>
                    <a class="button secondary" href="destinations.php">View Destinations</a>
                <?php endif; ?>
            </div>
        </div>

        <div class="hero-card">
            <p class="card-label">What You Can Do</p>
            <h2>Trip planning made easier</h2>
            <ul>
                <li>Discover travel destinations</li>
                <li>Create and save personal trip plans</li>
                <li>Send contact messages and manage admin data</li>
            </ul>
        </div>
    </section>
</header>

<main>
    <section class="section">
        <div class="section-heading">
            <p class="eyebrow">Quick Overview</p>
            <h2>A brief introduction to the project</h2>
        </div>
        <div class="feature-grid">
            <article class="feature-card">
                <h3>Explore</h3>
                <p>Browse destination ideas and discover places to visit.</p>
            </article>
            <article class="feature-card">
                <h3>Plan</h3>
                <p>Create a trip schedule with budget and itinerary support.</p>
            </article>
            <article class="feature-card">
                <h3>Manage</h3>
                <p>Store user accounts, trips, and contact messages in MySQL.</p>
            </article>
        </div>
    </section>
</main>
<?php renderPageEnd(); ?>
