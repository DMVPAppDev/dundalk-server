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

// Events endpoint
app.get("/api/events", async (req, res) => {
  try {
    const token = process.env.EVENTBRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ status: "error", message: "No EVENTBRITE_TOKEN configured" });
    }

    const lat = req.query.lat || 53.9999772; // Dundalk center
    const lng = req.query.lng || -6.4037354;
    const radius = req.query.radius_km || 10;
    const limit = req.query.limit || 10;

    const url = `https://www.eventbriteapi.com/v3/events/search/?location.latitude=${lat}&location.longitude=${lng}&location.within=${radius}km&expand=venue&expand=logo&page_size=${limit}`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const events = response.data.events.map(ev => ({
      id: `eventbrite_${ev.id}`,
      title: ev.name?.text || "Untitled Event",
      description: ev.description?.text || "",
      start_time: ev.start?.utc || null,
      end_time: ev.end?.utc || null,
      venue_name: ev.venue?.name || null,
      venue_lat: ev.venue?.address?.latitude || null,
      venue_lng: ev.venue?.address?.longitude || null,
      venue_address: ev.venue?.address?.localized_address_display || null,
      is_free: ev.is_free || false,
      tickets_url: ev.url || null,
      image_url: ev.logo?.url || null
    }));

    res.json({
      status: "ok",
      data: events
    });
  } catch (error) {
    console.error("Error fetching Eventbrite events:", error.response?.data || error.message);
    res.status(500).json({ status: "error", message: "Failed to fetch Eventbrite events" });
  }
});

// Start server
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
