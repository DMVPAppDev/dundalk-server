require express from "express";
require cors from "cors";
require Parser from "rss-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- 1) /api/test (minimal OK) ---
app.get("/api/test", (req, res) => {
  return res.status(200).json({
    status: "ok",
    data: {
      server: { ok: true }
    }
  });
});

// Temporary root so you see something at /
app.get("/", (req, res) => {
  res.type("text/plain").send("Dundalk server is running.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
