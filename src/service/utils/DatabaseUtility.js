const mariadb = require("mariadb");

const getDbPool = (poolSettings, { testOnCreate = true } = {}) => {
  const pool = mariadb.createPool(poolSettings);
  if (testOnCreate) {
    const testResult = testDb(pool);
    if (!testResult) {
      return null;
    }
  }
  return pool;
};

const testDb = async (pool) => {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.ping();
      console.log("Database connection successful.");
      return true;
    } catch (pingErr) {
      console.error(
        "Error in connected database configuration: ",
        pingErr.message
      );
      return false;
    }
  } catch (connectionErr) {
    console.error(
      "Error establishing database connection: ",
      connectionErr.message
    );
    return false;
  }
};

module.exports.getDbPool = getDbPool;
