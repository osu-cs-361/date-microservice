const { DateTime } = require("luxon");

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

module.exports.getEvent = getEvent;
