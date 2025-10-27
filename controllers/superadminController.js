const { queryRunner } = require("../helper/queryRunner");
const handleNotifications = require("../utils/sendnotification");
const { getTotalPage } = require("../helper/getTotalPage");

exports.getAllUsers = async (req, res) => {
  const { search, page = 1 } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    let baseQuery = ` FROM users `;
    let whereClause = "";
    if (search) {
      whereClause += ` WHERE name LIKE '%${search}%' OR email LIKE '%${search}%' `;
    }
    let getQuery = `SELECT *  ${baseQuery} ${whereClause} ORDER BY created_at DESC  LIMIT ${limit} OFFSET ${offset} `;
    const selectResult = await queryRunner(getQuery);

    if (selectResult[0].length > 0) {
      const countQuery = ` SELECT COUNT(DISTINCT id) AS total ${baseQuery} ${whereClause} `;
      const totalPages = await getTotalPage(countQuery, limit);
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
        totalPages,
      });
    } else {
      res.status(200).json({
        data: [],
        message: "User Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get users",
      error: error.message,
    });
  }
};

exports.getAllFreelancers = async function (req, res) {
  const { search, page = 1 } = req.query;
  const limit = 15;
  const offset = (page - 1) * limit;
  try {
    const baseQuery = ` FROM freelancers f LEFT JOIN users u ON u.id = f.userID `;
    let whereCond = [];
    let whereClause = "";
    if (search) {
      whereCond.push(
        ` (firstName LIKE '%${search}%' OR lastName LIKE '%${search}%' `
      );
    }
    if (whereCond.length > 0) {
      let concat_whereCond = whereCond.join(" AND ");
      whereClause += ` WHERE ${concat_whereCond} `;
    }
    let getQuery = ` SELECT f.*, u.email, u.id AS user_id, 
        (
          SELECT GROUP_CONCAT(fs.skill) 
          FROM freelancer_skills fs  
          WHERE fs.freelancer_id = f.id
        ) AS skills  ${baseQuery} ${whereClause} LIMIT ${limit} offset ${offset}`;

    const selectResult = await queryRunner(getQuery);

    if (selectResult[0].length > 0) {
      const countQuery = ` SELECT COUNT(DISTINCT f.id) AS total ${baseQuery} ${whereClause} `;
      const totalPages = await getTotalPage(countQuery, limit);
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
        totalPages,
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Freelancer Not Found",
      });
    }

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
    const { search, page = 1 } = req.query;
    const limit = 15;
    const offset = (page - 1) * limit;

    const baseQuery = ` FROM gigs `;
    let whereCond = [];
    let whereClause = "";
    if (search) {
      whereCond.push(
        ` (title LIKE '%${search}%' OR description LIKE '%${search}%' OR category LIKE '%${search}%' OR subCategory LIKE '%${search}%') `
      );
    }
    if (whereCond.length > 0) {
      let concat_whereCond = whereCond.join(" AND ");
      whereClause += ` WHERE ${concat_whereCond} `;
    }
    let getProjectQuery = `SELECT * ${baseQuery} ${whereClause} LIMIT ${limit} offset ${offset}`;
    const selectResult = await queryRunner(getProjectQuery);

    if (selectResult[0].length > 0) {
      const countQuery = ` SELECT COUNT(DISTINCT id) AS total ${baseQuery} ${whereClause} `;
      const totalPages = await getTotalPage(countQuery, limit);
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
        totalPages,
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Gigs Not Found",
      });
    }
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

exports.statisticData = async (req, res) => {
  try {
    let query = ` SELECT
    (SELECT COUNT(DISTINCT id) FROM jobs) as total_jobs,
    (SELECT COUNT(DISTINCT id) FROM gigs) as total_gigs,
    (SELECT COUNT(DISTINCT id) FROM projects) as total_projects,
    (SELECT COUNT(DISTINCT id) FROM users) as total_users,
    (SELECT COUNT(DISTINCT id) FROM job_proposals where status = 'selected') as awarded_jobs
    `;
    const selectResult = await queryRunner(query);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Data Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to data",
      error: error.message,
    });
  }
};

exports.closedDispute = async (req, res) => {
  const { id } = req.params;
  const { status, action, closed_reason } = req.body
  try {
    const insertProposalsQuery = `UPDATE dispute SET status = ?, action = ?, closed_reason = ? WHERE id = ?`;
    const values = [status, action, closed_reason, id];
    const insertFileResult = await queryRunner(insertProposalsQuery, values);
    if (insertFileResult[0].affectedRows > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Dispute closed successfully",
      });
    } else {
      return res.status(200).json({
        statusCode: 200,
        message: "Failed to close dispute",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to closed dispute",
      error: error.message,
    });
  }
};
