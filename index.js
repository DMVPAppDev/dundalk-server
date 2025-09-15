import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Root endpoint
app.get("/", (req, res) => {
  res.send("Hello Dundalk — your Render server is running!");
});

// ✅ Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ status: "ok", message: "API is working" });
});

// ✅ Static events fallback
app.get("/api/events", (req, res) => {
  res.json({
    status: "ok",
    events: [
      {
        id: "1",
        name: "Dundalk Farmers Market",
        date: "2025-09-20",
        location: "Market Square, Dundalk",
      },
      {
        id: "2",
        name: "Traditional Irish Music Night",
        date: "2025-09-21",
        location: "The Spirit Store, Dundalk",
      },
    ],
  });
});

// ✅ Static news fallback
app.get("/api/news", (req, res) => {
  res.json({
    status: "ok",
    news: [
      {
        id: "1",
        headline: "Local Dundalk school wins national award",
        date: "2025-09-10",
      },
      {
        id: "2",
        headline: "Town prepares for annual music festival",
        date: "2025-09-12",
      },
    ],
  });
});

// ✅ Live Foursquare Venues (using Places v3 /nearby endpoint)
app.get("/api/venues", async (req, res) => {
  try {
    const { lat, lng, radius_m, query, limit } = req.query;
    const token = process.env.FOURSQUARE_API_KEY;

    if (!lat || !lng) {
      return res.status(400).json({
        status: "error",
        message: "lat and lng query parameters are required",
      });
    }

    const url = new URL("https://api.foursquare.com/v3/places/nearby");
    url.searchParams.append("ll", `${lat},${lng}`);
    if (radius_m) url.searchParams.append("radius", radius_m);
    if (query) url.searchParams.append("query", query);
    if (limit) url.searchParams.append("limit", limit);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: token,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Foursquare API error: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      status: "ok",
      venues: data.results,
    });
  } catch (error) {
    console.error("Error fetching Foursquare venues:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch venues",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
