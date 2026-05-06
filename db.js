const crypto = require("crypto");
const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tripcraft_db"
};

let pool;

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  return pool;
}

async function initializeDatabase() {
  const db = await getPool();

  await db.execute(
    `
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        password_hash = VALUES(password_hash),
        role = VALUES(role)
    `,
    ["TripCraft Admin", "admin@tripcraft.com", hashPassword("admin123"), "admin"]
  );
}

async function createUser(name, email, password) {
  const db = await getPool();
  const [result] = await db.execute(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')",
    [name, email, hashPassword(password)]
  );

  return getUserById(result.insertId);
}

async function getUserById(id) {
  const db = await getPool();
  const [rows] = await db.execute(
    "SELECT id, name, email, role, created_at AS createdAt FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function getUserByEmail(email) {
  const db = await getPool();
  const [rows] = await db.execute(
    "SELECT id, name, email, role, password_hash AS passwordHash, created_at AS createdAt FROM users WHERE email = ?",
    [email]
  );
  return rows[0] || null;
}

async function verifyUser(email, password, role = "user") {
  const user = await getUserByEmail(email);

  if (!user || user.role !== role) {
    return null;
  }

  if (user.passwordHash !== hashPassword(password)) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

async function saveContact(name, email, message) {
  const db = await getPool();
  await db.execute("INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)", [
    name,
    email,
    message
  ]);
}

async function saveTrip({ userId, destination, startDate, endDate, days, budget, travelStyle, interest }) {
  const db = await getPool();
  await db.execute(
    `
      INSERT INTO trips (user_id, destination, start_date, end_date, days, budget, travel_style, interest)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [userId, destination, startDate, endDate, days, budget, travelStyle, interest]
  );
}

async function getDashboardData() {
  const db = await getPool();

  const [[userCountRow]] = await db.execute(
    "SELECT COUNT(*) AS count FROM users WHERE role = 'user'"
  );
  const [[tripCountRow]] = await db.execute("SELECT COUNT(*) AS count FROM trips");
  const [[messageCountRow]] = await db.execute("SELECT COUNT(*) AS count FROM contacts");

  const [users] = await db.execute(
    "SELECT id, name, email, created_at AS createdAt FROM users WHERE role = 'user' ORDER BY id DESC"
  );
  const [trips] = await db.execute(
    `
      SELECT trips.id, users.name AS userName, trips.destination, trips.days, trips.budget,
             trips.travel_style AS travelStyle, trips.interest, trips.created_at AS createdAt
      FROM trips
      JOIN users ON users.id = trips.user_id
      ORDER BY trips.id DESC
    `
  );
  const [messages] = await db.execute(
    "SELECT id, name, email, message, created_at AS createdAt FROM contacts ORDER BY id DESC"
  );

  return {
    counts: {
      users: userCountRow.count,
      trips: tripCountRow.count,
      messages: messageCountRow.count
    },
    users,
    trips,
    messages
  };
}

module.exports = {
  dbConfig,
  initializeDatabase,
  createUser,
  getUserByEmail,
  saveContact,
  saveTrip,
  verifyUser,
  getDashboardData
};
