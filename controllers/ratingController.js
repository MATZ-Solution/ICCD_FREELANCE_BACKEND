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

exports.getFreelancerGigRatings = async (req, res) => {
  const { gig_id } = req.params; 
  try {
    const selectQuery = `
      SELECT r.*, g.id AS gigId, u.id AS clientId, u.name AS clientName, u.fileUrl AS clientPic
      FROM ratings r
      JOIN stripeorders os on os.id = r.orderId
      JOIN gigs g ON g.id = os.gig_id
      JOIN users u ON u.id = r.clientId
      WHERE g.id = ?
    `;

    const ratings = await queryRunner(selectQuery, [gig_id]);

    if (ratings[0].length > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Freelancer ratings fetched successfully.",
        data: ratings[0],
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "No ratings found for this freelancer.",
        data: [],
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to fetch ratings",
      error: error.message,
    });
  }
};





exports.getFreelancerAverageRating = async (req, res) => {
  const { freelancer_id } = req.params;

  if (!freelancer_id) {
    return res.status(400).json({
      statusCode: 400,
      message: "freelancerId is required",
    });
  }

  try {
    const avgQuery = `
      SELECT 
        g.freelancer_id,
        AVG(r.ratings) AS averageRating,
        COUNT(r.id) AS totalReviews
      FROM gigs g
      JOIN stripeorders os ON os.gig_id = g.id
      JOIN ratings r ON r.orderId = os.id
      WHERE g.freelancer_id = ?
      GROUP BY g.freelancer_id
    `;

    const [result] = await queryRunner(avgQuery, [freelancer_id]);
    console.log("Query result:", result);

    if (result.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Freelancer average rating fetched successfully.",
        data: {
          freelancerId: result[0].freelancerId,
          averageRating: result[0].averageRating,
          totalReviews: result[0].totalReviews,
        },
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "No ratings found for this freelancer.",
        data: {
          freelancerId,
          averageRating: 0,
          totalReviews: 0,
        },
      });
    }
  } catch (error) {
    console.error("Failed to fetch freelancer average rating:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to fetch freelancer average rating",
      error: error.message,
    });
  }
};
