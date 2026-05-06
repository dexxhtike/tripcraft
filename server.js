require("dotenv").config();

const express = require("express");
const path = require("path");
const {
  dbConfig,
  initializeDatabase,
  createUser,
  getUserByEmail,
  saveContact,
  saveTrip,
  verifyUser,
  getDashboardData
} = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  try {
    const user = await createUser(name, email, password);
    return res.status(201).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Could not create account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await verifyUser(email, password, "user");

  if (!user) {
    return res.status(401).json({ message: "Incorrect email or password." });
  }

  return res.json({ user });
});

app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await verifyUser(email, password, "admin");

  if (!admin) {
    return res.status(401).json({ message: "Incorrect admin email or password." });
  }

  return res.json({ admin });
});

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required." });
  }

  await saveContact(name, email, message);
  return res.status(201).json({ message: "Message sent successfully." });
});

app.post("/api/trips", async (req, res) => {
  const { userId, destination, startDate, endDate, days, budget, travelStyle, interest } = req.body;

  if (!userId || !destination || !startDate || !endDate || !days || !budget || !travelStyle || !interest) {
    return res.status(400).json({ message: "Trip data is incomplete." });
  }

  await saveTrip({ userId, destination, startDate, endDate, days, budget, travelStyle, interest });
  return res.status(201).json({ message: "Trip saved successfully." });
});

app.get("/api/admin/dashboard", async (_req, res) => {
  return res.json(await getDashboardData());
});

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(
        `Trip Planner server running at http://localhost:${PORT} using MySQL ${dbConfig.database}`
      );
    });
  } catch (error) {
    console.error("Failed to connect to MySQL. Check XAMPP/MySQL and import schema.sql first.");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
