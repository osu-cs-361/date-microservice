const express = require("express");
const { DateTime, Interval } = require("luxon");

const DateTimeError = require("./utils/DateTimeError");

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
app.get("/interval/:interval_length", (req, res) => {
  try {
    // Check interval length exists and is valid
    if (!req.params.interval_length) {
      throw new DateTimeError("No interval length provided.");
    }

    // Get start and end dates from query
    const end_date = DateTime.fromJSDate(
      req.query.end ? new Date(req.query.end) : new Date(Date.now())
    );
    const start_date = DateTime.fromJSDate(new Date(req.query.start));

    // Check valid DateTimes and Interval
    if (!(start_date.isValid && end_date.isValid)) {
      throw new DateTimeError("Invalid date format.");
    }
    if (end_date.valueOf() < start_date.valueOf()) {
      throw new DateTimeError("Start date must be before end date.");
    }

    // Calculate interval and send response
    const interval = Interval.fromDateTimes(start_date, end_date);
    res.status(200).send({
      interval_length: req.params.interval_length,
      interval: interval.length(`${req.params.interval_length}`),
    });
  } catch (e) {
    if (e.statusCode) {
      // e.statusCode => dev-defined error, safe to send to user
      res.status(e.statusCode).send(e.message);
    } else if (e.message.startsWith("Invalid unit")) {
      // Luxon InvalidUnitError, ok to send
      res.status(400).send(e.message);
    } else {
      // server error, not safe to send to user
      console.error(
        "\x1b[31m%s\x1b[0m", // red
        "ERROR: /interval endpoint failed: ",
        e
      );
      res.sendStatus(500);
    }
  }
});

app.listen(app.get("port"), () => {
  console.log(`Date service listening on port ${app.get("port")}`);
});
