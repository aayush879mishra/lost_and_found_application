const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const authRoutes = require("./routes/authRoutes.js");
const itemRoutes = require("./routes/itemRoutes.js");
const adminRoutes = require('./routes/adminRoutes.js');

const chatRoutes = require("./routes/chatRoutes.js");
require("dotenv").config();

const app = express();

// Updated CORS to support standard frontend ports (e.g., 3000 for React)
app.use(cors({ 
  origin: ["http://localhost:3000"], 
  credentials: true 
}));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(express.json());

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Define Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;