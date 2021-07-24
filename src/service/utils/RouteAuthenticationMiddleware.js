class AuthenticationError extends Error {
  constructor(message = "Unauthorized", statusCode = 401) {
    super(message);
    this.name = "AuthenticationError";
    this.statusCode = statusCode;
  }
}

module.exports = (connectionPromise) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");
      if (!authHeader) {
        throw new AuthenticationError();
      } else {
        const token = authHeader.replace("Bearer ", "");
        const connection = await connectionPromise;
        const users = await connection.query(
          "SELECT id, email FROM User WHERE token=?",
          [token]
        );
        if (users.length === 0) {
          throw new AuthenticationError();
        }
        res.locals.userId = users[0].id;
        res.locals.email = users[0].email;
        next();
      }
    } catch (e) {
      next(e);
    }
  };
};
