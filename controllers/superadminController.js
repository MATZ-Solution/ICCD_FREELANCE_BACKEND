const { queryRunner } = require("../helper/queryRunner");
const handleNotifications = require("../utils/sendnotification");
const { getTotalPage } = require("../helper/getTotalPage");

exports.getAllUsers = async function (req, res) {
  try {
    const sql = "SELECT * FROM users";
    const [rows] = await queryRunner(sql);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getAllFreelancers = async function (req, res) {
  try {
    const sql = `
      SELECT 
        f.*, 
        u.email, 
        u.id AS user_id, 
        (
          SELECT GROUP_CONCAT(fs.skill) 
          FROM freelancer_skills fs  
          WHERE fs.freelancer_id = f.id
        ) AS skills 
      FROM freelancers f 
      LEFT JOIN users u ON u.id = f.userID
    `;

    const [rows] = await queryRunner(sql);

    console.log("Fetched freelancers:", rows);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching freelancers:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getAllGigs = async function (req, res) {
  try {
    const sql = "SELECT * FROM gigs"; // assume table name is 'gigs'
    const [rows] = await queryRunner(sql);

    console.log("Fetched gigs:", rows);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching gigs:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getAllProjects = async function (req, res) {
  try {
    const sql = "SELECT * FROM projects";
    const [rows] = await queryRunner(sql);

    console.log("Fetched Projects:", rows);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching Projects:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getAllJob = async (req, res) => {
  const { jobTitle, type, country, city, page = 1 } = req.query;
  console.log("request query: ", req.query);
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    let baseQuery = `
      FROM jobs j LEFT JOIN users u ON u.id = j.clientID 
    `;
    let whereCond = [];
    let whereClause = "";

    if (jobTitle) {
      whereCond.push(` ( j.jobTitle LIKE '%${jobTitle}%' ) `);
    }
    if (type) {
      whereCond.push(` ( j.jobType LIKE '%${type}%' ) `);
    }
    if (country) {
      whereCond.push(` ( j.country LIKE '%${country}%' ) `);
    }
    if (city) {
      whereCond.push(` ( j.city LIKE '%${city}%' ) `);
    }

    if (whereCond.length > 0) {
      let concat_whereCond = whereCond.join(" AND ");
      whereClause += "WHERE" + ` ${concat_whereCond} `;
    }

    let getProjectQuery = `SELECT j.*, u.name
    ${baseQuery} 
    ${whereClause}
     LIMIT ${limit} OFFSET ${offset}
    `;

    const selectResult = await queryRunner(getProjectQuery);
    if (selectResult[0].length > 0) {
      const countQuery = ` SELECT COUNT(DISTINCT j.id) AS total ${baseQuery} ${whereClause} `;
      const totalPages = await getTotalPage(countQuery, limit);
    const activeJobQuery = `
      SELECT 
        (SELECT COUNT(DISTINCT id) FROM jobs WHERE status = 'open') AS active_jobs,
        (SELECT COUNT(DISTINCT id) FROM jobs) AS total_jobs
    `;

      const activeJobResult = await queryRunner(activeJobQuery);

      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
        active_jobs: activeJobResult[0][0].active_jobs,
        total_jobs: activeJobResult[0][0].total_jobs,
        totalPages,
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Jobs Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get jobs",
      error: error.message,
    });
  }
};
