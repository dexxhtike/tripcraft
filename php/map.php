<?php
require_once "config.php";

$selectedPlace = trim($_GET["place"] ?? "");
$mapMessage = "";
$mapMessageType = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $destination = trim($_POST["destination"] ?? "");
    $startDate = $_POST["start_date"] ?? "";
    $endDate = $_POST["end_date"] ?? "";
    $budget = trim($_POST["budget"] ?? "");
    $currency = trim($_POST["currency"] ?? "");
    $travelStyle = trim($_POST["travel_style"] ?? "");
    $interest = trim($_POST["interest"] ?? "");
    $selectedPlace = $destination;

    if (
        $destination === "" ||
        $startDate === "" ||
        $endDate === "" ||
        $budget === "" ||
        $currency === "" ||
        $travelStyle === "" ||
        $interest === ""
    ) {
        $mapMessage = "All booking fields are required.";
        $mapMessageType = "error";
    } elseif (!isLoggedIn()) {
        $mapMessage = "Please log in before booking from the map.";
        $mapMessageType = "error";
    } else {
        $startTimestamp = strtotime($startDate);
        $endTimestamp = strtotime($endDate);

        if ($startTimestamp === false || $endTimestamp === false || $endTimestamp < $startTimestamp) {
            $mapMessage = "Please enter valid travel dates.";
            $mapMessageType = "error";
        } else {
            $days = (int) floor(($endTimestamp - $startTimestamp) / 86400) + 1;
            $budgetValue = (float) $budget;

            $stmt = $conn->prepare(
                "INSERT INTO trips (user_id, destination, start_date, end_date, days, budget, currency, travel_style, interest)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->bind_param(
                "isssidsss",
                $_SESSION["user_id"],
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

renderPageStart("Map");
?>
<div class="page-shell">
    <?php renderNavbar(); ?>

    <section class="page-hero">
        <p class="eyebrow">Interactive Map</p>
        <h1>Explore destinations visually with TripCraft.</h1>
        <p>
            This map system lets users search locations, view popular destinations,
            and book directly from the same page.
        </p>
    </section>

    <section class="section">
        <div class="map-layout">
            <article class="map-panel">
                <p class="eyebrow">Map Tools</p>
                <h2>Search and preview places</h2>
                <p class="helper-text">
                    Type a destination name and the map will move to that location.
                    Sample TripCraft destinations are also marked by default.
                </p>

                <div class="map-tools">
                    <input type="text" id="map-search-input" placeholder="Search a place, e.g. Tokyo, Japan">
                    <div class="map-actions">
                        <button class="button primary" id="map-search-button" type="button">Search Map</button>
                        <button class="button secondary" id="map-reset-button" type="button">Reset View</button>
                    </div>
                    <p class="status-message hidden" id="map-status"></p>
                </div>

                <ul class="list-clean">
                    <li><strong>Bali</strong> for beach escapes</li>
                    <li><strong>Seoul</strong> for city exploration</li>
                    <li><strong>Rome</strong> for history and architecture</li>
                    <li><strong>Chiang Mai</strong> for nature and calm travel</li>
                    <li><strong>Osaka</strong> for food experiences</li>
                    <li><strong>Dubai</strong> for luxury travel</li>
                </ul>
            </article>

            <article class="map-card">
                <div id="tripcraft-map"></div>
            </article>
        </div>

        <section class="auth-layout planner-followup" id="map-booking">
            <article class="info-card">
                <p class="eyebrow">Book From Map</p>
                <h2>Save your trip without leaving this page.</h2>
                <p class="helper-text">
                    Click a marker, search a location, or choose a popular place below. The destination will fill automatically in the booking form.
                </p>
                <?php if (!isLoggedIn()): ?>
                    <p class="status-message">
                        Please log in first if you want to save a booking from the map.
                    </p>
                <?php endif; ?>
            </article>

            <article class="auth-card">
                <form class="auth-form" method="post" action="">
                    <label>
                        Destination
                        <input
                            type="text"
                            id="map-booking-destination"
                            name="destination"
                            placeholder="Choose a place from the map"
                            value="<?php echo htmlspecialchars($selectedPlace); ?>"
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
                        <input type="number" name="budget" placeholder="e.g. 1200" step="0.01" min="0" required>
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
                    <?php if ($mapMessage !== ""): ?>
                        <p class="status-message<?php echo $mapMessageType === "success" ? " success" : ""; ?>">
                            <?php echo htmlspecialchars($mapMessage); ?>
                        </p>
                    <?php endif; ?>
                    <button class="button primary" type="submit">Book From Map</button>
                </form>
            </article>
        </section>

        <div class="section-heading" style="margin-top: 32px;">
            <p class="eyebrow">Popular Places</p>
            <h2>See top destinations in pictures</h2>
        </div>

        <div class="map-gallery">
            <article class="place-photo-card">
                <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80" alt="Bali beach scenery">
                <div class="content">
                    <h3>Bali</h3>
                    <p class="helper-text">Tropical beaches, temples, and sunset escapes.</p>
                    <div class="destination-actions">
                        <a class="button secondary" href="map.php?place=Bali">Focus map</a>
                        <button class="button primary" type="button" onclick="selectDestinationForBooking('Bali')">Book here</button>
                    </div>
                </div>
            </article>
            <article class="place-photo-card">
                <img src="https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=1200&q=80" alt="Seoul skyline">
                <div class="content">
                    <h3>Seoul</h3>
                    <p class="helper-text">A modern city with shopping, food, and nightlife.</p>
                    <div class="destination-actions">
                        <a class="button secondary" href="map.php?place=Seoul">Focus map</a>
                        <button class="button primary" type="button" onclick="selectDestinationForBooking('Seoul')">Book here</button>
                    </div>
                </div>
            </article>
            <article class="place-photo-card">
                <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80" alt="Dubai skyline">
                <div class="content">
                    <h3>Dubai</h3>
                    <p class="helper-text">Luxury travel, iconic skyline, and premium attractions.</p>
                    <div class="destination-actions">
                        <a class="button secondary" href="map.php?place=Dubai">Focus map</a>
                        <button class="button primary" type="button" onclick="selectDestinationForBooking('Dubai')">Book here</button>
                    </div>
                </div>
            </article>
        </div>
    </section>
</div>

<link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
>
<script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin=""
></script>
<script>
    const selectedPlace = <?php echo json_encode($selectedPlace, JSON_UNESCAPED_UNICODE); ?>;
    const tripcraftMap = L.map("tripcraft-map").setView([20.0, 100.0], 3);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(tripcraftMap);

    const sampleDestinations = [
        { name: "Bali", country: "Indonesia", coords: [-8.4095, 115.1889] },
        { name: "Seoul", country: "South Korea", coords: [37.5665, 126.9780] },
        { name: "Rome", country: "Italy", coords: [41.9028, 12.4964] },
        { name: "Chiang Mai", country: "Thailand", coords: [18.7883, 98.9853] },
        { name: "Osaka", country: "Japan", coords: [34.6937, 135.5023] },
        { name: "Dubai", country: "United Arab Emirates", coords: [25.2048, 55.2708] }
    ];

    let searchMarker = null;
    const bookingDestinationInput = document.getElementById("map-booking-destination");

    function bookingLinkHtml(placeName) {
        const safePlace = JSON.stringify(placeName);
        return `<a href="#map-booking" onclick='selectDestinationForBooking(${safePlace}); return false;'>Book this place</a>`;
    }

    window.selectDestinationForBooking = function(placeName) {
        bookingDestinationInput.value = placeName;
        document.getElementById("map-booking").scrollIntoView({ behavior: "smooth", block: "start" });
        showMapStatus(`${placeName} is ready in the booking form.`, true);
    };

    sampleDestinations.forEach((place) => {
        L.marker(place.coords)
            .addTo(tripcraftMap)
            .bindPopup(
                `<strong>${place.name}</strong><br>${place.country}<br>${bookingLinkHtml(place.name)}`
            );
    });

    const mapSearchInput = document.getElementById("map-search-input");
    const mapSearchButton = document.getElementById("map-search-button");
    const mapResetButton = document.getElementById("map-reset-button");
    const mapStatus = document.getElementById("map-status");

    function showMapStatus(message, isSuccess = false) {
        mapStatus.textContent = message;
        mapStatus.classList.remove("hidden", "success");

        if (isSuccess) {
            mapStatus.classList.add("success");
        }
    }

    async function searchLocation() {
        const query = mapSearchInput.value.trim();

        if (!query) {
            showMapStatus("Please enter a place name to search.");
            return;
        }

        showMapStatus("Searching map location...", true);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
            );
            const results = await response.json();

            if (!results.length) {
                showMapStatus("No map result found for that destination.");
                return;
            }

            const firstResult = results[0];
            const lat = Number(firstResult.lat);
            const lon = Number(firstResult.lon);

            if (searchMarker) {
                tripcraftMap.removeLayer(searchMarker);
            }

            searchMarker = L.marker([lat, lon]).addTo(tripcraftMap);
            searchMarker
                .bindPopup(`<strong>${query}</strong><br>${firstResult.display_name}<br>${bookingLinkHtml(query)}`)
                .openPopup();
            tripcraftMap.setView([lat, lon], 11);

            bookingDestinationInput.value = query;
            showMapStatus("Location found successfully.", true);
        } catch (error) {
            showMapStatus("Unable to load map search results right now.");
        }
    }

    mapSearchButton.addEventListener("click", searchLocation);

    mapSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchLocation();
        }
    });

    mapResetButton.addEventListener("click", () => {
        tripcraftMap.setView([20.0, 100.0], 3);

        if (searchMarker) {
            tripcraftMap.removeLayer(searchMarker);
            searchMarker = null;
        }

        mapSearchInput.value = "";
        showMapStatus("Map view reset.", true);
    });

    if (selectedPlace) {
        mapSearchInput.value = selectedPlace;
        bookingDestinationInput.value = selectedPlace;
        searchLocation();
    }
</script>
<?php renderPageEnd(); ?>
