const express = require("express");
const { Interval } = require("luxon");

const { getStartAndEnd, getStartAndDuration } = require("./utils/QueryParser");
const DateTimeError = require("./utils/DateTimeError");
const ErrorHandler = require("./utils/ErrorHandler");

const APP_PORT = process.argv[2] || 3030;

const app = new express();

app.set("port", APP_PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/healthcheck", (_, res) => {
  res.sendStatus(200);
});

// Returns time interval between "start" and "end" query params
// Interval is in units given by "interval_length" url param
app.get("/interval/:interval_length", (req, res, next) => {
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

app.get("/add/:duration_interval", (req, res, next) => {
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

app.get("/subtract/:duration_interval", (req, res, next) => {
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

app.use(ErrorHandler);

app.listen(app.get("port"), () => {
  console.log(`Date service listening on port ${app.get("port")}`);
});
