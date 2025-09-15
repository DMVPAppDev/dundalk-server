const express = require("express");
const Parser = require("rss-parser");
const axios = require("axios");
const app = express();

const parser = new Parser();

// Root route
app.get("/", (req, res) => {
  res.send("Hello Dundalk - your Render server is working!");
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    status: "ok",
    data: {
      server: { ok: true }
    }
  });
});

// News endpoint
app.get("/api/news", async (req, res) => {
  try {
    const feeds = process.env.RSS_FEEDS ? process.env.RSS_FEEDS.split(",") : [];
    if (feeds.length === 0) {
      return res.status(500).json({ status: "error", message: "No RSS_FEEDS configured" });
    }

    const limit = parseInt(req.query.limit) || 10;
    let allItems = [];

    for (const feedUrl of feeds) {
      const feed = await parser.parseURL(feedUrl.trim());
      const source = feed.title || "Unknown Source";

      const items = feed.items.map(item => ({
        id: item.guid || item.link,
        title: item.title,
        link: item.link,
        snippet: item.contentSnippet || "",
        pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : null,
        source
      }));

      allItems = allItems.concat(items);
    }

    allItems.sort((a, b) => new Date(b.pub_date) - new Date(a.pub_date));

    res.json({
      status: "ok",
      data: allItems.slice(0, limit)
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch RSS feed" });
  }
});

// Events endpoint (static fallback)
app.get("/api/events", (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const sampleEvents = [
    {
      id: "eventbrite_1",
      title: "Dundalk Pub Quiz Night",
      description: "Join us for a fun-filled quiz night at Kennedy’s Bar.",
      start_time: "2025-09-20T19:00:00Z",
      end_time: "2025-09-20T22:00:00Z",
      venue_name: "Kennedy’s Bar",
      venue_lat: 54.0005,
      venue_lng: -6.4048,
      venue_address: "Town Centre, Dundalk",
      is_free: true,
      tickets_url: null,
      image_url: null
    },
    {
      id: "eventbrite_2",
      title: "Live Music: The Dundalk Sessions",
      description: "An evening of local talent performing live at Spirit Store.",
      start_time: "2025-09-22T20:00:00Z",
      end_time: "2025-09-22T23:00:00Z",
      venue_name: "Spirit Store",
      venue_lat: 54.0052,
      venue_lng: -6.3901,
      venue_address: "George's Quay, Dundalk",
      is_free: false,
      tickets_url: "https://spiritstore.ie/tickets",
      image_url: "https://via.placeholder.com/300x200.png?text=Live+Music"
    },
    {
      id: "eventbrite_3",
      title: "Family Fun Day",
      description: "Outdoor activities for kids under 10, with games, food, and music.",
      start_time: "2025-09-25T12:00:00Z",
      end_time: "2025-09-25T16:00:00Z",
      venue_name: "Ice House Hill Park",
      venue_lat: 54.0040,
      venue_lng: -6.4055,
      venue_address: "Park Lane, Dundalk",
      is_free: true,
      tickets_url: null,
      image_url: "https://via.placeholder.com/300x200.png?text=Family+Fun"
    }
  ];

  res.json({
    status: "ok",
    data: sampleEvents.slice(0, limit)
  });
});

// Venues endpoint (Foursquare proxy)
app.get("/api/venues", async (req, res) => {
  try {
    const token = process.env.FOURSQUARE_API_KEY;
    if (!token) {
      return res.status(500).json({ status: "error", message: "No FOURSQUARE_API_KEY configured" });
    }

    const lat = req.query.lat || 54.0;
    const lng = req.query.lng || -6.4;
    const radius = req.query.radius_m || 1500;
    const query = req.query.query || "pub";
    const limit = parseInt(req.query.limit) || 10;

    const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lng}&radius=${radius}&query=${encodeURIComponent(query)}&limit=${limit}`;

    const response = await axios.get(url, {
      headers: { Authorization: token }
    });

    const venues = (response.data.results || []).map(v => ({
      id: `fsq_${v.fsq_id}`,
      name: v.name,
      category: v.categories?.[0]?.name || null,
      lat: v.geocodes?.main?.latitude || null,
      lng: v.geocodes?.main?.longitude || null,
      address: v.location?.formatted_address || null,
      distance_m: v.distance || null,
      rating: v.rating || null,
      price: v.price || null,
      website: v.website || null
    }));

    res.json({
      status: "ok",
      data: venues
    });
  } catch (error) {
    console.error("Error fetching Foursquare venues:", error.response?.data || error.message);
    res.status(500).json({ status: "error", message: "Failed to fetch venues" });
  }
});

// Start server
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
