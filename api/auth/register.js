const {
  createUser,
  getUserByEmail,
  readJsonBody,
  sendJson
} = require("../_lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  try {
    const { name, email, password } = readJsonBody(req);

    if (!name || !email || !password) {
      return sendJson(res, 400, { message: "Name, email, and password are required." });
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return sendJson(res, 409, { message: "An account with this email already exists." });
    }

    const user = await createUser({ name, email, password });
    return sendJson(res, 201, { user });
  } catch (error) {
    return sendJson(res, error.status || 500, {
      message: error.status ? error.message : "Could not create account."
    });
  }
};
