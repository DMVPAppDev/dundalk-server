import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

// --- TEST ROUTE ---
app.get("/api/test", (req, res) => {
  res.json({
    status: "ok",
    message: "Dundalk server is running correctly ✅"
  });
});

// --- STATIC VENUES (fallback) ---
app.get("/api/venues", (req, res) => {
  res.json({
    status: "ok",
    venues: [
      {
        id: "venue_1",
        name: "The Spirit Store",
        category: "Pub & Live Music",
        address: "George's Quay, Dundalk",
        phone: "+353 42 935 2697",
        website: "https://spiritstore.ie",
        coords: { lat: 54.0035, lng: -6.4041 }
      },
      {
        id: "venue_2",
        name: "Russells Saloon",
        category: "Bar",
        address: "Park Street, Dundalk",
        phone: "+353 42 933 4432",
        website: null,
        coords: { lat: 54.0022, lng: -6.4045 }
      },
      {
        id: "venue_3",
        name: "Brubakers",
        category: "Bar & Food",
        address: "Park Street, Dundalk",
        phone: "+353 42 933 3475",
        website: null,
        coords: { lat: 54.0026, lng: -6.4039 }
      }
    ]
  });
});

// --- STATIC EVENTS (fallback) ---
app.get("/api/events", (req, res) => {
  res.json({
    status: "ok",
    events: [
      {
        id: "event_1",
        name: "Trad Session Night",
        venue: "The Spirit Store",
        date: "2025-09-20T20:00:00Z",
        link: "https://spiritstore.ie",
        description: "An evening of traditional Irish music by local artists."
      },
      {
        id: "event_2",
        name: "Comedy Club Dundalk",
        venue: "Brubakers",
        date: "2025-09-25T21:00:00Z",
        link: null,
        description: "Live stand-up comedy with guest performers."
      }
    ]
  });
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
