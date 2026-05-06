const plannerForm = document.getElementById("planner-form");
const resultPlaceholder = document.getElementById("result-placeholder");
const resultContent = document.getElementById("result-content");
const resultTitle = document.getElementById("result-title");
const tripDuration = document.getElementById("trip-duration");
const dailyBudget = document.getElementById("daily-budget");
const hotelBudget = document.getElementById("hotel-budget");
const activityBudget = document.getElementById("activity-budget");
const budgetBreakdown = document.getElementById("budget-breakdown");
const itineraryList = document.getElementById("itinerary-list");
const logoutButton = document.getElementById("logout-button");
const navUser = document.getElementById("nav-user");
const guestLinks = document.querySelectorAll(".auth-guest");
const userOnlyItems = document.querySelectorAll(".auth-user");
const adminOnlyItems = document.querySelectorAll(".admin-only");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const contactForm = document.getElementById("contact-form");
const ratingForm = document.getElementById("rating-form");
const bookingRatingForm = document.getElementById("booking-rating-form");
const bookingRatingSection = document.getElementById("booking-rating-section");
const bookingRatingTrip = document.getElementById("booking-rating-trip");
const adminLoginForm = document.getElementById("admin-login-form");
const adminUsersList = document.getElementById("admin-users-list");
const adminTripsList = document.getElementById("admin-trips-list");
const adminMessagesList = document.getElementById("admin-messages-list");
const adminRatingsList = document.getElementById("admin-ratings-list");
const mapBookingForm = document.getElementById("map-booking-form");
const mapBookingDestination = document.getElementById("map-booking-destination");

const storageKeys = {
  user: "tripcraft-current-user",
  admin: "tripcraft-admin-session",
  lastTrip: "tripcraft-last-trip",
  ratedTripIds: "tripcraft-rated-trip-ids"
};

const styleMultipliers = {
  budget: { hotel: 0.28, food: 0.22, transport: 0.15, activities: 0.15, extra: 0.2 },
  balanced: { hotel: 0.35, food: 0.2, transport: 0.15, activities: 0.18, extra: 0.12 },
  comfort: { hotel: 0.42, food: 0.18, transport: 0.14, activities: 0.16, extra: 0.1 }
};

const currencyLocales = {
  USD: "en-US",
  MMK: "my-MM",
  THB: "th-TH",
  EUR: "de-DE",
  JPY: "ja-JP",
  SGD: "en-SG"
};

const interestActivities = {
  culture: [
    "Visit a landmark and take photos in the historic district",
    "Explore a museum or cultural center",
    "Enjoy a relaxed evening walk through a local neighborhood"
  ],
  nature: [
    "Start with a scenic park, beach, or mountain viewpoint",
    "Try an outdoor activity or short nature excursion",
    "End the day with sunset views and local food"
  ],
  food: [
    "Explore a local breakfast spot or market",
    "Plan a midday food crawl with signature dishes",
    "Reserve the evening for a highly rated restaurant"
  ],
  shopping: [
    "Begin at a popular shopping street or lifestyle mall",
    "Compare souvenirs and local products in smaller markets",
    "Wrap up with a night market or entertainment area"
  ]
};

const sampleDestinations = [
  { name: "Bali", country: "Indonesia", coords: [-8.4095, 115.1889] },
  { name: "Seoul", country: "South Korea", coords: [37.5665, 126.978] },
  { name: "Rome", country: "Italy", coords: [41.9028, 12.4964] },
  { name: "Chiang Mai", country: "Thailand", coords: [18.7883, 98.9853] },
  { name: "Osaka", country: "Japan", coords: [34.6937, 135.5023] },
  { name: "Dubai", country: "United Arab Emirates", coords: [25.2048, 55.2708] }
];

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const responseText = await response.text();
  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch (_error) {
      data = { message: responseText };
    }
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

function formatCurrency(value, currency = "USD") {
  const locale = currencyLocales[currency] || "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

function calculateTripDays(startDateValue, endDateValue) {
  const startDate = new Date(startDateValue);
  const endDate = new Date(endDateValue);
  const diff = endDate - startDate;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  return Number.isFinite(days) ? days : 0;
}

function getCurrentUser() {
  const raw = localStorage.getItem(storageKeys.user);
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  localStorage.setItem(storageKeys.user, JSON.stringify(user));
}

function getAdminSession() {
  const raw = localStorage.getItem(storageKeys.admin);
  return raw ? JSON.parse(raw) : null;
}

function setAdminSession(session) {
  localStorage.setItem(storageKeys.admin, JSON.stringify(session));
}

function getLastTrip() {
  const raw = localStorage.getItem(storageKeys.lastTrip);
  return raw ? JSON.parse(raw) : null;
}

function setLastTrip(trip) {
  localStorage.setItem(storageKeys.lastTrip, JSON.stringify(trip));
}

function getRatedTripIds() {
  const raw = localStorage.getItem(storageKeys.ratedTripIds);
  return raw ? JSON.parse(raw) : [];
}

function rememberRatedTripId(tripId) {
  const current = new Set(getRatedTripIds());
  current.add(tripId);
  localStorage.setItem(storageKeys.ratedTripIds, JSON.stringify([...current]));
}

function hasRatedTrip(tripId) {
  return getRatedTripIds().includes(tripId);
}

function showMessage(element, message, isSuccess = false) {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.remove("hidden", "success");

  if (isSuccess) {
    element.classList.add("success");
  }
}

function syncAuthUi() {
  const user = getCurrentUser();
  const admin = getAdminSession();

  guestLinks.forEach((item) => item.classList.toggle("hidden", Boolean(user) || Boolean(admin)));
  userOnlyItems.forEach((item) => item.classList.toggle("hidden", !user && !admin));
  adminOnlyItems.forEach((item) => item.classList.toggle("hidden", !admin));

  if (navUser) {
    navUser.textContent = admin ? "Admin" : user ? `Hi, ${user.name}` : "";
  }
}

function protectPage() {
  const isProtected = document.body.dataset.protected === "true";
  if (isProtected && !getCurrentUser()) {
    window.location.href = "login.html";
  }
}

function protectAdminPage() {
  const isProtected = document.body.dataset.adminProtected === "true";
  if (isProtected && !getAdminSession()) {
    window.location.href = "admin-login.html";
  }
}

function handleLogout() {
  localStorage.removeItem(storageKeys.user);
  localStorage.removeItem(storageKeys.admin);
  syncAuthUi();
  window.location.href = "login.html";
}

function renderList(target, items, emptyText) {
  if (!target) {
    return;
  }

  target.innerHTML = "";

  if (items.length === 0) {
    const line = document.createElement("li");
    line.textContent = emptyText;
    target.appendChild(line);
    return;
  }

  items.forEach((item) => {
    const line = document.createElement("li");
    line.innerHTML = item;
    target.appendChild(line);
  });
}

async function renderAdminDashboard() {
  if (!adminUsersList || !adminTripsList || !adminMessagesList || !getAdminSession()) {
    return;
  }

  try {
    const data = await apiFetch("/api/admin/dashboard");

    document.getElementById("admin-user-count").textContent = String(data.counts.users);
    document.getElementById("admin-trip-count").textContent = String(data.counts.trips);
    document.getElementById("admin-message-count").textContent = String(data.counts.messages);

    const ratingCountElement = document.getElementById("admin-rating-count");
    if (ratingCountElement) {
      ratingCountElement.textContent = String(data.counts.ratings || 0);
    }

    renderList(
      adminUsersList,
      data.users.map((user) => `<strong>${user.name}</strong> - ${user.email}`),
      "No registered users yet."
    );

    renderList(
      adminTripsList,
      data.trips.map(
        (trip) =>
          `<strong>${trip.destination}</strong> - ${trip.days} day(s), ${formatCurrency(trip.budget, trip.currency || "USD")}, by ${trip.userName}`
      ),
      "No trip plans saved yet."
    );

    renderList(
      adminMessagesList,
      data.messages.map(
        (message) =>
          `<strong>${message.name}</strong> - ${message.email}<br>${message.message}`
      ),
      "No contact messages yet."
    );

    if (adminRatingsList) {
      renderList(
        adminRatingsList,
        (data.ratings || []).map(
          (rating) =>
            `<strong>${rating.userName}</strong> - ${rating.ratingValue}/5 for ${rating.tripDestination || "General Service"}<br>${rating.reviewText || "No review"}`
        ),
        "No ratings submitted yet."
      );
    }
  } catch (error) {
    renderList(adminUsersList, [], "Failed to load dashboard data.");
    renderList(adminTripsList, [], "Failed to load dashboard data.");
    renderList(adminMessagesList, [], "Failed to load dashboard data.");
    if (adminRatingsList) {
      renderList(adminRatingsList, [], "Failed to load dashboard data.");
    }
  }
}

function buildBreakdown(totalBudget, style) {
  const ratios = styleMultipliers[style];

  return [
    { label: "Hotel", value: totalBudget * ratios.hotel },
    { label: "Food", value: totalBudget * ratios.food },
    { label: "Transport", value: totalBudget * ratios.transport },
    { label: "Activities", value: totalBudget * ratios.activities },
    { label: "Emergency / Extra", value: totalBudget * ratios.extra }
  ];
}

function buildItinerary(days, interest, destination) {
  const activities = interestActivities[interest];
  const items = [];

  for (let day = 1; day <= days; day += 1) {
    const activity = activities[(day - 1) % activities.length];
    const focus = day === 1
      ? `Arrival, hotel check-in, and orientation around ${destination}`
      : day === days
        ? "Free time, shopping, and departure preparation"
        : activity;

    items.push(`Day ${day}: ${focus}`);
  }

  return items;
}

function renderTripSummary(tripData) {
  if (!resultTitle || !tripDuration || !dailyBudget || !hotelBudget || !activityBudget) {
    return;
  }

  const breakdown = buildBreakdown(tripData.budget, tripData.travelStyle);
  const itinerary = buildItinerary(tripData.days, tripData.interest, tripData.destination);
  const hotel = breakdown.find((item) => item.label === "Hotel")?.value || 0;
  const foodActivities =
    (breakdown.find((item) => item.label === "Food")?.value || 0) +
    (breakdown.find((item) => item.label === "Activities")?.value || 0);

  resultTitle.textContent = `${tripData.destination} Trip Plan`;
  tripDuration.textContent = `${tripData.days} day${tripData.days > 1 ? "s" : ""}`;
  dailyBudget.textContent = formatCurrency(tripData.budget / tripData.days, tripData.currency);
  hotelBudget.textContent = formatCurrency(hotel, tripData.currency);
  activityBudget.textContent = formatCurrency(foodActivities, tripData.currency);

  budgetBreakdown.innerHTML = "";
  itineraryList.innerHTML = "";

  breakdown.forEach((item) => {
    const line = document.createElement("li");
    line.textContent = `${item.label}: ${formatCurrency(item.value, tripData.currency)}`;
    budgetBreakdown.appendChild(line);
  });

  itinerary.forEach((item) => {
    const line = document.createElement("li");
    line.textContent = item;
    itineraryList.appendChild(line);
  });

  resultPlaceholder.classList.add("hidden");
  resultContent.classList.remove("hidden");
}

function renderBookingRatingPanel(tripData) {
  if (!bookingRatingSection || !bookingRatingTrip) {
    return;
  }

  bookingRatingTrip.textContent =
    `${tripData.destination} · ${tripData.days} day(s) · ${formatCurrency(tripData.budget, tripData.currency)}`;

  if (hasRatedTrip(tripData.id)) {
    bookingRatingSection.classList.remove("hidden");
    const status = document.getElementById("booking-rating-status");
    showMessage(status, "You already rated this booking. Thank you for your feedback.", true);
    if (bookingRatingForm) {
      Array.from(bookingRatingForm.elements).forEach((field) => {
        if (field.name !== "trip-id") {
          field.disabled = true;
        }
      });
    }
    return;
  }

  bookingRatingSection.classList.remove("hidden");
  if (bookingRatingForm) {
    bookingRatingForm.dataset.tripId = String(tripData.id);
    const hiddenInput = document.getElementById("booking-rating-trip-id");
    if (hiddenInput) {
      hiddenInput.value = String(tripData.id);
    }
  }
}

function prefillDestinationFromQuery() {
  if (!plannerForm) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const destination = params.get("destination");

  if (destination) {
    const destinationInput = document.getElementById("destination");
    if (destinationInput) {
      destinationInput.value = destination;
    }
  }
}

function initializeMapPage() {
  const mapElement = document.getElementById("tripcraft-map");

  if (!mapElement || typeof window.L === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const selectedPlace = params.get("place") || "";
  const tripcraftMap = L.map("tripcraft-map").setView([20.0, 100.0], 3);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(tripcraftMap);

  let searchMarker = null;
  const mapSearchInput = document.getElementById("map-search-input");
  const mapSearchButton = document.getElementById("map-search-button");
  const mapResetButton = document.getElementById("map-reset-button");
  const mapStatus = document.getElementById("map-status");

  function showMapStatus(message, isSuccess = false) {
    if (!mapStatus) {
      return;
    }

    mapStatus.textContent = message;
    mapStatus.classList.remove("hidden", "success");

    if (isSuccess) {
      mapStatus.classList.add("success");
    }
  }

  window.selectDestinationForBooking = (placeName) => {
    if (mapBookingDestination) {
      mapBookingDestination.value = placeName;
    }

    const bookingSection = document.getElementById("map-booking");
    bookingSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    showMapStatus(`${placeName} is ready in the booking form.`, true);
  };

  sampleDestinations.forEach((place) => {
    L.marker(place.coords)
      .addTo(tripcraftMap)
      .bindPopup(
        `<strong>${place.name}</strong><br>${place.country}<br><a href="#map-booking" onclick="selectDestinationForBooking('${place.name.replace(/'/g, "\\'")}'); return false;">Book this place</a>`
      );
  });

  async function searchLocation() {
    const query = mapSearchInput?.value.trim();

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
        .bindPopup(
          `<strong>${query}</strong><br>${firstResult.display_name}<br><a href="#map-booking" onclick="selectDestinationForBooking('${query.replace(/'/g, "\\'")}'); return false;">Book this place</a>`
        )
        .openPopup();
      tripcraftMap.setView([lat, lon], 11);

      if (mapBookingDestination) {
        mapBookingDestination.value = query;
      }

      showMapStatus("Location found successfully.", true);
    } catch (_error) {
      showMapStatus("Unable to load map search results right now.");
    }
  }

  mapSearchButton?.addEventListener("click", searchLocation);

  mapSearchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchLocation();
    }
  });

  mapResetButton?.addEventListener("click", () => {
    tripcraftMap.setView([20.0, 100.0], 3);

    if (searchMarker) {
      tripcraftMap.removeLayer(searchMarker);
      searchMarker = null;
    }

    if (mapSearchInput) {
      mapSearchInput.value = "";
    }

    showMapStatus("Map view reset.", true);
  });

  if (selectedPlace && mapSearchInput) {
    mapSearchInput.value = selectedPlace;
    if (mapBookingDestination) {
      mapBookingDestination.value = selectedPlace;
    }
    searchLocation();
  }
}

if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout);
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const message = document.getElementById("login-message");

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      setCurrentUser(data.user);
      localStorage.removeItem(storageKeys.admin);
      showMessage(message, "Login successful. Redirecting to planner...", true);
      syncAuthUi();
      setTimeout(() => {
        window.location.href = "planner.html";
      }, 700);
    } catch (error) {
      showMessage(message, error.message);
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const message = document.getElementById("register-message");

    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });

      setCurrentUser(data.user);
      localStorage.removeItem(storageKeys.admin);
      showMessage(message, "Account created successfully. Redirecting to planner...", true);
      syncAuthUi();
      setTimeout(() => {
        window.location.href = "planner.html";
      }, 700);
    } catch (error) {
      showMessage(message, error.message);
    }
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.getElementById("contact-status");
    const payload = {
      name: document.getElementById("contact-name").value.trim(),
      email: document.getElementById("contact-email").value.trim(),
      message: document.getElementById("contact-message").value.trim()
    };

    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      showMessage(status, "Message sent successfully. We will get back to you soon.", true);
      contactForm.reset();
    } catch (error) {
      showMessage(status, error.message);
    }
  });
}

if (ratingForm) {
  ratingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const currentUser = getCurrentUser();
    const status = document.getElementById("rating-status");

    if (!currentUser) {
      showMessage(status, "Please log in to rate the service.");
      return;
    }

    try {
      await apiFetch("/api/ratings", {
        method: "POST",
        body: JSON.stringify({
          userId: currentUser.id,
          ratingValue: Number(document.getElementById("service-rating").value),
          reviewText: document.getElementById("service-review").value.trim()
        })
      });

      showMessage(status, "Thank you for rating our service.", true);
      ratingForm.reset();
    } catch (error) {
      showMessage(status, error.message);
    }
  });
}

if (bookingRatingForm) {
  bookingRatingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const currentUser = getCurrentUser();
    const status = document.getElementById("booking-rating-status");
    const tripId = Number(document.getElementById("booking-rating-trip-id").value);

    if (!currentUser) {
      showMessage(status, "Please log in to rate your booking.");
      return;
    }

    try {
      await apiFetch("/api/ratings", {
        method: "POST",
        body: JSON.stringify({
          userId: currentUser.id,
          tripId,
          ratingValue: Number(document.getElementById("booking-rating-value").value),
          reviewText: document.getElementById("booking-rating-review").value.trim()
        })
      });

      rememberRatedTripId(tripId);
      showMessage(status, "Thank you for rating your booking.", true);
    } catch (error) {
      showMessage(status, error.message);
    }
  });
}

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("admin-email").value.trim();
    const password = document.getElementById("admin-password").value;
    const message = document.getElementById("admin-message");

    try {
      const data = await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      setAdminSession(data.admin);
      localStorage.removeItem(storageKeys.user);
      showMessage(message, "Admin login successful. Redirecting to dashboard...", true);
      syncAuthUi();
      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 700);
    } catch (error) {
      showMessage(message, error.message);
    }
  });
}

async function saveTripFromForm({
  destination,
  startDate,
  endDate,
  totalBudget,
  currency,
  travelStyle,
  interest
}) {
  const currentUser = getCurrentUser();
  const days = calculateTripDays(startDate, endDate);

  if (!currentUser) {
    throw new Error("Please log in before creating a trip plan.");
  }

  if (!destination || !startDate || !endDate || !totalBudget || days <= 0) {
    throw new Error(
      "Please enter a valid destination, dates, and budget. The end date must be the same as or later than the start date."
    );
  }

  const payload = {
    userId: currentUser.id,
    destination,
    startDate,
    endDate,
    days,
    budget: totalBudget,
    currency,
    travelStyle,
    interest
  };

  const response = await apiFetch("/api/trips", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const tripData = {
    ...payload,
    id: response.trip?.id || Date.now()
  };

  setLastTrip(tripData);
  return tripData;
}

if (plannerForm) {
  plannerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const destination = document.getElementById("destination").value.trim();
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
    const totalBudget = Number(document.getElementById("budget").value);
    const currency = document.getElementById("currency").value;
    const travelStyle = document.getElementById("travel-style").value;
    const interest = document.getElementById("interest").value;

    try {
      const tripData = await saveTripFromForm({
        destination,
        startDate,
        endDate,
        totalBudget,
        currency,
        travelStyle,
        interest
      });

      renderTripSummary(tripData);
      renderBookingRatingPanel(tripData);
    } catch (error) {
      resultPlaceholder.textContent = error.message;
      resultPlaceholder.classList.remove("hidden");
      resultContent.classList.add("hidden");
    }
  });
}

if (mapBookingForm) {
  mapBookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const status = document.getElementById("map-booking-status");

    try {
      const tripData = await saveTripFromForm({
        destination: document.getElementById("map-booking-destination").value.trim(),
        startDate: document.getElementById("map-start-date").value,
        endDate: document.getElementById("map-end-date").value,
        totalBudget: Number(document.getElementById("map-budget").value),
        currency: document.getElementById("map-currency").value,
        travelStyle: document.getElementById("map-travel-style").value,
        interest: document.getElementById("map-interest").value
      });

      showMessage(status, "Trip saved from the map. Redirecting to rating page...", true);
      setLastTrip(tripData);
      setTimeout(() => {
        window.location.href = `planner.html?destination=${encodeURIComponent(tripData.destination)}`;
      }, 700);
    } catch (error) {
      showMessage(status, error.message);
    }
  });
}

function hydratePlannerWithSavedTrip() {
  if (!plannerForm) {
    return;
  }

  prefillDestinationFromQuery();

  const lastTrip = getLastTrip();
  const destinationInput = document.getElementById("destination");

  if (destinationInput && !destinationInput.value && lastTrip?.destination) {
    destinationInput.value = lastTrip.destination;
  }

  if (lastTrip) {
    renderTripSummary(lastTrip);
    renderBookingRatingPanel(lastTrip);
  }
}

protectPage();
protectAdminPage();
syncAuthUi();
renderAdminDashboard();
hydratePlannerWithSavedTrip();
initializeMapPage();
