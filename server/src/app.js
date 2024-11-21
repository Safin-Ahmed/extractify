require("dotenv").config();
require("./utils/openai");
const express = require("express");

const emailRoutes = require("./routes/email");
const { applyMiddleware } = require("./middlewares/");

const app = express();

// Apply all third party middlewares
applyMiddleware(app);

// Routes
app.use(emailRoutes);

// health route
app.get("/health", (req, res) => {
  res.status(200).json({
    health: "OK",
  });
});

module.exports = app;
