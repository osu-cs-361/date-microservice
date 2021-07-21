module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
  }

  if (err.message.startsWith("Invalid unit")) {
    err.statusCode = 400;
  }

  if (err.statusCode) {
    // e.statusCode => dev-defined error, safe to send to user
    res.status(err.statusCode).send(err.message);
  } else {
    // server error, not safe to send to user
    console.error(
      "\x1b[31m%s\x1b[0m", // red
      "ERROR: /interval endpoint failed: ",
      err
    );
    res.sendStatus(500);
  }
};
