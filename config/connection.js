const mySql2 = require("mysql2/promise");

let pool;

const createPool = async () => {
  if (pool) return pool;

  pool = await mySql2.createPool({
    // ######## ------- local database connection ########
    // host: "localhost",
    // port: "3306",
    // user: "root",
    // password: "",
    // database: "matzsolu_iccd_freelance_platform",

    // ######## ------- live database connection ########

    connectionLimit: process.env.db_connectionLimit,
    host: process.env.db_host,
    port: process.env.db_port,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_database,
  });

  return pool;
};

const getConnectionFromPool = async () => {
  const pool = await createPool();
  try {
    const connection = await pool.getConnection();
    console.log("Sql Connected");
    return connection;
  } catch (err) {
    console.error("Error getting connection from pool:", err);
    throw err; // rethrow the error to handle it elsewhere if needed
  }
};

module.exports = { createPool, getConnectionFromPool };
