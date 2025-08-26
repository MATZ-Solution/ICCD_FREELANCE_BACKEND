const { queryRunner } = require("../helper/queryRunner");
const handleNotifications = require("../utils/sendnotification");

exports.getAllUsers = async function (req, res) {
  try {
    const sql = "SELECT * FROM users";
    const [rows] = await queryRunner(sql);

    console.log("Fetched users:", rows); // rows is the actual data

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

exports.addDispute = async function (req, res) {
  const { subject, reason, userId, userType, gigId, client_id, freelancer_id } = req.body;
  console.log("req body: ", req.body)
  try {

    const insertDisputeQuery = `INSERT INTO dispute(subject, reason, userId, userType, gigId) VALUES (?,?,?,?,?) `;
    const queryParams = [subject, reason, userId, userType, gigId];

    const insertResult = await queryRunner(insertDisputeQuery, queryParams);

    if (insertResult[0].affectedRows > 0) {
      if (req.files.length > 0) {
        for (const file of req.files) {
          const insertFileResult = await queryRunner(
            `INSERT INTO disputefiles(fileUrl, fileKey, disputeId) VALUES (?, ?, ?)`,
            [file.location, file.key, gigId]
          );
          if (insertFileResult.affectedRows <= 0) {
            return res.status(500).json({
              statusCode: 500,
              message: "Failed to add files",
            });
          }
        }
      }
      let io = req.app.get("io");
      await handleNotifications(io, {
        sender_id: client_id,
        receiver_id: freelancer_id,
        title: "Dispute",
        message: `${userType} raise a dispute. `,
        type: `${userType}`,
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Dispute created successfully.",
      });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to add dispute",
      });
    }

  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to add dispute",
      message: error.message,
    });
  }
};

exports.getAllDispute = async (req, res) => {
  const { search } = req.query
  try {
    let getProjectQuery = `SELECT * FROM dispute `;
    // if (search) {
    //   getProjectQuery += ` WHERE title LIKE '%${search}%' OR description LIKE '%${search}%' OR category LIKE '%${search}%' OR subCategory LIKE '%${search}%' `;
    // }
    const selectResult = await queryRunner(getProjectQuery);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0]
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Dispute Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get dispute",
      error: error.message,
    });
  }
};

exports.getDisputeById = async (req, res) => {
  const { gigId } = req.params;

  try {
    const getDisputeQueryClient = `
    SELECT d.*, u.id, u.name, u.email, (SELECT GROUP_CONCAT(df.fileUrl) FROM disputefiles df WHERE df.id = d.id) AS files
    FROM dispute d
    JOIN users u ON u.id = d.userId
    WHERE d.gigId = ? AND d.userType = 'client' 
    `;
    const getDisputeQueryFreelancer = `
   SELECT d.*, f.id, f.firstName,f.lastName, f.email, (SELECT GROUP_CONCAT(df.fileUrl) FROM disputefiles df WHERE df.id = d.id) AS files
    FROM dispute d
    JOIN freelancers f ON f.id = d.userId
    WHERE d.gigId = ? AND d.userType = 'freelancer' 
    `;
    const selectResultClient = await queryRunner(getDisputeQueryClient, [gigId]);
    const selectResultFreelancer = await queryRunner(getDisputeQueryFreelancer, [gigId]);


    if (selectResultClient[0].length > 0 || selectResultFreelancer[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        client: selectResultClient[0],
        freelancer: selectResultFreelancer[0],
      });

    } else {
      res.status(200).json({
        data: [],
        message: "Dispute Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get dispute",
      error: error.message,
    });
  }
};
