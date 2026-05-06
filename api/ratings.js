const { readJsonBody, saveRating, sendJson } = require("./_lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  try {
    const { userId, tripId = null, ratingValue, reviewText } = readJsonBody(req);

    if (!userId || !ratingValue) {
      return sendJson(res, 400, { message: "User and rating are required." });
    }

    if (Number(ratingValue) < 1 || Number(ratingValue) > 5) {
      return sendJson(res, 400, { message: "Please select a rating from 1 to 5." });
    }

    const rating = await saveRating({
      userId,
      tripId,
      ratingValue: Number(ratingValue),
      reviewText
    });

    return sendJson(res, 201, { message: "Rating saved successfully.", rating });
  } catch (error) {
    return sendJson(res, error.status || 500, {
      message: error.status ? error.message : "Could not save rating."
    });
  }
};
