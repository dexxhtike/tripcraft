const { readJsonBody, saveTrip, sendJson } = require("./_lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  try {
    const {
      userId,
      destination,
      startDate,
      endDate,
      days,
      budget,
      travelStyle,
      interest,
      currency
    } = readJsonBody(req);

    if (!userId || !destination || !startDate || !endDate || !days || !budget || !travelStyle || !interest) {
      return sendJson(res, 400, { message: "Trip data is incomplete." });
    }

    const trip = await saveTrip({
      userId,
      destination,
      startDate,
      endDate,
      days,
      budget,
      travelStyle,
      interest,
      currency
    });

    return sendJson(res, 201, { message: "Trip saved successfully.", trip });
  } catch (error) {
    return sendJson(res, error.status || 500, {
      message: error.status ? error.message : "Could not save trip."
    });
  }
};
