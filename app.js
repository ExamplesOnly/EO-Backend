require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const bodyParser = require("body-parser");
const useragent = require("express-useragent");
const db = require("./models");
const helpers = require("./controllers/helper");
require("./config/passport");

const middlewares = require("./middleware");
const { EoMobileuserAgent } = require("./middleware/useragent");
const api = require("./routes");
const graphqlPath = "/graphql";

const app = express();

// setup graphql
const apollo = require("./graphql");
apollo.applyMiddleware({ app, graphqlPath });

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.set("trust proxy", true);
app.use(useragent.express());
app.use(EoMobileuserAgent);
app.use(compression());

// parse application/json
app.use(bodyParser.json());
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

db.sequelize.sync().then(() => {
  console.log(`Database & tables created!`);
});

app.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

app.use(helpers.error);

// module.exports = app;

const port = process.env.PORT || 3000;

var server = app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
