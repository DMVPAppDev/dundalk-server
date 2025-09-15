const express = require("express");
const app = express();

// Root route - simple hello
app.get("/", (req, res) => {
  res.send("Hello Dundalk - your Render server is working!");
});

// Test endpoint - returns JSON
app.get("/api/test", (req, res) => {
  res.json({
    status: "ok",
    data: {
      server: { ok: true }
    }
  });
});

// Use Render’s PORT, or 10000 if not provided
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
