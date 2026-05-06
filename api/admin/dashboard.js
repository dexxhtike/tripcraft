const { getDashboardData, sendJson } = require("../_lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  try {
    const data = await getDashboardData();
    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, error.status || 500, {
      message: error.status ? error.message : "Could not load dashboard data."
    });
  }
};
