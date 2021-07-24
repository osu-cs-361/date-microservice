const { DateTime, Duration } = require("luxon");
const DateTimeError = require("./DateTimeError");

getStartAndEnd = (req, { endOptional = true, enforceOrder = true } = {}) => {
  let endDate = null;
  if (endOptional) {
    endDate = DateTime.fromJSDate(
      req.query.end ? new Date(req.query.end) : new Date(Date.now())
    );
  } else {
    endDate = DateTime.fromJSDate(new Date(req.query.end));
  }
  const startDate = DateTime.fromJSDate(new Date(req.query.start));

  // Check valid DateTimes and Interval
  if (!(startDate.isValid && endDate.isValid)) {
    throw new DateTimeError("Invalid start or end date provided.");
  }
  if (enforceOrder && endDate.valueOf() < startDate.valueOf()) {
    throw new DateTimeError("Start date must be before end date.");
  }

  return { startDate, endDate };
};

getStartAndDuration = (req) => {
  // Get start date and duration from query
  const startDate = DateTime.fromJSDate(new Date(req.query.start));
  const durationObject = {};
  durationObject[req.params.duration_interval] = req.query.amount;
  const duration = Duration.fromObject(durationObject);

  // Check valid DateTime and Duration
  if (!startDate.isValid) {
    throw new DateTimeError("Invalid date format.");
  }
  if (!duration.isValid) {
    throw new DateTimeError(
      "Invalid duration provided. Check amount parameter."
    );
  }
  return { startDate, duration };
};

module.exports.getStartAndEnd = getStartAndEnd;
module.exports.getStartAndDuration = getStartAndDuration;
