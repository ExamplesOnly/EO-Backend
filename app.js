const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const db = require("./models");

require("dotenv").config();

const middlewares = require("./middleware");
const api = require("./routes");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

db.sequelize.sync().then(() => {
  console.log(`Database & tables created!`);
});

app.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
