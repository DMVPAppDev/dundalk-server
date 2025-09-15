import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Hello Dundalk — your Render server is running!");
});

app.get("/api/test", (req, res) => {
  res.json({ status: "ok", message: "API is working" });
});

// Events fallback
app.get("/api/events", (req, res) => {
  res.json({
    status: "ok",
    events: [
      { id: "1", name: "Dundalk Farmers Market", date: "2025-09-20", location: "Market Square" },
      { id: "2", name: "Irish Music Night", date: "2025-09-21", location: "The Spirit Store" },
    ],
  });
});

// News fallback
app.get("/api/news", (req, res) => {
  res.json({
    status: "ok",
    news: [
      { id: "1", headline: "Local school wins award", date: "2025-09-10" },
      { id: "2", headline: "Town prepares for festival", date: "2025-09-12" },
    ],
  });
});

// Venues (debug version)
app.get("/api/venues", async (req, res) => {
  try {
    const { lat, lng, radius_m, query, limit } = req.query;
    const token = process.env.FOURSQUARE_API_KEY;

    if (!lat || !lng) {
      return res.status(400).json({ status: "error", message: "lat and lng required" });
    }

    const url = new URL("https://api.foursquare.com/v3/places/nearby");
    url.searchParams.append("ll", `${lat},${lng}`);
    if (radius_m) url.searchParams.append("radius", radius_m);
    if (query) url.searchParams.append("query", query);
    if (limit) url.searchParams.append("limit", limit);

    console.log("🔍 Fetching from Foursquare:", url.toString());

    const response = await fetch(url.toString(), {
      headers: { Authorization: token, Accept: "application/json" },
    });

    const text = await response.text(); // get raw text no matter what
    console.log("📜 Raw response from Foursquare:", text);

    // Try parse JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        status: "error",
        message: "Foursquare API error",
        details: data,
      });
    }

    res.json({ status: "ok", venues: data.results || data });
  } catch (err) {
    console.error("❌ Error in /api/venues:", err.message);
    res.status(500).json({ status: "error", message: "Server error", details: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
