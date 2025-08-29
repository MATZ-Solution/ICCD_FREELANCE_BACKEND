const { queryRunner } = require("../helper/queryRunner");
const { deleteS3File } = require("../utils/deleteS3Files")

exports.addFreelancerRating = async (req, res) => {
  console.log("body: ", req.body)
    const { orderId, client_id, freelancer_id, rating, review } = req.body;
    try {
        const params = [orderId, client_id, freelancer_id, rating, review]
        const insertQuery = `
        INSERT INTO ratings (orderId, clientId, freelancerId, ratings, review) VALUES (?, ?, ?, ?, ?)
    `;
    console.log("params: ", params)
        const selectResult = await queryRunner(insertQuery, params);

        if (selectResult[0].affectedRows > 0) {
            return res.status(200).json({
                statusCode: 200,
                message: "Ratings added successfully.",
            });
        } else {
            return res.status(500).json({
                statusCode: 500,
                message: "Failed to add ratings",
            });
        }
    } catch (error) {
        console.error("Query error: ", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Failed to add ratings",
            error: error.message,
        });
    }
};

exports.getAllJob = async (req, res) => {
  const { jobTitle, jobType, joblocation } = req.query;
  try {
    const queryParams = [];
    const queryValue = [];
    let getProjectQuery = `SELECT j.*, u.name FROM jobs j LEFT JOIN users u ON u.id = j.clientID `;
    if (jobTitle) {
      queryParams.push(` j.jobTitle LIKE ? `);
      queryValue.push(`%${jobTitle}%`);
    }
    if (jobType) {
      queryParams.push(` j.jobType LIKE ? `);
      queryValue.push(`%${jobType}%`);
    }
    if (joblocation) {
      queryParams.push(` j.joblocation LIKE ? `);
      queryValue.push(`%${joblocation}%`);
    }
    if (queryParams.length > 0) {
      getProjectQuery += "WHERE" + ` ${queryParams.join(" AND ")} `;
    }

    const selectResult = await queryRunner(getProjectQuery, queryValue);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
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