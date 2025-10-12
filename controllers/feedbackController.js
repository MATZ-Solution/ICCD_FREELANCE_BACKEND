const { queryRunner } = require("../helper/queryRunner");
const { getTotalPage } = require("../helper/getTotalPage");

exports.addFeedback = async function (req, res) {
  const { name, email, message } = req.body;
  try {
    const insertQuery = `INSERT INTO feedback(name, email, message) VALUES (?,?,?) `;
    const queryParams = [name, email, message];
    const insertFileResult = await queryRunner(insertQuery, queryParams);
    if (insertFileResult[0].affectedRows > 0) {
        return res.status(200).json({
        statusCode: 200,
        message: "Feedback Submit Successfully.",
      });
    }else{
        res.status(500).json({
          statusCode: 500,
          message: "Failed To Submit Feedback",
        });
    }
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed To Submit Feedback",
      message: error.message,
    });
  }
};

exports.getAllFeedback = async (req, res) => {
  const { email, page = 1 } = req.query;
  console.log("request query: ", req.query)
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    let baseQuery = `
      FROM feedback
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
        message: "Feedback Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get feedback",
      error: error.message,
    });
  }
};
