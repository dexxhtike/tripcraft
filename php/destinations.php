<?php
require_once "config.php";

renderPageStart("Destinations");
?>
<div class="page-shell">
    <?php renderNavbar(); ?>

    <section class="page-hero">
        <p class="eyebrow">Explore Places</p>
        <h1>Choose a destination that matches your travel style.</h1>
        <p>
            This page gives your final project a dedicated area for destination
            discovery while keeping the same TripCraft design.
        </p>
    </section>

    <section class="section destinations">
        <div class="section-heading">
            <p class="eyebrow">Featured Destinations</p>
            <h2>Ideas for your next adventure</h2>
        </div>

        <div class="destination-grid">
            <article class="destination-card">
                <img class="destination-image" src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80" alt="Bali destination">
                <div class="destination-card-body">
                    <span>Beach</span>
                    <h3>Bali</h3>
                    <p>Relaxing coastlines, cafes, temples, and scenic sunsets.</p>
                    <div class="destination-actions">
                        <a class="button secondary" href="map.php?place=Bali">View on map</a>
                        <a class="button primary" href="planner.php?destination=Bali">Book now</a>
                    </div>
                </div>
            </article>
            <article class="destination-card">
                <img class="destination-image" src="https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=1200&q=80" alt="Seoul destination">
                <div class="destination-card-body">
                    <span>City</span>
                    <h3>Seoul</h3>
                    <p>Street food, nightlife, shopping districts, and modern culture.</p>
                    <div class="destination-actions">
                        <a class="button secondary" href="map.php?place=Seoul">View on map</a>
                        <a class="button primary" href="planner.php?destination=Seoul">Book now</a>
                    </div>
                </div>
            </article>
            <article class="destination-card">
                <img class="destination-image" src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80" alt="Rome destination">
                <div class="destination-card-body">
                    <span>History</span>
                    <h3>Rome</h3>
                    <p>Famous landmarks, museums, and unforgettable architecture.</p>
                    <div class="destination-actions">
                        <a class="button secondary" href="map.php?place=Rome">View on map</a>
                        <a class="button primary" href="planner.php?destination=Rome">Book now</a>
                    </div>
                </div>
            </article>
            <article class="destination-card">
                <img class="destination-image" src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=80" alt="Chiang Mai destination">
                <div class="destination-card-body">
                    <span>Nature</span>
                    <h3>Chiang Mai</h3>
                    <p>Mountain views, temples, cafes, and calm weekend escapes.</p>
                    <div class="destination-actions">
                        <a class="button secondary" href="map.php?place=Chiang%20Mai">View on map</a>
                        <a class="button primary" href="planner.php?destination=Chiang%20Mai">Book now</a>
                    </div>
                </div>
            </article>
            <article class="destination-card">
                <img class="destination-image" src="https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1200&q=80" alt="Osaka destination">
                <div class="destination-card-body">
                    <span>Food</span>
                    <h3>Osaka</h3>
                    <p>Excellent local cuisine, night streets, and energetic neighborhoods.</p>
                    <div class="destination-actions">
                        <a class="button secondary" href="map.php?place=Osaka">View on map</a>
                        <a class="button primary" href="planner.php?destination=Osaka">Book now</a>
                    </div>
                </div>
            </article>
            <article class="destination-card">
                <img class="destination-image" src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80" alt="Dubai destination">
                <div class="destination-card-body">
                    <span>Luxury</span>
                    <h3>Dubai</h3>
                    <p>Premium hotels, entertainment, shopping, and skyline experiences.</p>
                    <div class="destination-actions">
                        <a class="button secondary" href="map.php?place=Dubai">View on map</a>
                        <a class="button primary" href="planner.php?destination=Dubai">Book now</a>
                    </div>
                </div>
            </article>
        </div>
    </section>
</div>
<?php renderPageEnd(); ?>
