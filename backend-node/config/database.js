const mysql = require("mysql2/promise");
const config = require("./env");

const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: config.database.connectionLimit,
  queueLimit: config.database.queueLimit,
  connectTimeout: config.database.connectTimeout,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: "utf8mb4",
  namedPlaceholders: true,
  multipleStatements: false,
});

const checkDatabaseConnection = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
  } finally {
    connection.release();
  }
};

const execute = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);

  return result;
};

const query = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);

  return rows;
};

const withTransaction = async (callback) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();

    return result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      error.rollbackError = rollbackError;
    }

    throw error;
  } finally {
    connection.release();
  }
};

const closeDatabaseConnection = () => pool.end();

module.exports = {
  pool,
  execute,
  query,
  withTransaction,
  checkDatabaseConnection,
  closeDatabaseConnection,
};
