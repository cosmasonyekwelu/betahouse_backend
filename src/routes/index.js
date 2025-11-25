const express = require("express");
const router = express.Router();

// Import Routes
const authRoutes = require("./auth");
const userRoutes = require("./users");
const propertyRoutes = require("./properties");
const searchRoutes = require("./search"); // 🔥 NEW: search route

// API Status
router.get("/", (req, res) => {
  res.json({ status: "ok", message: "BetaHouse API" });
});

// Main Routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/properties", propertyRoutes);
router.use("/search", searchRoutes); // 🔥 Search endpoint

// Handle unknown routes
router.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = router;
