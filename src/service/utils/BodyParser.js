const { DateTime } = require("luxon");
const DateTimeError = require("./DateTimeError");

const getEvent = (req) => {
  const name = req.body.name ? req.body.name : "NULL";
  const start = DateTime.fromJSDate(new Date(req.body.start));
  const end = DateTime.fromJSDate(new Date(req.body.end));
  if (!(start.isValid && end.isValid)) {
    throw new DateTimeError("Invalid start or end date provided.");
  } else if (!(start.valueOf() < end.valueOf())) {
    throw new DateTimeError("Start date must be before end date.");
  }
  return { name, start, end };
};

const getExistingEventAttributes = (req) => {
  const event = {};
  if (req.body.name) {
    event.name = req.body.name;
  }
  if (req.body.start) {
    event.start = DateTime.fromJSDate(new Date(req.body.start));
  }
  if (req.body.end) {
    event.end = DateTime.fromJSDate(new Date(req.body.end));
  }
  if (event.start && !event.start.isValid) {
    throw new DateTimeError("Invalid start date provided.");
  }
  if (event.end && !event.end.isValid) {
    throw new DateTimeError("Invalid end date provided.");
  }
  return event;
};

module.exports.getEvent = getEvent;
module.exports.getExistingEventAttributes = getExistingEventAttributes;
