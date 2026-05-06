const { readJsonBody, saveContact, sendJson } = require("./_lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  try {
    const { name, email, message } = readJsonBody(req);

    if (!name || !email || !message) {
      return sendJson(res, 400, { message: "Name, email, and message are required." });
    }

    await saveContact({ name, email, message });
    return sendJson(res, 201, { message: "Message sent successfully." });
  } catch (error) {
    return sendJson(res, error.status || 500, {
      message: error.status ? error.message : "Could not send message."
    });
  }
};
