const axios = require("axios");
const HttpError = require("../models/http-error");
const getCoordsForAddress = async (address) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: address,
          format: "json",
        },
      }
    );
    const data = response.data;
    // Check if the response has data and extract the latitude and longitude
    if (data.length > 0) {
      const { lat, lon } = data[0];
      return { lat, lon };
    } else {
      throw new HttpError("Address not found", 404);
    }
  } catch (error) {
    console.error("Error fetching geocoding data:", error);
    throw new HttpError("Internal server error", 500);
  }
};

module.exports = getCoordsForAddress;
