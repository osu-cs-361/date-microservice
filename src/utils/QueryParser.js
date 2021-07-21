const { DateTime, Duration } = require("luxon");
const DateTimeError = require("./DateTimeError");


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

module.exports.getStartAndDuration = getStartAndDuration;
