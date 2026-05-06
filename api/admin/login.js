const { readJsonBody, sendJson, verifyUser } = require("../_lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  try {
    const { email, password } = readJsonBody(req);
    const admin = await verifyUser(email, password, "admin");

    if (!admin) {
      return sendJson(res, 401, { message: "Incorrect admin email or password." });
    }

    return sendJson(res, 200, { admin });
  } catch (error) {
    return sendJson(res, error.status || 500, {
      message: error.status ? error.message : "Could not log in as admin."
    });
  }
};
