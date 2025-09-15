const express = require("express");
const Parser = require("rss-parser");
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

    // Sort by date (newest first)
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

// Start server
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
