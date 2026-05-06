const crypto = require("crypto");

function getEnv(name) {
  const value = process.env[name];

  if (!value) {
    const error = new Error(`Project setup is incomplete. Missing environment variable: ${name}. Add it in Vercel Environment Variables and redeploy.`);
    error.status = 500;
    throw error;
  }

  return value;
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function buildUrl(path, query = {}) {
  const url = new URL(path, getEnv("SUPABASE_URL"));

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url;
}

async function supabaseRequest(path, { method = "GET", query, body, headers = {} } = {}) {
  const url = buildUrl(path, query);
  const apiKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  const response = await fetch(url, {
    method,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_error) {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error_description || data.error)) ||
      "Supabase request failed.";
    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

function readJsonBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (_error) {
      return {};
    }
  }

  return req.body;
}

function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

async function getUserByEmail(email) {
  const rows = await supabaseRequest("/rest/v1/users", {
    query: {
      select: "id,name,email,role,password_hash,created_at",
      email: `eq.${email}`,
      limit: "1"
    }
  });

  return rows[0] || null;
}

async function getUsersByIds(userIds) {
  if (!userIds.length) {
    return [];
  }

  return supabaseRequest("/rest/v1/users", {
    query: {
      select: "id,name,email,role,created_at",
      id: `in.(${userIds.join(",")})`
    }
  });
}

async function createUser({ name, email, password }) {
  const rows = await supabaseRequest("/rest/v1/users", {
    method: "POST",
    headers: {
      Prefer: "return=representation"
    },
    body: {
      name,
      email,
      password_hash: hashPassword(password),
      role: "user"
    }
  });

  const user = Array.isArray(rows) ? rows[0] : rows;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at
  };
}

async function verifyUser(email, password, role) {
  const user = await getUserByEmail(email);

  if (!user || user.role !== role) {
    return null;
  }

  if (user.password_hash !== hashPassword(password)) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at
  };
}

async function saveContact({ name, email, message }) {
  await supabaseRequest("/rest/v1/contacts", {
    method: "POST",
    body: { name, email, message }
  });
}

async function saveTrip({ userId, destination, startDate, endDate, days, budget, travelStyle, interest, currency }) {
  const rows = await supabaseRequest("/rest/v1/trips", {
    method: "POST",
    headers: {
      Prefer: "return=representation"
    },
    body: {
      user_id: userId,
      destination,
      start_date: startDate,
      end_date: endDate,
      days,
      budget,
      travel_style: travelStyle,
      interest,
      currency: currency || "USD"
    }
  });

  return Array.isArray(rows) ? rows[0] : rows;
}

async function saveRating({ userId, tripId = null, ratingValue, reviewText }) {
  const rows = await supabaseRequest("/rest/v1/ratings", {
    method: "POST",
    headers: {
      Prefer: "return=representation"
    },
    body: {
      user_id: userId,
      trip_id: tripId,
      rating_value: ratingValue,
      review_text: reviewText || null
    }
  });

  return Array.isArray(rows) ? rows[0] : rows;
}

async function getDashboardData() {
  const [users, trips, messages, ratings] = await Promise.all([
    supabaseRequest("/rest/v1/users", {
      query: {
        select: "id,name,email,role,created_at",
        role: "eq.user",
        order: "id.desc"
      }
    }),
    supabaseRequest("/rest/v1/trips", {
      query: {
        select: "id,user_id,destination,days,budget,travel_style,interest,currency,created_at",
        order: "id.desc"
      }
    }),
    supabaseRequest("/rest/v1/contacts", {
      query: {
        select: "id,name,email,message,created_at",
        order: "id.desc"
      }
    }),
    supabaseRequest("/rest/v1/ratings", {
      query: {
        select: "id,user_id,trip_id,rating_value,review_text,created_at",
        order: "id.desc"
      }
    })
  ]);

  const userMap = new Map(users.map((user) => [user.id, user]));
  const tripMap = new Map(trips.map((trip) => [trip.id, trip]));

  return {
    counts: {
      users: users.length,
      trips: trips.length,
      messages: messages.length,
      ratings: ratings.length
    },
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at
    })),
    trips: trips.map((trip) => ({
      id: trip.id,
      userName: userMap.get(trip.user_id)?.name || "Unknown User",
      destination: trip.destination,
      days: trip.days,
      budget: trip.budget,
      travelStyle: trip.travel_style,
      interest: trip.interest,
      currency: trip.currency,
      createdAt: trip.created_at
    })),
    messages: messages.map((message) => ({
      id: message.id,
      name: message.name,
      email: message.email,
      message: message.message,
      createdAt: message.created_at
    })),
    ratings: ratings.map((rating) => ({
      id: rating.id,
      userName: userMap.get(rating.user_id)?.name || "Unknown User",
      tripDestination: tripMap.get(rating.trip_id)?.destination || null,
      ratingValue: rating.rating_value,
      reviewText: rating.review_text,
      createdAt: rating.created_at
    }))
  };
}

module.exports = {
  createUser,
  getUserByEmail,
  getUsersByIds,
  hashPassword,
  readJsonBody,
  saveRating,
  saveContact,
  saveTrip,
  sendJson,
  supabaseRequest,
  verifyUser,
  getDashboardData
};
