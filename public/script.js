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
const adminLoginForm = document.getElementById("admin-login-form");
const adminUsersList = document.getElementById("admin-users-list");
const adminTripsList = document.getElementById("admin-trips-list");
const adminMessagesList = document.getElementById("admin-messages-list");

const storageKeys = {
  user: "tripcraft-current-user",
  admin: "tripcraft-admin-session"
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

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

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
  } catch (error) {
    renderList(adminUsersList, [], "Failed to load dashboard data.");
    renderList(adminTripsList, [], "Failed to load dashboard data.");
    renderList(adminMessagesList, [], "Failed to load dashboard data.");
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

if (plannerForm) {
  plannerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const currentUser = getCurrentUser();
    const destination = document.getElementById("destination").value.trim();
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
    const totalBudget = Number(document.getElementById("budget").value);
    const currency = document.getElementById("currency").value;
    const travelStyle = document.getElementById("travel-style").value;
    const interest = document.getElementById("interest").value;

    const days = calculateTripDays(startDate, endDate);

    if (!currentUser) {
      resultPlaceholder.textContent = "Please log in before creating a trip plan.";
      resultPlaceholder.classList.remove("hidden");
      resultContent.classList.add("hidden");
      return;
    }

    if (!destination || !startDate || !endDate || !totalBudget || days <= 0) {
      resultPlaceholder.textContent =
        "Please enter a valid destination, dates, and budget. The end date must be the same as or later than the start date.";
      resultPlaceholder.classList.remove("hidden");
      resultContent.classList.add("hidden");
      return;
    }

    const breakdown = buildBreakdown(totalBudget, travelStyle);
    const itinerary = buildItinerary(days, interest, destination);
    const hotel = breakdown.find((item) => item.label === "Hotel")?.value || 0;
    const foodActivities =
      (breakdown.find((item) => item.label === "Food")?.value || 0) +
      (breakdown.find((item) => item.label === "Activities")?.value || 0);

    try {
      await apiFetch("/api/trips", {
        method: "POST",
        body: JSON.stringify({
          userId: currentUser.id,
          destination,
          startDate,
          endDate,
          days,
          budget: totalBudget,
          currency,
          travelStyle,
          interest
        })
      });
    } catch (error) {
      resultPlaceholder.textContent = error.message;
      resultPlaceholder.classList.remove("hidden");
      resultContent.classList.add("hidden");
      return;
    }

    resultTitle.textContent = `${destination} Trip Plan`;
    tripDuration.textContent = `${days} day${days > 1 ? "s" : ""}`;
    dailyBudget.textContent = formatCurrency(totalBudget / days, currency);
    hotelBudget.textContent = formatCurrency(hotel, currency);
    activityBudget.textContent = formatCurrency(foodActivities, currency);

    budgetBreakdown.innerHTML = "";
    itineraryList.innerHTML = "";

    breakdown.forEach((item) => {
      const line = document.createElement("li");
      line.textContent = `${item.label}: ${formatCurrency(item.value, currency)}`;
      budgetBreakdown.appendChild(line);
    });

    itinerary.forEach((item) => {
      const line = document.createElement("li");
      line.textContent = item;
      itineraryList.appendChild(line);
    });

    resultPlaceholder.classList.add("hidden");
    resultContent.classList.remove("hidden");
  });
}

protectPage();
protectAdminPage();
syncAuthUi();
renderAdminDashboard();
