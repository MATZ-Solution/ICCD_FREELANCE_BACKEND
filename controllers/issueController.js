const { queryRunner } = require("../helper/queryRunner");
const { getTotalPage } = require("../helper/getTotalPage");
const { emailTemplates } = require('../utils/emailTemplates')
const { sendEmail } = require("../helper/emailService");

exports.addIssue = async function (req, res) {
  const { fullName, email, description, issueType, priority, userRole } = req.body;
  try {
    const insertQuery = `INSERT INTO issues(fullName, email, description, issueType, priority, userRole) VALUES (?,?,?,?,?,?) `;
    const queryParams = [fullName, email, description, issueType, priority, userRole];
    const insertFileResult = await queryRunner(insertQuery, queryParams);
    if (insertFileResult[0].affectedRows > 0) {
      const { subject, html } = emailTemplates.issueReported;
      await sendEmail(email, subject, html(fullName));
      return res.status(200).json({
        statusCode: 200,
        message: "Issue Submit Successfully.",
      });
    } else {
      res.status(500).json({
        statusCode: 500,
        message: "Failed To Submit Issue",
      });
    }
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed To Submit Issue",
      message: error.message,
    });
  }
};

exports.getAllIssue = async (req, res) => {
  const { email, page = 1 } = req.query;
  console.log("request query: ", req.query)
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    let baseQuery = `
      FROM issues
    `;
    let whereCond = [];
    let whereClause = "";

    if (email) {
      whereCond.push(` ( email LIKE '%${email}%' ) `);
    }

    if (whereCond.length > 0) {
      let concat_whereCond = whereCond.join(" AND ")
      whereClause += "WHERE" + ` ${concat_whereCond} `;
    }

    let getProjectQuery = `SELECT *
    ${baseQuery} 
    ${whereClause}
     LIMIT ${limit} OFFSET ${offset}
    `;

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
        message: "Issues Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get issues",
      error: error.message,
    });
  }
};
