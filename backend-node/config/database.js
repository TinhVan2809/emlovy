const mysql = require("mysql2/promise");
const config = require("./env");

// Lazy initialization - pool will be created on first use
let pool = null;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      waitForConnections: true,
      connectionLimit: config.database.connectionLimit,
      queueLimit: config.database.queueLimit,
      connectTimeout: config.database.connectTimeout,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : undefined,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      charset: "utf8mb4",
      namedPlaceholders: true,
      multipleStatements: false,
    });
  }
  return pool;
};

const checkDatabaseConnection = async () => {
  const connection = await getPool().getConnection();

  try {
    await connection.ping();
  } finally {
    connection.release();
  }
};

const execute = async (sql, params = []) => {
  const [result] = await getPool().execute(sql, params);

  return result;
};

const query = async (sql, params = []) => {
  const [rows] = await getPool().query(sql, params);

  return rows;
};

const withTransaction = async (callback) => {
  const connection = await getPool().getConnection();

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

const closeDatabaseConnection = () => {
  if (pool) {
    return pool.end();
  }
  return Promise.resolve();
};

module.exports = {
  get pool() {
    return getPool();
  },
  execute,
  query,
  withTransaction,
  checkDatabaseConnection,
  closeDatabaseConnection,
};
