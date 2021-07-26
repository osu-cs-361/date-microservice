const express = require("express");
const { DateTime, Interval } = require("luxon");

const { getStartAndEnd, getStartAndDuration } = require("./utils/QueryParser");
const { getEvent, getExistingEventAttributes } = require("./utils/BodyParser");
const DateTimeError = require("./utils/DateTimeError");
const ErrorHandler = require("./utils/ErrorHandler");
const db = require("./utils/DatabaseUtility");
const authRoute = require("./utils/RouteAuthenticationMiddleware");

const APP_PORT = process.argv[2] || 3030;
const DB_HOST = process.env.DATE_DB_HOST || "db";

const app = new express();
const pool = db.getDbPool({
  host: DB_HOST,
  user: "root",
  database: "test",
  connectionLimit: 5,
});

app.set("port", APP_PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint: returns 200 if server is OK.
app.get("/healthcheck", (_, res) => {
  res.sendStatus(200);
});

// Returns time interval between "start" and "end" query params
// Interval is in units given by "interval_length" url param
// If no "end" param is passed, calculates time from "start" param until now.
app.get("/datetime/interval/:interval_length", (req, res, next) => {
  try {
    // Check interval length exists and is valid
    if (!req.params.interval_length) {
      throw new DateTimeError("No interval length provided.");
    }

    // Get start and end dates from query
    const { startDate, endDate } = getStartAndEnd(req);

    // Calculate interval and send response
    const interval = Interval.fromDateTimes(startDate, endDate);
    res.status(200).send({
      interval_length: req.params.interval_length,
      interval: interval.length(`${req.params.interval_length}`),
    });
  } catch (e) {
    next(e);
  }
});

// Returns a DateTime equal to the "start" query param plus the given number
// ("amount" query param) of intervals ("duration_interval" URL param).
app.get("/datetime/add/:duration_interval", (req, res, next) => {
  try {
    // Check duration interval exists and is valid
    if (!req.params.duration_interval) {
      throw new DateTimeError("No duration interval provided.");
    }

    // Get startDate and Duration from query parameters
    const { startDate, duration } = getStartAndDuration(req);

    // Calculate new DateTime and send response
    res.status(200).send({ date: startDate.plus(duration).toISO() });
  } catch (e) {
    next(e);
  }
});

// Returns a DateTime equal to the "start" query param minus the given number
// ("amount" query param) of intervals ("duration_interval" URL param).
app.get("/datetime/subtract/:duration_interval", (req, res, next) => {
  try {
    // Check duration interval exists and is valid
    if (!req.params.duration_interval) {
      throw new DateTimeError("No duration interval provided.");
    }

    // Get startDate and Duration from query parameters
    const { startDate, duration } = getStartAndDuration(req);

    // Calculate new DateTime and send response
    res.status(200).send({ date: startDate.minus(duration).toISO() });
  } catch (e) {
    next(e);
  }
});

// PROTECTED ROUTE
// Returns a list of all events associated with the user who owns the authorization token.
app.get("/events", authRoute(pool), async (_, res, next) => {
  try {
    const events = await pool.query(
      "SELECT id, name, start, end FROM Event WHERE user_id=?;",
      [res.locals.userId]
    );
    res.status(200).send(events);
  } catch (e) {
    next(e);
  }
});

// PROTECTED ROUTE
// Saves a new event to the database. Associates the event with the user who owns the authorization token.
// Returns a JSON payload containing the details of the event that was added.
// Requires start and end properties in request's JSON payload.
// Optionally accepts name property in request's JSON payload.
app.post("/new-event", authRoute(pool), async (req, res, next) => {
  try {
    const { name, start, end } = getEvent(req);
    const result = await pool.query(
      "INSERT INTO Event (name, start, end, user_id) VALUES (?, ?, ?, ?);",
      [
        name,
        start.toSQL({ includeOffset: false }),
        end.toSQL({ includeOffset: false }),
        res.locals.userId,
      ]
    );
    res.status(201).send({
      id: result.insertId,
      name,
      start: start.toISO(),
      end: end.toISO(),
    });
  } catch (e) {
    next(e);
  }
});

// PROTECTED ROUTE
// Updates the event with the given id using the provided data. The event must be associated with the user who owns the authorization token.
// Returns a JSON payload containing the details of the updated event.
// Takes any combination of name, start, and/or end properties in request's JSON payload.
app.put("/edit-event/:id", authRoute(pool), async (req, res, next) => {
  try {
    const event = getExistingEventAttributes(req);

    // Build query from existing attributes
    const queryParams = [];
    let query = "UPDATE Event SET ";
    for (attribute in event) {
      query = query + attribute + "=?, ";
      if (event[attribute] instanceof DateTime) {
        queryParams.push(event[attribute].toSQL({ includeOffset: false }));
      } else {
        queryParams.push(event[attribute]);
      }
    }
    query = query.slice(0, query.length - 2) + " WHERE id=? AND user_id=?;";
    queryParams.push(req.params.id, res.locals.userId);
    const result = await pool.query(query, queryParams);
    res
      .status(200)
      .send({ success: Boolean(result.affectedRows), ...req.body });
  } catch (e) {
    next(e);
  }
});

// PROTECTED ROUTE
// Deletes the event with the given id. The event must be associated with the user who owns the authorization token.
app.delete("/delete-event/:id", authRoute(pool), async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM Event WHERE id=? AND user_id=?",
      [req.params.id, res.locals.userId]
    );
    res.status(200).send({ success: Boolean(result.affectedRows) });
  } catch (e) {
    next(e);
  }
});

// Error handler: returns 4xx with error message if user error or 500
app.use(ErrorHandler);

app.listen(app.get("port"), () => {
  console.log(`Date service listening on port ${app.get("port")}`);
});
