class DateTimeError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "DateTimeError";
    this.statusCode = statusCode;
  }
}

module.exports = DateTimeError;
