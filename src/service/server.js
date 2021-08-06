const express = require("express");

const DateRouter = require("./routes/DateRouter");
const ErrorHandler = require("./utils/ErrorHandler");
const db = require("./utils/DatabaseUtility");

const APP_PORT = process.argv[2] || 3030;
const DB_HOST = process.env.DATE_DB_HOST || "db";
const TARGET_DB = process.env.TARGET_DB || "test";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_USER = process.env.DB_USER || "root";

const app = new express();
const pool = db.getDbPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: TARGET_DB,
  connectionLimit: 5,
});

app.set("port", APP_PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable requests from any source
const noCors = (req, res, next) => {
  res.append("Access-Control-Allow-Origin", "*");
  res.append("Access-Control-Allow-Headers", "*");
  res.append("Access-Control-Allow-Methods", "*");
  next();
};
app.use(noCors);

// API router
app.use("/api/v1", DateRouter(pool));

// Error handler: returns 4xx with error message if user error or 500
app.use(ErrorHandler);

app.listen(app.get("port"), () => {
  console.log(`Date service listening on port ${app.get("port")}`);
});
