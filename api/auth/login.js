const { readJsonBody, sendJson, verifyUser } = require("../_lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  try {
    const { email, password } = readJsonBody(req);
    const user = await verifyUser(email, password, "user");

    if (!user) {
      return sendJson(res, 401, { message: "Incorrect email or password." });
    }

    return sendJson(res, 200, { user });
  } catch (error) {
    return sendJson(res, error.status || 500, {
      message: error.status ? error.message : "Could not log in."
    });
  }
};
