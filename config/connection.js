const mySql2 = require("mysql2/promise");

let pool;

const createPool = async () => {
  if (pool) return pool;

  pool = await mySql2.createPool({
    // connectionLimit: 10, // adjust according to your needs
    // host: "153.92.7.247",
    // user:"matzsolu_freelancehr_root",
    // password:"Windows!@#$567",
    // database:"matzsolu_freelancehr"

    // ######## ------- local database connection ########
    // host: "localhost",
    // port:"3306",
    // user:"root",
    //   password:"",
    //   database:"matzsolu_iccd_freelance"

    // ######## ------- live database connection ########

    host: "93.127.192.89",
    port: "3306",
    user: "matzsolu_iccd_freelance_platform",
    password: "$^+)MLZYc5S)uo",
    database: "matzsolu_iccd_freelance_platform",

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

